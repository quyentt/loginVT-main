/*----------------------------------------------
--PhoiInFlow — thư viện dùng chung cho "Quy trình phôi in" (18/11/2026)
--Dùng ở:
--  danhmuc/html/quytrinhphoiin.html : trang quy trình 2 luồng (phôi mới cần thiết lập / phôi đã chạy cần chỉnh)
--  danhmuc/html/mauphoiin.html      : tự ghi nhật ký khi Lưu / Thêm mẫu / Xóa ô; banner "đang làm theo quy trình"
--Thành phần:
--  1. nhatKy.ghi / nhatKy.layDS : API nhật ký quy trình — BE CHƯA CÓ, tên hàm là ĐỀ XUẤT (sửa ở API_NHATKY khi BE chốt).
--                                 Đặc tả bảng + tham số ở cuối file.
--  2. timManHinh / moManHinh    : mở chức năng theo đường dẫn file trong menu của vai trò đang đăng nhập (edu.system.initMain);
--                                 không có thì timVaiTroKhac tìm ở các vai trò khác của người dùng và moManHinh tự đổi vai trò
--  3. ngữ cảnh (ctx)            : "đang làm Bước n của quy trình X với mẫu Y" — sessionStorage; màn đích đọc để chọn sẵn mẫu
--                                 và hiện nút "Về quy trình"
--  4. khổ giấy / đơn vị         : quy đổi px <-> mm theo 96 DPI (đúng cách màn Mẫu phôi in tính Dài/Rộng: px x 0.2645833)
--  5. tọa độ test               : dò/xóa tọa độ kéo ở Chế độ test của màn Thực hiện in (localStorage theo user) —
--                                 thuchienin.js áp tọa độ này khi in KỂ CẢ khi đã tắt Chế độ test, nên nó đè tọa độ mẫu
----------------------------------------------*/
(function (root) {
    "use strict";

    var CTX_KEY = "PHOIIN_FLOW_CTX";
    var CTX_TTL = 4 * 60 * 60 * 1000;      // ngữ cảnh quy trình còn hiệu lực 4 giờ
    var PX_PER_MM = 96 / 25.4;             // 3.7795 px / mm

    // ĐỀ XUẤT cho BE — chốt tên controller/hàm thì sửa đúng 2 dòng action/func dưới đây.
    // Phần sau "/" = base64(XOR(tên hàm C#, 'A')), '=' thay bằng 'P' (cùng công thức các API _MH đang chạy).
    var API_NHATKY = {
        them: {
            action: "CMS_NhatKy_QuyTrinh_MH/FSkkLB4PKSA1CjgeEDQ4FTMoLykP",   // Them_NhatKy_QuyTrinh
            func: "PKG_CMS_NHATKY_QUYTRINH.Them_NhatKy_QuyTrinh"
        },
        layDS: {
            action: "CMS_NhatKy_QuyTrinh_MH/DSA4BRIeDykgNQo4HhA0OBUzKC8p",  // LayDS_NhatKy_QuyTrinh
            func: "PKG_CMS_NHATKY_QUYTRINH.LayDS_NhatKy_QuyTrinh"
        }
    };

    // Các màn hình quy trình dẫn tới. duongDan = đuôi DUONGDANFILE của chức năng; app = MAUNGDUNG ưu tiên khi trùng tên file
    // (ApisHocBong cũng có vanbang/html/quanlythongtin.html).
    var MAN_HINH = {
        mauphoiin: {
            duongDan: "danhmuc/html/mauphoiin.html", app: "ApisCMS", ten: "Mẫu phôi in", icon: "fa-th-large",
            moTa: "Thiết kế mẫu: ảnh nền, font, lề in, vị trí từng ô nội dung"
        },
        thuchienin: {
            duongDan: "vanbang/html/thuchienin.html", app: "ApisTotNghiep", ten: "Thực hiện in", icon: "fa-print",
            moTa: "In văn bằng; có Chế độ test để in thử, kéo căn ô"
        },
        quanlythongtin: {
            duongDan: "vanbang/html/quanlythongtin.html", app: "ApisTotNghiep", ten: "Thông tin văn bằng", icon: "fa-id-card",
            moTa: "Gắn mẫu phôi bản chính / bản sao cho văn bằng"
        },
        quytrinhphoiin: {
            duongDan: "danhmuc/html/quytrinhphoiin.html", app: "ApisCMS", ten: "Quy trình phôi in", icon: "fa-sitemap",
            moTa: "Các bước thiết lập / căn chỉnh phôi in"
        }
    };

    var HANH_DONG = {
        BAT_DAU_PHIEN: { ten: "Bắt đầu phiên", mau: "blue", icon: "fa-play-circle" },
        KET_THUC_PHIEN: { ten: "Kết thúc phiên", mau: "green", icon: "fa-flag-checkered" },
        MO_MAN_HINH: { ten: "Mở màn hình", mau: "slate", icon: "fa-external-link" },
        HOAN_THANH: { ten: "Hoàn thành bước", mau: "green", icon: "fa-check" },
        BO_QUA: { ten: "Bỏ qua bước", mau: "amber", icon: "fa-forward" },
        MO_LAI: { ten: "Mở lại bước", mau: "purple", icon: "fa-undo" },
        GHI_CHU: { ten: "Ghi chú", mau: "slate", icon: "fa-commenting-o" },
        TAO_MAU: { ten: "Tạo mẫu", mau: "blue", icon: "fa-plus-square" },
        LUU_MAU: { ten: "Lưu mẫu", mau: "blue", icon: "fa-th-large" },
        XOA_O: { ten: "Xóa ô", mau: "red", icon: "fa-eraser" },
        XOA_TOADO_TEST: { ten: "Xóa tọa độ test", mau: "amber", icon: "fa-crosshairs" }
    };

    /*------------------------------------------
    --[0] Tiện ích
    -------------------------------------------*/
    function s(v) {
        if (v === null || v === undefined) return "";
        var t = String(v);
        return (t === "null" || t === "undefined") ? "" : t;
    }
    function esc(v) {
        return s(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function sys() { return (root.edu && root.edu.system) || {}; }
    function userKey() { return sys().userId || "anon"; }
    function guid() {
        var b = new Uint8Array(16), i, out = "";
        try { root.crypto.getRandomValues(b); } catch (e) { for (i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256); }
        for (i = 0; i < 16; i++) out += (b[i] < 16 ? "0" : "") + b[i].toString(16);
        return out.toUpperCase();
    }
    // "dd/MM/yyyy HH:mm:ss" | ISO | Date -> số mili giây (0 nếu không đọc được)
    function docThoiGian(v) {
        if (!v) return 0;
        if (v instanceof Date) return v.getTime();
        var m = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)).getTime();
        var t = Date.parse(v);
        return isNaN(t) ? 0 : t;
    }
    function pad2(n) { return (n < 10 ? "0" : "") + n; }
    function fmtThoiGian(ms) {
        if (!ms) return "";
        var d = new Date(ms);
        return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + " " + pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear();
    }

    /*------------------------------------------
    --[1] Gọi API — cùng 1 kiểu với form tiến trình chung (edu.process.callApi): luôn có ok + message, không ném lỗi
    -------------------------------------------*/
    var trangThaiApi = { ok: null, message: "", action: "", luc: 0 };
    var nguoiNghe = [];
    function baoTrangThaiApi(ok, message, action) {
        trangThaiApi = { ok: ok, message: message, action: action, luc: Date.now() };
        nguoiNghe.forEach(function (fn) { try { fn(trangThaiApi); } catch (e) { } });
    }
    function callApi(params) {
        var E = root.edu;
        if (E && E.process && typeof E.process.callApi === "function") return E.process.callApi(params);
        return new Promise(function (resolve) {
            if (!E || !E.system || typeof E.system.makeRequest !== "function") {
                resolve({ ok: false, message: "Chưa sẵn sàng gọi máy chủ (thiếu edu.system.makeRequest)." });
                return;
            }
            var p = {}, k;
            for (k in params) p[k] = params[k];
            if (!p.type) p.type = "POST";
            if (p.contentType === undefined) p.contentType = true;
            if (!p.fakedb) p.fakedb = [];
            p.success = function (data) {
                var ok = !!(data && data.Success);
                var msg = (data && data.Message !== undefined && data.Message !== null) ? String(data.Message) : "";
                resolve({ ok: ok, message: ok ? msg : (msg || "Máy chủ không trả về nội dung thông báo."), data: data });
            };
            p.error = function (er) {
                var m = "Không kết nối được máy chủ.";
                if (er && er.statusText === "timeout") m = "Quá thời gian chờ phản hồi từ máy chủ.";
                else if (er && er.status) m = "Lỗi " + er.status + (er.statusText ? " - " + er.statusText : "");
                resolve({ ok: false, message: m });
            };
            try {
                E.system.makeRequest(p, false, false, false, null);
                if (root.$) root.$("#overlay").hide();
            } catch (ex) {
                resolve({ ok: false, message: "Không gửi được yêu cầu: " + (ex && ex.message ? ex.message : ex) });
            }
        });
    }

    /*------------------------------------------
    --[2] Nhật ký quy trình
    --  ghi({ maQuyTrinh, phienId, doiTuongId, doiTuongMa, buoc, hanhDong, noiDung, duLieu }) -> Promise<{ ok, message, id }>
    --  layDS({ maQuyTrinh (tiền tố), phienId, doiTuongId, buoc, hanhDong, tuKhoa, pageSize }) -> Promise<{ ok, message, rows }>
    -------------------------------------------*/
    function ghi(e) {
        var S = sys();
        var obj = {
            action: API_NHATKY.them.action,
            func: API_NHATKY.them.func,
            iM: S.iM,
            strMaQuyTrinh: s(e.maQuyTrinh),
            strPhien_Id: s(e.phienId),
            strDoiTuong_Id: s(e.doiTuongId),
            strDoiTuong_Ma: s(e.doiTuongMa),
            strBuoc_Ma: s(e.buoc),
            strHanhDong: s(e.hanhDong),
            strNoiDung: s(e.noiDung).substring(0, 2000),
            strDuLieu: e.duLieu ? JSON.stringify(e.duLieu) : "",
            strNguoiTao_Id: s(S.userId)
        };
        return callApi({ type: "POST", action: obj.action, data: obj }).then(function (r) {
            baoTrangThaiApi(r.ok, r.message, obj.action);
            var d = r.data || {};
            return { ok: r.ok, message: r.message, id: s(d.Id || d.ID), action: obj.action };
        });
    }
    function chuanHoaDong(d) {
        var dl = null;
        try { dl = d.DULIEU ? JSON.parse(d.DULIEU) : null; } catch (ex) { dl = null; }
        return {
            id: s(d.ID),
            maQuyTrinh: s(d.MAQUYTRINH),
            phienId: s(d.PHIEN_ID),
            doiTuongId: s(d.DOITUONG_ID),
            doiTuongMa: s(d.DOITUONG_MA),
            buoc: s(d.BUOC_MA),
            hanhDong: s(d.HANHDONG),
            noiDung: s(d.NOIDUNG),
            duLieu: dl,
            nguoiTao: s(d.NGUOITAO_TENDAYDU || d.NGUOITAO_HOTEN || d.NGUOITAO_TAIKHOAN || d.NGUOITAO_ID),
            luc: docThoiGian(d.NGAYTAO),
            ngayTao: s(d.NGAYTAO),
            trangThaiGhi: "ok"
        };
    }
    function layDS(f) {
        f = f || {};
        var S = sys();
        var obj = {
            action: API_NHATKY.layDS.action,
            func: API_NHATKY.layDS.func,
            iM: S.iM,
            strMaQuyTrinh: s(f.maQuyTrinh),
            strPhien_Id: s(f.phienId),
            strDoiTuong_Id: s(f.doiTuongId),
            strBuoc_Ma: s(f.buoc),
            strHanhDong: s(f.hanhDong),
            strTuKhoa: s(f.tuKhoa),
            strTuNgay: s(f.tuNgay),
            strDenNgay: s(f.denNgay),
            pageIndex: f.pageIndex || 1,
            pageSize: f.pageSize || 500
        };
        return callApi({ type: "POST", action: obj.action, data: obj }).then(function (r) {
            baoTrangThaiApi(r.ok, r.message, obj.action);
            var raw = [];
            if (r.ok && r.data) {
                if (Array.isArray(r.data.Data)) raw = r.data.Data;
                else if (r.data.Data && Array.isArray(r.data.Data.rs)) raw = r.data.Data.rs;
            }
            var rows = raw.map(chuanHoaDong);
            rows.sort(function (a, b) { return b.luc - a.luc; });
            return { ok: r.ok, message: r.message, rows: rows, action: obj.action };
        });
    }

    /*------------------------------------------
    --[3] Mở màn hình theo menu vai trò
    -------------------------------------------*/
    // Trong 1 danh sách chức năng (menu 1 vai trò), tìm chức năng có DUONGDANFILE khớp màn hình; ưu tiên đúng MAUNGDUNG
    function chonChucNang(list, mh) {
        list = list || [];
        var duoi = mh.duongDan.toLowerCase();
        var ung = list.filter(function (c) {
            return c && c.DUONGDANFILE && String(c.DUONGDANFILE).toLowerCase().replace(/\\/g, "/").indexOf(duoi) !== -1;
        });
        if (!ung.length) return null;
        var cn = null, i;
        for (i = 0; i < ung.length; i++) if (ung[i].MAUNGDUNG === mh.app) { cn = ung[i]; break; }
        if (!cn) cn = ung[0];
        var ten = [], cur = cn, guard = 0;
        while (cur && guard++ < 8) {
            ten.unshift(s(cur.TENCHUCNANG));
            var chaId = cur.CHUCNANGCHA_ID;
            cur = null;
            if (chaId) for (i = 0; i < list.length; i++) if (list[i].ID === chaId) { cur = list[i]; break; }
        }
        return { chucNang: cn, duongMenu: ten.filter(Boolean).join(" › ") };
    }
    function timManHinh(key) {
        var mh = MAN_HINH[key];
        if (!mh) return null;
        var f = chonChucNang(sys().dtChucNang, mh);
        return { key: key, manHinh: mh, chucNang: f ? f.chucNang : null, duongMenu: f ? f.duongMenu : "" };
    }

    /*------------------------------------------
    --[3b] Chức năng nằm ở VAI TRÒ KHÁC của người dùng
    --  Vd: trang quy trình ở vai trò "Quản trị hệ thống", còn Thực hiện in / Thông tin văn bằng ở vai trò "Xét tốt nghiệp".
    --  Shell indexi: edu.system.dtUngDung = DS vai trò của người dùng; menu mỗi vai trò = LayDSChucNangNguoiDung(strVaiTro_Id).
    --  Đổi vai trò = y như bấm vai trò ở khung chọn ứng dụng (#tblApp → edu.system.setUngDung). Đặt trước
    --  sessionStorage "strChucNang_Id" = chức năng đích: menu mới vẽ xong shell tự bấm đúng chức năng đó
    --  (cùng đường shell khôi phục chức năng đang mở khi F5 — Corei/systemroot.js genHTML_MenuVertical).
    -------------------------------------------*/
    var API_MENU_VAITRO = { action: "CMS_QuanTri01_MH/DSA4BRICKTQiDyAvJg8mNC4oBTQvJgPP", func: "PKG_CORE_QUANTRI_01.LayDSChucNangNguoiDung" };
    var API_DS_VAITRO = { action: "CMS_QuanTri01_MH/DSA4BRIXICgVMy4PJjQuKAU0LyYP", func: "PKG_CORE_QUANTRI_01.LayDSVaiTroNguoiDung" };
    var menuVaiTro = {};    // vaiTroId -> Promise<{ ok, message, rows }>
    var vaiTroKhac = {};    // key màn hình -> { trangThai: "dang"|"co"|"khong"|"loi", vaiTro, chucNang, duongMenu, message }

    function dsVaiTro() {
        var S = sys();
        if (Array.isArray(S.dtUngDung) && S.dtUngDung.length) return Promise.resolve(S.dtUngDung);
        return callApi({
            type: "POST", action: API_DS_VAITRO.action,
            data: { action: API_DS_VAITRO.action, func: API_DS_VAITRO.func, iM: S.iM, strChucNang_Id: "", strNguoiThucHien_Id: s(S.userId) }
        }).then(function (r) { return (r.ok && r.data && Array.isArray(r.data.Data)) ? r.data.Data : []; });
    }
    function layMenuVaiTro(vaiTroId) {
        if (menuVaiTro[vaiTroId]) return menuVaiTro[vaiTroId];
        var S = sys();
        var p = callApi({
            type: "POST", action: API_MENU_VAITRO.action,
            data: {
                action: API_MENU_VAITRO.action, func: API_MENU_VAITRO.func, iM: S.iM, strChucNang_Id: "",
                strVaiTro_Id: vaiTroId, strVaiTroDangNhap_Id: vaiTroId, strNguoiThucHien_Id: s(S.userId)
            }
        }).then(function (r) {
            var d = r.data && r.data.Data;
            var rows = d && Array.isArray(d.rs) ? d.rs : (Array.isArray(d) ? d : []);
            if (!r.ok) delete menuVaiTro[vaiTroId];
            return { ok: r.ok, message: r.message, rows: rows };
        });
        menuVaiTro[vaiTroId] = p;
        return p;
    }
    // Tìm màn hình ở các vai trò khác (bỏ vai trò đang đăng nhập và vai trò thủ vai sinh viên). Kết quả nhớ theo key.
    function timVaiTroKhac(key) {
        var mh = MAN_HINH[key];
        if (!mh) return Promise.resolve(null);
        var c = vaiTroKhac[key];
        if (c && c.promise) return c.promise;
        var hienTai = s(sys().appId);
        c = vaiTroKhac[key] = { trangThai: "dang", vaiTro: null, chucNang: null, duongMenu: "", message: "" };
        c.promise = dsVaiTro().then(function (ds) {
            var ung = (ds || []).filter(function (v) { return v && v.ID && s(v.ID) !== hienTai && s(v.CHOPHEPTHUVAI) !== "1"; });
            if (!ung.length) return [];
            return Promise.all(ung.map(function (v) {
                return layMenuVaiTro(v.ID).then(function (m) { return { vaiTro: v, m: m }; });
            }));
        }).then(function (kq) {
            var tot = null, loi = 0;
            kq.forEach(function (x) {
                if (!x.m.ok) { loi++; return; }
                var f = chonChucNang(x.m.rows, mh);
                if (!f) return;
                var dungApp = f.chucNang.MAUNGDUNG === mh.app;
                if (!tot || (dungApp && !tot.dungApp)) tot = { vaiTro: x.vaiTro, chucNang: f.chucNang, duongMenu: f.duongMenu, dungApp: dungApp };
            });
            if (tot) {
                c.trangThai = "co";
                c.vaiTro = tot.vaiTro;
                c.chucNang = tot.chucNang;
                c.duongMenu = tot.duongMenu;
            } else if (kq.length && loi === kq.length) {
                c.trangThai = "loi";
                c.message = "Không đọc được menu các vai trò khác của bạn — thử Làm mới, hoặc tự đổi vai trò rồi mở «" + mh.ten + "».";
                delete c.promise;   // cho phép tìm lại
            } else {
                c.trangThai = "khong";
                c.message = "Không vai trò nào của bạn có chức năng «" + mh.ten + "» (" + mh.app + "/Modules/" + mh.duongDan + "). Nhờ quản trị gán chức năng này cho vai trò của bạn.";
            }
            return c;
        });
        return c.promise;
    }
    function ketQuaVaiTroKhac(key) { return vaiTroKhac[key] || null; }
    function datLaiVaiTroKhac() { vaiTroKhac = {}; menuVaiTro = {}; }
    function tenVaiTroHienTai() {
        var S = sys(), ds = S.dtUngDung || [], i;
        for (i = 0; i < ds.length; i++) if (ds[i] && ds[i].ID === S.appId) return s(ds[i].TENVAITRO);
        return "";
    }
    // Đổi sang vai trò khác rồi mở chức năng (chucNangId) trong menu vai trò đó
    function chuyenVaiTro(vaiTro, chucNangId) {
        var S = sys();
        if (!vaiTro || !vaiTro.ID || !chucNangId) return { ok: false, message: "Thiếu vai trò / chức năng để chuyển." };
        if (typeof S.setUngDung !== "function") return { ok: false, message: "Không đổi được vai trò (thiếu edu.system.setUngDung)." };
        try { root.sessionStorage.setItem("strChucNang_Id", s(chucNangId)); } catch (e) { }
        if (root.$) root.$("#lbLogo_mini, #lbLogo_large").html(esc(vaiTro.TENVAITRO));
        S.setUngDung(vaiTro);
        return { ok: true, message: "", doiVaiTro: s(vaiTro.TENVAITRO) };
    }
    function timVaiTroTheoId(id) {
        var ds = sys().dtUngDung || [], i;
        for (i = 0; i < ds.length; i++) if (ds[i] && ds[i].ID === id) return ds[i];
        return null;
    }

    // Mở màn hình; ctx (nếu có) được lưu để màn đích chọn sẵn mẫu + hiện nút "Về quy trình".
    // Không có trong menu vai trò hiện tại: dùng kết quả timVaiTroKhac (phải gọi trước) để đổi vai trò;
    // riêng "Về quy trình" dùng vai trò + chức năng xuất phát ghi trong ngữ cảnh (veVaiTroId / veChucNangId).
    function moManHinh(key, ctx) {
        var t = timManHinh(key);
        if (!t) return { ok: false, message: "Không có màn hình '" + key + "' trong cấu hình." };
        var S = sys();
        if (t.chucNang) {
            if (typeof S.initMain !== "function") return { ok: false, message: "Không mở được màn hình (thiếu edu.system.initMain)." };
            if (ctx) setCtx(ctx);
            var hash = "#" + (s(t.chucNang.ID) + s(S.appId)).toLowerCase();
            S.initMain(hash, t.chucNang.DUONGDANFILE, t.chucNang.ID);
            return { ok: true, message: "" };
        }
        var k = vaiTroKhac[key];
        if (k && k.trangThai === "co") {
            if (ctx) setCtx(ctx);
            return chuyenVaiTro(k.vaiTro, k.chucNang.ID);
        }
        var c = getCtx();
        if (key === "quytrinhphoiin" && c && c.veVaiTroId && c.veChucNangId) {
            var vt = timVaiTroTheoId(c.veVaiTroId);
            if (vt) return chuyenVaiTro(vt, c.veChucNangId);
        }
        return {
            ok: false,
            message: (k && k.message) || (k && k.trangThai === "dang" ? "Đang tìm «" + t.manHinh.ten + "» ở các vai trò khác của bạn — thử lại sau giây lát."
                : "Vai trò đang đăng nhập chưa có chức năng «" + t.manHinh.ten + "» (" + t.manHinh.duongDan + ") trong menu. Nhờ quản trị gán quyền hoặc đổi vai trò.")
        };
    }

    /*------------------------------------------
    --[4] Ngữ cảnh quy trình (truyền giữa các màn)
    --  { quyTrinh, tenQuyTrinh, buoc, tenBuoc, thuTu, tong, phienId, mauId, maPhoi, ts,
    --    veVaiTroId, veVaiTroTen, veChucNangId }  <- vai trò + chức năng trang quy trình, để "Về quy trình" đổi lại vai trò
    -------------------------------------------*/
    function setCtx(c) {
        try { c.ts = Date.now(); root.sessionStorage.setItem(CTX_KEY, JSON.stringify(c)); } catch (e) { }
    }
    function getCtx() {
        try {
            var c = JSON.parse(root.sessionStorage.getItem(CTX_KEY) || "null");
            if (!c || !c.ts || Date.now() - c.ts > CTX_TTL) return null;
            return c;
        } catch (e) { return null; }
    }
    function clearCtx() {
        try { root.sessionStorage.removeItem(CTX_KEY); } catch (e) { }
    }
    // Banner "đang làm theo quy trình" cho màn đích. opts.idZone: phần tử chứa; opts.ghiChu: chữ thêm
    function veBannerNguCanh(idZone, ghiChu) {
        var $ = root.$, c = getCtx();
        if (!$) return null;
        var $z = $("#" + idZone);
        if (!$z.length) return null;
        if (!c) { $z.html("").hide(); return null; }
        var veKhac = c.veVaiTroId && c.veVaiTroId !== sys().appId && c.veVaiTroTen;
        if (veKhac) ghiChu = (ghiChu ? ghiChu + ' · ' : '') + 'Về quy trình sẽ chuyển lại vai trò <b>' + esc(c.veVaiTroTen) + '</b>';
        var html = '<div class="pif-ctx" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:8px;padding:10px 14px;margin:0 0 12px 0;color:#0f172a;font-size:13px;line-height:1.45">'
            + '<i class="fa fa-sitemap" style="color:#2563eb;font-size:16px"></i>'
            + '<div style="flex:1 1 320px;min-width:0">'
            + '<div style="font-weight:600">Đang làm theo quy trình: ' + esc(c.tenQuyTrinh) + '</div>'
            + '<div style="color:#334155">Bước ' + esc(c.thuTu) + '/' + esc(c.tong) + ' · <b>' + esc(c.tenBuoc) + '</b>'
            + (c.maPhoi ? ' · Mẫu <b>' + esc(c.maPhoi) + '</b>' : '') + (ghiChu ? ' · ' + ghiChu : '') + '</div>'
            + '</div>'
            + '<a href="javascript:void(0)" class="pif-ctx-back" style="display:inline-flex;align-items:center;gap:6px;background:#2563eb;color:#fff;border-radius:6px;padding:7px 14px;font-weight:600;text-decoration:none"><i class="fa fa-arrow-left"></i> Về quy trình</a>'
            + '<a href="javascript:void(0)" class="pif-ctx-close" title="Ẩn (thoát chế độ làm theo quy trình)" style="color:#64748b;padding:4px 6px;text-decoration:none"><i class="fa fa-times"></i></a>'
            + '</div>';
        $z.html(html).show();
        $z.off("click.pif").on("click.pif", ".pif-ctx-back", function () {
            var r = moManHinh("quytrinhphoiin");
            if (!r.ok && root.edu && root.edu.system) root.edu.system.alert(r.message, "w");
        }).on("click.pif", ".pif-ctx-close", function () {
            clearCtx();
            $z.html("").hide();
        });
        return c;
    }

    /*------------------------------------------
    --[5] Khổ giấy / đơn vị (96 DPI)
    -------------------------------------------*/
    var KHO_GIAY = [
        { ten: "A3", w: 297, h: 420 },
        { ten: "A4", w: 210, h: 297 },
        { ten: "A5", w: 148, h: 210 },
        { ten: "B5", w: 176, h: 250 },
        { ten: "Letter", w: 216, h: 279 }
    ];
    function mmToPx(mm) { return mm * PX_PER_MM; }
    function pxToMm(px) { return px / PX_PER_MM; }
    // Đọc kích thước ảnh nền từ tên file — CÙNG cách mauphoiin.js/thuchienin.js đang đọc: split("_")[1], [2]
    function docAnhNen(path) {
        var p = s(path);
        if (p.indexOf("_") === -1) return null;
        var a = p.split("_");
        var w = parseFloat(a[1]), h = parseFloat(a[2]);
        if (!(w > 0 && h > 0)) return null;
        return { w: w, h: h };
    }
    function khopKho(wmm, hmm, saiSo) {
        var i, k;
        for (i = 0; i < KHO_GIAY.length; i++) {
            k = KHO_GIAY[i];
            if (Math.abs(wmm - k.w) <= saiSo && Math.abs(hmm - k.h) <= saiSo) return { ten: k.ten, huong: "dọc", kho: k };
            if (Math.abs(wmm - k.h) <= saiSo && Math.abs(hmm - k.w) <= saiSo) return { ten: k.ten, huong: "ngang", kho: k };
        }
        return null;
    }
    // px ảnh -> { wmm, hmm, kho: {ten, huong} | null, dpiNghi: số DPI nếu đoán ảnh chưa thu về 96 }
    function khoGiay(wpx, hpx) {
        var wmm = pxToMm(wpx), hmm = pxToMm(hpx);
        var r = { wmm: wmm, hmm: hmm, kho: khopKho(wmm, hmm, 4), dpiNghi: 0, khoNeuThuNho: null };
        if (!r.kho) {
            var dpis = [150, 200, 300, 400, 600], i, f, k;
            for (i = 0; i < dpis.length; i++) {
                f = dpis[i] / 96;
                k = khopKho(wmm / f, hmm / f, 4);
                if (k) { r.dpiNghi = dpis[i]; r.khoNeuThuNho = k; break; }
            }
        }
        return r;
    }

    /*------------------------------------------
    --[6] Tọa độ test của màn Thực hiện in (thuchienin.js: TEST_PHOI_POS_<user>_<idÔ>, TEST_PHOI_<user>_<idÔ>, TEST_PHOI_ENABLED_<user>)
    -------------------------------------------*/
    function demToaDoTest(ids) {
        var u = userKey(), pos = [], giaTri = 0, bat = false;
        (ids || []).forEach(function (id) {
            try {
                if (root.localStorage.getItem("TEST_PHOI_POS_" + u + "_" + id)) pos.push(id);
                if (root.localStorage.getItem("TEST_PHOI_" + u + "_" + id)) giaTri++;
            } catch (e) { }
        });
        try { bat = root.localStorage.getItem("TEST_PHOI_ENABLED_" + u) === "1"; } catch (e) { }
        return { soO: pos.length, ids: pos, soGiaTriTest: giaTri, cheDoTestBat: bat };
    }
    function xoaToaDoTest(ids) {
        var u = userKey(), n = 0;
        (ids || []).forEach(function (id) {
            try {
                var k = "TEST_PHOI_POS_" + u + "_" + id;
                if (root.localStorage.getItem(k)) { root.localStorage.removeItem(k); n++; }
            } catch (e) { }
        });
        return n;
    }

    root.PhoiInFlow = {
        version: "1.1.0",
        API_NHATKY: API_NHATKY,
        MAN_HINH: MAN_HINH,
        HANH_DONG: HANH_DONG,
        KHO_GIAY: KHO_GIAY,
        PX_PER_MM: PX_PER_MM,
        nhatKy: {
            ghi: ghi,
            layDS: layDS,
            trangThai: function () { return trangThaiApi; },
            nghe: function (fn) { if (typeof fn === "function") nguoiNghe.push(fn); },
            boNghe: function () { nguoiNghe = []; }
        },
        callApi: callApi,
        timManHinh: timManHinh,
        timVaiTroKhac: timVaiTroKhac,
        ketQuaVaiTroKhac: ketQuaVaiTroKhac,
        datLaiVaiTroKhac: datLaiVaiTroKhac,
        tenVaiTroHienTai: tenVaiTroHienTai,
        chuyenVaiTro: chuyenVaiTro,
        moManHinh: moManHinh,
        setCtx: setCtx,
        getCtx: getCtx,
        clearCtx: clearCtx,
        veBannerNguCanh: veBannerNguCanh,
        mmToPx: mmToPx,
        pxToMm: pxToMm,
        docAnhNen: docAnhNen,
        khoGiay: khoGiay,
        demToaDoTest: demToaDoTest,
        xoaToaDoTest: xoaToaDoTest,
        util: { s: s, esc: esc, guid: guid, docThoiGian: docThoiGian, fmtThoiGian: fmtThoiGian }
    };
})(window);

/*----------------------------------------------
--ĐẶC TẢ API NHẬT KÝ QUY TRÌNH (đề xuất cho BE — chưa có trên máy chủ)
--Bảng CMS_NHATKY_QUYTRINH (dùng chung cho mọi quy trình sau này, không riêng phôi in):
--  ID              VARCHAR2(50)  PK (GUID)
--  MAQUYTRINH      VARCHAR2(100) PHOIIN_MOI | PHOIIN_CANCHINH | PHOIIN_SUAMAU (sửa mẫu ngoài quy trình)
--  PHIEN_ID        VARCHAR2(50)  FE tự sinh GUID cho 1 lần làm quy trình (1 phiên = nhiều dòng)
--  DOITUONG_ID     VARCHAR2(50)  ID mẫu phôi (có thể rỗng ở bước chưa tạo mẫu)
--  DOITUONG_MA     NVARCHAR2(200) MAPHOI tại thời điểm ghi
--  BUOC_MA         VARCHAR2(20)  A1..A8 | B1..B6 | rỗng
--  HANHDONG        VARCHAR2(50)  BAT_DAU_PHIEN | KET_THUC_PHIEN | MO_MAN_HINH | HOAN_THANH | BO_QUA | MO_LAI | GHI_CHU
--                                | TAO_MAU | LUU_MAU | XOA_O | XOA_TOADO_TEST
--  NOIDUNG         NVARCHAR2(2000) câu tóm tắt cho người đọc
--  DULIEU          CLOB          JSON chi tiết (diff tọa độ từng ô, checklist, số đo lệch...) — KHÔNG dùng VARCHAR2 (dễ vượt 4000 byte)
--  NGUOITAO_ID     VARCHAR2(50)
--  NGAYTAO         DATE          SYSDATE
--Them_NhatKy_QuyTrinh (POST, iM): strMaQuyTrinh, strPhien_Id, strDoiTuong_Id, strDoiTuong_Ma, strBuoc_Ma, strHanhDong,
--  strNoiDung, strDuLieu, strNguoiTao_Id  -> { Success, Message, Id }
--LayDS_NhatKy_QuyTrinh (POST, iM): strMaQuyTrinh (so khớp TIỀN TỐ: 'PHOIIN' lấy cả 3 mã), strPhien_Id, strDoiTuong_Id,
--  strBuoc_Ma, strHanhDong, strTuKhoa (tìm trong NOIDUNG/DOITUONG_MA), strTuNgay, strDenNgay (dd/MM/yyyy), pageIndex, pageSize
--  (tham số rỗng = không lọc) -> Data: các cột trên + NGUOITAO_TENDAYDU (họ tên người ghi), NGAYTAO dạng 'dd/MM/yyyy HH24:mi:ss',
--  sắp xếp NGAYTAO giảm dần.
----------------------------------------------*/
