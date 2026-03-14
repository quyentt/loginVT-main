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
        me.getList_DonVi();
        edu.system.loadToCombo_DanhMucDuLieu("CORE.QUANHELAODONG.LOAI", "dropSearch_QuanHe,dropPhanLoai");
        edu.system.loadToCombo_DanhMucDuLieu("CORE.DONVI.LOAIVITRI", "dropPhanLoai");

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

        $("#tblPhanCong").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtPhanCongLaoDong.find(e => e.ID == strId);
            me["strNhanSu_Id"] = data.ID;
            $("#lblNguoiQH").html(data.TENDAYDU + " - " + data.MASO)
            me.getList_NhiemVu();
            me.getList_ViTri(data.ORG_UNIT_ID);
            $("#modalNhiemVu").modal("show");
        });
        $("#tblNhiemVu").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtNhiemVu.find(e => e.ID == strId);
            me["strNhiemVu_Id"] = data.ID;
            edu.util.viewValById("dropViTri", data.POSITION_ID);
            //edu.util.viewValById("dropDonVi", data.EMPLOYMENT_STATUS_CODE_NAME);
            edu.util.viewValById("dropPhanLoai", data.ASSIGNMENT_TYPE_CODE_ID);
            edu.util.viewValById("txtNgayHieuLuc", data.EFFECTIVE_FROM);
            edu.util.viewValById("txtNgayHetHieuLuc", data.EFFECTIVE_TO);
            $("#modalAddNhiemVu").modal("show");
        });
        $("#btnAdd_NhiemVu").click(function () {
            var data = {};
            me["strNhiemVu_Id"] = data.ID;
            edu.util.viewValById("dropViTri", data.POSITION_ID);
            //edu.util.viewValById("dropDonVi", data.EMPLOYMENT_STATUS_CODE_NAME);
            edu.util.viewValById("dropPhanLoai", data.ASSIGNMENT_TYPE_CODE_ID);
            edu.util.viewValById("txtNgayHieuLuc", data.EFFECTIVE_FROM);
            edu.util.viewValById("txtNgayHetHieuLuc", data.EFFECTIVE_TO);
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
    getList_PhanCongLaoDong: function (strDanhSach_Id) {
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
    save_NhiemVu: function () {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/FSkkLB4CLjMkHgAyMigmLywkLzUP',
            'func': 'PKG_CORE_HOSONHANSU_04.Them_Core_Assignment',
            'iM': edu.system.iM,
            'strId': me.strNhiemVu_Id,

            'strPerson_Id': edu.system.getValById('dropAAAA'),
            'strPosition_Id': edu.system.getValById('dropAAAA'),
            'strEmployment_Id': edu.system.getValById('dropAAAA'),
            'strAssignment_Type_Code': edu.system.getValById('txtAAAA'),
            'strAssignment_Status_Code': edu.system.getValById('txtAAAA'),
            'strEffective_From': edu.system.getValById('txtAAAA'),
            'strEffective_To': edu.system.getValById('txtAAAA'),
            'strFte_radio': edu.system.getValById('txtAAAA'),
            'strDecision_Id': edu.system.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu4_MH/EjQgHgIuMyQeADIyKCYvLCQvNQPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_04.Sua_Core_Assignment'
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
        var aData = me.dtPhanCongLaoDong.find(e => e.ID == me.strNhanSu_Id)
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/DSA4BRICLjMkHgAyMigmLywkLzUDOAPP',
            'func': 'PKG_CORE_HOSONHANSU_04.LayDSCore_AssignmentBy',
            'iM': edu.system.iM,
            'strPerson_Id': aData.PERSON_ID,
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
                        renderPlace: ["dropDonVi"],
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
        //

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