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
            me.getList_SinhVien();
        });

        $("#btnRefresh").click(function () {
            me.getList_SinhVien();
        });

        $("#btnResetFilter").click(function () {
            $("#dropHeDaoTao_CB,#dropKhoaDaoTao_CB,#dropKhoaQuanLy_CB,#dropChuongTrinh_CB,#dropSearch_Lop,#dropSearch_TrangThai").val(null).trigger("change");
            $("#txtSearch_TuKhoa").val("");
            me.strTrangThai = "";
            $(".btnFilterTab").removeClass("active");
            $(".btnFilterTab[data-status='']").addClass("active");
            me.getList_SinhVien();
        });

        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_SinhVien();
            }
        });

        // Tab phân loại sinh viên
        $(".btnFilterTab").click(function (e) {
            e.preventDefault();
            $(".btnFilterTab").removeClass("active");
            $(this).addClass("active");
            me.strTrangThai = $(this).attr("data-status");
            me.getList_SinhVien();
        });

        // Xem chi tiết hồ sơ sinh viên
        $("#tblSinhVien").delegate(".btnViewSV", "click", function () {
            var strId = this.id;
            strId = edu.util.cutPrefixId(/viewSV_/g, strId);
            me.strSinhVien_Id = strId;
            me.aSinhVien = me.dtSinhVien.find(e => e.ID == strId);
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
        var jsonForm = {
            strTable_Id: "tblSinhVien",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.DaQHHT.getList_SinhVien()",
                iDataRow: iPager
            },
            colPos: {
                center: [0, 5, 6, 7, 9, 10]
            },
            aoColumns: [
                { "mDataProp": "SINHVIEN_MA" },
                { "mDataProp": "SINHVIEN_TENDAYDU" },
                { "mDataProp": "DAOTAO_LOP_TEN" },
                { "mDataProp": "DAOTAO_CHUONGTRINH_TEN" },
                {
                    "mRender": function (nRow, aData) {
                        var strTT = edu.util.returnEmpty(aData.TRANGTHAI);
                        var strTen = edu.util.returnEmpty(aData.TRANGTHAI_TEN);
                        var strClass = "btn-soft-primary";
                        if (strTT == "CANHBAO") strClass = "btn-soft-orange";
                        else if (strTT == "TOTNGHIEP") strClass = "btn-soft-success";
                        else if (strTT == "BAOLUU") strClass = "btn-soft-warning";
                        return '<span class="btn ' + strClass + '">' + strTen + '</span>';
                    }
                },
                { "mDataProp": "GPA" },
                {
                    "mRender": function (nRow, aData) {
                        var iCongNo = edu.util.returnEmpty(aData.CONGNO);
                        if (iCongNo > 0) {
                            return '<span class="color-red">' + edu.util.formatNumber(iCongNo) + 'đ</span>';
                        }
                        return '<span class="color-222">0</span>';
                    }
                },
                { "mDataProp": "COVAN_TENDAYDU" },
                {
                    "mRender": function (nRow, aData) {
                        return '<a class="btn btn-default btnViewSV" id="viewSV_' + aData.ID + '">Xem</a>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
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
        $("#lblCongNo").html((edu.util.formatNumber(oSummary.CONGNO) || 0) + '<u>đ</u>');
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
        $("#imgSV_Avatar").attr("src", edu.util.returnEmpty(aData.ANHTHE) || "assets/images/avatar.jpg");
        $("#lblSV_HoTen").html(edu.util.returnEmpty(aData.SINHVIEN_TENDAYDU));
        $("#lblSV_Lop").html(edu.util.returnEmpty(aData.DAOTAO_LOP_TEN));
        $("#lblSV_Khoa").html(edu.util.returnEmpty(aData.DAOTAO_KHOAQUANLY_TEN));
        $("#lblSV_NgaySinh").html(edu.util.returnEmpty(aData.NGAYSINH_DD_MM_YYYY));
        $("#lblSV_CCCD").html(edu.util.returnEmpty(aData.CCCD));
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
