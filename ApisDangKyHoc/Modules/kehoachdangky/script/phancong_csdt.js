/*----------------------------------------------
--Note: Phan cong CO SO DAO TAO cho 1 pham vi ap dung trong 1 ke hoach dang ky.
--  Dung chung cho modal "Chi tiet" cua 2 trang:
--    phanconglop.html    -> loai 'LHP' -> PKG_DANGKY_PHANCONG_CSDT.Them/Xoa/LayDS_LHP_CSDT
--    phancongphamvi.html -> loai 'PV'  -> PKG_DANGKY_PHANCONG_CSDT.Them/Xoa/LayDS_PV_CSDT
--  Ke hoach + pham vi lay tu BAN GHI cua dong bam "Chi tiet"
--  (DANGKY_KEHOACHDANGKY_ID, PHAMVIAPDUNG_ID).
--  DS co so dao tao: ham chung edu.system.getList_CoSoDaoTao.
--  Thong bao hien inline trong khoi (khong dung edu.system.alert) vi alert BS3
--  chong len modal "Chi tiet" se dong/lam lech modal.
----------------------------------------------*/
function PhanCongCSDT(cfg) {
    this.loai = cfg.loai;              // 'LHP' | 'PV'
    this.zoneId = cfg.zone;            // id div chua khoi
    this.modalId = cfg.modal;          // id modal chua khoi (select2 dropdownParent)
    this.selId = cfg.zone + '_drop';
    this.oBanGhi = null;               // ban ghi dong "Chi tiet" dang mo
    this.dtCoSo = [];                  // DS co so dao tao (ham chung)
    this.dtDaGan = [];                 // DS co so da gan cho ban ghi
    this.iReq = 0;                     // chong response cu de khi doi ban ghi nhanh
}

/* Controller SV_DANGKY_PHANCONG_CSDT_MH - BE gui 17/11/2026, du 6 ham (Them/Xoa/LayDS x LHP/PV).
   Khong co ham Sua: doi co so = Bo + Them. */
PhanCongCSDT.API = {
    LHP: {
        Them:  { action: 'SV_DANGKY_PHANCONG_CSDT_MH/FSkkLB4NCREeAhIFFQPP', func: 'PKG_DANGKY_PHANCONG_CSDT.Them_LHP_CSDT' },
        Xoa:   { action: 'SV_DANGKY_PHANCONG_CSDT_MH/GS4gHg0JER4CEgUV', func: 'PKG_DANGKY_PHANCONG_CSDT.Xoa_LHP_CSDT' },
        LayDS: { action: 'SV_DANGKY_PHANCONG_CSDT_MH/DSA4BRIeDQkRHgISBRUP', func: 'PKG_DANGKY_PHANCONG_CSDT.LayDS_LHP_CSDT' }
    },
    PV: {
        Them:  { action: 'SV_DANGKY_PHANCONG_CSDT_MH/FSkkLB4RFx4CEgUV', func: 'PKG_DANGKY_PHANCONG_CSDT.Them_PV_CSDT' },
        Xoa:   { action: 'SV_DANGKY_PHANCONG_CSDT_MH/GS4gHhEXHgISBRUP', func: 'PKG_DANGKY_PHANCONG_CSDT.Xoa_PV_CSDT' },
        LayDS: { action: 'SV_DANGKY_PHANCONG_CSDT_MH/DSA4BRIeERceAhIFFQPP', func: 'PKG_DANGKY_PHANCONG_CSDT.LayDS_PV_CSDT' }
    }
};

PhanCongCSDT.prototype = {
    init: function () {
        var me = this;
        var $zone = $('#' + me.zoneId);
        if (!$zone.length) return;
        me._injectCss();
        $zone.addClass('pc-csdt').html(me._html());
        me._setEnabled(false);

        $zone.on('click.pccsdt', '.pc-csdt-add', function () {
            me.them();
        });
        $zone.on('click.pccsdt', '.pc-csdt-x', function () {
            me._askXoa($(this).closest('.pc-csdt-chip'));
        });
        $zone.on('click.pccsdt', '.pc-csdt-no', function () {
            me._renderList();
        });
        $zone.on('click.pccsdt', '.pc-csdt-yes', function () {
            me.xoa($(this).closest('.pc-csdt-chip').attr('data-id'));
        });
        // select2 trong modal BS3: re-init voi dropdownParent = modal khi modal da hien
        // (init luc an thi width = 0; popup gan body bi enforceFocus chan go phim).
        $('#' + me.modalId).on('shown.bs.modal.pccsdt', function () {
            me._initSelect2();
        });
        me.loadCoSo();
    },

    /* Goi khi bam "Chi tiet": oBanGhi la dong cua danh sach phan cong */
    open: function (oBanGhi) {
        var me = this;
        me.oBanGhi = oBanGhi || null;
        me.dtDaGan = [];
        me._msg('');
        $('#' + me.selId).val('').trigger('change');
        if (!me._getKeHoach() || !me._getPhamVi()) {
            me._setEnabled(false);
            me._renderList('Không xác định được kế hoạch / phạm vi của bản ghi.');
            return;
        }
        me._setEnabled(true);
        me.getList();
    },

    /*------------------------------------------
    --Discription: DS co so dao tao - ham chung
    -------------------------------------------*/
    loadCoSo: function () {
        var me = this;
        edu.system.getList_CoSoDaoTao({
            strNguoiThucHien_Id: edu.system.userId,
            strTuKhoa: '',
            pageIndex: 1,
            pageSize: 100000
        }, '', '', function (data) {
            me.dtCoSo = data || [];
            var html = '<option value="">Chọn cơ sở đào tạo</option>';
            me.dtCoSo.forEach(function (e) {
                html += '<option value="' + me._esc(e.ID) + '">' + me._esc(me._tenCoSo(e)) + '</option>';
            });
            $('#' + me.selId).html(html).val('').trigger('change');
            if ($('#' + me.modalId).hasClass('in') || $('#' + me.modalId).hasClass('show')) me._initSelect2();
            me._renderList(); // cap nhat ten chip neu LayDS ve truoc
        });
    },

    /*------------------------------------------
    --Discription: [1] ACCESS DB
    -------------------------------------------*/
    getList: function () {
        var me = this;
        var api = PhanCongCSDT.API[me.loai].LayDS;
        var iReq = ++me.iReq;
        me._renderList(null, true);
        var obj_list = {
            'action': api.action,
            'func': api.func,
            'iM': edu.system.iM,
            'strDangKy_KeHoachDangKy_Id': me._getKeHoach(),
            'strPhamViApDung_Id': me._getPhamVi(),
            'strNguoiThucHien_Id': edu.system.userId
        };
        edu.system.makeRequest({
            // Loi tai DS hien o vung danh sach, KHONG de len dong ket qua Them/Bo
            success: function (data) {
                if (iReq !== me.iReq) return;
                if (data.Success) {
                    me.dtDaGan = data.Data || [];
                    me._renderList();
                } else {
                    me.dtDaGan = [];
                    me._renderList('Không tải được danh sách đã gán — ' + api.func + ': ' + data.Message, false, true);
                }
            },
            error: function (er) {
                if (iReq !== me.iReq) return;
                me.dtDaGan = [];
                me._renderList('Không tải được danh sách đã gán — ' + api.func + ': ' + me._errMsg(er), false, true);
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    them: function () {
        var me = this;
        var strCoSo_Id = $('#' + me.selId).val();
        if (!strCoSo_Id) {
            me._msg('Chọn cơ sở đào tạo trước khi thêm.', true);
            return;
        }
        var api = PhanCongCSDT.API[me.loai].Them;
        var obj_save = {
            'action': api.action,
            'func': api.func,
            'iM': edu.system.iM,
            'strDangKy_KeHoachDangKy_Id': me._getKeHoach(),
            'strPhamViApDung_Id': me._getPhamVi(),
            'strCoSoDaoTao_Id': strCoSo_Id,
            'strNguoiTao_Id': edu.system.userId,         // entity BE: strNguoiTao_Id
            'strNguoiThucHien_Id': edu.system.userId
        };
        me._busy(true);
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me._msg('Đã thêm: ' + me._tenCoSoById(strCoSo_Id));
                    $('#' + me.selId).val('').trigger('change');
                    me.getList();
                } else {
                    me._msg(data.Message || (api.func + ': lỗi không rõ'), true);
                }
            },
            error: function (er) {
                me._msg(api.func + ': ' + me._errMsg(er), true);
            },
            complete: function () {
                me._busy(false);
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },
    xoa: function (strCoSo_Id) {
        var me = this;
        if (!strCoSo_Id) return;
        var api = PhanCongCSDT.API[me.loai].Xoa;
        var obj_delete = {
            'action': api.action,
            'func': api.func,
            'iM': edu.system.iM,
            'strDangKy_KeHoachDangKy_Id': me._getKeHoach(),
            'strPhamViApDung_Id': me._getPhamVi(),
            'strCoSoDaoTao_Id': strCoSo_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        me._busy(true);
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me._msg('Đã bỏ: ' + me._tenCoSoById(strCoSo_Id));
                    me.getList();
                } else {
                    me._msg(data.Message || (api.func + ': lỗi không rõ'), true);
                    me._renderList();
                }
            },
            error: function (er) {
                me._msg(api.func + ': ' + me._errMsg(er), true);
                me._renderList();
            },
            complete: function () {
                me._busy(false);
            },
            type: 'POST',
            action: obj_delete.action,
            contentType: true,
            data: obj_delete,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: [0] GEN HTML
    -------------------------------------------*/
    _html: function () {
        return '' +
            '<div class="pc-csdt-head">' +
                '<span class="pc-csdt-title"><i class="fa fa-building"></i> Cơ sở đào tạo áp dụng</span>' +
                '<span class="pc-csdt-count"></span>' +
            '</div>' +
            '<div class="pc-csdt-row">' +
                '<div class="pc-csdt-select"><select id="' + this.selId + '" style="width:100%"></select></div>' +
                '<a class="btn btn-primary pc-csdt-add"><i class="fa fa-plus"></i> Thêm</a>' +
            '</div>' +
            '<div class="pc-csdt-msg"></div>' +
            '<div class="pc-csdt-list"></div>';
    },
    _renderList: function (strEmpty, bLoading, bErr) {
        var me = this;
        var $zone = $('#' + me.zoneId);
        var $list = $zone.find('.pc-csdt-list');
        if (bLoading) {
            $list.html('<span class="pc-csdt-empty">Đang tải…</span>');
            $zone.find('.pc-csdt-count').html('');
            return;
        }
        if (!me.dtDaGan.length) {
            $list.html('<span class="pc-csdt-empty' + (bErr ? ' is-err' : '') + '">' + me._esc(strEmpty || 'Chưa gán cơ sở đào tạo nào.') + '</span>');
            $zone.find('.pc-csdt-count').html('');
            return;
        }
        var html = '';
        me.dtDaGan.forEach(function (r) {
            var strId = me._idCoSoDaGan(r);
            var strTen = me._tenCoSoDaGan(r);
            html += '<span class="pc-csdt-chip" data-id="' + me._esc(strId) + '" title="' + me._esc(strTen) + '">' +
                '<span class="pc-csdt-chip-ten">' + me._esc(strTen) + '</span>' +
                '<a class="pc-csdt-x" title="Bỏ cơ sở này"><i class="fa fa-times"></i></a>' +
                '</span>';
        });
        $list.html(html);
        $zone.find('.pc-csdt-count').html(me.dtDaGan.length + ' cơ sở');
    },
    _askXoa: function ($chip) {
        var me = this;
        if (!$chip.length) return;
        var strTen = $chip.find('.pc-csdt-chip-ten').text();
        $chip.addClass('is-confirm').html(
            '<span class="pc-csdt-chip-ten">Bỏ ' + me._esc(strTen) + '?</span>' +
            '<a class="pc-csdt-yes">Bỏ</a><a class="pc-csdt-no">Không</a>');
    },
    _msg: function (str, bErr) {
        var $m = $('#' + this.zoneId).find('.pc-csdt-msg');
        $m.removeClass('is-ok is-err').text(str || '');
        if (str) $m.addClass(bErr ? 'is-err' : 'is-ok');
    },
    _busy: function (b) {
        $('#' + this.zoneId).toggleClass('is-busy', !!b);
    },
    _setEnabled: function (b) {
        $('#' + this.zoneId).toggleClass('is-disabled', !b);
    },
    _initSelect2: function () {
        var $sel = $('#' + this.selId);
        var $m = $('#' + this.modalId);
        if (!$sel.length || !$.fn.select2) return;
        try { if ($sel.hasClass('select2-hidden-accessible')) $sel.select2('destroy'); } catch (e) { }
        $sel.select2({ dropdownParent: $m.length ? $m : $(document.body), width: '100%' });
    },
    _injectCss: function () {
        var strStyleId = 'pc-csdt-style-' + this.modalId;
        if (document.getElementById(strStyleId)) return;
        var m = '#' + this.modalId;
        var css = '' +
            '.pc-csdt{border:1px solid #9fb3dd;border-radius:8px;background:#f5f8ff;padding:10px 12px;margin-top:12px}' +
            '.pc-csdt-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}' +
            '.pc-csdt-title{color:#223771;font-weight:600;font-size:13px}' +
            '.pc-csdt-title i{color:#223771 !important;margin-right:4px}' +
            '.pc-csdt-count{color:#475569;font-size:12px;font-weight:600;white-space:nowrap}' +
            '.pc-csdt-row{display:flex;align-items:center;gap:10px}' +
            '.pc-csdt-select{flex:1 1 auto;min-width:0}' +
            '.pc-csdt-row .btn{flex:0 0 auto;white-space:nowrap;margin:0 !important}' +
            '.pc-csdt-msg{font-size:12px;font-weight:600;margin-top:6px}' +
            '.pc-csdt-msg:empty{display:none}' +
            '.pc-csdt-msg.is-ok{color:#15803d}' +
            '.pc-csdt-msg.is-err{color:#b91c1c}' +
            '.pc-csdt-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
            '.pc-csdt-empty{color:#64748b;font-size:12.5px;font-weight:500}' +
            '.pc-csdt-empty.is-err{color:#b45309;font-weight:600}' +
            '.pc-csdt-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;background:#fff;border:1px solid #c7d2fe;border-radius:14px;padding:3px 6px 3px 10px;color:#0f172a;font-size:12.5px;font-weight:600;line-height:20px}' +
            '.pc-csdt-chip-ten{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
            '.pc-csdt-x{color:#64748b !important;cursor:pointer;padding:0 5px;border-radius:50%;line-height:18px}' +
            '.pc-csdt-x:hover{color:#dc3545 !important;background:#fee2e2}' +
            '.pc-csdt-chip.is-confirm{border-color:#fca5a5;background:#fff5f5}' +
            '.pc-csdt-yes{color:#dc3545 !important;font-weight:700;cursor:pointer}' +
            '.pc-csdt-no{color:#475569 !important;cursor:pointer}' +
            '.pc-csdt.is-disabled .pc-csdt-row,.pc-csdt.is-busy .pc-csdt-row,.pc-csdt.is-busy .pc-csdt-list{opacity:.55;pointer-events:none}' +
            /* popup select2 nam trong modal (dropdownParent) */
            m + '>.select2-container--open,' + m + '>.select2-container--open .select2-dropdown{z-index:100060 !important}' +
            m + '>.select2-container .select2-results__options{max-height:180px !important;overflow-y:auto !important}';
        var el = document.createElement('style');
        el.id = strStyleId;
        el.appendChild(document.createTextNode(css));
        document.head.appendChild(el);
    },

    /*------------------------------------------
    --Discription: tien ich
    -------------------------------------------*/
    _getKeHoach: function () {
        return this.oBanGhi ? edu.util.returnEmpty(this.oBanGhi.DANGKY_KEHOACHDANGKY_ID) : '';
    },
    _getPhamVi: function () {
        return this.oBanGhi ? edu.util.returnEmpty(this.oBanGhi.PHAMVIAPDUNG_ID) : '';
    },
    _tenCoSo: function (e) {
        var strTen = edu.util.returnEmpty(e.TEN);
        var strMa = edu.util.returnEmpty(e.MA);
        if (strMa && strMa != strTen) return strTen ? strTen + ' (' + strMa + ')' : strMa;
        return strTen || strMa;
    },
    _tenCoSoById: function (strId) {
        var e = this.dtCoSo.find(function (x) { return x.ID === strId; });
        return e ? this._tenCoSo(e) : strId;
    },
    /* Cot rs cua LayDS_*_CSDT: BE chua gui ten cot (17/11/2026). Thu ten hay gap truoc,
       khong co thi do cot dang ...COSO..._ID / ...CSDT..._ID; van khong thay -> console.warn
       in ten cot de xem F12 roi sua o day. */
    _cotCoSo: function (r, strDuoi) {
        var arrUuTien = ['COSODAOTAO_', 'DAOTAO_COSODAOTAO_', 'CSDT_'];
        for (var i = 0; i < arrUuTien.length; i++) {
            if (r[arrUuTien[i] + strDuoi] != null && r[arrUuTien[i] + strDuoi] !== '') return r[arrUuTien[i] + strDuoi];
        }
        var re = new RegExp('(COSO|CSDT).*_' + strDuoi + '$', 'i');
        var k = Object.keys(r).find(function (x) { return re.test(x); });
        return k ? r[k] : '';
    },
    _idCoSoDaGan: function (r) {
        var strId = edu.util.returnEmpty(this._cotCoSo(r, 'ID'));
        if (!strId && !this._daCanhBaoCot) {
            this._daCanhBaoCot = true;
            console.warn('PhanCongCSDT: khong tim thay cot id co so trong LayDS. Cac cot:', Object.keys(r));
        }
        return strId;
    },
    _tenCoSoDaGan: function (r) {
        // Uu tien danh muc co so (dong nhat "TEN (MA)" voi dropdown); khong co moi dung cot cua rs
        var strId = this._idCoSoDaGan(r);
        var e = this.dtCoSo.find(function (x) { return x.ID === strId; });
        if (e) return this._tenCoSo(e);
        var strTen = edu.util.returnEmpty(this._cotCoSo(r, 'TEN'));
        var strMa = edu.util.returnEmpty(this._cotCoSo(r, 'MA'));
        if (strTen) return (strMa && strMa != strTen) ? strTen + ' (' + strMa + ')' : strTen;
        return strMa || strId;
    },
    /* er = jqXHR; BE tra HTTP 500 kem response.Message khi exception, 404 khi chua co method */
    _errMsg: function (er) {
        if (!er) return 'lỗi không rõ';
        if (er.responseJSON && er.responseJSON.Message) return er.responseJSON.Message;
        if (er.status === 404) return 'API chưa có trên server (404)';
        return (er.status ? 'HTTP ' + er.status + ' ' : '') + (er.statusText || 'lỗi kết nối');
    },
    _esc: function (s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
};
