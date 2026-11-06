/*----------------------------------------------
--Tiện ích dùng chung cho các màn của module Phân quyền dữ liệu.
--Nạp TRƯỚC script của từng màn:
--    <script src="modules/phanquyen/script/pqcommon.js?v=..."></script>
--Hàm backend: PKG_CORE_QUANTRI_04.* (endpoint CMS_QuanTri04_MH/<mã>, mã = base64(XOR(tên method,'A')))
----------------------------------------------*/
var PQ = {
    // Hàm dùng chéo giữa các màn (danh mục cho ô chọn)
    API: {
        LOAIDOITUONG_LAYDS: { action: 'CMS_QuanTri04_MH/JSweLS4gKCUuKDU0Li8mHg0gOAUS', func: 'PKG_CORE_QUANTRI_04.dm_loaidoituong_LayDS' },
        QUANHE_LAYDS: { action: 'CMS_QuanTri04_MH/JSweMDQgLykkHjEpIC8iIDEeDSA4BRIP', func: 'PKG_CORE_QUANTRI_04.dm_quanhe_phancap_LayDS' },
        // Danh mục chức năng / ứng dụng của hệ thống (hàm chuẩn của module quản lý chức năng ở ApisCMS)
        CHUCNANG_LAYDS: { action: 'CMS_QuanLyNguoiDung_MH/DSA4BSAvKRIgIikCKTQiDyAvJgPP', func: 'pkg_chung_quanlynguoidung.LayDanhSachChucNang' },
        UNGDUNG_LAYDS: { action: 'CMS_QuanLyNguoiDung_MH/DSA4BSAvKRIgIikULyYFNC8m', func: 'pkg_chung_quanlynguoidung.LayDanhSachUngDung' },
        VAITRO_LAYDS: { action: 'CMS_QuanLyNguoiDung_MH/DSA4BSAvKRIgIikXICgVMy4P', func: 'pkg_chung_quanlynguoidung.LayDanhSachVaiTro' },
        NGUOIDUNG_LAYDS: { action: 'CMS_QuanLyNguoiDung_MH/DSA4BSAvKRIgIikPJjQuKAU0LyYP', func: 'pkg_chung_quanlynguoidung.LayDanhSachNguoiDung' }
    },

    // Gọi 1 hàm BE đã mã hoá (func + iM): makeRequest tự mã hoá request, giải mã data.Data, bật/tắt overlay
    call: function (api, params, fnOk, fnErr) {
        var obj = $.extend({ 'action': api.action, 'func': api.func, 'iM': edu.system.iM }, params);
        edu.system.makeRequest({
            success: function (data) { fnOk(data); },
            error: function (er) { if (fnErr) fnErr(er); },
            type: "POST",
            action: obj.action,
            contentType: true,
            data: obj,
            fakedb: []
        }, false, false, false, null);
    },

    // Thông báo lỗi từ response lỗi HTTP (BE trả Message trong body kể cả khi 500)
    msgLoi: function (er) {
        var m = er && er.responseJSON && er.responseJSON.Message;
        if (m) return m;
        return (er && er.statusText) ? er.statusText : "Không kết nối được máy chủ";
    },

    // Đọc 1 cột của dòng dữ liệu (chịu được tên cột viết hoa/thường); null → ''
    g: function (row, key) {
        if (!row) return '';
        var v = row[key];
        if (v === undefined) v = row[key.toLowerCase()];
        return (v === null || v === undefined) ? '' : v;
    },

    // Chống chèn HTML khi ghép chuỗi vào innerHTML
    esc: function (s) {
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    // Cờ 0/1 của Oracle (có thể về dạng số, chuỗi hoặc boolean)
    isTrue: function (v) {
        return v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true';
    },

    // Chọn giá trị cho ô chọn; nếu giá trị chưa có trong danh sách (vd danh mục đã bị xóa) thì thêm tạm
    // để không làm mất giá trị khi người dùng bấm Lưu.
    setDrop: function (id, val) {
        if (val !== '' && $("#" + id + " option").filter(function () { return this.value === String(val); }).length === 0) {
            $("#" + id).append($('<option>').val(val).text(val));
        }
        edu.util.viewValById(id, val);
    },

    // Báo thành công SAU KHI modal đã đóng hẳn — không chồng 2 modal (BS3 sẽ kẹt khóa cuộn trang)
    alertSauKhiDongModal: function (strModalId, strNoiDung) {
        $("#" + strModalId).one("hidden.bs.modal", function () {
            edu.system.alert(strNoiDung);
        });
        $("#" + strModalId).modal("hide");
    },

    // Danh mục loại đối tượng (dm_loaidoituong_LayDS) → [{MA, TEN}]; lỗi thì trả [] (màn vẫn chạy, chỉ hiện mã)
    loadLoaiDoiTuong: function (fnDone) {
        PQ.call(PQ.API.LOAIDOITUONG_LAYDS, { 'strtukhoa': '' }, function (data) {
            var dt = (data.Success && data.Data) ? data.Data : [];
            if (dt.length > 0 && PQ.g(dt[0], 'MA') === '' && window.console) {
                console.warn('[pq] dm_loaidoituong_LayDS không có cột MA — các cột nhận được:', Object.keys(dt[0]));
            }
            fnDone($.map(dt, function (r) { return { MA: PQ.g(r, 'MA'), TEN: PQ.g(r, 'TEN') }; }));
        }, function () {
            if (window.console) console.warn('[pq] Không nạp được danh mục loại đối tượng.');
            fnDone([]);
        });
    },

    // Chạy song song nhiều bước nạp danh mục; mỗi bước là function(fnXong) gọi fnXong(kết quả).
    // Khi tất cả xong gọi fnDone([kết quả bước 1, kết quả bước 2, ...]) đúng thứ tự khai báo.
    whenAll: function (arrFn, fnDone) {
        var n = arrFn.length, kq = new Array(n), dem = 0;
        $.each(arrFn, function (i, fn) {
            fn(function (res) {
                kq[i] = res;
                dem++;
                if (dem === n) fnDone(kq);
            });
        });
    },

    // Mảng → bảng tra { khóa: giá trị }
    mapOf: function (dt, strKey, strVal) {
        var m = {};
        $.each(dt, function (i, r) { m[r[strKey]] = r[strVal]; });
        return m;
    },
    has: function (obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    },

    // Danh mục quan hệ phân cấp (dm_quanhe_phancap_LayDS) → [{ID, LOAI_CON_MA, LOAI_CHA_MA}]; lỗi thì []
    loadQuanHe: function (fnDone) {
        PQ.call(PQ.API.QUANHE_LAYDS, { 'strtukhoa': '' }, function (data) {
            var dt = (data.Success && data.Data) ? data.Data : [];
            if (dt.length > 0 && PQ.g(dt[0], 'ID') === '' && window.console) {
                console.warn('[pq] dm_quanhe_phancap_LayDS không có cột ID — các cột nhận được:', Object.keys(dt[0]));
            }
            fnDone($.map(dt, function (r) {
                return { ID: PQ.g(r, 'ID'), LOAI_CON_MA: PQ.g(r, 'LOAI_CON_MA'), LOAI_CHA_MA: PQ.g(r, 'LOAI_CHA_MA') };
            }));
        }, function () {
            if (window.console) console.warn('[pq] Không nạp được danh mục quan hệ phân cấp.');
            fnDone([]);
        });
    },
    // Nhãn thuần chữ của 1 quan hệ: "qh_sv_lop — Sinh viên → Lớp" (mapLoai: mã loại → tên)
    nhanQuanHe: function (qh, mapLoai) {
        var ten = function (ma) { return (mapLoai && PQ.has(mapLoai, ma) && mapLoai[ma]) ? mapLoai[ma] : ma; };
        if (!qh) return '';
        if (!qh.LOAI_CON_MA && !qh.LOAI_CHA_MA) return qh.ID;
        return qh.ID + ' — ' + ten(qh.LOAI_CON_MA) + ' → ' + ten(qh.LOAI_CHA_MA);
    },

    // Tìm người dùng (tài khoản) theo từ khóa — KHÔNG nạp cả danh sách vì có thể hàng nghìn tài khoản.
    // Hàm chuẩn của module người dùng ở ApisCMS (tìm phía máy chủ theo tên / tài khoản / email).
    // fnDone(items, strLoi): items = [{ID, TEN, TAIKHOAN, EMAIL, LABEL}] (tối đa iToiDa); lỗi thì items = [] và strLoi có chữ.
    timNguoiDung: function (strTuKhoa, iToiDa, fnDone) {
        PQ.call(PQ.API.NGUOIDUNG_LAYDS, {
            'strTuKhoa': strTuKhoa, 'pageIndex': 1, 'pageSize': iToiDa, 'dTrangThai': 1,
            'strChung_DonVi_Id': '', 'strVaiTro_Id': '', 'strPhanLoaiDoiTuong': '', 'strCapXuLy_Id': '', 'strTinhThanh_Id': ''
        }, function (data) {
            if (!data.Success) { fnDone([], data.Message || 'Không tìm được người dùng.'); return; }
            var dt = data.Data || [];
            if (dt.length > 0 && PQ.g(dt[0], 'ID') === '' && window.console) {
                console.warn('[pq] LayDanhSachNguoiDung không có cột ID — các cột nhận được:', Object.keys(dt[0]));
            }
            fnDone($.map(dt, function (r) {
                var ten = PQ.g(r, 'TENDAYDU'), tk = PQ.g(r, 'TAIKHOAN'), id = PQ.g(r, 'ID');
                return { ID: id, TEN: ten, TAIKHOAN: tk, EMAIL: PQ.g(r, 'EMAIL'), LABEL: PQ.nhanNguoiDung(ten, tk, id) };
            }), '');
        }, function (er) {
            fnDone([], PQ.msgLoi(er));
        });
    },
    // Nhãn người dùng: "Tên (tài khoản)"; thiếu cái nào dùng cái còn lại; không có gì thì dùng ID
    nhanNguoiDung: function (strTen, strTaiKhoan, strId) {
        if (strTen) return strTen + (strTaiKhoan ? ' (' + strTaiKhoan + ')' : '');
        return strTaiKhoan || strId || '';
    },
    // Lấy tên/tài khoản người dùng NẾU response của hàm phân quyền có kèm (tên cột chưa chốt nên thử vài tên thường gặp).
    // Trả {ID, TEN, TK, CO}; CO=false nghĩa là response chỉ có ID — màn hình phải hiện ID và báo cần bổ sung cột.
    nguoiDungCuaDong: function (row, strIdKey) {
        var first = function (arrKey) {
            for (var i = 0; i < arrKey.length; i++) {
                var v = PQ.g(row, arrKey[i]);
                if (v !== '') return v;
            }
            return '';
        };
        var ten = first(['TENDAYDU', 'NGUOIDUNG_TEN', 'TENNGUOIDUNG', 'HOTEN']);
        var tk = first(['TAIKHOAN', 'NGUOIDUNG_TAIKHOAN', 'MASO', 'NGUOIDUNG_MA']);
        return { ID: PQ.g(row, strIdKey), TEN: ten, TK: tk, CO: (ten !== '' || tk !== '') };
    },

    // Ngày: backend có thể trả 'dd/MM/yyyy[ hh:mm:ss]', ISO 'yyyy-MM-dd[Thh:mm:ss]' hoặc '/Date(ms)/'. → Date (0h giờ máy) hoặc null.
    // Ô nhập của hệ thống dùng 'dd/mm/yyyy' (class input-datepicker + edu.util.dateValid).
    parseNgay: function (v) {
        if (v === null || v === undefined || v === '') return null;
        var s = String(v), m;
        var mk = function (y, mo, d) {
            var dt = new Date(+y, +mo - 1, +d);
            return (dt.getFullYear() === +y && dt.getMonth() === +mo - 1 && dt.getDate() === +d) ? dt : null;
        };
        if ((m = /^\/Date\((-?\d+)/.exec(s))) {
            var d0 = new Date(parseInt(m[1], 10));
            return new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
        }
        if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return mk(m[1], m[2], m[3]);
        if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s))) return mk(m[3], m[2], m[1]);
        return null;
    },
    // Ngày hiển thị 'dd/mm/yyyy'; không đọc được thì trả nguyên chuỗi gốc (không làm mất dữ liệu), rỗng thì ''
    dmy: function (v) {
        var dt = PQ.parseNgay(v);
        if (!dt) return (v === null || v === undefined) ? '' : String(v);
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        return p(dt.getDate()) + '/' + p(dt.getMonth() + 1) + '/' + dt.getFullYear();
    },
    homNay: function () {
        var n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate());
    },
    // Date → 'dd/mm/yyyy'
    dmyDate: function (dt) {
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        return p(dt.getDate()) + '/' + p(dt.getMonth() + 1) + '/' + dt.getFullYear();
    },
    // Ngày + GIỜ: 'dd/MM/yyyy[ hh:mm[:ss]]', ISO 'yyyy-MM-dd[Thh:mm[:ss]]' hoặc '/Date(ms)/' → Date (có giờ) hoặc null
    parseNgayGio: function (v) {
        if (v === null || v === undefined || v === '') return null;
        var s = String(v), m;
        var mk = function (y, mo, d, h, mi, se) {
            var dt = new Date(+y, +mo - 1, +d, +(h || 0), +(mi || 0), +(se || 0));
            return (dt.getFullYear() === +y && dt.getMonth() === +mo - 1 && dt.getDate() === +d) ? dt : null;
        };
        if ((m = /^\/Date\((-?\d+)/.exec(s))) return new Date(parseInt(m[1], 10));
        if ((m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s))) return mk(m[1], m[2], m[3], m[4], m[5], m[6]);
        if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(s))) return mk(m[3], m[2], m[1], m[4], m[5], m[6]);
        return null;
    },
    // 'dd/mm/yyyy hh:mm:ss'; không đọc được thì trả nguyên chuỗi gốc, rỗng thì ''
    dmyHms: function (v) {
        var dt = PQ.parseNgayGio(v);
        if (!dt) return (v === null || v === undefined) ? '' : String(v);
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        return PQ.dmyDate(dt) + ' ' + p(dt.getHours()) + ':' + p(dt.getMinutes()) + ':' + p(dt.getSeconds());
    },

    hetHan: function (den) {
        var d = PQ.parseNgay(den);
        return !!d && d.getTime() < PQ.homNay().getTime();
    },
    // Ô "Khoảng ngày": "dd/mm/yyyy → dd/mm/yyyy" | "từ ..." | "đến ..." | "Không giới hạn"; đã quá hạn thì mờ + "(hết hạn)"
    khoangNgayHtml: function (tu, den) {
        var t = PQ.dmy(tu), d = PQ.dmy(den), s;
        if (!t && !d) s = 'Không giới hạn';
        else if (t && d) s = PQ.esc(t) + ' <i class="fa fa-long-arrow-right"></i> ' + PQ.esc(d);
        else if (t) s = 'từ ' + PQ.esc(t);
        else s = 'đến ' + PQ.esc(d);
        return PQ.hetHan(den) ? '<span class="pq-sub">' + s + ' (hết hạn)</span>' : s;
    },

    // Ô bảng "Chức năng": "Ứng dụng › Tên (mã)"; không có trong danh mục thì hiện ID thô (mapChucNang: ID → {TEN, MA, UD})
    chucNangHtml: function (mapChucNang, strId) {
        if (!PQ.has(mapChucNang, strId)) return '<span class="pq-mono">' + PQ.esc(strId) + '</span>';
        var c = mapChucNang[strId];
        return (c.UD ? '<span class="pq-sub">' + PQ.esc(c.UD) + ' › </span>' : '')
            + PQ.esc(c.TEN)
            + (c.MA ? ' <span class="pq-mono pq-sub">(' + PQ.esc(c.MA) + ')</span>' : '');
    },
    // Ô bảng "Người dùng": "Tên (tài khoản)" nếu response có kèm; không thì hiện ID + báo console (1 lần mỗi màn hình)
    _daCanhBaoTenND: {},
    nguoiDungHtml: function (row, strIdKey, strManHinh) {
        var o = PQ.nguoiDungCuaDong(row, strIdKey);
        if (!o.CO) {
            if (!PQ._daCanhBaoTenND[strManHinh] && window.console) {
                PQ._daCanhBaoTenND[strManHinh] = true;
                console.warn('[' + strManHinh + '] Response chỉ có ' + strIdKey + ', không kèm tên/tài khoản người dùng — bảng đang hiện ID. Cần bổ sung cột tên/tài khoản vào hàm LayDS. Các cột nhận được:', Object.keys(row));
            }
            return '<span class="pq-mono">' + PQ.esc(o.ID) + '</span>';
        }
        return (o.TEN ? PQ.esc(o.TEN) : '')
            + (o.TK ? (o.TEN ? ' <span class="pq-mono pq-sub">(' + PQ.esc(o.TK) + ')</span>' : '<span class="pq-mono">' + PQ.esc(o.TK) + '</span>') : '');
    },

    // Ô chọn người dùng trong modal: gõ từ khóa + Tìm (hoặc Enter) → đổ kết quả vào ô chọn.
    // cfg: {txt, btn, drop, hint, max (mặc định 50), notify (id vùng thông báo của modal, nếu không phải #notify)}
    // Trả về {reset(), datNguoi(id, nhan), layId(), tim()}.
    pickerNguoiDung: function (cfg) {
        var iToiDa = cfg.max || 50;
        var strHintMacDinh = 'Nhập ít nhất 2 ký tự để tìm; kết quả tối đa ' + iToiDa + ' người — thu hẹp từ khóa nếu chưa thấy.';
        var datHint = function (s) { $('#' + cfg.hint).text(s); };
        var canhBao = function (s) {
            var o = { type: 'w', content: s };
            if (cfg.notify) o.prePos = '#' + cfg.notify;
            edu.system.alertOnModal(o);
        };
        var self = {
            // Ô chọn chỉ giữ dòng tiêu đề + (nếu có) người đang chọn
            datNguoi: function (strId, strNhan) {
                var $d = $('#' + cfg.drop);
                $d.html('<option value="">-- Chọn người dùng --</option>');
                if (strId) $d.append($('<option>').val(strId).text(strNhan || strId));
                edu.util.viewValById(cfg.drop, strId || '');
            },
            reset: function () {
                edu.util.viewValById(cfg.txt, '');
                self.datNguoi('', '');
                datHint(strHintMacDinh);
            },
            layId: function () {
                return edu.util.getValById(cfg.drop);
            },
            tim: function () {
                var strTuKhoa = $.trim(edu.util.getValById(cfg.txt));
                if (strTuKhoa.length < 2) {
                    canhBao('Nhập ít nhất 2 ký tự để tìm người dùng.');
                    return;
                }
                var strDangChon = self.layId();
                var strNhanDangChon = $('#' + cfg.drop + ' option:selected').text();
                PQ.timNguoiDung(strTuKhoa, iToiDa, function (items, strLoi) {
                    if (strLoi) {
                        canhBao(strLoi);
                        return;
                    }
                    var ds = $.map(items, function (r) { return { ID: r.ID, TEN: r.LABEL }; });
                    // Người đang chọn (nếu không nằm trong kết quả mới) vẫn được giữ lại ở đầu danh sách
                    if (strDangChon && !$.grep(ds, function (r) { return r.ID === strDangChon; }).length) {
                        ds.unshift({ ID: strDangChon, TEN: strNhanDangChon });
                    }
                    PQ.loadCombo([cfg.drop], ds, '-- Chọn người dùng (' + items.length + ' kết quả) --');
                    if (strDangChon) edu.util.viewValById(cfg.drop, strDangChon);
                    else if (items.length === 1) edu.util.viewValById(cfg.drop, items[0].ID);
                    if (items.length === 0) datHint('Không tìm thấy người dùng nào khớp "' + strTuKhoa + '".');
                    else if (items.length >= iToiDa) datHint('Hiển thị ' + items.length + ' người đầu tiên — có thể còn thêm, hãy thu hẹp từ khóa.');
                    else datHint('Tìm thấy ' + items.length + ' người dùng.');
                });
            }
        };
        $('#' + cfg.btn).click(function () { self.tim(); });
        // Enter bị chặn toàn cục ở sự kiện keypress (systemroot.js) nên bắt ở keyup
        $('#' + cfg.txt).on('keyup', function (e) { if (e.which === 13) self.tim(); });
        return self;
    },

    // Danh mục vai trò hệ thống (hàm chuẩn của module vai trò ở ApisCMS) → [{MA, TEN}] (MA = MAVAITRO, TEN = TENVAITRO); lỗi thì []
    loadVaiTro: function (fnDone) {
        PQ.call(PQ.API.VAITRO_LAYDS, {
            'strLoaiVaiTro_Id': '', 'strTuKhoa': '', 'pageIndex': 1, 'pageSize': 5000,
            'dTrangThai': 1, 'strChung_VaiTro_Cha_Id': ''
        }, function (data) {
            var dt = (data.Success && data.Data) ? data.Data : [];
            if (!data.Success && window.console) console.warn('[pq] LayDanhSachVaiTro:', data.Message);
            if (dt.length > 0 && PQ.g(dt[0], 'MAVAITRO') === '' && window.console) {
                console.warn('[pq] LayDanhSachVaiTro không có cột MAVAITRO — các cột nhận được:', Object.keys(dt[0]));
            }
            fnDone($.map(dt, function (r) { return { MA: PQ.g(r, 'MAVAITRO'), TEN: PQ.g(r, 'TENVAITRO') }; }));
        }, function () {
            if (window.console) console.warn('[pq] Không nạp được danh mục vai trò.');
            fnDone([]);
        });
    },

    // Danh mục chức năng của TOÀN HỆ THỐNG (mọi ứng dụng) kèm tên ứng dụng để phân biệt chức năng trùng tên.
    // → [{ID, TEN, MA, UD, LABEL}] đã sắp theo ứng dụng rồi tên; lỗi thì [].
    // LABEL = "Ứng dụng › Tên chức năng (mã)".
    loadChucNang: function (fnDone) {
        var dtCn = null, mapUd = null;
        function xong() {
            if (dtCn === null || mapUd === null) return;
            var items = $.map(dtCn, function (r) {
                var ten = PQ.g(r, 'TENCHUCNANG'), ma = PQ.g(r, 'MACHUCNANG');
                var idUd = PQ.g(r, 'CHUNG_UNGDUNG_ID');
                var ud = (idUd !== '' && PQ.has(mapUd, idUd)) ? mapUd[idUd] : '';
                return {
                    ID: PQ.g(r, 'ID'), TEN: ten, MA: ma, UD: ud,
                    LABEL: (ud ? ud + ' › ' : '') + ten + (ma ? ' (' + ma + ')' : '')
                };
            });
            items.sort(function (a, b) {
                return (a.UD + '\u0000' + a.TEN).localeCompare(b.UD + '\u0000' + b.TEN, 'vi');
            });
            fnDone(items);
        }
        PQ.call(PQ.API.CHUCNANG_LAYDS, {
            'strTuKhoa': '', 'strChung_UngDung_Id': '', 'strCHUCNANGCHA_Id': '',
            'pageIndex': 1, 'pageSize': 5000, 'strNGUONTRUYCAP_Id': '', 'dTrangThai': 1
        }, function (data) {
            dtCn = (data.Success && data.Data) ? data.Data : [];
            if (!data.Success && window.console) console.warn('[pq] LayDanhSachChucNang:', data.Message);
            if (dtCn.length > 0 && PQ.g(dtCn[0], 'ID') === '' && window.console) {
                console.warn('[pq] LayDanhSachChucNang không có cột ID — các cột nhận được:', Object.keys(dtCn[0]));
            }
            xong();
        }, function () {
            if (window.console) console.warn('[pq] Không nạp được danh mục chức năng.');
            dtCn = [];
            xong();
        });
        PQ.call(PQ.API.UNGDUNG_LAYDS, {
            'strTuKhoa': '', 'pageIndex': 1, 'pageSize': 1000, 'dTrangThai': 1
        }, function (data) {
            var dt = (data.Success && data.Data) ? data.Data : [];
            mapUd = {};
            $.each(dt, function (i, r) { mapUd[PQ.g(r, 'ID')] = PQ.g(r, 'TENUNGDUNG'); });
            xong();
        }, function () {
            mapUd = {};   // thiếu tên ứng dụng thì nhãn chỉ không có tiền tố, không chặn màn hình
            xong();
        });
    },

    // Đổ danh mục [{ID, TEN}] vào các ô chọn: value = ID, hiển thị = TEN (đã tự escape)
    loadCombo: function (arrId, items, strTitle) {
        edu.system.loadToCombo_data({
            data: items,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "ID",
                mRender: function (j, r) { return PQ.esc(r.TEN); }
            },
            renderPlace: arrId,
            title: strTitle
        });
    },

    // Đổ danh mục {MA, TEN} vào các ô chọn, hiển thị "TEN (MA)" theo chuẩn dự án
    loadCombo_MaTen: function (arrId, dt, strTitle) {
        edu.system.loadToCombo_data({
            data: dt,
            renderInfor: {
                id: "MA",
                parentId: "",
                name: "TEN",
                code: "MA",
                mRender: function (j, r) {
                    return r.TEN ? PQ.esc(r.TEN) + " (" + PQ.esc(r.MA) + ")" : PQ.esc(r.MA);
                }
            },
            renderPlace: arrId,
            title: strTitle
        });
    }
};
