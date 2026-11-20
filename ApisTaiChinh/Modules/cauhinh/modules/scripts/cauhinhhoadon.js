/*----------------------------------------------
--Trang: Cấu hình hóa đơn điện tử (module Tài chính > cauhinh)
--Mục đích: trường tự khai báo tham số phát hành HĐĐT: đơn vị bán, tài khoản kết nối nhà cung cấp, mẫu số - ký hiệu, ký số.
--API (pkg_taichinh_thongtinhoadon, controller TC_ThongTinHoaDon_MH, mã hóa XOR: thêm 'func' + 'iM' là makeRequest tự mã hóa/giải mã):
--  LayDS_TaiChinh_ThamSoHoaDon(strTuKhoa, strNhaCungCapDichVu_Id)  -> danh sách cấu hình
--  Them_TaiChinh_ThamSoHoaDon(22 tham số)                          -> thêm
--  Sua_TaiChinh_ThamSoHoaDon(22 tham số)                           -> sửa toàn bộ
--  Sua_TC_ThamSoHoaDon_MotSoCot(TenDonVi, MaSoThue, SoDienThoai, Username, Password, InvoiceSeries, PinCode, SignXml_Host)
--  Xoa_TaiChinh_ThamSoHoaDon(strID)                                -> xóa
--Chọn hàm Sửa: so form với giá trị lúc mở. Chỉ đổi các cột của MotSoCot -> gọi MotSoCot; đổi cột khác -> Sửa toàn bộ.
--Khi Sửa, các thông số kết nối (nhà cung cấp, nút phát hành, máy chủ, xác thực, loại HĐ, mẫu số, tiền tệ) bị khóa để tránh sửa nhầm;
--  bật "Mở khóa để sửa" mới đổi được, khóa lại thì trả các ô đó về giá trị cũ.
--GIẢ ĐỊNH (chưa xác minh với BE):
--  (1) Tên cột LayDS trả về = tên cột viết HOA (TENDONVI, MASOTHUEDONVI, HOST, ...). Đọc mềm theo nhiều tên (bỏ "_", không phân biệt
--      hoa/thường) + console.warn liệt kê cột không thấy để đối chiếu.
--  (2) strPhuongThuc_Id = ID mục danh mục TAICHINH.NUTHDDT (nút HĐĐT ở màn Thu tiền; thutien.js gửi strPhuongThuc_MA = MA của nút đó).
--  (3) Danh mục nhà cung cấp dịch vụ: mã TAICHINH.NHACUNGCAPDICHVU — ĐOÁN, đổi ở MA_DM_NHACUNGCAP nếu BE dùng mã khác.
--  (4) Nếu LayDS không trả cột mật khẩu / PIN / mã xác thực: khi Sửa mà ô đó trống thì hỏi lại trước khi lưu (tránh ghi đè rỗng).
--Không dùng ở trang này: ThucHienTongHopDuLieu, Them_TaiChinh_TTHoaDon_DuLieu (theo từng người học + khoản đã nộp, thuộc luồng xuất hóa đơn).
----------------------------------------------*/
function CauHinhHoaDon() { };
CauHinhHoaDon.prototype = {
    MA_DM_NHACUNGCAP: 'TAICHINH.NHACUNGCAPDICHVU',
    MA_DM_PHUONGTHUC: 'TAICHINH.NUTHDDT',
    API: {
        LAYDS: { action: 'TC_ThongTinHoaDon_MH/DSA4BRIeFSAoAikoLykeFSkgLBIuCS4gBS4v', func: 'pkg_taichinh_thongtinhoadon.LayDS_TaiChinh_ThamSoHoaDon' },
        THEM: { action: 'TC_ThongTinHoaDon_MH/FSkkLB4VICgCKSgvKR4VKSAsEi4JLiAFLi8P', func: 'pkg_taichinh_thongtinhoadon.Them_TaiChinh_ThamSoHoaDon' },
        SUA: { action: 'TC_ThongTinHoaDon_MH/EjQgHhUgKAIpKC8pHhUpICwSLgkuIAUuLwPP', func: 'pkg_taichinh_thongtinhoadon.Sua_TaiChinh_ThamSoHoaDon' },
        SUA_MOT: { action: 'TC_ThongTinHoaDon_MH/EjQgHhUCHhUpICwSLgkuIAUuLx4MLjUSLgIuNQPP', func: 'pkg_taichinh_thongtinhoadon.Sua_TC_ThamSoHoaDon_MotSoCot' },
        XOA: { action: 'TC_ThongTinHoaDon_MH/GS4gHhUgKAIpKC8pHhUpICwSLgkuIAUuLwPP', func: 'pkg_taichinh_thongtinhoadon.Xoa_TaiChinh_ThamSoHoaDon' }
    },
    /* k: khóa nội bộ = tên cột chuẩn; p: tham số API; id: ô nhập; sec: khối trên form
       mot: có trong Sua_TC_ThamSoHoaDon_MotSoCot; kt: thông số kết nối (bị khóa khi Sửa); need: cần để phát hành;
       req: bắt buộc mới cho lưu; secret: che như mật khẩu; can: tên cột khác có thể gặp */
    FIELDS: [
        { k: 'NHACUNGCAPDICHVU_ID', p: 'strNhaCungCapDichVu_Id', id: 'dropChdNCC', ten: 'Nhà cung cấp dịch vụ', sec: 1, kt: 1, can: ['NHACUNGCAP_ID', 'TAICHINH_NHACUNGCAPDICHVU_ID'] },
        { k: 'PHUONGTHUC_ID', p: 'strPhuongThuc_Id', id: 'dropChdPhuongThuc', ten: 'Nút phát hành HĐĐT', sec: 1, kt: 1, need: 1, can: ['TAICHINH_PHUONGTHUC_ID'] },
        { k: 'TENDONVI', p: 'strTenDonVi', id: 'txtChdTenDonVi', ten: 'Tên đơn vị', sec: 2, mot: 1, need: 1, req: 1, can: ['TEN_DONVI'] },
        { k: 'MASOTHUEDONVI', p: 'strMaSoThueDonVi', id: 'txtChdMaSoThue', ten: 'Mã số thuế', sec: 2, mot: 1, need: 1, req: 1, can: ['MASOTHUE_DONVI', 'MASOTHUE'] },
        { k: 'DIACHIDONVI', p: 'strDiaChiDonVi', id: 'txtChdDiaChi', ten: 'Địa chỉ', sec: 2, can: ['DIACHI_DONVI', 'DIACHI'] },
        { k: 'SODIENTHOAIDONVI', p: 'strSoDienThoaiDonVi', id: 'txtChdSoDienThoai', ten: 'Số điện thoại', sec: 2, mot: 1, can: ['SODIENTHOAI_DONVI', 'SODIENTHOAI', 'DIENTHOAI'] },
        { k: 'HOST', p: 'strHost', id: 'txtChdHost', ten: 'Máy chủ (Host)', sec: 3, kt: 1, need: 1 },
        { k: 'API', p: 'strApi', id: 'txtChdApi', ten: 'Đường dẫn API', sec: 3, kt: 1 },
        { k: 'LOAIXACTHUC', p: 'strLoaiXacThuc', id: 'txtChdLoaiXacThuc', ten: 'Loại xác thực', sec: 3, kt: 1 },
        { k: 'MAXACTHUC', p: 'strMaXacThuc', id: 'txtChdMaXacThuc', ten: 'Mã xác thực', sec: 3, kt: 1, secret: 1 },
        { k: 'USERNAME', p: 'strUsername', id: 'txtChdUsername', ten: 'Tên đăng nhập', sec: 4, mot: 1, need: 1 },
        { k: 'PASSWORD', p: 'strPassword', id: 'txtChdPassword', ten: 'Mật khẩu', sec: 4, mot: 1, need: 1, secret: 1 },
        { k: 'USERNAME2', p: 'strUsername2', id: 'txtChdUsername2', ten: 'Tên đăng nhập thứ hai', sec: 4 },
        { k: 'PASSWORD2', p: 'strPassword2', id: 'txtChdPassword2', ten: 'Mật khẩu thứ hai', sec: 4, secret: 1 },
        { k: 'INVOICETYPE', p: 'strInvoiceType', id: 'txtChdInvoiceType', ten: 'Loại hóa đơn', sec: 5, kt: 1 },
        { k: 'TEMPLATECODE', p: 'strTemplateCode', id: 'txtChdTemplateCode', ten: 'Mẫu số', sec: 5, kt: 1, need: 1 },
        { k: 'INVOICESERIES', p: 'strInvoiceSeries', id: 'txtChdInvoiceSeries', ten: 'Ký hiệu', sec: 5, mot: 1, need: 1 },
        { k: 'CURRENCYCODE', p: 'strCurrencyCode', id: 'txtChdCurrencyCode', ten: 'Tiền tệ', sec: 5, kt: 1 },
        { k: 'PINCODE', p: 'strPinCode', id: 'txtChdPinCode', ten: 'Mã PIN chữ ký số', sec: 6, mot: 1, secret: 1 },
        { k: 'SIGNXML_HOST', p: 'strSignXml_Host', id: 'txtChdSignXmlHost', ten: 'Dịch vụ ký XML', sec: 6, mot: 1 }
    ],
    // Cột phụ chỉ để hiển thị (nếu máy chủ có trả)
    META: [
        { k: 'ID', can: ['TAICHINH_THAMSOHOADON_ID', 'THAMSOHOADON_ID'] },
        { k: 'NCC_TEN', can: ['NHACUNGCAPDICHVU_TEN', 'TENNHACUNGCAPDICHVU', 'NHACUNGCAP_TEN', 'TAICHINH_NHACUNGCAPDICHVU_TEN'] },
        { k: 'NCC_MA', can: ['NHACUNGCAPDICHVU_MA', 'NHACUNGCAP_MA'] },
        { k: 'PT_TEN', can: ['PHUONGTHUC_TEN', 'TENPHUONGTHUC'] },
        { k: 'PT_MA', can: ['PHUONGTHUC_MA'] },
        { k: 'NGAYCAPNHAT', can: ['NGAYCAPNHAT_DD_MM_YYYY_HHMMSS', 'NGAYCAPNHAT_DD_MM_YYYY_HHMM', 'NGAYCAPNHAT_DD_MM_YYYY', 'NGAYCAPNHAT'] },
        { k: 'NGUOICAPNHAT', can: ['NGUOICAPNHAT_TAIKHOAN', 'NGUOICAPNHAT_TENDAYDU', 'NGUOICAPNHAT_TEN'] },
        { k: 'NGAYTAO', can: ['NGAYTAO_DD_MM_YYYY_HHMMSS', 'NGAYTAO_DD_MM_YYYY_HHMM', 'NGAYTAO_DD_MM_YYYY', 'NGAYTAO'] },
        { k: 'NGUOITAO', can: ['NGUOITAO_TAIKHOAN', 'NGUOITAO_TENDAYDU', 'NGUOITAO_TEN'] }
    ],
    // Ký tự thứ 4 của ký hiệu hóa đơn theo Thông tư 78/2021/TT-BTC
    LOAI_KY_HIEU: {
        T: 'Đơn vị đăng ký sử dụng HĐĐT với cơ quan thuế',
        D: 'Hóa đơn bán tài sản công / hàng dự trữ quốc gia hoặc HĐĐT đặc thù',
        L: 'Cơ quan thuế cấp theo từng lần phát sinh',
        M: 'Khởi tạo từ máy tính tiền',
        N: 'Phiếu xuất kho kiêm vận chuyển nội bộ',
        B: 'Phiếu xuất kho hàng gửi bán đại lý',
        G: 'Tem, vé, thẻ là hóa đơn GTGT',
        H: 'Tem, vé, thẻ là hóa đơn bán hàng'
    },
    REGEX_MST: /^\d{10}(-?\d{3})?$/,
    AVATAR: [
        { bg: '#eef3ff', c: '#223771' }, { bg: '#e6f7fb', c: '#0e7490' }, { bg: '#fff1e8', c: '#c2410c' },
        { bg: '#f3edff', c: '#6d28d9' }, { bg: '#ebf9ef', c: '#15803d' }, { bg: '#fdeef3', c: '#be185d' }
    ],

    dtCauHinh: [],      // các dòng đã chuẩn hóa (chuanHoaDong)
    dtNCC: [],          // danh mục nhà cung cấp
    dtPhuongThuc: [],   // danh mục nút phát hành HĐĐT
    objDM: {},          // trạng thái nạp danh mục: { NHACUNGCAPDICHVU_ID: {da, loi}, PHUONGTHUC_ID: {da, loi} }
    strMode: 'THEM',    // THEM | SUA
    oDong: null,        // dòng đang sửa
    oNguon: null,       // dòng nguồn khi sao chép
    objGoc: {},         // giá trị form lúc mở (để biết đổi gì)
    bMoKhoa: true,
    bDangLuu: false,
    bDaNap: false,
    bLoiNap: false,
    iReq: 0,
    iNamNay: 0,
    strIdFlash: '',
    arrIdTruoc: null,
    bDaCanhBaoCot: false,
    iReqDM: 0,          // lần nạp danh mục (bỏ kết quả của lần cũ)
    objKyDM: {},        // "chữ ký" danh mục lần trước -> chỉ vẽ lại thẻ khi danh mục đổi

    init: function () {
        var me = this;
        me.iNamNay = me.layNamNay();
        me.objKyDM = {};
        me.objDM = {
            NHACUNGCAPDICHVU_ID: { da: false, loi: '' },
            PHUONGTHUC_ID: { da: false, loi: '' }
        };
        me.ganSuKien();
        me.veKpi();
        me.getDanhMuc();
        me.getList();
    },

    /*------------------------------------------
    --Sự kiện
    -------------------------------------------*/
    ganSuKien: function () {
        var me = this;
        var $m = $("#modalChd");

        $("#chdBtnThem").on("click", function () { me.moForm('THEM', null, false); });
        $("#chdBtnTim").on("click", function () { me.getList(); });
        $("#txtChdTuKhoa").on("keypress", function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList();
            }
        });
        $("#dropChdLocNCC").on("change", function () { me.getList(); });
        $("#chdWrap, #modalChd").on("click", ".chd-x", function () {
            $(this).closest(".chd-banner").remove();
        });

        // Thao tác trên thẻ + trạng thái trống
        $("#chdDanhSach").on("click", "[data-act]", function () {
            var $el = $(this);
            if ($el.hasClass("is-disabled")) return;
            var $card = $el.closest(".chd-card");
            var o = me.timDong($card.attr("data-id"));
            switch ($el.attr("data-act")) {
                case "sua": me.moForm('SUA', o, false); break;
                case "saochep": me.moForm('THEM', o, true); break;
                case "xoa":
                    $("#chdDanhSach .chd-card.is-confirm").not($card).removeClass("is-confirm");
                    $card.addClass("is-confirm");
                    break;
                case "huyxoa": $card.removeClass("is-confirm"); break;
                case "xacnhanxoa": me.xoa(o, $card); break;
                case "them": me.moForm('THEM', null, false); break;
                case "xoaloc":
                    $("#txtChdTuKhoa").val("");
                    $("#dropChdLocNCC").val("");
                    me.getList();
                    break;
                case "thulai": me.getList(); break;
            }
        });

        // Form
        $m.on("input change", ".chd-inp", function () {
            var el = this;
            if ($(el).hasClass("chd-upper") && typeof el.value === "string") {
                var up = el.value.toUpperCase();
                if (up !== el.value) {
                    var s = el.selectionStart, t = el.selectionEnd;
                    el.value = up;
                    try { el.setSelectionRange(s, t); } catch (ex) { }
                }
            }
            $(el).closest(".chd-f").removeClass("has-e");
            $m.removeClass("ask-luu");
            me.capNhatForm();
        });
        $m.on("click", ".chd-eye", function () {
            var $i = $(this).siblings("input");
            var bHien = $i.attr("type") === "password";
            $i.attr("type", bHien ? "text" : "password");
            $(this).find("i").attr("class", "fa " + (bHien ? "fa-eye-slash" : "fa-eye"));
        });
        $m.on("click", ".chd-dong", function () { me.dongForm(false); });
        $m.on("click", "#chdCheck li", function () { me.denTruong($(this).attr("data-k")); });
        $("#chkChdMoKhoa").on("change", function () {
            me.bMoKhoa = this.checked;
            if (!me.bMoKhoa) me.traVeGoc(function (f) { return f.kt; });
            me.apKhoa();
            me.capNhatForm();
        });
        $("#chdBtnLuu").on("click", function () { me.luu(false); });
        $("#chdBtnXoaForm").on("click", function () { $m.removeClass("ask-dong ask-luu").addClass("ask-xoa"); });
        $("#chdBtnHuyXoa").on("click", function () { $m.removeClass("ask-xoa"); });
        $("#chdBtnXacNhanXoa").on("click", function () { me.xoa(me.oDong, null); });
        $("#chdBtnBoThayDoi").on("click", function () { me.dongForm(true); });
        $("#chdBtnTiepTuc").on("click", function () { $m.removeClass("ask-dong"); });
        $("#chdBtnVanLuu").on("click", function () { me.luu(true); });
        $("#chdBtnNhapLai").on("click", function () {
            $m.removeClass("ask-luu");
            var k = $(this).attr("data-k");
            if (k) me.denTruong(k);
        });
        $m.on("hidden.bs.modal", function () {
            $m.removeClass("ask-xoa ask-dong ask-luu is-saving");
            // Không để mật khẩu nằm lại trong trang sau khi đóng form
            me.FIELDS.forEach(function (f) {
                if (f.secret) $("#" + f.id).val("").attr("type", "password");
            });
            $m.find(".chd-eye i").attr("class", "fa fa-eye");
        });
    },

    /*------------------------------------------
    --Tiện ích
    -------------------------------------------*/
    esc: function (v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },
    layNamNay: function () {
        try {
            var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(edu.util.dateToday());
            if (m) return parseInt(m[3], 10);
        } catch (ex) { }
        return new Date().getFullYear();
    },
    normKey: function (k) { return String(k == null ? "" : k).toUpperCase().replace(/[^A-Z0-9]/g, ""); },
    layField: function (k) {
        for (var i = 0; i < this.FIELDS.length; i++) if (this.FIELDS[i].k === k) return this.FIELDS[i];
        return null;
    },
    layMang: function (d) {
        if (Array.isArray(d)) return d;
        if (d && typeof d === "object") {
            for (var x in d) if (Array.isArray(d[x])) return d[x];
        }
        return [];
    },
    moTaLoi: function (er) {
        if (!er) return "Lỗi không xác định";
        if (typeof er === "string") return er;
        var m = er.responseJSON && (er.responseJSON.Message || er.responseJSON.message);
        if (!m && er.responseText) {
            try { m = JSON.parse(er.responseText).Message; } catch (ex) { }
        }
        var st = er.status ? "HTTP " + er.status : "Mất kết nối máy chủ";
        return m ? st + ": " + m : st;
    },
    // "TEN (MA)" cho mục danh mục
    nhanDM: function (e) {
        var ten = String(e.TEN == null ? "" : e.TEN).trim(), ma = String(e.MA == null ? "" : e.MA).trim();
        if (ten && ma && ma !== ten) return ten + " (" + ma + ")";
        return ten || ma || String(e.ID || "");
    },
    dsDanhMuc: function (k) { return k === 'PHUONGTHUC_ID' ? this.dtPhuongThuc : this.dtNCC; },
    timDM: function (k, id) {
        if (!id) return null;
        var arr = this.dsDanhMuc(k);
        for (var i = 0; i < arr.length; i++) if (String(arr[i].ID) === String(id)) return arr[i];
        return null;
    },
    timDong: function (id) {
        if (!id) return null;
        for (var i = 0; i < this.dtCauHinh.length; i++) if (String(this.dtCauHinh[i].ID) === String(id)) return this.dtCauHinh[i];
        return null;
    },
    // Ghép tên + mã từ cột của chính dòng (nếu có)
    tenTuDong: function (o, preTen, preMa) {
        if (!o) return "";
        var ten = String(o.v[preTen] || "").trim(), ma = String(o.v[preMa] || "").trim();
        if (ten && ma && ma !== ten) return ten + " (" + ma + ")";
        return ten || ma;
    },
    tenNCC: function (o) {
        var id = o.v.NHACUNGCAPDICHVU_ID;
        var e = this.timDM('NHACUNGCAPDICHVU_ID', id);
        var ten = e ? this.nhanDM(e) : this.tenTuDong(o, 'NCC_TEN', 'NCC_MA');
        if (!ten && id) ten = "Nhà cung cấp chưa có trong danh mục";
        return { ten: ten, chu: e ? String(e.TEN || e.MA || "") : String(o.v.NCC_TEN || "") };
    },
    tenPT: function (o) {
        var e = this.timDM('PHUONGTHUC_ID', o.v.PHUONGTHUC_ID);
        if (e) return this.nhanDM(e);
        var ten = this.tenTuDong(o, 'PT_TEN', 'PT_MA');
        if (!ten && o.v.PHUONGTHUC_ID) ten = "Nút chưa có trong danh mục";
        return ten;
    },
    mauAvatar: function (s) {
        var h = 0;
        s = String(s || "");
        for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return this.AVATAR[h % this.AVATAR.length];
    },
    // Ngày giờ máy chủ: giữ nguyên nếu đã là dd/mm/yyyy; ISO hoặc /Date(x)/ thì đổi sang dd/mm/yyyy HH:mm
    fmtNgay: function (s) {
        s = String(s == null ? "" : s).trim();
        if (!s) return "";
        var d = null, m = /\/Date\((\d+)/.exec(s);
        if (m) d = new Date(parseInt(m[1], 10));
        else if (/^\d{4}-\d{2}-\d{2}T/.test(s)) d = new Date(s);
        if (!d || isNaN(d.getTime())) return s;
        var p = function (n) { return (n < 10 ? "0" : "") + n; };
        return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
    },
    // Ký hiệu 6 ký tự theo TT78: C|K + 2 số năm + chữ loại + 2 ký tự đơn vị tự đặt
    giaiMaKyHieu: function (s) {
        var m = /^([CK])(\d{2})([TDLMNBGH])([A-Z0-9]{2})$/.exec(String(s || "").trim().toUpperCase());
        if (!m) return null;
        return {
            c: m[1], yy: m[2], l: m[3], tu: m[4],
            nam: 2000 + parseInt(m[2], 10),
            coMa: m[1] === 'C' ? 'Có mã của cơ quan thuế' : 'Không có mã của cơ quan thuế',
            loai: this.LOAI_KY_HIEU[m[3]]
        };
    },
    tenLoaiHD: function (s) {
        var t = String(s || "").toUpperCase().replace(/\s/g, "");
        if (/^0?1($|[^0-9])|GTKT|GTGT/.test(t)) return "HÓA ĐƠN GIÁ TRỊ GIA TĂNG";
        if (/^0?2($|[^0-9])|GTTT|BANHANG/.test(t)) return "HÓA ĐƠN BÁN HÀNG";
        return "HÓA ĐƠN ĐIỆN TỬ";
    },

    /*------------------------------------------
    --Gọi API
    -------------------------------------------*/
    goi: function (api, params, fnOk, fnLoi) {
        var me = this;
        var obj = $.extend({ 'action': api.action, 'func': api.func, 'iM': edu.system.iM }, params);
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) fnOk(data);
                else fnLoi((data && data.Message) || "Máy chủ báo không thành công nhưng không kèm lý do");
            },
            error: function (er) { fnLoi(me.moTaLoi(er)); },
            type: "POST",
            action: obj.action,
            contentType: true,
            data: obj,
            fakedb: []
        }, false, false, false, null);
    },
    // Danh mục dữ liệu (cùng hàm với edu.system.loadToCombo_DanhMucDuLieu) nhưng tự vẽ "TEN (MA)" và không bật alert khi lỗi
    taiDanhMuc: function (strMa, fn) {
        var me = this;
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    var arr = me.layMang(data.Data);
                    // In nguyên response để đối chiếu khi danh mục đã khai báo mà trang vẫn báo rỗng
                    if (!arr.length) console.warn("[CauHinhHoaDon] Danh mục " + strMa + " trả về rỗng. Response:", data);
                    fn(arr, "");
                } else {
                    console.warn("[CauHinhHoaDon] Danh mục " + strMa + " lỗi. Response:", data);
                    fn([], (data && data.Message) || "Không rõ lỗi");
                }
            },
            error: function (er) {
                console.warn("[CauHinhHoaDon] Danh mục " + strMa + " lỗi kết nối:", er);
                fn([], me.moTaLoi(er));
            },
            type: "GET",
            action: "CMS_DanhMucThuocTinh/LayDanhSachDuLieuTheoBangDM",
            contentType: true,
            data: { 'strMaBangDanhMuc': strMa, 'strTieuChiSapXep': '', 'dTrangThai': 1 },
            fakedb: []
        }, false, false, false, null);
    },
    // Nạp lúc vào trang VÀ mỗi lần mở form (danh mục vừa khai báo thêm ở tab khác hiện ngay, không cần F5)
    getDanhMuc: function () {
        var me = this, iLan = ++me.iReqDM;
        var xong = function (k, arr, loi) {
            if (iLan !== me.iReqDM) return; // kết quả của lần nạp cũ hơn
            var strKy = JSON.stringify(arr.map(function (e) { return [e.ID, e.MA, e.TEN]; })) + "|" + loi;
            var bDoi = strKy !== me.objKyDM[k];
            me.objKyDM[k] = strKy;
            if (k === "PHUONGTHUC_ID") me.dtPhuongThuc = arr; else me.dtNCC = arr;
            me.objDM[k] = { da: true, loi: loi };
            if (k === "NHACUNGCAPDICHVU_ID") me.veComboLoc();
            me.veSelectForm(k);
            if (bDoi && me.bDaNap) me.veDanhSach();
            me.capNhatForm();
        };
        me.taiDanhMuc(me.MA_DM_NHACUNGCAP, function (arr, loi) { xong("NHACUNGCAPDICHVU_ID", arr, loi); });
        me.taiDanhMuc(me.MA_DM_PHUONGTHUC, function (arr, loi) { xong("PHUONGTHUC_ID", arr, loi); });
    },
    getList: function () {
        var me = this;
        var iReq = ++me.iReq;
        if (!me.bDaNap) me.veKhung();
        $("#chdDanhSach").addClass("is-loading");
        me.goi(me.API.LAYDS, {
            'strTuKhoa': String($("#txtChdTuKhoa").val() || "").trim(),
            'strNhaCungCapDichVu_Id': $("#dropChdLocNCC").val() || ""
        }, function (data) {
            if (iReq !== me.iReq) return;
            var arr = me.layMang(data.Data);
            me.kiemTraCot(arr);
            me.dtCauHinh = arr.map(function (r) { return me.chuanHoaDong(r); });
            me.bDaNap = true;
            me.bLoiNap = false;
            me.veDanhSach();
        }, function (msg) {
            if (iReq !== me.iReq) return;
            me.dtCauHinh = [];
            me.bDaNap = true;
            me.bLoiNap = msg;
            me.veDanhSach();
        });
    },
    // Đọc 1 dòng theo FIELDS + META; co[k] = máy chủ có trả cột đó hay không
    chuanHoaDong: function (row) {
        var me = this, idx = {};
        row = row || {};
        Object.keys(row).forEach(function (k) { idx[me.normKey(k)] = k; });
        var o = { raw: row, v: {}, co: {} };
        me.FIELDS.concat(me.META).forEach(function (f) {
            var cands = [f.k].concat(f.can || []);
            for (var i = 0; i < cands.length; i++) {
                var real = idx[me.normKey(cands[i])];
                if (real !== undefined) {
                    o.co[f.k] = true;
                    o.v[f.k] = row[real] == null ? "" : String(row[real]);
                    return;
                }
            }
            o.co[f.k] = false;
            o.v[f.k] = "";
        });
        o.ID = o.v.ID;
        return o;
    },
    kiemTraCot: function (arr) {
        var me = this;
        if (me.bDaCanhBaoCot || !arr.length) return;
        me.bDaCanhBaoCot = true;
        var o = me.chuanHoaDong(arr[0]);
        var thieu = me.FIELDS.concat([{ k: 'ID' }]).filter(function (f) { return !o.co[f.k]; }).map(function (f) { return f.k; });
        if (thieu.length) {
            console.warn("[CauHinhHoaDon] LayDS_TaiChinh_ThamSoHoaDon không thấy cột: " + thieu.join(", ")
                + "\nCác cột máy chủ trả về: " + Object.keys(arr[0]).join(", "));
        }
    },

    /*------------------------------------------
    --Vẽ trang
    -------------------------------------------*/
    thongBao: function (strLoai, strNoiDung, strNoi) {
        var objIcon = { s: "fa-check-circle", w: "fa-exclamation-triangle", e: "fa-times-circle", i: "fa-info-circle" };
        var $b = $('<div class="chd-banner ' + (strLoai === "i" ? "" : strLoai) + '"></div>');
        $b.append('<i class="fa ' + (objIcon[strLoai] || objIcon.i) + '"></i>');
        $b.append($('<div class="tx"></div>').text(strNoiDung));
        $b.append('<span class="x chd-x" title="Ẩn">&times;</span>');
        $(strNoi || "#chdThongBao").html($b);
        if (strLoai === "s") {
            setTimeout(function () { $b.fadeOut(300, function () { $b.remove(); }); }, 10000);
        }
        return $b;
    },
    thongBaoForm: function (strLoai, strNoiDung) {
        this.thongBao(strLoai, strNoiDung, "#chdModalThongBao");
        $("#modalChd").scrollTop(0);
    },
    veKpi: function () {
        var me = this, arr = me.dtCauHinh;
        var n = arr.length, du = 0, thieu = 0, cb = 0;
        arr.forEach(function (o) {
            var dg = me.danhGia(o.v, o.co);
            if (dg.thieu.length) thieu++; else du++;
            if (dg.canhBao.length) cb++;
        });
        var chua = !me.bDaNap || me.bLoiNap;
        var items = [
            { ic: "fa-file-text-o", c: "#2f55a4", bg: "#eef3ff", v: n, l: "Cấu hình hóa đơn" },
            { ic: "fa-check-circle", c: "#16a34a", bg: "#ecfdf3", v: du, l: "Đủ thông số phát hành" },
            { ic: "fa-exclamation-circle", c: "#d97706", bg: "#fffbeb", v: thieu, l: "Còn thiếu thông số" },
            { ic: "fa-bell-o", c: "#dc2626", bg: "#fef2f2", v: cb, l: "Cần kiểm tra lại" }
        ];
        $("#chdKpi").html(items.map(function (x) {
            return '<div class="chd-kpi" style="--c:' + x.c + ';--bg:' + x.bg + '">'
                + '<div class="ic"><i class="fa ' + x.ic + '"></i></div>'
                + '<div><div class="v">' + (chua ? "—" : x.v) + '</div><div class="l">' + x.l + '</div></div></div>';
        }).join(""));
    },
    veKhung: function () {
        $("#chdDanhSach").html('<div class="chd-skel"></div><div class="chd-skel"></div><div class="chd-skel"></div>');
    },
    coLoc: function () {
        return !!(String($("#txtChdTuKhoa").val() || "").trim() || $("#dropChdLocNCC").val());
    },
    veComboLoc: function () {
        var me = this, $s = $("#dropChdLocNCC"), cur = $s.val() || "", da = {};
        var html = '<option value="">Tất cả nhà cung cấp</option>';
        me.dtNCC.forEach(function (e) {
            da[String(e.ID)] = 1;
            html += '<option value="' + me.esc(e.ID) + '">' + me.esc(me.nhanDM(e)) + '</option>';
        });
        // Nhà cung cấp có trong dữ liệu nhưng không có trong danh mục (danh mục chưa nạp được / đã ngừng dùng)
        me.dtCauHinh.forEach(function (o) {
            var id = o.v.NHACUNGCAPDICHVU_ID;
            if (!id || da[id]) return;
            da[id] = 1;
            html += '<option value="' + me.esc(id) + '">' + me.esc(me.tenTuDong(o, 'NCC_TEN', 'NCC_MA') || "Nhà cung cấp chưa có trong danh mục") + '</option>';
        });
        $s.html(html);
        $s.val(da[cur] ? cur : "");
    },
    veDanhSach: function () {
        var me = this, $g = $("#chdDanhSach").removeClass("is-loading");
        me.veKpi();
        me.veComboLoc();
        var n = me.dtCauHinh.length;
        $("#chdDem").html(me.bLoiNap ? "" : '<b>' + n + '</b> cấu hình' + (me.coLoc() ? ' · đang lọc' : ''));

        if (me.bLoiNap) {
            $g.html('<div class="chd-panel chd-empty">'
                + '<div class="chd-empty-ic" style="background:#fef2f2;color:#dc2626"><i class="fa fa-plug"></i></div>'
                + '<h3>Không tải được danh sách cấu hình</h3>'
                + '<p>' + me.esc(me.bLoiNap) + '</p>'
                + '<a class="chd-act is-primary" data-act="thulai"><i class="fa fa-refresh"></i> Thử lại</a></div>');
            return;
        }
        if (!n) {
            $g.html(me.coLoc() ? me.htmlKhongThay() : me.htmlTrong());
            return;
        }
        if (me.dtCauHinh.some(function (o) { return !o.ID; })) {
            me.thongBao("e", "Danh sách cấu hình không có cột ID nên không sửa / xóa được. Báo bộ phận phát triển kiểm tra hàm LayDS_TaiChinh_ThamSoHoaDon.");
        }
        $g.html(me.dtCauHinh.map(function (o) { return me.htmlThe(o); }).join(""));

        // Làm nổi thẻ vừa lưu
        var arrFlash = [];
        if (me.strIdFlash) arrFlash.push(me.strIdFlash);
        if (me.arrIdTruoc) {
            var objTruoc = {};
            me.arrIdTruoc.forEach(function (id) { objTruoc[id] = 1; });
            me.dtCauHinh.forEach(function (o) { if (o.ID && !objTruoc[o.ID]) arrFlash.push(o.ID); });
        }
        me.strIdFlash = "";
        me.arrIdTruoc = null;
        arrFlash.forEach(function (id, i) {
            var el = $g.children(".chd-card").filter(function () { return $(this).attr("data-id") === String(id); })[0];
            if (!el) return;
            el.classList.add("is-flash");
            if (i === 0 && el.scrollIntoView) {
                var r = el.getBoundingClientRect();
                if (r.top < 0 || r.bottom > (window.innerHeight || 0)) el.scrollIntoView({ block: "center" });
            }
        });
    },
    htmlTrong: function () {
        return '<div class="chd-panel chd-empty">'
            + '<div class="chd-empty-ic"><i class="fa fa-file-text-o"></i></div>'
            + '<h3>Chưa có cấu hình hóa đơn điện tử</h3>'
            + '<p>Khai báo một cấu hình cho mỗi nút phát hành HĐĐT mà đơn vị dùng. Sau khi lưu, cán bộ thu tiền bấm nút đó là hệ thống tự phát hành hóa đơn theo thông số ở đây.</p>'
            + '<a class="chd-act is-primary" data-act="them" style="height:42px;padding:0 20px"><i class="fa fa-plus"></i> Thêm cấu hình đầu tiên</a>'
            + '<div class="chd-steps">'
            + '<div class="chd-step"><span class="chd-step-no">1</span><div><b>Nhà cung cấp &amp; nút phát hành</b>Chọn đơn vị cung cấp HĐĐT và nút phát hành tương ứng trên màn Thu tiền.</div></div>'
            + '<div class="chd-step"><span class="chd-step-no">2</span><div><b>Đơn vị bán hàng</b>Tên, mã số thuế, địa chỉ đúng như đăng ký với cơ quan thuế.</div></div>'
            + '<div class="chd-step"><span class="chd-step-no">3</span><div><b>Kết nối &amp; ký hiệu</b>Máy chủ, tài khoản do nhà cung cấp cấp; mẫu số và ký hiệu hóa đơn.</div></div>'
            + '</div></div>';
    },
    htmlKhongThay: function () {
        return '<div class="chd-panel chd-empty">'
            + '<div class="chd-empty-ic"><i class="fa fa-search"></i></div>'
            + '<h3>Không tìm thấy cấu hình phù hợp</h3>'
            + '<p>Thử từ khóa khác hoặc bỏ lọc nhà cung cấp.</p>'
            + '<a class="chd-act" data-act="xoaloc"><i class="fa fa-eraser"></i> Xóa bộ lọc</a></div>';
    },
    giaTri: function (s, strTrong) {
        s = String(s == null ? "" : s).trim();
        return s ? this.esc(s) : '<span class="chd-na">' + (strTrong || "—") + '</span>';
    },
    // Hiển thị ô bí mật trên thẻ: không bao giờ hiện giá trị thật
    giaTriBiMat: function (o, k, strTrong) {
        if (!o.co[k]) return '<span class="chd-na">không hiển thị</span>';
        if (!String(o.v[k] || "")) return '<span class="chd-na">' + strTrong + '</span>';
        return '<span class="chd-dot">••••••</span>';
    },
    htmlThe: function (o) {
        var me = this, v = o.v;
        var dg = me.danhGia(v, o.co);
        var ncc = me.tenNCC(o), pt = me.tenPT(o);
        var av = me.mauAvatar(ncc.chu || ncc.ten || "x");
        var chu = String(ncc.chu || "").trim().charAt(0).toUpperCase();
        var pct = dg.tong ? Math.round(dg.du * 100 / dg.tong) : 0;
        var strThieu = dg.thieu.map(function (f) { return f.ten; }).join(", ");
        var bId = !!o.ID;

        var pill = dg.thieu.length
            ? '<span class="chd-pill warn" title="Còn thiếu: ' + me.esc(strThieu) + '"><i class="fa fa-exclamation-circle"></i> Thiếu ' + dg.thieu.length + ' thông số</span>'
            : '<span class="chd-pill ok"><i class="fa fa-check-circle"></i> Đủ thông số</span>';

        var kv = function (l, vHtml, strTitle) {
            return '<div class="chd-kv"><span class="l">' + l + '</span><span class="v"' + (strTitle ? ' title="' + me.esc(strTitle) + '"' : '') + '>' + vHtml + '</span></div>';
        };
        var arrLoai = [v.INVOICETYPE, v.CURRENCYCODE].filter(function (x) { return String(x || "").trim(); });
        var strMayChu = String(v.HOST || "").trim();
        var strXacThuc = String(v.LOAIXACTHUC || "").trim();
        var htmlXacThuc = strXacThuc ? me.esc(strXacThuc) : "";
        if (o.co.MAXACTHUC && v.MAXACTHUC) htmlXacThuc += (htmlXacThuc ? " · " : "") + "có mã xác thực";
        var htmlKySo = (o.co.PINCODE ? (v.PINCODE ? "Có mã PIN" : '<span class="chd-na">Chưa có mã PIN</span>') : "")
            + (String(v.SIGNXML_HOST || "").trim() ? (o.co.PINCODE ? " · " : "") + me.esc(v.SIGNXML_HOST) : "");

        var meta = "";
        if (v.NGAYCAPNHAT) meta = "Cập nhật " + me.fmtNgay(v.NGAYCAPNHAT) + (v.NGUOICAPNHAT ? " · " + v.NGUOICAPNHAT : "");
        else if (v.NGAYTAO) meta = "Tạo " + me.fmtNgay(v.NGAYTAO) + (v.NGUOITAO ? " · " + v.NGUOITAO : "");

        var h = '<div class="chd-card" data-id="' + me.esc(o.ID) + '">';
        h += '<div class="chd-card-top">'
            + '<div class="chd-avatar" style="--av-bg:' + av.bg + ';--av-c:' + av.c + '">' + (chu ? me.esc(chu) : '<i class="fa fa-building-o"></i>') + '</div>'
            + '<div class="chd-top-txt">'
            + '<div class="chd-ncc" title="' + me.esc(ncc.ten) + '">' + (ncc.ten ? me.esc(ncc.ten) : '<span class="chd-na">Chưa chọn nhà cung cấp</span>') + '</div>'
            + '<div class="chd-pt" title="' + me.esc(pt) + '"><i class="fa fa-bolt"></i>' + (pt ? me.esc(pt) : '<span class="chd-na">Chưa gắn nút phát hành</span>') + '</div>'
            + '</div>' + pill + '</div>';

        h += '<div class="chd-dv">'
            + '<div class="chd-dv-ten"' + (bId ? ' data-act="sua" title="Bấm để sửa"' : '') + '>' + me.giaTri(v.TENDONVI, "Chưa có tên đơn vị") + '</div>'
            + '<div class="chd-dv-sub"><span><i class="fa fa-id-card-o"></i>MST: ' + me.giaTri(v.MASOTHUEDONVI) + '</span>'
            + '<span><i class="fa fa-phone"></i>' + me.giaTri(v.SODIENTHOAIDONVI) + '</span></div>'
            + (String(v.DIACHIDONVI || "").trim() ? '<div class="chd-dv-dc" title="' + me.esc(v.DIACHIDONVI) + '"><i class="fa fa-map-marker"></i> ' + me.esc(v.DIACHIDONVI) + '</div>' : '')
            + '</div>';

        h += '<div class="chd-codes">'
            + '<div class="chd-code"><div class="l">Mẫu số</div><div class="v" title="' + me.esc(v.TEMPLATECODE) + '">' + me.giaTri(v.TEMPLATECODE) + '</div></div>'
            + '<div class="chd-code"><div class="l">Ký hiệu</div><div class="v" title="' + me.esc(v.INVOICESERIES) + '">' + me.giaTri(v.INVOICESERIES) + '</div></div>'
            + '</div>';

        h += '<div class="chd-kvs">'
            + kv("Loại · tiền tệ", arrLoai.length ? me.esc(arrLoai.join(" · ")) : '<span class="chd-na">—</span>')
            + kv("Máy chủ", me.giaTri(strMayChu), strMayChu + String(v.API || ""))
            + kv("Xác thực", htmlXacThuc || '<span class="chd-na">—</span>')
            + kv("Tài khoản", me.giaTri(v.USERNAME, "Chưa có tài khoản") + " · " + me.giaTriBiMat(o, "PASSWORD", "chưa có mật khẩu"))
            + kv("Ký số", htmlKySo || '<span class="chd-na">—</span>')
            + '</div>';

        h += '<div class="chd-prog"><div class="chd-prog-bar"><span style="width:' + pct + '%;--c:' + (dg.thieu.length ? '#2f55a4' : '#16a34a') + '"></span></div>'
            + '<div class="chd-prog-cap"><span>' + (dg.thieu.length ? 'Thiếu: ' + me.esc(strThieu) : 'Đã nhập đủ thông số để phát hành') + '</span><span><b>' + dg.du + '/' + dg.tong + '</b></span></div></div>';

        if (dg.canhBao.length) {
            h += '<ul class="chd-warns">' + dg.canhBao.map(function (x) { return '<li><i class="fa fa-exclamation-triangle"></i>' + me.esc(x) + '</li>'; }).join("") + '</ul>';
        }

        var strKhongId = bId ? '' : ' is-disabled" title="Thiếu ID cấu hình';
        h += '<div class="chd-card-foot">'
            + '<div class="chd-foot-normal">'
            + '<a class="chd-act is-primary' + strKhongId + '" data-act="sua"><i class="fa fa-pencil"></i> Sửa</a>'
            + '<a class="chd-act" data-act="saochep" title="Tạo cấu hình mới từ cấu hình này"><i class="fa fa-clone"></i> Sao chép</a>'
            + '<span class="chd-meta" title="' + me.esc(meta) + '">' + me.esc(meta) + '</span>'
            + '<a class="chd-act is-danger' + strKhongId + '" data-act="xoa"><i class="fa fa-trash-o"></i> Xóa</a>'
            + '</div>'
            + '<div class="chd-foot-confirm">'
            + '<span class="chd-confirm-tx"><i class="fa fa-exclamation-triangle"></i> Xóa cấu hình này?</span>'
            + '<a class="chd-act" data-act="huyxoa">Không xóa</a>'
            + '<a class="chd-act is-danger-solid" data-act="xacnhanxoa"><i class="fa fa-trash"></i> Xóa</a>'
            + '</div></div>';
        h += '</div>';
        return h;
    },

    /*------------------------------------------
    --Đánh giá mức đầy đủ (chỉ kiểm tra đã nhập, không kiểm tra đúng/sai với nhà cung cấp)
    --co: cột máy chủ có trả (null = đang ở form, mọi ô đều đọc được)
    -------------------------------------------*/
    danhGia: function (v, co) {
        var me = this, thieu = [], tong = 0, canhBao = [];
        me.FIELDS.forEach(function (f) {
            if (!f.need) return;
            if (co && f.secret && !co[f.k]) return; // máy chủ không trả cột bí mật -> không đánh giá
            tong++;
            if (!String(v[f.k] || "").trim()) thieu.push(f);
        });
        var strMst = String(v.MASOTHUEDONVI || "").replace(/\s+/g, "");
        if (strMst && !me.REGEX_MST.test(strMst)) canhBao.push("Mã số thuế không đúng dạng 10 số / 10 số - 3 số");
        var kh = me.giaiMaKyHieu(v.INVOICESERIES);
        if (kh && kh.nam < me.iNamNay) canhBao.push("Ký hiệu " + String(v.INVOICESERIES).toUpperCase() + " là của năm " + kh.nam + " — năm " + me.iNamNay + " cần ký hiệu mới");
        if (String(v.HOST || "").trim() && !/^https?:\/\//i.test(String(v.HOST).trim())) canhBao.push("Máy chủ HĐĐT thiếu http:// hoặc https://");
        return { thieu: thieu, tong: tong, du: tong - thieu.length, canhBao: canhBao };
    },
    // Cảnh báo mềm theo từng ô (không chặn lưu, trừ MST lúc bấm Lưu)
    kiemTraTruong: function (v) {
        var me = this, r = {};
        var strMst = v.MASOTHUEDONVI;
        if (strMst && !me.REGEX_MST.test(strMst)) r.MASOTHUEDONVI = "Mã số thuế gồm 10 số, hoặc 10 số - 3 số.";
        ["HOST", "SIGNXML_HOST"].forEach(function (k) {
            if (v[k] && !/^https?:\/\//i.test(v[k])) r[k] = "Thiếu http:// hoặc https:// ở đầu.";
        });
        if (v.INVOICESERIES) {
            var kh = me.giaiMaKyHieu(v.INVOICESERIES);
            if (!kh) r.INVOICESERIES = "Không theo dạng 6 ký tự của Thông tư 78 (VD: C" + String(me.iNamNay).slice(2) + "TAA). Nếu nhà cung cấp dùng dạng khác thì bỏ qua.";
            else if (kh.nam < me.iNamNay) r.INVOICESERIES = "Ký hiệu đang là năm " + kh.nam + ". Năm " + me.iNamNay + " thường dùng " + kh.c + String(me.iNamNay).slice(2) + kh.l + kh.tu + ".";
            else if (kh.nam > me.iNamNay) r.INVOICESERIES = "Ký hiệu của năm " + kh.nam + " (chưa tới năm này).";
        }
        // Danh mục không nạp được / rỗng
        ["NHACUNGCAPDICHVU_ID", "PHUONGTHUC_ID"].forEach(function (k) {
            if (r[k]) return;
            var dm = me.objDM[k], ma = k === "PHUONGTHUC_ID" ? me.MA_DM_PHUONGTHUC : me.MA_DM_NHACUNGCAP;
            if (!dm || !dm.da) return;
            if (dm.loi) r[k] = "Không tải được danh mục " + ma + ": " + dm.loi;
            else if (!me.dsDanhMuc(k).length) r[k] = "Danh mục " + ma + " chưa có dữ liệu — nhờ quản trị khai báo ở Danh mục dữ liệu.";
        });
        return r;
    },

    /*------------------------------------------
    --Form
    -------------------------------------------*/
    // Vẽ lại ô chọn danh mục trên form, giữ giá trị đang chọn; giá trị không còn trong danh mục vẫn giữ để lưu không bị mất
    veSelectForm: function (k, valChon) {
        var me = this, f = me.layField(k), $s = $("#" + f.id);
        var cur = valChon !== undefined ? String(valChon || "") : String($s.val() || "");
        var arr = me.dsDanhMuc(k), co = false;
        var html = '<option value="">' + (k === "PHUONGTHUC_ID" ? "— Chọn nút phát hành —" : "— Chọn nhà cung cấp —") + '</option>';
        arr.forEach(function (e) {
            if (String(e.ID) === cur) co = true;
            html += '<option value="' + me.esc(e.ID) + '">' + me.esc(me.nhanDM(e)) + '</option>';
        });
        if (cur && !co) {
            var o = me.oDong || me.oNguon;
            var ten = k === "PHUONGTHUC_ID" ? me.tenTuDong(o, 'PT_TEN', 'PT_MA') : me.tenTuDong(o, 'NCC_TEN', 'NCC_MA');
            html += '<option value="' + me.esc(cur) + '">' + me.esc((ten || "Mục đang dùng") + " — không còn trong danh mục") + '</option>';
        }
        $s.html(html).val(cur);
    },
    docForm: function () {
        var me = this, v = {};
        me.FIELDS.forEach(function (f) {
            var s = $("#" + f.id).val();
            s = s == null ? "" : String(s);
            if (!f.secret) s = s.trim();
            if (f.k === "MASOTHUEDONVI") s = s.replace(/\s+/g, "");
            v[f.k] = s;
        });
        return v;
    },
    dsThayDoi: function (v) {
        var me = this;
        return me.FIELDS.filter(function (f) { return String(v[f.k]) !== String(me.objGoc[f.k] == null ? "" : me.objGoc[f.k]); });
    },
    traVeGoc: function (fnLoc) {
        var me = this;
        me.FIELDS.forEach(function (f) {
            if (fnLoc(f)) $("#" + f.id).val(me.objGoc[f.k] == null ? "" : me.objGoc[f.k]);
        });
    },
    apKhoa: function () {
        var me = this, bSua = me.strMode === "SUA", bKhoa = bSua && !me.bMoKhoa;
        $("#modalChd").toggleClass("is-locked", bKhoa);
        me.FIELDS.forEach(function (f) {
            if (!f.kt) return;
            var $i = $("#" + f.id);
            $i.prop("disabled", bKhoa);
            $i.closest(".chd-f").find(".chd-eye").prop("disabled", bKhoa);
        });
        $("#chdLockBar").toggle(bSua).toggleClass("is-open", bSua && me.bMoKhoa);
        $("#chdLockIc").attr("class", "fa " + (me.bMoKhoa ? "fa-unlock-alt" : "fa-lock"));
        $("#chdLockTx").html(me.bMoKhoa
            ? "<b>Đang mở khóa thông số kết nối.</b> Nếu đổi các ô này, khi lưu hệ thống ghi lại toàn bộ cấu hình. Tắt khóa để trả các ô về giá trị cũ."
            : "<b>Thông số kết nối đang khóa</b> (nhà cung cấp, nút phát hành, máy chủ, xác thực, loại hóa đơn, mẫu số, tiền tệ) để tránh sửa nhầm. Chỉ mở khi nhà cung cấp HĐĐT yêu cầu thay đổi.");
        $("#chkChdMoKhoa").prop("checked", me.bMoKhoa);
    },
    moForm: function (strMode, o, bSaoChep) {
        var me = this, $m = $("#modalChd");
        if (strMode === "SUA" && (!o || !o.ID)) {
            me.thongBao("e", "Không xác định được cấu hình cần sửa (thiếu ID). Tải lại trang rồi thử lại.");
            return;
        }
        me.getDanhMuc();
        me.strMode = strMode;
        me.oDong = strMode === "SUA" ? o : null;
        me.oNguon = o || null;
        me.bMoKhoa = strMode !== "SUA";
        me.bDangLuu = false;
        $m.removeClass("ask-xoa ask-dong ask-luu is-saving");
        $("#chdModalThongBao").empty();
        $m.find(".chd-f").removeClass("has-e has-w");
        $m.find(".chd-msg").text("");

        // Điền giá trị
        me.FIELDS.forEach(function (f) {
            var val = o ? String(o.v[f.k] || "") : (f.k === "CURRENCYCODE" ? "VND" : "");
            var $i = $("#" + f.id);
            if ($i.is("select")) {
                me.veSelectForm(f.k, val);
            } else {
                $i.val(val);
            }
            if (f.secret) {
                $i.attr("type", "password");
                var bThieu = strMode === "SUA" && o && !o.co[f.k];
                $i.attr("placeholder", bThieu ? "Máy chủ không trả lại giá trị đã lưu" : "");
            }
        });
        $m.find(".chd-eye i").attr("class", "fa fa-eye");

        var ten = o ? String(o.v.TENDONVI || "").trim() : "", mst = o ? String(o.v.MASOTHUEDONVI || "").trim() : "";
        var strTen = (ten || "Chưa có tên đơn vị") + (mst ? " (" + mst + ")" : "");
        $("#chdModalTitle").text(strMode === "SUA" ? "Sửa cấu hình: " + strTen : (bSaoChep ? "Thêm cấu hình (sao chép từ " + strTen + ")" : "Thêm cấu hình hóa đơn"));
        $("#chdFootXoa").toggle(strMode === "SUA");
        $("#chdBtnLuu").html('<i class="fa fa-check-circle"></i> ' + (strMode === "SUA" ? "Lưu thay đổi" : "Lưu cấu hình"));

        if (bSaoChep) {
            me.thongBaoForm("i", "Đang sao chép từ cấu hình có sẵn. Đổi nút phát hành / ký hiệu cho phù hợp rồi lưu thành cấu hình mới — cấu hình cũ giữ nguyên.");
        } else if (strMode === "SUA") {
            var arrAn = me.FIELDS.filter(function (f) { return f.secret && !o.co[f.k]; }).map(function (f) { return f.ten.toLowerCase(); });
            if (arrAn.length) me.thongBaoForm("i", "Máy chủ không trả lại " + arrAn.join(", ") + " đã lưu nên các ô này đang trống. Nếu lần lưu này có ghi các ô đó, trang sẽ hỏi lại trước khi lưu.");
        }

        me.apKhoa();
        me.objGoc = me.docForm();
        me.capNhatForm();
        $m.one("shown.bs.modal", function () {
            var $f = $("#" + (strMode === "SUA" ? "txtChdTenDonVi" : "dropChdNCC"));
            try { $f.trigger("focus"); } catch (ex) { }
        });
        $m.modal("show");
        $m.scrollTop(0);
    },
    capNhatForm: function () {
        var me = this, v = me.docForm();
        var r = me.kiemTraTruong(v);

        // Cảnh báo theo ô (lỗi đỏ do bấm Lưu giữ nguyên tới khi sửa ô đó)
        me.FIELDS.forEach(function (f) {
            var $f = $("#" + f.id).closest(".chd-f");
            if ($f.hasClass("has-e")) return;
            $f.toggleClass("has-w", !!r[f.k]);
            $f.find(".chd-msg").text(r[f.k] || "");
        });

        // Danh sách thông số cần để phát hành
        var dg = me.danhGia(v, null);
        $("#chdTienDo").text(dg.du + "/" + dg.tong);
        $("#chdTienDoBar").css({ width: (dg.tong ? Math.round(dg.du * 100 / dg.tong) : 0) + "%" })[0].style.setProperty("--c", dg.thieu.length ? "#2f55a4" : "#16a34a");
        $("#chdCheck").html(me.FIELDS.filter(function (f) { return f.need; }).map(function (f) {
            var bCo = !!String(v[f.k] || "").trim();
            var cls = !bCo ? "miss" : (r[f.k] ? "warn" : "ok");
            var ic = !bCo ? "fa-circle-o" : (r[f.k] ? "fa-exclamation-circle" : "fa-check-circle");
            return '<li class="' + cls + '" data-k="' + f.k + '"' + (r[f.k] ? ' title="' + me.esc(r[f.k]) + '"' : '') + '><i class="fa ' + ic + '"></i><span>' + me.esc(f.ten) + '</span></li>';
        }).join(""));

        // Khối đã xong: đủ các ô cần; khối không có ô cần thì xong khi có nhập
        $("#modalChd .chd-sec").each(function () {
            var sec = parseInt($(this).attr("data-sec"), 10);
            var arr = me.FIELDS.filter(function (f) { return f.sec === sec; });
            var arrCan = arr.filter(function (f) { return f.need; });
            var bXong = arrCan.length
                ? arrCan.every(function (f) { return !!String(v[f.k] || "").trim(); })
                : arr.some(function (f) { return !!String(v[f.k] || "").trim(); });
            $(this).toggleClass("is-done", bXong);
        });

        me.veXemTruoc(v);
        me.veGoiYLuu(v);
    },
    veXemTruoc: function (v) {
        var me = this;
        var ph = function (x, strTrong) { return String(x || "").trim() ? me.esc(x) : '<span class="ph">' + strTrong + '</span>'; };
        var row = function (l, vHtml) { return '<div class="chd-inv-row"><span class="l">' + l + '</span><span class="v">' + vHtml + '</span></div>'; };
        $("#chdXemTruoc").html(
            '<div class="chd-inv-codes"><span>Mẫu số: <b>' + ph(v.TEMPLATECODE, "...") + '</b></span><span>Ký hiệu: <b>' + ph(v.INVOICESERIES, "...") + '</b></span><span>Số: <span class="ph">cấp khi phát hành</span></span></div>'
            + '<div class="chd-inv-title">' + me.tenLoaiHD(v.INVOICETYPE) + '</div>'
            + '<div class="chd-inv-sub">(Bản thể hiện của hóa đơn điện tử)</div>'
            + '<div class="chd-inv-div"></div>'
            + row("Đơn vị bán hàng", ph(v.TENDONVI, "Tên đơn vị"))
            + row("Mã số thuế", ph(v.MASOTHUEDONVI, "Mã số thuế"))
            + row("Địa chỉ", ph(v.DIACHIDONVI, "Địa chỉ"))
            + row("Điện thoại", ph(v.SODIENTHOAIDONVI, "Số điện thoại"))
            + '<div class="chd-inv-div"></div>'
            + row("Người mua", '<span class="ph">Lấy theo người nộp tiền khi thu</span>')
            + row("Đồng tiền", ph(v.CURRENCYCODE, "VND"))
        );
        var $k = $("#chdKyHieu").removeClass("w");
        var s = String(v.INVOICESERIES || "").trim();
        if (!s) { $k.empty(); return; }
        var kh = me.giaiMaKyHieu(s);
        if (!kh) {
            $k.addClass("w").html('<i class="fa fa-exclamation-triangle"></i> Ký hiệu <b>' + me.esc(s) + '</b> không theo dạng 6 ký tự của Thông tư 78 — kiểm tra lại với nhà cung cấp.');
            return;
        }
        $k.toggleClass("w", kh.nam !== me.iNamNay).html(
            '<div><span class="k">' + kh.c + '</span>' + kh.coMa + '</div>'
            + '<div><span class="k">' + kh.yy + '</span>Năm lập hóa đơn ' + kh.nam + (kh.nam !== me.iNamNay ? ' <b>(khác năm ' + me.iNamNay + ')</b>' : '') + '</div>'
            + '<div><span class="k">' + kh.l + '</span>' + me.esc(kh.loai) + '</div>'
            + '<div><span class="k">' + kh.tu + '</span>' + (kh.tu === "YY" ? "Không dùng phần tự đặt" : "Do đơn vị tự đặt") + '</div>'
        );
    },
    // Cho biết lần lưu này gọi hàm nào
    veGoiYLuu: function (v) {
        var me = this, $h = $("#chdSaveHint");
        if (me.strMode !== "SUA") { $h.html(""); return; }
        var ds = me.dsThayDoi(v);
        if (!ds.length) { $h.html("Chưa có thay đổi"); return; }
        var bMot = ds.every(function (f) { return f.mot; });
        $h.html("<b>" + ds.length + "</b> thay đổi · " + (bMot ? "lưu thông tin cơ bản" : "lưu toàn bộ cấu hình"))
            .attr("title", "Đã đổi: " + ds.map(function (f) { return f.ten; }).join(", "));
    },
    denTruong: function (k) {
        var me = this, f = me.layField(k);
        if (!f) return;
        var $i = $("#" + f.id);
        if ($i.prop("disabled")) {
            me.bMoKhoa = true;
            me.apKhoa();
        }
        var el = $i.closest(".chd-f")[0];
        if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(function () { try { $i.trigger("focus"); } catch (ex) { } }, 250);
    },
    datLoi: function (k, msg) {
        var f = this.layField(k), $f = $("#" + f.id).closest(".chd-f");
        $f.removeClass("has-w").addClass("has-e");
        $f.find(".chd-msg").text(msg);
    },
    dongForm: function (bEp) {
        var me = this, $m = $("#modalChd");
        if (me.bDangLuu) return;
        if (!bEp && me.dsThayDoi(me.docForm()).length) {
            $m.removeClass("ask-xoa ask-luu").addClass("ask-dong");
            return;
        }
        $m.removeClass("ask-xoa ask-dong ask-luu");
        $m.modal("hide");
    },

    /*------------------------------------------
    --Lưu / Xóa
    -------------------------------------------*/
    luu: function (bBoQuaBiMat) {
        var me = this, $m = $("#modalChd");
        if (me.bDangLuu) return;
        var v = me.docForm(), arrLoi = [];
        $m.find(".chd-f.has-e").removeClass("has-e");
        me.capNhatForm();

        if (!v.TENDONVI) arrLoi.push({ k: "TENDONVI", msg: "Nhập tên đơn vị." });
        if (!v.MASOTHUEDONVI) arrLoi.push({ k: "MASOTHUEDONVI", msg: "Nhập mã số thuế." });
        else if (!me.REGEX_MST.test(v.MASOTHUEDONVI)) arrLoi.push({ k: "MASOTHUEDONVI", msg: "Mã số thuế phải gồm 10 số, hoặc 10 số - 3 số." });
        if (arrLoi.length) {
            arrLoi.forEach(function (x) { me.datLoi(x.k, x.msg); });
            me.thongBaoForm("e", "Chưa lưu được: còn " + arrLoi.length + " ô cần sửa (viền đỏ).");
            me.denTruong(arrLoi[0].k);
            return;
        }

        var api, arrGui;
        if (me.strMode === "SUA") {
            var ds = me.dsThayDoi(v);
            if (!ds.length) {
                me.thongBaoForm("i", "Chưa có thay đổi nào để lưu.");
                return;
            }
            var bMot = ds.every(function (f) { return f.mot; });
            api = bMot ? me.API.SUA_MOT : me.API.SUA;
            arrGui = me.FIELDS.filter(function (f) { return bMot ? f.mot : true; });
            // Ô bí mật máy chủ không trả về mà đang trống: lưu sẽ ghi rỗng => hỏi lại
            var arrTrong = arrGui.filter(function (f) { return f.secret && !me.oDong.co[f.k] && !v[f.k]; });
            if (arrTrong.length && !bBoQuaBiMat) {
                $("#chdAskLuuTx").html('<i class="fa fa-exclamation-circle"></i> Máy chủ không trả lại <b>' + me.esc(arrTrong.map(function (f) { return f.ten.toLowerCase(); }).join(", "))
                    + '</b> đã lưu. Lưu bây giờ sẽ ghi các ô đó thành rỗng.');
                $("#chdBtnNhapLai").attr("data-k", arrTrong[0].k);
                $m.removeClass("ask-xoa ask-dong").addClass("ask-luu");
                return;
            }
        } else {
            api = me.API.THEM;
            arrGui = me.FIELDS;
        }

        var p = {};
        arrGui.forEach(function (f) { p[f.p] = v[f.k]; });
        if (me.strMode === "SUA") {
            p.strID = me.oDong.ID;
            p.strNguoiCapNhat_Id = edu.system.userId;
        } else {
            p.strID = "";
            p.strNguoiTao_Id = edu.system.userId;
        }

        var bSua = me.strMode === "SUA", bMotSoCot = api === me.API.SUA_MOT;
        var arrIdTruoc = me.dtCauHinh.map(function (o) { return o.ID; });
        me.bDangLuu = true;
        $m.removeClass("ask-luu").addClass("is-saving");
        me.goi(api, p, function () {
            me.bDangLuu = false;
            $m.removeClass("is-saving");
            var dg = me.danhGia(v, null);
            var msg = (bSua ? "Đã lưu thay đổi cấu hình \"" : "Đã thêm cấu hình \"") + v.TENDONVI + "\"" + (bMotSoCot ? " (thông tin cơ bản)" : "") + ".";
            if (dg.thieu.length) msg += " Còn thiếu để phát hành: " + dg.thieu.map(function (f) { return f.ten; }).join(", ") + ".";
            me.strIdFlash = bSua ? me.oDong.ID : "";
            me.arrIdTruoc = bSua ? null : arrIdTruoc;
            me.dongForm(true);
            me.thongBao(dg.thieu.length ? "w" : "s", msg);
            me.getList();
        }, function (msg) {
            me.bDangLuu = false;
            $m.removeClass("is-saving");
            me.thongBaoForm("e", "Lưu không thành công: " + msg);
        });
    },
    // $card: xóa từ thẻ; null: xóa trong form
    xoa: function (o, $card) {
        var me = this, $m = $("#modalChd");
        if (!o || !o.ID || me.bDangLuu) return;
        var strTen = String(o.v.TENDONVI || "").trim() || "không tên";
        var $tx = $card ? $card.find(".chd-confirm-tx") : $("#chdAskXoa .tx");
        var strTxCu = $tx.html();
        $tx.html('<i class="fa fa-spinner fa-spin"></i> Đang xóa...');
        if ($card) $card.find(".chd-foot-confirm .chd-act").addClass("is-disabled");
        else me.bDangLuu = true;
        me.goi(me.API.XOA, { 'strID': o.ID, 'strNguoiThucHien_Id': edu.system.userId }, function () {
            if (!$card) {
                me.bDangLuu = false;
                $tx.html(strTxCu);
                me.dongForm(true);
            }
            me.thongBao("s", "Đã xóa cấu hình \"" + strTen + "\".");
            me.getList();
        }, function (msg) {
            $tx.html(strTxCu);
            if ($card) {
                $card.removeClass("is-confirm").find(".chd-foot-confirm .chd-act").removeClass("is-disabled");
                me.thongBao("e", "Xóa không thành công: " + msg);
            } else {
                me.bDangLuu = false;
                $m.removeClass("ask-xoa");
                me.thongBaoForm("e", "Xóa không thành công: " + msg);
            }
        });
    }
};
