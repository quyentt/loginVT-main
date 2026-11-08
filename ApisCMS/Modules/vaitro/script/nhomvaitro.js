/*----------------------------------------------
--Cấu hình nhóm vai trò: quyết định mỗi vai trò nằm ở NHÓM nào trên màn hình "Danh sách vai trò" của trang chủ
--  (index.aspx > initRolePicker). Nhóm lưu ở DB nên toàn hệ thống cùng thấy sau khi người dùng tải lại trang.
--
--Cách lưu: ghi thẻ  [nhom:mã]  vào cuối cột MOTA của vai trò bằng API SuaVaiTro có sẵn (cùng API của trang Vai trò,
--  gửi lại nguyên các trường khác, CHỈ đổi MOTA, phần mô tả cũ giữ nguyên). Trang chủ đọc thẻ này ở classify().
--  Đây là cách TẠM vì bảng vai trò chưa có cột "nhóm". Khi BE thêm cột riêng thì chỉ cần đổi 3 chỗ:
--  tagOf() (đọc), withTag() (ghi), req_SuaNhom() (tham số gửi) — giao diện giữ nguyên.
--
--Danh sách nhóm: lấy từ danh mục dữ liệu "nhomvaitro" (xem loadNhom/mergeNhom). GROUPS bên dưới là danh sách CÓ SẴN dùng
--  làm dự phòng khi danh mục lỗi/trống — các mã phải khớp với GROUPS trong index.aspx (initRolePicker); đổi tên nhóm hoặc
--  thêm nhóm mới chỉ cần sửa ở danh mục, không phải sửa code.
----------------------------------------------*/
function NhomVaiTro() { }
NhomVaiTro.prototype = {
    dtVaiTro: [],
    mapById: {},
    objChange: {},  // ID vai trò -> mã nhóm mới ('' = theo mặc định hệ thống); chỉ chứa dòng KHÁC giá trị đã lưu
    savedOk: {},    // ID vai trò -> mã nhóm đã lưu thành công trong lần chạy gần nhất (để đối chiếu lại với máy chủ)
    iTimer: 0,
    iRenderToken: 0, // tăng mỗi lần vẽ lại bảng để việc khởi tạo select2 theo đợt của lần vẽ cũ tự dừng

    // color = màu chấm nhóm, lấy đúng màu nhóm trên trang chủ (GROUPS.fg trong index.aspx) cho người dùng dễ liên tưởng — đổi màu ở đâu thì đổi cả hai
    GROUPS: [
        { code: "tuyensinh", label: "Quản lý tuyển sinh và sinh viên", color: "#be185d" },
        { code: "daotao", label: "Quản lý đào tạo", color: "#6d28d9" },
        { code: "khaothi", label: "Quản lý khảo thí", color: "#c2410c" },
        { code: "taichinh", label: "Quản lý tài chính và học phí", color: "#15803d" },
        { code: "cong", label: "Hệ thống cổng thông tin", color: "#1d4ed8" },
        { code: "mobile", label: "Ứng dụng di động", color: "#0e7490" },
        { code: "nhansu", label: "Nhân sự", color: "#a21caf" },
        { code: "quantri", label: "Quản trị hệ thống", color: "#4d7c0f" },
        { code: "khac", label: "Khác", color: "#6b7280" }
    ],

    init: function () {
        var me = this;
        if (edu.system && typeof edu.system.page_load === "function") edu.system.page_load();
        // Nạp danh sách nhóm từ danh mục dữ liệu trước (lỗi/trống thì dùng danh sách có sẵn), rồi mới dựng ô lọc + bảng
        me.loadNhom(function () {
            me.initFilterSelect();
            me.getList_VaiTro();
        });

        $("#txtNhomVT_TuKhoa").on("input", function () {
            clearTimeout(me.iTimer);
            me.iTimer = setTimeout(function () { me.render(); }, 150);
        });
        $("#dropNhomVT_Loc").on("change", function () { me.render(); });
        $("#tblNhomVaiTro").on("change", ".sl-nhomvt", function () {
            me.onChangeNhom($(this).attr("data-id"), $(this).val());
        });
        $("#btnNhomVT_Luu").click(function (e) {
            e.preventDefault();
            me.save();
        });
        $("#btnNhomVT_HoanTac").click(function (e) {
            e.preventDefault();
            me.objChange = {};
            me.render();
        });
        $("#btnNhomVT_TaiLai").click(function (e) {
            e.preventDefault();
            if (me.countChange() > 0 && !window.confirm("Có " + me.countChange() + " thay đổi chưa lưu sẽ bị bỏ. Tải lại danh sách?")) return;
            me.objChange = {};
            me.getList_VaiTro();
        });
    },

    /*----------------------------------------------
    --Discription: Danh sách nhóm lấy từ danh mục dữ liệu "nhomvaitro"
    --  (CMS > Danh mục > Danh mục dữ liệu; bảng "Nhóm vai trò", mỗi dòng: Mã = mã nhóm, Tên = tên nhóm).
    --  GROUPS ở trên là danh sách CÓ SẴN, luôn dùng làm dự phòng. Quy tắc gộp (giống index.aspx):
    --   - Mã đã có sẵn: lấy TÊN trong danh mục làm nhãn (đổi tên nhóm không cần sửa code).
    --   - Mã mới: thêm nhóm mới, xếp trước "Khác", màu lấy lần lượt từ NEW_COLORS.
    --   - Không bao giờ xóa nhóm có sẵn: vai trò đã gắn nhóm đó vẫn phải có chỗ hiển thị.
    --  Mã chỉ gồm a-z, 0-9, _ (vì nằm trong thẻ [nhom:mã]); mã sai quy tắc bị bỏ qua.
    ----------------------------------------------*/
    NHOM_DM_MA: "nhomvaitro",
    NEW_COLORS: ["#0f766e", "#4338ca", "#b91c1c", "#a16207", "#92400e", "#0369a1", "#9a3412", "#115e59"], // khác 8 màu nhóm có sẵn; giữ khớp NEW_GROUP_COLORS ở index.aspx
    mergeNhom: function (rows) {
        var base = NhomVaiTro.prototype.GROUPS, me = this, seen = {}, extra = [], renamed = {};
        (rows || []).forEach(function (r) {
            var code = String((r && r.MA) || "").trim().toLowerCase(), label = String((r && r.TEN) || "").trim();
            if (!code || !label || seen[code]) return;
            if (!/^[a-z0-9_]+$/.test(code)) {
                if (window.console) console.warn("[nhomvaitro] Bỏ qua mã nhóm không hợp lệ trong danh mục: \"" + r.MA + "\" (chỉ dùng a-z, 0-9, _).");
                return;
            }
            seen[code] = true;
            var isBase = base.some(function (g) { return g.code === code; });
            if (isBase) renamed[code] = label; else extra.push({ code: code, label: label });
        });
        var out = [], khac = null;
        base.forEach(function (g) {
            var item = { code: g.code, label: renamed[g.code] || g.label, color: g.color };
            if (g.code === "khac") khac = item; else out.push(item);
        });
        extra.forEach(function (g, i) { out.push({ code: g.code, label: g.label, color: me.NEW_COLORS[i % me.NEW_COLORS.length] }); });
        if (khac) out.push(khac);
        return out;
    },
    loadNhom: function (fnDone) {
        var me = this, called = false;
        function done() { if (!called) { called = true; if (typeof fnDone === "function") fnDone(); } }
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success && Array.isArray(data.Data) && data.Data.length > 0) {
                    me.GROUPS = me.mergeNhom(data.Data);
                } else {
                    me.showBanner("info", "Danh mục nhóm \"" + me.NHOM_DM_MA + "\" đang trống hoặc không đọc được" + (data && data.Message ? " (" + me.esc(data.Message) + ")" : "") + " — đang dùng danh sách nhóm mặc định.");
                }
                done();
            },
            error: function () {
                me.showBanner("info", "Không kết nối được danh mục nhóm \"" + me.NHOM_DM_MA + "\" — đang dùng danh sách nhóm mặc định.");
                done();
            },
            type: "GET",
            action: "CMS_DanhMucThuocTinh/LayDanhSachDuLieuTheoBangDM",
            contentType: true,
            data: { "strMaBangDanhMuc": me.NHOM_DM_MA, "strTieuChiSapXep": "", "dTrangThai": 1 },
            fakedb: []
        }, false, false, false, null);
    },

    /*----------------------------------------------
    --Discription: Tiện ích
    ----------------------------------------------*/
    esc: function (s) {
        return String(s === null || s === undefined ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    norm: function (s) {
        return String(s === null || s === undefined ? "" : s).toLowerCase()
            .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    },
    labelOf: function (code) {
        if (!code) return "Theo mặc định";
        for (var i = 0; i < this.GROUPS.length; i++) if (this.GROUPS[i].code === code) return this.GROUPS[i].label;
        return "(mã lạ: " + code + ")";
    },
    // Đọc thẻ nhóm trong MOTA — phải cùng quy ước với groupFromMoTa() ở index.aspx
    tagOf: function (moTa) {
        var m = /\[nhom:([a-z0-9_]+)\]/i.exec(moTa || "");
        return m ? m[1].toLowerCase() : "";
    },
    // MOTA mới = mô tả cũ (bỏ thẻ cũ) + thẻ mới; code rỗng = xóa thẻ, về mặc định
    withTag: function (moTa, code) {
        var text = String(moTa === null || moTa === undefined ? "" : moTa).replace(/\s*\[nhom:[a-z0-9_]+\]/ig, "").trim();
        return code ? (text ? text + " " : "") + "[nhom:" + code + "]" : text;
    },
    origOf: function (row) { return this.tagOf(row.MOTA); },
    curOf: function (row) {
        return Object.prototype.hasOwnProperty.call(this.objChange, row.ID) ? this.objChange[row.ID] : this.origOf(row);
    },
    countChange: function () { return Object.keys(this.objChange).length; },
    showBanner: function (type, html) {
        // type: success | info | warning | danger. Dùng khung chữ trong trang, KHÔNG dùng edu.system.alert (tránh chồng modal BS3)
        $("#divNhomVT_Banner").html(html ? '<div class="alert alert-' + type + '" style="margin-bottom:12px">' + html + '</div>' : "");
    },

    /*----------------------------------------------
    --Discription: Nạp danh sách vai trò (cùng API với trang Vai trò: LayDanhSachVaiTro)
    ----------------------------------------------*/
    getList_VaiTro: function (fnDone) {
        var me = this;
        var obj_list = {
            'action': 'CMS_QuanLyNguoiDung_MH/DSA4BSAvKRIgIikXICgVMy4P',
            'func': 'pkg_chung_quanlynguoidung.LayDanhSachVaiTro',
            'iM': edu.system.iM,
            'versionAPI': 'v1.0',
            'strLoaiVaiTro_Id': "",
            'strTuKhoa': "",
            'pageIndex': 1,
            'pageSize': 1000,
            'dTrangThai': 1,
            'strChung_VaiTro_Cha_Id': ""
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    var dt = Array.isArray(data.Data) ? data.Data : ((data.Data && data.Data.rs) || []);
                    me.dtVaiTro = dt.slice().sort(function (a, b) {
                        return String(a.TENVAITRO || "").localeCompare(String(b.TENVAITRO || ""), "vi");
                    });
                    me.mapById = {};
                    me.dtVaiTro.forEach(function (r) { me.mapById[r.ID] = r; });
                    var iPager = parseInt(data.Pager, 10);
                    if (iPager > dt.length) {
                        me.showBanner("warning", "Chỉ nạp được " + dt.length + "/" + iPager + " vai trò đầu tiên. Dùng ô tìm kiếm của trang Vai trò cho các vai trò còn lại.");
                    }
                    me.render();
                    if (typeof fnDone === "function") fnDone();
                } else {
                    me.showBanner("danger", "Không nạp được danh sách vai trò: " + me.esc(data && data.Message));
                }
            },
            error: function (er) {
                me.showBanner("danger", "Không nạp được danh sách vai trò (lỗi kết nối): " + me.esc(JSON.stringify(er)));
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },

    /*----------------------------------------------
    --Discription: Vẽ bảng
    ----------------------------------------------*/
    /*----------------------------------------------
    --Discription: Ô chọn dạng select2 (có ô tìm kiếm). Cùng thư viện + giao diện với các trang khác trong hệ thống.
    --  Không có select2 thì vẫn dùng <select> thường, chức năng không đổi.
    ----------------------------------------------*/
    colorOf: function (code) {
        for (var i = 0; i < this.GROUPS.length; i++) if (this.GROUPS[i].code === code) return this.GROUPS[i].color;
        return "#94a3b8";
    },
    // Dòng trong danh sách + ô đang chọn: chấm màu nhóm + tên. Mặc định = chấm rỗng. Dựng bằng .text() nên không lọt HTML.
    fmtNhom: function (state) {
        if (state.loading) return state.text;
        var $o = $('<span class="nvt-opt"></span>');
        var $dot = $('<i class="nvt-dot"></i>');
        if (state.id) $dot.css("background", this.colorOf(state.id));
        else $dot.addClass("nvt-dot-none");
        $o.append($dot).append($("<span></span>").text(state.text));
        return $o;
    },
    // Tìm không phân biệt dấu và chữ hoa/thường: gõ "khao thi" ra "Quản lý khảo thí"
    matcherNhom: function (params, data) {
        var P = NhomVaiTro.prototype; // select2 gọi hàm này không kèm this
        var kw = $.trim(params.term || "");
        if (kw === "") return data;
        // Mục có con (optgroup của ô bộ lọc): giữ lại các con khớp, không con nào khớp thì bỏ cả nhóm
        if (data.children && data.children.length > 0) {
            var match = $.extend(true, {}, data);
            for (var c = data.children.length - 1; c >= 0; c--) {
                if (P.matcherNhom(params, data.children[c]) === null) match.children.splice(c, 1);
            }
            return match.children.length > 0 ? match : null;
        }
        if (typeof data.text === "undefined") return null;
        return P.norm(data.text).indexOf(P.norm(kw)) > -1 ? data : null;
    },
    select2Opts: function (el) {
        var me = this;
        return {
            width: "100%",
            // Cùng chuẩn với edu.system.page_load: ngoài modal gắn vào body để không bị khung cuộn của bảng cắt mất
            dropdownParent: (edu.system && typeof edu.system.getSelect2Parent === "function") ? edu.system.getSelect2Parent(el) : $(document.body),
            matcher: me.matcherNhom,
            language: { noResults: function () { return "Không tìm thấy nhóm phù hợp"; } },
            templateResult: function (s) { return me.fmtNhom(s); },
            templateSelection: function (s) { return me.fmtNhom(s); }
        };
    },
    bindSelect2Common: function ($s, strHint) {
        $s.on("select2:open", function () {
            // Gợi ý trong ô tìm kiếm của danh sách vừa mở
            setTimeout(function () { $(".select2-container--open .select2-search__field").attr("placeholder", strHint); }, 0);
        }).on("select2:close", function () {
            // select2 4.0.3 gắn scroll.select2 vào các khung cha khi mở; gỡ khi đóng để trang/khung cuộn không bị khóa
            $(this).parents().off("scroll.select2");
        });
    },
    initFilterSelect: function () {
        var me = this, $f = $("#dropNhomVT_Loc");
        if (!$f.length) return;
        // Danh sách nhóm trong bộ lọc sinh từ GROUPS (không chép tay ở HTML nữa → chỉ còn 1 nguồn trong trang này)
        var $og = $f.find("optgroup");
        if (!$og.length) $og = $('<optgroup label="Theo nhóm đã chọn"></optgroup>').appendTo($f);
        $og.empty();
        me.GROUPS.forEach(function (g) { $og.append($("<option></option>").val("g:" + g.code).text(g.label)); });
        if (!$.fn.select2) return;
        // Dự phòng khi HTML là bản cũ (thiếu thẻ bọc .nvt-loc): tự bọc, nếu không ô select2 sẽ giãn hết cả hàng
        // và danh sách xổ ra rộng kín trang ở mép trái
        if (!$f.parent().hasClass("nvt-loc")) $f.removeClass("nvt-loc").css("width", "100%").wrap('<div class="nvt-loc"></div>');
        var o = me.select2Opts($f[0]);
        delete o.templateResult; delete o.templateSelection; // bộ lọc không cần chấm màu
        $f.select2(o);
        me.bindSelect2Common($f, "Gõ để tìm bộ lọc...");
    },
    // Khởi tạo select2 cho các dòng vừa vẽ, theo đợt để bảng hàng trăm dòng không làm đơ trình duyệt
    initSelects: function () {
        var me = this;
        if (!$.fn.select2) return;
        var token = ++me.iRenderToken, $all = $("#tblNhomVaiTro tbody .sl-nhomvt"), i = 0, CHUNK = 40;
        (function step() {
            if (token !== me.iRenderToken) return; // đã có lần vẽ mới hơn
            $all.slice(i, i + CHUNK).each(function () {
                var $s = $(this);
                $s.select2(me.select2Opts(this));
                me.bindSelect2Common($s, "Gõ để tìm nhóm...");
            });
            i += CHUNK;
            if (i < $all.length) setTimeout(step, 0);
        })();
    },
    optionsHtml: function (sel) {
        var me = this, h = '<option value=""' + (sel === "" ? " selected" : "") + '>— Theo mặc định hệ thống —</option>', known = false, i;
        for (i = 0; i < me.GROUPS.length; i++) {
            if (me.GROUPS[i].code === sel) known = true;
            h += '<option value="' + me.GROUPS[i].code + '"' + (me.GROUPS[i].code === sel ? " selected" : "") + ">" + me.esc(me.GROUPS[i].label) + "</option>";
        }
        // Thẻ có mã không còn trong danh sách nhóm: giữ lại để không âm thầm mất khi lưu
        if (sel && !known) h += '<option value="' + me.esc(sel) + '" selected>(mã lạ: ' + me.esc(sel) + ")</option>";
        return h;
    },
    statusHtml: function (row) {
        var orig = this.origOf(row), cur = this.curOf(row);
        if (cur !== orig) return '<span class="nvt-badge nvt-b-chg">Chưa lưu</span>';
        return orig ? '<span class="nvt-badge nvt-b-set">Đã chọn</span>' : '<span class="nvt-badge nvt-b-def">Mặc định</span>';
    },
    matchFilter: function (row, kw, loc) {
        var me = this;
        if (kw && me.norm(row.TENVAITRO + " " + row.MAVAITRO).indexOf(kw) < 0) return false;
        var orig = me.origOf(row), cur = me.curOf(row);
        if (loc === "set") return cur !== "";
        if (loc === "unset") return cur === "";
        if (loc === "changed") return cur !== orig;
        if (loc.indexOf("g:") === 0) return cur === loc.substring(2);
        return true;
    },
    render: function () {
        var me = this;
        var kw = me.norm($("#txtNhomVT_TuKhoa").val()).trim();
        var loc = $("#dropNhomVT_Loc").val() || "";
        var html = "", n = 0;
        me.dtVaiTro.forEach(function (r) {
            if (!me.matchFilter(r, kw, loc)) return;
            n++;
            var cha = r.CHUNG_VAITRO_CHA_ID && me.mapById[r.CHUNG_VAITRO_CHA_ID] ? me.mapById[r.CHUNG_VAITRO_CHA_ID].TENVAITRO : "";
            var changed = me.curOf(r) !== me.origOf(r);
            html += '<tr id="nvt_' + me.esc(r.ID) + '"' + (changed ? ' class="nvt-changed"' : "") + ">";
            html += '<td class="td-center">' + n + "</td>";
            html += "<td><b>" + me.esc(r.TENVAITRO) + "</b></td>";
            html += "<td>" + me.esc(r.MAVAITRO) + "</td>";
            html += '<td class="text-muted">' + me.esc(cha) + "</td>";
            html += '<td><select class="form-control input-sm sl-nhomvt" data-id="' + me.esc(r.ID) + '">' + me.optionsHtml(me.curOf(r)) + "</select></td>";
            html += '<td class="td-center nvt-status">' + me.statusHtml(r) + "</td>";
            html += "</tr>";
        });
        if (!html) html = '<tr><td colspan="6" class="td-center text-muted" style="padding:24px">Không có vai trò phù hợp.</td></tr>';
        $("#tblNhomVaiTro tbody").html(html);
        me.initSelects();
        $("#lblNhomVT_Tong").text(me.dtVaiTro.length);
        $("#lblNhomVT_HienThi").text("Hiển thị " + n + " / " + me.dtVaiTro.length);
        me.refreshFooter();
    },
    onChangeNhom: function (strId, strCode) {
        var me = this, row = me.mapById[strId];
        if (!row) return;
        if (strCode === me.origOf(row)) delete me.objChange[strId];
        else me.objChange[strId] = strCode;
        var changed = me.curOf(row) !== me.origOf(row);
        $("#nvt_" + strId).toggleClass("nvt-changed", changed).find(".nvt-status").html(me.statusHtml(row));
        me.refreshFooter();
    },
    refreshFooter: function () {
        var n = this.countChange();
        $("#lblNhomVT_SoThayDoi").html(n > 0 ? '<b style="color:#c2410c">' + n + "</b> thay đổi chưa lưu" : "Chưa có thay đổi");
    },

    /*----------------------------------------------
    --Discription: Lưu — mỗi vai trò đổi nhóm = 1 lần gọi SuaVaiTro (form tiến trình dùng chung edu.process)
    ----------------------------------------------*/
    // Dựng tham số SuaVaiTro: gửi lại NGUYÊN các trường hiện có của vai trò, chỉ MOTA đổi
    req_SuaNhom: function (it) {
        var me = this, r = it.row;
        var d = {
            'action': 'CMS_QuanLyNguoiDung/SuaVaiTro',
            'versionAPI': 'v1.0',
            'strMaVaiTro': r.MAVAITRO,
            'strTenVaiTro': r.TENVAITRO,
            'strMoTa': me.withTag(r.MOTA, it.MOI),
            'dThuTu': (r.THUTU === undefined || r.THUTU === "") ? null : r.THUTU,
            'dTrangThai': 1,
            'strLoaiVaiTro_Id': r.LOAIVAITRO_ID || "",
            'strChung_VaiTro_Cha_Id': r.CHUNG_VAITRO_CHA_ID || "",
            'strNguoiThucHien_Id': edu.system.userId,
            'strId': r.ID
        };
        return { action: d.action, data: d };
    },
    save: function () {
        var me = this, items = [];
        me.dtVaiTro.forEach(function (r) {
            var cur = me.curOf(r), orig = me.origOf(r);
            if (cur !== orig) items.push({ ID: r.ID, TEN: r.TENVAITRO, MA: r.MAVAITRO, CU: orig, MOI: cur, row: r });
        });
        if (!items.length) {
            me.showBanner("info", "Chưa có thay đổi nào để lưu.");
            return;
        }
        me.showBanner("", "");
        me.savedOk = {};
        var fnAfter = function () { me.afterSave(); };
        if (edu.process && typeof edu.process.run === "function") {
            edu.process.run({
                title: "Lưu nhóm vai trò",
                unit: "vai trò",
                fileName: "KetQuaLuuNhomVaiTro",
                items: items,
                columns: [
                    { header: "Tên vai trò", render: function (it) { return it.TEN; } },
                    { header: "Mã vai trò", render: function (it) { return it.MA; } },
                    { header: "Nhóm (cũ → mới)", render: function (it) { return me.labelOf(it.CU) + " → " + me.labelOf(it.MOI); } }
                ],
                notes: ["Mỗi vai trò đổi nhóm được lưu bằng 1 lần cập nhật. Nhóm mới hiện ở trang chủ sau khi người dùng tải lại trang."],
                okMessage: "Đã lưu nhóm",
                run: function (it) {
                    return edu.process.callApi(me.req_SuaNhom(it)).then(function (r) {
                        if (r.ok) me.savedOk[it.ID] = it.MOI;
                        return { ok: r.ok, message: r.message };
                    });
                },
                refresh: fnAfter
            });
        } else {
            me.saveSequential(items, fnAfter);
        }
    },
    // Dự phòng khi máy chủ chưa có edu.process (VD chưa copy processrun.js): lưu tuần tự, báo kết quả ở khung chữ
    saveSequential: function (items, fnAfter) {
        var me = this, i = 0, ok = 0, errs = [];
        me.showBanner("info", "Đang lưu " + items.length + " vai trò...");
        function next() {
            if (i >= items.length) {
                if (errs.length) me.showBanner("danger", "Lưu được " + ok + "/" + items.length + ". Lỗi: " + errs.map(function (s) { return me.esc(s); }).join("; "));
                if (ok > 0) fnAfter();
                return;
            }
            var it = items[i++], p = me.req_SuaNhom(it);
            edu.system.makeRequest({
                success: function (data) {
                    if (data && data.Success) { ok++; me.savedOk[it.ID] = it.MOI; }
                    else errs.push(it.TEN + ": " + ((data && data.Message) || "không rõ lỗi"));
                    next();
                },
                error: function (er) { errs.push(it.TEN + ": lỗi kết nối"); next(); },
                type: 'POST', contentType: true, action: p.action, data: p.data, fakedb: []
            }, false, false, false, null);
        }
        next();
    },
    // Sau khi lưu: nạp lại từ máy chủ rồi ĐỐI CHIẾU thẻ nhóm — phòng khi máy chủ báo thành công mà không ghi MOTA
    afterSave: function () {
        var me = this, saved = me.savedOk;
        // Dòng lưu thành công thì bỏ khỏi danh sách chưa lưu; dòng lỗi giữ lại để lưu lại
        Object.keys(saved).forEach(function (id) { delete me.objChange[id]; });
        me.getList_VaiTro(function () {
            var bad = [], total = Object.keys(saved).length;
            Object.keys(saved).forEach(function (id) {
                var r = me.mapById[id];
                if (!r || me.tagOf(r.MOTA) !== saved[id]) bad.push(r ? r.TENVAITRO : id);
            });
            if (bad.length) {
                me.showBanner("warning", "Máy chủ báo lưu thành công nhưng <b>" + bad.length + "/" + total + "</b> vai trò chưa đổi nhóm (cột Mô tả không được cập nhật): " +
                    bad.map(function (s) { return me.esc(s); }).join(", ") + ". Cần báo bộ phận kỹ thuật kiểm tra hàm SuaVaiTro.");
            } else if (me.countChange() > 0) {
                // Có vai trò lưu lỗi: giữ nguyên lựa chọn của người dùng ở trạng thái "Chưa lưu" để bấm lưu lại
                me.showBanner("warning", "Đã lưu nhóm cho <b>" + total + "</b> vai trò. Còn <b>" + me.countChange() + "</b> vai trò chưa lưu được (dòng màu vàng, trạng thái \"Chưa lưu\") — xem lý do ở form kết quả, sửa rồi bấm Lưu lại.");
            } else {
                me.showBanner("success", "Đã lưu nhóm cho <b>" + total + "</b> vai trò. Người dùng tải lại trang chủ (Ctrl+F5) sẽ thấy nhóm mới.");
            }
        });
    }
};
