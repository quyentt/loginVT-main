/*----------------------------------------------
--Module: Đăng ký cơ sở đào tạo (ApisCongSinhVien / dangkyhoc)
--Author:
--Phone:
--Date of created: 18/09/2026
--Input:
--Output:
--Note: Giao diện theo bộ mockup HTML-DangKyCoSoDaoTao (design system .aps-dkcs).
        API dùng package PKG_CORE_DK_COSO (cổng SV), gọi qua edu.system.makeRequest
        với 'func' + 'iM' → framework tự XOR mã hóa request / giải mã data.Data.
          1. DS_KH_NH  → SV_CORE_DK_COSO_MH/BRIeCgkeDwkP   (danh sách kế hoạch)
          2. DS_KHCS   → SV_CORE_DK_COSO_MH/BRIeCgkCEgPP   (cơ sở đào tạo theo kế hoạch)
          3. Them_KQ   → SV_CORE_DK_COSO_MH/FSkkLB4KEAPP   (đăng ký + đổi cơ sở)
          4. Xoa_KQ    → SV_CORE_DK_COSO_MH/GS4gHgoQ       (hủy đăng ký)
        Chưa có API lịch sử thay đổi → phần UI lịch sử đang comment trong file .html.
        Tên cột trả về khai báo ở FIELD bên dưới (nhận nhiều alias) — sai thì sửa 1 chỗ.
----------------------------------------------*/
function DangKyCoSoDaoTao() { };
DangKyCoSoDaoTao.prototype = {

    /*------------------------------------------
    --Discription: Địa chỉ API (PKG_CORE_DK_COSO)
    -------------------------------------------*/
    API: {
        DS_KH_NH: { action: 'SV_CORE_DK_COSO_MH/BRIeCgkeDwkP', func: 'PKG_CORE_DK_COSO.DS_KH_NH' },
        DS_KHCS: { action: 'SV_CORE_DK_COSO_MH/BRIeCgkCEgPP', func: 'PKG_CORE_DK_COSO.DS_KHCS' },
        THEM_KQ: { action: 'SV_CORE_DK_COSO_MH/FSkkLB4KEAPP', func: 'PKG_CORE_DK_COSO.Them_KQ' },
        XOA_KQ: { action: 'SV_CORE_DK_COSO_MH/GS4gHgoQ', func: 'PKG_CORE_DK_COSO.Xoa_KQ' }
    },

    /*------------------------------------------
    --Discription: Tên cột dữ liệu trả về.
                   Mỗi field khai nhiều alias, hàm pick() lấy cái nào có thật.
                   Xem log "[DKCS] cột kế hoạch / cột cơ sở" ở console để bổ sung.
    -------------------------------------------*/
    FIELD: {
        /* Kế hoạch — DS_KH_NH */
        KH_ID: ['ID', 'KEHOACH_ID', 'CORE_DK_COSO_KEHOACH_ID'],
        KH_TEN: ['TENKEHOACH', 'TEN_KEHOACH', 'TEN', 'KEHOACH_TEN'],
        KH_TUNGAY: ['TUNGAY', 'NGAYBATDAU', 'TU_NGAY', 'NGAY_BATDAU'],
        KH_DENNGAY: ['DENNGAY', 'NGAYKETTHUC', 'DEN_NGAY', 'NGAY_KETTHUC'],
        KH_DOITUONG: ['DOITUONG', 'DOITUONG_APDUNG', 'MOTA', 'GHICHU'],
        KH_HIEULUC: ['HIEULUC', 'CONHIEULUC', 'TRANGTHAI', 'DTRANGTHAI'],
        /* Người học — lấy kèm trong DS_KH_NH nếu proc có trả */
        NH_HOTEN: ['HOTEN', 'HO_TEN', 'TENNGUOIHOC', 'PERSON_NAME'],
        NH_MASO: ['MANGUOIHOC', 'MASO', 'MASINHVIEN', 'MA'],
        NH_LOP: ['LOPQUANLY_TEN', 'TENLOP', 'LOP', 'DAOTAO_LOPQUANLY_TEN'],
        NH_KHOA: ['KHOA_TEN', 'TENKHOA', 'DONVI_TEN'],
        NH_CTDT: ['TOCHUCCT_TEN', 'CHUONGTRINH_TEN', 'TENCHUONGTRINH', 'DAOTAO_TOCHUCCT_TEN'],
        NH_KHOAHOC: ['KHOAHOC_TEN', 'TENKHOAHOC', 'KHOAHOC'],
        NH_PERSONSTUDY_ID: ['CORE_PERSON_STUDY_ID', 'COREPERSONSTUDY_ID', 'PERSON_STUDY_ID'],
        NH_TOCHUCCT_ID: ['DAOTAO_TOCHUCCT_ID', 'TOCHUCCT_ID'],
        NH_LOPQUANLY_ID: ['DAOTAO_LOPQUANLY_ID', 'LOPQUANLY_ID'],
        /* Cơ sở đào tạo — DS_KHCS */
        CS_ID: ['COSODAOTAO_ID', 'ID', 'CS_ID'],
        CS_TEN: ['COSODAOTAO_TEN', 'TEN', 'TENCOSO', 'TEN_COSODAOTAO'],
        CS_MA: ['COSODAOTAO_MA', 'MA', 'MACOSO'],
        CS_DIACHI: ['DIACHI', 'DIA_CHI', 'DIACHI_COSO'],
        CS_CHITIEU: ['CHITIEU', 'SOLUONG', 'CHI_TIEU'],
        CS_MOTA: ['MOTA', 'GHICHU', 'DIENGIAI'],
        CS_ANH: ['ANHDAIDIEN', 'HINHANH', 'ANH', 'FILEANH'],
        /* Cờ đánh dấu cơ sở người học đang đăng ký (nếu proc có trả) */
        CS_DACHON: ['DADANGKY', 'DACHON', 'ISCHON', 'DALUACHON', 'TRANGTHAIDANGKY'],
        CS_NGAYXACNHAN: ['NGAYXACNHAN', 'THOIGIANXACNHAN', 'NGAY_XACNHAN']
    },

    /*------------------------------------------
    --Discription: Biến trạng thái của màn hình
    -------------------------------------------*/
    strCorePerson_Id: '',           // id người học (SV đăng nhập = chính userId)
    dtKeHoach: [],                  // danh sách kế hoạch đăng ký
    objKeHoach: {},                 // kế hoạch đang xem
    objNguoiHoc: {},                // thông tin người học
    dtCoSo: [],                     // danh sách cơ sở đào tạo
    dtLichSu: [],                   // lịch sử thay đổi lựa chọn (chưa có API)
    strCoSo_DaDangKy_Id: '',        // cơ sở đang được ghi nhận trong DB
    strCoSo_DangChon_Id: '',        // cơ sở đang chọn tạm trên giao diện (chưa ghi DB)
    bChoPhepDangKy: true,           // kế hoạch còn hạn && người học thuộc phạm vi
    bDaHuy: false,                  // vừa thực hiện hủy lựa chọn

    /*==========================================================
    ==  KHỞI TẠO
    ==========================================================*/
    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.page_load();
        /*------------------------------------------
        --Discription: Initial local
        -- SV đăng nhập → Core_Person_Id chính là id đăng nhập.
        -- Nếu sau này dùng cho cán bộ đăng ký hộ thì gán lại biến này
        -- bằng id người học được chọn rồi gọi me.loadData().
        -------------------------------------------*/
        me.strCorePerson_Id = edu.system.userId;
        me.bindEvent();
        me.loadData();
    },

    /*------------------------------------------
    --Discription: Gán sự kiện cho các nút trên màn hình
    -------------------------------------------*/
    bindEvent: function () {
        var me = this;

        /* Chọn cơ sở (radio render động nên phải delegate) */
        $("#zoneDSCoSo_DKCS").delegate("input[name='rdCoSo_DKCS']", "change", function () {
            me.strCoSo_DangChon_Id = $(this).val();
            me.refreshUI();
        });

        /* Xóa lựa chọn tạm trên giao diện (chưa ghi DB) */
        $("#btnXoaLuaChon_DKCS").click(function () {
            me.strCoSo_DangChon_Id = '';
            $("input[name='rdCoSo_DKCS']").prop("checked", false);
            me.refreshUI();
        });

        /* Hoàn tác: quay lại cơ sở đang lưu trong DB */
        $("#btnHoanTac_DKCS").click(function () {
            me.strCoSo_DangChon_Id = me.strCoSo_DaDangKy_Id;
            me.tickRadio(me.strCoSo_DaDangKy_Id);
            me.refreshUI();
        });

        /* Đóng: trả màn hình về đúng trạng thái đang lưu */
        $("#btnDong_DKCS").click(function () {
            me.strCoSo_DangChon_Id = me.strCoSo_DaDangKy_Id;
            me.tickRadio(me.strCoSo_DaDangKy_Id);
            me.refreshUI();
        });

        /* Xác nhận: đăng ký mới hoặc thay đổi → mở modal tương ứng */
        $("#btnXacNhan_DKCS").click(function () {
            if (!edu.util.checkValue(me.strCoSo_DangChon_Id)) {
                edu.system.alert("Vui lòng chọn cơ sở đào tạo trước khi xác nhận!", "w");
                return false;
            }
            var strTenChon = me.getTenCoSo(me.strCoSo_DangChon_Id);
            if (edu.util.checkValue(me.strCoSo_DaDangKy_Id)) {
                /* Đang có cơ sở → luồng thay đổi */
                $("#lblTu_XacNhanThayDoi_DKCS").text(me.getTenCoSo(me.strCoSo_DaDangKy_Id));
                $("#lblSang_XacNhanThayDoi_DKCS").text(strTenChon);
                me.modal("modal-XacNhanThayDoi_DKCS", "show");
            } else {
                /* Chưa có cơ sở → luồng đăng ký lần đầu */
                $("#lblTenCoSo_XacNhanDangKy_DKCS").text(strTenChon);
                me.modal("modal-XacNhanDangKy_DKCS", "show");
            }
        });

        /* Hủy lựa chọn đã đăng ký */
        $("#btnHuyDangKy_DKCS").click(function () {
            $("#lblTenCoSo_XacNhanHuy_DKCS").text(me.getTenCoSo(me.strCoSo_DaDangKy_Id));
            me.modal("modal-XacNhanHuy_DKCS", "show");
        });

        /* Nút Xác nhận trong 3 modal */
        $("#btnYes_DangKy_DKCS").click(function () {
            me.modal("modal-XacNhanDangKy_DKCS", "hide");
            me.save_DangKy();
        });
        $("#btnYes_ThayDoi_DKCS").click(function () {
            me.modal("modal-XacNhanThayDoi_DKCS", "hide");
            me.save_DangKy();
        });
        $("#btnYes_Huy_DKCS").click(function () {
            me.modal("modal-XacNhanHuy_DKCS", "hide");
            me.save_HuyDangKy();
        });

        /* Đổi kế hoạch (combo chỉ hiện khi người học có từ 2 kế hoạch trở lên) */
        $("#dropKeHoach_DKCS").change(function () {
            me.chonKeHoach($(this).val());
        });
    },

    /*==========================================================
    ==  NẠP DỮ LIỆU
    ==========================================================*/
    loadData: function () {
        var me = this;
        /* Cơ sở đào tạo phụ thuộc kế hoạch → phải lấy kế hoạch xong mới gọi tiếp */
        me.getList_KeHoach();
    },

    /*------------------------------------------
    --Discription: [API 1] PKG_CORE_DK_COSO.DS_KH_NH
                   Danh sách kế hoạch đăng ký của người học.
                   strNguoiThucHien_Id: người đăng nhập
                   strCore_Person_Id  : id người học (SV đăng nhập = chính id đó)
    -------------------------------------------*/
    getList_KeHoach: function () {
        var me = this;
        me.callApi(me.API.DS_KH_NH, {
            'strNguoiThucHien_Id': edu.system.userId,
            'strCore_Person_Id': me.strCorePerson_Id
        }, function (data) {
            me.logFields("cột kế hoạch (DS_KH_NH)", data);
            me.dtKeHoach = data || [];
            me.genCombo_KeHoach(me.dtKeHoach);

            if (me.dtKeHoach.length === 0) {
                me.viewKhongCoKeHoach();
                return;
            }
            /* Mặc định lấy kế hoạch đầu tiên */
            me.chonKeHoach(me.pick(me.dtKeHoach[0], me.FIELD.KH_ID));
        });
    },

    /*------------------------------------------
    --Discription: Chọn 1 kế hoạch → đổ thông tin + nạp lại danh sách cơ sở
    -------------------------------------------*/
    chonKeHoach: function (strKeHoach_Id) {
        var me = this;
        var obj = null;
        for (var i = 0; i < me.dtKeHoach.length; i++) {
            if (me.pick(me.dtKeHoach[i], me.FIELD.KH_ID) === String(strKeHoach_Id)) {
                obj = me.dtKeHoach[i];
                break;
            }
        }
        if (!obj) return false;

        me.viewTT_KeHoach(obj);
        /* DS_KH_NH trả kèm thông tin người học thì tận dụng luôn,
           vì cổng SV chưa có API riêng cho hồ sơ người học. */
        me.viewTT_NguoiHoc(obj);
        me.getList_CoSo();
    },

    /*------------------------------------------
    --Discription: [API 2] PKG_CORE_DK_COSO.DS_KHCS
                   Danh sách cơ sở đào tạo thuộc kế hoạch.
                   strCoSoDaoTao_Id: '' = lấy tất cả
                   dHieuLuc: 1 = chỉ lấy bản ghi còn hiệu lực
    -------------------------------------------*/
    getList_CoSo: function () {
        var me = this;
        var strKeHoach_Id = me.pick(me.objKeHoach, me.FIELD.KH_ID);
        if (!edu.util.checkValue(strKeHoach_Id)) return false;

        me.callApi(me.API.DS_KHCS, {
            'strKeHoach_Id': strKeHoach_Id,
            'strCoSoDaoTao_Id': '',
            'dHieuLuc': 1
        }, function (data) {
            me.logFields("cột cơ sở (DS_KHCS)", data);
            me.genList_CoSo(data || []);
        });
    },

    /* ─────────────────────────────────────────────────────────
       [CHỜ API] Lịch sử thay đổi lựa chọn.
       Cổng SV hiện chỉ có 4 hàm (kế hoạch / cơ sở / đăng ký / hủy),
       chưa có proc lấy lịch sử → phần UI đang comment trong file .html.
       Khi BE bổ sung: bỏ comment khối HTML + hàm dưới, gọi trong chonKeHoach().

    getList_LichSu: function () {
        var me = this;
        me.callApi({ action: '...', func: 'PKG_CORE_DK_COSO....' }, {
            'strKeHoach_Id': me.pick(me.objKeHoach, me.FIELD.KH_ID),
            'strCore_Person_Id': me.strCorePerson_Id
        }, function (data) {
            me.genTable_LichSu(data || []);
        });
    },
       ───────────────────────────────────────────────────────── */

    /*==========================================================
    ==  GHI DỮ LIỆU
    ==========================================================*/
    /*------------------------------------------
    --Discription: [API 3] PKG_CORE_DK_COSO.Them_KQ
                   Dùng chung cho ĐĂNG KÝ MỚI và ĐỔI CƠ SỞ (BE xác nhận: "đổi chính là 3").
                   Các tham số không dùng để trắng theo hướng dẫn của BE.
    -------------------------------------------*/
    save_DangKy: function () {
        var me = this;
        var strCoSo_Id = me.strCoSo_DangChon_Id;
        if (!edu.util.checkValue(strCoSo_Id)) return false;

        me.callApi(me.API.THEM_KQ, {
            'strKeHoach_Id': me.pick(me.objKeHoach, me.FIELD.KH_ID),
            'strCorePerson_Id': me.strCorePerson_Id,
            'strCorePersonStudy_Id': me.pick(me.objNguoiHoc, me.FIELD.NH_PERSONSTUDY_ID),
            'strMaNguoiHoc': me.pick(me.objNguoiHoc, me.FIELD.NH_MASO),
            'strCoSoDaoTao_Id': strCoSo_Id,
            'strDaoTao_ToChucCT_Id': me.pick(me.objNguoiHoc, me.FIELD.NH_TOCHUCCT_ID),
            'strDaoTao_LopQuanLy_Id': me.pick(me.objNguoiHoc, me.FIELD.NH_LOPQUANLY_ID),
            'strNgayXacNhan': '',
            'strNguoiThucHien_Id': edu.system.userId,
            'strGhiChu': ''
        }, function () {
            me.afterSave_DangKy(strCoSo_Id);
            edu.system.alert("Đăng ký cơ sở đào tạo thành công!", "s");
            /* Đọc lại danh sách để lấy đúng trạng thái BE vừa ghi */
            me.getList_CoSo();
        });
    },

    /*------------------------------------------
    --Discription: [API 4] PKG_CORE_DK_COSO.Xoa_KQ
                   Hủy lựa chọn cơ sở đào tạo hiện hành.
    -------------------------------------------*/
    save_HuyDangKy: function () {
        var me = this;
        if (!edu.util.checkValue(me.strCoSo_DaDangKy_Id)) return false;

        me.callApi(me.API.XOA_KQ, {
            'strNguoiThucHien_Id': edu.system.userId,
            'strCorePerson_Id': me.strCorePerson_Id
        }, function () {
            me.afterSave_Huy();
            edu.system.alert("Đã hủy lựa chọn cơ sở đào tạo!", "s");
            me.getList_CoSo();
        });
    },

    /*------------------------------------------
    --Discription: Cập nhật giao diện sau khi lưu thành công
    -------------------------------------------*/
    afterSave_DangKy: function (strCoSo_Id) {
        var me = this;
        var strTu = edu.util.checkValue(me.strCoSo_DaDangKy_Id) ? me.getTenCoSo(me.strCoSo_DaDangKy_Id) : '-';
        me.strCoSo_DaDangKy_Id = strCoSo_Id;
        me.strCoSo_DangChon_Id = strCoSo_Id;
        me.bDaHuy = false;
        me.objNguoiHoc.NGAYXACNHAN = me.now();
        me.pushLichSu(strTu, me.getTenCoSo(strCoSo_Id),
            (strTu === '-' ? 'Đăng ký ban đầu' : 'Đã thay đổi'),
            (strTu === '-' ? 'Đăng ký theo kế hoạch' : 'Người học chủ động thay đổi'));
        me.refreshUI();
    },

    afterSave_Huy: function () {
        var me = this;
        var strTu = me.getTenCoSo(me.strCoSo_DaDangKy_Id);
        me.strCoSo_DaDangKy_Id = '';
        me.strCoSo_DangChon_Id = '';
        me.bDaHuy = true;
        $("input[name='rdCoSo_DKCS']").prop("checked", false);
        me.objNguoiHoc.NGAYXACNHAN = me.now();
        me.pushLichSu(strTu, '-', 'Đã hủy', 'Người học chủ động hủy lựa chọn');
        me.refreshUI();
    },

    /*==========================================================
    ==  RENDER GIAO DIỆN
    ==========================================================*/
    /*------------------------------------------
    --Discription: Đổ thông tin kế hoạch
    -------------------------------------------*/
    viewTT_KeHoach: function (obj) {
        var me = this;
        obj = obj || {};
        me.objKeHoach = obj;

        var F = me.FIELD;
        $("#lblTenKeHoach_DKCS").text(me.pick(obj, F.KH_TEN, "Kế hoạch đăng ký cơ sở đào tạo"));
        $("#lblThoiGianDangKy_DKCS").text(
            me.date(me.pick(obj, F.KH_TUNGAY), "--/--/----") + " - " +
            me.date(me.pick(obj, F.KH_DENNGAY), "--/--/----"));
        $("#lblDoiTuong_DKCS").text(me.pick(obj, F.KH_DOITUONG, "-"));

        /* Còn hạn = cờ hiệu lực của kế hoạch && hôm nay <= ngày kết thúc */
        var bConHieuLuc = me.isTrue(me.pick(obj, F.KH_HIEULUC, '1'));
        var bConHan = bConHieuLuc && me.conHan(me.pick(obj, F.KH_DENNGAY));
        $("#lblHieuLuc_DKCS")
            .removeClass("green red")
            .addClass(bConHan ? "green" : "red")
            .text(bConHan ? "Kế hoạch còn hiệu lực" : "Kế hoạch đã hết hạn");

        /* Người học lấy được kế hoạch từ DS_KH_NH tức là đã thuộc phạm vi */
        $("#lblPhamVi_DKCS").removeClass("dkcs-hide red").addClass("green")
            .text("Bạn thuộc phạm vi được đăng ký");

        me.bChoPhepDangKy = bConHan;
        me.refreshUI();
    },

    /*------------------------------------------
    --Discription: Đổ thông tin người học.
                   Cổng SV chưa có API hồ sơ riêng → lấy từ dòng kế hoạch
                   (DS_KH_NH nhận ParamCore_Person_Id nên thường trả kèm),
                   thiếu field nào thì lùi về thông tin phiên đăng nhập.
    -------------------------------------------*/
    viewTT_NguoiHoc: function (obj) {
        var me = this;
        obj = obj || {};
        me.objNguoiHoc = obj;

        var F = me.FIELD;
        var strHoTen = me.pick(obj, F.NH_HOTEN) || me.txt(edu.system.userName, "-");
        var strMaSo = me.pick(obj, F.NH_MASO, "-");
        var strLop = me.pick(obj, F.NH_LOP, "-");
        var strKhoa = me.pick(obj, F.NH_KHOA, "-");

        $("#lblHoTen_DKCS").text(strHoTen);
        $("#lblMaSo_DKCS").text(strMaSo);
        $("#lblLop_DKCS").text("Lớp: " + strLop);
        $("#lblKhoa_DKCS").text("Khoa: " + strKhoa);

        $("#lblKV_HoTen_DKCS").text(strHoTen);
        $("#lblKV_MaSo_DKCS").text(strMaSo);
        $("#lblKV_ChuongTrinh_DKCS").text(me.pick(obj, F.NH_CTDT, "-"));
        $("#lblKV_Khoa_DKCS").text(me.pick(obj, F.NH_KHOAHOC, "-"));
        $("#lblKV_Lop_DKCS").text(strLop);

        me.refreshUI();
    },

    /*------------------------------------------
    --Discription: Không có kế hoạch nào áp dụng cho người học
    -------------------------------------------*/
    viewKhongCoKeHoach: function () {
        var me = this;
        me.bChoPhepDangKy = false;
        $("#lblTenKeHoach_DKCS").text("Chưa có kế hoạch đăng ký cơ sở đào tạo");
        $("#lblHieuLuc_DKCS").removeClass("green").addClass("red").text("Không có kế hoạch");
        $("#lblPhamVi_DKCS").addClass("dkcs-hide");
        $("#zoneDSCoSo_DKCS").html(
            '<div class="dkcs-empty" style="grid-column:1/-1">'
            + '<i class="fa-regular fa-folder-open"></i>'
            + 'Hiện chưa có kế hoạch đăng ký cơ sở đào tạo áp dụng cho bạn.'
            + '</div>');
        me.refreshUI();
    },

    /*------------------------------------------
    --Discription: Combo chọn kế hoạch — chỉ hiện khi có từ 2 kế hoạch trở lên
    -------------------------------------------*/
    genCombo_KeHoach: function (data) {
        var me = this;
        if (!data || data.length < 2) {
            $("#zoneChonKeHoach_DKCS").addClass("dkcs-hide");
            return;
        }
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<option value="' + me.pick(data[i], me.FIELD.KH_ID) + '">'
                  + me.pick(data[i], me.FIELD.KH_TEN, '-') + '</option>';
        }
        $("#dropKeHoach_DKCS").html(html);
        $("#zoneChonKeHoach_DKCS").removeClass("dkcs-hide");
    },

    /*------------------------------------------
    --Discription: Render danh sách cơ sở đào tạo (thẻ radio)
    -------------------------------------------*/
    genList_CoSo: function (data) {
        var me = this;
        var F = me.FIELD;
        me.dtCoSo = data || [];
        var html = '';

        if (me.dtCoSo.length === 0) {
            html = '<div class="dkcs-empty" style="grid-column:1/-1">'
                 + '<i class="fa-regular fa-folder-open"></i>'
                 + 'Kế hoạch chưa khai báo cơ sở đào tạo nào.'
                 + '</div>';
            $("#zoneDSCoSo_DKCS").html(html);
            me.refreshUI();
            return;
        }

        /* Cơ sở người học đang đăng ký: đọc theo cờ DS_KHCS trả về (nếu có) */
        me.strCoSo_DaDangKy_Id = '';
        for (var k = 0; k < me.dtCoSo.length; k++) {
            if (me.isTrue(me.pick(me.dtCoSo[k], F.CS_DACHON, '0'))) {
                me.strCoSo_DaDangKy_Id = me.pick(me.dtCoSo[k], F.CS_ID);
                me.objNguoiHoc.NGAYXACNHAN = me.pick(me.dtCoSo[k], F.CS_NGAYXACNHAN);
                break;
            }
        }
        me.strCoSo_DangChon_Id = me.strCoSo_DaDangKy_Id;
        /* Chỉ gỡ cờ "vừa hủy" khi BE báo đang có cơ sở, để sau khi hủy
           người học vẫn thấy thông báo hủy thành công ở lần nạp lại. */
        if (me.strCoSo_DaDangKy_Id !== '') me.bDaHuy = false;

        for (var i = 0; i < me.dtCoSo.length; i++) {
            var o = me.dtCoSo[i];
            var strId = me.pick(o, F.CS_ID);
            var strTen = me.pick(o, F.CS_TEN, '-');
            var strMa = me.pick(o, F.CS_MA);
            var strAnh = me.pick(o, F.CS_ANH);
            var strChiTieu = me.pick(o, F.CS_CHITIEU);

            html += '<label class="dkcs-campus" id="campus_' + strId + '">'
                  + '<input type="radio" name="rdCoSo_DKCS" value="' + strId + '" />'
                  + (strAnh !== '' ? '<img src="' + strAnh + '" alt="' + strTen + '" />' : '')
                  + '<div class="c-body">'
                  + '<p class="c-name">' + strTen + (strMa !== '' ? ' (' + strMa + ')' : '') + '</p>'
                  + '<p class="c-line"><i class="fa-solid fa-location-dot"></i><span>'
                  + me.pick(o, F.CS_DIACHI, '-') + '</span></p>'
                  + (strChiTieu !== ''
                        ? '<p class="c-line"><i class="fa-solid fa-user-group"></i><span>Chỉ tiêu dự kiến: '
                          + strChiTieu + '</span></p>'
                        : '')
                  + '<p class="c-italic">' + me.pick(o, F.CS_MOTA) + '</p>'
                  + '</div>'
                  + '</label>';
        }
        $("#zoneDSCoSo_DKCS").html(html);

        me.tickRadio(me.strCoSo_DangChon_Id);
        me.refreshUI();
    },

    /*------------------------------------------
    --Discription: Render bảng lịch sử thay đổi
    -------------------------------------------*/
    genTable_LichSu: function (data) {
        var me = this;
        me.dtLichSu = data || [];
        var html = '';

        if (me.dtLichSu.length === 0) {
            html = '<tr><td class="td-empty" colspan="7">Chưa có dữ liệu</td></tr>';
        } else {
            for (var i = 0; i < me.dtLichSu.length; i++) {
                var o = me.dtLichSu[i];
                html += '<tr>'
                      + '<td>' + (i + 1) + '</td>'
                      + '<td>' + me.txt(o.THOIGIAN, '-') + '</td>'
                      + '<td>' + me.txt(o.TU_COSO, '-') + '</td>'
                      + '<td>' + me.txt(o.DEN_COSO, '-') + '</td>'
                      + '<td><span class="dkcs-pill ' + me.classTrangThai(o.TRANGTHAI) + '">' + me.txt(o.TRANGTHAI, '-') + '</span></td>'
                      + '<td>' + me.txt(o.NGUOITHUCHIEN, '-') + '</td>'
                      + '<td>' + me.txt(o.GHICHU, '') + '</td>'
                      + '</tr>';
            }
        }
        $("#tblLichSu_DKCS tbody").html(html);
    },

    /*------------------------------------------
    --Discription: Cập nhật toàn bộ trạng thái hiển thị của màn hình
                   (chưa đăng ký / đã đăng ký / đã hủy / không được phép)
    -------------------------------------------*/
    refreshUI: function () {
        var me = this;
        var bDaDangKy = edu.util.checkValue(me.strCoSo_DaDangKy_Id);
        var bDaChon = edu.util.checkValue(me.strCoSo_DangChon_Id);
        var bThayDoi = bDaChon && (me.strCoSo_DangChon_Id !== me.strCoSo_DaDangKy_Id);

        /* Highlight thẻ cơ sở đang chọn */
        $(".dkcs-campus").removeClass("selected");
        if (bDaChon) $("#campus_" + me.strCoSo_DangChon_Id).addClass("selected");

        /* 3 hộp trạng thái phía trên */
        me.toggle("#boxChuaDangKy_DKCS", !bDaDangKy && !me.bDaHuy);
        me.toggle("#boxDaDangKy_DKCS", bDaDangKy);
        me.toggle("#boxDaHuy_DKCS", !bDaDangKy && me.bDaHuy);
        me.toggle("#boxCanhBaoChuaChon_DKCS", !bDaDangKy && !bDaChon);

        if (bDaDangKy) {
            $("#lblCoSoHienTai_DKCS").text(me.getTenCoSo(me.strCoSo_DaDangKy_Id));
            $("#lblPillCoSoHienTai_DKCS").removeClass("red gray").addClass("green")
                .text(me.getTenCoSo(me.strCoSo_DaDangKy_Id));
            $("#lblTu_DKCS").text(me.getTenCoSo(me.strCoSo_DaDangKy_Id));
        } else {
            $("#lblPillCoSoHienTai_DKCS").removeClass("green gray").addClass("red").text("Chưa đăng ký");
            $("#lblTu_DKCS").text("Chưa đăng ký");
        }
        $("#lblSang_DKCS").text(bThayDoi ? me.getTenCoSo(me.strCoSo_DangChon_Id) : "Chưa chọn");

        /* Thời gian xác nhận gần nhất */
        var strThoiGian = me.txt(me.objNguoiHoc.NGAYXACNHAN, '');
        $("#lblThoiGianXacNhan_DKCS").text(strThoiGian !== '' ? strThoiGian : "Chưa có");
        $("#lblLanXacNhan_DKCS").text(
            strThoiGian !== ''
                ? strThoiGian + (bDaDangKy ? " - " + me.getTenCoSo(me.strCoSo_DaDangKy_Id) : "")
                : "Chưa có");

        /* Nhãn nút xác nhận đổi theo luồng đăng ký mới / thay đổi */
        $("#btnXacNhan_DKCS span").text(bDaDangKy ? "Xác nhận thay đổi" : "Xác nhận lựa chọn");

        /* Bật / tắt nút */
        $("#btnXacNhan_DKCS").prop("disabled", !me.bChoPhepDangKy || !bDaChon || !bThayDoi);
        $("#btnXoaLuaChon_DKCS").prop("disabled", !me.bChoPhepDangKy || !bDaChon);
        $("#btnHoanTac_DKCS").prop("disabled", !me.bChoPhepDangKy || !bThayDoi);
        $("#btnHuyDangKy_DKCS").prop("disabled", !me.bChoPhepDangKy || !bDaDangKy);

        /* Hết hạn / ngoài phạm vi → khóa toàn bộ lựa chọn */
        $("input[name='rdCoSo_DKCS']").prop("disabled", !me.bChoPhepDangKy);
        me.toggleClass(".dkcs-campus", "disabled", !me.bChoPhepDangKy);
    },

    /*==========================================================
    ==  HÀM TIỆN ÍCH
    ==========================================================*/
    /*------------------------------------------
    --Discription: Gọi API dùng chung (bọc edu.system.makeRequest).
                   objApi    : 1 phần tử trong me.API ({ action, func })
                   obj       : tham số, key đúng tên param của entity C#
                   fnSuccess : function (arrData, dataGoc)
    --Note: có 'iM' → makeRequest tự ép POST, tự XOR mã hóa request và
            tự giải mã data.Data, nên không cần xử lý gì thêm ở đây.
            Overlay loading cũng do makeRequest tự bật/tắt.
    -------------------------------------------*/
    callApi: function (objApi, obj, fnSuccess) {
        var obj_send = $.extend({
            'action': objApi.action,
            'func': objApi.func,
            'iM': edu.system.iM
        }, obj || {});

        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    if (typeof fnSuccess === "function") {
                        fnSuccess(data.Data || [], data);
                    }
                } else {
                    edu.system.alert(objApi.func + ": " + ((data && data.Message) || ""), "w");
                }
            },
            error: function (er) {
                edu.system.alert(objApi.func + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_send.action,
            contentType: true,
            data: obj_send,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: Lấy giá trị field theo danh sách alias (xem me.FIELD).
                   Trả về chuỗi; không tìm thấy thì trả strDefault ('' nếu bỏ trống).
    -------------------------------------------*/
    pick: function (obj, arrKey, strDefault) {
        if (!obj || !arrKey) return (strDefault === undefined ? '' : strDefault);
        for (var i = 0; i < arrKey.length; i++) {
            var v = obj[arrKey[i]];
            if (v !== undefined && v !== null && v !== '') return String(v);
        }
        return (strDefault === undefined ? '' : strDefault);
    },

    /*------------------------------------------
    --Discription: Ghi log tên cột trả về để đối chiếu khai báo me.FIELD
    -------------------------------------------*/
    logFields: function (strTitle, data) {
        if (data && data.length && window.console) {
            console.log("[DKCS] " + strTitle + ":", Object.keys(data[0]), data[0]);
        }
    },

    /*------------------------------------------
    --Discription: Ép cờ Oracle (1/0, 'Y'/'N', true/false) về boolean
    -------------------------------------------*/
    isTrue: function (val) {
        var s = String(val === undefined || val === null ? '' : val).trim().toUpperCase();
        return (s === '1' || s === 'Y' || s === 'TRUE' || s === 'X');
    },

    /*------------------------------------------
    --Discription: Giữ nguyên chuỗi ngày BE trả về, chỉ cắt phần giờ nếu có.
                   KHÔNG format lại để tránh lệch định dạng giữa các trường.
    -------------------------------------------*/
    date: function (val, strDefault) {
        var s = this.txt(val, '');
        if (s === '') return (strDefault === undefined ? '' : strDefault);
        if (s.indexOf('T') > 0) s = s.split('T')[0];
        return s;
    },

    /*------------------------------------------
    --Discription: So ngày kết thúc với hôm nay (chấp nhận dd/MM/yyyy và yyyy-MM-dd).
                   Không parse được thì coi như còn hạn, để BE quyết khi ghi.
    -------------------------------------------*/
    conHan: function (strDenNgay) {
        var s = this.date(strDenNgay, '');
        if (s === '') return true;
        var d = null;
        var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) {
            d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
        } else {
            m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
            if (m) d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
        }
        if (!d || isNaN(d.getTime())) return true;
        d.setHours(23, 59, 59, 999);
        return d.getTime() >= new Date().getTime();
    },

    /*------------------------------------------
    --Discription: Lấy tên cơ sở theo Id
    -------------------------------------------*/
    getTenCoSo: function (strId) {
        var me = this;
        if (!edu.util.checkValue(strId)) return '';
        for (var i = 0; i < me.dtCoSo.length; i++) {
            if (me.pick(me.dtCoSo[i], me.FIELD.CS_ID) === String(strId)) {
                return me.pick(me.dtCoSo[i], me.FIELD.CS_TEN);
            }
        }
        return '';
    },

    /*------------------------------------------
    --Discription: Tick radio theo Id cơ sở
    -------------------------------------------*/
    tickRadio: function (strId) {
        $("input[name='rdCoSo_DKCS']").prop("checked", false);
        if (strId !== undefined && strId !== null && strId !== '') {
            $("input[name='rdCoSo_DKCS'][value='" + strId + "']").prop("checked", true);
        }
    },

    /*------------------------------------------
    --Discription: Thêm 1 dòng vào đầu bảng lịch sử (sau khi lưu)
    -------------------------------------------*/
    pushLichSu: function (strTu, strDen, strTrangThai, strGhiChu) {
        var me = this;
        me.dtLichSu.unshift({
            THOIGIAN: me.now(),
            TU_COSO: strTu,
            DEN_COSO: strDen,
            TRANGTHAI: strTrangThai,
            NGUOITHUCHIEN: me.txt(me.objNguoiHoc.HOTEN, '-'),
            GHICHU: strGhiChu
        });
        me.genTable_LichSu(me.dtLichSu);
    },

    /*------------------------------------------
    --Discription: Màu pill theo trạng thái lịch sử
    -------------------------------------------*/
    classTrangThai: function (strTrangThai) {
        var s = (strTrangThai || '').toLowerCase();
        if (s.indexOf('hủy') >= 0) return 'red';
        if (s.indexOf('ban đầu') >= 0) return 'gray';
        return 'green';
    },

    /*------------------------------------------
    --Discription: Ẩn / hiện không phụ thuộc phiên bản Bootstrap
    -------------------------------------------*/
    toggle: function (strSelector, bShow) {
        if (bShow) $(strSelector).removeClass("dkcs-hide");
        else $(strSelector).addClass("dkcs-hide");
    },

    toggleClass: function (strSelector, strClass, bAdd) {
        if (bAdd) $(strSelector).addClass(strClass);
        else $(strSelector).removeClass(strClass);
    },

    /*------------------------------------------
    --Discription: Mở / đóng modal — chạy được cả Bootstrap 3 lẫn Bootstrap 5
    -------------------------------------------*/
    modal: function (strId, strAction) {
        var el = document.getElementById(strId);
        if (!el) return;
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
            var ins = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
            if (strAction === "show") ins.show(); else ins.hide();
            return;
        }
        if ($.fn.modal) $("#" + strId).modal(strAction);
    },

    /*------------------------------------------
    --Discription: Ép về chuỗi, null/undefined → giá trị mặc định
    -------------------------------------------*/
    txt: function (val, strDefault) {
        if (val === undefined || val === null || val === '') {
            return (strDefault === undefined ? '' : strDefault);
        }
        return String(val);
    },

    /*------------------------------------------
    --Discription: Thời điểm hiện tại dd/MM/yyyy HH:mm
    -------------------------------------------*/
    now: function () {
        var d = new Date();
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear()
             + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }
}
