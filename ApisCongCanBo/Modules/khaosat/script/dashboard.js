﻿/*----------------------------------------------
--Author: Claude
--Date of created: 26/11/2026
--Note: Dashboard vai trò Khảo sát (chức năng CCB.KSDASH, #ksdashboard) — chỉ đọc
--  KS_ThongTin/LayDSPhieu_Mau_NguoiDung : phiếu mẫu (TENPHIEU, LOAIPHIEU_TEN)
--  KS_ThongTin/LayDSKS_KeHoachKhaoSat   : kế hoạch (TENKEHOACH, NAMHOC, HOCKY, CHEDOKHAOSAT 0/1/2,
--                                         NGAYBATDAU, NGAYKETTHUC dd/mm/yyyy, KS_PHIEUKHAOSAT_MAU_TEN,
--                                         TONGSOPHIEUGUI, TONGSOPHIEUDATHUCHIEN)
----------------------------------------------*/
function KhaoSatDashboard() { };
KhaoSatDashboard.prototype = {
    dtPhieuMau: [],
    dtKeHoach: [],
    iSoKeHoachTheoDoi: 6,

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        me.loadAll();
        $("#ksdb #btnKsDb_TaiLai").click(function () { me.loadAll(); });
        $("#ksdb").delegate(".ksdb-goto", "click", function (e) {
            e.preventDefault();
            me.gotoMenu($(this).attr("data-menu"));
        });
        me.initGuide();
    },
    /*------------------------------------------
    --Discription: Hướng dẫn — chuyển tab, thu gọn (nhớ theo trình duyệt)
    -------------------------------------------*/
    initGuide: function () {
        var me = this;
        var KEY = "ksdb_guide_thugon";
        $("#ksdb").delegate(".ksdb-flow-step", "click", function (e) {
            e.preventDefault();
            var t = $(this).attr("data-tab");
            $("#ksdb .ksdb-flow-step").removeClass("is-active");
            $(this).addClass("is-active");
            $("#ksdb .ksdb-tab").removeClass("is-active").filter("[data-tab='" + t + "']").addClass("is-active");
        });
        var fnSet = function (bThuGon) {
            $("#ksdbGuide").toggleClass("is-collapsed", bThuGon);
            $("#btnKsDb_Guide").attr("aria-expanded", bThuGon ? "false" : "true")
                .find("span").text(bThuGon ? "Xem hướng dẫn" : "Thu gọn");
            $("#btnKsDb_Guide i").attr("class", bThuGon ? "fa fa-angle-down" : "fa fa-angle-up");
        };
        var bDaThuGon = false;
        try { bDaThuGon = window.localStorage.getItem(KEY) === "1"; } catch (ex) { }
        fnSet(bDaThuGon);
        $("#btnKsDb_Guide").on("click keydown", function (e) {
            if (e.type === "keydown" && e.which !== 13 && e.which !== 32) return;
            e.preventDefault();
            var b = !$("#ksdbGuide").hasClass("is-collapsed");
            fnSet(b);
            try { window.localStorage.setItem(KEY, b ? "1" : "0"); } catch (ex) { }
        });
    },
    loadAll: function () {
        var me = this;
        $("#ksdb .ksdb-kpi-num").html('<span class="ksdb-skel"></span>');
        $("#ksdb .ksdb-kpi-sub").text("");
        $("#zoneKsDb_DangDienRa, #zoneKsDb_CheDo, #zoneKsDb_LoaiPhieu, #zoneKsDb_SapToi").html(me.htmlLoading());
        $("#lblKsDb_CapNhat").text("Đang tải...");
        var iXong = 0;
        var fnXong = function () {
            iXong++;
            if (iXong < 2) return;
            $("#lblKsDb_CapNhat").text("Cập nhật lúc " + me.formatTime(new Date()));
        };
        me.getList_PhieuMau(fnXong);
        me.getList_KeHoach(fnXong);
    },
    /*------------------------------------------
    --Discription: [1] ACCESS DB
    -------------------------------------------*/
    callGet: function (obj, fnOk, fnErr) {
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) fnOk(data.Data || [], data.Pager);
                else fnErr(obj.action + " : " + data.Message);
            },
            error: function (er) {
                fnErr(obj.action + " (er): " + JSON.stringify(er));
            },
            type: 'GET',
            action: obj.action,
            contentType: true,
            data: obj,
            fakedb: []
        }, false, false, false, null);
    },
    getList_PhieuMau: function (fnXong) {
        var me = this;
        var obj_list = {
            'action': 'KS_ThongTin/LayDSPhieu_Mau_NguoiDung',
            'type': 'GET',
            'strNguoiThucHien_Id': edu.system.userId,
        };
        me.callGet(obj_list, function (dt) {
            me.dtPhieuMau = dt;
            $("#lblKsDb_SoPhieuMau").text(me.formatNum(dt.length));
            fnXong();
        }, function (msg) {
            $("#lblKsDb_SoPhieuMau").text("—");
            fnXong();
        });
    },
    getList_KeHoach: function (fnXong) {
        var me = this;
        var obj_list = {
            'action': 'KS_ThongTin/LayDSKS_KeHoachKhaoSat',
            'type': 'GET',
            'strTuKhoa': '',
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        me.callGet(obj_list, function (dt) {
            me.dtKeHoach = dt;
            me.genKeHoach(dt);
            fnXong();
        }, function (msg) {
            $("#lblKsDb_SoKeHoach, #lblKsDb_DangDienRa, #lblKsDb_TyLe").text("—");
            $("#zoneKsDb_DangDienRa, #zoneKsDb_CheDo, #zoneKsDb_LoaiPhieu, #zoneKsDb_SapToi").html(me.htmlError(msg));
            fnXong();
        });
    },
    /*------------------------------------------
    --Discription: [2] GEN HTML
    -------------------------------------------*/
    genKeHoach: function (dt) {
        var me = this;
        var dHomNay = new Date(); dHomNay.setHours(0, 0, 0, 0);
        var arrDang = [], arrSap = [], iKetThuc = 0, dGui = 0, dXong = 0;
        dt.forEach(function (e) {
            e._bd = me.parseDate(e.NGAYBATDAU);
            e._kt = me.parseDate(e.NGAYKETTHUC);
            e._gui = me.toNum(e.TONGSOPHIEUGUI);
            e._xong = me.toNum(e.TONGSOPHIEUDATHUCHIEN);
            dGui += e._gui; dXong += e._xong;
            if (e._bd && e._bd > dHomNay) arrSap.push(e);
            else if (e._kt && e._kt < dHomNay) iKetThuc++;
            else arrDang.push(e);
        });
        arrDang.sort(function (a, b) { return (a._kt || 0) - (b._kt || 0); });
        arrSap.sort(function (a, b) { return a._bd - b._bd; });

        // Thẻ số liệu
        $("#lblKsDb_SoKeHoach").text(me.formatNum(dt.length));
        $("#lblKsDb_KetThuc").text(iKetThuc + " đã kết thúc");
        $("#lblKsDb_DangDienRa").text(me.formatNum(arrDang.length));
        $("#lblKsDb_SapToi").text(arrSap.length + " sắp diễn ra");
        $("#lblKsDb_TyLe").text(dGui > 0 ? me.pct(dXong, dGui) + "%" : "—");
        $("#lblKsDb_TyLeSub").text(me.formatNum(dXong) + " / " + me.formatNum(dGui) + " phiếu đã gửi");

        // Kế hoạch đang diễn ra
        if (arrDang.length == 0) {
            $("#zoneKsDb_DangDienRa").html(me.htmlEmpty("fa-calendar-check-o", "Không có kế hoạch nào đang diễn ra"));
        } else {
            var html = "";
            arrDang.slice(0, me.iSoKeHoachTheoDoi).forEach(function (e) {
                var iConLai = e._kt ? Math.round((e._kt - dHomNay) / 86400000) : null;
                var dTong = (e._bd && e._kt) ? (e._kt - e._bd) : 0;
                var iTg = dTong > 0 ? Math.min(100, Math.max(0, Math.round((dHomNay - e._bd) / dTong * 100))) : 100;
                var strHan = iConLai === null ? "Không có ngày kết thúc"
                    : (iConLai == 0 ? "Kết thúc hôm nay" : "Còn " + iConLai + " ngày");
                var iTyLe = me.pct(e._xong, e._gui);
                html += '<div class="ksdb-plan">'
                    + '<div class="ksdb-plan-head">'
                    + '<div class="ksdb-plan-name"><b>' + me.esc(e.TENKEHOACH) + '</b>'
                    + '<span>' + me.esc(me.hocKy(e)) + ' · ' + me.esc(me.tenCheDo(e)) + '</span></div>'
                    + '<span class="ksdb-chip ' + (iConLai !== null && iConLai <= 3 ? 'is-warn' : '') + '"><i class="fa fa-clock-o"></i> ' + strHan + '</span>'
                    + '</div>'
                    + '<div class="ksdb-time"><span>' + me.esc(e.NGAYBATDAU) + '</span>'
                    + '<div class="ksdb-track" title="Thời gian đã qua ' + iTg + '%"><i style="width:' + iTg + '%"></i></div>'
                    + '<span>' + me.esc(e.NGAYKETTHUC) + '</span></div>'
                    + '<div class="ksdb-plan-phieu">'
                    + (e.KS_PHIEUKHAOSAT_MAU_TEN ? '<div class="ksdb-mini-empty" title="' + me.esc(e.KS_PHIEUKHAOSAT_MAU_TEN) + '"><i class="fa fa-file-text-o"></i> ' + me.esc(me.cut(e.KS_PHIEUKHAOSAT_MAU_TEN, 90)) + '</div>' : '')
                    + (e._gui > 0
                        ? '<div class="ksdb-ph"><span class="ksdb-ph-name">Đã thực hiện ' + me.formatNum(e._xong) + ' / ' + me.formatNum(e._gui) + ' phiếu</span>'
                          + '<div class="ksdb-ph-track"><i style="width:' + iTyLe + '%"></i></div><b class="ksdb-ph-val">' + iTyLe + '%</b></div>'
                        : '<div class="ksdb-mini-empty">Chưa gửi phiếu</div>')
                    + '</div>'
                    + '</div>';
            });
            if (arrDang.length > me.iSoKeHoachTheoDoi) {
                html += '<a href="#" class="ksdb-more ksdb-goto" data-menu="Kế hoạch khảo sát">Xem thêm ' + (arrDang.length - me.iSoKeHoachTheoDoi) + ' kế hoạch <i class="fa fa-angle-right"></i></a>';
            }
            $("#zoneKsDb_DangDienRa").html(html);
        }

        // Kế hoạch theo chế độ
        var arrCheDo = me.groupBy(dt, function (e) { return me.tenCheDo(e); });
        me.genBars("zoneKsDb_CheDo", arrCheDo.map(function (g) { return { k: g.k, v: g.n, txt: g.n }; }), "Chưa có kế hoạch");

        // Tỷ lệ hoàn thành của các kế hoạch gần đây (theo ngày bắt đầu, có gửi phiếu)
        var arrGanDay = dt.filter(function (e) { return e._gui > 0; })
            .sort(function (a, b) { return (b._bd || 0) - (a._bd || 0); }).slice(0, 6);
        me.genBars("zoneKsDb_LoaiPhieu", arrGanDay.map(function (e) {
            var p = me.pct(e._xong, e._gui);
            return { k: me.hocKy(e) + ' — ' + e.TENKEHOACH, title: e.TENKEHOACH, v: p, max: 100, txt: p + '%' };
        }), "Chưa có kế hoạch nào gửi phiếu");

        // Sắp diễn ra
        if (arrSap.length == 0) {
            $("#zoneKsDb_SapToi").html(me.htmlEmpty("fa-calendar-o", "Không có kế hoạch sắp diễn ra"));
        } else {
            var htmlS = "";
            arrSap.slice(0, 5).forEach(function (e) {
                var iCon = Math.round((e._bd - dHomNay) / 86400000);
                htmlS += '<div class="ksdb-up">'
                    + '<div class="ksdb-up-date"><b>' + e._bd.getDate() + '</b><span>Th ' + (e._bd.getMonth() + 1) + '</span></div>'
                    + '<div class="ksdb-up-text"><b title="' + me.esc(e.TENKEHOACH) + '">' + me.esc(e.TENKEHOACH) + '</b><span>Bắt đầu sau ' + iCon + ' ngày · đến ' + me.esc(e.NGAYKETTHUC) + '</span></div>'
                    + '</div>';
            });
            $("#zoneKsDb_SapToi").html(htmlS);
        }
    },
    genBars: function (strZone, arr, strRong) {
        var me = this;
        if (arr.length == 0) {
            $("#" + strZone).html(me.htmlEmpty("fa-bar-chart", strRong));
            return;
        }
        var dMax = arr[0].max || Math.max.apply(null, arr.map(function (g) { return g.v; })) || 1;
        var html = "";
        arr.slice(0, 8).forEach(function (g, i) {
            html += '<div class="ksdb-bar">'
                + '<div class="ksdb-bar-label"><span title="' + me.esc(g.title || g.k) + '">' + me.esc(g.k) + '</span><b>' + me.esc(g.txt) + '</b></div>'
                + '<div class="ksdb-bar-track"><i class="c' + (i % 5) + '" style="width:' + Math.max(2, Math.round(g.v / dMax * 100)) + '%"></i></div>'
                + '</div>';
        });
        $("#" + strZone).html(html);
    },
    htmlLoading: function () {
        return '<div class="ksdb-loading"><span class="ksdb-skel w80"></span><span class="ksdb-skel w60"></span><span class="ksdb-skel w70"></span></div>';
    },
    htmlEmpty: function (strIcon, strText) {
        return '<div class="ksdb-empty"><i class="fa ' + strIcon + '"></i><span>' + strText + '</span></div>';
    },
    htmlError: function (strMsg) {
        return '<div class="ksdb-empty is-err"><i class="fa fa-exclamation-triangle"></i><span>Không tải được dữ liệu</span><small>' + this.esc(strMsg) + '</small></div>';
    },
    /*------------------------------------------
    --Discription: [3] TIỆN ÍCH
    -------------------------------------------*/
    tenCheDo: function (e) {
        var v = e.CHEDOKHAOSAT !== undefined && e.CHEDOKHAOSAT !== null ? e.CHEDOKHAOSAT : e.CHEDOKHAOSAT_TEN;
        switch (parseInt(v, 10)) {
            case 1: return "Đang khảo sát";
            case 2: return "Khảo sát giả lập";
            case 0: return "Chờ khảo sát";
        }
        return "Chưa xác định";
    },
    hocKy: function (e) {
        var s = [];
        if (e.HOCKY) s.push("HK " + e.HOCKY);
        if (e.NAMHOC) s.push(String(e.NAMHOC).replace("_", "-"));
        return s.join(" · ") || "—";
    },
    gotoMenu: function (strTen) {
        var a = $("a").filter(function () { return $.trim($(this).text()) === strTen; }).first();
        if (a.length) a[0].click();
        else edu.system.alert("Không tìm thấy chức năng \"" + strTen + "\" trong menu của vai trò này.");
    },
    groupBy: function (dt, fnKey) {
        var obj = {};
        dt.forEach(function (e) {
            var k = fnKey(e);
            obj[k] = (obj[k] || 0) + 1;
        });
        return Object.keys(obj).map(function (k) { return { k: k, n: obj[k] }; })
            .sort(function (a, b) { return b.n - a.n; });
    },
    parseDate: function (str) {
        if (!str) return null;
        var m = String(str).match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
        return null;
    },
    toNum: function (v) {
        var d = parseFloat(v);
        return isNaN(d) ? 0 : d;
    },
    pct: function (a, b) {
        return b > 0 ? Math.min(100, Math.round(a / b * 100)) : 0;
    },
    formatNum: function (n) {
        return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    cut: function (s, n) {
        s = String(s || "");
        return s.length > n ? s.substr(0, n - 1) + "…" : s;
    },
    formatTime: function (d) {
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        return p(d.getHours()) + ':' + p(d.getMinutes()) + ' ' + p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
    },
    esc: function (s) {
        if (s === null || s === undefined) return '';
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    },
};
