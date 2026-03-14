/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function QuanHeLaoDong() { };
QuanHeLaoDong.prototype = {
    strCoCauToChuc_Id: '',
    dtCoCauToChuc: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        me.getList_ChuaQH();
        me.getList_CoQH();
        me.getList_NghiViec();
        edu.system.loadToCombo_DanhMucDuLieu("CORE.QUANHELAODONG.LOAI", "dropLoaiQuanHe");
        edu.system.loadToCombo_DanhMucDuLieu("CORE.QUANHELAODONG.TRANGTHAI", "dropTrangThaiQuanHe");
        me.getList_DonVi();

        $("#btnSearch").click(function () {
            me.getList_CoCauToChuc();
        });
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_CoCauToChuc();
            }
        });
        $('#dropSearch_LoaiDonVi').on('select2:select', function () {
            me.getList_CoCauToChuc();
        });

        $("#tblChuaQH,#tblCoQH,#tblNghiViec").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtQuanHeLaoDong.find(e => e.ID == strId);
            me["strNhanSu_Id"] = data.ID;
            $("#lblNguoiQH").html(data.TENDAYDU + " - " + data.MASO)
            me.getList_QuanHe();
            $("#modalQuanHe").modal("show");
        });
        $("#tblQuanHe").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtQuanHe.find(e => e.ID == strId);
            me["strQuanHe_Id"] = data.ID;
            edu.util.viewValById("dropLoaiQuanHe", data.EMPLOYMENT_TYPE_CODE_NAME);
            edu.util.viewValById("dropTrangThaiQuanHe", data.EMPLOYMENT_STATUS_CODE_NAME);
            edu.util.viewValById("dropDonViSuDung", data.EMPLOYER_ORG_NAME);
            edu.util.viewValById("dropQuanHeChinh", data.IS_PRIMARY);
            edu.util.viewValById("txtNgayHieuLuc", data.EFFECTIVE_FROM);
            edu.util.viewValById("txtNgayHetHieuLuc", data.EFFECTIVE_TO);
            edu.util.viewValById("dropQuyetDinh", data.MAX_HEADCOUNT);
            $("#modalAddQuanHe").modal("show");
        });
        $("#btnAdd_QuanHe").click(function () {
            var data = {};
            me["strQuanHe_Id"] = data.ID;
            edu.util.viewValById("dropLoaiQuanHe", data.EMPLOYMENT_TYPE_CODE_NAME);
            edu.util.viewValById("dropTrangThaiQuanHe", data.EMPLOYMENT_STATUS_CODE_NAME);
            edu.util.viewValById("dropDonViSuDung", data.EMPLOYER_ORG_NAME);
            edu.util.viewValById("dropQuanHeChinh", data.IS_PRIMARY);
            edu.util.viewValById("txtNgayHieuLuc", data.EFFECTIVE_FROM);
            edu.util.viewValById("txtNgayHetHieuLuc", data.EFFECTIVE_TO);
            edu.util.viewValById("dropQuyetDinh", data.MAX_HEADCOUNT);
            $("#modalAddQuanHe").modal("show");
        });
        $("#btnSave_QuanHe").click(function () {
            me.save_QuanHe();
        });
        $("#btnDelete_QuanHe").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblQuanHe", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng cần xóa?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.delete_QuanHe(arrChecked_Id[i]);
                }
            });
        });
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_ChuaQH: function (strDanhSach_Id) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/DSA4BRIPKSAvEjQCKTQgAi4QCQ0F',
            'func': 'PKG_CORE_HOSONHANSU_04.LayDSNhanSuChuaCoQHLD',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_ChuaQH'),
            'strEmployment_Type_Code': edu.system.getValById('txtAAAA'),
            'strOrg_Unit_Id': edu.system.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtQuanHeLaoDong"] = dtReRult;
                    me.genTable_QuanHeLaoDong(dtReRult, data.Pager, "tblChuaQH");
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
    getList_CoQH: function (strDanhSach_Id) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/DSA4BRIPKSAvEjQCLhAJDQUP',
            'func': 'PKG_CORE_HOSONHANSU_04.LayDSNhanSuCoQHLD',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_CoQH'),
            'strEmployment_Type_Code': edu.system.getValById('txtAAAA'),
            'strOrg_Unit_Id': edu.system.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtQuanHeLaoDong"] = dtReRult;
                    me.genTable_QuanHeLaoDong(dtReRult, data.Pager, "tblCoQH");
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
    getList_NghiViec: function (strDanhSach_Id) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/DSA4BRIPKSAvEjQFIA8mKSgXKCQi',
            'func': 'PKG_CORE_HOSONHANSU_04.LayDSNhanSuDaNghiViec',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_NghiViec'),
            'strEmployment_Type_Code': edu.system.getValById('txtAAAA'),
            'strOrg_Unit_Id': edu.system.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtQuanHeLaoDong"] = dtReRult;
                    me.genTable_QuanHeLaoDong(dtReRult, data.Pager, "tblNghiViec");
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
    genTable_QuanHeLaoDong: function (data, iPager, strTable_Id) {
        var me = this;
        var jsonForm = {
            strTable_Id: strTable_Id,
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.CoCauToChuc.getList_CongViec()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "MASO"
                },
                {
                    "mDataProp": "TENDAYDU"
                },
                {
                    "mDataProp": "NGAYSINHDAYDU"
                },
                {
                    "mDataProp": "GIOITINH_TEN"
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
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_QuanHe: function () {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/FSkkLB4CLjMkHgQsMS0uOCwkLzUP',
            'func': 'PKG_CORE_HOSONHANSU_04.Them_Core_Employment',
            'iM': edu.system.iM,
            'strId': me.strQuanHe_Id,

            'strPerson_Id': me["strNhanSu_Id"],
            'strEmployment_Type_Code': edu.system.getValById('dropLoaiQuanHe'),
            'strEmployment_Status_Code': edu.system.getValById('dropTrangThaiQuanHe'),
            'strEmployer_Org_Id': edu.system.getValById('dropDonViSuDung'),
            'strSource_Event_Id': edu.system.getValById('dropAAAA'),
            'strEffective_From': edu.system.getValById('txtNgayHieuLuc'),
            'strEffective_To': edu.system.getValById('txtNgayHetHieuLuc'),
            'dIs_Primary': edu.system.getValById('dropQuanHeChinh'),
            'dIs_Active': 1,
            'strDecision_Id': edu.system.getValById('dropQuyetDinh'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu4_MH/EjQgHgIuMyQeBCwxLS44LCQvNQPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_04.Sua_Core_Employment'
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
                    me.getList_QuanHe();
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
    getList_QuanHe: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHhEuMig1KC4vAzgULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_PositionByUnit',
            'iM': edu.system.iM,
            'strOrg_Unit_Id': me["strNhanSu_Id"],
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me["dtQuanHe"] = data.Data;
                    me.genTable_QuanHe(data.Data);
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
    delete_QuanHe: function (Ids) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/GS4gHgIuMyQeBCwxLS44LCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Xoa_Core_Employment',
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
                    me.getList_QuanHe();
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
    genTable_QuanHe: function (data, iPager) {
        $("#lblQuanHe_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblQuanHe",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.CoCauToChuc.getList_QuanHe()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "EMPLOYMENT_TYPE_CODE_Name"
                },
                {
                    "mDataProp": "EMPLOYER_ORG_Name"
                },
                {
                    "mDataProp": "EMPLOYMENT_STATUS_CODE_Name"
                },
                {
                    "mDataProp": "EFFECTIVE_FROM"
                },
                {
                    "mDataProp": "EFFECTIVE_TO"
                },
                {
                    "mDataProp": "IS_PRIMARY"
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

    getList_NgheNghiep: function () {
        var me = this;

        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHgsuIwPP',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_Job',
            'iM': edu.system.iM,
            'strJob_Group_Id': edu.system.getValById('dropAAAA'),
            'strJob_Level_Id': edu.system.getValById('dropAAAA'),
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
                        renderPlace: ["dropChucDanh"],
                        type: "",
                        title: "Chọn chức danh",
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

    getList_DonVi: function () {
        var me = this;

        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHg4zJh4ULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_Org_Unit',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_TuKho1a'),
            'strOrg_Type_Code': edu.system.getValById('dropSearch_LoaiDonVi1'),
            'dIs_Offcial': edu.system.getValById('txtAAAA'),
            'dIs_Active': edu.system.getValById('dropSearch_TrangThai1'),
            'strNgayXem': edu.system.getValById('txtSearch_NgayXem1'),
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
                        renderPlace: ["dropDonViSuDung"],
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
}