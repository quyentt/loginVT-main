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
        // Load tab đầu tiên
        me.getList_ChuaQH();
        
        // Load các danh mục
        edu.system.loadToCombo_DanhMucDuLieu("CORE.QUANHELAODONG.LOAI", "dropLoaiQuanHe");
        edu.system.loadToCombo_DanhMucDuLieu("CORE.QUANHELAODONG.TRANGTHAI", "dropTrangThaiQuanHe");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_EMPLOYMENT.CONTRACT_TYPE_CODE", "dropLoaiHopDong");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_EMPLOYMENT.STAFF_CODE_STATUS_CODE", "dropTrangThaiNguonMaSo");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_EMPLOYMENT.WORKING_TIME_MODE_CODE", "dropCheDoThoiGian");
        edu.system.loadToCombo_DanhMucDuLieu("CORE_EMPLOYMENT.WORK_ARRANGEMENT_CODE", "dropHinhThucBoTri");
        
        me.getList_DonVi();

        // Sự kiện khi click vào các tab
        $('li[data-bs-target="#tab_1"]').on('click', function () {
            me.getList_ChuaQH();
        });
        $('li[data-bs-target="#tab_2"]').on('click', function () {
            me.getList_CoQH();
        });
        $('li[data-bs-target="#tab_3"]').on('click', function () {
            me.getList_NghiViec();
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

        $("#tblChuaQH,#tblCoQH,#tblNghiViec").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtQuanHeLaoDong.find(e => e.ID == strId);
            me["strNhanSu_Id"] = data.ID;
            $("#lblNguoiQH").html(data.FULL_NAME + " - " + data.CURRENT_EMPLOYEE_CODE)
            me.getList_QuanHe();
            $("#modalQuanHe").modal("show");
        });
        $("#tblQuanHe").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            me["strQuanHe_Id"] = strId;
            me.getDetail_QuanHe(strId);
        });
        $("#btnAdd_QuanHe").click(function () {
            me["strQuanHe_Id"] = "";
            edu.util.viewValById("dropLoaiQuanHe", "");
            edu.util.viewValById("dropTrangThaiQuanHe", "");
            edu.util.viewValById("dropDonViSuDung", "");
            edu.util.viewValById("dropDonViQuanLy", "");
            edu.util.viewValById("dropPhapNhan", "");
            edu.util.viewValById("dropLoaiHopDong", "");
            edu.util.viewValById("dropTrangThaiNguonMaSo", "");
            edu.util.viewValById("txtMaSo", "");
            edu.util.viewValById("txtNgayCapMaNhanSu", "");
            edu.util.viewValById("txtLyDoBatDau", "");
            edu.util.viewValById("txtLyDoKetThuc", "");
            edu.util.viewValById("dropCheDoThoiGian", "");
            edu.util.viewValById("dropHinhThucBoTri", "");
            edu.util.viewValById("txtSoQuanHe", "");
            edu.util.viewValById("dropQuanHeChinh", "");
            edu.util.viewValById("txtNgayBatDau", "");
            edu.util.viewValById("txtNgayKetThuc", "");
            edu.util.viewValById("dropQuyetDinh", "");
            edu.util.viewValById("txtGhiChu", "");
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

        $("#btnSearch_ChuaQH").click(function () {
            me.getList_ChuaQH();
        });
        $("#txtSearch_ChuaQH").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_ChuaQH();
            }
        });

        $("#btnSearch_CoQH").click(function () {
            me.getList_CoQH();
        });
        $("#txtSearch_CoQH").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_CoQH();
            }
        });

        $("#btnSearch_NghiViec").click(function () {
            me.getList_NghiViec();
        });
        $("#txtSearch_NghiViec").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_NghiViec();
            }
        });
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_ChuaQH: function (strDanhSach_Id) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HhEkMzIuLx4CKTQgHgIuHgQsMS0uOCwkLzUP',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Person_Chua_Co_Employment',
            'iM': edu.system.iM,
            'strKeyword': edu.system.getValById('txtSearch_ChuaQH'),
            'dIs_Active': 1,
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
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HhEkMzIuLx4CLh4ELDEtLjgsJC81',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Person_Co_Employment',
            'iM': edu.system.iM,
            'strKeyword': edu.system.getValById('txtSearch_CoQH'),
            'dIs_Active': 1,
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
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HhEkMzIuLx4FIB4PJikoHhcoJCIP',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Person_Da_Nghi_Viec',
            'iM': edu.system.iM,
            'strKeyword': edu.system.getValById('txtSearch_NghiViec'),
            'dIs_Active': 1,
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
            'action': 'NS_HoSoNhanSu4_MH/CC8yHgIuMyQeBCwxLS44LCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Ins_Core_Employment',
            'iM': edu.system.iM,
            'strId': me.strQuanHe_Id,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': edu.system.strVaiTro_Id,
            'strPerson_Id': me["strNhanSu_Id"],
            'strEmployment_Type_Code': edu.system.getValById('dropLoaiQuanHe'),
            'strEmployment_Status_Code': edu.system.getValById('dropTrangThaiQuanHe'),
            'strWorking_Time_Mode_Code': edu.system.getValById('dropCheDoThoiGian'),
            'strStaff_Code': edu.system.getValById('txtMaSo'),
            'strStaff_Code_Status_Code': edu.system.getValById('dropTrangThaiNguonMaSo'),
            'strStaff_Code_Issued_At': edu.system.getValById('txtNgayCapMaNhanSu'),
            'strOrg_Id': edu.system.getValById('dropDonViSuDung'),
            'strLegal_Entity_Id': edu.system.getValById('dropPhapNhan'),
            'dIs_Primary': edu.system.getValById('dropQuanHeChinh'),
            'strEffective_From': edu.system.getValById('txtNgayBatDau'),
            'strEffective_To': edu.system.getValById('txtNgayKetThuc'),
            'strSource_Event_Id': edu.system.getValById('dropQuyetDinh'),
            'strNote': edu.system.getValById('txtGhiChu'),
            'dIs_Active': 1,
            'strCreated_By': edu.system.userId,
            'strDecision_Id': edu.system.getValById('dropQuyetDinh'),
            'strEmployment_No': edu.system.getValById('txtSoQuanHe'),
            'strStart_Reason_Code': edu.system.getValById('txtLyDoBatDau'),
            'strEnd_Reason_Code': edu.system.getValById('txtLyDoKetThuc'),
            'strContract_Type_Code': edu.system.getValById('dropLoaiHopDong'),
            'strWork_Arrangement_Code': edu.system.getValById('dropHinhThucBoTri'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_HoSoNhanSu4_MH/FDElHgIuMyQeBCwxLS44LCQvNQPP';
            obj_save.func = 'PKG_CORE_HOSONHANSU_04.Upd_Core_Employment';
            obj_save.strUpdated_By = edu.system.userId;
            delete obj_save.strCreated_By;
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
                    $("#modalAddQuanHe").modal("hide");
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
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HgIuMyQeBCwxLS44LCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Core_Employment',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': edu.system.strVaiTro_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strPerson_Id': me["strNhanSu_Id"],
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
            'action': 'NS_HoSoNhanSu4_MH/BSQtHgIuMyQeBCwxLS44LCQvNQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Del_Core_Employment',
            'iM': edu.system.iM,
            'strId': Ids,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': edu.system.strVaiTro_Id,
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
    getDetail_QuanHe: function (strId) {
        var me = this;
        var obj_save = {
            'action': 'NS_HoSoNhanSu4_MH/BiQ1HgIuMyQeBCwxLS44LCQvNR4DOB4IJQPP',
            'func': 'PKG_CORE_HOSONHANSU_04.Get_Core_Employment_By_Id',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': edu.system.strVaiTro_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strId': strId,
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var detail = data.Data[0];
                    edu.util.viewValById("dropLoaiQuanHe", detail.EMPLOYMENT_TYPE_CODE);
                    edu.util.viewValById("dropTrangThaiQuanHe", detail.EMPLOYMENT_STATUS_CODE);
                    edu.util.viewValById("dropDonViSuDung", detail.EMPLOYER_ORG_ID);
                    edu.util.viewValById("dropDonViQuanLy", detail.MANAGING_ORG_ID);
                    edu.util.viewValById("dropPhapNhan", detail.LEGAL_ENTITY_ID);
                    edu.util.viewValById("dropLoaiHopDong", detail.CONTRACT_TYPE_CODE);
                    edu.util.viewValById("dropTrangThaiNguonMaSo", detail.STAFF_CODE_STATUS_CODE);
                    edu.util.viewValById("txtMaSo", detail.STAFF_CODE);
                    edu.util.viewValById("txtNgayCapMaNhanSu", detail.STAFF_CODE_ISSUED_DATE);
                    edu.util.viewValById("txtLyDoBatDau", detail.START_REASON);
                    edu.util.viewValById("txtLyDoKetThuc", detail.END_REASON);
                    edu.util.viewValById("dropCheDoThoiGian", detail.WORKING_TIME_MODE_CODE);
                    edu.util.viewValById("dropHinhThucBoTri", detail.WORK_ARRANGEMENT_CODE);
                    edu.util.viewValById("txtSoQuanHe", detail.EMPLOYMENT_NUMBER);
                    edu.util.viewValById("dropQuanHeChinh", detail.IS_PRIMARY);
                    edu.util.viewValById("txtNgayBatDau", detail.EFFECTIVE_FROM);
                    edu.util.viewValById("txtNgayKetThuc", detail.EFFECTIVE_TO);
                    edu.util.viewValById("dropQuyetDinh", detail.SOURCE_EVENT_ID);
                    edu.util.viewValById("txtGhiChu", detail.NOTE);
                    $("#modalAddQuanHe").modal("show");
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
            fakedb: []
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

    getList_DonVi: function () {
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
                        renderPlace: ["dropDonViSuDung", "dropDonViQuanLy", "dropPhapNhan"],
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