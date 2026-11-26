/*----------------------------------------------
--Author:
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note: 26/11/2026 theo MoTaChucNangChinh_KLGD_NEW.xlsx, sheet "Sua khai bao he so theo pham vi":
--  - Loc them "Loai he so" -> ham LayDS truyen strLoaiBang_Id (DB/API them ParamLoaiBang_Id)
--  - "Them moi" doi ten "Them moi cho tung hinh thuc mot lan khai", truyen strLoaiBang_Id
--  - 5 nut moi: nhieu hinh thuc / to hop hoc phan - CTDT / tung lop hoc phan /
--    chuc danh-hoc vi cho tung he dao tao / chuc danh-hoc vi cho tung hoc phan theo CTDT
--  Moi pham vi = 1 lan goi PKG_KLGV_V2_THONGTIN.Them_KLGD_HeSo_PhamViApDung (qua form tien trinh chung edu.process)
--  Ma pham vi (ParamPhamViApDung_Id) theo comment sheet, ghep lien khong ky tu ngan:
--    to hop HP - CTDT          = DAOTAO_TOCHUCCHUONGTRINH_ID + DAOTAO_HOCPHAN_ID
--    chuc danh/hoc vi + he     = Id chuc danh/hoc vi + Id he dao tao
--    chuc danh/hoc vi + HP-CTDT = Id chuc danh/hoc vi + Id he dao tao + DAOTAO_TOCHUCCHUONGTRINH_ID + DAOTAO_HOCPHAN_ID
----------------------------------------------*/
function HeSoPhamVi() { };
HeSoPhamVi.prototype = {
    strHeSoPhamVi_Id: '',
    dtHeSoPhamVi: [],
    rowEdit: null,      // ban ghi dang sua (null = them moi)
    dtLoai_N: [],       // hinh thuc cua form nhieu hinh thuc
    dtCT_HPCT: [],      // CTDT cua form to hop hoc phan - CTDT
    dtHP_HPCT: [],      // hoc phan cua CTDT dang xem
    objCT_HPCT: null,   // CTDT dang xem
    objChon_HPCT: {},   // to hop da chon: key = HP_Id|CT_Id -> { hp, ct }
    modeHPCT: null,     // "" = to hop HP - CTDT; "CDHV" = chuc danh/hoc vi cho tung hoc phan theo CTDT (dung chung 1 form)
    objLHPChon: {},     // lop hoc phan da chon (qua nhieu trang)
    dtLHP: [],
    dtHeDaoTao: [],     // he dao tao (form chuc danh/hoc vi cho tung he)
    objDM_CDHV: {},     // cache danh muc chuc danh / hoc vi theo ma bang
    /* "Chon loai" cua 2 form chuc danh/hoc vi: MA = ma bang danh muc (theo comment sheet) */
    LOAI_CDHV: [
        { MA: "PERSON_ACADEMIC_RANK.ACADEMIC_RANK_CODE", TEN: "Chức danh" },
        { MA: "PERSON_EDUCATION.DEGREE_CODE", TEN: "Học vị" }
    ],

    init: function () {
        var me = this;
        me.getList_HeSoPhamVi();
        me.getList_ThoiGianDaoTao();
        me.getList_LoaiBang();
        me.getList_HeDaoTao();

        /*-- Danh sach --*/
        $("#btnSearch").click(function () { me.getList_HeSoPhamVi(); });
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) { e.preventDefault(); me.getList_HeSoPhamVi(); }
        });
        $("#dropSearch_LoaiBang, #dropSearch_ThoiGian").on("select2:select", function () { me.getList_HeSoPhamVi(); });
        $("#btnDelete_HeSoPhamVi").click(function () { me.xoa_HeSoPhamVi(me.getDongDaChon()); });

        /*-- Them cho tung hinh thuc / Sua --*/
        $("#btnAdd_HeSoPhamVi").click(function (e) { e.preventDefault(); me.openForm_HeSoPhamVi(null); });
        $("#tblHeSoPhamVi").delegate(".btnEdit", "click", function () {
            var strId = this.id;
            var data = me.dtHeSoPhamVi.find(function (x) { return x.ID == strId; });
            if (data) me.openForm_HeSoPhamVi(data);
        });
        $("#btnSave_HeSoPhamVi").click(function () { me.save_HeSoPhamVi(); });
        $("#btnXoaMot_HeSoPhamVi").click(function () { if (me.rowEdit) me.xoa_HeSoPhamVi([me.rowEdit], "#myModal_HeSoPhamVi"); });
        $("#dropPhamViApDung").on("select2:select", function () { me.getList_LoaiApDung("dropPhamViApDung", "dropLoaiApDung"); });

        /*-- Nhieu hinh thuc --*/
        $("#btnKhaiNhieu_HeSoPhamVi").click(function (e) { e.preventDefault(); me.openForm_Nhieu(); });
        $("#dropPhamVi_N").on("select2:select", function () { me.getList_Loai_N(); });
        $("#zoneLoai_N").on("change", "input[type=checkbox]", function () {
            $(this).closest(".hspv-chk").toggleClass("on", this.checked);
            me.updateTongHop_N();
        });
        $("#txtLocLoai_N").on("input", function () { me.locLoai_N(this.value); });
        $("#btnChonHetLoai_N").click(function (e) { e.preventDefault(); me.chonLoai_N(true); });
        $("#btnBoChonLoai_N").click(function (e) { e.preventDefault(); me.chonLoai_N(false); });
        $("#txtHeSo_N").on("input", function () { $(this).removeClass("hspv-invalid"); me.updateTongHop_N(); });
        $("#btnSave_HeSoPhamVi_Nhieu").click(function () { me.save_Nhieu(); });

        /*-- To hop hoc phan - CTDT (va chuc danh/hoc vi cho tung hoc phan theo CTDT: cung form, khac che do) --*/
        $("#btnAdd_HeSoPhamVi_HPCT").click(function (e) { e.preventDefault(); me.openForm_HPCT(""); });
        $("#btnAdd_HeSoPhamVi_CDHV_HP").click(function (e) { e.preventDefault(); me.openForm_HPCT("CDHV"); });
        me.genLoai_CDHV("segHPCT_Loai", "rdoHPCT_Loai");
        $("#segHPCT_Loai").on("change", "input", function () {
            me.danhDauLoai_CDHV("segHPCT_Loai");
            me.getList_PhamVi_CDHV("rdoHPCT_Loai", "dropHPCT_PhamVi", "lblHPCT_PhamVi");
        });
        $("#dropHPCT_HeDaoTao").on("select2:select", function () { me.getList_KhoaDaoTao_HPCT(); me.getList_CT_HPCT(); });
        $("#dropHPCT_KhoaDaoTao").on("select2:select", function () { me.getList_CT_HPCT(); });
        $("#btnHPCT_Search").click(function () { me.getList_CT_HPCT(); });
        $("#txtHPCT_TuKhoa").keypress(function (e) {
            if (e.which === 13) { e.preventDefault(); me.getList_CT_HPCT(); }
        });
        $("#zoneHPCT_ChuongTrinh").on("click", ".hspv-ct-btn", function () { me.getList_HP_HPCT(this.getAttribute("data-id")); });
        $("#tblHPCT_HocPhan").on("change", "input.chkHP", function () {
            me.chonHP_HPCT(this.getAttribute("data-id"), this.checked);
        });
        $("#tblHPCT_HocPhan").on("click", "tr.hspv-row", function (e) {
            if (e.target.tagName === "INPUT") return;
            var chk = $(this).find("input.chkHP")[0];
            if (chk) { chk.checked = !chk.checked; $(chk).trigger("change"); }
        });
        $("#chkHPCT_All").click(function () {
            var b = this.checked;
            $("#tblHPCT_HocPhan input.chkHP").each(function () {
                if ($(this).closest("tr").css("display") === "none" || this.checked === b) return;
                this.checked = b;
                me.chonHP_HPCT(this.getAttribute("data-id"), b);
            });
        });
        $("#txtHPCT_LocHP").on("input", function () { me.locHP_HPCT(this.value); });
        $("#btnHPCT_BoChon").click(function (e) {
            e.preventDefault();
            me.boChon_HPCT();
        });
        $("#txtHPCT_HeSo").on("input", function () { $(this).removeClass("hspv-invalid"); me.capNhat_HPCT(); });
        $("#btnSave_HPCT").click(function () { me.save_HPCT(); });

        /*-- Tung lop hoc phan --*/
        $("#btnAdd_HeSoPhamVi_LHP").click(function (e) { e.preventDefault(); me.openForm_LHP(); });
        $("#dropLHP_ThoiGian, #dropLHP_HeDaoTao").on("select2:select", function () {
            me.getList_KhoaToChuc_LHP();
            me.getList_CTToChuc_LHP();
            me.getList_LHP(1);
        });
        $("#dropLHP_KhoaDaoTao").on("select2:select", function () { me.getList_CTToChuc_LHP(); me.getList_LHP(1); });
        $("#dropLHP_ChuongTrinh").on("select2:select", function () { me.getList_LHP(1); });
        $("#btnLHP_Search").click(function () { me.getList_LHP(1); });
        $("#txtLHP_TuKhoa").keypress(function (e) {
            if (e.which === 13) { e.preventDefault(); me.getList_LHP(1); }
        });
        $("#tblHeSoLHP").delegate(".chkLHP", "change", function () {
            var strId = this.getAttribute("data-id");
            var aData = me.dtLHP.find(function (x) { return String(x.ID) === strId; });
            if (this.checked && aData) me.objLHPChon[strId] = aData;
            else delete me.objLHPChon[strId];
            $(this).closest("tr").toggleClass("hspv-row-picked", this.checked);
            me.capNhat_LHP();
        });
        $("#chkLHP_All").click(function () {
            var b = this.checked;
            $("#tblHeSoLHP .chkLHP").each(function () {
                if (this.checked !== b) { this.checked = b; $(this).trigger("change"); }
            });
        });
        $("#btnLHP_BoChon").click(function (e) {
            e.preventDefault();
            me.objLHPChon = {};
            $("#tblHeSoLHP .chkLHP, #chkLHP_All").prop("checked", false);
            $("#tblHeSoLHP tr").removeClass("hspv-row-picked");
            me.capNhat_LHP();
        });
        $("#txtLHP_HeSo").on("input", function () { $(this).removeClass("hspv-invalid"); me.capNhat_LHP(); });
        $("#btnSave_LHP").click(function () { me.save_LHP(); });

        /*-- Chuc danh/hoc vi cho tung he dao tao --*/
        $("#btnAdd_HeSoPhamVi_CDHV").click(function (e) { e.preventDefault(); me.openForm_CDHV(); });
        me.genLoai_CDHV("segCDHV_Loai", "rdoCDHV_Loai");
        $("#segCDHV_Loai").on("change", "input", function () {
            me.danhDauLoai_CDHV("segCDHV_Loai");
            me.getList_PhamVi_CDHV("rdoCDHV_Loai", "dropCDHV_PhamVi", "lblCDHV_PhamVi");
            me.capNhat_CDHV();
        });
        $("#dropCDHV_PhamVi").on("select2:select change", function () { me.capNhat_CDHV(); });
        $("#zoneHe_CDHV").on("change", "input[type=checkbox]", function () {
            $(this).closest(".hspv-chk").toggleClass("on", this.checked);
            me.capNhat_CDHV();
        });
        $("#txtLocHe_CDHV").on("input", function () { me.locChk("zoneHe_CDHV", this.value); });
        $("#btnChonHetHe_CDHV").click(function (e) { e.preventDefault(); me.chonChk("zoneHe_CDHV", true); me.capNhat_CDHV(); });
        $("#btnBoChonHe_CDHV").click(function (e) { e.preventDefault(); me.chonChk("zoneHe_CDHV", false); me.capNhat_CDHV(); });
        $("#txtCDHV_HeSo").on("input", function () { $(this).removeClass("hspv-invalid"); me.capNhat_CDHV(); });
        $("#btnSave_CDHV").click(function () { me.save_CDHV(); });
    },

    /*------------------------------------------
    --Discription: [1] Tien ich
    -------------------------------------------*/
    /* Combo hien "TEN - MA"; khong co ma thi chi hien TEN */
    tenMa: function (aData) {
        var ten = edu.util.returnEmpty(aData.TEN);
        var ma = edu.util.returnEmpty(aData.MA || aData.HANHDONG_MA);
        return ma ? ten + " - " + ma : ten;
    },
    maCua: function (aData) {
        return edu.util.returnEmpty(aData.MA || aData.HANHDONG_MA);
    },
    logMauCombo: function (strDrop_Id, data) {
        if (window.console && data && data.length) console.log("[hesophamvi] " + strDrop_Id + " - ban ghi dau:", data[0]);
    },
    esc: function (s) {
        return edu.util.returnEmpty(s).toString()
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    boDau: function (s) {
        return edu.util.returnEmpty(s).toString().toLowerCase()
            .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    },
    /* "" -> null (dHeSo la NUMBER, gui "" thi Oracle nuot loi); cho phep dau phay thap phan */
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
    textChon: function (strDrop_Id) {
        return edu.util.getValById(strDrop_Id) ? $.trim($("#" + strDrop_Id + " option:selected").text()) : "";
    },
    /* Gia tri mac dinh cho combo cua form: lay theo bo loc tren man hinh neu form chua chon */
    macDinh: function (strDrop_Id, strFrom_Id) {
        var v = edu.util.getValById(strFrom_Id);
        if (!edu.util.getValById(strDrop_Id) && v) edu.util.viewValById(strDrop_Id, v);
    },
    thongBao: function (strZone_Id, strHtml, strKieu) {
        var $z = $("#" + strZone_Id);
        if (!strHtml) { $z.hide().html(""); return; }
        $z.attr("class", "hspv-alert " + (strKieu || "w")).html(strHtml).show();
    },
    /* Nguoi dung da sua lua chon -> an canh bao loi cu (giu thong bao ket qua luu) */
    anCanhBao: function (strZone_Id) {
        if ($("#" + strZone_Id).hasClass("w")) this.thongBao(strZone_Id, "");
    },
    /* Ma pham vi ghep: noi lien cac Id theo dung thu tu sheet quy dinh (xem dau file). Doi cach ghep chi sua o day. */
    ghepPhamVi: function (arrId) {
        return arrId.map(function (s) { return edu.util.returnEmpty(s); }).join("");
    },
    /* Id CTDT + Id hoc phan lay tu dong cua ham lay ds hoc phan theo CTDT (DAOTAO_TOCHUCCHUONGTRINH_ID, DAOTAO_HOCPHAN_ID) */
    idCT_HPCT: function (x) { return x.hp.DAOTAO_TOCHUCCHUONGTRINH_ID || x.ct.ID; },
    idHP_HPCT: function (x) { return x.hp.DAOTAO_HOCPHAN_ID; },
    /* Danh sach checkbox dang the (dung cho he dao tao) */
    genChk: function (strZone_Id, data, fnTen, fnMa, strRong) {
        var me = this;
        var h = "";
        data.forEach(function (e) {
            var ten = edu.util.returnEmpty(fnTen(e)), ma = edu.util.returnEmpty(fnMa(e));
            h += '<label class="hspv-chk" title="' + me.esc(ma ? ten + " - " + ma : ten) + '" data-loc="' + me.esc(me.boDau(ten + " " + ma)) + '">'
                + '<input type="checkbox" value="' + me.esc(e.ID) + '" />'
                + '<span class="hspv-chk-t">' + me.esc(ten) + '</span>'
                + (ma ? '<span class="hspv-chk-m">' + me.esc(ma) + '</span>' : '')
                + '</label>';
        });
        $("#" + strZone_Id).html(h || '<div class="hspv-empty">' + strRong + '</div>');
    },
    locChk: function (strZone_Id, strText) {
        var me = this;
        var s = me.boDau(strText).trim();
        $("#" + strZone_Id + " .hspv-chk").each(function () {
            $(this).toggle(!s || ($(this).attr("data-loc") || "").indexOf(s) !== -1);
        });
    },
    chonChk: function (strZone_Id, bChon) {
        $("#" + strZone_Id + " .hspv-chk").each(function () {
            if (this.style.display === "none") return;
            $(this).toggleClass("on", bChon).find("input")[0].checked = bChon;
        });
    },
    daChonChk: function (strZone_Id, data) {
        var arr = [];
        $("#" + strZone_Id + " input[type=checkbox]:checked").each(function () {
            var strId = this.value;
            var e = data.find(function (x) { return String(x.ID) === strId; });
            if (e) arr.push(e);
        });
        return arr;
    },

    /*------------------------------------------
    --Discription: [2] Combo dung chung
    -------------------------------------------*/
    getList_LoaiBang: function () {
        // Loai he so = danh muc KLGD.PHANLOAIXACNHAN (cung danh muc "Loai he so" cua form them -> strLoaiBang_Id)
        var me = this;
        var arrDrop = ["dropSearch_LoaiBang", "dropPhamViApDung", "dropPhamVi_N", "dropHPCT_LoaiBang", "dropLHP_LoaiBang", "dropCDHV_LoaiBang"];
        edu.system.loadToCombo_DanhMucDuLieu("KLGD.PHANLOAIXACNHAN", arrDrop.join(","), "", function (data) {
            if (!data || !data.length) return;
            edu.system.loadToCombo_data({
                data: data,
                renderInfor: {
                    id: "ID", parentId: "", name: "TEN", code: "MA",
                    mRender: function (nRow, aData) { return me.tenMa(aData); }
                },
                renderPlace: arrDrop,
                title: "Chọn loại hệ số"
            });
        }, "Chọn loại hệ số");
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
            renderPlace: ["dropThoiGian", "dropSearch_ThoiGian", "dropThoiGian_N", "dropHPCT_ThoiGian", "dropLHP_ThoiGian", "dropCDHV_ThoiGian"],
            type: "",
            title: "Chọn thời gian",
        }
        edu.system.loadToCombo_data(obj);
    },
    getList_HeDaoTao: function () {
        var me = this;
        var objList = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        };
        edu.system.getList_HeDaoTao(objList, "", "", function (data) {
            me.genCombo(data, ["dropHPCT_HeDaoTao", "dropLHP_HeDaoTao"], "TENHEDAOTAO", "Tất cả hệ đào tạo");
            me.dtHeDaoTao = data || [];
            me.genChk("zoneHe_CDHV", me.dtHeDaoTao,
                function (e) { return e.TENHEDAOTAO; }, function (e) { return e.MAHEDAOTAO; }, "Chưa có hệ đào tạo.");
            me.capNhat_CDHV();
        });
    },
    /* "Chon loai" (Chuc danh | Hoc vi) dang nut gat */
    genLoai_CDHV: function (strZone_Id, strName) {
        var me = this;
        var h = "";
        me.LOAI_CDHV.forEach(function (e, i) {
            h += '<label class="hspv-seg-i' + (i === 0 ? ' on' : '') + '">'
                + '<input type="radio" name="' + strName + '" value="' + me.esc(e.MA) + '"' + (i === 0 ? ' checked' : '') + ' />'
                + me.esc(e.TEN) + '</label>';
        });
        $("#" + strZone_Id).html(h);
    },
    danhDauLoai_CDHV: function (strZone_Id) {
        $("#" + strZone_Id + " .hspv-seg-i").each(function () {
            $(this).toggleClass("on", $(this).find("input")[0].checked);
        });
    },
    loaiChon_CDHV: function (strName) {
        var v = $("input[name='" + strName + "']:checked").val() || "";
        return this.LOAI_CDHV.find(function (e) { return e.MA === v; }) || null;
    },
    /* Danh muc theo ma bang cua loai dang chon (Id danh muc = Id chuc danh / hoc vi) -> combo; cache theo ma */
    getList_PhamVi_CDHV: function (strName, strDrop_Id, strLbl_Id) {
        var me = this;
        var loai = me.loaiChon_CDHV(strName);
        var strTen = loai ? loai.TEN : "Chức danh / học vị";
        if (strLbl_Id) $("#" + strLbl_Id).text(strTen);
        var render = function (data) {
            edu.system.loadToCombo_data({
                data: data || [],
                renderInfor: {
                    id: "ID", parentId: "", name: "TEN", code: "MA",
                    mRender: function (nRow, aData) { return me.tenMa(aData); }
                },
                renderPlace: [strDrop_Id],
                title: "Chọn " + strTen.toLowerCase()
            });
        };
        if (!loai) { render([]); return; }
        if (me.objDM_CDHV[loai.MA]) { render(me.objDM_CDHV[loai.MA]); return; }
        render([]);
        edu.system.getList_DanhMucDulieu({ strMaBangDanhMuc: loai.MA, strTenCotSapXep: "", iTrangThai: 1 }, "", "", function (data) {
            me.logMauCombo(strDrop_Id, data);
            me.objDM_CDHV[loai.MA] = data || [];
            var cur = me.loaiChon_CDHV(strName);
            if (cur && cur.MA === loai.MA) render(me.objDM_CDHV[loai.MA]); // da doi loai trong luc cho -> bo ket qua cu
        });
    },
    genCombo: function (data, arrPlace, strName, strTitle) {
        edu.system.loadToCombo_data({
            data: data || [],
            renderInfor: { id: "ID", parentId: "", name: strName, code: "", avatar: "" },
            renderPlace: arrPlace,
            type: "",
            title: strTitle,
        });
    },
    /* Lay danh sach hinh thuc cua 1 loai he so -> callback(data) (null neu loi) */
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
                if (data.Success) callback(data.Data || []);
                else { edu.system.alert(" : " + data.Message, "s"); callback(null); }
            },
            error: function (er) { edu.system.alert(" (er): " + JSON.stringify(er), "w"); callback(null); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    getList_LoaiApDung: function (strFrom, strTo) {
        var me = this;
        me.fetchLoai(edu.util.getValById(strFrom || "dropPhamViApDung"), function (data) {
            me.cbGenCombo_LoaiApDung(data || [], strTo || "dropLoaiApDung");
        });
    },
    cbGenCombo_LoaiApDung: function (data, strTo) {
        var me = this;
        strTo = strTo || "dropLoaiApDung";
        me.logMauCombo(strTo, data);
        edu.system.loadToCombo_data({
            data: data,
            renderInfor: {
                id: "ID", parentId: "", name: "TEN", code: "MA", avatar: "",
                mRender: function (nRow, aData) { return me.tenMa(aData); }
            },
            renderPlace: [strTo],
            type: "",
            title: "Chọn hình thức",
        });
    },
    /* GET chung cho cac danh sach phu */
    callGet: function (obj_list, fnSuccess) {
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) fnSuccess(edu.util.checkValue(data.Data) ? data.Data : [], data.Pager);
                else edu.system.alert(obj_list.action + " : " + data.Message, "w");
            },
            error: function (er) { edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w"); },
            type: "GET",
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: [3] AccessDB
    -------------------------------------------*/
    /* Tham so makeRequest cua ham Them/Sua hien tai cho 1 pham vi (dung chung cho 4 cach them) */
    req_HeSoPhamVi: function (o) {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/FSkkLB4KDQYFHgkkEi4eESkgLBcoADEFNC8m',
            'func': 'PKG_KLGV_V2_THONGTIN.Them_KLGD_HeSo_PhamViApDung',
            'iM': edu.system.iM,
            'strId': o.strId || "",
            'strPhamViApDung_Id': o.strPhamViApDung_Id,
            'dHeSo': me.toSo(o.dHeSo),
            'strLoaiBang_Id': o.strLoaiBang_Id,
            'strDaoTao_ThoiGianDaoTao_Id': o.strDaoTao_ThoiGianDaoTao_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (obj_save.strId) {
            obj_save.action = 'NS_KLGD_ThongTin_MH/EjQgHgoNBgUeCSQSLh4RKSAsFygAMQU0LyYP';
            obj_save.func = 'PKG_KLGV_V2_THONGTIN.Sua_KLGD_HeSo_PhamViApDung';
        }
        return { type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: [] };
    },
    req_Xoa_HeSoPhamVi: function (strId) {
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/GS4gHgoNBgUeCSQSLh4RKSAsFygAMQU0LyYP',
            'func': 'PKG_KLGV_V2_THONGTIN.Xoa_KLGD_HeSo_PhamViApDung',
            'iM': edu.system.iM,
            'strId': strId,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        return { type: "POST", action: obj_save.action, contentType: true, data: obj_save, fakedb: [] };
    },
    getList_HeSoPhamVi: function () {
        var me = this;
        var obj_save = {
            'action': 'NS_KLGD_ThongTin_MH/DSA4BRIKDQYFHgkkEi4eESkgLBcoADEFNC8m',
            'func': 'PKG_KLGV_V2_THONGTIN.LayDSKLGD_HeSo_PhamViApDung',
            'iM': edu.system.iM,
            'strLoaiBang_Id': edu.system.getValById('dropSearch_LoaiBang'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.system.getValById('dropSearch_ThoiGian'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtHeSoPhamVi = data.Data || [];
                    me.genTable_HeSoPhamVi(me.locTuKhoa(me.dtHeSoPhamVi));
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
        var s = me.boDau(edu.util.getValById("txtSearch_TuKhoa")).trim();
        if (!s) return data;
        return data.filter(function (e) {
            return me.boDau([e.PHAMVIAPDUNG_TEN, e.LOAIBANG_TEN, e.HESO, e.THOIGIAN, e.NGUOITAO_TAIKHOAN].join(" ")).indexOf(s) !== -1;
        });
    },
    genTable_HeSoPhamVi: function (data) {
        $("#lblHeSoPhamVi_Tong").html(data.length);
        edu.system.loadToTable_data({
            strTable_Id: "tblHeSoPhamVi",
            aaData: data,
            colPos: { center: [0, 2, 6, 7] },
            aoColumns: [
                { "mDataProp": "PHAMVIAPDUNG_TEN" },
                { "mDataProp": "HESO" },
                { "mDataProp": "THOIGIAN" },
                { "mDataProp": "NGAYTAO_DD_MM_YYYY_HHMMSS" },
                { "mDataProp": "NGUOITAO_TAIKHOAN" },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnEdit" id="' + aData.ID + '" title="Sửa"><i class="fa fa-edit color-active"></i></a></span>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '"/>';
                    }
                }
            ]
        });
    },
    /* Chay danh sach ban ghi qua form tien trinh chung; may khach chua co edu.process thi goi lan luot */
    runThem: function (cfg) {
        var me = this;
        if (edu.process && typeof edu.process.run === "function") {
            edu.process.run({
                title: cfg.title,
                subTitles: cfg.subTitles || [],
                unit: "khai báo",
                columns: cfg.columns,
                items: cfg.items,
                request: cfg.request,
                notes: cfg.notes || [],
                fileName: cfg.fileName,
                autoStart: true,
                hideModal: cfg.modal,
                refresh: function () { me.getList_HeSoPhamVi(); },
                onClose: function (sum) {
                    if (sum && sum.ok > 0 && !sum.err && !sum.pending && cfg.onDone) cfg.onDone();
                }
            });
            return;
        }
        var i = 0, nOk = 0, arrLoi = [];
        var $btn = $(cfg.modal + " .hspv-foot .btn-primary").addClass("disabled").css("pointer-events", "none");
        var next = function () {
            if (i >= cfg.items.length) {
                $btn.removeClass("disabled").css("pointer-events", "");
                var h = "Đã lưu <b>" + nOk + "/" + cfg.items.length + "</b> khai báo.";
                if (arrLoi.length) h += "<br/>Không thành công " + arrLoi.length + ":<br/>" + arrLoi.slice(0, 30).join("<br/>");
                me.thongBao(cfg.zone, h, arrLoi.length ? "w" : "s");
                if (nOk > 0) me.getList_HeSoPhamVi();
                if (!arrLoi.length && cfg.onDone) cfg.onDone();
                return;
            }
            var it = cfg.items[i++];
            var strTen = cfg.columns[0].render(it);
            me.thongBao(cfg.zone, '<i class="fa fa-spinner fa-spin"></i> Đang lưu ' + i + "/" + cfg.items.length + "…", "i");
            var p = cfg.request(it);
            p.success = function (data) {
                if (data && data.Success) nOk++;
                else arrLoi.push(me.esc(strTen) + ": " + me.esc((data && data.Message) || "Không thành công"));
                next();
            };
            p.error = function (er) { arrLoi.push(me.esc(strTen) + ": " + me.esc((er && er.statusText) || "Lỗi kết nối")); next(); };
            edu.system.makeRequest(p, false, false, false, null);
        };
        next();
    },

    /*------------------------------------------
    --Discription: [4] Them cho tung hinh thuc / Sua / Xoa
    -------------------------------------------*/
    openForm_HeSoPhamVi: function (data) {
        var me = this;
        var bSua = !!data;
        data = data || {};
        me.rowEdit = bSua ? data : null;
        me.strHeSoPhamVi_Id = data.ID || "";
        var $m = $("#myModal_HeSoPhamVi");
        $("#lblTieuDe_HSPV").html(bSua ? '<i class="fa fa-pencil"></i> Sửa hệ số theo phạm vi' : '<i class="fa fa-plus"></i> Thêm mới cho từng hình thức');
        $m.find(".zoneOpenNew").toggle(!bSua);
        $m.find(".btnOpenDelete").toggle(bSua);
        $("#lblPhamVi").html(me.esc(data.LOAIBANG_TEN || "(chưa có)"));
        $("#lblLoaiApDung").html(me.esc(data.PHAMVIAPDUNG_TEN));
        $("#lblThoiGian").html(me.esc(data.THOIGIAN));
        if (!bSua) {
            me.macDinh("dropPhamViApDung", "dropSearch_LoaiBang");
            me.macDinh("dropThoiGian", "dropSearch_ThoiGian");
            if (edu.util.getValById("dropPhamViApDung") && $("#dropLoaiApDung option").length <= 1) me.getList_LoaiApDung("dropPhamViApDung", "dropLoaiApDung");
        }
        edu.util.viewValById("txtHeSo", data.HESO);
        $m.modal("show");
    },
    save_HeSoPhamVi: function () {
        var me = this;
        var r = me.rowEdit;
        var o = {
            strId: me.strHeSoPhamVi_Id,
            strLoaiBang_Id: edu.system.getValById('dropPhamViApDung'),
            strPhamViApDung_Id: edu.system.getValById('dropLoaiApDung'),
            strDaoTao_ThoiGianDaoTao_Id: edu.system.getValById('dropThoiGian'),
            dHeSo: edu.system.getValById('txtHeSo')
        };
        if (!r) {
            if (!o.strLoaiBang_Id) { edu.system.alert("Vui lòng chọn loại hệ số."); return; }
            if (!o.strPhamViApDung_Id) { edu.system.alert("Vui lòng chọn hình thức."); return; }
        }
        if (!me.laSoHopLe(o.dHeSo)) { edu.system.alert("Hệ số phải là số (VD: 1 hoặc 1,2)."); return; }
        var p = me.req_HeSoPhamVi(o);
        p.success = function (data) {
            if (data.Success) {
                edu.system.alert(o.strId ? "Cập nhật thành công!" : "Thêm mới thành công!");
                me.getList_HeSoPhamVi();
            }
            else {
                edu.system.alert(data.Message);
            }
        };
        p.error = function (er) { edu.system.alert(JSON.stringify(er)); };
        edu.system.makeRequest(p, false, false, false, null);
    },
    getDongDaChon: function () {
        var me = this;
        if (edu.process && typeof edu.process.selectedRows === "function") return edu.process.selectedRows("tblHeSoPhamVi", me.dtHeSoPhamVi);
        var arrId = edu.util.getArrCheckedIds("tblHeSoPhamVi", "checkX");
        return me.dtHeSoPhamVi.filter(function (e) { return arrId.indexOf(e.ID) !== -1 || arrId.indexOf(String(e.ID)) !== -1; });
    },
    /* Xoa: Buoc 1 cua form tien trinh = xac nhan (hien dung cac dong se xoa), 1 Id / 1 lan goi */
    xoa_HeSoPhamVi: function (arrRow, strHideModal) {
        var me = this;
        if (!arrRow || !arrRow.length) { edu.system.alert("Vui lòng tick chọn bản ghi cần xóa."); return; }
        if (!edu.process || typeof edu.process.run !== "function") {
            if (strHideModal) $(strHideModal).modal("hide");
            edu.system.confirm("Bạn có chắc chắn xóa " + arrRow.length + " bản ghi không?");
            $("#btnYes").off("click.hspv").on("click.hspv", function () {
                edu.system.alert('<div id="zoneprocessXXXX"></div>');
                edu.system.genHTML_Progress("zoneprocessXXXX", arrRow.length);
                arrRow.forEach(function (r) { me.delete_HeSoPhamVi(r.ID); });
            });
            return;
        }
        edu.process.run({
            title: "Xóa hệ số theo phạm vi",
            unit: "bản ghi",
            columns: [
                { header: "Phạm vi áp dụng", render: function (r) { return r.PHAMVIAPDUNG_TEN; } },
                { header: "Hệ số", render: function (r) { return r.HESO; } },
                { header: "Thời gian", render: function (r) { return r.THOIGIAN; } }
            ],
            items: arrRow,
            request: function (r) { return me.req_Xoa_HeSoPhamVi(r.ID); },
            notes: ["Kiểm tra lại các bản ghi bên dưới rồi bấm chạy để xóa. Dữ liệu đã xóa không khôi phục được."],
            okMessage: "Đã xóa",
            fileName: "XoaHeSoPhamVi",
            hideModal: strHideModal,
            refresh: function () { me.getList_HeSoPhamVi(); }
        });
    },
    delete_HeSoPhamVi: function (strId) {
        var me = this;
        var p = me.req_Xoa_HeSoPhamVi(strId);
        p.success = function (data) {
            edu.system.afterComfirm({ title: "", content: data.Success ? "Xóa dữ liệu thành công!" : data.Message, code: data.Success ? "" : "w" });
        };
        p.error = function (er) { edu.system.afterComfirm({ title: "", content: JSON.stringify(er), code: "w" }); };
        p.complete = function () {
            edu.system.start_Progress("zoneprocessXXXX", function () { me.getList_HeSoPhamVi(); });
        };
        edu.system.makeRequest(p, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: [5] Them cho nhieu hinh thuc mot lan khai
    -------------------------------------------*/
    openForm_Nhieu: function () {
        var me = this;
        me.thongBao("zoneThongBao_N", "");
        if (!edu.util.getValById("dropPhamVi_N") && edu.util.getValById("dropSearch_LoaiBang")) {
            me.macDinh("dropPhamVi_N", "dropSearch_LoaiBang");
            me.getList_Loai_N();
        }
        me.macDinh("dropThoiGian_N", "dropSearch_ThoiGian");
        me.updateTongHop_N();
        $("#myModal_HeSoPhamVi_Nhieu").modal("show");
    },
    getList_Loai_N: function () {
        var me = this;
        var strPhamVi = edu.util.getValById("dropPhamVi_N");
        me.dtLoai_N = [];
        $("#txtLocLoai_N").val("");
        if (!strPhamVi) { me.genLoai_N("Chọn loại hệ số để hiện danh sách hình thức."); return; }
        me.genLoai_N('<i class="fa fa-spinner fa-spin"></i> Đang tải danh sách hình thức…');
        me.fetchLoai(strPhamVi, function (data) {
            if (edu.util.getValById("dropPhamVi_N") !== strPhamVi) return;
            if (data === null) { me.genLoai_N("Không tải được danh sách hình thức. Chọn lại loại hệ số để thử lại."); return; }
            me.logMauCombo("zoneLoai_N", data);
            me.dtLoai_N = data;
            me.genLoai_N("Loại hệ số này chưa có hình thức nào.");
        });
    },
    genLoai_N: function (strRong) {
        var me = this;
        var h = "";
        me.dtLoai_N.forEach(function (e) {
            var ma = me.maCua(e);
            h += '<label class="hspv-chk" title="' + me.esc(me.tenMa(e)) + '" data-loc="' + me.esc(me.boDau(e.TEN + " " + ma)) + '">'
                + '<input type="checkbox" value="' + me.esc(e.ID) + '" />'
                + '<span class="hspv-chk-t">' + me.esc(e.TEN) + '</span>'
                + (ma ? '<span class="hspv-chk-m">' + me.esc(ma) + '</span>' : '')
                + '</label>';
        });
        $("#zoneLoai_N").html(h || '<div class="hspv-empty">' + strRong + '</div>');
        me.updateTongHop_N();
    },
    locLoai_N: function (strText) {
        var me = this;
        var s = me.boDau(strText).trim();
        $("#zoneLoai_N .hspv-chk").each(function () {
            $(this).toggle(!s || ($(this).attr("data-loc") || "").indexOf(s) !== -1);
        });
    },
    chonLoai_N: function (bChon) {
        var me = this;
        $("#zoneLoai_N .hspv-chk").each(function () {
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
    updateTongHop_N: function () {
        this.anCanhBao("zoneThongBao_N");
        var nTong = $("#zoneLoai_N input[type=checkbox]").length;
        var n = $("#zoneLoai_N input[type=checkbox]:checked").length;
        $("#lblDemLoai_N").text("Đã chọn " + n + "/" + nTong);
        if (n) {
            $("#lblTongHop_N").html("Sẽ lưu <b>" + n + "</b> hình thức, mỗi hình thức 1 khai báo");
            $("#lblSave_N").text("Lưu " + n + " khai báo");
        }
        else {
            $("#lblTongHop_N").text("Chọn hình thức và nhập hệ số để lưu.");
            $("#lblSave_N").text("Lưu");
        }
    },
    save_Nhieu: function () {
        var me = this;
        var strLoaiBang = edu.util.getValById("dropPhamVi_N");
        var strThoiGian = edu.util.getValById("dropThoiGian_N");
        var strHeSo = $.trim($("#txtHeSo_N").val());
        var arrLoai = me.getLoaiDaChon_N();
        var arrLoi = [];
        if (!strLoaiBang) arrLoi.push("Chưa chọn loại hệ số.");
        if (!arrLoai.length) arrLoi.push("Chưa chọn hình thức nào.");
        if (!strHeSo) { arrLoi.push("Chưa nhập hệ số."); $("#txtHeSo_N").addClass("hspv-invalid"); }
        else if (!me.laSoHopLe(strHeSo)) { arrLoi.push("Hệ số phải là số (VD: 1 hoặc 1,2)."); $("#txtHeSo_N").addClass("hspv-invalid"); }
        if (arrLoi.length) { me.thongBao("zoneThongBao_N", arrLoi.join("<br/>"), "w"); return; }
        me.thongBao("zoneThongBao_N", "");
        me.runThem({
            title: "Thêm mới hệ số cho nhiều hình thức",
            subTitles: ["Loại hệ số: " + me.textChon("dropPhamVi_N"), "Thời gian: " + (me.textChon("dropThoiGian_N") || "(không chọn)"), "Hệ số: " + strHeSo],
            columns: [{ header: "Hình thức", render: function (it) { return me.tenMa(it); } }],
            items: arrLoai,
            request: function (it) {
                return me.req_HeSoPhamVi({ strLoaiBang_Id: strLoaiBang, strPhamViApDung_Id: it.ID, strDaoTao_ThoiGianDaoTao_Id: strThoiGian, dHeSo: strHeSo });
            },
            notes: strThoiGian ? [] : ["Chưa chọn thời gian."],
            fileName: "KhaiHeSoPhamVi_NhieuHinhThuc",
            modal: "#myModal_HeSoPhamVi_Nhieu",
            zone: "zoneThongBao_N",
            onDone: function () { me.chonLoai_N(false); }
        });
    },

    /*------------------------------------------
    --Discription: [6] Them cho to hop hoc phan - CTDT
    --  CTDT: KHCT_ToChucChuongTrinh/LayDanhSach; hoc phan cua CTDT: KHCT_HocPhan_ChuongTrinh/LayDanhSach
    --  (cung bo ham man Chuong trinh - hoc phan / Xem CTDT cua ApisKeHoachChuongTrinh)
    -------------------------------------------*/
    /* strMode: "" = to hop hoc phan - CTDT; "CDHV" = chuc danh/hoc vi cho tung hoc phan theo CTDT
       (them khoi chon chuc danh/hoc vi, bat buoc loc he dao tao vi ma pham vi ghep ca Id he) */
    openForm_HPCT: function (strMode) {
        var me = this;
        strMode = strMode || "";
        var bCDHV = strMode === "CDHV";
        if (me.modeHPCT !== strMode) {
            // doi muc dich: bo chon cu de khong luu nham sang kieu pham vi khac
            var bDaTim = me.modeHPCT !== null && me.dtCT_HPCT.length > 0;
            me.modeHPCT = strMode;
            me.boChon_HPCT();
            me.objCT_HPCT = null;
            me.dtHP_HPCT = [];
            $("#lblHPCT_TenCT").text("(chưa chọn CTĐT)");
            $("#tblHPCT_HocPhan tbody").html('<tr><td colspan="4" class="hspv-empty">Bấm "Xem học phần" ở một chương trình bên trái.</td></tr>');
            if (bDaTim) me.getList_CT_HPCT();
            else $("#zoneHPCT_ChuongTrinh").html(bCDHV && !edu.util.getValById("dropHPCT_HeDaoTao")
                ? '<div class="hspv-empty">Chọn hệ đào tạo trước (mã phạm vi ghép cả Id hệ đào tạo), rồi bấm Tìm CTĐT.</div>'
                : '<div class="hspv-empty">Chọn hệ / khóa rồi bấm Tìm CTĐT.</div>');
        }
        $("#lblTieuDe_HPCT").html(bCDHV
            ? '<i class="fa fa-id-badge"></i> Thêm mới theo chức danh/học vị cho từng học phần theo CTĐT'
            : '<i class="fa fa-sitemap"></i> Thêm mới cho tổ hợp học phần - CTĐT');
        $("#secHPCT_CDHV").toggle(bCDHV);
        $("#lblHPCT_B1").text(bCDHV
            ? "Chọn hệ đào tạo, chương trình đào tạo, rồi tick học phần của chương trình"
            : "Chọn chương trình đào tạo, rồi tick học phần của chương trình");
        if (bCDHV && $("#dropHPCT_PhamVi option").length <= 1) me.getList_PhamVi_CDHV("rdoHPCT_Loai", "dropHPCT_PhamVi", "lblHPCT_PhamVi");
        me.thongBao("zoneThongBao_HPCT", "");
        me.macDinh("dropHPCT_LoaiBang", "dropSearch_LoaiBang");
        me.macDinh("dropHPCT_ThoiGian", "dropSearch_ThoiGian");
        if ($("#dropHPCT_KhoaDaoTao option").length === 0) me.getList_KhoaDaoTao_HPCT();
        me.capNhat_HPCT();
        $("#myModal_HeSoPhamVi_HPCT").modal("show");
    },
    boChon_HPCT: function () {
        this.objChon_HPCT = {};
        $("#tblHPCT_HocPhan input.chkHP, #chkHPCT_All").prop("checked", false);
        $("#tblHPCT_HocPhan tr").removeClass("hspv-row-picked");
        $("#zoneHPCT_ChuongTrinh .hspv-ct-n").remove();
        this.capNhat_HPCT();
    },
    getList_KhoaDaoTao_HPCT: function () {
        var me = this;
        edu.system.getList_KhoaDaoTao({
            strHeDaoTao_Id: edu.util.getValById("dropHPCT_HeDaoTao"),
            strCoSoDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 100000
        }, "", "", function (data) {
            me.genCombo(data, ["dropHPCT_KhoaDaoTao"], "TENKHOA", "Tất cả khóa đào tạo");
        });
    },
    getList_CT_HPCT: function () {
        var me = this;
        var strHe = edu.util.getValById("dropHPCT_HeDaoTao");
        var strHeTen = me.textChon("dropHPCT_HeDaoTao");
        if (me.modeHPCT === "CDHV" && !strHe) {
            me.dtCT_HPCT = [];
            $("#lblHPCT_TongCT").text(0);
            $("#zoneHPCT_ChuongTrinh").html('<div class="hspv-empty">Chọn hệ đào tạo trước (mã phạm vi ghép cả Id hệ đào tạo), rồi bấm Tìm CTĐT.</div>');
            return;
        }
        $("#zoneHPCT_ChuongTrinh").html('<div class="hspv-empty"><i class="fa fa-spinner fa-spin"></i> Đang tải chương trình…</div>');
        me.callGet({
            'action': 'KHCT_ToChucChuongTrinh/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById("txtHPCT_TuKhoa"),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValById("dropHPCT_KhoaDaoTao"),
            'strDaoTao_N_CN_Id': "",
            'strDaoTao_KhoaQuanLy_Id': "",
            'strDaoTao_HeDaoTao_Id': edu.util.getValById("dropHPCT_HeDaoTao"),
            'strDaoTao_ToChucCT_Cha_Id': "",
            'strNguoiThucHien_Id': "",
            'pageIndex': 1,
            'pageSize': 240000
        }, function (data) {
            // ham lay CTDT khong tra he dao tao -> gan he cua bo loc luc tim (CTDT loc theo he nao thi thuoc he do)
            data.forEach(function (ct) { ct.HSPV_HEDAOTAO_ID = strHe; ct.HSPV_HEDAOTAO_TEN = strHeTen; });
            me.dtCT_HPCT = data;
            me.genList_CT_HPCT();
        });
    },
    demChon_CT: function (strCT_Id) {
        var me = this;
        return Object.keys(me.objChon_HPCT).filter(function (k) { return me.objChon_HPCT[k].ct.ID == strCT_Id; }).length;
    },
    genList_CT_HPCT: function () {
        var me = this;
        var h = "";
        $("#lblHPCT_TongCT").text(me.dtCT_HPCT.length);
        me.dtCT_HPCT.forEach(function (ct) {
            var n = me.demChon_CT(ct.ID);
            var bOn = me.objCT_HPCT && me.objCT_HPCT.ID == ct.ID;
            h += '<div class="hspv-ct' + (bOn ? ' on' : '') + '" data-id="' + me.esc(ct.ID) + '">'
                + '<div class="hspv-ct-b"><div class="hspv-ct-t">' + me.esc(ct.TENCHUONGTRINH) + '</div>'
                + '<div class="hspv-ct-s">Mã: ' + me.esc(ct.MACHUONGTRINH) + ' · ' + me.esc(ct.DAOTAO_KHOADAOTAO_TEN) + (ct.DAOTAO_N_CN_TEN ? ' · ' + me.esc(ct.DAOTAO_N_CN_TEN) : '') + '</div></div>'
                + (n ? '<span class="hspv-ct-n" title="Số học phần đã chọn">' + n + '</span>' : '')
                + '<button type="button" class="hspv-ct-btn" data-id="' + me.esc(ct.ID) + '"><i class="fa fa-eye"></i> Xem học phần</button>'
                + '</div>';
        });
        $("#zoneHPCT_ChuongTrinh").html(h || '<div class="hspv-empty">Không có chương trình phù hợp.</div>');
    },
    getList_HP_HPCT: function (strCT_Id) {
        var me = this;
        var ct = me.dtCT_HPCT.find(function (x) { return String(x.ID) === String(strCT_Id); });
        if (!ct) return;
        me.objCT_HPCT = ct;
        $("#zoneHPCT_ChuongTrinh .hspv-ct").removeClass("on").filter('[data-id="' + strCT_Id + '"]').addClass("on");
        $("#lblHPCT_TenCT").text(edu.util.returnEmpty(ct.TENCHUONGTRINH) + " (" + edu.util.returnEmpty(ct.MACHUONGTRINH) + ")");
        $("#txtHPCT_LocHP").val("");
        $("#tblHPCT_HocPhan tbody").html('<tr><td colspan="4" class="hspv-empty"><i class="fa fa-spinner fa-spin"></i> Đang tải học phần…</td></tr>');
        me.callGet({
            'action': 'KHCT_HocPhan_ChuongTrinh/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': '',
            'strDaoTao_ThoiGian_KH_Id': '',
            'strDaoTao_ThoiGian_TT_Id': '',
            'strThuocTinhHocPhan_Id': '',
            'strPhanCongPhamViDamNhiem_Id': '',
            'strDaoTao_HocPhan_Id': '',
            'strDaoTao_ChuongTrinh_Id': ct.ID,
            'strNguoiThucHien_Id': '',
            'pageIndex': 1,
            'pageSize': 100000000
        }, function (data) {
            if (!me.objCT_HPCT || me.objCT_HPCT.ID != ct.ID) return; // da chuyen sang CTDT khac
            me.dtHP_HPCT = data;
            me.genTable_HP_HPCT();
        });
    },
    genTable_HP_HPCT: function () {
        var me = this;
        var ct = me.objCT_HPCT;
        var h = "";
        me.dtHP_HPCT.forEach(function (hp) {
            var key = hp.DAOTAO_HOCPHAN_ID + "|" + ct.ID;
            var b = !!me.objChon_HPCT[key];
            h += '<tr class="hspv-row' + (b ? ' hspv-row-picked' : '') + '" data-loc="' + me.esc(me.boDau(hp.DAOTAO_HOCPHAN_MA + " " + hp.DAOTAO_HOCPHAN_TEN)) + '">'
                + '<td class="hspv-c-chk"><input type="checkbox" class="chkHP" data-id="' + me.esc(hp.DAOTAO_HOCPHAN_ID) + '"' + (b ? ' checked' : '') + ' /></td>'
                + '<td>' + me.esc(hp.DAOTAO_HOCPHAN_MA) + '</td>'
                + '<td>' + me.esc(hp.DAOTAO_HOCPHAN_TEN) + '</td>'
                + '<td>' + me.esc(hp.HOCTRINHAPDUNGHOCTAP) + '</td></tr>';
        });
        $("#tblHPCT_HocPhan tbody").html(h || '<tr><td colspan="4" class="hspv-empty">Chương trình này chưa có học phần.</td></tr>');
        $("#chkHPCT_All").prop("checked", me.dtHP_HPCT.length > 0 && $("#tblHPCT_HocPhan input.chkHP:not(:checked)").length === 0);
    },
    locHP_HPCT: function (strText) {
        var me = this;
        var s = me.boDau(strText).trim();
        $("#tblHPCT_HocPhan tr.hspv-row").each(function () {
            $(this).toggle(!s || ($(this).attr("data-loc") || "").indexOf(s) !== -1);
        });
    },
    chonHP_HPCT: function (strHP_Id, bChon) {
        var me = this;
        var ct = me.objCT_HPCT;
        if (!ct) return;
        var hp = me.dtHP_HPCT.find(function (x) { return String(x.DAOTAO_HOCPHAN_ID) === String(strHP_Id); });
        var key = strHP_Id + "|" + ct.ID;
        if (bChon && hp) me.objChon_HPCT[key] = { hp: hp, ct: ct };
        else delete me.objChon_HPCT[key];
        $("#tblHPCT_HocPhan input.chkHP[data-id='" + strHP_Id + "']").closest("tr").toggleClass("hspv-row-picked", bChon);
        // so hoc phan da chon cua CTDT dang xem (badge ben trai)
        var n = me.demChon_CT(ct.ID);
        var $ct = $("#zoneHPCT_ChuongTrinh .hspv-ct[data-id='" + ct.ID + "']");
        $ct.find(".hspv-ct-n").remove();
        if (n) $ct.find(".hspv-ct-btn").before('<span class="hspv-ct-n" title="Số học phần đã chọn">' + n + '</span>');
        me.capNhat_HPCT();
    },
    capNhat_HPCT: function () {
        this.anCanhBao("zoneThongBao_HPCT");
        var n = Object.keys(this.objChon_HPCT).length;
        $("#lblHPCT_SoChon").text(n);
        if (n) {
            $("#lblTongHop_HPCT").html(this.modeHPCT === "CDHV"
                ? "Sẽ lưu <b>" + n + "</b> học phần theo CTĐT cho chức danh/học vị đã chọn"
                : "Sẽ lưu <b>" + n + "</b> tổ hợp học phần - CTĐT");
            $("#lblSave_HPCT").text("Lưu " + n + " khai báo");
        }
        else {
            $("#lblTongHop_HPCT").text("Tick học phần và nhập hệ số để lưu.");
            $("#lblSave_HPCT").text("Lưu");
        }
    },
    save_HPCT: function () {
        var me = this;
        var bCDHV = me.modeHPCT === "CDHV";
        var arr = Object.keys(me.objChon_HPCT).map(function (k) { return me.objChon_HPCT[k]; });
        var strHeSo = $.trim($("#txtHPCT_HeSo").val());
        var strLoaiBang = edu.util.getValById("dropHPCT_LoaiBang");
        var strThoiGian = edu.util.getValById("dropHPCT_ThoiGian");
        var loai = bCDHV ? me.loaiChon_CDHV("rdoHPCT_Loai") : null;
        var strPhamVi = bCDHV ? edu.util.getValById("dropHPCT_PhamVi") : "";
        var arrLoi = [];
        if (bCDHV && !strPhamVi) arrLoi.push("Chưa chọn " + (loai ? loai.TEN.toLowerCase() : "chức danh / học vị") + ".");
        if (!arr.length) arrLoi.push("Chưa chọn học phần nào.");
        if (bCDHV) {
            var nThieuHe = arr.filter(function (x) { return !x.ct.HSPV_HEDAOTAO_ID; }).length;
            if (nThieuHe) arrLoi.push(nThieuHe + " học phần được chọn khi chưa lọc hệ đào tạo. Bỏ chọn, chọn hệ đào tạo rồi tìm lại CTĐT.");
        }
        if (!strHeSo) { arrLoi.push("Chưa nhập hệ số."); $("#txtHPCT_HeSo").addClass("hspv-invalid"); }
        else if (!me.laSoHopLe(strHeSo)) { arrLoi.push("Hệ số phải là số (VD: 1 hoặc 1,2)."); $("#txtHPCT_HeSo").addClass("hspv-invalid"); }
        if (arrLoi.length) { me.thongBao("zoneThongBao_HPCT", arrLoi.join("<br/>"), "w"); return; }
        me.thongBao("zoneThongBao_HPCT", "");
        var arrCot = [
            { header: "Học phần", render: function (x) { return edu.util.returnEmpty(x.hp.DAOTAO_HOCPHAN_TEN) + " (" + edu.util.returnEmpty(x.hp.DAOTAO_HOCPHAN_MA) + ")"; } },
            { header: "Chương trình đào tạo", render: function (x) { return edu.util.returnEmpty(x.ct.TENCHUONGTRINH) + " (" + edu.util.returnEmpty(x.ct.MACHUONGTRINH) + ")"; } }
        ];
        if (bCDHV) arrCot.push({ header: "Hệ đào tạo", render: function (x) { return x.ct.HSPV_HEDAOTAO_TEN; } });
        var arrTieuDe = ["Loại hệ số: " + (me.textChon("dropHPCT_LoaiBang") || "(không chọn)"), "Thời gian: " + (me.textChon("dropHPCT_ThoiGian") || "(không chọn)"), "Hệ số: " + strHeSo];
        if (bCDHV) arrTieuDe.unshift((loai ? loai.TEN : "Chức danh / học vị") + ": " + me.textChon("dropHPCT_PhamVi"));
        me.runThem({
            title: bCDHV ? "Thêm mới hệ số theo chức danh/học vị cho từng học phần theo CTĐT" : "Thêm mới hệ số cho tổ hợp học phần - CTĐT",
            subTitles: arrTieuDe,
            columns: arrCot,
            items: arr.map(function (x, i) { x.ID = x.hp.DAOTAO_HOCPHAN_ID + "_" + x.ct.ID; return x; }),
            request: function (x) {
                var arrId = [me.idCT_HPCT(x), me.idHP_HPCT(x)];
                if (bCDHV) arrId = [strPhamVi, x.ct.HSPV_HEDAOTAO_ID].concat(arrId);
                return me.req_HeSoPhamVi({
                    strLoaiBang_Id: strLoaiBang,
                    strPhamViApDung_Id: me.ghepPhamVi(arrId),
                    strDaoTao_ThoiGianDaoTao_Id: strThoiGian,
                    dHeSo: strHeSo
                });
            },
            notes: strThoiGian ? [] : ["Chưa chọn thời gian."],
            fileName: bCDHV ? "KhaiHeSoPhamVi_ChucDanhHocVi_HocPhanCTDT" : "KhaiHeSoPhamVi_ToHopHocPhanCTDT",
            modal: "#myModal_HeSoPhamVi_HPCT",
            zone: "zoneThongBao_HPCT",
            onDone: function () { $("#btnHPCT_BoChon").trigger("click"); me.genList_CT_HPCT(); }
        });
    },

    /*------------------------------------------
    --Discription: [7] Them theo tung lop hoc phan (pham vi = Id lop hoc phan)
    --  Danh sach lop: DKH_ThongTin/LayDSLopHocPhan; Khoa/CTDT to chuc: DKH_PhanCong_LopHP/*
    -------------------------------------------*/
    openForm_LHP: function () {
        var me = this;
        me.thongBao("zoneThongBao_LHP", "");
        me.macDinh("dropLHP_LoaiBang", "dropSearch_LoaiBang");
        var bMoi = !edu.util.getValById("dropLHP_ThoiGian");
        me.macDinh("dropLHP_ThoiGian", "dropSearch_ThoiGian");
        if (bMoi || $("#dropLHP_KhoaDaoTao option").length === 0) {
            me.getList_KhoaToChuc_LHP();
            me.getList_CTToChuc_LHP();
            me.getList_LHP(1);
        }
        me.capNhat_LHP();
        $("#myModal_HeSoPhamVi_LHP").modal("show");
    },
    getList_KhoaToChuc_LHP: function () {
        var me = this;
        me.callGet({
            'action': 'DKH_PhanCong_LopHP/LayDSKhoaToChuc',
            'type': 'GET',
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('dropLHP_HeDaoTao'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropLHP_ThoiGian'),
        }, function (data) {
            me.genCombo(data, ["dropLHP_KhoaDaoTao"], "TENKHOA", "Tất cả khóa đào tạo");
        });
    },
    getList_CTToChuc_LHP: function () {
        var me = this;
        me.callGet({
            'action': 'DKH_PhanCong_LopHP/LayDSChuongTrinhToChuc',
            'type': 'GET',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropLHP_ThoiGian'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValById('dropLHP_KhoaDaoTao'),
            'strDaoTao_HeDaoTao_Id': edu.util.getValById('dropLHP_HeDaoTao'),
            'strDaoTao_KhoaQuanLy_Id': '',
        }, function (data) {
            me.genCombo(data, ["dropLHP_ChuongTrinh"], "TENCHUONGTRINH", "Tất cả chương trình đào tạo");
        });
    },
    getList_LHP: function (iPage) {
        var me = this;
        if (iPage) edu.system.pageIndex_default = iPage;
        if (!edu.util.getValById('dropLHP_ThoiGian')) {
            $("#tblHeSoLHP tbody").html('<tr><td colspan="4" class="td-center hspv-empty">Chọn thời gian rồi bấm Tìm lớp.</td></tr>');
            return;
        }
        $("#tblHeSoLHP tbody").html('<tr><td colspan="4" class="td-center hspv-empty"><i class="fa fa-spinner fa-spin"></i> Đang tải…</td></tr>');
        me.callGet({
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
        }, function (data, iPager) {
            me.dtLHP = data;
            me.genTable_LHP(data, iPager);
        });
    },
    genTable_LHP: function (data, iPager) {
        var me = this;
        $("#lblLHP_Tong").html(iPager || 0);
        $("#chkLHP_All").prop("checked", false);
        if (!data.length) {
            $("#tblHeSoLHP tbody").html('<tr><td colspan="4" class="td-center hspv-empty">Không có lớp học phần phù hợp.</td></tr>');
            return;
        }
        edu.system.loadToTable_data({
            strTable_Id: "tblHeSoLHP",
            aaData: data,
            bPaginate: {
                strFuntionName: "main_doc.HeSoPhamVi.getList_LHP()",
                iDataRow: iPager
            },
            colPos: { center: [0, 3] },
            aoColumns: [
                { "mDataProp": "MALOP" },
                { "mDataProp": "TENLOP" },
                {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" class="chkLHP" data-id="' + aData.ID + '"' + (me.objLHPChon[aData.ID] ? ' checked="checked"' : '') + '/>';
                    }
                }
            ]
        });
        $("#tblHeSoLHP .chkLHP:checked").closest("tr").addClass("hspv-row-picked");
    },
    capNhat_LHP: function () {
        this.anCanhBao("zoneThongBao_LHP");
        var n = Object.keys(this.objLHPChon).length;
        $("#lblLHP_SoChon").html(n);
        if (n) {
            $("#lblTongHop_LHP").html("Sẽ lưu <b>" + n + "</b> lớp học phần");
            $("#lblSave_LHP").text("Lưu " + n + " khai báo");
        }
        else {
            $("#lblTongHop_LHP").text("Tick lớp học phần và nhập hệ số để lưu.");
            $("#lblSave_LHP").text("Lưu");
        }
    },
    save_LHP: function () {
        var me = this;
        var arr = Object.keys(me.objLHPChon).map(function (k) { return me.objLHPChon[k]; });
        var strHeSo = $.trim($("#txtLHP_HeSo").val());
        var strLoaiBang = edu.util.getValById("dropLHP_LoaiBang");
        var strThoiGian = edu.util.getValById("dropLHP_ThoiGian");
        var arrLoi = [];
        if (!strThoiGian) arrLoi.push("Chưa chọn thời gian.");
        if (!arr.length) arrLoi.push("Chưa chọn lớp học phần nào.");
        if (!strHeSo) { arrLoi.push("Chưa nhập hệ số."); $("#txtLHP_HeSo").addClass("hspv-invalid"); }
        else if (!me.laSoHopLe(strHeSo)) { arrLoi.push("Hệ số phải là số (VD: 1 hoặc 1,2)."); $("#txtLHP_HeSo").addClass("hspv-invalid"); }
        if (arrLoi.length) { me.thongBao("zoneThongBao_LHP", arrLoi.join("<br/>"), "w"); return; }
        me.thongBao("zoneThongBao_LHP", "");
        me.runThem({
            title: "Thêm mới hệ số theo từng lớp học phần",
            subTitles: ["Loại hệ số: " + (me.textChon("dropLHP_LoaiBang") || "(không chọn)"), "Thời gian: " + me.textChon("dropLHP_ThoiGian"), "Hệ số: " + strHeSo],
            columns: [{ header: "Lớp học phần", render: function (x) { return edu.util.returnEmpty(x.TENLOP) + " (" + edu.util.returnEmpty(x.MALOP) + ")"; } }],
            items: arr,
            request: function (x) {
                return me.req_HeSoPhamVi({ strLoaiBang_Id: strLoaiBang, strPhamViApDung_Id: x.ID, strDaoTao_ThoiGianDaoTao_Id: strThoiGian, dHeSo: strHeSo });
            },
            fileName: "KhaiHeSoPhamVi_TheoLopHocPhan",
            modal: "#myModal_HeSoPhamVi_LHP",
            zone: "zoneThongBao_LHP",
            onDone: function () { $("#btnLHP_BoChon").trigger("click"); }
        });
    },

    /*------------------------------------------
    --Discription: [8] Them theo chuc danh/hoc vi cho tung he dao tao
    --  Chon loai (Chuc danh | Hoc vi) -> danh muc theo ma bang cua loai -> tick nhieu he dao tao
    --  Moi he = 1 lan goi; pham vi = Id chuc danh/hoc vi + Id he dao tao
    -------------------------------------------*/
    openForm_CDHV: function () {
        var me = this;
        me.thongBao("zoneThongBao_CDHV", "");
        me.macDinh("dropCDHV_LoaiBang", "dropSearch_LoaiBang");
        me.macDinh("dropCDHV_ThoiGian", "dropSearch_ThoiGian");
        if ($("#dropCDHV_PhamVi option").length <= 1) me.getList_PhamVi_CDHV("rdoCDHV_Loai", "dropCDHV_PhamVi", "lblCDHV_PhamVi");
        me.capNhat_CDHV();
        $("#myModal_HeSoPhamVi_CDHV").modal("show");
    },
    capNhat_CDHV: function () {
        this.anCanhBao("zoneThongBao_CDHV");
        var nTong = $("#zoneHe_CDHV input[type=checkbox]").length;
        var n = $("#zoneHe_CDHV input[type=checkbox]:checked").length;
        $("#lblDemHe_CDHV").text("Đã chọn " + n + "/" + nTong);
        if (n) {
            var strPV = this.textChon("dropCDHV_PhamVi");
            $("#lblTongHop_CDHV").html("Sẽ lưu <b>" + n + "</b> hệ đào tạo" + (strPV ? " cho <b>" + this.esc(strPV) + "</b>" : "") + ", mỗi hệ 1 khai báo");
            $("#lblSave_CDHV").text("Lưu " + n + " khai báo");
        }
        else {
            $("#lblTongHop_CDHV").text("Chọn chức danh/học vị, tick hệ đào tạo và nhập hệ số để lưu.");
            $("#lblSave_CDHV").text("Lưu");
        }
    },
    save_CDHV: function () {
        var me = this;
        var loai = me.loaiChon_CDHV("rdoCDHV_Loai");
        var strTenLoai = loai ? loai.TEN : "Chức danh / học vị";
        var strPhamVi = edu.util.getValById("dropCDHV_PhamVi");
        var strLoaiBang = edu.util.getValById("dropCDHV_LoaiBang");
        var strThoiGian = edu.util.getValById("dropCDHV_ThoiGian");
        var strHeSo = $.trim($("#txtCDHV_HeSo").val());
        var arrHe = me.daChonChk("zoneHe_CDHV", me.dtHeDaoTao);
        var arrLoi = [];
        if (!strPhamVi) arrLoi.push("Chưa chọn " + strTenLoai.toLowerCase() + ".");
        if (!arrHe.length) arrLoi.push("Chưa chọn hệ đào tạo nào.");
        if (!strHeSo) { arrLoi.push("Chưa nhập hệ số."); $("#txtCDHV_HeSo").addClass("hspv-invalid"); }
        else if (!me.laSoHopLe(strHeSo)) { arrLoi.push("Hệ số phải là số (VD: 1 hoặc 1,2)."); $("#txtCDHV_HeSo").addClass("hspv-invalid"); }
        if (arrLoi.length) { me.thongBao("zoneThongBao_CDHV", arrLoi.join("<br/>"), "w"); return; }
        me.thongBao("zoneThongBao_CDHV", "");
        me.runThem({
            title: "Thêm mới hệ số theo chức danh/học vị cho từng hệ đào tạo",
            subTitles: [strTenLoai + ": " + me.textChon("dropCDHV_PhamVi"), "Loại hệ số: " + (me.textChon("dropCDHV_LoaiBang") || "(không chọn)"), "Thời gian: " + (me.textChon("dropCDHV_ThoiGian") || "(không chọn)"), "Hệ số: " + strHeSo],
            columns: [{ header: "Hệ đào tạo", render: function (he) { var ma = edu.util.returnEmpty(he.MAHEDAOTAO); return edu.util.returnEmpty(he.TENHEDAOTAO) + (ma ? " (" + ma + ")" : ""); } }],
            items: arrHe,
            request: function (he) {
                return me.req_HeSoPhamVi({
                    strLoaiBang_Id: strLoaiBang,
                    strPhamViApDung_Id: me.ghepPhamVi([strPhamVi, he.ID]),
                    strDaoTao_ThoiGianDaoTao_Id: strThoiGian,
                    dHeSo: strHeSo
                });
            },
            notes: strThoiGian ? [] : ["Chưa chọn thời gian."],
            fileName: "KhaiHeSoPhamVi_ChucDanhHocVi_HeDaoTao",
            modal: "#myModal_HeSoPhamVi_CDHV",
            zone: "zoneThongBao_CDHV",
            // giu cac he da tick de khai tiep chuc danh/hoc vi khac; chi bo chon chuc danh/hoc vi vua luu
            onDone: function () { edu.util.viewValById("dropCDHV_PhamVi", ""); $("#dropCDHV_PhamVi").trigger("change"); }
        });
    },
}
