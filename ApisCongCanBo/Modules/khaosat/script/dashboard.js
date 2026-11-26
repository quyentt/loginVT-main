/*----------------------------------------------
--Author: Claude
--Date of created: 26/11/2026
--Note: Dashboard vai trò Khảo sát — chỉ đọc
--  KS_ThongTin/LayDSPhieu_Mau_NguoiDung   : phiếu mẫu (TENPHIEU, LOAIPHIEU_TEN)
--  KS_ThongTin/LayDSKS_KeHoachKhaoSat     : kế hoạch (MA, TENKEHOACH, CHEDOKHAOSAT_TEN, NGAYBATDAU, NGAYKETTHUC)
--  KS_ThongTin/LayDSKS_PhieuKhaoSat       : phiếu của một kế hoạch (TENPHIEU, TYLE)
----------------------------------------------*/
function KhaoSatDashboard() { };
KhaoSatDashboard.prototype = {
    dtPhieuMau: [],
    dtKeHoach: [],
    iSoKeHoachTheoDoi: 6,   // số kế hoạch đang diễn ra lấy tỷ lệ phiếu

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
    },
    loadAll: function () {
        var me = this;
        $("#ksdb .ksdb-kpi-num").html('<span class="ksdb-skel"></span>');
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
            me.genKpi_PhieuMau(dt);
            me.genBars("zoneKsDb_LoaiPhieu", me.groupBy(dt, "LOAIPHIEU_TEN"), "Chưa có phiếu mẫu");
            fnXong();
        }, function (msg) {
            $("#lblKsDb_SoPhieuMau").text("—");
            $("#zoneKsDb_LoaiPhieu").html(me.htmlError(msg));
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
            $("#lblKsDb_SoKeHoach, #lblKsDb_DangDienRa, #lblKsDb_SapToi").text("—");
            $("#zoneKsDb_DangDienRa, #zoneKsDb_CheDo, #zoneKsDb_SapToi").html(me.htmlError(msg));
            fnXong();
        });
    },
    getList_PhieuCuaKeHoach: function (strKeHoach_Id) {
        var me = this;
        var obj_list = {
            'action': 'KS_ThongTin/LayDSKS_PhieuKhaoSat',
            'type': 'GET',
            'strTuKhoa': '',
            'strKS_PhieuKhaoSat_Mau_Id': '',
            'strKS_KeHoachKhaoSat_Id': strKeHoach_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        var $zone = $("#ksdb [data-kehoach='" + strKeHoach_Id + "'] .ksdb-plan-phieu");
        me.callGet(obj_list, function (dt) {
            $zone.html(me.htmlPhieuTyLe(dt));
        }, function (msg) {
            $zone.html('<div class="ksdb-mini-err"><i class="fa fa-exclamation-circle"></i> Không lấy được phiếu</div>');
        });
    },
    /*------------------------------------------
    --Discription: [2] GEN HTML
    -------------------------------------------*/
    genKpi_PhieuMau: function (dt) {
        $("#lblKsDb_SoPhieuMau").text(dt.length);
    },
    genKeHoach: function (dt) {
        var me = this;
        var dHomNay = new Date(); dHomNay.setHours(0, 0, 0, 0);
        var arrDang = [], arrSap = [], iKetThuc = 0;
        dt.forEach(function (e) {
            var dBd = me.parseDate(e.NGAYBATDAU), dKt = me.parseDate(e.NGAYKETTHUC);
            e._bd = dBd; e._kt = dKt;
            if (dBd && dBd > dHomNay) arrSap.push(e);
            else if (dKt && dKt < dHomNay) iKetThuc++;
            else arrDang.push(e);
        });
        arrDang.sort(function (a, b) { return (a._kt || 0) - (b._kt || 0); });
        arrSap.sort(function (a, b) { return a._bd - b._bd; });

        $("#lblKsDb_SoKeHoach").text(dt.length);
        $("#lblKsDb_DangDienRa").text(arrDang.length);
        $("#lblKsDb_SapToi").text(arrSap.length);
        $("#lblKsDb_KetThuc").text(iKetThuc + " đã kết thúc");

        // Kế hoạch đang diễn ra
        if (arrDang.length == 0) {
            $("#zoneKsDb_DangDienRa").html(me.htmlEmpty("fa-calendar-check-o", "Không có kế hoạch nào đang diễn ra"));
        } else {
            var html = "";
            arrDang.slice(0, me.iSoKeHoachTheoDoi).forEach(function (e) {
                var iConLai = e._kt ? Math.round((e._kt - dHomNay) / 86400000) : null;
                var dTong = (e._bd && e._kt) ? (e._kt - e._bd) : 0;
                var iPct = dTong > 0 ? Math.min(100, Math.max(0, Math.round((dHomNay - e._bd) / dTong * 100))) : 0;
                var strHan = iConLai === null ? "Không có ngày kết thúc"
                    : (iConLai == 0 ? "Kết thúc hôm nay" : "Còn " + iConLai + " ngày");
                html += '<div class="ksdb-plan" data-kehoach="' + me.esc(e.ID) + '">'
                    + '<div class="ksdb-plan-head">'
                    + '<div class="ksdb-plan-name"><b>' + me.esc(e.TENKEHOACH) + '</b>'
                    + '<span>' + me.esc(e.MA) + (e.CHEDOKHAOSAT_TEN ? ' · ' + me.esc(e.CHEDOKHAOSAT_TEN) : '') + '</span></div>'
                    + '<span class="ksdb-chip ' + (iConLai !== null && iConLai <= 3 ? 'is-warn' : '') + '"><i class="fa fa-clock-o"></i> ' + strHan + '</span>'
                    + '</div>'
                    + '<div class="ksdb-time"><span>' + me.esc(e.NGAYBATDAU) + '</span>'
                    + '<div class="ksdb-track"><i style="width:' + iPct + '%"></i></div>'
                    + '<span>' + me.esc(e.NGAYKETTHUC) + '</span></div>'
                    + '<div class="ksdb-plan-phieu"><div class="ksdb-mini-load"><i class="fa fa-spinner fa-spin"></i> Đang tải tỷ lệ phiếu...</div></div>'
                    + '</div>';
            });
            if (arrDang.length > me.iSoKeHoachTheoDoi) {
                html += '<a href="#" class="ksdb-more ksdb-goto" data-menu="Kế hoạch khảo sát">Xem thêm ' + (arrDang.length - me.iSoKeHoachTheoDoi) + ' kế hoạch <i class="fa fa-angle-right"></i></a>';
            }
            $("#zoneKsDb_DangDienRa").html(html);
            arrDang.slice(0, me.iSoKeHoachTheoDoi).forEach(function (e) {
                if (e.ID) me.getList_PhieuCuaKeHoach(e.ID);
            });
        }

        // Kế hoạch theo chế độ
        me.genBars("zoneKsDb_CheDo", me.groupBy(dt, "CHEDOKHAOSAT_TEN"), "Chưa có kế hoạch");

        // Sắp diễn ra
        if (arrSap.length == 0) {
            $("#zoneKsDb_SapToi").html(me.htmlEmpty("fa-calendar-o", "Không có kế hoạch sắp diễn ra"));
        } else {
            var htmlS = "";
            arrSap.slice(0, 5).forEach(function (e) {
                var iCon = Math.round((e._bd - dHomNay) / 86400000);
                htmlS += '<div class="ksdb-up">'
                    + '<div class="ksdb-up-date"><b>' + e._bd.getDate() + '</b><span>Th ' + (e._bd.getMonth() + 1) + '</span></div>'
                    + '<div class="ksdb-up-text"><b>' + me.esc(e.TENKEHOACH) + '</b><span>Bắt đầu sau ' + iCon + ' ngày · đến ' + me.esc(e.NGAYKETTHUC) + '</span></div>'
                    + '</div>';
            });
            $("#zoneKsDb_SapToi").html(htmlS);
        }
    },
    genBars: function (strZone, arrNhom, strRong) {
        var me = this;
        if (arrNhom.length == 0) {
            $("#" + strZone).html(me.htmlEmpty("fa-bar-chart", strRong));
            return;
        }
        var iMax = arrNhom[0].n;
        var html = "";
        arrNhom.slice(0, 8).forEach(function (g, i) {
            html += '<div class="ksdb-bar">'
                + '<div class="ksdb-bar-label"><span title="' + me.esc(g.k) + '">' + me.esc(g.k) + '</span><b>' + g.n + '</b></div>'
                + '<div class="ksdb-bar-track"><i class="c' + (i % 5) + '" style="width:' + Math.max(4, Math.round(g.n / iMax * 100)) + '%"></i></div>'
                + '</div>';
        });
        $("#" + strZone).html(html);
    },
    htmlPhieuTyLe: function (dt) {
        var me = this;
        if (!dt || dt.length == 0) return '<div class="ksdb-mini-empty">Kế hoạch chưa có phiếu</div>';
        var html = "";
        dt.slice(0, 4).forEach(function (e) {
            var dPct = me.parsePercent(e.TYLE);
            html += '<div class="ksdb-ph">'
                + '<span class="ksdb-ph-name" title="' + me.esc(e.TENPHIEU) + '">' + me.esc(e.TENPHIEU) + '</span>'
                + '<div class="ksdb-ph-track"><i style="width:' + (dPct === null ? 0 : dPct) + '%"></i></div>'
                + '<b class="ksdb-ph-val">' + (e.TYLE === null || e.TYLE === undefined || e.TYLE === '' ? '—' : me.esc(e.TYLE)) + '</b>'
                + '</div>';
        });
        if (dt.length > 4) html += '<div class="ksdb-mini-empty">+ ' + (dt.length - 4) + ' phiếu khác</div>';
        return html;
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
    gotoMenu: function (strTen) {
        var a = $("a").filter(function () { return $.trim($(this).text()) === strTen; }).first();
        if (a.length) a[0].click();
        else edu.system.alert("Không tìm thấy chức năng \"" + strTen + "\" trong menu của vai trò này.");
    },
    groupBy: function (dt, strCot) {
        var obj = {};
        dt.forEach(function (e) {
            var k = $.trim(e[strCot] || "") || "Chưa phân loại";
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
    parsePercent: function (v) {
        if (v === null || v === undefined || v === '') return null;
        var s = String(v);
        var m = s.match(/^\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/);
        if (m) {
            var t = parseFloat(m[2].replace(',', '.'));
            return t > 0 ? Math.min(100, Math.round(parseFloat(m[1].replace(',', '.')) / t * 100)) : 0;
        }
        var d = parseFloat(s.replace(',', '.'));
        if (isNaN(d)) return null;
        if (d > 0 && d <= 1 && s.indexOf('%') < 0) d = d * 100;
        return Math.min(100, Math.max(0, Math.round(d)));
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
