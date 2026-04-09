/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function PhanCongLaoDong() { };
PhanCongLaoDong.prototype = {
    strCoCauToChuc_Id: '',
    dtCoCauToChuc: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        me.getList_PhanCongLaoDong();
        me.getList_DonVi_Search();
        edu.system.loadToCombo_DanhMucDuLieu("CORE.QUANHELAODONG.LOAI", "dropSearch_QuanHe,dropPhanLoai");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_ASSIGNMENT.ASSIGNMENT_TYPE_CODE", "dropPhanLoai");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_ASSIGNMENT.ASSIGNMENT_STATUS_CODE", "dropTrangThaiPhanCong");

        $("#btnSearch").click(function () {
            me.getList_PhanCongLaoDong();
        });
        $("#txtTuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_PhanCongLaoDong();
            }
        });
        $('#dropSearch_QuanHe').on('select2:select', function () {
            me.getList_PhanCongLaoDong();
        });
        $('#dropSearch_DonVi').on('select2:select', function () {
            me.getList_PhanCongLaoDong();
        });

        $("#tblPhanCong").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtPhanCongLaoDong.find(e => e.ID == strId);
            if (!data) {
                edu.system.alert("Không tìm thấy thông tin nhân sự!", "w");
                return;
            }

            var strPersonId = data.PERSON_ID || data.ID || strId;
            me["strNhanSu_Id"] = strPersonId;
            me["currentNhanSu"] = data;
            me["currentNhanSu"]["PERSON_ID"] = me["currentNhanSu"]["PERSON_ID"] || strPersonId;
            me["dtQuanHeLaoDong"] = [];
            
            // Hiển thị modal chọn quan hệ lao động
            var strTitle = data.FULL_NAME + " - " + data.CURRENT_EMPLOYEE_CODE;
            $("#modalChonQuanHe .modal-header .title").html('<i class="fa-solid fa-user"></i> Chọn quan hệ lao động - ' + strTitle);
            me.getList_QuanHeLaoDong(strPersonId);
            $("#modalChonQuanHe").modal("show");
        });
        
        $("#tblQuanHeLaoDong").delegate(".btnChon", "click", function () {
            var strEmploymentId = this.id;
            var dataQH = me.dtQuanHeLaoDong.find(e => e.ID == strEmploymentId);
            me["currentNhanSu"]["EMPLOYMENT_ID"] = strEmploymentId;
            me["currentNhanSu"]["EMPLOYMENT_TYPE_CODE_NAME"] = dataQH.EMPLOYMENT_TYPE_CODE_NAME;
            
            // Đóng modal chọn quan hệ và mở modal nhiệm vụ
            $("#modalChonQuanHe").modal("hide");
            
            var strTitle = me.currentNhanSu.FULL_NAME + " - " + me.currentNhanSu.CURRENT_EMPLOYEE_CODE + " - " + dataQH.EMPLOYMENT_TYPE_CODE_NAME;
            $("#modalNhiemVu .modal-header .title").html('<i class="fa-solid fa-user"></i> ' + strTitle);
            me.getList_ViTri(dataQH.EMPLOYER_ORG_ID);
            me.getList_NhiemVu();
            $("#modalNhiemVu").modal("show");
        });
        $("#tblNhiemVu").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            me["strNhiemVu_Id"] = strId;
            me.getDetail_Assignment(strId);
        });
        $("#btnAdd_NhiemVu").click(function () {
            me["strNhiemVu_Id"] = "";
            $("#dropViTri").val("").trigger('change');
            $("#dropPhanLoai").val("").trigger('change');
            $("#dropTrangThaiPhanCong").val("").trigger('change');
            edu.util.viewValById("txtNgayHieuLuc", "");
            edu.util.viewValById("txtNgayHetHieuLuc", "");
            $("#modalAddNhiemVu .modal-header .title .myModalLabel").html('<i class="fa fa-plus"></i>');
            $("#modalAddNhiemVu").modal("show");
        });
        $("#btnSave_NhiemVu").click(function () {
            me.save_NhiemVu();
        });
        $("#btnDelete_NhiemVu").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblNhiemVu", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng cần xóa?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.delete_NhiemVu(arrChecked_Id[i]);
                }
            });
        });
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_PhanCongLaoDong: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HhEkMzIuLx4CLh4ELDEtLjgsJC81',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Person_Co_Employment',
            'iM': edu.system.iM,
            'strKeyword': edu.system.getValById('txtTuKhoa'),
            'dIs_Active': 1,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtPhanCongLaoDong"] = dtReRult;
                    me.genTable_PhanCongLaoDong(dtReRult, data.Pager, "tblPhanCong");
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
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genTable_PhanCongLaoDong: function (data, iPager, strTable_Id) {
        var me = this;
        var jsonForm = {
            strTable_Id: strTable_Id,
            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "CURRENT_EMPLOYEE_CODE"
                },
                {
                    "mDataProp": "FULL_NAME"
                },
                {
                    "mRender": function (nRow, aData) {
                        var ngaySinh = '';
                        if (aData.DATE_OF_BIRTH) {
                            ngaySinh = aData.DATE_OF_BIRTH;
                        } else if (aData.BIRTH_DAY && aData.BIRTH_MONTH && aData.BIRTH_YEAR) {
                            ngaySinh = aData.BIRTH_DAY + '/' + aData.BIRTH_MONTH + '/' + aData.BIRTH_YEAR;
                        }
                        return ngaySinh;
                    }
                },
                {
                    "mDataProp": "GENDER_NAME"
                },
                {
                    "mDataProp": "CCCD"
                },
                {
                    "mDataProp": "ORG_NAME"
                },
                {
                    "mDataProp": "POSITION_NAME"
                },
                {
                    "mDataProp": "STATUS_CODE_NAME"
                },
                {
                    "mDataProp": "EMPLOYMENT_STATUS_CODE_NAME"
                },
                {
                    "mDataProp": "EMPLOYMENT_TYPE_CODE_NAME"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnEdit" id="' + aData.ID + '" title="Chọn"><i class="fa fa-hand-pointer color-active"></i> Chọn</a></span>';
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
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_NhiemVu: function () {
        var me = this;
        // Lấy thông tin nhân viên và quan hệ lao động đã chọn
        var aData = me.currentNhanSu;

        if (!aData || !(aData.EMPLOYMENT_ID || aData.EMPLOYMENT_ID === 0)) {
            edu.system.alert("Vui lòng chọn quan hệ lao động trước khi phân công!", "w");
            return;
        }
        
        // Validate
        if (!edu.system.getValById('dropViTri')) {
            edu.system.alert("Vui lòng chọn vị trí!");
            return;
        }
        if (!edu.system.getValById('dropPhanLoai')) {
            edu.system.alert("Vui lòng chọn loại phân công!");
            return;
        }
        if (!edu.system.getValById('txtNgayHieuLuc')) {
            edu.system.alert("Vui lòng nhập ngày bắt đầu hiệu lực!");
            return;
        }
        
        // Lấy thông tin đơn vị từ vị trí đã chọn
        var strPositionId = edu.system.getValById('dropViTri');
        var strOrgId = aData.ORG_UNIT_ID || '';
        
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/CC8yHgIuMyQeADIyKCYvLCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Ins_Core_Assignment',
            'iM': edu.system.iM,
            'strId': me.strNhiemVu_Id,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': edu.system.strVaiTro_Id || "",
            'strPerson_Id': aData.PERSON_ID || aData.ID,
            'strEmployment_Id': aData.EMPLOYMENT_ID,
            'strAssignment_Type_Code': edu.system.getValById('dropPhanLoai'),
            'strAssignment_Status_Code': edu.system.getValById('dropTrangThaiPhanCong'),
            'strOrg_Id': strOrgId,
            'strPosition_Id': strPositionId,
            'dIs_Primary': 1,
            'dFte_Ratio': 1,
            'strEffective_From': edu.system.getValById('txtNgayHieuLuc'),
            'strEffective_To': edu.system.getValById('txtNgayHetHieuLuc'),
            'strDecision_Id': '',
            'strSource_Event_Id': '',
            'strNote': '',
            'dIs_Active': 1,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu4_MH/FDElHgIuMyQeADIyKCYvLCQvNQPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_04.Upd_Core_Assignment'
        }
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
                    $("#modalAddNhiemVu").modal("hide");
                    me.getList_NhiemVu();
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

            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_NhiemVu: function () {
        var me = this;
        var aData = me.currentNhanSu;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/DSA4BRICLjMkHgAyMigmLywkLzUDOAPP',
            'func': 'PKG_CORE_HOSONHANSU_04.LayDSCore_AssignmentBy',
            'iM': edu.system.iM,
            'strPerson_Id': (aData && (aData.PERSON_ID || aData.ID)) || '',
            'strEmplotment_Id': aData.EMPLOYMENT_ID,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me["dtNhiemVu"] = data.Data;
                    me.genTable_NhiemVu(data.Data);
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
    delete_NhiemVu: function (Ids) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/GS4gHgIuMyQeADIyKCYvLCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Xoa_Core_Assignment',
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
                    me.getList_NhiemVu();
                });
            },
            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getDetail_Assignment: function (strId) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/DSA4BRICLjMkHgAyMigmLywkLzUTT',
            'func': 'PKG_CORE_HOSONHANSU_04.LayTTCore_Assignment',
            'iM': edu.system.iM,
            'strId': strId,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success && data.Data && data.Data.length > 0) {
                    var detail = data.Data[0];
                    $("#dropViTri").val(detail.POSITION_ID).trigger('change');
                    $("#dropPhanLoai").val(detail.ASSIGNMENT_TYPE_CODE).trigger('change');
                    $("#dropTrangThaiPhanCong").val(detail.ASSIGNMENT_STATUS_CODE).trigger('change');
                    edu.util.viewValById("txtNgayHieuLuc", detail.EFFECTIVE_FROM);
                    edu.util.viewValById("txtNgayHetHieuLuc", detail.EFFECTIVE_TO);
                    $("#modalAddNhiemVu .modal-header .title .myModalLabel").html('<i class="fa fa-pencil"></i>');
                    $("#modalAddNhiemVu").modal("show");
                }
                else {
                    edu.system.alert("Không tìm thấy thông tin chi tiết!");
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genTable_NhiemVu: function (data, iPager) {
        $("#lblNhiemVu_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblNhiemVu",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.CoCauToChuc.getList_NhiemVu()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "POSITION_NAME"
                },
                {
                    "mDataProp": "ASSIGNMENT_TYPE_CODE_NAME"
                },
                {
                    "mDataProp": "EFFECTIVE_FROM"
                },
                {
                    "mDataProp": "EFFECTIVE_TO"
                },
                {
                    "mDataProp": "EMPLOYMENT_TYPE_CODE_NAME"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnEdit" id="' + aData.ID + '" title="Chi tiết"><i class="fa fa-edit color-active"></i> Chi tiết</a></span>';
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

    getList_DonVi_Search: function () {
        var me = this;
        // Lấy ngày hiện tại theo định dạng dd/mm/yyyy
        var today = new Date();
        var strNgayXem = ("0" + today.getDate()).slice(-2) + "/" + 
                         ("0" + (today.getMonth() + 1)).slice(-2) + "/" + 
                         today.getFullYear();

        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHg4zJh4ULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_Org_Unit',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strOrg_Type_Code': '',
            'dIs_Offcial': 1,
            'dIs_Active': 1,
            'strNgayXem': strNgayXem,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.loadToCombo_data({
                        data: data.Data,
                        renderInfor: {
                            id: "ID",
                            parentId: "",
                            name: "NAME",
                            code: "",
                            avatar: ""
                        },
                        renderPlace: ["dropSearch_DonVi"],
                        type: "",
                        title: "Chọn đơn vị",
                    })
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
    getList_ViTri: function (strOrg_Unit_Id) {
        var me = this;

        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHhEuMig1KC4vAzgULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_PositionByUnit',
            'iM': edu.system.iM,
            'strOrg_Unit_Id': strOrg_Unit_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.loadToCombo_data({
                        data: data.Data,
                        renderInfor: {
                            id: "ID",
                            parentId: "",
                            name: "POSITION_NAME",
                            code: "",
                            avatar: ""
                        },
                        renderPlace: ["dropViTri"],
                        type: "",
                        title: "Chọn vị trí",
                    })
                }
                else {
                    edu.system.alert("Lỗi: " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    
    getList_QuanHeLaoDong: function (strPersonId) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HgIuMyQeBCwxLS44LCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Core_Employment',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': edu.system.strVaiTro_Id || "",
            'strNguoiThucHien_Id': edu.system.userId,
            'strPerson_Id': strPersonId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me["dtQuanHeLaoDong"] = data.Data;
                    me.genTable_QuanHeLaoDong(data.Data);
                }
                else {
                    edu.system.alert("Lỗi: " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    
    genTable_QuanHeLaoDong: function (data) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblQuanHeLaoDong",
            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "EMPLOYMENT_TYPE_CODE_NAME"
                },
                {
                    "mDataProp": "EMPLOYER_ORG_NAME"
                },
                {
                    "mDataProp": "EMPLOYMENT_STATUS_CODE_NAME"
                },
                {
                    "mDataProp": "EFFECTIVE_FROM"
                },
                {
                    "mDataProp": "EFFECTIVE_TO"
                },
                {
                    "mRender": function (nRow, aData) {
                        return aData.IS_PRIMARY == 1 ? 'Quan hệ chính' : '';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-primary btnChon" id="' + aData.ID + '" title="Chọn"><i class="fa fa-check"></i> Chọn</a></span>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
}