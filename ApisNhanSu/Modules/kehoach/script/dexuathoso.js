/*----------------------------------------------
--Author: Văn Hiệp
--Phone: 
--Date of created: 
--Input: 
--Output:
--Note:
----------------------------------------------*/
function DeXuatHoSo() { };
DeXuatHoSo.prototype = {
    dtDeXuatHoSo: [],
    strDeXuatHoSo_Id: '',
    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        me.getList_DeXuatHoSo();
        me.getList_LoaiLienHe();
        me.getList_LoaiDinhDanh();
        
        //edu.system.loadToCombo_DanhMucDuLieu("PERSON_IDENTIFIER.IDENTIFIER_TYPE_CODE", "dropSearch_LoaiDinhDanh", "", data => me["dtLoaiDinhDanh"] = data);
        edu.system.loadToCombo_DanhMucDuLieu("PERSON_IDENTIFIER.IDENTIFIER_TYPE_CODE", "dropSearch_LoaiDinhDanh");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_PERSON.DOB_PRECISION_LEVEL", "dropMucDoNgaySinh");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_PERSON.GENDER_ID", "dropGioiTinh");
        //edu.system.loadToCombo_DanhMucDuLieu("QLSV.VE.LOAI", "", "", data => me.dtTuyenXe = data);
        //me.getList_DMLKT();
        //$("#modal_sinhvien").modal("show");
        $("#btnSearch").click(function (e) {
            me.getList_DeXuatHoSo();
        });
        $("#txtSearch").keypress(function (e) {
            if (e.which === 13) {
                me.getList_DeXuatHoSo();
            }
        });
        $(".btnClose").click(function () {
            me.toggle_form();
        });

        $("#tblDeXuatHoSo").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtDeXuatHoSo.find(e => e.ID == strId);
            me["strDeXuatHoSo_Id"] = data.ID;
            edu.util.viewValById("txtHo", data.KLGD_DANHMUCAPDeXuatHoSo_ID);
            edu.util.viewValById("txtTenDem", data.DONVITINH_ID);
            edu.util.viewValById("txtTen", data.DeXuatHoSo);
            edu.util.viewValById("dropMucDoNgaySinh", data.MOTA);
            edu.util.viewValById("txtNgaySinh", data.MOTA);
            edu.util.viewValById("txtThangSinh", data.MOTA);
            edu.util.viewValById("txtNamSinh", data.MOTA);
            edu.util.viewValById("dropGioiTinh", data.MOTA);
            var strAnh = edu.system.getRootPathImg(data.ANHCANHANTUUP);
            edu.util.viewValById("uploadPicture_SV", data.ANHCANHANTUUP);////
            $("#srcuploadPicture_SV").attr("src", strAnh);////
            me.toggle_edit();
            me.getList_DinhDanh();
            me.getList_LienHe();
        });
        $("#btnAdd_DeXuatHoSo").click(function () {
            var data = {};
            me["strDeXuatHoSo_Id"] = data.ID;
            edu.util.viewValById("txtHo", data.KLGD_DANHMUCAPDeXuatHoSo_ID);
            edu.util.viewValById("txtTenDem", data.DONVITINH_ID);
            edu.util.viewValById("txtTen", data.DeXuatHoSo);
            edu.util.viewValById("dropMucDoNgaySinh", data.MOTA);
            edu.util.viewValById("txtNgaySinh", data.MOTA);
            edu.util.viewValById("txtThangSinh", data.MOTA);
            edu.util.viewValById("txtNamSinh", data.MOTA);
            edu.util.viewValById("dropGioiTinh", data.MOTA);
            var strAnh = edu.system.getRootPathImg(data.ANHCANHANTUUP);
            edu.util.viewValById("uploadPicture_SV", data.ANHCANHANTUUP);////
            $("#srcuploadPicture_SV").attr("src", strAnh);////
            me.toggle_edit();
        });
        $("#btnSave_DeXuatHoSo").click(function () {
            me.save_DeXuatHoSo();
        });
        $("#btnDelete_DeXuatHoSo").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblDeXuatHoSo", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng cần xóa?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.delete_DeXuatHoSo(arrChecked_Id[i]);
                }
            });
        });
        
        edu.system.getList_MauImport("zonebtnBaoCao_DeXuatHoSo", function (addKeyValue) {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblDeXuatHoSo", "checkX");
            addKeyValue("dHieuLuc", edu.util.getValById("dropSearch_HieuLuc"));
            arrChecked_Id.forEach(e => addKeyValue("strDiem_DeXuatHoSoCongNhan_Id", e));
        });
        setTimeout(function () {
            edu.system.uploadAvatar(['uploadPicture_SV'], "");
        }, 100);
    },

    rewrite: function () {
        //reset id
        var me = this;
    },
    toggle_form: function () {
        edu.util.toggle_overide("zone-bus", "zonebatdau");
        this.getList_DeXuatHoSo();
    },
    toggle_edit: function () {
        edu.util.toggle_overide("zone-bus", "zoneEdit");
        this.getList_LoaiLienHe();
        this.getList_LoaiDinhDanh();
    },
    toggle_DeXuatHoSo: function () {
        edu.util.toggle_overide("zone-bus", "zoneDeXuatHoSo");
    },
    /*------------------------------------------
    --Discription: [1] ACCESS DB ==> KhoanThu
    --ULR: Modules
    -------------------------------------------*/
    getList_DeXuatHoSo: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/BiQ1Ai4zJBEkMzIuLwM4DyY0LigVIC4IJQPP',
            'func': 'PKG_CORE_HOSONHANSU_05.GetCorePersonByNguoiTaoId',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtDeXuatHoSo = dtReRult;
                    me.genTable_DeXuatHoSo(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) {

                edu.system.alert(JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    save_DeXuatHoSo: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CC8yJDM1Ai4zJBEkMzIuLwPP',
            'func': 'PKG_CORE_HOSONHANSU_05.InsertCorePerson',
            'iM': edu.system.iM,
            'strId': me.strDeXuatHoSo_Id,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strFullName': edu.system.getValById('txtAAAA'),
            'strLastName': edu.system.getValById('txtAAAA'),
            'strMiddleName': edu.system.getValById('txtAAAA'),
            'strFirstName': edu.system.getValById('txtAAAA'),
            'strDateOfBirth': edu.system.getValById('txtAAAA'),
            'strDobPrecisionLevel': edu.system.getValById('txtAAAA'),
            'dBirthDay': edu.system.getValById('txtAAAA'),
            'dBirthMonth': edu.system.getValById('txtAAAA'),
            'dBirthYear': edu.system.getValById('txtAAAA'),
            'strGenderId': edu.system.getValById('txtAAAA'),
            'strProfileStatusId': edu.system.getValById('txtAAAA'),
            'strPortraitFileId': edu.system.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu5_MH/CC8yJDM1Ai4zJBEkMzIuLwPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_05.UpdateCorePerson';
        }
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strDeXuatHoSo_Id = "";

                    if (obj_save.strId == "") {
                        edu.system.alert("Thêm mới thành công!");
                        strDeXuatHoSo_Id = data.Id;
                    }
                    else {
                        edu.system.alert("Cập nhật thành công!");
                        strDeXuatHoSo_Id = obj_save.strId
                    }
                    
                }
                else {
                    edu.system.alert(data.Message);
                }

                me.getList_DeXuatHoSo();
            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");

            },
            type: 'POST',

            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    delete_DeXuatHoSo: function (strId) {
        var me = this;
        //--Edit
        var obj = {};
        var obj_delete = {
            'action': 'NS_HoSoNhanSu5_MH/BSQtJDUkAi4zJBEkMzIuLwPP',
            'func': 'PKG_CORE_HOSONHANSU_05.DeleteCorePerson',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
        };

        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                    me.getList_DeXuatHoSo();
                }
                else {
                    obj = {
                        content: "/Xoa: " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }

            },
            error: function (er) {
                var obj = {
                    content: "/Xoa (er): " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);

            },
            type: 'POST',
            action: obj_delete.action,

            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/
    genTable_DeXuatHoSo: function (data, iPager) {
        var me = this;
        $("#lblDeXuatHoSo_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblDeXuatHoSo",

            bPaginate: {
                strFuntionName: "main_doc.DeXuatHoSo.getList_DeXuatHoSo()",
                iDataRow: iPager,
            },
            aaData: data,
            colPos: {
                center: [0, 2, 3, 4, 5, 6, 7, 8, 9],
            },
            aoColumns: [
                {
                    "mDataProp": "FULL_NAME",
                },
                {
                    "mDataProp": "DATE_OF_BIRTH"
                },
                {
                    "mDataProp": "GENDER_NAME"
                },
                {
                    "mDataProp": "PROFILE_STATUS_NAME"
                },
                {
                    "mDataProp": "IS_ACTIVE"
                },
                {
                    "mDataProp": "CREATED_AT_DD_MM_YYYY_HHMMSS"
                },
                {
                    "mDataProp": "CREATED_BY_TAIKHOAN"
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
    
    getList_DinhDanh: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/BiQ1ESQzMi4vCCUkLzUoJygkMwM4ESQzMi4vHggl',
            'func': 'PKG_CORE_HOSONHANSU_05.GetPersonIdentifierByPerson_Id',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strPerson_Id': me.strDeXuatHoSo_Id,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtDinhDanh"] = dtReRult;
                    me.genTable_DinhDanh(dtReRult, data.Pager);
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
    genTable_DinhDanh: function (data, iPager) {
        var me = this;
        $("#lblDinhDanh_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblDinhDanh",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.DinhDanh.getList_DinhDanh()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "LOAIDINH_DANHTEN"
                },
                {
                    "mDataProp": "DinhDanh"
                },
                {
                    "mDataProp": "DONVITINH_TEN"
                },
                {
                    "mDataProp": "MOTA"
                },
                {
                    "mDataProp": "PHAMVIAPDUNG_TEN"
                },
                {
                    "mDataProp": "HIEULUC"
                },
                {
                    "mDataProp": "NGAYTAO_DD_MM_YYYY_HHMMSS"
                },
                {
                    "mDataProp": "NGUOITAO_TAIKHOAN"
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

    getList_LienHe: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/BiQ1ESQzMi4vAi4vNSAiNQM4ESQzMi4vHggl',
            'func': 'PKG_CORE_HOSONHANSU_05.GetPersonContactByPerson_Id',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strPerson_Id': me.strDeXuatHoSo_Id,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtLienHe"] = dtReRult;
                    me.genTable_LienHe(dtReRult, data.Pager);
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
    genTable_LienHe: function (data, iPager) {
        var me = this;
        $("#lblDinhDanh_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblLienHe",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.DinhDanh.getList_DinhDanh()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "LOAIDINH_DANHTEN"
                },
                {
                    "mDataProp": "DinhDanh"
                },
                {
                    "mDataProp": "DONVITINH_TEN"
                },
                {
                    "mDataProp": "MOTA"
                },
                {
                    "mDataProp": "PHAMVIAPDUNG_TEN"
                },
                {
                    "mDataProp": "HIEULUC"
                },
                {
                    "mDataProp": "NGAYTAO_DD_MM_YYYY_HHMMSS"
                },
                {
                    "mDataProp": "NGUOITAO_TAIKHOAN"
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

    getList_LoaiDinhDanh: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/DSA4BRINLiAoBSgvKQUgLykDIDUDNC4i',
            'func': 'PKG_CORE_HOSONHANSU_05.LayDSLoaiDinhDanhBatBuoc',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtLoaiDinhDanh"] = dtReRult;
                    me.genTable_LoaiDinhDanh(dtReRult, data.Pager);
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
    genTable_LoaiDinhDanh: function (data, iPager) {
        var me = this;
        $("#lblDinhDanh_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblDinhDanh",
            aaData: me.dtLoaiDinhDanh,
            //bPaginate: {
            //    strFuntionName: "main_doc.DinhDanh.getList_DinhDanh()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "TEN"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input class="form-control" id="txtSoDinhDinh' + aData.ID + '" />';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input class="form-control" id="txtNgayCap' + aData.ID + '" />';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input class="form-control" id="txtNoiCap' + aData.ID + '" />';
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

    getList_LoaiLienHe: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/BiQ1ESQzMi4vCCUkLzUoJygkMwM4ESQzMi4vHggl',
            'func': 'PKG_CORE_HOSONHANSU_05.GetPersonIdentifierByPerson_Id',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strPerson_Id': me.strDeXuatHoSo_Id,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtLoaiLienHe"] = dtReRult;
                    me.genTable_LoaiLienHe(dtReRult, data.Pager);
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
    genTable_LoaiLienHe: function (data, iPager) {
        var me = this;
        $("#lblDinhDanh_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblLienHe",
            aaData: me.dtLoaiLienHe,
            //bPaginate: {
            //    strFuntionName: "main_doc.DinhDanh.getList_DinhDanh()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "TEN"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input class="form-control" id="txtLienHe' + aData.ID + '" />';
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

    getList_KiemTraDinhDanh: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/BiQ1ESQzMi4vCCUkLzUoJygkMwM4ESQzMi4vHggl',
            'func': 'PKG_CORE_HOSONHANSU_05.GetPersonIdentifierByPerson_Id',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strPerson_Id': me.strDeXuatHoSo_Id,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtKiemTraDinhDanh"] = dtReRult;
                    me.genTable_KiemTraDinhDanh(dtReRult, data.Pager);
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
    genTable_KiemTraDinhDanh: function (data, iPager) {
        var me = this;
        $("#lblKiemTraDinhDanh_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblKiemTraDinhDanh",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.DinhDanh.getList_DinhDanh()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "IDENTIFIER_TYPE_CODE_NAME"
                },
                {
                    "mDataProp": "IDENTIFIER_NO"
                },
                {
                    "mDataProp": "ISSUE_DATE"
                },
                {
                    "mDataProp": "ISSUE_PLACE"
                },
                {
                    "mDataProp": "FULL_NAME"
                },
                {
                    "mDataProp": "NOTE"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        /*III. Callback*/
    },
}