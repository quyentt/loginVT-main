/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function TongHopDiem() { };
TongHopDiem.prototype = {
    strTongHopDiem_Id: '',
    dtTongHopDiem: [],
    strPhamViMa: '',
    dtThieuDRL: [],
    isLoading_ThieuDRL: false,

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        
        me.getList_HeDaoTao();
        me.getList_KhoaDaoTao();
        me.getList_NamNhapHoc();
        me.getList_ThoiGianDaoTao();
        //me.getList_TongHopDiem();
        me.getList_TrangThaiSV();
        edu.util.viewValById("dropSearch_ChuongTrinhDaoTao", "");
        edu.util.viewValById("dropSearch_LopQuanLy", "");

        edu.system.loadToCombo_DanhMucDuLieu("DIEM.PHAMVITONGHOPDIEM", "", "", me.loadToCombo_PhamVi);
        edu.system.loadToCombo_DanhMucDuLieu("DRL.DOITUONGAPDUNG", "dropSearch_DoiTuong");
        $("#btnSave_XepLoai").click(function () {
            
            edu.system.confirm("Bạn có chắc chắn muốn thực hiện không?");
            $("#btnYes").click(function (e) {
                me.save_TongHopDiem();
            });
        });

        $("#btnSearch").click(function () {
            me.getList_TongHopDiem();
        });

        $("#btnThongKe_ThieuDRL").click(function (e) {
            e.preventDefault();
            if (me.isLoading_ThieuDRL === true) return;
            me.getList_TongHopThieuDRL();
        });
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_TieuChiXepLoai();
            }
        });

        $("#dropSearch_HeDaoTao").on("select2:select", function () {
            me.getList_KhoaDaoTao();
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $("#dropSearch_KhoaDaoTao").on("select2:select", function () {
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $("#dropSearch_ChuongTrinhDaoTao").on("select2:select", function () {
            me.getList_LopQuanLy();
        });
        $("#dropSearch_NamHoc").on("select2:select", function () {
            me.getList_ThoiGianDaoTao();
        });

        //$("#dropSearch_PhanViTongHop").on("select2:select", function () {
        //    var strMa = $("#dropSearch_PhanViTongHop option:selected").attr("id");
        //    me.strPhamViMa = strMa;
        //});

        edu.system.getList_MauImport("zonebtnBaoCao_TongHopDiem", function (addKeyValue) {
            var strDaoTao_ThoiGianDaoTao_Id = "";
            
            (edu.util.getValCombo('dropSearch_ThoiGianDaoTao') === "") ? strDaoTao_ThoiGianDaoTao_Id = edu.util.getValById('dropSearch_NamHoc'): strDaoTao_ThoiGianDaoTao_Id = edu.util.getValById('dropSearch_ThoiGianDaoTao');
            addKeyValue("strChucNang_Id", edu.system.strChucNang_Id);
            addKeyValue("strDaoTao_ThoiGianDaoTao_Id", strDaoTao_ThoiGianDaoTao_Id);
            addKeyValue("strDaoTao_NamApDung", edu.util.getValCombo('dropSearch_NamHoc'));
            addKeyValue("strDoiTuongApDung_Id", edu.util.getValCombo('dropSearch_DoiTuong'));
            addKeyValue("strDaoTao_LopQuanLy_Id", edu.util.getValCombo('dropSearch_LopQuanLy'));
            addKeyValue("strDaoTao_ChuongTrinh_Id", edu.util.getValCombo('dropSearch_ChuongTrinhDaoTao'));
            addKeyValue("strQLSV_TrangThaiNguoiHoc_Id", edu.util.getValCombo('dropSearch_TrangThai'));
            addKeyValue("strDaoTao_KhoaDaoTao_Id", edu.util.getValCombo('dropSearch_KhoaDaoTao'));
            addKeyValue("strDaoTao_HeDaoTao_Id", edu.util.getValCombo('dropSearch_HeDaoTao'));
        });
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_TongHopDiem: function (point) {
        var me = this;
        var strDaoTao_ThoiGianDaoTao_Id = edu.util.checkValue(edu.util.getValById("dropSearch_ThoiGianDaoTao")) ? edu.util.getValById('dropSearch_ThoiGianDaoTao') : edu.util.getValById('dropSearch_NamHoc');
        //--Edit
        var obj_save = {
            'action': 'RL_XuLy/TongHopDRLTheoKyNamToanKhoa',

            'strId': $(point).attr("name"),
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDaoTao_ThoiGianDaoTao_Id': strDaoTao_ThoiGianDaoTao_Id,
            'strDoiTuongApDung_Id': edu.util.getValCombo('dropSearch_DoiTuong'),
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo('dropSearch_LopQuanLy'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValCombo('dropSearch_KhoaDaoTao'),
            'strDaoTao_ChuongTrinh_Id': edu.util.getValCombo('dropSearch_ChuongTrinhDaoTao'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
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
                edu.system.alertOnModal(obj_save.action + " (er): " + er);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_TongHopDiem: function (strDanhSach_Id) {
        var me = this;
        var strDaoTao_ThoiGianDaoTao_Id = edu.util.checkValue(edu.util.getValById("dropSearch_ThoiGianDaoTao")) ? edu.util.getValById('dropSearch_ThoiGianDaoTao') : edu.util.getValById('dropSearch_NamHoc');
        //--Edit
        //var obj_list = {
        //    'action': 'RL_ThongTinChung/LayDSTongHopDRLTheoLop',
        //    'strChucNang_Id': edu.system.strChucNang_Id,
        //    'strDaoTao_ThoiGianDaoTao_Id': strDaoTao_ThoiGianDaoTao_Id,
        //    'strQLSV_TrangThaiNguoiHoc_Id': edu.util.getValById('dropSearch_TrangThai'),
        //    'strDoiTuongApDung_Id': edu.util.getValById('dropSearch_DoiTuong'),
        //    'strDaoTao_LopQuanLy_Id': edu.util.getValCombo('dropSearch_LopQuanLy'),
        //    'strNguoiThucHien_Id': edu.system.userId,
        //};
        var obj_save = {
            'action': 'XLHV_RL_ThongTin_MH/DSA4BRIVLi8mCS4xBRMNFSkkLg0uMQPP',
            'func': 'pkg_diemrenluyen_thongtin.LayDSTongHopDRLTheoLop',
            'iM': edu.system.iM,
            'strDaoTao_HeDaoTao_Id': edu.system.getValById('dropSearch_HeDaoTao'),
            'strDaoTao_KhoaDaoTao_Id': edu.system.getValById('dropSearch_KhoaDaoTao'),
            'strDaoTao_ChuongTrinh_Id': edu.system.getValById('dropSearch_ChuongTrinhDaoTao'),
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDaoTao_ThoiGianDaoTao_Id': strDaoTao_ThoiGianDaoTao_Id,
            'strQLSV_TrangThaiNguoiHoc_Id': edu.util.getValById('dropSearch_TrangThai'),
            'strDoiTuongApDung_Id': edu.util.getValById('dropSearch_DoiTuong'),
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo('dropSearch_LopQuanLy'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtTongHopDiem = dtReRult;
                    me.genTable_TongHopDiem(dtReRult.rsChiTiet, data.Pager);
                    me.genTable_ThongKe(dtReRult.rsThongKe, data.Pager);
                }
                else {
                    edu.system.alert(data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    getList_TieuChiXepLoai: function () {
        var me = this;
        me.getList_TongHopDiem();
    },

    getList_TongHopThieuDRL: function () {
        var me = this;
        var strNamHoc = edu.util.getValById('dropSearch_NamHoc');
        var strThoiGianDaoTao = edu.util.getValById('dropSearch_ThoiGianDaoTao');
        if (!edu.util.checkValue(strNamHoc) && !edu.util.checkValue(strThoiGianDaoTao)) {
            edu.system.alert("Vui lòng chọn năm học hoặc thời gian đào tạo", "w");
            return;
        }

        // Tránh query quá rộng gây timeout: yêu cầu chọn thêm ít nhất 1 điều kiện lọc
        var strHeDaoTao = edu.util.getValCombo('dropSearch_HeDaoTao') || edu.system.getValById('dropSearch_HeDaoTao');
        var strKhoaDaoTao = edu.util.getValCombo('dropSearch_KhoaDaoTao') || edu.system.getValById('dropSearch_KhoaDaoTao');
        var strChuongTrinh = edu.util.getValCombo('dropSearch_ChuongTrinhDaoTao') || edu.system.getValById('dropSearch_ChuongTrinhDaoTao');
        var strLopQuanLy = edu.util.getValCombo('dropSearch_LopQuanLy');
        if (!edu.util.checkValue(strHeDaoTao) && !edu.util.checkValue(strKhoaDaoTao) && !edu.util.checkValue(strChuongTrinh) && !edu.util.checkValue(strLopQuanLy)) {
            edu.system.alert("Vui lòng chọn ít nhất 1 điều kiện lọc (Hệ đào tạo/Khóa đào tạo/Chương trình/Lớp quản lý)", "w");
            return;
        }

        var strDaoTao_ThoiGianDaoTao_Id = edu.util.checkValue(strThoiGianDaoTao) ? strThoiGianDaoTao : strNamHoc;

        var obj_save = {
            'action': 'XLHV_RL_ThongTin_MH/DSA4BRIVLi8mCS4xFSkoJDQFEw0P',
            'func': 'pkg_diemrenluyen_thongtin.LayDSTongHopThieuDRL',
            'iM': edu.system.iM,
            'strQLSV_TrangThaiNguoiHoc_Id': edu.util.getValById('dropSearch_TrangThai'),
            'strDaoTao_ThoiGianDaoTao_Id': strDaoTao_ThoiGianDaoTao_Id,
            'strDaoTao_HeDaoTao_Id': strHeDaoTao,
            'strDaoTao_KhoaDaoTao_Id': strKhoaDaoTao,
            'strDaoTao_ChuongTrinh_Id': strChuongTrinh,
            'strDaoTao_LopQuanLy_Id': strLopQuanLy,
            'strDoiTuongApDung_Id': edu.util.getValById('dropSearch_DoiTuong'),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        var t0 = new Date().getTime();
        try {
            console.log("[TongHopDiem][ThieuDRL] request", obj_save);
        } catch (e) { }

        me.isLoading_ThieuDRL = true;
        $("#btnThongKe_ThieuDRL").addClass("disabled");

        edu.system.makeRequest({
            success: function (data) {
                try {
                    console.log("[TongHopDiem][ThieuDRL] response", data, "elapsed(ms)=", (new Date().getTime() - t0));
                } catch (e) { }
                if (data.Success) {
                    var dtReRult = data.Data;
                    var rows = (dtReRult && dtReRult.rsChiTiet) ? dtReRult.rsChiTiet : dtReRult;
                    me.dtThieuDRL = rows || [];
                    $("#zone_thongke_thieudrl").show();
                    edu.system.pageIndex_default = 1;
                    me.renderTable_ThieuDRL_Paged();
                }
                else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) {
                try {
                    console.log("[TongHopDiem][ThieuDRL] error", er, "elapsed(ms)=", (new Date().getTime() - t0));
                } catch (e) { }
                if (er && er.statusText === "timeout") {
                    edu.system.alert("Timeout khi thống kê (60s). Vui lòng chọn thêm điều kiện lọc (ưu tiên Lớp quản lý) rồi thử lại.", "w");
                }
                else {
                    edu.system.alert(JSON.stringify(er), "w");
                }
            },
            complete: function () {
                me.isLoading_ThieuDRL = false;
                $("#btnThongKe_ThieuDRL").removeClass("disabled");
            },
            type: 'POST',
            action: obj_save.action,
            timeout: 60000,
            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    renderTable_ThieuDRL_Paged: function () {
        var me = this;
        var allRows = me.dtThieuDRL || [];
        var totalRows = allRows.length;
        var pageIndex = edu.system.pageIndex_default || 1;
        var pageSize = edu.system.pageSize_default || 10;
        if (pageSize == -1) pageSize = 1000000;
        var start = (pageIndex - 1) * pageSize;
        if (start < 0) start = 0;
        if (start > totalRows) start = 0;
        var end = start + pageSize;
        if (end > totalRows) end = totalRows;
        var pageRows = allRows.slice(start, end);
        me.genTable_ThieuDRL(pageRows, totalRows);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genTable_TongHopDiem: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblTieuChi",
            aaData: data,
            aoColumns: [
                {
                    "mDataProp": "DAOTAO_HEDAOTAO_TEN"
                },
                {
                    "mDataProp": "DAOTAO_KHOADAOTAO_TEN"
                },
                {
                    "mDataProp": "DAOTAO_KHOAQUANLY_TEN",
                },
                {
                    "mDataProp": "DAOTAO_TOCHUCCHUONGTRINH_TEN"
                },
                {
                    "mDataProp": "DAOTAO_LOPQUANLY_TEN"
                },
                {
                    "mDataProp": "MASO"
                },
                {
                    "mData": "Daotao_Lopquanly_Ten",
                    "mRender": function (nrow, aData) {
                        return edu.util.returnEmpty(aData.HODEM) + " " + edu.util.returnEmpty(aData.TEN);
                    }
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_NGAYSINH"
                },
                {
                    "mDataProp": "GIOITINH_TEN"
                },
                {
                    "mDataProp": "XEPLOAI_TEN"
                },
                {
                    "mDataProp": "DIEM"
                },
                {
                    "mDataProp": "DIEMQUYDOI"
                },
                {
                    "mDataProp": "GHICHU"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    genTable_ThongKe: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblThongKe",
            aaData: data,
            aoColumns: [
                {
                    "mDataProp": "TEN"
                },
                {
                    "mDataProp": "SOLUONG"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        edu.system.insertSumAfterTable(jsonForm.strTable_Id, [2]);
    },

    genTable_ThieuDRL: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblThieuDRL",
            bPaginate: {
                strFuntionName: "main_doc.TongHopDiem.renderTable_ThieuDRL_Paged()",
                iDataRow: iPager,
            },
            aaData: data,
            aoColumns: [
                {
                    "mDataProp": "MASO"
                },
                {
                    "mData": "HoTen",
                    "mRender": function (nrow, aData) {
                        return edu.util.returnEmpty(aData.HODEM) + " " + edu.util.returnEmpty(aData.TEN);
                    }
                },
                {
                    "mDataProp": "TRANGTHAI_TEN"
                },
                {
                    "mDataProp": "TENLOP"
                },
                {
                    "mData": "ChuongTrinh",
                    "mRender": function (nrow, aData) {
                        return edu.util.returnEmpty(aData.TENCHUONGTRINH) + " - " + edu.util.returnEmpty(aData.MACHUONGTRINH);
                    }
                },
                {
                    "mDataProp": "TENKHOA"
                },
                {
                    "mDataProp": "TENKHOAQUANLY"
                },
                {
                    "mDataProp": "TENHEDAOTAO"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
    /*------------------------------------------
	--Discription: [2] ACCESS DB ==> Systemroot HeDaoTao/KhoaDaoTao/ChuongTrinhDaoTao
    --Author:
	-------------------------------------------*/
    getList_HeDaoTao: function () {
        var me = this;
        var obj_HeDT = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000
        };
        edu.system.getList_HeDaoTao(obj_HeDT, "", "", me.cbGenCombo_HeDaoTao);
    },
    getList_KhoaDaoTao: function (strHeDaoTao_Id) {
        var me = this;
        var obj_KhoaDT = {
            strHeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao"),
            strCoSoDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 10000
        };
        edu.system.getList_KhoaDaoTao(obj_KhoaDT, "", "", me.cbGenCombo_KhoaDaoTao);
    },
    getList_ThoiGianDaoTao: function () {
        var me = this;
        var obj = {
            strNam_Id: edu.util.getValCombo("dropSearch_NamHoc"),
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 100000,
        };

        // Chỉ lấy danh sách Kỳ theo Năm đã chọn
        var obj_save = {
            'action': 'KHCT_ThongTin_MH/DSA4BRIFIC4VIC4eFSkuKAYoIC8FIC4VIC4P',
            'func': 'pkg_kehoach_thongtin.LayDSDaoTao_ThoiGianDaoTao_Ky',
            'iM': edu.system.iM,
            'strDAOTAO_Nam_Id': edu.util.returnEmpty(obj.strNam_Id),
            'strNguoiThucHien_Id': edu.util.returnEmpty(obj.strNguoiThucHien_Id),
            'strTuKhoa': edu.util.returnEmpty(obj.strTuKhoa),
            'pageIndex': edu.util.returnZero(obj.pageIndex),
            'pageSize': edu.util.returnZero(obj.pageSize)
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.loadToCombo_ThoiGianDaoTao(edu.util.checkValue(data.Data) ? data.Data : []);
                }
                else {
                    edu.system.alert(data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_save.func + " (er): " + JSON.stringify(er), "w");
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);

    },
    getList_ChuongTrinhDaoTao: function () {
        var me = this;
        var obj = {
            strKhoaDaoTao_Id: edu.util.getValCombo("dropSearch_KhoaDaoTao"),
            strN_CN_LOP_Id: "",
            strKhoaQuanLy_Id: edu.util.getValCombo("dropKhoaQuanLy"),
            strToChucCT_Cha_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 10000,
        };
        edu.system.getList_ChuongTrinhDaoTao(obj, me.loadToCombo_ChuongTrinhDaoTao);
    },
    getList_LopQuanLy: function () {
        var me = this;
        var obj = {
            strCoSoDaoTao_Id: "",
            strDaoTao_HeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao"),
            strKhoaDaoTao_Id: edu.util.getValCombo("dropSearch_KhoaDaoTao"),
            strNganh_Id: edu.util.getValCombo("dropKhoaQuanLy"),
            strLoaiLop_Id: "",
            strToChucCT_Id: edu.util.getValCombo("dropSearch_ChuongTrinhDaoTao"),
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 100000,
        };
        edu.system.getList_LopQuanLy(obj, "", "", me.loadToCombo_LopQuanLy);

    },
    getList_NamNhapHoc: function () {
        var me = this;
        var obj_list = {
            'action': 'CM_ThoiGianDaoTao/LayDSDAOTAO_NamHoc',
            'strNguoiThucHien_Id': '',
            'strTuKhoa': '',
            'pageIndex': 1,
            'pageSize': 10000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.loadToCombo_NamNhapHoc(dtReRult);
                }
                else {
                    edu.system.alert(data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_KhoaQuanLy: function () {
        var me = this;
        edu.system.getList_KhoaQuanLy(null, "", "", me.loadToCombo_KhoaQuanLy)
    },
    getList_TrangThaiSV: function () {
        var me = this;
        var obj_list = {
            'action': 'CM_DanhMucDuLieu/LayDanhSach',
            'versionAPI': 'v1.0',
            'strMaBangDanhMuc': 'QLSV.TRANGTHAI',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.cbGenBo_TrangThai(data.Data);
                }
                else {
                    console.log(data.Message);
                }
            },
            error: function (er) { },
            type: "GET",
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
	--Discription: [2] GEN HTML ==> HeDaoTao/KhoaDaoTao/ChuongTrinhDaoTao
	--ULR:  
	-------------------------------------------*/
    cbGenCombo_HeDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENHEDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_HeDaoTao", "dropHeDaoTao"],
            type: "",
            title: "Chọn hệ đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_KhoaDaoTao: function (data) {
        var me = this

        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKHOA",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_KhoaDaoTao"],
            type: "",
            title: "Chọn khóa đào tạo",
        };
        edu.system.loadToCombo_data(obj);
        edu.util.viewValById("dropSearch_KhoaDaoTao", "");
    },
    loadToCombo_ChuongTrinhDaoTao: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENCHUONGTRINH",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ChuongTrinhDaoTao"],
            type: "",
            title: "Chọn chương trình đào tạo",
        }
        edu.system.loadToCombo_data(obj);
        edu.util.viewValById("dropSearch_ChuongTrinhDaoTao", "");
    },
    loadToCombo_ThoiGianDaoTao: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ThoiGianDaoTao", "dropThoiGianDaoTao"],
            type: "",
            title: "Chọn thời gian đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_LopQuanLy: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_LopQuanLy"],
            type: "",
            title: "Chọn lớp quản lý",
        }
        edu.system.loadToCombo_data(obj);
        edu.util.viewValById("dropSearch_LopQuanLy", "");
    },
    cbGenBo_TrangThai: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_TrangThai"]
        }
        edu.system.loadToCombo_data(obj);
        //$('#dropTinhTrangSinhVien option').prop('selected', true);
    },
    loadToCombo_PhamVi: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                avatar: "MA"
            },
            renderPlace: ["dropSearch_PhanViTongHop"],
            type: "",
            title: "Chọn phạm vi",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_NamNhapHoc: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "NAMHOC",
                code: "NAMHOC",
                avatar: "NAMNHAPHOC"
            },
            renderPlace: ["dropSearch_NamHoc", "dropNamHoc"],
            type: "",
            title: "Chọn năm",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_KhoaQuanLy: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
            },
            renderPlace: ["dropKhoaQuanLy"],
            type: "",
            title: "Chọn khoa quản lý",
        }
        edu.system.loadToCombo_data(obj);
    },
}