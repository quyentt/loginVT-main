/*----------------------------------------------
--Author: Văn Hiệp
--Phone: 
--Date of created: 
--Input: 
--Output:
--Note:
----------------------------------------------*/
function PhucKhao() { };
PhucKhao.prototype = {
    dtPhucKhao: [],
    strPhucKhao_Id: '',
    dtXacNhan: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        
        me.getList_ThoiGian();
        me.getList_HocPhan();
        me.getList_ThoiGianPK();
        //me.getList_PhucKhao();
        edu.system.loadToCombo_DanhMucDuLieu("THI.PHUCKHAO.TINHTRANG", "dropSearch_KetQuaDuyet", "", main_doc.PhucKhao.loadBtnXacNhan);
        $("#btnSearch").click(function (e) {
            me.getList_PhucKhao();
        });
        $("#txtSearch").keypress(function (e) {
            if (e.which === 13) {
                me.getList_PhucKhao();
            }
        });
        $('#dropSearch_ThoiGian').on('select2:select', function (e) {

            me.getList_HocPhan();
            //me.getList_PhucKhao();
        });
        $('#dropSearch_HocPhan').on('select2:select', function (e) {
            //me.getList_PhucKhao();
        });
       
        $("#zoneBtnXacNhan").delegate('.btnxacnhan', 'click', function () {
            var strTinhTrang = this.id;
            var strMoTa = edu.util.getValById("txtNoiDungXacNhan");
            var arrChecked_Id = edu.util.getArrCheckedIds("tblDSThi", "checkX");
            edu.system.alert('<div id="zoneprocessXXXX"></div>');
            edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
            for (var i = 0; i < arrChecked_Id.length; i++) {
                me.save_XacNhan(arrChecked_Id[i], strTinhTrang, strMoTa, "DUYETDANGKYPHUCKHAO");
            }
        });
        $("#btnXacNhan").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblDSThi", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng!");
                return;
            }
            $("#modal_XacNhan").modal("show");
            me.getList_XacNhan(arrChecked_Id[0], "DUYETDANGKYPHUCKHAO", "tblModal_XacNhan")
        });

        edu.system.getList_MauImport("zonebtnBaoCao_PK", function (addKeyValue) {
            addKeyValue("strDaoTao_ThoiGianDaoTao_Id", edu.util.getValCombo("dropSearch_ThoiGian"));
            addKeyValue("strDaoTao_HocPhan_Id", edu.util.getValCombo("dropSearch_HocPhan"));
            addKeyValue("strDaoTao_HeDaoTao_Id", edu.util.getValCombo("dropHeDaoTao_PK"));
            var arrChecked_Id = edu.util.getArrCheckedIds("tblDSThi", "checkX");
            arrChecked_Id.forEach(e => addKeyValue("strPhucKhao_Id", e));
        });
        edu.extend.genBoLoc_HeKhoa("_PK")

        $("#btnAdd_PhucKhao").click(function () {
            edu.util.toggle_overide("zone-bus", "zoneEdit");
        });
        $(".btnClose").click(function () {
            me.toggle_form();
        });

        $('#dropSearch_ThoiGianPhucKhao').on('select2:select', function (e) {
            me.getList_ThoiGianPhucKhao();
            me.getList_DotThi();
        });
        $("#btnSearch").click(function (e) {
            me.getList_PhucKhao();
        });
        $("#btnSearchThoiGianPhucKhao").click(function (e) {
            me.getList_ThoiGianPhucKhao();
        });
        $("#tblThoiGianPhucKhao").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtThoiGianPhucKhao.find(e => e.ID == strId);
            me["strThoiGianPhucKhao_Id"] = data.ID;
            edu.util.viewValById("txtNgayBatDau", data.NGAYBATDAU);
            edu.util.viewValById("txtNgayKetThuc", data.NGAYKETTHUC);
            edu.util.viewValById("txtNgayHetHan", data.NGAYHETHANTHUPHI);
            $("#myModalThoiGianPhucKhao").modal("show");
        });
        $("#btnAdd_ThoiGianPhucKhao").click(function () {
            var data = {};
            me["strThoiGianPhucKhao_Id"] = data.ID;
            edu.util.viewValById("txtNgayBatDau", data.NGAYBATDAU);
            edu.util.viewValById("txtNgayKetThuc", data.NGAYKETTHUC);
            edu.util.viewValById("txtNgayHetHan", data.NGAYHETHANTHUPHI);
            $("#myModalThoiGianPhucKhao").modal("show");
        });
        $("#btnSave_ThoiGianPhucKhao").click(function () {
            if (me.strThoiGianPhucKhao_Id) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", 1);
                me.save_ThoiGianPhucKhao(me.dtThoiGianPhucKhao.find(e => e.ID == me.strThoiGianPhucKhao_Id).PHAMVIAPDUNG_ID);
                //setTimeout(function () {
                //    me.getList_ThoiGianPhucKhao();
                //}, 5000)
            } else {
                var arrChecked_Id = edu.util.getArrCheckedIds("tblModalPhamViPhucKhao", "checkX");
                if (arrChecked_Id.length == 0) {
                    edu.system.alert("Vui lòng chọn đối tượng?");
                    return;
                }
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.save_ThoiGianPhucKhao(arrChecked_Id[i]);
                }
            }
        });
        $("#btnDelete_ThoiGianPhucKhao").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblThoiGianPhucKhao", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng cần xóa?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.delete_ThoiGianPhucKhao(arrChecked_Id[i]);
                }
            });
        });
    },
    toggle_form: function () {
        edu.util.toggle_overide("zone-bus", "zonebatdau");
    },
    loadBtnXacNhan: function (data) {
        main_doc.PhucKhao.dtXacNhan = data;
        var row = "";
        row += '<div style="margin-left: auto; margin-right: auto; width: ' + ((data.length) * 90) + 'px">';
        for (var i = 0; i < data.length; i++) {
            var strClass = data[i].THONGTIN1;
            if (!edu.util.checkValue(strClass)) strClass = "fa fa-paper-plane";
            row += '<div id="' + data[i].ID + '" class="btn-large btnxacnhan">';
            row += '<a class="btn"><i style="' + data[i].THONGTIN2 + '" class="' + strClass + ' fa-4x"></i></a>';
            row += '<a class="color-active bold">' + data[i].TEN + '</a>';
            row += '</div>';
        }
        row += '</div>';
        $("#zoneBtnXacNhan").html(row);
    },

    getList_BtnXacNhan: function (strDuLieuXacNhan, strLoaiXacNhan_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TP_PhucKhao/LayDSThi_PhucKhao_XacNhan',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDuLieuXacNhan': strDuLieuXacNhan,
            'strLoaiXacNhan_Id': strLoaiXacNhan_Id,
            'strNguoiXacNhan_Id': edu.util.getValById('dropAAAA'),
            'strTinhTrang_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.loadBtnXacNhan(dtReRult, data.Pager);
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
    },    /*----------------------------------------------
    --Author: DuyenTT
    --Date of created:
    --Discription: SinhVien Modal
    ----------------------------------------------*/
    save_XacNhan: function (strSanPham_Id, strTinhTrang_Id, strNoiDung, strLoaiXacNhan_Id) {
        var me = this;
        var obj_list = {
            'action': 'TP_PhucKhao/Them_Thi_PhucKhao_XacNhan',
            'type': 'POST',
            'strLoaiXacNhan_Id': strLoaiXacNhan_Id,
            'strTinhTrang_Id': strTinhTrang_Id,
            'strNguoiXacNhan_Id': edu.system.userId,
            'strThongTinXacNhan': strNoiDung,
            'strDuLieuXacNhan': strSanPham_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        $("#modal_XacNhan").modal('hide');
        //default

        edu.system.makeRequest({
            success: function (data) {

                if (data.Success) {
                    edu.system.alert("Xác nhận thành công", "s");
                } else {
                    edu.system.alert("Xác nhận thất bại:" + data.Message, "w");
                }
            },
            error: function (er) {

                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: obj_list.type,
            action: obj_list.action,

            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.getList_PhucKhao();
                });
            },
            contentType: true,

            data: obj_list,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_XacNhan: function (strDuLieuXacNhan, strLoaiXacNhan_Id, strTable_Id) {
        var me = this;
        var obj_save = {
            'action': 'TP_PhucKhao/LayDSThi_PhucKhao_XacNhan',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDuLieuXacNhan': strDuLieuXacNhan,
            'strLoaiXacNhan_Id': strLoaiXacNhan_Id,
            'strNguoiXacNhan_Id': edu.util.getValById('dropAAAA'),
            'strTinhTrang_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (typeof (callback) == "function") {
                    callback(data.Data);
                }
                else {
                    me.genTable_XacNhan(data.Data, strTable_Id);
                }
            },
            error: function (er) {

                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_save.action,

            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    genTable_XacNhan: function (data, strTable_Id) {
        var jsonForm = {
            strTable_Id: strTable_Id,
            aaData: data,
            aoColumns: [
                {
                    "mDataProp": "TINHTRANG_TEN"
                },
                {
                    "mDataProp": "NOIDUNG"
                },
                {
                    "mDataProp": "NGUOIXACNHAN_TENDAYDU"
                },
                {
                    "mDataProp": "NGAYTAO_DD_MM_YYYY"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        /*III. Callback*/
    },

    /*------------------------------------------
    --Discription: [1] ACCESS DB ==> KhoanThu
    --ULR: Modules
    -------------------------------------------*/
    getList_PhucKhao: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'XLHV_TP_PhucKhao_MH/DSA4BRIVKSgRKTQiCikgLgPP',
            'func': 'pkg_thi_phach_phuckhao.LayDSThiPhucKhao',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropSearch_ThoiGian'),
            'strDaoTao_HocPhan_Id': edu.util.getValById('dropSearch_HocPhan'),
            'strNgayHetHanDangKy': edu.util.getValById('txtNgayHetHanDangKy'),
            'strNgayHetHanNopPhi': edu.util.getValById('txtNgayHetHanNopPhi'),
            'strTinhTrangNopPhi': edu.util.getValById('dropSearch_PhiPhucKhao'),
            'strTinhTrang_Duyet_Id': edu.util.getValById('dropSearch_KetQuaDuyet'),
            'dChuaCoTrangThaiDuyetNao': $('#dTrangThaiDuyet').is(":checked") ? 1 : 0,
            'strDaoTao_HeDaoTao_Id': edu.system.getValById('dropHeDaoTao_PK'),
        };
        if (!obj_save.strDaoTao_HeDaoTao_Id) {
            edu.system.alert("Bạn cần chọn hệ đào tạo");
            return;
        }
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtNhapDiem = dtReRult;
                    me.genTable_PhucKhao(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(" : " + data.Message, "s");
                }
            },
            error: function (er) {

                edu.system.alert(" (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTable_PhucKhao: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblDSThi",

            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "QLSV_NGUOIHOC_MASO"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_HODEM"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_TEN"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_EMAIL"
                },
                {
                    "mDataProp": "DAOTAO_KHOAQUANLYSV_TEN",
                },
                {
                    "mDataProp": "TUI",
                },
                {
                    "mDataProp": "SOPHACH",
                },
                {
                    "mDataProp": "SOBAODANH",
                },
                {
                    "mDataProp": "CATHI_TEN",
                },
                {
                    "mDataProp": "PHONGTHI_TEN",
                },
                {
                    //"mDataProp": "Daotao_Hocphan_Ten - Daotao_Hocphan_Ma",
                    mRender: function (nRow, aData) {
                        return edu.util.returnEmpty(aData.DAOTAO_HOCPHAN_TEN) + " - " + edu.util.returnEmpty(aData.DAOTAO_HOCPHAN_MA)
                    }
                },
                //{
                //    "mDataProp": "DIEM_THANHPHANDIEM_TEN"
                //},
                {
                    "mDataProp": "HINHTHUCTHI_TEN"
                },
                {
                    "mDataProp": "NGAYTHI"
                },
                //{
                //    "mDataProp": "CATHI_TEN"
                //},
                //{
                //    "mDataProp": "PHONGTHI_TEN"
                //},
                {
                    "mDataProp": "DIEM"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                    }
                },
                {
                    "mDataProp": "DAOTAO_KHOAQUANLYHP_TEN"
                },
                {
                    "mDataProp": "NGAYXACNHANHOANTHANHDIEMTHI"
                },
                {
                    "mDataProp": "NGAYDANGKYPHUCKHAO"
                },
                {
                    "mDataProp": "NGAYHETHANDANGKYPHUCKHAO"
                },
                {
                    "mDataProp": "NGAYHETHANNOPPHIPHUCKHAO"
                },
                {
                    //"mDataProp": "PhiPhucKhao - TinhTrangNopPhi"
                    mRender: function (nRow, aData) {
                        return edu.util.returnEmpty(aData.PHIPHUCKHAO) + " - " + edu.util.returnEmpty(aData.TINHTRANGNOPPHI)
                    }
                },
                {
                    "mDataProp": "TINHTRANG_TEN"
                },
                {
                    "mDataProp": "KETQUAPHUCKHAO"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/

    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/
    getList_ThoiGian: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TP_PhucKhao/LayThoiGianTheoDotThi',
            'type': 'GET',
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_ThoiGian(json);
                } else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er));
            },
            type: obj_list.type,
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    cbGenCombo_ThoiGian: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "THOIGIAN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ThoiGian"],
            type: "",
            title: "Chọn thời gian",
        };
        edu.system.loadToCombo_data(obj);
    },

    getList_HocPhan: function (strId) {
        var me = this;
        //--Edit

        var obj_list = {
            'action': 'TP_PhucKhao/LayHocPhanPhucKhao',
            'type': 'GET',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropSearch_ThoiGian'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genCombo_HocPhan(dtReRult);
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
    genCombo_HocPhan: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
            },
            renderPlace: ["dropSearch_HocPhan"],
            title: "Chọn học phần"
        };
        edu.system.loadToCombo_data(obj);
        //$("#dropSearch_HocPhan").select2();
    },

    getList_ThoiGianPK: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TP_Chung/LayThoiGian',
            'type': 'GET',
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_ThoiGianPK(json);
                } else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er));
            },
            type: obj_list.type,
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    cbGenCombo_ThoiGianPK: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "THOIGIAN",
                code: "",
                avatar: "",
                selectFirst: true
            },
            renderPlace: ["dropSearch_ThoiGianPhucKhao"],
            type: "",
            title: "Chọn thời gian",
        };
        edu.system.loadToCombo_data(obj);
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_ThoiGianPhucKhao: function (strPhamViApDung_Id) {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'XLHV_TP_PhucKhao_MH/FSkkLB4VKSgeESk0IgopIC4eFQYeACUP',
            'func': 'PKG_THI_PHACH_PHUCKHAO.Them_Thi_PhucKhao_TG_Ad',
            'iM': edu.system.iM,
            'strId': me.strThoiGianPhucKhao_Id,
            'strNgayBatDau': edu.system.getValById('txtNgayBatDau'),
            'strNgayKetThuc': edu.system.getValById('txtNgayKetThuc'),
            'strNgayHetHanThuPhi': edu.system.getValById('txtNgayHetHan'),
            'strPhamViApDung_Id': strPhamViApDung_Id,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (!obj_save.strId) {
                        edu.system.alert("Thêm mới thành công!");
                    }
                    else {
                        edu.system.alert("Cập nhật thành công!");
                    }
                    //me.getList_ThoiGianPhucKhao();
                }
                else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alert(JSON.stringify(er));
            },
            type: "POST",
            action: obj_save.action,
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.getList_ThoiGianPhucKhao();
                });
            },
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_ThoiGianPhucKhao: function () {
        var me = this;
        var obj_save = {
            'action': 'XLHV_TP_PhucKhao_MH/DSA4BRIVKSgeESk0IgopIC4eFQYeACUP',
            'func': 'PKG_THI_PHACH_PHUCKHAO.LayDSThi_PhucKhao_TG_Ad',
            'iM': edu.system.iM,
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropSearch_ThoiGianPhucKhao'),
            'strPhamViApDung_Id': edu.system.getValById('dropAAAA'),
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me["dtThoiGianPhucKhao"] = data.Data;
                    me.genTable_ThoiGianPhucKhao(data.Data);
                }
                else {
                    edu.system.alert(" : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(" (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    delete_ThoiGianPhucKhao: function (Ids) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_TinhTien_MH/GS4gHgoNBgUeBSAvKQw0IgAxBS4vBigg',
            'func': 'PKG_KLGV_V2_TINHTIEN.Xoa_KLGD_DanhMucApDonGia',
            'iM': edu.system.iM,
            'strId': Ids,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        title: "",
                        content: "Xóa dữ liệu thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
                else {
                    obj = {
                        title: "",
                        content: data.Message,
                        code: "w"
                    };
                    edu.system.afterComfirm(obj);
                }

            },
            error: function (er) {

                obj = {
                    title: "",
                    content: JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_save.action,

            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.getList_ThoiGianPhucKhao();
                });
            },
            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genTable_ThoiGianPhucKhao: function (data, iPager) {
        $("#lblThoiGianPhucKhao_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblThoiGianPhucKhao",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.DonGia.getList_ThoiGianPhucKhao()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "MA"
                },
                {
                    "mDataProp": "TEN"
                },
                {
                    "mDataProp": "NGAYBATDAU"
                },
                {
                    "mDataProp": "NGAYKETTHUC"
                },
                {
                    "mDataProp": "NGAYHETHANTHUPHI"
                },
                {
                    "mDataProp": "NGAYTAO_DD_MM_YYYY"
                },
                {
                    "mDataProp": "NGUOITAO_TAIKHOAN"
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
        /*III. Callback*/
    },
    getList_DotThi: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TP_Chung/LayDotThi',
            'type': 'GET',
            'strHinhThucThi_Id': edu.util.getValById('dropSearch_HinhThuc1'),
            'strDiem_ThanhPhanDiem_Id': edu.util.getValById('dropSearch_LoaiDiem1'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropSearch_ThoiGianPhucKhao'),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_DotThi(json);
                } else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er));
            },
            type: obj_list.type,
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    cbGenCombo_DotThi: function (data) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblModalPhamViPhucKhao",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.DonGia.getList_ThoiGianPhucKhao()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "TEN"
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
}