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
    dtCoCauToChuc: [],
    strKeHoachTuyenSinh_Id: '',
    dtChiTiet: null,
    dtKieuDot: [],
    dtTinhTrangDot: [],
    dtDotTuyenSinh: [],
    strDot_Id: '',
    dtChiTietDot: null,
    dtPhanCongNhanSu: [],
    strPhanCong_Id: '',
    dtChiTietPhanCong: null,
    dtVaiTro_PhanCong: [],
    dtKeHoachDauRa: [],
    strDauRa_Id: '',
    dtChiTietDauRa: null,
    dtHeDaoTao_DR: [],
    dtKhoaDaoTao_DR: [],
    dtChuongTrinh_DR: [],
    dtLoaiDauRa: [],
    dtKieuHocTap: [],
    dtTrangThaiDauRa: [],

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
        me.getList_VaiTro_PhanCong();
        me.getList_LoaiDauRa();
        me.getList_KieuHocTap();
        me.getList_TrangThaiDauRa();
        me.getList_CoCauToChuc();
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
                // Chế độ Xem-sửa: hiện nút Xóa, đổi title
                $('#chi-tiet .modal-header .title').html('<i class="fa-regular fa-pen-to-square"></i> Xem - sửa kế hoạch tuyển sinh');
                $('#btnDelete_KH').removeClass('d-none');
            }
        });

        // Click "Thêm mới" main page → mở #chi-tiet ở chế độ Thêm mới
        $("#btnAddKeHoach").click(function () {
            me.strKeHoachTuyenSinh_Id = '';
            me.rewrite_KeHoach();
        });

        // Khi user click "Xem" ở cột "Các đợt tuyển sinh" → ghi nhớ KH parent để dùng khi Thêm mới đợt
        $("#tblKHtyensinh").delegate('[data-bs-target="#dot-tuyen-sinh"]', "click", function () {
            me.strKeHoachTuyenSinh_Id = $(this).attr('data-id');
        });

        // Auto-load danh sách đợt khi mở modal Các đợt tuyển sinh
        $("#dot-tuyen-sinh").on('show.bs.modal', function () {
            me.getList_DotTuyenSinh();
        });

        // Khi user click "Xem" ở cột "Phân công nhân sự" → ghi nhớ KH parent + auto load
        $("#tblKHtyensinh").delegate('[data-bs-target="#phan-cong-nhan-su"]', "click", function () {
            me.strKeHoachTuyenSinh_Id = $(this).attr('data-id');
        });
        $("#phan-cong-nhan-su").on('show.bs.modal', function () {
            me.getList_PhanCongNhanSu();
        });

        // Khi user click "Xem" ở cột "Kế hoạch đầu ra" → ghi nhớ KH parent + auto load
        $("#tblKHtyensinh").delegate('[data-bs-target="#ke-hoach-dau-ra"]', "click", function () {
            me.strKeHoachTuyenSinh_Id = $(this).attr('data-id');
        });
        $("#ke-hoach-dau-ra").on('show.bs.modal', function () {
            me.getList_KeHoachDauRa();
        });

        // Modal Thêm mới kế hoạch đầu ra: cascading Hệ → Khóa → Chương trình
        $("#them-moi-dau-ra").on('show.bs.modal', function () {
            me.rewrite_DauRa();
            me.getList_HeDaoTao_DR();
        });
        $("#ddlDR_HeDaoTao").on('change', function () {
            $("#ddlDR_KhoaDaoTao").html('<option value="">Chọn khóa đào tạo</option>');
            $("#tblChuongTrinhDauRa tbody").html("");
            if ($(this).val()) me.getList_KhoaDaoTao_DR();
        });
        $("#ddlDR_KhoaDaoTao").on('change', function () {
            $("#tblChuongTrinhDauRa tbody").html("");
            if ($(this).val()) me.getList_ChuongTrinh_DR();
        });
        $("#chkDR_SelectAll").click(function () {
            var checked = $(this).is(':checked');
            $('#tblChuongTrinhDauRa tbody .ct-select').prop('checked', checked);
        });
        $("#btnSaveDauRa").click(function () {
            me.save_DauRa();
        });

        $("#btnUpdate_DauRa").click(function () {
            me.update_DauRa();
        });
        $("#btnDelete_DauRa").click(function () {
            if (!edu.util.checkValue(me.strDauRa_Id)) {
                edu.system.alert("Chưa chọn đầu ra để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa đầu ra này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_DauRa();
            });
        });

        // Click "Chi tiết" trên row kế hoạch đầu ra → fetch detail (form modal sẽ build sau)
        $("#tblKeHoachDauRa").delegate(".btnDetailDauRa", "click", function () {
            var strId = $(this).attr('data-id');
            if (!edu.util.checkValue(strId)) return;
            if ($('#xem-sua-dau-ra').length) {
                $('#xem-sua-dau-ra').modal('show');
            }
            me.strDauRa_Id = strId;
            me.getDetail_DauRa(strId);
        });

        // Click "Chi tiết" trên row phân công nhân sự → mở modal Xem-sửa và populate
        $("#tblPhanCongNhanSu").delegate(".btnDetailPhanCong", "click", function () {
            var strId = $(this).attr('data-id');
            if (!edu.util.checkValue(strId)) return;
            $('#xem-sua-phancong').modal('show');
            me.strPhanCong_Id = strId;
            me.getDetail_PhanCong(strId);
        });

        $("#btnUpdate_PhanCong").click(function () {
            me.update_PhanCong();
        });

        $("#btnDelete_PhanCong").click(function () {
            if (!edu.util.checkValue(me.strPhanCong_Id)) {
                edu.system.alert("Chưa chọn phân công để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa phân công này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_PhanCong();
            });
        });

        // Modal Thêm mới phân công nhân sự
        $("#them-moi-nhansu").on('show.bs.modal', function () {
            me.rewrite_PhanCong();
        });

        $("#btnChonNhanSu").click(function () {
            // TODO: tích hợp shared picker chọn nhân sự (Bích/Linh/Hiệp đang trao đổi)
            edu.system.alert("Tính năng chọn nhân sự đang được Linh/Hiệp build form chung toàn hệ thống. Khi sẵn sàng sẽ wire vào hàm me.addNhanSu_PhanCong(arrPersons).", "i");
        });

        // Master checkbox "Chọn all"
        $("#chkPC_SelectAll").click(function () {
            var checked = $(this).is(':checked');
            $('#tblNhanSuDaChon tbody .pc-select').prop('checked', checked);
        });

        $("#btnSavePhanCong").click(function () {
            me.save_PhanCong();
        });

        // Click "Chi tiết" trên row đợt → mở form đợt ở chế độ Xem-sửa, populate data
        $("#tblDotTuyenSinh").delegate(".btnDetailDot", "click", function () {
            var strId = $(this).attr('data-id');
            if (!edu.util.checkValue(strId)) return;
            $('#them-moi-dot').modal('show');   // → show.bs.modal fires → rewrite_Dot reset form trước
            me.strDot_Id = strId;                // → set sau khi rewrite_Dot xong
            me.getDetail_Dot(strId);
        });

        // Khi mở modal Thêm mới đợt → reset form
        $("#them-moi-dot").on('show.bs.modal', function () {
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
            me.save_KeHoachTuyenSinh();
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
                name: "TEN",
                code: "MA",
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
                name: "TEN",
                code: "MA",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Phương án tuyển sinh"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- [Shared] NS_CoCauToChuc/LayDanhSach
    -- Đổ vào 3 dropdown: Đơn vị quản lý KH / quản lý HS / tiếp nhận HS
    -------------------------------------------*/
    getList_CoCauToChuc: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtCoCauToChuc = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.genCombo_DonVi('ddlKH_DonViQLKH', '');
                    me.genCombo_DonVi('ddlKH_DonViQLHS', '');
                    me.genCombo_DonVi('ddlKH_DonViTiepNhan', '');
                }
            },
            error: function () { },
            type: 'GET',
            action: 'NS_CoCauToChuc/LayDanhSach',
            contentType: true,
            data: {
                'dTrangThai': 1,
                'strLoaiCoCauToChuc_Id': '',
                'strCoCauToChucCha_Id': ''
            },
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_DonVi: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtCoCauToChuc,
            renderInfor: { id: "ID", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn đơn vị",
            default_val: default_val
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
            'txtDot_ChiTieu', 'txtDot_ChiTieuToiThieu', 'txtDot_ChiTieuToiDa',
            'txtDot_GhiChu'
        ];
        edu.util.resetValByArrId(arrTxt);
        // 5 LABEL view-only — set text 0
        $('#lblDot_SoDaDangKy, #lblDot_SoDaNopHS, #lblDot_SoDaTrungTuyen, #lblDot_SoDaTiepNhan, #lblDot_SoDaNhapHoc').text('0');
        $('#ddl_KieuDot, #ddl_MauHoSo, #ddl_TinhTrangDot').val('');
        $('#chkDot_YeuCauCanBoDuyet, #chkDot_YeuCauKiemTraHS, #chkDot_YeuCauThanhToan, #chkDot_ChoPhepThayDoiDauRa, #chkDot_CoMoPublic, #chkDot_CoKhoa').prop('checked', false);
        $('#chkDot_ConHieuLuc').prop('checked', true);
        me.strDot_Id = '';
        $('#them-moi-dot .modal-header .title').html('<i class="fa-regular fa-plus"></i> Thêm mới đợt tuyển sinh');
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
            'dChi_Tieu_Toi_Thieu': edu.system.getValById('txtDot_ChiTieuToiThieu'),
            'dChi_Tieu_Toi_Da': edu.system.getValById('txtDot_ChiTieuToiDa'),
            'dSo_Da_DangKy': $('#lblDot_SoDaDangKy').text() || 0,
            'dSo_Da_Nop_HoSo': $('#lblDot_SoDaNopHS').text() || 0,
            'dSo_Da_TrungTuyen': $('#lblDot_SoDaTrungTuyen').text() || 0,
            'dSo_Da_TiepNhan': $('#lblDot_SoDaTiepNhan').text() || 0,
            'dSo_Da_NhapHoc': $('#lblDot_SoDaNhapHoc').text() || 0,
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
                    $("#them-moi-dot").modal('hide');
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
            'dChi_Tieu_Toi_Thieu': edu.system.getValById('txtDot_ChiTieuToiThieu'),
            'dChi_Tieu_Toi_Da': edu.system.getValById('txtDot_ChiTieuToiDa'),
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
                    $("#them-moi-dot").modal('hide');
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
                    $("#them-moi-dot").modal('hide');
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
    -- Reset form Kế hoạch (modal #chi-tiet) — dùng cho mode Thêm mới
    -------------------------------------------*/
    rewrite_KeHoach: function () {
        var arrTxt = [
            'txtKH_Ma', 'txtKH_Ten', 'txtKH_NamTuyenSinh', 'txtKH_NamHoc', 'txtKH_HocKy',
            'txtKH_SoHoSoToiDa', 'txtKH_ChiTieu', 'txtKH_GhiChu',
            'lblKH_SoDaDangKy', 'lblKH_SoDaNopHS', 'lblKH_SoDaTrungTuyen',
            'lblKH_SoDaTiepNhan', 'lblKH_SoDaNhapHoc'
        ];
        edu.util.resetValByArrId(arrTxt);
        $('#ddlKH_LoaiNguonTuyenSinh, #ddlKH_PhuongAnTuyenSinh, #ddlKH_MauHoSo, #ddlKH_DonViQLKH, #ddlKH_DonViQLHS, #ddlKH_DonViTiepNhan, #ddlKH_TinhTrang').val('');
        $('#chkKH_TaoTaiKhoan, #chkKH_ChoTSTuDangKy, #chkKH_ChoCanBoNhapHS, #chkKH_ChoImport, #chkKH_ChoDocApi, #chkKH_YeuCauCanBoDuyet, #chkKH_YeuCauKiemTraHS, #chkKH_YeuCauThanhToan, #chkKH_ChoPhepThayDoiDauRa, #chkKH_KiemSoatTrungHS, #chkKH_CoMoPublic, #chkKH_CoKhoa').prop('checked', false);
        $('#chkKH_ConHieuLuc').prop('checked', true);
        $('#chi-tiet .modal-header .title').html('<i class="fa-regular fa-plus"></i> Thêm mới kế hoạch tuyển sinh');
        $('#btnDelete_KH').addClass('d-none');
    },

    /*------------------------------------------
    -- Dispatcher: nếu strKeHoachTuyenSinh_Id có → update, không → insert
    -------------------------------------------*/
    save_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.update_KeHoachTuyenSinh();
        } else {
            me.insert_KeHoachTuyenSinh();
        }
    },

    /*------------------------------------------
    -- Thêm mới kế hoạch tuyển sinh
    -- TODO: bạn gửi spec API Pr_Ts_KeHoach_TuyenSinh_Insert (hoặc tương đương) để wire vào.
    -------------------------------------------*/
    insert_KeHoachTuyenSinh: function () {
        edu.system.alert("Chưa có API Insert cho kế hoạch tuyển sinh. Vui lòng gửi spec Pr_Ts_KeHoach_TuyenSinh_Insert (hoặc tương đương).", "w");
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
    -- Đổ data đợt vào modal #them-moi-dot (chế độ Xem-sửa)
    -- NOTE: tên cột (Ma, Ten, DOT_NO, DOT_TYPE_CODE, NGAY_BATDAU_DANGKY, ...) đoán theo convention.
    --       Nếu API trả khác thì sửa lại tại đây.
    -------------------------------------------*/
    view_ChiTietDot: function (data) {
        if (!data) return;
        var d = data;

        // Đổi title sang chế độ Xem-sửa + hiện nút Xóa
        $('#them-moi-dot .modal-header .title').html('<i class="fa-regular fa-pen-to-square"></i> Xem - sửa đợt tuyển sinh');
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
        edu.util.viewValById('txtDot_ChiTieuToiThieu', d.CHI_TIEU_TOI_THIEU || '');
        edu.util.viewValById('txtDot_ChiTieuToiDa', d.CHI_TIEU_TOI_DA || '');
        edu.util.viewValById('txtDot_GhiChu', d.GHICHU || '');

        // 5 LABEL view-only — set text trực tiếp (span chứ không phải input)
        $('#lblDot_SoDaDangKy').text(d.SO_DA_DANGKY || 0);
        $('#lblDot_SoDaNopHS').text(d.SO_DA_NOP_HOSO || 0);
        $('#lblDot_SoDaTrungTuyen').text(d.SO_DA_TRUNGTUYEN || 0);
        $('#lblDot_SoDaTiepNhan').text(d.SO_DA_TIEPNHAN || 0);
        $('#lblDot_SoDaNhapHoc').text(d.SO_DA_NHAPHOC || 0);

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
    -- Lấy danh mục Vai trò phân công (DM: TS.KEHOACH.NHANSU.VAITRO)
    -------------------------------------------*/
    getList_VaiTro_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.NHANSU.VAITRO",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_VaiTro_PhanCong);
    },

    cbGetList_VaiTro_PhanCong: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtVaiTro_PhanCong = data || [];
        me.genCombo_VaiTro_PhanCong('ddlXS_VaiTro', '');
    },

    genCombo_VaiTro_PhanCong: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtVaiTro_PhanCong,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn vai trò",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Reset form Thêm mới phân công nhân sự
    -------------------------------------------*/
    rewrite_PhanCong: function () {
        $("#tblNhanSuDaChon tbody").html("");
        $("#chkPC_SelectAll").prop('checked', false);
    },

    /*------------------------------------------
    -- Public method: shared picker gọi lại sau khi user chọn xong nhân sự
    -- arrPersons: [{ID, FULL_NAME, current_employee_code}, ...]
    -------------------------------------------*/
    addNhanSu_PhanCong: function (arrPersons) {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!arrPersons || !arrPersons.length) return;

        var $tbody = $("#tblNhanSuDaChon tbody");
        var startIdx = $tbody.find('tr').length;

        // Build option HTML cho dropdown Vai trò
        var optsVaiTro = '<option value="">Chọn vai trò</option>';
        for (var v = 0; v < me.dtVaiTro_PhanCong.length; v++) {
            var dm = me.dtVaiTro_PhanCong[v];
            optsVaiTro += '<option value="' + (dm.MA || '') + '">' + (dm.TEN || '') + '</option>';
        }

        var rows = '';
        for (var i = 0; i < arrPersons.length; i++) {
            var p = arrPersons[i];
            var stt = startIdx + i + 1;
            var personId = p.ID || '';
            var nhanSuTen = (p.FULL_NAME || '') + (p.current_employee_code ? ' - ' + p.current_employee_code : '');
            rows += '<tr data-person-id="' + personId + '">'
                +  '<td class="td-center td-fix">' + stt + '</td>'
                +  '<td class="td-left">' + nhanSuTen + '</td>'
                +  '<td class="td-center"><input type="checkbox" class="pc-select" checked /></td>'
                +  '<td class="td-center td-fix">'
                +    '<div class="custom-select"><i class="fa-light fa-chevron-down"></i>'
                +      '<select class="form-select pc-vaitro" style="line-height: 24px !important;padding-left: 10px !important;">' + optsVaiTro + '</select>'
                +    '</div>'
                +  '</td>'
                +  '<td class="td-center td-fix"><input class="form-control input-datepicker pc-ngaybatdau" placeholder="dd/mm/yyyy"></td>'
                +  '<td class="td-center td-fix"><input class="form-control input-datepicker pc-ngayketthuc" placeholder="dd/mm/yyyy"></td>'
                +  '<td class="td-center td-fix"><input type="checkbox" class="pc-allowed" checked /></td>'
                +  '<td class="td-center td-fix"><input type="checkbox" class="pc-active" checked /></td>'
                +  '<td class="td-center td-fix"><input class="form-control pc-ghichu"></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Ins
    -- Lưu phân công nhân sự (loop qua các row được "Chọn")
    -------------------------------------------*/
    save_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Vui lòng chọn kế hoạch tuyển sinh trước", "w");
            return;
        }

        var $rows = $("#tblNhanSuDaChon tbody tr");
        if ($rows.length === 0) {
            edu.system.alert("Vui lòng chọn nhân sự để phân công", "w");
            return;
        }

        var arrTasks = [];
        $rows.each(function () {
            var $r = $(this);
            if (!$r.find('.pc-select').is(':checked')) return;
            arrTasks.push({
                'strPerson_Id': $r.attr('data-person-id') || '',
                'strRole_Code': $r.find('.pc-vaitro').val() || '',
                'strNgay_BatDau': $r.find('.pc-ngaybatdau').val() || '',
                'strNgay_KetThuc': $r.find('.pc-ngayketthuc').val() || '',
                'dIs_Allowed': $r.find('.pc-allowed').is(':checked') ? 1 : 0,
                'dIs_Active': $r.find('.pc-active').is(':checked') ? 1 : 0,
                'strGhiChu': $r.find('.pc-ghichu').val() || ''
            });
        });

        if (arrTasks.length === 0) {
            edu.system.alert("Không có nhân sự nào được tích chọn để lưu", "w");
            return;
        }

        var done = 0;
        var failed = 0;
        var total = arrTasks.length;

        arrTasks.forEach(function (task) {
            var obj_save = {
                'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeCC8y',
                'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Ins',
                'iM': edu.system.iM,
                'strPerson_Id': task.strPerson_Id,
                'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
                'strTs_Kh_TuyenSinh_Dot_Id': '',
                'strTs_Kh_Dot_PhuongThuc_Id': '',
                'strRole_Code': task.strRole_Code,
                'strAction_Code': '',
                'strScope_Level_Code': '',
                'strNgay_BatDau': task.strNgay_BatDau,
                'strNgay_KetThuc': task.strNgay_KetThuc,
                'dIs_Allowed': task.dIs_Allowed,
                'dIs_Active': task.dIs_Active,
                'strGhiChu': task.strGhiChu,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
                'strHanhDong_Code': 'THEM'
            };

            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) done++; else failed++;
                    if (done + failed === total) {
                        edu.system.alert("Đã lưu " + done + "/" + total + (failed ? " (lỗi: " + failed + ")" : ""));
                        $("#them-moi-nhansu").modal('hide');
                        me.getList_PhanCongNhanSu();
                    }
                },
                error: function (er) {
                    failed++;
                    if (done + failed === total) {
                        edu.system.alert("Đã lưu " + done + "/" + total + " (lỗi: " + failed + ")");
                        $("#them-moi-nhansu").modal('hide');
                        me.getList_PhanCongNhanSu();
                    }
                },
                type: 'POST',
                contentType: true,
                action: obj_save.action,
                data: obj_save,
                fakedb: []
            }, false, false, false, null);
        });
    },

    /*------------------------------------------
    -- Reset modal Thêm mới kế hoạch đầu ra
    -------------------------------------------*/
    rewrite_DauRa: function () {
        $("#ddlDR_HeDaoTao").html('<option value="">Chọn hệ đào tạo</option>');
        $("#ddlDR_KhoaDaoTao").html('<option value="">Chọn khóa đào tạo</option>');
        $("#tblChuongTrinhDauRa tbody").html("");
        $("#chkDR_SelectAll").prop('checked', false);
    },

    /*------------------------------------------
    -- [Shared] KHCT_HeDaoTao/LayDanhSach
    -------------------------------------------*/
    getList_HeDaoTao_DR: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtHeDaoTao_DR = edu.util.checkValue(data.Data) ? data.Data : [];
                    var obj = {
                        data: me.dtHeDaoTao_DR,
                        renderInfor: { id: "ID", parentId: "", name: "TENHEDAOTAO" },
                        renderPlace: ['ddlDR_HeDaoTao'],
                        title: "Chọn hệ đào tạo"
                    };
                    edu.system.loadToCombo_data(obj);
                }
            },
            error: function () { },
            type: 'GET',
            action: 'KHCT_HeDaoTao/LayDanhSach',
            contentType: true,
            data: {
                'strTuKhoa': '',
                'strDaoTao_HinhThucDaoTao_Id': '',
                'strDaoTao_BacDaoTao_Id': '',
                'strNguoiThucHien_Id': '',
                'pageIndex': 1,
                'pageSize': 100000000
            },
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- [Shared] KHCT_KhoaDaoTao/LayDanhSach (cascading từ Hệ)
    -------------------------------------------*/
    getList_KhoaDaoTao_DR: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKhoaDaoTao_DR = edu.util.checkValue(data.Data) ? data.Data : [];
                    var obj = {
                        data: me.dtKhoaDaoTao_DR,
                        renderInfor: { id: "ID", parentId: "", name: "TENKHOA" },
                        renderPlace: ['ddlDR_KhoaDaoTao'],
                        title: "Chọn khóa đào tạo"
                    };
                    edu.system.loadToCombo_data(obj);
                }
            },
            error: function () { },
            type: 'GET',
            action: 'KHCT_KhoaDaoTao/LayDanhSach',
            contentType: true,
            data: {
                'strTuKhoa': '',
                'strDaoTao_HeDaoTao_Id': edu.system.getValById('ddlDR_HeDaoTao'),
                'strDaoTao_CoSoDaoTao_Id': '',
                'strNguoiThucHien_Id': '',
                'pageIndex': 1,
                'pageSize': 10000000
            },
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- [Shared] Lấy danh sách chương trình theo Hệ + Khóa
    -- TODO: bạn xác nhận action hash chính xác (đoán: KHCT_ToChucChuongTrinh/LayDanhSach)
    -------------------------------------------*/
    getList_ChuongTrinh_DR: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtChuongTrinh_DR = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.genTable_ChuongTrinh_DR(me.dtChuongTrinh_DR);
                }
                else {
                    edu.system.alert("getList_ChuongTrinh_DR: " + data.Message, "w");
                }
            },
            error: function (er) {
                // Có thể action chưa đúng — để trống bảng
                me.genTable_ChuongTrinh_DR([]);
            },
            type: 'GET',
            action: 'KHCT_ToChucChuongTrinh/LayDanhSach',  // TODO: confirm hash
            contentType: true,
            data: {
                'strTuKhoa': '',
                'strDaoTao_HeDaoTao_Id': edu.system.getValById('ddlDR_HeDaoTao'),
                'strDaoTao_KhoaDaoTao_Id': edu.system.getValById('ddlDR_KhoaDaoTao'),
                'pageIndex': 1,
                'pageSize': 100000
            },
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng chương trình với input editable
    -- Cột data: MaChuongTrinh, TenChuongTrinh, NganhTuyenSinh_Ten, DaoTao_N_CT_Ten
    -------------------------------------------*/
    genTable_ChuongTrinh_DR: function (data) {
        var $tbody = $("#tblChuongTrinhDauRa tbody");
        $tbody.html("");
        $("#chkDR_SelectAll").prop('checked', false);

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="9">Không có chương trình</td></tr>');
            return;
        }

        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var ctId = d.ID || '';
            rows += '<tr data-ct-id="' + ctId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + (d.MaChuongTrinh || '') + '</td>'
                +  '<td class="td-left">' + (d.TenChuongTrinh || '') + '</td>'
                +  '<td class="td-left">' + (d.NganhTuyenSinh_Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DaoTao_N_CT_Ten || '') + '</td>'
                +  '<td class="td-center"><input type="number" class="form-control ct-chitieu" min="0"></td>'
                +  '<td class="td-center"><input type="number" class="form-control ct-chitieu-toida" min="0"></td>'
                +  '<td class="td-center"><input type="number" class="form-control ct-chitieu-toithieu" min="0"></td>'
                +  '<td class="td-center"><input type="checkbox" class="ct-select"></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Save kế hoạch đầu ra
    -- TODO: bạn gửi API Insert + spec "Thông tin chung" để hoàn thiện
    -------------------------------------------*/
    save_DauRa: function () {
        edu.system.alert("Hàm Lưu kế hoạch đầu ra chưa có spec API + form 'Thông tin chung'. Vui lòng gửi spec để wire vào.", "w");
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_By_Id
    -- Lấy chi tiết kế hoạch đầu ra theo ID
    -------------------------------------------*/
    getDetail_DauRa: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHgYkNR4DOB4IJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_By_Id',
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
                    me.dtChiTietDauRa = dtResult;
                    me.view_ChiTietDauRa(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Lấy DM Loại đầu ra (TS.KEHOACH.DAURA.LOAI)
    -------------------------------------------*/
    getList_LoaiDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = { strMaBangDanhMuc: "TS.KEHOACH.DAURA.LOAI", strTenCotSapXep: "", iTrangThai: 1 };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_LoaiDauRa);
    },
    cbGetList_LoaiDauRa: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtLoaiDauRa = data || [];
        var obj = {
            data: me.dtLoaiDauRa,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: ['ddlDR_LoaiDauRa'],
            title: "Chọn loại đầu ra"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Lấy DM Kiểu học sau khi vào học (TS.KEHOACH.DAURA.KIEUHOC)
    -------------------------------------------*/
    getList_KieuHocTap: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = { strMaBangDanhMuc: "TS.KEHOACH.DAURA.KIEUHOC", strTenCotSapXep: "", iTrangThai: 1 };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_KieuHocTap);
    },
    cbGetList_KieuHocTap: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtKieuHocTap = data || [];
        var obj = {
            data: me.dtKieuHocTap,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: ['ddlDR_KieuHocTap'],
            title: "Chọn kiểu học"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Lấy DM Trạng thái đầu ra (TS.KEHOACH.DAURA.TRANGTHAI)
    -------------------------------------------*/
    getList_TrangThaiDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = { strMaBangDanhMuc: "TS.KEHOACH.DAURA.TRANGTHAI", strTenCotSapXep: "", iTrangThai: 1 };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_TrangThaiDauRa);
    },
    cbGetList_TrangThaiDauRa: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtTrangThaiDauRa = data || [];
        var obj = {
            data: me.dtTrangThaiDauRa,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: ['ddlDR_TrangThai'],
            title: "Chọn trạng thái"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Đổ data kế hoạch đầu ra vào modal #xem-sua-dau-ra
    -- NOTE: tên cột đoán theo convention list API (Ma, Ten, DAU_RA_TYPE_CODE, ...)
    --       Sửa lại tại đây nếu API trả tên khác.
    -------------------------------------------*/
    view_ChiTietDauRa: function (data) {
        if (!data) return;
        var d = data;

        $('#lblDR_He').text(d.DAOTAO_HEDAOTAO_Ten || d.DAOTAO_HEDAOTAO_TEN || '');
        $('#lblDR_Khoa').text(d.DAOTAO_KHOADAOTAO_Ten || d.DAOTAO_KHOADAOTAO_TEN || '');
        $('#lblDR_ChuongTrinh').text(d.DAOTAO_TOCHUCCHUONGTRINH_Ten || d.DAOTAO_TOCHUCCHUONGTRINH_TEN || '');

        edu.util.viewValById('txtDR_ChiTieu', d.CHI_TIEU || '');
        edu.util.viewValById('txtDR_ChiTieuToiDa', d.CHI_TIEU_TOI_DA || '');
        edu.util.viewValById('txtDR_ChiTieuToiThieu', d.CHI_TIEU_TOI_THIEU || '');

        edu.util.viewValById('txtDR_Ma', d.Ma || d.MA || '');
        edu.util.viewValById('txtDR_Ten', d.Ten || d.TEN || '');
        edu.util.viewValById('txtDR_MaHienThi', d.MA_HIENTHI || '');
        edu.util.viewValById('txtDR_TenHienThi', d.TEN_HIENTHI || '');

        $('#ddlDR_LoaiDauRa').val(d.DAU_RA_TYPE_CODE || '');
        $('#ddlDR_KieuHocTap').val(d.STUDY_TYPE_CODE || '');
        $('#ddlDR_TrangThai').val(d.OUTPUT_STATUS_CODE || '');

        $('#chkDR_HighLight').prop('checked', d.IS_HIGHLIGHT == 1);
        edu.util.viewValById('txtDR_ThuTuHienThi', d.THU_TU_HIENTHI || '');

        $('#chkDR_AllowRegister').prop('checked', d.IS_ALLOW_REGISTER == 1);
        $('#chkDR_AllowWaitlist').prop('checked', d.IS_ALLOW_WAITLIST == 1);
        $('#chkDR_AllowTransferIn').prop('checked', d.IS_ALLOW_TRANSFER_IN == 1);
        $('#chkDR_AutoIntake').prop('checked', d.IS_AUTO_INTAKE == 1);
        $('#chkDR_AutoEnrollment').prop('checked', d.IS_AUTO_ENROLLMENT == 1);
        $('#chkDR_AutoClassAssign').prop('checked', d.IS_AUTO_CLASS_ASSIGN == 1);

        $('#chkDR_Public').prop('checked', d.IS_PUBLIC == 1);
        $('#chkDR_Active').prop('checked', (d.is_active || d.IS_ACTIVE) == 1);
        edu.util.viewValById('txtDR_GhiChu', d.GHICHU || '');
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Upd
    -- Cập nhật kế hoạch đầu ra (Xem-sửa)
    -------------------------------------------*/
    update_DauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strDauRa_Id)) {
            edu.system.alert("Chưa chọn đầu ra để sửa", "w");
            return;
        }

        // Lấy ID Hệ/Khóa/CT/Ngành từ cache (vì label readonly không lưu được trên UI)
        var c = me.dtChiTietDauRa || {};

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHhQxJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Upd',
            'iM': edu.system.iM,
            'strId': me.strDauRa_Id,
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': c.TS_KH_TUYENSINH_DOT_ID || '',
            'strTs_Kh_Dot_PhuongThuc_Id': c.TS_KH_DOT_PHUONGTHUC_ID || '',
            'strMa': edu.system.getValById('txtDR_Ma'),
            'strTen': edu.system.getValById('txtDR_Ten'),
            'strDau_Ra_Type_Code': edu.system.getValById('ddlDR_LoaiDauRa'),
            'strStudy_Type_Code': edu.system.getValById('ddlDR_KieuHocTap'),
            'strDaotao_HeDaoTao_Id': c.DAOTAO_HEDAOTAO_ID || '',
            'strDaotao_KhoaDaoTao_Id': c.DAOTAO_KHOADAOTAO_ID || '',
            'strDaotao_ChuongTrinh_Id': c.DAOTAO_TOCHUCCHUONGTRINH_ID || c.DAOTAO_CHUONGTRINH_ID || '',
            'strDaotao_Nganh_Dt_Id': c.DAOTAO_NGANH_DT_ID || '',
            'strDaotao_Nganh_Ts_Id': c.DAOTAO_NGANH_TS_ID || '',
            'strTen_HienThi': edu.system.getValById('txtDR_TenHienThi'),
            'strMa_HienThi': edu.system.getValById('txtDR_MaHienThi'),
            'strMoTa_HienThi': c.MOTA_HIENTHI || '',
            'dThu_Tu_HienThi': edu.system.getValById('txtDR_ThuTuHienThi'),
            'dIs_HighLight': $('#chkDR_HighLight').is(':checked') ? 1 : 0,
            'dChi_Tieu': edu.system.getValById('txtDR_ChiTieu'),
            'dChi_Tieu_Toi_Da': edu.system.getValById('txtDR_ChiTieuToiDa'),
            'dChi_Tieu_Toi_Thieu': edu.system.getValById('txtDR_ChiTieuToiThieu'),
            'dIs_Allow_Register': $('#chkDR_AllowRegister').is(':checked') ? 1 : 0,
            'dIs_Allow_Waitlist': $('#chkDR_AllowWaitlist').is(':checked') ? 1 : 0,
            'dIs_Allow_Transfer_In': $('#chkDR_AllowTransferIn').is(':checked') ? 1 : 0,
            'dIs_Auto_Intake': $('#chkDR_AutoIntake').is(':checked') ? 1 : 0,
            'dIs_Auto_Enrollment': $('#chkDR_AutoEnrollment').is(':checked') ? 1 : 0,
            'dIs_Auto_Class_Assign': $('#chkDR_AutoClassAssign').is(':checked') ? 1 : 0,
            'strOutput_Status_Code': edu.system.getValById('ddlDR_TrangThai'),
            'dIs_Public': $('#chkDR_Public').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkDR_Active').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtDR_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#xem-sua-dau-ra").modal('hide');
                    me.getList_KeHoachDauRa();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Dau_Ra_Upd: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Dau_Ra_Upd (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Xóa kế hoạch đầu ra
    -- TODO: bạn gửi đúng API Pr_Ts_Kh_Dau_Ra_Del (lần trước paste nhầm Get_By_Id)
    -------------------------------------------*/
    delete_DauRa: function () {
        edu.system.alert("Chưa có API Delete cho kế hoạch đầu ra. Vui lòng gửi spec Pr_Ts_Kh_Dau_Ra_Del.", "w");
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_Ds
    -- Lấy danh sách kế hoạch đầu ra theo kế hoạch tuyển sinh
    -------------------------------------------*/
    getList_KeHoachDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.genTable_KeHoachDauRa([]);
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': '',
            'strTs_Kh_Dot_PhuongThuc_Id': '',
            'strOutput_Status_Code': '',
            'dIs_Public': '',
            'dIs_Active': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtKeHoachDauRa = dtResult;
                    me.genTable_KeHoachDauRa(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng kế hoạch đầu ra
    -- Cột data: Ma, Ten, DAU_RA_TYPE_CODE_Name, STUDY_TYPE_CODE_Name,
    --           DAOTAO_HEDAOTAO_Ten, DAOTAO_KHOADAOTAO_Ten, DAOTAO_TOCHUCCHUONGTRINH_Ten,
    --           DAOTAO_NGANH_TS_Ten, DAOTAO_NGANH_DT_Ten,
    --           TEN_HIENTHI, MA_HIENTHI, IS_HIGHLIGHT, THU_TU_HIENTHI,
    --           CHI_TIEU, CHI_TIEU_TOI_DA, CHI_TIEU_TOI_THIEU, is_active,
    --           NGUOITAO_TaiKhoan, NgayTao_dd_mm_yyyy_hhmmss
    -------------------------------------------*/
    genTable_KeHoachDauRa: function (data) {
        var $tbody = $("#tblKeHoachDauRa tbody");
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
            rows += '<tr id="row_dr_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + (d.Ma || '') + '</td>'
                +  '<td class="td-left">' + (d.Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DAU_RA_TYPE_CODE_Name || '') + '</td>'
                +  '<td class="td-left">' + (d.STUDY_TYPE_CODE_Name || '') + '</td>'
                +  '<td class="td-left">' + (d.DAOTAO_HEDAOTAO_Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DAOTAO_KHOADAOTAO_Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DAOTAO_TOCHUCCHUONGTRINH_Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DAOTAO_NGANH_TS_Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.DAOTAO_NGANH_DT_Ten || '') + '</td>'
                +  '<td class="td-left">' + (d.TEN_HIENTHI || '') + '</td>'
                +  '<td class="td-left">' + (d.MA_HIENTHI || '') + '</td>'
                +  '<td class="td-center">' + (d.IS_HIGHLIGHT == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.THU_TU_HIENTHI || '') + '</td>'
                +  '<td class="td-center">' + (d.CHI_TIEU || '') + '</td>'
                +  '<td class="td-center">' + (d.CHI_TIEU_TOI_DA || '') + '</td>'
                +  '<td class="td-center">' + (d.CHI_TIEU_TOI_THIEU || '') + '</td>'
                +  '<td class="td-center">' + (d.is_active == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.NGUOITAO_TaiKhoan || '') + '</td>'
                +  '<td class="td-center">' + (d.NgayTao_dd_mm_yyyy_hhmmss || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetailDauRa" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_By_Id
    -- Lấy chi tiết phân công nhân sự theo ID
    -------------------------------------------*/
    getDetail_PhanCong: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeBiQ1HgM4Hggl',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_By_Id',
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
                    me.dtChiTietPhanCong = dtResult;
                    me.view_ChiTietPhanCong(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Đổ data phân công vào modal #xem-sua-phancong (chế độ Xem-sửa)
    -- NOTE: tên cột (FULL_NAME, current_employee_code, role_code, ngay_batdau, ...) đoán theo convention list API.
    --       Nếu API Get_By_Id trả khác thì sửa lại.
    -------------------------------------------*/
    view_ChiTietPhanCong: function (data) {
        if (!data) return;
        var d = data;
        var nhanSuTen = (d.FULL_NAME || '') + (d.current_employee_code ? ' - ' + d.current_employee_code : '');
        $('#lblXS_NhanSu').text(nhanSuTen);

        $('#ddlXS_VaiTro').val(d.role_code || d.ROLE_CODE || '');
        edu.util.viewValById('txtXS_NgayBatDau', d.ngay_batdau || d.NGAY_BATDAU || '');
        edu.util.viewValById('txtXS_NgayKetThuc', d.ngay_ketthuc || d.NGAY_KETTHUC || '');
        edu.util.viewValById('txtXS_GhiChu', d.GHICHU || d.ghichu || '');

        $('#chkXS_Allowed').prop('checked', (d.is_allowed || d.IS_ALLOWED) == 1);
        $('#chkXS_Active').prop('checked', (d.is_active || d.IS_ACTIVE) == 1);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Upd
    -- Cập nhật phân công nhân sự (Xem-sửa)
    -------------------------------------------*/
    update_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strPhanCong_Id)) {
            edu.system.alert("Chưa chọn phân công để sửa", "w");
            return;
        }

        var personId = '';
        if (me.dtChiTietPhanCong) {
            personId = me.dtChiTietPhanCong.person_id || me.dtChiTietPhanCong.PERSON_ID
                || me.dtChiTietPhanCong.ID_PERSON || '';
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeFDEl',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Upd',
            'iM': edu.system.iM,
            'strId': me.strPhanCong_Id,
            'strPerson_Id': personId,
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': '',
            'strTs_Kh_Dot_PhuongThuc_Id': '',
            'strRole_Code': edu.system.getValById('ddlXS_VaiTro'),
            'strAction_Code': '',
            'strScope_Level_Code': '',
            'strNgay_BatDau': edu.system.getValById('txtXS_NgayBatDau'),
            'strNgay_KetThuc': edu.system.getValById('txtXS_NgayKetThuc'),
            'dIs_Allowed': $('#chkXS_Allowed').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkXS_Active').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtXS_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#xem-sua-phancong").modal('hide');
                    me.getList_PhanCongNhanSu();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Upd: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Upd (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Del
    -- Xóa phân công nhân sự
    -------------------------------------------*/
    delete_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeBSQt',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Del',
            'iM': edu.system.iM,
            'strId': me.strPhanCong_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công");
                    $("#xem-sua-phancong").modal('hide');
                    me.strPhanCong_Id = '';
                    me.getList_PhanCongNhanSu();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Del: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Del (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_Ds
    -- Lấy danh sách phân công nhân sự theo kế hoạch
    -------------------------------------------*/
    getList_PhanCongNhanSu: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.genTable_PhanCongNhanSu([]);
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeBiQ1HgUy',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_Ds',
            'iM': edu.system.iM,
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': '',
            'strPerson_Id': '',
            'strRole_Code': '',
            'strAction_Code': '',
            'dIs_Active': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtPhanCongNhanSu = dtResult;
                    me.genTable_PhanCongNhanSu(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng phân công nhân sự
    -- Cột data: FULL_NAME, current_employee_code, ts_kehoach_tuyensinh_ten,
    --           ts_kehoach_tuyensinh_dot_ten, TS_PHUONGTHUC_TUYENSINH_Ten,
    --           role_code_Name, action_code_Name, scope_level_code_Name,
    --           ngay_batdau, ngay_ketthuc, is_allowed, is_active,
    --           NGUOITAO_TaiKhoan, NgayTao_dd_mm_yyyy_hhmmss
    -------------------------------------------*/
    genTable_PhanCongNhanSu: function (data) {
        var $tbody = $("#tblPhanCongNhanSu tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="15">Không có dữ liệu</td></tr>');
            return;
        }

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || '';
            var strNhanSu = (d.FULL_NAME || '') + (d.current_employee_code ? ' - ' + d.current_employee_code : '');
            rows += '<tr id="row_pcns_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + strNhanSu + '</td>'
                +  '<td class="td-left">' + (d.ts_kehoach_tuyensinh_ten || '') + '</td>'
                +  '<td class="td-left">' + (d.ts_kehoach_tuyensinh_dot_ten || '') + '</td>'
                +  '<td class="td-left">' + (d.TS_PHUONGTHUC_TUYENSINH_Ten || '') + '</td>'
                +  '<td class="td-center">' + (d.role_code_Name || '') + '</td>'
                +  '<td class="td-center">' + (d.action_code_Name || '') + '</td>'
                +  '<td class="td-center">' + (d.scope_level_code_Name || '') + '</td>'
                +  '<td class="td-center">' + (d.ngay_batdau || '') + '</td>'
                +  '<td class="td-center">' + (d.ngay_ketthuc || '') + '</td>'
                +  '<td class="td-center">' + (d.is_allowed == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.is_active == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.NGUOITAO_TaiKhoan || '') + '</td>'
                +  '<td class="td-center">' + (d.NgayTao_dd_mm_yyyy_hhmmss || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetailPhanCong" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết">Chi tiết</a></td>'
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
