/*----------------------------------------------
--Màn hình : Phân cấp đối tượng — Closure (dulieu_phancap_doituong)
--Hàm gọi  : PKG_CORE_QUANTRI_04.dulieu_phancap_DT_LayDS / _Them / _Xoa
--            + danh mục cho các ô chọn (qua pqcommon.js): loại đối tượng, quan hệ phân cấp
--Phụ thuộc: pqcommon.js (PQ.call, PQ.g, PQ.esc, ...) — nạp trước file này.
--Ghi chú  : - LayDS CHỈ nhận (strloai_con_ma, strdoituongcon_id) — không có từ khóa, không phân trang — và bảng closure
--             rất lớn (hàng chục nghìn dòng) nên màn hình KHÔNG tự tải; người dùng chọn loại con (bắt buộc) + mã con
--             (tùy chọn) rồi bấm Tìm kiếm. Các ô Quan hệ / Nguồn tạo lọc phía trình duyệt trên kết quả đã tải.
--           - Bảng chỉ vẽ tối đa MAX_HIEN_THI dòng (vẽ hàng chục nghìn dòng làm treo trình duyệt).
--           - Không có Sửa: chỉ Thêm/Xóa dòng THU_CONG; dòng TU_DONG do job tự build nên không cho xóa tay.
--           - Khóa của 1 dòng gồm cả 5 trường (Xoa nhận đủ 5 tham số).
--           - Tên cột response (LOAI_CHA_MA, DOITUONGCHA_ID, LOAI_CON_MA, DOITUONGCON_ID, DM_QUANHE_PHANCAP_ID,
--             NGUON_TAO) suy ra từ tên tham số — nếu BE trả tên khác, console sẽ cảnh báo.
----------------------------------------------*/
function PhanCapDoiTuong() { };
PhanCapDoiTuong.prototype = {
    MAX_HIEN_THI: 1000,
    dtAll: [],          // kết quả LayDS của lần tìm gần nhất (chưa lọc Quan hệ / Nguồn tạo)
    dtShow: [],         // đúng các dòng đang vẽ trên bảng (nút Xóa tra theo chỉ số trong mảng này)
    mapLoai: {},        // mã loại đối tượng → tên
    objTim: null,       // {loaiCon, maCon} của lần tìm gần nhất — dùng để tải lại sau Thêm/Xóa

    API: {
        LAYDS: { action: 'CMS_QuanTri04_MH/JTQtKCQ0HjEpIC8iIDEeBRUeDSA4BRIP', func: 'PKG_CORE_QUANTRI_04.dulieu_phancap_DT_LayDS' },
        THEM: { action: 'CMS_QuanTri04_MH/JTQtKCQ0HjEpIC8iIDEeBRUeFSkkLAPP', func: 'PKG_CORE_QUANTRI_04.dulieu_phancap_DT_Them' },
        XOA: { action: 'CMS_QuanTri04_MH/JTQtKCQ0HjEpIC8iIDEeBRUeGS4g', func: 'PKG_CORE_QUANTRI_04.dulieu_phancap_DT_Xoa' }
    },

    init: function () {
        var me = this;
        // Nạp danh mục (loại đối tượng, quan hệ) cho các ô chọn + tra tên hiển thị. KHÔNG tải dữ liệu closure ở đây.
        PQ.whenAll([PQ.loadLoaiDoiTuong, PQ.loadQuanHe], function (kq) {
            var dtLoai = kq[0], dtQh = kq[1];
            me.mapLoai = PQ.mapOf(dtLoai, 'MA', 'TEN');
            PQ.loadCombo_MaTen(["dropSearch_PC_LoaiCon"], dtLoai, "-- Chọn loại đối tượng con --");
            PQ.loadCombo_MaTen(["dropPC_LoaiCha"], dtLoai, "-- Chọn loại đối tượng cha --");
            PQ.loadCombo_MaTen(["dropPC_LoaiCon"], dtLoai, "-- Chọn loại đối tượng con --");
            var itemsQh = $.map(dtQh, function (r) { return { ID: r.ID, TEN: PQ.nhanQuanHe(r, me.mapLoai) }; });
            PQ.loadCombo(["dropSearch_PC_QuanHe"], itemsQh, "Tất cả");
            PQ.loadCombo(["dropPC_QuanHe"], itemsQh, "-- Chọn quan hệ phân cấp --");
        });

        $("#btnSearch_Closure").click(function () {
            me.getList_Closure();
        });
        // Enter bị chặn toàn cục ở sự kiện keypress (systemroot.js) nên bắt ở keyup
        $("#txtSearch_Closure").on("keyup", function (e) {
            if (e.which === 13) me.getList_Closure();
        });
        // 2 ô này lọc ngay trên kết quả đã tải, không gọi lại BE
        $("#dropSearch_PC_QuanHe, #dropSearch_PC_NguonTao").on("change", function () {
            if (me.objTim) me.render_Closure();
        });
        $("#btnAdd_Closure").click(function () {
            me.popup_Them();
        });
        $("#btnSave_Closure").click(function () {
            me.save_Closure();
        });
        $("#tblClosure").delegate(".btnDelete", "click", function () {
            me.confirm_Xoa($(this).attr("data-i"));
        });
    },

    /*------------------------------------------
    --Tiện ích riêng của màn hình
    -------------------------------------------*/
    _tenLoai: function (strMa) {
        return (PQ.has(this.mapLoai, strMa) && this.mapLoai[strMa]) ? this.mapLoai[strMa] : strMa;
    },
    // "Tên loại / mã đối tượng" cho ô bảng và câu xác nhận
    _doiTuongHtml: function (strLoai, strId) {
        return '<span>' + PQ.esc(this._tenLoai(strLoai)) + '</span> <span class="pq-sub">/</span> <span class="pq-mono">' + PQ.esc(strId) + '</span>';
    },
    _doiTuongText: function (strLoai, strId) {
        return this._tenLoai(strLoai) + " / " + strId;
    },
    _laThuCong: function (row) {
        return String(PQ.g(row, 'NGUON_TAO')).toUpperCase() === 'THU_CONG';
    },
    _so: function (n) {
        return Number(n).toLocaleString('vi-VN');
    },

    /*------------------------------------------
    --[1] Danh sách (LayDS) — theo loại con + mã con
    -------------------------------------------*/
    // objTim: tìm lại theo điều kiện đã lưu (sau Thêm/Xóa); bỏ trống = lấy từ các ô trên màn hình
    getList_Closure: function (objTim) {
        var me = this;
        var strLoaiCon = objTim ? objTim.loaiCon : edu.util.getValById('dropSearch_PC_LoaiCon');
        var strMaCon = objTim ? objTim.maCon : $.trim(edu.util.getValById('txtSearch_Closure'));
        if (!strLoaiCon) {
            edu.system.alert("Vui lòng chọn Loại đối tượng con trước khi tìm kiếm.", "w");
            return;
        }
        PQ.call(me.API.LAYDS, { 'strloai_con_ma': strLoaiCon, 'strdoituongcon_id': strMaCon }, function (data) {
            if (!data.Success) {
                edu.system.alert(data.Message, "w");
                return;
            }
            me.dtAll = data.Data || [];
            me.objTim = { loaiCon: strLoaiCon, maCon: strMaCon };
            if (me.dtAll.length > 0 && PQ.g(me.dtAll[0], 'LOAI_CON_MA') === '' && PQ.g(me.dtAll[0], 'DOITUONGCON_ID') === '' && window.console) {
                console.warn('[phancapdoituong] Response LayDS không có cột LOAI_CON_MA/DOITUONGCON_ID — các cột nhận được:', Object.keys(me.dtAll[0]));
            }
            me.render_Closure();
        }, function (er) {
            edu.system.alert(PQ.msgLoi(er), "w");
        });
    },
    // Lọc theo Quan hệ / Nguồn tạo (phía trình duyệt), cắt tối đa MAX_HIEN_THI dòng, rồi vẽ bảng + nhãn đếm
    render_Closure: function () {
        var me = this;
        var strQh = edu.util.getValById('dropSearch_PC_QuanHe');
        var strNguon = edu.util.getValById('dropSearch_PC_NguonTao');
        var dt = me.dtAll;
        if (strQh !== '' || strNguon !== '') {
            dt = $.grep(me.dtAll, function (r) {
                return (strQh === '' || PQ.g(r, 'DM_QUANHE_PHANCAP_ID') == strQh)
                    && (strNguon === '' || String(PQ.g(r, 'NGUON_TAO')).toUpperCase() === strNguon);
            });
        }
        var strDem = (strQh !== '' || strNguon !== '')
            ? me._so(dt.length) + ' / ' + me._so(me.dtAll.length) + ' dòng'
            : me._so(me.dtAll.length) + ' dòng';
        if (dt.length > me.MAX_HIEN_THI) {
            strDem += ' — chỉ hiển thị ' + me._so(me.MAX_HIEN_THI) + ' dòng đầu, hãy nhập Mã đối tượng con hoặc lọc Quan hệ/Nguồn tạo để thu hẹp';
            dt = dt.slice(0, me.MAX_HIEN_THI);
        }
        me.dtShow = dt;
        $("#lblCount_Closure").text(strDem);
        me.genTable_Closure(dt);
    },
    genTable_Closure: function (data) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblClosure",
            aaData: data,
            // Cột 0 là STT do hệ thống tự thêm: 0 Stt | 1 Loại cha / Mã cha | 2 Loại con / Mã con | 3 Quan hệ | 4 Nguồn tạo | 5 Xóa
            colPos: {
                center: [0, 4, 5]
            },
            aoColumns: [
                {
                    "mRender": function (nRow, aData) {
                        return me._doiTuongHtml(PQ.g(aData, 'LOAI_CHA_MA'), PQ.g(aData, 'DOITUONGCHA_ID'));
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return me._doiTuongHtml(PQ.g(aData, 'LOAI_CON_MA'), PQ.g(aData, 'DOITUONGCON_ID'));
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span class="pq-mono">' + PQ.esc(PQ.g(aData, 'DM_QUANHE_PHANCAP_ID')) + '</span>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        var strNguon = PQ.g(aData, 'NGUON_TAO');
                        return '<span class="pq-pill ' + (me._laThuCong(aData) ? 'pq-pill-warn' : 'pq-pill-grey') + '">' + PQ.esc(strNguon) + '</span>';
                    }
                },
                {
                    // Xóa tra theo chỉ số dòng trong dtShow (khóa có 5 trường). Dòng tự động: nút mờ, không bấm được.
                    "mRender": function (nRow, aData) {
                        var bThuCong = me._laThuCong(aData);
                        return '<a class="btn btn-default btnDelete' + (bThuCong ? '' : ' pq-row-off') + '" data-i="' + nRow + '" title="'
                            + (bThuCong ? 'Xóa' : 'Dòng tự động do job build — không xóa tay') + '"><i class="fa fa-trash color-active"></i></a>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },

    /*------------------------------------------
    --[2] Popup Thêm thủ công (không có Sửa)
    -------------------------------------------*/
    resetForm: function () {
        $("#btnNotifyModal").remove();
        PQ.setDrop("dropPC_LoaiCha", "");
        edu.util.viewValById("txtPC_DoiTuongCha", "");
        PQ.setDrop("dropPC_LoaiCon", "");
        edu.util.viewValById("txtPC_DoiTuongCon", "");
        PQ.setDrop("dropPC_QuanHe", "");
        $("#titleClosure").text("");
    },
    popup_Them: function () {
        var me = this;
        me.resetForm();
        $("#myModalClosure").modal("show");
    },

    /*------------------------------------------
    --[3] Lưu (Them)
    -------------------------------------------*/
    save_Closure: function () {
        var me = this;
        var strLoaiCha = edu.util.getValById("dropPC_LoaiCha");
        var strMaCha = $.trim(edu.util.getValById("txtPC_DoiTuongCha"));
        var strLoaiCon = edu.util.getValById("dropPC_LoaiCon");
        var strMaCon = $.trim(edu.util.getValById("txtPC_DoiTuongCon"));
        var strQh = edu.util.getValById("dropPC_QuanHe");

        var strThieu = [];
        if (!strLoaiCha) strThieu.push("Loại đối tượng cha");
        if (!strMaCha) strThieu.push("Mã đối tượng cha");
        if (!strLoaiCon) strThieu.push("Loại đối tượng con");
        if (!strMaCon) strThieu.push("Mã đối tượng con");
        if (!strQh) strThieu.push("Quan hệ phân cấp");
        if (strThieu.length > 0) {
            edu.system.alertOnModal({ type: "w", content: "Vui lòng nhập/chọn: " + strThieu.join(", ") + "." });
            return;
        }

        var params = {
            'strloai_cha_ma': strLoaiCha,
            'strdoituongcha_id': strMaCha,
            'strloai_con_ma': strLoaiCon,
            'strdoituongcon_id': strMaCon,
            'strdm_quanhe_phancap_id': strQh
        };
        PQ.call(me.API.THEM, params, function (data) {
            if (data.Success) {
                PQ.alertSauKhiDongModal("myModalClosure", "Thêm mới thành công!");
                // Chuyển bộ lọc sang đúng đối tượng con vừa thêm để người dùng thấy dòng mới trong danh sách các cấp cha của nó
                PQ.setDrop("dropSearch_PC_LoaiCon", strLoaiCon);
                edu.util.viewValById("txtSearch_Closure", strMaCon);
                me.getList_Closure({ loaiCon: strLoaiCon, maCon: strMaCon });
            } else {
                edu.system.alertOnModal({ type: "w", content: data.Message });
            }
        }, function (er) {
            edu.system.alertOnModal({ type: "w", content: PQ.msgLoi(er) });
        });
    },

    /*------------------------------------------
    --[4] Xóa (chỉ dòng THU_CONG)
    -------------------------------------------*/
    confirm_Xoa: function (strIdx) {
        var me = this;
        var row = me.dtShow[parseInt(strIdx, 10)];
        if (!row) {
            edu.system.alert(edu.constant.getting("NOTIFY", "SELECT_F"), "w");
            return;
        }
        if (!me._laThuCong(row)) {
            edu.system.alert("Dòng TU_DONG do job tự build nên không xóa tay được (job sẽ tạo lại).", "w");
            return;
        }
        var strCha = me._doiTuongText(PQ.g(row, 'LOAI_CHA_MA'), PQ.g(row, 'DOITUONGCHA_ID'));
        var strCon = me._doiTuongText(PQ.g(row, 'LOAI_CON_MA'), PQ.g(row, 'DOITUONGCON_ID'));
        edu.system.confirm("Bạn có chắc chắn muốn xóa cặp cha-con <b>" + PQ.esc(strCha) + "</b> → <b>" + PQ.esc(strCon)
            + "</b> (quan hệ " + PQ.esc(PQ.g(row, 'DM_QUANHE_PHANCAP_ID')) + ") không?");
        $("#btnYes").off("click.pqxoa").on("click.pqxoa", function () {
            me.delete_Closure(row);
        });
    },
    delete_Closure: function (row) {
        var me = this;
        var params = {
            'strloai_cha_ma': PQ.g(row, 'LOAI_CHA_MA'),
            'strdoituongcha_id': PQ.g(row, 'DOITUONGCHA_ID'),
            'strloai_con_ma': PQ.g(row, 'LOAI_CON_MA'),
            'strdoituongcon_id': PQ.g(row, 'DOITUONGCON_ID'),
            'strdm_quanhe_phancap_id': PQ.g(row, 'DM_QUANHE_PHANCAP_ID')
        };
        PQ.call(me.API.XOA, params, function (data) {
            if (data.Success) {
                edu.system.afterComfirm({ title: "", content: "Xóa dữ liệu thành công!", code: "" });
                if (me.objTim) me.getList_Closure(me.objTim);
            } else {
                edu.system.afterComfirm({ title: "", content: data.Message, code: "w" });
            }
        }, function (er) {
            edu.system.afterComfirm({ title: "", content: PQ.msgLoi(er), code: "w" });
        });
    }
};
