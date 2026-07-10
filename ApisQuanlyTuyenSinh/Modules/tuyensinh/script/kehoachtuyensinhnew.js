/*----------------------------------------------
--Author:
--Date of created: 06/05/2026
--Note: Kế hoạch tuyển sinh (giao diện mới)
----------------------------------------------*/
function KeHoachTuyenSinhNew() { };
KeHoachTuyenSinhNew.prototype = {
    dtLoaiTuyenSinh: [],
    dtPhuongAnTuyenSinh: [],
    dtTinhTrangKeHoach: [],
    dtKeHoachTuyenSinh: [],
    dtCoCauToChuc: [],
    strKeHoachTuyenSinh_Id: '',
    dtChiTiet: null,
    dtKieuDot: [],
    dtTinhTrangDot: [],
    dtDotTuyenSinh: [],
    strDot_Id: '',
    dtChiTietDot: null,
    dtPhanCongNhanSu: [],
    strPhanCong_Id: '',
    dtChiTietPhanCong: null,
    dtVaiTro_PhanCong: [],
    dtKeHoachDauRa: [],
    strDauRa_Id: '',
    strDot_Id_ForDauRa: '',   // Đợt ID nếu Kế hoạch đầu ra được mở từ context Đợt tuyển sinh
    dtChiTietDauRa: null,
    dtHeDaoTao_DR: [],
    dtKhoaDaoTao_DR: [],
    dtChuongTrinh_DR: [],
    dtLoaiDauRa: [],
    dtKieuHocTap: [],
    dtTrangThaiDauRa: [],

    // Kết quả đăng ký (Import trúng tuyển)
    strDot_Id_ForKQ: '',   // Đợt ID khi mở KQĐK từ bảng đợt (context Đợt); rỗng nếu mở từ bảng KH
    _importCancelled: false,
    _khaiDMLoaded: false,  // danh mục form khai đã nạp lần đầu chưa (lazy)
    dtKQDK_HoSo: [],       // cache raw danh sách hồ sơ để filter local + export Excel
    strSuaHoSo_Id: '',     // ID hồ sơ đang sửa qua form Khai (chế độ Sửa)

    init: function () {
        var me = this;
        edu.system.page_load();

        /*------------------------------------------
        -- Load combo filter + danh sách kế hoạch
        -------------------------------------------*/
        me.getList_LoaiTuyenSinh();
        me.getList_PhuongAnTuyenSinh();
        me.getList_TinhTrangKeHoach();
        me.getList_KieuDot();
        me.getList_TinhTrangDot();
        me.getList_VaiTro_PhanCong();
        me.getList_LoaiDauRa();
        me.getList_KieuHocTap();
        me.getList_TrangThaiDauRa();
        me.getList_CoCauToChuc();
        me.getList_KeHoachTuyenSinh();

        /*------------------------------------------
        -- Action
        -------------------------------------------*/
        $("#btnSearch").click(function () {
            me.getList_KeHoachTuyenSinh();
        });

        $("#txtSearch_TuKhoa, #txtSearch_NamTuyenSinh, #txtSearch_NamHoc, #txtSearch_HocKy")
            .keypress(function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    me.getList_KeHoachTuyenSinh();
                }
            });

        $("#tblKHtyensinh").delegate(".btnDetail", "click", function () {
            var strId = $(this).attr('data-id');
            if (edu.util.checkValue(strId)) {
                me.strKeHoachTuyenSinh_Id = strId;
                me.getDetail_KeHoachTuyenSinh(strId);
                // Chế độ Xem-sửa: hiện nút Xóa, đổi title
                $('#chi-tiet .modal-header .title').html('<i class="fa-regular fa-pen-to-square"></i> Xem - sửa kế hoạch tuyển sinh');
                $('#btnDelete_KH').removeClass('d-none');
            }
        });

        // Click "Thêm mới" main page → mở #chi-tiet ở chế độ Thêm mới
        $("#btnAddKeHoach").click(function () {
            me.strKeHoachTuyenSinh_Id = '';
            me.rewrite_KeHoach();
        });

        // Đọc data-id từ event.relatedTarget (Bootstrap 5) để tránh race với click handler riêng.
        // Trước đây dùng delegate("click") set ID + on("show.bs.modal") load → thứ tự không đảm bảo,
        // lần mở đầu tiên hay bị empty vì show.bs.modal fire trước.
        $("#dot-tuyen-sinh").on('show.bs.modal', function (event) {
            var $btn = $(event.relatedTarget);
            if ($btn.length && $btn.attr('data-id')) {
                me.strKeHoachTuyenSinh_Id = $btn.attr('data-id');
            }
            me.getList_DotTuyenSinh();
        });

        $("#phan-cong-nhan-su").on('show.bs.modal', function (event) {
            var $btn = $(event.relatedTarget);
            if ($btn.length && $btn.attr('data-id')) {
                me.strKeHoachTuyenSinh_Id = $btn.attr('data-id');
            }
            me.getList_PhanCongNhanSu();
        });

        $("#ke-hoach-dau-ra").on('show.bs.modal', function (event) {
            var $btn = $(event.relatedTarget);
            if ($btn.length && $btn.attr('data-id')) {
                var strId = $btn.attr('data-id');
                // Context detection: nếu nút "Xem" nằm trong modal #dot-tuyen-sinh
                // thì data-id là Đợt ID, KH TS ID đã set từ click trước đó — không ghi đè.
                var isDotContext = $btn.closest('#dot-tuyen-sinh').length > 0;
                if (isDotContext) {
                    // Mức đợt: cho phép thêm mới đầu ra
                    me.strDot_Id_ForDauRa = strId;
                    $("#btnAddKeHoachDauRa").removeClass('d-none');
                } else {
                    // Mức KH tuyển sinh: chỉ cho xem + sửa, KHÔNG cho thêm
                    // (đầu ra phải thêm từ đợt cụ thể)
                    me.strKeHoachTuyenSinh_Id = strId;
                    me.strDot_Id_ForDauRa = '';
                    $("#btnAddKeHoachDauRa").addClass('d-none');
                }
            }
            me.getList_KeHoachDauRa();
        });

        // Modal Thêm mới kế hoạch đầu ra: cascading Hệ → Khóa → Chương trình
        $("#them-moi-dau-ra").on('show.bs.modal', function () {
            me.rewrite_DauRa();
            me.getList_HeDaoTao_DR();
        });
        $("#ddlDR_HeDaoTao").on('change', function () {
            $("#ddlDR_KhoaDaoTao").html('<option value="">Chọn khóa đào tạo</option>');
            $("#tblChuongTrinhDauRa tbody").html("");
            if ($(this).val()) me.getList_KhoaDaoTao_DR();
        });
        $("#ddlDR_KhoaDaoTao").on('change', function () {
            $("#tblChuongTrinhDauRa tbody").html("");
            if ($(this).val()) me.getList_ChuongTrinh_DR();
        });
        $("#chkDR_SelectAll").click(function () {
            var checked = $(this).is(':checked');
            $('#tblChuongTrinhDauRa tbody .ct-select').prop('checked', checked);
        });

        // Arrow-key + Enter navigation cho 3 cột input chỉ tiêu (Excel-like grid)
        $("#tblChuongTrinhDauRa").on('keydown', 'tbody input[type="number"]', function (e) {
            var key = e.which || e.keyCode;
            // 37=Left, 38=Up, 39=Right, 40=Down, 13=Enter
            if ([37, 38, 39, 40, 13].indexOf(key) === -1) return;

            var $this = $(this);
            var $row = $this.closest('tr');
            var $allRows = $row.parent().children('tr');
            var rowIdx = $allRows.index($row);
            var colInputs = ['ct-chitieu', 'ct-chitieu-toida', 'ct-chitieu-toithieu'];
            var colIdx = -1;
            for (var c = 0; c < colInputs.length; c++) {
                if ($this.hasClass(colInputs[c])) { colIdx = c; break; }
            }
            if (colIdx === -1) return;

            var newRowIdx = rowIdx;
            var newColIdx = colIdx;

            if (key === 38) {                              // Up
                newRowIdx--;
            } else if (key === 40 || key === 13) {         // Down / Enter
                newRowIdx++;
            } else if (key === 37) {                       // Left
                newColIdx--;
                if (newColIdx < 0) { newColIdx = colInputs.length - 1; newRowIdx--; }
            } else if (key === 39) {                       // Right
                newColIdx++;
                if (newColIdx >= colInputs.length) { newColIdx = 0; newRowIdx++; }
            }

            if (newRowIdx < 0 || newRowIdx >= $allRows.length) return;

            e.preventDefault();
            var $target = $allRows.eq(newRowIdx).find('.' + colInputs[newColIdx]);
            if ($target.length) {
                $target.focus().select();
            }
        });

        $("#btnSaveDauRa").click(function () {
            me.save_DauRa();
        });

        $("#btnUpdate_DauRa").click(function () {
            me.update_DauRa();
        });
        $("#btnDelete_DauRa").click(function () {
            if (!edu.util.checkValue(me.strDauRa_Id)) {
                edu.system.alert("Chưa chọn đầu ra để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa đầu ra này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_DauRa();
            });
        });

        // Modal Xem-sửa đầu ra: đọc data-id từ event.relatedTarget thay vì click delegate
        // để tránh race với stacked modal #ke-hoach-dau-ra.
        $("#xem-sua-dau-ra").on('show.bs.modal', function (event) {
            var $btn = $(event.relatedTarget);
            var strId = $btn.length ? $btn.attr('data-id') : '';
            if (strId) {
                me.strDauRa_Id = strId;
                me.getDetail_DauRa(strId);
            }
        });

        // Modal Xem-sửa phân công: đọc data-id từ event.relatedTarget (cùng pattern Đầu ra)
        $("#xem-sua-phancong").on('show.bs.modal', function (event) {
            var $btn = $(event.relatedTarget);
            var strId = $btn.length ? $btn.attr('data-id') : '';
            if (strId) {
                me.strPhanCong_Id = strId;
                me.getDetail_PhanCong(strId);
            }
        });

        $("#btnUpdate_PhanCong").click(function () {
            me.update_PhanCong();
        });

        $("#btnDelete_PhanCong").click(function () {
            if (!edu.util.checkValue(me.strPhanCong_Id)) {
                edu.system.alert("Chưa chọn phân công để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa phân công này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_PhanCong();
            });
        });

        // Modal Thêm mới phân công nhân sự — reset form mỗi lần mở (trừ khi reopen từ picker)
        $("#them-moi-nhansu").on('show.bs.modal', function () {
            if (me._skipResetPhanCong) {
                me._skipResetPhanCong = false;
                return;
            }
            me.rewrite_PhanCong();
        });

        // Picker shared toàn hệ thống: edu.extend.genModal_NhanSu(callback) + getList_NhanSu()
        // Pattern an toàn cho stacked modal: hide parent #them-moi-nhansu khi mở picker,
        // show lại khi picker đóng. Tránh xung đột backdrop của Bootstrap 5 với modal-fullscreen.
        $("#btnChonNhanSu").click(function () {
            // Hide parent modal trước (giữ DOM/data nguyên vẹn)
            $('#them-moi-nhansu').modal('hide');

            var pickerHandled = false;
            edu.extend.genModal_NhanSu(function (arrChecked_Id) {
                pickerHandled = true;  // → khỏi cần xử lý "hidden" để tránh double-show parent
                var dt = edu.extend.dtNhanSu || [];
                var arrPersons = [];
                if (arrChecked_Id && arrChecked_Id.length) {
                    // Loại ID đã có trong bảng để tránh trùng
                    var existing = {};
                    $("#tblNhanSuDaChon tbody tr").each(function () {
                        existing[$(this).attr('data-person-id')] = true;
                    });
                    for (var i = 0; i < arrChecked_Id.length; i++) {
                        var id = arrChecked_Id[i];
                        if (existing[id]) continue;
                        var ns = dt.find ? dt.find(function (e) { return e.ID == id; }) : null;
                        if (!ns) continue;
                        arrPersons.push({
                            ID: ns.ID,
                            FULL_NAME: ns.HOTEN || '',
                            current_employee_code: ns.MASO || ''
                        });
                    }
                }
                // Reopen parent (skip rewrite để giữ table + form chung user đã khai)
                // Append NS rows SAU khi modal show xong.
                me._skipResetPhanCong = true;
                setTimeout(function () {
                    $('#them-moi-nhansu').modal('show');
                    if (arrPersons.length) me.addNhanSu_PhanCong(arrPersons);
                }, 200);
            });
            // Nếu user đóng picker mà không chọn → reopen parent, cũng skip rewrite
            $('#modal_nhansu').one('hidden.bs.modal', function () {
                if (!pickerHandled) {
                    me._skipResetPhanCong = true;
                    setTimeout(function () { $('#them-moi-nhansu').modal('show'); }, 50);
                }
            });

            // Wire nút "Thêm từng đơn vị": chọn CCTC ở dropdown → add toàn bộ NS thuộc các đơn vị đó
            $("#modal_nhansu").off('click.addCCTC', '#btnAdd_TungDonVi')
                .on('click.addCCTC', '#btnAdd_TungDonVi', function () {
                    var arrCCTC = $("#dropSearchModal_CCTC_NS").val();
                    if (!arrCCTC || !arrCCTC.length) {
                        edu.system.alert("Vui lòng chọn đơn vị từ dropdown trước", "w");
                        return;
                    }
                    var obj_req = {
                        action: 'NS_HoSo_V2_MH/DSA4BRIPKSAvEjQeCS4SLh43cwPP',
                        func: 'pkg_nhansu_hoso_v2.LayDSNhanSu_HoSo_v2',
                        iM: edu.system.iM,
                        strTuKhoa: '',
                        strDaoTao_CoCauToChuc_Id: arrCCTC.toString(),
                        strChucVu_Id: '',
                        strTinhTrangNhanSu_Id: '',
                        dLaCanBoNgoaiTruong: 0,
                        pageIndex: 1,
                        pageSize: 100000,
                        strNguoiThucHien_Id: edu.system.userId,
                        strVaiTroDangNhap_Id: edu.system.strVaiTro_Id || '',
                        strChucNangHeThong_Id: edu.system.strChucNang_Id || ''
                    };
                    edu.system.makeRequest({
                        success: function (data) {
                            if (!data.Success) {
                                edu.system.alert(data.Message || "Lỗi khi lấy DS nhân sự", "w");
                                return;
                            }
                            var arrNS = edu.util.checkValue(data.Data) ? data.Data : [];
                            // Loại trùng với NS đã có trong bảng parent
                            var existing = {};
                            $("#tblNhanSuDaChon tbody tr").each(function () {
                                existing[$(this).attr('data-person-id')] = true;
                            });
                            var arrPersons = [];
                            for (var i = 0; i < arrNS.length; i++) {
                                var ns = arrNS[i];
                                if (!ns || !ns.ID || existing[ns.ID]) continue;
                                existing[ns.ID] = true;
                                arrPersons.push({
                                    ID: ns.ID,
                                    FULL_NAME: ns.HOTEN || '',
                                    current_employee_code: ns.MASO || ''
                                });
                            }
                            // Đóng picker, reopen parent
                            pickerHandled = true;
                            $("#modal_nhansu").modal("hide");
                            me._skipResetPhanCong = true;
                            setTimeout(function () {
                                $('#them-moi-nhansu').modal('show');
                                if (arrPersons.length) {
                                    me.addNhanSu_PhanCong(arrPersons);
                                    edu.system.alert("Đã thêm " + arrPersons.length + " nhân sự từ " + arrCCTC.length + " đơn vị", "s");
                                } else {
                                    edu.system.alert("Không có nhân sự mới (có thể đã trùng hoặc đơn vị rỗng)", "i");
                                }
                            }, 200);
                        },
                        error: function (er) {
                            edu.system.alert("LayDSNhanSu (ex): " + JSON.stringify(er), "w");
                        },
                        type: 'POST',
                        contentType: true,
                        action: obj_req.action,
                        data: obj_req,
                        fakedb: []
                    }, false, false, false, null);
                });

            // Default filter: cán bộ trong trường
            $('#dropSearchModal_CB_NS').val('0');
            edu.extend.getList_NhanSu();
        });

        // Master checkbox "Chọn all"
        $("#chkPC_SelectAll").click(function () {
            var checked = $(this).is(':checked');
            $('#tblNhanSuDaChon tbody .pc-select').prop('checked', checked);
        });

        $("#btnSavePhanCong").click(function () {
            me.save_PhanCong();
        });

        // Modal đợt: reset form rồi check trigger có data-id (Chi tiết) → fetch detail.
        // Dùng event.relatedTarget thay vì click delegate riêng để tránh race với stacked modal.
        $("#them-moi-dot").on('show.bs.modal', function (event) {
            me.rewrite_Dot();
            var $btn = $(event.relatedTarget);
            var strId = $btn.length ? $btn.attr('data-id') : '';
            if (strId && $btn.hasClass('btnDetailDot')) {
                me.strDot_Id = strId;
                me.getDetail_Dot(strId);
            }
        });

        $("#btnSaveDot").click(function () {
            me.save_Dot();
        });

        $("#btnDelete_Dot").click(function () {
            if (!edu.util.checkValue(me.strDot_Id)) {
                edu.system.alert("Chưa chọn đợt để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa đợt này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_Dot();
            });
        });

        $("#btnUpdate_KH").click(function () {
            me.save_KeHoachTuyenSinh();
        });

        $("#btnDelete_KH").click(function () {
            if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
                edu.system.alert("Chưa chọn kế hoạch để xóa", "w");
                return;
            }
            edu.system.confirm("Bạn có chắc chắn xóa kế hoạch này không?");
            $("#btnYes").off("click").on("click", function () {
                me.delete_KeHoachTuyenSinh();
            });
        });

        /*------------------------------------------
        -- Modal "Kết quả đăng ký" — Import trúng tuyển + Khai trực tiếp
        -- Context detection giống #ke-hoach-dau-ra:
        --   - Mở từ modal #dot-tuyen-sinh → data-id là Đợt ID, giữ nguyên KH ID
        --   - Mở từ table chính        → data-id là KH ID
        -------------------------------------------*/
        $("#ket-qua-dk").on('show.bs.modal', function (event) {
            var $btn = $(event.relatedTarget);
            me.resetKQDK_View();

            // 1) Context KH/Đợt — chỉ set khi nút mang data-id (nút Xem trong row).
            //    Nút footer modal Đợt KHÔNG có data-id → giữ nguyên context KH đã có,
            //    reset đợt vì scope là toàn bộ KH.
            if ($btn.length) {
                var strId = $btn.attr('data-id');
                if (strId) {
                    var isDotContext = $btn.closest('#dot-tuyen-sinh').length > 0;
                    if (isDotContext) {
                        me.strDot_Id_ForKQ = strId;
                    } else {
                        me.strKeHoachTuyenSinh_Id = strId;
                        me.strDot_Id_ForKQ = '';
                    }
                } else if ($btn.closest('#dot-tuyen-sinh').length > 0) {
                    me.strDot_Id_ForKQ = '';
                }
            }

            // 2) Chọn screen theo data-open-mode:
            //    'import' → Import Excel
            //    'khai'   → Form Khai trực tiếp
            //    default  → Danh sách hồ sơ (khi bấm "Xem" từ row Kết quả đăng ký)
            var mode = $btn.length ? $btn.attr('data-open-mode') : '';
            $('#kqdk_list, #kqdk_import, #kqdk_khai').addClass('d-none');
            if (mode === 'import') {
                $('#kqdk_import').removeClass('d-none');
            } else if (mode === 'khai') {
                $('#kqdk_khai').removeClass('d-none');
                me._exitSuaMode();   // ensure Thêm mới mode, banner ẩn, save btn "Lưu hồ sơ"
                me.initKhai_DanhMuc();
                // Nguyện vọng đầu ra phụ thuộc Đợt hiện tại → refresh mỗi lần mở
                me._loadNguyenVongDauRa();
            } else {
                $('#kqdk_list').removeClass('d-none');
                // Preload các DM cần lookup cho list (Giới tính) — chạy 1 lần
                me._preloadDMForList();
                me.loadKQDK_List();
            }
        });

        // Toolbar list: search / reload / export / select all
        $('#btnKQDK_Search').click(function () { me.filterKQDK_HoSo(); });
        $('#txtKQDK_Search').on('keypress', function (e) {
            if (e.which === 13) { e.preventDefault(); me.filterKQDK_HoSo(); }
        });
        $('#btnKQDK_Reload').click(function () {
            $('#txtKQDK_Search').val('');
            me.loadKQDK_List();
        });
        $('#btnKQDK_Export').click(function () { me.exportKQDK_Excel(); });
        $('#chkKQDK_All').click(function () {
            $('#tblKQDK_HoSo tbody .kqdk-sel').prop('checked', $(this).is(':checked'));
        });

        // Delegate: nút Sửa / Xóa trên từng row hồ sơ
        $('#tblKQDK_HoSo').on('click', '.btnSuaHoSo', function () {
            me.openSuaHoSo($(this).attr('data-id'));
        });
        $('#tblKQDK_HoSo').on('click', '.btnXoaHoSo', function () {
            var id = $(this).attr('data-id');
            if (!edu.util.checkValue(id)) return;
            edu.system.confirm("Bạn có chắc chắn xóa hồ sơ này không?");
            $("#btnYes").off("click").on("click", function () {
                me.deleteHoSo_TS(id);
            });
        });

        // Click tab bar (style aps-sv-tab): toggle class active + hiện panel tương ứng
        $('#kqdkKhaiTabs').on('click', '.aps-sv-tab', function () {
            var target = $(this).attr('data-target');
            $('#kqdkKhaiTabs .aps-sv-tab').removeClass('active');
            $(this).addClass('active');
            $('#kqdk_khai .aps-sv-panel').removeClass('active');
            $('#' + target).addClass('active');
        });

        // Tabs Prev/Next dựa vào class active của .aps-sv-tab
        $("#btnKhaiPrev").click(function () {
            var $tabs = $('#kqdkKhaiTabs .aps-sv-tab');
            var i = $tabs.index($tabs.filter('.active'));
            if (i > 0) $tabs.eq(i - 1).trigger('click');
        });
        $("#btnKhaiNext").click(function () {
            var $tabs = $('#kqdkKhaiTabs .aps-sv-tab');
            var i = $tabs.index($tabs.filter('.active'));
            if (i < $tabs.length - 1) $tabs.eq(i + 1).trigger('click');
        });

        $("#btnKhaiReset").click(function () {
            me.resetKhai_HoSo();
        });
        $("#btnKhaiSave").click(function () {
            me.saveKhai_HoSo();
        });

        // Reset chế độ Sửa mỗi khi đóng modal Kết quả đăng ký (banner ẩn, nút Save về nhãn gốc)
        $("#ket-qua-dk").on('hidden.bs.modal', function () {
            me._exitSuaMode();
        });

        // Tự tính tổng điểm khi user nhập điểm môn/UT
        $("#kqdk_tab_xettuyen").on('input', '.kq-diem, .kq-diem-ut', function () {
            me.tinhTongDiem_Khai();
        });

        $("#fileImportTT").on('change', function () {
            var f = this.files && this.files[0];
            if (!f) {
                $("#lblImportFileInfo").text('');
                $("#btnStartImportTT").prop('disabled', true);
                return;
            }
            $("#lblImportFileInfo").text('Đã chọn: ' + f.name + ' (' + (f.size / 1024).toFixed(1) + ' KB)');
            $("#btnStartImportTT").prop('disabled', false);
            $("#tblImportTT_Log tbody").html('');
        });

        $("#btnStartImportTT").click(function () {
            me.startImport_TrungTuyen();
        });
        $("#btnCancelImportTT").click(function () {
            me._importCancelled = true;
        });
    },

    /*------------------------------------------
    -- Reset trạng thái nội bộ modal #ket-qua-dk (Import counters, file, log).
    -- Visibility screen do handler show.bs.modal quyết định theo data-open-mode.
    -------------------------------------------*/
    resetKQDK_View: function () {
        // reset import state
        $('#fileImportTT').val('').prop('disabled', false);
        $('#lblImportFileInfo').text('');
        $('#tblImportTT_Log tbody').html('');
        $('#importProgressWrap').addClass('d-none');
        $('#btnStartImportTT').prop('disabled', true);
        $('#btnCancelImportTT').addClass('d-none');
        $('#lblImportProgress').text('0 / 0');
        $('#lblImportOK, #lblImportErr').text('0');
        $('#importProgressBar').css('width', '0%').text('0%');
    },

    /*------------------------------------------
    -- Import trúng tuyển: parse Excel/CSV (SheetJS) → chạy tuần tự
    -- Origin: PKG_CORE_TS_HOSO_IMPORT.Them_HoSo_TS
    -- Guard: cần strKeHoachTuyenSinh_Id + XLSX đã load + có file
    -------------------------------------------*/
    startImport_TrungTuyen: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Chưa xác định kế hoạch tuyển sinh (mở lại từ danh sách kế hoạch/đợt)", "w");
            return;
        }
        if (typeof XLSX === 'undefined') {
            edu.system.alert("Thư viện đọc Excel chưa load xong, vui lòng thử lại sau 1-2 giây", "w");
            return;
        }
        var el = $('#fileImportTT')[0];
        var f = el && el.files && el.files[0];
        if (!f) {
            edu.system.alert("Vui lòng chọn file", "w");
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var rows = [];
            try {
                var wb = XLSX.read(e.target.result, { type: 'array', cellDates: true, cellNF: false });
                var ws = wb.Sheets[wb.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
            } catch (ex) {
                edu.system.alert("Không đọc được file: " + (ex && ex.message ? ex.message : ex), "w");
                return;
            }
            if (!rows.length) {
                edu.system.alert("File không có dữ liệu (hàng 1 phải là header)", "w");
                return;
            }

            me._importCancelled = false;
            $('#btnStartImportTT').prop('disabled', true);
            $('#btnCancelImportTT').removeClass('d-none');
            $('#fileImportTT').prop('disabled', true);
            $('#importProgressWrap').removeClass('d-none');
            $('#tblImportTT_Log tbody').html('');
            me._runImport(rows);
        };
        reader.onerror = function () {
            edu.system.alert("Lỗi đọc file", "w");
        };
        reader.readAsArrayBuffer(f);
    },

    /*------------------------------------------
    -- Chạy tuần tự từng row (recursion). Đợi response mỗi row rồi mới next
    -- → tránh overload backend + log tuần tự dễ đọc.
    -------------------------------------------*/
    _runImport: function (rows) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var total = rows.length, idx = 0, ok = 0, err = 0;
        var $bar = $('#importProgressBar');

        var updateProgress = function () {
            var pct = total ? Math.round((idx / total) * 100) : 0;
            $bar.css('width', pct + '%').text(pct + '%');
            $('#lblImportProgress').text(idx + ' / ' + total);
            $('#lblImportOK').text(ok);
            $('#lblImportErr').text(err);
        };

        var finish = function () {
            $('#btnStartImportTT').prop('disabled', false);
            $('#btnCancelImportTT').addClass('d-none');
            $('#fileImportTT').prop('disabled', false);
            var kind = (err === 0 && !me._importCancelled) ? 's' : 'i';
            edu.system.alert("Đã xử lý " + idx + "/" + total + " (OK: " + ok + ", lỗi: " + err + ")"
                + (me._importCancelled ? " — đã dừng" : ""), kind);
        };

        var next = function () {
            if (me._importCancelled) { finish(); return; }
            if (idx >= total) { finish(); return; }
            var rowNo = idx + 2; // hàng 1 là header → dữ liệu từ hàng 2
            var row = rows[idx];
            var payload = me._buildImportPayload(row, rowNo);
            edu.system.makeRequest({
                success: function (data) {
                    idx++;
                    if (data && data.Success) {
                        ok++;
                        me._appendLog(rowNo, row, 'ok', 'Thành công');
                    } else {
                        err++;
                        me._appendLog(rowNo, row, 'err', (data && data.Message) || 'Lỗi không xác định');
                    }
                    updateProgress();
                    next();
                },
                error: function (er) {
                    idx++;
                    err++;
                    var msg = 'HTTP lỗi';
                    if (er && er.statusText) msg = 'HTTP ' + (er.status || '') + ' ' + er.statusText;
                    else if (er) { try { msg = JSON.stringify(er); } catch (e) { } }
                    me._appendLog(rowNo, row, 'err', msg);
                    updateProgress();
                    next();
                },
                type: 'POST',
                contentType: true,
                action: payload.action,
                data: payload,
                fakedb: []
            }, false, false, false, null);
        };
        updateProgress();
        next();
    },

    /*------------------------------------------
    -- Ghép payload gọi Them_HoSo_TS
    -- - Base: context (KH_TS_Id, Dot_Id) + user info + hành động THEM
    -- - File pass-through: header Excel = tên param API. Field không có trong file → ''
    -- - dHoSo_Import_Row_No: chỉ số hàng trong file (để backend log lại)
    -------------------------------------------*/
    _buildImportPayload: function (row, rowNo) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var payload = {
            'action': 'SV_Core_TS_HoSo_Import_MH/FSkkLB4JLhIuHhUS',
            'func': 'PKG_CORE_TS_HOSO_IMPORT.Them_HoSo_TS',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'THEM',
            // Context KH/Đợt — luôn override từ modal, không lấy từ file
            'strHoSo_KH_TS_Id': me.strKeHoachTuyenSinh_Id || '',
            'strHoSo_KH_TS_Do_Id': me.strDot_Id_ForKQ || '',
            'dHoSo_Import_Row_No': rowNo
        };
        // Các field pass-through từ file — không được ghi đè context ở trên
        var apiFields = [
            'strCorePerson_HoTen', 'strCorePerson_Ho', 'strCorePerson_Dem', 'strCorePerson_Ten',
            'strCorePerson_NgaySinh', 'dCorePerson_NgayS', 'dCorePerson_ThangS', 'dCorePerson_NamS',
            'strCorePerson_GioiTinh_Ma',
            'strPersonProfile_DanToc_Ma', 'strPersonProfile_TonGiao_Ma', 'strPersonProfile_QuocTich_Ma',
            'strPersonContact_DienThoai', 'strPersonContact_Email',
            'strPersonIden_SoCCCD', 'strPersonIden_NgayCap', 'strPersonIden_NoiCap',
            'strPersonAddr_NS_Tinh_Ma', 'strPersonAddr_NS_Xa_Ma', 'strPersonAddr_NoiSinh',
            'strPersonAddr_HK_Tinh_Ma', 'strPersonAddr_HK_Xa_Ma', 'strPersonAddr_HK_SoNha',
            'strPersonEdu_Tinh_Id', 'strPersonEdu_TruongMaTen', 'strPersonEdu_HocLuc', 'strPersonEdu_HanhKiem',
            'strPersonFam_Bo_HoTen', 'dPersonFam_Bo_NamSinh', 'strPersonFam_Bo_NoiO', 'strPersonFam_Bo_SDT',
            'strPersonFam_Me_HoTen', 'dPersonFam_Me_NamSinh', 'strPersonFam_Me_NoiO', 'strPersonFam_Me_SDT',
            'strHoSo_KH_Dot_PT_Ma', 'strHoSo_DoiTuong_TS_Ma', 'strHoSo_DoiTuong_UT_Mas', 'strHoSo_KhuVuc_UT_Ma',
            'strHoSo_MaHoSo', 'strHoSo_SoBaoDanh', 'strHoSo_Import_Batch_Ma',
            'strNguyenVong_DauRa_Id', 'strMaNganhTrungTuyen', 'strMaCTDT',
            'strXetTuyen_TohopMon_Ma', 'strXetTuyen_TohopMon_Code', 'strXetTuyen_TohopMon_Ten',
            'dXetTuyen_DiemUuTien', 'dXetTuyen_DiemTongMon', 'dXetTuyen_DiemTongXT', 'strXT_Mon_Data',
            'strKetQua_QuyetDinh_Ma', 'strIntake_IntakeCode', 'strIntake_IntakeTypeCode',
            'strPersonInvoice_TypeLoai', 'strPersonInvoice_NguoiMua', 'strPersonInvoice_TenDonVi',
            'strPersonInvoice_MST', 'strPersonInvoice_MaQHNS', 'strPersonInvoice_SDT',
            'strPersonInvoice_DiaChi', 'strPersonInvoice_Email',
            'strPersonBank_HinhThucTT', 'strPersonBank_TenNganHang', 'strPersonBank_SoTaiKhoan',
            'strPersonBank_ChuTaiKhoan', 'strPersonBank_GhiChu',
            'strExtra_Person_Data', 'strExtra_HoSo_Data', 'strExtra_Intake_Data'
        ];
        for (var i = 0; i < apiFields.length; i++) {
            var f = apiFields[i];
            var v = row[f];
            payload[f] = (v === undefined || v === null) ? '' : (typeof v === 'string' ? v : String(v));
        }
        return payload;
    },

    /*------------------------------------------
    -- Log 1 row vào bảng tiến trình. Dùng prepend để row mới nổi lên đầu.
    -- Escape HTML bằng $('<div>').text().html() để tránh XSS từ file người dùng.
    -------------------------------------------*/
    _appendLog: function (rowNo, row, kind, msg) {
        var icon = kind === 'ok'
            ? '<i class="fa-solid fa-check color-success"></i>'
            : (kind === 'cancel'
                ? '<i class="fa-solid fa-ban" style="color:#999;"></i>'
                : '<i class="fa-solid fa-xmark color-red"></i>');
        var esc = function (s) { return $('<div>').text(s == null ? '' : s).html(); };
        var maHS = row.strHoSo_MaHoSo || row.strHoSo_SoBaoDanh || '';
        var hoTen = row.strCorePerson_HoTen || '';
        var html = '<tr>'
            + '<td class="td-center td-fix">' + rowNo + '</td>'
            + '<td class="td-left">' + esc(maHS) + '</td>'
            + '<td class="td-left">' + esc(hoTen) + '</td>'
            + '<td class="td-center">' + icon + '</td>'
            + '<td class="td-left">' + esc(msg) + '</td>'
            + '</tr>';
        $('#tblImportTT_Log tbody').prepend(html);
    },

    /*------------------------------------------
    -- Mở form Khai (6 tab) ở chế độ SỬA — reuse #kqdk_khai để user có UX nhất quán.
    -- Populate các field có trong cache dtKQDK_HoSo. Các field khác để trống (backend
    -- chưa có API get_by_id trả full data — nếu có, gọi trước rồi populate đầy đủ).
    -- API Sua_HoSo_TS chỉ update 9 field cơ bản → hiển thị banner cảnh báo.
    -- Flag _suaMode giúp saveKhai_HoSo dispatch sang Sua_HoSo_TS thay vì Them_HoSo_TS.
    -------------------------------------------*/
    openSuaHoSo: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(strId)) return;
        var pick = me._kqPick;
        var d = null;
        for (var i = 0; i < (me.dtKQDK_HoSo || []).length; i++) {
            var r = me.dtKQDK_HoSo[i];
            var rid = pick(r, ['HOSO_ID', 'ID', 'HoSo_Id', 'Id']);
            if (rid === strId) { d = r; break; }
        }
        if (!d) {
            edu.system.alert("Không tìm thấy hồ sơ trong cache — vui lòng Tải lại danh sách", "w");
            return;
        }

        me.strSuaHoSo_Id = strId;
        me._suaMode = true;

        // Reset form + init DM (lazy, chỉ chạy lần đầu)
        me.resetKhai_HoSo();
        me.initKhai_DanhMuc();
        me._loadNguyenVongDauRa();

        // Chuyển sang screen Khai
        $('#kqdk_list, #kqdk_import').addClass('d-none');
        $('#kqdk_khai').removeClass('d-none');

        // Hiện banner + đổi nhãn nút Save
        $('#kqdk_khai_edit_banner').removeClass('d-none');
        $('#btnKhaiSave').html('<i class="fa-light fa-floppy-disk"></i> Cập nhật hồ sơ');

        // Format ngày sinh cho input type=date (dd/mm/yyyy → yyyy-mm-dd)
        var ngaySinh = pick(d, ['COREPERSON_NGAYSINH', 'CorePerson_NgaySinh']);
        if (ngaySinh && /^(\d{2})\/(\d{2})\/(\d{4})/.test(ngaySinh)) {
            var m = ngaySinh.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
            if (m) ngaySinh = m[3] + '-' + m[2] + '-' + m[1];
        } else if (ngaySinh && /^(\d{4})-(\d{2})-(\d{2})/.test(ngaySinh)) {
            // Đã ISO — giữ nguyên
        }

        // Populate các field có từ cache
        $('#txtKQ_HoTen').val(pick(d, ['COREPERSON_HOTEN']));
        $('#txtKQ_NgaySinh').val(ngaySinh);
        $('#txtKQ_DienThoai').val(pick(d, ['PERSONCONTACT_DIENTHOAI']));
        $('#txtKQ_Email').val(pick(d, ['PERSONCONTACT_EMAIL']));
        $('#txtKQ_SoCCCD').val(pick(d, ['PERSONIDEN_SOCCCD']));
        $('#txtKQ_MaHoSo').val(pick(d, ['HOSO_MAHOSO']));
        $('#txtKQ_SBD').val(pick(d, ['HOSO_SOBAODANH']));
        $('#txtKQ_ToHopMa').val(pick(d, ['XETTUYEN_TOHOPMON_CODE']));
        $('#txtKQ_TongDiemXT').val(pick(d, ['XETTUYEN_DIEMTONGXT']));

        // Đợi DM giới tính + Nguyện vọng đầu ra populate xong rồi set value
        setTimeout(function () {
            $('#ddlKQ_GioiTinh').val(pick(d, ['COREPERSON_GIOITINH_ID']));
            $('#ddlKQ_NguyenVongDauRa').val(pick(d, ['NGUYENVONG_DAURA_ID']));
        }, 600);

        // Về tab 1
        $('#kqdkKhaiTabs .aps-sv-tab').first().trigger('click');
    },

    /*------------------------------------------
    -- Reset _suaMode + hide banner + restore save button label
    -------------------------------------------*/
    _exitSuaMode: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        me._suaMode = false;
        me.strSuaHoSo_Id = '';
        $('#kqdk_khai_edit_banner').addClass('d-none');
        $('#btnKhaiSave').html('<i class="fa-solid fa-floppy-disk"></i><span> Lưu hồ sơ</span>');
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_HOSO.Sua_HoSo_TS
    -- Action: SV_Core_TS_HoSo_MH/EjQgHgkuEi4eFRIP
    -- Đọc 9 field từ form Khai (ddlKQ_* / txtKQ_*) — các field khác trong form
    -- chỉ hiển thị (backend không nhận qua Sua_HoSo_TS).
    -------------------------------------------*/
    saveSuaHoSo_Full: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strSuaHoSo_Id)) {
            edu.system.alert("Chưa xác định hồ sơ để sửa", "w");
            return;
        }
        var hoTen = edu.system.getValById('txtKQ_HoTen');
        if (!edu.util.checkValue(hoTen)) {
            edu.system.alert("Vui lòng nhập Họ và tên", "w");
            $('#kqdkKhaiTabs .aps-sv-tab').first().trigger('click');
            $('#txtKQ_HoTen').focus();
            return;
        }
        var g = function (id) { return edu.system.getValById(id) || ''; };

        // Pack các field ngoài spec Sua_HoSo_TS vào Extra_Data JSON để không mất user input.
        // Backend cần parse strExtra_Data để lấy giá trị (khi mở rộng procedure).
        var extraObj = {
            DanToc_Id: g('ddlKQ_DanToc'),
            TonGiao_Id: g('ddlKQ_TonGiao'),
            QuocTich_Id: g('ddlKQ_QuocTich'),
            NgayCapCCCD: g('txtKQ_NgayCapCCCD'),
            NoiCapCCCD: g('txtKQ_NoiCapCCCD'),
            NS_Tinh_Id: g('ddlKQ_NS_Tinh'),
            NS_Huyen_Id: g('ddlKQ_NS_Huyen'),
            NS_Xa_Id: g('ddlKQ_NS_Xa'),
            NoiSinh: g('txtKQ_NoiSinh'),
            HK_Tinh_Id: g('ddlKQ_HK_Tinh'),
            HK_Huyen_Id: g('ddlKQ_HK_Huyen'),
            HK_Xa_Id: g('ddlKQ_HK_Xa'),
            HK_SoNha: g('txtKQ_HK_SoNha'),
            DoiTuong_TS_Id: g('ddlKQ_DoiTuongTS'),
            DoiTuong_UT_Ids: g('ddlKQ_DoiTuongUT'),
            KhuVuc_UT_Id: g('ddlKQ_KhuVucUT'),
            MaTinh12: g('txtKQ_MaTinh12'),
            TruongMaTen: g('txtKQ_TruongMaTen'),
            HocLuc: g('ddlKQ_HocLuc'),
            HanhKiem: g('ddlKQ_HanhKiem'),
            ToHopMon_Code: g('txtKQ_ToHopMa'),
            ToHopMon_Ten: g('txtKQ_ToHopTen'),
            Diem1: g('txtKQ_Diem1'),
            Diem2: g('txtKQ_Diem2'),
            Diem3: g('txtKQ_Diem3'),
            DiemUT: g('txtKQ_DiemUT'),
            TongDiemMon: g('txtKQ_TongDiemMon'),
            TongDiemXT: g('txtKQ_TongDiemXT'),
            Bo_HoTen: g('txtKQ_Bo_HoTen'),
            Bo_NamSinh: g('txtKQ_Bo_NamSinh'),
            Bo_NoiO: g('txtKQ_Bo_NoiO'),
            Bo_SDT: g('txtKQ_Bo_SDT'),
            Me_HoTen: g('txtKQ_Me_HoTen'),
            Me_NamSinh: g('txtKQ_Me_NamSinh'),
            Me_NoiO: g('txtKQ_Me_NoiO'),
            Me_SDT: g('txtKQ_Me_SDT'),
            QD_Ma: g('txtKQ_QDMa'),
            NguyenVong_DauRa_Id: g('ddlKQ_NguyenVongDauRa'),
            IntakeCode: g('txtKQ_IntakeCode'),
            IntakeTypeCode: g('txtKQ_IntakeTypeCode'),
            HD_DoiTuong: g('ddlKQ_HD_DoiTuong'),
            HD_NguoiMua: g('txtKQ_HD_NguoiMua'),
            HD_TenDonVi: g('txtKQ_HD_TenDonVi'),
            HD_MST: g('txtKQ_HD_MST'),
            HD_MaQHNS: g('txtKQ_HD_MaQHNS'),
            HD_SDT: g('txtKQ_HD_SDT'),
            HD_DiaChi: g('txtKQ_HD_DiaChi'),
            HD_Email: g('txtKQ_HD_Email'),
            Bank_HinhThucTT: g('ddlKQ_HD_HinhThucTT'),
            Bank_NganHang: g('txtKQ_HD_NganHang'),
            Bank_SoTK: g('txtKQ_HD_SoTK'),
            Bank_ChuTK: g('txtKQ_HD_ChuTK'),
            Bank_GhiChu: g('txtKQ_HD_GhiChu')
        };
        // Chỉ giữ field có giá trị để giảm size payload
        var extraFiltered = {};
        for (var k in extraObj) {
            if (extraObj[k]) extraFiltered[k] = extraObj[k];
        }

        var obj_save = {
            'action': 'SV_Core_TS_HoSo_MH/EjQgHgkuEi4eFRIP',
            'func': 'PKG_CORE_TS_HOSO.Sua_HoSo_TS',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA',
            'strHoSo_Id': me.strSuaHoSo_Id,
            'strCorePerson_HoTen': hoTen,
            'strCorePerson_NgaySinh': g('txtKQ_NgaySinh'),
            'strCorePerson_GioiTinh_Id': g('ddlKQ_GioiTinh'),
            'strPersonContact_DienThoai': g('txtKQ_DienThoai'),
            'strPersonContact_Email': g('txtKQ_Email'),
            'strPersonIden_SoCCCD': g('txtKQ_SoCCCD'),
            'strHoSo_MaHoSo': g('txtKQ_MaHoSo'),
            'strHoSo_SoBaoDanh': g('txtKQ_SBD'),
            'strExtra_Data': JSON.stringify(extraFiltered)
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    edu.system.alert("Cập nhật hồ sơ thành công", "s");
                    me._exitSuaMode();
                    // Về lại screen list và refresh
                    $('#kqdk_khai').addClass('d-none');
                    $('#kqdk_list').removeClass('d-none');
                    me.loadKQDK_List();
                } else {
                    edu.system.alert("Sua_HoSo_TS: " + ((data && data.Message) || 'Lỗi'), "w");
                }
            },
            error: function (er) {
                edu.system.alert("Sua_HoSo_TS (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_HOSO.Xoa_HoSo_TS
    -- Action: SV_Core_TS_HoSo_MH/GS4gHgkuEi4eFRIP
    -------------------------------------------*/
    deleteHoSo_TS: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'SV_Core_TS_HoSo_MH/GS4gHgkuEi4eFRIP',
            'func': 'PKG_CORE_TS_HOSO.Xoa_HoSo_TS',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA',
            'strHoSo_Id': strId
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    edu.system.alert("Xóa hồ sơ thành công", "s");
                    me.loadKQDK_List();
                } else {
                    edu.system.alert("Xoa_HoSo_TS: " + ((data && data.Message) || 'Lỗi'), "w");
                }
            },
            error: function (er) {
                edu.system.alert("Xoa_HoSo_TS (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Preload DM Giới tính vào #ddlKQ_GioiTinh (dropdown ẩn của form Khai) để list dùng lookup.
    -- Chạy 1 lần, sau khi load xong nếu list đang hiển thị dữ liệu → re-render với TEN.
    -------------------------------------------*/
    _preloadDMForList: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (me._listDMLoaded) return;
        me._listDMLoaded = true;
        try {
            var C = (window.constant && constant.setting && constant.setting.CATOR) ? constant.setting.CATOR : {};
            var NS = C.NS || {};
            if (!NS.GITI) return;
            edu.system.loadToCombo_DanhMucDuLieu(NS.GITI, "ddlKQ_GioiTinh", "", function () {
                // DM đã sẵn sàng → nếu list đang hiển thị và có data thì re-render để lookup TEN
                if (!$('#kqdk_list').hasClass('d-none') && me.dtKQDK_HoSo && me.dtKQDK_HoSo.length) {
                    me.renderKQDK_Table(me.dtKQDK_HoSo);
                }
            });
        } catch (ex) { }
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_HOSO.LayDS_HoSo_TS
    -- Action: SV_Core_TS_HoSo_MH/DSA4BRIeCS4SLh4VEgPP
    -- Backend cần nâng cấp view SQL của procedure này (join thêm Profile/Address/Edu/Family/
    -- Invoice/Bank + DM TEN) để trả về đầy đủ 51 cột mà UI cần.
    -------------------------------------------*/
    loadKQDK_List: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.dtKQDK_HoSo = [];
            me.renderKQDK_Table([]);
            return;
        }
        var obj_save = {
            'action': 'SV_Core_TS_HoSo_MH/DSA4BRIeCS4SLh4VEgPP',
            'func': 'PKG_CORE_TS_HOSO.LayDS_HoSo_TS',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM',
            'strHoSo_KH_TS_Id': me.strKeHoachTuyenSinh_Id || '',
            'strHoSo_KH_TS_Dot_Id': me.strDot_Id_ForKQ || '',
            'strHoSo_KH_Dot_PT_Id': '',
            'strNguyenVong_DauRa_Id': '',
            'strHoSo_KetQuaCode': '',
            'strHoSo_TuNgay': '',
            'strHoSo_DenNgay': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    var rows = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtKQDK_HoSo = rows;
                    me.renderKQDK_Table(rows);
                } else {
                    me.dtKQDK_HoSo = [];
                    me.renderKQDK_Table([]);
                    edu.system.alert("LayDS_HoSo_TS: " + ((data && data.Message) || 'Không lấy được danh sách'), "w");
                }
            },
            error: function (er) {
                me.dtKQDK_HoSo = [];
                me.renderKQDK_Table([]);
                edu.system.alert("LayDS_HoSo_TS (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Multi-key fallback getter — API có thể trả tên cột nhiều casing khác nhau
    -------------------------------------------*/
    _kqPick: function (d, keys) {
        if (!d) return '';
        for (var i = 0; i < keys.length; i++) {
            var v = d[keys[i]];
            if (v !== undefined && v !== null && v !== '') return v;
        }
        return '';
    },

    /*------------------------------------------
    -- Lookup TEN theo ID từ option của 1 dropdown DM đã load (VD tra Giới tính TEN từ ID).
    -- Fallback trả '' nếu DM chưa load hoặc ID không match.
    -------------------------------------------*/
    _kqLookupById: function (id, selectId) {
        if (!id) return '';
        var el = document.getElementById(selectId);
        if (!el) return '';
        for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].value === String(id)) return el.options[i].text;
        }
        return '';
    },

    /*------------------------------------------
    -- Render bảng 51 cột. Escape HTML để tránh XSS.
    -------------------------------------------*/
    renderKQDK_Table: function (data) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var $tbody = $('#tblKQDK_HoSo tbody');
        $tbody.html('');
        $('#lblKQDK_Total').text((data && data.length) || 0);
        $('#chkKQDK_All').prop('checked', false);

        if (!data || !data.length) {
            $tbody.append('<tr><td class="td-center" colspan="52">Không có dữ liệu</td></tr>');
            return;
        }

        var esc = function (s) { return $('<div>').text(s == null ? '' : s).html(); };
        var pick = me._kqPick;
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            // Ưu tiên HOSO_ID (API trả về) — dùng cho Sửa/Xóa
            var id = pick(d, ['HOSO_ID', 'ID', 'HoSo_Id', 'Id']);
            var arr = me._kqRowToArray(d, i + 1);
            var tds = '';
            tds += '<td class="td-center td-fix">' + arr[0] + '</td>';
            tds += '<td class="td-center">' + arr[1] + '</td>';   // checkbox (raw HTML)
            for (var j = 2; j < arr.length; j++) {
                tds += '<td>' + esc(arr[j]) + '</td>';
            }
            // Cột Thao tác (raw HTML — không escape)
            var idAttr = esc(id);
            tds += '<td class="td-center">'
                + '<a class="btn btn-sm btn-primary btnSuaHoSo" data-id="' + idAttr + '" title="Sửa hồ sơ" style="padding:4px 8px;margin-right:4px;"><i class="fa fa-pencil"></i></a>'
                + '<a class="btn btn-sm btn-danger btnXoaHoSo" data-id="' + idAttr + '" title="Xóa hồ sơ" style="padding:4px 8px;"><i class="fa fa-trash"></i></a>'
                + '</td>';
            rows += '<tr data-id="' + idAttr + '">' + tds + '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Map 1 record → array 51 phần tử theo thứ tự cột bảng.
    -- Field name pattern: {MODULE}_{FIELD} viết hoa (COREPERSON_*, PERSONCONTACT_*, HOSO_*, XETTUYEN_*, ...)
    -- Các field API chưa trả về (VD Dân tộc, Hộ khẩu, Bố/Mẹ, Trúng tuyển, Hóa đơn) → hiển thị rỗng
    -- → cần backend mở rộng view join nếu muốn đầy đủ 51 cột.
    -------------------------------------------*/
    _kqRowToArray: function (d, stt) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var pick = me._kqPick;
        // Format ngày sinh ISO "2026-07-08" → "08/07/2026"
        var ngaySinh = pick(d, ['COREPERSON_NGAYSINH', 'CorePerson_NgaySinh', 'NGAY_SINH', 'NGAYSINH']);
        if (ngaySinh && /^\d{4}-\d{2}-\d{2}/.test(ngaySinh)) {
            var m = ngaySinh.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (m) ngaySinh = m[3] + '/' + m[2] + '/' + m[1];
        }
        // Giới tính: ưu tiên TEN từ view FULL, fallback lookup từ ID qua DM đã load
        var giTen = pick(d, ['COREPERSON_GIOITINH_TEN', 'GIOITINH_TEN', 'CorePerson_GioiTinh_Ten']);
        if (!giTen) {
            var giId = pick(d, ['COREPERSON_GIOITINH_ID', 'GIOITINH_ID']);
            giTen = me._kqLookupById(giId, 'ddlKQ_GioiTinh');
        }
        return [
            stt,
            '<input type="checkbox" class="kqdk-sel">',
            // Basic
            pick(d, ['COREPERSON_HOTEN', 'CorePerson_HoTen', 'HOTEN', 'FULL_NAME']),
            ngaySinh,
            giTen,
            pick(d, ['PERSONPROFILE_DANTOC_TEN', 'DANTOC_TEN', 'PersonProfile_DanToc_Ten']),
            pick(d, ['PERSONPROFILE_TONGIAO_TEN', 'TONGIAO_TEN', 'PersonProfile_TonGiao_Ten']),
            pick(d, ['PERSONPROFILE_QUOCTICH_TEN', 'QUOCTICH_TEN', 'PersonProfile_QuocTich_Ten']),
            pick(d, ['PERSONCONTACT_DIENTHOAI', 'PersonContact_DienThoai', 'DIENTHOAI']),
            pick(d, ['PERSONCONTACT_EMAIL', 'PersonContact_Email', 'EMAIL']),
            pick(d, ['PERSONADDR_NOISINH', 'PersonAddr_NoiSinh', 'NOISINH']),
            // CCCD
            pick(d, ['PERSONIDEN_SOCCCD', 'PersonIden_SoCCCD', 'SOCCCD']),
            pick(d, ['PERSONIDEN_NGAYCAP', 'PersonIden_NgayCap', 'NGAYCAPCCCD']),
            pick(d, ['PERSONIDEN_NOICAP', 'PersonIden_NoiCap', 'NOICAPCCCD']),
            // Hộ khẩu
            pick(d, ['PERSONADDR_HK_TINH_TEN', 'HK_TINH_TEN', 'PersonAddr_HK_Tinh_Ten']),
            pick(d, ['PERSONADDR_HK_XA_TEN', 'HK_XA_TEN', 'PersonAddr_HK_Xa_Ten']),
            pick(d, ['PERSONADDR_HK_SONHA', 'HK_SONHA', 'PersonAddr_HK_SoNha']),
            // Xét tuyển
            pick(d, ['HOSO_KH_DOT_PT_TEN', 'PHUONGTHUC_TEN', 'HoSo_KH_Dot_PT_Ten']),
            pick(d, ['HOSO_DOITUONG_TS_TEN', 'DOITUONG_TS_TEN']),
            pick(d, ['HOSO_DOITUONG_UT_TEN', 'DOITUONG_UT_TEN']),
            pick(d, ['HOSO_KHUVUC_UT_TEN', 'KHUVUC_UT_TEN']),
            pick(d, ['PERSONEDU_TINH_ID', 'MATINH12']),
            pick(d, ['PERSONEDU_MATRUONG', 'MATRUONG12']),
            pick(d, ['PERSONEDU_TRUONGMATEN', 'TENTRUONG12']),
            pick(d, ['PERSONEDU_HOCLUC', 'HOCLUC12', 'HOC_LUC']),
            pick(d, ['PERSONEDU_HANHKIEM', 'HANHKIEM12', 'HANH_KIEM']),
            pick(d, ['XETTUYEN_TOHOPMON_CODE', 'XetTuyen_TohopMon_Code', 'TOHOP_MA']),
            pick(d, ['XETTUYEN_DIEM_MON1', 'DIEM_MON1']),
            pick(d, ['XETTUYEN_DIEM_MON2', 'DIEM_MON2']),
            pick(d, ['XETTUYEN_DIEM_MON3', 'DIEM_MON3']),
            pick(d, ['XETTUYEN_DIEMUUTIEN', 'DIEM_UT', 'XetTuyen_DiemUuTien']),
            pick(d, ['XETTUYEN_DIEMTONGXT', 'XetTuyen_DiemTongXT', 'TONG_DIEM_XT']),
            // Bố
            pick(d, ['PERSONFAM_BO_HOTEN', 'BO_HOTEN', 'PersonFam_Bo_HoTen']),
            pick(d, ['PERSONFAM_BO_NAMSINH', 'BO_NAMSINH', 'PersonFam_Bo_NamSinh']),
            pick(d, ['PERSONFAM_BO_NOIO', 'BO_NOIO', 'PersonFam_Bo_NoiO']),
            pick(d, ['PERSONFAM_BO_SDT', 'BO_SDT', 'PersonFam_Bo_SDT']),
            // Mẹ
            pick(d, ['PERSONFAM_ME_HOTEN', 'ME_HOTEN', 'PersonFam_Me_HoTen']),
            pick(d, ['PERSONFAM_ME_NAMSINH', 'ME_NAMSINH', 'PersonFam_Me_NamSinh']),
            pick(d, ['PERSONFAM_ME_NOIO', 'ME_NOIO', 'PersonFam_Me_NoiO']),
            pick(d, ['PERSONFAM_ME_SDT', 'ME_SDT', 'PersonFam_Me_SDT']),
            // Trúng tuyển
            pick(d, ['KETQUA_QUYETDINH_MA', 'SO_QD_TT', 'SoQuyetDinh']),
            pick(d, ['KETQUA_NGAYBANHANH', 'NGAY_QD_TT', 'HOSO_NGAYKETQUA']),
            pick(d, ['INTAKE_KHOA_TEN', 'KHOA_DT', 'KhoaDT']),
            pick(d, ['INTAKE_NGANH_TEN', 'MA_NGANH', 'MaNganh']),
            pick(d, ['INTAKE_LOP_MA', 'MA_LOP', 'MaLop']),
            pick(d, ['COREPERSON_MASO', 'MA_SV', 'MASV', 'MASO']),
            // Hóa đơn
            pick(d, ['PERSONINVOICE_TYPELOAI_TEN', 'HD_DOITUONG_TEN']),
            pick(d, ['PERSONINVOICE_TENDONVI', 'HD_TEN_DONVI']),
            pick(d, ['PERSONINVOICE_MAQHNS', 'HD_MA_QHNS']),
            pick(d, ['PERSONINVOICE_DIACHI', 'HD_DIACHI']),
            pick(d, ['PERSONINVOICE_MST', 'HD_MST', 'MST'])
        ];
    },

    /*------------------------------------------
    -- Filter local: search trên dtKQDK_HoSo (không call API lại)
    -- Trường tìm: Họ tên, SĐT, Email, CCCD, Mã HS, SBD (chuỗi haystack)
    -------------------------------------------*/
    filterKQDK_HoSo: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var kw = ($('#txtKQDK_Search').val() || '').toLowerCase().trim();
        var src = me.dtKQDK_HoSo || [];
        if (!kw) {
            me.renderKQDK_Table(src);
            return;
        }
        var pick = me._kqPick;
        var filtered = src.filter(function (d) {
            var hay = [
                pick(d, ['COREPERSON_HOTEN', 'CorePerson_HoTen', 'HOTEN']),
                pick(d, ['PERSONCONTACT_DIENTHOAI', 'PersonContact_DienThoai', 'DIENTHOAI']),
                pick(d, ['PERSONCONTACT_EMAIL', 'EMAIL']),
                pick(d, ['PERSONIDEN_SOCCCD', 'PersonIden_SoCCCD', 'SOCCCD']),
                pick(d, ['HOSO_MAHOSO', 'HoSo_MaHoSo', 'MA_HOSO']),
                pick(d, ['HOSO_SOBAODANH', 'HoSo_SoBaoDanh', 'SBD']),
                pick(d, ['COREPERSON_MASO', 'MA_SV', 'MASO'])
            ].join('|').toLowerCase();
            return hay.indexOf(kw) !== -1;
        });
        me.renderKQDK_Table(filtered);
    },

    /*------------------------------------------
    -- Xuất Excel bằng SheetJS (đã load qua CDN cho phần Import)
    -- Header 2 tầng (group + column), rows từ dtKQDK_HoSo (theo filter hiện tại nếu có).
    -------------------------------------------*/
    exportKQDK_Excel: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (typeof XLSX === 'undefined') {
            edu.system.alert("Thư viện Excel chưa load xong, vui lòng thử lại", "w");
            return;
        }
        var src = me.dtKQDK_HoSo || [];
        if (!src.length) {
            edu.system.alert("Không có dữ liệu để xuất", "w");
            return;
        }
        var headerCols = [
            'STT', 'Họ và tên', 'Ngày sinh', 'Giới tính', 'Dân tộc', 'Tôn giáo', 'Quốc tịch', 'Điện thoại', 'Email', 'Nơi sinh',
            'Số CCCD', 'Ngày cấp', 'Nơi cấp',
            'HK Tỉnh/TP', 'HK Xã/Phường', 'HK Số nhà/Thôn/Xóm',
            'Phương thức XT', 'Đối tượng TS', 'Đối tượng UT', 'Khu vực UT',
            'Mã tỉnh L12', 'Mã trường L12', 'Tên trường L12', 'Học lực L12', 'Hạnh kiểm L12',
            'Tổ hợp môn', 'Điểm 1', 'Điểm 2', 'Điểm 3', 'Điểm UT', 'Tổng điểm XT',
            'Bố - Họ tên', 'Bố - Năm sinh', 'Bố - Nơi ở', 'Bố - SĐT',
            'Mẹ - Họ tên', 'Mẹ - Năm sinh', 'Mẹ - Nơi ở', 'Mẹ - SĐT',
            'Số QĐ TT', 'Ngày ban hành QĐ', 'Khóa ĐT', 'Mã ngành', 'Mã lớp QL', 'Mã SV',
            'Đối tượng HĐ', 'Tên đơn vị HĐ', 'Mã QHNS', 'Địa chỉ cơ quan HĐ', 'MST'
        ];
        var ws_data = [headerCols];
        for (var i = 0; i < src.length; i++) {
            var arr = me._kqRowToArray(src[i], i + 1);
            // Bỏ cột checkbox (index 1) khi export
            var out = [arr[0]];
            for (var j = 2; j < arr.length; j++) out.push(arr[j]);
            ws_data.push(out);
        }
        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        // Auto-set column width based on header text length
        ws['!cols'] = headerCols.map(function (h) { return { wch: Math.max(10, Math.min(30, h.length + 2)) }; });
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DS HoSo');
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        var now = new Date();
        var fname = 'DS_HoSo_TS_' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
            + '_' + pad(now.getHours()) + pad(now.getMinutes()) + '.xlsx';
        XLSX.writeFile(wb, fname);
    },

    /*------------------------------------------
    -- KHAI TRỰC TIẾP HỒ SƠ — nạp danh mục cho form
    -- Reuse các mã DM bên hồ sơ nhân sự (core_person cùng cấu trúc):
    --   NS.GITI  → Giới tính
    --   NS.DATO  → Dân tộc
    --   NS.TOGI  → Tôn giáo
    --   CHUN.CHLU→ Quốc tịch
    -- Tỉnh/Huyện/Xã (Nơi sinh + Hộ khẩu) dùng edu.extend.genDropTinhThanh
    --   → cascade tự động qua bảng CHUN.DMTT (cache localStorage.strTinhThanh6)
    -- Lazy load: chỉ chạy lần đầu bấm "Khai trực tiếp".
    -------------------------------------------*/
    initKhai_DanhMuc: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (me._khaiDMLoaded) return;
        me._khaiDMLoaded = true;
        try {
            var C = (window.constant && constant.setting && constant.setting.CATOR) ? constant.setting.CATOR : {};
            var NS = C.NS || {};
            var CH = C.CHUN || {};

            // Chuẩn bị danh sách DM cần nạp — chỉ push nếu constant tồn tại (tránh gọi API với code rỗng)
            var toLoad = [];
            if (NS.GITI) toLoad.push([NS.GITI, "ddlKQ_GioiTinh"]);
            if (NS.DATO) toLoad.push([NS.DATO, "ddlKQ_DanToc"]);
            if (NS.TOGI) toLoad.push([NS.TOGI, "ddlKQ_TonGiao"]);
            if (CH.CHLU) toLoad.push([CH.CHLU, "ddlKQ_QuocTich"]);
            // Tab Xét tuyển — dùng string key trực tiếp (không có trong constant.setting.CATOR)
            toLoad.push(["TS.DOITUONGDUTUYEN", "ddlKQ_DoiTuongTS"]);
            toLoad.push(["TS.DOITUONGUUTIEN", "ddlKQ_DoiTuongUT"]);
            toLoad.push(["TS.KHUVUCUUTIEN", "ddlKQ_KhuVucUT"]);          // TODO: verify mã DM chuẩn
            toLoad.push(["TUYENSINH.HOCLUC", "ddlKQ_HocLuc"]);
            toLoad.push(["TUYENSINH.HANHKIEM", "ddlKQ_HanhKiem"]);
            // Tab Hóa đơn
            toLoad.push(["TS.DOITUONGHOADON", "ddlKQ_HD_DoiTuong"]);     // TODO: verify mã DM chuẩn
            toLoad.push(["MOTCUA.HINHTHUCTHANHTOAN", "ddlKQ_HD_HinhThucTT"]);

            // Phương thức tuyển sinh: KHÔNG dùng dtPhuongAnTuyenSinh vì đó là bảng "Phương án" khác
            // với "Phương thức của Đợt" (FK cần TS_KH_DOT_PHUONGTHUC.ID). Chưa có API list theo đợt
            // → để dropdown disabled, gửi rỗng → backend nhận NULL, không vi phạm FK.

            var finalize = function () {
                // Cascading Tỉnh → Huyện → Xã (data cache localStorage.strTinhThanh6, load sync nếu có cache)
                if (edu.extend && typeof edu.extend.genDropTinhThanh === 'function') {
                    edu.extend.genDropTinhThanh('ddlKQ_NS_Tinh', 'ddlKQ_NS_Huyen', 'ddlKQ_NS_Xa');
                    edu.extend.genDropTinhThanh('ddlKQ_HK_Tinh', 'ddlKQ_HK_Huyen', 'ddlKQ_HK_Xa');
                }
                me._bindCascadeNative();
            };

            if (toLoad.length === 0) { finalize(); return; }

            // loadToCombo_DanhMucDuLieu signature: (strCode, zone_id, type, callback, title, strTenCotSapXep)
            // Đợi tất cả 4 DM nạp xong (callback) mới finalize → tránh select2 apply lên dropdown rỗng.
            var pending = toLoad.length;
            var onOne = function () { if (--pending <= 0) finalize(); };
            toLoad.forEach(function (p) {
                edu.system.loadToCombo_DanhMucDuLieu(p[0], p[1], "", onOne);
            });
        } catch (ex) {
            console.warn('[KQĐK] Nạp danh mục lỗi:', ex);
        }
    },

    /*------------------------------------------
    -- Re-apply select2 cho Huyện/Xã sau khi cascade (options thay đổi) + quản lý disabled state.
    -- Logic UX: Huyện disabled cho tới khi có Tỉnh; Xã disabled cho tới khi có Huyện.
    -- Placeholder hướng dẫn: "Vui lòng chọn Tỉnh trước" / "Vui lòng chọn Quận/Huyện trước".
    -------------------------------------------*/
    /*------------------------------------------
    -- Sau khi user chọn Tỉnh/Huyện, genDropTinhThanh thay options của Huyện/Xã.
    -- select2 wrapper cũ giữ snapshot options → cần destroy + apply lại để lấy options mới.
    -------------------------------------------*/
    _bindCascadeReapply: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var reapply = function (id) {
            var $el = $('#' + id);
            if (!$el.length) return;
            if ($el.hasClass('select2-hidden-accessible')) {
                try { $el.select2('destroy'); } catch (e) { }
            }
            me._applyKQSelect2(id);
        };
        $('#ddlKQ_NS_Tinh').on('change.kqrep', function () {
            setTimeout(function () { reapply('ddlKQ_NS_Huyen'); reapply('ddlKQ_NS_Xa'); }, 80);
        });
        $('#ddlKQ_NS_Huyen').on('change.kqrep', function () {
            setTimeout(function () { reapply('ddlKQ_NS_Xa'); }, 80);
        });
        $('#ddlKQ_HK_Tinh').on('change.kqrep', function () {
            setTimeout(function () { reapply('ddlKQ_HK_Huyen'); reapply('ddlKQ_HK_Xa'); }, 80);
        });
        $('#ddlKQ_HK_Huyen').on('change.kqrep', function () {
            setTimeout(function () { reapply('ddlKQ_HK_Xa'); }, 80);
        });
    },

    /*------------------------------------------
    -- Load Nguyện vọng đầu ra (list Kế hoạch đầu ra theo KH+Đợt) vào dropdown.
    -- Origin API: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_Ds
    -- Chỉ lấy các đầu ra còn hiệu lực (dIs_Active=1).
    -- Field TS_HOSO_NGUYENVONG.TS_KEHOACH_DAU_RA_ID NOT NULL → user phải chọn 1 giá trị.
    -------------------------------------------*/
    _loadNguyenVongDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var $sel = $('#ddlKQ_NguyenVongDauRa');
        $sel.html('<option value="">-- Chọn nguyện vọng đầu ra --</option>');
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) return;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': me.strDot_Id_ForKQ || '',
            'strTs_Kh_Dot_PhuongThuc_Id': '',
            'strOutput_Status_Code': '',
            'dIs_Public': '',
            'dIs_Active': 1
        };
        edu.system.makeRequest({
            success: function (data) {
                if (!data || !data.Success) return;
                var rows = edu.util.checkValue(data.Data) ? data.Data : [];
                var esc = function (s) { return $('<div>').text(s == null ? '' : s).html(); };
                for (var i = 0; i < rows.length; i++) {
                    var d = rows[i];
                    var id = d.ID || d.Id || d.id || '';
                    if (!id) continue;
                    // Ưu tiên tên hiển thị nếu có, fallback về TEN gốc, kèm mã ngành nếu có
                    var name = d.TEN_HIENTHI || d.TenHienThi || d.TEN || d.Ten || d.MA || '';
                    var maCT = d.MA_CT || d.MaCT || d.MA || '';
                    var display = name + (maCT && name !== maCT ? ' (' + maCT + ')' : '');
                    $sel.append('<option value="' + esc(id) + '">' + esc(display) + '</option>');
                }
            },
            error: function () { },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    _bindCascadeNative: function () {
        // Chỉ enable/disable Huyện + Xã theo Tỉnh/Huyện (native <select>, không select2).
        // genDropTinhThanh đã handle empty+populate options; ta chỉ bổ sung UX lock/unlock.
        var lockDrop = function (id, msg) {
            $('#' + id).empty().append('<option value="">' + msg + '</option>').prop('disabled', true);
        };
        var unlockDrop = function (id) {
            $('#' + id).prop('disabled', false);
        };
        var bind = function (tinhId, huyenId, xaId) {
            $('#' + tinhId).off('change.kqnat').on('change.kqnat', function () {
                if ($(this).val()) {
                    unlockDrop(huyenId);
                    lockDrop(xaId, 'Vui lòng chọn Quận/Huyện trước');
                } else {
                    lockDrop(huyenId, 'Vui lòng chọn Tỉnh trước');
                    lockDrop(xaId, 'Vui lòng chọn Quận/Huyện trước');
                }
            });
            $('#' + huyenId).off('change.kqnat').on('change.kqnat', function () {
                if ($(this).val()) unlockDrop(xaId);
                else lockDrop(xaId, 'Vui lòng chọn Quận/Huyện trước');
            });
        };
        bind('ddlKQ_NS_Tinh', 'ddlKQ_NS_Huyen', 'ddlKQ_NS_Xa');
        bind('ddlKQ_HK_Tinh', 'ddlKQ_HK_Huyen', 'ddlKQ_HK_Xa');
    },

    /*------------------------------------------
    -- Apply select2 cho các dropdown có nhiều option (Quốc tịch/Dân tộc/Tỉnh/Huyện/Xã...)
    -- minimumResultsForSearch: 5 → dropdown < 5 items không hiện search box.
    -- dropdownParent: neo dropdown vào modal fullscreen để không bị z-index issue.
    -- placeholder + templateResult: ẩn option value="" khỏi dropdown list (option này chỉ
    -- làm placeholder ở field, không nên xuất hiện như 1 item chọn được).
    -------------------------------------------*/
    initKhai_Select2: function () {
        if (typeof $.fn.select2 !== 'function') return;
        var me = main_doc.KeHoachTuyenSinhNew;
        var dropIds = [
            'ddlKQ_GioiTinh', 'ddlKQ_QuocTich', 'ddlKQ_DanToc', 'ddlKQ_TonGiao',
            'ddlKQ_NS_Tinh', 'ddlKQ_NS_Huyen', 'ddlKQ_NS_Xa',
            'ddlKQ_HK_Tinh', 'ddlKQ_HK_Huyen', 'ddlKQ_HK_Xa',
            'ddlKQ_KhuVucUT', 'ddlKQ_HocLuc', 'ddlKQ_HanhKiem',
            'ddlKQ_HD_DoiTuong', 'ddlKQ_HD_HinhThucTT'
        ];
        for (var i = 0; i < dropIds.length; i++) {
            me._applyKQSelect2(dropIds[i]);
        }
    },

    /*------------------------------------------
    -- Apply select2 cho 1 dropdown (dùng chung cho init + re-apply cascade).
    -------------------------------------------*/
    _applyKQSelect2: function (id) {
        var $el = $('#' + id);
        if (!$el.length) return;
        if ($el.hasClass('select2-hidden-accessible')) return;
        // Đọc text option value="" đầu tiên làm placeholder, sau đó XÓA text đó.
        // templateResult sẽ ẩn option có text rỗng (chỉ placeholder có text rỗng, DM items luôn có text).
        var $firstOpt = $el.find('option').filter(function () { return $(this).val() === ''; }).first();
        var placeholder = ($firstOpt.length ? $firstOpt.text() : '') || 'Chọn';
        if ($firstOpt.length) $firstOpt.text('');
        $el.select2({
            width: '100%',
            dropdownParent: $('#ket-qua-dk'),
            minimumResultsForSearch: 5,
            placeholder: placeholder,
            allowClear: false,
            templateResult: function (state) {
                // Ẩn item có text rỗng khỏi dropdown list (VD: placeholder option đã bị clear text).
                // Các DM item luôn có text ("Nam", "Nữ", "Khác"...) → không bị ảnh hưởng.
                var t = (state && state.text) ? String(state.text).trim() : '';
                if (t === '') return null;
                return state.text;
            }
        });
        $el.closest('.aps-sv-select').addClass('select2-applied');
    },

    /*------------------------------------------
    -- Reset toàn bộ form khai + về tab đầu
    -------------------------------------------*/
    resetKhai_HoSo: function () {
        // Text/number/date inputs (list ID để tránh clear nhầm input khác trong page)
        var arrTxt = [
            'txtKQ_HoTen', 'txtKQ_NgaySinh', 'txtKQ_DienThoai', 'txtKQ_Email', 'txtKQ_NoiSinh',
            'txtKQ_SoCCCD', 'txtKQ_NgayCapCCCD', 'txtKQ_NoiCapCCCD', 'txtKQ_HK_SoNha',
            'txtKQ_MaTinh12', 'txtKQ_TruongMaTen',
            'txtKQ_ToHopMa', 'txtKQ_ToHopTen',
            'txtKQ_Diem1', 'txtKQ_Diem2', 'txtKQ_Diem3', 'txtKQ_DiemUT',
            'txtKQ_TongDiemMon', 'txtKQ_TongDiemXT',
            'txtKQ_MaHoSo', 'txtKQ_SBD', 'txtKQ_QDMa',
            'txtKQ_IntakeCode', 'txtKQ_IntakeTypeCode',
            'txtKQ_Bo_HoTen', 'txtKQ_Bo_NamSinh', 'txtKQ_Bo_SDT', 'txtKQ_Bo_NoiO',
            'txtKQ_Me_HoTen', 'txtKQ_Me_NamSinh', 'txtKQ_Me_SDT', 'txtKQ_Me_NoiO',
            'txtKQ_HD_NguoiMua', 'txtKQ_HD_TenDonVi', 'txtKQ_HD_MST', 'txtKQ_HD_MaQHNS',
            'txtKQ_HD_SDT', 'txtKQ_HD_Email', 'txtKQ_HD_DiaChi',
            'txtKQ_HD_NganHang', 'txtKQ_HD_SoTK', 'txtKQ_HD_ChuTK', 'txtKQ_HD_GhiChu'
        ];
        edu.util.resetValByArrId(arrTxt);
        $('#ddlKQ_GioiTinh, #ddlKQ_QuocTich, #ddlKQ_DanToc, #ddlKQ_TonGiao,'
            + '#ddlKQ_PhuongThuc, #ddlKQ_DoiTuongTS, #ddlKQ_DoiTuongUT,'
            + '#ddlKQ_KhuVucUT, #ddlKQ_HocLuc, #ddlKQ_HanhKiem,'
            + '#ddlKQ_NguyenVongDauRa,'
            + '#ddlKQ_HD_DoiTuong, #ddlKQ_HD_HinhThucTT').val('');

        // Cascade: clear Tỉnh + khóa lại Huyện/Xã về trạng thái ban đầu
        $('#ddlKQ_NS_Tinh, #ddlKQ_HK_Tinh').val('').trigger('change');   // trigger change để cascade fire
        // Về tab 1
        $('#kqdkKhaiTabs .aps-sv-tab').first().trigger('click');
    },

    /*------------------------------------------
    -- Cộng 3 điểm môn + điểm UT, đổ vào 2 ô readonly tổng
    -------------------------------------------*/
    tinhTongDiem_Khai: function () {
        var parse = function (id) {
            var v = parseFloat($('#' + id).val());
            return isNaN(v) ? 0 : v;
        };
        var tongMon = parse('txtKQ_Diem1') + parse('txtKQ_Diem2') + parse('txtKQ_Diem3');
        var tongXT = tongMon + parse('txtKQ_DiemUT');
        $('#txtKQ_TongDiemMon').val(tongMon ? tongMon.toFixed(2) : '');
        $('#txtKQ_TongDiemXT').val(tongXT ? tongXT.toFixed(2) : '');
    },

    /*------------------------------------------
    -- Ghép payload rồi gọi Them_HoSo_TS cho 1 hồ sơ khai tay
    -- Origin: PKG_CORE_TS_HOSO.Them_HoSo_TS  (KHÁC PKG_CORE_TS_HOSO_IMPORT dùng cho batch)
    -- Action: SV_Core_TS_HoSo_MH/FSkkLB4JLhIuHhUS
    -- 5 field DAOTAO_* (Hệ/Khóa/CT/Ngành TS/Ngành ĐT) → backend auto snapshot từ
    -- TS_KEHOACH_DAU_RA qua ParamNguyenVong_DauRa_Id, không truyền.
    -------------------------------------------*/
    saveKhai_HoSo: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        // Dispatch: nếu đang ở chế độ SỬA → gọi Sua_HoSo_TS thay vì Them_HoSo_TS
        if (me._suaMode && edu.util.checkValue(me.strSuaHoSo_Id)) {
            me.saveSuaHoSo_Full();
            return;
        }
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Chưa xác định kế hoạch tuyển sinh (mở lại từ danh sách)", "w");
            return;
        }
        var hoTen = edu.system.getValById('txtKQ_HoTen');
        if (!edu.util.checkValue(hoTen)) {
            edu.system.alert("Vui lòng nhập Họ và tên", "w");
            $('#kqdkKhaiTabs .aps-sv-tab').first().trigger('click');
            $('#txtKQ_HoTen').focus();
            return;
        }
        if (!edu.util.checkValue(edu.system.getValById('txtKQ_DienThoai'))) {
            edu.system.alert("Vui lòng nhập Điện thoại", "w");
            $('#kqdkKhaiTabs .aps-sv-tab').first().trigger('click');
            $('#txtKQ_DienThoai').focus();
            return;
        }
        if (!edu.util.checkValue(edu.system.getValById('ddlKQ_NguyenVongDauRa'))) {
            edu.system.alert("Vui lòng chọn Nguyện vọng đầu ra (bắt buộc)", "w");
            $('#kqdkKhaiTabs .aps-sv-tab').eq(3).trigger('click');   // tab Trúng tuyển (index 3)
            $('#ddlKQ_NguyenVongDauRa').focus();
            return;
        }

        // Tự tính tổng lần cuối trước khi build payload
        me.tinhTongDiem_Khai();

        var g = function (id) { return edu.system.getValById(id) || ''; };

        // Tách ngày/tháng/năm sinh (input type=date trả yyyy-mm-dd)
        var dNgayS = '', dThangS = '', dNamS = '';
        var strNgaySinh = g('txtKQ_NgaySinh');
        if (strNgaySinh) {
            var m = strNgaySinh.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) { dNamS = parseInt(m[1], 10); dThangS = parseInt(m[2], 10); dNgayS = parseInt(m[3], 10); }
        }

        // XT_Mon_Data format: MON_MA~DIEM~SO_MON~STT~MON_TEN|... (delimited theo spec)
        // Tách tên môn từ tổ hợp (VD "Toán, Lý, Hóa") → gán vào 3 điểm môn tương ứng
        var tenMon = (g('txtKQ_ToHopTen') || '').split(/[,;]/);
        var monArr = [];
        for (var i = 0; i < 3; i++) {
            var diem = g('txtKQ_Diem' + (i + 1));
            var ten = (tenMon[i] || ('Mon ' + (i + 1))).trim();
            if (!diem && !tenMon[i]) continue;
            var ma = ten.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
            monArr.push(ma + '~' + diem + '~1~' + (i + 1) + '~' + ten);
        }
        var strXT_Mon_Data = monArr.join('|');
        var toHopMa = g('txtKQ_ToHopMa');

        var payload = {
            'action': 'SV_Core_TS_HoSo_MH/FSkkLB4JLhIuHhUS',
            'func': 'PKG_CORE_TS_HOSO.Them_HoSo_TS',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'THEM',

            // Person — cá nhân
            'strCorePerson_HoTen': hoTen,
            'strCorePerson_Ho': '',
            'strCorePerson_Dem': '',
            'strCorePerson_Ten': '',
            'strCorePerson_NgaySinh': strNgaySinh,
            'dCorePerson_NgayS': dNgayS,
            'dCorePerson_ThangS': dThangS,
            'dCorePerson_NamS': dNamS,
            'strCorePerson_GioiTinh_Id': g('ddlKQ_GioiTinh'),
            'strMaSo': '',   // MSSV nội bộ — hệ thống tự sinh

            // Profile
            'strPersonProfile_DanToc_Id': g('ddlKQ_DanToc'),
            'strPersonProfile_TonGiao_Id': g('ddlKQ_TonGiao'),
            'strPersonProfile_QuocTich_Id': g('ddlKQ_QuocTich'),

            // Contact
            'strPersonContact_DienThoai': g('txtKQ_DienThoai'),
            'strPersonContact_Email': g('txtKQ_Email'),

            // Định danh
            'strPersonIden_SoCCCD': g('txtKQ_SoCCCD'),
            'strPersonIden_NgayCap': g('txtKQ_NgayCapCCCD'),
            'strPersonIden_NoiCap': g('txtKQ_NoiCapCCCD'),

            // Địa chỉ
            'strPersonAddr_NS_Tinh_Id': g('ddlKQ_NS_Tinh'),
            'strPersonAddr_NS_Xa_Id': g('ddlKQ_NS_Xa'),
            'strPersonAddr_NoiSinh': g('txtKQ_NoiSinh'),
            'strPersonAddr_HK_Tinh_Id': g('ddlKQ_HK_Tinh'),
            'strPersonAddr_HK_Xa_Id': g('ddlKQ_HK_Xa'),
            'strPersonAddr_HK_SoNha': g('txtKQ_HK_SoNha'),

            // Học vấn 12
            'strPersonEdu_Tinh_Id': g('txtKQ_MaTinh12'),
            'strPersonEdu_TruongMaTen': g('txtKQ_TruongMaTen'),
            'strPersonEdu_HocLuc': g('ddlKQ_HocLuc'),
            'strPersonEdu_HanhKiem': g('ddlKQ_HanhKiem'),

            // Gia đình
            'strPersonFam_Bo_HoTen': g('txtKQ_Bo_HoTen'),
            'dPersonFam_Bo_NamSinh': g('txtKQ_Bo_NamSinh'),
            'strPersonFam_Bo_NoiO': g('txtKQ_Bo_NoiO'),
            'strPersonFam_Bo_SDT': g('txtKQ_Bo_SDT'),
            'strPersonFam_Me_HoTen': g('txtKQ_Me_HoTen'),
            'dPersonFam_Me_NamSinh': g('txtKQ_Me_NamSinh'),
            'strPersonFam_Me_NoiO': g('txtKQ_Me_NoiO'),
            'strPersonFam_Me_SDT': g('txtKQ_Me_SDT'),

            // Hồ sơ nguồn
            'strHoSo_KH_TS_Id': me.strKeHoachTuyenSinh_Id || '',
            'strHoSo_KH_TS_Dot_Id': me.strDot_Id_ForKQ || '',
            'strHoSo_KH_Dot_PT_Id': g('ddlKQ_PhuongThuc'),
            'strHoSo_DoiTuong_TS_Id': g('ddlKQ_DoiTuongTS'),
            'strHoSo_DoiTuong_UT_Ids': g('ddlKQ_DoiTuongUT'),
            'strHoSo_KhuVuc_UT_Id': g('ddlKQ_KhuVucUT'),
            'strHoSo_MaHoSo': g('txtKQ_MaHoSo'),
            'strHoSo_SoBaoDanh': g('txtKQ_SBD'),
            'strHoSo_Import_Batch_Id': '',
            'dHoSo_Import_Row_No': '',

            // Nguyện vọng — backend auto snapshot Hệ/Khóa/CT/NganhTS/NganhDT từ TS_KEHOACH_DAU_RA
            'strNguyenVong_DauRa_Id': g('ddlKQ_NguyenVongDauRa'),

            // Xét tuyển
            'strXetTuyen_TohopMon_Id': toHopMa,
            'strXetTuyen_TohopMon_Code': toHopMa,
            'strXetTuyen_TohopMon_Ten': g('txtKQ_ToHopTen'),
            'dXetTuyen_DiemUuTien': g('txtKQ_DiemUT'),
            'dXetTuyen_DiemTongMon': g('txtKQ_TongDiemMon'),
            'dXetTuyen_DiemTongXT': g('txtKQ_TongDiemXT'),
            'strXT_Mon_Data': strXT_Mon_Data,

            // Kết quả
            'strKetQua_QuyetDinh_Id': g('txtKQ_QDMa'),

            // Intake
            'strIntake_IntakeCode': g('txtKQ_IntakeCode'),
            'strIntake_IntakeTypeCode': g('txtKQ_IntakeTypeCode'),

            // Hóa đơn
            'strPersonInvoice_TypeLoai': g('ddlKQ_HD_DoiTuong'),
            'strPersonInvoice_NguoiMua': g('txtKQ_HD_NguoiMua'),
            'strPersonInvoice_TenDonVi': g('txtKQ_HD_TenDonVi'),
            'strPersonInvoice_MST': g('txtKQ_HD_MST'),
            'strPersonInvoice_MaQHNS': g('txtKQ_HD_MaQHNS'),
            'strPersonInvoice_SDT': g('txtKQ_HD_SDT'),
            'strPersonInvoice_DiaChi': g('txtKQ_HD_DiaChi'),
            'strPersonInvoice_Email': g('txtKQ_HD_Email'),

            // Ngân hàng
            'strPersonBank_HinhThucTT': g('ddlKQ_HD_HinhThucTT'),
            'strPersonBank_TenNganHang': g('txtKQ_HD_NganHang'),
            'strPersonBank_SoTaiKhoan': g('txtKQ_HD_SoTK'),
            'strPersonBank_ChuTaiKhoan': g('txtKQ_HD_ChuTK'),
            'strPersonBank_GhiChu': g('txtKQ_HD_GhiChu'),

            // Extra JSON — lưu Huyện (Nơi sinh + Hộ khẩu) vì API spec chưa có param riêng cho Huyện
            'strExtra_Person_Data': JSON.stringify({
                NS_Huyen_Id: g('ddlKQ_NS_Huyen'),
                HK_Huyen_Id: g('ddlKQ_HK_Huyen')
            }),
            'strExtra_HoSo_Data': '',
            'strExtra_Intake_Data': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) {
                    edu.system.alert("Đã lưu hồ sơ thành công", "s");
                    me.resetKhai_HoSo();
                } else {
                    edu.system.alert("Them_HoSo_TS: " + ((data && data.Message) || 'Lỗi không xác định'), "w");
                }
            },
            error: function (er) {
                edu.system.alert("Them_HoSo_TS (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: payload.action,
            data: payload,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Loai_TuyenSinh_Get_Ds
    -- Lấy danh sách Loại nguồn tuyển sinh
    -------------------------------------------*/
    getList_LoaiTuyenSinh: function () {
        var me = this;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeDS4gKB4VNDgkLxIoLykeBiQ1HgUy',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Loai_TuyenSinh_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'dIs_Active': 1
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                    }
                    me.dtLoaiTuyenSinh = dtResult;
                    me.genCombo_LoaiTuyenSinh('ddlLoaiNguonTuyenSinh', '');
                    me.genCombo_LoaiTuyenSinh('ddlKH_LoaiNguonTuyenSinh', '');
                }
                else {
                    edu.system.alert("Pr_Ts_Loai_TuyenSinh_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Loai_TuyenSinh_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_LoaiTuyenSinh: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtLoaiTuyenSinh,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Loại nguồn tuyển sinh"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_PA_TuyenSinh_Get_Ds
    -- Lấy danh sách Phương án tuyển sinh
    -------------------------------------------*/
    getList_PhuongAnTuyenSinh: function () {
        var me = this;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeEQAeFTQ4JC8SKC8pHgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_PA_TuyenSinh_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'dIs_Active': 1
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                    }
                    me.dtPhuongAnTuyenSinh = dtResult;
                    me.genCombo_PhuongAnTuyenSinh('ddlPhuongAnTuyenSinh', '');
                    me.genCombo_PhuongAnTuyenSinh('ddlKH_PhuongAnTuyenSinh', '');
                }
                else {
                    edu.system.alert("Pr_Ts_PA_TuyenSinh_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_PA_TuyenSinh_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_PhuongAnTuyenSinh: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtPhuongAnTuyenSinh,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                default_val: default_val
            },
            renderPlace: [strDrop_Id],
            title: "Phương án tuyển sinh"
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- [Shared] NS_CoCauToChuc/LayDanhSach
    -- Đổ vào 3 dropdown: Đơn vị quản lý KH / quản lý HS / tiếp nhận HS
    -------------------------------------------*/
    getList_CoCauToChuc: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtCoCauToChuc = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.genCombo_DonVi('ddlKH_DonViQLKH', '');
                    me.genCombo_DonVi('ddlKH_DonViQLHS', '');
                    me.genCombo_DonVi('ddlKH_DonViTiepNhan', '');
                }
            },
            error: function () { },
            type: 'GET',
            action: 'NS_CoCauToChuc/LayDanhSach',
            contentType: true,
            data: {
                'dTrangThai': 1,
                'strLoaiCoCauToChuc_Id': '',
                'strCoCauToChucCha_Id': ''
            },
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_DonVi: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtCoCauToChuc,
            renderInfor: { id: "ID", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn đơn vị",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Lấy danh mục Tình trạng kế hoạch (bảng DM: TS.KEHOACH.TINHTRANG)
    -------------------------------------------*/
    getList_TinhTrangKeHoach: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.TINHTRANG",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_TinhTrangKeHoach);
    },

    cbGetList_TinhTrangKeHoach: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtTinhTrangKeHoach = data || [];
        me.genCombo_TinhTrangKeHoach('ddlTinhTrangKeHoach', '');
        me.genCombo_TinhTrangKeHoach('ddlKH_TinhTrang', '');
    },

    genCombo_TinhTrangKeHoach: function (strDrop_Id, default_val) {
        var me = this;
        // value của option = MA (vì API list nhận strPlan_Status_Code)
        var obj = {
            data: me.dtTinhTrangKeHoach,
            renderInfor: {
                id: "MA",
                parentId: "",
                name: "TEN",
                code: "MA"
            },
            renderPlace: [strDrop_Id],
            title: "Tình trạng kế hoạch",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_List
    -- Lấy danh sách kế hoạch tuyển sinh theo filter
    -------------------------------------------*/
    getList_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCgkeFTQ4JC8SKC8pHgYkNR4NKDI1',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_List',
            'iM': edu.system.iM,
            'strTuKhoa': edu.system.getValById('txtSearch_TuKhoa'),
            'strLoai_TuyenSinh_Id': edu.system.getValById('ddlLoaiNguonTuyenSinh'),
            'strTs_PhuongAn_TuyenSinh_Id': edu.system.getValById('ddlPhuongAnTuyenSinh'),
            'strNam_TuyenSinh': edu.system.getValById('txtSearch_NamTuyenSinh'),
            'strNam_Hoc': edu.system.getValById('txtSearch_NamHoc'),
            'strHoc_Ky': edu.system.getValById('txtSearch_HocKy'),
            'strPlan_Status_Code': edu.system.getValById('ddlTinhTrangKeHoach'),
            'dIs_Active': edu.system.getValById('ddlConHieuLuc'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtKeHoachTuyenSinh = dtResult;
                    me.genTable_KeHoachTuyenSinh(dtResult, iPager);
                }
                else {
                    edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_List: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_List (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng danh sách kế hoạch tuyển sinh
    -- Fallback nhiều casing cho Mã/Tên + lookup DM local (dtLoaiTuyenSinh/dtPhuongAnTuyenSinh)
    -- qua ID khi API không join sẵn _Ten.
    -------------------------------------------*/
    genTable_KeHoachTuyenSinh: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        $("#lblKeHoachTuyenSinh_Tong").html(data.length || 0);
        var $tbody = $("#tblKHtyensinh tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="21">Không có dữ liệu</td></tr>');
            return;
        }

        var lookupTenById = function (arr, id) {
            if (!id || !arr || !arr.length) return '';
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].ID == id) return arr[j].TEN || '';
            }
            return '';
        };
        var lookupTenByMa = function (arr, ma) {
            if (!ma || !arr || !arr.length) return '';
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].MA == ma) return arr[j].TEN || '';
            }
            return ma;
        };

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || d.Id || d.id || '';
            var sMa = d.MA || d.Ma || d.KEHOACH_MA || '';
            var sTen = d.TEN || d.Ten || d.KEHOACH_TEN || '';
            var sLoai = d.LOAITUYENSINH_TEN || d.LOAI_TUYENSINH_TEN || d.LOAI_TUYENSINH_Ten || lookupTenById(me.dtLoaiTuyenSinh, d.LOAI_TUYENSINH_ID);
            var sPA = d.PHUONGANTUYENSINH_TEN || d.TS_PHUONGAN_TUYENSINH_TEN || d.TS_PHUONGAN_TUYENSINH_Ten || lookupTenById(me.dtPhuongAnTuyenSinh, d.TS_PHUONGAN_TUYENSINH_ID);
            var sTinhTrang = d.TINHTRANG_TEN || d.PLAN_STATUS_Name || d.PLAN_STATUS_TEN || lookupTenByMa(me.dtTinhTrangKeHoach, d.PLAN_STATUS_CODE);
            rows += '<tr id="row_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + sMa + '</td>'
                +  '<td class="td-left">' + sTen + '</td>'
                +  '<td class="td-left">' + sLoai + '</td>'
                +  '<td class="td-left">' + sPA + '</td>'
                +  '<td class="td-center">' + (d.NAM_TUYENSINH || '') + '</td>'
                +  '<td class="td-center">' + (d.NAM_HOC || '') + '</td>'
                +  '<td class="td-center">' + (d.HOC_KY || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Các đợt tuyển sinh" data-bs-toggle="modal" data-bs-target="#dot-tuyen-sinh">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Phân công nhân sự" data-bs-toggle="modal" data-bs-target="#phan-cong-nhan-su">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kế hoạch đầu ra" data-bs-toggle="modal" data-bs-target="#ke-hoach-dau-ra">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Quy định phí" data-bs-toggle="modal" data-bs-target="#quy-dinh-phi">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Mẫu khai hồ sơ" data-bs-toggle="modal" data-bs-target="#mau-khai-hs">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kết quả đăng ký" data-bs-toggle="modal" data-bs-target="#ket-qua-dk">Xem</a></td>'
                +  '<td class="td-left">' + sTinhTrang + '</td>'
                +  '<td class="td-center">' + (d.IS_PUBLIC == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_LOCKED == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_ACTIVE == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.NGUOITAO_TEN || '') + '</td>'
                +  '<td class="td-center">' + (d.NGAYTAO || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetail" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết" data-bs-toggle="modal" data-bs-target="#chi-tiet">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_By_Id
    -- Lấy chi tiết kế hoạch tuyển sinh theo ID
    -------------------------------------------*/
    getDetail_KeHoachTuyenSinh: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCgkeFTQ4JC8SKC8pHgYkNR4DOB4IJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KH_TuyenSinh_Get_By_Id',
            'iM': edu.system.iM,
            'strId': strId,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = null;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = Array.isArray(data.Data) ? data.Data[0] : data.Data;
                    }
                    me.dtChiTiet = dtResult;
                    me.view_ChiTietKeHoach(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KH_TuyenSinh_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Đổ dữ liệu chi tiết vào modal #chi-tiet
    -- NOTE: tên cột (KEHOACH_MA, KEHOACH_TEN, ...) đoán theo convention.
    --       Nếu API trả tên khác thì sửa lại tại đây.
    -------------------------------------------*/
    view_ChiTietKeHoach: function (data) {
        if (!data) return;
        var d = data;

        edu.util.viewValById('txtKH_Ma', d.MA || d.Ma || d.KEHOACH_MA || '');
        edu.util.viewValById('txtKH_Ten', d.TEN || d.Ten || d.KEHOACH_TEN || '');
        edu.util.viewValById('txtKH_NamTuyenSinh', d.NAM_TUYENSINH || '');
        edu.util.viewValById('txtKH_NamHoc', d.NAM_HOC || '');
        edu.util.viewValById('txtKH_HocKy', d.HOC_KY || '');
        edu.util.viewValById('txtKH_SoHoSoToiDa', d.MAX_HOSO_PER_PERSON || '');
        edu.util.viewValById('txtKH_ChiTieu', d.CHI_TIEU || '');
        edu.util.viewValById('txtKH_GhiChu', d.GHICHU || '');

        edu.util.viewValById('lblKH_SoDaDangKy', d.SO_DA_DANGKY || 0);
        edu.util.viewValById('lblKH_SoDaNopHS', d.SO_DA_NOP_HOSO || 0);
        edu.util.viewValById('lblKH_SoDaTrungTuyen', d.SO_DA_TRUNGTUYEN || 0);
        edu.util.viewValById('lblKH_SoDaTiepNhan', d.SO_DA_TIEPNHAN || 0);
        edu.util.viewValById('lblKH_SoDaNhapHoc', d.SO_DA_NHAPHOC || 0);

        $('#ddlKH_LoaiNguonTuyenSinh').val(d.LOAI_TUYENSINH_ID || '');
        $('#ddlKH_PhuongAnTuyenSinh').val(d.TS_PHUONGAN_TUYENSINH_ID || '');
        $('#ddlKH_MauHoSo').val(d.FORM_LAYOUT_ID || '');
        $('#ddlKH_DonViQLKH').val(d.OWNER_ORG_ID || '');
        $('#ddlKH_DonViQLHS').val(d.MANAGE_ORG_ID || '');
        $('#ddlKH_DonViTiepNhan').val(d.RECEIVE_ORG_ID || '');
        $('#ddlKH_TinhTrang').val(d.PLAN_STATUS_CODE || '');

        $('#chkKH_TaoTaiKhoan').prop('checked', d.REQUIRE_ACCOUNT == 1);
        $('#chkKH_ChoTSTuDangKy').prop('checked', d.ALLOW_ONLINE_REGISTER == 1);
        $('#chkKH_ChoCanBoNhapHS').prop('checked', d.ALLOW_DIRECT_INPUT == 1);
        $('#chkKH_ChoImport').prop('checked', d.ALLOW_IMPORT == 1);
        $('#chkKH_ChoDocApi').prop('checked', d.ALLOW_API == 1);
        $('#chkKH_YeuCauCanBoDuyet').prop('checked', d.REQUIRE_APPROVAL == 1);
        $('#chkKH_YeuCauKiemTraHS').prop('checked', d.REQUIRE_DOCUMENT_CHECK == 1);
        $('#chkKH_YeuCauThanhToan').prop('checked', d.REQUIRE_PAY_BEFORE_INTAKE == 1);
        $('#chkKH_ChoPhepThayDoiDauRa').prop('checked', d.ALLOW_CHANGE_OUTPUT == 1);
        $('#chkKH_KiemSoatTrungHS').prop('checked', edu.util.checkValue(d.HOSO_UNIQUE_SCOPE_CODE));
        $('#chkKH_CoMoPublic').prop('checked', d.IS_PUBLIC == 1);
        $('#chkKH_CoKhoa').prop('checked', d.IS_LOCKED == 1);
        $('#chkKH_ConHieuLuc').prop('checked', d.IS_ACTIVE == 1);
    },

    /*------------------------------------------
    -- Lấy danh mục Phân loại đợt (DM: TS.KEHOACH.DOT.KIEUDOT)
    -------------------------------------------*/
    getList_KieuDot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.DOT.KIEUDOT",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_KieuDot);
    },

    cbGetList_KieuDot: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtKieuDot = data || [];
        me.genCombo_KieuDot('ddl_KieuDot', '');
    },

    genCombo_KieuDot: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtKieuDot,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn phân loại đợt",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Lấy danh mục Tình trạng đợt (DM: TS.KEHOACH.DOT.TINHTRANG)
    -------------------------------------------*/
    getList_TinhTrangDot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.DOT.TINHTRANG",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_TinhTrangDot);
    },

    cbGetList_TinhTrangDot: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtTinhTrangDot = data || [];
        me.genCombo_TinhTrangDot('ddl_TinhTrangDot', '');
    },

    genCombo_TinhTrangDot: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtTinhTrangDot,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn tình trạng đợt",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Reset form Thêm mới đợt
    -------------------------------------------*/
    rewrite_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var arrTxt = [
            'txtDot_Ma', 'txtDot_Ten', 'txtDot_SoDotThu',
            'txtDot_NgayBatDau_DangKy', 'txtDot_NgayKetThuc_DangKy',
            'txtDot_NgayBatDau_NopHS', 'txtDot_NgayKetThuc_NopHS',
            'txtDot_NgayBatDau_XuLy', 'txtDot_NgayKetThuc_XuLy',
            'txtDot_NgayCongBoKQ',
            'txtDot_NgayBatDau_XNNH', 'txtDot_NgayKetThuc_XNNH',
            'txtDot_ChiTieu', 'txtDot_ChiTieuToiThieu', 'txtDot_ChiTieuToiDa',
            'txtDot_GhiChu'
        ];
        edu.util.resetValByArrId(arrTxt);
        // 5 LABEL view-only — set text 0
        $('#lblDot_SoDaDangKy, #lblDot_SoDaNopHS, #lblDot_SoDaTrungTuyen, #lblDot_SoDaTiepNhan, #lblDot_SoDaNhapHoc').text('0');
        $('#ddl_KieuDot, #ddl_MauHoSo, #ddl_TinhTrangDot').val('');
        $('#chkDot_YeuCauCanBoDuyet, #chkDot_YeuCauKiemTraHS, #chkDot_YeuCauThanhToan, #chkDot_ChoPhepThayDoiDauRa, #chkDot_CoMoPublic, #chkDot_CoKhoa').prop('checked', false);
        $('#chkDot_ConHieuLuc').prop('checked', true);
        me.strDot_Id = '';
        $('#them-moi-dot .modal-header .title').html('<i class="fa-regular fa-plus"></i> Thêm mới đợt tuyển sinh');
        $('#btnDelete_Dot').addClass('d-none');  // ẩn nút Xóa khi Thêm mới
    },

    /*------------------------------------------
    -- Dispatcher: nếu strDot_Id có → update, không có → insert
    -------------------------------------------*/
    save_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (edu.util.checkValue(me.strDot_Id)) {
            me.update_Dot();
        } else {
            me.insert_Dot();
        }
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Ins
    -- Thêm mới đợt tuyển sinh
    -------------------------------------------*/
    insert_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Vui lòng chọn kế hoạch tuyển sinh trước khi thêm đợt", "w");
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HggvMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Ins',
            'iM': edu.system.iM,
            'strTs_KeHoach_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTen': edu.system.getValById('txtDot_Ten'),
            'strMa': edu.system.getValById('txtDot_Ma'),
            'dDot_No': edu.system.getValById('txtDot_SoDotThu'),
            'strDot_Type_Code': edu.system.getValById('ddl_KieuDot'),
            'strNgay_BatDau_DangKy': edu.system.getValById('txtDot_NgayBatDau_DangKy'),
            'strNgay_KetThuc_DangKy': edu.system.getValById('txtDot_NgayKetThuc_DangKy'),
            'strNgay_BatDau_Nop_HoSo': edu.system.getValById('txtDot_NgayBatDau_NopHS'),
            'strNgay_KetThuc_Nop_HoSo': edu.system.getValById('txtDot_NgayKetThuc_NopHS'),
            'strNgay_BatDau_XuLy': edu.system.getValById('txtDot_NgayBatDau_XuLy'),
            'strNgay_KetThuc_XuLy': edu.system.getValById('txtDot_NgayKetThuc_XuLy'),
            'strNgay_CongBo_KetQua': edu.system.getValById('txtDot_NgayCongBoKQ'),
            'strNgay_BD_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayBatDau_XNNH'),
            'strNgay_KT_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayKetThuc_XNNH'),
            'strNgay_BatDau_NhapHoc': '',
            'strNgay_KetThuc_NhapHoc': '',
            'dRequire_Approval_In_Dot': $('#chkDot_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Payment_In_Dot': $('#chkDot_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dRequire_Document_In_Dot': $('#chkDot_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dAllow_Change_OP_In_Dot': $('#chkDot_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strForm_Layout_Id': edu.system.getValById('ddl_MauHoSo'),
            'dForm_Version_No': '',
            'dChi_Tieu': edu.system.getValById('txtDot_ChiTieu'),
            'dChi_Tieu_Toi_Thieu': edu.system.getValById('txtDot_ChiTieuToiThieu'),
            'dChi_Tieu_Toi_Da': edu.system.getValById('txtDot_ChiTieuToiDa'),
            'dSo_Da_DangKy': $('#lblDot_SoDaDangKy').text() || 0,
            'dSo_Da_Nop_HoSo': $('#lblDot_SoDaNopHS').text() || 0,
            'dSo_Da_TrungTuyen': $('#lblDot_SoDaTrungTuyen').text() || 0,
            'dSo_Da_TiepNhan': $('#lblDot_SoDaTiepNhan').text() || 0,
            'dSo_Da_NhapHoc': $('#lblDot_SoDaNhapHoc').text() || 0,
            'strDot_Status_Code': edu.system.getValById('ddl_TinhTrangDot'),
            'dIs_Public': $('#chkDot_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Default': 0,
            'dIs_Locked': $('#chkDot_CoKhoa').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkDot_ConHieuLuc').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtDot_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'THEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thêm mới thành công");
                    $("#them-moi-dot").modal('hide');
                    me.getList_DotTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Ins: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Ins (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Upd
    -- Cập nhật đợt tuyển sinh (Xem-sửa)
    -------------------------------------------*/
    update_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strDot_Id)) {
            edu.system.alert("Chưa chọn đợt để sửa", "w");
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HhQxJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Upd',
            'iM': edu.system.iM,
            'strId': me.strDot_Id,
            'strTs_KeHoach_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTen': edu.system.getValById('txtDot_Ten'),
            'strMa': edu.system.getValById('txtDot_Ma'),
            'dDot_No': edu.system.getValById('txtDot_SoDotThu'),
            'strDot_Type_Code': edu.system.getValById('ddl_KieuDot'),
            'strNgay_BatDau_DangKy': edu.system.getValById('txtDot_NgayBatDau_DangKy'),
            'strNgay_KetThuc_DangKy': edu.system.getValById('txtDot_NgayKetThuc_DangKy'),
            'strNgay_BatDau_Nop_HoSo': edu.system.getValById('txtDot_NgayBatDau_NopHS'),
            'strNgay_KetThuc_Nop_HoSo': edu.system.getValById('txtDot_NgayKetThuc_NopHS'),
            'strNgay_BatDau_XuLy': edu.system.getValById('txtDot_NgayBatDau_XuLy'),
            'strNgay_KetThuc_XuLy': edu.system.getValById('txtDot_NgayKetThuc_XuLy'),
            'strNgay_CongBo_KetQua': edu.system.getValById('txtDot_NgayCongBoKQ'),
            'strNgay_BD_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayBatDau_XNNH'),
            'strNgay_KT_XacNhan_NhapHoc': edu.system.getValById('txtDot_NgayKetThuc_XNNH'),
            'strNgay_BatDau_NhapHoc': '',
            'strNgay_KetThuc_NhapHoc': '',
            'dRequire_Approval_In_Dot': $('#chkDot_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Payment_In_Dot': $('#chkDot_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dRequire_Document_In_Dot': $('#chkDot_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dAllow_Change_OP_In_Dot': $('#chkDot_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strForm_Layout_Id': edu.system.getValById('ddl_MauHoSo'),
            'dForm_Version_No': '',
            'dChi_Tieu': edu.system.getValById('txtDot_ChiTieu'),
            'dChi_Tieu_Toi_Thieu': edu.system.getValById('txtDot_ChiTieuToiThieu'),
            'dChi_Tieu_Toi_Da': edu.system.getValById('txtDot_ChiTieuToiDa'),
            'strDot_Status_Code': edu.system.getValById('ddl_TinhTrangDot'),
            'dIs_Public': $('#chkDot_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Default': 0,
            'dIs_Locked': $('#chkDot_CoKhoa').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkDot_ConHieuLuc').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtDot_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#them-moi-dot").modal('hide');
                    me.getList_DotTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Upd: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Upd (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Del
    -- Xóa đợt tuyển sinh
    -------------------------------------------*/
    delete_Dot: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HgUkLQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Del',
            'iM': edu.system.iM,
            'strId': me.strDot_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công");
                    $("#them-moi-dot").modal('hide');
                    me.strDot_Id = '';
                    me.getList_DotTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Del: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Del (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Reset form Kế hoạch (modal #chi-tiet) — dùng cho mode Thêm mới
    -------------------------------------------*/
    rewrite_KeHoach: function () {
        var arrTxt = [
            'txtKH_Ma', 'txtKH_Ten', 'txtKH_NamTuyenSinh', 'txtKH_NamHoc', 'txtKH_HocKy',
            'txtKH_SoHoSoToiDa', 'txtKH_ChiTieu', 'txtKH_GhiChu',
            'lblKH_SoDaDangKy', 'lblKH_SoDaNopHS', 'lblKH_SoDaTrungTuyen',
            'lblKH_SoDaTiepNhan', 'lblKH_SoDaNhapHoc'
        ];
        edu.util.resetValByArrId(arrTxt);
        $('#ddlKH_LoaiNguonTuyenSinh, #ddlKH_PhuongAnTuyenSinh, #ddlKH_MauHoSo, #ddlKH_DonViQLKH, #ddlKH_DonViQLHS, #ddlKH_DonViTiepNhan, #ddlKH_TinhTrang').val('');
        $('#chkKH_TaoTaiKhoan, #chkKH_ChoTSTuDangKy, #chkKH_ChoCanBoNhapHS, #chkKH_ChoImport, #chkKH_ChoDocApi, #chkKH_YeuCauCanBoDuyet, #chkKH_YeuCauKiemTraHS, #chkKH_YeuCauThanhToan, #chkKH_ChoPhepThayDoiDauRa, #chkKH_KiemSoatTrungHS, #chkKH_CoMoPublic, #chkKH_CoKhoa').prop('checked', false);
        $('#chkKH_ConHieuLuc').prop('checked', true);
        $('#chi-tiet .modal-header .title').html('<i class="fa-regular fa-plus"></i> Thêm mới kế hoạch tuyển sinh');
        $('#btnDelete_KH').addClass('d-none');
    },

    /*------------------------------------------
    -- Dispatcher: nếu strKeHoachTuyenSinh_Id có → update, không → insert
    -------------------------------------------*/
    save_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.update_KeHoachTuyenSinh();
        } else {
            me.insert_KeHoachTuyenSinh();
        }
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Create
    -- Thêm mới kế hoạch tuyển sinh
    -------------------------------------------*/
    insert_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCiQJLiAiKR4VNDgkLxIoLykeAjMkIDUk',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Create',
            'iM': edu.system.iM,
            'strMa': edu.system.getValById('txtKH_Ma'),
            'strTen': edu.system.getValById('txtKH_Ten'),
            'strLoai_TuyenSinh_Id': edu.system.getValById('ddlKH_LoaiNguonTuyenSinh'),
            'strTs_PhuongAn_TuyenSinh_Id': edu.system.getValById('ddlKH_PhuongAnTuyenSinh'),
            'strNam_TuyenSinh': edu.system.getValById('txtKH_NamTuyenSinh'),
            'strNam_Hoc': edu.system.getValById('txtKH_NamHoc'),
            'strHoc_Ky': edu.system.getValById('txtKH_HocKy'),
            'dRequire_Account': $('#chkKH_TaoTaiKhoan').is(':checked') ? 1 : 0,
            'dAllow_Online_Register': $('#chkKH_ChoTSTuDangKy').is(':checked') ? 1 : 0,
            'dAllow_Direct_Input': $('#chkKH_ChoCanBoNhapHS').is(':checked') ? 1 : 0,
            'dAllow_Import': $('#chkKH_ChoImport').is(':checked') ? 1 : 0,
            'dAllow_Api': $('#chkKH_ChoDocApi').is(':checked') ? 1 : 0,
            'dRequire_Approval': $('#chkKH_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Document_Check': $('#chkKH_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dRequire_Pay_Before_Intake': $('#chkKH_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dAllow_Change_Output': $('#chkKH_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strHoso_Unique_Scope_Code': $('#chkKH_KiemSoatTrungHS').is(':checked') ? '1' : '',
            'dMax_Hoso_Per_Person': edu.system.getValById('txtKH_SoHoSoToiDa'),
            'strForm_Layout_Id': edu.system.getValById('ddlKH_MauHoSo'),
            'strForm_Version_No': '',
            'strOwner_Org_Id': edu.system.getValById('ddlKH_DonViQLKH'),
            'strManage_Org_Id': edu.system.getValById('ddlKH_DonViQLHS'),
            'strReceive_Org_Id': edu.system.getValById('ddlKH_DonViTiepNhan'),
            'dChi_Tieu': edu.system.getValById('txtKH_ChiTieu'),
            'strPlan_Status_Code': edu.system.getValById('ddlKH_TinhTrang'),
            'dIs_Public': $('#chkKH_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Locked': $('#chkKH_CoKhoa').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtKH_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'THEM'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thêm mới thành công");
                    if (edu.util.checkValue(data.Id)) {
                        me.strKeHoachTuyenSinh_Id = data.Id;
                    }
                    $("#chi-tiet").modal('hide');
                    me.getList_KeHoachTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Create: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Create (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Update
    -- Lưu chỉnh sửa kế hoạch tuyển sinh
    -------------------------------------------*/
    update_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Chưa chọn kế hoạch để sửa", "w");
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCiQJLiAiKR4VNDgkLxIoLykeFDElIDUk',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Update',
            'iM': edu.system.iM,
            'strId': me.strKeHoachTuyenSinh_Id,
            'strMa': edu.system.getValById('txtKH_Ma'),
            'strTen': edu.system.getValById('txtKH_Ten'),
            'strLoai_TuyenSinh_Id': edu.system.getValById('ddlKH_LoaiNguonTuyenSinh'),
            'strTs_PhuongAn_TuyenSinh_Id': edu.system.getValById('ddlKH_PhuongAnTuyenSinh'),
            'strNam_TuyenSinh': edu.system.getValById('txtKH_NamTuyenSinh'),
            'strNam_Hoc': edu.system.getValById('txtKH_NamHoc'),
            'strHoc_Ky': edu.system.getValById('txtKH_HocKy'),
            'dRequire_Account': $('#chkKH_TaoTaiKhoan').is(':checked') ? 1 : 0,
            'dAllow_Online_Register': $('#chkKH_ChoTSTuDangKy').is(':checked') ? 1 : 0,
            'dAllow_Direct_Input': $('#chkKH_ChoCanBoNhapHS').is(':checked') ? 1 : 0,
            'dAllow_Import': $('#chkKH_ChoImport').is(':checked') ? 1 : 0,
            'dAllow_Api': $('#chkKH_ChoDocApi').is(':checked') ? 1 : 0,
            'dRequire_Approval': $('#chkKH_YeuCauCanBoDuyet').is(':checked') ? 1 : 0,
            'dRequire_Document_Check': $('#chkKH_YeuCauKiemTraHS').is(':checked') ? 1 : 0,
            'dRequire_Pay_Before_Intake': $('#chkKH_YeuCauThanhToan').is(':checked') ? 1 : 0,
            'dAllow_Change_Output': $('#chkKH_ChoPhepThayDoiDauRa').is(':checked') ? 1 : 0,
            'strHoso_Unique_Scope_Code': $('#chkKH_KiemSoatTrungHS').is(':checked') ? '1' : '',
            'dMax_Hoso_Per_Person': edu.system.getValById('txtKH_SoHoSoToiDa'),
            'strForm_Layout_Id': edu.system.getValById('ddlKH_MauHoSo'),
            'strForm_Version_No': '',
            'strOwner_Org_Id': edu.system.getValById('ddlKH_DonViQLKH'),
            'strManage_Org_Id': edu.system.getValById('ddlKH_DonViQLHS'),
            'strReceive_Org_Id': edu.system.getValById('ddlKH_DonViTiepNhan'),
            'dChi_Tieu': edu.system.getValById('txtKH_ChiTieu'),
            'strPlan_Status_Code': edu.system.getValById('ddlKH_TinhTrang'),
            'dIs_Public': $('#chkKH_CoMoPublic').is(':checked') ? 1 : 0,
            'dIs_Locked': $('#chkKH_CoKhoa').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtKH_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#chi-tiet").modal('hide');
                    me.getList_KeHoachTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Update: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Update (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_By_Id
    -- Lấy chi tiết đợt theo ID
    -------------------------------------------*/
    getDetail_Dot: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HgYkNR4DOB4IJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_By_Id',
            'iM': edu.system.iM,
            'strId': strId
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = null;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = Array.isArray(data.Data) ? data.Data[0] : data.Data;
                    }
                    me.dtChiTietDot = dtResult;
                    me.view_ChiTietDot(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Đổ data đợt vào modal #them-moi-dot (chế độ Xem-sửa)
    -- NOTE: tên cột (Ma, Ten, DOT_NO, DOT_TYPE_CODE, NGAY_BATDAU_DANGKY, ...) đoán theo convention.
    --       Nếu API trả khác thì sửa lại tại đây.
    -------------------------------------------*/
    view_ChiTietDot: function (data) {
        if (!data) return;
        var d = data;

        // Đổi title sang chế độ Xem-sửa + hiện nút Xóa
        $('#them-moi-dot .modal-header .title').html('<i class="fa-regular fa-pen-to-square"></i> Xem - sửa đợt tuyển sinh');
        $('#btnDelete_Dot').removeClass('d-none');

        edu.util.viewValById('txtDot_Ma', d.Ma || d.MA || '');
        edu.util.viewValById('txtDot_Ten', d.Ten || d.TEN || '');
        edu.util.viewValById('txtDot_SoDotThu', d.DOT_NO || '');
        edu.util.viewValById('txtDot_NgayBatDau_DangKy', d.NGAY_BATDAU_DANGKY || '');
        edu.util.viewValById('txtDot_NgayKetThuc_DangKy', d.NGAY_KETTHUC_DANGKY || '');
        edu.util.viewValById('txtDot_NgayBatDau_NopHS', d.NGAY_BATDAU_NOP_HOSO || '');
        edu.util.viewValById('txtDot_NgayKetThuc_NopHS', d.NGAY_KETTHUC_NOP_HOSO || '');
        edu.util.viewValById('txtDot_NgayBatDau_XuLy', d.NGAY_BATDAU_XULY || '');
        edu.util.viewValById('txtDot_NgayKetThuc_XuLy', d.NGAY_KETTHUC_XULY || '');
        edu.util.viewValById('txtDot_NgayCongBoKQ', d.NGAY_CONGBO_KETQUA || '');
        edu.util.viewValById('txtDot_NgayBatDau_XNNH', d.NGAY_BD_XACNHAN_NHAPHOC || '');
        edu.util.viewValById('txtDot_NgayKetThuc_XNNH', d.NGAY_KT_XACNHAN_NHAPHOC || '');
        edu.util.viewValById('txtDot_ChiTieu', d.CHI_TIEU || '');
        edu.util.viewValById('txtDot_ChiTieuToiThieu', d.CHI_TIEU_TOI_THIEU || '');
        edu.util.viewValById('txtDot_ChiTieuToiDa', d.CHI_TIEU_TOI_DA || '');
        edu.util.viewValById('txtDot_GhiChu', d.GHICHU || '');

        // 5 LABEL view-only — set text trực tiếp (span chứ không phải input)
        $('#lblDot_SoDaDangKy').text(d.SO_DA_DANGKY || 0);
        $('#lblDot_SoDaNopHS').text(d.SO_DA_NOP_HOSO || 0);
        $('#lblDot_SoDaTrungTuyen').text(d.SO_DA_TRUNGTUYEN || 0);
        $('#lblDot_SoDaTiepNhan').text(d.SO_DA_TIEPNHAN || 0);
        $('#lblDot_SoDaNhapHoc').text(d.SO_DA_NHAPHOC || 0);

        $('#ddl_KieuDot').val(d.DOT_TYPE_CODE || '');
        $('#ddl_MauHoSo').val(d.FORM_LAYOUT_ID || '');
        $('#ddl_TinhTrangDot').val(d.DOT_STATUS_CODE || '');

        $('#chkDot_YeuCauCanBoDuyet').prop('checked', d.REQUIRE_APPROVAL_IN_DOT == 1);
        $('#chkDot_YeuCauKiemTraHS').prop('checked', d.REQUIRE_DOCUMENT_IN_DOT == 1);
        $('#chkDot_YeuCauThanhToan').prop('checked', d.REQUIRE_PAYMENT_IN_DOT == 1);
        $('#chkDot_ChoPhepThayDoiDauRa').prop('checked', d.ALLOW_CHANGE_OP_IN_DOT == 1);
        $('#chkDot_CoMoPublic').prop('checked', d.IS_PUBLIC == 1);
        $('#chkDot_CoKhoa').prop('checked', d.IS_LOCKED == 1);
        $('#chkDot_ConHieuLuc').prop('checked', d.IS_ACTIVE == 1);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_Ds
    -- Lấy danh sách đợt theo kế hoạch (modal #dot-tuyen-sinh)
    -------------------------------------------*/
    getList_DotTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.genTable_DotTuyenSinh([]);
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeFTIeBS41HgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ts_Dot_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strTs_KeHoach_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strDot_Status_Code': '',
            'dIs_Active': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtDotTuyenSinh = dtResult;
                    me.genTable_DotTuyenSinh(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ts_Dot_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng đợt tuyển sinh trong modal #dot-tuyen-sinh
    -- Fallback nhiều casing vì API có thể trả MA/TEN (uppercase) hoặc Ma/Ten (PascalCase).
    -- Kiểu đợt + Tình trạng đợt: lookup từ cache DM local (dtKieuDot / dtTinhTrangDot)
    -- thay vì dựa vào API join sẵn để tránh phụ thuộc tên cột _Ten.
    -------------------------------------------*/
    genTable_DotTuyenSinh: function (data) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var $tbody = $("#tblDotTuyenSinh tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="17">Không có dữ liệu</td></tr>');
            return;
        }

        var lookupTen = function (arrDM, ma) {
            if (!ma || !arrDM || !arrDM.length) return '';
            for (var j = 0; j < arrDM.length; j++) {
                if (arrDM[j].MA == ma) return arrDM[j].TEN || '';
            }
            return ma;
        };

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || d.Id || d.id || '';
            var sMa = d.MA || d.Ma || '';
            var sTen = d.TEN || d.Ten || '';
            var sKieuDot = d.DOT_TYPE_CODE_Ten || d.KIEUDOT_TEN || lookupTen(me.dtKieuDot, d.DOT_TYPE_CODE);
            var sTinhTrang = d.DOT_STATUS_CODE_Ten || d.TINHTRANG_TEN || lookupTen(me.dtTinhTrangDot, d.DOT_STATUS_CODE);
            var sNgayBD = d.NGAY_BATDAU_DANGKY || d.Ngay_BatDau_DangKy || '';
            var sNgayKT = d.NGAY_KETTHUC_DANGKY || d.Ngay_KetThuc_DangKy || '';
            var sNguoiTao = d.NGUOITAO_TaiKhoan || d.NGUOITAO_TEN || d.NGUOI_TAO || d.NguoiTao || '';
            var sNgayTao = d.NgayTao_dd_mm_yyyy_hhmmss || d.NGAY_TAO || d.NgayTao || '';

            rows += '<tr id="row_dot_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + sMa + '</td>'
                +  '<td class="td-left">' + sTen + '</td>'
                +  '<td class="td-left">' + sKieuDot + '</td>'
                +  '<td class="td-center">' + sNgayBD + '</td>'
                +  '<td class="td-center">' + sNgayKT + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Phương thức tuyển" data-bs-toggle="modal" data-bs-target="#phuong-thuc-tuyen">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kế hoạch đầu ra" data-bs-toggle="modal" data-bs-target="#ke-hoach-dau-ra">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Mẫu khai hồ sơ" data-bs-toggle="modal" data-bs-target="#mau-khai-hs">Xem</a></td>'
                +  '<td class="td-center"><a class="btn btn-default btnview" data-id="' + strId + '" title="Kết quả đăng ký" data-bs-toggle="modal" data-bs-target="#ket-qua-dk">Xem</a></td>'
                +  '<td class="td-left">' + sTinhTrang + '</td>'
                +  '<td class="td-center">' + (d.IS_PUBLIC == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_LOCKED == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.IS_ACTIVE == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + sNguoiTao + '</td>'
                +  '<td class="td-center">' + sNgayTao + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetailDot" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết" data-bs-toggle="modal" data-bs-target="#them-moi-dot">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Lấy danh mục Vai trò phân công (DM: TS.KEHOACH.NHANSU.VAITRO)
    -------------------------------------------*/
    getList_VaiTro_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = {
            strMaBangDanhMuc: "TS.KEHOACH.NHANSU.VAITRO",
            strTenCotSapXep: "",
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_VaiTro_PhanCong);
    },

    cbGetList_VaiTro_PhanCong: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtVaiTro_PhanCong = data || [];
        me.genCombo_VaiTro_PhanCong('ddlXS_VaiTro', '');         // modal Xem-sửa
        me.genCombo_VaiTro_PhanCong('ddlPC_New_VaiTro', '');     // modal Thêm mới (form chung)
    },

    genCombo_VaiTro_PhanCong: function (strDrop_Id, default_val) {
        var me = this;
        var obj = {
            data: me.dtVaiTro_PhanCong,
            renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
            renderPlace: [strDrop_Id],
            title: "Chọn vai trò",
            default_val: default_val
        };
        edu.system.loadToCombo_data(obj);
    },

    /*------------------------------------------
    -- Reset form Thêm mới phân công nhân sự
    -------------------------------------------*/
    rewrite_PhanCong: function () {
        $("#tblNhanSuDaChon tbody").html("");
        $("#chkPC_SelectAll").prop('checked', false);
        // Reset form chung (Section B)
        $('#ddlPC_New_VaiTro').val('');
        $('#txtPC_New_NgayBatDau, #txtPC_New_NgayKetThuc, #txtPC_New_GhiChu').val('');
        $('#chkPC_New_Allowed, #chkPC_New_Active').prop('checked', true);
    },

    /*------------------------------------------
    -- Public method: shared picker gọi lại sau khi user chọn xong nhân sự
    -- arrPersons: [{ID, FULL_NAME, current_employee_code}, ...]
    -- Mỗi row chỉ chứa Stt | Thông tin NS | checkbox Chọn — Vai trò/Ngày/Ghi chú
    -- khai chung 1 lần ở Section B.
    -------------------------------------------*/
    addNhanSu_PhanCong: function (arrPersons) {
        if (!arrPersons || !arrPersons.length) return;

        var $tbody = $("#tblNhanSuDaChon tbody");
        var startIdx = $tbody.find('tr').length;
        var rows = '';
        for (var i = 0; i < arrPersons.length; i++) {
            var p = arrPersons[i];
            var stt = startIdx + i + 1;
            var personId = p.ID || '';
            var nhanSuTen = (p.FULL_NAME || '') + (p.current_employee_code ? ' - ' + p.current_employee_code : '');
            rows += '<tr data-person-id="' + personId + '">'
                +  '<td class="td-center td-fix">' + stt + '</td>'
                +  '<td class="td-left">' + nhanSuTen + '</td>'
                +  '<td class="td-center"><input type="checkbox" class="pc-select" checked /></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Ins
    -- Form chung (Section B) khai 1 lần → áp cho mọi nhân sự được tick.
    -------------------------------------------*/
    save_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Vui lòng chọn kế hoạch tuyển sinh trước", "w");
            return;
        }

        var $rows = $("#tblNhanSuDaChon tbody tr");
        if ($rows.length === 0) {
            edu.system.alert("Vui lòng chọn nhân sự để phân công", "w");
            return;
        }

        var arrPersonIds = [];
        $rows.each(function () {
            var $r = $(this);
            if (!$r.find('.pc-select').is(':checked')) return;
            var pid = $r.attr('data-person-id') || '';
            if (pid) arrPersonIds.push(pid);
        });

        if (arrPersonIds.length === 0) {
            edu.system.alert("Không có nhân sự nào được tích chọn để lưu", "w");
            return;
        }

        var common = {
            strRole_Code: edu.system.getValById('ddlPC_New_VaiTro'),
            strNgay_BatDau: edu.system.getValById('txtPC_New_NgayBatDau'),
            strNgay_KetThuc: edu.system.getValById('txtPC_New_NgayKetThuc'),
            dIs_Allowed: $('#chkPC_New_Allowed').is(':checked') ? 1 : 0,
            dIs_Active: $('#chkPC_New_Active').is(':checked') ? 1 : 0,
            strGhiChu: edu.system.getValById('txtPC_New_GhiChu')
        };

        var done = 0, failed = 0, total = arrPersonIds.length;
        var finalize = function () {
            if (done + failed !== total) return;
            edu.system.alert("Đã lưu " + done + "/" + total + (failed ? " (lỗi: " + failed + ")" : ""));
            $("#them-moi-nhansu").modal('hide');
            me.getList_PhanCongNhanSu();
        };

        arrPersonIds.forEach(function (personId) {
            var obj_save = {
                'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeCC8y',
                'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Ins',
                'iM': edu.system.iM,
                'strPerson_Id': personId,
                'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
                'strTs_Kh_TuyenSinh_Dot_Id': '',
                'strTs_Kh_Dot_PhuongThuc_Id': '',
                'strRole_Code': common.strRole_Code,
                'strAction_Code': '',
                'strScope_Level_Code': '',
                'strNgay_BatDau': common.strNgay_BatDau,
                'strNgay_KetThuc': common.strNgay_KetThuc,
                'dIs_Allowed': common.dIs_Allowed,
                'dIs_Active': common.dIs_Active,
                'strGhiChu': common.strGhiChu,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
                'strHanhDong_Code': 'THEM'
            };

            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) done++; else failed++;
                    finalize();
                },
                error: function () {
                    failed++;
                    finalize();
                },
                type: 'POST',
                contentType: true,
                action: obj_save.action,
                data: obj_save,
                fakedb: []
            }, false, false, false, null);
        });
    },

    /*------------------------------------------
    -- Reset modal Thêm mới kế hoạch đầu ra
    -------------------------------------------*/
    rewrite_DauRa: function () {
        $("#ddlDR_HeDaoTao").html('<option value="">Chọn hệ đào tạo</option>');
        $("#ddlDR_KhoaDaoTao").html('<option value="">Chọn khóa đào tạo</option>');
        $("#tblChuongTrinhDauRa tbody").html("");
        $("#chkDR_SelectAll").prop('checked', false);
        // Reset section "Thông tin chung"
        $('#ddlDR_New_LoaiDauRa, #ddlDR_New_KieuHocTap, #ddlDR_New_TrangThai').val('');
        $('#chkDR_New_HighLight, #chkDR_New_AllowRegister, #chkDR_New_AllowWaitlist, #chkDR_New_AllowTransferIn, #chkDR_New_AutoIntake, #chkDR_New_AutoEnrollment, #chkDR_New_AutoClassAssign, #chkDR_New_Public').prop('checked', false);
        $('#chkDR_New_Active').prop('checked', true);
    },

    /*------------------------------------------
    -- [Shared] KHCT_HeDaoTao/LayDanhSach
    -------------------------------------------*/
    getList_HeDaoTao_DR: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtHeDaoTao_DR = edu.util.checkValue(data.Data) ? data.Data : [];
                    var obj = {
                        data: me.dtHeDaoTao_DR,
                        renderInfor: { id: "ID", parentId: "", name: "TENHEDAOTAO" },
                        renderPlace: ['ddlDR_HeDaoTao'],
                        title: "Chọn hệ đào tạo"
                    };
                    edu.system.loadToCombo_data(obj);
                }
            },
            error: function () { },
            type: 'GET',
            action: 'KHCT_HeDaoTao/LayDanhSach',
            contentType: true,
            data: {
                'strTuKhoa': '',
                'strDaoTao_HinhThucDaoTao_Id': '',
                'strDaoTao_BacDaoTao_Id': '',
                'strNguoiThucHien_Id': '',
                'pageIndex': 1,
                'pageSize': 100000000
            },
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- [Shared] KHCT_KhoaDaoTao/LayDanhSach (cascading từ Hệ)
    -------------------------------------------*/
    getList_KhoaDaoTao_DR: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKhoaDaoTao_DR = edu.util.checkValue(data.Data) ? data.Data : [];
                    var obj = {
                        data: me.dtKhoaDaoTao_DR,
                        renderInfor: { id: "ID", parentId: "", name: "TENKHOA" },
                        renderPlace: ['ddlDR_KhoaDaoTao'],
                        title: "Chọn khóa đào tạo"
                    };
                    edu.system.loadToCombo_data(obj);
                }
            },
            error: function () { },
            type: 'GET',
            action: 'KHCT_KhoaDaoTao/LayDanhSach',
            contentType: true,
            data: {
                'strTuKhoa': '',
                'strDaoTao_HeDaoTao_Id': edu.system.getValById('ddlDR_HeDaoTao'),
                'strDaoTao_CoSoDaoTao_Id': '',
                'strNguoiThucHien_Id': '',
                'pageIndex': 1,
                'pageSize': 10000000
            },
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- [Shared] Lấy danh sách chương trình theo Hệ + Khóa
    -- TODO: bạn xác nhận action hash chính xác (đoán: KHCT_ToChucChuongTrinh/LayDanhSach)
    -------------------------------------------*/
    getList_ChuongTrinh_DR: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtChuongTrinh_DR = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.genTable_ChuongTrinh_DR(me.dtChuongTrinh_DR);
                }
                else {
                    edu.system.alert("KHCT_ToChucChuongTrinh/LayDanhSach: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("KHCT_ToChucChuongTrinh/LayDanhSach (ex): " + JSON.stringify(er), "w");
                me.genTable_ChuongTrinh_DR([]);
            },
            type: 'GET',
            action: 'KHCT_ToChucChuongTrinh/LayDanhSach',
            contentType: true,
            data: {
                'strTuKhoa': '',
                'strDaoTao_KhoaDaoTao_Id': edu.system.getValById('ddlDR_KhoaDaoTao'),
                'strDaoTao_HeDaoTao_Id': edu.system.getValById('ddlDR_HeDaoTao'),
                'strDaoTao_N_CN_Id': '',
                'strDaoTao_KhoaQuanLy_Id': '',
                'strDaoTao_ToChucCT_Cha_Id': '',
                'strNguoiThucHien_Id': '',
                'pageIndex': 1,
                'pageSize': 100000
            },
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng chương trình với input editable
    -- Cột data API trả (UPPERCASE): MACHUONGTRINH, TENCHUONGTRINH, NGANHTUYENSINH_TEN, DAOTAO_N_CN_TEN
    -- Tham khảo: ApisKeHoachChuongTrinh/.../chuongtrinh.js (genTable_ChuongTrinh)
    -------------------------------------------*/
    genTable_ChuongTrinh_DR: function (data) {
        var $tbody = $("#tblChuongTrinhDauRa tbody");
        $tbody.html("");
        $("#chkDR_SelectAll").prop('checked', false);

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="9">Không có chương trình</td></tr>');
            return;
        }

        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var ctId = d.ID || '';
            rows += '<tr data-ct-id="' + ctId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + (d.MACHUONGTRINH || '') + '</td>'
                +  '<td class="td-left">' + (d.TENCHUONGTRINH || '') + '</td>'
                +  '<td class="td-left">' + (d.NGANHTUYENSINH_TEN || '') + '</td>'
                +  '<td class="td-left">' + (d.DAOTAO_N_CN_TEN || '') + '</td>'
                +  '<td class="td-center"><input type="number" class="form-control ct-chitieu" min="0"></td>'
                +  '<td class="td-center"><input type="number" class="form-control ct-chitieu-toida" min="0"></td>'
                +  '<td class="td-center"><input type="number" class="form-control ct-chitieu-toithieu" min="0"></td>'
                +  '<td class="td-center"><input type="checkbox" class="ct-select"></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Ins
    -- Lưu hàng loạt: mỗi chương trình được tick → 1 lần gọi Insert.
    -- Thông tin chung (Loại đầu ra / Kiểu học / 7 cờ cấu hình / Trạng thái / Public / Hiệu lực)
    -- áp chung cho tất cả các bản ghi. Chỉ tiêu/Tối đa/Tối thiểu lấy theo từng row.
    -------------------------------------------*/
    save_DauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Vui lòng chọn kế hoạch tuyển sinh trước", "w");
            return;
        }

        var arrTasks = [];
        $("#tblChuongTrinhDauRa tbody tr").each(function () {
            var $r = $(this);
            if (!$r.find('.ct-select').is(':checked')) return;
            arrTasks.push({
                'strDaotao_ChuongTrinh_Id': $r.attr('data-ct-id') || '',
                'dChi_Tieu': $r.find('.ct-chitieu').val() || '',
                'dChi_Tieu_Toi_Da': $r.find('.ct-chitieu-toida').val() || '',
                'dChi_Tieu_Toi_Thieu': $r.find('.ct-chitieu-toithieu').val() || ''
            });
        });

        if (arrTasks.length === 0) {
            edu.system.alert("Vui lòng tích chọn ít nhất 1 chương trình để tạo đầu ra", "w");
            return;
        }

        var common = {
            strDau_Ra_Type_Code: edu.system.getValById('ddlDR_New_LoaiDauRa'),
            strStudy_Type_Code: edu.system.getValById('ddlDR_New_KieuHocTap'),
            strOutput_Status_Code: edu.system.getValById('ddlDR_New_TrangThai'),
            dIs_HighLight: $('#chkDR_New_HighLight').is(':checked') ? 1 : 0,
            dIs_Allow_Register: $('#chkDR_New_AllowRegister').is(':checked') ? 1 : 0,
            dIs_Allow_Waitlist: $('#chkDR_New_AllowWaitlist').is(':checked') ? 1 : 0,
            dIs_Allow_Transfer_In: $('#chkDR_New_AllowTransferIn').is(':checked') ? 1 : 0,
            dIs_Auto_Intake: $('#chkDR_New_AutoIntake').is(':checked') ? 1 : 0,
            dIs_Auto_Enrollment: $('#chkDR_New_AutoEnrollment').is(':checked') ? 1 : 0,
            dIs_Auto_Class_Assign: $('#chkDR_New_AutoClassAssign').is(':checked') ? 1 : 0,
            dIs_Public: $('#chkDR_New_Public').is(':checked') ? 1 : 0,
            dIs_Active: $('#chkDR_New_Active').is(':checked') ? 1 : 0
        };

        var done = 0, failed = 0, total = arrTasks.length;
        var finalize = function () {
            if (done + failed !== total) return;
            edu.system.alert("Đã thêm " + done + "/" + total + (failed ? " (lỗi: " + failed + ")" : ""));
            $("#them-moi-dau-ra").modal('hide');
            me.getList_KeHoachDauRa();
        };

        arrTasks.forEach(function (task) {
            var obj_save = {
                'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHggvMgPP',
                'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Ins',
                'iM': edu.system.iM,
                'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
                'strTs_Kh_TuyenSinh_Dot_Id': me.strDot_Id_ForDauRa || '',
                'strTs_Kh_Dot_PhuongThuc_Id': '',
                'strMa': '',
                'strTen': '',
                'strDau_Ra_Type_Code': common.strDau_Ra_Type_Code,
                'strStudy_Type_Code': common.strStudy_Type_Code,
                'strDaotao_HeDaoTao_Id': '',
                'strDaotao_KhoaDaoTao_Id': '',
                'strDaotao_ChuongTrinh_Id': task.strDaotao_ChuongTrinh_Id,
                'strDaotao_Nganh_Dt_Id': '',
                'strDaotao_Nganh_Ts_Id': '',
                'strTen_HienThi': '',
                'strMa_HienThi': '',
                'strMoTa_HienThi': '',
                'dThu_Tu_HienThi': '',
                'dIs_HighLight': common.dIs_HighLight,
                'dChi_Tieu': task.dChi_Tieu,
                'dChi_Tieu_Toi_Da': task.dChi_Tieu_Toi_Da,
                'dChi_Tieu_Toi_Thieu': task.dChi_Tieu_Toi_Thieu,
                'dIs_Allow_Register': common.dIs_Allow_Register,
                'dIs_Allow_Waitlist': common.dIs_Allow_Waitlist,
                'dIs_Allow_Transfer_In': common.dIs_Allow_Transfer_In,
                'dIs_Auto_Intake': common.dIs_Auto_Intake,
                'dIs_Auto_Enrollment': common.dIs_Auto_Enrollment,
                'dIs_Auto_Class_Assign': common.dIs_Auto_Class_Assign,
                'strOutput_Status_Code': common.strOutput_Status_Code,
                'dIs_Public': common.dIs_Public,
                'dIs_Active': common.dIs_Active,
                'strGhiChu': '',
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
                'strHanhDong_Code': 'THEM'
            };

            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) done++; else failed++;
                    finalize();
                },
                error: function () {
                    failed++;
                    finalize();
                },
                type: 'POST',
                contentType: true,
                action: obj_save.action,
                data: obj_save,
                fakedb: []
            }, false, false, false, null);
        });
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_By_Id
    -- Lấy chi tiết kế hoạch đầu ra theo ID
    -------------------------------------------*/
    getDetail_DauRa: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHgYkNR4DOB4IJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_By_Id',
            'iM': edu.system.iM,
            'strId': strId
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = null;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = Array.isArray(data.Data) ? data.Data[0] : data.Data;
                    }
                    me.dtChiTietDauRa = dtResult;
                    me.view_ChiTietDauRa(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Lấy DM Loại đầu ra (TS.KEHOACH.DAURA.LOAI)
    -------------------------------------------*/
    getList_LoaiDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = { strMaBangDanhMuc: "TS.KEHOACH.DAURA.LOAI", strTenCotSapXep: "", iTrangThai: 1 };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_LoaiDauRa);
    },
    cbGetList_LoaiDauRa: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtLoaiDauRa = data || [];
        var info = { id: "MA", parentId: "", name: "TEN", code: "MA" };
        edu.system.loadToCombo_data({ data: me.dtLoaiDauRa, renderInfor: info, renderPlace: ['ddlDR_LoaiDauRa'], title: "Chọn loại đầu ra" });
        edu.system.loadToCombo_data({ data: me.dtLoaiDauRa, renderInfor: info, renderPlace: ['ddlDR_New_LoaiDauRa'], title: "Chọn loại đầu ra" });
    },

    /*------------------------------------------
    -- Lấy DM Kiểu học sau khi vào học (TS.KEHOACH.DAURA.KIEUHOC)
    -------------------------------------------*/
    getList_KieuHocTap: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = { strMaBangDanhMuc: "TS.KEHOACH.DAURA.KIEUHOC", strTenCotSapXep: "", iTrangThai: 1 };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_KieuHocTap);
    },
    cbGetList_KieuHocTap: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtKieuHocTap = data || [];
        var info = { id: "MA", parentId: "", name: "TEN", code: "MA" };
        edu.system.loadToCombo_data({ data: me.dtKieuHocTap, renderInfor: info, renderPlace: ['ddlDR_KieuHocTap'], title: "Chọn kiểu học" });
        edu.system.loadToCombo_data({ data: me.dtKieuHocTap, renderInfor: info, renderPlace: ['ddlDR_New_KieuHocTap'], title: "Chọn kiểu học" });
    },

    /*------------------------------------------
    -- Lấy DM Trạng thái đầu ra (TS.KEHOACH.DAURA.TRANGTHAI)
    -------------------------------------------*/
    getList_TrangThaiDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj = { strMaBangDanhMuc: "TS.KEHOACH.DAURA.TRANGTHAI", strTenCotSapXep: "", iTrangThai: 1 };
        edu.system.getList_DanhMucDulieu(obj, "", "", me.cbGetList_TrangThaiDauRa);
    },
    cbGetList_TrangThaiDauRa: function (data, iPager) {
        var me = main_doc.KeHoachTuyenSinhNew;
        me.dtTrangThaiDauRa = data || [];
        var info = { id: "MA", parentId: "", name: "TEN", code: "MA" };
        edu.system.loadToCombo_data({ data: me.dtTrangThaiDauRa, renderInfor: info, renderPlace: ['ddlDR_TrangThai'], title: "Chọn trạng thái" });
        edu.system.loadToCombo_data({ data: me.dtTrangThaiDauRa, renderInfor: info, renderPlace: ['ddlDR_New_TrangThai'], title: "Chọn trạng thái" });
    },

    /*------------------------------------------
    -- Đổ data kế hoạch đầu ra vào modal #xem-sua-dau-ra
    -- NOTE: tên cột đoán theo convention list API (Ma, Ten, DAU_RA_TYPE_CODE, ...)
    --       Sửa lại tại đây nếu API trả tên khác.
    -------------------------------------------*/
    view_ChiTietDauRa: function (data) {
        if (!data) return;
        var d = data;

        $('#lblDR_He').text(d.DAOTAO_HEDAOTAO_Ten || d.DAOTAO_HEDAOTAO_TEN || '');
        $('#lblDR_Khoa').text(d.DAOTAO_KHOADAOTAO_Ten || d.DAOTAO_KHOADAOTAO_TEN || '');
        $('#lblDR_ChuongTrinh').text(d.DAOTAO_TOCHUCCHUONGTRINH_Ten || d.DAOTAO_TOCHUCCHUONGTRINH_TEN || '');

        edu.util.viewValById('txtDR_ChiTieu', d.CHI_TIEU || '');
        edu.util.viewValById('txtDR_ChiTieuToiDa', d.CHI_TIEU_TOI_DA || '');
        edu.util.viewValById('txtDR_ChiTieuToiThieu', d.CHI_TIEU_TOI_THIEU || '');

        edu.util.viewValById('txtDR_Ma', d.Ma || d.MA || '');
        edu.util.viewValById('txtDR_Ten', d.Ten || d.TEN || '');
        edu.util.viewValById('txtDR_MaHienThi', d.MA_HIENTHI || '');
        edu.util.viewValById('txtDR_TenHienThi', d.TEN_HIENTHI || '');

        $('#ddlDR_LoaiDauRa').val(d.DAU_RA_TYPE_CODE || '');
        $('#ddlDR_KieuHocTap').val(d.STUDY_TYPE_CODE || '');
        $('#ddlDR_TrangThai').val(d.OUTPUT_STATUS_CODE || '');

        $('#chkDR_HighLight').prop('checked', d.IS_HIGHLIGHT == 1);
        edu.util.viewValById('txtDR_ThuTuHienThi', d.THU_TU_HIENTHI || '');

        $('#chkDR_AllowRegister').prop('checked', d.IS_ALLOW_REGISTER == 1);
        $('#chkDR_AllowWaitlist').prop('checked', d.IS_ALLOW_WAITLIST == 1);
        $('#chkDR_AllowTransferIn').prop('checked', d.IS_ALLOW_TRANSFER_IN == 1);
        $('#chkDR_AutoIntake').prop('checked', d.IS_AUTO_INTAKE == 1);
        $('#chkDR_AutoEnrollment').prop('checked', d.IS_AUTO_ENROLLMENT == 1);
        $('#chkDR_AutoClassAssign').prop('checked', d.IS_AUTO_CLASS_ASSIGN == 1);

        $('#chkDR_Public').prop('checked', d.IS_PUBLIC == 1);
        $('#chkDR_Active').prop('checked', (d.is_active || d.IS_ACTIVE) == 1);
        edu.util.viewValById('txtDR_GhiChu', d.GHICHU || '');
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Upd
    -- Cập nhật kế hoạch đầu ra (Xem-sửa)
    -------------------------------------------*/
    update_DauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strDauRa_Id)) {
            edu.system.alert("Chưa chọn đầu ra để sửa", "w");
            return;
        }

        // Lấy ID Hệ/Khóa/CT/Ngành từ cache (vì label readonly không lưu được trên UI)
        var c = me.dtChiTietDauRa || {};

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHhQxJQPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Upd',
            'iM': edu.system.iM,
            'strId': me.strDauRa_Id,
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': c.TS_KH_TUYENSINH_DOT_ID || '',
            'strTs_Kh_Dot_PhuongThuc_Id': c.TS_KH_DOT_PHUONGTHUC_ID || '',
            'strMa': edu.system.getValById('txtDR_Ma'),
            'strTen': edu.system.getValById('txtDR_Ten'),
            'strDau_Ra_Type_Code': edu.system.getValById('ddlDR_LoaiDauRa'),
            'strStudy_Type_Code': edu.system.getValById('ddlDR_KieuHocTap'),
            'strDaotao_HeDaoTao_Id': c.DAOTAO_HEDAOTAO_ID || '',
            'strDaotao_KhoaDaoTao_Id': c.DAOTAO_KHOADAOTAO_ID || '',
            'strDaotao_ChuongTrinh_Id': c.DAOTAO_TOCHUCCHUONGTRINH_ID || c.DAOTAO_CHUONGTRINH_ID || '',
            'strDaotao_Nganh_Dt_Id': c.DAOTAO_NGANH_DT_ID || '',
            'strDaotao_Nganh_Ts_Id': c.DAOTAO_NGANH_TS_ID || '',
            'strTen_HienThi': edu.system.getValById('txtDR_TenHienThi'),
            'strMa_HienThi': edu.system.getValById('txtDR_MaHienThi'),
            'strMoTa_HienThi': c.MOTA_HIENTHI || '',
            'dThu_Tu_HienThi': edu.system.getValById('txtDR_ThuTuHienThi'),
            'dIs_HighLight': $('#chkDR_HighLight').is(':checked') ? 1 : 0,
            'dChi_Tieu': edu.system.getValById('txtDR_ChiTieu'),
            'dChi_Tieu_Toi_Da': edu.system.getValById('txtDR_ChiTieuToiDa'),
            'dChi_Tieu_Toi_Thieu': edu.system.getValById('txtDR_ChiTieuToiThieu'),
            'dIs_Allow_Register': $('#chkDR_AllowRegister').is(':checked') ? 1 : 0,
            'dIs_Allow_Waitlist': $('#chkDR_AllowWaitlist').is(':checked') ? 1 : 0,
            'dIs_Allow_Transfer_In': $('#chkDR_AllowTransferIn').is(':checked') ? 1 : 0,
            'dIs_Auto_Intake': $('#chkDR_AutoIntake').is(':checked') ? 1 : 0,
            'dIs_Auto_Enrollment': $('#chkDR_AutoEnrollment').is(':checked') ? 1 : 0,
            'dIs_Auto_Class_Assign': $('#chkDR_AutoClassAssign').is(':checked') ? 1 : 0,
            'strOutput_Status_Code': edu.system.getValById('ddlDR_TrangThai'),
            'dIs_Public': $('#chkDR_Public').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkDR_Active').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtDR_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#xem-sua-dau-ra").modal('hide');
                    me.getList_KeHoachDauRa();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Dau_Ra_Upd: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Dau_Ra_Upd (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Xóa kế hoạch đầu ra
    -- TODO: bạn gửi đúng API Pr_Ts_Kh_Dau_Ra_Del (lần trước paste nhầm Get_By_Id)
    -------------------------------------------*/
    delete_DauRa: function () {
        edu.system.alert("Chưa có API Delete cho kế hoạch đầu ra. Vui lòng gửi spec Pr_Ts_Kh_Dau_Ra_Del.", "w");
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_Ds
    -- Lấy danh sách kế hoạch đầu ra theo kế hoạch tuyển sinh
    -------------------------------------------*/
    getList_KeHoachDauRa: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.genTable_KeHoachDauRa([]);
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeBSA0HhMgHgYkNR4FMgPP',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Dau_Ra_Get_Ds',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': me.strDot_Id_ForDauRa || '',
            'strTs_Kh_Dot_PhuongThuc_Id': '',
            'strOutput_Status_Code': '',
            'dIs_Public': '',
            'dIs_Active': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtKeHoachDauRa = dtResult;
                    me.genTable_KeHoachDauRa(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Dau_Ra_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng kế hoạch đầu ra
    -- Fallback nhiều casing (MA/Ma, TEN/Ten) + lookup DM local cho Loại đầu ra & Kiểu học
    -- (dtLoaiDauRa, dtKieuHocTap) khi API không join sẵn _Name.
    -------------------------------------------*/
    genTable_KeHoachDauRa: function (data) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var $tbody = $("#tblKeHoachDauRa tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="21">Không có dữ liệu</td></tr>');
            return;
        }

        var lookupTen = function (arrDM, ma) {
            if (!ma || !arrDM || !arrDM.length) return '';
            for (var j = 0; j < arrDM.length; j++) {
                if (arrDM[j].MA == ma) return arrDM[j].TEN || '';
            }
            return ma;
        };

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || d.Id || d.id || '';
            var sMa = d.MA || d.Ma || '';
            var sTen = d.TEN || d.Ten || '';
            var sLoaiDauRa = d.DAU_RA_TYPE_CODE_Name || d.DAU_RA_TYPE_CODE_Ten || lookupTen(me.dtLoaiDauRa, d.DAU_RA_TYPE_CODE);
            var sKieuHoc = d.STUDY_TYPE_CODE_Name || d.STUDY_TYPE_CODE_Ten || lookupTen(me.dtKieuHocTap, d.STUDY_TYPE_CODE);
            var sHe = d.DAOTAO_HEDAOTAO_Ten || d.DAOTAO_HEDAOTAO_TEN || '';
            var sKhoa = d.DAOTAO_KHOADAOTAO_Ten || d.DAOTAO_KHOADAOTAO_TEN || '';
            var sCT = d.DAOTAO_TOCHUCCHUONGTRINH_Ten || d.DAOTAO_TOCHUCCHUONGTRINH_TEN || '';
            var sNganhTS = d.DAOTAO_NGANH_TS_Ten || d.DAOTAO_NGANH_TS_TEN || '';
            var sNganhDT = d.DAOTAO_NGANH_DT_Ten || d.DAOTAO_NGANH_DT_TEN || '';
            var sActive = (d.is_active || d.IS_ACTIVE) == 1;
            var sNguoiTao = d.NGUOITAO_TaiKhoan || d.NGUOITAO_TEN || d.NGUOI_TAO || d.NguoiTao || '';
            var sNgayTao = d.NgayTao_dd_mm_yyyy_hhmmss || d.NGAY_TAO || d.NgayTao || '';

            rows += '<tr id="row_dr_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + sMa + '</td>'
                +  '<td class="td-left">' + sTen + '</td>'
                +  '<td class="td-left">' + sLoaiDauRa + '</td>'
                +  '<td class="td-left">' + sKieuHoc + '</td>'
                +  '<td class="td-left">' + sHe + '</td>'
                +  '<td class="td-left">' + sKhoa + '</td>'
                +  '<td class="td-left">' + sCT + '</td>'
                +  '<td class="td-left">' + sNganhTS + '</td>'
                +  '<td class="td-left">' + sNganhDT + '</td>'
                +  '<td class="td-left">' + (d.TEN_HIENTHI || '') + '</td>'
                +  '<td class="td-left">' + (d.MA_HIENTHI || '') + '</td>'
                +  '<td class="td-center">' + (d.IS_HIGHLIGHT == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.THU_TU_HIENTHI || '') + '</td>'
                +  '<td class="td-center">' + (d.CHI_TIEU || '') + '</td>'
                +  '<td class="td-center">' + (d.CHI_TIEU_TOI_DA || '') + '</td>'
                +  '<td class="td-center">' + (d.CHI_TIEU_TOI_THIEU || '') + '</td>'
                +  '<td class="td-center">' + (sActive ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + sNguoiTao + '</td>'
                +  '<td class="td-center">' + sNgayTao + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetailDauRa" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết" data-bs-toggle="modal" data-bs-target="#xem-sua-dau-ra">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_By_Id
    -- Lấy chi tiết phân công nhân sự theo ID
    -------------------------------------------*/
    getDetail_PhanCong: function (strId) {
        var me = main_doc.KeHoachTuyenSinhNew;
        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeBiQ1HgM4Hggl',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_By_Id',
            'iM': edu.system.iM,
            'strId': strId
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = null;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = Array.isArray(data.Data) ? data.Data[0] : data.Data;
                    }
                    me.dtChiTietPhanCong = dtResult;
                    me.view_ChiTietPhanCong(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_By_Id: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_By_Id (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Đổ data phân công vào modal #xem-sua-phancong (chế độ Xem-sửa)
    -- NOTE: tên cột (FULL_NAME, current_employee_code, role_code, ngay_batdau, ...) đoán theo convention list API.
    --       Nếu API Get_By_Id trả khác thì sửa lại.
    -------------------------------------------*/
    view_ChiTietPhanCong: function (data) {
        if (!data) return;
        var d = data;
        var nhanSuTen = (d.FULL_NAME || '') + (d.current_employee_code ? ' - ' + d.current_employee_code : '');
        $('#lblXS_NhanSu').text(nhanSuTen);

        $('#ddlXS_VaiTro').val(d.role_code || d.ROLE_CODE || '');
        edu.util.viewValById('txtXS_NgayBatDau', d.ngay_batdau || d.NGAY_BATDAU || '');
        edu.util.viewValById('txtXS_NgayKetThuc', d.ngay_ketthuc || d.NGAY_KETTHUC || '');
        edu.util.viewValById('txtXS_GhiChu', d.GHICHU || d.ghichu || '');

        $('#chkXS_Allowed').prop('checked', (d.is_allowed || d.IS_ALLOWED) == 1);
        $('#chkXS_Active').prop('checked', (d.is_active || d.IS_ACTIVE) == 1);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Upd
    -- Cập nhật phân công nhân sự (Xem-sửa)
    -------------------------------------------*/
    update_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        if (!edu.util.checkValue(me.strPhanCong_Id)) {
            edu.system.alert("Chưa chọn phân công để sửa", "w");
            return;
        }

        var personId = '';
        if (me.dtChiTietPhanCong) {
            personId = me.dtChiTietPhanCong.person_id || me.dtChiTietPhanCong.PERSON_ID
                || me.dtChiTietPhanCong.ID_PERSON || '';
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeFDEl',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Upd',
            'iM': edu.system.iM,
            'strId': me.strPhanCong_Id,
            'strPerson_Id': personId,
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': '',
            'strTs_Kh_Dot_PhuongThuc_Id': '',
            'strRole_Code': edu.system.getValById('ddlXS_VaiTro'),
            'strAction_Code': '',
            'strScope_Level_Code': '',
            'strNgay_BatDau': edu.system.getValById('txtXS_NgayBatDau'),
            'strNgay_KetThuc': edu.system.getValById('txtXS_NgayKetThuc'),
            'dIs_Allowed': $('#chkXS_Allowed').is(':checked') ? 1 : 0,
            'dIs_Active': $('#chkXS_Active').is(':checked') ? 1 : 0,
            'strGhiChu': edu.system.getValById('txtXS_GhiChu'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'SUA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Cập nhật thành công");
                    $("#xem-sua-phancong").modal('hide');
                    me.getList_PhanCongNhanSu();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Upd: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Upd (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Del
    -- Xóa phân công nhân sự
    -------------------------------------------*/
    delete_PhanCong: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeBSQt',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Del',
            'iM': edu.system.iM,
            'strId': me.strPhanCong_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công");
                    $("#xem-sua-phancong").modal('hide');
                    me.strPhanCong_Id = '';
                    me.getList_PhanCongNhanSu();
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Del: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Del (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_Ds
    -- Lấy danh sách phân công nhân sự theo kế hoạch
    -------------------------------------------*/
    getList_PhanCongNhanSu: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            me.genTable_PhanCongNhanSu([]);
            return;
        }

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCikeDzIeESkgLwIuLyYeBiQ1HgUy',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_Kh_Ns_PhanCong_Get_Ds',
            'iM': edu.system.iM,
            'strTs_Kh_TuyenSinh_Id': me.strKeHoachTuyenSinh_Id,
            'strTs_Kh_TuyenSinh_Dot_Id': '',
            'strPerson_Id': '',
            'strRole_Code': '',
            'strAction_Code': '',
            'dIs_Active': ''
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = edu.util.checkValue(data.Data) ? data.Data : [];
                    me.dtPhanCongNhanSu = dtResult;
                    me.genTable_PhanCongNhanSu(dtResult);
                }
                else {
                    edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_Ds: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_Kh_Ns_PhanCong_Get_Ds (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    -- Render bảng phân công nhân sự
    -- Cột data: FULL_NAME, current_employee_code, ts_kehoach_tuyensinh_ten,
    --           ts_kehoach_tuyensinh_dot_ten, TS_PHUONGTHUC_TUYENSINH_Ten,
    --           role_code_Name, action_code_Name, scope_level_code_Name,
    --           ngay_batdau, ngay_ketthuc, is_allowed, is_active,
    --           NGUOITAO_TaiKhoan, NgayTao_dd_mm_yyyy_hhmmss
    -------------------------------------------*/
    genTable_PhanCongNhanSu: function (data) {
        var $tbody = $("#tblPhanCongNhanSu tbody");
        $tbody.html("");

        if (!data || data.length === 0) {
            $tbody.append('<tr><td class="td-center" colspan="15">Không có dữ liệu</td></tr>');
            return;
        }

        var iconCheck = '<i class="fa-solid fa-check color-success font-weight fz18"></i>';
        var iconX = '<i class="fa-solid fa-xmark color-red font-weight fz18"></i>';
        var rows = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var strId = d.ID || d.Id || d.id || '';
            var strNhanSu = (d.FULL_NAME || '') + (d.current_employee_code ? ' - ' + d.current_employee_code : '');
            rows += '<tr id="row_pcns_' + strId + '">'
                +  '<td class="td-center td-fix">' + (i + 1) + '</td>'
                +  '<td class="td-left">' + strNhanSu + '</td>'
                +  '<td class="td-left">' + (d.ts_kehoach_tuyensinh_ten || '') + '</td>'
                +  '<td class="td-left">' + (d.ts_kehoach_tuyensinh_dot_ten || '') + '</td>'
                +  '<td class="td-left">' + (d.TS_PHUONGTHUC_TUYENSINH_Ten || '') + '</td>'
                +  '<td class="td-center">' + (d.role_code_Name || '') + '</td>'
                +  '<td class="td-center">' + (d.action_code_Name || '') + '</td>'
                +  '<td class="td-center">' + (d.scope_level_code_Name || '') + '</td>'
                +  '<td class="td-center">' + (d.ngay_batdau || '') + '</td>'
                +  '<td class="td-center">' + (d.ngay_ketthuc || '') + '</td>'
                +  '<td class="td-center">' + (d.is_allowed == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.is_active == 1 ? iconCheck : iconX) + '</td>'
                +  '<td class="td-center">' + (d.NGUOITAO_TaiKhoan || '') + '</td>'
                +  '<td class="td-center">' + (d.NgayTao_dd_mm_yyyy_hhmmss || '') + '</td>'
                +  '<td class="td-center"><a class="btn btn-default btnview btnDetailPhanCong" data-id="' + strId + '" style="min-width: 68px !important;" title="Xem chi tiết" data-bs-toggle="modal" data-bs-target="#xem-sua-phancong">Chi tiết</a></td>'
                +  '</tr>';
        }
        $tbody.append(rows);
    },

    /*------------------------------------------
    -- Origin: PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Delete
    -- Xóa kế hoạch tuyển sinh
    -------------------------------------------*/
    delete_KeHoachTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;

        var obj_save = {
            'action': 'TS_Core_KeHoach_MH/ETMeFTIeCiQJLiAiKR4VNDgkLxIoLykeBSQtJDUk',
            'func': 'PKG_CORE_TS_KEHOACH.Pr_Ts_KeHoach_TuyenSinh_Delete',
            'iM': edu.system.iM,
            'strId': me.strKeHoachTuyenSinh_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XOA'
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Xóa thành công");
                    $("#chi-tiet").modal('hide');
                    me.strKeHoachTuyenSinh_Id = '';
                    me.getList_KeHoachTuyenSinh();
                }
                else {
                    edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Delete: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Pr_Ts_KeHoach_TuyenSinh_Delete (ex): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            contentType: true,
            action: obj_save.action,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    }
};
