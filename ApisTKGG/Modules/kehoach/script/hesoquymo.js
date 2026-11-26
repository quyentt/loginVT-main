/*----------------------------------------------
--Author:
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note: 26/11/2026 Xoa (dong tick / nut Xoa trong form Sua) qua edu.process: Buoc 1 = xac nhan, 1 Id / 1 lan goi
--Note: 26/11/2026 them "Khai nhieu loai": chon nhieu loai x nhieu dai, Luu = duyet tung loai, tung dai
--      va goi dung ham Them_KLGD_HeSo_QuyMoSoLuong hien tai (qua form tien trinh chung edu.process)
----------------------------------------------*/
function HeSoQuyMo() { };
HeSoQuyMo.prototype = {
    strHeSoQuyMo_Id: '',
    dtHeSoQuyMo: [],
    rowEdit: null,      // ban ghi dang sua (null = them moi)
    dtLoai_N: [],       // danh sach loai cua form khai nhieu

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        me.getList_HeSoQuyMo();
        me.getList_ThoiGianDaoTao();
        me.getList_PhamVi();
        me.addDai_N();

        /*-- Danh sach --*/
        $("#btnSearch").click(function () {
            me.getList_HeSoQuyMo();
        });
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_HeSoQuyMo();
            }
        });
        $("#dropSearch_PhanLoai, #dropSearch_ThoiGian").on("select2:select", function () {
            me.getList_HeSoQuyMo();
        });
        /*-- Xoa: cac dong dang tick / ban ghi dang sua --*/
        $("#btnDelete_HeSoQuyMo").click(function () {
            me.xoa_HeSoQuyMo(me.getDongDaChon());
        });
        $("#btnXoaMot_HeSoQuyMo").click(function () {
            if (me.rowEdit) me.xoa_HeSoQuyMo([me.rowEdit], "#myModal_HeSoQuyMo");
        });

        /*-- Them / sua 1 ban ghi --*/
        $("#btnAdd_HeSoQuyMo").click(function (e) {
            e.preventDefault();
            me.openForm_HeSoQuyMo(null);
        });
        $("#tblHeSoQuyMo").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtHeSoQuyMo.find(function (e) { return e.ID == strId; });
            if (data) me.openForm_HeSoQuyMo(data);
        });
        $("#btnSave_HeSoQuyMo").click(function () {
            me.save_HeSoQuyMo();
        });
        $('#dropPhamViApDung').on('select2:select', function () {
            me.getList_LoaiApDung();
        });

        /*-- Khai nhieu loai --*/
        $("#btnKhaiNhieu_HeSoQuyMo").click(function (e) {
            e.preventDefault();
            me.openForm_Nhieu();
        });
        $("#dropPhamVi_N").on("select2:select", function () {
            me.getList_Loai_N();
        });
        $("#zoneLoai_N").on("change", "input[type=checkbox]", function () {
            $(this).closest(".hsqm-chk").toggleClass("on", this.checked);
            me.updateTongHop_N();
        });
        $("#txtLocLoai_N").on("input", function () {
            me.locLoai_N(this.value);
        });
        $("#btnChonHetLoai_N").click(function (e) {
            e.preventDefault();
            me.chonLoai_N(true);
        });
        $("#btnBoChonLoai_N").click(function (e) {
            e.preventDefault();
            me.chonLoai_N(false);
        });
        $("#btnThemDai_N").click(function (e) {
            e.preventDefault();
            me.addDai_N(true);
        });
        $("#tblDai_N").on("click", ".hsqm-x", function () {
            me.removeDai_N($(this).closest("tr"));
        });
        $("#tblDai_N").on("input", "input", function () {
            $(this).removeClass("hsqm-invalid");
            me.updateTongHop_N();
        });
        $("#tblDai_N").on("keydown", "input", function (e) {
            // Enter o o cuoi cung cua dong cuoi: them dai moi
            if (e.which !== 13) return;
            e.preventDefault();
            var $tr = $(this).closest("tr");
            if ($(this).hasClass("txtHeSo_N") && $tr.is(":last-child")) me.addDai_N(true);
            else {
                var $all = $("#tblDai_N tbody input");
                $all.eq($all.index(this) + 1).focus();
            }
        });
        $("#btnSave_HeSoQuyMo_Nhieu").click(function () {
            me.save_HeSoQuyMo_Nhieu();
        });
    },

    /*------------------------------------------
    --Discription: [1] Tien ich
    -------------------------------------------*/
    /* Combo hien "TEN - MA". Ma lay o MA, khong co thi HANHDONG_MA; khong co ma thi chi hien TEN */
    tenMa: function (aData) {
        var ten = edu.util.returnEmpty(aData.TEN);
        var ma = edu.util.returnEmpty(aData.MA || aData.HANHDONG_MA);
        return ma ? ten + " - " + ma : ten;
    },
    maCua: function (aData) {
        return edu.util.returnEmpty(aData.MA || aData.HANHDONG_MA);
    },
    /* Ghi ban ghi dau cua combo ra console (F12) de doi chieu ten truong ma neu van khong thay ma */
    logMauCombo: function (strDrop_Id, data) {
        if (window.console && data && data.length) console.log("[hesoquymo] " + strDrop_Id + " - ban ghi dau:", data[0]);
    },
    esc: function (s) {
        return edu.util.returnEmpty(s).toString()
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    boDau: function (s) {
        return edu.util.returnEmpty(s).toString().toLowerCase()
            .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    },
    /* "" -> null (truong d* la NUMBER, gui "" thi Oracle nuot loi); cho phep dau phay thap phan */
    toSo: function (v) {
        var s = edu.util.returnEmpty(v).toString().trim().replace(",", ".");
        if (s === "") return null;
        var n = Number(s);
        return isNaN(n) ? null : n;
    },
    laSoHopLe: function (v) {
        var s = edu.util.returnEmpty(v).toString().trim().replace(",", ".");
        return s === "" || !isNaN(Number(s));
    },

    /*------------------------------------------
	--Discription: [2] Combo pham vi / thoi gian / loai
	-------------------------------------------*/
    getList_PhamVi: function () {
        // Pham vi = danh muc KLGD.PHANLOAIXACNHAN: dung cho ca loc (strLoaiBang_Id cua danh sach) va 2 form them
        var me = this;
        var arrDrop = ["dropSearch_PhanLoai", "dropPhamViApDung", "dropPhamVi_N"];
        edu.system.loadToCombo_DanhMucDuLieu("KLGD.PHANLOAIXACNHAN", arrDrop.join(","), "", function (data) {
            if (!data || !data.length) return;
            edu.system.loadToCombo_data({
                data: data,
                renderInfor: {
                    id: "ID",
                    parentId: "",
                    name: "TEN",
                    code: "MA",
                    mRender: function (nRow, aData) {
                        return me.tenMa(aData);
                    }
                },
                renderPlace: arrDrop,
                title: "Chọn phạm vi"
            });
        }, "Chọn phạm vi");
    },
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
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropThoiGian", "dropSearch_ThoiGian", "dropThoiGian_N"],
            type: "",
            title: "Chọn thời gian",
        }
        edu.system.loadToCombo_data(obj);
    },
    /* Lay danh sach loai cua 1 pham vi -> callback(data) (null neu loi) */
    fetchLoai: function (strPhamVi_Id, callback) {
        var obj_save = {
            'action': 'NS_KLGD_XacNhan_MH/DSA4BRINLiAoGSAiDykgLx4JIC8pBS4vJgPP',
            'func': 'pkg_klgv_v2_xacnhan.LayDSLoaiXacNhan_HanhDong',
            'iM': edu.system.iM,
            'strLoaiXacNhan_Id': strPhamVi_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    callback(data.Data || []);
                }
                else {
                    edu.system.alert(" : " + data.Message, "s");
                    callback(null);
                }
            },
            error: function (er) {
                edu.system.alert(" (er): " + JSON.stringify(er), "w");
                callback(null);
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    getList_LoaiApDung: function () {
        var me = this;
        me.fetchLoai(edu.util.getValById('dropPhamViApDung'), function (data) {
            me.cbGenCombo_LoaiApDung(data || []);
        });
    },
    cbGenCombo_LoaiApDung: function (data) {
        var me = this;
        me.logMauCombo("dropLoaiApDung", data);
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
            renderPlace: ["dropLoaiApDung"],
            type: "",
            title: "Chọn loại",
        }
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    --Discription: [3] AccessDB
    -------------------------------------------*/
    /* Tham so makeRequest cua ham Them/Sua hien tai cho 1 ban ghi (dung chung cho form 1 ban ghi va khai nhieu loai) */
    req_HeSoQuyMo: function (o) {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/FSkkLB4KDQYFHgkkEi4eEDQ4DC4SLg00Li8m',
            'func': 'PKG_KLGV_V2_THONGTIN.Them_KLGD_HeSo_QuyMoSoLuong',
            'iM': edu.system.iM,
            'strId': o.strId || "",
            'strPhamViApDung_Id': o.strPhamViApDung_Id,
            'dHeSo': me.toSo(o.dHeSo),
            'dSoBatDau': me.toSo(o.dSoBatDau),
            'dSoKetThuc': me.toSo(o.dSoKetThuc),
            'strLoaiBang_Id': o.strLoaiBang_Id,
            'strDaoTao_ThoiGianDaoTao_Id': o.strDaoTao_ThoiGianDaoTao_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_KLGD_ThongTin_MH/EjQgHgoNBgUeCSQSLh4QNDgMLhIuDTQuLyYP';
            obj_save.func = 'PKG_KLGV_V2_THONGTIN.Sua_KLGD_HeSo_QuyMoSoLuong';
        }
        return {
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        };
    },
    openForm_HeSoQuyMo: function (data) {
        var me = this;
        var bSua = !!data;
        data = data || {};
        me.rowEdit = bSua ? data : null;
        me.strHeSoQuyMo_Id = data.ID || "";
        var $m = $("#myModal_HeSoQuyMo");
        $("#lblTieuDe_HSQM").html(bSua ? '<i class="fa fa-pencil"></i> Sửa hệ số quy mô' : '<i class="fa fa-plus"></i> Thêm mới hệ số quy mô');
        // Sua: pham vi + loai chi hien chu (khong doi), luu theo dung gia tri cua ban ghi
        $m.find(".zoneOpenNew").toggle(!bSua);
        $m.find(".btnOpenDelete").toggle(bSua);
        $("#lblPhamVi").html(me.esc(data.LOAIBANG_TEN));
        $("#lblLoaiApDung").html(me.esc(data.PHAMVIAPDUNG_TEN));
        if (bSua) edu.util.viewValById("dropThoiGian", data.THOIGIAN_ID || data.DAOTAO_THOIGIANDAOTAO_ID || "");
        edu.util.viewValById("txtSoBatDau", data.SOBATDAU);
        edu.util.viewValById("txtSoKetThuc", data.SOKETTHUC);
        edu.util.viewValById("txtHeSo", data.HESO);
        $m.modal("show");
    },
    save_HeSoQuyMo: function () {
        var me = this;
        var r = me.rowEdit;
        var o = {
            strId: me.strHeSoQuyMo_Id,
            strLoaiBang_Id: (r && r.LOAIBANG_ID !== undefined) ? r.LOAIBANG_ID : edu.system.getValById('dropPhamViApDung'),
            strPhamViApDung_Id: (r && r.PHAMVIAPDUNG_ID !== undefined) ? r.PHAMVIAPDUNG_ID : edu.system.getValById('dropLoaiApDung'),
            strDaoTao_ThoiGianDaoTao_Id: edu.system.getValById('dropThoiGian'),
            dSoBatDau: edu.system.getValById('txtSoBatDau'),
            dSoKetThuc: edu.system.getValById('txtSoKetThuc'),
            dHeSo: edu.system.getValById('txtHeSo'),
        };
        var arrSai = [];
        if (!me.laSoHopLe(o.dSoBatDau)) arrSai.push("Số bắt đầu");
        if (!me.laSoHopLe(o.dSoKetThuc)) arrSai.push("Số kết thúc");
        if (!me.laSoHopLe(o.dHeSo)) arrSai.push("Hệ số");
        if (arrSai.length) {
            edu.system.alert(arrSai.join(", ") + " phải là số (VD: 40 hoặc 1,2).");
            return;
        }
        var p = me.req_HeSoQuyMo(o);
        p.success = function (data) {
            if (data.Success) {
                edu.system.alert(o.strId ? "Cập nhật thành công!" : "Thêm mới thành công!");
                me.getList_HeSoQuyMo();
            }
            else {
                edu.system.alert(data.Message);
            }
        };
        p.error = function (er) {
            edu.system.alert(JSON.stringify(er));
        };
        edu.system.makeRequest(p, false, false, false, null);
    },
    getList_HeSoQuyMo: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/DSA4BRIKDQYFHgkkEi4eEDQ4DC4SLg00Li8m',
            'func': 'PKG_KLGV_V2_THONGTIN.LayDSKLGD_HeSo_QuyMoSoLuong',
            'iM': edu.system.iM,
            'strLoaiBang_Id': edu.system.getValById('dropSearch_PhanLoai'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropSearch_ThoiGian'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtHeSoQuyMo = data.Data || [];
                    me.genTable_HeSoQuyMo(me.locTuKhoa(me.dtHeSoQuyMo));
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
    /* API danh sach khong nhan tu khoa -> loc tai cho tren du lieu da tai */
    locTuKhoa: function (data) {
        var me = this;
        var strTuKhoa = me.boDau(edu.util.getValById("txtSearch_TuKhoa")).trim();
        if (!strTuKhoa) return data;
        return data.filter(function (e) {
            return me.boDau([e.LOAIBANG_TEN, e.PHAMVIAPDUNG_TEN, e.THOIGIAN, e.SOBATDAU, e.SOKETTHUC, e.HESO, e.NGUOITAO_TAIKHOAN].join(" ")).indexOf(strTuKhoa) !== -1;
        });
    },
    /* Tham so makeRequest cua ham Xoa (PKG_KLGV_V2_THONGTIN.Xoa_KLGD_HeSo_QuyMoSoLuong: 1 Id / 1 lan goi) */
    req_Xoa_HeSoQuyMo: function (strId) {
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/GS4gHgoNBgUeCSQSLh4QNDgMLhIuDTQuLyYP',
            'func': 'PKG_KLGV_V2_THONGTIN.Xoa_KLGD_HeSo_QuyMoSoLuong',
            'iM': edu.system.iM,
            'strId': strId,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        return {
            type: "POST",
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        };
    },
    getDongDaChon: function () {
        var me = this;
        if (edu.process && typeof edu.process.selectedRows === "function") return edu.process.selectedRows("tblHeSoQuyMo", me.dtHeSoQuyMo);
        var arrId = edu.util.getArrCheckedIds("tblHeSoQuyMo", "checkX");
        return me.dtHeSoQuyMo.filter(function (e) { return arrId.indexOf(e.ID) !== -1 || arrId.indexOf(String(e.ID)) !== -1; });
    },
    /* Xoa danh sach ban ghi: Buoc 1 cua form tien trinh = buoc xac nhan (hien dung cac dong se xoa), moi ban ghi 1 lan goi Xoa */
    xoa_HeSoQuyMo: function (arrRow, strHideModal) {
        var me = this;
        if (!arrRow || !arrRow.length) {
            edu.system.alert("Vui lòng tick chọn bản ghi cần xóa.");
            return;
        }
        if (!edu.process || typeof edu.process.run !== "function") {
            // may khach chua co form tien trinh chung: hop xac nhan + xoa tung ban ghi nhu cu
            if (strHideModal) $(strHideModal).modal("hide");
            edu.system.confirm("Bạn có chắc chắn xóa " + arrRow.length + " bản ghi không?");
            $("#btnYes").off("click.hsqm").on("click.hsqm", function () {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrRow.length);
                for (var i = 0; i < arrRow.length; i++) {
                    me.delete_HeSoQuyMo(arrRow[i].ID);
                }
            });
            return;
        }
        edu.process.run({
            title: "Xóa hệ số quy mô",
            unit: "bản ghi",
            columns: [
                { header: "Phạm vi / Loại", render: function (r) { return edu.util.returnEmpty(r.LOAIBANG_TEN) + " / " + edu.util.returnEmpty(r.PHAMVIAPDUNG_TEN); } },
                { header: "Dải quy mô - Hệ số", render: function (r) { return "Từ " + edu.util.returnEmpty(r.SOBATDAU) + " đến " + edu.util.returnEmpty(r.SOKETTHUC) + " - hệ số " + edu.util.returnEmpty(r.HESO); } },
                { header: "Thời gian", render: function (r) { return r.THOIGIAN; } }
            ],
            items: arrRow,
            request: function (r) { return me.req_Xoa_HeSoQuyMo(r.ID); },
            notes: ["Kiểm tra lại các bản ghi bên dưới rồi bấm chạy để xóa. Dữ liệu đã xóa không khôi phục được."],
            okMessage: "Đã xóa",
            fileName: "XoaHeSoQuyMo",
            hideModal: strHideModal,
            refresh: function () { me.getList_HeSoQuyMo(); }
        });
    },
    delete_HeSoQuyMo: function (Ids) {
        var me = this;
        var p = me.req_Xoa_HeSoQuyMo(Ids);
        var obj_save = p.data;
        edu.system.makeRequest({
            success: function (data) {
                var obj;
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
                var obj = {
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
                    me.getList_HeSoQuyMo();
                });
            },
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML
    -------------------------------------------*/
    genTable_HeSoQuyMo: function (data) {
        $("#lblHeSoQuyMo_Tong").html(data.length);
        var jsonForm = {
            strTable_Id: "tblHeSoQuyMo",
            aaData: data,
            colPos: {
                center: [0, 3, 4, 5, 9, 10],
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
    },

    /*------------------------------------------
    --Discription: [5] Khai nhieu loai
    -------------------------------------------*/
    openForm_Nhieu: function () {
        var me = this;
        me.thongBao_N("");
        // Form chua chon gi thi lay theo bo loc dang chon tren man hinh
        var strPhamVi = edu.util.getValById("dropSearch_PhanLoai");
        if (!edu.util.getValById("dropPhamVi_N") && strPhamVi) {
            edu.util.viewValById("dropPhamVi_N", strPhamVi);
            me.getList_Loai_N();
        }
        var strThoiGian = edu.util.getValById("dropSearch_ThoiGian");
        if (!edu.util.getValById("dropThoiGian_N") && strThoiGian) {
            edu.util.viewValById("dropThoiGian_N", strThoiGian);
        }
        me.updateTongHop_N();
        $("#myModal_HeSoQuyMo_Nhieu").modal("show");
    },
    getList_Loai_N: function () {
        var me = this;
        var strPhamVi = edu.util.getValById("dropPhamVi_N");
        me.dtLoai_N = [];
        $("#txtLocLoai_N").val("");
        if (!strPhamVi) {
            me.genLoai_N("Chọn phạm vi để hiện danh sách loại.");
            return;
        }
        me.genLoai_N('<i class="fa fa-spinner fa-spin"></i> Đang tải danh sách loại…');
        me.fetchLoai(strPhamVi, function (data) {
            if (edu.util.getValById("dropPhamVi_N") !== strPhamVi) return; // da doi pham vi trong luc cho
            if (data === null) {
                me.genLoai_N("Không tải được danh sách loại. Chọn lại phạm vi để thử lại.");
                return;
            }
            me.logMauCombo("zoneLoai_N", data);
            me.dtLoai_N = data;
            me.genLoai_N("Phạm vi này chưa có loại nào.");
        });
    },
    genLoai_N: function (strRong) {
        var me = this;
        var h = "";
        me.dtLoai_N.forEach(function (e) {
            var ma = me.maCua(e);
            h += '<label class="hsqm-chk" title="' + me.esc(me.tenMa(e)) + '" data-loc="' + me.esc(me.boDau(e.TEN + " " + ma)) + '">'
                + '<input type="checkbox" value="' + me.esc(e.ID) + '" />'
                + '<span class="hsqm-chk-t">' + me.esc(e.TEN) + '</span>'
                + (ma ? '<span class="hsqm-chk-m">' + me.esc(ma) + '</span>' : '')
                + '</label>';
        });
        if (!h) h = '<div class="hsqm-empty">' + strRong + '</div>';
        $("#zoneLoai_N").html(h);
        me.updateTongHop_N();
    },
    locLoai_N: function (strText) {
        var me = this;
        var s = me.boDau(strText).trim();
        $("#zoneLoai_N .hsqm-chk").each(function () {
            $(this).toggle(!s || ($(this).attr("data-loc") || "").indexOf(s) !== -1);
        });
    },
    /* Chon / bo chon cac loai dang hien (theo o loc) */
    chonLoai_N: function (bChon) {
        var me = this;
        $("#zoneLoai_N .hsqm-chk").each(function () {
            if (this.style.display === "none") return;
            $(this).toggleClass("on", bChon).find("input")[0].checked = bChon;
        });
        me.updateTongHop_N();
    },
    getLoaiDaChon_N: function () {
        var me = this;
        var arr = [];
        $("#zoneLoai_N input[type=checkbox]:checked").each(function () {
            var strId = this.value;
            var e = me.dtLoai_N.find(function (x) { return String(x.ID) === strId; });
            if (e) arr.push(e);
        });
        return arr;
    },
    addDai_N: function (bFocus) {
        var me = this;
        var tr = '<tr>'
            + '<td class="hsqm-stt"></td>'
            + '<td><input type="text" class="form-control txtSoBatDau_N" inputmode="decimal" placeholder="VD: 0" /></td>'
            + '<td><input type="text" class="form-control txtSoKetThuc_N" inputmode="decimal" placeholder="VD: 40" /></td>'
            + '<td><input type="text" class="form-control txtHeSo_N" inputmode="decimal" placeholder="VD: 1,2" /></td>'
            + '<td class="hsqm-col-x"><button type="button" class="hsqm-x" title="Xóa dải này"><i class="fa fa-trash"></i></button></td>'
            + '</tr>';
        var $tr = $(tr).appendTo("#tblDai_N tbody");
        me.danhSoDai_N();
        me.updateTongHop_N();
        if (bFocus) $tr.find("input").first().focus();
    },
    removeDai_N: function ($tr) {
        var me = this;
        if ($("#tblDai_N tbody tr").length > 1) $tr.remove();
        else $tr.find("input").val("").removeClass("hsqm-invalid");
        me.danhSoDai_N();
        me.updateTongHop_N();
    },
    danhSoDai_N: function () {
        $("#tblDai_N tbody tr").each(function (i) {
            $(this).find(".hsqm-stt").text(i + 1);
        });
    },
    /* Doc cac dai da nhap: bo dong trong; danh dau o khong phai so */
    readDai_N: function (bDanhDau) {
        var me = this;
        var kq = { rows: [], invalid: false };
        $("#tblDai_N tbody tr").each(function () {
            var $bd = $(this).find(".txtSoBatDau_N"), $kt = $(this).find(".txtSoKetThuc_N"), $hs = $(this).find(".txtHeSo_N");
            var d = { bd: $.trim($bd.val()), kt: $.trim($kt.val()), hs: $.trim($hs.val()) };
            if (!d.bd && !d.kt && !d.hs) return;
            [$bd, $kt, $hs].forEach(function ($i) {
                if (!me.laSoHopLe($i.val())) {
                    kq.invalid = true;
                    if (bDanhDau) $i.addClass("hsqm-invalid");
                }
            });
            kq.rows.push(d);
        });
        return kq;
    },
    updateTongHop_N: function () {
        var me = this;
        var nTong = $("#zoneLoai_N input[type=checkbox]").length;
        var nLoai = $("#zoneLoai_N input[type=checkbox]:checked").length;
        var nDai = me.readDai_N(false).rows.length;
        $("#lblDemLoai_N").text("Đã chọn " + nLoai + "/" + nTong);
        if (nLoai && nDai) {
            $("#lblTongHop_N").html("Sẽ lưu <b>" + nLoai + "</b> loại × <b>" + nDai + "</b> dải = <b>" + (nLoai * nDai) + "</b> bản ghi");
            $("#lblSave_N").text("Lưu " + (nLoai * nDai) + " bản ghi");
        }
        else {
            $("#lblTongHop_N").text("Chọn loại và nhập dải quy mô để lưu.");
            $("#lblSave_N").text("Lưu");
        }
    },
    thongBao_N: function (strHtml, strKieu) {
        var $z = $("#zoneThongBao_N");
        if (!strHtml) { $z.hide().html(""); return; }
        $z.attr("class", "hsqm-alert " + (strKieu || "w")).html(strHtml).show();
    },
    save_HeSoQuyMo_Nhieu: function () {
        var me = this;
        var strLoaiBang_Id = edu.util.getValById("dropPhamVi_N");
        var strThoiGian_Id = edu.util.getValById("dropThoiGian_N");
        var arrLoai = me.getLoaiDaChon_N();
        var dai = me.readDai_N(true);
        var arrLoi = [];
        if (!strLoaiBang_Id) arrLoi.push("Chưa chọn phạm vi.");
        if (!arrLoai.length) arrLoi.push("Chưa chọn loại nào.");
        if (dai.invalid) arrLoi.push("Ô tô đỏ không phải là số (VD đúng: 40 hoặc 1,2).");
        else if (!dai.rows.length) arrLoi.push("Chưa nhập dải quy mô nào.");
        if (arrLoi.length) {
            me.thongBao_N(arrLoi.join("<br/>"), "w");
            return;
        }
        me.thongBao_N("");

        // Duyet tung loai, moi loai lan luot cac dai -> moi cap = 1 lan goi ham Them hien tai
        var items = [];
        arrLoai.forEach(function (l) {
            dai.rows.forEach(function (d, k) {
                items.push({ ID: l.ID + "_" + k, loai: l, dai: d });
            });
        });
        var fnReq = function (it) {
            return me.req_HeSoQuyMo({
                strId: "",
                strLoaiBang_Id: strLoaiBang_Id,
                strPhamViApDung_Id: it.loai.ID,
                strDaoTao_ThoiGianDaoTao_Id: strThoiGian_Id,
                dSoBatDau: it.dai.bd,
                dSoKetThuc: it.dai.kt,
                dHeSo: it.dai.hs
            });
        };
        var strTenPhamVi = $("#dropPhamVi_N option:selected").text();
        var strTenThoiGian = strThoiGian_Id ? $("#dropThoiGian_N option:selected").text() : "(không chọn)";

        if (!edu.process || typeof edu.process.run !== "function") {
            me.runTuanTu_N(items, fnReq);// may khach chua co form tien trinh chung
            return;
        }
        edu.process.run({
            title: "Khai hệ số quy mô theo dải",
            subTitles: ["Phạm vi: " + strTenPhamVi, "Thời gian: " + strTenThoiGian],
            unit: "bản ghi",
            columns: [
                { header: "Loại", render: function (it) { return me.tenMa(it.loai); } },
                { header: "Dải quy mô", render: function (it) { return "Từ " + (it.dai.bd || "…") + " đến " + (it.dai.kt || "…"); } },
                { header: "Hệ số", render: function (it) { return it.dai.hs; } }
            ],
            items: items,
            request: fnReq,
            notes: strThoiGian_Id ? [] : ["Chưa chọn thời gian."],
            fileName: "KhaiHeSoQuyMo",
            autoStart: true,
            hideModal: "#myModal_HeSoQuyMo_Nhieu",
            refresh: function () { me.getList_HeSoQuyMo(); },
            onClose: function (sum) {
                // Luu het khong loi: bo chon loai, giu pham vi/thoi gian/dai de khai tiep
                if (sum && sum.ok > 0 && !sum.err && !sum.pending) me.chonLoai_N(false);
            }
        });
    },
    /* Du phong khi chua co edu.process: goi lan luot, bao ket qua ngay trong form */
    runTuanTu_N: function (items, fnReq) {
        var me = this;
        var i = 0, nOk = 0, arrLoi = [];
        var $btn = $("#btnSave_HeSoQuyMo_Nhieu").addClass("disabled").css("pointer-events", "none");
        function next() {
            if (i >= items.length) { xong(); return; }
            var it = items[i++];
            var strTen = me.tenMa(it.loai) + " (" + (it.dai.bd || "…") + " - " + (it.dai.kt || "…") + ")";
            me.thongBao_N('<i class="fa fa-spinner fa-spin"></i> Đang lưu ' + i + "/" + items.length + "…", "i");
            var p = fnReq(it);
            p.success = function (data) {
                if (data && data.Success) nOk++;
                else arrLoi.push(me.esc(strTen) + ": " + me.esc((data && data.Message) || "Không thành công"));
                next();
            };
            p.error = function (er) {
                arrLoi.push(me.esc(strTen) + ": " + me.esc((er && er.statusText) || "Lỗi kết nối"));
                next();
            };
            edu.system.makeRequest(p, false, false, false, null);
        }
        function xong() {
            $btn.removeClass("disabled").css("pointer-events", "");
            var h = "Đã lưu <b>" + nOk + "/" + items.length + "</b> bản ghi.";
            if (arrLoi.length) h += "<br/>Không thành công " + arrLoi.length + ":<br/>" + arrLoi.join("<br/>");
            me.thongBao_N(h, arrLoi.length ? "w" : "s");
            if (nOk > 0) me.getList_HeSoQuyMo();
            if (!arrLoi.length) me.chonLoai_N(false);
        }
        next();
    },
}
