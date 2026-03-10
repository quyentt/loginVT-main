/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function CoCauToChuc() { };
CoCauToChuc.prototype = {
    strCoCauToChuc_Id: '',
    dtCoCauToChuc: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        $("#txtSearch_NgayXem").val(edu.util.dateToday());
        me.getList_CoCauToChuc();
        edu.system.loadToCombo_DanhMucDuLieu("CORE.DONVI.LOAIQUANHE", "dropSearch_LoaiDonVi,dropLoaiDonVi,dropLoaiQuanHe_ChaNew,dropLoaiQuanHe_Cha");

        $("#tblCoCauToChuc").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtCoCauToChuc.find(e => e.ID == strId);
            me["strCoCauToChuc_Id"] = data.ID;
            edu.util.viewValById("txtMa", data.KLGD_DANHMUCAPCoCauToChuc_ID);
            edu.util.viewValById("txtTen", data.DONVITINH_ID);
            edu.util.viewValById("dropLoaiDonVi", data.CoCauToChuc);
            edu.util.viewValById("txtTenVietTat", data.MOTA);
            edu.util.viewValById("txtNgayHieuLuc", data.MOTA);
            edu.util.viewValById("txtNgayHetHieuLuc", data.MOTA);
            edu.util.viewValById("dropTrangThai", data.MOTA);
            $("#modalDonVi").modal("show");
        });
        $("#btnAdd_CoCauToChuc").click(function () {
            var data = {};
            me["strCoCauToChuc_Id"] = data.ID;
            edu.util.viewValById("txtMa", data.KLGD_DANHMUCAPCoCauToChuc_ID);
            edu.util.viewValById("txtTen", data.DONVITINH_ID);
            edu.util.viewValById("dropLoaiDonVi", data.CoCauToChuc);
            edu.util.viewValById("txtTenVietTat", data.MOTA);
            edu.util.viewValById("txtNgayHieuLuc", data.MOTA);
            edu.util.viewValById("txtNgayHetHieuLuc", data.MOTA);
            edu.util.viewValById("dropTrangThai", 1);
            $("#modalDonVi").modal("show");
            edu.util.viewValById("dropDonVi_Cha", data.MOTA);
            edu.util.viewValById("txtNgayHieuLuc_Cha", data.MOTA);
            edu.util.viewValById("txtNgayHetHieuLuc_Cha", data.MOTA);
            edu.util.viewValById("dropLoaiQuanHe_Cha", data.MOTA);
            edu.util.viewValById("dropTrangThai_Cha", 1);
        });
        $("#btnSave_CoCauToChuc").click(function () {
            me.save_CoCauToChuc();
        });
        $("#btnDelete_CoCauToChuc").click(function () {
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                me.delete_CoCauToChuc(arrChecked_Id[i]);
            });
        });

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
        
        $("#tblQuanHe").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtQuanHe.find(e => e.ID == strId);
            me["strQuanHe_Id"] = data.ID;
            edu.util.viewValById("dropDonVi_ChaNew", data.RELATION_TYPE_CODE_ID);
            edu.util.viewValById("txtNgayHieuLuc_ChaNew", data.START_DATE);
            edu.util.viewValById("txtNgayHetHieuLuc_ChaNew", data.END_DATE);
            edu.util.viewValById("dropLoaiQuanHe_ChaNew", data.RELATION_TYPE_CODE_ID);
            edu.util.viewValById("dropTrangThai_ChaNew", data.IS_ACTIVE);
            $("#modalQuanHe").modal("show");
        });
        $("#btnAdd_QuanHe").click(function () {
            var data = {};
            me["strQuanHe_Id"] = data.ID;
            edu.util.viewValById("dropDonVi_ChaNew", data.MA);
            edu.util.viewValById("txtNgayHieuLuc_ChaNew", data.TEN);
            edu.util.viewValById("txtNgayHetHieuLuc_ChaNew", data.MOTA);
            edu.util.viewValById("dropLoaiQuanHe_ChaNew", data.PHANLOAI_ID);
            edu.util.viewValById("dropTrangThai_ChaNew", 1);
            $("#modalQuanHe").modal("show");
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
	--Discription: [4]  ACESS DB ==> thoi gian dao tao
    --Author: duyentt
	-------------------------------------------*/
    getList_ThoiGian: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_KeHoach_MH/DSA4BRIVKS4oBiggLxUuLyYJLjEKDQPP',
            'func': 'PKG_KLGV_V2_KEHOACH.LayDSThoiGianTongHopKL',
            'iM': edu.system.iM,
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
                            name: "THOIGIAN",
                            code: "",
                            avatar: ""
                        },
                        renderPlace: ["dropThoiGian", "dropSearch_ThoiGian"],
                        type: "",
                        title: "Chọn thời gian",
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
    getList_KeHoachTongHop: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_KeHoach_MH/DSA4BRIKDQYFHhUuLyYJLjEKKS4oDTQuLyYP',
            'func': 'PKG_KLGV_V2_KEHOACH.LayDSKLGD_TongHopKhoiLuong',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtAAAA'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropSearch_ThoiGian'),
            'dHieuLuc': -1,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
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
                            name: "TEN",
                            code: "",
                            avatar: ""
                        },
                        renderPlace: ["dropSearch_KeHoachTongHop"],
                        type: "",
                        title: "Chọn kế hoạch tổng hợp",
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
    getList_KeHoachChiTiet: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_KeHoach_MH/DSA4BRIKDQYFHgokCS4gIikCKSgVKCQ1',
            'func': 'PKG_KLGV_V2_KEHOACH.LayDSKLGD_KeHoachChiTiet',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtAAAA'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropSearch_ThoiGian'),
            'strKLGD_TongHopKhoiLuong_Id': edu.system.getValById('dropSearch_KeHoachTongHop'),
            'strCheDoApDung_Id': edu.system.getValById('dropAAAA'),
            'strPhanLoai_Id': edu.system.getValById('dropAAAA'),
            'strTuNgay': edu.system.getValById('txtAAAA'),
            'strDenNgay': edu.system.getValById('txtAAAA'),
            'dHieuLuc': edu.system.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
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
                            name: "TEN",
                            code: "",
                            avatar: ""
                        },
                        renderPlace: ["dropSearch_KeHoachChiTiet"],
                        type: "",
                        title: "Chọn kế hoạch chi tiết",
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
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_CoCauToChuc: function () {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/FSkkLB4CLjMkHg4zJh4ULyg1',
            'func': 'PKG_CORE_HOSONHANSU_03.Them_Core_Org_Unit',
            'iM': edu.system.iM,
            'strId': me.strCoCauToChuc_Id,
            'strCode': edu.system.getValById('txtMa'),
            'strName': edu.system.getValById('txtTen'),
            'strOrg_Type_Code': edu.system.getValById('dropLoaiDonVi'),
            'strShort_Name': edu.system.getValById('txtTenVietTat'),
            'dIs_Offcial': 1,
            'dIs_Active': edu.system.getValById('dropTrangThai'),
            'strStart_Date': edu.system.getValById('txtNgayHieuLuc'),
            'strEnd_Date': edu.system.getValById('txtNgayHetHieuLuc'),
            'strDescription': edu.system.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu3_MH/EjQgHgIuMyQeDjMmHhQvKDUP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_03.Sua_Core_Org_Unit'
        }
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (!obj_save.strId) {
                        me.strCoCauToChuc_Id = data.Id;
                        edu.system.alert("Thêm mới thành công!");
                    }
                    else {
                        edu.system.alert("Cập nhật thành công!");
                    }
                    me.save_QuanHe();
                    me.getList_CoCauToChuc();
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
    delete_CoCauToChuc: function (Ids) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/GS4gHgIuMyQeDjMmHhQvKDUP',
            'func': 'PKG_CORE_HOSONHANSU_03.Xoa_Core_Org_Unit',
            'iM': edu.system.iM,
            'strId': me.strCoCauToChuc_Id,
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
                    me.getList_CoCauToChuc();
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
                    me.getList_CoCauToChuc();
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
    genTable_CoCauToChuc: function (data, iPager) {
        var me = this;
        edu.util.viewHTMLById("lblCoCauToChuc_Tong", data.length);
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "NAME",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropDonVi_Cha"],
            type: "",
            title: "Chọn cơ cấu tổ chức cha",
        })
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
            edu.util.viewValById("txtMa", data.CODE);
            edu.util.viewValById("txtTen", data.NAME);
            edu.util.viewValById("dropLoaiDonVi", data.ORG_TYPE_CODE);
            edu.util.viewValById("txtTenVietTat", data.MOTA);
            edu.util.viewValById("txtNgayHieuLuc", data.UNIT_START_DATE);
            edu.util.viewValById("txtNgayHetHieuLuc", data.UNIT_END_DATE);
            edu.util.viewValById("dropTrangThai", data.UNIT_IS_ACTIVE);
            $("#modalDonVi").modal("show");
            me.getList_QuanHe();
        });
        /*III. Callback*/
    },

    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_QuanHe: function () {
        var me = this;
        var obj_notify = {};
        if (!edu.system.getValById('dropDonVi_Cha')) return;
        //--Edit
        var obj_save = {
            'action': 'NS_HoSoNhanSu3_MH/FSkkLB4CLjMkHg4zJh4TJC0gNSguLwPP',
            'func': 'PKG_CORE_HOSONHANSU_03.Them_Core_Org_Relation',
            'iM': edu.system.iM,
            'strId': me.strQuanHe_Id,

            'strParent_Org_Id': edu.system.getValById('dropDonVi_Cha'),
            'strChild_Org_Id': me.strCoCauToChuc_Id,
            'strRelation_Type_Code': edu.system.getValById('dropLoaiQuanHe_Cha'),
            'dIs_Active': edu.system.getValById('dropTrangThai_Cha'),
            'strStart_Date': edu.system.getValById('txtNgayHieuLuc_Cha'),
            'strEnd_Date': edu.system.getValById('txtNgayHetHieuLuc_Cha'),
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu3_MH/EjQgHgIuMyQeDjMmHhMkLSA1KC4v';
            obj_save.func = 'PKG_CORE_HOSONHANSU_03.Sua_Core_Org_Relation'
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
            'action': 'NS_HoSoNhanSu3_MH/DSA4BRICLjMkHg4zJh4TJC0gNSguLwPP',
            'func': 'PKG_CORE_HOSONHANSU_03.LayDSCore_Org_Relation',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strId': me.strCoCauToChuc_Id,
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
            'action': 'NS_HoSoNhanSu3_MH/GS4gHgIuMyQeDjMmHhMkLSA1KC4v',
            'func': 'PKG_CORE_HOSONHANSU_03.Xoa_Core_Org_Relation',
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
                    "mRender": function (nRow, aData) {
                        return edu.util.returmEmpty(aData.PARENT_ORG_NAME) + " - " + edu.util.returmEmpty(aData.PARENT_ORG_CODE);
                    }
                },
                {
                    "mDataProp": "START_DATE"
                },
                {
                    "mDataProp": "END_DATE"
                },
                {
                    "mDataProp": "RELATION_TYPE_CODE_TEN"
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
        if (data.length) {
            var data = data[0];
            me["strQuanHe_Id"] = data.ID;
            edu.util.viewValById("dropDonVi_Cha", data.RELATION_TYPE_CODE_ID);
            edu.util.viewValById("txtNgayHieuLuc_Cha", data.START_DATE);
            edu.util.viewValById("txtNgayHetHieuLuc_Cha", data.END_DATE);
            edu.util.viewValById("dropLoaiQuanHe_Cha", data.RELATION_TYPE_CODE_ID);
            edu.util.viewValById("dropTrangThai_Cha", data.IS_ACTIVE);
        }
        /*III. Callback*/
    },
}