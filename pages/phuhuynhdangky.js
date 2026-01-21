/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function PhuHuynh() { };
PhuHuynh.prototype = {
    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.appCode = "SV";
        var id = edu.util.randomString(30, "");
        edu.system.loadToCombo_DanhMucDuLieu("GD.QUANHE", "dropMoiQuanHe");
        me.genHtml_SinhVien(id, "");
        $(".btnAdd_SinhVien").click(function () {
            var id = edu.util.randomString(30, "");
            me.genHtml_SinhVien(id, "");
        });
        $("#tblSinhVien").delegate(".deleteRowButton", "click", function () {
            var strRowId = this.id;
            $("#tblSinhVien tr[id='" + strRowId + "']").remove();
        });
        $("#btnSaveGiaDinh").click(function (e) {
            if (document.getElementById("tblSinhVien").getElementsByTagName('tbody')[0].rows.length == 0) {
                edu.system.alert("Bạn cần điền ít nhất 1 sinh viên!");
                return;
            }
            me.save_GiaDinh();
        });
    },
    genHtml_SinhVien: function (strKetQua_Id) {
        var me = this;
        var iViTri = document.getElementById("tblSinhVien").getElementsByTagName('tbody')[0].rows.length + 1;
        var row = ''; var aData = {};
        row += '<tr id="' + strKetQua_Id + '">';
        row += '<td style="text-align: center"><label id="txtStt' + strKetQua_Id + '">' + iViTri + '</label></td>';
        row += '<td><input type="text" id="txtMaSo' + strKetQua_Id + '" value="' + edu.util.returnEmpty(aData.DIADIEM) + '" class="form-control orm-control-sm" /></td>';
        row += '<td><input type="text" id="txtHoDem' + strKetQua_Id + '" value="' + edu.util.returnEmpty(aData.DIADIEM) + '" class="form-control orm-control-sm" /></td>';
        row += '<td><input type="text" id="txtTen' + strKetQua_Id + '" value="' + edu.util.returnEmpty(aData.DIADIEM) + '" class="form-control orm-control-sm" /></td>';
        row += '<td><input type="text" id="txtNganhHoc' + strKetQua_Id + '" value="' + edu.util.returnEmpty(aData.DIADIEM) + '" class="form-control orm-control-sm" /></td>';
        row += '<td><input type="text" id="txtKhoaHoc' + strKetQua_Id + '" value="' + edu.util.returnEmpty(aData.DIADIEM) + '" class="form-control orm-control-sm" /></td>';
        row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strKetQua_Id + '" href="javascript:void(0)"><i class="fa-light fa-trash"></i></a></td>';
        row += '</tr>';
        $("#tblSinhVien tbody").append(row);
    },


    save_GiaDinh: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'SV_GiaDinh/Them_GD_DangKy',
            'type': 'POST',
            'strHoDem': edu.util.getValById('txtHoDem'),
            'strTen': edu.util.getValById('txtTen'),
            'strEmail': edu.util.getValById('txtEmail'),
            'strSoDienThoai': edu.util.getValById('txtSoDienThoai'),
            'strQuanHe_Id': edu.util.getValById('dropMoiQuanHe'),
            'strMoTa': edu.util.getValById('txtGhiChu'),
        };
        //if (obj_save.strId) {
        //    obj_save.action = 'SV_SuKien/Sua_QLSV_SuKien_HoatDong';
        //}
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strSuKien_Id = "";

                    edu.system.alert("Thêm mới thành công!");
                    strSuKien_Id = data.Id;
                    $("#tblSinhVien tbody tr").each(function () {
                        me.save_SinhVien(this.id, strSuKien_Id);
                    });
                }
                else {
                    edu.system.alert(data.Message);
                }

                me.getList_SuKien();
            },
            error: function (er) {
                edu.system.alert("(er): " + JSON.stringify(er), "w");

            },
            type: 'POST',

            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_SinhVien: function (strNhanSu_Id, strGD_DangKy_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'SV_GiaDinh/Them_QD_DangKy_NguoiHoc',
            'type': 'POST',
            'strGD_DangKy_Id': strGD_DangKy_Id,
            'strHoDem': edu.util.getValById('txtHoDem' + strNhanSu_Id),
            'strTen': edu.util.getValById('txtTen' + strNhanSu_Id),
            'strMaSo': edu.util.getValById('txtMaSo' + strNhanSu_Id),
            'strNganhHoc': edu.util.getValById('txtNganhHoc' + strNhanSu_Id),
            'strKhoaHoc': edu.util.getValById('txtKhoaHoc' + strNhanSu_Id),
            'strMoTa': edu.util.getValById('txtAAAA'),
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thêm thành công!");
                }
                else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',

            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
}