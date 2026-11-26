/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function HeSoQuyMo() { };
HeSoQuyMo.prototype = {
    strHeSoQuyMo_Id: '',
    dtHeSoQuyMo: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        
        me.getList_HeSoQuyMo();
        me.getList_ThoiGianDaoTao();
        me.initKhaiBaoNhieu();
        edu.system.loadToCombo_DanhMucDuLieu("KLGD.LOAIBANG", "dropSearch_PhanLoai");
        edu.system.loadToCombo_DanhMucDuLieu("KLGD.PHANLOAIXACNHAN", "dropPhamViApDung");
        $("#tblHeSoQuyMo").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtHeSoQuyMo.find(e => e.ID == strId);
            me["strHeSoQuyMo_Id"] = data.ID;
            edu.util.viewValById("dropPhanLoai", data.LOAIBANG_ID);
            edu.util.viewValById("dropPhamVi", data.PHAMVIAPDUNG_ID);
            //edu.util.viewValById("lblPhamVi", data.PHAMVIAPDUNG_ID);
            edu.util.viewValById("dropThoiGian", data.THOIGIAN_ID);
            edu.util.viewValById("txtSoBatDau", data.SOBATDAU);
            edu.util.viewValById("txtSoKetThuc", data.SOKETTHUC);
            edu.util.viewValById("txtHeSo", data.HESO);
            $("#myModal_HeSoQuyMo").modal("show");
            $("#lblPhamVi").html(data.PHAMVIAPDUNG_TEN)
        });
        $("#btnAdd_HeSoQuyMo").click(function () {
            var data = {};
            me["strHeSoQuyMo_Id"] = data.ID;
            edu.util.viewValById("dropPhanLoai", data.LOAIBANG_ID);
            edu.util.viewValById("dropPhamVi", data.PHAMVIAPDUNG_ID);
            edu.util.viewValById("dropThoiGian", data.THOIGIAN_ID);
            edu.util.viewValById("txtSoBatDau", data.SOBATDAU);
            edu.util.viewValById("txtSoKetThuc", data.SOKETTHUC);
            edu.util.viewValById("txtHeSo", data.HESO);
            $("#myModal_HeSoQuyMo").modal("show");
        });
        $("#btnSave_HeSoQuyMo").click(function () {
            me.save_HeSoQuyMo();
        });
        $("#btnDelete_HeSoQuyMo").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblHeSoQuyMo", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng cần xóa?");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
                for (var i = 0; i < arrChecked_Id.length; i++) {
                    me.delete_HeSoQuyMo(arrChecked_Id[i]);
                }
            });
        });

        $("#btnSearch").click(function () {
            me.getList_HeSoQuyMo();
        });
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_HeSoQuyMo();
            }
        });
        $('#dropPhamViApDung').on('select2:select', function () {
            me.getList_LoaiApDung("dropPhamViApDung", "dropLoaiApDung");
        });
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> thoi gian dao tao
    --Author: duyentt
	-------------------------------------------*/
    getList_ThoiGianDaoTao: function () {
        var me = this;
        var objList = {
            strNam_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 100000,
        };
        edu.system.getList_ThoiGianDaoTao(objList, "", "", me.cbGenCombo_ThoiGianDaoTao);
    },
    cbGenCombo_ThoiGianDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropThoiGian", "dropSearch_ThoiGian", "dropCTDT_ThoiGian", "dropLHP_ThoiGian"],
            type: "",
            title: "Chọn thời gian",
        }
        edu.system.loadToCombo_data(obj);
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_HeSoQuyMo: function () {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/FSkkLB4KDQYFHgkkEi4eEDQ4DC4SLg00Li8m',
            'func': 'PKG_KLGV_V2_THONGTIN.Them_KLGD_HeSo_QuyMoSoLuong',
            'iM': edu.system.iM,
            'strId': me.strHeSoQuyMo_Id,
            'strPhamViApDung_Id': edu.system.getValById('dropLoaiApDung'),
            'dHeSo': edu.system.getValById('txtHeSo'),
            'dSoBatDau': edu.system.getValById('txtSoBatDau'),
            'dSoKetThuc': edu.system.getValById('txtSoKetThuc'),
            'strLoaiBang_Id': edu.system.getValById('dropPhamViApDung'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropThoiGian'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_KLGD_ThongTin_MH/EjQgHgoNBgUeCSQSLh4QNDgMLhIuDTQuLyYP';
            obj_save.func = 'PKG_KLGV_V2_THONGTIN.Sua_KLGD_HeSo_QuyMoSoLuong'
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
                    me.getList_HeSoQuyMo();
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
    getList_HeSoQuyMo: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/DSA4BRIKDQYFHgkkEi4eEDQ4DC4SLg00Li8m',
            'func': 'PKG_KLGV_V2_THONGTIN.LayDSKLGD_HeSo_QuyMoSoLuong',
            'iM': edu.system.iM,
            'strLoaiBang_Id': edu.system.getValById('dropSearch_PhanLoai'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropSearch_ThoiGian'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtHeSoQuyMo = dtReRult;
                    me.genTable_HeSoQuyMo(dtReRult, data.Pager);
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
    delete_HeSoQuyMo: function (Ids) {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/GS4gHgoNBgUeCSQSLh4QNDgMLhIuDTQuLyYP',
            'func': 'PKG_KLGV_V2_THONGTIN.Xoa_KLGD_HeSo_QuyMoSoLuong',
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
                    content:  JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_save.action,

            complete: function () {
                edu.system.start_Progress("zoneprocessXXXX", function () {
                    me.getList_HeSoQuyMo();
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
    genTable_HeSoQuyMo: function (data, iPager) {
        $("#lblHeSoQuyMo_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblHeSoQuyMo",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.HeSoQuyMo.getList_HeSoQuyMo()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "LOAIBANG_TEN"
                },
                {
                    "mDataProp": "PHAMVIAPDUNG_TEN"
                },
                {
                    "mDataProp": "SOBATDAU"
                },
                {
                    "mDataProp": "SOKETTHUC"
                },
                {
                    "mDataProp": "HESO"
                },
                {
                    "mDataProp": "THOIGIAN"
                },
                {
                    "mDataProp": "NGAYTAO_DD_MM_YYYY_HHMMSS"
                },
                {
                    "mDataProp": "NGUOITAO_TAIKHOAN"
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
    --Discription: 2026-11-26 Them khai bao he so theo tung CTDT / tung lop hoc phan
    --  (MoTaChucNangChinh_KLGD_NEW.xlsx, tab "Sua them khai bao he so theo SS")
    --  CTDT: pham vi moi = Id CTDT + Id hinh thuc (Loai) -> 64 ky tu, giong kieu ghep
    --        hoc phan/he dao tao + hanh dong ma pkg_klgv_v2_chung.LayTenPhamViApDung doc.
    --  LHP : pham vi = Id lop hoc phan (tkb_lopmonhoc).
    --  Ca hai deu goi PKG_KLGV_V2_THONGTIN.Them_KLGD_HeSo_QuyMoSoLuong cho tung pham vi.
    -------------------------------------------*/
    objLHPChon: {},
    dtLHP: [],

    initKhaiBaoNhieu: function () {
        var me = this;
        edu.system.loadToCombo_DanhMucDuLieu("KLGD.PHANLOAIXACNHAN", "dropCTDT_PhamVi");
        me.getList_KB_HeDaoTao();

        $("#btnAdd_HeSoQuyMo_CTDT").click(function (e) {
            e.preventDefault();
            $("#dropCTDT_ThoiGian").val(edu.util.getValById("dropSearch_ThoiGian")).trigger("change");
            $("#txtCTDT_SoBatDau, #txtCTDT_SoKetThuc, #txtCTDT_HeSo").val("");
            me.getList_KB_KhoaDaoTao("CTDT");
            me.getList_KB_ChuongTrinh("CTDT");
            $("#myModal_HeSoCTDT").modal("show");
        });
        $("#btnAdd_HeSoQuyMo_LHP").click(function (e) {
            e.preventDefault();
            $("#dropLHP_ThoiGian").val(edu.util.getValById("dropSearch_ThoiGian")).trigger("change");
            $("#txtLHP_SoBatDau, #txtLHP_SoKetThuc, #txtLHP_HeSo, #txtLHP_TuKhoa").val("");
            me.objLHPChon = {};
            me.capNhatSoChon_LHP();
            me.getList_KB_KhoaDaoTao("LHP");
            me.getList_KB_ChuongTrinh("LHP");
            if (edu.util.getValById("dropLHP_ThoiGian")) me.getList_KB_LopHocPhan(1);
            $("#myModal_HeSoLHP").modal("show");
        });

        ["CTDT", "LHP"].forEach(function (p) {
            $("#drop" + p + "_ThoiGian, #drop" + p + "_HeDaoTao").on("select2:select", function () {
                me.getList_KB_KhoaDaoTao(p);
                me.getList_KB_ChuongTrinh(p);
            });
            $("#drop" + p + "_KhoaDaoTao").on("select2:select", function () {
                me.getList_KB_ChuongTrinh(p);
            });
        });
        $("#dropCTDT_ThoiGian, #dropCTDT_HeDaoTao").on("select2:select", function () {
            $("#dropCTDT_ChuongTrinh").val(null).trigger("change");
        });
        $("#dropCTDT_ChuongTrinh").on("change", function () {
            $("#lblCTDT_SoChon").html(me.getMulti("dropCTDT_ChuongTrinh").length);
        });
        $("#btnCTDT_ChonTatCa").click(function (e) {
            e.preventDefault();
            var arr = $("#dropCTDT_ChuongTrinh option").map(function () { return this.value; }).get().filter(function (x) { return x; });
            $("#dropCTDT_ChuongTrinh").val(arr).trigger("change");
        });
        $("#btnCTDT_BoChon").click(function (e) {
            e.preventDefault();
            $("#dropCTDT_ChuongTrinh").val(null).trigger("change");
        });
        $("#dropCTDT_PhamVi").on("select2:select", function () {
            me.getList_LoaiApDung("dropCTDT_PhamVi", "dropCTDT_LoaiApDung");
        });
        $("#btnSave_HeSoCTDT").click(function () {
            me.save_HeSoCTDT();
        });

        $("#dropLHP_ThoiGian, #dropLHP_HeDaoTao, #dropLHP_KhoaDaoTao, #dropLHP_ChuongTrinh").on("select2:select", function () {
            me.getList_KB_LopHocPhan(1);
        });
        $("#btnLHP_Search").click(function () {
            me.getList_KB_LopHocPhan(1);
        });
        $("#txtLHP_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_KB_LopHocPhan(1);
            }
        });
        $("#tblHeSoLHP").delegate(".chkLHP", "change", function () {
            var strId = this.getAttribute("data-id");
            var aData = me.dtLHP.find(function (x) { return x.ID == strId; });
            if (this.checked && aData) me.objLHPChon[strId] = aData;
            else delete me.objLHPChon[strId];
            $(this).closest("tr").toggleClass("hsqm-row-picked", this.checked);
            me.capNhatSoChon_LHP();
        });
        $("#chkLHP_All").click(function () {
            var bChecked = this.checked;
            $("#tblHeSoLHP .chkLHP").each(function () {
                if (this.checked !== bChecked) {
                    this.checked = bChecked;
                    $(this).trigger("change");
                }
            });
        });
        $("#btnLHP_BoChon").click(function (e) {
            e.preventDefault();
            me.objLHPChon = {};
            $("#tblHeSoLHP .chkLHP, #chkLHP_All").prop("checked", false);
            $("#tblHeSoLHP tr").removeClass("hsqm-row-picked");
            me.capNhatSoChon_LHP();
        });
        $("#btnSave_HeSoLHP").click(function () {
            me.save_HeSoLHP();
        });
    },
    getMulti: function (strDrop_Id) {
        var v = $("#" + strDrop_Id).val();
        if (!v) return [];
        if (!Array.isArray(v)) v = [v];
        return v.filter(function (x) { return x; });
    },
    capNhatSoChon_LHP: function () {
        $("#lblLHP_SoChon").html(Object.keys(this.objLHPChon).length);
    },
    getList_KB_HeDaoTao: function () {
        var me = this;
        var objList = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        };
        edu.system.getList_HeDaoTao(objList, "", "", function (data) {
            me.genCombo_KB(data, ["dropCTDT_HeDaoTao", "dropLHP_HeDaoTao"], "TENHEDAOTAO", "Tất cả hệ đào tạo");
        });
    },
    getList_KB_KhoaDaoTao: function (p) {
        var me = this;
        var obj_list = {
            'action': 'DKH_PhanCong_LopHP/LayDSKhoaToChuc',
            'type': 'GET',
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('drop' + p + '_HeDaoTao'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('drop' + p + '_ThoiGian'),
        };
        me.callGet(obj_list, function (data) {
            me.genCombo_KB(data, ["drop" + p + "_KhoaDaoTao"], "TENKHOA", "Tất cả khóa đào tạo");
        });
    },
    getList_KB_ChuongTrinh: function (p) {
        var me = this;
        var obj_list = {
            'action': 'DKH_PhanCong_LopHP/LayDSChuongTrinhToChuc',
            'type': 'GET',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('drop' + p + '_ThoiGian'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValById('drop' + p + '_KhoaDaoTao'),
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('drop' + p + '_HeDaoTao'),
            'strDaoTao_KhoaQuanLy_Id': '',
        };
        me.callGet(obj_list, function (data) {
            var arrChon = me.getMulti("dropCTDT_ChuongTrinh");
            me.genCombo_KB(data, ["drop" + p + "_ChuongTrinh"], "TENCHUONGTRINH", p == "CTDT" ? "" : "Tất cả chương trình đào tạo");
            if (p == "CTDT") $("#dropCTDT_ChuongTrinh").val(arrChon).trigger("change");
        });
    },
    getList_KB_LopHocPhan: function (iPage) {
        var me = this;
        if (iPage) edu.system.pageIndex_default = iPage;
        if (!edu.util.getValById('dropLHP_ThoiGian')) {
            $("#tblHeSoLHP tbody").html('<tr><td colspan="4" class="td-center hsqm-empty">Chọn thời gian rồi bấm Tìm kiếm</td></tr>');
            return;
        }
        $("#tblHeSoLHP tbody").html('<tr><td colspan="4" class="td-center hsqm-empty"><i class="fa fa-spinner fa-spin"></i> Đang tải...</td></tr>');
        var obj_list = {
            'action': 'DKH_ThongTin/LayDSLopHocPhan',
            'strTuKhoa': edu.util.getValById('txtLHP_TuKhoa'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropLHP_ThoiGian'),
            'strDaoTao_HocPhan_Id': '',
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
            'strDangKy_KeHoachDangKy_Id': '',
            'dLocGanTheoCTDT': 0,
            'dChiLayCacLopChuaPhanCong': 0,
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValById('dropLHP_KhoaDaoTao'),
            'strDaoTao_ChuongTrinh_Id': edu.util.getValById('dropLHP_ChuongTrinh'),
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('dropLHP_HeDaoTao'),
            'strDaoTao_KhoaQuanLy_Id': '',
            'dSoDaDangTuSo': -1,
            'dSoDaDangDenSo': -1,
            'strDaoTao_CoSoDaoTao_Id': '',
        };
        me.callGet(obj_list, function (data, iPager) {
            me.dtLHP = data;
            me.genTable_KB_LopHocPhan(data, iPager);
        });
    },
    genTable_KB_LopHocPhan: function (data, iPager) {
        var me = this;
        $("#lblLHP_Tong").html(iPager || 0);
        $("#chkLHP_All").prop("checked", false);
        if (!data.length) {
            $("#tblHeSoLHP tbody").html('<tr><td colspan="4" class="td-center hsqm-empty">Không có lớp học phần phù hợp</td></tr>');
            return;
        }
        var jsonForm = {
            strTable_Id: "tblHeSoLHP",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.HeSoQuyMo.getList_KB_LopHocPhan()",
                iDataRow: iPager
            },
            colPos: {
                center: [0, 3],
            },
            aoColumns: [
                {
                    "mDataProp": "MALOP"
                },
                {
                    "mDataProp": "TENLOP"
                },
                {
                    "mRender": function (nRow, aData) {
                        var strChecked = me.objLHPChon[aData.ID] ? ' checked="checked"' : '';
                        return '<input type="checkbox" class="chkLHP" data-id="' + aData.ID + '"' + strChecked + '/>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        $("#tblHeSoLHP .chkLHP:checked").closest("tr").addClass("hsqm-row-picked");
    },
    genCombo_KB: function (data, arrPlace, strName, strTitle) {
        var obj = {
            data: data || [],
            renderInfor: {
                id: "ID",
                parentId: "",
                name: strName,
                code: "",
                avatar: ""
            },
            renderPlace: arrPlace,
            type: "",
            title: strTitle,
        };
        edu.system.loadToCombo_data(obj);
        if (!strTitle) arrPlace.forEach(function (x) { $("#" + x + " option[value='']").remove(); });
    },
    callGet: function (obj_list, fnSuccess) {
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    fnSuccess(edu.util.checkValue(data.Data) ? data.Data : [], data.Pager);
                }
                else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    /* Kiem tra so; tra ve chuoi loi hoac "" */
    kiemTraSo: function (arrInput) {
        for (var i = 0; i < arrInput.length; i++) {
            var x = arrInput[i];
            var v = $.trim($("#" + x.id).val());
            if (!v) {
                if (x.batBuoc) return "Vui lòng nhập " + x.ten;
                continue;
            }
            if (isNaN(Number(v.replace(",", ".")))) return x.ten + " phải là số";
        }
        return "";
    },
    laySo: function (strId) {
        var v = $.trim($("#" + strId).val());
        return v ? v.replace(",", ".") : "";
    },
    save_HeSoCTDT: function () {
        var me = this;
        var strThoiGian = edu.util.getValById("dropCTDT_ThoiGian");
        var arrCTDT = me.getMulti("dropCTDT_ChuongTrinh");
        var strPhamVi = edu.util.getValById("dropCTDT_PhamVi");
        var strLoai = edu.util.getValById("dropCTDT_LoaiApDung");
        if (!strThoiGian) { edu.system.alert("Vui lòng chọn thời gian"); return; }
        if (!arrCTDT.length) { edu.system.alert("Vui lòng chọn ít nhất một chương trình đào tạo"); return; }
        if (!strPhamVi) { edu.system.alert("Vui lòng chọn phạm vi"); return; }
        if (!strLoai) { edu.system.alert("Vui lòng chọn loại (hình thức)"); return; }
        var strLoi = me.kiemTraSo([
            { id: "txtCTDT_SoBatDau", ten: "số bắt đầu" },
            { id: "txtCTDT_SoKetThuc", ten: "số kết thúc" },
            { id: "txtCTDT_HeSo", ten: "hệ số", batBuoc: true }
        ]);
        if (strLoi) { edu.system.alert(strLoi); return; }
        var arrSave = arrCTDT.map(function (strCTDT) {
            return {
                strPhamViApDung_Id: strCTDT + strLoai,
                strTen: $("#dropCTDT_ChuongTrinh option[value='" + strCTDT + "']").text(),
                strLoaiBang_Id: strPhamVi,
                strDaoTao_ThoiGianDaoTao_Id: strThoiGian,
                dSoBatDau: me.laySo("txtCTDT_SoBatDau"),
                dSoKetThuc: me.laySo("txtCTDT_SoKetThuc"),
                dHeSo: me.laySo("txtCTDT_HeSo")
            };
        });
        me.them_NhieuHeSo(arrSave, "myModal_HeSoCTDT");
    },
    save_HeSoLHP: function () {
        var me = this;
        var strThoiGian = edu.util.getValById("dropLHP_ThoiGian");
        var arrLHP = Object.keys(me.objLHPChon);
        if (!strThoiGian) { edu.system.alert("Vui lòng chọn thời gian"); return; }
        if (!arrLHP.length) { edu.system.alert("Vui lòng chọn ít nhất một lớp học phần"); return; }
        var strLoi = me.kiemTraSo([
            { id: "txtLHP_SoBatDau", ten: "số bắt đầu" },
            { id: "txtLHP_SoKetThuc", ten: "số kết thúc" },
            { id: "txtLHP_HeSo", ten: "hệ số", batBuoc: true }
        ]);
        if (strLoi) { edu.system.alert(strLoi); return; }
        var arrSave = arrLHP.map(function (strLHP) {
            var aData = me.objLHPChon[strLHP];
            return {
                strPhamViApDung_Id: strLHP,
                strTen: edu.util.returnEmpty(aData.TENLOP) + " (" + edu.util.returnEmpty(aData.MALOP) + ")",
                strLoaiBang_Id: "",
                strDaoTao_ThoiGianDaoTao_Id: strThoiGian,
                dSoBatDau: me.laySo("txtLHP_SoBatDau"),
                dSoKetThuc: me.laySo("txtLHP_SoKetThuc"),
                dHeSo: me.laySo("txtLHP_HeSo")
            };
        });
        me.them_NhieuHeSo(arrSave, "myModal_HeSoLHP");
    },
    /* Goi Them_KLGD_HeSo_QuyMoSoLuong lan luot cho tung pham vi, xong thi bao tong ket */
    them_NhieuHeSo: function (arrSave, strModal_Id) {
        var me = this;
        var iOk = 0;
        var arrLoi = [];
        var $btn = $("#" + strModal_Id + " .btn-primary");
        $btn.addClass("disabled").attr("aria-disabled", "true");
        var next = function (i) {
            if (i >= arrSave.length) {
                $btn.removeClass("disabled").removeAttr("aria-disabled");
                var strMsg = "Đã thêm " + iOk + "/" + arrSave.length + " khai báo.";
                if (arrLoi.length) strMsg += "<br/>Không thêm được:<br/>" + arrLoi.slice(0, 20).join("<br/>") + (arrLoi.length > 20 ? "<br/>..." : "");
                edu.system.alert(strMsg, arrLoi.length ? "w" : "s");
                if (iOk) {
                    $("#" + strModal_Id).modal("hide");
                    me.getList_HeSoQuyMo();
                }
                return;
            }
            var x = arrSave[i];
            var obj_save = {
                'action': 'NS_KLGD_ThongTin_MH/FSkkLB4KDQYFHgkkEi4eEDQ4DC4SLg00Li8m',
                'func': 'PKG_KLGV_V2_THONGTIN.Them_KLGD_HeSo_QuyMoSoLuong',
                'iM': edu.system.iM,
                'strId': '',
                'strPhamViApDung_Id': x.strPhamViApDung_Id,
                'dHeSo': x.dHeSo,
                'dSoBatDau': x.dSoBatDau,
                'dSoKetThuc': x.dSoKetThuc,
                'strLoaiBang_Id': x.strLoaiBang_Id,
                'strDaoTao_ThoiGianDaoTao_Id': x.strDaoTao_ThoiGianDaoTao_Id,
                'strNguoiThucHien_Id': edu.system.userId,
            };
            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) iOk++;
                    else arrLoi.push(edu.util.returnEmpty(x.strTen) + ": " + edu.util.returnEmpty(data.Message));
                    next(i + 1);
                },
                error: function (er) {
                    arrLoi.push(edu.util.returnEmpty(x.strTen) + ": " + JSON.stringify(er));
                    next(i + 1);
                },
                type: "POST",
                action: obj_save.action,
                contentType: true,
                data: obj_save,
                fakedb: []
            }, false, false, false, null);
        };
        next(0);
    },

    /* strFrom: combo Pham vi (loai xac nhan), strTo: combo Loai nhan ket qua */
    getList_LoaiApDung: function (strFrom, strTo) {
        var me = this;
        strFrom = strFrom || 'dropPhamViApDung';
        strTo = strTo || 'dropLoaiApDung';
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_XacNhan_MH/DSA4BRINLiAoGSAiDykgLx4JIC8pBS4vJgPP',
            'func': 'pkg_klgv_v2_xacnhan.LayDSLoaiXacNhan_HanhDong',
            'iM': edu.system.iM,
            'strLoaiXacNhan_Id': edu.util.getValById(strFrom),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.cbGenCombo_LoaiApDung(dtReRult, strTo);
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
    cbGenCombo_LoaiApDung: function (data, strTo) {
        var me = this;
        strTo = strTo || "dropLoaiApDung";
        me.logMauCombo(strTo, data);
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                avatar: "",
                mRender: function (nRow, aData) {
                    return me.tenMa(aData);
                }
            },
            renderPlace: [strTo],
            type: "",
            title: "Chọn loại",
        }
        edu.system.loadToCombo_data(obj);
    },
    /* Combo hien "TEN - MA". Ma lay o MA, khong co thi HANHDONG_MA; khong co ma thi chi hien TEN */
    tenMa: function (aData) {
        var ten = edu.util.returnEmpty(aData.TEN);
        var ma = edu.util.returnEmpty(aData.MA || aData.HANHDONG_MA);
        return ma ? ten + " - " + ma : ten;
    },
    /* Ghi ban ghi dau cua combo ra console (F12) de doi chieu ten truong ma neu van khong thay ma */
    logMauCombo: function (strDrop_Id, data) {
        if (window.console && data && data.length) console.log("[hesoquymo] " + strDrop_Id + " - ban ghi dau:", data[0]);
    },
}