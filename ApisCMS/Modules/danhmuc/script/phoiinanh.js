/*----------------------------------------------
--PhoiInAnh — công cụ "Xem trước & chỉnh ảnh nền" cho phôi in (18/11/2026)
--Dùng ở: danhmuc/html/quytrinhphoiin.html (Bước 1 quy trình Phôi mới). Không phụ thuộc trang: mount vào phần tử bất kỳ.
--Làm gì: chọn ảnh (từ máy / ảnh nền của mẫu đang chọn) -> xoay 90°, chỉnh nghiêng, cắt mép, khớp vào khổ giấy
--        -> xem trước trên lưới 10 mm -> xuất JPG đúng số px theo 96 DPI (A4 ngang 1123 x 794) và ghi 96 DPI vào JFIF.
--Vì sao ghi DPI: màn Mẫu phôi in lấy kích thước qua Handler/getDimensions.ashx. Suy từ dữ liệu thật: ảnh ghi 300 DPI
--        (mẫu KYSU1) ra 1122 x 793,7 = px đã quy về 96 DPI; ảnh không ghi DPI (mẫu test) ra nguyên 3508 x 2480.
--        Ảnh xuất ở đây = đúng px + 96 DPI nên đọc kiểu nào cũng ra cùng số.
--Không tải lên máy chủ: tải file về rồi chọn ở nút Thêm mẫu (màn Mẫu phôi in) — bộ upload ảnh nằm ở máy chủ upload
--        (UploadAvatar), không gọi lại được từ đây.
--Mọi xử lý ảnh chạy trên trình duyệt (canvas), ảnh không rời máy người dùng.
----------------------------------------------*/
(function (root) {
    "use strict";
    var $ = root.jQuery;
    var DPI = 96, PX_PER_MM = DPI / 25.4;
    var KHO = [
        { ten: "A4", w: 210, h: 297 },
        { ten: "A3", w: 297, h: 420 },
        { ten: "A5", w: 148, h: 210 },
        { ten: "B5", w: 176, h: 250 },
        { ten: "Letter", w: 216, h: 279 }
    ];
    var KHOP = [
        { ma: "keo", ten: "Kéo vừa khổ", moTa: "Giãn ảnh cho kín khổ (dùng khi tỉ lệ đã khớp)" },
        { ma: "vien", ten: "Giữ tỉ lệ · viền trắng", moTa: "Không méo, thừa thì để trắng" },
        { ma: "cat", ten: "Giữ tỉ lệ · cắt bớt", moTa: "Không méo, phủ kín khổ, cắt phần thừa" }
    ];

    var nguon = null;           // { img, ten, w, h, bytes, loai: "may"|"mau", tainted }
    var tham = null;            // tham số chỉnh
    var nho = { q: 85, luoi: true, xem: "ketqua" };   // giữ qua các lần đổi ảnh
    var ketQuaTai = null;       // thông tin lần tải gần nhất (vẽ lại khi mount lại)
    var cvOut = null, ui = null, opts = {}, raf = 0, tMaHoa = 0, phienBan = 0, kbUocTinh = 0, dangMo = false;

    /*------------------------------------------
    --[0] Tiện ích
    -------------------------------------------*/
    function esc(v) {
        return String(v === null || v === undefined ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function fmt(n, d) {
        if (isNaN(n)) return "";
        var s = Number(n).toFixed(d === undefined ? 1 : d);
        if (s.indexOf(".") !== -1) s = s.replace(/0+$/, "").replace(/\.$/, "");
        var p = s.split(".");
        p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return p.join(",");
    }
    function fmtBytes(b) {
        if (!b) return "";
        if (b >= 1048576) return fmt(b / 1048576, 1) + " MB";
        return fmt(b / 1024, 0) + " KB";
    }
    function timKho(ten) { for (var i = 0; i < KHO.length; i++) if (KHO[i].ten === ten) return KHO[i]; return KHO[0]; }
    // Tên file: bỏ dấu, viết hoa chữ đầu mỗi từ, chỉ giữ chữ số và "-" (KHÔNG dấu cách / gạch dưới — tên ảnh nền được tách theo "_")
    function tenSach(s, duPhong) {
        var t = String(s || "").replace(/\.[a-z0-9]{2,5}$/i, "");
        try { t = t.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) { }
        t = t.replace(/đ/g, "d").replace(/Đ/g, "D");
        t = t.split(/[\s_.]+/).map(function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : ""; }).join("");
        t = t.replace(/[^A-Za-z0-9-]/g, "").substring(0, 60);
        return (t || duPhong || "PhoiIn") + ".jpg";
    }
    // Đoán khổ giấy từ số px: khớp ở 96 DPI, hoặc ảnh scan 150/200/300/400/600 DPI (sai số 4 mm)
    function doanKho(w, h) {
        var dpis = [96, 150, 200, 300, 400, 600], i, j, k, wmm, hmm;
        for (i = 0; i < dpis.length; i++) {
            wmm = w / dpis[i] * 25.4; hmm = h / dpis[i] * 25.4;
            for (j = 0; j < KHO.length; j++) {
                k = KHO[j];
                if ((Math.abs(wmm - k.w) <= 4 && Math.abs(hmm - k.h) <= 4) || (Math.abs(wmm - k.h) <= 4 && Math.abs(hmm - k.w) <= 4)) {
                    return { ten: k.ten, dpi: dpis[i] };
                }
            }
        }
        return null;
    }

    /*------------------------------------------
    --[1] JPG + 96 DPI (JFIF APP0: units = 1 dots/inch, Xdensity = Ydensity = 96)
    -------------------------------------------*/
    function docBuf(blob) {
        if (blob.arrayBuffer) return blob.arrayBuffer();
        return new Promise(function (resolve, reject) {
            var fr = new FileReader();
            fr.onload = function () { resolve(fr.result); };
            fr.onerror = reject;
            fr.readAsArrayBuffer(blob);
        });
    }
    function laJfif(u) {
        return u.length > 18 && u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF && u[3] === 0xE0
            && u[6] === 0x4A && u[7] === 0x46 && u[8] === 0x49 && u[9] === 0x46 && u[10] === 0;
    }
    function datDpi(blob, dpi) {
        dpi = dpi || DPI;
        return docBuf(blob).then(function (buf) {
            var u = new Uint8Array(buf), hi = (dpi >> 8) & 255, lo = dpi & 255;
            if (laJfif(u)) {
                u[13] = 1; u[14] = hi; u[15] = lo; u[16] = hi; u[17] = lo;
                return new Blob([u], { type: "image/jpeg" });
            }
            var app0 = new Uint8Array([0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, hi, lo, hi, lo, 0x00, 0x00]);
            return new Blob([u.subarray(0, 2), app0, u.subarray(2)], { type: "image/jpeg" });
        });
    }
    // Đọc lại DPI trong JFIF (để kiểm thử / hiển thị): { units, x, y } hoặc null
    function docDpi(blob) {
        return docBuf(blob).then(function (buf) {
            var u = new Uint8Array(buf);
            if (!laJfif(u)) return null;
            return { units: u[13], x: (u[14] << 8) | u[15], y: (u[16] << 8) | u[17] };
        });
    }

    /*------------------------------------------
    --[2] Hình học: khổ đích, vùng cắt, vẽ
    -------------------------------------------*/
    function dich() {
        var k = timKho(tham.kho), ngang = tham.huong === "ngang";
        var wmm = ngang ? k.h : k.w, hmm = ngang ? k.w : k.h;
        return { W: Math.round(wmm * PX_PER_MM), H: Math.round(hmm * PX_PER_MM), wmm: wmm, hmm: hmm, kho: k.ten };
    }
    // Vùng giữ lại, tính trong hệ ảnh ĐÃ xoay 90° (rw x rh)
    function vung() {
        var xoayDoc = tham.xoay % 180 !== 0;
        var rw = xoayDoc ? nguon.h : nguon.w, rh = xoayDoc ? nguon.w : nguon.h, c = tham.cat;
        var x0 = rw * c.l / 100, x1 = rw * (1 - c.r / 100), y0 = rh * c.t / 100, y1 = rh * (1 - c.b / 100);
        return { rw: rw, rh: rh, x0: x0, y0: y0, cw: Math.max(1, x1 - x0), ch: Math.max(1, y1 - y0), ccx: (x0 + x1) / 2, ccy: (y0 + y1) / 2 };
    }
    function heSo(d, v) {
        if (tham.khop === "keo") return { sx: d.W / v.cw, sy: d.H / v.ch };
        var s = tham.khop === "vien" ? Math.min(d.W / v.cw, d.H / v.ch) : Math.max(d.W / v.cw, d.H / v.ch);
        return { sx: s, sy: s };
    }
    function veKetQua(d, v, k) {
        if (!cvOut) cvOut = document.createElement("canvas");
        cvOut.width = d.W; cvOut.height = d.H;
        var c = cvOut.getContext("2d");
        c.fillStyle = "#fff";
        c.fillRect(0, 0, d.W, d.H);
        c.save();
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = "high";
        c.translate(d.W / 2, d.H / 2);
        c.scale(k.sx, k.sy);
        c.beginPath();
        c.rect(-v.cw / 2, -v.ch / 2, v.cw, v.ch);     // khung giữ lại luôn thẳng; ảnh xoay nghiêng bên trong
        c.clip();
        c.rotate(tham.nghieng * Math.PI / 180);
        c.translate(-(v.ccx - v.rw / 2), -(v.ccy - v.rh / 2));
        c.rotate(tham.xoay * Math.PI / 180);
        c.drawImage(nguon.img, -nguon.w / 2, -nguon.h / 2);
        c.restore();
    }
    function veLuoi(c, W, H) {
        var step = 10 * PX_PER_MM, i, x, y, n;
        c.save();
        c.lineWidth = 1;
        for (i = 1, n = Math.floor(W / step); i <= n; i++) {
            x = Math.round(i * step) + 0.5;
            c.strokeStyle = i % 5 === 0 ? "rgba(37,99,235,.55)" : "rgba(37,99,235,.2)";
            c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
        }
        for (i = 1, n = Math.floor(H / step); i <= n; i++) {
            y = Math.round(i * step) + 0.5;
            c.strokeStyle = i % 5 === 0 ? "rgba(37,99,235,.55)" : "rgba(37,99,235,.2)";
            c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
        }
        c.fillStyle = "rgba(29,78,216,.9)";
        c.font = "600 11px Arial";
        for (i = 5, n = Math.floor(W / step); i <= n; i += 5) c.fillText(String(i * 10), Math.round(i * step) + 3, 12);
        for (i = 5, n = Math.floor(H / step); i <= n; i += 5) c.fillText(String(i * 10), 3, Math.round(i * step) - 3);
        c.strokeStyle = "rgba(220,38,38,.8)";
        c.strokeRect(0.5, 0.5, W - 1, H - 1);
        c.restore();
    }
    function veXem(d, v) {
        var cv = ui && ui.find(".pia-stage canvas")[0];
        if (!cv) return;
        var c = cv.getContext("2d");
        if (nho.xem === "goc") {
            var g = Math.min(1, 1400 / Math.max(v.rw, v.rh));
            cv.width = Math.max(1, Math.round(v.rw * g));
            cv.height = Math.max(1, Math.round(v.rh * g));
            c.save();
            c.imageSmoothingEnabled = true;
            c.imageSmoothingQuality = "high";
            c.scale(g, g);
            c.translate(v.rw / 2, v.rh / 2);
            c.rotate(tham.xoay * Math.PI / 180);
            c.drawImage(nguon.img, -nguon.w / 2, -nguon.h / 2);
            c.restore();
            var x0 = v.x0 * g, y0 = v.y0 * g, cw = v.cw * g, ch = v.ch * g, W = cv.width, H = cv.height;
            c.fillStyle = "rgba(15,23,42,.55)";
            c.fillRect(0, 0, W, y0);
            c.fillRect(0, y0 + ch, W, H - y0 - ch);
            c.fillRect(0, y0, x0, ch);
            c.fillRect(x0 + cw, y0, W - x0 - cw, ch);
            c.strokeStyle = "#f59e0b";
            c.lineWidth = 2;
            c.setLineDash([8, 5]);
            c.strokeRect(x0 + 1, y0 + 1, Math.max(0, cw - 2), Math.max(0, ch - 2));
            c.setLineDash([]);
            return;
        }
        cv.width = d.W;
        cv.height = d.H;
        c.drawImage(cvOut, 0, 0);
        if (nho.luoi) veLuoi(c, d.W, d.H);
    }
    // Gom nhiều lần kéo thanh trượt thành 1 lần vẽ (~60 hình/giây). Dùng setTimeout thay requestAnimationFrame
    // để vẫn vẽ khi tab không hiển thị khung hình (trình duyệt không render).
    function henVe() {
        if (raf) return;
        raf = setTimeout(function () { raf = 0; ve(); }, 16);
    }
    function ve() {
        if (!nguon || !ui) return;
        var d = dich(), v = vung(), k = heSo(d, v);
        veKetQua(d, v, k);
        veXem(d, v);
        phienBan++;
        kbUocTinh = 0;
        capNhatThongTin(d, v, k);
        henMaHoa();
    }

    /*------------------------------------------
    --[3] Xuất ảnh
    -------------------------------------------*/
    function maHoa() {
        return new Promise(function (resolve) {
            if (!cvOut || !nguon) { resolve({ ok: false, message: "Chưa có ảnh." }); return; }
            try {
                cvOut.toBlob(function (b) {
                    if (!b) { resolve({ ok: false, message: "Trình duyệt không xuất được ảnh." }); return; }
                    datDpi(b, DPI).then(function (b2) { resolve({ ok: true, blob: b2 }); }, function () { resolve({ ok: true, blob: b }); });
                }, "image/jpeg", nho.q / 100);
            } catch (ex) {
                resolve({ ok: false, tainted: true, message: "Ảnh lấy từ máy chủ ảnh khác nên trình duyệt không cho xuất. Tải ảnh gốc về máy rồi bấm «Chọn ảnh từ máy»." });
            }
        });
    }
    function henMaHoa() {
        clearTimeout(tMaHoa);
        if (nguon && nguon.tainted) return;
        var pb = phienBan;
        tMaHoa = setTimeout(function () {
            maHoa().then(function (r) {
                if (pb !== phienBan || !r.ok) return;
                kbUocTinh = r.blob.size;
                if (ui) ui.find("[data-pia-out='kb']").text("~" + fmtBytes(kbUocTinh));
            });
        }, 350);
    }
    function taiVe() {
        if (!nguon) return;
        var d = dich(), v = vung(), ten = tenSach(tham.ten);
        maHoa().then(function (r) {
            if (!r.ok) { baoLoi(r.message); return; }
            var url = URL.createObjectURL(r.blob), a = document.createElement("a");
            a.href = url;
            a.download = ten;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            setTimeout(function () { URL.revokeObjectURL(url); a.parentNode && a.parentNode.removeChild(a); }, 2000);
            ketQuaTai = {
                ten: ten, w: d.W, h: d.H, wmm: d.wmm, hmm: d.hmm, kho: d.kho, huong: tham.huong, dpi: DPI, kb: Math.round(r.blob.size / 1024),
                nguon: { ten: nguon.ten, w: nguon.w, h: nguon.h, loai: nguon.loai },
                chinh: { xoay: tham.xoay, nghieng: tham.nghieng, catPhanTram: { tren: tham.cat.t, duoi: tham.cat.b, trai: tham.cat.l, phai: tham.cat.r }, khop: tham.khop, chatLuong: nho.q },
                luc: Date.now()
            };
            veTiepTheo();
            if (typeof opts.onTai === "function") { try { opts.onTai(ketQuaTai); } catch (e) { } }
        });
    }

    /*------------------------------------------
    --[4] Nạp ảnh
    -------------------------------------------*/
    function thamMoi(w, h, ten) {
        var g = doanKho(w, h);
        var t = {
            kho: g ? g.ten : "A4", huong: w >= h ? "ngang" : "doc", khop: "keo",
            xoay: 0, nghieng: 0, cat: { t: 0, b: 0, l: 0, r: 0 }, ten: tenSach(ten, opts.tenMacDinh)
        };
        // tỉ lệ ảnh lệch khổ > 2% thì mặc định giữ tỉ lệ (không méo)
        var k = timKho(t.kho), r = Math.max(w, h) / Math.min(w, h), rk = k.h / k.w;
        if (Math.abs(r / rk - 1) > 0.02) t.khop = "vien";
        return t;
    }
    function napAnh(url, ten, bytes, loai, cors, xong, loi) {
        var img = new Image();
        if (cors) img.crossOrigin = "anonymous";
        dangMo = true;
        if (ui) ui.find("[data-pia-out='loi']").html("").hide();
        if (ui) ui.find(".pia-drop, .pia-stage").addClass("is-loading");
        img.onload = function () {
            dangMo = false;
            nguon = { img: img, ten: ten || "anh", w: img.naturalWidth, h: img.naturalHeight, bytes: bytes || 0, loai: loai, tainted: false };
            tham = thamMoi(nguon.w, nguon.h, ten);
            ketQuaTai = null;
            veKhung();
            if (typeof xong === "function") xong();
        };
        img.onerror = function () {
            dangMo = false;
            if (typeof loi === "function") { loi(); return; }
            if (ui) ui.find(".pia-drop, .pia-stage").removeClass("is-loading");
            baoLoi("Không mở được ảnh" + (ten ? " «" + esc(ten) + "»" : "") + ". Kiểm tra lại file (JPG / PNG).");
        };
        img.src = url;
    }
    function napFile(file) {
        if (!file) return;
        if (file.type && !/^image\//.test(file.type)) { baoLoi("Chỉ nhận file ảnh (JPG / PNG)."); return; }
        var url = URL.createObjectURL(file);
        napAnh(url, file.name, file.size, "may", false, function () { /* giữ objectURL cho tới khi đổi ảnh: img vẫn dùng */ });
    }
    // Ảnh nền của mẫu trên máy chủ ảnh: thử CORS trước (để còn xuất được), không được thì chỉ xem
    function napUrl(url, ten) {
        if (!url) return;
        napAnh(url, ten, 0, "mau", true, null, function () {
            napAnh(url, ten, 0, "mau", false, function () {
                nguon.tainted = true;
                veKhung();
            });
        });
    }

    /*------------------------------------------
    --[5] Giao diện
    -------------------------------------------*/
    function napCss() {
        if (document.getElementById("pia-style")) return;
        var css = [
            ".pia{border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:12px;color:#0f172a;font-size:13px}",
            ".pia *{box-sizing:border-box}",
            ".pia-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}",
            ".pia-title{font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
            ".pia-title>i{color:#2563eb}",
            ".pia-sub{font-weight:500;font-size:12px;color:#64748b}",
            ".pia-src{display:flex;gap:8px;flex-wrap:wrap}",
            ".pia .pia-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:8px;padding:7px 12px;font-size:12.5px;font-weight:600;cursor:pointer;line-height:1.3;margin:0;height:auto;white-space:nowrap}",
            ".pia .pia-btn:hover{border-color:#94a3b8;background:#f8fafc}",
            ".pia .pia-btn:disabled{opacity:.55;cursor:not-allowed}",
            ".pia .pia-btn-primary{background:#2563eb;border-color:#2563eb;color:#fff}",
            ".pia .pia-btn-primary:hover{background:#1d4ed8;border-color:#1d4ed8;color:#fff}",
            ".pia .pia-btn-ghost{border-color:transparent;background:transparent;color:#475569}",
            ".pia .pia-btn-sm{padding:5px 10px}",
            ".pia-drop{border:2px dashed #cbd5e1;border-radius:10px;background:#f8fafc;padding:28px 16px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;color:#475569}",
            ".pia-drop>i{font-size:28px;color:#94a3b8}",
            ".pia-drop>b{color:#0f172a;font-size:14px}",
            ".pia-drop.is-over,.pia-stage.is-over{border-color:#2563eb;background:#eff6ff}",
            ".pia-drop.is-loading,.pia-stage.is-loading{opacity:.6}",
            ".pia-body{display:grid;grid-template-columns:300px minmax(0,1fr);gap:16px;align-items:start}",
            ".pia-ctrl{display:flex;flex-direction:column;gap:12px}",
            ".pia-srcinfo{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:12.5px;color:#334155;word-break:break-word}",
            ".pia-srcinfo b{color:#0f172a}",
            ".pia-row{display:flex;flex-direction:column;gap:6px}",
            ".pia-lbl{font-size:12.5px;font-weight:700;color:#334155;display:flex;justify-content:space-between;gap:8px}",
            ".pia-lbl b{color:#1d4ed8;font-variant-numeric:tabular-nums}",
            ".pia small{font-size:11.5px;color:#64748b;line-height:1.4}",
            ".pia-inline{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
            ".pia .pia-select,.pia .pia-input{border:1px solid #cbd5e1;border-radius:8px;padding:6px 9px;font-size:13px;font-weight:600;color:#0f172a;background:#fff;height:auto;min-height:32px;margin:0}",
            ".pia .pia-input{width:100%}",
            ".pia .pia-select:focus,.pia .pia-input:focus{outline:0;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.15)}",
            ".pia-seg{display:inline-flex;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;background:#fff}",
            ".pia-seg button{border:0;background:transparent;padding:6px 11px;font-size:12.5px;font-weight:600;color:#475569;cursor:pointer;margin:0}",
            ".pia-seg button+button{border-left:1px solid #e2e8f0}",
            ".pia-seg button.on{background:#eff6ff;color:#1d4ed8}",
            ".pia-seg-col{display:flex;flex-direction:column}",
            ".pia-seg-col button{text-align:left;padding:7px 10px}",
            ".pia-seg-col button+button{border-left:0;border-top:1px solid #e2e8f0}",
            ".pia-seg-col button small{display:block;font-weight:500}",
            ".pia input[type=range]{width:100%;margin:0;accent-color:#2563eb}",
            ".pia-cat{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px}",
            ".pia-cat label{display:flex;flex-direction:column;gap:2px;margin:0;font-weight:500;font-size:12px;color:#475569}",
            ".pia-cat label b{color:#1d4ed8;font-variant-numeric:tabular-nums}",
            ".pia-actions{display:flex;gap:8px;flex-wrap:wrap;padding-top:2px}",
            ".pia-view{display:flex;flex-direction:column;gap:8px;min-width:0}",
            ".pia-viewbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}",
            ".pia .pia-chk{display:inline-flex;align-items:center;gap:6px;margin:0;font-weight:600;font-size:12.5px;color:#334155;cursor:pointer}",
            ".pia-stage{background:#e2e8f0;border:1px solid #cbd5e1;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:center;min-height:240px;overflow:hidden}",
            ".pia-stage canvas{display:block;max-width:100%;max-height:560px;width:auto;height:auto;background:#fff;box-shadow:0 1px 6px rgba(15,23,42,.25)}",
            ".pia-result{font-size:12.5px;color:#0f172a;display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap}",
            ".pia-result .ok{color:#16a34a}",
            ".pia-msg{font-size:12.5px;border-radius:8px;padding:7px 10px;line-height:1.45}",
            ".pia-msg.warn{background:#fffbeb;border:1px solid #fde68a;color:#78350f}",
            ".pia-msg.err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}",
            ".pia-msg.info{background:#f0f9ff;border:1px solid #bae6fd;color:#075985}",
            ".pia-next{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;border-radius:8px;padding:9px 12px;font-size:12.5px;line-height:1.5}",
            "@media (max-width:991px){.pia-body{grid-template-columns:minmax(0,1fr)}.pia-view{order:-1}.pia-stage canvas{max-height:420px}}"
        ].join("\n");
        var s = document.createElement("style");
        s.id = "pia-style";
        s.appendChild(document.createTextNode(css));
        (document.head || document.body).appendChild(s);
    }
    function htmlNguonBtn() {
        var h = '<label class="pia-btn pia-btn-primary"><input type="file" accept="image/*" data-pia-file style="display:none" /><i class="fa fa-folder-open"></i> Chọn ảnh từ máy</label>';
        if (opts.mau && opts.mau.DUONGDANFILE && typeof opts.urlAnh === "function") {
            h += '<button type="button" class="pia-btn" data-pia="mau" title="' + esc(opts.mau.DUONGDANFILE) + '"><i class="fa fa-cloud-download"></i> Ảnh nền của mẫu «' + esc(opts.mau.MAPHOI || "đang chọn") + "»</button>";
        }
        return h;
    }
    function htmlKhung() {
        var h = '<div class="pia">';
        h += '<div class="pia-top"><div class="pia-title"><i class="fa fa-picture-o"></i> Xem trước & chỉnh ảnh nền <span class="pia-sub">ảnh xử lý ngay trên máy bạn, không gửi lên máy chủ</span></div>';
        h += '<div class="pia-src">' + htmlNguonBtn() + "</div></div>";
        h += '<div class="pia-msg err" data-pia-out="loi" style="display:none"></div>';
        if (!nguon) {
            h += '<div class="pia-drop' + (dangMo ? " is-loading" : "") + '"><i class="fa fa-image"></i><b>Kéo thả ảnh scan phôi vào đây</b>'
                + "<span>hoặc bấm «Chọn ảnh từ máy». Ảnh scan 300 DPI cũng được — công cụ tự thu về đúng số px của khổ giấy.</span></div>";
            h += "</div>";
            return h;
        }
        var g = doanKho(nguon.w, nguon.h);
        h += '<div class="pia-body"><div class="pia-ctrl">';
        h += '<div class="pia-srcinfo"><i class="fa fa-file-image-o"></i> <b>' + esc(nguon.ten) + "</b><br>" + fmt(nguon.w, 0) + " × " + fmt(nguon.h, 0) + " px"
            + (nguon.bytes ? " · " + fmtBytes(nguon.bytes) : "")
            + (g ? " · " + (g.dpi === 96 ? "đã đúng " + g.ten + " ở 96 DPI" : "có vẻ scan " + g.dpi + " DPI → " + g.ten) : "") + "</div>";
        // Khổ + hướng
        h += '<div class="pia-row"><span class="pia-lbl">Khổ giấy</span><div class="pia-inline"><select class="pia-select" data-pia-v="kho">'
            + KHO.map(function (k) { return '<option value="' + k.ten + '"' + (k.ten === tham.kho ? " selected" : "") + ">" + k.ten + " (" + k.w + " × " + k.h + " mm)</option>"; }).join("")
            + '</select><div class="pia-seg"><button type="button" data-pia-huong="ngang"' + (tham.huong === "ngang" ? ' class="on"' : "") + '>Ngang</button><button type="button" data-pia-huong="doc"' + (tham.huong === "doc" ? ' class="on"' : "") + ">Dọc</button></div></div></div>";
        // Khớp
        h += '<div class="pia-row"><span class="pia-lbl">Khớp ảnh vào khổ</span><div class="pia-seg pia-seg-col">'
            + KHOP.map(function (k) { return '<button type="button" data-pia-khop="' + k.ma + '"' + (k.ma === tham.khop ? ' class="on"' : "") + ">" + k.ten + "<small>" + k.moTa + "</small></button>"; }).join("")
            + "</div></div>";
        // Xoay + nghiêng
        h += '<div class="pia-row"><span class="pia-lbl">Xoay</span><div class="pia-inline">'
            + '<button type="button" class="pia-btn pia-btn-sm" data-pia="xoayTrai"><i class="fa fa-rotate-left"></i> 90°</button>'
            + '<button type="button" class="pia-btn pia-btn-sm" data-pia="xoayPhai"><i class="fa fa-rotate-right"></i> 90°</button>'
            + '<span class="pia-sub" data-pia-out="xoay">' + (tham.xoay ? "đang xoay " + tham.xoay + "°" : "") + "</span></div></div>";
        h += '<div class="pia-row"><span class="pia-lbl">Chỉnh nghiêng <b data-pia-out="nghieng">' + fmt(tham.nghieng, 1) + '°</b></span>'
            + '<input type="range" min="-5" max="5" step="0.1" value="' + tham.nghieng + '" data-pia-v="nghieng" />'
            + "<small>Kéo sang phải = xoay theo chiều kim đồng hồ. Bật lưới, kéo tới khi khung viền phôi song song đường lưới; xong nên cắt mép một chút để không lộ góc trắng.</small></div>";
        // Cắt mép
        var nhan = { t: "Trên", b: "Dưới", l: "Trái", r: "Phải" };
        h += '<div class="pia-row"><span class="pia-lbl">Cắt mép (% ảnh)</span><div class="pia-cat">';
        ["t", "b", "l", "r"].forEach(function (k) {
            h += '<label><span>' + nhan[k] + ' <b data-pia-out="cat.' + k + '">' + fmt(tham.cat[k], 1) + '%</b></span><input type="range" min="0" max="25" step="0.1" value="' + tham.cat[k] + '" data-pia-v="cat.' + k + '" /></label>';
        });
        h += "</div><small>Cắt viền đen / viền máy scan cho ảnh sát mép giấy — xem ở chế độ «Ảnh gốc + vùng cắt».</small></div>";
        // Chất lượng + tên
        h += '<div class="pia-row"><span class="pia-lbl">Chất lượng JPG <b data-pia-out="q">' + nho.q + "</b></span>"
            + '<input type="range" min="60" max="95" step="1" value="' + nho.q + '" data-pia-v="q" /><small>85 là vừa: nét, thường dưới 1 MB.</small></div>';
        h += '<div class="pia-row"><span class="pia-lbl">Tên file tải về</span><input class="pia-input" data-pia-v="ten" value="' + esc(tham.ten) + '" />'
            + "<small>Viết liền không dấu, không dấu cách / gạch dưới.</small></div>";
        h += '<div class="pia-actions"><button type="button" class="pia-btn pia-btn-primary" data-pia="tai"' + (nguon.tainted ? " disabled" : "") + '><i class="fa fa-download"></i> Tải ảnh chuẩn về</button>'
            + '<button type="button" class="pia-btn pia-btn-ghost" data-pia="datLai"><i class="fa fa-undo"></i> Đặt lại</button></div>';
        h += "</div>";
        // Xem trước
        h += '<div class="pia-view"><div class="pia-viewbar"><div class="pia-seg"><button type="button" data-pia-xem="ketqua"' + (nho.xem === "ketqua" ? ' class="on"' : "") + '>Kết quả</button>'
            + '<button type="button" data-pia-xem="goc"' + (nho.xem === "goc" ? ' class="on"' : "") + ">Ảnh gốc + vùng cắt</button></div>"
            + '<label class="pia-chk"><input type="checkbox" data-pia-luoi' + (nho.luoi ? " checked" : "") + " /> Lưới 10 mm</label></div>";
        h += '<div class="pia-stage"><canvas></canvas></div>';
        h += '<div class="pia-result" data-pia-out="ketqua"></div>';
        h += '<div class="pia-msg" data-pia-out="canhbao" style="display:none"></div>';
        h += "</div></div>";
        h += '<div class="pia-next" data-pia-out="next" style="display:none"></div>';
        h += "</div>";
        return h;
    }
    function veKhung() {
        if (!ui) return;
        ui.html(htmlKhung());
        if (nguon) {
            ve();
            if (nguon.tainted) baoLoi("Ảnh nền của mẫu nằm ở máy chủ ảnh khác nên chỉ xem được, không xuất được. Tải ảnh gốc về máy rồi bấm «Chọn ảnh từ máy».");
        }
        veTiepTheo();
    }
    function capNhatThongTin(d, v, k) {
        if (!ui) return;
        var phanTram = Math.round(Math.min(k.sx, k.sy) * 100);
        var h = '<i class="fa fa-check-circle ok"></i><span><b>' + d.W + " × " + d.H + " px</b> = " + fmt(d.wmm, 0) + " × " + fmt(d.hmm, 0) + " mm · <b>" + d.kho + " " + tham.huong
            + "</b> · 96 DPI · <span data-pia-out='kb'>" + (kbUocTinh ? "~" + fmtBytes(kbUocTinh) : "đang tính dung lượng…") + "</span>"
            + "<br><span class='pia-sub'>Ảnh gốc " + fmt(nguon.w, 0) + " × " + fmt(nguon.h, 0) + " px → " + (phanTram < 100 ? "thu còn " + phanTram + "%" : phanTram > 100 ? "phóng " + phanTram + "%" : "giữ nguyên") + ".</span></span>";
        ui.find("[data-pia-out='ketqua']").html(h);
        var cb = [], lech = Math.abs((v.cw / v.ch) / (d.W / d.H) - 1) * 100;
        if (tham.khop === "keo" && lech > 1.5) cb.push({ lv: "warn", t: "Tỉ lệ vùng ảnh lệch khổ giấy " + fmt(lech, 1) + "% — «Kéo vừa khổ» sẽ làm méo khung / chữ. Cắt mép cho đúng tỉ lệ, đổi hướng giấy, hoặc chọn «Giữ tỉ lệ»." });
        if (Math.max(k.sx, k.sy) > 1.05) cb.push({ lv: "warn", t: "Ảnh gốc nhỏ hơn khổ giấy ở 96 DPI — phải phóng to nên sẽ hơi mờ. Nên scan lại ở 150–300 DPI." });
        if (nho.xem === "goc" && tham.nghieng) cb.push({ lv: "info", t: "Chỉnh nghiêng chỉ thấy ở chế độ «Kết quả»." });
        var $m = ui.find("[data-pia-out='canhbao']");
        if (!cb.length) { $m.hide().html(""); return; }
        var lv = cb.some(function (x) { return x.lv === "warn"; }) ? "warn" : "info";
        $m.attr("class", "pia-msg " + lv).html(cb.map(function (x) { return x.t; }).join("<br>")).show();
    }
    function veTiepTheo() {
        if (!ui) return;
        var $n = ui.find("[data-pia-out='next']");
        if (!ketQuaTai) { $n.hide().html(""); return; }
        var r = ketQuaTai;
        $n.html('<i class="fa fa-check-circle"></i> Đã tải <b>' + esc(r.ten) + "</b> (" + r.w + " × " + r.h + " px, " + r.kho + " " + r.huong + ", ~" + r.kb + " KB). "
            + (opts.goiYTiepTheo || "Tiếp: Bước 2 → <b>Thêm mẫu</b> → chọn file này. Màn thiết kế phải hiện Dài × Rộng ≈ <b>" + fmt(r.wmm, 0) + " × " + fmt(r.hmm, 0) + "</b> mm.")).show();
    }
    function baoLoi(t) {
        if (!ui) return;
        ui.find("[data-pia-out='loi']").html('<i class="fa fa-exclamation-triangle"></i> ' + t).show();
    }
    function capNhatNhan(key) {
        if (!ui) return;
        if (key === "nghieng") ui.find("[data-pia-out='nghieng']").text(fmt(tham.nghieng, 1) + "°");
        else if (key.indexOf("cat.") === 0) ui.find("[data-pia-out='" + key + "']").text(fmt(tham.cat[key.substring(4)], 1) + "%");
        else if (key === "q") ui.find("[data-pia-out='q']").text(nho.q);
    }
    function bind() {
        ui.off(".pia");
        ui.on("change.pia", "[data-pia-file]", function () {
            var f = this.files && this.files[0];
            napFile(f);
            this.value = "";
        });
        ui.on("click.pia", "[data-pia]", function (e) {
            var a = $(this).attr("data-pia");
            e.preventDefault();
            if (a === "mau" && opts.mau) napUrl(opts.urlAnh(opts.mau.DUONGDANFILE), opts.tenMacDinh || opts.mau.MAPHOI);
            if (!nguon) return;
            if (a === "xoayTrai" || a === "xoayPhai") {
                tham.xoay = (tham.xoay + (a === "xoayPhai" ? 90 : 270)) % 360;
                var g = vung();
                tham.huong = g.rw >= g.rh ? "ngang" : "doc";      // xoay 90° thì đổi hướng giấy theo ảnh
                ui.find("[data-pia-huong]").removeClass("on").filter("[data-pia-huong='" + tham.huong + "']").addClass("on");
                ui.find("[data-pia-out='xoay']").text(tham.xoay ? "đang xoay " + tham.xoay + "°" : "");
                henVe();
            }
            if (a === "tai") taiVe();
            if (a === "datLai") {
                var ten = tham.ten;
                tham = thamMoi(nguon.w, nguon.h, nguon.ten);
                tham.ten = ten;
                veKhung();
            }
        });
        ui.on("click.pia", "[data-pia-huong]", function () {
            if (!nguon) return;
            tham.huong = $(this).attr("data-pia-huong");
            ui.find("[data-pia-huong]").removeClass("on");
            $(this).addClass("on");
            henVe();
        });
        ui.on("click.pia", "[data-pia-khop]", function () {
            if (!nguon) return;
            tham.khop = $(this).attr("data-pia-khop");
            ui.find("[data-pia-khop]").removeClass("on");
            $(this).addClass("on");
            henVe();
        });
        ui.on("click.pia", "[data-pia-xem]", function () {
            if (!nguon) return;
            nho.xem = $(this).attr("data-pia-xem");
            ui.find("[data-pia-xem]").removeClass("on");
            $(this).addClass("on");
            henVe();
        });
        ui.on("change.pia", "[data-pia-luoi]", function () {
            nho.luoi = this.checked;
            if (nguon) henVe();
        });
        ui.on("input.pia change.pia", "[data-pia-v]", function () {
            if (!nguon) return;
            var k = $(this).attr("data-pia-v"), val = this.value;
            if (k === "ten") { tham.ten = val; return; }
            if (k === "kho") { tham.kho = val; henVe(); return; }
            var n = parseFloat(val);
            if (isNaN(n)) return;
            if (k === "q") { nho.q = n; capNhatNhan(k); henMaHoa(); return; }
            if (k === "nghieng") tham.nghieng = n;
            if (k.indexOf("cat.") === 0) {
                var c = k.substring(4), doiDien = { t: "b", b: "t", l: "r", r: "l" }[c];
                tham.cat[c] = Math.min(n, 90 - tham.cat[doiDien]);     // 2 mép đối diện cộng lại < 90%
                if (tham.cat[c] !== n) this.value = tham.cat[c];
            }
            capNhatNhan(k);
            henVe();
        });
        ui.on("blur.pia", "[data-pia-v='ten']", function () {
            if (!nguon) return;
            tham.ten = tenSach(this.value, opts.tenMacDinh);
            this.value = tham.ten;
        });
        ui.on("dragover.pia dragenter.pia", ".pia-drop, .pia-stage", function (e) { e.preventDefault(); $(this).addClass("is-over"); });
        ui.on("dragleave.pia", ".pia-drop, .pia-stage", function () { $(this).removeClass("is-over"); });
        ui.on("drop.pia", ".pia-drop, .pia-stage", function (e) {
            e.preventDefault();
            $(this).removeClass("is-over");
            var dt = e.originalEvent && e.originalEvent.dataTransfer;
            if (dt && dt.files && dt.files[0]) napFile(dt.files[0]);
        });
    }

    /*------------------------------------------
    --[6] Công khai
    --  mount(selector, { mau, urlAnh(path), tenMacDinh, goiYTiepTheo, onTai(info) })  — vẽ lại giữ nguyên ảnh + tham số đang chỉnh
    -------------------------------------------*/
    function mount(sel, o) {
        if (!$) return;
        opts = o || {};
        ui = $(sel);
        if (!ui.length) { ui = null; return; }
        napCss();
        bind();
        veKhung();
    }

    root.PhoiInAnh = {
        version: "1.0.0",
        KHO: KHO,
        mount: mount,
        napUrl: napUrl,
        napFile: napFile,
        datDpi: datDpi,
        docDpi: docDpi,
        tenSach: tenSach,
        doanKho: doanKho,
        maHoa: maHoa,
        trangThai: function () {
            return { coAnh: !!nguon, nguon: nguon ? { ten: nguon.ten, w: nguon.w, h: nguon.h, tainted: nguon.tainted } : null, tham: tham, dich: nguon ? dich() : null, kb: kbUocTinh, daTai: ketQuaTai };
        }
    };
})(window);
