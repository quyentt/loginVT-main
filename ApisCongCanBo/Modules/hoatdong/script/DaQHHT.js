/*----------------------------------------------
--Author: TLinh
--Phone:
--Date of created: 10/06/2026
--Input:
--Output:
--Note: Danh sách quan hệ học tập (DAQHHT) - Quản lý sinh viên tổng quát
----------------------------------------------*/
function DaQHHT() { };
DaQHHT.prototype = {
    strSinhVien_Id: '',
    strQHHT_Id: '',
    strTrangThai: '',
    dtSinhVien: [],
    dtQHHT: [],
    aSinhVien: null,
    aQHHT: null,

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.loadToCombo_DanhMucDuLieu("QLSV.TRANGTHAI", "dropSearch_TrangThai", "", data => me["dtTrangThai"] = data);
        // Danh mục cho form khởi tạo định danh + tab "Hồ sơ - chính sách"
        edu.system.loadToCombo_DanhMucDuLieu("NS.GITI", "", "", function (data) { me.dtGioiTinh = data; });
        edu.system.loadToCombo_DanhMucDuLieu("NS.TOGI", "", "", function (data) { me.dtTonGiao = data; });
        edu.system.loadToCombo_DanhMucDuLieu("NS.DATO", "", "", function (data) { me.dtDanToc = data; });
        edu.system.loadToCombo_DanhMucDuLieu("NS.THANHPHANGIADINH", "", "", function (data) { me.dtHoanCanh = data; });
        edu.system.loadToCombo_DanhMucDuLieu("NS.TINHTRANGHONNHAN", "", "", function (data) { me.dtHonNhan = data; });
        edu.system.loadToCombo_DanhMucDuLieu("QLSV.DOITUONG", "", "", function (data) { me.dtDoiTuongCS = data; });
        // Danh mục cho form "Phân ngành lớp chính"
        edu.system.loadToCombo_DanhMucDuLieu("KHCT.HTDT", "", "", function (data) { me.dtHinhThucHoc = data; });
        edu.system.loadToCombo_DanhMucDuLieu("CORE_PERSON_STUDY_TRACK.STUDY_RELATION_TYPE", "", "", function (data) { me.dtDienHoc = data; });
        edu.system.loadToCombo_DanhMucDuLieu("CORE_PERSON_STUDY_TRACK.SOURCE_TYPE", "", "", function (data) { me.dtLoaiNguon = data; });
        edu.system.loadToCombo_DanhMucDuLieu("CORE_PERSON_STUDY.CHANGE_TYPE", "", "", function (data) { me.dtLoaiTiepNhan = data; });

        // Load 5 bộ lọc theo API KHCT_BIND_DIMENSION_MH
        me.getList_HeDaoTao();
        me.getList_KhoaQuanLy();
        me.getList_KhoaDaoTao();
        me.getList_ChuongTrinh();
        me.getList_LopQuanLy();

        // Dọn placeholder "" của combo Trạng thái (do loadToCombo_DanhMucDuLieu nạp)
        me.cleanupPlaceholderMulti();

        // Cascade dùng delegated event để sống sót khi select2 destroy/reinit
        // Hệ -> Khóa, CT, Lớp (KhoaQuanLy độc lập, không phụ thuộc Hệ)
        $(document).on("select2:select select2:unselect", "#dropHeDaoTao_CB", function () {
            me.getList_KhoaDaoTao();
            me.getList_ChuongTrinh();
            me.getList_LopQuanLy();
            me.getList_SinhVien();
        });
        // Khoa quản lý -> CT, Lớp
        $(document).on("select2:select select2:unselect", "#dropKhoaQuanLy_CB", function () {
            me.getList_ChuongTrinh();
            me.getList_LopQuanLy();
            me.getList_SinhVien();
        });
        // Khóa -> CT, Lớp
        $(document).on("select2:select select2:unselect", "#dropKhoaDaoTao_CB", function () {
            me.getList_ChuongTrinh();
            me.getList_LopQuanLy();
            me.getList_SinhVien();
        });
        // Chương trình -> Lớp
        $(document).on("select2:select select2:unselect", "#dropChuongTrinh_CB", function () {
            me.getList_LopQuanLy();
            me.getList_SinhVien();
        });
        $(document).on("select2:select select2:unselect", "#dropSearch_Lop", function () {
            me.getList_SinhVien();
        });
        $(document).on("select2:select select2:unselect", "#dropSearch_TrangThai", function () {
            me.getList_SinhVien();
        });

        $("#btnSearch").click(function () {
            me.dispatchTab();
        });

        $("#btnRefresh").click(function () {
            me.dispatchTab();
        });

        $("#btnResetFilter").click(function () {
            $("#dropHeDaoTao_CB,#dropKhoaDaoTao_CB,#dropKhoaQuanLy_CB,#dropChuongTrinh_CB,#dropSearch_Lop,#dropSearch_TrangThai").val(null).trigger("change");
            $("#txtSearch_TuKhoa").val("");
            me.strTrangThai = "";
            $(".btnFilterTab").removeClass("active");
            $(".btnFilterTab[data-status='']").addClass("active");
            me.dispatchTab();
        });

        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.dispatchTab();
            }
        });

        // Tab phân loại sinh viên
        $(".btnFilterTab").click(function (e) {
            e.preventDefault();
            $(".btnFilterTab").removeClass("active");
            $(this).addClass("active");
            me.strTrangThai = $(this).attr("data-status");
            me.dispatchTab();
        });

        // Click "Xem/Sửa" trong bảng Khởi tạo định danh -> đổ thông tin sang form bên phải
        $(document).on("click", "#tblKhoiTaoDinhDanh .btnViewKTDD", function () {
            var strId = $(this).attr("id");
            strId = edu.util.cutPrefixId(/viewKTDD_/g, strId);
            var aData = (me.dtKhoiTaoDinhDanh || []).find(function (e) {
                return (e.CORE_PERSON_ID || e.PERSON_ID || e.ID || e.IDENTIFIER_NO) == strId;
            });
            if (aData) {
                me.aKhoiTaoDinhDanh = aData;
                me.isThemMoi = false;
                me.renderForm_DinhDanh(aData);
            }
        });

        // Click "Thêm mới" -> reset form để khai hồ sơ mới
        $(document).on("click", "#btnKTDD_ThemMoi", function () {
            me.aKhoiTaoDinhDanh = {};
            me.isThemMoi = true;
            me.renderForm_DinhDanh({});
        });

        // ===== Tab Phân ngành lớp chính =====
        // Click "Xem" trong bảng phân ngành -> mở form bên phải
        $(document).on("click", "#tblPhanNganhLopChinh .btnPhanNganh", function () {
            var strId = $(this).attr("id");
            strId = edu.util.cutPrefixId(/phanNganh_/g, strId);
            var aData = (me.dtPhanNganhLopChinh || []).find(function (e) {
                return (e.CORE_PERSON_ID || e.PERSON_ID || e.ID || e.IDENTIFIER_NO) == strId;
            });
            if (aData) {
                me.aPhanNganh = aData;
                me.renderForm_PhanNganh(aData);
            }
        });

        // Cascade Hệ → Khóa (đồng thời reset CT, Lớp)
        $(document).on("change", "#dropPN_HeDaoTao", function () {
            me.loadCombo_PN_KhoaDaoTao();
            $("#dropPN_ChuongTrinh").html('<option value=""></option>');
            $("#dropPN_Lop").html('<option value=""></option>');
            me._initSelect2_PN("#dropPN_ChuongTrinh", "Chọn chương trình");
            me._initSelect2_PN("#dropPN_Lop", "Chọn lớp");
        });
        // Cascade Khóa → Chương trình (đồng thời reset Lớp)
        $(document).on("change", "#dropPN_KhoaDaoTao", function () {
            me.loadCombo_PN_ChuongTrinh();
            $("#dropPN_Lop").html('<option value=""></option>');
            me._initSelect2_PN("#dropPN_Lop", "Chọn lớp");
        });
        // Cascade Chương trình → Lớp
        $(document).on("change", "#dropPN_ChuongTrinh", function () {
            me.loadCombo_PN_LopQuanLy();
        });

        // Nút "Thực hiện" - confirm trước khi gọi API
        $(document).on("click", "#btnPN_ThucHien", function () {
            me.confirm_PhanNganh();
        });

        // Nút Hủy trong form định danh
        $(document).on("click", "#btnKTDD_Cancel", function () {
            me.aKhoiTaoDinhDanh = null;
            me.isThemMoi = false;
            me.resetForm_DinhDanh();
        });

        // Nút Lưu thông tin cơ bản (InsertCorePerson)
        $(document).on("click", "#btnKTDD_SaveBasic", function () {
            me.save_CorePerson();
        });

        // Nút Lưu định danh (PersonIdentifier - chờ wire API)
        $(document).on("click", "#btnKTDD_Save", function () {
            me.save_DinhDanh();
        });

        // Tab "Hồ sơ - chính sách": Lưu (auto Thêm/Sửa) + Xóa
        $(document).on("click", "#btnHSCS_Save", function () {
            me.save_HoSoChinhSach();
        });
        $(document).on("click", "#btnHSCS_Xoa", function () {
            me.delete_HoSoChinhSach();
        });

        // Xem chi tiết hồ sơ sinh viên
        $("#tblSinhVien").delegate(".btnViewSV", "click", function () {
            var strId = this.id;
            strId = edu.util.cutPrefixId(/viewSV_/g, strId);
            me.strSinhVien_Id = strId;
            me.aSinhVien = me.dtSinhVien.find(e => (e.STUDY_ID || e.ID) == strId);
            $("#modal_HoSoSinhVien").modal("show");
            me.loadHoSo_SinhVien();
            me.getList_QHHT();
        });

        // Chọn QHHT trong modal
        $("#zoneListQHHT").delegate(".rdQHHT", "change", function () {
            var strId = $(this).val();
            me.strQHHT_Id = strId;
            me.aQHHT = me.dtQHHT.find(e => e.ID == strId);
            me.genHTML_ChiTietQHHT();
            me.getList_TongQuanQHHT();
        });

        edu.system.getList_MauImport("zonebtnBaoCao_SinhVien", function (addKeyValue) {
            var obj_list = {
                'strDaoTao_HeDaoTao_Id': edu.system.getValById('dropHeDaoTao_CB'),
                'strDaoTao_KhoaDaoTao_Id': edu.system.getValById('dropKhoaDaoTao_CB'),
                'strDaoTao_KhoaQuanLy_Id': edu.system.getValById('dropKhoaQuanLy_CB'),
                'strDaoTao_ChuongTrinh_Id': edu.system.getValById('dropChuongTrinh_CB'),
                'strDaoTao_Lop_Id': edu.system.getValById('dropSearch_Lop'),
                'strTrangThai': me.strTrangThai,
                'strTuKhoa': edu.util.getValById('txtSearch_TuKhoa'),
            };
            for (variable in obj_list) {
                addKeyValue(variable, obj_list[variable]);
            }
        });
    },

    /*------------------------------------------
    --Discription: Helper: lấy giá trị multi-select dạng "id1,id2,..."
    -------------------------------------------*/
    getMultiVal: function (strId) {
        var val = $('#' + strId).val();
        if (Array.isArray(val)) return val.filter(v => v !== "" && v != null).join(',');
        return val || '';
    },

    /*------------------------------------------
    --Discription: Dispatch theo tab đang chọn
    --(Tab Khởi tạo định danh dùng API khác + bảng khác)
    -------------------------------------------*/
    dispatchTab: function () {
        var me = this;
        // 3 mode: bảng SV chính / bảng Khởi tạo định danh / bảng Phân ngành lớp chính
        $("#zoneTblSinhVien").hide();
        $("#zoneTblKhoiTaoDinhDanh").hide();
        $("#zoneTblPhanNganhLopChinh").hide();

        if (me.strTrangThai === "KHOITAODINHDANH") {
            $("#zoneTblKhoiTaoDinhDanh").show();
            me.getList_NguoiHocChuaCoCauTruc();
        } else if (me.strTrangThai === "PHANNGANHLOPCHINH") {
            $("#zoneTblPhanNganhLopChinh").show();
            me.getList_PhanNganhLopChinh();
        } else {
            $("#zoneTblSinhVien").show();
            me.getList_SinhVien();
        }
    },

    /*------------------------------------------
    --Discription: [8] Danh sách học viên chưa có cấu trúc (chưa khởi tạo định danh)
    --Origin: PKG_CORE_NGUOIHOC_01.LayDSNguoiHocChuaCoCauTruc
    -------------------------------------------*/
    getList_NguoiHocChuaCoCauTruc: function () {
        var me = this;
        var obj_save = {
            'action': 'SV_NGUOIHOC_01_MH/DSA4BRIPJjQuKAkuIgIpNCACLgIgNBUzNCIP',
            'func': 'PKG_CORE_NGUOIHOC_01.LayDSNguoiHocChuaCoCauTruc',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKhoiTaoDinhDanh = data.Data;
                    me.genTable_NguoiHocChuaCoCauTruc(data.Data);
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genTable_NguoiHocChuaCoCauTruc: function (data) {
        var LEFT = 'style="display:block;text-align:left;width:100%;"';
        var jsonForm = {
            strTable_Id: "tblKhoiTaoDinhDanh",
            aaData: data,
            colPos: {
                left: [1, 2, 3],
                center: [0, 4]
            },
            aoColumns: [
                // [col 1] CCCD
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.IDENTIFIER_NO) || edu.util.returnEmpty(aData.DINHDANH_CHINH_SO);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 2] Họ và tên
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.HO_TEN) || edu.util.returnEmpty(aData.FULL_NAME);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 3] Ghi chú
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.GhiChu) || edu.util.returnEmpty(aData.GHICHU) || edu.util.returnEmpty(aData.NOTE);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 4] Chọn (Xem)
                {
                    "mRender": function (nRow, aData) {
                        var strId = aData.CORE_PERSON_ID || aData.PERSON_ID || aData.ID || aData.IDENTIFIER_NO;
                        return '<a class="btn btn-default btnViewKTDD" id="viewKTDD_' + strId + '">Xem</a>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    /*------------------------------------------
    --Discription: [9] Danh sách học viên cần phân ngành lớp chính
    --Origin: PKG_CORE_NGUOIHOC_01.LayDSNguoiHocChuaCoCauTruc
    --(Dùng chung API với tab "Khởi tạo định danh mới" - cùng danh sách
    -- học viên chưa có cấu trúc, khác nhau ở action "Xem" sau đó)
    -------------------------------------------*/
    getList_PhanNganhLopChinh: function () {
        var me = this;
        var obj_save = {
            'action': 'SV_NGUOIHOC_01_MH/DSA4BRIPJjQuKAkuIgIpNCACLgIgNBUzNCIP',
            'func': 'PKG_CORE_NGUOIHOC_01.LayDSNguoiHocChuaCoCauTruc',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtPhanNganhLopChinh = data.Data;
                    me.genTable_PhanNganhLopChinh(data.Data);
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genTable_PhanNganhLopChinh: function (data) {
        var LEFT = 'style="display:block;text-align:left;width:100%;"';
        var jsonForm = {
            strTable_Id: "tblPhanNganhLopChinh",
            aaData: data,
            colPos: {
                left: [1, 2, 3],
                center: [0, 4]
            },
            aoColumns: [
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.IDENTIFIER_NO) || edu.util.returnEmpty(aData.DINHDANH_CHINH_SO);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.HO_TEN) || edu.util.returnEmpty(aData.FULL_NAME);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.GhiChu) || edu.util.returnEmpty(aData.GHICHU) || edu.util.returnEmpty(aData.NOTE);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        var strId = aData.CORE_PERSON_ID || aData.PERSON_ID || aData.ID || aData.IDENTIFIER_NO;
                        return '<a class="btn btn-view btn-sm btnPhanNganh" id="phanNganh_' + strId + '">Xem</a>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    /*------------------------------------------
    --Discription: Render form Phân ngành lớp chính
    -------------------------------------------*/
    renderForm_PhanNganh: function (aData) {
        var me = this;
        function buildOptions(arr, selectedId, placeholder) {
            var html = '<option value="">-- ' + placeholder + ' --</option>';
            (arr || []).forEach(function (item) {
                var selected = (item.ID == selectedId) ? 'selected' : '';
                html += '<option value="' + item.ID + '" ' + selected + '>' + edu.util.returnEmpty(item.TEN) + '</option>';
            });
            return html;
        }

        var hoTen = edu.util.returnEmpty(aData.HO_TEN) || edu.util.returnEmpty(aData.FULL_NAME);
        var cccd = edu.util.returnEmpty(aData.IDENTIFIER_NO) || edu.util.returnEmpty(aData.DINHDANH_CHINH_SO);

        var html = '';
        // Student header (read-only)
        html += '<div class="alert alert-light border mb-15 pd10">';
        html += '  <div class="d-flex justify-content-between flex-wrap">';
        html += '    <div><i class="fa-light fa-id-card mr-5"></i> <b>CCCD:</b> ' + (cccd || '<i class="color-888">chưa có</i>') + '</div>';
        html += '    <div><i class="fa-light fa-user mr-5"></i> <b>Họ và tên:</b> ' + hoTen + '</div>';
        html += '  </div>';
        html += '</div>';

        // ===== Section 1: Khai tuyến học chính =====
        html += '<div class="aps-form mb-15">';
        html += '  <p class="group-group-title-name mb-10"><span class="badge bg-blue fz14">Khai tuyến học chính</span></p>';
        html += '  <div class="row">';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Hình thức học</label>';
        html += '      <select class="form-select select-opt" id="dropPN_HinhThucHoc">' + buildOptions(me.dtHinhThucHoc, '', 'Chọn hình thức học') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Diện học</label>';
        html += '      <select class="form-select select-opt" id="dropPN_DienHoc">' + buildOptions(me.dtDienHoc, '', 'Chọn diện học') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Loại nguồn</label>';
        html += '      <select class="form-select select-opt" id="dropPN_LoaiNguon">' + buildOptions(me.dtLoaiNguon, '', 'Chọn loại nguồn') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10 d-flex align-items-end">';
        html += '      <div class="form-check">';
        html += '        <input type="checkbox" class="form-check-input" id="chkPN_TuyenChinh" checked>';
        html += '        <label class="form-check-label fz14" for="chkPN_TuyenChinh">Tuyến học chính</label>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày bắt đầu</label>';
        html += '      <input type="text" class="form-control" id="txtPN_NgayBatDau" placeholder="dd/mm/yyyy">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày kết thúc</label>';
        html += '      <input type="text" class="form-control" id="txtPN_NgayKetThuc" placeholder="dd/mm/yyyy">';
        html += '    </div>';
        html += '    <div class="col-12 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ghi chú</label>';
        html += '      <textarea class="form-control" id="txtPN_GhiChu" rows="2"></textarea>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        // ===== Section 2: Xếp vào chương trình học =====
        html += '<div class="aps-form mb-15" style="border-top:1px dashed #ccc;padding-top:15px;">';
        html += '  <p class="group-group-title-name mb-10"><span class="badge bg-green fz14">Xếp vào chương trình học</span></p>';
        html += '  <div class="row">';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Hệ đào tạo</label>';
        html += '      <select class="form-select select-opt" id="dropPN_HeDaoTao"><option value="">-- Chọn hệ --</option></select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Khóa đào tạo</label>';
        html += '      <select class="form-select select-opt" id="dropPN_KhoaDaoTao"><option value="">-- Chọn khóa --</option></select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Chương trình</label>';
        html += '      <select class="form-select select-opt" id="dropPN_ChuongTrinh"><option value="">-- Chọn chương trình --</option></select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Trạng thái học</label>';
        html += '      <select class="form-select select-opt" id="dropPN_TrangThaiHoc">' + buildOptions(me.dtTrangThai, '', 'Chọn trạng thái') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Loại tiếp nhận</label>';
        html += '      <select class="form-select select-opt" id="dropPN_LoaiTiepNhan">' + buildOptions(me.dtLoaiTiepNhan, '', 'Chọn loại tiếp nhận') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Mã số</label>';
        html += '      <input type="text" class="form-control" id="txtPN_MaSo">';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        // ===== Section 3: Xếp vào lớp =====
        html += '<div class="aps-form mb-15" style="border-top:1px dashed #ccc;padding-top:15px;">';
        html += '  <p class="group-group-title-name mb-10"><span class="badge bg-orange fz14">Xếp vào lớp</span></p>';
        html += '  <div class="row">';
        html += '    <div class="col-12 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Lớp học</label>';
        html += '      <select class="form-select select-opt" id="dropPN_Lop"><option value="">-- Chọn lớp --</option></select>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        // Nút Thực hiện
        html += '<div class="d-flex justify-content-end gap-2 mt-15">';
        html += '  <button class="btn btn-view" id="btnPN_ThucHien"><i class="fal fa-check-circle me-1"></i> Thực hiện</button>';
        html += '</div>';

        $("#zoneFormPhanNganh").html(html);
        $("#lblPN_FormTitle").html("Phân ngành lớp chính - " + hoTen);

        // Bật select2 (có tìm kiếm) cho tất cả dropdown trong form
        me._initSelect2_PN("#dropPN_HinhThucHoc", "Chọn hình thức học");
        me._initSelect2_PN("#dropPN_DienHoc", "Chọn diện học");
        me._initSelect2_PN("#dropPN_LoaiNguon", "Chọn loại nguồn");
        me._initSelect2_PN("#dropPN_TrangThaiHoc", "Chọn trạng thái");
        me._initSelect2_PN("#dropPN_LoaiTiepNhan", "Chọn loại tiếp nhận");
        me._initSelect2_PN("#dropPN_HeDaoTao", "Chọn hệ");
        me._initSelect2_PN("#dropPN_KhoaDaoTao", "Chọn khóa");
        me._initSelect2_PN("#dropPN_ChuongTrinh", "Chọn chương trình");
        me._initSelect2_PN("#dropPN_Lop", "Chọn lớp");

        // Load cascade dropdown đầu tiên (Hệ đào tạo)
        me.loadCombo_PN_HeDaoTao();
    },

    /*------------------------------------------
    --Discription: Helper init/reinit select2 cho dropdown trong form Phân ngành
    -------------------------------------------*/
    _initSelect2_PN: function (selector, placeholder) {
        var $sel = $(selector);
        if ($sel.length === 0) return;
        if ($sel.hasClass('select2-hidden-accessible')) {
            try { $sel.select2('destroy'); } catch (e) { }
        }
        $sel.select2({
            placeholder: placeholder || '',
            width: '100%',
            // Ép hiện ô search luôn (mặc định select2 ẩn khi ít option, hoặc theo global config)
            minimumResultsForSearch: 0
        });
    },

    /*------------------------------------------
    --Discription: Cascade dropdowns dùng KHCT_BIND_DIMENSION_MH
    --(load vào dropdown của form phân ngành, dropPN_*)
    -------------------------------------------*/
    loadCombo_PN_HeDaoTao: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRIJJAUgLhUgLgPP',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSHeDaoTao',
        });
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me._renderComboPN("dropPN_HeDaoTao", data.Data, "Chọn hệ", "TENHEDAOTAO");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    loadCombo_PN_KhoaDaoTao: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRIKKS4gBSAuFSAu',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSKhoaDaoTao',
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('dropPN_HeDaoTao'),
        });
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me._renderComboPN("dropPN_KhoaDaoTao", data.Data, "Chọn khóa", "TENKHOA");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    loadCombo_PN_ChuongTrinh: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRICKTQuLyYVMygvKQPP',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSChuongTrinh',
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('dropPN_HeDaoTao'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValById('dropPN_KhoaDaoTao'),
            'strDaoTao_KhoaQuanLy_Id': '',
        });
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me._renderComboPN("dropPN_ChuongTrinh", data.Data, "Chọn chương trình", "TENCHUONGTRINH");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    loadCombo_PN_LopQuanLy: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRINLjEQNCAvDTgP',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSLopQuanLy',
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('dropPN_HeDaoTao'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValById('dropPN_KhoaDaoTao'),
            'strDaoTao_KhoaQuanLy_Id': '',
            'strDaoTao_ChuongTrinh_Id': edu.util.getValById('dropPN_ChuongTrinh'),
        });
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me._renderComboPN("dropPN_Lop", data.Data, "Chọn lớp", "TENLOP");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    _renderComboPN: function (targetId, data, placeholder, primaryNameField) {
        var html = '<option value=""></option>';
        (data || []).forEach(function (item) {
            var ten = item[primaryNameField] || item.TEN || item.NAME || item.TENKHOA || '';
            var ma = item.MAKHOA || item.MACHUONGTRINH || item.MALOP || item.MA || item.CODE || '';
            var display = ma ? (ten + ' (' + ma + ')') : ten;
            html += '<option value="' + item.ID + '">' + display + '</option>';
        });
        $('#' + targetId).html(html);
        // Re-init select2 để options mới có ô tìm kiếm
        this._initSelect2_PN('#' + targetId, placeholder);
    },

    /*------------------------------------------
    --Discription: TEMPLATE: Confirm Modal hoành tráng - DÙNG CHUNG
    --
    --options = {
    --   title: string,            // Tiêu đề chính trên header
    --   subTitle: string,          // Phụ đề dưới header (optional)
    --   icon: string,              // FA icon class (default: fa-shield-check)
    --   warningText: string,       // Text cảnh báo (optional)
    --   subject: {                 // Đối tượng tác động (hiển thị nổi bật ở box xanh)
    --       name: string,            // VD: tên người, mã đối tượng
    --       extra: [{label, value}]  // Mảng các field bổ sung
    --   },
    --   sections: [                // Mảng nhóm thông tin
    --       {
    --           title: string,       // Tiêu đề nhóm
    --           color: 'blue'|'green'|'orange'|'red',
    --           items: [{label, value}] // Các cặp key-value
    --       }
    --   ],
    --   actionLabel: string,       // Text nút xác nhận
    --   requireCheckbox: boolean,  // true = bắt buộc tick checkbox mới enable nút (default: true)
    --   onConfirm: function        // Callback khi user xác nhận
    --}
    -------------------------------------------*/
    showFancyConfirm: function (options) {
        options = options || {};
        var requireChk = options.requireCheckbox !== false; // mặc định true

        // Header
        $("#lblConfirm_Title").text(options.title || 'Xác nhận thực hiện');
        $("#lblConfirm_SubTitle").text(options.subTitle || 'Vui lòng xem kỹ thông tin trước khi xác nhận');
        $("#iconConfirm_Header").attr('class', 'fa-light ' + (options.icon || 'fa-shield-check'));
        if (options.warningText) $("#lblConfirm_WarningText").html(options.warningText);

        // Subject - đối tượng tác động
        var subjectHtml = '';
        if (options.subject) {
            subjectHtml += '<div class="d-flex align-items-center">';
            subjectHtml += '  <i class="fa-light fa-user-tag me-2" style="color:#3380db;font-size:18px;"></i>';
            subjectHtml += '  <div>';
            if (options.subject.name) {
                subjectHtml += '<div class="fw-bold fz15" style="color:#1d3a8a;">' + options.subject.name + '</div>';
            }
            if (options.subject.extra && options.subject.extra.length) {
                subjectHtml += '<div class="fz13 mt-1" style="color:#555;">';
                options.subject.extra.forEach(function (e, idx) {
                    if (idx > 0) subjectHtml += ' <span style="color:#bbb;">•</span> ';
                    subjectHtml += '<span class="color-888">' + e.label + ':</span> <b>' + (e.value || '<i class="color-888">trống</i>') + '</b>';
                });
                subjectHtml += '</div>';
            }
            subjectHtml += '  </div>';
            subjectHtml += '</div>';
        }
        $("#zoneConfirm_Subject").html(subjectHtml);

        // Sections - các nhóm thông tin
        var colorMap = {
            'blue':   { border: '#3380db', bg: '#e8f0fe', badge: 'bg-blue' },
            'green':  { border: '#22b06a', bg: '#e6f7ee', badge: 'bg-green' },
            'orange': { border: '#ff8c00', bg: '#fff5e6', badge: 'bg-orange' },
            'red':    { border: '#dc3545', bg: '#fbe9eb', badge: 'bg-danger' }
        };
        var sectionsHtml = '';
        (options.sections || []).forEach(function (section) {
            var c = colorMap[section.color] || colorMap.blue;
            sectionsHtml += '<div class="mb-15" style="border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">';
            sectionsHtml += '  <div class="pd10 fw-bold" style="background:' + c.bg + ';color:' + c.border + ';border-bottom:1px solid #e5e5e5;">';
            sectionsHtml += '    <i class="fa-light fa-square-list me-2"></i>' + (section.title || '');
            sectionsHtml += '  </div>';
            sectionsHtml += '  <table class="table table-sm mb-0">';
            sectionsHtml += '    <tbody>';
            (section.items || []).forEach(function (item) {
                var val = (item.value === null || item.value === undefined || item.value === '')
                    ? '<i class="color-888">— chưa nhập —</i>'
                    : '<b>' + item.value + '</b>';
                sectionsHtml += '<tr>';
                sectionsHtml += '  <td style="width:40%;color:#666;padding:8px 12px;">' + item.label + '</td>';
                sectionsHtml += '  <td style="padding:8px 12px;">' + val + '</td>';
                sectionsHtml += '</tr>';
            });
            sectionsHtml += '    </tbody>';
            sectionsHtml += '  </table>';
            sectionsHtml += '</div>';
        });
        $("#zoneConfirm_Details").html(sectionsHtml);

        // Action button
        $("#lblConfirm_ActionLabel").text(options.actionLabel || 'Xác nhận thực hiện');
        $("#btnConfirm_DoIt").prop('disabled', requireChk);

        // Reset checkbox
        $("#chkConfirm_Agreement").prop('checked', false);
        var $chkWrap = $("#chkConfirm_Agreement").closest('.form-check');
        $chkWrap.toggle(requireChk);

        // Re-bind checkbox change
        $("#chkConfirm_Agreement").off("change.confirmfancy").on("change.confirmfancy", function () {
            $("#btnConfirm_DoIt").prop('disabled', !this.checked);
        });

        // Re-bind confirm button (off trước để tránh duplicate handler)
        $("#btnConfirm_DoIt").off("click.confirmfancy").on("click.confirmfancy", function () {
            $("#modal_ConfirmFancy").modal('hide');
            if (typeof options.onConfirm === 'function') options.onConfirm();
        });

        // Show modal
        $("#modal_ConfirmFancy").modal('show');
    },

    /*------------------------------------------
    --Discription: Confirm + Thực hiện phân ngành (gọi Them_StudyTrack_Full)
    --Origin: PKG_CORE_NGUOIHOC_01.Them_StudyTrack_Full
    -------------------------------------------*/
    confirm_PhanNganh: function () {
        var me = this;
        var aData = me.aPhanNganh;
        if (!aData) {
            edu.system.alert("Chưa chọn học viên", "w");
            return;
        }
        // Validate cơ bản
        if (!edu.util.getValById('dropPN_ChuongTrinh')) {
            edu.system.alert("Vui lòng chọn Chương trình", "w");
            return;
        }
        if (!edu.util.getValById('dropPN_Lop')) {
            edu.system.alert("Vui lòng chọn Lớp", "w");
            return;
        }

        // Lấy tất cả thông tin user đã chọn để hiển thị trong confirm
        var hoTen = edu.util.returnEmpty(aData.HO_TEN) || edu.util.returnEmpty(aData.FULL_NAME);
        var maNH = edu.util.returnEmpty(aData.MA_NGUOI_HOC);
        var cccd = edu.util.returnEmpty(aData.IDENTIFIER_NO) || edu.util.returnEmpty(aData.DINHDANH_CHINH_SO);
        // Lấy text hiển thị (không phải id) từ option đang được chọn
        var txt = function (id) { return $('#' + id + ' option:selected').text(); };

        me.showFancyConfirm({
            title: 'Xác nhận phân ngành lớp chính',
            subTitle: 'Hành động này sẽ thiết lập tuyến học chính và xếp lớp cho học viên',
            icon: 'fa-sitemap',
            warningText: 'Sau khi xác nhận, hệ thống sẽ tạo bản ghi quá trình học cho học viên. Việc thu hồi có thể cần thực hiện thủ công.',
            subject: {
                name: hoTen,
                extra: [
                    { label: 'CCCD', value: cccd },
                    { label: 'Mã người học', value: maNH }
                ]
            },
            sections: [
                {
                    title: 'Khai tuyến học chính',
                    color: 'blue',
                    items: [
                        { label: 'Hình thức học',  value: txt('dropPN_HinhThucHoc') },
                        { label: 'Diện học',       value: txt('dropPN_DienHoc') },
                        { label: 'Loại nguồn',     value: txt('dropPN_LoaiNguon') },
                        { label: 'Tuyến học chính', value: $('#chkPN_TuyenChinh').is(':checked') ? '✓ Chính' : 'Phụ' },
                        { label: 'Ngày bắt đầu',   value: edu.util.getValById('txtPN_NgayBatDau') },
                        { label: 'Ngày kết thúc',  value: edu.util.getValById('txtPN_NgayKetThuc') },
                        { label: 'Ghi chú',        value: edu.util.getValById('txtPN_GhiChu') }
                    ]
                },
                {
                    title: 'Xếp vào chương trình học',
                    color: 'green',
                    items: [
                        { label: 'Hệ đào tạo',     value: txt('dropPN_HeDaoTao') },
                        { label: 'Khóa đào tạo',   value: txt('dropPN_KhoaDaoTao') },
                        { label: 'Chương trình',   value: txt('dropPN_ChuongTrinh') },
                        { label: 'Trạng thái học', value: txt('dropPN_TrangThaiHoc') },
                        { label: 'Loại tiếp nhận', value: txt('dropPN_LoaiTiepNhan') },
                        { label: 'Mã số',          value: edu.util.getValById('txtPN_MaSo') }
                    ]
                },
                {
                    title: 'Xếp vào lớp',
                    color: 'orange',
                    items: [
                        { label: 'Lớp học', value: txt('dropPN_Lop') }
                    ]
                }
            ],
            actionLabel: 'Thực hiện phân ngành',
            requireCheckbox: true,
            onConfirm: function () {
                me.save_PhanNganh();
            }
        });
    },

    save_PhanNganh: function () {
        var me = this;
        var aData = me.aPhanNganh;
        var obj_save = {
            'action': 'SV_NGUOIHOC_01_MH/FSkkLB4SNTQlOBUzICIq',
            'func': 'PKG_CORE_NGUOIHOC_01.Them_StudyTrack_Full',
            'iM': edu.system.iM,
            // Mapping theo PROCEDURE Them_StudyTrack_Full
            'strCorePerson_Id': aData.CORE_PERSON_ID || aData.PERSON_ID || '',
            'strCorePersonIntake_Id': '',
            'strDaoTaoToChucCT_Id': edu.util.getValById('dropPN_ChuongTrinh'),
            'strDaoTaoLopQuanLy_Id': edu.util.getValById('dropPN_Lop'),
            'strChangeType_Id': edu.util.getValById('dropPN_LoaiTiepNhan'),
            'strStudyStatus_Id': edu.util.getValById('dropPN_TrangThaiHoc'),
            'strStudyKind_Id': edu.util.getValById('dropPN_HinhThucHoc'),
            'strStudyRelationType_Id': edu.util.getValById('dropPN_DienHoc'),
            'dIsPrimary': $('#chkPN_TuyenChinh').is(':checked') ? 1 : 0,
            'strNgayBatDau': edu.util.getValById('txtPN_NgayBatDau'),
            'strNgayKetThuc': edu.util.getValById('txtPN_NgayKetThuc'),
            'strSourceType_Id': edu.util.getValById('dropPN_LoaiNguon'),
            'strSourceRef_Id': '',
            'strDecision_Id': '',
            'strGhiChu': edu.util.getValById('txtPN_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Phân ngành lớp chính thành công", "s");
                    me.getList_PhanNganhLopChinh();
                    me.resetForm_PhanNganh();
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    resetForm_PhanNganh: function () {
        this.aPhanNganh = null;
        var emptyHtml = '<div class="text-center color-888 pt-30 pb-30">' +
            '<i class="fa-light fa-hand-pointer fz30 d-block mb-10"></i>' +
            'Chọn một học viên ở bảng bên trái để khai tuyến học chính và xếp lớp' +
            '</div>';
        $("#zoneFormPhanNganh").html(emptyHtml);
        $("#lblPN_FormTitle").html("Phân ngành lớp chính");
    },

    /*------------------------------------------
    --Discription: Render form khởi tạo định danh ở panel bên phải
    --Section 1: Thông tin cơ bản (editable) -> InsertCorePerson
    --Section 2: Thông tin định danh (editable) -> chờ wire API
    -------------------------------------------*/
    renderForm_DinhDanh: function (aData) {
        var me = this;
        var html = '';

        // Build options Giới tính từ danh mục NS.GITI
        var genderOptions = '<option value="">-- Chọn giới tính --</option>';
        (me.dtGioiTinh || []).forEach(function (g) {
            var selected = (g.ID === aData.GIOI_TINH_ID) ? 'selected' : '';
            genderOptions += '<option value="' + g.ID + '" ' + selected + '>' + edu.util.returnEmpty(g.TEN) + '</option>';
        });

        // ===== Thông tin cơ bản (editable - InsertCorePerson) =====
        html += '<div class="aps-form mb-15">';
        html += '  <p class="group-group-title-name mb-10"><span class="badge bg-blue fz14">Thông tin cơ bản</span></p>';
        html += '  <div class="row">';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Mã người học</label>';
        html += '      <input type="text" class="form-control" value="' + edu.util.returnEmpty(aData.MA_NGUOI_HOC) + '" readonly>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Họ và tên đầy đủ <span class="text-danger">*</span></label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_FullName" placeholder="VD: Nguyễn Văn An" value="' + edu.util.returnEmpty(aData.HO_TEN) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-4 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Họ</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_LastName" value="' + edu.util.returnEmpty(aData.LAST_NAME) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-4 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Tên đệm</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_MiddleName" value="' + edu.util.returnEmpty(aData.MIDDLE_NAME) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-4 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Tên</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_FirstName" value="' + edu.util.returnEmpty(aData.FIRST_NAME) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày sinh (dd/mm/yyyy)</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_DateOfBirth" placeholder="dd/mm/yyyy" value="' + edu.util.returnEmpty(aData.NGAY_SINH) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Giới tính</label>';
        html += '      <select class="form-select" id="dropKTDD_Gender">' + genderOptions + '</select>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="d-flex justify-content-end gap-2 mt-10">';
        html += '    <button class="btn btn-default" id="btnKTDD_Cancel"><i class="fal fa-times me-1"></i> Hủy</button>';
        html += '    <button class="btn btn-view" id="btnKTDD_SaveBasic"><i class="fal fa-save me-1"></i> Lưu thông tin cơ bản</button>';
        html += '  </div>';
        html += '</div>';

        // ===== Thông tin định danh (editable - sẽ wire API sau) =====
        html += '<div class="aps-form mt-20" style="border-top:1px dashed #ccc;padding-top:15px;">';
        html += '  <p class="group-group-title-name mb-10"><span class="badge bg-green fz14">Thông tin định danh</span> <span class="fz12 color-888 ms-2">Bước 2 — chờ tích hợp API</span></p>';
        html += '  <div class="row">';
        html += '    <div class="col-12 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Số CCCD / Định danh</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_IdentifierNo" placeholder="Nhập số CCCD" value="' + edu.util.returnEmpty(aData.IDENTIFIER_NO) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày cấp</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_IssueDate" placeholder="dd/mm/yyyy" value="' + edu.util.returnEmpty(aData.ISSUE_DATE) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Nơi cấp</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_IssuePlace" value="' + edu.util.returnEmpty(aData.ISSUE_PLACE) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Hiệu lực từ</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_EffectiveFrom" placeholder="dd/mm/yyyy" value="' + edu.util.returnEmpty(aData.IDENTIFIER_EFFECTIVE_FROM) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Hiệu lực đến</label>';
        html += '      <input type="text" class="form-control" id="txtKTDD_EffectiveTo" placeholder="dd/mm/yyyy" value="' + edu.util.returnEmpty(aData.IDENTIFIER_EFFECTIVE_TO) + '">';
        html += '    </div>';
        html += '    <div class="col-12 mb-10">';
        html += '      <div class="form-check">';
        html += '        <input type="checkbox" class="form-check-input" id="chkKTDD_IsPrimary" ' + (aData.IDENTIFIER_IS_PRIMARY == 1 ? 'checked' : '') + '>';
        html += '        <label class="form-check-label fz14" for="chkKTDD_IsPrimary">Là định danh chính</label>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="col-12 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ghi chú</label>';
        html += '      <textarea class="form-control" id="txtKTDD_GhiChu" rows="2">' + edu.util.returnEmpty(aData.GHICHU) + '</textarea>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="d-flex justify-content-end gap-2 mt-10">';
        html += '    <button class="btn btn-outline-save" id="btnKTDD_Save"><i class="fal fa-save me-1"></i> Lưu định danh</button>';
        html += '  </div>';
        html += '</div>';

        $("#zoneFormDinhDanh").html(html);
        // Đổi title theo mode: Thêm mới vs Xem/Sửa
        if (me.isThemMoi) {
            $("#lblFormTitle").html('<i class="fa-light fa-plus mr-5"></i> Thêm mới hồ sơ');
        } else {
            $("#lblFormTitle").html("Xem / Sửa hồ sơ - " + edu.util.returnEmpty(aData.HO_TEN));
        }
        // Hiện box "Khai thông tin các quá trình" + render tab "Hồ sơ - chính sách" với data hiện có
        $("#boxQuaTrinh").show();
        me.renderTab_HoSoChinhSach(aData);
        // Nếu đang Xem/Sửa và có CORE_PERSON_ID -> fetch profile thật từ server để hiển thị đầy đủ
        var strPersonId = aData.CORE_PERSON_ID || aData.PERSON_ID;
        if (!me.isThemMoi && strPersonId) {
            me.getInfo_HoSoChinhSach(strPersonId);
        }
    },

    /*------------------------------------------
    --Discription: Lưu thông tin cơ bản (InsertCorePerson)
    --Origin: PKG_CORE_HOSONHANSU_05.InsertCorePerson
    --Dùng chung hàm với module nhân sự, gắn ngữ cảnh STUDENT
    -------------------------------------------*/
    save_CorePerson: function () {
        var me = this;
        var aData = me.aKhoiTaoDinhDanh;
        if (!aData) {
            edu.system.alert("Chưa chọn người học", "w");
            return;
        }
        var strFullName = edu.util.getValById('txtKTDD_FullName');
        if (!strFullName) {
            edu.system.alert("Vui lòng nhập Họ và tên đầy đủ", "w");
            return;
        }

        // Parse ngày sinh dd/mm/yyyy -> day/month/year (để truyền cả số riêng và string)
        var strDob = edu.util.getValById('txtKTDD_DateOfBirth');
        var dDay = '', dMonth = '', dYear = '';
        if (strDob) {
            var parts = strDob.split('/');
            if (parts.length >= 3) {
                dDay = parseInt(parts[0], 10) || '';
                dMonth = parseInt(parts[1], 10) || '';
                dYear = parseInt(parts[2], 10) || '';
            }
        }

        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CC8yJDM1Ai4zJBEkMzIuLwPP',
            'func': 'PKG_CORE_HOSONHANSU_05.InsertCorePerson',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id || edu.system.chucNangHeThong_Id || '',
            'strFullName': strFullName,
            'strLastName': edu.util.getValById('txtKTDD_LastName'),
            'strMiddleName': edu.util.getValById('txtKTDD_MiddleName'),
            'strFirstName': edu.util.getValById('txtKTDD_FirstName'),
            'strDateOfBirth': strDob,
            'strDobPrecisionLevel': '',
            'dBirthDay': dDay,
            'dBirthMonth': dMonth,
            'dBirthYear': dYear,
            'strGenderId': edu.util.getValById('dropKTDD_Gender'),
            'strProfileStatusId': '',
            'strPortraitFileId': '',
            // ===== 3 tham số cố định ngữ cảnh STUDENT =====
            'strContext_Code': 'STUDENT',
            'strInitial_ConText_Code': 'STUDENT',
            'strCreated_Source_Code': 'INTERNAL_FORM',
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Khởi tạo thông tin cơ bản thành công", "s");
                    // Reload danh sách
                    me.getList_NguoiHocChuaCoCauTruc();
                    me.resetForm_DinhDanh();
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: Tab "Thông tin hồ sơ - chính sách"
    --Origin: PKG_CORE_NGUOIHOC_01.Them/Sua/Xoa_Person_Profile
    -------------------------------------------*/
    renderTab_HoSoChinhSach: function (aData) {
        var me = this;
        aData = aData || {};

        function buildOptions(arr, selectedId, placeholder) {
            var html = '<option value="">-- ' + placeholder + ' --</option>';
            (arr || []).forEach(function (item) {
                var selected = (item.ID == selectedId) ? 'selected' : '';
                html += '<option value="' + item.ID + '" ' + selected + '>' + edu.util.returnEmpty(item.TEN) + '</option>';
            });
            return html;
        }

        var profileId = aData.PERSON_PROFILE_ID || aData.PROFILE_ID || '';
        var isEdit = !!profileId;

        var html = '';
        html += '<div class="aps-form">';
        html += '  <div class="row">';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Tôn giáo</label>';
        html += '      <select class="form-select" id="dropHSCS_Religion">' + buildOptions(me.dtTonGiao, aData.RELIGION_ID, 'Chọn tôn giáo') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Dân tộc</label>';
        html += '      <select class="form-select" id="dropHSCS_Ethnicity">' + buildOptions(me.dtDanToc, aData.ETHNICITY_ID, 'Chọn dân tộc') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Hoàn cảnh gia đình</label>';
        html += '      <select class="form-select" id="dropHSCS_FamilyBackground">' + buildOptions(me.dtHoanCanh, aData.FAMILY_BACKGROUND_ID, 'Chọn hoàn cảnh') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Tình trạng hôn nhân</label>';
        html += '      <select class="form-select" id="dropHSCS_MaritalStatus">' + buildOptions(me.dtHonNhan, aData.MARITAL_STATUS_ID, 'Chọn tình trạng') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Đối tượng chính sách</label>';
        html += '      <select class="form-select" id="dropHSCS_PolicyObject">' + buildOptions(me.dtDoiTuongCS, aData.POLICY_OBJECT_ID, 'Chọn đối tượng') + '</select>';
        html += '    </div>';
        html += '    <div class="col-12 col-md-6 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Nhóm máu</label>';
        html += '      <input type="text" class="form-control" id="txtHSCS_BloodType" placeholder="VD: A, B, AB, O+" value="' + edu.util.returnEmpty(aData.BLOOD_TYPE_CODE) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-4 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày vào Đoàn</label>';
        html += '      <input type="text" class="form-control" id="txtHSCS_UnionJoin" placeholder="dd/mm/yyyy" value="' + (edu.util.returnEmpty(aData.UNION_JOIN_DATE) || edu.util.returnEmpty(aData.union_join_date)) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-4 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày vào Đảng</label>';
        html += '      <input type="text" class="form-control" id="txtHSCS_PartyJoin" placeholder="dd/mm/yyyy" value="' + (edu.util.returnEmpty(aData.PARTY_JOIN_DATE) || edu.util.returnEmpty(aData.party_join_date)) + '">';
        html += '    </div>';
        html += '    <div class="col-12 col-md-4 mb-10">';
        html += '      <label class="form-label fz14 color-888 mb-1">Ngày chính thức Đảng</label>';
        html += '      <input type="text" class="form-control" id="txtHSCS_PartyOfficial" placeholder="dd/mm/yyyy" value="' + (edu.util.returnEmpty(aData.PARTY_OFFICIAL_DATE) || edu.util.returnEmpty(aData.party_official_date)) + '">';
        html += '    </div>';
        // Hiệu lực: checkbox 1|0. Mặc định 1 (active) khi Thêm mới
        var isActive = (aData.IS_ACTIVE !== undefined) ? aData.IS_ACTIVE
                     : ((aData.is_active !== undefined) ? aData.is_active : 1);
        var checkedAttr = (isActive == 1 || isActive == '1' || isActive === true) ? 'checked' : '';
        html += '    <div class="col-12 mb-10">';
        html += '      <div class="form-check">';
        html += '        <input type="checkbox" class="form-check-input" id="chkHSCS_IsActive" ' + checkedAttr + '>';
        html += '        <label class="form-check-label fz14" for="chkHSCS_IsActive">Hiệu lực</label>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        // ID ẩn để biết Thêm vs Sửa
        html += '  <input type="hidden" id="txtHSCS_Id" value="' + profileId + '">';
        html += '  <div class="d-flex justify-content-end gap-2 mt-10">';
        if (isEdit) {
            html += '    <button class="btn btn-delete" id="btnHSCS_Xoa"><i class="fal fa-trash me-1"></i> Xóa</button>';
        }
        html += '    <button class="btn btn-view" id="btnHSCS_Save">';
        html += '      <i class="fal fa-save me-1"></i> ' + (isEdit ? 'Cập nhật' : 'Lưu hồ sơ - chính sách');
        html += '    </button>';
        html += '  </div>';
        html += '</div>';

        $("#zoneHoSoChinhSach").html(html);
    },

    save_HoSoChinhSach: function () {
        var me = this;
        var aData = me.aKhoiTaoDinhDanh;
        if (!aData) {
            edu.system.alert("Chưa chọn người học", "w");
            return;
        }
        var strPersonId = aData.CORE_PERSON_ID || aData.PERSON_ID;
        if (!strPersonId) {
            edu.system.alert("Chưa có Person ID. Vui lòng lưu Thông tin cơ bản trước.", "w");
            return;
        }

        var strProfileId = edu.util.getValById('txtHSCS_Id');
        var isEdit = !!strProfileId;

        var common = {
            'iM': edu.system.iM,
            'strReligion_Id': edu.util.getValById('dropHSCS_Religion'),
            'strEthnicity_Id': edu.util.getValById('dropHSCS_Ethnicity'),
            'strFamilyBackground_Id': edu.util.getValById('dropHSCS_FamilyBackground'),
            'strMaritalStatus_Id': edu.util.getValById('dropHSCS_MaritalStatus'),
            'strPolicyObject_Id': edu.util.getValById('dropHSCS_PolicyObject'),
            'strBloodType_Code': edu.util.getValById('txtHSCS_BloodType'),
            'strUnionJoinDate': edu.util.getValById('txtHSCS_UnionJoin'),
            'strPartyJoinDate': edu.util.getValById('txtHSCS_PartyJoin'),
            'strPartyOfficialDate': edu.util.getValById('txtHSCS_PartyOfficial'),
            'dIsActive': $('#chkHSCS_IsActive').is(':checked') ? 1 : 0,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
        };

        var obj_save;
        if (isEdit) {
            obj_save = Object.assign(common, {
                'action': 'SV_NGUOIHOC_01_MH/EjQgHhEkMzIuLx4RMy4nKC0k',
                'func': 'PKG_CORE_NGUOIHOC_01.Sua_Person_Profile',
                'strId': strProfileId,
            });
        } else {
            obj_save = Object.assign(common, {
                'action': 'SV_NGUOIHOC_01_MH/FSkkLB4RJDMyLi8eETMuJygtJAPP',
                'func': 'PKG_CORE_NGUOIHOC_01.Them_Person_Profile',
                'strPerson_Id': strPersonId,
            });
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert(isEdit ? "Cập nhật hồ sơ - chính sách thành công" : "Thêm hồ sơ - chính sách thành công", "s");
                    if (!isEdit && data.Id) {
                        aData.PERSON_PROFILE_ID = data.Id;
                        // Re-render để hiện nút Cập nhật + Xóa
                        me.renderTab_HoSoChinhSach(aData);
                    }
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    delete_HoSoChinhSach: function () {
        var me = this;
        var aData = me.aKhoiTaoDinhDanh;
        var strProfileId = edu.util.getValById('txtHSCS_Id');
        if (!strProfileId) {
            edu.system.alert("Chưa có hồ sơ - chính sách để xóa", "w");
            return;
        }

        edu.system.confirm("Bạn có chắc chắn muốn xóa hồ sơ - chính sách này?");
        $("#btnYes").off("click").on("click", function () {
            var obj_save = {
                'action': 'SV_NGUOIHOC_01_MH/GS4gHhEkMzIuLx4RMy4nKC0k',
                'func': 'PKG_CORE_NGUOIHOC_01.Xoa_Person_Profile',
                'iM': edu.system.iM,
                'strId': strProfileId,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
                'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
                'strHanhDong_Code': '',
            };

            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) {
                        edu.system.alert("Xóa hồ sơ - chính sách thành công", "s");
                        if (aData) {
                            aData.PERSON_PROFILE_ID = null;
                            aData.RELIGION_ID = null;
                            aData.ETHNICITY_ID = null;
                            aData.FAMILY_BACKGROUND_ID = null;
                            aData.MARITAL_STATUS_ID = null;
                            aData.POLICY_OBJECT_ID = null;
                            aData.BLOOD_TYPE_CODE = null;
                            aData.UNION_JOIN_DATE = null;
                            aData.PARTY_JOIN_DATE = null;
                            aData.PARTY_OFFICIAL_DATE = null;
                            me.renderTab_HoSoChinhSach(aData);
                        }
                    }
                    else {
                        edu.system.alert(obj_save.action + " : " + data.Message, "s");
                    }
                },
                error: function (er) {
                    edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
                },
                type: "POST",
                action: obj_save.action,
                contentType: true,
                data: obj_save,
                fakedb: []
            }, false, false, false, null);
        });
    },

    /*------------------------------------------
    --Discription: Lấy thông tin Person Profile theo Id hoặc Person_Id
    --Origin: PKG_CORE_NGUOIHOC_01.LayTTPerson_Profile
    --(Ưu tiên strId; nếu rỗng thì tìm theo strPerson_Id)
    -------------------------------------------*/
    getInfo_HoSoChinhSach: function (strPersonId, strProfileId) {
        var me = this;
        var obj_save = {
            'action': 'SV_NGUOIHOC_01_MH/DSA4FRURJDMyLi8eETMuJygtJAPP',
            'func': 'PKG_CORE_NGUOIHOC_01.LayTTPerson_Profile',
            'iM': edu.system.iM,
            'strId': strProfileId || '',
            'strPerson_Id': strPersonId || '',
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dt = data.Data || [];
                    var profileData = (dt.length > 0) ? dt[0] : null;
                    if (profileData && me.aKhoiTaoDinhDanh) {
                        // Merge profile vào record đang chọn để re-render với data đầy đủ
                        Object.assign(me.aKhoiTaoDinhDanh, profileData);
                        me.renderTab_HoSoChinhSach(me.aKhoiTaoDinhDanh);
                    }
                    // else: chưa có profile -> giữ form rỗng để Thêm mới
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: Lấy danh sách Person Profile theo bộ lọc
    --Origin: PKG_CORE_NGUOIHOC_01.LayDSPerson_Profile
    --(Có thể dùng cho query/báo cáo. Truyền callback để xử lý kết quả)
    -------------------------------------------*/
    getList_HoSoChinhSach: function (filters, callback) {
        var me = this;
        filters = filters || {};
        var obj_save = {
            'action': 'SV_NGUOIHOC_01_MH/DSA4BRIRJDMyLi8eETMuJygtJAPP',
            'func': 'PKG_CORE_NGUOIHOC_01.LayDSPerson_Profile',
            'iM': edu.system.iM,
            'strPerson_Ids': filters.strPerson_Ids || '',
            'strEthnicity_Id': filters.strEthnicity_Id || '',
            'strReligion_Id': filters.strReligion_Id || '',
            'strPolicyObject_Id': filters.strPolicyObject_Id || '',
            'dIsActive': (filters.dIsActive !== undefined) ? filters.dIsActive : 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtHoSoChinhSachList = data.Data;
                    if (typeof callback === 'function') callback(data.Data);
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    resetForm_DinhDanh: function () {
        var emptyHtml = '<div class="text-center color-888 pt-30 pb-30">' +
            '<i class="fa-light fa-hand-pointer fz30 d-block mb-10"></i>' +
            'Chọn một học viên ở bảng bên trái để xem chi tiết, hoặc bấm <b class="text-primary">Thêm mới</b> để khai hồ sơ mới' +
            '</div>';
        $("#zoneFormDinhDanh").html(emptyHtml);
        $("#lblFormTitle").html("Khởi tạo định danh");
        // Ẩn box "Khai thông tin các quá trình" khi không có ai được chọn
        $("#boxQuaTrinh").hide();
    },

    save_DinhDanh: function () {
        var me = this;
        var aData = me.aKhoiTaoDinhDanh;
        if (!aData) {
            edu.system.alert("Chưa chọn người học để khởi tạo định danh", "w");
            return;
        }
        var strCCCD = edu.util.getValById('txtKTDD_IdentifierNo');
        if (!strCCCD) {
            edu.system.alert("Vui lòng nhập số CCCD / Định danh", "w");
            return;
        }
        // TODO: chờ backend cung cấp API lưu định danh
        var obj = {
            strCorePerson_Id: aData.CORE_PERSON_ID,
            strIdentifierNo: strCCCD,
            strIssueDate: edu.util.getValById('txtKTDD_IssueDate'),
            strIssuePlace: edu.util.getValById('txtKTDD_IssuePlace'),
            strEffectiveFrom: edu.util.getValById('txtKTDD_EffectiveFrom'),
            strEffectiveTo: edu.util.getValById('txtKTDD_EffectiveTo'),
            iIsPrimary: $('#chkKTDD_IsPrimary').is(':checked') ? 1 : 0,
            strGhiChu: edu.util.getValById('txtKTDD_GhiChu'),
        };
        console.log("[KTDD] Sẽ gửi lên API lưu định danh:", obj);
        edu.system.alert("Đã sẵn sàng dữ liệu, chờ wire API backend lưu định danh", "i");
    },

    placeholderMap: {
        'dropHeDaoTao_CB': 'Chọn hệ đào tạo',
        'dropKhoaDaoTao_CB': 'Chọn khóa đào tạo',
        'dropKhoaQuanLy_CB': 'Chọn khoa quản lý',
        'dropChuongTrinh_CB': 'Chọn chương trình',
        'dropSearch_Lop': 'Chọn lớp',
        'dropSearch_TrangThai': 'Chọn trạng thái'
    },

    /*------------------------------------------
    --Discription: Fix 1 combo multi-select select2 sau khi loadToCombo_data:
    --xoá option value="" giả, destroy + re-init với placeholder đúng.
    -------------------------------------------*/
    applyMultiSelectPlaceholder: function (id) {
        var me = this;
        var placeholderText = me.placeholderMap[id] || 'Chọn...';
        // Đợi loadToCombo_data update xong DOM
        setTimeout(function () {
            var $sel = $('#' + id);
            if ($sel.length === 0) return;
            $sel.find('option[value=""]').remove();
            $sel.attr('data-placeholder', placeholderText);
            if ($sel.hasClass('select2-hidden-accessible')) {
                try { $sel.select2('destroy'); } catch (e) { }
            }
            $sel.select2({
                placeholder: placeholderText,
                width: '100%',
                multiple: true,
                allowClear: true
            });
            $sel.val(null).trigger('change.select2');
        }, 80);
    },

    /*------------------------------------------
    --Discription: Cleanup ban đầu cho các combo do helper ngoài
    --(genBoLoc_HeKhoa) nạp - dùng polling vì không có callback.
    -------------------------------------------*/
    cleanupPlaceholderMulti: function () {
        var me = this;
        var done = {};
        var attempts = 0;
        var iv = setInterval(function () {
            attempts++;
            var allDone = true;
            Object.keys(me.placeholderMap).forEach(function (id) {
                if (done[id]) return;
                var $sel = $('#' + id);
                if ($sel.length === 0) { allDone = false; return; }
                var $emptyOpts = $sel.find('option[value=""]');
                var $realOpts = $sel.find('option').filter(function () { return $(this).val() !== ''; });
                var emptyText = $emptyOpts.first().text() || '';
                var shouldCleanup = $realOpts.length > 0 || emptyText.indexOf('Không tìm thấy') >= 0;
                if (!shouldCleanup) { allDone = false; return; }

                me.applyMultiSelectPlaceholder(id);
                done[id] = true;
            });
            if (allDone || attempts > 27) clearInterval(iv); // ~8s
        }, 300);
    },

    /*------------------------------------------
    --Discription: [1] Danh sách sinh viên
    --Origin: PKG_CORE_NGUOIHOC_01.LayDSNguoiHoc
    -------------------------------------------*/
    getList_SinhVien: function () {
        var me = this;
        // Trạng thái: ưu tiên tab phân loại nếu có, kèm với dropdown multi-select
        var strStudyStatus = me.getMultiVal('dropSearch_TrangThai');
        if (me.strTrangThai) {
            strStudyStatus = strStudyStatus ? (strStudyStatus + ',' + me.strTrangThai) : me.strTrangThai;
        }
        var obj_save = {
            'action': 'SV_NGUOIHOC_01_MH/DSA4BRIPJjQuKAkuIgPP',
            'func': 'PKG_CORE_NGUOIHOC_01.LayDSNguoiHoc',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtSearch_TuKhoa'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
            'strDaoTao_HeDaoTao_Id': me.getMultiVal('dropHeDaoTao_CB'),
            'strDaoTao_KhoaDaoTao_Id': me.getMultiVal('dropKhoaDaoTao_CB'),
            'strDaoTao_ChuongTrinh_Id': me.getMultiVal('dropChuongTrinh_CB'),
            'strDaoTao_KhoaQuanLy_Id': me.getMultiVal('dropKhoaQuanLy_CB'),
            'strDaoTao_LopQuanLy_Id': me.getMultiVal('dropSearch_Lop'),
            'strStudyStatus_Ids': strStudyStatus,
            'dIsPrimary': '',
            'dBoQuaPhamVi': 0,
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtSinhVien = dtReRult;
                    me.genTable_SinhVien(dtReRult, data.Pager);
                    me.genStatic_SinhVien(data.Summary || {});
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genTable_SinhVien: function (data, iPager) {
        var LEFT = 'style="display:block;text-align:left;width:100%;"';
        var jsonForm = {
            strTable_Id: "tblSinhVien",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.DaQHHT.getList_SinhVien()",
                iDataRow: iPager
            },
            colPos: {
                // index theo cột table (đã tính STT là col 0)
                // Sau khi reorder: 1=CCCD, 2=MãSV, 3=HọTên, 4=Trạng thái, 5=Xem hồ sơ,
                // 6=Giới tính, 7=Ngày sinh, 8=Dân tộc, 9=Tôn giáo, 10=Khóa học,
                // 11=Khoa quản lý, 12=Lớp, 13=Chương trình, 14=Ngành chính/phụ,
                // 15=GPA, 16=Công nợ, 17=Cố vấn, 18=Checkbox
                left:   [1, 2, 3, 8, 9, 10, 11, 12, 13, 17],
                center: [0, 4, 5, 6, 7, 14, 15, 16, 18]
            },
            aoColumns: [
                // [col 1] CCCD
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.DINHDANH_CHINH_SO) || edu.util.returnEmpty(aData.CCCD);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 2] Mã SV
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.MA_NGUOIHOC_CHINH) || edu.util.returnEmpty(aData.MA_NGUOIHOC_PHU);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 3] Họ và tên
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.FULL_NAME) || edu.util.returnEmpty(aData.SINHVIEN_TENDAYDU);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 4] Trạng thái — đẩy lên đầu để luôn nhìn thấy
                {
                    "mRender": function (nRow, aData) {
                        var strTT = edu.util.returnEmpty(aData.STUDY_STATUS_MA) || edu.util.returnEmpty(aData.TRANGTHAI);
                        var strTen = edu.util.returnEmpty(aData.STUDY_STATUS_TEN) || edu.util.returnEmpty(aData.TRANGTHAI_TEN);
                        if (!strTen) return '<span class="color-888">-</span>';
                        var strClass = "btn-soft-primary";
                        if (strTT == "CANHBAO" || strTT == "CANHBAOHOCVU") strClass = "btn-soft-orange";
                        else if (strTT == "TOTNGHIEP" || strTT == "DATOTNGHIEP") strClass = "btn-soft-success";
                        else if (strTT == "BAOLUU" || strTT == "TAMDUNG") strClass = "btn-soft-warning";
                        return '<span class="btn ' + strClass + '">' + strTen + '</span>';
                    }
                },
                // [col 5] Xem hồ sơ — mở modal hồ sơ + quá trình
                {
                    "mRender": function (nRow, aData) {
                        var strId = aData.STUDY_ID || aData.ID;
                        return '<a class="btn btn-view btn-sm btnViewSV" id="viewSV_' + strId + '"><i class="fal fa-folder-open me-1"></i>Xem hồ sơ</a>';
                    }
                },
                // [col 6] Giới tính
                {
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.GIOITINH_TEN);
                    }
                },
                // [col 7] Ngày sinh
                {
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.DATE_OF_BIRTH) || edu.util.returnEmpty(aData.NGAYSINH_DD_MM_YYYY);
                    }
                },
                // [col 8] Dân tộc
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.DANTOC_TEN);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 9] Tôn giáo
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.TONGIAO_TEN);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 10] Khóa học
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.TENKHOA) || edu.util.returnEmpty(aData.MAKHOA);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 11] Khoa quản lý
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.KHOAQUANLY_TEN) || edu.util.returnEmpty(aData.KHOAQUANLY_MA);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 12] Lớp
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.LOPQUANLY_TEN) || edu.util.returnEmpty(aData.LOPQUANLY_MA);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 13] Chương trình
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.TENCHUONGTRINH) || edu.util.returnEmpty(aData.MACHUONGTRINH);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 14] Ngành chính / phụ
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.NganhChinhPhu) || edu.util.returnEmpty(aData.NGANHCHINHPHU);
                        if (!v) {
                            var isPrimary = aData.IS_PRIMARY;
                            if (isPrimary === 1 || isPrimary === '1') v = 'Chính';
                            else if (isPrimary === 0 || isPrimary === '0') v = 'Phụ';
                            else if (aData.MA_NGUOIHOC_CHINH && aData.MA_NGUOIHOC_PHU
                                && aData.MA_NGUOIHOC_CHINH === aData.MA_NGUOIHOC_PHU) v = 'Chính';
                        }
                        var strClass = (v === 'Chính') ? 'btn-soft-success' : (v === 'Phụ' ? 'btn-soft-primary' : '');
                        return strClass ? '<span class="btn ' + strClass + '">' + v + '</span>' : v;
                    }
                },
                // [col 15] GPA
                {
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.GPA);
                    }
                },
                // [col 16] Công nợ
                {
                    "mRender": function (nRow, aData) {
                        var iCongNo = Number(edu.util.returnEmpty(aData.CONGNO)) || 0;
                        if (iCongNo > 0) {
                            return '<span class="color-red">' + edu.util.formatCurrency(iCongNo) + 'đ</span>';
                        }
                        return '<span class="color-222">0</span>';
                    }
                },
                // [col 17] Cố vấn
                {
                    "mRender": function (nRow, aData) {
                        var v = edu.util.returnEmpty(aData.COVAN_TENDAYDU);
                        return '<span ' + LEFT + '>' + v + '</span>';
                    }
                },
                // [col 18] Checkbox
                {
                    "mRender": function (nRow, aData) {
                        var strId = aData.STUDY_ID || aData.ID;
                        return '<input type="checkbox" id="checkX' + strId + '"/>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    genStatic_SinhVien: function (oSummary) {
        $("#lblTongSinhVien").html(edu.util.returnEmpty(oSummary.TONGSV) || 0);
        $("#lblDangHoc").html(edu.util.returnEmpty(oSummary.DANGHOC) || 0);
        $("#lblDangHoc_PT").html(edu.util.returnEmpty(oSummary.DANGHOC_PT) || "0%");
        $("#lblDaTotNghiep").html(edu.util.returnEmpty(oSummary.TOTNGHIEP) || 0);
        $("#lblDaTotNghiep_PT").html(edu.util.returnEmpty(oSummary.TOTNGHIEP_PT) || "0%");
        $("#lblBaoLuu").html(edu.util.returnEmpty(oSummary.BAOLUU) || 0);
        $("#lblBaoLuu_PT").html(edu.util.returnEmpty(oSummary.BAOLUU_PT) || "0%");
        $("#lblCongNo").html((edu.util.formatCurrency(oSummary.CONGNO) || 0) + '<u>đ</u>');
        $("#lblCongNo_SV").html((edu.util.returnEmpty(oSummary.CONGNO_SV) || 0) + ' sinh viên');
        $("#lblCanhBao").html(edu.util.returnEmpty(oSummary.CANHBAO) || 0);
        $("#lblCanhBao_PT").html(edu.util.returnEmpty(oSummary.CANHBAO_PT) || "0%");
    },

    /*------------------------------------------
    --Discription: [2] Hồ sơ sinh viên
    -------------------------------------------*/
    loadHoSo_SinhVien: function () {
        var me = this;
        var aData = me.aSinhVien || {};
        $("#imgSV_Avatar").attr("src", edu.util.returnEmpty(aData.ANHTHE) || edu.util.returnEmpty(aData.AVATAR_URL) || "assets/images/avatar.jpg");
        $("#lblSV_HoTen").html(edu.util.returnEmpty(aData.FULL_NAME) || edu.util.returnEmpty(aData.SINHVIEN_TENDAYDU));
        $("#lblSV_Lop").html(edu.util.returnEmpty(aData.LOPQUANLY_TEN) || edu.util.returnEmpty(aData.LOPQUANLY_MA));
        $("#lblSV_Khoa").html(edu.util.returnEmpty(aData.KHOAQUANLY_TEN));
        $("#lblSV_NgaySinh").html(edu.util.returnEmpty(aData.NGAYSINH_DD_MM_YYYY) || edu.util.returnEmpty(aData.DATE_OF_BIRTH));
        $("#lblSV_CCCD").html(edu.util.returnEmpty(aData.DINHDANH_CHINH_SO) || edu.util.returnEmpty(aData.CCCD));
        $("#lblSV_Email").html(edu.util.returnEmpty(aData.EMAIL));
    },

    /*------------------------------------------
    --Discription: [3] Danh sách QHHT của sinh viên
    -------------------------------------------*/
    getList_QHHT: function () {
        var me = this;
        var obj_save = {
            'action': 'KHCT_HoatDong_SinhVien_MH/DSA4BRIKCR4RKSAvFygkLi4P',
            'func': 'PKG_KEHOACH_HOATDONG_SINHVIEN.LayDSQHHT_SinhVien',
            'iM': edu.system.iM,
            'strSinhVien_Id': me.strSinhVien_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtQHHT = dtReRult;
                    me.genHTML_DanhSachQHHT(dtReRult);
                    // Mặc định chọn QHHT đầu tiên
                    if (dtReRult.length > 0) {
                        me.strQHHT_Id = dtReRult[0].ID;
                        me.aQHHT = dtReRult[0];
                        me.genHTML_ChiTietQHHT();
                        me.getList_TongQuanQHHT();
                    }
                    me.genTongQuan_QHHT(data.Summary || {});
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genHTML_DanhSachQHHT: function (data) {
        var html = '';
        if (!data || data.length === 0) {
            html = '<div class="text-center color-888 pd20">Chưa có QHHT</div>';
            $("#zoneListQHHT").html(html);
            return;
        }
        data.forEach(function (aData, idx) {
            var strChecked = (idx === 0) ? 'checked' : '';
            html += '<div class="swiper-qhht-box mb-10">';
            html += '  <div class="radio">';
            html += '    <input type="radio" name="rdQHHT" class="rdQHHT" id="rdQHHT_' + aData.ID + '" value="' + aData.ID + '" ' + strChecked + '>';
            html += '    <label for="rdQHHT_' + aData.ID + '"></label>';
            html += '  </div>';
            html += '  <div class="form-content">';
            html += '    <div class="top">';
            html += '      <div class="title">' + edu.util.returnEmpty(aData.QHHT_MA) + '</div>';
            html += '      <div class="ct"><div class="btn btn-soft-primary no-link">' + edu.util.returnEmpty(aData.DONVI_QUANLY_TEN) + '</div></div>';
            html += '    </div>';
            html += '    <div class="f-content">';
            html += '      <div class="line-text w-100"><div class="label">Ngành:</div><div class="text">' + edu.util.returnEmpty(aData.NGANH_TEN) + '</div></div>';
            html += '      <div class="line-text w-100"><div class="label">Hệ đào tạo:</div><div class="text">' + edu.util.returnEmpty(aData.HEDAOTAO_TEN) + '</div></div>';
            html += '      <div class="d-flex justify-content-between">';
            html += '        <div class="line-text"><div class="label">Khóa</div><div class="text">' + edu.util.returnEmpty(aData.KHOA) + '</div></div>';
            html += '        <div class="line-text"><div class="label">Lớp</div><div class="text">' + edu.util.returnEmpty(aData.LOP_TEN) + '</div></div>';
            html += '      </div>';
            html += '      <div class="line-text"><div class="label mt-5">Trạng thái</div><div class="text"><div class="btn btn-soft-success no-link">' + edu.util.returnEmpty(aData.TRANGTHAI_TEN) + '</div></div></div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
        });
        $("#zoneListQHHT").html(html);
    },

    genHTML_ChiTietQHHT: function () {
        var me = this;
        var aData = me.aQHHT || {};
        $("#lblQHHT_Ma").html(edu.util.returnEmpty(aData.QHHT_MA));
        var html = '';
        var arrField = [
            { label: 'Loại QHHT', value: aData.LOAIQHHT_TEN },
            { label: 'Ngày bắt đầu', value: aData.NGAYBATDAU_DD_MM_YYYY },
            { label: 'Ngành / Chương trình', value: aData.NGANH_TEN },
            { label: 'Dự kiến tốt nghiệp', value: aData.NGAYDUKIEN_TN },
            { label: 'Khóa', value: aData.KHOA },
            { label: 'GPA hiện tại', value: aData.GPA },
            { label: 'Hệ đào tạo', value: aData.HEDAOTAO_TEN },
            { label: 'Số tín chỉ tích lũy', value: aData.SOTINCHI_TICHLUY },
            { label: 'Lớp hiện tại', value: aData.LOP_TEN },
            { label: 'Trạng thái', value: '<div class="btn btn-soft-success no-link">' + edu.util.returnEmpty(aData.TRANGTHAI_TEN) + '</div>' },
            { label: 'Cố vấn học tập', value: aData.COVAN_TENDAYDU },
        ];
        arrField.forEach(function (f) {
            html += '<div class="col-12 col-md-6 mb-10">';
            html += '  <div class="line-text"><div class="label"><i class="fa-duotone fa-solid fa-circle-check mr-5"></i>' + f.label + ':</div>';
            html += '  <div class="text">' + edu.util.returnEmpty(f.value) + '</div></div>';
            html += '</div>';
        });
        $("#zoneChiTietQHHT").html(html);
    },

    genTongQuan_QHHT: function (oSummary) {
        $("#lblTongQHHT").html(edu.util.returnEmpty(oSummary.TONGQHHT) || 0);
        $("#lblQHHT_DangHoc").html(edu.util.returnEmpty(oSummary.DANGHOC) || 0);
        $("#lblQHHT_HoanThanh").html(edu.util.returnEmpty(oSummary.HOANTHANH) || 0);
    },

    /*------------------------------------------
    --Discription: [4] Tổng quan QHHT (học kỳ hiện tại, tín chỉ, GPA, xếp loại)
    -------------------------------------------*/
    getList_TongQuanQHHT: function () {
        var me = this;
        var obj_save = {
            'action': 'KHCT_HoatDong_SinhVien_MH/DSA4BRIKCR4RKSAvFygkLh4VCQPP',
            'func': 'PKG_KEHOACH_HOATDONG_SINHVIEN.LayTongQuan_QHHT',
            'iM': edu.system.iM,
            'strSinhVien_Id': me.strSinhVien_Id,
            'strQHHT_Id': me.strQHHT_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    var aData = (dtReRult && dtReRult.length > 0) ? dtReRult[0] : {};
                    $("#lblHocKyHienTai").html(edu.util.returnEmpty(aData.HOCKY_HIENTAI));
                    var iTichLuy = edu.util.returnEmpty(aData.SOTINCHI_TICHLUY) || 0;
                    var iTongTC = edu.util.returnEmpty(aData.SOTINCHI_TONG) || 0;
                    var iPercent = iTongTC > 0 ? Math.round((iTichLuy / iTongTC) * 100) : 0;
                    $("#lblTinChiTichLuy").html(iTichLuy + '/' + iTongTC + ' (' + iPercent + '%)');
                    $("#lblTinChiTichLuy_Bar").css("width", iPercent + "%");
                    $("#lblGPA_HienTai").html(edu.util.returnEmpty(aData.GPA) + '/4');
                    $("#lblXepLoai").html('<span class="text-green">' + edu.util.returnEmpty(aData.XEPLOAI) + '</span>');
                }
                else {
                    edu.system.alert(obj_save.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: Common params cho 5 endpoint KHCT_BIND_DIMENSION_MH
    -------------------------------------------*/
    _bindDimCommon: function () {
        return {
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || '',
            'strHanhDong_Code': '',
            'dBoQuaPhamVi': 0,
        };
    },

    /*------------------------------------------
    --Discription: [5a] Bộ lọc Hệ đào tạo
    --Origin: PKG_CORE_GET_BIND_DIMENSION.LayDSHeDaoTao
    -------------------------------------------*/
    getList_HeDaoTao: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRIJJAUgLhUgLgPP',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSHeDaoTao',
        });

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me.genCombo_HeDaoTao(data.Data);
                else edu.system.alert(obj_save.action + " : " + data.Message, "s");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    genCombo_HeDaoTao: function (data) {
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENHEDAOTAO",
                mRender: function (nRow, aData) {
                    return aData.TENHEDAOTAO || aData.NAME || aData.TEN || aData.TENKHOA || '';
                }
            },
            renderPlace: ["dropHeDaoTao_CB"],
            title: "Chọn hệ đào tạo"
        });
        this.applyMultiSelectPlaceholder("dropHeDaoTao_CB");
    },

    /*------------------------------------------
    --Discription: [5b] Bộ lọc Khoa quản lý
    --Origin: PKG_CORE_GET_BIND_DIMENSION.LayDSKhoaQuanLy
    -------------------------------------------*/
    getList_KhoaQuanLy: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRIKKS4gEDQgLw04',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSKhoaQuanLy',
            'strOrgTypeCode': '',
        });

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me.genCombo_KhoaQuanLy(data.Data);
                else edu.system.alert(obj_save.action + " : " + data.Message, "s");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    genCombo_KhoaQuanLy: function (data) {
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "NAME",
                mRender: function (nRow, aData) {
                    var ten = aData.NAME || aData.TEN || aData.TENKHOA || '';
                    var ma = aData.CODE || aData.MA || aData.MAKHOA || '';
                    return ma ? (ten + ' (' + ma + ')') : ten;
                }
            },
            renderPlace: ["dropKhoaQuanLy_CB"],
            title: "Chọn khoa quản lý"
        });
        this.applyMultiSelectPlaceholder("dropKhoaQuanLy_CB");
    },

    /*------------------------------------------
    --Discription: [5c] Bộ lọc Khóa đào tạo
    --Origin: PKG_CORE_GET_BIND_DIMENSION.LayDSKhoaDaoTao
    -------------------------------------------*/
    getList_KhoaDaoTao: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRIKKS4gBSAuFSAu',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSKhoaDaoTao',
            'strDaoTao_HeDaoTao_Id': me.getMultiVal('dropHeDaoTao_CB'),
        });

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me.genCombo_KhoaDaoTao(data.Data);
                else edu.system.alert(obj_save.action + " : " + data.Message, "s");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    genCombo_KhoaDaoTao: function (data) {
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKHOA",
                mRender: function (nRow, aData) {
                    var ten = aData.TENKHOA || aData.TEN || aData.NAME || '';
                    var ma = aData.MAKHOA || aData.MA || aData.CODE || '';
                    return ma ? (ten + ' (' + ma + ')') : ten;
                }
            },
            renderPlace: ["dropKhoaDaoTao_CB"],
            title: "Chọn khóa đào tạo"
        });
        this.applyMultiSelectPlaceholder("dropKhoaDaoTao_CB");
    },

    /*------------------------------------------
    --Discription: [6] Bộ lọc Chương trình
    --Origin: PKG_CORE_GET_BIND_DIMENSION.LayDSChuongTrinh
    -------------------------------------------*/
    getList_ChuongTrinh: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRICKTQuLyYVMygvKQPP',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSChuongTrinh',
            'strDaoTao_KhoaDaoTao_Id': me.getMultiVal('dropKhoaDaoTao_CB'),
            'strDaoTao_KhoaQuanLy_Id': me.getMultiVal('dropKhoaQuanLy_CB'),
            'strDaoTao_HeDaoTao_Id': me.getMultiVal('dropHeDaoTao_CB'),
        });

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me.genCombo_ChuongTrinh(data.Data);
                else edu.system.alert(obj_save.action + " : " + data.Message, "s");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    genCombo_ChuongTrinh: function (data) {
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENCHUONGTRINH",
                mRender: function (nRow, aData) {
                    var ten = aData.TENCHUONGTRINH || aData.TEN || aData.NAME || '';
                    var ma = aData.MACHUONGTRINH || aData.MA || aData.CODE || '';
                    return ma ? (ten + ' (' + ma + ')') : ten;
                }
            },
            renderPlace: ["dropChuongTrinh_CB"],
            title: "Chọn chương trình"
        });
        this.applyMultiSelectPlaceholder("dropChuongTrinh_CB");
    },

    /*------------------------------------------
    --Discription: [7] Bộ lọc Lớp quản lý
    --Origin: PKG_CORE_GET_BIND_DIMENSION.LayDSLopQuanLy
    -------------------------------------------*/
    getList_LopQuanLy: function () {
        var me = this;
        var obj_save = Object.assign(me._bindDimCommon(), {
            'action': 'KHCT_BIND_DIMENSION_MH/DSA4BRINLjEQNCAvDTgP',
            'func': 'PKG_CORE_GET_BIND_DIMENSION.LayDSLopQuanLy',
            'strDaoTao_HeDaoTao_Id': me.getMultiVal('dropHeDaoTao_CB'),
            'strDaoTao_KhoaDaoTao_Id': me.getMultiVal('dropKhoaDaoTao_CB'),
            'strDaoTao_KhoaQuanLy_Id': me.getMultiVal('dropKhoaQuanLy_CB'),
            'strDaoTao_ChuongTrinh_Id': me.getMultiVal('dropChuongTrinh_CB'),
        });

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) me.genCombo_LopQuanLy(data.Data);
                else edu.system.alert(obj_save.action + " : " + data.Message, "s");
            },
            error: function (er) { edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w"); },
            type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    genCombo_LopQuanLy: function (data) {
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENLOP",
                mRender: function (nRow, aData) {
                    var ten = aData.TENLOP || aData.TEN || aData.NAME || '';
                    var ma = aData.MALOP || aData.MA || aData.CODE || '';
                    return ma ? (ten + ' (' + ma + ')') : ten;
                }
            },
            renderPlace: ["dropSearch_Lop"],
            title: "Chọn lớp"
        });
        this.applyMultiSelectPlaceholder("dropSearch_Lop");
    },
}
