/*----------------------------------------------
--Author: duyentt
--Phone: 
--Date of created: 22/04/2019
--Input: 
--Output:
--API URL: DangKyHoc/DKH_KeHoachDangKy
--Note:
--Updated by:
--Date of updated:
----------------------------------------------*/
function KeHoachDangKy() { };
KeHoachDangKy.prototype = {
    strKeHoachDangKy_Id: '',
    dtKeHoachDangKy: '',
    arrNhanSu_Id: [],

    init: function () {
        var me = main_doc.KeHoachDangKy;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.page_load();
        me.getList_KeHoachDangKy();
        me.getList_ThoiGianDaoTao_S();
        me.getList_HeDaoTao();
        /*------------------------------------------
        --Discription: 
        -------------------------------------------*/
        me.toggle_detail("zonebatdau");
        $("#btnAddnew").click(function () {
            me.rewrite();
            me.toggle_detail("zoneEdit");
        });
        $(".btnCloseToggle").click(function () {
            edu.util.toggle_overide("zone-content", "zonebatdau");
        });
        $("#btnSave").click(function () {
            me.save_KeHoachDangKy();
        });
        $(".btnSearch_KHDK").click(function () {
            me.getList_KeHoachDangKy("", edu.util.getValById("dropSearch_CheDoDangKy"), edu.util.getValById("txtSearch_TuKhoa"));
        });
        $("#btnSearch_KHDK").click(function () {
            me.getList_KeHoachDangKy();
        });
        $("#btnPhanCong").click(function () {
            $("#myModalPCNhomKiemSoat").modal("show");
            //edu.system.confirm("Bạn có chắc chắn muốn phân công không?");
            //$("#btnYes").click(function (e) {
            //    me.save_PhanCong();
            //});
            $("#tblPCNhomKiemSoat tbody").html("");
            $("#dropSearch_HeDaoTao_PCNKS").val("").trigger("change");
        });
        $("#btnSave_PCNhomKiemSoat").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblPCNhomKiemSoat", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng?");
                return;
            }
            $("#myModalPCNhomKiemSoat").modal("hide");
            //edu.system.alert('<div id="zoneprocessXXXX"></div>');
            //edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
            for (var i = 0; i < arrChecked_Id.length; i++) {
                me.save_PhanCong(arrChecked_Id[i]);
            }
        });
        $("#btnPhanCongCT").click(function () {
            $("#myModalPCChuongTrinh").modal("show");

            $("#tblPCChuongTrinh tbody").html("");
            $("#dropSearch_HeDaoTao_PCChuongTrinh").val("").trigger("change");
            $("#dropSearch_KhoaDaoTao_PCChuongTrinh").val("").trigger("change");
            //edu.system.confirm("Bạn có chắc chắn muốn phân công không?");
            //$("#btnYes").click(function (e) {
            //    me.save_PhanCongCT();
            //});
        });
        $("#btnSave_PCChuongTrinh").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblPCChuongTrinh", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng?");
                return;
            }
            $("#myModalPCChuongTrinh").modal("hide");
            //edu.system.alert('<div id="zoneprocessXXXX"></div>');
            //edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
            for (var i = 0; i < arrChecked_Id.length; i++) {
                me.save_PhanCongCT(arrChecked_Id[i]);
            }
        });
        $("#btnPhanCongKH").click(function () {
            $("#myModalPCKhoaHoc").modal("show");
            $("#tblPCKhoaHoc tbody").html("");
            $("#dropSearch_HeDaoTao_PCKhoaHoc").val("").trigger("change"); 
            //edu.system.confirm("Bạn có chắc chắn muốn phân công không?"); 
            //$("#btnYes").click(function (e) {
            //    me.save_PhanCongKH();
            //});
        });
        $("#btnSave_PCKhoaHoc").click(function () {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblPCKhoaHoc", "checkX");
            if (arrChecked_Id.length == 0) {
                edu.system.alert("Vui lòng chọn đối tượng?");
                return;
            }
            $("#myModalPCKhoaHoc").modal("hide");
            //edu.system.alert('<div id="zoneprocessXXXX"></div>');
            //edu.system.genHTML_Progress("zoneprocessXXXX", arrChecked_Id.length);
            for (var i = 0; i < arrChecked_Id.length; i++) {
                me.save_PhanCongKH(arrChecked_Id[i]);
            }
        });
        $("#btnChuyenDuLieu").click(function () {
            edu.system.confirm("Bạn có chắc chắn muốn chuyển dữ liệu không?");
            $("#btnYes").click(function (e) {
                me.save_ChuyenDuLieu();
            });
        });
        $("#tblKHDK").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            strId = edu.util.cutPrefixId(/edit/g, strId);
            edu.util.setOne_BgRow(strId, "tblKHDK");
            me.strKeHoachDangKy_Id = strId;
            if (edu.util.checkValue(strId)) {
                me.strCommon_Id = strId;
                me.getDetail_KeHoachDangKy(strId);
            }
            else {
                edu.system.alert(edu.constant.getting("NOTIFY", "SELECT_F"));
            }
        });
        $("#tblKHDK").delegate(".btnDelete", "click", function () {
            var strId = this.id;
            strId = edu.util.cutPrefixId(/delete/g, strId);
            if (edu.util.checkValue(strId)) {
                edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
                edu.util.setOne_BgRow(strId, "tblKHDK");
                $("#btnYes").click(function (e) {
                    me.delete_KeHoachDangKy(strId);
                });
            }
            else {
                edu.system.alert(edu.constant.getting("NOTIFY", "SELECT_F"));
            }
        });
        $("#zoneEdit").delegate('.btnSelectInList', 'click', function (e) {
            var point = this; e.preventDefault();
            if (point.classList.contains("btn-white")) {
                point.classList.remove("btn-white");
                point.classList.add("btn-primary");
            }
            else {
                point.classList.remove("btn-primary");
                point.classList.add("btn-white");
            }
        });
        me.arrValid_KeHoachDangKy = [
            //EM-empty, FL-float, IN-int, DA-date, seperated by "#" character...
            { "MA": "dropKhenThuong", "THONGTIN1": "EM" }
        ];
        $("#dropThoiGian_Nam").on("select2:select", function () {
            me.getList_ThoiGianDaoTao();
        });
        $("#dropThoiGian_Ky").on("select2:select", function () {
            me.getList_DotHoc();
        });
        
        //valid data
        //EM-empty, FL-float, IN-int, DA-date, seperated by "#" character...
        me.getList_NamHoc();
        me.getList_ThoiGianDaoTao();
        me.getList_DotHoc();
        //load
        me.getList_KeHoachDangKy();
        edu.system.loadToRadio_DMDL("DANGKY.MOHINH", "divMoHinh", 12);
        edu.system.loadToCombo_DanhMucDuLieu("DIEM.DIEMCHU", "dropMucDiem");
        edu.system.loadToCheckBox_DMDL("KHDT.DIEM.KIEUHOC", "divKieuDangKy", 12);
        edu.system.loadToCheckBox_DMDL("DANGKY.KIEUHOCLAI.PHANLOAI", "divLyDoHocLai", 12);
        edu.system.loadToRadio_DMDL("DANGKY.CHEDO", "divCheDoDangKy", 12);
        edu.system.loadToRadio_DMDL("DANGKY.QUYDINHVETINCHITOIDA", "divCachTinhTinChiToiDa", 12);
        edu.system.loadToRadio_DMDL("DANGKY.QUYDINHVETINCHITOIDA.PHAMVI", "divCachTinhTinChiToiDaPV", 12);
        edu.system.loadToRadio_DMDL("DANGKY.PHAMVIKIEMTRATRUNGTHOIGIAN", "divKiemTranTrungThoiGian");
        edu.system.loadToRadio_DMDL("DANGKY.TOHOPQUYDINH", "divDKTheoToHopQuyDinh");
        edu.system.loadToRadio_DMDL("DANGKY.QUYDINHVENANGDIEM", "divQuyDinhNangDiem", 12);
        edu.system.loadToRadio_DMDL("DANGKY.QUYDINHKIEMTRAHOCPHI", "divQuyDinhKiemTraTaiChinh", 12);
        edu.system.loadToCombo_DanhMucDuLieu("QLSV.TRANGTHAI", "", "", me.genList_TrangThaiSV);
        edu.system.loadToCombo_DanhMucDuLieu("DANGKY.PHANLOAIDOT", "dropPhanLoaiDot");
        edu.system.loadToCombo_DanhMucDuLieu("DANGKY.MOHINHUTDANGKYNGUYENVONG", "dropMucUuTienNguyenVong");
        edu.system.loadToCombo_DanhMucDuLieu("DANGKY.SOTINCHI.KHOIKT.TUCHON", "dropTuyChonKTVuot"); 
        me.getList_NguyenVongUuTien();
        //edu.system.loadToList_DanhMucDuLieu("DKH.QDTCTD", "divQD_TCCT", 12);
        //edu.system.loadToList_DanhMucDuLieu("DKH.QDDKND", "divNangDiem", 12);
        //edu.system.loadToList_DanhMucDuLieu("DKH.KTTL", "divTrungLich", 12);
        //edu.system.loadToList_DanhMucDuLieu("DKH.KTHP", "divKTTC", 12);
        //edu.system.loadToList_DanhMucDuLieu("DKH.QDTOHOPDK", "divDKTheoToHopQuyDinh", 12);
        //edu.system.loadToList_DanhMucDuLieu("DKH.TTSV", "divTrangThaiSinhVien");
        //edu.system.loadToList_DanhMucDuLieu("DKH.CHEDODANGKY", "divCheDoDangKy");

        $("#tblKHDK").delegate('.btnDetail', 'click', function (e) {
            $('#myModal').modal('show');
            me.getList_QuanSoTheoLop(this.id);
        });
        $("#tblKHDK").delegate('.btnDetailKhongDangKy', 'click', function (e) {
            $('#myModal_khongdangky').modal('show');
            me.getList_KhongDangKy(this.id);
        });

        $("#zoneEdit").delegate(".ckbDSTrangThaiSV_ALL", "click", function (e) {
            e.stopImmediatePropagation();
            var checked_status = this.checked;
            $(".ckbDSTrangThaiSV").each(function () {
                this.checked = checked_status;
            });
        });

        $("#tblKHDK").delegate(".btnPhanQuyen", "click", function () {
            var strId = this.id;
            strId = edu.util.cutPrefixId(/edit/g, strId);
            
            me.strKeHoachDangKy_Id = strId;
            me.toggle_detail("zonePhanQuyen");
            me.getList_ThanhVien();
        });
        $(".btnSearchTTS_NhanSu").click(function () {
            edu.extend.genModal_NhanSu();
            edu.extend.getList_NhanSu("SEARCH");
        });
        $("#modal_nhansu").delegate('.btnSelect', 'click', function () {
            var id = this.id;
            var strNhanSu_Id = edu.util.cutPrefixId(/slnhansu/g, id);
            me.genHTML_NhanSu(strNhanSu_Id);
        });
        $("#tblInput_TTS_ThanhVien").delegate('.btnDeletePoiter', 'click', function () {
            var id = this.id;
            var strcheck = $(this).attr("name");
            var strNhanSu_Id = edu.util.cutPrefixId(/remove_nhansu/g, id);
            if (!edu.util.checkValue(strcheck)) {
                me.removeHTML_NhanSu(strNhanSu_Id);
            }
            else {
                edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
                $("#btnYes").click(function (e) {
                    me.delete_ThanhVien(strNhanSu_Id);
                });
            }
        });
        $("#btnSavePhanQuyen").click(function () {
            $("#tblInput_TTS_ThanhVien tbody tr").each(function () {
                var strNhanSu_Id = this.id.replace(/rm_row/g, '');
                me.save_ThanhVien(strNhanSu_Id);
            });
        });

        $("#btnDelete_KeHoach").click(function () {
            edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
            $("#btnYes").click(function (e) {
                me.delete_KeHoachDangKy(me.strKeHoachDangKy_Id);
            });
        });

        $('#dropSearch_HeDaoTao_PCNKS').on('select2:select', function () {
            me.getList_KhoaDaoTao($('#dropSearch_HeDaoTao_PCNKS').val());
        });
        $('#dropSearch_HeDaoTao_PCChuongTrinh').on('select2:select', function () {
            me.getList_KhoaDaoTao($('#dropSearch_HeDaoTao_PCChuongTrinh').val());
            $("#tblPCChuongTrinh tbody").html("");
        });
        $('#dropSearch_HeDaoTao_PCKhoaHoc').on('select2:select', function () {
            me.getList_KhoaDaoTao($('#dropSearch_HeDaoTao_PCKhoaHoc').val());
        });
        $('#dropSearch_KhoaDaoTao_PCChuongTrinh').on('select2:select', function () {
            me.getList_ChuongTrinh();
        });
    },
    toggle_detail: function (strZone) {
        edu.util.toggle_overide("zone-content", strZone);
    },
    rewrite: function () {
        var me = this;
        me.strKeHoachDangKy_Id = "";
        edu.util.resetValById("txtTenKeHoach");
        edu.util.resetValById("txtMaKeHoach");
        edu.util.resetValById("dropThoiGian_Dot");
        edu.util.resetValById("txtBD_Ngay");
        edu.util.resetValById("txtBD_Gio");
        edu.util.resetValById("txtBD_Phut");
        edu.util.resetValById("txtKT_Ngay");
        edu.util.resetValById("txtKT_Gio");
        edu.util.resetValById("txtKT_Phut");
        edu.util.resetValById("txtNoToiDa");
        edu.util.resetValById("txtSoNgayRutHP");
        edu.util.resetValById("txtNgayBDRutHP");
        edu.util.resetValById("txtSoGiayCho");
        edu.util.resetValById("dropPhanLoaiDot");
        edu.util.resetValById("txtSoTCToiDa");
        edu.util.resetValById("txtSoTCToiThieu");
        edu.util.resetValById("txtSoTCToiDaN2");
        edu.util.resetValById("txtSoTCToiThieuN2");
        edu.util.resetValById("txtTyLeVuot");
        edu.util.resetValById("dropMucDiem");
        edu.util.resetValById("divMoHinh");
        edu.util.resetValById("divDenHan");
        edu.util.resetValById("divTrangThaiSinhVien");
        edu.util.resetValById("divKieuDangKy");
        edu.util.resetValById("divLyDoHocLai");
        edu.util.resetValById("divNguyenVongUuTien");
        edu.util.resetValById("dropMucUuTienNguyenVong");
        edu.util.resetValById("divCheDoDangKy");
        edu.util.resetValById("divHienThiThongTinGiangVien");
        edu.util.resetValById("divKiemTraTinhTrangTaiChinh");
        edu.util.resetValById("divQuyDinhKiemTraTaiChinh");
        edu.util.resetValById("divQDHuyHocPhan");
        edu.util.resetValById("divQDCoVanDangKyChoSV");
        edu.util.resetValById("divKTTCTD");
        edu.util.resetValById("divKTTCTT");
        edu.util.resetValById("divCachTinhTinChiToiDa");
        edu.util.resetValById("divCachTinhTinChiToiDaPV");
        edu.util.resetValById("divKiemTraTrungLich");
        edu.util.resetValById("divKiemTraTrungLop");
        edu.util.resetValById("divKiemTranTrungThoiGian");
        edu.util.resetValById("divDKTheoToHopQuyDinh");
        edu.util.resetValById("divDKMR");
        edu.util.resetValById("divDKHPTD");
        edu.util.resetValById("divDoiHocPhan");
        edu.util.resetValById("divDKMotLanTrongKy");
        edu.util.resetValById("divKRDKTQ");
        edu.util.resetValById("divHDHT");
        //edu.util.resetValById("divDangKyNhieuLanTrongDot");
        edu.util.resetValById("divQuyDinhNangDiem");
        edu.util.resetValById("divQuyDinhKiemTraTaiChinh");
        edu.util.resetValById("dropTuyChonKTVuot");
        $("#zonedkmr input[type=checkbox]").each(function () {
            $(this).attr('checked', false);
            $(this).prop('checked', false);
        })
        edu.util.resetValById("txtNgayBatDauXN");
        edu.util.resetValById("txtNgayKetThucXN");
    },
    
    save_PhanCong: function (strViApDung_Id) {
        var me =this;

        //--Edit
        //var obj_save = {
        //    'action': 'DKH_KeHoachDangKy/PhanCongTheoNhomKiemSoat',
        //    'type': 'POST',
        //    'strChucNang_Id': edu.system.strChucNang_Id,
        //    'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
        //    'strNguoiThucHien_Id': edu.system.userId,
        //};
        var obj_save = {
            'action': 'DKH_ThongTin_MH/ESkgLwIuLyYVKSQuDykuLAooJCwSLiA1',
            'func': 'pkg_dangkyhoc_thongtin.PhanCongTheoNhomKiemSoat',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strViApDung_Id': strViApDung_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thực hiện thành công!");
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alert(obj_save.action + " (er): " + data.Message);
                }

            },
            error: function (er) {

                obj_notify = {
                    type: "s",
                    content: obj_save.action + " (er): " + er,
                }
                edu.system.alert(obj_save.action + " (er): " + er);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_PhanCongKH: function (strViApDung_Id) {
        var me = this;

        //--Edit
        
        var obj_save = {
            'action': 'DKH_ThongTin_MH/ESkgLwIuLyYVNAUuLyYVKSQuCikuIAUgLhUgLgPP',
            'func': 'pkg_dangkyhoc_thongtin.PhanCongTuDongTheoKhoaDaoTao',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strViApDung_Id': strViApDung_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thực hiện thành công!");
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alert(obj_save.action + " (er): " + data.Message);
                }

            },
            error: function (er) {

                obj_notify = {
                    type: "s",
                    content: obj_save.action + " (er): " + er,
                }
                edu.system.alert(obj_save.action + " (er): " + er);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_PhanCongCT: function (strViApDung_Id) {
        var me = this;

        //--Edit
        var obj_save = {
            'action': 'DKH_ThongTin_MH/ESkgLwIuLyYVNAUuLyYVKSQuAik0Li8mFTMoLykP',
            'func': 'pkg_dangkyhoc_thongtin.PhanCongTuDongTheoChuongTrinh',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strViApDung_Id': strViApDung_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thực hiện thành công!");
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alert(obj_save.action + " (er): " + data.Message);
                }

            },
            error: function (er) {

                obj_notify = {
                    type: "s",
                    content: obj_save.action + " (er): " + er,
                }
                edu.system.alert(obj_save.action + " (er): " + er);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_ChuyenDuLieu: function () {
        var me = this;

        //--Edit
        var obj_save = {
            'action': 'DKH_KeHoachDangKy/ChuyenDuLieuTKBSangDKH',
            'type': 'POST',
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thực hiện thành công!");
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alert(obj_save.action + " (er): " + data.Message);
                }

            },
            error: function (er) {

                obj_notify = {
                    type: "s",
                    content: obj_save.action + " (er): " + er,
                }
                edu.system.alert(obj_save.action + " (er): " + er);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,

            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_KeHoachDangKy: function () {
        var me = main_doc.KeHoachDangKy;
        var MHDK_val = edu.util.getValCheckBoxByDiv("divMoHinh");//Kiểu radio
        var DenHan_val = edu.util.getValCheckBoxByDiv("divDenHan");//Kiểu radio
        var KDK_val = edu.util.getValCheckBoxByDiv("divKieuDangKy");//Kiểu check box
        var LDHL_val = edu.util.getValCheckBoxByDiv("divLyDoHocLai");//Kiểu check box
        var NVUT_val = edu.util.getValCheckBoxByDiv("divNguyenVongUuTien");//Kiểu check box
        var QDGV_val = $('input[name="QDGV"]:checked').val();//Radio chọn có/không
        var CheDoDangKy_val = edu.util.getValCheckBoxByDiv("divCheDoDangKy");//Kiểu radio
        var TrangThaiSinhVien_val = edu.extend.getCheckedCheckBoxByClassName('ckbDSTrangThaiSV').toString();//Kiểu check box
        var KiemTraTinhTrangTaiChinh_val = $('input[name="KiemTraTaiChinh"]:checked').val();//Radio chọn có/không
        var ChoPhepNguocHocHuyHocPhan_val = $('input[name="QDRHP"]:checked').val();//Radio chọn có/không
        var CovanDangKy_val = $('input[name="CVDK"]:checked').val();//Radio chọn có/không
        var KiemTraTinChiToiDa_val = $('input[name="QDTCTD"]:checked').val();//Radio chọn có/không
        var KiemTraTinChiToiThieu_val = $('input[name="QDTCTT"]:checked').val();//Radio chọn có/không
        var CachTinhTinChiToiDa_val = edu.util.getValCheckBoxByDiv("divCachTinhTinChiToiDa");//Kiểu radio
        var CachTinhTinChiToiDaPV_val = edu.util.getValCheckBoxByDiv("divCachTinhTinChiToiDaPV");//Kiểu radio
        var KTTLich_val = $('input[name="KTTLich"]:checked').val();//Radio chọn có/không
        var KTTLop_val = $('input[name="KTTLop"]:checked').val();//Radio chọn có/không
        var KiemTraTrungThoiGian_val = edu.util.getValCheckBoxByDiv("divKiemTranTrungThoiGian");//Kiểu radio
        var KiemTraToHopDangKy_val = edu.util.getValCheckBoxByDiv("divDKTheoToHopQuyDinh");//Kiểu radio
        var KiemTraDangKyMoRong_val = $('input[name="DKMR"]:checked').val();//Radio chọn có/không
        var QuyDinhDangKyHPTuongDuong_val = $('input[name="DKHPTD"]:checked').val();//Radio chọn có/không
        var QuyDinhDoiLopHocPhan_val = $('input[name="DHP"]:checked').val();//Radio chọn có/không
        var QuyDinhDangKyMotLan_val = $('input[name="DKML"]:checked').val();//Radio chọn có/không
        var QuyDinhRangBuocHocPhan_val = $('input[name="KTDKTQ"]:checked').val();//Radio chọn có/không
        var QDND_val = edu.util.getValCheckBoxByDiv("divQuyDinhNangDiem");//Kiểu radio
        var QuyDinhKiemTraTaiChinh_val = edu.util.getValCheckBoxByDiv("divQuyDinhKiemTraTaiChinh");//Kiểu radio
        var QuyDinhDangKyNhieuLan_val = $('input[name="DangKyNhieuLanTrongDot"]:checked').val();//Radio chọn có/không


        var HDHT = $('input[name="HDHT"]:checked').val();//Radio chọn có/không
        var HienThiDonGia = $('input[name="HienThiDonGia"]:checked').val();//Radio chọn có/không
        var TuDongTinhTien = $('input[name="TuDongTinhTien"]:checked').val();//Radio chọn có/không
        var TuDongTinhPhi = $('input[name="TuDongTinhPhi"]:checked').val();//Radio chọn có/không
        

        //Kiểm tra Mô hình 
        //if (MHDK_val == "") {
        //    edu.system.alert("Chọn 1 trong các mô hình đăng ký");
        //    return;
        //}
        //// Kiểm tra trạng thái sinh viên
        //if (TrangThaiSinhVien_val == "") {
        //    edu.system.alert("Chọn 1 hoặc nhiều trong các trạng thái sinh viên");
        //    return;
        //}
        //// Kiểm tra kiểu đăng ký
        //if (KDK_val == "") {
        //    edu.system.alert("Chọn 1 hoặc nhiều trong các kiểu đăng ký");
        //    return;
        //}
        //// Kiểm tra quy định giảng viên
        //if (QDGV_val == "") {
        //    edu.system.alert("Chọn quy định về giảng viên");
        //    return;
        //}
        //// Kiểm tra chế độ  đăng ký
        //if (CheDoDangKy_val == "") {
        //    edu.system.alert("Chọn 1 trong các chế độ đăng ký");
        //    return;
        //}
        //// Kiểm tra tình trạng tài chính
        //if (KiemTraTinhTrangTaiChinh_val == "") {
        //    edu.system.alert("Chọn kiểm tra tình trạng tài chính");
        //    return;
        //}
        //// Kiểm tra quy định về hủy rú học phần
        //if (ChoPhepNguocHocHuyHocPhan_val == "") {
        //    edu.system.alert("Chọn quy định về hủy rút học phần");
        //    return;
        //}
        //// Kiểm tra quy định về cố vấn đăng ký cho sinh viên
        //if (CovanDangKy_val == "") {
        //    edu.system.alert("Chọn quy định về cố vấn đăng ký cho sinh viên");
        //    return;
        //}
        //// Kiểm tra số tín chỉ tối đa
        //if (KiemTraTinChiToiDa_val == "") {
        //    edu.system.alert("Chọn kiểm tra tín chỉ tối đa");
        //    return;
        //}
        //// Kiểm tra số tín chỉ tối thiểu
        //if (KiemTraTinChiToiThieu_val == "") {
        //    edu.system.alert("Chọn kiểm tra tín chỉ tối thiểu");
        //    return;
        //}
        //// Kiểm tra quy định số tín chỉ tối đa
        //if (CachTinhTinChiToiDa_val == "") {
        //    edu.system.alert("Chọn kiểm tra tín chỉ tối thiểu");
        //    return;
        //}
        //// Kiểm tra quy định trùng lịch học
        //if (KTTLich_val == "") {
        //    edu.system.alert("Chọn kiểm tra trùng lịch");
        //    return;
        //}
        //// Kiểm tra quy định trùng lớp học
        //if (KTTLop_val == "") {
        //    edu.system.alert("Chọn kiểm tra trùng lớp");
        //    return;
        //}
        //// Kiểm tra phạm vi kiểm tra trùng lịch
        //if (KiemTraTrungThoiGian_val == "") {
        //    edu.system.alert("Chọn phạm vi kiểm tra trùng lịch");
        //    return;
        //}
        //// Kiểm tra tổ hợp đăng ký
        //if (KiemTraToHopDangKy_val == "") {
        //    edu.system.alert("Chọn kiểm tra tổ hợp đăng ký");
        //    return;
        //}
        //// Kiểm tra quy định đăng ký mở rộng
        //if (KiemTraDangKyMoRong_val == "") {
        //    edu.system.alert("Chọn kiểm tra quy định đăng ký mở rộng");
        //    return;
        //}
        //// Kiểm tra quy định đăng ký học phần tương đương
        //if (QuyDinhDangKyHPTuongDuong_val == "") {
        //    edu.system.alert("Chọn kiểm tra quy định đăng ký học phần tương đương");
        //    return;
        //}
        //// Kiểm tra quy định đổi lớp học phần
        //if (QuyDinhDoiLopHocPhan_val == "") {
        //    edu.system.alert("Chọn kiểm tra quy định đổi lớp học phần");
        //    return;
        //}
        //// Kiểm tra đăng ký một lần trong kỳ
        //if (QuyDinhDangKyMotLan_val == "") {
        //    edu.system.alert("Chọn kiểm tra quy định đăng ký 1 lần trong kỳ");
        //    return;
        //}
        //// Kiểm tra đăng ký nhiều lần trong kỳ
        //if (QuyDinhDangKyNhieuLan_val == "") {
        //    edu.system.alert("Chọn kiểm tra quy định đăng ký nhiều lần trong kỳ");
        //    return;
        //}
        //// Kiểm tra điều kiện tiên quyết học phần
        //if (QuyDinhRangBuocHocPhan_val == "") {
        //    edu.system.alert("Chọn kiểm tra điều kiện tiên quyết học phần");
        //    return;
        //}
        //// Kiểm tra quy định nâng điểm
        //if (QDND_val == "") {
        //    edu.system.alert("Chọn kiểm tra điều kiện tiên quyết học phần");
        //    return;
        //}


        //--Edit
        var obj_save = {
            'action': 'NS_DKH_CHUNG2_MH/FSkkLB4FIC8mCjgeCiQJLiAiKQUgLyYKOAPP',
            'func': 'pkg_dangkyhoc_chung2.Them_DangKy_KeHoachDangKy',
            'iM': edu.system.iM,
            'strId': '',
            'strTenKeHoach': edu.util.getValById("txtTenKeHoach"),
            'strMaKeHoach': edu.util.getValById("txtMaKeHoach"),
            'strMoTa': edu.util.getValById("txtMoTa"),
            'strMoHinhDangKy_Id': MHDK_val,
            'strTrangThai_Id': CheDoDangKy_val,
            'strKieuHoc_Ids': KDK_val,
            'dHienThiThongTinGiangVien': QDGV_val ? QDGV_val : undefined,
            'dHieuLuc': DenHan_val ? DenHan_val: undefined,
            'dSoTinChiToiDaN2': edu.util.getValById("txtSoTCToiDaN2") ? edu.util.getValById("txtSoTCToiDaN2"): undefined,
            'dSoTinChiToiThieuN2': edu.util.getValById("txtSoTCToiThieuN2") ? edu.util.getValById("txtSoTCToiThieuN2"): undefined,
            'strTrangThaiSinhVien_Ids': TrangThaiSinhVien_val,
            'strQuyDinhKiemTraHocPhi_Id': QuyDinhKiemTraTaiChinh_val,
            'dChoPhepNguocHocHuyHocPhan': ChoPhepNguocHocHuyHocPhan_val ? ChoPhepNguocHocHuyHocPhan_val: undefined,
            'dKhongChoPhepCoVanDangKy': CovanDangKy_val ? CovanDangKy_val: undefined,
            'dKiemTraSoTinChiToiDa': KiemTraTinChiToiDa_val ? KiemTraTinChiToiDa_val: undefined,
            'dKiemTraSoTinChiToiThieu': KiemTraTinChiToiThieu_val ? KiemTraTinChiToiThieu_val: undefined,
            'strQuyDinhTinChiToiDa_Id': CachTinhTinChiToiDa_val,
            'dKiemTraTrungLich': KTTLich_val ? KTTLich_val: undefined,
            'dKiemTraTrungLopKhongXep': KTTLop_val ? KTTLop_val: undefined,
            'strKiemTraTrungThoiGian_Id': KiemTraTrungThoiGian_val,
            'strDangKyTheoToHopQuyDinh_Id': KiemTraToHopDangKy_val,
            'dChoPhepDangKyMoRong': KiemTraDangKyMoRong_val ? KiemTraDangKyMoRong_val: undefined,
            'dChoPhepDangKyHPTuongDuong': QuyDinhDangKyHPTuongDuong_val ? QuyDinhDangKyHPTuongDuong_val: undefined,
            'dKhongChoPhepDoiLopHocPhan': QuyDinhDoiLopHocPhan_val ? QuyDinhDoiLopHocPhan_val: undefined,
            'dChiDangKyMotLanTrongKy': QuyDinhDangKyMotLan_val ? QuyDinhDangKyMotLan_val: undefined,
            'dKiemTraRangBuocHocPhan': QuyDinhRangBuocHocPhan_val ? QuyDinhRangBuocHocPhan_val: undefined,
            'strQuyDinhDangKyNangDiem_Id': QDND_val,
            
            'dGioDangKyTrongNgayDau': edu.util.getValById("txtBD_Gio") ? edu.util.getValById("txtBD_Gio"): undefined,
            'dGioKetThucTrongNgayCuoi': edu.util.getValById("txtKT_Gio")? edu.util.getValById("txtKT_Gio"): undefined,
            'strNgayBatDau': edu.util.getValById("txtBD_Ngay"),
            'strNgayKetThuc': edu.util.getValById("txtKT_Ngay"),
            'dSoHocPhiNoToiDaChoPhep': edu.util.getValById("txtNoToiDa")? edu.util.getValById("txtNoToiDa"): undefined,
            'dSoTinChiToiDa': edu.util.getValById("txtSoTCToiDa") ? edu.util.getValById("txtSoTCToiDa"): undefined,
            'dSoTinChiToiThieu': edu.util.getValById("txtSoTCToiThieu") ? edu.util.getValById("txtSoTCToiThieu"): undefined,
            'strNamHoc_Id': edu.util.getValById("dropThoiGian_Nam"),
            'strHocKy_Id': edu.util.getValById("dropThoiGian_Ky"),
            'strDotHoc_Id': edu.util.getValById("dropThoiGian_Dot"),
            'dPhanTramDangKyMoRong': edu.util.getValById("txtTyLeVuot") ? edu.util.getValById("txtTyLeVuot"): undefined,
            'dPhutDangKyTrongNgayDau': edu.util.getValById("txtBD_Phut")? edu.util.getValById("txtBD_Phut"): undefined,
            'dPhutKetThucTrongNgayCuoi': edu.util.getValById("txtKT_Phut")? edu.util.getValById("txtKT_Phut"): undefined,
            'dSoNgayDuocPhepRutHocPhan': edu.util.getValById("txtSoNgayRutHP") ? edu.util.getValById("txtSoNgayRutHP") : undefined,
            'strNgayBatDauTinhRutHP': edu.util.getValById("txtNgayBDRutHP"),
            'dKiemTraTaiChinh': KiemTraTinhTrangTaiChinh_val ? KiemTraTinhTrangTaiChinh_val: undefined,
            'strMucDiemChuHe4_NangDiem': edu.util.getValById("dropMucDiem"),
            'strNguoiThucHien_Id': edu.system.userId,
            'dSoGiayCho': edu.util.getValById('txtSoGiayCho') ? edu.util.getValById('txtSoGiayCho'): undefined,
            'strPhanLoaiDotDangKy_Id': edu.util.getValById('dropPhanLoaiDot'),
            'dHienThiDonGiaHocPhi': HienThiDonGia ? HienThiDonGia : undefined,
            'dTinhPhiTuDong': TuDongTinhTien ? TuDongTinhTien: undefined,
            'dTinhPhiTuDongKhiXacNhan': TuDongTinhPhi,
            'dKiemTraDinhHuongHocTap': HDHT,
            'strQuyDinhTCToiDa_PhamVi_Id': CachTinhTinChiToiDaPV_val,

            'strMoHinhUuTienDaDKNV_Id': edu.util.getValById('dropMucUuTienNguyenVong'),
            'strDSNguyenVongLuaChon_Id': NVUT_val,
            'strKTDangKySoTinCuaKhoiTC_Id': edu.util.getValById('dropTuyChonKTVuot'),
            'strKieuHocLai_PhanLoai_Id': LDHL_val,
            'dApDungLuuBangTamTaiChinh': $("#chkTinhTaiChinh").is(':checked') ? 1 : undefined,
            'dApDungLuuBangTamLHocPhan': $("#chkTinhLopHocPhan").is(':checked') ? 1 : undefined,
            'dApDungLuuBangTamHocPhan': $("#chkTinhHocPhan").is(':checked') ? 1 : undefined,
            'strNgayBatDauXacNhan': edu.system.getValById('txtNgayBatDauXN'),
            'strNgayKetThucXacNhan': edu.system.getValById('txtNgayKetThucXN'),
        };
        if (me.strKeHoachDangKy_Id != "") {
            obj_save.action = 'NS_DKH_CHUNG2_MH/EjQgHgUgLyYKOB4KJAkuICIpBSAvJgo4';
            obj_save.func = 'pkg_dangkyhoc_chung2.Sua_DangKy_KeHoachDangKy';

            obj_save.strId = me.strKeHoachDangKy_Id;
        }
        //default
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (edu.util.checkValue(data.Id)) {
                        obj_notify = {
                            type: "s",
                            content: "Thêm mới thành công!",
                        }
                        edu.system.alert("Thêm mới thành công!");
                    }
                    else {
                        obj_notify = {
                            type: "i",
                            content: "Cập nhật thành công!",
                        }
                        edu.system.alert("Cập nhật thành công!");
                    }
                    me.getList_KeHoachDangKy();
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alert(obj_save.action + " (er): " + data.Message);
                }
                
            },
            error: function (er) {
                
                obj_notify = {
                    type: "s",
                    content: obj_save.action + " (er): " + er,
                }
                edu.system.alert(obj_save.action + " (er): " + er);
            },
            type: "POST",
            action: obj_save.action,
            
            contentType: true,
            
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_KeHoachDangKy: function () {
        var me = main_doc.KeHoachDangKy;

        //--Edit
        var obj_list = {
            'action': 'DKH_KeHoachDangKy/LayDanhSach',
            

            'strTuKhoa': edu.util.getValById("txtSearch_TuKhoa"),
            'strNguoiThucHien_Id': "",
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
        };

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtKeHoachDangKy = dtResult;
                    me.genTable_KeHoachDangKy(dtResult, iPager);
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
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getDetail_KeHoachDangKy: function (strId) {
        var me = this;
        me.viewForm_KeHoachDangKy(me.dtKeHoachDangKy.find(element => element.ID === strId));
    },
    delete_KeHoachDangKy: function (Ids) {
        var me = main_doc.KeHoachDangKy;
        //--Edit
        var obj_delete = {
            'action': 'DKH_KeHoachDangKy/Xoa',
            
            'strIds': Ids,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default
        
        edu.system.makeRequest({
            success: function (data) {
                if (edu.util.checkValue(data.Message)) {
                    edu.system.alert(data.Message);
                    return;
                }
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
                        content: obj_delete + ": " + data.Message,
                        code: "w"
                    };
                    edu.system.afterComfirm(obj);
                }
                
                me.getList_KeHoachDangKy();
                me.toggle_detail("zonebatdau");
            },
            error: function (er) {
                
                obj = {
                    title: "",
                    content: obj_delete + ": " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_delete.action,
            
            contentType: true,
            
            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    /*----------------------------------------------
    --Date of created: 2
    --Discription: genCombo NamHoc
    ----------------------------------------------*/
    genTable_KeHoachDangKy: function (data, iPager) {
        var me = main_doc.KeHoachDangKy;
        var jsonForm = {
            strTable_Id: "tblKHDK",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.KeHoachDangKy.getList_KeHoachDangKy()",
                iDataRow: iPager
            },
            colPos: {
                center: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            },
            aoColumns: [
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnEdit" id="' + aData.ID + '" title="Chi tiết"><i class="fa fa-edit"></i></a></span>';
                    }
                },
                {
                "mDataProp": "MAKEHOACH"
            },
            {
                "mDataProp": "TENKEHOACH"
            },
            {
                "mDataProp": "NGAYBATDAU"
            },
            {
                "mDataProp": "GIODANGKYTRONGNGAYDAU"
            },
            {
                "mDataProp": "PHUTDANGKYTRONGNGAYDAU"
            },
            {
                "mDataProp": "NGAYKETTHUC"
            },
            {
                "mDataProp": "GIOKETTHUCTRONGNGAYCUOI"
            },
            {
                "mDataProp": "PHUTKETTHUCTRONGNGAYCUOI"
            },
            {
                "mDataProp": "TRANGTHAI_TEN"
            },
            {
                "mDataProp": "MOHINHDANGKY_TEN"
            },
            {
                "mDataProp": "SOLUONGDUKIEN"
            },
            {
                "mData": "SOLUONGDADANGKY",
                "mRender": function (nRow, aData) {
                    return edu.util.returnEmpty(aData.SOLUONGDADANGKY) + '<span><a class="btn btn-default btnDetail" id="' + aData.ID + '" title="Chi tiết"><i class="fa fa-eye"></i></a></span>';
                }
                },
                {
                    "mData": "SoLuongKhongDangKy",
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.SOLUONGKHONGDANGKY) + '<span><a class="btn btn-default btnDetailKhongDangKy" id="' + aData.ID + '" title="Chi tiết"><i class="fa fa-eye"></i></a></span>';
                    }
                },
            {
                "mDataProp": "TYLE"
            },
            {
                "mRender": function (nRow, aData) {
                    return '<span><a class="btn btn-default btnPhanQuyen" id="' + aData.ID + '" title="Chi tiết"><i class="fa fa-edit"></i></a></span>';
                }
            }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        
        /*III. Callback*/
    },
    viewForm_KeHoachDangKy: function (data) {
        var me = main_doc.KeHoachDangKy;
        //call popup --Edit
        $("#DSTrangThaiSV input").each(function () {
            $(this).attr('checked', false);
            $(this).prop('checked', false);
        })
        $("#divKieuDangKy input").each(function () {
            $(this).attr('checked', false);
            $(this).prop('checked', false);
        })
        $("#divLyDoHocLai input").each(function () {
            $(this).attr('checked', false);
            $(this).prop('checked', false);
        })
        $("#divMoHinh input").each(function () {
            $(this).attr('checked', false);
            $(this).prop('checked', false);
        })
        edu.util.toggle_overide("zone-content", "zoneEdit");
        //view data --Edit
        edu.util.viewValById("txtTenKeHoach", data.TENKEHOACH);
        edu.util.viewValById("txtMaKeHoach", data.MAKEHOACH);
        edu.util.viewValById("txtMoTa", data.MOTA);
        edu.util.viewValById("dropThoiGian_Nam", data.DAOTAO_THOIGIANDAOTAO_NAM_ID);
        me.getList_ThoiGianDaoTao();
        edu.util.viewValById("dropThoiGian_Ky", data.DAOTAO_THOIGIANDAOTAO_KY_ID);
        me.getList_DotHoc();
        edu.util.viewValById("dropThoiGian_Dot", data.DAOTAO_THOIGIANDAOTAO_DOT_ID);
        edu.util.viewValById("txtBD_Ngay", data.NGAYBATDAU);
        edu.util.viewValById("txtBD_Gio", data.GIODANGKYTRONGNGAYDAU);
        edu.util.viewValById("txtBD_Phut", data.PHUTDANGKYTRONGNGAYDAU);
        edu.util.viewValById("txtKT_Ngay", data.NGAYKETTHUC);
        edu.util.viewValById("txtKT_Gio", data.GIOKETTHUCTRONGNGAYCUOI);
        edu.util.viewValById("txtKT_Phut", data.PHUTKETTHUCTRONGNGAYCUOI);
        edu.util.viewValById("txtNoToiDa", data.SOHOCPHINOTOIDACHOPHEP);
        edu.util.viewValById("txtSoNgayRutHP", data.SONGAYDUOCPHEPRUTHOCPHAN);
        edu.util.viewValById("txtNgayBDRutHP", data.NGAYBATDAUTINHRUTHOCPHAN);
        edu.util.viewValById("txtSoTCToiDa", data.SOTINCHITOIDA);
        edu.util.viewValById("txtSoTCToiThieu", data.SOTINCHITOITHIEU);
        edu.util.viewValById("txtSoTCToiDaN2", data.SOTINCHITOIDAN2);
        edu.util.viewValById("txtSoTCToiThieuN2", data.SOTINCHITOITHIEUN2);
        edu.util.viewValById("txtTyLeVuot", data.PHANTRAMDANGKYVUOTQUYDINH);
        edu.util.viewValById("txtSoGiayCho", data.SOGIAYCHO);
        edu.util.viewValById("dropPhanLoaiDot", data.PHANLOAIDOTDANGKY_ID);
        edu.util.viewValById("dropMucDiem", data.MUCDIEMCHUHE4_NANGDIEM);
        edu.util.viewValById("divMoHinh", data.MOHINHDANGKY_ID);
        edu.util.viewValById("dropTuyChonKTVuot", data.KIEMTRADANGKYSOTINCUAKHOITC_ID );
        edu.util.viewValById("dropMucUuTienNguyenVong", data.MOHINHUUTIENDADKNGUYENVONG_ID);
        $("#divMoHinh #" + data.MOHINHDANGKY_ID).each(function () {
            $(this).attr('checked', true);
            $(this).prop('checked', true);
        });
        $("#divDenHan #" + data.HIEULUC).trigger("click");
        //$("#strTrangThaiSinhVien_Ids #" + data.TRANGTHAISINHVIEN_IDS).attr("checked", "checked");
        $("#divHienThiThongTinGiangVien #QDGV_" + data.HIENTHITHONGTINGIANGVIEN).trigger("click");
        $("#divCachTinhTinChiToiDa #" + data.QUYDINHTINCHITOIDA_ID).trigger("click");
        $("#divCachTinhTinChiToiDaPV #" + data.QUYDINHTINCHITOIDA_PHAMVI_ID).trigger("click");
        //$("#divKTdivCachTinhTinChiToiDaTCTD #" + data.QUYDINHTINCHITOIDA_ID).attr("checked", "checked");
        $("#divQuyDinhNangDiem #" + data.QUYDINHDANGKYNANGDIEM_ID).trigger("click");
        $("#divDKTheoToHopQuyDinh #" + data.DANGKYTHEOTOHOPQUYDINH_ID).trigger("click");
        $("#divKiemTranTrungThoiGian #" + data.KIEMTRATRUNGTHOIGIAN_ID).trigger("click");
        //$("#divCheDoDangKy #" + data.TRANGTHAI_ID).attr("checked", "checked");

        UpdateCheck("#divCheDoDangKy", data.TRANGTHAI_ID);
        console.log(data.KIEMTRATAICHINH);
        console.log($("#divKiemTraTinhTrangTaiChinh #KTTC_" + data.KIEMTRATAICHINH))
        $("#divKiemTraTinhTrangTaiChinh #KTTC_" + data.KIEMTRATAICHINH).trigger("click");
        $("#divHienThiDonGia #HienThiDonGia_" + data.HIENTHIDONGIAHOCPHI).trigger("click");
        $("#divTuDongTinhTien #TuDongTinhTien_" + data.TINHPHITUDONG).trigger("click");
        $("#divTuDongTinhPhi #TuDongTinhPhi_" + data.TINHPHITUDONGKHIXACNHAN).trigger("click");
        if (data.KIEUHOC_IDS) $("#divKieuDangKy #" + data.KIEUHOC_IDS.replace(/,/g, ",#")).each(function () {
            $(this).attr('checked', true);
            $(this).prop('checked', true);
        });
        if (data.KIEUHOCLAI_PHANLOAI_ID) $("#divLyDoHocLai #" + data.KIEUHOCLAI_PHANLOAI_ID.replace(/,/g, ",#")).each(function () {
            $(this).attr('checked', true);
            $(this).prop('checked', true);
        });
        if (data.TRANGTHAISINHVIEN_IDS) {
            if (data.TRANGTHAISINHVIEN_IDS.length > 100) {
                data.TRANGTHAISINHVIEN_IDS.split(',').forEach(e => {
                    console.log(("#DSTrangThaiSV #" + e))
                    $("#DSTrangThaiSV #" + e).each(function () {
                        $(this).attr('checked', true);
                        $(this).prop('checked', true);
                    });
                });
            } else {
                $("#DSTrangThaiSV #" + data.TRANGTHAISINHVIEN_IDS.replace(/,/g, ",#")).each(function () {
                    $(this).attr('checked', true);
                    $(this).prop('checked', true);
                });
            }
        }

        if (data.DSNGUYENVONGLUACHON_ID) $("#divNguyenVongUuTien #" + data.DSNGUYENVONGLUACHON_ID.replace(/,/g, ",#")).each(function () {
            $(this).attr('checked', true);
            $(this).prop('checked', true);
        });
        $("#divQDHuyHocPhan #QDHuyHocPhan_" + data.CHOPHEPNGUOCHOCHUYHOCPHAN).trigger("click");
        $("#divQDCoVanDangKyChoSV #CoVanDangKy_" + data.KHONGCHOPHEPCOVANDANGKY).trigger("click");
        $("#divKTTCTD #TCTD_" + data.KIEMTRASOTINCHITOIDA).trigger("click");
        $("#divKTTCTT #TCTT_" + data.KIEMTRASOTINCHITOITHIEU).trigger("click");
        $("#divKiemTraTrungLich #KTTrungLich_" + data.KIEMTRATRUNGLICH).trigger("click");
        $("#divKiemTraTrungLop #KTTrungLop_" + data.KIEMTRATRUNGLOPKHONGXEP).trigger("click");
        $("#divDKMR #DKMR_" + data.CHOPHEPDANGKYNGOAICHUONGTRINH).trigger("click");
        $("#divDKHPTD #DKHPTD_" + data.CHOPHEPDANGKYHPTUONGDUONG).trigger("click");
        $("#divDoiHocPhan #DoiHocPhan_" + data.KHONGCHOPHEPDOILOPHOCPHAN).trigger("click");
        $("#divDKMotLanTrongKy #DKMotLanTrongKy_" + data.CHIDANGKYMOTLANTRONGKY).trigger("click");
        //$("#divDangKyNhieuLanTrongDot #DKMotLanTrongKyDangKyNhieuLanTrongDot_" + data.CHIDANGKYMOTLANTRONGKY).attr("checked", "checked");
        $("#divKRDKTQ #KRDKTQ_" + data.KIEMTRARANGBUOCHOCPHAN).trigger("click");
        $("#divHDHT #HDHT_" + data.KIEMTRADINHHUONGHOCTAP).trigger("click");
        $("#divQuyDinhKiemTraTaiChinh #" + data.QUYDINHKIEMTRAHOCPHI_ID).trigger("click");


        $("#chkTinhHocPhan").prop("checked", data.APDUNGLUUBANGTAMHOCPHAN);
        $("#chkTinhTaiChinh").prop("checked", data.APDUNGLUUBANGTAMTAICHINH);
        $("#chkTinhLopHocPhan").prop("checked", data.APDUNGLUUBANGTAMLOPHOCPHAN);
        edu.util.viewValById("txtNgayBatDauXN", data.NGAYBATDAUXACNHAN);
        edu.util.viewValById("txtNgayKetThucXN", data.NGAYKETTHUCXACNHAN);

        function UpdateCheck(strZoneId, strKetQua) {
            $(strZoneId + " input").each(function () {
                $(this).attr('checked', false);
                $(this).prop('checked', false);
            });
            setTimeout(function () {
                $(strZoneId + " #" + strKetQua).attr("checked", true);
                $(strZoneId + " #" + strKetQua).prop("checked", true);
            }, 200);
        }
    },

    /*----------------------------------------------
    --Date of created: 2
    --Discription: genCombo NamHoc
    ----------------------------------------------*/
    getList_NamHoc: function () {
        var me = main_doc.KeHoachDangKy;

        //--Edit
        var obj_list = {
            'action': 'KHCT_NamHoc/LayDanhSach',
            

            'strTuKhoa': "",
            'strNguoiThucHien_Id': "",
            'strCanBoNhapDeTai_Id': "",
            'pageIndex': 1,
            'pageSize': 10000000
        };

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genCombo_NamHoc(dtResult, iPager);
                }
                else {
                    edu.system.alert("KHCT_NamHoc/LayDanhSach: " + data.Message, "w");
                }
                
            },
            error: function (er) {
                edu.system.alert("KHCT_NamHoc/LayDanhSach (er): " + JSON.stringify(er), "w");
                
            },
            type: "GET",
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_NamHoc: function (data) {
        var me = main_doc.KeHoachDangKy;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "NAMHOC",
                code: "NAMHOC",
                order: "unorder"
            },
            renderPlace: ["dropThoiGian_Nam"],
            title: "Chọn năm học"
        };
        edu.system.loadToCombo_data(obj);
    },
    /*----------------------------------------------
    --Date of created: 
    --Discription: genCombo HocKy
    ----------------------------------------------*/
    getList_ThoiGianDaoTao: function () {
        var me = main_doc.KeHoachDangKy;

        //--Edit
        var obj_list = {
            'action': 'KHCT_ThoiGianDaoTao/LayDanhSach',
            

            'strTuKhoa':"",
            'strDAOTAO_NAM_Id': edu.util.getValById("dropThoiGian_Nam"),
            'strNguoiThucHien_Id': "",
            'pageIndex':1,
            'pageSize': 100000
        };

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    dtResult = dtResult.filter(e => e.HOCKY && !e.THANG && !e.DOTHOC);
                    me.genCombo_ThoiGianDaoTao(dtResult, iPager);
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
            async: false,
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_ThoiGianDaoTao: function (data) {
        var me = main_doc.KeHoachDangKy;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "HOCKY",
                code: "HOCKY",
                order: "unorder"
            },
            renderPlace: ["dropThoiGian_Ky"],
            title: "Chọn học kỳ"
        };
        edu.system.loadToCombo_data(obj);
    },
    /*----------------------------------------------
    --Date of created: 
    --Discription: genCombo DotHoc
    ----------------------------------------------*/
    getList_DotHoc: function () {
        var me = main_doc.KeHoachDangKy;

        //--Edit
        var obj_list = {
            'action': 'KHCT_DotHoc/LayDanhSach_RutGon',
            
            
            'strDaoTao_HocKy_Id': edu.util.getValById("dropThoiGian_Ky"),
        };

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genCombo_DotHoc(dtResult, iPager);
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
            async: false,
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_DotHoc: function (data) {
        var me = main_doc.KeHoachDangKy;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DOTHOC",
                code: "DOTHOC",
                order: "unorder"
            },
            renderPlace: ["dropThoiGian_Dot"],
            title: "Chọn đợt học"
        };
        edu.system.loadToCombo_data(obj);
    },

    getList_ThoiGianDaoTao_S: function () {
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
        var me = main_doc.KeHoachDangKy;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ThoiGianDaoTao"],
            type: "",
            title: "Tất cả học kỳ",
        }
        edu.system.loadToCombo_data(obj);
    },
    genList_TrangThaiSV: function (data) {
        var me = this;
        main_doc.KeHoachDangKy.dtTrangThai = data;
        var row = '';
        row += '<div class="col-lg-4 checkbox-inline user-check-print">';
        row += '<input type="checkbox" class="ckbDSTrangThaiSV_ALL" style="float: left;" />';
        row += '<span><b>Tất cả</b></p></span>';
        row += '</div>';
        for (var i = 0; i < data.length; i++) {
            var strcheck = "";
            //if (dataKhoanThu[i].TEN.includes('ọc phí') || dataKhoanThu[i].TEN.includes('inh phí')) strcheck = 'checked="checked"'
            row += '<div class="col-lg-4 checkbox-inline user-check-print">';
            row += '<input type="checkbox" style="float: left;"  id="' + data[i].ID + '" class="ckbDSTrangThaiSV" title="' + data[i].TEN + '"' + strcheck + '/>';
            row += '<span><p>' + data[i].TEN + '</p></span>';
            row += '</div>';
        }
        $("#DSTrangThaiSV").html(row);
    },

    /*----------------------------------------------
    --Date of created: 
    --Discription: genCombo DotHoc
    ----------------------------------------------*/

    getList_QuanSoTheoLop: function (strId) {
        var me = this;
        var obj_list = {
            'action': 'DKH_KeHoachDangKy/LayDSNguoiHocDangKy_KeHoach',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDangKy_KeHoachDangKy_Id': strId,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_QuanSoTheoLop(dtReRult);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
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

    genTable_QuanSoTheoLop: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblQuanSoLop",
            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "QLSV_NGUOIHOC_MASO"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_HODEM"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_TEN"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_NGAYSINH"
                },
                {
                    "mDataProp": "DANGKY_LOPHOCPHAN_MA"
                },
                {
                    "mDataProp": "DANGKY_LOPHOCPHAN_TEN"
                },
                {
                    "mDataProp": "DAOTAO_LOPQUANLY_TEN"
                },
                {
                    "mDataProp": "KIEUHOC_TEN"
                },
                {
                    "mDataProp": "DAOTAO_HOCPHAN_HOCTRINH"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        /*III. Callback*/
    },

    /*----------------------------------------------
    --Date of created: 
    --Discription: genCombo DotHoc
    ----------------------------------------------*/

    getList_KhongDangKy: function (strId) {
        var me = this;
        var obj_list = {
            'action': 'DKH_BaoCao/LayDSKhongDangKy',
            'type': 'GET',
            'strDangKy_KeHoachDangKy_Id': strId,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_KhongDangKy(dtReRult);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
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

    genTable_KhongDangKy: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblKhongDangKy",
            aaData: data,
            colPos: {
                center: [0],
                right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "QLSV_NGUOIHOC_MASO"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_HODEM"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_TEN"
                },
                {
                    "mDataProp": "QLSV_TRANGTHAI_TEN"
                },
                {
                    //"mDataProp": "TONGNOPHI",
                    mRender: function (nRow, aData) {
                        return edu.util.formatCurrency(aData.TONGNOPHI)
                    }
                },
                {
                    "mDataProp": "DAOTAO_TOCHUCCHUONGTRINH_TEN"
                },
                {
                    "mDataProp": "DAOTAO_KHOADAOTAO_TEN"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        /*III. Callback*/
    },

    /*------------------------------------------
    --Discription: [2] AccessDB _ThanhVien
    --ULR:  Modules
    -------------------------------------------*/
    save_ThanhVien: function (strNhanSu_Id, strSach_Id) {
        var me = this;
        var obj_save = {
            'action': 'DKH_KeHoach_NhanSu/Them_DangKy_KeHoach_NhanSu',
            'type': 'POST',

            'strId': $("#rm_row" + strNhanSu_Id).attr("name"),
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strNguoiDung_Id': strNhanSu_Id,
            'strVaiTro_Id': edu.util.getValById('dropAAAA'),
            'dKhongKiemTraSoTinChiToiDa': edu.util.getValById('txtTinChiToiDa_' + strNhanSu_Id),
            'dKhongKiemTraSTCToiThieu': edu.util.getValById('txtTinChiToiThieu_' + strNhanSu_Id),
            'dKhongKiemTraTTHocPhi': edu.util.getValById('txtHocPhan_' + strNhanSu_Id),
            'dKhongKiemTraSiSo': edu.util.getValById('txtSiSoToiDa_' + strNhanSu_Id),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'DKH_KeHoach_NhanSu/Sua_DangKy_KeHoach_NhanSu';
        }
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
                edu.system.alert(JSON.stringify(er));
            },
            type: 'POST',
            contentType: true,

            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_ThanhVien: function () {
        var me = this;
        var obj_list = {
            'action': 'DKH_KeHoach_NhanSu/LayDSDangKy_KeHoach_NhanSu',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strVaiTro_Id': edu.util.getValById('dropAAAA'),
            'strNguoiDung_Id': edu.util.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                    }
                    me.genTable_ThanhVien(dtResult);
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
    delete_ThanhVien: function (strNhanSu_Id) {
        var me = this;
        var obj = {};
        var obj_delete = {
            'action': 'DKH_KeHoach_NhanSu/Xoa_DangKy_KeHoach_NhanSu',
            
            'strIds': strNhanSu_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                    me.getList_ThanhVien();
                }
                else {
                    obj = {
                        content: "DKH_KeHoach_NhanSu/Xoa_DangKy_KeHoach_NhanSu: " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
            },
            error: function (er) {
                var obj = {
                    content: "DKH_KeHoach_NhanSu/Xoa_DangKy_KeHoach_NhanSu (er): " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: 'POST',
            action: obj_delete.action,

            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [2] GenHTML ThanhVien/NhanSu
    --ULR:  Modules
    -------------------------------------------*/
    genTable_ThanhVien: function (data) {
        var me = this;
        //3. create html
        me.arrNhanSu_Id = [];
        $("#tblInput_TTS_ThanhVien tbody").html("");
        for (var i = 0; i < data.length; i++) {
            var strNhanSu_Id = data[i].NGUOIDUNG_ID;
            var html = "";
            html += "<tr id='rm_row" + data[i].NGUOIDUNG_ID + "' name='" + data[i].ID +"'>";
            html += "<td class='td-center'>" + (i + 1) + "</td>";
            html += "<td class='td-left'><span>" + data[i].NGUOIDUNG_TAIKHOAN + "</span></td>";
            html += "<td><input class='form-control' id='txtTinChiToiDa_" + strNhanSu_Id + "' value='" + edu.util.returnEmpty(data[i].KHONGKIEMTRASOTINCHITOIDA) + "' ></input></td>";
            html += "<td><input class='form-control' id='txtTinChiToiThieu_" + strNhanSu_Id + "' value='" + edu.util.returnEmpty(data[i].KHONGKIEMTRASOTINCHITOITHIEU) + "'></input></td>";
            html += "<td><input class='form-control' id='txtHocPhan_" + strNhanSu_Id + "' value='" + edu.util.returnEmpty(data[i].KHONGKIEMTRATINHTRANGHOCPHI) + "'></input></td>";
            html += "<td><input class='form-control' id='txtSiSoToiDa_" + strNhanSu_Id + "' value='" + edu.util.returnEmpty(data[i].KHONGKIEMTRASISOTOIDA) + "'></input></td>";
            html += "<td class='td-center'><a id='remove_nhansu" + data[i].ID + "' name='true' class='btnDeletePoiter'><i class='fa fa-trash'></i></a></td>";
            html += "</tr>";
            //4. fill into tblNhanSu
            $("#tblInput_TTS_ThanhVien tbody").append(html);
            //5. create data danhmucvaitro
            me.arrNhanSu_Id.push(data[i].ID);
        }
    },
    genHTML_NhanSu: function (strNhanSu_Id, bcheckadd) {
        var me = this;
        if (bcheckadd == true && me.arrNhanSu_Id.length > 0) return; //Nếu có dữ liệu thành viên thì bỏ qua
        //[1] add to arrNhanSu_Id
        if (edu.util.arrEqualVal(me.arrNhanSu_Id, strNhanSu_Id)) {
            obj_notify = {
                renderPlace: "slnhansu" + strNhanSu_Id,
                type: "w",
                title: "Đã tồn tại!"
            };
            edu.system.notifyLocal(obj_notify);
            return false;
        }
        else {
            obj_notify = {
                renderPlace: "slnhansu" + strNhanSu_Id,
                type: "s",
                title: "Đã chọn!"
            };
            edu.system.notifyLocal(obj_notify);
            me.arrNhanSu_Id.push(strNhanSu_Id);
        }
        //2. get id and get val
        var $hinhanh = "#sl_hinhanh" + strNhanSu_Id;
        var $hoten = "#sl_hoten" + strNhanSu_Id;
        var $ma = "#sl_ma" + strNhanSu_Id;
        var valHinhAnh = $($hinhanh).attr("src");
        var valHoTen = $($hoten).text();
        var valMa = $($ma).text();
        console.log(1111111);
        //3. create html
        var html = "";
        html += "<tr id='rm_row" + strNhanSu_Id + "' name=''>";
        html += "<td class='td-center'>--</td>";
        html += "<td class='td-left'><span>" + valHoTen + "</span> - <span>" + valMa + "</span></td>";
        html += "<td><input class='form-control' id='txtTinChiToiDa_" + strNhanSu_Id + "'></input></td>";
        html += "<td><input class='form-control' id='txtTinChiToiThieu_" + strNhanSu_Id + "'></input></td>";
        html += "<td><input class='form-control' id='txtHocPhan_" + strNhanSu_Id + "'></input></td>";
        html += "<td><input class='form-control' id='txtSiSoToiDa_" + strNhanSu_Id + "'></input></td>";
        html += "<td class='td-center'><a id='remove_nhansu" + strNhanSu_Id + "' class='btnDeletePoiter'><i class='fa fa-trash'></i></a></td>";
        html += "</tr>";
        //4. fill into tblNhanSu
        $("#tblInput_TTS_ThanhVien tbody").append(html);
    },
    removeHTML_NhanSu: function (strNhanSu_Id) {
        var me = this;
        var $remove_row = "#rm_row" + strNhanSu_Id;
        console.log("$remove_row: " + $remove_row);
        $($remove_row).remove();
        edu.util.arrExcludeVal(me.arrNhanSu_Id, strNhanSu_Id);
        if (me.arrNhanSu_Id.length === 0) {
            $("#tblInput_TTS_ThanhVien tbody").html("");
            $("#tblInput_TTS_ThanhVien tbody").html('<tr><td colspan="6">Không tìm thấy dữ liệu!</td></tr>');
        }
    },

    getList_NguyenVongUuTien: function (strId) {
        var me = this;
        var obj_list = {
            'action': 'DKH_Chung/LayDSKeHoachDKNV',
            'type': 'GET',
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_NguyenVongUuTien(dtReRult);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
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
    genTable_NguyenVongUuTien: function (data, iPager) {
        var me = this;
        var zone_id = "divNguyenVongUuTien";
        var jsonResult = data.Data;
        if (edu.util.checkValue(jsonResult)) {
            //zone_id 
            var row = '';
            //call
            if (typeof callback === "function") {
                callback(jsonResult);
                return;
            }
            if (type == undefined) {
                type = 12 / (jsonResult.length);
            }
            if (typeof (type) == 'object' && type.length == jsonResult.length) {
                for (var i = 0; i < jsonResult.length; i++) {
                    row += '<div class="col-sm-' + type[i] + '"><input id="' + jsonResult[i].ID + '" type="checkbox" name="' + jsonResult[i].CHUNG_TENDANHMUC_MA + '" value="' + jsonResult[i].MA + '"><label for="' + jsonResult[i].ID + '"> ' + jsonResult[i].TEN + '</label></div>';
                }
                $("#" + zone_id).html(row);
                return;
            }
            for (var i = 0; i < jsonResult.length; i++) {
                row += '<div class="col-sm-' + type + '"><input id="' + jsonResult[i].ID + '" type="checkbox" name="' + jsonResult[i].CHUNG_TENDANHMUC_MA + '" value="' + jsonResult[i].MA + '"><label for="' + jsonResult[i].ID + '"> ' + jsonResult[i].TEN + '</label></div>';
            }
            $("#" + zone_id).html(row);
        }
        /*III. Callback*/
    },
    
    getList_HeDaoTao: function () {
        var me = this;
        var objList = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_HeDaoTao(objList, "", "", me.cbGenCombo_HeDaoTao);
    },
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
            renderPlace: ["dropSearch_HeDaoTao_PCKhoaHoc", "dropSearch_HeDaoTao_PCChuongTrinh", "dropSearch_HeDaoTao_PCNKS"],
            type: "",
            title: "Chọn hệ đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },

    getList_KhoaDaoTao: function (strDaoTao_HeDaoTao_Id) {
        var me = this;
        var obj_save = {
            'action': 'DKH_ThongTin2_MH/DSA4BRIKKS4gBSAuFSAu',
            'func': 'PKG_DANGKYHOC_THONGTIN2.LayDSKhoaDaoTao',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDaoTao_HeDaoTao_Id': strDaoTao_HeDaoTao_Id,
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
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
                            name: "TENKHOA",
                            code: "", 
                            avatar: ""
                        },
                        renderPlace: ["dropSearch_KhoaDaoTao_PCChuongTrinh"],
                        type: "",
                        title: "Chọn khóa đào tạo",
                    });

                    var jsonForm = {
                        strTable_Id: "tblPCNhomKiemSoat",
                        aaData: data.Data,
                        colPos: {
                            center: [0,3],
                            //right: [5]
                        },
                        aoColumns: [
                            {
                                "mDataProp": "MAKHOA"
                            },
                            {
                                "mDataProp": "TENKHOA"
                            }
                            , {
                                "mRender": function (nRow, aData) {
                                    return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                                }
                            }
                        ]
                    };
                    edu.system.loadToTable_data(jsonForm);
                    jsonForm.strTable_Id = "tblPCKhoaHoc"
                    edu.system.loadToTable_data(jsonForm);
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
    getList_ChuongTrinh: function (strDaoTao_HeDaoTao_Id) {
        var me = this;
        var obj_save = {
            'action': 'DKH_ThongTin2_MH/DSA4BRICKTQuLyYVMygvKQPP',
            'func': 'PKG_DANGKYHOC_THONGTIN2.LayDSChuongTrinh',
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strDaoTao_HeDaoTao_Id': edu.system.getValById('dropSearch_HeDaoTao_PCChuongTrinh'),
            'strDaoTao_KhoaDaoTao_Id': edu.system.getValById('dropSearch_KhoaDaoTao_PCChuongTrinh'),
            'strDangKy_KeHoachDangKy_Id': me.strKeHoachDangKy_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {

                    var jsonForm = {
                        strTable_Id: "tblPCChuongTrinh",
                        aaData: data.Data,
                        colPos: {
                            center: [0, 3],
                            //right: [5]
                        },
                        aoColumns: [
                            {
                                "mDataProp": "MACHUONGTRINH"
                            },
                            {
                                "mDataProp": "TENCHUONGTRINH"
                            }
                            , {
                                "mRender": function (nRow, aData) {
                                    return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                                }
                            }
                        ]
                    };
                    edu.system.loadToTable_data(jsonForm);
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
};