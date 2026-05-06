/*----------------------------------------------
--Author:
--Date of created: 06/05/2026
--Note: Kế hoạch tuyển sinh (giao diện mới)
----------------------------------------------*/
function KeHoachTuyenSinhNew() { };
KeHoachTuyenSinhNew.prototype = {
    dtLoaiTuyenSinh: [],
    dtPhuongAnTuyenSinh: [],
    dtTinhTrangKeHoach: [],
    dtKeHoachTuyenSinh: [],
    strKeHoachTuyenSinh_Id: '',
    dtChiTiet: null,
    dtKieuDot: [],
    dtTinhTrangDot: [],
    dtDotTuyenSinh: [],
    strDot_Id: '',
    dtChiTietDot: null,

    init: function () {
        var me = this;
        edu.system.page_load();

        /*------------------------------------------
        -- Load combo filter + danh sách kế hoạch
        -------------------------------------------*/
        me.getList_LoaiTuyenSinh();
        me.getList_PhuongAnTuyenSinh();
        me.getList_TinhTrangKeHoach();
        me.getList_KieuDot();
        me.getList_TinhTrangDot();
        me.getList_KeHoachTuyenSinh();

        /*------------------------------------------
        -- Action
        -------------------------------------------*/
        $("#btnSearch").click(function () {
            me.getList_KeHoachTuyenSinh();
        });

        $("#txtSearch_TuKhoa, #txtSearch_NamTuyenSinh, #txtSearch_NamHoc, #txtSearch_HocKy")
            .keypress(function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    me.getList_KeHoachTuyenSinh();
                }
            });

        $("#tblKHtyensinh").delegate(".btnDetail", "click", function () {
            var strId = $(this).attr('data-id');
            if (edu.util.checkValue(strId)) {
                me.strKeHoachTuyenSinh_Id = strId;
                me.getDetail_KeHoachTuyenSinh(strId);
            }
        });

        // Khi user click "Xem" ở cột "Các đợt tuyển sinh" → ghi nhớ KH parent để dùng khi Thêm mới đợt
        $("#tblKHtyensinh").delegate('[data-bs-target="#dot-tuyen-sinh"]', "click", function () {
            me.strKeHoachTuyenSinh_Id = $(this).attr('data-id');
        });

        // Auto-load danh sách đợt khi mở modal Các đợt tuyển sinh
        $("#dot-tuyen-sinh").on('show.bs.modal', function () {
            me.getList_DotTuyenSinh();
        });

        // Click "Chi tiết" trên row đợt → mở form đợt ở chế độ Xem-sửa, populate data
        $("#tblDotTuyenSinh").delegate(".btnDetailDot", "click", function () {
            var strId = $(this).attr('data-id');
            if (!edu.util.checkValue(strId)) return;
            $('#them-moi').modal('show');   // → show.bs.modal fires → rewrite_Dot reset form trước
            me.strDot_Id = strId;            // → set sau khi rewrite_Dot xong
            me.getDetail_Dot(strId);
        });

        // Khi mở modal Thêm mới đợt → reset form
        $("#them-moi").on('show.bs.modal', function () {
            me.rewrite_Dot();
        });

        $("#btnSaveDot").click(function () {
            me.save_Dot();
        });

        $("#btnDelete_Dot").click(function () {
            if (!edu.util.checkValue(me.strDot_Id)) {
                edu.system.alert("Chưa chọn đợt để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa đợt này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_Dot();
            });
        });

        $("#btnUpdate_KH").click(function () {
            me.update_KeHoachTuyenSinh();
        });

        $("#btnDelete_KH").click(function () {
            if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
                edu.system.alert("Chưa chọn kế hoạch để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa kế hoạch này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_KeHoachTuyenSinh();
            });
        });
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Loai_TuyenSinh_Get_Ds
    -- Lấy danh sách Loại nguồn tuyển sinh
    -------------------------------------------*/
    getList_LoaiTuyenSinh: function () {
        var me = this;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeDS4gKB4VNDgkLxIoLykeBiQ1HgUy',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Loai_TuyenSinh_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'dIs_Active': 1
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                    }
                    me.dtLoaiTuyenSinh = dtResult;
                    me.genCombo_LoaiTuyenSinh('ddlLoaiNguonTuyenSinh', '');
                    me.genCombo_LoaiTuyenSinh('ddlKH_LoaiNguonTuyenSinh', '');
                }
                else {
                    edu.system.alert("Pr_Ts_Loai_TuyenSinh_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Loai_TuyenSinh_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_LoaiTuyenSinh: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtLoaiTuyenSinh,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENLOAITUYENSINH",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Loại nguồn tuyển sinh"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_PA_TuyenSinh_Get_Ds
    -- Lấy danh sách Phương án tuyển sinh
    -------------------------------------------*/
    getList_PhuongAnTuyenSinh: function () {
        var me = this;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeEQAeFTQ4JC8SKC8pHgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_PA_TuyenSinh_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'dIs_Active': 1
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                    }
                    me.dtPhuongAnTuyenSinh = dtResult;
                    me.genCombo_PhuongAnTuyenSinh('ddlPhuongAnTuyenSinh', '');
                    me.genCombo_PhuongAnTuyenSinh('ddlKH_PhuongAnTuyenSinh', '');
                }
                else {
                    edu.system.alert("Pr_Ts_PA_TuyenSinh_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_PA_TuyenSinh_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_PhuongAnTuyenSinh: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtPhuongAnTuyenSinh,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENPHUONGANTUYENSINH",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Phương án tuyển sinh"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Lấy danh mục Tình trạng kế hoạch (bảng DM: TS.KEHOACH.TINHTRANG)
    -------------------------------------------*/
    getList_TinhTrangKeHoach: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.TINHTRANG",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_TinhTrangKeHoach);
    },

    cbGetList_TinhTrangKeHoach: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtTinhTrangKeHoach = data || [];
        me.genCombo_TinhTrangKeHoach('ddlTinhTrangKeHoach', '');
        me.genCombo_TinhTrangKeHoach('ddlKH_TinhTrang', '');
    },

    genCombo_TinhTrangKeHoach: function (strDrop_Id, default_val) {
        var me = this;
        // value của option = MA (vì API list nhận strPlan_Status_Code)
        var obj = {
            data: me.dtTinhTrangKeHoach,
            renderInfor: {
                id: "MA",
                parentId: "",
                name: "TEN",
                code: "MA"
            },
            renderPlace: [strDrop_Id],
            title: "Tình trạng kế hoạch",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_List
    -- Lấy danh sách kế hoạch tuyển sinh theo filter
    -------------------------------------------*/
    getList_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCgkeFTQ4JC8SKC8pHgYkNR4NKDI1',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_List',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_TuKhoa'),
            'strLoai_TuyenSinh_Id': edu.system.getValById('ddlLoaiNguonTuyenSinh'),
            'strTs_PhuongAn_TuyenSinh_Id': edu.system.getValById('ddlPhuongAnTuyenSinh'),
            'strNam_TuyenSinh': edu.system.getValById('txtSearch_NamTuyenSinh'),
            'strNam_Hoc': edu.system.getValById('txtSearch_NamHoc'),
            'strHoc_Ky': edu.system.getValById('txtSearch_HocKy'),
            'strPlan_Status_Code': edu.system.getValById('ddlTinhTrangKeHoach'),
            'dIs_Active': edu.system.getValById('ddlConHieuLuc'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtKeHoachTuyenSinh = dtResult;
                    me.genTable_KeHoachTuyenSinh(dtResult, iPager);
                }
                else {
                    edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_List: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_List (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng danh sách kế hoạch tuyển sinh
    -- NOTE: tên cột (KEHOACH_MA, KEHOACH_TEN, ...) đoán theo convention.
    --       Nếu API trả về tên khác thì chỉnh trong hàm này.
    -------------------------------------------*/
    genTable_KeHoachTuyenSinh: function (data, iPager) {
        $("#lblKeHoachTuyenSinh_Tong").html(data.length || 0);
        var $tbody = $("#tblKHtyensinh tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="21">Không có dữ liệu</td></tr>');
            return;
        }

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || '';
            rows += '<tr id="row_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + (d.KEHOACH_MA || '') + '</td>'
                +  '<td class="td-left">' + (d.KEHOACH_TEN || '') + '</td>'
                +  '<td class="td-left">' + (d.LOAITUYENSINH_TEN || '') + '</td>'
                +  '<td class="td-left">' + (d.PHUONGANTUYENSINH_TEN || '') + '</td>'
                +  '<td class="td-center">' + (d.NAM_TUYENSINH || '') + '</td>'
                +  '<td class="td-center">' + (d.NAM_HOC || '') + '</td>'
                +  '<td class="td-center">' + (d.HOC_KY || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Các đợt tuyển sinh" data-bs-toggle="modal" data-bs-target="#dot-tuyen-sinh">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Phân công nhân sự" data-bs-toggle="modal" data-bs-target="#phan-cong-nhan-su">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kế hoạch đầu ra" data-bs-toggle="modal" data-bs-target="#ke-hoach-dau-ra">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Quy định phí" data-bs-toggle="modal" data-bs-target="#quy-dinh-phi">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Mẫu khai hồ sơ" data-bs-toggle="modal" data-bs-target="#mau-khai-hs">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kết quả đăng ký" data-bs-toggle="modal" data-bs-target="#ket-qua-dk">Xem</a></td>'
                +  '<td class="td-left">' + (d.TINHTRANG_TEN || '') + '</td>'
                +  '<td class="td-center">' + (d.IS_PUBLIC == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_LOCKED == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_ACTIVE == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.NGUOITAO_TEN || '') + '</td>'
                +  '<td class="td-center">' + (d.NGAYTAO || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetail" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết" data-bs-toggle="modal" data-bs-target="#chi-tiet">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_By_Id
    -- Lấy chi tiết kế hoạch tuyển sinh theo ID
    -------------------------------------------*/
    getDetail_KeHoachTuyenSinh: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCgkeFTQ4JC8SKC8pHgYkNR4DOB4IJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_By_Id',
            'iM': edu.system.iM,
            'strId': strId,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = null;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = Array.isArray(data.Data) ? data.Data[0] : data.Data;
                    }
                    me.dtChiTiet = dtResult;
                    me.view_ChiTietKeHoach(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Đổ dữ liệu chi tiết vào modal #chi-tiet
    -- NOTE: tên cột (KEHOACH_MA, KEHOACH_TEN, ...) đoán theo convention.
    --       Nếu API trả tên khác thì sửa lại tại đây.
    -------------------------------------------*/
    view_ChiTietKeHoach: function (data) {
        if (!data) return;
        var d = data;

        edu.util.viewValById('txtKH_Ma', d.KEHOACH_MA || '');
        edu.util.viewValById('txtKH_Ten', d.KEHOACH_TEN || '');
        edu.util.viewValById('txtKH_NamTuyenSinh', d.NAM_TUYENSINH || '');
        edu.util.viewValById('txtKH_NamHoc', d.NAM_HOC || '');
        edu.util.viewValById('txtKH_HocKy', d.HOC_KY || '');
        edu.util.viewValById('txtKH_SoHoSoToiDa', d.MAX_HOSO_PER_PERSON || '');
        edu.util.viewValById('txtKH_ChiTieu', d.CHI_TIEU || '');
        edu.util.viewValById('txtKH_GhiChu', d.GHICHU || '');

        edu.util.viewValById('lblKH_SoDaDangKy', d.SO_DA_DANGKY || 0);
        edu.util.viewValById('lblKH_SoDaNopHS', d.SO_DA_NOP_HOSO || 0);
        edu.util.viewValById('lblKH_SoDaTrungTuyen', d.SO_DA_TRUNGTUYEN || 0);
        edu.util.viewValById('lblKH_SoDaTiepNhan', d.SO_DA_TIEPNHAN || 0);
        edu.util.viewValById('lblKH_SoDaNhapHoc', d.SO_DA_NHAPHOC || 0);

        $('#ddlKH_LoaiNguonTuyenSinh').val(d.LOAI_TUYENSINH_ID || '');
        $('#ddlKH_PhuongAnTuyenSinh').val(d.TS_PHUONGAN_TUYENSINH_ID || '');
        $('#ddlKH_MauHoSo').val(d.FORM_LAYOUT_ID || '');
        $('#ddlKH_DonViQLKH').val(d.OWNER_ORG_ID || '');
        $('#ddlKH_DonViQLHS').val(d.MANAGE_ORG_ID || '');
        $('#ddlKH_DonViTiepNhan').val(d.RECEIVE_ORG_ID || '');
        $('#ddlKH_TinhTrang').val(d.PLAN_STATUS_CODE || '');

        $('#chkKH_TaoTaiKhoan').prop('checked', d.REQUIRE_ACCOUNT == 1);
        $('#chkKH_ChoTSTuDangKy').prop('checked', d.ALLOW_ONLINE_REGISTER == 1);
        $('#chkKH_ChoCanBoNhapHS').prop('checked', d.ALLOW_DIRECT_INPUT == 1);
        $('#chkKH_ChoImport').prop('checked', d.ALLOW_IMPORT == 1);
        $('#chkKH_ChoDocApi').prop('checked', d.ALLOW_API == 1);
        $('#chkKH_YeuCauCanBoDuyet').prop('checked', d.REQUIRE_APPROVAL == 1);
        $('#chkKH_YeuCauKiemTraHS').prop('checked', d.REQUIRE_DOCUMENT_CHECK == 1);
        $('#chkKH_YeuCauThanhToan').prop('checked', d.REQUIRE_PAY_BEFORE_INTAKE == 1);
        $('#chkKH_ChoPhepThayDoiDauRa').prop('checked', d.ALLOW_CHANGE_OUTPUT == 1);
        $('#chkKH_KiemSoatTrungHS').prop('checked', edu.util.checkValue(d.HOSO_UNIQUE_SCOPE_CODE));
        $('#chkKH_CoMoPublic').prop('checked', d.IS_PUBLIC == 1);
        $('#chkKH_CoKhoa').prop('checked', d.IS_LOCKED == 1);
        $('#chkKH_ConHieuLuc').prop('checked', d.IS_ACTIVE == 1);
    },

    /*------------------------------------------
    -- Lấy danh mục Phân loại đợt (DM: TS.KEHOACH.DOT.KIEUDOT)
    -------------------------------------------*/
    getList_KieuDot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.DOT.KIEUDOT",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_KieuDot);
    },

    cbGetList_KieuDot: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtKieuDot = data || [];
        me.genCombo_KieuDot('ddl_KieuDot', '');
    },

    genCombo_KieuDot: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtKieuDot,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn phân loại đợt",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Lấy danh mục Tình trạng đợt (DM: TS.KEHOACH.DOT.TINHTRANG)
    -------------------------------------------*/
    getList_TinhTrangDot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.DOT.TINHTRANG",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_TinhTrangDot);
    },

    cbGetList_TinhTrangDot: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtTinhTrangDot = data || [];
        me.genCombo_TinhTrangDot('ddl_TinhTrangDot', '');
    },

    genCombo_TinhTrangDot: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtTinhTrangDot,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn tình trạng đợt",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Reset form Thêm mới đợt
    -------------------------------------------*/
    rewrite_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var arrTxt = [
            'txtDot_Ma', 'txtDot_Ten', 'txtDot_SoDotThu',
            'txtDot_NgayBatDau_DangKy', 'txtDot_NgayKetThuc_DangKy',
            'txtDot_NgayBatDau_NopHS', 'txtDot_NgayKetThuc_NopHS',
            'txtDot_NgayBatDau_XuLy', 'txtDot_NgayKetThuc_XuLy',
            'txtDot_NgayCongBoKQ',
            'txtDot_NgayBatDau_XNNH', 'txtDot_NgayKetThuc_XNNH',
            'txtDot_ChiTieu', 'txtDot_GhiChu',
            'lblDot_SoDaDangKy', 'lblDot_SoDaNopHS', 'lblDot_SoDaTrungTuyen',
            'lblDot_SoDaTiepNhan', 'lblDot_SoDaNhapHoc'
        ];
        edu.util.resetValByArrId(arrTxt);
        $('#ddl_KieuDot, #ddl_MauHoSo, #ddl_TinhTrangDot').val('');
        $('#chkDot_YeuCauCanBoDuyet, #chkDot_YeuCauKiemTraHS, #chkDot_YeuCauThanhToan, #chkDot_ChoPhepThayDoiDauRa, #chkDot_CoMoPublic, #chkDot_CoKhoa').prop('checked', false);
        $('#chkDot_ConHieuLuc').prop('checked', true);
        me.strDot_Id = '';
        $('#them-moi .modal-header .title').html('<i class="fa-regular fa-plus"></i> Thêm mới đợt tuyển sinh');
        $('#btnDelete_Dot').addClass('d-none');  // ẩn nút Xóa khi Thêm mới
    },

    /*------------------------------------------
    -- Dispatcher: nếu strDot_Id có → update, không có → insert
    -------------------------------------------*/
    save_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (edu.util.checkValue(me.strDot_Id)) {
            me.update_Dot();
        } else {
            me.insert_Dot();
        }
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Ins
    -- Thêm mới đợt tuyển sinh
    -------------------------------------------*/
    insert_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Vui lòng chọn kế hoạch tuyển sinh trước khi thêm đợt", "w");
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HggvMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Ins',
            'iM': edu.system.iM,
            'strTs_KeHoach_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTen': edu.system.getValById('txtDot_Ten'),
            'strMa': edu.system.getValById('txtDot_Ma'),
            'dDot_No': edu.system.getValById('txtDot_SoDotThu'),
            'strDot_Type_Code': edu.system.getValById('ddl_KieuDot'),
            'strNgay_BatDau_DangKy': edu.system.getValById('txtDot_NgayBatDau_DangKy'),
            'strNgay_KetThuc_DangKy': edu.system.getValById('txtDot_NgayKetThuc_DangKy'),
            'strNgay_BatDau_Nop_HoSo': edu.system.getValById('txtDot_NgayBatDau_NopHS'),
            'strNgay_KetThuc_Nop_HoSo': edu.system.getValById('txtDot_NgayKetThuc_NopHS'),
            'strNgay_BatDau_XuLy': edu.system.getValById('txtDot_NgayBatDau_XuLy'),
            'strNgay_KetThuc_XuLy': edu.system.getValById('txtDot_NgayKetThuc_XuLy'),
            'strNgay_CongBo_KetQua': edu.system.getValById('txtDot_NgayCongBoKQ'),
            'strNgay_BD_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayBatDau_XNNH'),
            'strNgay_KT_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayKetThuc_XNNH'),
            'strNgay_BatDau_NhapHoc': '',
            'strNgay_KetThuc_NhapHoc': '',
            'dRequire_Approval_In_Dot': $('#chkDot_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Payment_In_Dot': $('#chkDot_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dRequire_Document_In_Dot': $('#chkDot_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dAllow_Change_OP_In_Dot': $('#chkDot_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strForm_Layout_Id': edu.system.getValById('ddl_MauHoSo'),
            'dForm_Version_No': '',
            'dChi_Tieu': edu.system.getValById('txtDot_ChiTieu'),
            'dSo_Da_DangKy': edu.system.getValById('lblDot_SoDaDangKy'),
            'dSo_Da_Nop_HoSo': edu.system.getValById('lblDot_SoDaNopHS'),
            'dSo_Da_TrungTuyen': edu.system.getValById('lblDot_SoDaTrungTuyen'),
            'dSo_Da_TiepNhan': edu.system.getValById('lblDot_SoDaTiepNhan'),
            'dSo_Da_NhapHoc': edu.system.getValById('lblDot_SoDaNhapHoc'),
            'strDot_Status_Code': edu.system.getValById('ddl_TinhTrangDot'),
            'dIs_Public': $('#chkDot_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Default': 0,
            'dIs_Locked': $('#chkDot_CoKhoa').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkDot_ConHieuLuc').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtDot_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'THEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thêm mới thành công");
                    $("#them-moi").modal('hide');
                    me.getList_DotTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Ins: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Ins (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Upd
    -- Cập nhật đợt tuyển sinh (Xem-sửa)
    -------------------------------------------*/
    update_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strDot_Id)) {
            edu.system.alert("Chưa chọn đợt để sửa", "w");
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HhQxJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Upd',
            'iM': edu.system.iM,
            'strId': me.strDot_Id,
            'strTs_KeHoach_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTen': edu.system.getValById('txtDot_Ten'),
            'strMa': edu.system.getValById('txtDot_Ma'),
            'dDot_No': edu.system.getValById('txtDot_SoDotThu'),
            'strDot_Type_Code': edu.system.getValById('ddl_KieuDot'),
            'strNgay_BatDau_DangKy': edu.system.getValById('txtDot_NgayBatDau_DangKy'),
            'strNgay_KetThuc_DangKy': edu.system.getValById('txtDot_NgayKetThuc_DangKy'),
            'strNgay_BatDau_Nop_HoSo': edu.system.getValById('txtDot_NgayBatDau_NopHS'),
            'strNgay_KetThuc_Nop_HoSo': edu.system.getValById('txtDot_NgayKetThuc_NopHS'),
            'strNgay_BatDau_XuLy': edu.system.getValById('txtDot_NgayBatDau_XuLy'),
            'strNgay_KetThuc_XuLy': edu.system.getValById('txtDot_NgayKetThuc_XuLy'),
            'strNgay_CongBo_KetQua': edu.system.getValById('txtDot_NgayCongBoKQ'),
            'strNgay_BD_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayBatDau_XNNH'),
            'strNgay_KT_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayKetThuc_XNNH'),
            'strNgay_BatDau_NhapHoc': '',
            'strNgay_KetThuc_NhapHoc': '',
            'dRequire_Approval_In_Dot': $('#chkDot_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Payment_In_Dot': $('#chkDot_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dRequire_Document_In_Dot': $('#chkDot_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dAllow_Change_OP_In_Dot': $('#chkDot_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strForm_Layout_Id': edu.system.getValById('ddl_MauHoSo'),
            'dForm_Version_No': '',
            'dChi_Tieu': edu.system.getValById('txtDot_ChiTieu'),
            'strDot_Status_Code': edu.system.getValById('ddl_TinhTrangDot'),
            'dIs_Public': $('#chkDot_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Default': 0,
            'dIs_Locked': $('#chkDot_CoKhoa').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkDot_ConHieuLuc').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtDot_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#them-moi").modal('hide');
                    me.getList_DotTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Upd: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Upd (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Del
    -- Xóa đợt tuyển sinh
    -------------------------------------------*/
    delete_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HgUkLQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Del',
            'iM': edu.system.iM,
            'strId': me.strDot_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công");
                    $("#them-moi").modal('hide');
                    me.strDot_Id = '';
                    me.getList_DotTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Del: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Del (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Update
    -- Lưu chỉnh sửa kế hoạch tuyển sinh
    -------------------------------------------*/
    update_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Chưa chọn kế hoạch để sửa", "w");
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCiQJLiAiKR4VNDgkLxIoLykeFDElIDUk',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Update',
            'iM': edu.system.iM,
            'strId': me.strKeHoachTuyenSinh_Id,
            'strMa': edu.system.getValById('txtKH_Ma'),
            'strTen': edu.system.getValById('txtKH_Ten'),
            'strLoai_TuyenSinh_Id': edu.system.getValById('ddlKH_LoaiNguonTuyenSinh'),
            'strTs_PhuongAn_TuyenSinh_Id': edu.system.getValById('ddlKH_PhuongAnTuyenSinh'),
            'strNam_TuyenSinh': edu.system.getValById('txtKH_NamTuyenSinh'),
            'strNam_Hoc': edu.system.getValById('txtKH_NamHoc'),
            'strHoc_Ky': edu.system.getValById('txtKH_HocKy'),
            'dRequire_Account': $('#chkKH_TaoTaiKhoan').is(':checked') ? 1 : 0,
            'dAllow_Online_Register': $('#chkKH_ChoTSTuDangKy').is(':checked') ? 1 : 0,
            'dAllow_Direct_Input': $('#chkKH_ChoCanBoNhapHS').is(':checked') ? 1 : 0,
            'dAllow_Import': $('#chkKH_ChoImport').is(':checked') ? 1 : 0,
            'dAllow_Api': $('#chkKH_ChoDocApi').is(':checked') ? 1 : 0,
            'dRequire_Approval': $('#chkKH_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Document_Check': $('#chkKH_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dRequire_Pay_Before_Intake': $('#chkKH_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dAllow_Change_Output': $('#chkKH_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strHoso_Unique_Scope_Code': $('#chkKH_KiemSoatTrungHS').is(':checked') ? '1' : '',
            'dMax_Hoso_Per_Person': edu.system.getValById('txtKH_SoHoSoToiDa'),
            'strForm_Layout_Id': edu.system.getValById('ddlKH_MauHoSo'),
            'strForm_Version_No': '',
            'strOwner_Org_Id': edu.system.getValById('ddlKH_DonViQLKH'),
            'strManage_Org_Id': edu.system.getValById('ddlKH_DonViQLHS'),
            'strReceive_Org_Id': edu.system.getValById('ddlKH_DonViTiepNhan'),
            'dChi_Tieu': edu.system.getValById('txtKH_ChiTieu'),
            'strPlan_Status_Code': edu.system.getValById('ddlKH_TinhTrang'),
            'dIs_Public': $('#chkKH_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Locked': $('#chkKH_CoKhoa').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtKH_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#chi-tiet").modal('hide');
                    me.getList_KeHoachTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Update: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Update (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_By_Id
    -- Lấy chi tiết đợt theo ID
    -------------------------------------------*/
    getDetail_Dot: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HgYkNR4DOB4IJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_By_Id',
            'iM': edu.system.iM,
            'strId': strId
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = null;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = Array.isArray(data.Data) ? data.Data[0] : data.Data;
                    }
                    me.dtChiTietDot = dtResult;
                    me.view_ChiTietDot(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Đổ data đợt vào modal #them-moi (chế độ Xem-sửa)
    -- NOTE: tên cột (Ma, Ten, DOT_NO, DOT_TYPE_CODE, NGAY_BATDAU_DANGKY, ...) đoán theo convention.
    --       Nếu API trả khác thì sửa lại tại đây.
    -------------------------------------------*/
    view_ChiTietDot: function (data) {
        if (!data) return;
        var d = data;

        // Đổi title sang chế độ Xem-sửa + hiện nút Xóa
        $('#them-moi .modal-header .title').html('<i class="fa-regular fa-pen-to-square"></i> Xem - sửa đợt tuyển sinh');
        $('#btnDelete_Dot').removeClass('d-none');

        edu.util.viewValById('txtDot_Ma', d.Ma || d.MA || '');
        edu.util.viewValById('txtDot_Ten', d.Ten || d.TEN || '');
        edu.util.viewValById('txtDot_SoDotThu', d.DOT_NO || '');
        edu.util.viewValById('txtDot_NgayBatDau_DangKy', d.NGAY_BATDAU_DANGKY || '');
        edu.util.viewValById('txtDot_NgayKetThuc_DangKy', d.NGAY_KETTHUC_DANGKY || '');
        edu.util.viewValById('txtDot_NgayBatDau_NopHS', d.NGAY_BATDAU_NOP_HOSO || '');
        edu.util.viewValById('txtDot_NgayKetThuc_NopHS', d.NGAY_KETTHUC_NOP_HOSO || '');
        edu.util.viewValById('txtDot_NgayBatDau_XuLy', d.NGAY_BATDAU_XULY || '');
        edu.util.viewValById('txtDot_NgayKetThuc_XuLy', d.NGAY_KETTHUC_XULY || '');
        edu.util.viewValById('txtDot_NgayCongBoKQ', d.NGAY_CONGBO_KETQUA || '');
        edu.util.viewValById('txtDot_NgayBatDau_XNNH', d.NGAY_BD_XACNHAN_NHAPHOC || '');
        edu.util.viewValById('txtDot_NgayKetThuc_XNNH', d.NGAY_KT_XACNHAN_NHAPHOC || '');
        edu.util.viewValById('txtDot_ChiTieu', d.CHI_TIEU || '');
        edu.util.viewValById('txtDot_GhiChu', d.GHICHU || '');

        edu.util.viewValById('lblDot_SoDaDangKy', d.SO_DA_DANGKY || 0);
        edu.util.viewValById('lblDot_SoDaNopHS', d.SO_DA_NOP_HOSO || 0);
        edu.util.viewValById('lblDot_SoDaTrungTuyen', d.SO_DA_TRUNGTUYEN || 0);
        edu.util.viewValById('lblDot_SoDaTiepNhan', d.SO_DA_TIEPNHAN || 0);
        edu.util.viewValById('lblDot_SoDaNhapHoc', d.SO_DA_NHAPHOC || 0);

        $('#ddl_KieuDot').val(d.DOT_TYPE_CODE || '');
        $('#ddl_MauHoSo').val(d.FORM_LAYOUT_ID || '');
        $('#ddl_TinhTrangDot').val(d.DOT_STATUS_CODE || '');

        $('#chkDot_YeuCauCanBoDuyet').prop('checked', d.REQUIRE_APPROVAL_IN_DOT == 1);
        $('#chkDot_YeuCauKiemTraHS').prop('checked', d.REQUIRE_DOCUMENT_IN_DOT == 1);
        $('#chkDot_YeuCauThanhToan').prop('checked', d.REQUIRE_PAYMENT_IN_DOT == 1);
        $('#chkDot_ChoPhepThayDoiDauRa').prop('checked', d.ALLOW_CHANGE_OP_IN_DOT == 1);
        $('#chkDot_CoMoPublic').prop('checked', d.IS_PUBLIC == 1);
        $('#chkDot_CoKhoa').prop('checked', d.IS_LOCKED == 1);
        $('#chkDot_ConHieuLuc').prop('checked', d.IS_ACTIVE == 1);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_Ds
    -- Lấy danh sách đợt theo kế hoạch (modal #dot-tuyen-sinh)
    -------------------------------------------*/
    getList_DotTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.genTable_DotTuyenSinh([]);
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strTs_KeHoach_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strDot_Status_Code': '',
            'dIs_Active': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtDotTuyenSinh = dtResult;
                    me.genTable_DotTuyenSinh(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng đợt tuyển sinh trong modal #dot-tuyen-sinh
    -- Cột data: Ma, Ten, DOT_TYPE_CODE_Ten, NGAY_BATDAU_DANGKY, NGAY_KETTHUC_DANGKY,
    --           DOT_STATUS_CODE_Ten, IS_PUBLIC, IS_LOCKED, IS_ACTIVE,
    --           NGUOITAO_TaiKhoan, NgayTao_dd_mm_yyyy_hhmmss
    -------------------------------------------*/
    genTable_DotTuyenSinh: function (data) {
        var $tbody = $("#tblDotTuyenSinh tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="17">Không có dữ liệu</td></tr>');
            return;
        }

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || '';
            rows += '<tr id="row_dot_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + (d.Ma || '') + '</td>'
                +  '<td class="td-left">' + (d.Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DOT_TYPE_CODE_Ten || '') + '</td>'
                +  '<td class="td-center">' + (d.NGAY_BATDAU_DANGKY || '') + '</td>'
                +  '<td class="td-center">' + (d.NGAY_KETTHUC_DANGKY || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Phương thức tuyển" data-bs-toggle="modal" data-bs-target="#phuong-thuc-tuyen">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kế hoạch đầu ra" data-bs-toggle="modal" data-bs-target="#ke-hoach-dau-ra">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Mẫu khai hồ sơ" data-bs-toggle="modal" data-bs-target="#mau-khai-hs">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kết quả đăng ký" data-bs-toggle="modal" data-bs-target="#ket-qua-dk">Xem</a></td>'
                +  '<td class="td-left">' + (d.DOT_STATUS_CODE_Ten || '') + '</td>'
                +  '<td class="td-center">' + (d.IS_PUBLIC == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_LOCKED == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_ACTIVE == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.NGUOITAO_TaiKhoan || '') + '</td>'
                +  '<td class="td-center">' + (d.NgayTao_dd_mm_yyyy_hhmmss || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetailDot" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Delete
    -- Xóa kế hoạch tuyển sinh
    -------------------------------------------*/
    delete_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCiQJLiAiKR4VNDgkLxIoLykeBSQtJDUk',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Delete',
            'iM': edu.system.iM,
            'strId': me.strKeHoachTuyenSinh_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công");
                    $("#chi-tiet").modal('hide');
                    me.strKeHoachTuyenSinh_Id = '';
                    me.getList_KeHoachTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Delete: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Delete (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    }
};
