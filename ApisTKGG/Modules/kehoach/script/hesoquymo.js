/*----------------------------------------------
--Author:
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note: 26/11/2026 gop 6efcd1a5 (khai bao theo tung CTDT / tung lop hoc phan) vao ban giao dien moi 3976949e
--Note: 26/11/2026 Xoa (dong tick / nut Xoa trong form Sua) qua edu.process: Buoc 1 = xac nhan, 1 Id / 1 lan goi
--Note: 26/11/2026 them "Khai nhieu loai": chon nhieu loai x nhieu dai, Luu = duyet tung loai, tung dai
--      va goi dung ham Them_KLGD_HeSo_QuyMoSoLuong hien tai (qua form tien trinh chung edu.process)
--Note: 26/11/2026 theo sheet "Khai he so quy mo theo dai": "Loai he so" (o loc + moi form them) = LIST theo ma bang
--      danh muc KLGD.LOAIBANG -> strLoaiBang_Id (ParamLoaiBang_Id). "Pham vi" = KLGD.PHANLOAIXACNHAN chi de nap
--      danh sach loai/hinh thuc (strPhamViApDung_Id = Id loai). Ban truoc ghi nham Id pham vi vao strLoaiBang_Id.
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
        me.initKhaiBaoNhieu();

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
        // ma trung ten (VD danh muc KLGD.LOAIBANG "kC") thi chi hien 1 lan, tranh "kC - kC"
        return (ma && $.trim(ma) !== $.trim(ten)) ? ten + " - " + ma : ten;
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
        // Loai he so = LIST theo ma bang danh muc KLGD.LOAIBANG -> strLoaiBang_Id (o loc + moi form them)
        this.napDanhMuc("KLGD.LOAIBANG", ["dropSearch_PhanLoai", "dropLoaiBang", "dropLoaiBang_N", "dropCTDT_LoaiBang", "dropLHP_LoaiBang"], "Chọn loại hệ số");
        // Pham vi = KLGD.PHANLOAIXACNHAN -> nap danh sach loai (hinh thuc)
        this.napDanhMuc("KLGD.PHANLOAIXACNHAN", ["dropPhamViApDung", "dropPhamVi_N", "dropCTDT_PhamVi"], "Chọn phạm vi");
    },
    /* Nap danh muc theo ma bang vao cac combo, hien "TEN - MA"; danh muc rong van hien dong tieu de */
    napDanhMuc: function (strMaBang, arrDrop, strTitle) {
        var me = this;
        edu.system.loadToCombo_DanhMucDuLieu(strMaBang, arrDrop.join(","), "", function (data) {
            me.logMauCombo(strMaBang, data);
            edu.system.loadToCombo_data({
                data: data || [],
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
                title: strTitle
            });
        }, strTitle);
    },
    /* Combo form chua chon -> lay theo o loc tren man hinh */
    macDinh: function (strDrop_Id, strFrom_Id) {
        var v = edu.util.getValById(strFrom_Id);
        if (!edu.util.getValById(strDrop_Id) && v) edu.util.viewValById(strDrop_Id, v);
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
            renderPlace: ["dropThoiGian", "dropSearch_ThoiGian", "dropThoiGian_N", "dropCTDT_ThoiGian", "dropLHP_ThoiGian"],
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
    /* strFrom: combo Pham vi (loai xac nhan), strTo: combo Loai nhan ket qua */
    getList_LoaiApDung: function (strFrom, strTo) {
        var me = this;
        strFrom = strFrom || 'dropPhamViApDung';
        strTo = strTo || 'dropLoaiApDung';
        me.fetchLoai(edu.util.getValById(strFrom), function (data) {
            me.cbGenCombo_LoaiApDung(data || [], strTo);
        });
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
        // Sua: loai he so + loai chi hien chu (khong doi), an dong Pham vi; luu theo dung gia tri cua ban ghi
        $m.find(".zoneOpenNew").toggle(!bSua);
        $m.find(".btnOpenDelete").toggle(bSua);
        $("#lblLoaiBang").html(me.esc(data.LOAIBANG_TEN || "(chưa có)"));
        $("#lblLoaiApDung").html(me.esc(data.PHAMVIAPDUNG_TEN));
        if (bSua) edu.util.viewValById("dropThoiGian", data.THOIGIAN_ID || data.DAOTAO_THOIGIANDAOTAO_ID || "");
        else me.macDinh("dropLoaiBang", "dropSearch_PhanLoai");
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
            strLoaiBang_Id: (r && r.LOAIBANG_ID !== undefined) ? r.LOAIBANG_ID : edu.system.getValById('dropLoaiBang'),
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
                { header: "Loại hệ số / Phạm vi áp dụng", render: function (r) { return edu.util.returnEmpty(r.LOAIBANG_TEN) + " / " + edu.util.returnEmpty(r.PHAMVIAPDUNG_TEN); } },
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
        me.getList_KB_HeDaoTao();

        $("#btnAdd_HeSoQuyMo_CTDT").click(function (e) {
            e.preventDefault();
            $("#dropCTDT_ThoiGian").val(edu.util.getValById("dropSearch_ThoiGian")).trigger("change");
            me.macDinh("dropCTDT_LoaiBang", "dropSearch_PhanLoai");
            $("#txtCTDT_SoBatDau, #txtCTDT_SoKetThuc, #txtCTDT_HeSo").val("");
            me.getList_KB_KhoaDaoTao("CTDT");
            me.getList_KB_ChuongTrinh("CTDT");
            $("#myModal_HeSoCTDT").modal("show");
        });
        $("#btnAdd_HeSoQuyMo_LHP").click(function (e) {
            e.preventDefault();
            $("#dropLHP_ThoiGian").val(edu.util.getValById("dropSearch_ThoiGian")).trigger("change");
            me.macDinh("dropLHP_LoaiBang", "dropSearch_PhanLoai");
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
                strLoaiBang_Id: edu.util.getValById("dropCTDT_LoaiBang"),
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
                strLoaiBang_Id: edu.util.getValById("dropLHP_LoaiBang"),
                strDaoTao_ThoiGianDaoTao_Id: strThoiGian,
                dSoBatDau: me.laySo("txtLHP_SoBatDau"),
                dSoKetThuc: me.laySo("txtLHP_SoKetThuc"),
                dHeSo: me.laySo("txtLHP_HeSo")
            };
        });
        me.them_NhieuHeSo(arrSave, "myModal_HeSoLHP");
    },
    /* Goi Them_KLGD_HeSo_QuyMoSoLuong cho tung pham vi qua form tien trinh chung (nhu "Khai nhieu loai");
       may khach chua co edu.process thi chay lan luot va bao tong ket nhu ban dau */
    them_NhieuHeSo: function (arrSave, strModal_Id) {
        var me = this;
        var fnReq = function (x) {
            return me.req_HeSoQuyMo({
                strId: "",
                strLoaiBang_Id: x.strLoaiBang_Id,
                strPhamViApDung_Id: x.strPhamViApDung_Id,
                strDaoTao_ThoiGianDaoTao_Id: x.strDaoTao_ThoiGianDaoTao_Id,
                dSoBatDau: x.dSoBatDau,
                dSoKetThuc: x.dSoKetThuc,
                dHeSo: x.dHeSo
            });
        };
        if (edu.process && typeof edu.process.run === "function") {
            var bCTDT = strModal_Id === "myModal_HeSoCTDT";
            edu.process.run({
                title: bCTDT ? "Thêm khai báo hệ số theo từng chương trình đào tạo" : "Thêm khai báo hệ số theo từng lớp học phần",
                unit: "khai báo",
                columns: [
                    { header: bCTDT ? "Chương trình đào tạo" : "Lớp học phần", render: function (x) { return x.strTen; } },
                    { header: "Dải quy mô - Hệ số", render: function (x) { return "Từ " + (x.dSoBatDau || "…") + " đến " + (x.dSoKetThuc || "…") + " - hệ số " + x.dHeSo; } }
                ],
                items: arrSave.map(function (x, i) { x.ID = x.strPhamViApDung_Id + "_" + i; return x; }),
                request: fnReq,
                fileName: bCTDT ? "KhaiHeSo_TheoCTDT" : "KhaiHeSo_TheoLopHocPhan",
                autoStart: true,
                hideModal: "#" + strModal_Id,
                refresh: function () { me.getList_HeSoQuyMo(); }
            });
            return;
        }
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
            var p = fnReq(x);
            p.success = function (data) {
                if (data.Success) iOk++;
                else arrLoi.push(edu.util.returnEmpty(x.strTen) + ": " + edu.util.returnEmpty(data.Message));
                next(i + 1);
            };
            p.error = function (er) {
                arrLoi.push(edu.util.returnEmpty(x.strTen) + ": " + JSON.stringify(er));
                next(i + 1);
            };
            edu.system.makeRequest(p, false, false, false, null);
        };
        next(0);
    },

    /*------------------------------------------
    --Discription: [5] Khai nhieu loai
    -------------------------------------------*/
    openForm_Nhieu: function () {
        var me = this;
        me.thongBao_N("");
        // Form chua chon gi thi lay theo bo loc dang chon tren man hinh
        me.macDinh("dropLoaiBang_N", "dropSearch_PhanLoai");
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
        var strLoaiBang_Id = edu.util.getValById("dropLoaiBang_N");
        var strThoiGian_Id = edu.util.getValById("dropThoiGian_N");
        var arrLoai = me.getLoaiDaChon_N();
        var dai = me.readDai_N(true);
        var arrLoi = [];
        if (!strLoaiBang_Id) arrLoi.push("Chưa chọn loại hệ số.");
        if (!edu.util.getValById("dropPhamVi_N")) arrLoi.push("Chưa chọn phạm vi.");
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
        var strTenLoaiBang = $.trim($("#dropLoaiBang_N option:selected").text());
        var strTenPhamVi = $.trim($("#dropPhamVi_N option:selected").text());
        var strTenThoiGian = strThoiGian_Id ? $("#dropThoiGian_N option:selected").text() : "(không chọn)";

        if (!edu.process || typeof edu.process.run !== "function") {
            me.runTuanTu_N(items, fnReq);// may khach chua co form tien trinh chung
            return;
        }
        edu.process.run({
            title: "Khai hệ số quy mô theo dải",
            subTitles: ["Loại hệ số: " + strTenLoaiBang, "Phạm vi: " + strTenPhamVi, "Thời gian: " + strTenThoiGian],
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
