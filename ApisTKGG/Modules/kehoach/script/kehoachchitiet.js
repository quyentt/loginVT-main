/*----------------------------------------------
--Author: 
--Phone: 
--Date of created: 10/12/2018
--Note: su dung bien do_table de phan biet dang thao tac (insert, delete, update) voi bang csdl nao duoi db
--Note: [strCommon_Id - lu tam cac id dang xu ly, vi du nhu chinh sua, xoa, ..]
----------------------------------------------*/
function KeHoachChiTiet() { };
KeHoachChiTiet.prototype = {
    strKeHoachChiTiet_Id: '',
    dtKeHoachChiTiet: [],
    objHangDoi_TinhKL: {},
    objHangDoi_TinhTien: {},
    init: function () {
        var me = this;
        me.getList_PhanLoai();
        me.getList_ThoiGian();
        me.getList_KeHoachChung();
        me.getList_CBKeHoachChiTiet();
        //me.getList_KeHoachChiTiet();
        edu.system.loadToCombo_DanhMucDuLieu("KLGD.CHEDO", "dropCheDoApDung");
        $("#btnSearch").click(function (e) {
            me.getList_KeHoachChiTiet();
        });
        $("#txtSearch").keypress(function (e) {
            if (e.which === 13) {
                me.getList_KeHoachChiTiet();
            }
        });
        $(".btnClose").click(function () {
            me.toggle_form();
        });
        $(".btnAdd").click(function () {
            me.rewrite();
            me.toggle_edit();
        });
        $("#btnSave_KeHoachChiTiet").click(function (e) {
            me.save_KeHoachChiTiet();
        });
        $("[id$=chkSelectAll_KeHoachChiTiet]").on("click", function () {
            edu.util.checkedAll_BgRow(this, { table_id: "tblKeHoachChiTiet" });
        });
        $("#btnDelete_KeHoachChiTiet").click(function () {
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                me.delete_KeHoachChiTiet(me.strKeHoachChiTiet_Id);
            });
        });
        $("#tblKeHoachChiTiet").delegate('.btnEdit', 'click', function (e) {
            var strId = this.id;
            me.toggle_edit();
            strId = edu.util.cutPrefixId(/edit/g, strId);
            me.strKeHoachChiTiet_Id = strId;
            edu.util.setOne_BgRow(strId, "tblKeHoachChiTiet");
            if (edu.util.checkValue(strId)) {
                var data = edu.util.objGetDataInData(strId, me.dtKeHoachChiTiet, "ID")[0];
                me.viewEdit_KeHoachChiTiet(data);
            }
            else {
                edu.system.alert(edu.constant.getting("NOTIFY", "SELECT_F"));
            }
        });
        
        $("#tblKeHoachChiTiet").delegate('.btnNhanSu', 'click', function (e) {
            var strId = this.id;
            me.strKeHoachChiTiet_Id = strId;
            me.dtCanBoChiTiet = [];
            $("#tblCanBo tbody").html("");
            me.getList_NhanSuChiTiet(strId);
            $("#myModalCanBo").modal("show");
        });

        $("#dropSearch_ThoiGian").on("select2:select", function () {
            me.getList_KeHoachChung();
        });
        $("#dropSearch_KeHoach").on("select2:select", function () {
            me.getList_KeHoachChiTiet();
        });

        
        /*------------------------------------------
       --Discription: [4-1] Action KetQua_Detai
       --Order:
       -------------------------------------------*/
        /*------------------------------------------
         --Discription: Load Select 
         -------------------------------------------*/
        //var obj_Queue = {
        //    strLoaiNhiemVu: "TINHPHITUDONG"
        //}
        //edu.system.getList_HangDoi(obj_Queue, "", "", me.genHTML_HangDoi);
        me.objHangDoi_TinhKL = {
            strLoaiNhiemVu: "TINH_KLGD",
            strName: "TinhKhoiLuong",
            callback: function () {
                me.getList_KeHoachChiTiet();
            }
        };
        edu.system.createHangDoi(me.objHangDoi_TinhKL);
        /*------------------------------------------
        --Author: nnthuong
        --Discription: main action  
        -------------------------------------------*/
        $("#btnTinhKhoiLuong").click(function () {
            edu.system.confirm("Bạn có chắc chắn <span class='italic color-warning'>Tính khối lượng</span> không?");
            $("#btnYes").click(function (e) {
                me.TaoHangDoi_TinhHocPhi_TuDong();
            });

        });
        me.objHangDoi_TinhTien = {
            strLoaiNhiemVu: "TINHPHI_KLGD",
            strName: "TinhTien",
            callback: me.endHangDoi
        };
        edu.system.createHangDoi(me.objHangDoi_TinhTien);
        $("#btnTaoHangDoi").click(function () {
            edu.system.confirm("Bạn có chắc chắn <span class='italic color-warning'>Thực hiện tính</span> không?");
            $("#btnYes").click(function (e) {
                me.TaoHangDoi_TinhTien_TuDong();
            });

        });


        /*------------------------------------------
        --Discription: Nhân sự tham gia kế hoạch chi tiết (modal #myModalCanBo)
        -- Thêm cán bộ: đóng #myModalCanBo -> mở modal chọn nhân sự dùng chung -> form tiến trình (mỗi cán bộ 1 lời gọi Them_KLGD_KeHoachChiTiet_NS)
        -- Xóa: các dòng đang tick -> form tiến trình (mỗi dòng 1 lời gọi Xoa_KLGD_KeHoachChiTiet_NS); Bước 1 của form thay hộp "Bạn có chắc chắn"
        -- Đóng form thì nạp lại danh sách nhân sự (nếu có bản ghi thành công) và mở lại #myModalCanBo
        -------------------------------------------*/
        $("#btnAdd_PhanCong").click(function () {
            var strKeHoach_Id = me.strKeHoachChiTiet_Id;
            if (!strKeHoach_Id) {
                me._notifyCanBo("Chưa xác định kế hoạch, vui lòng đóng và mở lại danh sách nhân sự.");
                return;
            }
            var bDaChon = false;
            var openPicker = function () {
                // Đóng modal chọn mà không chọn ai -> mở lại danh sách nhân sự
                $("#modal_nhansu").off("hidden.bs.modal.khctns").one("hidden.bs.modal.khctns", function () {
                    if (!bDaChon) $("#myModalCanBo").modal("show");
                });
                edu.extend.genModal_NguoiDung(function (arrChecked_Id) {
                    if (arrChecked_Id.length == 0) {
                        $("#modal_nhansu #zoneprocessProGes").html('<div class="alert alert-warning mt-10 mb-10">Vui lòng tick chọn cán bộ cần thêm.</div>');
                        return;
                    }
                    bDaChon = true;
                    var map = {};
                    (edu.extend.dtNguoiDung || []).forEach(function (r) { map[r.ID] = r; });
                    me._run({
                        hideModal: "#modal_nhansu",
                        reopenModal: "#myModalCanBo",
                        title: "Thêm nhân sự tham gia kế hoạch", unit: "cán bộ", fileName: "KetQuaThemNhanSu_KeHoachChiTiet",
                        subTitles: ["Kế hoạch: " + me._tenKeHoach(strKeHoach_Id)],
                        items: arrChecked_Id.map(function (id) { return { ID: id, row: map[id] || {} }; }),
                        columns: [
                            { header: "Tài khoản", render: function (it) { return it.row.TAIKHOAN || it.ID; } },
                            { header: "Họ tên", render: function (it) { return it.row.TENDAYDU; } }
                        ],
                        request: function (it) { return me.req_PhanCong(it.ID, strKeHoach_Id); },
                        refresh: function () { me.getList_NhanSuChiTiet(strKeHoach_Id); }
                    });
                });
                edu.extend.getList_NguoiDungP();
            };
            // Không mở modal chồng modal (BS3 mất body.modal-open): đóng hẳn #myModalCanBo rồi mới mở modal chọn
            var $m = $("#myModalCanBo"), inst = $m.data("bs.modal");
            if (inst && inst.isShown) {
                $m.one("hidden.bs.modal", openPicker);
                $m.modal("hide");
            }
            else openPicker();
        });
        $("#btnDelete_PhanCong").click(function () {
            var strKeHoach_Id = me.strKeHoachChiTiet_Id;
            var arrSelected = me._selected("tblCanBo", me.dtCanBoChiTiet);
            if (arrSelected.length == 0) {
                me._notifyCanBo("Vui lòng chọn đối tượng cần xóa.");
                return;
            }
            me._run({
                hideModal: "#myModalCanBo",
                reopenModal: "#myModalCanBo",
                title: "Xóa nhân sự tham gia kế hoạch", unit: "cán bộ", fileName: "KetQuaXoaNhanSu_KeHoachChiTiet",
                subTitles: ["Kế hoạch: " + me._tenKeHoach(strKeHoach_Id)],
                notes: ["Thao tác xóa các cán bộ trong danh sách khỏi nhân sự tham gia kế hoạch."],
                items: arrSelected,
                columns: [
                    { header: "Mã số", render: function (r) { return r.NGUOIDUNG_MASO; } },
                    { header: "Họ tên", render: function (r) { return edu.util.returnEmpty(r.NGUOIDUNG_HODEM) + " " + edu.util.returnEmpty(r.NGUOIDUNG_TEN); } }
                ],
                request: function (it) { return me.req_PhanCong_Xoa(it.ID); },
                refresh: function () { me.getList_NhanSuChiTiet(strKeHoach_Id); }
            });
        });
    },

    /*------------------------------------------
    --Discription: Chạy hàng loạt qua form tiến trình chung (Corei/processrun.js, edu.process)
    -------------------------------------------*/
    _run: function (cfg) {
        if (!edu.process) {
            edu.system.alert("Chưa cập nhật form tiến trình (thiếu Corei/processrun.js hoặc indexi.aspx).", "w");
            return;
        }
        edu.process.run(cfg);
    },
    // Các dòng đang tick ở bảng strTableId, lấy đủ dữ liệu từ arrData (tra theo ID)
    _selected: function (strTableId, arrData) {
        if (edu.process) return edu.process.selectedRows(strTableId, arrData);
        var map = {};
        (arrData || []).forEach(function (r) { map[r.ID] = r; });
        return edu.util.getArrCheckedIds(strTableId, "checkX").map(function (id) { return map[id]; }).filter(function (r) { return !!r; });
    },
    _tenKeHoach: function (strId) {
        var r = edu.util.objGetDataInData(strId, this.dtKeHoachChiTiet || [], "ID")[0];
        return r ? edu.util.returnEmpty(r.TEN) : "";
    },
    // Thông báo ngay trong modal nhân sự (alert popup chồng lên modal BS3 làm hỏng modal bên dưới)
    _notifyCanBo: function (strNoiDung) {
        edu.system.alertOnModal({ type: "w", content: strNoiDung, prePos: "#myModalCanBo #notify" });
    },

    rewrite: function () {
        //reset id
        var me = this;
        $("#zoneKeHoachChiTiet").hide();
        //edu.util.viewValById("dropHoatDong", "");
        var data = {};
        edu.util.viewValById("txtTen", data.TEN);
        edu.util.viewValById("dropKeHoachChung", data.KLGD_TONGHOPKHOILUONG_ID);
        edu.util.viewValById("dropThoiGian", data.DAOTAO_THOIGIANDAOTAO_ID);
        edu.util.viewValById("txtTuNgay", data.TUNGAY);
        edu.util.viewValById("txtDenNgay", data.DENNGAY);
        edu.util.viewValById("dropPhanLoai", data.PHANLOAI_ID);
        edu.util.viewValById("dropCheDoApDung", data.CHEDOAPDUNG_ID);
        edu.util.viewValById("dropHienThiCongGV", data.HIENTHICONGGIANVIEN);
        edu.util.viewValById("dropKeHoachKeThua", data.KLGD_KHCHITIET_KEYTHUA_ID);
        edu.util.viewValById("txtMoTa", data.MOTA);
        me.strKeHoachChiTiet_Id = "";
    },
    toggle_form: function () {
        edu.util.toggle_overide("zone-bus", "zonebatdau");
    },
    toggle_edit: function () {
        edu.util.toggle_overide("zone-bus", "zoneEdit");
    },

    TaoHangDoi_TinhHocPhi_TuDong: function () {
        var me = this;
        var obj_notify = {};
        var arrChecked_Id = edu.util.getArrCheckedIds("tblKeHoachChiTiet", "checkX");
        //--Edit
        var obj_save = {
            'action': 'TKGG_HangDoi/TaoHangDoi_Tinh_KLGD_TuDong',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtSearch'),
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strKLGD_KeHoachChiTiet_Id': arrChecked_Id.toString(),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var obj = {
                        content: "Khởi tạo dữ liệu thành công, vui lòng chạy tiến trình để thực hiện!",
                        code: "",
                    }
                    edu.system.afterComfirm(obj);
                    edu.system.createHangDoi(me.objHangDoi_TinhKL);
                }
                else {
                    var obj = {
                        content: " " + data.Message,
                        code: "w",
                    }
                    edu.system.afterComfirm(obj);
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
                var obj = {
                    content: " (er): " + JSON.stringify(er),
                    code: "w",
                }
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_save.action,
            versionAPI: obj_save.versionAPI,
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    TaoHangDoi_TinhTien_TuDong: function () {
        var me = this;
        var obj_notify = {};
        var arrChecked_Id = edu.util.getArrCheckedIds("tblKeHoachChiTiet", "checkX");
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_HangDoi_MH/FSAuCSAvJgUuKB4VKC8pESkoHgoNBgUeFTQFLi8m',
            'func': 'KLGD_V2_NHIEMVU_HANGDOI.TaoHangDoi_TinhPhi_KLGD_TuDong',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtSearch'),
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strKLGD_KeHoachChiTiet_Id': arrChecked_Id.toString(),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var obj = {
                        content: "Khởi tạo dữ liệu thành công, vui lòng chạy tiến trình để thực hiện!",
                        code: "",
                    }
                    edu.system.afterComfirm(obj);
                    edu.system.createHangDoi(me.objHangDoi_TinhTien);
                }
                else {
                    var obj = {
                        content: " " + data.Message,
                        code: "w",
                    }
                    edu.system.afterComfirm(obj);
                }
                edu.system.endLoading();
            },
            error: function (er) {
                edu.system.endLoading();
                var obj = {
                    content: " (er): " + JSON.stringify(er),
                    code: "w",
                }
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_save.action,
            versionAPI: obj_save.versionAPI,
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    getList_KeHoachChiTiet: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSKLGD_KeHoachChiTiet',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropSearch_ThoiGian'),
            'strKLGD_TongHopKhoiLuong_Id': edu.util.getValById('dropSearch_KeHoach'),
            'strCheDoApDung_Id': edu.util.getValById('dropAAAA'),
            'strPhanLoai_Id': edu.util.getValById('dropSearch_PhanLoai'),
            'strTuNgay': edu.util.getValById('txtAAAA'),
            'strDenNgay': edu.util.getValById('txtAAAA'),
            'dHieuLuc': -1,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtKeHoachChiTiet = dtReRult;
                    me.genTable_KeHoachChiTiet(dtReRult, data.Pager);
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
    save_KeHoachChiTiet: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'NS_KLGD_KeHoach_MH/FSkkLB4KDQYFHgokCS4gIikCKSgVKCQ1',
            'func': 'PKG_KLGV_V2_KEHOACH.Them_KLGD_KeHoachChiTiet',
            'iM': edu.system.iM,
            'strId': me.strKeHoachChiTiet_Id,
            'strTen': edu.util.getValById('txtTen'),
            'strMoTa': edu.util.getValById('txtMoTa'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropThoiGian'),
            'dHieuLuc': 1,
            'strKLGD_TongHopKhoiLuong_Id': edu.util.getValById('dropKeHoachChung'),
            'strTuNgay': edu.util.getValById('txtTuNgay'),
            'strDenNgay': edu.util.getValById('txtDenNgay'),
            'strCheDoApDung_Id': edu.util.getValById('dropCheDoApDung'),
            'strPhanLoai_Id': edu.util.getValById('dropPhanLoai'),
            'dHienThiCongGianVien': edu.util.getValById('dropHienThiCongGV'),
            'strKLGD_KHChiTiet_KeyThua_Id': edu.system.getValById('dropKeHoachKeThua'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_KLGD_KeHoach_MH/EjQgHgoNBgUeCiQJLiAiKQIpKBUoJDUP';
            obj_save.func = 'PKG_KLGV_V2_KEHOACH.Sua_KLGD_KeHoachChiTiet';
        }
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var strKeHoachChiTiet_Id = "";

                    if (obj_save.strId == "") {
                        edu.system.alert("Thêm mới thành công!");
                        strKeHoachChiTiet_Id = data.Id;
                    }
                    else {
                        edu.system.alert("Cập nhật thành công!");
                        strKeHoachChiTiet_Id = obj_save.strId;
                    }

                    me.toggle_form();
                    //$("#tblQuyetDinh tbody tr").each(function () {
                    //    var strKetQua_Id = this.id.replace(/rm_row/g, '');
                    //    me.save_QuyetDinh(strKetQua_Id, strKeHoachChiTiet_Id);
                    //});
                    //for (var i = 0; i < me.dtTuNhapHoSo.length; i++) {
                    //    me.save_TuNhapHoSo(me.dtTuNhapHoSo[i], strKeHoachChiTiet_Id);
                    //}
                }
                else {
                    edu.system.alert(data.Message);
                }

                me.getList_KeHoachChiTiet();
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
    delete_KeHoachChiTiet: function (strId) {
        var me = this;
        //--Edit
        var obj = {};
        var obj_delete = {
            'action': 'TKGG_KeHoach/Xoa_KLGD_KeHoachChiTiet',


            'strIds': strId,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                    me.getList_KeHoachChiTiet();
                    me.toggle_form();
                }
                else {
                    obj = {
                        content: "NS_HoatDong_KeHoachChiTiet/Xoa: " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }

            },
            error: function (er) {
                var obj = {
                    content: "TN_KeHoach/Xoa (er): " + JSON.stringify(er),
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

    getList_CBKeHoachChiTiet: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSKLGD_KeHoachChiTiet',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropSearch_ThoiGian1'),
            'strKLGD_TongHopKhoiLuong_Id': edu.util.getValById('dropSearch_KeHoach1'),
            'strCheDoApDung_Id': edu.util.getValById('dropAAAA'),
            'strPhanLoai_Id': edu.util.getValById('dropSearch_PhanLoai1'),
            'strTuNgay': edu.util.getValById('txtAAAA'),
            'strDenNgay': edu.util.getValById('txtAAAA'),
            'dHieuLuc': -1,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genCombo_KeHoachChiTiet(dtReRult);
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

    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/
    genTable_KeHoachChiTiet: function (data, iPager) {
        var me = this;
        $("#lblKeHoachChiTiet_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblKeHoachChiTiet",

            bPaginate: {
                strFuntionName: "main_doc.KeHoachChiTiet.getList_KeHoachChiTiet()",
                iDataRow: iPager,
            },
            aaData: data,
            colPos: {
                center: [0, 4, 5, 6, 7, 8],
            },
            aoColumns: [
                {
                    "mDataProp": "TEN",
                },
                {
                    "mDataProp": "MOTA"
                },
                {
                    "mDataProp": "PHANLOAI_TEN"
                },
                {
                    "mDataProp": "KLGD_KHCHITIET_KEYTHUA_TEN"
                },
                {
                    "mDataProp": "CHEDOAPDUNG_TEN"
                },
                {
                    "mDataProp": "THOIGIAN"
                },
                {
                    "mDataProp": "TUNGAY"
                },
                {
                    "mDataProp": "DENNGAY"
                },
                {
                    "mDataProp": "NGUOITAO_TAIKHOAN"
                },
                {
                    "mDataProp": "NGAYTAO_DD_MM_YYYY"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnNhanSu" id="' + aData.ID + '" title="Sửa">Chi tiết</a></span>';
                    }
                },
                {
                    "mDataProp": "KLGD_TONGHOPKHOILUONG_TEN"
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
    },
    viewEdit_KeHoachChiTiet: function (data) {
        var me = this;
        //View - Thong tin
        $("#zoneKeHoachChiTiet").show();

        edu.util.viewValById("txtTen", data.TEN);
        edu.util.viewValById("dropKeHoachChung", data.KLGD_TONGHOPKHOILUONG_ID);
        edu.util.viewValById("dropThoiGian", data.DAOTAO_THOIGIANDAOTAO_ID);
        edu.util.viewValById("txtTuNgay", data.TUNGAY);
        edu.util.viewValById("txtDenNgay", data.DENNGAY);
        edu.util.viewValById("dropPhanLoai", data.PHANLOAI_ID);
        edu.util.viewValById("dropCheDoApDung", data.CHEDOAPDUNG_ID);
        edu.util.viewValById("txtMoTa", data.MOTA);
        edu.util.viewValById("dropHienThiCongGV", data.HIENTHICONGGIANVIEN);
        edu.util.viewValById("dropKeHoachKeThua", data.KLGD_KHCHITIET_KEYTHUA_ID);
        me.strKeHoachChiTiet_Id = data.ID;
    },

    genCombo_KeHoachChiTiet: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                order: ""
            },
            renderPlace: ["dropKeHoachKeThua"],
            title: "Chọn kế hoạch"
        };
        edu.system.loadToCombo_data(obj);
    },
    /*------------------------------------------
    --Discription: [3] AccessDB QuyDinh
    --ULR:  Modules
    -------------------------------------------*/
    getList_ThoiGian: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSThoiGianTongHopKL',
            'type': 'GET',
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genCombo_ThoiGian(dtReRult, data.Pager);
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
    genCombo_ThoiGian: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "THOIGIAN",
                code: "MA",
                order: ""
            },
            renderPlace: ["dropSearch_ThoiGian", "dropThoiGian"],
            title: "Chọn thời gian"
        };
        edu.system.loadToCombo_data(obj);
    },
    
    getList_CanBoGiangVien: function (strKLGD_TongHopKhoiLuong_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSGiangVienTongHopKL',
            'type': 'GET',
            'strKLGD_TongHopKhoiLuong_Id': strKLGD_TongHopKhoiLuong_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_CanBo(dtReRult, data.Pager);
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
    getList_NhanSuThamGia: function (strKLGD_TongHopKhoiLuong_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSNhanSuTongHopKL',
            'type': 'GET',
            'strKLGD_TongHopKhoiLuong_Id': me.strKeHoachChiTiet_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_CanBo(dtReRult, data.Pager);
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
    getList_NhanSuChiTiet: function (strKLGD_KeHoachChiTiet_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSKLGD_KeHoachChiTiet_NS',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strNguoiDung_Id': edu.util.getValById('dropAAAA'),
            'strKLGD_KeHoachChiTiet_Id': strKLGD_KeHoachChiTiet_Id || me.strKeHoachChiTiet_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtCanBoChiTiet = dtReRult;
                    me.genTable_CanBoChiTiet(dtReRult, data.Pager);
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


    /*------------------------------------------
    --Discription: Dựng tham số 1 lời gọi cho form tiến trình (edu.process gọi makeRequest, tự báo Thành công/Không thành công)
    -- Giữ nguyên action/func/tham số của save_PhanCong/delete_PhanCong cũ
    -------------------------------------------*/
    req_PhanCong: function (strNguoiDung_Id, strKLGD_KeHoachChiTiet_Id) {
        var me = this;
        //var obj_save = {
        //    'action': 'NS_KLGD_KeHoach_MH/FSkkLB4KDQYFHhUuLyYJLjEKDR4PKSAvEjQP',
        //    'func': 'PKG_KLGV_V2_KEHOACH.Them_KLGD_TongHopKL_NhanSu',
        //    'iM': edu.system.iM,
        //    'strNguoiDung_Id': strId,
        //    'strKLGD_TongHopKhoiLuong_Id': me.strKeHoachChiTiet_Id,
        //    'strNguoiThucHien_Id': edu.system.userId,
        //};
        var obj_save = {
            'action': 'NS_KLGD_KeHoach_MH/FSkkLB4KDQYFHgokCS4gIikCKSgVKCQ1Hg8S',
            'func': 'PKG_KLGV_V2_KEHOACH.Them_KLGD_KeHoachChiTiet_NS',
            'iM': edu.system.iM,
            'strNguoiDung_Id': strNguoiDung_Id,
            'strKLGD_KeHoachChiTiet_Id': strKLGD_KeHoachChiTiet_Id || me.strKeHoachChiTiet_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        return { action: obj_save.action, type: "POST", contentType: true, data: obj_save };
    },
    req_PhanCong_Xoa: function (strId) {
        var obj_save = {
            'action': 'NS_KLGD_KeHoach_MH/GS4gHgoNBgUeCiQJLiAiKQIpKBUoJDUeDxIP',
            'func': 'PKG_KLGV_V2_KEHOACH.Xoa_KLGD_KeHoachChiTiet_NS',
            'iM': edu.system.iM,
            'strIds': strId,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        return { action: obj_save.action, type: "POST", contentType: true, data: obj_save };
    },
    genTable_CanBo: function (data, iPager) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblCanBo",
            
            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "MASO",
                },
                {
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.HODEM) + " " + edu.util.returnEmpty(aData.TEN);
                    }
                },
                {
                    "mDataProp": "DONVI_TEN"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
    genTable_CanBoChiTiet: function (data, iPager) {
        var me = this;
        $("#chkSelectAll_CanBo").prop("checked", false);
        var jsonForm = {
            strTable_Id: "tblCanBo",

            aaData: data,
            colPos: {
                center: [0],
            },
            aoColumns: [
                {
                    "mDataProp": "NGUOIDUNG_MASO",
                },
                {
                    "mRender": function (nRow, aData) {
                        return edu.util.returnEmpty(aData.NGUOIDUNG_HODEM) + " " + edu.util.returnEmpty(aData.NGUOIDUNG_TEN);
                    }
                },
                {
                    "mDataProp": "DONVI_TEN"
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    getList_KeHoachChung: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSKLGD_TongHopKhoiLuong',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropSearch_ThoiGian'),
            'dHieuLuc': 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 1000000,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    //me.dtKeHoachChung = dtReRult;
                    me.genCombo_KeHoachChung(dtReRult, data.Pager);
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
    genCombo_KeHoachChung: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                order: ""
            },
            renderPlace: ["dropSearch_KeHoach", "dropKeHoachChung"],
            title: "Chọn kế hoạch"
        };
        edu.system.loadToCombo_data(obj);
    },

    getList_PhanLoai: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TKGG_KeHoach/LayDSPhanLoai',
            'type': 'GET',
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    //me.dtKeHoachChung = dtReRult;
                    me.genCombo_PhanLoai(dtReRult, data.Pager);
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
    genCombo_PhanLoai: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                order: ""
            },
            renderPlace: ["dropSearch_PhanLoai", "dropPhanLoai"],
            title: "Chọn phân loại"
        };
        edu.system.loadToCombo_data(obj);
        if (data.length > 0) {
            $("#dropSearch_PhanLoai").val(data[0].ID).trigger("change");
        }
    },
}