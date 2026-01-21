/*----------------------------------------------
--Author: 
--Phone: 
--Date of created: 
--Note: 
--Note: 
----------------------------------------------*/
function ThamSoQuyDoiDiemApDung() { };
ThamSoQuyDoiDiemApDung.prototype = {
    strChuongTrinh_Id: '',
    dtChuongTrinh: [],
    strCommon_Id: '',
    dtThoiGianDaoTao: [],
    dtThamSoQuyDoiDiem: [],
    dtDiemChu:[],
    strHocPhan_Id: '',

    init: function () {
        var me = this;
        me.page_load();
        /*------------------------------------------
        --Discription: [tab_1] Hoc ham
        -------------------------------------------*/
        $("#tblChuongTrinh").delegate('.btnDetail', 'click', function (e) {
            var strId = this.id;
            //edu.util.viewHTMLById('zone_action', '<a id="btnHS_Save" class="btn btn-primary"><i class="fa fa-pencil"></i><span class="lang" key=""> Cập nhật</span></a>');
            ////
            $("#zoneEdit").slideDown();
            me.strChuongTrinh_Id = strId;
            edu.util.setOne_BgRow(strId, "tblChuongTrinh");
            me.getList_ThamSoQuyDoiDiemApDung_ChuongTrinh();
            me.getList_HocPhan_ChuongTrinh();
            var data = edu.util.objGetDataInData(strId, me.dtChuongTrinh, "ID");
            me.viewEdit_ThamSoAD_ChuongTrinh(data[0]);
        });
        $("#btnExtend_Search").click(function () {
            edu.util.toggle("box-sub-search");
        });
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_ChuongTrinh();
            }
        });
        $("#btnSearch").click(function () {
            me.getList_ChuongTrinh();
        });
        $("#btn_tab1").click(function () {
            $("#tab_ngoai1").hide();
            $("#tab_ngoai2").hide();
            $("#tab-content").show();
        });
        $("#btn_tab2").click(function () {
            $("#tab_ngoai1").show();
            $("#tab-content").hide();
        });

        $("#dropSearch_HeDaoTao").on("select2:select", function () {
            me.getList_KhoaDaoTao();
            me.getList_ChuongTrinh();
          
        });

        $("#dropSearch_KhoaHoc").on("select2:select", function () {
            me.getList_ChuongTrinh();
          
        });

        $("#btnKeThua_ThamSoQuyDoiDiemApDungChungCTTrongKhoa").click(function () {
            var id = edu.util.randomString(30, "");
            edu.system.confirm("Bạn có chắc chắn kế thừa");
            $("#btnYes").click(function (e) {
                me.save_KeThuaThamSoQuyDoiDiemAD_ChuongTrinh(id, "");
            });
           
        });
        /*------------------------------------------
        /*------------------------------------------
       --Discription: [4-1] Action KetQua_Detai
       --Order:
       -------------------------------------------*/
        $("#btnSave_ThamSoQuyDoiDiemApDungChungCT").click(function () {
            $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh tbody tr").each(function () {
                var strThamSoQuyDoi_AD_Id = this.id.replace(/rm_row/g, '');
                me.save_ThamSoQuyDoiDiemApDung_ChuongTrinh(strThamSoQuyDoi_AD_Id, me.strChuongTrinh_Id);
            });
        });
        $("#btnAdd_ThamSoQuyDoiDiemApDungChungCT").click(function () {
            var id = edu.util.randomString(30, "");
            me.genHTML_ThamSoQuyDoiDiemApDungCT(id, "");
        });
        $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh").delegate(".deleteRowButton", "click", function () {
            var strRowId = this.id;
            $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh tr[id='" + strRowId + "']").remove();
        });
        $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh").delegate(".deleteThamSoQuyDoiDiem_ChuongTrinh", "click", function () {
            var strId = this.id;
            edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
            $("#btnYes").click(function (e) {
                me.delete_ThamSoQuyDoiDiemApDung_ChuongTrinh(strId);
            });
        });

        /*------------------------------------------
       --Discription: [4-1] Action KetQua_Detai
       --Order:
       -------------------------------------------*/
        $("#btnSave_ThamSoQuyDoiDiemApDung_HocPhan").click(function () {
            $("#tblThamSoQuyDoiDiemApDung_HocPhan tbody tr").each(function () {
                var strThamSoQuyDoiDiemApDung_Id = this.id.replace(/rm_row/g, '');
                me.save_ThamSoQuyDoiDiem_HocPhan(strThamSoQuyDoiDiemApDung_Id, me.strHocPhan_Id + me.strChuongTrinh_Id);
            });
        });
        $("#btnAdd_ThamSoQuyDoiDiemApDung_HocPhan").click(function () {
            var id = edu.util.randomString(30, "");
            me.genHTML_ThamSoQuyDoiDiem_HocPhan_New(id, "");
        });
        $("#tblThamSoQuyDoiDiemApDung_HocPhan").delegate(".deleteRowButton", "click", function () {
            var strRowId = this.id;
            $("#tblThamSoQuyDoiDiemApDung_HocPhan tr[id='" + strRowId + "']").remove();
        });
        $("#tblThamSoQuyDoiDiemApDung_HocPhan").delegate(".deleteThamSoQuyDoiDiem_HocPhan", "click", function () {
            var strId = this.id;
            edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
            $("#btnYes").click(function (e) {
                me.delete_ThamSoQuyDoiDiem_HocPhan(strId);
            });
        });
        $("#txtSearch_HocPhan_TuKhoa").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $("#zone_hocphanchuongtrinh li").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            }).css("color", "red");
        });

        edu.extend.genBoLoc_HeKhoa("_KT");
        $("#btnAdd_KeThua").click(function () {
            $("#myModalKeThua").modal("show")
            me.getList_KeThua();
        });
        $("#btnSearchKT").click(function () {
            me.getList_KeThua();
        });
        $("#btnSave_KeThua").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblKeThua", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng?");
                return;
            }
            edu.system.alert('<div id="zoneprocessXXXX"></div>');
            edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
            for (var i = 0; i < arrChecked_Id.length; i++) {
                me.save_KeThua(arrChecked_Id[i]);
            }
        });
    },
    page_load: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.page_load();
        me.getList_HeDaoTao();
        me.getList_KhoaDaoTao();
        me.getList_ChuongTrinh();
        me.getList_ThoiGianDaoTao();
        me.getList_ThamSoQuyDoiDiem();
        edu.system.loadToCombo_DanhMucDuLieu("DIEM.THANGDIEM", "dropChuongTrinh_ThangDiemGoc, dropChuongTrinh_ThangDiemQuyDoi");
        edu.system.loadToCombo_DanhMucDuLieu("DIEM.DIEMCHU", "", "", me.getList_DiemChu);
        //edu.system.loadToCombo_DanhMucDuLieu(constant.setting.CATOR.DIEM.DIEMCHU, "dropHP_DiemChu, dropChuongTrinh_DiemChu ");
    },

    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> chuong trinh
    --Author: duyentt
	-------------------------------------------*/
    getList_ChuongTrinh: function () {
        var me = this;

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtChuongTrinh = dtResult;
                    me.genTable_ChuongTrinh(dtResult, iPager);
                }
                else {
                    edu.system.alert("KHCT_ToChucChuongTrinh/LayDanhSach: " + data.Message, "w");
                }
                
            },
            error: function (er) {
                edu.system.alert("KHCT_ToChucChuongTrinh/LayDanhSach (ex): " + JSON.stringify(er), "w");
                
            },
            type: 'GET',
            action: 'KHCT_ToChucChuongTrinh/LayDanhSach',
            
            contentType: true,
            
            data: {
                'strTuKhoa': edu.util.getValById("txtSearch_TuKhoa"),
                'strDaoTao_KhoaDaoTao_Id': edu.util.getValById("dropSearch_KhoaHoc"),
                'strDaoTao_HeDaoTao_Id': edu.util.getValById("dropSearch_HeDaoTao"),
                'strDaoTao_N_CN_Id': "",
                'strDaoTao_KhoaQuanLy_Id': "",
                'strDaoTao_ToChucCT_Cha_Id': "",
                'strNguoiThucHien_Id': "",
                'pageIndex': edu.system.pageIndex_default,
                'pageSize': edu.system.pageSize_default,
            },
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTable_ChuongTrinh: function (data, iPager) {
        var me = this;
        $("#zoneEdit").slideUp();
        edu.util.viewHTMLById("lblChuongTrinh_Tong", iPager);
        var jsonForm = {
            strTable_Id: "tblChuongTrinh",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.ThamSoQuyDoiDiemApDung.getList_ChuongTrinh()",
                iDataRow: iPager
            },
            bHiddenHeader: true,
            bHiddenOrder: true,
            arrClassName: ["btnDetail"],
            colPos: {
                left: [1],
                fix: [0]
            },
            aoColumns: [
                {
                    "mRender": function (nRow, aData) {
                        var html = '';
                        html += '<span>' + 'Chương trình: ' + edu.util.returnEmpty(aData.TENCHUONGTRINH) + "</span><br />";
                        html += '<span>' + 'Khóa đào tạo: ' + edu.util.returnEmpty(aData.DAOTAO_KHOADAOTAO_TEN) + "</span><br />";
                        return html;
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        /*III. Callback*/
    },
    /*------------------------------------------
    --Discription: [2] AccessDB ThamSoChung_ChuongTrinh
    --ULR:  Modules
    -------------------------------------------*/
    save_ThamSoQuyDoiDiemApDung_ChuongTrinh: function (strThamSoQuyDoiDiemApDung_Id, strChuongTrinh_Id) {
        var me = this;
        var strId = strThamSoQuyDoiDiemApDung_Id;
        var strDaoTao_ThoiGianDaoTao_Id = edu.util.getValById('dropChuongTrinh_ThoiGianDaoTao' + strThamSoQuyDoiDiemApDung_Id);
        var strDiem_QuyDoiThangDiem_Id = edu.util.getValById('dropChuongTrinh_ThamSoQuyDoiThangDiem' + strThamSoQuyDoiDiemApDung_Id);
       // var strThangDiemQuyDoi_Id = edu.util.getValById('dropChuongTrinh_ThangDiemQuyDoi' + strThamSoQuyDoiDiemApDung_Id);
        var dDiemCanDuoi_DiemGoc = edu.util.getValById('txtMucDiemBatDau_CT' + strThamSoQuyDoiDiemApDung_Id);
        var dDiemCanTren_DiemGoc = edu.util.getValById('txtMucDiemKetThuc_CT' + strThamSoQuyDoiDiemApDung_Id);
        var dDiemSo_DiemQuyDoi = edu.util.getValById('txtDiemSo_CT' + strThamSoQuyDoiDiemApDung_Id);
        var strDiemChu_DiemQuyDoi_Id = edu.util.getValById('dropChuongTrinh_DiemChu' + strThamSoQuyDoiDiemApDung_Id);
        var strNgayApDung = edu.util.getValById('txtNgayApDung_CT' + strThamSoQuyDoiDiemApDung_Id);
        //var strTinhTrang_Id = edu.util.getValById('dropDeTai_TinhTrang' + strChuongTrinh_Id);
        //if (!edu.util.checkValue(strThamSoQuyDoiDiemApDung_Id) || !edu.util.checkValue(strDaoTao_ThoiGianDaoTao_Id) || !edu.util.checkValue(strNgayApDung)) {
        //    //edu.system.alert("Có dòng thiếu thông tin. Hãy kiểm tra và thực hiện 'Lưu'")
        //    return;
        //}
        //Kiểm tra dữ liệu để thêm mới hoặc sửa
        if (strId.length == 30) strId = "";
        var obj_notify;
        //--Edit
        var obj_save = {
            'action': 'D_QuyDoiThangDiem_ApDung/ThemMoi',
            

            'strId': strId,
            'strPhanCapApDung_Id': '',
            'strDiem_QuyDoiThangDiem_Id': strDiem_QuyDoiThangDiem_Id,
            'strPhamViApDung_Id': strChuongTrinh_Id,
            'strThangDiemGoc_Id': '',
            'strThangDiemQuyDoi_Id': '',
            'dDiemCanDuoi_DiemGoc': dDiemCanDuoi_DiemGoc,
            'dDiemCanTren_DiemGoc': dDiemCanTren_DiemGoc,
            'dDiemSo_DiemQuyDoi': dDiemSo_DiemQuyDoi,
            'strDiemChu_DiemQuyDoi_Id': strDiemChu_DiemQuyDoi_Id,
            'iThuTu': '',
            'strDaoTao_ThoiGianDaoTao_Id': strDaoTao_ThoiGianDaoTao_Id,
            'strNgayApDung': strNgayApDung,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //if (edu.util.checkValue(strId)) {
        //    obj_save.action = 'D_QuyDoiThangDiem_ApDung/CapNhat';
        //}
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (strId == "") {
                        edu.system.alert("Thêm mới thành công")
                    } else {
                        edu.system.alert("Cập nhật thành công")
                    }
                }
                else {
                    obj_notify = {
                        type: "w",
                        title: obj_save + ": " + data.Message
                    };
                    edu.system.alert(obj_save + ": " + data.Message);
                }
            },
            error: function (er) {
                obj_notify = {
                    renderPlace: "slnhansu" + strNhanSu_Id,
                    type: "w",
                    title: obj_save + " (er): " + JSON.stringify(er)
                };
                edu.system.notifyLocal(obj_notify);
            },
            type: 'POST',
            
            contentType: true,
            
            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_ThamSoQuyDoiDiemApDung_ChuongTrinh: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'D_QuyDoiThangDiem_ApDung/LayDanhSach',
            

            'strTuKhoa': '',
            'strThangDiemGoc_Id': "",
            'strThangDiemQuyDoi_Id': "",
            'strDiemChu_DiemQuyDoi_Id': "",
            'strDaoTao_ThoiGianDaoTao_Id': "",
            'strPhanCapApDung_Id': "",
            'strPhamViApDung_Id': me.strChuongTrinh_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 10000000
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.genHTML_ThamSoQuyDoiDiemApDung_ChuongTrinh(data.Data);
                }
                else {
                    edu.system.alert(obj_list.action + ": " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getDeTail_ThamSoQuyDoiDiemApDung_ChuongTrinh: function (strId) {
        var me = this;
        //view data --Edit
        var obj_detail = {
            'action': 'D_QuyDoiThangDiem_ApDung/LayChiTiet',
            
            'strId': strId
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (edu.util.checkValue(data.Data)) {
                        me.viewForm_ThamSoQuyDoiDiemApDung_ChuongTrinh(data.Data[0]);
                    }
                }
                else {
                    edu.system.alert(obj_detail.action + ": " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_detail.action + " (er): " + er);
            },
            type: "GET",
            action: obj_detail.action,
            
            contentType: true,
            
            data: obj_detail,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    delete_ThamSoQuyDoiDiemApDung_ChuongTrinh: function (strIds) {
        var me = this;
        //--Edit
        var obj_delete = {
            'action': 'D_QuyDoiThangDiem_ApDung/Xoa',
            
            'strIds': strIds,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công!");
                    me.getList_ThamSoQuyDoiDiemApDung_ChuongTrinh();
                }
                else {
                    edu.system.alert(obj_delete.action + ": " + data.Message);
                }
            },
            error: function (er) {
                edu.system.endLoading(obj_delete.action + " (er): " + er);
            },
            type: 'POST',
            action: obj_delete.action,
            
            contentType: true,
            
            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    genHTML_ThamSoQuyDoiDiemApDung_ChuongTrinh: function (data) {
        var me = this;
        $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh tbody").html("");
        for (var i = 0; i < data.length; i++) {
            var strThamSoQuyDoiDiem_AD_Id = data[i].ID;
            var row = '';
            row += '<tr id="' + strThamSoQuyDoiDiem_AD_Id + '">';
            row += '<td style="text-align: center"><label id="txtStt' + strThamSoQuyDoiDiem_AD_Id + '">' + (i + 1) + '</label></td>';
            row += '<td><select id="dropChuongTrinh_ThamSoQuyDoiThangDiem' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn tham số quy đổi điểm --</option ></select ></td>';
            row += '<td><select id="dropChuongTrinh_ThoiGianDaoTao' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn thời gian học tập--</option ></select ></td>';
            row += '<td><input type="text" id="txtNgayApDung_CT' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].NGAYAPDUNG) + '" placeholder="dd/mm/yyyy" style="width: 100px" class="form-control input-datepicker"/></td>';
            row += '<td><input type="text" id="txtMucDiemBatDau_CT' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].DIEMCANDUOI_THANGDIEMGOC) + '"  class="form-control"/></td>';
            row += '<td><input type="text" id="txtMucDiemKetThuc_CT' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].DIEMCANTREN_THANGDIEMGOC) + '" class="form-control"/></td>';
            row += '<td><input type="text" id="txtDiemSo_CT' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].DIEMSO_THANGDIEMQUYDOI) + '" class="form-control"/></td>';
            row += '<td><select id="dropChuongTrinh_DiemChu' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn điểm chữ--</option ></select ></td>';
            //row += '<td>' + edu.util.returnEmpty(data[i].NGAYTAO_DD_MM_YYYY) + '</td>';
            //row += '<td>' + edu.util.returnEmpty(data[i].NGUOITAO_TENDAYDU) + '</td>';
            if (data[i].LADULIEUKHOITAO == '0')
            row += '<td style="text-align: center"><a title="Xóa" class="deleteThamSoQuyDoiDiem_ChuongTrinh" id="' + strThamSoQuyDoiDiem_AD_Id + '" href="javascript:void(0)" style="color: red">Xóa</a></td>';
            else
                row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strThamSoQuyDoiDiem_AD_Id + '" href="javascript:void(0)">Xóa</a></td>';
            row += '</tr>';
            $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh tbody").append(row);
            me.genCombo_ThamSoQuyDoiDiem("dropChuongTrinh_ThamSoQuyDoiThangDiem" + strThamSoQuyDoiDiem_AD_Id, data[i].DIEM_QUYDOITHANGDIEM_ID);
            me.genCombo_ThoiGianDaoTao("dropChuongTrinh_ThoiGianDaoTao" + strThamSoQuyDoiDiem_AD_Id, data[i].DAOTAO_THOIGIANDAOTAO_ID);
            me.genCombo_DiemChu("dropChuongTrinh_DiemChu" + strThamSoQuyDoiDiem_AD_Id, data[i].DIEMCHU_THANGDIEMQUYDOI_ID);
        }
        edu.system.pickerdate();
        //for (var i = data.length; i < 1; i++) {
        //    var id = edu.util.randomString(30, "");
        //    me.genHTML_ThamSoQuyDoiDiemApDungCT(id, "");
        //}
    },
    genHTML_ThamSoQuyDoiDiemApDungCT: function (strThamSoQuyDoiDiem_AD_Id) {
        var me = this;
        var iViTri = document.getElementById("tblThamSoQuyDoiDiemApDungChungChoChuongTrinh").getElementsByTagName('tbody')[0].rows.length + 1;
        var row = '';
        row += '<tr id="' + strThamSoQuyDoiDiem_AD_Id + '">';
        row += '<td style="text-align: center"><label id="txtStt' + strThamSoQuyDoiDiem_AD_Id + '">' + iViTri + '</label></td>';
        row += '<td><select id="dropChuongTrinh_ThamSoQuyDoiThangDiem' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn tham số học tập--</option ></select ></td>';
        row += '<td><select id="dropChuongTrinh_ThoiGianDaoTao' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn học kỳ áp dụng--</option ></select ></td>';
        row += '<td><input type="text" id="txtNgayApDung_CT' + strThamSoQuyDoiDiem_AD_Id + '" class="form-control input-datepicker" placeholder="dd/mm/yyyy" style="width: 100px"/></td>';
        row += '<td><input type="text" id="txtMucDiemBatDau_CT' + strThamSoQuyDoiDiem_AD_Id + '"  class="form-control"/></td>';
        row += '<td><input type="text" id="txtMucDiemKetThuc_CT' + strThamSoQuyDoiDiem_AD_Id + '" class="form-control"/></td>';
        row += '<td><input type="text" id="txtDiemSo_CT' + strThamSoQuyDoiDiem_AD_Id + '" class="form-control"/></td>';
        row += '<td><select id="dropChuongTrinh_DiemChu' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn điểm chữ--</option ></select ></td>';
        //row += '<td></td>';
        //row += '<td></td>';
        row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strThamSoQuyDoiDiem_AD_Id + '" href="javascript:void(0)">Xóa</a></td>';
        row += '</tr>';
        $("#tblThamSoQuyDoiDiemApDungChungChoChuongTrinh tbody").append(row);
        me.genCombo_ThamSoQuyDoiDiem("dropChuongTrinh_ThamSoQuyDoiThangDiem" + strThamSoQuyDoiDiem_AD_Id, "");
        me.genCombo_ThoiGianDaoTao("dropChuongTrinh_ThoiGianDaoTao" + strThamSoQuyDoiDiem_AD_Id, "");
        me.genCombo_DiemChu("dropChuongTrinh_DiemChu" + strThamSoQuyDoiDiem_AD_Id, "");
        edu.system.pickerdate();
    },
    /*------------------------------------------
    --Discription: [2] AccessDB ThamSoChung_ChuongTrinh
    --ULR:  Modules
    -------------------------------------------*/
    save_ThamSoQuyDoiDiem_HocPhan: function (strThamSoQuyDoiDiemApDung_Id, strHocPhan_Id) {
        var me = this;
        var strId = strThamSoQuyDoiDiemApDung_Id;
        var strDaoTao_ThoiGianDaoTao_Id = edu.util.getValById('dropHP_ThoiGianDaoTao' + strThamSoQuyDoiDiemApDung_Id);
        var strDiem_QuyDoiThangDiem_Id = edu.util.getValById('dropHP_ThamSoQuyDoiThangDiem' + strThamSoQuyDoiDiemApDung_Id);
        var dDiemCanDuoi_DiemGoc = edu.util.getValById('txtMucDiemBatDau_HP' + strThamSoQuyDoiDiemApDung_Id);
        var dDiemCanTren_DiemGoc = edu.util.getValById('txtMucDiemKetThuc_HP' + strThamSoQuyDoiDiemApDung_Id);
        var dDiemSo_DiemQuyDoi = edu.util.getValById('txtDiemSo_HP' + strThamSoQuyDoiDiemApDung_Id);
        var strDiemChu_DiemQuyDoi_Id = edu.util.getValById('dropHP_DiemChu' + strThamSoQuyDoiDiemApDung_Id);
        var strNgayApDung = edu.util.getValById('txtNgayApDung_HP' + strThamSoQuyDoiDiemApDung_Id);
        //var strTinhTrang_Id = edu.util.getValById('dropDeTai_TinhTrang' + strChuongTrinh_Id);
        //if (!edu.util.checkValue(strThamSoQuyDoiDiemApDung_Id) || !edu.util.checkValue(strDaoTao_ThoiGianDaoTao_Id) || !edu.util.checkValue(strNgayApDung) ) {
        //    //edu.system.alert("Có dòng thiếu thông tin. Hãy kiểm tra và thực hiện 'Lưu'")
        //    return;
        //}
        //Kiểm tra dữ liệu để them mới hoặc sửa
        if (strId.length == 30) strId = "";
        var obj_notify;
        //--Edit
        var obj_save = {
            'action': 'D_QuyDoiThangDiem_ApDung/ThemMoi',
            

            'strId': strId,
            'strPhanCapApDung_Id': '',
            'strDiem_QuyDoiThangDiem_Id': strDiem_QuyDoiThangDiem_Id,
            'strPhamViApDung_Id': strHocPhan_Id,
            'strThangDiemGoc_Id':'',
            'strThangDiemQuyDoi_Id': '',
            'strDaoTao_ThoiGianDaoTao_Id': strDaoTao_ThoiGianDaoTao_Id,
            'dDiemCanDuoi_DiemGoc': dDiemCanDuoi_DiemGoc,
            'dDiemCanTren_DiemGoc': dDiemCanTren_DiemGoc,
            'dDiemSo_DiemQuyDoi': dDiemSo_DiemQuyDoi,
            'strDiemChu_DiemQuyDoi_Id': strDiemChu_DiemQuyDoi_Id,
            'iThuTu': '',
            'strNgayApDung': strNgayApDung,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //if (edu.util.checkValue(strId)) {
        //    obj_save.action = 'D_QuyDoiThangDiem_ApDung/CapNhat';
        //}
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (strId == "") {
                        edu.system.alert("Thêm mới thành công")
                    } else {
                        edu.system.alert("Cập nhật thành công")
                    }
                }
                else {
                    obj_notify = {
                        type: "w",
                        title: obj_save + ": " + data.Message
                    };
                    edu.system.notifyLocal(obj_notify);
                }
            },
            error: function (er) {
                obj_notify = {
                    type: "w",
                    title: obj_save + " (er): " + JSON.stringify(er)
                };
                edu.system.notifyLocal(obj_notify);
            },
            type: 'POST',
            
            contentType: true,
            
            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_ThamSoQuyDoiDiem_HocPhan: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'D_QuyDoiThangDiem_ApDung/LayDanhSach',
            

            'strTuKhoa': '',
            'strThangDiemGoc_Id': "",
            'strThangDiemQuyDoi_Id': "",
            'strDiemChu_DiemQuyDoi_Id': "",
            'strDaoTao_ThoiGianDaoTao_Id': "",
            'strPhanCapApDung_Id': "",
            'strPhamViApDung_Id': me.strHocPhan_Id + me.strChuongTrinh_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 10000000
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.genHTML_ThamSoQuyDoiDiem_HocPhan(data.Data);
                }
                else {
                    edu.system.alert(obj_list.action + ": " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    delete_ThamSoQuyDoiDiem_HocPhan: function (strIds) {
        var me = this;
        //--Edit
        var obj_delete = {
            'action': 'D_QuyDoiThangDiem_ApDung/Xoa',
            
            'strIds': strIds,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công!");
                    me.getList_ThamSoQuyDoiDiem_HocPhan();
                }
                else {
                    edu.system.alert(obj_delete.action + ": " + data.Message);
                }
            },
            error: function (er) {
                edu.system.endLoading(obj_delete.action + " (er): " + er);
            },
            type: 'POST',
            action: obj_delete.action,
            
            contentType: true,
            
            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    genHTML_ThamSoQuyDoiDiem_HocPhan: function (data) {
        var me = this;
        $("#tblThamSoQuyDoiDiemApDung_HocPhan tbody").html("");
        for (var i = 0; i < data.length; i++) {
            var strThamSoQuyDoiDiem_AD_Id = data[i].ID;
            var row = '';
            row += '<tr id="' + strThamSoQuyDoiDiem_AD_Id + '">';
            row += '<td style="text-align: center"><label id="txtStt' + strThamSoQuyDoiDiem_AD_Id + '">' + (i + 1) + '</label></td>';
            row += '<td><select id="dropHP_ThamSoQuyDoiThangDiem' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn tham số quy đổi điểm --</option ></select ></td>';
            row += '<td><select id="dropHP_ThoiGianDaoTao' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn thời gian học tập--</option ></select ></td>';
            row += '<td><input type="text" id="txtNgayApDung_HP' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].NGAYAPDUNG) + '" placeholder="dd/mm/yyyy" style="width: 100px" class="form-control input-datepicker"/></td>';
            row += '<td><input type="text" id="txtMucDiemBatDau_HP' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].DIEMCANDUOI_THANGDIEMGOC) + '"  class="form-control"/></td>';
            row += '<td><input type="text" id="txtMucDiemKetThuc_HP' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].DIEMCANTREN_THANGDIEMGOC) + '" class="form-control"/></td>';
            row += '<td><input type="text" id="txtDiemSo_HP' + strThamSoQuyDoiDiem_AD_Id + '" value="' + edu.util.returnEmpty(data[i].DIEMSO_THANGDIEMQUYDOI) + '" class="form-control"/></td>';
            row += '<td><select id="dropHP_DiemChu' + strThamSoQuyDoiDiem_AD_Id + '" class="select-opt"><option value=""> --- Chọn điểm chữ--</option ></select ></td>';
            //row += '<td>' + edu.util.returnEmpty(data[i].NGAYTAO_DD_MM_YYYY) + '</td>';
            //row += '<td>' + edu.util.returnEmpty(data[i].NGUOITAO_TENDAYDU) + '</td>';
            if (data[i].LADULIEUKHOITAO == '0')
            row += '<td style="text-align: center"><a title="Xóa" class="deleteThamSoQuyDoiDiem_HocPhan" id="' + strThamSoQuyDoiDiem_AD_Id + '" href="javascript:void(0)" style="color: red">Xóa</a></td>';
            else
                row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strThamSoQuyDoiDiem_AD_Id + '" href="javascript:void(0)">Xóa</a></td>';
            row += '</tr>';
            $("#tblThamSoQuyDoiDiemApDung_HocPhan tbody").append(row);
            me.genCombo_ThamSoQuyDoiDiem("dropHP_ThamSoQuyDoiThangDiem" + strThamSoQuyDoiDiem_AD_Id, data[i].DIEM_QUYDOITHANGDIEM_ID);
            me.genCombo_ThoiGianDaoTao("dropHP_ThoiGianDaoTao" + strThamSoQuyDoiDiem_AD_Id, data[i].DAOTAO_THOIGIANDAOTAO_ID);
            me.genCombo_DiemChu("dropHP_DiemChu" + strThamSoQuyDoiDiem_AD_Id, data[i].DIEMCHU_THANGDIEMQUYDOI_ID);
        }
        edu.system.pickerdate();
        //for (var i = data.length; i < 1; i++) {
        //    var id = edu.util.randomString(30, "");
        //    me.genHTML_ThamSoQuyDoiDiem_HocPhan_New(id, "");
        //}
    },
    genHTML_ThamSoQuyDoiDiem_HocPhan_New: function (strThamSoQuyDoiDiem_AP_Id) {
        var me = this;
        var iViTri = document.getElementById("tblThamSoQuyDoiDiemApDung_HocPhan").getElementsByTagName('tbody')[0].rows.length + 1;
        var row = '';
        row += '<tr id="' + strThamSoQuyDoiDiem_AP_Id + '">';
        row += '<td style="text-align: center"><label id="txtStt' + strThamSoQuyDoiDiem_AP_Id + '">' + iViTri + '</label></td>';
        row += '<td><select id="dropHP_ThamSoQuyDoiThangDiem' + strThamSoQuyDoiDiem_AP_Id + '" class="select-opt"><option value=""> --- Chọn tham số học tập--</option ></select ></td>';
        row += '<td><select id="dropHP_ThoiGianDaoTao' + strThamSoQuyDoiDiem_AP_Id + '" class="select-opt"><option value=""> --- Chọn học kỳ áp dụng--</option ></select ></td>';
        row += '<td><input type="text" id="txtNgayApDung_HP' + strThamSoQuyDoiDiem_AP_Id + '" class="form-control input-datepicker" placeholder="dd/mm/yyyy" style="width: 100px"/></td>';
        row += '<td><input type="text" id="txtMucDiemBatDau_HP' + strThamSoQuyDoiDiem_AP_Id + '"  class="form-control"/></td>';
        row += '<td><input type="text" id="txtMucDiemKetThuc_HP' + strThamSoQuyDoiDiem_AP_Id + '" class="form-control"/></td>';
        row += '<td><input type="text" id="txtDiemSo_HP' + strThamSoQuyDoiDiem_AP_Id + '" class="form-control"/></td>';
        row += '<td><select id="dropHP_DiemChu' + strThamSoQuyDoiDiem_AP_Id + '" class="select-opt"><option value=""> --- Chọn điểm chữ--</option ></select ></td>';
        //row += '<td></td>';
        //row += '<td></td>';
        row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strThamSoQuyDoiDiem_AP_Id + '" href="javascript:void(0)">Xóa</a></td>';
        row += '</tr>';
        $("#tblThamSoQuyDoiDiemApDung_HocPhan tbody").append(row);
        me.genCombo_ThamSoQuyDoiDiem("dropHP_ThamSoQuyDoiThangDiem" + strThamSoQuyDoiDiem_AP_Id, "");
        me.genCombo_ThoiGianDaoTao("dropHP_ThoiGianDaoTao" + strThamSoQuyDoiDiem_AP_Id, "");
        me.genCombo_DiemChu("dropHP_DiemChu" + strThamSoQuyDoiDiem_AP_Id, "");
        edu.system.pickerdate();
    },
    save_KeThuaThamSoQuyDoiDiemAD_ChuongTrinh: function (strChuongTrinh_Id) {
        var me = this;
        var strId = strChuongTrinh_Id;
        //var strDaoTao_ThoiGianDaoTao_Id = edu.util.getValById('dropChuongTrinh_ThoiGianDaoTao' + strThamSoChungApDung_Id);
        //var strDiem_ThamSoHocTapChung_Id = edu.util.getValById('dropChuongTrinh_ThamSoChung' + strThamSoChungApDung_Id);
        //var dSoLanHocToiDa = edu.util.getValById('txtSoLanHocToiDa_CT' + strThamSoChungApDung_Id);
        //var dSoLanThiLaiToiDa = edu.util.getValById('txtSoLanThiToiDa_CT' + strThamSoChungApDung_Id);
        //var strNgayApDung = edu.util.getValById('txtNgayApDung_CT' + strThamSoChungApDung_Id);
        ////var strTinhTrang_Id = edu.util.getValById('dropDeTai_TinhTrang' + strChuongTrinh_Id);
        //if (!edu.util.checkValue(strDiem_ThamSoHocTapChung_Id) || !edu.util.checkValue(strDaoTao_ThoiGianDaoTao_Id) || !edu.util.checkValue(strNgayApDung)) {
        //    //edu.system.alert("Có dòng thiếu thông tin. Hãy kiểm tra và thực hiện 'Lưu'")
        //    return;
        //}
        //Kiểm tra dữ liệu để them mới hoặc sửa
        //if (strId.length == 30) strId = "";
        var obj_notify;
        //--Edit
        var obj_save = {
            'action': 'D_QuyDoiThangDiem_ApDung/KeThua',
            

            
            'strDaoTao_ChuongTrinh_Id': me.strChuongTrinh_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        if (edu.util.checkValue(strId)) {
            obj_save.action = 'D_QuyDoiThangDiem_ApDung/KeThua';
        }
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {

                    edu.system.alert("Kế thừa cho tất cả chương trình trong khóa thành công")
                }
                else {
                    obj_notify = {
                        type: "w",
                        title: obj_save + ": " + data.Message
                    };
                    edu.system.notifyLocal(obj_notify);
                }
            },
            error: function (er) {
                obj_notify = {
                    renderPlace: "slnhansu" + strChuongTrinh_Id,
                    type: "w",
                    title: obj_save + " (er): " + JSON.stringify(er)
                };
                edu.system.notifyLocal(obj_notify);
            },
            type: 'POST',
            
            contentType: true,
            
            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> thoi gian dao tao
    --Author: duyentt
	-------------------------------------------*/
    getList_ThoiGianDaoTao: function () {
        var me = this;

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtThoiGianDaoTao = dtResult;
                }
                else {
                    edu.system.alert("KHCT_ThoiGianDaoTao/LayDanhSach: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("KHCT_ThoiGianDaoTao/LayDanhSach (ex): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: 'KHCT_ThoiGianDaoTao/LayDanhSach',
            
            contentType: true,
            
            data: {
                'strTuKhoa': "",
                'strDAOTAO_NAM_Id': "",
                'strNguoiThucHien_Id': "",
                'pageIndex': 1,
                'pageSize': 1000000
            },
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_ThoiGianDaoTao: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtThoiGianDaoTao,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Chọn học kỳ"
        };
        edu.system.loadToCombo_data(obj);
        $("#" + strDrop_Id).select2();
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> tham so hoc tap chung
    --Author: duyentt
	-------------------------------------------*/
    getList_ThamSoQuyDoiDiem: function () {
        var me = this;

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtThamSoQuyDoiDiem = dtResult;
                }
                else {
                    edu.system.alert("D_QuyDoiThangDiem/LayDanhSach: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("D_QuyDoiThangDiem/LayDanhSach (ex): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: 'D_QuyDoiThangDiem/LayDanhSach',
            
            contentType: true,
            data: {
                'strTuKhoa': "",
                'strThangDiemGoc_Id': "",
                'strThangDiemQuyDoi_Id': "",
                'strDiemChu_DiemQuyDoi_Id': "",
                'strNguoiThucHien_Id': "",
                'pageIndex': 1,
                'pageSize': 1000000
            },
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_ThamSoQuyDoiDiem: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtThamSoQuyDoiDiem,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DIEM_QUYDOITHANGDIEM_TEN",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Chọn tham số"
        };
        edu.system.loadToCombo_data(obj);
        $("#" + strDrop_Id).select2();
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> diem chu
    --Author: duyentt
	-------------------------------------------*/
    getList_DiemChu: function (data) {
        main_doc.ThamSoQuyDoiDiemApDung.dtDiemChu = data;
    },
    genCombo_DiemChu: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtDiemChu,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Chọn điểm chữ"
        };
        edu.system.loadToCombo_data(obj);
        $("#" + strDrop_Id).select2();
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> hoc phan theo chuong trinh
    --Author: duyentt
	-------------------------------------------*/
    getList_HocPhan_ChuongTrinh: function () {
        var me = this;

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genCombo_HocPhan_ChuongTrinh(dtResult);
                }
                else {
                    edu.system.alert("KHCT_HocPhan_ChuongTrinh/LayDanhSach: " + data.Message, "w");
                }
                
            },
            error: function (er) {
                edu.system.alert("KHCT_HocPhan_ChuongTrinh/LayDanhSach (ex): " + JSON.stringify(er), "w");
                
            },
            type: 'GET',
            action: 'KHCT_HocPhan_ChuongTrinh/LayDanhSach',
            
            contentType: true,
            
            data: {
                'strTuKhoa': "",
                'strDaoTao_ThoiGian_KH_Id': "",
                'strDaoTao_ThoiGian_TT_Id': "",
                'strThuocTinhHocPhan_Id': "",
                'strPhanCongPhamViDamNhiem_Id': "",
                'strDaoTao_HocPhan_Id': "",
                'strDaoTao_ChuongTrinh_Id': me.strChuongTrinh_Id,
                'strNguoiThucHien_Id': "",
                'pageIndex': 1,
                'pageSize': 1000000
            },
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_HocPhan_ChuongTrinh: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "DAOTAO_HOCPHAN_ID",
                parentId: "",
                name: "DAOTAO_HOCPHAN_TEN",
                code: ""
            },
            renderPlaces: ["zone_hocphanchuongtrinh"],
            style: "fa fa-cube color-active"
        };
        edu.system.loadToTreejs_data(obj);
        //for (var i = 0; i < dtResult.length; i++) {
        //    $($("#zone_hocphanchuongtrinh #" + dtResult[i].ID + " a")[0]).append(" <span style='color: blue'>(Tổng số HP: " + dtResult[i].TONGSOHP + "; \t Tổng số TC: " + dtResult[i].TONGSOTC + "; \t Số HP bắt buộc: " + dtResult[i].SOHOCPHANQUYDINH + "; \t Số TC bắt buộc: " + dtResult[i].SOTINCHIQUYDINH + ")</span>");
        //}
        //2. Action
        $('#zone_hocphanchuongtrinh').on("select_node.jstree", function (e, data) {
            var strNameNode = data.node.id;
            me.strHocPhan_Id = strNameNode;
            me.getList_ThamSoQuyDoiDiem_HocPhan();
            $("#tab_ngoai2").show();
        });
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> he dao tao
    --Author: duyentt
	-------------------------------------------*/
    getList_HeDaoTao: function () {
        var me = this;

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genCombo_HeDaoTao(dtResult);
                }
                else {
                    edu.system.alert("KHCT_HeDaoTao/LayDanhSach: " + data.Message, "w");
                }
                
            },
            error: function (er) {
                edu.system.alert("KHCT_HeDaoTao/LayDanhSach (ex): " + JSON.stringify(er), "w");
                
            },
            type: 'GET',
            action: 'KHCT_HeDaoTao/LayDanhSach',
            
            contentType: true,
            
            data: {
                'strTuKhoa': "",
                'strDaoTao_HinhThucDaoTao_Id': "",
                'strDaoTao_BacDaoTao_Id': "",
                'strNguoiThucHien_Id': "",
                'pageIndex': 1,
                'pageSize': 1000000
            },
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_HeDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENHEDAOTAO",
                code: "MAHEDAOTAO",
                order: "unorder"
            },
            renderPlace: ["dropSearch_HeDaoTao"],
            title: "Chọn hệ đào tạo"
        };
        edu.system.loadToCombo_data(obj);
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> khoa dao tao
    --Author: duyentt
	-------------------------------------------*/
    getList_KhoaDaoTao: function () {
        var me = this;

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genCombo_KhoaDaoTao(dtResult);
                }
                else {
                    edu.system.alert("KHCT_KhoaDaoTao/LayDanhSach: " + data.Message, "w");
                }
                
            },
            error: function (er) {
                edu.system.alert("KHCT_KhoaDaoTao/LayDanhSach (ex): " + JSON.stringify(er), "w");
                
            },
            type: 'GET',
            action: 'KHCT_KhoaDaoTao/LayDanhSach',
            
            contentType: true,
            
            data: {
                'strTuKhoa': "",
                'strDaoTao_HeDaoTao_Id': edu.util.getValById("dropSearch_HeDaoTao"),
                'strDaoTao_CoSoDaoTao_Id': "",
                'strNguoiThucHien_Id': "",
                'pageIndex': 1,
                'pageSize': 1000000
            },
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_KhoaDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKHOA",
                code: "MAKHOA",
                order: "unorder"
            },
            renderPlace: ["dropSearch_KhoaHoc"],
            title: "Chọn khóa đào tạo"
        };
        edu.system.loadToCombo_data(obj);
    },
    viewEdit_ThamSoAD_ChuongTrinh: function (data) {
        var me = this;
        edu.util.viewHTMLById("lblThamSoApDungChuongTrinh", data.TENCHUONGTRINH);
    },


    getList_KeThua: function () {
        var me = this;
        var obj_save = {
            'action': 'D_ThongTin2_MH/DSA4BRIKJBUpNCACNC8mAhUFFQPP',
            'func': 'PKG_DIEM_THONGTIN2.LayDSKeThuaCungCTDT',
            'iM': edu.system.iM,
            'strPhamViApDung_Id': me.strHocPhan_Id + me.strChuongTrinh_Id,
            'strDaoTao_HeDaoTao_Id': edu.system.getValById('dropHeDaoTao_KT'),
            'strDaoTao_KhoaDaoTao_Id': edu.system.getValById('dropKhoaDaoTao_KT'),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var data = data.Data;
                    me["dtKeThua"] = data;
                    me.genTable_KeThua(data);
                }
                else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) { edu.system.alert(" (er): " + JSON.stringify(er), "w"); },
            type: "POST",
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTable_KeThua: function (data, iPager) {
        var me = this;

        var jsonForm = {
            strTable_Id: "tblKeThua",
            //bPaginate: {
            //    strFuntionName: "main_doc.LopHocPhan.getList_LopHocPhan()",
            //    iDataRow: iPager
            //},
            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "DAOTAO_KHOADAOTAO_TEN"
                },
                {
                    "mDataProp": "CHUONGTRINH"
                },
                {
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.DAOTAO_HOCPHAN_TEN) + " - " + edu.util.returnEmpty(aData.DAOTAO_HOCPHAN_MA);
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<select id="dropThoiGian_' + aData.ID + '" class="select-opt"></select>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        data.forEach(e => {
            var obj = {
                data: me.dtThoiGianDaoTao,
                renderInfor: {
                    id: "ID",
                    parentId: "",
                    name: "DAOTAO_THOIGIANDAOTAO",
                    code: "",
                    avatar: "",
                    default_val: e.DAOTAO_THOIGIANDAOTAO_ID 
                },
                renderPlace: ["dropThoiGian_" + e.ID],
                type: "",
                title: "Chọn thời gian",
            }
            edu.system.loadToCombo_data(obj);
        })
    },

    save_KeThua: function (strId) {
        var me = this;
        var obj_notify = {};
        let aData = me.dtKeThua.find(e => e.ID == strId);
        //--Edit
        var obj_save = {
            'action': 'D_ThongTin2_MH/CiQVKTQgBSgkLB4QNDgFLigVKSAvJgUoJCweAAUP',
            'func': 'PKG_DIEM_THONGTIN2.KeThuaDiem_QuyDoiThangDiem_AD',
            'iM': edu.system.iM,
            'strParamViApDungKeThua_Id': me.strHocPhan_Id + me.strChuongTrinh_Id,
            'strDaoTao_ChuongTrinh_Id': aData.DAOTAO_TOCHUCCHUONGTRINH_ID,
            'strDaoTao_HocPhan_Id': aData.DAOTAO_HOCPHAN_ID,
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropThoiGian_' + strId),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thực hiện thành công");
                }
                else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,
            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    //me.getList_NhapDiem();
                });
            },
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
}