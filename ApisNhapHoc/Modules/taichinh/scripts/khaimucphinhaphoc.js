function KhaiMucPhi() { }
KhaiMucPhi.prototype = {

    /* --------- STATE --------- */
    strKeHoachNhapHoc_Id: '',       // KH đang được xem (từ dropdown)
    dtKeHoach: [],                  // danh sách kế hoạch nhập học
    dtNhomDinhMuc: [],              // danh sách nhóm định mức của KH đang xem
    dtDM_DonViTien: [],             // Cache DM đơn vị tính (TAICHINH.DVT)
    dtDM_KieuTuDong: [],            // Cache DM kiểu tự động sinh phải thu

    // State cho modal khoản thu (dùng khi Thêm mới khoản thu cần biết đang xem nhóm nào)
    strNhomId_KhoanThu: '',
    strKeHoachId_KhoanThu: '',
    dtKhoanThu: [],
    dtLoaiKhoan: [],                // danh sách khoản thu chung để chọn thêm
    bLoadedCombo_KhoanThu: false,   // flag đã load combo lookup cho form khoản thu chưa

    // State cho modal ngành đầu ra
    strNhomId_NganhDauRa: '',
    strKeHoachId_NganhDauRa: '',
    dtNganhDauRa: [],
    dtKeHoachDauRa: [],             // danh sách chương trình đầu ra để chọn thêm

    // State cho modal cấu hình đầu vào (SV/đối tượng)
    strNhomId_DauVao: '',
    strKeHoachId_DauVao: '',
    dtDauVao: [],
    bLoadedCombo_DoiTuong: false,   // flag đã load combo QLSV.DOITUONG chưa

    /* --------- INIT --------- */
    init: function () {
        var me = this;
        edu.system.page_load();
        me.page_load();
        me.bindEvent();
    },

    page_load: function () {
        this.getList_KeHoachNhapHoc();
        this.preload_DMs();
    },

    /* Preload 2 DM để render tên trong bảng khoản thu (API list chỉ trả mã) */
    preload_DMs: function () {
        var me = this;
        edu.system.getList_DanhMucDulieu(
            { strMaBangDanhMuc: "TAICHINH.DVT", strTenCotSapXep: "", iTrangThai: 1 },
            "", "",
            function (data) { me.dtDM_DonViTien = data || []; }
        );
        edu.system.getList_DanhMucDulieu(
            { strMaBangDanhMuc: "NHAPHOC_CAUHINH_TC.KIEUTUDONG.PHAINOP", strTenCotSapXep: "", iTrangThai: 1 },
            "", "",
            function (data) { me.dtDM_KieuTuDong = data || []; }
        );
    },

    bindEvent: function () {
        var me = this;

        // ============ Fix stacked modal z-index (BS5 không auto adjust) ============
        // Với các modal con (mở trên modal cha), sử dụng shown.bs.modal (sau khi hiện xong)
        // để force z-index cao hơn parent + backdrop tương ứng.
        $(document).off('shown.bs.modal.kmpStack').on('shown.bs.modal.kmpStack', '.modal', function () {
            var $this = $(this);
            var isAlert = $this.attr('id') === 'myModalAlert'
                       || $this.hasClass('modal-alert')
                       || $this.hasClass('modal-confirm');
            var $modals = $('.modal.show');
            var count = $modals.length;
            var zIndex;
            if (isAlert) {
                // Alert/confirm luôn trên cùng, bất kể level
                zIndex = 20000;
            } else if (count <= 1) {
                return; // modal đầu tiên, không cần fix
            } else {
                zIndex = 1055 + 30 * (count - 1);
            }
            $this[0].style.setProperty('z-index', zIndex, 'important');
            var $backdrops = $('.modal-backdrop');
            var $lastBackdrop = $backdrops.last();
            if ($lastBackdrop.length) {
                $lastBackdrop[0].style.setProperty('z-index', zIndex - 5, 'important');
            }
        });

        // Reload danh sách kế hoạch khi gõ từ khóa (debounce nhẹ)
        var tmoTuKhoa = null;
        $("#txtKeyword_HSNH").off("keyup").on("keyup", function () {
            clearTimeout(tmoTuKhoa);
            tmoTuKhoa = setTimeout(function () { me.getList_KeHoachNhapHoc(); }, 400);
        });

        // Nút Xem: load nhóm định mức theo KH đã chọn
        $("#btnXem_HSNH").off("click").on("click", function () {
            var strId = edu.util.getValById('dropKeHoachNhapHoc_HSNH');
            if (!strId) {
                edu.system.alert("Vui lòng chọn kế hoạch nhập học.", "w");
                return;
            }
            me.strKeHoachNhapHoc_Id = strId;
            me.getList_NhomDinhMuc();
        });

        // Nút Tải lại
        $("#btnRefresh_HSNH").off("click").on("click", function () {
            me.getList_KeHoachNhapHoc();
            if (me.strKeHoachNhapHoc_Id) me.getList_NhomDinhMuc();
        });

        // Nút Thêm nhóm — mở modal ở chế độ Thêm mới
        $("#btnAdd_NhomDinhMuc_HSNH").off("click").on("click", function () {
            if (!me.strKeHoachNhapHoc_Id) {
                edu.system.alert("Vui lòng chọn kế hoạch nhập học và bấm Xem trước.", "w");
                return;
            }
            me.openModal_Nhom_Add();
        });

        // Nút Lưu trong modal nhóm
        $("#btnSave_Nhom_HSNH").off("click").on("click", function () {
            me.save_Nhom();
        });

        // Nút Xóa trong modal nhóm
        $("#btnDelete_Nhom_HSNH").off("click").on("click", function () {
            me.delete_Nhom();
        });

        // ----- Modal Cấu hình khoản thu -----
        // Nút "+ Thêm mới khoản thu"
        $("#btnAdd_KhoanThu_HSNH").off("click").on("click", function () {
            if (!me.strNhomId_KhoanThu) {
                edu.system.alert("Không xác định được nhóm.", "w");
                return;
            }
            me.openModal_KhoanThu_Add();
        });

        // Nút "Chi tiết" từng khoản thu → mở modal Edit (dùng data đã có, chưa có API LayTT)
        $("#tblKhoanThu_HSNH")
            .off("click", ".lnkChiTiet_KhoanThu")
            .on("click", ".lnkChiTiet_KhoanThu", function () {
                var strId = $(this).attr("data-id");
                var row = (me.dtKhoanThu || []).find(function (x) {
                    return (x.ID || x.NH_CAUHINH_TC_ID) === strId;
                });
                if (!row) { edu.system.alert("Không tìm thấy khoản thu.", "w"); return; }
                me.openModal_KhoanThu_Edit(row);
            });

        // Nút Lưu / Xóa trong modal khoản thu
        $("#btnSave_KhoanThu_HSNH").off("click").on("click", function () {
            me.save_KhoanThu();
        });
        $("#btnDelete_KhoanThu_HSNH").off("click").on("click", function () {
            me.delete_KhoanThu();
        });

        // ----- Modal Ngành đầu ra -----
        // Nút "+ Thêm ngành" → mở modal chọn từ danh sách kế hoạch đầu ra
        $("#btnAdd_NganhDauRa_HSNH").off("click").on("click", function () {
            if (!me.strNhomId_NganhDauRa) {
                edu.system.alert("Không xác định được nhóm.", "w");
                return;
            }
            me.openModal_ThemNganhDauRa();
        });

        // Filter ds chương trình đầu ra trong modal Thêm
        $("#btnLoc_ThemNganhDauRa_HSNH").off("click").on("click", function () {
            me.getList_KeHoachDauRa();
        });
        var tmoLoc = null;
        $("#txtTuKhoa_ThemNganhDauRa_HSNH").off("keyup").on("keyup", function () {
            clearTimeout(tmoLoc);
            tmoLoc = setTimeout(function () { me.getList_KeHoachDauRa(); }, 400);
        });

        // Select all trong modal Thêm
        $("#chkSelectAll_ThemNganhDauRa_HSNH").off("change").on("change", function () {
            var bCheck = $(this).is(":checked");
            $("#tblThemNganhDauRa_HSNH tbody input.chkThemNganhDauRa_HSNH").prop("checked", bCheck);
        });

        // Nút Lưu trong modal Thêm — duyệt từng bản ghi tick, call API Thêm
        $("#btnSave_ThemNganhDauRa_HSNH").off("click").on("click", function () {
            var arrIds = [];
            $("#tblThemNganhDauRa_HSNH tbody input.chkThemNganhDauRa_HSNH:checked").each(function () {
                arrIds.push($(this).attr("data-id"));
            });
            if (arrIds.length === 0) {
                edu.system.alert("Vui lòng chọn ít nhất một chương trình đầu ra.", "w");
                return;
            }
            me.save_ThemNganhDauRa(arrIds);
        });

        // ----- Modal Cấu hình đầu vào (SV / đối tượng) -----
        // Nút "Thêm mới người học" (chưa có API bạn cấp)
        $("#btnAdd_NguoiHoc_DauVao_HSNH").off("click").on("click", function () {
            edu.system.alert("Chức năng Thêm mới người học sẽ làm khi có API.", "i");
        });

        // Nút "Thêm mới đối tượng" → mở modal chọn đối tượng
        $("#btnAdd_DoiTuong_DauVao_HSNH").off("click").on("click", function () {
            if (!me.strNhomId_DauVao) { edu.system.alert("Không xác định được nhóm.", "w"); return; }
            me.openModal_ThemDoiTuong();
        });

        // Nút Lưu trong modal Thêm đối tượng
        $("#btnSave_ThemDoiTuong_HSNH").off("click").on("click", function () {
            me.save_ThemDoiTuong();
        });

        // Chọn tất cả checkbox
        $("#chkSelectAll_DauVao_HSNH").off("change").on("change", function () {
            var bCheck = $(this).is(":checked");
            $("#tblDauVao_HSNH tbody input.chkDauVao_HSNH").prop("checked", bCheck);
        });

        // Xóa mục đã chọn
        $("#btnDelete_DauVao_HSNH").off("click").on("click", function () {
            var arrIds = [];
            $("#tblDauVao_HSNH tbody input.chkDauVao_HSNH:checked").each(function () {
                arrIds.push($(this).attr("data-id"));
            });
            if (arrIds.length === 0) {
                edu.system.alert("Vui lòng chọn ít nhất một dòng để xóa.", "w");
                return;
            }
            var fnXoa = function () { me.delete_DauVao(arrIds); };
            if (typeof edu.system.confirm === "function") {
                edu.system.confirm("Bạn có chắc chắn muốn xóa " + arrIds.length + " dòng đã chọn?");
                $("#btnYes").off("click.deldauvao").on("click.deldauvao", fnXoa);
            } else if (window.confirm("Bạn có chắc chắn muốn xóa " + arrIds.length + " dòng đã chọn?")) {
                fnXoa();
            }
        });

        // Chọn tất cả checkbox ngành đầu ra
        $("#chkSelectAll_NganhDauRa_HSNH").off("change").on("change", function () {
            var bCheck = $(this).is(":checked");
            $("#tblNganhDauRa_HSNH tbody input.chkNganhDauRa_HSNH").prop("checked", bCheck);
        });

        // Xóa các ngành đã tick (bulk delete)
        $("#btnDelete_NganhDauRa_HSNH").off("click").on("click", function () {
            var arrIds = [];
            $("#tblNganhDauRa_HSNH tbody input.chkNganhDauRa_HSNH:checked").each(function () {
                arrIds.push($(this).attr("data-id"));
            });
            if (arrIds.length === 0) {
                edu.system.alert("Vui lòng chọn ít nhất một dòng để xóa.", "w");
                return;
            }
            var fnXoa = function () { me.delete_NganhDauRa(arrIds); };
            if (typeof edu.system.confirm === "function") {
                edu.system.confirm("Bạn có chắc chắn muốn xóa " + arrIds.length + " ngành đã chọn?");
                $("#btnYes").off("click.delnganh").on("click.delnganh", fnXoa);
            } else if (window.confirm("Bạn có chắc chắn muốn xóa " + arrIds.length + " ngành đã chọn?")) {
                fnXoa();
            }
        });

        // ----- Các link Xem/Chi tiết trong bảng nhóm -----
        $("#tbldata_HSNH")
            .off("click", ".lnkXemKhoanThu")
            .on("click", ".lnkXemKhoanThu", function () {
                me.xem_CauHinh_KhoanThu($(this).attr("data-id"), $(this).attr("data-kehoach-id"));
            });

        $("#tbldata_HSNH")
            .off("click", ".lnkXemNganh")
            .on("click", ".lnkXemNganh", function () {
                me.xem_CauHinh_NganhDauRa($(this).attr("data-id"), $(this).attr("data-kehoach-id"));
            });

        $("#tbldata_HSNH")
            .off("click", ".lnkXemDauVao")
            .on("click", ".lnkXemDauVao", function () {
                me.xem_CauHinh_DauVao($(this).attr("data-id"), $(this).attr("data-kehoach-id"));
            });

        $("#tbldata_HSNH")
            .off("click", ".lnkChiTietNhom")
            .on("click", ".lnkChiTietNhom", function () {
                me.xem_ChiTiet_Nhom($(this).attr("data-id"));
            });
    },

    /* -----------------------------------------------------------------
       [1] LayDS Kế hoạch nhập học
       PKG_CORE_NHAPHOC.LayDS_NH_KeHoach_NhapHoc_By
       ----------------------------------------------------------------- */
    getList_KeHoachNhapHoc: function () {
        var me = this;
        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4BRIeDwkeCiQJLiAiKR4PKSAxCS4iHgM4',
            'func': 'PKG_CORE_NHAPHOC.LayDS_NH_KeHoach_NhapHoc_By',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtKeyword_HSNH'),
            'strTS_KH_TuyenSinh_Id': '',
            'strTS_KH_TuyenSinh_Dot_Id': '',
            'strNhapHoc_Type_Code': '',
            'strStatus_Code': '',
            'dIs_Active': 1,
            'strVaiTro_NhapHoc_Code': '',
            'dChi_KhiLa_Manager': '',
            'dChi_KhiLa_Approver': '',
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKeHoach = data.Data || [];
                    me.genDropdown_KeHoach(me.dtKeHoach);
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    genDropdown_KeHoach: function (arr) {
        var $drop = $("#dropKeHoachNhapHoc_HSNH");
        $drop.empty();
        $drop.append('<option value="">Chọn kế hoạch nhập học</option>');
        (arr || []).forEach(function (r) {
            var strId = r.ID || r.NH_KEHOACH_NHAPHOC_ID || '';
            var strTen = r.TEN || r.TEN_KEHOACH || r.NH_KEHOACH_NHAPHOC_TEN || '';
            $drop.append('<option value="' + strId + '">' + strTen + '</option>');
        });
        if (this.strKeHoachNhapHoc_Id) $drop.val(this.strKeHoachNhapHoc_Id);
    },

    /* -----------------------------------------------------------------
       [2] LayDS Nhóm định mức theo kế hoạch
       PKG_CORE_NHAPHOC.LayDS_NhapHoc_CauHinh_TC_Nhom
       ----------------------------------------------------------------- */
    getList_NhomDinhMuc: function () {
        var me = this;
        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4BRIeDykgMQkuIh4CIDQJKC8pHhUCHg8pLiwP',
            'func': 'PKG_CORE_NHAPHOC.LayDS_NhapHoc_CauHinh_TC_Nhom',
            'iM': edu.system.iM,
            'strNH_KeHoach_NhapHoc_Id': me.strKeHoachNhapHoc_Id,
            'strTuKhoa': '',
            'dIs_Default': '',
            'dIs_Active': 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtNhomDinhMuc = data.Data || [];
                    me.genTable_NhomDinhMuc(me.dtNhomDinhMuc);
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    genTable_NhomDinhMuc: function (arr) {
        var $tbody = $("#tbldata_HSNH tbody");
        $tbody.empty();
        $("#lblTong_NhomDinhMuc").text(arr ? arr.length : 0);

        if (!arr || arr.length === 0) {
            $tbody.append(
                '<tr><td colspan="10">'
                + '<div class="kmp-empty-state">'
                + '<i class="fa-solid fa-inbox"></i>'
                + '<p>Chưa có nhóm định mức nào — bấm <b>Thêm nhóm</b> để tạo mới</p>'
                + '</div>'
                + '</td></tr>'
            );
            return;
        }

        var html = '';
        arr.forEach(function (r, i) {
            var strId = r.ID || r.NH_CAUHINH_TC_NHOM_ID || '';
            var strKeHoachIdRow = r.NH_KEHOACH_NHAPHOC_ID || '';
            var strMa = r.MA_NHOM || r.MA || '';
            var strTen = r.TEN_NHOM || r.TEN || '';
            var strGhiChu = r.GHICHU || r.GHI_CHU || '';
            var strNgayTao = r.NGAYTAO_DD_MM_YYYY_HHMMSS || r.NGAY_TAO || '';
            var strNguoiTao = r.NGUOITAO_TENDAYDU || r.NGUOI_TAO || '';

            var strDataAttrs = 'data-id="' + strId + '" data-kehoach-id="' + strKeHoachIdRow + '"';

            html += '<tr id="row_nhom_' + strId + '" ' + strDataAttrs + '>';
            html += '<td class="td-center">' + (i + 1) + '</td>';
            html += '<td class="td-left">' + strMa + '</td>';
            html += '<td class="td-left">' + strTen + '</td>';
            html += '<td class="td-left">' + strGhiChu + '</td>';
            html += '<td class="td-center"><a class="kmp-link-xem lnkXemKhoanThu" ' + strDataAttrs + '><i class="fa fa-eye"></i> Xem</a></td>';
            html += '<td class="td-center"><a class="kmp-link-xem lnkXemNganh" ' + strDataAttrs + '><i class="fa fa-eye"></i> Xem</a></td>';
            html += '<td class="td-center"><a class="kmp-link-xem lnkXemDauVao" ' + strDataAttrs + '><i class="fa fa-eye"></i> Xem</a></td>';
            html += '<td class="td-center">' + strNgayTao + '</td>';
            html += '<td class="td-left">' + strNguoiTao + '</td>';
            html += '<td class="td-center"><a class="kmp-link-xem lnkChiTietNhom" ' + strDataAttrs + '><i class="fa-solid fa-pen-to-square"></i> Chi tiết</a></td>';
            html += '</tr>';
        });
        $tbody.append(html);
    },

    /* -----------------------------------------------------------------
       [3] Xem cấu hình các khoản thu của nhóm → mở modal chuyên
       PKG_CORE_NHAPHOC.LayDS_NhapHoc_CauHinh_TC
       ----------------------------------------------------------------- */
    xem_CauHinh_KhoanThu: function (strNhomId, strKeHoachIdRow) {
        var me = this;
        me.strNhomId_KhoanThu = strNhomId;
        me.strKeHoachId_KhoanThu = strKeHoachIdRow;

        // Tìm tên nhóm để hiển thị label
        var strTenNhom = '';
        (me.dtNhomDinhMuc || []).forEach(function (r) {
            var id = r.ID || r.NH_CAUHINH_TC_NHOM_ID;
            if (id === strNhomId) strTenNhom = r.TEN_NHOM || r.TEN || '';
        });
        $("#lblNhomInfo_KhoanThu").text(
            "Nhóm: " + (strTenNhom || strNhomId) + "  |  Mã nhóm ID: " + strNhomId
        );

        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4BRIeDykgMQkuIh4CIDQJKC8pHhUC',
            'func': 'PKG_CORE_NHAPHOC.LayDS_NhapHoc_CauHinh_TC',
            'iM': edu.system.iM,
            'strNH_CauHinh_TC_Nhom_Id': strNhomId,
            'strNH_KeHoach_NhapHoc_Id': strKeHoachIdRow,
            'strTaiChinh_CacKhoanThu_Id': '',
            'dBat_Buoc': '',
            'dIs_Active': 1,
            'dChi_Ban_Ghi_HienTai': 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKhoanThu = data.Data || [];
                    me.genTable_KhoanThu(me.dtKhoanThu);
                    $("#modalKhoanThu_HSNH").modal("show");
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* Render bảng khoản thu — cột đúng theo Excel */
    genTable_KhoanThu: function (arr) {
        var me = this;
        var $tbody = $("#tblKhoanThu_HSNH tbody");
        $tbody.empty();

        if (!arr || arr.length === 0) {
            $tbody.append('<tr><td colspan="13" class="td-center italic color-666">Chưa có khoản thu nào trong nhóm.</td></tr>');
            return;
        }
        // Helper: lookup TEN từ cache DM theo MA
        var lookupDM = function (dmArr, code) {
            if (!code) return '';
            if (!dmArr || !dmArr.length) return code;
            for (var j = 0; j < dmArr.length; j++) {
                if (dmArr[j].MA === code) return dmArr[j].TEN || code;
            }
            return code;
        };

        var html = '';
        arr.forEach(function (r, i) {
            var strId = r.ID || r.NH_CAUHINH_TC_ID || '';
            var strTen = r.TEN_HIEN_THI || r.TEN || '';
            var strMa = r.KHOANTHU_MA || r.MA || '';
            var strNhomTen = r.NHOM_TEN || '';
            var strDinhMuc = r.SO_TIEN_DINH_MUC != null ? r.SO_TIEN_DINH_MUC : '';
            // API trả DON_VI_TIEN_ID chứa mã (VD "DOT"), TEN=null → lookup từ DM
            var strDonVi = lookupDM(me.dtDM_DonViTien, r.DON_VI_TIEN_ID || r.DON_VI_TIEN_MA);
            var iBatBuoc = Number(r.BAT_BUOC || 0);
            var iTuDongSinh = Number(r.TU_DONG_SINH_PHAITHU || 0);
            var strThuTu = r.THU_TU_HIEN_THI != null ? r.THU_TU_HIEN_THI : '';
            // API trả KIEU_TU_DONG_SINH_PHAITHU_ID chứa mã (VD "DINHMUC"), TEN=null → lookup từ DM
            var strKieuTuDong = lookupDM(me.dtDM_KieuTuDong, r.KIEU_TU_DONG_SINH_PHAITHU_ID || r.KIEU_SINH_PHAITHU_ID);
            var iChoPhepMienGiam = Number(r.CHO_PHEP_MIEN_GIAM || 0);
            var strGhiChu = r.GHICHU || r.GHI_CHU || '';

            // format số tiền có dấu phân cách hàng nghìn
            var strDinhMucFmt = strDinhMuc;
            if (strDinhMuc !== '' && !isNaN(strDinhMuc)) {
                strDinhMucFmt = Number(strDinhMuc).toLocaleString('vi-VN');
            }

            html += '<tr id="row_khoanthu_' + strId + '" data-id="' + strId + '">';
            html += '<td class="td-center">' + (i + 1) + '</td>';
            html += '<td class="td-left">' + strTen + '</td>';
            html += '<td class="td-left">' + strMa + '</td>';
            html += '<td class="td-left">' + strNhomTen + '</td>';
            html += '<td class="td-right">' + strDinhMucFmt + '</td>';
            html += '<td class="td-center">' + strDonVi + '</td>';
            html += '<td class="td-center">' + (iBatBuoc === 1 ? '<span class="label label-danger">Bắt buộc</span>' : '') + '</td>';
            html += '<td class="td-center">' + (iTuDongSinh === 1 ? '<span class="label label-info">Tự động sinh phải thu</span>' : '') + '</td>';
            html += '<td class="td-center">' + strThuTu + '</td>';
            html += '<td class="td-left">' + strKieuTuDong + '</td>';
            html += '<td class="td-center">' + (iChoPhepMienGiam === 1 ? '<span class="label label-success">Cho phép áp dụng miễn giảm</span>' : '') + '</td>';
            html += '<td class="td-left">' + strGhiChu + '</td>';
            html += '<td class="td-center"><a class="kmp-link-xem lnkChiTiet_KhoanThu" data-id="' + strId + '"><i class="fa fa-pencil"></i> Chi tiết</a></td>';
            html += '</tr>';
        });
        $tbody.append(html);
    },

    /* -----------------------------------------------------------------
       [4] Xem cấu hình ngành đầu ra nhận mức theo nhóm → modal chuyên
       PKG_CORE_NHAPHOC.LayDS_NH_CauHinh_TC_Nhom_DauRa
       ----------------------------------------------------------------- */
    xem_CauHinh_NganhDauRa: function (strNhomId, strKeHoachIdRow) {
        var me = this;
        me.strNhomId_NganhDauRa = strNhomId;
        me.strKeHoachId_NganhDauRa = strKeHoachIdRow;

        // Tên nhóm để hiển thị
        var strTenNhom = '';
        (me.dtNhomDinhMuc || []).forEach(function (r) {
            var id = r.ID || r.NH_CAUHINH_TC_NHOM_ID;
            if (id === strNhomId) strTenNhom = r.TEN_NHOM || r.TEN || '';
        });
        $("#lblNhomInfo_NganhDauRa").text(
            "Nhóm: " + (strTenNhom || strNhomId) + "  |  Mã nhóm ID: " + strNhomId
        );

        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4BRIeDwkeAiA0CSgvKR4VAh4PKS4sHgUgNBMg',
            'func': 'PKG_CORE_NHAPHOC.LayDS_NH_CauHinh_TC_Nhom_DauRa',
            'iM': edu.system.iM,
            'strNH_CauHinh_TC_Nhom_Id': strNhomId,
            'strNH_KeHoach_NhapHoc_Id': strKeHoachIdRow,
            'strNH_KeHoach_DauRa_Id': '',
            'dIs_Active': 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtNganhDauRa = data.Data || [];
                    me.genTable_NganhDauRa(me.dtNganhDauRa);
                    $("#chkSelectAll_NganhDauRa_HSNH").prop("checked", false);
                    $("#modalNganhDauRa_HSNH").modal("show");
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* Render bảng ngành đầu ra — cột đúng theo Excel */
    genTable_NganhDauRa: function (arr) {
        var $tbody = $("#tblNganhDauRa_HSNH tbody");
        $tbody.empty();

        if (!arr || arr.length === 0) {
            $tbody.append('<tr><td colspan="9" class="td-center italic color-666">Chưa có ngành đầu ra nào.</td></tr>');
            return;
        }

        var html = '';
        arr.forEach(function (r, i) {
            var strId = r.ID || r.NH_CAUHINH_TC_NHOM_DAURA_ID || '';
            var strHe = r.TENHEDAOTAO || r.TEN_HEDAOTAO || r.TEN_HE_DAOTAO || '';
            var strKhoa = r.TENKHOA || r.TEN_KHOA || '';
            var strNganhDT = r.TEN_NGANH_DT || r.TEN_NGANHDT || '';
            var strNganhTS = r.TEN_NGANH_TS || r.TEN_NGANHTS || '';
            var strKhoaQL = r.TEN_KHOAQUANLY || r.TENKHOAQUANLY || '';
            var strTenCT = r.TENCHUONGTRINH || r.TEN_CHUONGTRINH || '';
            var strMaCT = r.MACHUONGTRINH || r.MA_CHUONGTRINH || '';
            var strChuongTrinh = strTenCT + (strMaCT ? ' (' + strMaCT + ')' : '');
            var strGhiChu = r.GHICHU || r.GHI_CHU || '';

            html += '<tr id="row_nganhdaura_' + strId + '" data-id="' + strId + '">';
            html += '<td class="td-center">' + (i + 1) + '</td>';
            html += '<td class="td-left">' + strHe + '</td>';
            html += '<td class="td-left">' + strKhoa + '</td>';
            html += '<td class="td-left">' + strNganhDT + '</td>';
            html += '<td class="td-left">' + strNganhTS + '</td>';
            html += '<td class="td-left">' + strKhoaQL + '</td>';
            html += '<td class="td-left">' + strChuongTrinh + '</td>';
            html += '<td class="td-left">' + strGhiChu + '</td>';
            html += '<td class="td-center"><input type="checkbox" class="chkNganhDauRa_HSNH" data-id="' + strId + '" /></td>';
            html += '</tr>';
        });
        $tbody.append(html);
    },

    /* -----------------------------------------------------------------
       [5] Xem cấu hình đầu vào (SV/đối tượng) → modal chuyên
       PKG_CORE_NHAPHOC.LayDS_NH_CauHinh_TC_Nhom_DT
       ----------------------------------------------------------------- */
    xem_CauHinh_DauVao: function (strNhomId, strKeHoachIdRow) {
        var me = this;
        me.strNhomId_DauVao = strNhomId;
        me.strKeHoachId_DauVao = strKeHoachIdRow;

        // Tên nhóm để hiển thị
        var strTenNhom = '';
        (me.dtNhomDinhMuc || []).forEach(function (r) {
            var id = r.ID || r.NH_CAUHINH_TC_NHOM_ID;
            if (id === strNhomId) strTenNhom = r.TEN_NHOM || r.TEN || '';
        });
        $("#lblNhomInfo_DauVao").text(
            "Nhóm: " + (strTenNhom || strNhomId) + "  |  Mã nhóm ID: " + strNhomId
        );

        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4BRIeDwkeAiA0CSgvKR4VAh4PKS4sHgUV',
            'func': 'PKG_CORE_NHAPHOC.LayDS_NH_CauHinh_TC_Nhom_DT',
            'iM': edu.system.iM,
            'strNH_CauHinh_TC_Nhom_Id': strNhomId,
            'strNH_KeHoach_NhapHoc_Id': strKeHoachIdRow,
            'strCore_Person_Id': '',
            'strDoi_Tuong_ApDung_Id': '',
            'strLoai_ApDung': '',
            'dIs_Active': 1,
            'dChi_Ban_Ghi_HienTai': 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtDauVao = data.Data || [];
                    me.genTable_DauVao(me.dtDauVao);
                    $("#chkSelectAll_DauVao_HSNH").prop("checked", false);
                    $("#modalDauVao_HSNH").modal("show");
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* Render bảng đầu vào — cột đúng theo Excel */
    genTable_DauVao: function (arr) {
        var $tbody = $("#tblDauVao_HSNH tbody");
        $tbody.empty();

        if (!arr || arr.length === 0) {
            $tbody.append('<tr><td colspan="8" class="td-center italic color-666">Chưa có cấu hình đầu vào nào.</td></tr>');
            return;
        }

        var html = '';
        arr.forEach(function (r, i) {
            var strId = r.ID || r.NH_CAUHINH_TC_NHOM_DT_ID || '';
            var strMaSo = r.SV_MASO || r.MASO || '';
            var strHoTen = r.SV_HOTEN || r.HOTEN || '';
            var strDoiTuong = r.DOI_TUONG_TEN || r.DOITUONG_TEN || '';
            var strGhiChu = r.GHICHU || r.GHI_CHU || r.GhiChu || '';
            var iIsActive = Number(r.IS_ACTIVE || 0);
            var iIsCurrent = Number(r.IS_CURRENT || 0);

            html += '<tr data-id="' + strId + '">';
            html += '<td class="td-center">' + (i + 1) + '</td>';
            html += '<td class="td-left">' + strMaSo + '</td>';
            html += '<td class="td-left">' + strHoTen + '</td>';
            html += '<td class="td-left">' + strDoiTuong + '</td>';
            html += '<td class="td-left">' + strGhiChu + '</td>';
            html += '<td class="td-center">' + (iIsActive === 1
                ? '<span class="label label-success">Hiệu lực</span>'
                : '<span class="label label-default">Ngừng</span>') + '</td>';
            html += '<td class="td-center">' + (iIsCurrent === 1
                ? '<span class="label label-info">Đang dùng</span>'
                : '') + '</td>';
            html += '<td class="td-center"><input type="checkbox" class="chkDauVao_HSNH" data-id="' + strId + '" /></td>';
            html += '</tr>';
        });
        $tbody.append(html);
    },

    /* =================================================================
       ĐẦU VÀO — Xóa nhiều bản ghi
       PKG_CORE_NHAPHOC.Xoa_NH_CauHinh_TC_Nhom_DT
       ================================================================= */
    delete_DauVao: function (arrIds) {
        var me = this;
        if (!arrIds || arrIds.length === 0) return;

        var iDone = 0, iOk = 0, iFail = 0;
        var arrFailMsg = [];
        var iTotal = arrIds.length;

        arrIds.forEach(function (strId) {
            var obj_save = {
                'action': 'SV_Core_NhapHoc_MH/GS4gHg8JHgIgNAkoLykeFQIeDykuLB4FFQPP',
                'func': 'PKG_CORE_NHAPHOC.Xoa_NH_CauHinh_TC_Nhom_DT',
                'iM': edu.system.iM,
                'strId': strId,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
            edu.system.makeRequest({
                success: function (data) {
                    iDone++;
                    if (data.Success) { iOk++; }
                    else { iFail++; arrFailMsg.push(strId + ": " + (data.Message || '')); }
                    if (iDone === iTotal) me._onDone_Xoa_DauVao(iOk, iFail, arrFailMsg);
                },
                error: function (er) {
                    iDone++; iFail++;
                    arrFailMsg.push(strId + ": " + JSON.stringify(er));
                    if (iDone === iTotal) me._onDone_Xoa_DauVao(iOk, iFail, arrFailMsg);
                },
                type: 'POST',
                action: obj_save.action,
                contentType: true,
                data: obj_save
            }, false, false, false, null);
        });
    },

    _onDone_Xoa_DauVao: function (iOk, iFail, arrFailMsg) {
        var me = this;
        var strMsg = "Đã xóa " + iOk + " dòng thành công.";
        if (iFail > 0) {
            strMsg += " Thất bại " + iFail + " dòng.";
            if (arrFailMsg.length) console.warn("Xóa cấu hình đầu vào — chi tiết lỗi:", arrFailMsg);
        }
        edu.system.alert(strMsg, iFail > 0 ? "w" : "");
        me.xem_CauHinh_DauVao(me.strNhomId_DauVao, me.strKeHoachId_DauVao);
    },

    /* -----------------------------------------------------------------
       [6] Xem chi tiết 1 nhóm → mở form edit
       PKG_CORE_NHAPHOC.LayTT_NhapHoc_CauHinh_TC_Nhom
       ----------------------------------------------------------------- */
    xem_ChiTiet_Nhom: function (strNhomId) {
        var me = this;
        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4FRUeDykgMQkuIh4CIDQJKC8pHhUCHg8pLiwP',
            'func': 'PKG_CORE_NHAPHOC.LayTT_NhapHoc_CauHinh_TC_Nhom',
            'iM': edu.system.iM,
            'strId': strNhomId,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var arr = data.Data || [];
                    var r = Array.isArray(arr) ? arr[0] : arr;
                    if (!r) { edu.system.alert("Không tìm thấy dữ liệu nhóm.", "w"); return; }
                    me.openModal_Nhom_Edit(r);
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* -----------------------------------------------------------------
       [7] Mở modal Thêm mới nhóm
       ----------------------------------------------------------------- */
    openModal_Nhom_Add: function () {
        $("#modalNhom_HSNH_Title").text("Thêm mới nhóm");
        $("#hdId_Nhom_HSNH").val("");
        $("#hdKeHoachId_Nhom_HSNH").val(this.strKeHoachNhapHoc_Id);
        $("#txtMa_Nhom_HSNH").val("");
        $("#txtTen_Nhom_HSNH").val("");
        $("#txtPriority_Nhom_HSNH").val(100);
        $("#chkHieuLuc_Nhom_HSNH").prop("checked", true);
        $("#txtGhiChu_Nhom_HSNH").val("");
        $("#zoneDelete_Nhom_HSNH").hide();
        $("#modalNhom_HSNH").modal("show");
    },

    /* -----------------------------------------------------------------
       [8] Mở modal Xem & chỉnh sửa nhóm (đổ dữ liệu)
       ----------------------------------------------------------------- */
    openModal_Nhom_Edit: function (r) {
        var strId = r.ID || r.NH_CAUHINH_TC_NHOM_ID || '';
        var strKeHoachId = r.NH_KEHOACH_NHAPHOC_ID || this.strKeHoachNhapHoc_Id || '';
        var strMa = r.MA_NHOM || r.MA || '';
        var strTen = r.TEN_NHOM || r.TEN || '';
        var iPriority = (r.PRIORITY_NO !== undefined && r.PRIORITY_NO !== null) ? r.PRIORITY_NO : 100;
        var iIsDefault = (r.IS_DEFAULT !== undefined && r.IS_DEFAULT !== null) ? Number(r.IS_DEFAULT) : 1;
        var strGhiChu = r.GHICHU || r.GHI_CHU || '';

        $("#modalNhom_HSNH_Title").text("Xem và chỉnh sửa nhóm");
        $("#hdId_Nhom_HSNH").val(strId);
        $("#hdKeHoachId_Nhom_HSNH").val(strKeHoachId);
        $("#txtMa_Nhom_HSNH").val(strMa);
        $("#txtTen_Nhom_HSNH").val(strTen);
        $("#txtPriority_Nhom_HSNH").val(iPriority);
        $("#chkHieuLuc_Nhom_HSNH").prop("checked", iIsDefault === 1);
        $("#txtGhiChu_Nhom_HSNH").val(strGhiChu);
        $("#zoneDelete_Nhom_HSNH").show();
        $("#modalNhom_HSNH").modal("show");
    },

    /* -----------------------------------------------------------------
       [9] Lưu (Thêm mới hoặc Cập nhật) nhóm
       PKG_CORE_NHAPHOC.Them_NhapHoc_CauHinh_TC_Nhom / Sua_NhapHoc_CauHinh_TC_Nhom
       ----------------------------------------------------------------- */
    save_Nhom: function () {
        var me = this;
        var strId = edu.util.getValById('hdId_Nhom_HSNH');
        var strMa = edu.util.getValById('txtMa_Nhom_HSNH');
        var strTen = edu.util.getValById('txtTen_Nhom_HSNH');
        var strPriority = edu.util.getValById('txtPriority_Nhom_HSNH');
        var iIsDefault = $("#chkHieuLuc_Nhom_HSNH").is(":checked") ? 1 : 0;
        var strGhiChu = edu.util.getValById('txtGhiChu_Nhom_HSNH');

        if (!strMa || !strMa.trim()) { edu.system.alert("Vui lòng nhập Mã nhóm.", "w"); return; }
        if (!strTen || !strTen.trim()) { edu.system.alert("Vui lòng nhập Tên nhóm.", "w"); return; }

        var obj_save;
        if (!strId) {
            // Thêm mới
            obj_save = {
                'action': 'SV_Core_NhapHoc_MH/FSkkLB4PKSAxCS4iHgIgNAkoLykeFQIeDykuLAPP',
                'func': 'PKG_CORE_NHAPHOC.Them_NhapHoc_CauHinh_TC_Nhom',
                'iM': edu.system.iM,
                'strNH_KeHoach_NhapHoc_Id': edu.util.getValById('hdKeHoachId_Nhom_HSNH') || me.strKeHoachNhapHoc_Id,
                'strMa_Nhom': strMa,
                'strTen_Nhom': strTen,
                'dIs_Default': iIsDefault,
                'dPriority_No': strPriority || 100,
                'strGhiChu': strGhiChu,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
        } else {
            // Cập nhật
            obj_save = {
                'action': 'SV_Core_NhapHoc_MH/EjQgHg8pIDEJLiIeAiA0CSgvKR4VAh4PKS4s',
                'func': 'PKG_CORE_NHAPHOC.Sua_NhapHoc_CauHinh_TC_Nhom',
                'iM': edu.system.iM,
                'strId': strId,
                'strMa_Nhom': strMa,
                'strTen_Nhom': strTen,
                'dIs_Default': iIsDefault,
                'dPriority_No': strPriority || 100,
                'strGhiChu': strGhiChu,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert(strId ? "Cập nhật thành công!" : "Thêm mới thành công!");
                    $("#modalNhom_HSNH").modal("hide");
                    me.getList_NhomDinhMuc();
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* -----------------------------------------------------------------
       [10] Xóa nhóm
       PKG_CORE_NHAPHOC.Xoa_NhapHoc_CauHinh_TC_Nhom
       ----------------------------------------------------------------- */
    delete_Nhom: function () {
        var me = this;
        var strId = edu.util.getValById('hdId_Nhom_HSNH');
        if (!strId) { edu.system.alert("Không xác định được nhóm cần xóa.", "w"); return; }

        var fnXoa = function () {
            var obj_save = {
                'action': 'SV_Core_NhapHoc_MH/GS4gHg8pIDEJLiIeAiA0CSgvKR4VAh4PKS4s',
                'func': 'PKG_CORE_NHAPHOC.Xoa_NhapHoc_CauHinh_TC_Nhom',
                'iM': edu.system.iM,
                'strId': strId,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) {
                        edu.system.alert("Xóa nhóm thành công!");
                        $("#modalNhom_HSNH").modal("hide");
                        me.getList_NhomDinhMuc();
                    } else {
                        edu.system.alert(data.Message, "s");
                    }
                },
                error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
                type: 'POST',
                action: obj_save.action,
                contentType: true,
                data: obj_save
            }, false, false, false, null);
        };

        // Xác nhận trước khi xóa
        if (typeof edu.system.confirm === "function") {
            edu.system.confirm("Bạn có chắc chắn muốn xóa nhóm này?");
            $("#btnYes").off("click.delnhom").on("click.delnhom", fnXoa);
        } else if (window.confirm("Bạn có chắc chắn muốn xóa nhóm này?")) {
            fnXoa();
        }
    },

    /* -----------------------------------------------------------------
       Modal xem chung — tự động render cột theo field trả về
       ----------------------------------------------------------------- */
    showModal_Xem: function (strTitle, strSubTitle, arr) {
        $("#modalXem_HSNH_Title").text(strTitle);
        $("#modalXem_HSNH_SubTitle").text(strSubTitle + " — Tổng số bản ghi: " + (arr ? arr.length : 0));

        var $thead = $("#tbldata_XemChiTiet_HSNH thead");
        var $tbody = $("#tbldata_XemChiTiet_HSNH tbody");
        $thead.empty();
        $tbody.empty();

        if (!arr || arr.length === 0) {
            $thead.append('<tr><th class="td-center">Dữ liệu</th></tr>');
            $tbody.append('<tr><td class="td-center italic color-666">Không có dữ liệu.</td></tr>');
        } else {
            var keys = Object.keys(arr[0]);
            var htmlHead = '<tr><th class="td-center" style="width:40px">STT</th>';
            keys.forEach(function (k) { htmlHead += '<th class="td-center">' + k + '</th>'; });
            htmlHead += '</tr>';
            $thead.append(htmlHead);

            var htmlBody = '';
            arr.forEach(function (r, i) {
                htmlBody += '<tr><td class="td-center">' + (i + 1) + '</td>';
                keys.forEach(function (k) {
                    var v = r[k];
                    if (v === null || v === undefined) v = '';
                    htmlBody += '<td class="td-left">' + v + '</td>';
                });
                htmlBody += '</tr>';
            });
            $tbody.append(htmlBody);
        }
        $("#modalXem_HSNH").modal("show");
    },

    /* =================================================================
       KHOẢN THU — Add / Edit / Delete
       ================================================================= */

    /* Load 3 combo lookup cho form (chỉ load 1 lần) */
    loadCombos_KhoanThu: function (cb) {
        var me = this;
        if (me.bLoadedCombo_KhoanThu) { if (cb) cb(); return; }

        // Đơn vị tính + Kiểu tự động sinh phải thu
        // Gọi trực tiếp getList_DanhMucDulieu + loadToCombo_data để kiểm soát placeholder,
        // tránh loadToCombo_DanhMucDuLieu echo mã DM thô ra text placeholder.
        edu.system.getList_DanhMucDulieu(
            { strMaBangDanhMuc: "TAICHINH.DVT", strTenCotSapXep: "", iTrangThai: 1 },
            "", "",
            function (data) {
                edu.system.loadToCombo_data({
                    data: data || [],
                    renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
                    renderPlace: ["dropDonVi_KhoanThu_HSNH"],
                    title: "Chọn đơn vị tính",
                    default_val: ""
                });
            }
        );
        edu.system.getList_DanhMucDulieu(
            { strMaBangDanhMuc: "NHAPHOC_CAUHINH_TC.KIEUTUDONG.PHAINOP", strTenCotSapXep: "", iTrangThai: 1 },
            "", "",
            function (data) {
                edu.system.loadToCombo_data({
                    data: data || [],
                    renderInfor: { id: "MA", parentId: "", name: "TEN", code: "MA" },
                    renderPlace: ["dropKieuTuDong_KhoanThu_HSNH"],
                    title: "Chọn kiểu tự động sinh phải thu",
                    default_val: ""
                });
            }
        );

        // Danh sách khoản thu (TC_KhoanThu/LayDanhSach)
        var obj_list = {
            'action': 'TC_KhoanThu/LayDanhSach',
            'versionAPI': 'v1.0',
            'strTuKhoa': '',
            'strNhomCacKhoanThu_Id': '',
            'pageIndex': 1,
            'pageSize': 1000,
            'strNguoiTao_Id': '',
            'strCanBoQuanLy_Id': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtLoaiKhoan = data.Data || [];
                    edu.system.loadToCombo_data({
                        data: me.dtLoaiKhoan,
                        renderInfor: { id: "ID", parentId: "", name: "TEN", code: "", avatar: "" },
                        renderPlace: ["dropKhoanThu_KhoanThu_HSNH"],
                        type: "",
                        title: "Chọn khoản thu"
                    });
                    me.bLoadedCombo_KhoanThu = true;
                    if (cb) cb();
                } else {
                    edu.system.alert("Load khoản thu: " + data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'GET',
            action: obj_list.action,
            versionAPI: obj_list.versionAPI,
            contentType: true,
            data: obj_list
        }, false, false, false, null);
    },

    /* Mở modal Thêm mới khoản thu */
    openModal_KhoanThu_Add: function () {
        var me = this;
        me.loadCombos_KhoanThu(function () {
            $("#modalKhoanThuEdit_HSNH_Title").text("Thêm mới khoản thu");
            $("#hdId_KhoanThu_HSNH").val("");
            edu.util.viewValById("dropKhoanThu_KhoanThu_HSNH", "");
            $("#txtTenHienThi_KhoanThu_HSNH").val("");
            $("#txtDinhMuc_KhoanThu_HSNH").val("");
            edu.util.viewValById("dropDonVi_KhoanThu_HSNH", "");
            $("#chkBatBuoc_KhoanThu_HSNH").prop("checked", false);
            $("#chkTuDongSinh_KhoanThu_HSNH").prop("checked", true);
            $("#txtThuTu_KhoanThu_HSNH").val(0);
            edu.util.viewValById("dropKieuTuDong_KhoanThu_HSNH", "");
            $("#chkChoPhepMienGiam_KhoanThu_HSNH").prop("checked", false);
            $("#txtGhiChu_KhoanThu_HSNH").val("");
            $("#zoneDelete_KhoanThu_HSNH").hide();
            // Khi thêm mới cho phép chọn khoản thu
            $("#dropKhoanThu_KhoanThu_HSNH").prop("disabled", false).trigger("change.select2");
            $("#modalKhoanThuEdit_HSNH").modal("show");
        });
    },

    /* Mở modal Sửa (dùng row đã có, chưa có API LayTT khoản thu) */
    openModal_KhoanThu_Edit: function (r) {
        var me = this;
        me.loadCombos_KhoanThu(function () {
            $("#modalKhoanThuEdit_HSNH_Title").text("Xem và chỉnh sửa khoản thu");
            var strId = r.ID || r.NH_CAUHINH_TC_ID || '';
            $("#hdId_KhoanThu_HSNH").val(strId);
            edu.util.viewValById("dropKhoanThu_KhoanThu_HSNH",
                r.TAICHINH_CACKHOANTHU_ID || r.KHOANTHU_ID || '');
            $("#txtTenHienThi_KhoanThu_HSNH").val(r.TEN_HIEN_THI || '');
            $("#txtDinhMuc_KhoanThu_HSNH").val(r.SO_TIEN_DINH_MUC != null ? r.SO_TIEN_DINH_MUC : '');
            edu.util.viewValById("dropDonVi_KhoanThu_HSNH", r.DON_VI_TIEN_ID || r.DON_VI_TIEN_MA || '');
            $("#chkBatBuoc_KhoanThu_HSNH").prop("checked", Number(r.BAT_BUOC || 0) === 1);
            $("#chkTuDongSinh_KhoanThu_HSNH").prop("checked", Number(r.TU_DONG_SINH_PHAITHU || 0) === 1);
            $("#txtThuTu_KhoanThu_HSNH").val(r.THU_TU_HIEN_THI != null ? r.THU_TU_HIEN_THI : 0);
            edu.util.viewValById("dropKieuTuDong_KhoanThu_HSNH", r.KIEU_TU_DONG_SINH_PHAITHU_ID || r.KIEU_SINH_PHAITHU_ID || '');
            $("#chkChoPhepMienGiam_KhoanThu_HSNH").prop("checked", Number(r.CHO_PHEP_MIEN_GIAM || 0) === 1);
            $("#txtGhiChu_KhoanThu_HSNH").val(r.GHICHU || r.GHI_CHU || '');
            $("#zoneDelete_KhoanThu_HSNH").show();
            // Ở chế độ sửa, khoản thu gốc không cho đổi (hoặc để đổi được cũng ok — Sua có param strTaiChinh_CacKhoanThu_Id)
            $("#modalKhoanThuEdit_HSNH").modal("show");
        });
    },

    /* Lưu (Thêm hoặc Sửa) khoản thu */
    save_KhoanThu: function () {
        var me = this;
        var strId = edu.util.getValById('hdId_KhoanThu_HSNH');
        var strKhoanThuId = edu.util.getValById('dropKhoanThu_KhoanThu_HSNH');
        var strTenHienThi = edu.util.getValById('txtTenHienThi_KhoanThu_HSNH');
        var strDinhMuc = edu.util.getValById('txtDinhMuc_KhoanThu_HSNH');
        var strDonViId = edu.util.getValById('dropDonVi_KhoanThu_HSNH');
        var iBatBuoc = $("#chkBatBuoc_KhoanThu_HSNH").is(":checked") ? 1 : 0;
        var iTuDongSinh = $("#chkTuDongSinh_KhoanThu_HSNH").is(":checked") ? 1 : 0;
        var strThuTu = edu.util.getValById('txtThuTu_KhoanThu_HSNH');
        var strKieuTuDongId = edu.util.getValById('dropKieuTuDong_KhoanThu_HSNH');
        var iChoPhepMienGiam = $("#chkChoPhepMienGiam_KhoanThu_HSNH").is(":checked") ? 1 : 0;
        var strGhiChu = edu.util.getValById('txtGhiChu_KhoanThu_HSNH');

        if (!strKhoanThuId) { edu.system.alert("Vui lòng chọn khoản thu.", "w"); return; }
        if (strDinhMuc === '' || isNaN(Number(strDinhMuc))) {
            edu.system.alert("Vui lòng nhập Định mức thu hợp lệ.", "w"); return;
        }

        var obj_save;
        if (!strId) {
            // Thêm
            obj_save = {
                'action': 'SV_Core_NhapHoc_MH/FSkkLB4PKSAxCS4iHgIgNAkoLykeFQIP',
                'func': 'PKG_CORE_NHAPHOC.Them_NhapHoc_CauHinh_TC',
                'iM': edu.system.iM,
                'strNH_CauHinh_TC_Nhom_Id': me.strNhomId_KhoanThu,
                'strTaiChinh_CacKhoanThu_Id': strKhoanThuId,
                'strTen_KhoanThu_HienThi': strTenHienThi,
                'dSo_Tien_Dinh_Muc': Number(strDinhMuc),
                'strDon_Vi_Tien_Id': strDonViId,
                'dBat_Buoc': iBatBuoc,
                'dCho_Phep_Mien_Giam': iChoPhepMienGiam,
                'dTu_Dong_Sinh_PhaiThu': iTuDongSinh,
                'strKieu_Sinh_PhaiThu_Id': strKieuTuDongId,
                'dThu_Tu_Hien_Thi': Number(strThuTu || 0),
                'strGhiChu': strGhiChu,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
        } else {
            // Sửa
            obj_save = {
                'action': 'SV_Core_NhapHoc_MH/EjQgHg8pIDEJLiIeAiA0CSgvKR4VAgPP',
                'func': 'PKG_CORE_NHAPHOC.Sua_NhapHoc_CauHinh_TC',
                'iM': edu.system.iM,
                'strId': strId,
                'strTaiChinh_CacKhoanThu_Id': strKhoanThuId,
                'strTen_KhoanThu_HienThi': strTenHienThi,
                'dSo_Tien_Dinh_Muc': Number(strDinhMuc),
                'strDon_Vi_Tien_Id': strDonViId,
                'dBat_Buoc': iBatBuoc,
                'dCho_Phep_Mien_Giam': iChoPhepMienGiam,
                'dTu_Dong_Sinh_PhaiThu': iTuDongSinh,
                'strKieu_Sinh_PhaiThu_Id': strKieuTuDongId,
                'dThu_Tu_Hien_Thi': Number(strThuTu || 0),
                'strGhiChu': strGhiChu,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert(strId ? "Cập nhật thành công!" : "Thêm mới thành công!");
                    $("#modalKhoanThuEdit_HSNH").modal("hide");
                    // Reload bảng khoản thu của nhóm hiện tại
                    me.xem_CauHinh_KhoanThu(me.strNhomId_KhoanThu, me.strKeHoachId_KhoanThu);
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* Xóa khoản thu */
    delete_KhoanThu: function () {
        var me = this;
        var strId = edu.util.getValById('hdId_KhoanThu_HSNH');
        if (!strId) { edu.system.alert("Không xác định được khoản thu cần xóa.", "w"); return; }

        var fnXoa = function () {
            var obj_save = {
                'action': 'SV_Core_NhapHoc_MH/GS4gHg8pIDEJLiIeAiA0CSgvKR4VAgPP',
                'func': 'PKG_CORE_NHAPHOC.Xoa_NhapHoc_CauHinh_TC',
                'iM': edu.system.iM,
                'strId': strId,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) {
                        edu.system.alert("Xóa khoản thu thành công!");
                        $("#modalKhoanThuEdit_HSNH").modal("hide");
                        me.xem_CauHinh_KhoanThu(me.strNhomId_KhoanThu, me.strKeHoachId_KhoanThu);
                    } else {
                        edu.system.alert(data.Message, "s");
                    }
                },
                error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
                type: 'POST',
                action: obj_save.action,
                contentType: true,
                data: obj_save
            }, false, false, false, null);
        };

        if (typeof edu.system.confirm === "function") {
            edu.system.confirm("Bạn có chắc chắn muốn xóa khoản thu này?");
            $("#btnYes").off("click.delkhoanthu").on("click.delkhoanthu", fnXoa);
        } else if (window.confirm("Bạn có chắc chắn muốn xóa khoản thu này?")) {
            fnXoa();
        }
    },

    /* =================================================================
       NGÀNH ĐẦU RA — Xóa nhiều bản ghi
       PKG_CORE_NHAPHOC.Xoa_NH_CauHinh_TC_Nhom_DauRa
       ================================================================= */
    delete_NganhDauRa: function (arrIds) {
        var me = this;
        if (!arrIds || arrIds.length === 0) return;

        var iDone = 0, iOk = 0, iFail = 0;
        var arrFailMsg = [];
        var iTotal = arrIds.length;

        arrIds.forEach(function (strId) {
            var obj_save = {
                'action': 'SV_Core_NhapHoc_MH/GS4gHg8JHgIgNAkoLykeFQIeDykuLB4FIDQTIAPP',
                'func': 'PKG_CORE_NHAPHOC.Xoa_NH_CauHinh_TC_Nhom_DauRa',
                'iM': edu.system.iM,
                'strId': strId,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
            edu.system.makeRequest({
                success: function (data) {
                    iDone++;
                    if (data.Success) { iOk++; }
                    else { iFail++; arrFailMsg.push(strId + ": " + (data.Message || '')); }
                    if (iDone === iTotal) me._onDone_Xoa_NganhDauRa(iOk, iFail, arrFailMsg);
                },
                error: function (er) {
                    iDone++; iFail++;
                    arrFailMsg.push(strId + ": " + JSON.stringify(er));
                    if (iDone === iTotal) me._onDone_Xoa_NganhDauRa(iOk, iFail, arrFailMsg);
                },
                type: 'POST',
                action: obj_save.action,
                contentType: true,
                data: obj_save
            }, false, false, false, null);
        });
    },

    _onDone_Xoa_NganhDauRa: function (iOk, iFail, arrFailMsg) {
        var me = this;
        var strMsg = "Đã xóa " + iOk + " dòng thành công.";
        if (iFail > 0) {
            strMsg += " Thất bại " + iFail + " dòng.";
            if (arrFailMsg.length) console.warn("Xóa ngành đầu ra — chi tiết lỗi:", arrFailMsg);
        }
        edu.system.alert(strMsg, iFail > 0 ? "w" : "");
        // Reload lại bảng ngành đầu ra
        me.xem_CauHinh_NganhDauRa(me.strNhomId_NganhDauRa, me.strKeHoachId_NganhDauRa);
    },

    /* =================================================================
       THÊM NGÀNH ĐẦU RA VÀO NHÓM
       (1) Mở modal + load danh sách chương trình đầu ra của kế hoạch
       (2) User tick chọn → Lưu → duyệt từng bản ghi call Them_NH_CauHinh_TC_Nhom_DauRa
       ================================================================= */

    openModal_ThemNganhDauRa: function () {
        var me = this;
        $("#lblNhomInfo_ThemNganhDauRa").text(
            "Thêm vào nhóm ID: " + me.strNhomId_NganhDauRa +
            "  |  Kế hoạch nhập học ID: " + me.strKeHoachId_NganhDauRa
        );
        $("#txtTuKhoa_ThemNganhDauRa_HSNH").val("");
        $("#chkSelectAll_ThemNganhDauRa_HSNH").prop("checked", false);
        me.getList_KeHoachDauRa();
        $("#modalThemNganhDauRa_HSNH").modal("show");
    },

    /* Load DS chương trình đầu ra theo kế hoạch nhập học của nhóm hiện tại */
    getList_KeHoachDauRa: function () {
        var me = this;
        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/DSA4BRIeDwkeCiQJLiAiKR4FIDQTIAPP',
            'func': 'PKG_CORE_NHAPHOC.LayDS_NH_KeHoach_DauRa',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtTuKhoa_ThemNganhDauRa_HSNH'),
            'strNH_KeHoach_NhapHoc_Id': me.strKeHoachId_NganhDauRa,
            'strDaoTao_HeDaoTao_Id': '',
            'strDaoTao_KhoaDaoTao_Id': '',
            'strDaoTao_KhoaQuanLy_Id': '',
            'strDaoTao_Nganh_DT_Id': '',
            'strDaoTao_Nganh_TS_Id': '',
            'strDauRa_Status_Code': '',
            'dIs_Active': 1,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKeHoachDauRa = data.Data || [];
                    me.genTable_KeHoachDauRa(me.dtKeHoachDauRa);
                    $("#chkSelectAll_ThemNganhDauRa_HSNH").prop("checked", false);
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    },

    /* Render bảng chương trình đầu ra để chọn — cột đúng theo Excel */
    genTable_KeHoachDauRa: function (arr) {
        var $tbody = $("#tblThemNganhDauRa_HSNH tbody");
        $tbody.empty();

        if (!arr || arr.length === 0) {
            $tbody.append('<tr><td colspan="9" class="td-center italic color-666">Không có chương trình đầu ra nào.</td></tr>');
            return;
        }

        var html = '';
        arr.forEach(function (r, i) {
            var strId = r.ID || r.NH_KEHOACH_DAURA_ID || '';
            var strHe = r.HEDAOTAO_TEN || r.TENHEDAOTAO || '';
            var strKhoa = r.KHOADAOTAO_TEN || r.TENKHOA || '';
            var strNganhDT = r.NGANH_DT_TEN || r.TEN_NGANH_DT || '';
            var strNganhTS = r.NGANH_TS_TEN || r.TEN_NGANH_TS || '';
            var strKhoaQL = r.KHOAQUANLY_TEN || r.TEN_KHOAQUANLY || '';
            var strTenCT = r.CHUONGTRINH_TEN || r.TENCHUONGTRINH || '';
            var strMaCT = r.CHUONGTRINH_MA || r.MACHUONGTRINH || '';
            var strChuongTrinh = strTenCT + (strMaCT ? ' (' + strMaCT + ')' : '');
            var strGhiChu = r.GHICHU || r.GHI_CHU || '';

            html += '<tr data-id="' + strId + '">';
            html += '<td class="td-center">' + (i + 1) + '</td>';
            html += '<td class="td-left">' + strHe + '</td>';
            html += '<td class="td-left">' + strKhoa + '</td>';
            html += '<td class="td-left">' + strNganhDT + '</td>';
            html += '<td class="td-left">' + strNganhTS + '</td>';
            html += '<td class="td-left">' + strKhoaQL + '</td>';
            html += '<td class="td-left">' + strChuongTrinh + '</td>';
            html += '<td class="td-left">' + strGhiChu + '</td>';
            html += '<td class="td-center"><input type="checkbox" class="chkThemNganhDauRa_HSNH" data-id="' + strId + '" /></td>';
            html += '</tr>';
        });
        $tbody.append(html);
    },

    /* Duyệt từng bản ghi tick → call Them_NH_CauHinh_TC_Nhom_DauRa */
    save_ThemNganhDauRa: function (arrKeHoachDauRaIds) {
        var me = this;
        if (!arrKeHoachDauRaIds || arrKeHoachDauRaIds.length === 0) return;

        var iDone = 0, iOk = 0, iFail = 0;
        var arrFailMsg = [];
        var iTotal = arrKeHoachDauRaIds.length;

        arrKeHoachDauRaIds.forEach(function (strDauRaId) {
            var obj_save = {
                'action': 'SV_Core_NhapHoc_MH/FSkkLB4PCR4CIDQJKC8pHhUCHg8pLiweBSA0EyAP',
                'func': 'PKG_CORE_NHAPHOC.Them_NH_CauHinh_TC_Nhom_DauRa',
                'iM': edu.system.iM,
                'strNH_CauHinh_TC_Nhom_Id': me.strNhomId_NganhDauRa,
                'strNH_KeHoach_DauRa_Id': strDauRaId,
                'strGhiChu': '',
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': '',
                'strChucNangHeThong_Id': edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            };
            edu.system.makeRequest({
                success: function (data) {
                    iDone++;
                    if (data.Success) { iOk++; }
                    else { iFail++; arrFailMsg.push(strDauRaId + ": " + (data.Message || '')); }
                    if (iDone === iTotal) me._onDone_Them_NganhDauRa(iOk, iFail, arrFailMsg);
                },
                error: function (er) {
                    iDone++; iFail++;
                    arrFailMsg.push(strDauRaId + ": " + JSON.stringify(er));
                    if (iDone === iTotal) me._onDone_Them_NganhDauRa(iOk, iFail, arrFailMsg);
                },
                type: 'POST',
                action: obj_save.action,
                contentType: true,
                data: obj_save
            }, false, false, false, null);
        });
    },

    _onDone_Them_NganhDauRa: function (iOk, iFail, arrFailMsg) {
        var me = this;
        var strMsg = "Đã thêm " + iOk + " ngành thành công.";
        if (iFail > 0) {
            strMsg += " Thất bại " + iFail + " dòng.";
            if (arrFailMsg.length) console.warn("Thêm ngành đầu ra — chi tiết lỗi:", arrFailMsg);
        }
        edu.system.alert(strMsg, iFail > 0 ? "w" : "");
        $("#modalThemNganhDauRa_HSNH").modal("hide");
        // Reload bảng ngành đầu ra của nhóm
        me.xem_CauHinh_NganhDauRa(me.strNhomId_NganhDauRa, me.strKeHoachId_NganhDauRa);
    },

    /* =================================================================
       THÊM MỚI ĐỐI TƯỢNG vào nhóm đầu vào
       (dropdown QLSV.DOITUONG + ghi chú)
       PKG_CORE_NHAPHOC.Them_NH_CauHinh_TC_Nhom_DT
       ================================================================= */

    openModal_ThemDoiTuong: function () {
        var me = this;
        // Load combo QLSV.DOITUONG 1 lần
        if (!me.bLoadedCombo_DoiTuong) {
            try {
                edu.system.loadToCombo_DanhMucDuLieu("QLSV.DOITUONG",
                    "dropDoiTuong_ThemDT_HSNH", "-- Chọn đối tượng --");
                me.bLoadedCombo_DoiTuong = true;
            } catch (e) { console.warn("loadToCombo_DanhMucDuLieu QLSV.DOITUONG", e); }
        }
        edu.util.viewValById("dropDoiTuong_ThemDT_HSNH", "");
        $("#txtGhiChu_ThemDT_HSNH").val("");
        $("#modalThemDoiTuong_HSNH").modal("show");
    },

    save_ThemDoiTuong: function () {
        var me = this;
        var strDoiTuongId = edu.util.getValById('dropDoiTuong_ThemDT_HSNH');
        var strGhiChu = edu.util.getValById('txtGhiChu_ThemDT_HSNH');
        if (!strDoiTuongId) {
            edu.system.alert("Vui lòng chọn đối tượng.", "w");
            return;
        }
        var obj_save = {
            'action': 'SV_Core_NhapHoc_MH/FSkkLB4PCR4CIDQJKC8pHhUCHg8pLiweBRUP',
            'func': 'PKG_CORE_NHAPHOC.Them_NH_CauHinh_TC_Nhom_DT',
            'iM': edu.system.iM,
            'strNH_CauHinh_TC_Nhom_Id': me.strNhomId_DauVao,
            'strCore_Person_Id': '',
            'strDoi_Tuong_ApDung_Id': strDoiTuongId,
            'strGhiChu': strGhiChu,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Thêm đối tượng thành công!");
                    $("#modalThemDoiTuong_HSNH").modal("hide");
                    me.xem_CauHinh_DauVao(me.strNhomId_DauVao, me.strKeHoachId_DauVao);
                } else {
                    edu.system.alert(data.Message, "s");
                }
            },
            error: function (er) { edu.system.alert(JSON.stringify(er), "w"); },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        }, false, false, false, null);
    }
};