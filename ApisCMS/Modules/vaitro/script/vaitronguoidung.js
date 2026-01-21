/*----------------------------------------------
--Author: nnthuong
--Phone: 0169 260 2793
--Date of created: 09/11/2017
----------------------------------------------*/
function VaiTroNguoiDung() { };
VaiTroNguoiDung.prototype = {
    strVaiTro_Id: '',

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial
        -------------------------------------------*/
        edu.system.page_load();
        me.getList_VaiTro();
        me.getList_NguoiDung();
        $("[id$=chkSelectAll_VaiTro]").on("click", function () {
            edu.util.checkedAll_BgRow(this, { table_id: "tblNguoiDung" });
        });
        $("#tblNguoiDung").delegate(".checkOne", "click", function () {
            edu.util.checkedOne_BgRow(this, { table_id: "tblNguoiDung", regexp: /checkX/g, });
        });

        $("#dropSearch_DoiTuong").on("select2:select", function () {
            me.getList_NguoiDung();
        });
        $("#btnSearch").click(function () {
            me.getList_NguoiDung();
        });
        $("#txtSearch_TuKhoa_ND").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_NguoiDung();
            }
        });
        $("#btnThem").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblNguoiDung", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn muốn kế thừa không");
            $("#btnYes").click(function (e) {
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.save_NguoiDungVaiTro(arrChecked_Id[i]);
                }
            });
        });
    },
    /*----------------------------------------------
    --Discription: [1] Access DB VaiTro
    --API: 
    ----------------------------------------------*/
    getList_VaiTro: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'CMS_VaiTro/LayDanhSach',
            
            'strLoaiVaiTro_Id': "",
            'strTuKhoa': "",
            'pageIndex': 1,
            'pageSize': 1000,
            'dTrangThai': 1
        };
        //
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genTreeJs_Vaitro(dtResult, iPager);
                }
                else {
                    edu.system.alert("CMS_VaiTro/LayDanhSach: " + data.Message);
                }
                
            },
            error: function (er) {
                
                edu.system.alert("CMS_VaiTro/LayDanhSach (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTreeJs_Vaitro: function (dtResult, iPager) {
        var me = this;
        edu.util.viewHTMLById("lblDanhMucTenBang_Tong", iPager);
        var obj = {
            data: dtResult,
            renderInfor: {
                id: "ID",
                parentId: "CHUNG_VAITRO_CHA_ID",
                name: "TENVAITRO",
                code: ""
            },
            renderPlaces: ["treesjs_vaitro_vtnd"],
            style: "fa fa-user color-active"
        };
        edu.system.loadToTreejs_data(obj);
        //2. Action
        $('#treesjs_vaitro_vtnd').on("select_node.jstree", function (e, data) {
            var strNameNode = data.node.id;
            me.strVaiTro_Id = strNameNode;
        });
    },

    /*----------------------------------------------
    --Discription: [1] Access DB/GenHTML - NguoiDung
    --API:
    ----------------------------------------------*/
    getList_NguoiDung: function () {
        var me = this;
        var obj = {
            strTuKhoa: edu.util.getValById("txtSearch_TuKhoa_ND"),
            iPageIndex: edu.system.pageIndex_default,
            iPageSize: edu.system.pageSize_default,
            iTrangThai: 1,
            strDonVi_Id: "",
            strVaiTro_Id: "",
            strPhanLoaiDoiTuong: $("#dropSearch_DoiTuong").val(),
            strCapXuLy_Id: "",
            strTinhThanh_Id: ""
        };
        edu.extend.getList_NguoiDung(obj, "", "", me.genTable_NguoiDung);
    },
    genTable_NguoiDung: function (data, iPager) {
        edu.util.viewHTMLById("lblNguoiDung_Tong", iPager);
        var jsonForm = {
            strTable_Id: "tblNguoiDung",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.VaiTroNguoiDung.getList_NguoiDung()",
                iDataRow: iPager
            },
            arrClassName: ["tr-pointer", "btnEdit"],
            colPos: {
                left: [1],
                fix: [0],
                center:[0, 3]
            },
            aoColumns: [
                {
                    "mDataProp": "TAIKHOAN"
                },
                {
                    "mDataProp": "TENDAYDU"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '" class="checkOne">';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    save_NguoiDungVaiTro: function (strNguoiDung_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'CMS_NguoiDungVaiTro/ThemMoi',
            

            'strId': "",
            'strVaiTro_Id': me.strVaiTro_Id,
            'strNguoiDung_Id': strNguoiDung_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thêm thành công!");
                }
                else {
                    edu.system.alert("CMS_VaiTro/ThemMoi: " + data.Message);
                }
                
            },
            error: function (er) {
                
                edu.system.alert("CMS_VaiTro/ThemMoi (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
};