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
        // .pc-csdt (div zone) chi lo clear float + khoang cach; giao dien the nam o .pc-csdt-card
        return '<div class="pc-csdt-card">' +
            '<div class="pc-csdt-head">' +
                '<span class="pc-csdt-title"><i class="fa fa-building"></i> Cơ sở đào tạo áp dụng</span>' +
                '<span class="pc-csdt-count"></span>' +
            '</div>' +
            '<div class="pc-csdt-row">' +
                '<div class="pc-csdt-select"><select id="' + this.selId + '" style="width:100%"></select></div>' +
                '<a class="btn btn-primary pc-csdt-add"><i class="fa fa-plus"></i> Thêm</a>' +
            '</div>' +
            '<div class="pc-csdt-msg"></div>' +
            '<div class="pc-csdt-list"></div>' +
            '</div>';
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
    /* Bam X tren chip -> popup hoi lai. Popup ve NGAY TRONG .modal-content (khong dung edu.system.confirm):
       mo them 1 modal BS3 chong len modal "Chi tiet" se go body.modal-open -> modal chinh tu dong/lech.
       Nut dung <button> class rieng (khong .btn) de khong dinh handler spinner 1s toan cuc (systemroot.js:144). */
    _askXoa: function ($chip) {
        var me = this;
        if (!$chip.length) return;
        var strId = $chip.attr('data-id');
        var strTen = $chip.find('.pc-csdt-chip-ten').text();
        var $host = $('#' + me.modalId + ' .modal-content').first();
        if (!$host.length) $host = $('#' + me.zoneId);
        $host.find('.pc-csdt-pop').remove();
        var $pop = $(
            '<div class="pc-csdt-pop" role="dialog" aria-modal="true">' +
                '<div class="pc-csdt-pop-box">' +
                    '<div class="pc-csdt-pop-body">' +
                        '<div class="pc-csdt-pop-icon"><i class="fa fa-trash"></i></div>' +
                        '<div>' +
                            '<p class="pc-csdt-pop-title">Bỏ cơ sở đào tạo?</p>' +
                            '<p class="pc-csdt-pop-text">Bỏ <b>' + me._esc(strTen) + '</b> khỏi phạm vi áp dụng này?<br/>Thao tác được lưu ngay, không cần bấm Lưu.</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="pc-csdt-pop-foot">' +
                        '<button type="button" class="pc-csdt-pop-yes"><i class="fa fa-trash"></i> Bỏ cơ sở</button>' +
                        '<button type="button" class="pc-csdt-pop-no"><i class="fa fa-times"></i> Không</button>' +
                    '</div>' +
                '</div>' +
            '</div>');
        var fnClose = function () { $pop.remove(); };
        $pop.on('click', function (e) { if (e.target === this) fnClose(); });   // bam ra ngoai = Khong
        $pop.on('click', '.pc-csdt-pop-no', fnClose);
        $pop.on('click', '.pc-csdt-pop-yes', function () {
            fnClose();
            me.xoa(strId);
        });
        // Esc chi dong popup: chan lan len modal (BS3 keyboard:true se dong ca modal "Chi tiet")
        $pop.on('keydown', function (e) {
            if (e.which === 27) { e.preventDefault(); e.stopPropagation(); fnClose(); }
        });
        $host.append($pop);
        $pop.find('.pc-csdt-pop-no').trigger('focus');
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
            /* clear:both — thanh phan trang duoi bang (systemroot pagInfoRender: .zone-pag-footer float:right width:100%)
               khong duoc clear: khoi bi float de len mep tren, con dong tieu de (flex = BFC) phai ne float rong 100%
               nen co ve ~0px, chu "Co so dao tao ap dung" rot tung tu mot.
               Khoang cach dung padding-top cua lop boc: sau khi clear float, margin-top bi "nuot" (khoi dinh sat thanh phan trang). */
            '.pc-csdt{clear:both;padding-top:16px}' +
            '.pc-csdt-card{border:1px solid #dbe3f4;border-radius:10px;background:#fff;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04)}' +
            '.pc-csdt-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:#f5f8ff;border-bottom:1px solid #e3e9f6}' +
            '.pc-csdt-title{display:inline-flex;align-items:center;gap:8px;color:#223771;font-weight:700;font-size:13.5px;white-space:nowrap}' +
            '.pc-csdt-title i{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:#223771;color:#fff !important;font-size:13px;margin:0}' +
            '.pc-csdt-count{background:#e0e7ff;color:#223771;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600;white-space:nowrap}' +
            '.pc-csdt-count:empty{display:none}' +
            '.pc-csdt-row{display:flex;align-items:center;gap:10px;padding:12px 14px 0}' +
            '.pc-csdt-select{flex:1 1 auto;min-width:0}' +
            '.pc-csdt-row .btn{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;margin:0 !important}' +
            '.pc-csdt-msg{font-size:12px;font-weight:600;margin-top:8px;padding:0 14px}' +
            '.pc-csdt-msg:empty{display:none}' +
            '.pc-csdt-msg.is-ok{color:#15803d}' +
            '.pc-csdt-msg.is-err{color:#b91c1c}' +
            '.pc-csdt-list{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px 12px}' +
            '.pc-csdt-empty{color:#64748b;font-size:12.5px;font-weight:500;font-style:italic}' +
            '.pc-csdt-empty.is-err{color:#b45309;font-weight:600}' +
            '.pc-csdt-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;background:#fff;border:1px solid #c7d2fe;border-radius:14px;padding:3px 6px 3px 10px;color:#0f172a;font-size:12.5px;font-weight:600;line-height:20px}' +
            '.pc-csdt-chip-ten{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
            '.pc-csdt-x{color:#64748b !important;cursor:pointer;padding:0 5px;border-radius:50%;line-height:18px}' +
            '.pc-csdt-x:hover{color:#dc3545 !important;background:#fee2e2}' +
            '.pc-csdt-chip.is-confirm{border-color:#fca5a5;background:#fff5f5}' +
            '.pc-csdt-yes{color:#dc3545 !important;font-weight:700;cursor:pointer}' +
            '.pc-csdt-no{color:#475569 !important;cursor:pointer}' +
            /* popup hoi lai khi bo co so (ve trong .modal-content) */
            m + ' .modal-content{position:relative}' +
            '.pc-csdt-pop{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1060;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.45);border-radius:inherit}' +
            '.pc-csdt-pop-box{width:100%;max-width:420px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,.28)}' +
            '.pc-csdt-pop-body{display:flex;gap:14px;padding:20px 20px 16px}' +
            '.pc-csdt-pop-icon{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center}' +
            '.pc-csdt-pop-icon i{color:#dc2626 !important;font-size:17px}' +
            '.pc-csdt-pop-title{margin:2px 0 6px;color:#0f172a;font-size:15px;font-weight:700}' +
            '.pc-csdt-pop-text{margin:0;color:#475569;font-size:13px;line-height:1.55}' +
            '.pc-csdt-pop-text b{color:#0f172a}' +
            '.pc-csdt-pop-foot{display:flex;justify-content:space-between;gap:10px;padding:12px 20px;background:#f8fafc;border-top:1px solid #e2e8f0}' +
            '.pc-csdt-pop-foot button{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 16px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}' +
            '.pc-csdt-pop-yes{background:#dc2626;border:1px solid #dc2626;color:#fff}' +
            '.pc-csdt-pop-yes:hover{background:#b91c1c;border-color:#b91c1c}' +
            '.pc-csdt-pop-yes i{color:#fff !important}' +
            '.pc-csdt-pop-no{background:#fff;border:1px solid #cbd5e1;color:#334155}' +
            '.pc-csdt-pop-no:hover{background:#f1f5f9}' +
            '.pc-csdt-pop-no i{color:#334155 !important}' +
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
