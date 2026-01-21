/*----------------------------------------------
--Author: 
--Phone: 
--Date of created: 21/08/2018
--Input: 
--Output:
--Note:
----------------------------------------------*/
function DongBoDuLieu() { };
DongBoDuLieu.prototype = {
    objParam_KH: '',

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.page_load();
        /*------------------------------------------
        --Discription: Initial local
        -------------------------------------------*/
        var obj = {
            strNguoiDung_Id: edu.system.userId
        };
        edu.extend.getList_KeHoachNhapHoc_NhanSu(obj, "", "", me.cbGenCombo_KeHoachNhapHoc);
        /*------------------------------------------
        --Discription: Load Select 
        -------------------------------------------*/
        $("#btnChuyen_TT").click(function () {
            if (edu.util.checkValue(edu.util.getValById("dropKeHoachNhapHoc_ChuyenTT"))) {
                edu.system.confirm("Bạn có muốn thực hiện chuyển dữ liệu?");
                $("#myModalAlert").delegate("#btnYes", "click", function (e) {
                    me.ChuyenDuLieuNhapHoc();
                });
            }
            else {
                edu.system.alert("Dữ liệu không hợp lệ", "w");
            }
        });
    },
    /*------------------------------------------
	--Discription: [2] ACESS DB ==> ChuyenDuLieu
	--Author:  
	-------------------------------------------*/
    ChuyenDuLieuNhapHoc: function () {
        var me = this;
        var obj_list = {
            'action': 'NH_ChuyenHoSo/ChuyenDuLieuNhapHoc',

            'versionAPI': 'v1.0',
            'strNHAPHOC_KeHoach_Id': edu.util.getValById("dropKeHoachNhapHoc_ChuyenTT"),
            'strNguoiThucHien_Id': edu.system.userId,
        }
        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                edu.system.endLoading();
                if (data.Success) {
                    var obj = {
                        content: "Chuyển dữ liệu thành công!",
                        code: "s"
                    }
                    edu.system.afterComfirm(obj);
                }
                else {
                    var obj = {
                        content: "NH_ChuyenHoSo.ChuyenDuLieuNhapHoc: " + data.Message,
                        code: "w"
                    }
                    edu.system.afterComfirm(obj);
                }
            },
            error: function (er) {
                edu.system.endLoading();
                obj_notify = {
                    type: "w",
                    content: "er_ " + JSON.stringify(er),
                }
                edu.system.alert("NH_ChuyenHoSo.ChuyenDuLieuNhapHoc (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
	--Discription: [1] ACTION HTML ==> KeHoachNhapHoc
	--Author:  
	-------------------------------------------*/
    cbGenCombo_KeHoachNhapHoc: function (data, iPager) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKEHOACH",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropKeHoachNhapHoc_TT", "dropKeHoachNhapHoc_XoaTT", "dropKeHoachNhapHoc_ChuyenTT"],
            type: "",
            title: "Chọn kế hoạch nhập học",
        }
        edu.system.loadToCombo_data(obj);
    },
}