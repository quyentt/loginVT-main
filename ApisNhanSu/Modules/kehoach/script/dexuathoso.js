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
    icheck: true,
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
        edu.system.loadToCombo_DanhMucDuLieu("CORE_PERSON.DOB_PRECISION_LEVEL", "dropMucDoNgaySinh", "", data => {
            me["dtMucDoNgaySinh"] = data;
            
        });
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
            edu.util.viewValById("txtHo", data.LAST_NAME);
            edu.util.viewValById("txtTenDem", data.MIDDLE_NAME);
            edu.util.viewValById("txtTen", data.FIRST_NAME);
            $("#txtTen").trigger("input");
            edu.util.viewValById("dropMucDoNgaySinh", data.DOB_PRECISION_LEVEL);
            edu.util.viewValById("txtNgaySinh", data.BIRTH_DAY);
            edu.util.viewValById("txtThangSinh", data.BIRTH_MONTH);
            edu.util.viewValById("txtNamSinh", data.BIRTH_YEAR);
            edu.util.viewValById("dropGioiTinh", data.GENDER_ID);
            var strAnh = edu.system.getRootPathImg(data.PORTRAIT_FILE_ID);
            edu.util.viewValById("uploadPicture_SV", data.PORTRAIT_FILE_ID);////
            $("#srcuploadPicture_SV").attr("src", strAnh);////
            me.toggle_edit();
            me.getList_DinhDanh();
            me.getList_LienHe();
            $('#dropMucDoNgaySinh').val(strChinhXac_Id).trigger("change").trigger({ type: 'select2:select' });
        });
        $("#btnAdd_DeXuatHoSo").click(function () {
            var data = {};
            me["strDeXuatHoSo_Id"] = data.ID;
            edu.util.viewValById("txtHo", data.LAST_NAME);
            edu.util.viewValById("txtTenDem", data.MIDDLE_NAME);
            edu.util.viewValById("txtTen", data.FIRST_NAME);
            $("#txtTen").trigger("input");
            edu.util.viewValById("dropMucDoNgaySinh", data.DOB_PRECISION_LEVEL);
            edu.util.viewValById("txtNgaySinh", data.BIRTH_DAY);
            edu.util.viewValById("txtThangSinh", data.BIRTH_MONTH);
            edu.util.viewValById("txtNamSinh", data.BIRTH_YEAR);
            edu.util.viewValById("dropGioiTinh", data.GENDER_ID);
            var strAnh = edu.system.getRootPathImg(data.PORTRAIT_FILE_ID);
            edu.util.viewValById("uploadPicture_SV", data.PORTRAIT_FILE_ID);////
            $("#srcuploadPicture_SV").attr("src", strAnh);////
            me.toggle_edit();
            var strChinhXac_Id = me["dtMucDoNgaySinh"].find(e => e.MA == "EXACT").ID;

            $('#dropMucDoNgaySinh').val(strChinhXac_Id).trigger("change").trigger({ type: 'select2:select' });
        });
        $("#btnSave_DeXuatHoSo").click(function () {
            me.icheck = true;
            let iSLCheck = me.dtLoaiDinhDanh.length + me.dtLoaiLienHe.length;
            if (iSLCheck > 0) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", me.dtLoaiDinhDanh.length + me.dtLoaiLienHe.length);
                me.dtLoaiDinhDanh.forEach(e => me.save_KiemTraDinhDanh(e.ID));
                me.dtLoaiLienHe.forEach(e => me.save_KiemTraLienHe(e.ID));
            } else {
                edu.system.confirm("Chưa có thông tin định danh. Bạn có muốn lưu không?");
                $("#btnYes").click(function (e) {
                    me.save_DeXuatHoSo();
                });
            }
            
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


        $("#btnAdd_KiemTraDinhDanh").click(function () {
            edu.util.toggle_overide("zone-bus", "zoneKiemTraDinhDanh");
        });
        
        $('#txtTen, #txtTenDem, #txtHo').on('input', function () {
            $('#txtHoVaTen').val(
                $('#txtHo').val() + ' ' +
                $('#txtTenDem').val() + ' ' +
                $('#txtTen').val()
            );
        });
        $("#btnSearch_KiemTra").click(function (e) {
            if (!edu.util.getValById("dropSearch_LoaiDinhDanh") && !edu.util.getValById("txtSoDinhDanh")) {
                edu.system.alert("Bạn cần điển đủ thông tin")
                return;
            }
            me.getList_KiemTraDinhDanh();
        });
        $("#txtSoDinhDanh").keypress(function (e) {
            if (e.which === 13) {
                me.getList_KiemTraDinhDanh();
            }
        });

        $('#dropMucDoNgaySinh').on('select2:select', function () {
            var strMa = $('#dropMucDoNgaySinh option:selected').attr("name").trim();
            switch (strMa) {
                case "EXACT": {
                    $("#txtNgaySinh").parent().parent().parent().show();
                    $("#txtThangSinh").parent().parent().parent().show();
                    $("#txtNamSinh").parent().parent().parent().show();
                    break;
                };
                case "MONTH_ONLY": {
                    $("#txtNgaySinh").parent().parent().parent().hide();
                    $("#txtThangSinh").parent().parent().parent().show();
                    $("#txtNamSinh").parent().parent().parent().show();
                    break;
                };
                case "YEAR_ONLY": {
                    $("#txtNgaySinh").parent().parent().parent().hide();
                    $("#txtThangSinh").parent().parent().parent().hide();
                    $("#txtNamSinh").parent().parent().parent().show();
                    break;
                };
                case "UNKNOWN": {
                    $("#txtNgaySinh").parent().parent().parent().hide();
                    $("#txtThangSinh").parent().parent().parent().hide();
                    $("#txtNamSinh").parent().parent().parent().hide();
                    break;
                };
            }
        });
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
        this.genTable_LoaiDinhDanh();
        this.genTable_LoaiLienHe();
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
        if (!me["icheck"]) {
            return;
            //edu.system.alert("Lưu thành công");
        }
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CC8yJDM1Ai4zJBEkMzIuLwPP',
            'func': 'PKG_CORE_HOSONHANSU_05.InsertCorePerson',
            'iM': edu.system.iM,
            'strId': me.strDeXuatHoSo_Id,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strFullName': edu.system.getValById('txtHoVaTen'),
            'strLastName': edu.system.getValById('txtHo'),
            'strMiddleName': edu.system.getValById('txtTenDem'),
            'strFirstName': edu.system.getValById('txtTen'),
            'strDateOfBirth': edu.system.getValById('txtNgaySinh') + "/" + edu.system.getValById('txtThangSinh') + "/" + edu.system.getValById('txtNamSinh'),
            'strDobPrecisionLevel': edu.system.getValById('dropMucDoNgaySinh'),
            'dBirthDay': edu.system.getValById('txtNgaySinh'),
            'dBirthMonth': edu.system.getValById('txtThangSinh'),
            'dBirthYear': edu.system.getValById('txtNamSinh'),
            'strGenderId': edu.system.getValById('dropGioiTinh'),
            'strProfileStatusId': edu.system.getValById('txtAAAA'),
            'strPortraitFileId': edu.system.getValById('uploadPicture_SV'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu5_MH/FDElIDUkAi4zJBEkMzIuLwPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_05.UpdateCorePerson';
        }
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strDeXuatHoSo_Id = "";

                    if (!obj_save.strId) {
                        //edu.system.alert("Thêm mới thành công!");
                        strDeXuatHoSo_Id = data.Id;
                    }
                    else {
                        //edu.system.alert("Cập nhật thành công!");
                        strDeXuatHoSo_Id = obj_save.strId
                    }
                    me.strDeXuatHoSo_Id = strDeXuatHoSo_Id;
                    let iSLCheck = me.dtLoaiDinhDanh.length + me.dtLoaiLienHe.length;
                    if (iSLCheck > 0) {
                        edu.system.genHTML_Progress("zoneprocessXXXX", iSLCheck);
                        me.dtLoaiDinhDanh.forEach(e => me.save_DinhDanh(e.ID));
                        me.dtLoaiLienHe.forEach(e => me.save_LienHe(e.ID));
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
            'strId': strId,
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
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.getList_DeXuatHoSo();
                });
            },
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

            //bPaginate: {
            //    strFuntionName: "main_doc.DeXuatHoSo.getList_DeXuatHoSo()",
            //    iDataRow: iPager,
            //},
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

    save_KiemTraDinhDanh: function (strId) {
        var me = this;
        let check = $("#txtSoDinhDinh" + strId).attr("name");
        if (check && check.length == 32) {
            edu.system.start_Progress("zoneprocessXXXX", function () {
                me.save_DeXuatHoSo();
            });
            return;
        }
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CigkLBUzIBUpLi8mFSgvBSgvKQUgLykP',
            'func': 'PKG_CORE_HOSONHANSU_05.KiemTraThongTinDinhDanh',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strIdentifier_Type_Code': strId,
            'strIdentifier_No': edu.system.getValById('txtSoDinhDinh' + strId),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strDeXuatHoSo_Id = "";
                    if (data.Data.length > 0) {
                        me["icheck"] = false;
                        edu.system.alert("Dữ liệu tồn tại: " + me.dtLoaiDinhDanh.find(e => e.ID == obj_save.strIdentifier_Type_Code).TEN);
                    }
                }
                else {
                    if (me["icheck"]) {
                        me["icheck"] = false;
                        edu.system.alert(data.Message);
                    }
                }
                
            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");

            },
            type: 'POST',
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.save_DeXuatHoSo();
                });
            },
            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_DinhDanh: function (strId) {
        var me = this;
        var strDinhDanh_Id = $("#txtSoDinhDinh" + strId).attr("name");
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CC8yJDM1ESQzMi4vCCUkLzUoJygkMwPP',
            'func': 'PKG_CORE_HOSONHANSU_05.InsertPersonIdentifier',
            'iM': edu.system.iM,
            'strId': strDinhDanh_Id,
            'strIdentifierTypeCode': strId,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strPersonId': me.strDeXuatHoSo_Id,
            'strIdentifierNo': edu.system.getValById('txtSoDinhDinh' + strId),
            'strIssueDate': edu.system.getValById('txtNgayCap' + strId),
            'strIssuePlace': edu.system.getValById('txtNoiCap' + strId),
            'dIsPrimary': $("#checkX" + strId).is(':checked')? 1: 0,
            'strEffectiveFrom': edu.system.getValById('txtAAAA'),
            'strEffectiveTo': edu.system.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu5_MH/FDElIDUkESQzMi4vCCUkLzUoJygkMwPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_05.UpdatePersonIdentifier';
        }
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strDeXuatHoSo_Id = "";

                    if (obj_save.strId == "") {
                        //edu.system.alert("Thêm mới thành công!");
                        strDeXuatHoSo_Id = data.Id;
                    }
                    else {
                        //edu.system.alert("Cập nhật thành công!");
                        strDeXuatHoSo_Id = obj_save.strId
                    }

                }
                else {
                    if (me["icheck"]) {
                        me["icheck"] = false;
                        edu.system.alert(data.Message);
                    }
                }
                
            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");

            },
            type: 'POST',
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.save_ThanhCong();
                });
            },
            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
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

        data.forEach(aData => {
            let strId = aData.IDENTIFIER_TYPE_CODE;
            if (strId.length == 32) {
                $("#txtSoDinhDinh" + strId).attr("name", aData.ID);
                $("#txtSoDinhDinh" + strId).val(edu.util.returnEmpty(aData.IDENTIFIER_NO))
                $("#txtNgayCap" + strId).val(edu.util.returnEmpty(aData.ISSUE_DATE))
                $("#txtNoiCap" + strId).val(edu.util.returnEmpty(aData.ISSUE_PLACE))
                if (aData.IS_PRIMARY) {
                    $("#checkX" + strId).attr('checked', true);
                    $("#checkX" + strId).prop('checked', true);
                }
            }
        })
    },

    save_KiemTraLienHe: function (strId) {
        var me = this;
        let check = $("#txtLienHe" + strId).attr("name");
        if (check && check.length == 32) {
            edu.system.start_Progress("zoneprocessXXXX", function () {
                me.save_DeXuatHoSo();
            });
            return;
        }
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CigkLBUzIBUpLi8mFSgvDSgkLwkk',
            'func': 'PKG_CORE_HOSONHANSU_05.KiemTraThongTinLienHe',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strContactTypeCode': strId,
            'strContactValue': edu.system.getValById('txtLienHe' + strId),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strDeXuatHoSo_Id = "";
                    if (data.Data.length > 0) {
                        me["icheck"] = false;
                        edu.system.alert("Dữ liệu tồn tại: " + me.dtLoaiLienHe.find(e => e.ID == obj_save.strContactTypeCode).TEN);
                    }
                }
                else {
                    if (me["icheck"]) {
                        me["icheck"] = false;
                        edu.system.alert(data.Message);
                    }
                }
                
            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");

            },
            type: 'POST',
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.save_DeXuatHoSo();
                });
            },
            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_LienHe: function (strId) {
        var me = this;
        var strLienHe_Id = $("#txtLienHe" + strId).attr("name");
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu5_MH/CC8yJDM1ESQzMi4vAi4vNSAiNQPP',
            'func': 'PKG_CORE_HOSONHANSU_05.InsertPersonContact',
            'iM': edu.system.iM,
            'strId': strLienHe_Id,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strPersonId': me.strDeXuatHoSo_Id,
            'strContactTypeCode': strId,
            'strContactValue': edu.system.getValById('txtLienHe' + strId),
            'dIsPrimary': $("#checkX" + strId).is(':checked') ? 1 : 0,
            'strEffectiveFrom': edu.system.getValById('txtAAAA'),
            'strEffectiveTo': edu.system.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu5_MH/FDElIDUkESQzMi4vAi4vNSAiNQPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_05.UpdatePersonContact';
        }
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strDeXuatHoSo_Id = "";

                    if (obj_save.strId == "") {
                        //edu.system.alert("Thêm mới thành công!");
                        strDeXuatHoSo_Id = data.Id;
                    }
                    else {
                        //edu.system.alert("Cập nhật thành công!");
                        strDeXuatHoSo_Id = obj_save.strId
                    }

                }
                else {
                    if (me["icheck"]) {
                        me["icheck"] = false;
                        edu.system.alert(data.Message);
                    }
                }

            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");

            },
            type: 'POST',
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.save_ThanhCong();
                });
            },
            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
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
        /*III. Callback*/
        data.forEach(aData => {
            let strId = aData.CONTACT_TYPE_CODE_ID;
            if (strId.length == 32) {
                $("#txtLienHe" + strId).attr("name", aData.ID);
                $("#txtLienHe" + strId).val(edu.util.returnEmpty(aData.CONTACT_VALUE))
                if (aData.IS_PRIMARY) {
                    $("#checkX" + strId).attr('checked', true);
                    $("#checkX" + strId).prop('checked', true);
                }
            }
        })
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
                    "mRender": function (nRow, aData) {
                        return '<span id="lblMa' + aData.ID + '">"' + edu.util.returnEmpty(aData.TEN) + '"</span>';
                    }
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
            'action': 'NS_HoSoNhanSu5_MH/DSA4BRINLiAoDSgkLwkkAyA1AzQuIgPP',
            'func': 'PKG_CORE_HOSONHANSU_05.LayDSLoaiLienHeBatBuoc',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
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
                    "mRender": function (nRow, aData) {
                        return '<span id="lblMa' + aData.ID + '">"' + edu.util.returnEmpty(aData.TEN) + '"</span>';
                    }
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
            'action': 'NS_HoSoNhanSu5_MH/CigkLBUzIBUpLi8mFSgvBSgvKQUgLykP',
            'func': 'PKG_CORE_HOSONHANSU_05.KiemTraThongTinDinhDanh',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strIdentifier_Type_Code': edu.system.getValById('dropSearch_LoaiDinhDanh'),
            'strIdentifier_No': edu.system.getValById('txtSoDinhDanh'),
            'strNguoiThucHien_Id': edu.system.userId,
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
        if (data.length > 0) {
            $("#lblKetQuaKiemTra").html('"Tồn tại nhân sự có thông tin định danh ' + $("#dropSearch_LoaiDinhDanh option:selected").text() + ' dữ liệu ' + $("#txtSoDinhDanh").val())
        } else {
            $("#lblKetQuaKiemTra").html('"Định danh ' + $("#dropSearch_LoaiDinhDanh option:selected").text() + ' dữ liệu ' + $("#txtSoDinhDanh").val() +'" --> Không tồn tại trong hệ thống và chưa được sử dụng')
        }
        /*III. Callback*/
    },

    save_ThanhCong: function () {
        var me = this;
        if (me["icheck"]) {
            edu.system.alert("Lưu thành công");
        }
    }
}