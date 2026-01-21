/*----------------------------------------------
--Author: Văn Hiệp
--Phone: 
--Date of created: 
--Input: 
--Output:
--Note:
----------------------------------------------*/
function ThucHienIn() { };
ThucHienIn.prototype = {
    dtThucHienIn: [],
    strThucHienIn_Id: '',
    arrNhanSu_Id: [],
    arrSinhVien_Id: [],
    arrSinhVien: [],
    dtSinhVien: [],
    arrLop: [],
    arrKhoa: [],
    arrChuongTrinh: [],
    arrPrint: [],
    strFont : '',

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/

        //edu.system.loadToCombo_DanhMucDuLieu("TN.XACNHANVANBANG", "", "", me.loadBtnThucHienIn, "Tất cả tình trạng duyệt", "HESO1");
        //me.getList_ThoiGianDaoTao();
        //me.getList_ThucHienIn();
        me.getList_MauPhoiIn();
        me.getList_MauPhoiInBanSao();
        //me.getList_BtnThucHienIn();

        me.getList_HeDaoTao();
        me.getList_KhoaDaoTao();
        //me.getList_LopQuanLy();
        //me.getList_NamNhapHoc();
        //me.getList_KhoaQuanLy();
        //me.getList_PhanLoai();
        edu.system.loadToCombo_DanhMucDuLieu("TN.PHANLOAI", "dropSearch_PhanLoai,dropPhanLoai");

        $("#btnSearch").click(function (e) {
            me.getList_ThucHienIn();
        });
        $("#txtSearch").keypress(function (e) {
            if (e.which === 13) {
                me.getList_ThucHienIn();
            }
        });
        $("#btnSave_ThucHienIn").click(function (e) {
            var valid = edu.util.validInputForm(me.arrValid);

            if (valid) {
                me.save_ThucHienIn();
            }
        });
        $("[id$=chkSelectAll_ThucHienIn]").on("click", function () {
            edu.util.checkedAll_BgRow(this, { table_id: "tblThucHienIn" });
        });

        $('#dropSearch_HeDaoTao').on('select2:select', function (e) {
            me.getList_KhoaDaoTao();
            me.getList_LopQuanLy();
        });
        $('#dropSearch_KhoaDaoTao').on('select2:select', function (e) {
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $('#dropSearch_ChuongTrinh').on('select2:select', function (e) {
            me.getList_LopQuanLy();
        });
        
        $("#btnThucHienIn").click(function () {
            //var arrChecked_Id = edu.util.getArrCheckedIds("tblThucHienIn", "checkX");
            //if (arrChecked_Id.length == 0) {
            //    edu.system.alert("Vui lòng chọn đối tượng!");
            //    return;
            //}
            var x = $("#zoneMotherPhoi .zoneCon");
            //me.arrPrint = [];
            //for (var i = 0; i < x.length; i++) {
            //    me.arrPrint.push(x[i].id);
            //}
            //me.checkPrint();
            if (x.length > 0) {
                me.printHTML(x[0].id);
                me.save_InBang(x[0].id.substring(6));
            }
        });
        edu.system.localStorageDrop("dropSearch_Phoi");
        window.onafterprint = function (e) {
            console.log(e);
            console.log("Printing completed...");
        };
    },
    /*------------------------------------------
    --Discription: [1] ACCESS DB ==> KhoanThu
    --ULR: Modules
    -------------------------------------------*/
    getList_ThucHienIn: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TN_KetQua_CongNhan_VB/LayDanhSach',
            'strTuKhoa': edu.util.getValById('txtSearch'),
            'strPhanLoai_Id': edu.util.getValCombo('dropSearch_PhanLoai'),
            'strDaoTao_HeDaoTao_Id': edu.util.getValCombo('dropSearch_HeDaoTao'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValCombo('dropSearch_KhoaDaoTao'),
            'strDaoTao_ChuongTrinh_Id': edu.util.getValCombo('dropSearch_ChuongTrinh'),
            'strDaoTao_KhoaQuanLy_Id': edu.util.getValCombo('dropSearch_KhoaQuanLy'),
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo('dropSearch_Lop'),
            'strNguoiDung_Id': edu.util.getValById('dropAAAA'),
            'strNguoiTao_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strPhoi_MauPhoiIn_Id': edu.util.getValById('dropSearch_Phoi'),
            'strPhoi_MauPhoiIn_BanSao_Id': edu.util.getValById('dropMauPhoi_BanSao'),
            'dDoiTuongBenNgoai': edu.util.getValById('dropSearch_DoiTuong'),
            'strTinhTrangXacNhan_Id': edu.util.getValById('dropAAAA'),
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtThucHienIn = dtReRult;
                    me.genTable_ThucHienIn(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                
                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,
            
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTable_ThucHienIn: function (data, iPager) {
        var me = this;
        var strzoneId = "zoneMotherPhoi";
        var strFuntionName = "main_doc.ThucHienIn.getList_ThucHienIn()";
        var iDataRow = iPager;
        $("#lblThucHienIn_Tong").html(iPager);
        if (edu.util.checkValue(iDataRow) && iDataRow > 0) {
            //Trước đó chưa hiển thị phân trang thì sẽ hiển thị phân trang
            if (document.getElementsByClassName("zone-pag-footer" + strzoneId).length === 0) {
                edu.system.pagInfoRender(strzoneId);
                //Thay đổi sang ô tìm kiếm
                //edu.system.insertFilterToTable(strzoneId, strFuntionName);
                //Tùy chọn thay đổi change
                //edu.system.insertChangLenghtToTable([[24, 30, 50, 100, 200, -1], [24, 30, 50, 100, 200, 'Tất cả']], strzoneId);
                //Tùy chọn Cập nhật lại PageSizechange
                $("#dropPageSizechange" + strzoneId).val(edu.system.pageSize_default).trigger('change');
                //Tạo dải phân cách giữa 2 thằng sau sẽ xóa
                $(".zone-pag-clear" + strzoneId).replaceWith('');
                $("#" + strzoneId).before('<div class="zone-pag-clear' + strzoneId + '" style="clear: both;"></div>');
            }
            edu.system.pagButtonRender(strFuntionName, strzoneId, iDataRow);
        } else {
            $(".zone-pag-footer" + strzoneId).replaceWith('');
            $(".change-" + strzoneId).html('');
            $(".light-pagination" + strzoneId).remove();
            $("#" + strzoneId).html("Không tìm thấy dữ liệu");
        }
        //edu.system.pagButtonRender("main_doc.ThucHienIn.getList_ThucHienIn()", "zoneMotherPhoi", iPager);
        var strPhoi = edu.util.getValById("dropSearch_Phoi") != "" ? edu.util.getValById("dropSearch_Phoi") : edu.util.getValById("dropMauPhoi_BanSao");
        me.getList_NoiDungTheoMa(strPhoi, "zoneMotherPhoi", data);
        return;
        var jsonForm = {
            strTable_Id: "tblThucHienIn",

            bPaginate: {
                strFuntionName: "main_doc.ThucHienIn.getList_ThucHienIn()",
                iDataRow: iPager,
            },
            aaData: data,
            colPos: {
                center: [0, 4, 5, 6, 7, 8, 9, 14, 15, 16],
            },
            aoColumns: [
                {
                    "mRender": function (nRow, aData) {
                        strAnh = edu.system.getRootPathImg(aData.ANH);
                        html = '<img src="' + strAnh + '" class= "table-img" />';
                        return html;
                    }
                },
                {
                    "mDataProp": "MASO"
                },
                {
                    //"mDataProp": "QLSV_NGUOIHOC_HOVATEN",
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.HODEM) + " " + edu.util.returnEmpty(aData.TEN);
                    }
                },
                {
                    "mRender": function (nRow, aData) {

                        return edu.util.returnEmpty(aData.NGAYSINH) + "/" + edu.util.returnEmpty(aData.THANGSINH) + "/" + edu.util.returnEmpty(aData.NAMSINH);
                    }
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_GIOITINH"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_DANTOC"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_NOISINH"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_NGANHNGHE"
                },
                {
                    "mDataProp": "SOHIEUBANG"
                },
                {
                    "mDataProp": "SOVAOSOCAPBANG"
                },
                {
                    "mDataProp": "SOQUYETDINH"
                },
                {
                    "mDataProp": "NGAYQUYETDINH"
                },
                {
                    "mDataProp": "NGAYKYBANG"
                },
                {
                    "mDataProp": "NGAYVAOSOCAPBANG"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnEdit" id="' + aData.ID + '" title="Sửa"><i class="fa fa-edit color-active"></i></a></span>';
                    }
                }
                , {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
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
            strHeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao"),
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
            strKhoaDaoTao_Id: edu.util.getValCombo("dropSearch_KhoaDaoTao"),
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
            strDaoTao_HeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao"),
            strKhoaDaoTao_Id: edu.util.getValCombo("dropSearch_KhoaDaoTao"),
            strNganh_Id: "",
            strLoaiLop_Id: "",
            strToChucCT_Id: edu.util.getValCombo("dropSearch_ChuongTrinh"),
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_LopQuanLy(objList, "", "", me.cbGenCombo_LopQuanLy);
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
    getList_NamNhapHoc: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'KHCT_NamNhapHoc/LayDanhSach',

            'strNguoiThucHien_Id': '',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_NamNhapHoc(json);
                } else {
                    edu.system.alert("Lỗi: " + data.Message);
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er));
            },
            type: "GET",
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_KhoaQuanLy: function () {
        var me = this;
        var objList = {
        };
        edu.system.getList_KhoaQuanLy({}, "", "", me.cbGenCombo_KhoaQuanLy);
    },
    getList_PhanLoai: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TN_KeHoach/LayDSPhanLoaiXetTheoND2',
            'strNguoiDung_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_PhanLoai(json);
                } else {
                    edu.system.alert("Lỗi: " + data.Message);
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er));
            },
            type: "GET",
            action: obj_list.action,

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
            renderPlace: ["dropSearch_HeDaoTao"],
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
            renderPlace: ["dropSearch_KhoaDaoTao"],
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
            renderPlace: ["dropSearch_ChuongTrinh"],
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
            renderPlace: ["dropSearch_Lop"],
            type: "",
            title: "Tất cả lớp",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_ThoiGianDaoTao: function (data) {
        var me = main_doc.ThucHienIn;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ThoiGianDaoTao", "dropThucHienIn_ThoiGianDaoTao"],
            type: "",
            title: "Tất cả học kỳ",
        }
        edu.system.loadToCombo_data(obj);
    },
    genList_TrangThaiSV: function (data) {
        var me = this;
        main_doc.ThucHienIn.dtTrangThai = data;
        var row = '';
        row += '<div class="col-lg-3 checkbox-inline user-check-print">';
        row += '<input type="checkbox" class="ckbDSTrangThaiSV_ALL" style="float: left;"  checked="checked"/>';
        row += '<span><b>Tất cả</b></p></span>';
        row += '</div>';
        for (var i = 0; i < data.length; i++) {
            var strcheck = "";
            //if (dataKhoanThu[i].TEN.includes('ọc phí') || dataKhoanThu[i].TEN.includes('inh phí')) strcheck = 'checked="checked"'
            row += '<div class="col-lg-3 checkbox-inline user-check-print">';
            row += '<input checked="checked" type="checkbox" style="float: left;"  id="' + data[i].ID + '" class="ckbDSTrangThaiSV" title="' + data[i].TEN + '"' + strcheck + '/>';
            row += '<span><p>' + data[i].TEN + '</p></span>';
            row += '</div>';
        }
        $("#DSTrangThaiSV").html(row);
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
            renderPlace: ["dropSearch_NamNhapHoc"],
            type: "",
            title: "Tất cả năm nhập học",
        }
        edu.system.loadToCombo_data(obj);
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
            renderPlace: ["dropSearch_KhoaQuanLy"],
            type: "",
            title: "Tất cả khoa quản lý",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_PhanLoai: function (data) {
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
            renderPlace: ["dropSearch_PhanLoai"],
            type: "",
            title: "Chọn phân loại",
        };
        edu.system.loadToCombo_data(obj);
    },


    getList_NoiDungTheoMa: function (strMa, zoneMauIn, dataIn, callback) {
        var me = this;
        var obj_list = {
            'action': 'CMS_MauPhoiIn_ChiTiet/LayDanhSach',
            'strId': strMa,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    if (dtReRult.length > 0) {
                        var iMaxTrang = 0;
                        me.strFont = dtReRult[0].FONT;
                        for (var i = 0; i < dtReRult.length; i++) {
                            if (dtReRult[i].TRANG > iMaxTrang) iMaxTrang = dtReRult[i].TRANG;
                        }
                        var strhead = '<style>.phoi{font-family:"' + dtReRult[0].FONT + '";position:absolute;cursor: pointer; font-size: ' + dtReRult[0].COCHU+ 'px}</style>';
                        $("#" + zoneMauIn).html(strhead);
                        var strAnhNen = dtReRult[0].DUONGDANFILE;
                        var strMagin = dtReRult[0].MARGIN_TOP ? 'margin-top: ' + dtReRult[0].MARGIN_TOP + 'px; margin-left: ' + dtReRult[0].MARGIN_LEFT + 'px;': '';
                        if (strAnhNen != null && strAnhNen.indexOf("_") != -1) {
                            arrTemp = strAnhNen.split("_");

                            for (var i = 0; i < iMaxTrang + 1; i++) {
                                $("#" + zoneMauIn).append('<div class="pr-containt" style="background: url(' + edu.system.getRootPathImg(strAnhNen) + ');background-repeat: no-repeat; background-size: ' + arrTemp[1] + 'px;height: ' + arrTemp[2] + 'px; ' + strMagin +'" ></div>');
                                if (i < iMaxTrang) $("#" + zoneMauIn).append('<p style="page-break-before: always;">&nbsp;</p>');
                            }
                        } else {

                            for (var i = 0; i < iMaxTrang + 1; i++) {
                                $("#" + zoneMauIn).append('<div class="pr-containt" style="' + strMagin +'"></div>');
                                if (i < iMaxTrang) $("#" + zoneMauIn).append('<p style="page-break-before: always;">&nbsp;</p>');
                            }
                        }
                        
                        for (var i = 0; i < dtReRult.length; i++) {
                            var strFontSize = "";
                            if (dtReRult[i].FONTSIZE) strFontSize = ' font-size: ' + dtReRult[i].FONTSIZE + 'px;'

                            if (dtReRult[i].DORONGPHANTUCANLE) strFontSize += 'width: ' + dtReRult[i].DORONGPHANTUCANLE + 'px;';
                            var html = '<span id="' + dtReRult[i].ID + '" class="phoi" style="margin-top: ' + dtReRult[i].LETREN + 'px; ' + strFontSize + ' margin-left: ' + dtReRult[i].LETRAI + 'px; ' + edu.util.returnEmpty(dtReRult[i].DINHDANG) + '; ' + edu.util.returnEmpty(dtReRult[i].LEPHAI) + edu.util.returnEmpty(dtReRult[i].CANLE_TRAI_PHAI_GIUA) + '"></span>';
                            $("#" + zoneMauIn + " .pr-containt:eq(" + edu.util.returnZero(dtReRult[i].TRANG) + ")").append(html);

                        }
                        if (typeof callback === "function") {
                            callback(dtReRult); 
                        } else {
                            me.genData_Phoi(zoneMauIn, dataIn, dtReRult);
                        }
                    }
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genData_Phoi: function (zoneMauIn, dataIn, dataPhoi) {
        var me = this;
        var pointMauIn = $("#" + zoneMauIn);
        var htmlPhoi = pointMauIn.html();
        pointMauIn.html("");
        for (var i = 0; i < dataIn.length; i++) {
            pointMauIn.append('<div id="zoneIn' + dataIn[i].ID + '" class="zoneCon">' + htmlPhoi + '</div>');
            if (i < dataIn.length - 1) $("#" + zoneMauIn).append('<p style="page-break-before: always;">&nbsp;</p>');
        }
        setTimeout(function () {
            for (var i = 0; i < dataIn.length; i++) {
                me.genData_ChiTiet("zoneIn" + dataIn[i].ID, dataIn[i], dataPhoi);
            }
        }, 1000);

    },
    genData_ChiTiet: function (zoneMauIn, aData, dataPhoi) {
        var me = this;
        var khoangcach = 30;
        if (dataPhoi.length > 0 && dataPhoi[0].KHOGIAY != null) khoangcach = dataPhoi[0].KHOGIAY;
        var arrCotBang = [];
        for (var i = 0; i < dataPhoi.length; i++) {
            var aPhoi_ChiTiet = dataPhoi[i];
            if (aPhoi_ChiTiet.NOIDUNG.includes("[x].")) {
                arrCotBang.push(aPhoi_ChiTiet);
                continue;
            }
            var strData = "";
            try {
                strData = eval(aPhoi_ChiTiet.NOIDUNG);
            } catch (ex) {
                strData = undefined;
            }
            if (strData !== null && strData !== undefined && strData !== "") {
                $("#" + zoneMauIn + " #" + aPhoi_ChiTiet.ID).html(strData);
            }
        }
        for (var i = 0; i < arrCotBang.length; i++) {
            var strNoiDung = arrCotBang[i].NOIDUNG;
            var tenCotBang = strNoiDung.substring(0, strNoiDung.indexOf("[x]."));
            if (tenCotBang.includes(" ") != -1) tenCotBang = tenCotBang.substring(strNoiDung.indexOf("[x].") + 1);
            var pointClone = $("#" + zoneMauIn + " #" + arrCotBang[j].ID).clone();
            var dosau = point.style.marginTop.replace("px", "");
            for (var j = 0; j < aData[tenCotBang].length; j++) {
                pointClone.css({
                    marginTop: dosau + (i * khoangcach) + "px"
                });
                try {
                    pointClone.html(eval(arrCotBang[j].NOIDUNG.replace(/[x]./g, '[' + j + '].')));
                    $("#" + zoneMauIn).append(pointClone);
                } catch (ex) {
                    console.log(ex);
                }

            }
        }
        //if (arrCotBang.length > 0) {
        //    for (var i = 0; i < aData[dulieu].length; i++) {
        //        for (var j = 0; j < arrCotBang.length; j++) {
        //            try {
        //                strData = eval(arrCotBang[j].NOIDUNG.replace(/[x]./g, '[' + i + '].'));
        //            } catch (ex) {
        //                strData = undefined;
        //            }
        //            if (strData !== null && strData !== undefined && strData !== "") {
        //                $("#" + zoneMauIn + " #" + arrCotBang[j].ID).html(strData);
        //            }
        //        }
        //    }
        //}
    },
    makeQRCode: function (zone, qrcode, width, height) {
        try {
            var point = $(zone);
            if (point.length > 0) {
                for (var i = 0; i < point.length; i++) {
                    var qrcodeA = new QRCode(point[i], {
                        width: width,
                        height: height
                    });
                    qrcodeA.makeCode(qrcode);
                }
            }
        } catch (ex) {
            console.log(ex);
            console.log("ERR QR:" + zone);
        }

    },
    makePicture: function (zone, strAnh, width, height) {
        $(zone).html('<img src="' + edu.system.getRootPathImg(strAnh) + '" style="width: ' + (width / 2.54 * 96) + 'px; height: ' + (height / 2.54 * 96) + 'px">');
    },
    printHTML: function (divId) {
        var me = this;
        ////Get the HTML of div
        //var divElements = document.getElementById(divId).innerHTML;
        ////Get the HTML of whole page
        //var oldPage = document.body.innerHTML;

        ////Reset the page's HTML with div's HTML only
        //document.body.innerHTML = "<html><head><title></title></head><body>" + divElements + "</body>";
        ////Print Page
        //window.print();

        ////Restore orignal HTML
        //document.body.innerHTML = oldPage;

        //the second print
        var content = document.getElementById(divId).innerHTML;
        var mywindow = window.open('', '', 'height=600,width=800,status=0');
        var htmlFont = "";
        if (me.strFont == "Bitter-VariableFont_wght") {
            htmlFont = '@font-face {font-family: "Bitter-VariableFont_wght";src: url("App_Themes/Cms/fonts/Bitter-VariableFont_wght.ttf") format("truetype");}';
        }

        mywindow.document.write('<html><head><title>Print</title><style>' + htmlFont +' @media print{@page{margin:0}body{margin:0.0cm}}</style></head><body>' + content + '</body></html>');

        mywindow.document.close();
        mywindow.focus();
        mywindow.print();
        //mywindow.close();//chrome bị lỗi phải comment lại
        setTimeout(function () {
            mywindow.close();//chrome bị lỗi phải comment lại
            $("#" + divId).remove();
            //me.arrPrint.shift();
            //me.checkPrint();
        }, 2000);
        return true;
    },
    //checkPrint: function () {
    //    var me = this;
    //    console.log(1111111);
    //    console.log(me.arrPrint[0]);
    //    if (me.arrPrint.length > 0) {
    //        me.printHTML(me.arrPrint[0]);
    //    }
    //}

    getList_MauPhoiIn: function () {
        var me = this;
        //--Edit
        me.strMauPhoiIn_Id = "";
        var obj_list = {
            'action': 'TN_PhoiIn/LayDS_MauPhoiIn_BanChinh',
            'strId': edu.util.getValById('txtAAAA')
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtMauPhoiIn"] = data.Data;
                    me.genCombo_MauPhoiIn(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    
    genCombo_MauPhoiIn: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "MAPHOI",
                //selectOne: true
            },
            renderPlace: ["dropSearch_Phoi"],
            title: "Chọn mẫu phôi"
        };
        edu.system.loadToCombo_data(obj);
        me.getList_ThucHienIn();
    },
    
    getList_MauPhoiInBanSao: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TN_PhoiIn/LayDS_MauPhoiIn_BanSao',
            'strId': edu.util.getValById('txtAAAA')
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genCombo_MauPhoiInBanSao(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_MauPhoiInBanSao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "MAPHOI",
                //selectOne: true
            },
            renderPlace: ["dropMauPhoi_BanSao"],
            title: "Chọn mẫu bản sao"
        };
        edu.system.loadToCombo_data(obj);
    },

    save_InBang: function (strTN_KetQua_CongNhan_VB_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'TN_KetQua_CongNhan_VB/ThemMoi',
            'strTN_KetQua_CongNhan_VB_Id': strTN_KetQua_CongNhan_VB_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {

                    //edu.system.alert("Thực hiện thành công thành công!");
                }
                else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");

            },
            type: 'POST',

            contentType: true,
            complete: function () {
                edu.system.start_Progress("zoneprocessQuanLyThongTin", function () {
                    me.getList_QuanLyThongTin();
                });
            },
            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
}