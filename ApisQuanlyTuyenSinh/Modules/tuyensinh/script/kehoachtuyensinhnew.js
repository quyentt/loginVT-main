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
                // Load combo Đợt tuyển sinh — dùng cache dtDotTuyenSinh (đã load ở modal Đợt).
                // Auto-preselect nếu mở từ context Đợt (button "Import trúng tuyển" ở modal Đợt).
                var $selDot = $('#ddlImportTT_Dot');
                $selDot.empty().append('<option value="">-- Chọn đợt --</option>');
                (me.dtDotTuyenSinh || []).forEach(function (d) {
                    var id = d.ID || d.Id || d.id || '';
                    var ma = d.MA || d.Ma || '';
                    var ten = d.TEN || d.Ten || '';
                    if (id) $selDot.append('<option value="' + id + '">' + (ma ? '[' + ma + '] ' : '') + ten + '</option>');
                });
                if (me.strDot_Id_ForKQ) $selDot.val(me.strDot_Id_ForKQ);
                // Load DS Cơ sở đào tạo mặc định cho batch Import Excel — populate manual để tránh
                // timing issue của loadToCombo_DanhMucDuLieu (đôi khi trả rỗng do cache).
                edu.system.getList_DanhMucDulieu({
                    strMaBangDanhMuc: 'KHCT.COSODAOTAO',
                    strTenCotSapXep: '',
                    iTrangThai: 1
                }, '', '', function (data) {
                    var arr = Array.isArray(data) ? data : [];
                    console.log('%c[Import] CSDT loaded:', 'color:#059669;font-weight:bold', {
                        count: arr.length,
                        sample: arr[0]
                    });
                    var $sel = $('#ddlImportTT_CoSoDaoTao');
                    $sel.empty().append('<option value="">-- Chọn cơ sở đào tạo --</option>');
                    arr.forEach(function (d) {
                        var id = d.ID || d.Id || d.id || '';
                        var ma = d.MA || d.Ma || '';
                        var ten = d.TEN || d.Ten || ma;
                        if (id) $sel.append('<option value="' + id + '">' + ten + (ma && ma !== ten ? ' [' + ma + ']' : '') + '</option>');
                    });
                });
            } else if (mode === 'khai') {
                $('#kqdk_khai').removeClass('d-none');
                me._exitSuaMode();   // ensure Thêm mới mode, banner ẩn, save btn "Lưu hồ sơ"
                me.initKhai_DanhMuc();
                // Nguyện vọng đầu ra + Phương thức tuyển sinh đều phụ thuộc KH+Đợt → refresh mỗi lần mở
                me._loadNguyenVongDauRa();
                me._loadPhuongThucTuyenSinh();
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

        // Cascade: chọn Nguyện vọng đầu ra → load Lớp dự kiến theo Đầu ra đó
        $("#ddlKQ_NguyenVongDauRa").off('change.lopdukien').on('change.lopdukien', function () {
            me._loadLopDuKien($(this).val());
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
        $("#btnDownloadMauTT").click(function () {
            me.downloadMauImport_TrungTuyen();
        });

        // Đọc dữ liệu từ nguồn API (mapping cột API ↔ trường thông tin, lưu localStorage)
        me.initDocAPI_Bindings();
    },

    /*------------------------------------------
    -- Tải file Excel mẫu cho Import trúng tuyển.
    -- Dùng SheetJS đã load sẵn. Header khớp 100% tên param API của Them_HoSo_TS,
    -- 1 dòng dữ liệu ví dụ để user copy format. User xóa row ví dụ + điền data thực.
    -------------------------------------------*/
    downloadMauImport_TrungTuyen: function () {
        if (typeof XLSX === 'undefined') {
            edu.system.alert("Thư viện Excel chưa load xong, vui lòng thử lại sau vài giây.", "w");
            return;
        }
        // Header: khớp danh sách apiFields ở _buildImportPayload (signature PKG_CORE_TS_HOSO_IMPORT.Them_HoSo_TS).
        // Convention: field từ file dùng _Ma/_Mas (BE tự tra cứu ID), user gõ Mã hoặc Tên đều được.
        // Context (KH/Đợt/Cơ sở) không cho file ghi đè — chọn ở modal khi bấm Import.
        var headers = [
            'strCorePerson_HoTen', 'strCorePerson_Ho', 'strCorePerson_Dem', 'strCorePerson_Ten',
            'strCorePerson_NgaySinh', 'dCorePerson_NgayS', 'dCorePerson_ThangS', 'dCorePerson_NamS',
            'strCorePerson_GioiTinh_Ma', 'strMaSo', 'strDaoTao_LopQuanLy_DuKien',
            'strPersonProfile_DanToc_Ma', 'strPersonProfile_TonGiao_Ma', 'strPersonProfile_QuocTich_Ma',
            'strPersonContact_DienThoai', 'strPersonContact_Email',
            'strPersonIden_SoCCCD', 'strPersonIden_NgayCap', 'strPersonIden_NoiCap',
            'strPersonAddr_NS_Tinh_Ma', 'strPersonAddr_NS_Xa_Ma', 'strPersonAddr_NoiSinh',
            'strPersonAddr_HK_Tinh_Ma', 'strPersonAddr_HK_Xa_Ma', 'strPersonAddr_HK_SoNha',
            'strPersonEdu_Tinh_Ma', 'strPersonEdu_TruongMaTen', 'strPersonEdu_HocLuc', 'strPersonEdu_HanhKiem',
            'strPersonFam_Bo_HoTen', 'dPersonFam_Bo_NamSinh', 'strPersonFam_Bo_NoiO', 'strPersonFam_Bo_SDT',
            'strPersonFam_Me_HoTen', 'dPersonFam_Me_NamSinh', 'strPersonFam_Me_NoiO', 'strPersonFam_Me_SDT',
            'strHoSo_KH_Dot_PT_Ma', 'strHoSo_DoiTuong_TS_Ma', 'strHoSo_DoiTuong_UT_Mas', 'strHoSo_KhuVuc_UT_Ma',
            'strHoSo_MaHoSo', 'strHoSo_SoBaoDanh', 'strHoSo_Import_Batch_Ma',
            'strMaNganhTrungTuyen', 'strMaCTDT',
            'strXetTuyen_TohopMon_Ma', 'strXetTuyen_TohopMon_Code', 'strXetTuyen_TohopMon_Ten',
            'dXetTuyen_DiemUuTien', 'dXetTuyen_DiemTongMon', 'dXetTuyen_DiemTongXT', 'strXT_Mon_Data',
            'strKetQua_QuyetDinh_Ma', 'strIntake_IntakeCode', 'strIntake_IntakeTypeCode',
            'strPersonInvoice_TypeLoai', 'strPersonInvoice_NguoiMua', 'strPersonInvoice_TenDonVi',
            'strPersonInvoice_MST', 'strPersonInvoice_MaQHNS', 'strPersonInvoice_SDT',
            'strPersonInvoice_DiaChi', 'strPersonInvoice_Email',
            'strPersonBank_HinhThucTT', 'strPersonBank_TenNganHang', 'strPersonBank_SoTaiKhoan',
            'strPersonBank_ChuTaiKhoan', 'strPersonBank_GhiChu',
            'strDaoTao_CoSoDaoTao', 'strSoTienNopTruoc',
            'strExtra_Person_Data', 'strExtra_HoSo_Data', 'strExtra_Intake_Data'
        ];
        // Dòng ví dụ — dùng VD sếp cung cấp ở signature Toad (mã theo convention BE Import).
        var sample = {
            strCorePerson_HoTen: 'Nguyễn Văn A',
            strCorePerson_Ho: 'Nguyễn', strCorePerson_Dem: 'Văn', strCorePerson_Ten: 'A',
            // ⚠ Ngày sinh: BE expect yyyy-mm-dd (Oracle native). FE không tự transform (yêu cầu sếp 09/08/2026).
            strCorePerson_NgaySinh: '2007-03-15',
            dCorePerson_NgayS: 15, dCorePerson_ThangS: 3, dCorePerson_NamS: 2007,
            strCorePerson_GioiTinh_Ma: 'GENDER_NAM_ID', strMaSo: '',
            strDaoTao_LopQuanLy_DuKien: '',
            strPersonProfile_DanToc_Ma: 'DT_KINH_ID', strPersonProfile_TonGiao_Ma: 'TG_KHONG_ID',
            strPersonProfile_QuocTich_Ma: 'QT_VN_ID',
            strPersonContact_DienThoai: '0912345678', strPersonContact_Email: 'nva@example.com',
            strPersonIden_SoCCCD: '012345678901',
            strPersonIden_NgayCap: '01/01/2022',
            strPersonIden_NoiCap: 'Cục Cảnh sát QLHC về TTXH',
            strPersonAddr_NS_Tinh_Ma: 'Hà Nội', strPersonAddr_NS_Xa_Ma: 'Hà Nội', strPersonAddr_NoiSinh: 'Hà Nội',
            strPersonAddr_HK_Tinh_Ma: 'TINH_HN_ID', strPersonAddr_HK_Xa_Ma: 'XA_XX_ID',
            strPersonAddr_HK_SoNha: 'Số 12, Ngõ 45, Thôn Đông',
            strPersonEdu_Tinh_Ma: 'TINH_HN_ID', strPersonEdu_TruongMaTen: '12345 - THPT Chu Văn An',
            strPersonEdu_HocLuc: 'GIOI', strPersonEdu_HanhKiem: 'TOT',
            strPersonFam_Bo_HoTen: 'Nguyễn Văn B', dPersonFam_Bo_NamSinh: 1975,
            strPersonFam_Bo_NoiO: 'Hà Nội', strPersonFam_Bo_SDT: '0912111111',
            strPersonFam_Me_HoTen: 'Trần Thị C', dPersonFam_Me_NamSinh: 1978,
            strPersonFam_Me_NoiO: 'Hà Nội', strPersonFam_Me_SDT: '0913222222',
            strHoSo_KH_Dot_PT_Ma: 'PT_DIEM_THI_ID',
            strHoSo_DoiTuong_TS_Ma: 'DT_DUTHI_THUONG_ID',
            strHoSo_DoiTuong_UT_Mas: 'UT_06_ID',
            strHoSo_KhuVuc_UT_Ma: 'KV1_ID',
            strHoSo_MaHoSo: 'TS2026001234', strHoSo_SoBaoDanh: 'SBD001234',
            strHoSo_Import_Batch_Ma: 'BATCH_20260901_001',
            strMaNganhTrungTuyen: '', strMaCTDT: '',
            strXetTuyen_TohopMon_Ma: 'TOHOP_A00_ID',
            strXetTuyen_TohopMon_Code: 'A00', strXetTuyen_TohopMon_Ten: 'Toán - Lý - Hóa',
            dXetTuyen_DiemUuTien: 1.0, dXetTuyen_DiemTongMon: 24.5, dXetTuyen_DiemTongXT: 25.5,
            strXT_Mon_Data: 'TOAN~8.0~1~1~Toan|LY~7.5~1~2~Vat ly|HOA~9.0~1~3~Hoa hoc',
            strKetQua_QuyetDinh_Ma: 'QD_TRUNGTUYEN_2026_ID',
            strIntake_IntakeCode: 'TS2026_D1_CQ', strIntake_IntakeTypeCode: 'CHINHQUY',
            strPersonInvoice_TypeLoai: 'CN', strPersonInvoice_NguoiMua: 'Nguyễn Văn A', strPersonInvoice_TenDonVi: '',
            strPersonInvoice_MST: '', strPersonInvoice_MaQHNS: '', strPersonInvoice_SDT: '0912345678',
            strPersonInvoice_DiaChi: 'Hà Nội', strPersonInvoice_Email: 'nva@example.com',
            strPersonBank_HinhThucTT: 'CK', strPersonBank_TenNganHang: 'Vietcombank',
            strPersonBank_SoTaiKhoan: '1012345678', strPersonBank_ChuTaiKhoan: 'Nguyễn Văn A',
            strPersonBank_GhiChu: '',
            strDaoTao_CoSoDaoTao: '',   // để trống → dùng dropdown ở modal; điền nếu muốn override per record
            strSoTienNopTruoc: '5000000',   // VD: 'Số tiền nộp trước (đăng ký giữ chỗ)'
            strExtra_Person_Data: '', strExtra_HoSo_Data: '', strExtra_Intake_Data: ''
        };
        var sampleRow = headers.map(function (h) {
            return sample[h] === undefined ? '' : sample[h];
        });
        var ws_data = [headers, sampleRow];
        var ws = XLSX.utils.aoa_to_sheet(ws_data);
        // Auto column width: header length
        ws['!cols'] = headers.map(function (h) {
            return { wch: Math.max(14, Math.min(32, h.length + 2)) };
        });
        // Freeze row 1 (header)
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DuLieuTrungTuyen');
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        var now = new Date();
        var fname = 'Mau_Import_TrungTuyen_' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '.xlsx';
        XLSX.writeFile(wb, fname);
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
        // Đợt lấy từ dropdown modal — bắt buộc phải chọn (giống bên "Đọc từ API")
        var strDotId = $('#ddlImportTT_Dot').val() || me.strDot_Id_ForKQ || '';
        if (!strDotId) {
            edu.system.alert("Vui lòng chọn Đợt tuyển sinh trước khi import", "w");
            return;
        }
        me.strDot_Id_ForKQ = strDotId;   // sync context để _buildImportPayload dùng
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

        // Cơ sở đào tạo mặc định cho batch (dropdown trong modal) — dùng làm ctx.CoSo.
        // Nếu row Excel có value strDaoTao_CoSoDaoTao → value trong file ưu tiên (ghi đè ctx).
        var strCoSo_Default = edu.system.getValById('ddlImportTT_CoSoDaoTao') || '';

        var next = function () {
            if (me._importCancelled) { finish(); return; }
            if (idx >= total) { finish(); return; }
            var rowNo = idx + 2; // hàng 1 là header → dữ liệu từ hàng 2
            var row = rows[idx];
            // Row Excel ưu tiên: nếu có strDaoTao_CoSoDaoTao trong row thì dùng, ngược lại dùng dropdown
            var rowCoSo = row['strDaoTao_CoSoDaoTao'];
            var ctxCoSo = (rowCoSo && String(rowCoSo).trim()) ? String(rowCoSo).trim() : strCoSo_Default;
            var strDotId_Batch = $('#ddlImportTT_Dot').val() || me.strDot_Id_ForKQ || '';
            var payload = me._buildImportPayload(row, rowNo, { Dot: strDotId_Batch, CoSo: ctxCoSo });
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
    _buildImportPayload: function (row, rowNo, ctx) {
        var me = main_doc.KeHoachTuyenSinhNew;
        ctx = ctx || {};
        // ⚠ Signature khớp 100% với PKG_CORE_TS_HOSO_IMPORT.Them_HoSo_TS (khác với PKG_CORE_TS_HOSO
        // dùng cho form Khai trực tiếp). Convention:
        //   - Field lấy TỪ FILE (user điền tên/mã): dùng hậu tố _Ma / _Mas — BE tự tra cứu ra ID
        //   - Field CONTEXT lấy từ FORM (dropdown chọn): dùng hậu tố _Id — BE lấy trực tiếp
        //     (KH_TS_Id, KH_TS_Dot_Id — luôn override từ modal)
        //   - Không có strNguyenVong_DauRa_Id ở IMPORT (bị comment); thay bằng strMaNganhTrungTuyen + strMaCTDT
        // ctx.KH / ctx.Dot / ctx.CoSo: override context (dùng khi call từ "Đọc từ API")
        var payload = {
            'action': 'SV_Core_TS_HoSo_Import_MH/FSkkLB4JLhIuHhUS',
            'func': 'PKG_CORE_TS_HOSO_IMPORT.Them_HoSo_TS',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'THEM',
            // Context (lấy từ form/dropdown → dùng _Id)
            'strHoSo_KH_TS_Id': ctx.KH || me.strKeHoachTuyenSinh_Id || '',
            'strHoSo_KH_TS_Dot_Id': ctx.Dot || me.strDot_Id_ForKQ || '',
            // Cơ sở đào tạo — ƯU TIÊN row (mapping từ cosonhaphoc CMC) > ctx (dropdown modal)
            'strDaoTao_CoSoDaoTao': (row && row.strDaoTao_CoSoDaoTao && String(row.strDaoTao_CoSoDaoTao).trim())
                ? String(row.strDaoTao_CoSoDaoTao).trim()
                : (ctx.CoSo || ''),
            'dHoSo_Import_Row_No': rowNo
        };
        // Các field pass-through từ file — tên khớp param IMPORT proc (dùng _Ma / _Mas).
        // KHÔNG include: strHoSo_KH_TS_Id, strHoSo_KH_TS_Dot_Id, strDaoTao_CoSoDaoTao, dHoSo_Import_Row_No
        // (đã set ở context, không cho file ghi đè).
        var apiFields = [
            'strCorePerson_HoTen', 'strCorePerson_Ho', 'strCorePerson_Dem', 'strCorePerson_Ten',
            'strCorePerson_NgaySinh', 'dCorePerson_NgayS', 'dCorePerson_ThangS', 'dCorePerson_NamS',
            'strCorePerson_GioiTinh_Ma', 'strMaSo', 'strDaoTao_LopQuanLy_DuKien',
            'strPersonProfile_DanToc_Ma', 'strPersonProfile_TonGiao_Ma', 'strPersonProfile_QuocTich_Ma',
            'strPersonContact_DienThoai', 'strPersonContact_Email',
            'strPersonIden_SoCCCD', 'strPersonIden_NgayCap', 'strPersonIden_NoiCap',
            'strPersonAddr_NS_Tinh_Ma', 'strPersonAddr_NS_Xa_Ma', 'strPersonAddr_NoiSinh',
            'strPersonAddr_HK_Tinh_Ma', 'strPersonAddr_HK_Xa_Ma', 'strPersonAddr_HK_SoNha',
            'strPersonEdu_Tinh_Ma', 'strPersonEdu_TruongMaTen', 'strPersonEdu_HocLuc', 'strPersonEdu_HanhKiem',
            'strPersonFam_Bo_HoTen', 'dPersonFam_Bo_NamSinh', 'strPersonFam_Bo_NoiO', 'strPersonFam_Bo_SDT',
            'strPersonFam_Me_HoTen', 'dPersonFam_Me_NamSinh', 'strPersonFam_Me_NoiO', 'strPersonFam_Me_SDT',
            'strHoSo_KH_Dot_PT_Ma', 'strHoSo_DoiTuong_TS_Ma', 'strHoSo_DoiTuong_UT_Mas', 'strHoSo_KhuVuc_UT_Ma',
            'strHoSo_MaHoSo', 'strHoSo_SoBaoDanh', 'strHoSo_Import_Batch_Ma',
            // 2 field IMPORT-only (thay cho strNguyenVong_DauRa_Id đã bị comment ở IMPORT proc):
            'strMaNganhTrungTuyen', 'strMaCTDT',
            'strXetTuyen_TohopMon_Ma', 'strXetTuyen_TohopMon_Code', 'strXetTuyen_TohopMon_Ten',
            'dXetTuyen_DiemUuTien', 'dXetTuyen_DiemTongMon', 'dXetTuyen_DiemTongXT', 'strXT_Mon_Data',
            'strKetQua_QuyetDinh_Ma', 'strIntake_IntakeCode', 'strIntake_IntakeTypeCode',
            'strPersonInvoice_TypeLoai', 'strPersonInvoice_NguoiMua', 'strPersonInvoice_TenDonVi',
            'strPersonInvoice_MST', 'strPersonInvoice_MaQHNS', 'strPersonInvoice_SDT',
            'strPersonInvoice_DiaChi', 'strPersonInvoice_Email',
            'strPersonBank_HinhThucTT', 'strPersonBank_TenNganHang', 'strPersonBank_SoTaiKhoan',
            'strPersonBank_ChuTaiKhoan', 'strPersonBank_GhiChu',
            // Số tiền nộp trước (đăng ký giữ chỗ) — param VARCHAR2 của IMPORT proc (thêm 06/08/2026);
            // pass-through từ row (map từ tc_lpgd / noptientruoc).
            'strSoTienNopTruoc',
            'strExtra_Person_Data', 'strExtra_HoSo_Data', 'strExtra_Intake_Data'
        ];
        // Convention: prefix 'd' → Oracle NUMBER, phải gửi null (không phải '') khi rỗng
        // để tránh PLS-00306 "wrong number or types of arguments".
        for (var i = 0; i < apiFields.length; i++) {
            var f = apiFields[i];
            var v = row[f];
            var isNumParam = f.charAt(0) === 'd';
            if (v === undefined || v === null || v === '') {
                payload[f] = isNumParam ? null : '';
            } else if (isNumParam) {
                var n = Number(v);
                payload[f] = isNaN(n) ? null : n;
            } else {
                payload[f] = typeof v === 'string' ? v : String(v);
            }
        }

        // ⚠ KHÔNG normalize ngày sinh ở FE — data API sao thì gửi nguyên vậy xuống BE (yêu cầu sếp 09/08/2026).
        // BE version hiện tại expect yyyy-mm-dd (Oracle native) → API CMC trả yyyy-mm-dd → pass-through.
        // Nếu BE cần dd/mm/yyyy hoặc 3 field NgayS/ThangS/NamS → BE tự parse từ strCorePerson_NgaySinh.

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

        // Đợi DM giới tính + Nguyện vọng đầu ra + CSDT populate xong rồi set value
        setTimeout(function () {
            $('#ddlKQ_GioiTinh').val(pick(d, ['COREPERSON_GIOITINH_ID']));
            $('#ddlKQ_NguyenVongDauRa').val(pick(d, ['NGUYENVONG_DAURA_ID']));
            $('#ddlKQ_CoSoDaoTao').val(pick(d, ['DAOTAO_COSODAOTAO_ID', 'COSODAOTAO_ID']));
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
            DaoTao_CoSoDaoTao_Id: g('ddlKQ_CoSoDaoTao'),
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
            'strDaoTao_LopQuanLy_DuKien': '',
            'strHoSo_KetQuaCode': '',
            'strHoSo_TuNgay': '',
            'strHoSo_DenNgay': ''
        };
        // === DEBUG LOG: filter params khi load list ===
        console.log('%c[loadKQDK] REQUEST', 'color:#7c3aed;font-weight:bold', {
            KH_TS_Id: obj_save.strHoSo_KH_TS_Id,
            Dot_Id: obj_save.strHoSo_KH_TS_Dot_Id
        });

        edu.system.makeRequest({
            success: function (data) {
                console.log('%c[loadKQDK] RESPONSE', 'color:#059669;font-weight:bold', {
                    success: data && data.Success,
                    count: (data && data.Data && data.Data.length) || 0,
                    message: data && data.Message
                });
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
            toLoad.push(["QLSV.DOITUONG", "ddlKQ_DoiTuongUT"]);
            toLoad.push(["QLSV.KHUVUC", "ddlKQ_KhuVucUT"]);
            toLoad.push(["TUYENSINH.HOCLUC", "ddlKQ_HocLuc"]);
            toLoad.push(["TUYENSINH.HANHKIEM", "ddlKQ_HanhKiem"]);
            // Tab Trúng tuyển — Cơ sở đào tạo (dùng chung DM với form Lớp quản lý)
            toLoad.push(["KHCT.COSODAOTAO", "ddlKQ_CoSoDaoTao"]);
            // Tab Hóa đơn
            toLoad.push(["TS.DOITUONGHOADON", "ddlKQ_HD_DoiTuong"]);     // TODO: verify mã DM chuẩn
            toLoad.push(["PERSON_BANK_ACCOUNT.ACCOUNT_TYPE_CODE", "ddlKQ_HD_HinhThucTT"]);

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
                // Pick giá trị đầu tiên không null / rỗng
                var pick = function () {
                    for (var k = 0; k < arguments.length; k++) {
                        var v = arguments[k];
                        if (v != null && String(v).trim() !== '') return String(v).trim();
                    }
                    return '';
                };
                for (var i = 0; i < rows.length; i++) {
                    var d = rows[i];
                    var id = d.ID || d.Id || d.id || '';
                    if (!id) continue;
                    var name = pick(d.TEN_HIENTHI, d.TenHienThi, d.TEN, d.Ten);
                    var ma = pick(d.MA_HIENTHI, d.MA_CT, d.MaCT, d.MA, d.Ma);
                    var display;
                    if (name) {
                        display = name + (ma && ma !== name ? ' (' + ma + ')' : '');
                    } else {
                        // Fallback: dựng từ Ngành TS + Hệ + Khóa khi TEN/MA đều null
                        var nganh = pick(d.DAOTAO_NGANH_TS_TEN, d.DAOTAO_NGANH_DT_TEN, d.DAOTAO_TOCHUCCHUONGTRINH_TEN);
                        var he = pick(d.DAOTAO_HEDAOTAO_TEN);
                        var khoa = pick(d.DAOTAO_KHOADAOTAO_TEN);
                        var extra = [];
                        if (he) extra.push(he);
                        if (khoa) extra.push(khoa);
                        display = nganh || '[Đầu ra ' + (i + 1) + ']';
                        if (extra.length) display += ' — ' + extra.join(' · ');
                    }
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

    /*------------------------------------------
    -- Load Phương thức tuyển sinh theo KH + Đợt vào dropdown.
    -- Origin API: PKG_CORE_TS_KEHOACH.LayDS_PhuongThucTuyenSinh
    -------------------------------------------*/
    _loadPhuongThucTuyenSinh: function () {
        var me = main_doc.KeHoachTuyenSinhNew;
        var $sel = $('#ddlKQ_PhuongThuc');
        $sel.html('<option value="">-- Chọn phương thức tuyển sinh --</option>');
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) return;
        var obj_save = {
            'action': 'TS_CORE_KEHOACH_MH/DSA4BRIeESk0Li8mFSk0IhU0OCQvEigvKQPP',
            'func': 'PKG_CORE_TS_KEHOACH.LayDS_PhuongThucTuyenSinh',
            'iM': edu.system.iM,
            'strKeHoach_Id': me.strKeHoachTuyenSinh_Id,
            'strDot_Id': me.strDot_Id_ForKQ || '',
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM'
        };
        edu.system.makeRequest({
            success: function (data) {
                if (!data || !data.Success) return;
                var rows = edu.util.checkValue(data.Data) ? data.Data : [];
                var esc = function (s) { return $('<div>').text(s == null ? '' : s).html(); };
                var pick = function () {
                    for (var k = 0; k < arguments.length; k++) {
                        var v = arguments[k];
                        if (v != null && String(v).trim() !== '') return String(v).trim();
                    }
                    return '';
                };
                for (var i = 0; i < rows.length; i++) {
                    var d = rows[i];
                    var id = pick(d.ID, d.Id, d.id);
                    if (!id) continue;
                    var name = pick(d.TEN, d.Ten, d.PHUONGTHUC_TEN, d.PHUONG_THUC_TEN);
                    var ma = pick(d.MA, d.Ma, d.PHUONGTHUC_MA, d.PHUONG_THUC_MA);
                    var display = name || ma || ('[Phương thức ' + (i + 1) + ']');
                    if (name && ma && ma !== name) display += ' (' + ma + ')';
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

    /*------------------------------------------
    -- Load Lớp quản lý dự kiến theo Nguyện vọng đầu ra (cascade).
    -- Origin API: PKG_CORE_TS_KEHOACH.LayDS_LopQuanLy_TheoDauRa
    -- strDauRa_Id = giá trị đang chọn ở #ddlKQ_NguyenVongDauRa.
    -------------------------------------------*/
    _loadLopDuKien: function (strDauRa_Id) {
        var $sel = $('#ddlKQ_LopDuKien');
        if (!edu.util.checkValue(strDauRa_Id)) {
            $sel.html('<option value="">-- Chọn nguyện vọng đầu ra trước --</option>')
                .prop('disabled', true).val('');
            return;
        }
        $sel.html('<option value="">-- Chọn lớp dự kiến --</option>').prop('disabled', false);
        var obj_save = {
            'action': 'TS_CORE_KEHOACH_MH/DSA4BRIeDS4xEDQgLw04HhUpJC4FIDQTIAPP',
            'func': 'PKG_CORE_TS_KEHOACH.LayDS_LopQuanLy_TheoDauRa',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strDauRa_Id': strDauRa_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTro_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id || '',
            'strHanhDong_Code': 'XEM'
        };
        edu.system.makeRequest({
            success: function (data) {
                if (!data || !data.Success) return;
                var rows = edu.util.checkValue(data.Data) ? data.Data : [];
                var esc = function (s) { return $('<div>').text(s == null ? '' : s).html(); };
                var pick = function () {
                    for (var k = 0; k < arguments.length; k++) {
                        var v = arguments[k];
                        if (v != null && String(v).trim() !== '') return String(v).trim();
                    }
                    return '';
                };
                for (var i = 0; i < rows.length; i++) {
                    var d = rows[i];
                    var id = pick(d.ID, d.Id, d.id);
                    if (!id) continue;
                    var name = pick(d.TEN, d.Ten, d.LOPQUANLY_TEN, d.LOP_QUANLY_TEN, d.TEN_LOP);
                    var ma = pick(d.MA, d.Ma, d.LOPQUANLY_MA, d.LOP_QUANLY_MA, d.MA_LOP);
                    var display = name || ma || ('[Lớp ' + (i + 1) + ']');
                    if (name && ma && ma !== name) display += ' (' + ma + ')';
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
            + '#ddlKQ_NguyenVongDauRa, #ddlKQ_CoSoDaoTao,'
            + '#ddlKQ_HD_DoiTuong, #ddlKQ_HD_HinhThucTT').val('');

        // Lớp dự kiến: reset về placeholder disabled (chờ chọn NV đầu ra)
        $('#ddlKQ_LopDuKien').html('<option value="">-- Chọn nguyện vọng đầu ra trước --</option>')
            .prop('disabled', true).val('');

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
    -- Convention _Id cho tất cả field (chọn từ dropdown). Bắt buộc gửi strNguyenVong_DauRa_Id
    -- để BE snapshot 5 field DAOTAO_* (Hệ/Khóa/CT/Ngành TS/Ngành ĐT) từ TS_KEHOACH_DAU_RA.
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

            // Học vấn 12 — proc HoSo dùng _Id (khớp signature PKG_CORE_TS_HOSO)
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

            // Cơ sở đào tạo — param "new" của Them_HoSo_TS (proc Oracle đã có, comment C# chưa update)
            'strDaoTao_CoSoDaoTao_Id': g('ddlKQ_CoSoDaoTao'),

            // Số tiền nộp trước (giữ chỗ) — param mới (06/08/2026); form Khai chưa có input UI → gửi rỗng
            'strSoTienNopTruoc': '',

            // Nguyện vọng đầu ra — BẮT BUỘC trong signature, BE dùng để snapshot Hệ/Khóa/CT/NganhTS/NganhDT
            'strNguyenVong_DauRa_Id': g('ddlKQ_NguyenVongDauRa'),

            // Lớp quản lý dự kiến — signature HoSo KHÔNG có (chỉ IMPORT proc có), đóng gói vào Extra_HoSo_Data
            // để không mất user input; BE parse nếu cần

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

            // Extra JSON — lưu các field ngoài signature để không mất user input
            'strExtra_Person_Data': JSON.stringify({
                NS_Huyen_Id: g('ddlKQ_NS_Huyen'),
                HK_Huyen_Id: g('ddlKQ_HK_Huyen')
            }),
            'strExtra_HoSo_Data': JSON.stringify({
                DaoTao_LopQuanLy_DuKien: g('ddlKQ_LopDuKien')  // signature chính chưa có, dồn vào extra
            }),
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
        $("#tblNhanSuDaChon tbody").html(
            '<tr><td colspan="3" class="td-center text-muted" style="padding:16px 8px;">Chưa chọn nhân sự — bấm "Chọn nhân sự"</td></tr>'
        );
        $("#lblCountPC_NSDaChon").text(0);
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
        // Xoá row placeholder (nếu còn) trước khi append real rows
        $tbody.find('tr').filter(function () {
            return $(this).find('td[colspan]').length > 0;
        }).remove();
        var startIdx = $tbody.find('tr[data-person-id]').length;
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
        $("#lblCountPC_NSDaChon").text($tbody.find('tr[data-person-id]').length);
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
    },

    /*==============================================
    == Đọc dữ liệu từ nguồn API (modal #doc-api-tuyensinh)
    == - Preset 3 nguồn: CMC, UHD, Phenikaa (hardcode client-side như quanlyhosomorong cũ)
    == - Tải cấu trúc API → list cột từ record đầu
    == - Load trường thông tin của KH (TS_DuLieu/LayDSCauHienThiHoSo) làm target
    == - User mapping cột API → target; auto-map fuzzy; lưu localStorage
    == - Import: loop record × field mapped, gọi pkg_TuyenSinh_Import.Import_TS_HoSo_DuLieu_API
    ==============================================*/
    _docAPI_Presets: [
        {
            id: 'CMC',
            ten: 'CMC (Nhap hoc)',
            // Bên CMC (Nguyễn Văn Thái, 09/08) khuyến nghị 15K — hiện ~11K records.
            // FE để 50K làm buffer dài hạn (limit_page_length chỉ là max cap, không force fetch,
            // server vẫn trả về data thực tế 11K nên không tăng tải).
            host: 'https://crm.cmcu.edu.vn/api/resource/Nhaphoc?fields=["*"]&limit_page_length=50000',
            loaiXacThuc: 'Authorization',
            // Frappe/ERPNext: "Authorization: token <api_key>:<api_secret>"
            token: 'token 62e39c71e027e21:edca5904211fb8c',
            keyCol_default: 'mssv',
            // Frappe LIKE partial match: %kw% (encode % thành %25 vì đây là 1 phần URL)
            filterFmt: '&filters=[["mssv","like","%25{kw}%25"]]',
            responseUnwrap: 'data'   // JSON.parse(data.Data).data
        },
        {
            id: 'UHD',
            ten: 'UHD (User admitted)',
            host: 'https://tuyensinh.uhd.edu.vn/api/admission/user-registration/user-admitted',
            loaiXacThuc: 'Authorization',
            token: 'Bearer HaiDuong@2025',
            keyCol_default: 'userId',
            filterFmt: '',
            responseUnwrap: 'data'
        },
        {
            id: 'PHENIKAA',
            ten: 'Phenikaa (HRM profiles)',
            host: 'https://hrm.phenikaa-uni.edu.vn/hrm/api/v1/profiles/apis?page=1&pageSize=100000&username=apis&password=ewdjkl213kSD22k3%40k41JDa',
            loaiXacThuc: '',
            token: '',
            keyCol_default: '',
            filterFmt: '',
            responseUnwrap: 'data.listProfile'   // JSON.parse(data.Data).data.listProfile
        }
    ],
    _docAPI_ApiCols: [],       // list tên cột API (keys record đầu)
    _docAPI_ApiData: [],       // raw records từ API
    _docAPI_TargetCols: [],    // list {ma, ten} — hiện là 77 param của Them_HoSo_TS
    _docAPI_Mapping: {},       // {apiCol: paramName của Them_HoSo_TS}
    _docAPI_KeyCol: '',        // API col dùng làm mã hồ sơ (chỉ để hiển thị preview)
    _docAPI_ImportCancelled: false,
    _docAPI_CurrentPresetId: '',
    _docAPI_DoiTuong: [],      // (deprecated) cache list Đối tượng — không dùng nữa với proc mới

    /*------------------------------------------
    -- 77 param của PKG_CORE_TS_HOSO.Them_HoSo_TS làm target mapping cố định.
    -- Import qua "Đọc từ API" giờ ghi thẳng vào bảng chuẩn hóa (giống Import Excel).
    -------------------------------------------*/
    _docAPI_TargetParams: [
        { ma: 'strCorePerson_HoTen', ten: 'Họ và tên (đầy đủ)' },
        { ma: 'strCorePerson_Ho', ten: 'Họ' },
        { ma: 'strCorePerson_Dem', ten: 'Đệm' },
        { ma: 'strCorePerson_Ten', ten: 'Tên' },
        { ma: 'strCorePerson_NgaySinh', ten: 'Ngày sinh (dd/mm/yyyy)' },
        { ma: 'dCorePerson_NgayS', ten: 'Ngày sinh - ngày (số)' },
        { ma: 'dCorePerson_ThangS', ten: 'Ngày sinh - tháng (số)' },
        { ma: 'dCorePerson_NamS', ten: 'Ngày sinh - năm (số)' },
        { ma: 'strCorePerson_GioiTinh_Ma', ten: 'Giới tính (Mã/Tên)' },
        { ma: 'strMaSo', ten: 'Mã số (MSSV nội bộ)' },
        { ma: 'strDaoTao_LopQuanLy_DuKien', ten: 'Lớp quản lý dự kiến' },
        { ma: 'strPersonProfile_DanToc_Ma', ten: 'Dân tộc (Mã/Tên)' },
        { ma: 'strPersonProfile_TonGiao_Ma', ten: 'Tôn giáo (Mã/Tên)' },
        { ma: 'strPersonProfile_QuocTich_Ma', ten: 'Quốc tịch (Mã/Tên)' },
        { ma: 'strPersonContact_DienThoai', ten: 'Điện thoại' },
        { ma: 'strPersonContact_Email', ten: 'Email' },
        { ma: 'strPersonIden_SoCCCD', ten: 'Số CCCD' },
        { ma: 'strPersonIden_NgayCap', ten: 'Ngày cấp CCCD' },
        { ma: 'strPersonIden_NoiCap', ten: 'Nơi cấp CCCD' },
        { ma: 'strPersonAddr_NS_Tinh_Ma', ten: 'Nơi sinh - Tỉnh (Mã/Tên)' },
        { ma: 'strPersonAddr_NS_Xa_Ma', ten: 'Nơi sinh - Xã (Mã/Tên)' },
        { ma: 'strPersonAddr_NoiSinh', ten: 'Nơi sinh (text)' },
        { ma: 'strPersonAddr_HK_Tinh_Ma', ten: 'Hộ khẩu - Tỉnh (Mã/Tên)' },
        { ma: 'strPersonAddr_HK_Xa_Ma', ten: 'Hộ khẩu - Xã (Mã/Tên)' },
        { ma: 'strPersonAddr_HK_SoNha', ten: 'Hộ khẩu - Số nhà/Thôn/Xóm' },
        { ma: 'strPersonEdu_Tinh_Ma', ten: 'Tỉnh lớp 12 (Mã/Tên)' },
        { ma: 'strPersonEdu_TruongMaTen', ten: 'Trường lớp 12 (Mã-Tên)' },
        { ma: 'strPersonEdu_HocLuc', ten: 'Học lực lớp 12' },
        { ma: 'strPersonEdu_HanhKiem', ten: 'Hạnh kiểm lớp 12' },
        { ma: 'strPersonFam_Bo_HoTen', ten: 'Bố - Họ tên' },
        { ma: 'dPersonFam_Bo_NamSinh', ten: 'Bố - Năm sinh' },
        { ma: 'strPersonFam_Bo_NoiO', ten: 'Bố - Nơi ở' },
        { ma: 'strPersonFam_Bo_SDT', ten: 'Bố - SĐT' },
        { ma: 'strPersonFam_Me_HoTen', ten: 'Mẹ - Họ tên' },
        { ma: 'dPersonFam_Me_NamSinh', ten: 'Mẹ - Năm sinh' },
        { ma: 'strPersonFam_Me_NoiO', ten: 'Mẹ - Nơi ở' },
        { ma: 'strPersonFam_Me_SDT', ten: 'Mẹ - SĐT' },
        { ma: 'strHoSo_KH_Dot_PT_Ma', ten: 'Phương thức tuyển sinh (Mã/Tên)' },
        { ma: 'strHoSo_DoiTuong_TS_Ma', ten: 'Đối tượng tuyển sinh (Mã/Tên)' },
        { ma: 'strHoSo_DoiTuong_UT_Mas', ten: 'Đối tượng ưu tiên (Mã, có thể nhiều)' },
        { ma: 'strHoSo_KhuVuc_UT_Ma', ten: 'Khu vực ưu tiên (Mã/Tên)' },
        { ma: 'strHoSo_MaHoSo', ten: 'Mã hồ sơ' },
        { ma: 'strHoSo_SoBaoDanh', ten: 'Số báo danh' },
        { ma: 'strHoSo_Import_Batch_Ma', ten: 'Import Batch (Mã)' },
        { ma: 'strMaNganhTrungTuyen', ten: 'Mã ngành trúng tuyển' },
        { ma: 'strMaCTDT', ten: 'Mã CTĐT (nếu ngành TT không duy nhất)' },
        { ma: 'strXetTuyen_TohopMon_Ma', ten: 'Tổ hợp môn (Mã/Tên)' },
        { ma: 'strXetTuyen_TohopMon_Code', ten: 'Tổ hợp môn (code)' },
        { ma: 'strXetTuyen_TohopMon_Ten', ten: 'Tổ hợp môn (tên)' },
        { ma: 'dXetTuyen_DiemUuTien', ten: 'Điểm ưu tiên' },
        { ma: 'dXetTuyen_DiemTongMon', ten: 'Điểm tổng môn' },
        { ma: 'dXetTuyen_DiemTongXT', ten: 'Điểm tổng xét tuyển' },
        { ma: 'strXT_Mon_Data', ten: 'XT Môn Data (JSON)' },
        { ma: 'strKetQua_QuyetDinh_Ma', ten: 'Quyết định trúng tuyển (Mã)' },
        { ma: 'strIntake_IntakeCode', ten: 'Intake code' },
        { ma: 'strIntake_IntakeTypeCode', ten: 'Intake type code' },
        { ma: 'strPersonInvoice_TypeLoai', ten: 'Hóa đơn - Loại' },
        { ma: 'strPersonInvoice_NguoiMua', ten: 'Hóa đơn - Người mua' },
        { ma: 'strPersonInvoice_TenDonVi', ten: 'Hóa đơn - Tên đơn vị' },
        { ma: 'strPersonInvoice_MST', ten: 'Hóa đơn - MST' },
        { ma: 'strPersonInvoice_MaQHNS', ten: 'Hóa đơn - Mã QHNS' },
        { ma: 'strPersonInvoice_SDT', ten: 'Hóa đơn - SĐT' },
        { ma: 'strPersonInvoice_DiaChi', ten: 'Hóa đơn - Địa chỉ' },
        { ma: 'strPersonInvoice_Email', ten: 'Hóa đơn - Email' },
        { ma: 'strPersonBank_HinhThucTT', ten: 'Ngân hàng - Hình thức TT' },
        { ma: 'strPersonBank_TenNganHang', ten: 'Ngân hàng - Tên NH' },
        { ma: 'strPersonBank_SoTaiKhoan', ten: 'Ngân hàng - Số TK' },
        { ma: 'strPersonBank_ChuTaiKhoan', ten: 'Ngân hàng - Chủ TK' },
        { ma: 'strPersonBank_GhiChu', ten: 'Ngân hàng - Ghi chú' },
        { ma: 'strDaoTao_CoSoDaoTao', ten: 'Cơ sở đào tạo (Mã/Tên)' },
        { ma: 'strSoTienNopTruoc', ten: 'Số tiền nộp trước (giữ chỗ)' },
        { ma: 'strExtra_Person_Data', ten: 'Extra Person Data (JSON)' },
        { ma: 'strExtra_HoSo_Data', ten: 'Extra Hồ Sơ Data (JSON)' },
        { ma: 'strExtra_Intake_Data', ten: 'Extra Intake Data (JSON)' }
    ],

    /*------------------------------------------
    -- Alias mapping: tên cột API (CMC/UHD/...) → param của Them_HoSo_TS.
    -- Auto-map ưu tiên tra alias trước, sau đó mới fuzzy match theo tên.
    -------------------------------------------*/
    _docAPI_ColAliases: {
        // CMC (Nhaphoc) — Import proc dùng convention _Ma (BE tự tra cứu ID)
        'hoten': 'strCorePerson_HoTen',
        'dob': 'strCorePerson_NgaySinh',
        'gt': 'strCorePerson_GioiTinh_Ma',
        'dantoc': 'strPersonProfile_DanToc_Ma',
        'quoctich': 'strPersonProfile_QuocTich_Ma',
        'sdt': 'strPersonContact_DienThoai',
        'emailts': 'strPersonContact_Email',
        'emailsv': 'strPersonContact_Email',
        'cccd': 'strPersonIden_SoCCCD',
        'noisinh': 'strPersonAddr_NoiSinh',
        'dc_tinhthanh': 'strPersonAddr_HK_Tinh_Ma',
        'dc_phuongxa': 'strPersonAddr_HK_Xa_Ma',
        'dc_lienlac': 'strPersonAddr_HK_SoNha',
        'truongthpt': 'strPersonEdu_TruongMaTen',
        'tinhthpt': 'strPersonEdu_Tinh_Ma',
        'hocluc_12': 'strPersonEdu_HocLuc',
        'hangkiem_12': 'strPersonEdu_HanhKiem',
        'hotenph_bo': 'strPersonFam_Bo_HoTen',
        'sdtph_bo': 'strPersonFam_Bo_SDT',
        'hotenph_me': 'strPersonFam_Me_HoTen',
        'sdtph_me': 'strPersonFam_Me_SDT',
        'mssv': 'strMaSo',
        'mahoso': 'strHoSo_MaHoSo',
        'sbd': 'strHoSo_SoBaoDanh',
        'phuongthuc_trungtuyen': 'strHoSo_KH_Dot_PT_Ma',
        'dtut': 'strHoSo_DoiTuong_UT_Mas',
        'kvut': 'strHoSo_KhuVuc_UT_Ma',
        'tohop_trungtuyen': 'strXetTuyen_TohopMon_Code',
        'diem_trungtuyen': 'dXetTuyen_DiemTongXT',
        // 2 field IMPORT-only:
        'manganh': 'strMaNganhTrungTuyen',
        'mactdt': 'strMaCTDT',
        // CMC mới bổ sung (chiều 05/08/2026):
        'dc_hoadon': 'strPersonInvoice_DiaChi',
        // CMC field tài chính (sếp bổ sung 06/08/2026):
        'tc_lpgd': 'strSoTienNopTruoc',
        // CMC tên cột NEW song song (sếp confirm 06/08/2026):
        'noptientruoc': 'strSoTienNopTruoc',
        'diachixuathoadon': 'strPersonInvoice_DiaChi',
        // CMC "cosonhaphoc" = Cơ sở nhập học ("Hà Nội" / "Hồ Chí Minh") — chính là Cơ sở đào tạo bên mình
        'cosonhaphoc': 'strDaoTao_CoSoDaoTao',

        // ===== EXPLICIT SKIP (value=null) — các cột CMC KHÔNG map vào target =====
        // Lý do: fuzzy match có thể khớp nhầm (VD 'tennganh' chứa 'tenngan' → mismap vào TenNganHang).
        // Đây là whitelist "biết rõ không map" — an toàn hơn để fuzzy tự do.

        // Tên khoa/ngành/tổ hợp — không có target riêng (nhưng có nguy cơ mismap TenNganHang)
        'tennganh': null,
        'tenkhoa': null,
        'maxettuyen': null,
        'maxettuyengoc': null,        // CMC bổ sung 09/08 — mã xét tuyển gốc theo cơ sở
        'tohop_thpt': null,
        'tohop_hocba': null,
        // Điểm cộng CMC (không có target riêng — đã tính vào tổng)
        'diem_tieuchicong': null,
        'diem_diemcongthanhtich': null,

        // Metadata Frappe/CMC — không dùng cho tuyển sinh mình
        'name': null, 'owner': null, 'creation': null, 'modified': null,
        'modified_by': null, 'docstatus': null, 'idx': null, 'naming_series': null,
        'da_xacthucdinhdanh': null, 'mssv_barcode': null,

        // Thông tin phụ / anh chị em — không có target trong signature IMPORT
        'sdt_khac': null, 'hotenph_anhchi': null, 'sdtph_anhchi': null,
        'nguoinhacmc': null, 'namtotnghiep': null, 'ttnv': null, 'ccnn': null,

        // Public letter (giấy báo online của CMC)
        'public_letter_token': null, 'public_letter_expires_on': null,
        'allow_public_letter': null, 'linkgiaybao': null,

        // Trạng thái nhập học CMC / cơ sở
        'thoigiannhaphoc': null, 'xacnhannhaphoc': null, 'tuvanvien': null,
        'diachinhaphoc': null, 'da_checkin': null,
        'trangthaicheckin': null, 'trangthaichupanh': null, 'trangthaihoso': null,
        'trangthaiquatang': null, 'trangthaidongtien': null, 'trangthailaptop': null,
        'trangthaifaceid': null, 'trangthaidvsv': null, 'trangthaikhaosat': null,

        // Điểm chi tiết môn (không có target riêng — chỉ giữ diem_trungtuyen)
        'diem_dgnl': null, 'diem_tuyenthang': null, 'diem_thpt': null, 'diem_hocba': null,
        'thpt_to': null, 'thpt_li': null, 'thpt_si': null, 'thpt_di': null,
        'thpt_cncn': null, 'thpt_th': null, 'thpt_va': null, 'thpt_ho': null,
        'thpt_su': null, 'thpt_kt': null, 'thpt_cnnn': null, 'thpt_nn': null,
        'hb_to': null, 'hb_li': null, 'hb_si': null, 'hb_di': null,
        'hb_cncn': null, 'hb_ti': null, 'hb_va': null, 'hb_ho': null,
        'hb_su': null, 'hb_ktpl': null, 'hb_cnnn': null, 'hb_nn': null,

        // Tài chính chi tiết CMC — chỉ giữ tc_lpgd (đã map vào strSoTienNopTruoc)
        'tc_hocphi': null, 'tc_ndck': null, 'tc_link_ndck': null,
        'tc_ksk': null, 'tc_bhyt': null, 'tc_hbud_giatri': null, 'tc_qs': null,
        'tc_tongtien': null, 'tc_hbud': null, 'tc_gdtc': null,
        'base_total': null, 'tc_tienconlai': null,

        // Trạng thái CTSV / nội bộ CMC (không import vào tuyển sinh)
        'ctsv_mabhyt': null, 'ctsv_ngaynhaphoc': null, 'ctsv_ngaydongbhyt': null,
        'ctsv_sohoso': null, 'ctsv_ngayhetbhyt': null, 'ctsv_sohoso_tichluy': null,
        'ctsv_hieulucbhyt': null, 'ctsv_gbnh': null, 'ctsv_gcnkqt': null,
        'ctsv_gcnnvqs': null, 'ctsv_ggtnvqs': null, 'ctsv_sodoandang': null,
        'ctsv_ddcd': null, 'ctsv_btnthpt': null, 'ctsv_hocba': null, 'ctsv_gks': null,
        'nh_gcntn': null, 'ctsv_gtkhac': null, 'ctsv_ngayvaodoan': null,
        'ctsv_ngayvaodang': null, 'ctsv_thett': null, 'ctsv_nhatro': null,
        'ctsv_xnsinhvien': null, 'ctsv_tvvayvon': null, 'dbcl_khaosattsv': null,
        'mc_laptop': null, 'mc_henlaptop': null, 'mc_quasinhvien': null,
        'dhs_faceid': null, 'tadv_diem': null, 'tadv_phanloai': null,
        'tadv_ngaythi': null, 'tadv_ghichu': null,

        // Ảnh — không import
        'anh_dai_dien': null, 'anh_dai_dien_goc': null,
        // Dots — không rõ nghĩa, để null
        'dots': null
    },

    initDocAPI_Bindings: function () {
        var me = this;

        // Load preset combo lần đầu khi trang init (không phụ thuộc modal)
        me.docAPI_LoadPresets();

        // Show modal → reset UI + populate preset + load config từ localStorage (nếu có)
        $("#doc-api-tuyensinh").on('show.bs.modal', function () {
            me.docAPI_ResetView();
            // Auto-pick preset theo hostname nếu chưa chọn
            if (!$('#ddlDocAPI_Preset').val()) {
                var host = (edu.system.strhost || '').toLowerCase();
                if (host.indexOf('103.159.50.116') !== -1) $('#ddlDocAPI_Preset').val('UHD').trigger('change');
                else if (host.indexOf('phenikaa-uni.edu.vn') !== -1) $('#ddlDocAPI_Preset').val('PHENIKAA').trigger('change');
                else $('#ddlDocAPI_Preset').val('CMC').trigger('change');
            } else {
                $('#ddlDocAPI_Preset').trigger('change');
            }
            // Load combo Đợt theo KH đang mở (Đối tượng không cần cho proc Them_HoSo_TS,
            // user tự map cột API vào strHoSo_DoiTuong_TS_Id nếu có)
            me.docAPI_LoadDotCombo();
            // Load Cơ sở đào tạo — populate manual (tránh timing issue của loadToCombo_DanhMucDuLieu)
            edu.system.getList_DanhMucDulieu({
                strMaBangDanhMuc: 'KHCT.COSODAOTAO',
                strTenCotSapXep: '',
                iTrangThai: 1
            }, '', '', function (data) {
                var arr = Array.isArray(data) ? data : [];
                console.log('%c[docAPI] CSDT loaded:', 'color:#059669;font-weight:bold', {
                    count: arr.length, sample: arr[0]
                });
                var $sel = $('#ddlDocAPI_CoSoDaoTao');
                $sel.empty().append('<option value="">-- Chọn cơ sở đào tạo --</option>');
                arr.forEach(function (d) {
                    var id = d.ID || d.Id || d.id || '';
                    var ma = d.MA || d.Ma || '';
                    var ten = d.TEN || d.Ten || ma;
                    if (id) $sel.append('<option value="' + id + '">' + ten + (ma && ma !== ten ? ' [' + ma + ']' : '') + '</option>');
                });
            });
        });

        $("#ddlDocAPI_Preset").on('change', function () {
            var preset = me._getDocAPI_Preset($(this).val());
            $('#docAPI_PresetHint').html(preset
                ? '<b>Host:</b> <code>' + preset.host + '</code>'
                : '');
        });

        $("#btnDocAPI_Fetch").click(function () {
            me.docAPI_FetchAll();
        });

        $("#txtDocAPI_Keyword").keypress(function (e) {
            if (e.which === 13) { e.preventDefault(); me.docAPI_FetchAll(); }
        });

        $("#btnDocAPI_AutoMap").click(function () { me.docAPI_AutoMap(); });
        $("#btnDocAPI_ClearMap").click(function () { me.docAPI_ClearMapping(); });
        $("#btnDocAPI_SaveMap").click(function () { me.docAPI_SaveMapping(true); });

        // Update mapping state khi user đổi select — dùng DEBOUNCED để tránh render preview
        // 11K row mỗi lần chọn 1 dropdown (freeze browser).
        $("#tblDocAPI_Mapping").on('change', 'select.docAPI-map-sel', function () {
            var apiCol = $(this).attr('data-apicol');
            me._docAPI_Mapping[apiCol] = $(this).val() || '';
            me.docAPI_RefreshPreview_Debounced();
        });
        $("#tblDocAPI_Mapping").on('input', 'input.docAPI-map-input', function () {
            var apiCol = $(this).attr('data-apicol');
            var v = ($(this).val() || '').trim();
            if (v) me._docAPI_Mapping[apiCol] = v;
            else delete me._docAPI_Mapping[apiCol];
            me.docAPI_RefreshPreview_Debounced();
        });
        $("#ddlDocAPI_KeyCol").on('change', function () {
            me._docAPI_KeyCol = $(this).val() || '';
            me.docAPI_RefreshPreview_Debounced();
        });

        // Select all preview — set flag → import dùng toàn bộ filteredIdx (không chỉ trang hiện tại).
        // Đồng thời tick TẤT CẢ checkbox visible + populate ManualPicks với toàn bộ filteredIdx để
        // trạng thái tick nhất quán khi chuyển trang.
        $("#chkDocAPI_SelectAll").click(function () {
            var checked = $(this).is(':checked');
            $('#tblDocAPI_Preview tbody .docAPI-sel').prop('checked', checked);
            me._docAPI_SelectedAll = checked;
            if (checked) {
                var filteredIdx = me._docAPI_getFilteredIdx();
                me._docAPI_ManualPicks = {};
                for (var i = 0; i < filteredIdx.length; i++) me._docAPI_ManualPicks[filteredIdx[i]] = true;
            } else {
                me._docAPI_ManualPicks = {};
            }
            me._docAPI_RenderPager(
                me._docAPI_getFilteredIdx().length,
                Math.max(1, Math.ceil(me._docAPI_getFilteredIdx().length / me._docAPI_PAGE_SIZE)),
                me._docAPI_currentPage, 0, 0
            );
        });
        // Individual checkbox: sync ManualPicks + tắt flag SelectAll khi bỏ tick 1 dòng
        $("#tblDocAPI_Preview").on('change', '.docAPI-sel', function () {
            var idx = parseInt($(this).attr('data-idx'), 10);
            if (isNaN(idx)) return;
            if ($(this).is(':checked')) {
                me._docAPI_ManualPicks[idx] = true;
            } else {
                delete me._docAPI_ManualPicks[idx];
                if (me._docAPI_SelectedAll) {
                    me._docAPI_SelectedAll = false;
                    $('#chkDocAPI_SelectAll').prop('checked', false);
                }
            }
            me._docAPI_RenderPager(
                me._docAPI_getFilteredIdx().length,
                Math.max(1, Math.ceil(me._docAPI_getFilteredIdx().length / me._docAPI_PAGE_SIZE)),
                me._docAPI_currentPage, 0, 0
            );
        });

        // Pagination buttons — dùng _docAPI_GoPage(delta, absolute)
        $("#btnDocAPI_PageFirst").click(function () { me._docAPI_GoPage(1, true); });
        $("#btnDocAPI_PagePrev").click(function () { me._docAPI_GoPage(-1, false); });
        $("#btnDocAPI_PageNext").click(function () { me._docAPI_GoPage(1, false); });
        $("#btnDocAPI_PageLast").click(function () { me._docAPI_GoPage(999999, false); });
        $("#txtDocAPI_PageJump").on('change', function () {
            var n = parseInt($(this).val(), 10);
            if (!isNaN(n) && n >= 1) me._docAPI_GoPage(n, true);
            else $(this).val(me._docAPI_currentPage + 1);
        });
        $("#ddlDocAPI_PageSize").on('change', function () {
            var n = parseInt($(this).val(), 10);
            if (!isNaN(n) && n > 0) {
                me._docAPI_PAGE_SIZE = n;
                me._docAPI_currentPage = 0;   // đổi page size → về trang 1
                me.docAPI_RefreshPreview();
            }
        });

        $("#btnDocAPI_StartImport").click(function () { me.docAPI_StartImport(); });
        $("#btnDocAPI_CancelImport").click(function () { me._docAPI_ImportCancelled = true; });
        $("#btnDocAPI_ExportExcel").click(function () { me.docAPI_ExportToExcel(); });

        // Filter client-side: mỗi lần user gõ → debounce refresh preview theo keyword.
        // Filter đổi → về trang 1; giữ ManualPicks (user có thể lọc + tick dần nhiều nhóm).
        $("#txtDocAPI_FilterPreview").on('input', function () {
            me._docAPI_FilterKeyword = ($(this).val() || '').trim().toLowerCase();
            me._docAPI_currentPage = 0;
            me.docAPI_RefreshPreview_Debounced();
        });
        $("#btnDocAPI_ShowErrors").click(function (e) { e.preventDefault(); me.docAPI_RenderErrorsPanel(); $('#docAPI_ErrorsPanel').removeClass('d-none'); });
        $("#btnDocAPI_HideErrors").click(function (e) { e.preventDefault(); $('#docAPI_ErrorsPanel').addClass('d-none'); });
    },

    docAPI_LoadPresets: function () {
        var me = this;
        var $sel = $('#ddlDocAPI_Preset');
        $sel.empty().append('<option value="">-- Chọn nguồn --</option>');
        // Filter theo domain hiện tại:
        //   - CMC preset CHỈ hiện khi domain là iu.cmcu.edu.vn (tránh trường khác ăn nhầm API của CMC)
        //   - UHD & Phenikaa: tạm ẩn hết (yêu cầu sếp 10/08/2026)
        // Reference: rule "ẩn UI thì comment code, đừng xóa" — dữ liệu preset vẫn giữ ở _docAPI_Presets
        // để bật lại nhanh khi cần; chỉ filter ở tầng render.
        var host = (window.location && window.location.hostname || '').toLowerCase();
        var isCmcDomain = host.indexOf('cmcu.edu.vn') !== -1;
        me._docAPI_Presets.forEach(function (p) {
            var show = false;
            if (p.id === 'CMC') show = isCmcDomain;
            // if (p.id === 'UHD') show = ...;         // tạm ẩn
            // if (p.id === 'PHENIKAA') show = ...;    // tạm ẩn
            if (show) $sel.append('<option value="' + p.id + '">' + p.ten + '</option>');
        });
    },

    _docAPI_esc: function (s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    _getDocAPI_Preset: function (id) {
        var me = this;
        if (!id) return null;
        for (var i = 0; i < me._docAPI_Presets.length; i++) {
            if (me._docAPI_Presets[i].id === id) return me._docAPI_Presets[i];
        }
        return null;
    },

    docAPI_ResetView: function () {
        var me = this;
        me._docAPI_ApiCols = [];
        me._docAPI_ApiData = [];
        me._docAPI_Mapping = {};
        me._docAPI_KeyCol = '';
        me._docAPI_ImportCancelled = false;
        me._docAPI_FilterKeyword = '';   // reset filter client-side
        me._docAPI_SelectedAll = false;
        me._docAPI_ManualPicks = {};     // reset picks tay
        me._docAPI_currentPage = 0;
        $('#txtDocAPI_Keyword').val('');
        $('#txtDocAPI_FilterPreview').val('');
        $('#lblDocAPI_FilterInfo').text('');
        $('#lblDocAPI_FetchInfo').text('');
        $('#docAPI_MapWrap, #docAPI_ImportWrap').addClass('d-none');
        $('#tblDocAPI_Mapping tbody, #tblDocAPI_Preview tbody').html('');
        $('#lblDocAPI_ApiColCount, #lblDocAPI_TargetColCount, #lblDocAPI_RowCount').text('0');
        $('#docAPI_ProgressWrap').addClass('d-none');
        $('#lblDocAPI_Progress').text('0 / 0');
        $('#lblDocAPI_OK, #lblDocAPI_Err').text('0');
        $('#docAPI_ProgressBar').css('width', '0%').text('0%');
        $('#btnDocAPI_CancelImport').addClass('d-none');
        $('#btnDocAPI_StartImport').prop('disabled', false);
    },

    /*------------------------------------------
    -- Load combo Đợt từ me.dtDotTuyenSinh (đã load ở modal Đợt).
    -- Auto-preselect nếu mở từ context Đợt cụ thể (me.strDot_Id_ForKQ).
    -------------------------------------------*/
    docAPI_LoadDotCombo: function () {
        var me = this;
        var $sel = $('#ddlDocAPI_Dot');
        $sel.empty().append('<option value="">-- Chọn đợt --</option>');
        (me.dtDotTuyenSinh || []).forEach(function (d) {
            var id = d.ID || d.Id || d.id || '';
            var ma = d.MA || d.Ma || '';
            var ten = d.TEN || d.Ten || '';
            if (id) $sel.append('<option value="' + id + '">' + (ma ? '[' + ma + '] ' : '') + ten + '</option>');
        });
        if (me.strDot_Id_ForKQ) $sel.val(me.strDot_Id_ForKQ);
    },

    /*------------------------------------------
    -- Load combo Đối tượng dự tuyển từ danh mục master data "TS.DOITUONGDUTUYEN".
    -- App mới không dùng endpoint TS_Dot_DoiTuong/LayDSTS_DoiTuong (chỉ trả các
    -- đối tượng đã link vào Đợt) — thay bằng master data giống form Khai trực tiếp
    -- (kehoachtuyensinhnew.js:1456). Data luôn có, không phụ thuộc KH config.
    -------------------------------------------*/
    docAPI_LoadDoiTuongCombo: function () {
        var me = this;
        var $sel = $('#ddlDocAPI_DoiTuong');
        $sel.empty().append('<option value="">-- Chọn đối tượng --</option>');
        $('#docAPI_DoiTuongHint').remove();
        // Dùng helper getList_DanhMucDulieu để tự populate select (native, không select2).
        var obj = {
            strMaBangDanhMuc: 'TS.DOITUONGDUTUYEN',
            strTenCotSapXep: '',
            iTrangThai: 1
        };
        edu.system.getList_DanhMucDulieu(obj, '', '', function (data) {
            var arr = Array.isArray(data) ? data : [];
            me._docAPI_DoiTuong = arr;
            arr.forEach(function (d) {
                var id = d.MA || d.ID || d.Id || '';
                var ten = d.TEN || d.Ten || id;
                if (id) $sel.append('<option value="' + id + '">' + ten + (d.MA && d.TEN ? ' [' + d.MA + ']' : '') + '</option>');
            });
            if (arr.length === 0) {
                $sel.empty().append('<option value="">(Không có đối tượng — sẽ để trống)</option>');
                $sel.after(
                    '<div id="docAPI_DoiTuongHint" class="fz12 mt-5" '
                    + 'style="color:#d97706;"><i class="fa-regular fa-triangle-exclamation"></i> '
                    + 'Danh mục "TS.DOITUONGDUTUYEN" trống.</div>'
                );
            }
        });
    },

    /*------------------------------------------
    -- Tải song song: (1) cấu trúc API bên ngoài, (2) trường thông tin của KH
    -- Cả hai xong → render mapping table + preview + auto-load config đã lưu
    -------------------------------------------*/
    docAPI_FetchAll: function () {
        var me = this;
        var presetId = $('#ddlDocAPI_Preset').val();
        var preset = me._getDocAPI_Preset(presetId);
        if (!preset) { edu.system.alert("Vui lòng chọn nguồn API", "w"); return; }
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Chưa xác định kế hoạch tuyển sinh (mở lại modal Đợt từ danh sách KH)", "w");
            return;
        }
        var strDotId = $('#ddlDocAPI_Dot').val() || '';
        if (!strDotId) {
            edu.system.alert("Vui lòng chọn Đợt tuyển sinh trước khi tải cấu trúc", "w");
            return;
        }
        me._docAPI_CurrentPresetId = presetId;
        $('#lblDocAPI_FetchInfo').html('<i class="fa fa-spinner fa-spin"></i> Đang tải...');

        var doneApi = false, doneTarget = false;
        function tryFinalize() {
            if (!doneApi || !doneTarget) return;
            $('#lblDocAPI_FetchInfo').text(
                'Đã tải ' + me._docAPI_ApiData.length + ' bản ghi API, '
                + me._docAPI_TargetCols.length + ' trường thông tin.');
            me.docAPI_RenderMapping();
            me.docAPI_LoadMapping();     // apply mapping đã lưu (nếu có)
            me.docAPI_RefreshPreview();
            $('#docAPI_MapWrap, #docAPI_ImportWrap').removeClass('d-none');
        }

        me.docAPI_FetchApiStructure(preset, function (ok) {
            doneApi = true;
            if (!ok) $('#lblDocAPI_FetchInfo').html('<span style="color:#dc2626">Không tải được dữ liệu API</span>');
            tryFinalize();
        });
        me.docAPI_FetchTargetCols(function () {
            doneTarget = true;
            tryFinalize();
        });
    },

    docAPI_FetchApiStructure: function (preset, cb) {
        var me = this;
        var kw = (edu.util.getValById('txtDocAPI_Keyword') || '').trim();
        var host = preset.host;
        if (kw && preset.filterFmt) {
            host += preset.filterFmt.replace('{kw}', encodeURIComponent(kw));
        }
        // Áp dụng giới hạn số bản ghi: nếu chọn "Chỉ đọc N" → replace limit_page_length trong URL.
        // Chọn "Toàn bộ" → giữ nguyên limit_page_length gốc (5000000).
        var limitMode = $('input[name="docAPI_LimitMode"]:checked').val() || 'custom';
        if (limitMode === 'custom') {
            var limitN = parseInt(edu.util.getValById('txtDocAPI_Limit'), 10);
            if (limitN > 0) {
                if (/limit_page_length=\d+/.test(host)) {
                    host = host.replace(/limit_page_length=\d+/, 'limit_page_length=' + limitN);
                } else {
                    host += (host.indexOf('?') === -1 ? '?' : '&') + 'limit_page_length=' + limitN;
                }
            }
        }
        console.log('%c[docAPI] Fetch URL:', 'color:#7c3aed', host);
        var obj_save = {
            'action': 'CM_UngDung/CustomAPIGet',
            'type': 'POST',
            'strHost': host,
            'strApi': '',
            'strLoaiXacThuc': preset.loaiXacThuc || '',
            'strMaXacThuc': preset.token || '',
            'strData': '',
            'strNguoiThucHien_Id': edu.system.userId
        };
        edu.system.makeRequest({
            success: function (data) {
                if (!data.Success) {
                    edu.system.alert("CustomAPIGet: " + data.Message, "w");
                    return cb(false);
                }
                var parsed = null;
                try { parsed = JSON.parse(data.Data); } catch (ex) {
                    edu.system.alert("Response API không phải JSON hợp lệ", "w");
                    return cb(false);
                }
                // Bóc theo path responseUnwrap ('data' hay 'data.listProfile')
                var records = parsed;
                (preset.responseUnwrap || '').split('.').forEach(function (k) {
                    if (records && k) records = records[k];
                });
                if (!Array.isArray(records)) records = [];
                me._docAPI_ApiData = records;
                me._docAPI_ApiCols = records.length ? Object.keys(records[0]) : [];
                // Set keyCol mặc định theo preset nếu có
                me._docAPI_KeyCol = preset.keyCol_default && me._docAPI_ApiCols.indexOf(preset.keyCol_default) !== -1
                    ? preset.keyCol_default
                    : (me._docAPI_ApiCols[0] || '');
                cb(true);
            },
            error: function (er) {
                edu.system.alert("CustomAPIGet (er): " + JSON.stringify(er), "w");
                cb(false);
            },
            type: 'POST', contentType: true,
            action: obj_save.action, data: obj_save, fakedb: []
        }, false, false, false, null);
    },

    docAPI_FetchTargetCols: function (cb) {
        var me = this;
        // Target list = 77 param của Them_HoSo_TS (hardcode, không cần gọi BE).
        // Import qua "Đọc từ API" ghi thẳng vào bảng chuẩn hóa giống Import Excel.
        me._docAPI_TargetCols = me._docAPI_TargetParams.slice();
        cb();
    },

    docAPI_RenderMapping: function () {
        var me = this;
        $('#lblDocAPI_ApiColCount').text(me._docAPI_ApiCols.length);
        $('#lblDocAPI_TargetColCount').text(me._docAPI_TargetCols.length);
        $('#lblDocAPI_RowCount').text(me._docAPI_ApiData.length);

        // Combo cột định danh HS = các cột API
        var $keySel = $('#ddlDocAPI_KeyCol');
        $keySel.empty();
        me._docAPI_ApiCols.forEach(function (c) {
            $keySel.append('<option value="' + edu.util.returnEmpty(c) + '">' + edu.util.returnEmpty(c) + '</option>');
        });
        if (me._docAPI_KeyCol) $keySel.val(me._docAPI_KeyCol);

        // Fallback C: nếu target list rỗng → dùng input text để user tự gõ mã
        var useInputFallback = me._docAPI_TargetCols.length === 0;
        var optsTarget = '';
        if (!useInputFallback) {
            optsTarget = '<option value="">-- Bỏ qua --</option>';
            me._docAPI_TargetCols.forEach(function (t) {
                optsTarget += '<option value="' + edu.util.returnEmpty(t.ma) + '">'
                    + edu.util.returnEmpty(t.ten) + ' [' + edu.util.returnEmpty(t.ma) + ']</option>';
            });
        }

        // Xóa div pagination cũ nếu còn tồn tại (từ v68/v69 đã revert)
        $('#docAPI_MapPagination').remove();

        var sample = me._docAPI_ApiData[0] || {};
        var html = '';
        me._docAPI_ApiCols.forEach(function (col, idx) {
            var sv = sample[col];
            if (typeof sv === 'object') sv = JSON.stringify(sv);
            if (sv == null) sv = '';
            sv = String(sv);
            if (sv.length > 80) sv = sv.substring(0, 80) + '…';
            var mapCell;
            if (useInputFallback) {
                mapCell = '<input type="text" class="form-control form-control-sm docAPI-map-input" '
                    + 'data-apicol="' + edu.util.returnEmpty(col) + '" '
                    + 'placeholder="Gõ mã trường thông tin (để trống = bỏ qua)">';
            } else {
                mapCell = '<select class="form-select form-select-sm docAPI-map-sel" data-apicol="'
                    + edu.util.returnEmpty(col) + '">' + optsTarget + '</select>';
            }
            html += '<tr>'
                + '<td class="td-center">' + (idx + 1) + '</td>'
                + '<td><b>' + edu.util.returnEmpty(col) + '</b></td>'
                + '<td><span style="color:#64748b;">' + me._docAPI_esc(sv) + '</span></td>'
                + '<td>' + mapCell + '</td>'
                + '</tr>';
        });
        if (!html) html = '<tr><td colspan="4" class="td-center text-muted" style="padding:16px;">Không có cột nào từ API</td></tr>';
        $('#tblDocAPI_Mapping tbody').html(html);

        // Restore value cho các select/input theo _docAPI_Mapping đã có (auto-map / localStorage)
        Object.keys(me._docAPI_Mapping).forEach(function (col) {
            var v = me._docAPI_Mapping[col];
            if (!v) return;
            var $sel = $('#tblDocAPI_Mapping select.docAPI-map-sel[data-apicol="' + col + '"]');
            var $inp = $('#tblDocAPI_Mapping input.docAPI-map-input[data-apicol="' + col + '"]');
            if ($sel.length) $sel.val(v);
            else if ($inp.length) $inp.val(v);
        });

        // Banner cảnh báo khi rơi vào fallback
        var $mapWrap = $('#docAPI_MapWrap');
        $mapWrap.find('.docAPI-fallback-warn').remove();
        if (useInputFallback && me._docAPI_ApiCols.length) {
            $mapWrap.prepend(
                '<div class="docAPI-fallback-warn alert alert-warning fz13 mb-10" '
                + 'style="background:#fef3c7; border-left:4px solid #f59e0b; padding:8px 12px; border-radius:4px; color:#92400e;">'
                + '<i class="fa-regular fa-triangle-exclamation"></i> '
                + 'KH này chưa có <b>trường thông tin</b> nào — chuyển sang chế độ nhập tay. '
                + 'Gõ mã đích cho cột API cần import (để trống = bỏ qua).'
                + '</div>'
            );
        }
    },

    /*------------------------------------------
    -- Fuzzy auto-map: chuẩn hóa lowercase + bỏ ký tự không phải chữ/số + so sánh
    -- Ưu tiên khớp tuyệt đối, sau đó khớp chứa nhau
    -------------------------------------------*/
    docAPI_AutoMap: function () {
        var me = this;
        if (!me._docAPI_ApiCols.length || !me._docAPI_TargetCols.length) return;
        function norm(s) {
            return String(s || '').toLowerCase()
                .normalize('NFD').replace(/[̀-ͯ]/g, '')  // bỏ dấu tiếng Việt (combining diacritics)
                .replace(/[^a-z0-9]/g, '');
        }
        var MIN_FUZZY_LEN = 5;   // tránh match ngắn kiểu "ho" (Họ) khớp "thptho"/"hbho"
        var targetsNorm = me._docAPI_TargetCols.map(function (t) {
            return { ma: t.ma, nma: norm(t.ma), nten: norm(t.ten) };
        });
        var validTargetMa = {};
        me._docAPI_TargetCols.forEach(function (t) { validTargetMa[t.ma] = 1; });

        // Dedupe: mỗi target chỉ được map bởi 1 cột API (first-come-first-serve)
        // Ưu tiên: alias thắng fuzzy → chạy 2 pass, pass 1 lấy alias trước
        var used = {};   // { targetMa: apiCol }
        var pendingCols = [];

        // Pass 1: alias exact match — priority tuyệt đối
        // NẾU cột có key trong _docAPI_ColAliases (kể cả value null/'') → EXPLICIT DECISION:
        //   - value truthy + target hợp lệ → map
        //   - value null/'' → SKIP fuzzy (không map, không mismap)
        // Chỉ những cột KHÔNG có key alias mới fall xuống pass 2 fuzzy.
        me._docAPI_ApiCols.forEach(function (col) {
            var colLower = String(col || '').toLowerCase();
            if (me._docAPI_ColAliases.hasOwnProperty(colLower)) {
                var alias = me._docAPI_ColAliases[colLower];
                if (alias && validTargetMa[alias] && !used[alias]) {
                    me._docAPI_Mapping[col] = alias;
                    used[alias] = col;
                    $('#tblDocAPI_Mapping select.docAPI-map-sel[data-apicol="' + col + '"]').val(alias);
                }
                // Có key → tôn trọng quyết định (map hoặc skip), không rơi vào fuzzy
                return;
            }
            pendingCols.push(col);
        });

        // Pass 2: fuzzy match cho các cột còn lại
        pendingCols.forEach(function (col) {
            var nc = norm(col);
            if (!nc) return;
            // Ưu tiên: exact mã > mã contains (min length) > exact tên > tên contains (min length)
            var hit = targetsNorm.find(function (t) {
                return !used[t.ma] && t.nma === nc;
            });
            if (!hit) hit = targetsNorm.find(function (t) {
                return !used[t.ma] && t.nma && t.nma.length >= MIN_FUZZY_LEN
                    && (t.nma.indexOf(nc) !== -1 || nc.indexOf(t.nma) !== -1)
                    && Math.min(t.nma.length, nc.length) >= MIN_FUZZY_LEN;
            });
            if (!hit) hit = targetsNorm.find(function (t) {
                return !used[t.ma] && t.nten === nc;
            });
            if (!hit) hit = targetsNorm.find(function (t) {
                return !used[t.ma] && t.nten && t.nten.length >= MIN_FUZZY_LEN
                    && (t.nten.indexOf(nc) !== -1 || nc.indexOf(t.nten) !== -1)
                    && Math.min(t.nten.length, nc.length) >= MIN_FUZZY_LEN;
            });
            if (hit) {
                me._docAPI_Mapping[col] = hit.ma;
                used[hit.ma] = col;
                $('#tblDocAPI_Mapping select.docAPI-map-sel[data-apicol="' + col + '"]').val(hit.ma);
            }
        });
        me.docAPI_RefreshPreview();
    },

    docAPI_ClearMapping: function () {
        var me = this;
        me._docAPI_Mapping = {};
        $('#tblDocAPI_Mapping select.docAPI-map-sel').val('');
        $('#tblDocAPI_Mapping input.docAPI-map-input').val('');
        me.docAPI_RefreshPreview();
    },

    _docAPI_StorageKey: function () {
        var me = this;
        return (edu.system.strChucNang_Id || '') + '_docAPI_'
            + (me._docAPI_CurrentPresetId || '') + '_'
            + (me.strKeHoachTuyenSinh_Id || '');
    },

    docAPI_SaveMapping: function (announce) {
        var me = this;
        // Đọc lại từ DOM để chắc chắn state đúng (bắt cả select và input fallback)
        me._docAPI_Mapping = {};
        $('#tblDocAPI_Mapping select.docAPI-map-sel').each(function () {
            var col = $(this).attr('data-apicol');
            var v = $(this).val() || '';
            if (v) me._docAPI_Mapping[col] = v;
        });
        $('#tblDocAPI_Mapping input.docAPI-map-input').each(function () {
            var col = $(this).attr('data-apicol');
            var v = ($(this).val() || '').trim();
            if (v) me._docAPI_Mapping[col] = v;
        });
        me._docAPI_KeyCol = $('#ddlDocAPI_KeyCol').val() || '';
        try {
            localStorage.setItem(me._docAPI_StorageKey(), JSON.stringify({
                keyCol: me._docAPI_KeyCol,
                mapping: me._docAPI_Mapping,
                savedAt: new Date().toISOString()
            }));
            if (announce) edu.system.alert("Đã lưu cấu hình mapping cho KH này + nguồn API này.");
        } catch (ex) {
            edu.system.alert("Không lưu được vào localStorage: " + ex.message, "w");
        }
    },

    docAPI_LoadMapping: function () {
        var me = this;
        var raw = null;
        try { raw = localStorage.getItem(me._docAPI_StorageKey()); } catch (ex) { return; }
        if (!raw) return;
        var cfg = null;
        try { cfg = JSON.parse(raw); } catch (ex) { return; }
        if (!cfg) return;
        if (cfg.keyCol && me._docAPI_ApiCols.indexOf(cfg.keyCol) !== -1) {
            me._docAPI_KeyCol = cfg.keyCol;
            $('#ddlDocAPI_KeyCol').val(cfg.keyCol);
        }
        // Filter mapping cũ theo alias hiện tại: nếu cột có explicit null alias → SKIP restore
        // (bảo vệ chống mismap cũ đã lưu trong localStorage từ phiên bản trước).
        var oldMapping = cfg.mapping || {};
        var cleanMapping = {};
        var skippedCount = 0;
        Object.keys(oldMapping).forEach(function (col) {
            var colLower = String(col).toLowerCase();
            if (me._docAPI_ColAliases.hasOwnProperty(colLower)
                && me._docAPI_ColAliases[colLower] == null) {
                skippedCount++;
                return;   // explicit skip, không restore
            }
            cleanMapping[col] = oldMapping[col];
        });
        me._docAPI_Mapping = cleanMapping;
        Object.keys(cleanMapping).forEach(function (col) {
            var $sel = $('#tblDocAPI_Mapping select.docAPI-map-sel[data-apicol="' + col + '"]');
            var $inp = $('#tblDocAPI_Mapping input.docAPI-map-input[data-apicol="' + col + '"]');
            if ($sel.length) $sel.val(cleanMapping[col]);
            else if ($inp.length) $inp.val(cleanMapping[col]);
        });
        var msg = ' <span style="color:#059669;">— Đã khôi phục cấu hình đã lưu.</span>';
        if (skippedCount > 0) {
            msg += ' <span style="color:#d97706;">(Đã bỏ qua ' + skippedCount + ' mapping cũ không hợp lệ.)</span>';
        }
        $('#lblDocAPI_FetchInfo').append(msg);
    },

    /*------------------------------------------
    -- Preview: mỗi record → 1 row với các field đã map.
    -- ⚠ Perf: chỉ render tối đa PREVIEW_LIMIT rows đầu (không full 11K) để tránh freeze
    --   khi user đổi mapping. Import khi bấm "Bắt đầu" vẫn chạy TOÀN BỘ records đã tick.
    -- Debounce hook: dùng docAPI_RefreshPreview_Debounced() ở event handler tương tác.
    -- Pagination: mỗi trang render tối đa _docAPI_PAGE_SIZE row (mặc định 200).
    --   _docAPI_currentPage: index trang hiện tại (0-based)
    --   _docAPI_ManualPicks: dict {idx: true} — record đã tick tay, PERSIST khi đổi trang
    --   _docAPI_SelectedAll: cờ "chọn tất cả" — khi TRUE, import dùng toàn bộ filteredIdx
    --     (bỏ qua ManualPicks) để user không phải tick từng trang.
    -------------------------------------------*/
    _docAPI_PAGE_SIZE: 200,
    _docAPI_currentPage: 0,
    _docAPI_ManualPicks: {},

    docAPI_RefreshPreview_Debounced: function () {
        var me = this;
        if (me._docAPI_previewTimer) clearTimeout(me._docAPI_previewTimer);
        me._docAPI_previewTimer = setTimeout(function () { me.docAPI_RefreshPreview(); }, 400);
    },

    /*------------------------------------------
    -- Build danh sách indices sau khi filter theo _docAPI_FilterKeyword.
    -- Nếu không có filter → trả indices [0..total-1] (nguyên bản).
    -- Nếu có filter → quét toàn bộ records, giữ record có bất kỳ field value chứa keyword.
    -------------------------------------------*/
    _docAPI_getFilteredIdx: function () {
        var me = this;
        var kw = (me._docAPI_FilterKeyword || '').trim().toLowerCase();
        var total = me._docAPI_ApiData.length;
        if (!kw) {
            var all = [];
            for (var i = 0; i < total; i++) all.push(i);
            return all;
        }
        var arr = [];
        for (var j = 0; j < total; j++) {
            var rec = me._docAPI_ApiData[j];
            var match = false;
            for (var k in rec) {
                var v = rec[k];
                if (v == null) continue;
                if (String(v).toLowerCase().indexOf(kw) !== -1) { match = true; break; }
            }
            if (match) arr.push(j);
        }
        return arr;
    },

    docAPI_RefreshPreview: function () {
        var me = this;
        var html = '';
        var mappedCols = Object.keys(me._docAPI_Mapping).filter(function (c) { return me._docAPI_Mapping[c]; });
        var total = me._docAPI_ApiData.length;
        var pageSize = me._docAPI_PAGE_SIZE;
        // Filter theo _docAPI_FilterKeyword (client-side)
        var filteredIdx = me._docAPI_getFilteredIdx();
        var filteredTotal = filteredIdx.length;

        // Cập nhật label info filter
        var kw = me._docAPI_FilterKeyword || '';
        if (kw) {
            $('#lblDocAPI_FilterInfo').html('<i class="fa-solid fa-filter"></i> Lọc: ' + filteredTotal + '/' + total);
        } else {
            $('#lblDocAPI_FilterInfo').text('');
        }

        // Clamp trang hiện tại: nếu filter đổi làm total nhỏ đi → về trang cuối hợp lệ
        var totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
        if (me._docAPI_currentPage >= totalPages) me._docAPI_currentPage = totalPages - 1;
        if (me._docAPI_currentPage < 0) me._docAPI_currentPage = 0;
        var page = me._docAPI_currentPage;
        var start = page * pageSize;
        var end = Math.min(start + pageSize, filteredTotal);
        var picks = me._docAPI_ManualPicks || {};
        var selAll = !!me._docAPI_SelectedAll;

        for (var ii = start; ii < end; ii++) {
            var idx = filteredIdx[ii];
            var rec = me._docAPI_ApiData[idx];
            var maHS = me._docAPI_KeyCol ? edu.util.returnEmpty(rec[me._docAPI_KeyCol]) : '';
            var preview = mappedCols.map(function (col) {
                var v = rec[col];
                // ⚠ Phải check null TRƯỚC typeof === 'object' vì typeof null === 'object' trong JS
                // → nếu không, JSON.stringify(null) = "null" (string) sẽ hiện ra dạng text "null".
                if (v == null) {
                    v = '';
                } else if (typeof v === 'object') {
                    v = JSON.stringify(v);
                }
                var s = String(v);
                if (s.length > 40) s = s.substring(0, 40) + '…';
                return '<span style="margin-right:12px;"><b>' + me._docAPI_Mapping[col] + '</b>=' + me._docAPI_esc(s) + '</span>';
            }).join('');
            // Restore trạng thái tick từ ManualPicks (persist qua các trang)
            var isChecked = selAll || !!picks[idx];
            html += '<tr>'
                + '<td class="td-center"><input type="checkbox" class="docAPI-sel" data-idx="' + idx + '"' + (isChecked ? ' checked' : '') + '></td>'
                + '<td class="td-center">' + (idx + 1) + '</td>'
                + '<td>' + me._docAPI_esc(maHS) + '</td>'
                + '<td>' + (preview || '<span style="color:#94a3b8;">(chưa map cột nào)</span>') + '</td>'
                + '<td class="td-center docAPI-status" data-idx="' + idx + '">—</td>'
                + '<td class="docAPI-errmsg" data-idx="' + idx + '"></td>'
                + '</tr>';
        }
        if (!html) html = '<tr><td colspan="6" class="td-center text-muted" style="padding:16px;">Không có bản ghi nào</td></tr>';
        $('#tblDocAPI_Preview tbody').html(html);

        // Header select-all checkbox: reflect state — "checked" khi flag ON hoặc mọi row của trang đều được pick
        var allPageChecked = false;
        if (end > start) {
            allPageChecked = selAll;
            if (!allPageChecked) {
                allPageChecked = true;
                for (var jj = start; jj < end; jj++) {
                    if (!picks[filteredIdx[jj]]) { allPageChecked = false; break; }
                }
            }
        }
        $('#chkDocAPI_SelectAll').prop('checked', allPageChecked);

        // Render pager
        me._docAPI_RenderPager(filteredTotal, totalPages, page, start, end);
    },

    /*------------------------------------------
    -- Cập nhật UI pagination: enable/disable các nút, hiển thị "Trang x/y", "hiển thị a-b/N",
    -- và số record đã pick tay (nếu có).
    -------------------------------------------*/
    _docAPI_RenderPager: function (filteredTotal, totalPages, page, start, end) {
        var me = this;
        $('#txtDocAPI_PageJump').val(page + 1);
        $('#lblDocAPI_PageTotal').text(totalPages);
        var rangeLbl = filteredTotal === 0 ? '0-0' : ((start + 1) + '-' + end);
        $('#lblDocAPI_PageRange').text(rangeLbl);
        $('#lblDocAPI_PageTotalRec').text(filteredTotal);
        var atFirst = page <= 0;
        var atLast = page >= totalPages - 1;
        $('#btnDocAPI_PageFirst, #btnDocAPI_PagePrev').prop('disabled', atFirst);
        $('#btnDocAPI_PageNext, #btnDocAPI_PageLast').prop('disabled', atLast);
        // Hiển thị số record đã tick tay (persist qua các trang)
        var pickCount = 0;
        if (me._docAPI_ManualPicks) {
            for (var k in me._docAPI_ManualPicks) if (me._docAPI_ManualPicks[k]) pickCount++;
        }
        if (me._docAPI_SelectedAll) {
            $('#lblDocAPI_PagePicks').html('<i class="fa-solid fa-check-double"></i> Đã chọn TẤT CẢ ' + filteredTotal + ' bản ghi');
        } else if (pickCount > 0) {
            $('#lblDocAPI_PagePicks').html('<i class="fa-solid fa-check"></i> Đã tick ' + pickCount + ' bản ghi');
        } else {
            $('#lblDocAPI_PagePicks').text('');
        }
    },

    /*------------------------------------------
    -- Chuyển trang: gọi từ handler nút pager. delta = số trang di chuyển; nếu absolute = true
    -- thì delta là số trang (1-based → 0-based).
    -------------------------------------------*/
    _docAPI_GoPage: function (delta, absolute) {
        var me = this;
        var pageSize = me._docAPI_PAGE_SIZE;
        var filteredIdx = me._docAPI_getFilteredIdx();
        var totalPages = Math.max(1, Math.ceil(filteredIdx.length / pageSize));
        var next;
        if (absolute) next = delta - 1; else next = me._docAPI_currentPage + delta;
        if (next < 0) next = 0;
        if (next > totalPages - 1) next = totalPages - 1;
        if (next === me._docAPI_currentPage) return;
        me._docAPI_currentPage = next;
        me.docAPI_RefreshPreview();
    },

    /*------------------------------------------
    -- Import: mỗi record checked → build 1 payload đầy đủ từ mapping → gọi Them_HoSo_TS.
    -- Data ghi vào bảng chuẩn hóa TS_HOSO (giống Import Excel), hiển thị được ở bảng
    -- "Kết quả đăng ký" mới thông qua LayDS_HoSo_TS.
    -- Progress bar + counter OK/Err.
    -------------------------------------------*/
    /*------------------------------------------
    -- Xuất raw data từ API ra Excel (backup / review offline).
    -- Nếu user tick 1 số record → xuất record đã tick; không tick → xuất tất cả.
    -- Headers = union tất cả keys (record khác nhau có thể có set field khác nhau).
    -- Reuse SheetJS đã load sẵn cho Import Excel.
    -------------------------------------------*/
    docAPI_ExportToExcel: function () {
        var me = this;
        if (typeof XLSX === 'undefined') {
            edu.system.alert("Thư viện Excel chưa load xong, vui lòng thử lại sau vài giây.", "w");
            return;
        }
        if (!me._docAPI_ApiData || !me._docAPI_ApiData.length) {
            edu.system.alert("Chưa có dữ liệu API — bấm 'Kết nối & Tải' trước khi xuất.", "w");
            return;
        }
        // Records cần xuất:
        //   SelectAll flag ON → toàn bộ filteredIdx
        //   Else → ManualPicks giao filteredIdx (persist qua các trang, loại record ngoài filter)
        //   Nếu vẫn 0 → xuất all raw
        var arrIdx = [];
        var filteredIdxExp = me._docAPI_getFilteredIdx();
        if (me._docAPI_SelectedAll) {
            arrIdx = filteredIdxExp.slice();
        } else {
            var filterSetExp = {};
            for (var fx = 0; fx < filteredIdxExp.length; fx++) filterSetExp[filteredIdxExp[fx]] = true;
            for (var k in me._docAPI_ManualPicks) {
                if (me._docAPI_ManualPicks[k] && filterSetExp[k]) arrIdx.push(parseInt(k, 10));
            }
        }
        var records = arrIdx.length
            ? arrIdx.map(function (i) { return me._docAPI_ApiData[i]; })
            : me._docAPI_ApiData.slice();

        // Union keys: quét toàn bộ records để tính đủ headers (order = order xuất hiện)
        var headerSet = {};
        var headers = [];
        records.forEach(function (rec) {
            Object.keys(rec || {}).forEach(function (k) {
                if (!headerSet[k]) { headerSet[k] = 1; headers.push(k); }
            });
        });
        if (!headers.length) {
            edu.system.alert("Records không có field nào để xuất.", "w");
            return;
        }

        // AoA: hàng 1 = headers, hàng 2+ = data (object → JSON string)
        var aoa = [headers];
        records.forEach(function (rec) {
            var row = headers.map(function (h) {
                var v = rec[h];
                if (v == null) return '';
                if (typeof v === 'object') return JSON.stringify(v);
                return v;
            });
            aoa.push(row);
        });

        var ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = headers.map(function (h) {
            return { wch: Math.max(12, Math.min(40, h.length + 2)) };
        });
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DuLieuAPI');

        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        var now = new Date();
        var stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
            + '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
        var preset = me._docAPI_CurrentPresetId || 'API';
        var fname = 'DuLieuAPI_' + preset + '_' + records.length + 'ban_' + stamp + '.xlsx';
        XLSX.writeFile(wb, fname);
        edu.system.alert("Đã xuất " + records.length + " bản ghi ra file " + fname, "s");
    },

    /*------------------------------------------
    -- Log 1 lỗi vào bộ nhớ tổng hợp + hiện nút "Xem chi tiết lỗi" ở progress header.
    -- type: 'BE'  = BE reject (Success=false, ParamErr có nội dung)
    --       'API' = network error khi call BE (không nhận được response)
    -- Sau này có thể thêm 'PARSE' cho trường hợp record API bị lỗi parse ở FE.
    -------------------------------------------*/
    _docAPI_LogError: function (idx, type, msg) {
        var me = this;
        if (!me._docAPI_Errors) me._docAPI_Errors = [];
        var rec = me._docAPI_ApiData[idx] || {};
        var maHS = me._docAPI_KeyCol ? rec[me._docAPI_KeyCol] : '';
        me._docAPI_Errors.push({
            row: idx + 1,
            maHS: maHS || '',
            hoTen: rec.hoten || rec.HoTen || rec.HOTEN || '',
            type: type,
            msg: msg || ''
        });
        // Hiện nút "Xem chi tiết lỗi" ở progress header
        $('#btnDocAPI_ShowErrors').removeClass('d-none');
    },

    /*------------------------------------------
    -- Render danh sách lỗi vào panel #docAPI_ErrorsPanel
    -------------------------------------------*/
    docAPI_RenderErrorsPanel: function () {
        var me = this;
        var errs = me._docAPI_Errors || [];
        $('#lblDocAPI_ErrCount').text(errs.length);
        var $tbody = $('#tblDocAPI_Errors tbody');
        if (!errs.length) {
            $tbody.html('<tr><td colspan="5" class="td-center text-muted" style="padding:12px;">Chưa có lỗi nào</td></tr>');
            return;
        }
        var html = errs.map(function (e) {
            var typeColor = e.type === 'API' ? '#7c2d12' : '#991b1b';
            var typeBg = e.type === 'API' ? '#fed7aa' : '#fecaca';
            return '<tr>'
                + '<td class="td-center">' + e.row + '</td>'
                + '<td>' + me._docAPI_esc(e.maHS) + '</td>'
                + '<td>' + me._docAPI_esc(e.hoTen) + '</td>'
                + '<td class="td-center"><span style="background:' + typeBg + ';color:' + typeColor + ';padding:2px 8px;border-radius:10px;font-weight:600;font-size:11px;">' + e.type + '</span></td>'
                + '<td>' + me._docAPI_esc(e.msg) + '</td>'
                + '</tr>';
        }).join('');
        $tbody.html(html);
    },

    docAPI_StartImport: function () {
        var me = this;
        if (!edu.util.checkValue(me.strKeHoachTuyenSinh_Id)) {
            edu.system.alert("Chưa xác định kế hoạch tuyển sinh", "w"); return;
        }
        var strDotId = $('#ddlDocAPI_Dot').val() || me.strDot_Id_ForKQ || '';
        if (!strDotId) {
            edu.system.alert("Chưa chọn Đợt tuyển sinh", "w"); return;
        }
        var strCoSoId = $('#ddlDocAPI_CoSoDaoTao').val() || '';   // không bắt buộc
        var mappedCols = Object.keys(me._docAPI_Mapping).filter(function (c) { return me._docAPI_Mapping[c]; });
        if (!mappedCols.length) {
            edu.system.alert("Chưa mapping cột nào — vào bước 2 để chọn param tương ứng", "w"); return;
        }
        var arrIdx = [];
        // SelectAll flag ON → import TOÀN BỘ filteredIdx (bỏ qua paging, bỏ qua ManualPicks)
        // Flag OFF → import các record đã tick tay (ManualPicks persist qua các trang),
        //   nhưng CHỈ lấy record còn nằm trong filter hiện tại (tránh import record đã lọc ẩn).
        var filteredIdx = me._docAPI_getFilteredIdx();
        if (me._docAPI_SelectedAll) {
            arrIdx = filteredIdx.slice();
        } else {
            var filterSet = {};
            for (var fi = 0; fi < filteredIdx.length; fi++) filterSet[filteredIdx[fi]] = true;
            for (var pickIdx in me._docAPI_ManualPicks) {
                if (me._docAPI_ManualPicks[pickIdx] && filterSet[pickIdx]) arrIdx.push(parseInt(pickIdx, 10));
            }
            arrIdx.sort(function (a, b) { return a - b; });   // import theo thứ tự record
        }
        if (!arrIdx.length) {
            edu.system.alert("Chưa chọn bản ghi nào để import", "w"); return;
        }

        // Auto-save mapping mỗi lần import (không cần user bấm Lưu)
        me.docAPI_SaveMapping(false);

        // === DEBUG LOG: tổng quan trước khi import ===
        console.log('%c[docAPI] === START IMPORT ===', 'color:#7c3aed;font-weight:bold;font-size:14px', {
            records: arrIdx.length,
            KH_TS_Id: me.strKeHoachTuyenSinh_Id,
            Dot_Id: strDotId,
            mappedCols: mappedCols.length,
            mapping: me._docAPI_Mapping,
            keyCol: me._docAPI_KeyCol,
            preset: me._docAPI_CurrentPresetId
        });

        var totalReq = arrIdx.length;
        var doneReq = 0, okReq = 0, errReq = 0;
        me._docAPI_ImportCancelled = false;
        me._docAPI_Errors = [];   // reset error log tổng hợp
        $('#docAPI_ProgressWrap').removeClass('d-none');
        $('#docAPI_ErrorsPanel').addClass('d-none');   // ẩn panel lỗi cũ
        $('#btnDocAPI_ShowErrors').addClass('d-none');
        $('#btnDocAPI_StartImport').prop('disabled', true);
        $('#btnDocAPI_CancelImport').removeClass('d-none');
        $('#lblDocAPI_Progress').text('0 / ' + totalReq);
        $('#lblDocAPI_OK').text('0'); $('#lblDocAPI_Err').text('0');
        $('#docAPI_ProgressBar').css('width', '0%').text('0%');
        arrIdx.forEach(function (i) {
            $('.docAPI-status[data-idx="' + i + '"]').html('<i class="fa fa-spinner fa-spin"></i>');
            $('.docAPI-errmsg[data-idx="' + i + '"]').html('');
        });

        // Build queue: 1 item per record — row là dict {paramName: value} theo mapping
        var queue = [];
        arrIdx.forEach(function (i) {
            var rec = me._docAPI_ApiData[i];
            var row = {};
            mappedCols.forEach(function (apiCol) {
                var target = me._docAPI_Mapping[apiCol];
                if (!target) return;
                var v = rec[apiCol];
                // Null check TRƯỚC typeof (typeof null === 'object') — tránh gửi text "null" xuống BE.
                if (v == null) {
                    v = '';
                } else if (typeof v === 'object') {
                    v = JSON.stringify(v);
                }
                row[target] = String(v);
            });
            queue.push({ idx: i, row: row });
        });

        function updateProgress() {
            var pct = totalReq > 0 ? Math.round(doneReq * 100 / totalReq) : 0;
            $('#lblDocAPI_Progress').text(doneReq + ' / ' + totalReq);
            $('#lblDocAPI_OK').text(okReq); $('#lblDocAPI_Err').text(errReq);
            $('#docAPI_ProgressBar').css('width', pct + '%').text(pct + '%');
        }

        function runNext(k) {
            if (me._docAPI_ImportCancelled) {
                $('#btnDocAPI_StartImport').prop('disabled', false);
                $('#btnDocAPI_CancelImport').addClass('d-none');
                edu.system.alert("Đã dừng import ở record " + doneReq + "/" + totalReq);
                return;
            }
            if (k >= queue.length) {
                $('#btnDocAPI_StartImport').prop('disabled', false);
                $('#btnDocAPI_CancelImport').addClass('d-none');
                edu.system.alert("Xong. Thành công: " + okReq + " / Lỗi: " + errReq);
                return;
            }
            var item = queue[k];
            // Reuse _buildImportPayload — truyền override Dot_Id + CoSoDaoTao_Id từ combo
            var payload = me._buildImportPayload(item.row, item.idx + 1, { Dot: strDotId, CoSo: strCoSoId });
            // === DEBUG LOG: payload gửi lên ===
            console.log('%c[docAPI] REQUEST #' + (item.idx + 1), 'color:#2563eb;font-weight:bold', {
                idx: item.idx,
                mappedFields: Object.keys(item.row).length,
                row: item.row,
                payload: payload
            });
            edu.system.makeRequest({
                success: function (data) {
                    // === DEBUG LOG: response từ BE ===
                    console.log('%c[docAPI] RESPONSE #' + (item.idx + 1), 'color:#059669;font-weight:bold', {
                        idx: item.idx,
                        success: data && data.Success,
                        message: data && data.Message,
                        rawData: data
                    });
                    doneReq++;
                    var $cell = $('.docAPI-status[data-idx="' + item.idx + '"]');
                    var $errCell = $('.docAPI-errmsg[data-idx="' + item.idx + '"]');
                    var msg = (data && data.Message) || '';
                    if (data && data.Success) {
                        okReq++;
                        if (msg) {
                            // Success nhưng có message — có thể là warning (silent skip)
                            $cell.html('<span style="color:#d97706;" title="' + me._docAPI_esc(msg) + '"><i class="fa fa-exclamation-triangle"></i></span>');
                            $errCell.html('<span style="color:#d97706;">' + me._docAPI_esc(msg) + '</span>');
                        } else {
                            $cell.html('<span class="color-success" title="OK"><i class="fa fa-check"></i></span>');
                            $errCell.html('');
                        }
                    } else {
                        errReq++;
                        var errMsg = msg || 'Lỗi không xác định';
                        $cell.html('<span class="color-red" title="' + me._docAPI_esc(errMsg) + '"><i class="fa fa-times"></i></span>');
                        $errCell.html('<span class="color-red">' + me._docAPI_esc(errMsg) + '</span>');
                        me._docAPI_LogError(item.idx, 'BE', errMsg);
                    }
                    updateProgress();
                    runNext(k + 1);
                },
                error: function (er) {
                    console.error('[docAPI] ERROR #' + (item.idx + 1), er);
                    doneReq++; errReq++;
                    var $cell = $('.docAPI-status[data-idx="' + item.idx + '"]');
                    var $errCell = $('.docAPI-errmsg[data-idx="' + item.idx + '"]');
                    var netErr = 'Network error: ' + JSON.stringify(er);
                    $cell.html('<span class="color-red" title="' + me._docAPI_esc(netErr) + '"><i class="fa fa-times"></i></span>');
                    $errCell.html('<span class="color-red">' + me._docAPI_esc(netErr) + '</span>');
                    me._docAPI_LogError(item.idx, 'API', netErr);
                    updateProgress();
                    runNext(k + 1);
                },
                type: 'POST', contentType: true,
                action: payload.action, data: payload, fakedb: []
            }, false, false, false, null);
        }
        runNext(0);
    }
};
