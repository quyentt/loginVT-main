/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function ViTriCongViec() { };
ViTriCongViec.prototype = {
    strCoCauToChuc_Id: '',
    dtCoCauToChuc: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        $("#txtSearch_NgayXem").val(edu.util.dateToday());
        me.getList_CoCauToChuc();
        me.getList_NgheNghiep();
        edu.system.loadToCombo_DanhMucDuLieu("CORE.DONVI.LOAIQUANHE", "dropSearch_LoaiDonVi");
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
        
        $("#tblCongViec").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtCongViec.find(e => e.ID == strId);
            me["strCongViec_Id"] = data.ID;
            edu.util.viewValById("txtMa", data.POSITION_CODE);
            edu.util.viewValById("txtTen", data.POSITION_NAME);
            edu.util.viewValById("txtTenVietTat", data.POSITION_SHORT_NAME);
            edu.util.viewValById("dropPhanLoai", data.RELATION_TYPE_CODE_ID);
            edu.util.viewValById("dropChuChot", data.IS_KEY_POSITION);
            edu.util.viewValById("dropChucDanh", data.JOB_ID);
            edu.util.viewValById("txtHeadCount", data.MAX_HEADCOUNT);
            edu.util.viewValById("txtNgayHieuLuc", data.START_DATE);
            edu.util.viewValById("txtNgayHetHieuLuc", data.END_DATE);
            edu.util.viewValById("txtMoTa", data.DESCRIPTION);
            edu.util.viewHTMLById("txtMoTa", data.DESCRIPTION);
            edu.util.viewValById("dropTrangThai", data.IS_ACTIVE);
            $("#modalCongViec").modal("show");
        });
        $("#btnAdd_CongViec").click(function () {
            var data = {};
            me["strCongViec_Id"] = data.ID;
            edu.util.viewValById("txtMa", data.POSITION_CODE);
            edu.util.viewValById("txtTen", data.POSITION_NAME);
            edu.util.viewValById("txtTenVietTat", data.POSITION_SHORT_NAME);
            edu.util.viewValById("dropPhanLoai", data.RELATION_TYPE_CODE_ID);
            edu.util.viewValById("dropChuChot", data.IS_KEY_POSITION);
            edu.util.viewValById("dropChucDanh", data.JOB_ID);
            edu.util.viewValById("txtHeadCount", data.MAX_HEADCOUNT);
            edu.util.viewValById("txtNgayHieuLuc", data.START_DATE);
            edu.util.viewValById("txtNgayHetHieuLuc", data.END_DATE);
            edu.util.viewValById("txtMoTa", data.DESCRIPTION);
            edu.util.viewHTMLById("txtMoTa", data.DESCRIPTION);
            edu.util.viewValById("dropTrangThai", data.IS_ACTIVE);
            $("#modalCongViec").modal("show");
        });
        $("#btnSave_CongViec").click(function () {
            me.save_CongViec();
        });
        $("#btnDelete_CongViec").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblCongViec", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng cần xóa?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.delete_CongViec(arrChecked_Id[i]);
                }
            });
        });
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_CoCauToChuc: function (strDanhSach_Id) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHg4zJh4ULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_Org_Unit',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_TuKhoa'),
            'strOrg_Type_Code': edu.system.getValById('dropSearch_LoaiDonVi'),
            'dIs_Offcial': edu.system.getValById('txtAAAA'),
            'dIs_Active': edu.system.getValById('dropSearch_TrangThai'),
            'strNgayXem': edu.system.getValById('txtSearch_NgayXem'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me["dtCoCauToChuc"] = dtReRult;
                    me.genTable_CoCauToChuc(dtReRult, data.Pager);
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
    genTable_CoCauToChuc: function (data, iPager) {
        var me = this;
        
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "PARENT_ORG_ID",
                name: "NAME",
                code: ""
            },
            renderPlaces: ["treesjs_cocautochuc"],
            style: "fa fa-institution color-active",
            splitString: 1000,
        };
        edu.system.loadToTreejs_data(obj);
        $('#treesjs_cocautochuc').on("select_node.jstree", function (e, data) {
            var strId = data.node.id;
            var data = me.dtCoCauToChuc.find(e => e.ID == strId);
            me["strCoCauToChuc_Id"] = data.ID;
            $("#lblCongViec").html(data.NAME)
            $("#modalCongViec").modal("show");
            me.getList_CongViec();
        });
        /*III. Callback*/
    },

    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_CongViec: function () {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/FSkkLB4CLjMkHhEuMig1KC4v',
            'func': 'PKG_CORE_HOSONHANSU_03.Them_Core_Position',
            'iM': edu.system.iM,
            'strId': me.strCongViec_Id,

            'strPosition_Code': edu.system.getValById('txtMa'),
            'strPosition_Name': edu.system.getValById('txtTen'),
            'strPosition_Short_Name': edu.system.getValById('txtTenVietTat'),
            'strPosition_Type_Code': edu.system.getValById('dropPhanLoai'),
            'strOrg_Unit_Id': me.strCoCauToChuc_Id,
            'dMax_HeadCount': edu.system.getValById('txtHeadCount'),
            'dIs_Key_Position': edu.system.getValById('dropChuChot'),
            'dIs_Active': edu.system.getValById('dropTrangThai'),
            'strStart_Date': edu.system.getValById('txtNgayHieuLuc'),
            'strEnd_Date': edu.system.getValById('txtNgayHetHieuLuc'),
            'strDescription': edu.system.getValById('txtMoTa'),
            'strJob_Ids': edu.system.getValById('dropChucDanh'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu3_MH/EjQgHgIuMyQeES4yKDUoLi8P';
            obj_save.func = 'PKG_CORE_HOSONHANSU_03.Sua_Core_Position'
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
                    me.getList_CongViec();
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
    getList_CongViec: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHhEuMig1KC4vAzgULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_PositionByUnit',
            'iM': edu.system.iM,
            'strOrg_Unit_Id': me.strCoCauToChuc_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me["dtCongViec"] = data.Data;
                    me.genTable_CongViec(data.Data);
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
    delete_CongViec: function (Ids) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/GS4gHgIuMyQeES4yKDUoLi8P',
            'func': 'PKG_CORE_HOSONHANSU_03.Xoa_Core_Position',
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
                    me.getList_CongViec();
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
    genTable_CongViec: function (data, iPager) {
        $("#lblCongViec_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblCongViec",
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
                    "mDataProp": "POSITION_CODE"
                },
                {
                    "mDataProp": "POSITION_NAME"
                },
                {
                    "mDataProp": "POSITION_SHORT_NAME"
                },
                {
                    "mDataProp": "POSITION_TYPE_CODE_NAME"
                },
                {
                    "mDataProp": "IS_KEY_POSITION"
                },
                {
                    "mDataProp": "JOB"
                },
                {
                    "mDataProp": "MAX_HEADCOUNT"
                },
                {
                    "mDataProp": "START_DATE"
                },
                {
                    "mDataProp": "END_DATE"
                },
                {
                    "mDataProp": "DESCRIPTION"
                },
                {
                    "mRender": function (nRow, aData) {
                        return aData.IS_ACTIVE ? "" : "Hết hiệu lực";
                    }
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
}