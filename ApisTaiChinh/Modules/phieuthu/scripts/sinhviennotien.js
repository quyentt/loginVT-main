/*----------------------------------------------
--Author: Văn Hiệp
--Phone: 
--Date of created: 
--Input: 
--Output:
--Note:
----------------------------------------------*/
/*
1. getList_KhoanThu -> genTable_KhoanThu
2. alertLuu_KhoanThu -> save_TaoSo_HoaDon -> alertLuuThanhCong_KhoanThu -> getList_HoaDon_ChuaIn
3. save_TaoLo_HoaDon -> getList_LoHoaDon -> genTable_LoHoaDon
4. getTemplatePhieu -> getList_HoaDonTheoLo -> fixThreading -> genMauHoaDon_DT -> getData_HoaDon_DT -> genData_HoaDon_DT -> printf_LoHoaDon -> save_TinhTrangHoaDon
*/
function SinhVienNoTien() {};
SinhVienNoTien.prototype = {

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        
        edu.system.pageSize_default = 10;
        edu.extend.addNotify();
        me.getList_DMLKT();
        me.getList_TrangThaiSV();
        //me.getList_KhoanThu_ChuaXuat();

        me.getList_HeDaoTao();
        me.getList_KhoaDaoTao();
        me.getList_ChuongTrinhDaoTao();
        me.getList_LopQuanLy();
        me.getList_ThoiGianDaoTao();

        //me.genHTML_NoiDung_BienLai();
        me.getList_NamNhapHoc();
        me.getList_KhoaQuanLy();

        $("#btnSearch_NT").click(function (e) {
            e.stopImmediatePropagation();
            me.getList_KhoanThu_ChuaXuat(edu.util.getValById('txtSearch_NT'));
        });
        $("#txtSearch_NT").keypress(function (e) {
            if (e.which === 13) {
                e.stopImmediatePropagation();
                me.getList_KhoanThu_ChuaXuat(edu.util.getValById('txtSearch_NT'));
            }
        });

        $('#dropSearch_HeDaoTao_NT').on('select2:select', function (e) {
            e.stopImmediatePropagation();
            me.getList_KhoaDaoTao();
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $('#dropSearch_KhoaDaoTao_NT').on('select2:select', function (e) {
            e.stopImmediatePropagation();
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $('#dropSearch_ChuongTrinh_NT').on('select2:select', function (e) {
            e.stopImmediatePropagation();
            me.getList_LopQuanLy();
        });
        $('#dropSearch_HocKy_NT').on('select2:select', function (e) {
            e.stopImmediatePropagation();
            var strValue = this.value;
            if (!edu.util.checkValue(strValue)) {
                $("#dropSearch_KyThucHien_NT").parent().hide();
            } else {
                $("#dropSearch_KyThucHien_NT").parent().show();
            }
        });
        $('#dropSearch_KhoaQuanLy_IHD').on('select2:select', function (e) {
            e.stopImmediatePropagation();
            me.resetCombobox(this);
        });
        $('#dropSearch_NamNhapHoc_IHD').on('select2:select', function (e) {
            e.stopImmediatePropagation();
            me.resetCombobox(this);
        });
        $('#dropSearch_SoLuong_NT').on('select2:select', function (e) {
            var iSoLuong = $("#dropSearch_SoLuong_NT").val();
            edu.system.iGioiHanLuong = iSoLuong;
        });
        
        $("#MainContent").delegate(".ckbDSTrangThaiSV_LHD_ALL", "click", function (e) {
            e.stopImmediatePropagation();
            var checked_status = this.checked;
            $(".ckbDSTrangThaiSV_LHD").each(function () {
                this.checked = checked_status;
            });
        });
        $("#MainContent").delegate(".ckbLKT_NT_All", "click", function (e) {
            e.stopImmediatePropagation();
            var checked_status = this.checked;
            $(".ckbLKT_NT").each(function () {
                this.checked = checked_status;
            });
        });
        $("#MainContent").delegate("#chkSelectAll_RutTien", "click", function (e) {
            e.stopImmediatePropagation();
            var checked_status = this.checked;
            console.log(checked_status);
            $("#tbldata_KhoanThu_ChuaXuat_NT input").each(function () {
                this.checked = checked_status;
            });
        });

        //Xuất báo cáo//Xuất báo cáo
        edu.system.getList_MauImport("zonebtnBaoCao_SVNT", function (addKeyValue) {
            var strNguoiDangNhap_Id = edu.system.userId;
            var strMaTruong = "KCNTTTN";
            var strNguoiThucHien_Id = edu.util.getValCombo("dropSearch_NguoiThu_NT");
            var strDAOTAO_HeDaoTao_Id = edu.util.getValById("dropSearch_HeDaoTao_NT");
            var strKhoaDaoTao_Id = edu.util.getValById("dropSearch_KhoaDaoTao_NT");
            var strDaoTao_ToChucCT_Id = edu.util.getValById("dropSearch_ChuongTrinh_NT");
            var strLopHoc_Id = edu.util.getValById("dropSearch_Lop_NT");
            var strDAOTAO_ThoiGianDaoTao = edu.util.getValById("dropSearch_HocKy_NT");
            var strPhamViApDung = (edu.util.getValById("dropSearch_HocKy_NT") == "") ? "" : edu.util.getValById("dropSearch_KyThucHien_NT");
            var strKhoaQuanLy_Id = edu.util.getValCombo("dropSearch_KhoaQuanLy_IHD");
            var strNamNhapHoc = edu.util.getValCombo("dropSearch_NamNhapHoc_IHD");
            var strTuNgay = edu.util.getValById("txtSearch_TuNgay_NT");
            var strDenNgay = edu.util.getValById("txtSearch_DenNgay_NT");
            var strTuKhoa = edu.util.getValById("txtSearch_NT");
            var strTAICHINH_CacKhoanThu_Ids = edu.extend.getCheckedCheckBoxByClassName('ckbLKT_NT');
            var strTrangThaiNguoiHoc_Id = edu.extend.getCheckedCheckBoxByClassName('ckbDSTrangThaiSV_LHD').toString();
            if (strTAICHINH_CacKhoanThu_Ids.length == 0) {
                edu.system.alert('Vui lòng chọn khoản thu!', 'w');
                return false;
            }
            if (strTrangThaiNguoiHoc_Id === '') {
                edu.system.alert('Vui lòng chọn trạng thái!', 'w');
                return false;
            }
            //
            addKeyValue("strNguoiDangNhap_Id", strNguoiDangNhap_Id);
            addKeyValue("strMaTruong", strMaTruong);
            addKeyValue("strHeDaoTao_Id", strDAOTAO_HeDaoTao_Id);
            addKeyValue("strKhoaDaoTao_Id", strKhoaDaoTao_Id);
            addKeyValue("strChuongTrinh_Id", strDaoTao_ToChucCT_Id);
            addKeyValue("strLopQuanLy_Id", strLopHoc_Id);
            addKeyValue("strThoiGianDaoTao_Id", strDAOTAO_ThoiGianDaoTao);
            addKeyValue("strPhamViApDung", strPhamViApDung);
            addKeyValue("strTuNgay", strTuNgay);
            addKeyValue("strDenNgay", strDenNgay);
            addKeyValue("strTuKhoa", strTuKhoa);
            addKeyValue("strKhoaQuanLy_Id", strKhoaQuanLy_Id);
            addKeyValue("strNamNhapHoc", strNamNhapHoc);
            for (var i = 0; i < strTAICHINH_CacKhoanThu_Ids.length; i++) {
                addKeyValue("strTAICHINH_CacKhoanThu_Ids", strTAICHINH_CacKhoanThu_Ids[i]);
            }
            addKeyValue("strTrangThaiNguoiHoc_Id", strTrangThaiNguoiHoc_Id);
        });
        $("#MainContent").delegate("#btnSearch_TongHopDuLieu", "click", function (e) {
            edu.system.confirm("Bạn có chắc chắn muốn tổng hợp dữ liệu không ?");
            $("#btnYes").click(function (e) {
                $("#btnYes").hide();
                $('#myModalAlert #alert_content').html('');
                me.getList_SV()
            });
        });
        //me.getList_MauImport();
    },
    /*------------------------------------------
    --Discription: [0] Common
    --ULR: Modules
    -------------------------------------------*/
    showHide_Box: function (cl, id) {
        //cl - list of class to hide()
        //id - to show()
        $("." + cl).slideUp();
        $("#" + id).slideDown();

    },
    resetCombobox: function (point) {
        var x = $(point).val();
        if (x.length == 2) {
            if (x[0] == "") {
                $(point).val(x[1]).trigger("change");
            }
        }
    },
    /*------------------------------------------
    --Discription: [1] ACCESS DB ==>Systemroot
    --ULR: Modules
    -------------------------------------------*/
    getList_HeDaoTao: function () {
        var me = this;
        var objList = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_HeDaoTao(objList, "", "", me.cbGenCombo_HeDaoTao);
    },
    getList_KhoaDaoTao: function () {
        var me = this;
        var objList = {
            strHeDaoTao_Id: edu.util.getValById("dropSearch_HeDaoTao_NT"),
            strCoSoDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_KhoaDaoTao(objList, "", "", me.cbGenCombo_KhoaDaoTao);
    },
    getList_ChuongTrinhDaoTao: function () {
        var me = this;
        var objList = {
            strKhoaDaoTao_Id: edu.util.getValById("dropSearch_KhoaDaoTao_NT"),
            strN_CN_LOP_Id: "",
            strKhoaQuanLy_Id: "",
            strToChucCT_Cha_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_ChuongTrinhDaoTao(objList, "", "", me.cbGenCombo_ChuongTrinhDaoTao);
    },
    getList_LopQuanLy: function () {
        var me = this;
        var objList = {
            strCoSoDaoTao_Id: "",
            strDaoTao_HeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao_NT"),
            strKhoaDaoTao_Id: edu.util.getValById("dropSearch_KhoaDaoTao_NT"),
            strNganh_Id: "",
            strLoaiLop_Id: "",
            strToChucCT_Id: edu.util.getValById("dropSearch_ChuongTrinh_NT"),
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_LopQuanLy(objList, "", "", me.cbGenCombo_LopQuanLy);
    },
    getList_NguoiThu: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TC_NguoiDungDaThuTien/LayDanhSach',
            'versionAPI': 'v1.0',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_NguoiThu(json);
                } else {
                    console.log(data.Message);
                    edu.extend.notifyBeginLoading("Lỗi: " + data.Message);
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
                edu.extend.notifyBeginLoading("Lỗi: " + JSON.stringify(er));
            },
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_ThoiGianDaoTao: function () {
        var me = this;
        var objList = {
            strNam_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 100000,
        };
        edu.system.getList_ThoiGianDaoTao(objList, "", "", me.cbGenCombo_ThoiGianDaoTao);
    },
    getList_TrangThaiSV: function () {
        var me = this;
        var obj_list = {
            'action': 'CM_DanhMucDuLieu/LayDanhSach',
            'versionAPI': 'v1.0',
            'strMaBangDanhMuc': 'QLSV.TRANGTHAI',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.genList_TrangThaiSV(data.Data);
                } else {
                    console.log(data.Message);
                }
            },
            error: function (er) {},
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_MauBaoCao_SVNT: function () {
        var me = this;
        var obj_list = {
            'action': 'CM_DanhMucDuLieu/LayDanhSach',
            'versionAPI': 'v1.0',
            'strMaBangDanhMuc': 'QLSV.TRANGTHAI',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.genList_TrangThaiSV(data.Data);
                } else {
                    console.log(data.Message);
                }
            },
            error: function (er) { },
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_NamNhapHoc: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'KHCT_NamNhapHoc/LayDanhSach',
            'versionAPI': 'v1.0',
            'strNguoiThucHien_Id': '',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_NamNhapHoc(json);
                } else {
                    edu.extend.notifyBeginLoading("Lỗi: " + data.Message);
                }
            },
            error: function (er) {
                edu.extend.notifyBeginLoading("Lỗi: " + JSON.stringify(er));
            },
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_KhoaQuanLy: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'KHCT_KhoaQuanLy/LayDanhSach',
            'versionAPI': 'v1.0',
            'strNguoiThucHien_Id': '',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_KhoaQuanLy(json);
                } else {
                    edu.extend.notifyBeginLoading("Lỗi: " + data.Message);
                }
            },
            error: function (er) {
                edu.extend.notifyBeginLoading("Lỗi: " + JSON.stringify(er));
            },
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/
    getList_MauImport: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'SYS_Import_PhanQuyen/LayDanhSach',
            'versionAPI': 'v1.0',

            'strTuKhoa': '',
            'strNguoiTao_Id': '',
            'strUngDung_Id': edu.system.appId,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiDung_Id': edu.system.userId,
            'strMauImport_Id': '',
            'pageIndex': 1,
            'pageSize': 100000,
        };

        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (edu.util.checkValue(data.Message)) {
                    edu.system.alert(data.Message);
                    return;
                }
                if (data.Success) {
                    me.cbGenCombo_MauImport(data.Data);
                }
                else {
                    edu.system.alert(obj_list.action + ": " + data.Message, "w");
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            authen: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    cbGenCombo_MauImport: function (data) {
        var me = this;
        var row = "";
        for (var i = 0; i < data.length; i++) {
            row += '<li><a class="btnBaoCao_SVNT" name="' + data[i].MAUIMPORT_MA + '" href="#"> ' + (i + 1) + '. ' + data[i].MAUIMPORT_TENFILEMAU + '</a></li>';
        }
        $("#zonebtnBaoCao_SVNT").html(row);
        //var obj = {
        //    data: data,
        //    renderInfor: {
        //        id: "MA",
        //        parentId: "",
        //        name: "TEN",
        //        code: "",
        //        avatar: "",
        //        Render: function (nRow, aData) {
        //            return "<option id='" + aData.ID + "' value='" + aData.MAUIMPORT_MA + "' name='" + aData.MAUIMPORT_DUONGDANFILEMAU + "' title='" + aData.CHISODONGDOCDULIEUTUFILE + "'>" + aData.MAUIMPORT_TENFILEMAU + "</option>";
        //        }
        //    },
        //    renderPlace: ["dropMauImport"],
        //    type: "",
        //    title: "Chọn mẫu import",
        //}
        //edu.system.loadToCombo_data(obj);
    },
    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/
    cbGenCombo_HeDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENHEDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_HeDaoTao_NT"],
            type: "",
            title: "Tất cả hệ đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_KhoaDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKHOA",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_KhoaDaoTao_NT"],
            type: "",
            title: "Tất cả khóa đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_ChuongTrinhDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENCHUONGTRINH",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ChuongTrinh_NT"],
            type: "",
            title: "Tất cả chương trình đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_LopQuanLy: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_Lop_NT"],
            type: "",
            title: "Tất cả lớp",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_ThoiGianDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_HocKy_NT"],
            type: "",
            title: "Tất cả học kỳ",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_NguoiThu: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TAIKHOAN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_NguoiThu_NT"],
            type: "",
            title: "Tất cả người thu",
        }
        edu.system.loadToCombo_data(obj);
    },
    genList_TrangThaiSV: function (data) {
        var me = this;
        var row = '';
        row += '<div class="col-lg-6 checkbox-inline user-check-print pull-left">';
        row += '<input style="float: left; margin-right: 5px" type="checkbox" class="ckbDSTrangThaiSV_LHD_ALL" checked="checked"/>';
        row += '<span><b>Tất cả</b></p></span>';
        row += '</div>';
        for (var i = 0; i < data.length; i++) {
            var strcheck = "";
            //if (dataKhoanThu[i].TEN.includes('ọc phí') || dataKhoanThu[i].TEN.includes('inh phí')) strcheck = 'checked="checked"'
            row += '<div class="col-lg-6 checkbox-inline user-check-print; pull-left">';
            row += '<input checked="checked" style="float: left; margin-right: 5px" type="checkbox" id="' + data[i].ID + '" class="ckbDSTrangThaiSV_LHD" title="' + data[i].TEN + '"' + strcheck + '/>';
            row += '<span><p>' + data[i].TEN + '</p></span>';
            row += '</div>';
        }
        $("#DSTrangThaiSV_LHD").html(row);
        //me.getList_KhoanThu();

        //me.getList_KhoanThu_ChuaXuat();
    },
    genList_MauBaoCao_SVNT: function (data) {
        var me = this;
        var row = '';
        for (var i = 0; i < data.length; i++) {
            //if (dataKhoanThu[i].TEN.includes('ọc phí') || dataKhoanThu[i].TEN.includes('inh phí')) strcheck = 'checked="checked"'
            row += '<li><a class="btnBaoCao_SVNT" name="ThongKe_TongHopNoHocPhi" href="#"> Xuất DS sinh viên còn nợ</a></li >';
        }
        $("#zonebtnBaoCao_SVNT").html(row);
        //me.getList_KhoanThu();
    },
    cbGenCombo_NamNhapHoc: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "NAMNHAPHOC",
                parentId: "",
                name: "NAMNHAPHOC",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_NamNhapHoc_IHD"],
            type: "",
            title: "Tất cả năm nhập học",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_NguoiThu_IHD").val("").trigger("change");
    },
    cbGenCombo_KhoaQuanLy: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_KhoaQuanLy_IHD"],
            type: "",
            title: "Tất cả khoa quản lý",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_NguoiThu_IHD").val("").trigger("change");
    },
    /*------------------------------------------
    --Discription: [1] ACCESS DB ==> KhoanThu
    --ULR: Modules
    -------------------------------------------*/
    getList_DMLKT: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'TC_KhoanThu/LayDanhSach',
            'strTuKhoa': '',
            'pageIndex': 1,
            'pageSize': 10000,
            'iTinhTrang': -1,
            'strNhomCacKhoanThu_Id': '',
            'strNguoiTao_Id': '',
            'strCanBoQuanLy_Id': '',
            'strNguoiThucHien_Id': '',
        }

        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.genList_DMLKT(json);
                } else {
                    console.log(data.Message);
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
            },
            type: "GET",
            versionAPI: "v1.0",
            contentType: true,
            action: obj_list.action,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_KhoanThu_ChuaXuat: function (strTuKhoa) {
        var me = this;
        strTuKhoa = edu.util.getValById('btnSearch_NT');
        var strLoaiKhoanThu = edu.extend.getCheckedCheckBoxByClassName('ckbLKT_NT').toString();
        var strTrangThaiNguoiHoc_Id = edu.extend.getCheckedCheckBoxByClassName('ckbDSTrangThaiSV_LHD').toString();
        if (strLoaiKhoanThu === '') {
            edu.extend.notifyBeginLoading('Vui lòng chọn khoản thu. Để có thể lấy danh sách khoản thu!', 'w');
            return;
        }
        var obj_list = {
            'action': 'TC_NguoiHoc/LayDSNguoiHocConNoTien',
            'versionAPI': 'v1.0',
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
            'strTrangThaiNguoiHoc_Id': strTrangThaiNguoiHoc_Id,
            'strTAICHINH_CacKhoanThu_Ids': strLoaiKhoanThu,
            'strTaiChinh_KhoanKhac_Ids': edu.util.getValById('dropAAAA'),
            //'strNguoiDung_Id': edu.util.getValById('dropAAAA'),
            'strTuNgay': edu.util.getValById('txtSearch_TuNgay_NT'),
            'strDenNgay': edu.util.getValById('txtSearch_DenNgay_NT'),
            'strHeDaoTao_Id': edu.util.getValById("dropSearch_HeDaoTao_NT"),
            'strKhoaDaoTao_Id': edu.util.getValById("dropSearch_KhoaDaoTao_NT"),
            'strChuongTrinh_Id': edu.util.getValById("dropSearch_ChuongTrinh_NT"),
            'strLopQuanLy_Id': edu.util.getValById("dropSearch_Lop_NT"),
            'strTuKhoa': edu.util.getValById("txtSearch_NT"),
            'strNguoiDung_Id': edu.util.getValById("dropSearch_NguoiThu_NT"),
            'strNamNhapHoc': edu.util.getValCombo('dropSearch_NamNhapHoc_IHD'),
            'strKhoaQuanLy_Id': edu.util.getValCombo('dropSearch_KhoaQuanLy_IHD'),
        }

        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.genTable_KhoanThu_ChuaXuat(json, data.Pager);
                } else {
                    console.log(data.Message);
                    edu.extend.notifyBeginLoading("Lỗi: " + data.Message, "w");
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
                edu.extend.notifyBeginLoading("Lỗi (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null)
    },
    /*------------------------------------------
    --Discription: [1] GEN HTML ==> Khoan Thu
    --ULR: Modules
    -------------------------------------------*/
    genList_DMLKT: function (dataKhoanThu) {
        var me = this;
        var row = '';
        row += '<div class="col-lg-4 checkbox-inline user-check-print pull-left">';
        row += '<input style="float: left; margin-right: 5px" type="checkbox" class="ckbLKT_NT_All" checked="checked"/>';
        row += '<span><b>Tất cả</b></span>';
        row += '</div>';
        for (var i = 0; i < dataKhoanThu.length; i++) {
            var strcheck = "";
            row += '<div class="col-lg-4 checkbox-inline user-check-print; pull-left">';
            row += '<input style="float: left; margin-right: 5px" type="checkbox" id="' + dataKhoanThu[i].ID + '" class="ckbLKT_NT" title="' + dataKhoanThu[i].TEN + '"' + strcheck + ' checked="checked"/>';
            row += '<span><p>' + dataKhoanThu[i].TEN + '</p></span>';
            row += '</div>';
        }
        $("#zoneLoaiKhoanPhi").replaceWith(row);
        //me.getList_KhoanThu_ChuaXuat();
    },
    genTable_KhoanThu_ChuaXuat: function (data, iPager) {
        var me = this;
        var strTable_Id = "tbldata_KhoanThu_ChuaXuat_NT";
        var jsonForm = {
            strTable_Id: strTable_Id,
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.SinhVienNoTien.getList_KhoanThu_ChuaXuat()",
                iDataRow: iPager,
            },
            colPos: {
                left: [1],
                center: [0, 4],
                right: [7]
            },
            "aoColumns": [
                {
                    //"mDataProp": "MASONGUOIHOC",
                    "mRender": function (nRow, aData) {
                        return '<span name="' + aData.QLSV_NGUOIHOC_ID + '">' + aData.MASONGUOIHOC + '</span>';
                    }
                },
                {
                    "mDataProp": "HOTENNGUOIHOC"
                },
                {
                    "mDataProp": "LOP"
                },
                {
                    "mDataProp": "DAOTAO_THOIGIANDAOTAO"
                }, {
                    "mDataProp": "TAICHINH_CACKHOANTHU_TEN"
                }, {
                    "mDataProp": "TAICHINH_CACKHOANTHU_TEN"
                }, {
                    "mData": "SOTIEN",
                    "mRender": function (nRow, aData) {
                        return edu.util.formatCurrency(aData.SOTIEN);
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        if (data !== undefined && data.length > 0) {
            edu.system.insertSumAfterTable(strTable_Id, [7]);
            $("#" + strTable_Id + " tfoot tr td:eq(7)").attr("style", "text-align: right;");
            var x = document.getElementById(strTable_Id).getElementsByTagName('tbody')[0].rows;
            for (var i = 0; i < x.length; i++) {
                //$(x[i]).attr("name", x[i].id);
                x[i].id = '';
            }
            edu.system.collageInTable({
                strTable_Id: strTable_Id,
                iBatDau: 1,
                iKetThuc: 1,
                arrStr: [2, 3, 4, 5, 6],
                arrFloat: [7],
            });
        } else {
            $("#" + strTable_Id + " tfoot").html('');
        }
    },

    /*------------------------------------------
    --Discription: [1] GEN HTML ==> Khoan Thu
    --ULR: Modules
    -------------------------------------------*/
    getList_SV: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'TC_NguoiHoc/LayDSNguoiHoc',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strHeDaoTao_Id': edu.util.getValById('dropSearch_HeDaoTao_NT'),
            'strKhoaDaoTao_Id': edu.util.getValById('dropSearch_KhoaDaoTao_NT'),
            'strChuongTrinh_Id': edu.util.getValById('dropSearch_ChuongTrinh_NT'),
            'strLopQuanLy_Id': edu.util.getValById('dropSearch_Lop_NT'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strTrangThaiNguoiHoc_Id': edu.util.getValById('txtSearch_NT'),
        }

        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    edu.system.genHTML_Progress("myModalAlert #alert_content", json.length);
                    for (var i = 0; i < json.length - 1; i++) {
                        me.TongHopDuLieu(json[i], false);
                    }
                    me.TongHopDuLieu(json[json.length -1], true);
                } else {
                    console.log(data.Message);
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
            },
            type: "GET",
            versionAPI: "v1.0",
            contentType: true,
            action: obj_list.action,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    TongHopDuLieu: function (aData, bcheck) {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'TC_NguoiHoc/TongHopDuNoSinhVien',
            'strNguoiThucHien_Id': edu.system.userId,
            'strQLSV_NguoiHoc_Id': aData.ID,
        }

        if (edu.util.getValById('txtSearch_TuNgay_NT') || edu.util.getValById('txtSearch_DenNgay_NT'))
            var obj_list = {
                'action': 'TC_NguoiHoc/TongHopDuNoSinhVien_UT',
                'type': 'POST',
                'strNguoiThucHien_Id': edu.system.userId,
                'strNguoiHoc_Id': aData.ID,
                'strNgayBatDau': edu.util.getValById('txtSearch_TuNgay_NT'),
                'strNgayKetThuc': edu.util.getValById('txtSearch_DenNgay_NT'),
                'strPhamViThongKe': edu.util.getValById('txtAAAA'),
                'strThoiGianDaoTao_Id': edu.util.getValById('dropSearch_HocKy_NT'),
            };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                } else {
                    console.log(data.Message);
                }
                if (bcheck == true) {
                    $('#myModalAlert #alert_content').append('<p>Thực hiện thành công. Hãy kiểm tra lại</p>');
                }
                edu.system.start_Progress("myModalAlert #alert_content");
            },
            error: function (er) {
                edu.system.endLoading();
                if (bcheck == true) {
                    $('#myModalAlert #alert_content').append('<p>Thực hiện thành công. Hãy kiểm tra lại</p>');
                }
                edu.system.start_Progress("myModalAlert #alert_content");
            },
            type: "POST",
            versionAPI: "v1.0",
            contentType: true,
            action: obj_list.action,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    
}