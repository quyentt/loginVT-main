/* Tat log chay nen — doi ve ham rong thay vi xoa, can bat lai thi sua 1 cho */
function zeNoLog() { }

/*----------------------------------------------
-- zoneEditModal_inject.js (2026-08-21)
-- Tự động inject modal #zoneEdit (Chỉnh sửa - Hồ sơ đề xuất, 3 tabs) + CSS vào page.
-- Idempotent: nếu #zoneEdit đã có trong DOM thì bỏ qua (case: hoso_taomoi.html có sẵn inline).
-- Dùng cho các trang muốn mở modal chỉnh sửa hồ sơ từ dexuathoso.js openEditByPerson().
----------------------------------------------*/
function _zeDoInject(forceOverlay) {
    if (document.getElementById('zoneEdit')) { zeNoLog('[ZE-Inject] skip: #zoneEdit exists'); return; }
    // Inline mode nếu page có `<div id="zeInlineHost">` — render trực tiếp vào đó, không overlay
    var inlineHost = document.getElementById('zeInlineHost');
    zeNoLog('[ZE-Inject] running');
    if (!inlineHost && !forceOverlay) { return; } // Chưa có host, defer retry — không fallback overlay ngay

    var css = ''
        /* Compact centered modal (2026-08-28) — smaller than full-viewport, van co margin quanh de thay backdrop
           :not(.ze-inline) — inline mode van dung .ze-inline rule (position:static, display:block) khong bi de */
        + '#zoneEdit.fake-modal:not(.ze-inline){position:fixed !important;top:3vh !important;left:50% !important;right:auto !important;bottom:auto !important;transform:translateX(-50%) !important;width:88vw !important;max-width:1280px !important;height:auto !important;max-height:94vh !important;overflow:hidden !important;z-index:2147483000 !important;background:#ffffff !important;border-radius:10px !important;box-shadow:0 25px 70px rgba(15,23,42,.45) !important;padding:0 !important;flex-direction:column !important;}'
        + 'body.zoneEdit-open #zoneEdit.fake-modal:not(.ze-inline){display:flex !important;}'
        + 'body.zoneEdit-open::before{content:"";position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147482900;pointer-events:auto;}'
        + 'body.zoneEdit-open{overflow:hidden;}'
        /* CHI boost select2 dropdown DANG MO (--open) + popup dropdown (.select2-dropdown, append vao <body>)
           KHONG boost .select2-container tinh (container dong o trang nen) — neu boost tinh se de "xuyen"
           qua modal vi container tinh cua trang nen van nam trong luong DOM binh thuong (2026-08-28 fix) */
        + 'body.zoneEdit-open .select2-container--open,body.zoneEdit-open .select2-dropdown{z-index:2147483100 !important;}'
        /* Modal thông báo/confirm của hệ thống (BS3, z-index mặc định ~1050) bị #zoneEdit (2147483000)
           che mất → user bấm Lưu không thấy báo gì. Đẩy lên trên #zoneEdit khi modal này đang mở. */
        + 'body.zoneEdit-open #myModalAlert,body.zoneEdit-open #myModalConfirm{z-index:2147483200 !important;}'
        + 'body.zoneEdit-open #myModalAlert ~ .modal-backdrop,body.zoneEdit-open .modal-backdrop.in{z-index:2147483150 !important;}'
        /* Dam bao modal luon interactive */
        + '#zoneEdit.fake-modal *{pointer-events:auto;}'
        /* Flex layout: header + tabbar (top, co dinh) — pane active (giua, scroll) — footer (duoi, sticky) */
        + '#zoneEdit.fake-modal:not(.ze-inline) > .box-shadow.register-wish{display:flex !important;flex-direction:column !important;flex:1 1 auto !important;min-height:0 !important;height:100% !important;box-shadow:none !important;border-radius:0 !important;overflow:hidden !important;}'
        + '#zoneEdit.fake-modal:not(.ze-inline) .box-header{flex:0 0 auto !important;border-radius:10px 10px 0 0 !important;}'
        + '#zoneEdit.fake-modal:not(.ze-inline) .zoneEdit-tabbar{flex:0 0 auto !important;position:static !important;}'
        + '#zoneEdit.fake-modal:not(.ze-inline) .zoneEdit-pane{min-height:0;}'
        + '#zoneEdit.fake-modal:not(.ze-inline) .zoneEdit-pane.active{flex:1 1 auto !important;min-height:0 !important;overflow-y:auto !important;overflow-x:hidden !important;}'
        /* Footer container-fluid cuoi cung (chua Dong/Luu) — sticky duoi, luon visible */
        + '#zoneEdit.fake-modal:not(.ze-inline) > .box-shadow.register-wish > .container-fluid:last-child{flex:0 0 auto !important;background:#ffffff !important;border-top:1px solid #e2e8f0 !important;box-shadow:0 -2px 12px rgba(15,23,42,.06) !important;padding:12px 24px !important;margin:0 !important;z-index:5 !important;border-radius:0 0 10px 10px !important;}'
        + '#zoneEdit.fake-modal:not(.ze-inline) > .box-shadow.register-wish > .container-fluid:last-child > hr{display:none !important;}'
        + '#zoneEdit.fake-modal:not(.ze-inline) > .box-shadow.register-wish > .container-fluid:last-child .d-flex.align-items-center.mt-4{padding:0 !important;margin:0 !important;}'
        + '#zoneEdit .box-shadow.register-wish{box-shadow:none !important;border-radius:12px !important;padding:0 !important;}'
        + '#zoneEdit .box-header{background:linear-gradient(135deg,#2563eb 0%,#1e40af 100%);color:#fff !important;border-radius:12px 12px 0 0;margin:0 !important;padding:14px 24px !important;min-height:56px;display:flex !important;align-items:center;justify-content:center !important;position:relative;}'
        + '#zoneEdit .box-header .nav-content-left{text-align:center;margin:0 auto;}'
        + '#zoneEdit .box-header .nav-content-left p.link{margin:0;padding:0;}'
        + '#zoneEdit .box-header .nav-content-left a,#zoneEdit .box-header .zeIcon,#zoneEdit .box-header .zeIcon i{color:#fff !important;font-size:16px;font-weight:600;text-decoration:none;}'
        + '#zoneEdit #zeHeaderBadge{display:inline-flex;flex-wrap:wrap;gap:6px 10px;margin-top:6px;justify-content:center;}'
        + '#zoneEdit #zeHeaderBadge:empty{display:none;}'
        + '#zoneEdit #zeHeaderBadge .ze-chip{display:inline-flex;align-items:center;padding:3px 10px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);border-radius:20px;color:#fff !important;font-size:12.5px;font-weight:500;line-height:1.4;white-space:nowrap;max-width:340px;overflow:hidden;text-overflow:ellipsis;}'
        + '#zoneEdit #zeHeaderBadge .ze-chip b{margin-right:4px;font-weight:600;opacity:.85;}'
        + '#zoneEdit .box-header .nav-content-right{position:absolute;right:12px;top:50%;transform:translateY(-50%);margin:0 !important;}'
        + 'body #zoneEdit .box-header .nav-content-right a.btnClose,body #zoneEdit .box-header a.btnClose{background:rgba(255,255,255,.18) !important;background-color:rgba(255,255,255,.18) !important;background-image:none !important;color:#fff !important;border:none !important;border-radius:50% !important;width:34px !important;height:34px !important;min-width:34px !important;line-height:34px !important;padding:0 !important;margin:0 !important;display:inline-flex !important;align-items:center;justify-content:center;font-size:15px !important;cursor:pointer;transition:background .15s;text-align:center !important;box-shadow:none !important;}'
        + 'body #zoneEdit .box-header a.btnClose:hover{background:rgba(255,255,255,.32) !important;background-color:rgba(255,255,255,.32) !important;}'
        + 'body #zoneEdit .box-header a.btnClose i{color:#fff !important;font-size:15px !important;}'
        + '#zoneEdit .box-header .btnClose::after,#zoneEdit .box-header .btnClose::before{content:none !important;}'
        + '#zoneEdit .box-header .btnClose > *:not(i){display:none !important;}'
        + '#zoneEdit .form-top{padding:20px 24px 8px 24px !important;margin-bottom:0 !important;border-top:none !important;}'
        + '#zoneEdit .form-item{margin-bottom:12px !important;align-items:center;}'
        + '#zoneEdit .form-item .form-label{width:170px !important;font-weight:500;color:#334155;font-size:14px;margin-bottom:0;}'
        + '#zoneEdit .form-item .input-group{flex:1;}'
        + '#zoneEdit .form-control,#zoneEdit .select-opt + .select2-container .select2-selection{border:1px solid #cbd5e1 !important;border-radius:6px !important;padding:8px 12px !important;font-size:14px !important;min-height:38px !important;color:#0f172a !important;}'
        + '#zoneEdit .form-control:focus{border-color:#2563eb !important;box-shadow:0 0 0 3px rgba(37,99,235,.15) !important;outline:none;}'
        + '#zoneEdit #txtHoVaTen[readonly]{background:#f1f5f9 !important;color:#475569 !important;}'
        + '#zoneEdit .sv-info-profile{display:flex;justify-content:center;align-items:flex-start;padding-top:4px;}'
        + '#zoneEdit .avata-img{position:relative;width:220px;height:220px;border-radius:12px;overflow:hidden;background:#f1f5f9;border:2px solid #e2e8f0;display:flex;align-items:center;justify-content:center;}'
        + '#zoneEdit .avata-img img{width:100%;height:100%;object-fit:cover;border-radius:12px;}'
        + '#zoneEdit .avata-img .upload-avata{position:absolute;bottom:8px;right:8px;width:36px;height:36px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff !important;box-shadow:0 4px 12px rgba(37,99,235,.4);text-decoration:none;}'
        + '#zoneEdit .avata-img .upload-avata i{color:#fff !important;}'
        + '#zoneEdit .container-fluid{padding:8px 24px !important;}'
        + '#zoneEdit .text-success{color:#059669 !important;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.3px;}'
        + '#zoneEdit #tblDinhDanh,#zoneEdit #tblLienHe{border:1px solid #e2e8f0 !important;border-radius:6px;overflow:hidden;}'
        + '#zoneEdit #tblDinhDanh thead th,#zoneEdit #tblLienHe thead th{background:#f8fafc !important;color:#334155 !important;font-size:12.5px;font-weight:600;text-transform:uppercase;padding:10px 8px !important;border-bottom:1px solid #e2e8f0 !important;vertical-align:middle;}'
        + '#zoneEdit #tblDinhDanh tbody td,#zoneEdit #tblLienHe tbody td{padding:10px 8px !important;vertical-align:middle;border-bottom:1px solid #f1f5f9 !important;}'
        + '#zoneEdit #tblDinhDanh tbody td input,#zoneEdit #tblLienHe tbody td input{border:1px solid #cbd5e1 !important;border-radius:4px !important;padding:6px 10px !important;font-size:13.5px !important;width:100%;}'
        + '#zoneEdit #tblDinhDanh tbody td input:focus,#zoneEdit #tblLienHe tbody td input:focus{border-color:#2563eb !important;box-shadow:0 0 0 2px rgba(37,99,235,.1) !important;}'
        + '#zoneEdit hr{margin:8px 0 !important;border-color:#e2e8f0;}'
        + '#zoneEdit .d-flex.align-items-center.mt-4{padding:12px 8px 4px 8px;}'
        + '#zoneEdit .btn.btnClose:not(.box-header .btnClose){background:#fff !important;color:#475569 !important;border:1px solid #cbd5e1 !important;padding:8px 20px !important;border-radius:6px !important;font-weight:500;cursor:pointer;}'
        + '#zoneEdit .btn.btnClose:not(.box-header .btnClose):hover{background:#f1f5f9 !important;}'
        + '#zoneEdit #btnSave_DeXuatHoSo{background:#2563eb !important;color:#fff !important;border:1px solid #2563eb !important;padding:8px 28px !important;border-radius:6px !important;font-weight:600;cursor:pointer;box-shadow:0 2px 6px rgba(37,99,235,.25);}'
        + '#zoneEdit #btnSave_DeXuatHoSo:hover{background:#1d4ed8 !important;border-color:#1d4ed8 !important;}'
        + '#zoneEdit .aps-gap-10{display:flex;gap:10px;}'
        + '#zoneEdit .zoneEdit-tabbar{display:flex;gap:4px;padding:0 24px;background:#fff;border-bottom:2px solid #e2e8f0;margin-top:0;position:sticky;top:0;z-index:5;}'
        + '#zoneEdit .zoneEdit-tab{padding:12px 20px;font-size:14px;font-weight:600;color:#64748b;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:8px;}'
        + '#zoneEdit .zoneEdit-tab i{font-size:15px;}'
        + '#zoneEdit .zoneEdit-tab:hover{color:#2563eb;background:#f8fafc;}'
        + '#zoneEdit .zoneEdit-tab.active{color:#2563eb;border-bottom-color:#2563eb;background:#eff6ff;}'
        + '#zoneEdit .zoneEdit-pane{display:none;animation:zoneEditFadeIn .2s;}'
        + '#zoneEdit .zoneEdit-pane.active{display:block;}'
        + '@keyframes zoneEditFadeIn{from{opacity:0;}to{opacity:1;}}'
        + '#zoneEdit .ze-form{--aps-sv-primary:#2563eb;--aps-sv-primary-soft:#eaf1ff;--aps-sv-border:#e2e8f0;--aps-sv-label:#475569;--aps-sv-text:#0f172a;--aps-sv-radius:5px;padding:24px 28px !important;}'
        + '#zoneEdit .ze-form .aps-sv-section + .aps-sv-section{margin-top:24px;}'
        + '#zoneEdit .ze-form .aps-sv-section-title{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;color:var(--aps-sv-primary);text-transform:uppercase;letter-spacing:.3px;margin:6px 0 18px;}'
        + '#zoneEdit .ze-form .aps-sv-section-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--aps-sv-border),transparent);}'
        + '#zoneEdit .ze-form .aps-sv-section-title i{color:var(--aps-sv-primary);}'
        + '#zoneEdit .ze-form .aps-sv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 26px;}'
        + '@media (max-width:900px){#zoneEdit #zoneXHD .aps-sv-grid{grid-template-columns:1fr;}}'
        + '#zoneEdit .ze-form .aps-sv-field.aps-sv-col-full{grid-column:1 / -1;}'
        + '#zoneEdit .ze-form .aps-sv-label{display:block;font-size:13px;font-weight:600;color:var(--aps-sv-label);margin-bottom:7px;}'
        + '#zoneEdit .ze-form .aps-sv-label .aps-sv-req{color:#ef4444;margin-left:2px;}'
        + '#zoneEdit .ze-form .aps-sv-input{width:100%;height:38px;padding:0 14px;font-size:14px;color:var(--aps-sv-text) !important;background:#fff;border:1px solid var(--aps-sv-border) !important;border-radius:var(--aps-sv-radius) !important;transition:border-color .15s,box-shadow .15s;outline:none;box-sizing:border-box;}'
        + '#zoneEdit .ze-form .aps-sv-input::placeholder{color:#94a3b8;}'
        + '#zoneEdit .ze-form .aps-sv-input:focus{border-color:var(--aps-sv-primary) !important;box-shadow:0 0 0 3px rgba(37,99,235,.14) !important;}'
        + '#zoneEdit .ze-form .aps-sv-select{position:relative;}'
        + '#zoneEdit .ze-form .aps-sv-select select.aps-sv-input{appearance:none;-webkit-appearance:none;padding-right:38px;cursor:pointer;}'
        + '#zoneEdit .ze-form .aps-sv-select > i{position:absolute;right:15px;top:50%;transform:translateY(-50%);pointer-events:none;color:#94a3b8;font-size:13px;}'
        + '#zoneEdit .ze-form .aps-sv-input-icon{position:relative;}'
        + '#zoneEdit .ze-form .aps-sv-input-icon > i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:14px;}'
        + '#zoneEdit .ze-form .aps-sv-input-icon .aps-sv-input{padding-left:40px;}'
        + '#zoneEdit .ze-form .aps-sv-input.ze-readonly,#zoneEdit .ze-form .aps-sv-input[readonly]{background:#f1f5f9 !important;color:#475569 !important;}'
        + '#zoneEdit .ze-canhan-layout{display:grid;grid-template-columns:1fr 220px;gap:24px;align-items:start;}'
        + '@media (max-width:900px){#zoneEdit .ze-canhan-layout{grid-template-columns:1fr;}}'
        + '#zoneEdit .ze-canhan-avatar{align-self:start;}'
        + '#zoneEdit .ze-canhan-avatar .avata-img{margin:0;width:200px;height:200px;overflow:hidden;position:relative;border-radius:8px;background:#f1f5f9;border:1px solid #e2e8f0;}'
        + '#zoneEdit .ze-canhan-avatar .avata-img fieldset{border:none !important;padding:0 !important;margin:0 !important;width:100%;height:100%;background:transparent;}'
        + '#zoneEdit .ze-canhan-avatar .avata-img fieldset > div{width:100%;height:100%;}'
        + '#zoneEdit .ze-canhan-avatar .avata-img input[type="image"],#zoneEdit .ze-canhan-avatar .avata-img img{width:100% !important;height:100% !important;object-fit:cover;display:block;border-radius:8px;}'
        + '#zoneEdit .ze-canhan-avatar .upload-avata{position:absolute;bottom:8px;right:8px;width:36px;height:36px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff !important;box-shadow:0 4px 12px rgba(37,99,235,.4);text-decoration:none;z-index:2;}'
        + '#zoneEdit .ze-canhan-avatar .upload-avata i{color:#fff !important;}'
        + '/* Inline mode overrides — flow theo layout trang, không overlay/backdrop */'
        + '#zoneEdit.ze-inline{position:static !important;width:100% !important;max-width:none !important;max-height:none !important;transform:none !important;top:auto !important;left:auto !important;z-index:auto !important;box-shadow:0 1px 4px rgba(15,23,42,.08) !important;border-radius:8px !important;overflow:visible !important;display:block !important;}'
        + '#zoneEdit.ze-inline .box-header{border-radius:8px 8px 0 0 !important;}'
        + '#zoneEdit.ze-inline .zoneEdit-tabbar{border-radius:0 !important;}'
        + '#zoneEdit.ze-inline .box-header .nav-content-right{display:none !important;}' /* Ẩn nút X trong inline mode */
        + 'body.ze-has-inline::before{content:none !important;}' /* Không backdrop nếu inline */
        + 'body.ze-has-inline{overflow:auto !important;}'
        ;

    var html =
'<div class="fake-modal zone-bus" id="zoneEdit" style="display:none;padding-top:15px">' +
    '<div class="box-shadow register-wish pt-0 position-relative modal-aps-add">' +
        '<div class="d-flex justify-content-between pt-3 px-20 box-header">' +
            '<div class="nav-content-left"><p class="link"><a><span class="zeIcon"><i class="fa-regular fa-file-circle-question fw-bold"></i></span> Chỉnh sửa - Hồ sơ đề xuất</a></p><div id="zeHeaderBadge"></div></div>' +
            '<div class="nav-content-right mt"><a class="d-block text-right fs-16 mt-5 color-fff btnClose"><i class="fal fa-times"></i></a></div>' +
        '</div>' +
        '<div class="zoneEdit-tabbar">' +
            '<div class="zoneEdit-tab active" data-zetab="tabInfo"><i class="fal fa-user"></i> Thông tin cơ bản</div>' +
            '<div class="zoneEdit-tab" data-zetab="tabDinhDanh"><i class="fal fa-id-card"></i> Định danh &amp; Liên hệ</div>' +
            '<div class="zoneEdit-tab" data-zetab="tabXHD"><i class="fal fa-file-invoice-dollar"></i> Xuất hoá đơn</div>' +
        '</div>' +
        '<div class="zoneEdit-pane active" id="tabInfo">' +
            '<div id="zoneCaNhan" class="ze-form">' +
                '<div class="aps-sv-section">' +
                    '<div class="aps-sv-section-title"><i class="fa-light fa-user"></i> Thông tin cá nhân</div>' +
                    '<div class="ze-canhan-layout">' +
                        '<div class="aps-sv-grid ze-canhan-grid">' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Họ</label><input class="aps-sv-input" id="txtHo"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Tên đệm</label><input class="aps-sv-input" id="txtTenDem"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Tên</label><input class="aps-sv-input" id="txtTen"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Tên đầy đủ</label><input class="aps-sv-input ze-readonly" id="txtHoVaTen" readonly="readonly"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Mức độ ngày sinh</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropMucDoNgaySinh"></select></div></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Giới tính</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropGioiTinh"></select></div></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Ngày sinh</label><input class="aps-sv-input" id="txtNgaySinh" placeholder="dd"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Tháng sinh</label><input class="aps-sv-input" id="txtThangSinh" placeholder="mm"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Năm sinh</label><input class="aps-sv-input" id="txtNamSinh" placeholder="yyyy"></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Quốc tịch</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropQuocTich"><option value="">-- Chọn quốc tịch --</option></select></div></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Dân tộc</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropDanToc"><option value="">-- Chọn dân tộc --</option></select></div></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Tôn giáo</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropTonGiao"><option value="">-- Chọn tôn giáo --</option></select></div></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Email</label><div class="aps-sv-input-icon"><i class="fa-light fa-envelope"></i><input class="aps-sv-input" id="txtEmailCaNhan" type="email" placeholder="email@..."></div></div>' +
                            '<div class="aps-sv-field"><label class="aps-sv-label">Điện thoại</label><div class="aps-sv-input-icon"><i class="fa-light fa-phone"></i><input class="aps-sv-input" id="txtDienThoai" placeholder="09xx xxx xxx"></div></div>' +
                        '</div>' +
                        '<div class="ze-canhan-avatar"><div class="avata-img"><img src="assets/images/avata-form.jpg" id="uploadPicture_SV"><a href="#" class="upload-avata"><i class="fal fa-camera color-dask-blue"></i></a></div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="aps-sv-section">' +
                    '<div class="aps-sv-section-title"><i class="fa-light fa-location-dot"></i> Nơi sinh</div>' +
                    '<div class="aps-sv-grid">' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Tỉnh / Thành phố</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropNS_Tinh"><option value="">Chọn tỉnh thành</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Quận / Huyện</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropNS_Huyen"><option value="">Vui lòng chọn Tỉnh trước</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Xã / Phường</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropNS_Xa"><option value="">Vui lòng chọn Quận/Huyện trước</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Chi tiết (số nhà / thôn / xóm)</label><input class="aps-sv-input" id="txtNS_ChiTiet" placeholder="Số nhà, tên đường, thôn/xóm..."></div>' +
                    '</div>' +
                '</div>' +
                '<div class="aps-sv-section">' +
                    '<div class="aps-sv-section-title"><i class="fa-light fa-id-card"></i> Số CCCD / Định danh</div>' +
                    '<div class="aps-sv-grid">' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Số CCCD <span style="color:#dc2626">*</span></label><div class="aps-sv-input-icon"><i class="fa-light fa-hashtag"></i><input class="aps-sv-input" id="txtCCCD_So" placeholder="12 chữ số"></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Ngày cấp</label><input class="aps-sv-input" id="txtCCCD_NgayCap" type="date"></div>' +
                        '<div class="aps-sv-field aps-sv-col-full"><label class="aps-sv-label">Nơi cấp</label><input class="aps-sv-input" id="txtCCCD_NoiCap" placeholder="Ví dụ: Cục Cảnh sát QLHC..."></div>' +
                    '</div>' +
                '</div>' +
                '<div class="aps-sv-section">' +
                    '<div class="aps-sv-section-title"><i class="fa-light fa-house"></i> Hộ khẩu thường trú</div>' +
                    '<div class="aps-sv-grid">' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Tỉnh / Thành phố</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropHK_Tinh"><option value="">Chọn tỉnh thành</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Quận / Huyện</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropHK_Huyen"><option value="">Vui lòng chọn Tỉnh trước</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Xã / Phường</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="dropHK_Xa"><option value="">Vui lòng chọn Quận/Huyện trước</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Số nhà / thôn / xóm</label><input class="aps-sv-input" id="txtHK_SoNha"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="zoneEdit-pane" id="tabDinhDanh">' +
            '<div class="container-fluid px-20 mt-15"><div class="row">' +
                '<div class="col-12 col-lg-6 mt-6 pl0"><div class="d-flex align-items-center w-100 justify-content-between"><span class="fw-bold text-success pull-left">Thông tin định danh</span></div><div class="mt-10 aps-table-select"><table class="table transcrip-table tabs-scores tblDapAn_Mau mt-10 table-bordered table-noborder" id="tblDinhDanh"><thead><tr><th class="text-center w-50px" scope="col">STT</th><th scope="col">Loại định danh </th><th scope="col">Số định danh </th><th scope="col">Ngày cấp</th><th scope="col">Nơi cấp</th><th class="text-center" scope="col">Là thông tin chính</th></tr></thead><tbody></tbody></table></div></div>' +
                '<div class="col-12 col-lg-6 mt-6"><div class="d-flex align-items-center w-100 justify-content-between"><span class="fw-bold text-success pull-left">Thông tin liên hệ</span></div><div class="mt-8 aps-table-select"><table class="table transcrip-table tabs-scores table-bordered table-noborder tblDapAn" id="tblLienHe"><thead><tr><th class="text-center w-50px" scope="col">STT</th><th scope="col">Loại liên hệ</th><th scope="col">Thông tin</th><th class="text-center" scope="col">Là thông tin chính</th></tr></thead><tbody></tbody></table></div></div>' +
            '</div></div>' +
        '</div>' +
        '<div class="zoneEdit-pane" id="tabXHD">' +
            '<div id="zoneXHD" class="ze-form">' +
                '<div class="aps-sv-section">' +
                    '<div class="aps-sv-section-title"><i class="fa-light fa-file-invoice-dollar"></i> Người mua / Xuất hoá đơn</div>' +
                    '<div class="aps-sv-grid">' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Đối tượng xuất hoá đơn</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="ddlKQ_HD_DoiTuong"><option value="">-- Chọn đối tượng --</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Họ tên người mua hàng</label><input class="aps-sv-input" id="txtKQ_HD_NguoiMua" placeholder="Người nộp tiền / người mua"></div>' +
                        '<div class="aps-sv-field aps-sv-col-full"><label class="aps-sv-label">Tên đơn vị / Công ty <span style="font-weight:500;color:#94a3b8">(nếu xuất cho tổ chức)</span></label><input class="aps-sv-input" id="txtKQ_HD_TenDonVi" placeholder="Tên đơn vị nhận hoá đơn"></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Mã số thuế (MST)</label><div class="aps-sv-input-icon"><i class="fa-light fa-hashtag"></i><input class="aps-sv-input" id="txtKQ_HD_MST" placeholder="10 hoặc 13 chữ số"></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Mã quan hệ ngân sách</label><div class="aps-sv-input-icon"><i class="fa-light fa-landmark"></i><input class="aps-sv-input" id="txtKQ_HD_MaQHNS" placeholder="Mã QHNS (nếu là đơn vị NSNN)"></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Số điện thoại nhận</label><div class="aps-sv-input-icon"><i class="fa-light fa-phone"></i><input class="aps-sv-input" id="txtKQ_HD_SDT" placeholder="09xx xxx xxx"></div></div>' +
                        '<div class="aps-sv-field aps-sv-col-full"><label class="aps-sv-label">Địa chỉ trên hoá đơn</label><input class="aps-sv-input" id="txtKQ_HD_DiaChi" placeholder="Địa chỉ ghi trên hoá đơn"></div>' +
                        '<div class="aps-sv-field aps-sv-col-full"><label class="aps-sv-label">Email nhận hoá đơn điện tử</label><div class="aps-sv-input-icon"><i class="fa-light fa-envelope"></i><input type="email" class="aps-sv-input" id="txtKQ_HD_Email" placeholder="email nhận HĐĐT"></div></div>' +
                    '</div>' +
                '</div>' +
                '<div class="aps-sv-section">' +
                    '<div class="aps-sv-section-title"><i class="fa-light fa-money-check-dollar"></i> Thông tin thanh toán</div>' +
                    '<div class="aps-sv-grid">' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Loại tài khoản ngân hàng</label><div class="aps-sv-select"><i class="fa-light fa-chevron-down"></i><select class="aps-sv-input" id="ddlKQ_HD_HinhThucTT"><option value="">-- Chọn loại tài khoản --</option></select></div></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Ngân hàng</label><input class="aps-sv-input" id="txtKQ_HD_NganHang" placeholder="Tên ngân hàng"></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Số tài khoản</label><input class="aps-sv-input" id="txtKQ_HD_SoTK" placeholder="Số tài khoản ngân hàng"></div>' +
                        '<div class="aps-sv-field"><label class="aps-sv-label">Chủ tài khoản</label><input class="aps-sv-input" id="txtKQ_HD_ChuTK" placeholder="Tên chủ tài khoản"></div>' +
                        '<div class="aps-sv-field aps-sv-col-full"><label class="aps-sv-label">Ghi chú</label><input class="aps-sv-input" id="txtKQ_HD_GhiChu" placeholder="Ghi chú thêm cho hoá đơn (nếu có)"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="container-fluid px-20"><hr /><div class="d-flex align-items-center mt-4 flex-wrap mb-4"><div class="ms-auto aps-gap-10"><div class="btn btn-outline-secondary btnClose"><i class="fal fa-times"></i> Đóng</div><div class="btn btn-primary" id="btnSave_DeXuatHoSo"><i class="fal fa-save"></i> Lưu</div></div></div></div>' +
    '</div>' +
'</div>';

    // Inject CSS
    var styleEl = document.createElement('style');
    styleEl.setAttribute('data-zone-edit-inject', '1');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Inject HTML — inline vào host nếu có, else overlay body
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var modalEl = wrap.firstChild;
    if (inlineHost) {
        modalEl.classList.add('ze-inline');
        modalEl.style.display = 'block';
        inlineHost.appendChild(modalEl);
        document.body.classList.add('ze-has-inline');
        // Ẩn nút Đóng/footer trong inline mode
        var footerClose = modalEl.querySelector('.container-fluid .btn.btnClose');
        if (footerClose) footerClose.style.display = 'none';
        // HIDE (không xoá) các sibling khác của host để trang cũ init không crash
        // — style.setProperty với 'important' để đè CSS !important của theme (2026-08-21)
        var parent = inlineHost.parentNode;
        if (parent) {
            for (var i = 0; i < parent.children.length; i++) {
                var el = parent.children[i];
                if (el !== inlineHost) {
                    el.style.setProperty('display', 'none', 'important');
                    el.setAttribute('data-ze-hidden', '1');
                }
            }
        }
    } else {
        document.body.appendChild(modalEl);
    }

    // Handler tab switch (delegate on document — chạy 1 lần)
    if (!window._zoneEditTabHandlerBound) {
        window._zoneEditTabHandlerBound = true;
        document.addEventListener('click', function (e) {
            var tab = e.target.closest('#zoneEdit .zoneEdit-tab');
            if (!tab) return;
            var target = tab.getAttribute('data-zetab');
            var host = document.getElementById('zoneEdit');
            host.querySelectorAll('.zoneEdit-tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            host.querySelectorAll('.zoneEdit-pane').forEach(function (p) { p.classList.remove('active'); });
            var pane = document.getElementById(target);
            if (pane) pane.classList.add('active');
        });
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('#zoneEdit .btnClose');
            if (!btn) return;
            document.body.classList.remove('zoneEdit-open');
        });
    }
}
// Kick off: retry loop tìm #zeInlineHost mỗi 100ms, sau 2s vẫn không có thì fallback overlay (2026-08-21)
(function _zeKickoff() {
    var tries = 0;
    var timer = setInterval(function () {
        tries++;
        if (document.getElementById('zoneEdit')) { clearInterval(timer); return; }
        if (document.getElementById('zeInlineHost')) {
            clearInterval(timer);
            _zeDoInject(false);  // inline mode
        } else if (tries > 20) {  // 20 × 100ms = 2s
            clearInterval(timer);
            zeNoLog('[ZE-Inject] timeout → fallback overlay');
            _zeDoInject(true);   // fallback overlay
        }
    }, 100);
    // Chạy ngay lần đầu để bắt case DOM đã ready
    if (document.getElementById('zeInlineHost')) {
        clearInterval(timer);
        _zeDoInject(false);
    } else if (document.getElementById('zoneEdit')) {
        clearInterval(timer);
    }
})();

/*==============================================================================
== Patch DeXuatHoSo.prototype nếu server còn dexuathoso.js cũ (2026-08-21)
== Cho phép mọi trang chỉ cần include dexuathoso.js + zoneEditModal_inject.js
==============================================================================*/
// Save PersonInvoice (tab XHĐ) — fallback nếu server có dexuathoso.js cũ (2026-08-25)
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype.save_PersonInvoice) {
    DeXuatHoSo.prototype.save_PersonInvoice = function () {
        var me = this;
        var val = function (id) { return (($('#' + id).val() || '') + '').trim(); };
        var tenDonVi = val('txtKQ_HD_TenDonVi');
        var mst = val('txtKQ_HD_MST');
        var diaChi = val('txtKQ_HD_DiaChi');
        var email = val('txtKQ_HD_Email');
        var sdt = val('txtKQ_HD_SDT');
        var maQHNS = val('txtKQ_HD_MaQHNS');
        var doiTuong = $('#ddlKQ_HD_DoiTuong').val() || '';
        var hasData = tenDonVi || mst || diaChi || email || sdt || maQHNS || doiTuong;
        var invoiceId = me._currentInvoiceId || '';
        if (!hasData && !invoiceId) return;
        var isUpdate = !!(invoiceId && invoiceId.length === 32);
        var obj_save = {
            action: isUpdate ? 'SV_NGUOIHOC_01_MH/EjQgHhEkMzIuLwgvNy4oIiQILycu' : 'SV_NGUOIHOC_01_MH/FSkkLB4RJDMyLi8ILzcuKCIkCC8nLgPP',
            func: isUpdate ? 'PKG_CORE_NGUOIHOC_01.Sua_PersonInvoiceInfo' : 'PKG_CORE_NGUOIHOC_01.Them_PersonInvoiceInfo',
            iM: edu.system.iM,
            strBuyer_Type_Loai: doiTuong, strBuyer_Ref_Type: '', strBuyer_Ref_Id: '',
            strBuyer_Name: tenDonVi, strBuyer_Addr: diaChi, strBuyer_Tax_Mst: mst,
            strBuyer_Budget_Qhns: maQHNS, strBuyer_Email: email, strBuyer_Phone: sdt,
            strNguoiThucHien_Id: edu.system.userId,
            strVaiTroDangNhap_Id: edu.system.vaiTroDangNhap_Id || '',
            strChucNangHeThong_Id: edu.system.chucNangHeThong_Id || edu.system.strChucNang_Id,
            strHanhDong_Code: ''
        };
        if (isUpdate) obj_save.strId = invoiceId;
        else {
            var pid = me.strDeXuatHoSo_Id || me._lockedPersonId || '';
            if (!pid) { console.warn('[ZE PersonInvoice] không có strPerson_Id → skip Them'); return; }
            obj_save.strPerson_Id = pid;
        }
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) { if (!isUpdate && data.Id) me._currentInvoiceId = data.Id; }
                else console.warn('[ZE PersonInvoice] fail:', data.Message);
            },
            error: function (er) { console.warn('[ZE PersonInvoice] err:', er); },
            type: 'POST', contentType: true, action: obj_save.action, data: obj_save, fakedb: []
        }, false, false, false, null);
    };
}

// Monkey-patch save_DeXuatHoSo → chain save_PersonInvoice sau khi CorePerson save (2026-08-25)
if (typeof DeXuatHoSo === 'function' && DeXuatHoSo.prototype.save_DeXuatHoSo && !DeXuatHoSo.prototype._invoiceChainHooked) {
    DeXuatHoSo.prototype._invoiceChainHooked = true;
    var _origSaveDX = DeXuatHoSo.prototype.save_DeXuatHoSo;
    // dexuathoso.js bản mới đã tự gọi save_PersonInvoice trong success của CorePerson.
    // Nếu vẫn gọi thêm ở đây thì hồ sơ CHƯA có hoá đơn sẽ bị INSERT trùng 2 dòng: lần
    // gọi thứ 2 (mốc 300ms) chạy trước khi lần 1 kịp trả _currentInvoiceId nên cả hai
    // đều tính là "chưa có" → cùng chạy Them_PersonInvoiceInfo. Chỉ chain khi bản gốc
    // chưa gọi (server còn dexuathoso.js cũ).
    var _goc_daChain = _origSaveDX.toString().indexOf('save_PersonInvoice') > -1;
    DeXuatHoSo.prototype.save_DeXuatHoSo = function () {
        var me = this;
        _origSaveDX.call(me);
        if (_goc_daChain) return;
        // Fire PersonInvoice song song sau 300ms (CorePerson save đã fire, strDeXuatHoSo_Id đã có sẵn với UPDATE)
        setTimeout(function () { if (typeof me.save_PersonInvoice === 'function') me.save_PersonInvoice(); }, 300);
    };
}

// Bridge helper: #txtEmailCaNhan/#txtDienThoai → shadow #txtLienHe<typeId> (2026-08-25)
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._bridgeLienHeToShadow) {
    DeXuatHoSo.prototype._bridgeOneLienHe = function (typeId, uiFieldId) {
        if (!typeId) return;
        if (!$('#txtLienHe' + typeId).length) $('body').append('<input type="hidden" id="txtLienHe' + typeId + '" />');
        if (!$('#checkX' + typeId).length) $('body').append('<input type="checkbox" id="checkX' + typeId + '" style="display:none" checked />');
        var val = (($('#' + uiFieldId).val() || '') + '').trim();
        $('#txtLienHe' + typeId).val(val);
        var existing = (this.dtLienHe || []).find(function (x) { return x.CONTACT_TYPE_CODE_ID === typeId || x.CONTACT_TYPE_CODE === typeId; });
        if (existing && existing.ID) $('#txtLienHe' + typeId).attr('name', existing.ID);
    };
    DeXuatHoSo.prototype._bridgeLienHeToShadow = function () {
        var me = this;
        var arr = me.dtLoaiLienHe || [];
        var strip = function (s) { return ((s || '') + '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase(); };
        arr.forEach(function (type) {
            var text = strip(type.MA) + '|' + strip(type.TEN);
            var isEmail = /EMAIL|E-MAIL|\bMAIL\b|THU DIEN TU/.test(text);
            var isPhone = /PHONE|MOBILE|\bSDT\b|\bDT\b|\bTEL\b|DIEN THOAI|SO DT/.test(text);
            if (!isEmail && !isPhone) {
                var existing = (me.dtLienHe || []).find(function (x) { return (x.CONTACT_TYPE_CODE_ID === type.ID) || (x.CONTACT_TYPE_CODE === type.ID); });
                var v = existing && (existing.CONTACT_VALUE || existing.VALUE) || '';
                if (v.indexOf('@') > -1) isEmail = true;
                else if (/^[\d\s\+\-\(\)\.]+$/.test(v) && v.replace(/\D/g, '').length >= 6) isPhone = true;
            }
            var uiFieldId = isEmail ? 'txtEmailCaNhan' : (isPhone ? 'txtDienThoai' : null);
            if (!uiFieldId) return;
            me._bridgeOneLienHe(type.ID, uiFieldId);
        });
    };
}

// Bridge helper: #txtCCCD_So → shadow #txtSoDinhDinh<cccdTypeId> (2026-08-25)
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._bridgeCccdToShadow) {
    DeXuatHoSo.prototype._findCccdTypeId = function () {
        var arr = this.dtLoaiDinhDanh || [];
        var found = arr.find(function (e) {
            var ma = ((e.MA || '') + '').toUpperCase();
            var ten = ((e.TEN || '') + '').toUpperCase();
            return ma === 'CCCD' || ten.indexOf('CCCD') > -1 || ten.indexOf('CĂN CƯỚC') > -1 || ten.indexOf('CAN CUOC') > -1;
        });
        return found ? found.ID : null;
    };
    DeXuatHoSo.prototype._bridgeCccdToShadow = function () {
        var cid = this._findCccdTypeId();
        if (!cid) { console.warn('[ZE Bridge CCCD] không tìm thấy CCCD type'); return; }
        if (!$('#txtSoDinhDinh' + cid).length) $('body').append('<input type="hidden" id="txtSoDinhDinh' + cid + '" />');
        if (!$('#txtNgayCap' + cid).length) $('body').append('<input type="hidden" id="txtNgayCap' + cid + '" />');
        if (!$('#txtNoiCap' + cid).length) $('body').append('<input type="hidden" id="txtNoiCap' + cid + '" />');
        if (!$('#checkX' + cid).length) $('body').append('<input type="checkbox" id="checkX' + cid + '" style="display:none" checked />');
        $('#txtSoDinhDinh' + cid).val(($('#txtCCCD_So').val() || '').trim());
        $('#txtNgayCap' + cid).val($('#txtCCCD_NgayCap').val() || '');
        $('#txtNoiCap' + cid).val(($('#txtCCCD_NoiCap').val() || '').trim());
        var existing = (this.dtDinhDanh || []).find(function (x) { return x.IDENTIFIER_TYPE_CODE === cid; });
        if (existing && existing.ID) $('#txtSoDinhDinh' + cid).attr('name', existing.ID);
    };
}

// Populate header badge (2026-08-28) — fallback nếu server có dexuathoso.js cũ
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._populateHeaderBadge) {
    DeXuatHoSo.prototype._populateHeaderBadge = function (person) {
        var el = document.getElementById('zeHeaderBadge');
        if (!el) return;
        el.innerHTML = '';
        if (!person) return;
        var pick = function (obj, keys) {
            if (!obj) return '';
            var lookup = {};
            for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) lookup[k.toUpperCase()] = obj[k]; }
            for (var i = 0; i < keys.length; i++) {
                var v = lookup[keys[i].toUpperCase()];
                if (v !== null && v !== undefined && v !== '') return v;
            }
            return '';
        };
        var a = person.aData || {};
        var ma = person.ma || pick(a, ['MA', 'MASO', 'MA_NGUOI_HOC', 'MA_SV', 'STUDENT_CODE', 'CURRENT_EMPLOYEE_CODE', 'QLSV_NGUOIHOC_MA', 'MA_HS']);
        var hoTen = person.hoTen || pick(a, ['FULL_NAME', 'FULLNAME', 'HOTEN', 'HO_TEN', 'HOVATEN', 'HO_VA_TEN', 'QLSV_NGUOIHOC_HOTEN', 'QLSV_NGUOIHOC_FULLNAME']);
        if (!hoTen) {
            var _parts = [person.hoDem || pick(a, ['HODEM', 'HO_DEM', 'QLSV_NGUOIHOC_HODEM']), person.ten || pick(a, ['TEN', 'FIRST_NAME', 'QLSV_NGUOIHOC_TEN'])];
            hoTen = _parts.filter(function (x) { return x; }).join(' ').replace(/\s+/g, ' ').trim();
        }
        var lop = person.lop || pick(a, ['DAOTAO_LOPQUANLY_TEN', 'LOP_TEN', 'LOP', 'QLSV_NGUOIHOC_LOPQUANLY_TEN', 'DAOTAO_LOPQUANLY_MA', 'LOP_MA']);
        var nganh = person.nganh || pick(a, ['DAOTAO_NGANH_TEN', 'NGANH_TEN', 'NGANH', 'QLSV_NGUOIHOC_NGANH_TEN', 'DAOTAO_NGANHDAOTAO_TEN']);
        var khoa = person.khoa || pick(a, ['DAOTAO_KHOAQUANLY_TEN', 'KHOA_TEN', 'KHOA', 'QLSV_NGUOIHOC_KHOAQUANLY_TEN', 'DAOTAO_KHOADAOTAO_TEN', 'KHOAHOC']);
        var esc = function (s) { return (s + '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
        var chips = [];
        if (ma) chips.push('<span class="ze-chip"><b>Mã:</b>' + esc(ma) + '</span>');
        if (hoTen) chips.push('<span class="ze-chip"><b>Họ tên:</b>' + esc(hoTen) + '</span>');
        if (lop) chips.push('<span class="ze-chip"><b>Lớp:</b>' + esc(lop) + '</span>');
        if (nganh) chips.push('<span class="ze-chip"><b>Ngành:</b>' + esc(nganh) + '</span>');
        if (khoa) chips.push('<span class="ze-chip"><b>Khóa:</b>' + esc(khoa) + '</span>');
        el.innerHTML = chips.join('');
    };
}

if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype.openEditByPerson) {
    DeXuatHoSo.prototype.openEditByPerson = function (person) {
        var dx = this;
        if (!person || !person.id) return;
        dx.strDeXuatHoSo_Id = person.id;
        // Lưu backup để save flow không bị mất (Viện Y schema NOT NULL constraint) (2026-08-24)
        dx._lockedPersonId = person.id;
        // Safeguard: intercept Save button để force strDeXuatHoSo_Id đúng, đảm bảo gọi UPDATE (không INSERT)
        if (!dx._saveGuardBound) {
            dx._saveGuardBound = true;
            $(document).on('mousedown', '#btnSave_DeXuatHoSo', function () {
                if (dx._lockedPersonId) {
                    dx.strDeXuatHoSo_Id = dx._lockedPersonId;
                }
                if (typeof dx._bridgeCccdToShadow === 'function') dx._bridgeCccdToShadow();
                if (typeof dx._bridgeLienHeToShadow === 'function') dx._bridgeLienHeToShadow();
            });
            // Validate: Số CCCD bắt buộc nhập — capture-phase click để chặn direct click handler (2026-08-25)
            var _btnSave = document.getElementById('btnSave_DeXuatHoSo');
            if (_btnSave && !_btnSave._cccdValidatorBound) {
                _btnSave._cccdValidatorBound = true;
                _btnSave.addEventListener('click', function (ev) {
                    var el = document.getElementById('txtCCCD_So');
                    if (el && !((el.value || '') + '').trim()) {
                        try { edu.system.alert('Vui lòng nhập Số CCCD.', 'w'); } catch (er) { alert('Vui lòng nhập Số CCCD.'); }
                        setTimeout(function () { try { el.focus(); } catch (er) { } }, 50);
                        ev.preventDefault();
                        ev.stopImmediatePropagation();
                        ev.stopPropagation();
                        return false;
                    }
                }, true); // capture phase — chạy trước jQuery bubble handler
            }
        }
        var strHoDem = ((person.hoDem || '') + '').trim().replace(/\s+/g, ' ');
        var arr = strHoDem.split(' ');
        var strHo = arr.shift() || '';
        var strTenDem = arr.join(' ');
        edu.util.viewValById("txtHo", strHo);
        edu.util.viewValById("txtTenDem", strTenDem);
        edu.util.viewValById("txtTen", edu.util.returnEmpty(person.ten));
        $("#txtTen").trigger("input");
        edu.util.viewValById("txtNgaySinh", edu.util.returnEmpty(person.ngaySinh_Ngay));
        edu.util.viewValById("txtThangSinh", edu.util.returnEmpty(person.ngaySinh_Thang));
        edu.util.viewValById("txtNamSinh", edu.util.returnEmpty(person.ngaySinh_Nam));
        edu.util.viewValById("uploadPicture_SV", edu.util.returnEmpty(person.anh));
        var strAnh = edu.system.getRootPathImg(edu.util.returnEmpty(person.anh), constant.setting.EnumImageType.ACCOUNT);
        $("#srcuploadPicture_SV").attr("src", strAnh);
        if (typeof dx._populateHeaderBadge === 'function') dx._populateHeaderBadge(person);
        var isInline = $('#zoneEdit').hasClass('ze-inline');
        if (!isInline) {
            dx.toggle_edit();
            $('body').addClass('zoneEdit-open');
        }
        $('#zoneEdit .zoneEdit-tab').removeClass('active');
        $('#zoneEdit .zoneEdit-tab[data-zetab="tabInfo"]').addClass('active');
        $('#zoneEdit .zoneEdit-pane').removeClass('active');
        $('#zoneEdit #tabInfo').addClass('active');
        if (typeof dx.getList_DinhDanh === 'function') dx.getList_DinhDanh();
        if (typeof dx.getList_LienHe === 'function') dx.getList_LienHe();
        if (dx.dtMucDoNgaySinh && dx.dtMucDoNgaySinh.length) {
            var opt = dx.dtMucDoNgaySinh.find(function (e) { return e.MA == "EXACT"; });
            if (opt) $('#dropMucDoNgaySinh').val(opt.ID).trigger("change").trigger({ type: 'select2:select' });
        }
        // Populate dropdown — accept ID hoặc MA. Nếu MA thì tìm option có data-ma khớp
        var _pickIdByMa = function (selectId, ma) {
            if (!ma) return '';
            var opt = document.querySelector('#' + selectId + ' option[name="' + ma + '"]')
                || document.querySelector('#' + selectId + ' option[data-ma="' + ma + '"]');
            if (opt) return opt.value;
            // Fallback: tìm option có TEXT khớp MA (không nên nhưng safe)
            var all = document.querySelectorAll('#' + selectId + ' option');
            for (var i = 0; i < all.length; i++) {
                if ((all[i].getAttribute('name') || '') === ma) return all[i].value;
            }
            return '';
        };
        var _setDrop = function () {
            var gt = person.gioiTinh || _pickIdByMa('dropGioiTinh', person.gioiTinhMa);
            var dt = person.danToc || _pickIdByMa('dropDanToc', person.danTocMa);
            var tg = person.tonGiao || _pickIdByMa('dropTonGiao', person.tonGiaoMa);
            var qt = person.quocTich || _pickIdByMa('dropQuocTich', person.quocTichMa);
            if (gt) { $('#dropGioiTinh').val(gt).trigger('change'); }
            if (dt) { $('#dropDanToc').val(dt).trigger('change'); }
            if (tg) { $('#dropTonGiao').val(tg).trigger('change'); }
            if (qt) { $('#dropQuocTich').val(qt).trigger('change'); }
        };
        _setDrop();
        setTimeout(_setDrop, 500);
        setTimeout(_setDrop, 1500);
        if (typeof dx._loadXHD_Section === 'function') dx._loadXHD_Section(person.id);
        if (typeof dx._loadTabInfoExtras === 'function') dx._loadTabInfoExtras(person.id);
    };
    zeNoLog('[ZE-Inject] openEditByPerson patched');
}
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._loadXHD_Section) {
    DeXuatHoSo.prototype._loadXHD_Section = function (personId) {
        var dx = this;
        var arrClear = ["ddlKQ_HD_DoiTuong", "txtKQ_HD_NguoiMua", "txtKQ_HD_TenDonVi", "txtKQ_HD_MST",
            "txtKQ_HD_MaQHNS", "txtKQ_HD_SDT", "txtKQ_HD_DiaChi", "txtKQ_HD_Email",
            "ddlKQ_HD_HinhThucTT", "txtKQ_HD_NganHang", "txtKQ_HD_SoTK", "txtKQ_HD_ChuTK", "txtKQ_HD_GhiChu"];
        edu.util.resetValByArrId(arrClear);
        if (!dx._xhdDMDLLoaded) {
            edu.system.loadToCombo_DanhMucDuLieu("TS.DOITUONGHOADON", "ddlKQ_HD_DoiTuong");
            edu.system.loadToCombo_DanhMucDuLieu("PERSON_BANK_ACCOUNT.ACCOUNT_TYPE_CODE", "ddlKQ_HD_HinhThucTT");
            dx._xhdDMDLLoaded = true;
        }
        edu.system.makeRequest({
            success: function (data) {
                if (!data.Success) return;
                var list = (data.Data || []).filter(function (i) {
                    return i.PERSON_ID == personId && (i.IS_ACTIVE === undefined || i.IS_ACTIVE == 1);
                });
                if (!list.length) return;
                var b = list.find(function (i) { return i.IS_PRIMARY == 1; }) || list[0];
                dx._currentBankId = b.ID || '';
                // Bank ACCOUNT_TYPE_CODE là MA — cần tra ID từ option[name=MA] để select đúng
                var _setBank = function () {
                    var typeId = '';
                    var opt = document.querySelector('#ddlKQ_HD_HinhThucTT option[name="' + b.ACCOUNT_TYPE_CODE + '"]');
                    if (opt) typeId = opt.value;
                    if (typeId) { $('#ddlKQ_HD_HinhThucTT').val(typeId).trigger('change'); }
                    edu.util.viewValById("txtKQ_HD_NganHang", b.BANK_NAME);
                    edu.util.viewValById("txtKQ_HD_SoTK", b.ACCOUNT_NUMBER);
                    edu.util.viewValById("txtKQ_HD_ChuTK", b.ACCOUNT_NAME);
                    edu.util.viewValById("txtKQ_HD_GhiChu", b.NOTE);
                };
                _setBank();
                setTimeout(_setBank, 500);
                setTimeout(_setBank, 1500);
            },
            error: function () { },
            type: 'POST',
            action: 'NS_HoSoNhanSu6_MH/BiQ1HhEkMzIuLx4DIC8qHgAiIi40LzUP',
            contentType: true,
            data: {
                'action': 'NS_HoSoNhanSu6_MH/BiQ1HhEkMzIuLx4DIC8qHgAiIi40LzUP',
                'func': 'PKG_CORE_HOSONHANSU_06.Get_Person_Bank_Account',
                'iM': edu.system.iM, 'strChucNang_Id': edu.system.strChucNang_Id,
                'strVaiTro_Id': '', 'strNguoiThucHien_Id': edu.system.userId,
                'strPerson_Id': personId
            },
            fakedb: []
        }, false, false, false, null);

        // Auto-fill XHD chỉ Email + SĐT từ contact cache (KHÔNG fill Họ tên người mua — có thể là cơ quan)
        setTimeout(function () {
            (dx.dtLienHe || []).forEach(function (item) {
                var name = ((item.CONTACT_TYPE_CODE_NAME || item.CONTACT_TYPE_NAME || '') + '').toLowerCase();
                var ma = ((item.CONTACT_TYPE_CODE_MA || item.MA || '') + '').toUpperCase();
                var val = item.CONTACT_VALUE || item.VALUE || '';
                if (!val) return;
                if ((ma === 'EMAIL' || name.indexOf('mail') > -1) && !$('#txtKQ_HD_Email').val()) $('#txtKQ_HD_Email').val(val);
                else if ((ma === 'PHONE' || ma === 'MOBILE' || name.indexOf('điện thoại') > -1 || name.indexOf('phone') > -1) && !$('#txtKQ_HD_SDT').val()) $('#txtKQ_HD_SDT').val(val);
            });
        }, 1000);

        // Load PersonInvoice từ PKG_CORE_NGUOIHOC_01.LayDS_PersonInvoiceInfo (2026-08-24)
        // TODO: sếp/A xác nhận action code encoded cho endpoint này, hiện dùng literal — nếu BE 404, sếp báo em code chính xác
        edu.system.makeRequest({
            success: function (data) {
                if (!data.Success || !data.Data || !data.Data.length) return;
                // ORDER BY IS_CURRENT DESC → record đầu là hiện hành
                var inv = data.Data[0];
                dx._currentInvoiceId = inv.ID || '';
                var _setInv = function () {
                    // BUYER_TYPE_LOAI là ID (DM Loại đối tượng) → set trực tiếp
                    if (inv.BUYER_TYPE_LOAI) { $('#ddlKQ_HD_DoiTuong').val(inv.BUYER_TYPE_LOAI).trigger('change'); }
                    if (inv.BUYER_NAME_TENNM) $('#txtKQ_HD_TenDonVi').val(inv.BUYER_NAME_TENNM);
                    if (inv.BUYER_ADDR_DIACHI) $('#txtKQ_HD_DiaChi').val(inv.BUYER_ADDR_DIACHI);
                    if (inv.BUYER_TAX_MST) $('#txtKQ_HD_MST').val(inv.BUYER_TAX_MST);
                    if (inv.BUYER_BUDGET_MAQHNS) $('#txtKQ_HD_MaQHNS').val(inv.BUYER_BUDGET_MAQHNS);
                    if (inv.BUYER_EMAIL) $('#txtKQ_HD_Email').val(inv.BUYER_EMAIL);
                    if (inv.BUYER_PHONE_SDT) $('#txtKQ_HD_SDT').val(inv.BUYER_PHONE_SDT);
                };
                _setInv();
                setTimeout(_setInv, 500);
                setTimeout(_setInv, 1500);
            },
            error: function (er) { console.warn('[ZE] LayDS_PersonInvoiceInfo error:', er); },
            type: 'POST',
            action: 'SV_NGUOIHOC_01_MH/DSA4BRIeESQzMi4vCC83LigiJAgvJy4P',
            contentType: true,
            data: {
                'action': 'SV_NGUOIHOC_01_MH/DSA4BRIeESQzMi4vCC83LigiJAgvJy4P',
                'func': 'PKG_CORE_NGUOIHOC_01.LayDS_PersonInvoiceInfo',
                'iM': edu.system.iM,
                'strPerson_Id': personId,
                'dChiHienHanh': 1,
                'strNguoiThucHien_Id': edu.system.userId,
                'strVaiTroDangNhap_Id': edu.system.vaiTroDangNhap_Id || '',
                'strChucNangHeThong_Id': edu.system.chucNangHeThong_Id || edu.system.strChucNang_Id,
                'strHanhDong_Code': ''
            },
            fakedb: []
        }, false, false, false, null);
    };
}
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._loadTabInfoExtras) {
    DeXuatHoSo.prototype._loadTabInfoExtras = function (personId) {
        var dx = this;
        if (!dx._infoDMDLLoaded) {
            try {
                edu.system.loadToCombo_DanhMucDuLieu("CHUN.CHLU", "dropQuocTich");
                edu.system.loadToCombo_DanhMucDuLieu("NS.DATO", "dropDanToc");
                edu.system.loadToCombo_DanhMucDuLieu("NS.TOGI", "dropTonGiao");
            } catch (e) { console.warn('[TabInfo] loadDMDL error', e); }
            dx._infoDMDLLoaded = true;
        }
        if (!dx._cascadeInited && edu.extend && typeof edu.extend.genDropTinhThanh === 'function') {
            try {
                edu.extend.genDropTinhThanh('dropNS_Tinh', 'dropNS_Huyen', 'dropNS_Xa');
                edu.extend.genDropTinhThanh('dropHK_Tinh', 'dropHK_Huyen', 'dropHK_Xa');
            } catch (e) { console.warn('[TabInfo] genDropTinhThanh error', e); }
            dx._cascadeInited = true;
        }
        var arrClear = [
            "dropQuocTich", "dropDanToc", "dropTonGiao", "txtEmailCaNhan", "txtDienThoai",
            "dropNS_Tinh", "dropNS_Huyen", "dropNS_Xa", "txtNS_ChiTiet",
            "txtCCCD_So", "txtCCCD_NgayCap", "txtCCCD_NoiCap",
            "dropHK_Tinh", "dropHK_Huyen", "dropHK_Xa", "txtHK_SoNha"
        ];
        if (edu.util && edu.util.resetValByArrId) edu.util.resetValByArrId(arrClear);
        setTimeout(function () {
            var strip = function (s) { return ((s || '') + '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase(); };
            (dx.dtLienHe || []).forEach(function (item) {
                var val = item.CONTACT_VALUE || item.VALUE || '';
                var text = strip(item.CONTACT_TYPE_CODE_MA || item.MA) + '|' + strip(item.CONTACT_TYPE_CODE_NAME || item.CONTACT_TYPE_NAME);
                var isEmail = /EMAIL|E-MAIL|\bMAIL\b|THU DIEN TU/.test(text);
                var isPhone = /PHONE|MOBILE|\bSDT\b|\bDT\b|\bTEL\b|DIEN THOAI|SO DT/.test(text);
                if (!isEmail && !isPhone) {
                    if (val.indexOf('@') > -1) isEmail = true;
                    else if (/^[\d\s\+\-\(\)\.]+$/.test(val) && val.replace(/\D/g, '').length >= 6) isPhone = true;
                }
                if (isEmail) edu.util.viewValById('txtEmailCaNhan', val);
                else if (isPhone) edu.util.viewValById('txtDienThoai', val);
            });
            (dx.dtDinhDanh || []).forEach(function (item) {
                var typeName = ((item.IDENTIFIER_TYPE_CODE_NAME || item.IDENTIFIER_TYPE_NAME || '') + '').toUpperCase();
                var typeMa = ((item.IDENTIFIER_TYPE_CODE_MA || item.MA || '') + '').toUpperCase();
                if (typeMa === 'CCCD' || typeName.indexOf('CCCD') > -1 || typeName.indexOf('CĂN CƯỚC') > -1) {
                    edu.util.viewValById('txtCCCD_So', item.IDENTIFIER_NO || '');
                    edu.util.viewValById('txtCCCD_NgayCap', item.ISSUE_DATE || '');
                    edu.util.viewValById('txtCCCD_NoiCap', item.ISSUE_PLACE || '');
                }
            });
        }, 800);
    };
}

/*==============================================================================
== NƠI SINH / HỘ KHẨU — NẠP & GHI THẬT XUỐNG BẢNG PERSON_ADDRESS  (2026-09-11)
==
== Bug: modal #zoneEdit có đủ 8 ô địa chỉ (dropNS_Tinh/Huyen/Xa + txtNS_ChiTiet,
== dropHK_Tinh/Huyen/Xa + txtHK_SoNha), có cascade Tỉnh→Huyện→Xã, _loadTabInfoExtras còn xoá trắng
== chúng mỗi lần mở — nhưng KHÔNG có chỗ nào đọc lên từ PERSON_ADDRESS và cũng
== KHÔNG có chỗ nào ghi xuống. Nhập bao nhiêu cũng mất, mở lại luôn trắng.
==
== save_DiaChi của dexuathoso.js không dùng lại được: nó bám vào form con
== #tblDiaChi (dropLoaiDiaChi/dropTinh/dropPhuong/txtDiaChiChiTiet1...) với
== luồng "thêm từng địa chỉ một", trong khi modal này là 2 cụm cố định NS/HK.
== Vì vậy port nguyên logic đã chạy ổn bên kehoachtuyensinhnew.js, DÙNG LẠI
== đúng 3 action string của dexuathoso.js (Ins/Upd) — không tự bịa mã.
==============================================================================*/
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._zeAddrHooked) {
    DeXuatHoSo.prototype._zeAddrHooked = true;

    // Lấy nguyên từ dexuathoso.js save_DiaChi/getList_DiaChi — action string chính là
    // khoá XOR để BE giải mã, sai 1 ký tự là hỏng nên tuyệt đối không sửa/đoán.
    var _ZE_ADDR_GET = 'NS_HoSoNhanSu6_MH/BiQ1HhEkMzIuLx4AJSUzJDIy';
    var _ZE_ADDR_INS = 'NS_HoSoNhanSu6_MH/CC8yHhEkMzIuLx4AJSUzJDIy';
    var _ZE_ADDR_UPD = 'NS_HoSoNhanSu6_MH/FDElHhEkMzIuLx4AJSUzJDIy';

    // 2 cụm địa chỉ của modal. NS = nơi sinh, HK = hộ khẩu thường trú.
    var _ZE_O = {
        NS: { tinh: 'dropNS_Tinh', huyen: 'dropNS_Huyen', xa: 'dropNS_Xa', line: 'txtNS_ChiTiet' },
        HK: { tinh: 'dropHK_Tinh', huyen: 'dropHK_Huyen', xa: 'dropHK_Xa', line: 'txtHK_SoNha' }
    };

    var _zeStrip = function (s) {
        return ((s || '') + '').normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
    };

    /*------------------------------------------
    -- Danh mục Loại địa chỉ. PERSON_ADDRESS.ADDRESS_TYPE_CODE lưu ID (GUID) của
    -- danh mục chứ không phải mã chữ, nên bắt buộc có bảng này mới biết đâu là
    -- Nơi sinh, đâu là Hộ khẩu. Nạp 1 lần rồi cache trên instance.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeEnsureAddrTypeDM = function (cb) {
        var dx = this;
        if (dx.dtDM_AddressType && dx.dtDM_AddressType.length) { if (cb) cb(); return; }
        edu.system.makeRequest({
            success: function (data) {
                dx.dtDM_AddressType = (data && data.Success && data.Data) || [];
                if (cb) cb();
            },
            error: function () { dx.dtDM_AddressType = []; if (cb) cb(); },
            type: 'GET',
            contentType: true,
            action: 'CMS_DanhMucThuocTinh/LayDanhSachDuLieuTheoBangDM',
            data: {
                'strMaBangDanhMuc': 'PERSON_ADDRESS.ADDRESS_TYPE_CODE',
                'strTieuChiSapXep': '',
                'dTrangThai': 1
            },
            fakedb: []
        }, false, false, false, null);
    };

    /*------------------------------------------
    -- kind: 'NS' | 'HK' → ID danh mục tương ứng.
    -- Trả '' nếu danh mục chưa khai báo mục đó (khi đó không ghi xuống được).
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeAddrTypeId = function (kind) {
        var dt = this.dtDM_AddressType || [];
        if (!dt.length) return '';
        var rx = (kind === 'NS') ? /NOI SINH|BIRTH/ : /HO KHAU|THUONG TRU|PERMANENT/;
        var found = dt.filter(function (e) {
            return rx.test(_zeStrip(e.TEN) + ' ' + _zeStrip(e.MA));
        })[0];
        return found ? (found.ID || '') : '';
    };

    DeXuatHoSo.prototype._zeGetAddrList = function (personId, cb) {
        if (!edu.util.checkValue(personId)) { cb([]); return; }
        edu.system.makeRequest({
            success: function (data) {
                var rows = (data && data.Success && data.Data) || [];
                // Bỏ bản ghi đã xoá mềm, y như genTable_DiaChi của dexuathoso.js
                cb(rows.filter(function (r) {
                    return r && (r.IS_ACTIVE === undefined || r.IS_ACTIVE == 1);
                }));
            },
            error: function () { cb([]); },
            type: 'POST',
            contentType: true,
            action: _ZE_ADDR_GET,
            data: {
                'action': _ZE_ADDR_GET,
                'func': 'PKG_CORE_HOSONHANSU_06.Get_Person_Address',
                'iM': edu.system.iM,
                'strPerson_Id': personId,
                'strChucNang_Id': edu.system.strChucNang_Id,
                'strVaiTro_Id': '',
                'strNguoiThucHien_Id': edu.system.userId
            },
            fakedb: []
        }, false, false, false, null);
    };

    /*------------------------------------------
    -- Đổ 1 cụm địa chỉ (Tỉnh → Huyện → Xã → chi tiết) vào form.
    -- districtId: lấy thẳng từ DISTRICT_ID nếu API trả. Không có mới tra ngược
    -- Huyện từ Xã (edu.extend.dtTinhThanh: mảng phẳng {ID, TEN, QUANHECHA_ID}) —
    -- nếu chỉ tra ngược thì hồ sơ chọn Huyện mà bỏ trống Xã sẽ mất Huyện khi mở lại.
    -- Tự retry chờ cache tỉnh/thành (genDropTinhThanh nạp bất đồng bộ).
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeFillDiaChi = function (o, provinceId, districtId, wardId, chiTiet, _try) {
        var dx = this;
        if (chiTiet) edu.util.viewValById(o.line, chiTiet);
        if (!provinceId && !districtId && !wardId) return;
        var dt = (edu.extend && edu.extend.dtTinhThanh) || [];
        if (!dt.length) {                       // cache chưa sẵn sàng → chờ rồi thử lại
            _try = (_try || 0) + 1;
            if (_try > 25) return;
            setTimeout(function () {
                dx._zeFillDiaChi(o, provinceId, districtId, wardId, '', _try);
            }, 200);
            return;
        }
        var find = function (id) { return dt.filter(function (e) { return e.ID === id; })[0]; };
        var xa = wardId ? find(wardId) : null;
        var huyenId = districtId || (xa ? xa.QUANHECHA_ID : '');
        var tinhId = provinceId || (huyenId ? ((find(huyenId) || {}).QUANHECHA_ID || '') : '');
        var fill = function (elId, list, defVal, title) {
            edu.system.loadToCombo_data({
                data: list,
                renderInfor: { id: 'ID', parentId: '', name: 'TEN', code: '', default_val: defVal },
                renderPlace: [elId], type: '', title: title
            });
        };
        if (tinhId) {
            $('#' + o.tinh).val(tinhId).trigger('change');
            $('#' + o.tinh).prop('disabled', false);
        }
        // Tỉnh 2 cấp (sau sáp nhập): Xã treo thẳng vào Tỉnh, không có cấp Huyện ở giữa
        // → cha của Xã chính là Tỉnh. Nếu vẫn coi nó là Huyện thì cả 2 ô đều trống.
        var haiCap = !!(huyenId && tinhId && huyenId === tinhId);
        if (haiCap) $('#' + o.huyen).attr('data-2cap', '1').prop('disabled', false);
        if (huyenId && !haiCap) {
            fill(o.huyen, dt.filter(function (e) { return e.QUANHECHA_ID === tinhId; }),
                huyenId, 'Chọn quận/huyện');
            $('#' + o.huyen).prop('disabled', false);
        }
        // Luôn đổ danh sách Xã khi đã biết cấp cha — kể cả hồ sơ chưa chọn Xã. Nếu không,
        // ô Xã đứng nguyên ở "Vui lòng chọn Quận/Huyện trước" và không bổ sung được.
        var chaCuaXa = haiCap ? tinhId : huyenId;
        if (chaCuaXa) {
            fill(o.xa, dt.filter(function (e) { return e.QUANHECHA_ID === chaCuaXa; }),
                wardId || '', 'Chọn phường/xã');
            $('#' + o.xa).prop('disabled', false);
        }
    };

    /*------------------------------------------
    -- Nghị định bỏ cấp huyện: nhiều tỉnh giờ chỉ còn 2 cấp Tỉnh → Xã.
    -- Với các tỉnh đó genDropTinhThanh vẫn đổ con của Tỉnh vào ô "Quận/Huyện" —
    -- tức ô Quận/Huyện đang chứa danh sách XÃ, còn ô Xã rỗng vĩnh viễn, lưu ra
    -- WARD_ID rỗng → "nhập vào lưu xong mất xã".
    -- Nhận diện bằng chính dữ liệu, không hardcode danh sách tỉnh: con của Tỉnh
    -- KHÔNG có cháu thì tỉnh đó 2 cấp. Tỉnh còn 3 cấp chạy y như cũ.
    -- KHÔNG khoá ô Quận/Huyện: dữ liệu đang lẫn cả tỉnh cũ lẫn tỉnh mới, người
    -- dùng chọn được tới đâu thì lưu tới đó.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeApply2Cap = function (o) {
        var dt = (edu.extend && edu.extend.dtTinhThanh) || [];
        var $huyen = $('#' + o.huyen);
        var tinhId = $('#' + o.tinh).val() || '';
        if (!tinhId || !dt.length) { $huyen.removeAttr('data-2cap'); return; }
        var con = dt.filter(function (e) { return e.QUANHECHA_ID === tinhId; });
        if (!con.length) { $huyen.removeAttr('data-2cap'); return; }
        var coChau = con.some(function (c) {
            return dt.some(function (e) { return e.QUANHECHA_ID === c.ID; });
        });
        if (coChau) { $huyen.removeAttr('data-2cap'); return; }   // tỉnh 3 cấp → giữ nguyên

        $huyen.attr('data-2cap', '1');
        // Giữ lựa chọn hiện có nếu vẫn hợp lệ (tránh xoá khi hàm chạy lại ở mốc 250ms)
        var dangChon = $('#' + o.xa).val() || '';
        var conHopLe = con.some(function (c) { return c.ID === dangChon; });
        edu.system.loadToCombo_data({
            data: con,
            renderInfor: { id: 'ID', parentId: '', name: 'TEN', code: '', default_val: conHopLe ? dangChon : '' },
            renderPlace: [o.xa], type: '', title: 'Chọn phường/xã'
        });
        $('#' + o.xa).prop('disabled', false);
    };

    /*------------------------------------------
    -- Đánh dấu người dùng ĐÃ TỰ TAY đụng vào cụm địa chỉ.
    -- Cần để phân biệt 2 trường hợp ô trống trông y hệt nhau lúc lưu:
    --   a) form chưa nạp kịp     → phải GIỮ giá trị cũ, không thì mất dữ liệu
    --   b) user cố ý xoá lựa chọn → phải GHI RỖNG, không thì xoá mãi không được
    -- Các ô này là <select> thường (không select2) nên phân biệt bằng originalEvent:
    -- .trigger('change') trong code không có originalEvent, người dùng bấm chọn thì có.
    -- Vẫn bắt thêm sự kiện select2 phòng khi về sau có gắn select2 vào modal.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeBindAddrTouched = function () {
        var dx = this;
        var danhDau = function () { $(this).attr('data-user-touched', '1'); };
        Object.keys(_ZE_O).forEach(function (kind) {
            var o = _ZE_O[kind];
            // Người dùng vừa đụng cụm nào thì lấy cụm đó điền sang địa chỉ hoá đơn.
            // setTimeout 0 để chờ cascade đổ xong Huyện/Xã rồi mới ghép chuỗi.
            var dienSangHD = function () {
                setTimeout(function () { dx._zeAutoFillHoaDon(kind); }, 0);
            };
            ['tinh', 'huyen', 'xa'].forEach(function (cap) {
                $('#' + o[cap]).off('.zetouch')
                    .on('change.zetouch', function (e) {
                        if (!e || !e.originalEvent) return;   // code tự set, không phải user
                        danhDau.call(this); dienSangHD();
                    })
                    .on('select2:select.zetouch select2:clear.zetouch select2:unselect.zetouch',
                        function () { danhDau.call(this); dienSangHD(); });
            });
            $('#' + o.line).off('.zetouch').on('input.zetouch',
                function () { danhDau.call(this); dienSangHD(); });
            // genDropTinhThanh đổ option ở handler khác → đợi nó xong rồi mới xét tỉnh
            // 2 cấp. Chạy ở 2 mốc cho chắc vì nguồn data có thể async.
            $('#' + o.tinh).off('.zecap').on('change.zecap', function () {
                setTimeout(function () { dx._zeApply2Cap(o); }, 0);
                setTimeout(function () { dx._zeApply2Cap(o); }, 250);
            });
        });
        // Gõ vào ô địa chỉ hoá đơn = tự quyết → từ đó không tự điền đè lên nữa
        $('#txtKQ_HD_DiaChi').off('.zetouch').on('input.zetouch', danhDau);
    };

    DeXuatHoSo.prototype._zeClearAddrTouched = function () {
        var ids = [];
        Object.keys(_ZE_O).forEach(function (kind) {
            var o = _ZE_O[kind];
            ids.push('#' + o.tinh, '#' + o.huyen, '#' + o.xa, '#' + o.line);
        });
        ids.push('#txtKQ_HD_DiaChi');
        $(ids.join(',')).removeAttr('data-user-touched').removeAttr('data-ze-auto');
        $('#' + _ZE_O.NS.huyen + ',#' + _ZE_O.HK.huyen).removeAttr('data-2cap');
    };

    /*------------------------------------------
    -- Tự điền "Địa chỉ trên hoá đơn" theo cụm địa chỉ vừa chọn, cho đỡ gõ lại.
    -- KHÔNG đè khi: người dùng đã tự sửa ô đó, hoặc ô đang mang giá trị lấy từ DB
    -- (hoá đơn có thể xuất cho đơn vị ở địa chỉ khác nên không được ép đồng bộ).
    -- Giá trị do chính hàm này điền thì được phép cập nhật tiếp.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeAutoFillHoaDon = function (kind) {
        var dx = this;
        var $hd = $('#txtKQ_HD_DiaChi');
        if (!$hd.length || $hd.attr('data-user-touched')) return;
        if (edu.util.checkValue($hd.val()) && !$hd.attr('data-ze-auto')) return;  // giá trị từ DB
        var b = (dx._zeCollectAddrBlocks() || []).filter(function (x) { return x.kind === kind; })[0];
        if (!b || !edu.util.checkValue(b.full)) return;
        edu.util.viewValById('txtKQ_HD_DiaChi', b.full);
        $hd.attr('data-ze-auto', '1');
    };

    /*------------------------------------------
    -- Chụp giá trị 2 cụm địa chỉ từ form NGAY LẬP TỨC (đồng bộ).
    -- Bắt buộc gọi TRƯỚC khi luồng lưu gốc chạy, vì hàm ghi chạy async — lúc
    -- callback về thì form có thể đã bị reset/đóng, đọc ra sẽ toàn rỗng.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeCollectAddrBlocks = function () {
        var g = function (id) { return edu.system.getValById(id) || ''; };
        // Lấy tên option ĐANG CHỌN THẬT. Bám vào value rỗng để nhận ra option
        // placeholder, không so khớp chữ: bỏ dấu thì "Chơn Thành" cũng thành
        // "Chon..." và sẽ bị loại nhầm cùng với "-- Chọn --".
        var txt = function (id, val) {
            return val ? ($('#' + id + ' option:selected').text() || '').trim() : '';
        };
        var cham = function (id) { return !!$('#' + id).attr('data-user-touched'); };
        var build = function (kind) {
            var o = _ZE_O[kind];
            var b = {
                kind: kind,
                tinh: g(o.tinh), huyen: g(o.huyen), xa: g(o.xa), line: g(o.line)
            };
            // Chạm vào bất kỳ ô nào của cụm = user đang chủ động sửa cụm này. Gom chung
            // vì xoá Tỉnh sẽ khiến cascade tự dọn Huyện/Xã bằng code — 2 ô đó không được
            // đánh dấu nhưng vẫn phải coi là user cố ý xoá.
            b.daCham = cham(o.tinh) || cham(o.huyen) || cham(o.xa);
            b.chamLine = cham(o.line);
            b.full = [b.line, txt(o.xa, b.xa), txt(o.huyen, b.huyen), txt(o.tinh, b.tinh)]
                .filter(function (x) { return x; }).join(', ');
            return b;
        };
        // Giữ cụm có nhập, HOẶC cụm user vừa xoá sạch (phải gửi đi để ghi rỗng).
        // Cụm vừa trống vừa không ai đụng vào thì bỏ qua, không chạm bản ghi cũ.
        return [build('NS'), build('HK')].filter(function (b) {
            return b.tinh || b.xa || b.line || b.daCham || b.chamLine;
        });
    };

    /*------------------------------------------
    -- Ghi 2 cụm địa chỉ xuống PERSON_ADDRESS.
    -- Đã có bản ghi cùng loại → Upd_Person_Address, chưa có → Ins_Person_Address.
    -- blocks: kết quả _zeCollectAddrBlocks() chụp trước đó.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeSaveAddress = function (personId, blocks) {
        var dx = this;
        blocks = blocks || [];
        if (!edu.util.checkValue(personId) || !blocks.length) return;
        dx._zeEnsureAddrTypeDM(function () {
            var thieu = blocks.filter(function (b) { return !dx._zeAddrTypeId(b.kind); })
                .map(function (b) { return b.kind === 'NS' ? 'Nơi sinh' : 'Hộ khẩu thường trú'; });
            if (thieu.length) {
                console.warn('[ZE Address] Danh mục "Loại địa chỉ" '
                    + '(PERSON_ADDRESS.ADDRESS_TYPE_CODE) chưa khai báo: ' + thieu.join(', ')
                    + ' → không ghi xuống được.');
            }
            dx._zeGetAddrList(personId, function (rows) {
                blocks.forEach(function (b) {
                    var typeId = dx._zeAddrTypeId(b.kind);
                    if (!typeId) return;
                    var old = rows.filter(function (r) { return r.ADDRESS_TYPE_CODE === typeId; })[0];
                    var isUpd = !!(old && old.ID);
                    var id = ((isUpd ? old.ID : edu.util.uuid()) + '').toUpperCase();
                    // Chống ghi đè rỗng. Cụm địa chỉ được giữ lại khi CHỈ CẦN tỉnh hoặc số
                    // nhà có giá trị (xem _zeCollectAddrBlocks), nên nếu form chưa kịp nạp
                    // Huyện/Xã mà user bấm Lưu thì ghi thẳng b.huyen/b.xa xuống sẽ XOÁ
                    // TRẮNG dữ liệu đang có. Ô nào trống thì giữ nguyên giá trị cũ.
                    var giu = function (moi, cu, daCham) {
                        if (edu.util.checkValue(moi)) return moi;
                        if (daCham) return '';              // user chủ động xoá → ghi rỗng
                        return isUpd ? (cu || '') : '';     // form chưa nạp → giữ nguyên
                    };
                    var payload = {
                        'action': isUpd ? _ZE_ADDR_UPD : _ZE_ADDR_INS,
                        'func': 'PKG_CORE_HOSONHANSU_06.' + (isUpd ? 'Upd_Person_Address' : 'Ins_Person_Address'),
                        'iM': edu.system.iM,
                        'Id': id,
                        'strId': id,
                        'strChucNang_Id': edu.system.strChucNang_Id,
                        'strVaiTro_Id': '',
                        'strPerson_Id': personId,
                        'strAddress_Type_Code': typeId,
                        'strAddress_Status_Code': '',
                        'strCountry_Id': '',
                        'strProvince_Id': giu(b.tinh, old && old.PROVINCE_ID, b.daCham),
                        'strDistrict_Id': giu(b.huyen, old && old.DISTRICT_ID, b.daCham),
                        'strWard_Id': giu(b.xa, old && old.WARD_ID, b.daCham),
                        'strAddress_Line1': giu(b.line, old && old.ADDRESS_LINE1, b.chamLine),
                        'strAddress_Line2': '',
                        'strFull_Address': giu(b.full, old && old.FULL_ADDRESS, b.daCham || b.chamLine),
                        'strPostal_Code': '',
                        // Hộ khẩu thường trú là địa chỉ chính; d* là NUMBER nên gửi số, không gửi ''
                        'dIs_Primary': (b.kind === 'HK') ? 1 : 0,
                        'dIs_Verified': 0,
                        'dIs_Active': 1,
                        'strEffective_From': '',
                        'strEffective_To': '',
                        'strNote': '',
                        'strNguoiThucHien_Id': edu.system.userId
                    };
                    edu.system.makeRequest({
                        success: function (data) {
                            if (data && !data.Success) console.warn('[ZE Address] fail:', data.Message);
                        },
                        error: function (er) { console.warn('[ZE Address] err:', er); },
                        type: 'POST',
                        contentType: true,
                        action: payload.action,
                        data: payload,
                        fakedb: []
                    }, false, false, false, null);
                });
            });
        });
    };

    /*------------------------------------------
    -- Nạp 2 cụm địa chỉ lên form khi mở modal.
    -- Get_Person_Address chỉ chắc chắn trả PROVINCE_ID + WARD_ID; DISTRICT_ID có
    -- thì dùng, không có mới tra ngược từ Xã (xem _zeFillDiaChi).
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeLoadAddress = function (personId) {
        var dx = this;
        if (!edu.util.checkValue(personId)) return;
        dx._zeEnsureAddrTypeDM(function () {
            dx._zeGetAddrList(personId, function (rows) {
                if (!rows.length) return;
                var pick = function (kind) {
                    var typeId = dx._zeAddrTypeId(kind);
                    var found = typeId && rows.filter(function (it) {
                        return it.ADDRESS_TYPE_CODE === typeId;
                    })[0];
                    if (found) return found;
                    // Danh mục chưa có mục tương ứng → đoán theo tên loại trả kèm bản ghi
                    var rx = (kind === 'NS') ? /NOI SINH|BIRTH/ : /HO KHAU|THUONG TRU|PERMANENT/;
                    return rows.filter(function (it) {
                        return rx.test(_zeStrip(it.ADDRESS_TYPE_CODE_NAME || it.ADDRESS_TYPE_NAME || ''));
                    })[0];
                };
                var noiSinh = pick('NS');
                var hoKhau = pick('HK');
                // Không phân loại được mà chỉ có 1 dòng → coi là hộ khẩu thường trú
                if (!noiSinh && !hoKhau && rows.length === 1) hoKhau = rows[0];
                var huyenCua = function (r) {
                    return r.DISTRICT_ID || r.QUANHUYEN_ID || r.HUYEN_ID || '';
                };
                if (noiSinh) {
                    dx._zeFillDiaChi(_ZE_O.NS, noiSinh.PROVINCE_ID, huyenCua(noiSinh),
                        noiSinh.WARD_ID, noiSinh.ADDRESS_LINE1);
                }
                if (hoKhau) {
                    dx._zeFillDiaChi(_ZE_O.HK, hoKhau.PROVINCE_ID, huyenCua(hoKhau),
                        hoKhau.WARD_ID, hoKhau.ADDRESS_LINE1);
                }
            });
        });
    };

    // --- Móc vào luồng mở modal: _loadTabInfoExtras xoá trắng 8 ô địa chỉ (đồng bộ,
    // --- ngay đầu hàm) nên nạp lại NGAY SAU khi gọi bản gốc là an toàn.
    if (DeXuatHoSo.prototype._loadTabInfoExtras) {
        var _origLoadTabInfo = DeXuatHoSo.prototype._loadTabInfoExtras;
        DeXuatHoSo.prototype._loadTabInfoExtras = function (personId) {
            var dx = this;
            _origLoadTabInfo.call(dx, personId);
            dx._zeClearAddrTouched();
            dx._zeBindAddrTouched();
            dx._zeLoadAddress(personId);
        };
    }

    // --- Móc vào luồng Lưu: chụp form ĐỒNG BỘ trước khi bản gốc chạy, rồi mới ghi.
    if (DeXuatHoSo.prototype.save_DeXuatHoSo && !DeXuatHoSo.prototype._addrChainHooked) {
        DeXuatHoSo.prototype._addrChainHooked = true;
        var _prevSaveDX = DeXuatHoSo.prototype.save_DeXuatHoSo;
        DeXuatHoSo.prototype.save_DeXuatHoSo = function () {
            var dx = this;
            // try/catch: chụp form phải chạy TRƯỚC bản gốc, nên nếu ở đây ném lỗi thì
            // cả lần lưu chết câm. Địa chỉ hỏng thì bỏ địa chỉ, không được kéo theo
            // phần lưu chính.
            var blocks = null;
            try { blocks = dx._zeCollectAddrBlocks(); } catch (e) { console.warn('[ZE Address] collect err:', e); }
            var personId = dx.strDeXuatHoSo_Id || dx._lockedPersonId || '';
            _prevSaveDX.call(dx);
            if (!blocks || !blocks.length) return;
            setTimeout(function () {
                try {
                    dx._zeSaveAddress(dx.strDeXuatHoSo_Id || dx._lockedPersonId || personId, blocks);
                } catch (e) { console.warn('[ZE Address] save err:', e); }
            }, 300);
        };
    }
}

/*==============================================================================
== TAB XUẤT HOÁ ĐƠN — 3 lỗi lưu, vá cho khớp với kehoachtuyensinhnew.js
== (2026-09-11)
==
== 1) "Họ tên người mua hàng" (txtKQ_HD_NguoiMua) được đọc lên để xét hasData
==    rồi VỨT ĐI — payload Them_/Sua_PersonInvoiceInfo không có param nào chứa
==    nó. Bảng PERSON_INVOICE_INFO chỉ có BUYER_NAME nên bên tuyển sinh gửi
==    "strBuyer_Name = tên đơn vị HOẶC họ tên người mua"; làm y như vậy.
==
== 2) Cụm "Thông tin thanh toán" (5 ô ngân hàng) CHỈ được nạp lên bằng
==    Get_Person_Bank_Account, không có chỗ nào ghi xuống → nhập xong mất trắng.
==
== 3) _currentInvoiceId / _currentBankId không gắn với hồ sơ nào. Mở hồ sơ A
==    (đã có hoá đơn) rồi chuyển sang hồ sơ B (chưa có) thì 2 biến này VẪN GIỮ
==    id của A → bấm Lưu chạy Sua_PersonInvoiceInfo và GHI ĐÈ dữ liệu của B lên
==    bản ghi của A. Xoá sạch mỗi lần mở hồ sơ khác là hết.
==============================================================================*/
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._zeXhdHooked) {
    DeXuatHoSo.prototype._zeXhdHooked = true;

    // Lấy nguyên của dexuathoso.js (_loadXHD_Section + save_TaiKhoanNH) — không tự bịa
    var _ZE_BANK_GET = 'NS_HoSoNhanSu6_MH/BiQ1HhEkMzIuLx4DIC8qHgAiIi40LzUP';
    var _ZE_BANK_INS = 'NS_HoSoNhanSu6_MH/CC8yHhEkMzIuLx4DIC8qHgAiIi40LzUP';
    var _ZE_BANK_UPD = 'NS_HoSoNhanSu6_MH/FDElHhEkMzIuLx4DIC8qHgAiIi40LzUP';

    /*------------------------------------------
    -- (1) Bridge "Họ tên người mua" sang ô Tên đơn vị ngay trước khi bản gốc đọc
    -- form, rồi trả lại nguyên trạng. Cùng kiểu với _bridgeLienHeToShadow /
    -- _bridgeCccdToShadow đang dùng trong file này — giữ được bản gốc, sếp cập
    -- nhật dexuathoso.js sau này cũng không đụng độ.
    -------------------------------------------*/
    if (DeXuatHoSo.prototype.save_PersonInvoice) {
        var _origSaveInv = DeXuatHoSo.prototype.save_PersonInvoice;
        DeXuatHoSo.prototype.save_PersonInvoice = function () {
            var $don = $('#txtKQ_HD_TenDonVi');
            var nguoiMua = (($('#txtKQ_HD_NguoiMua').val() || '') + '').trim();
            var cu = ($don.val() || '') + '';
            var daMuon = false;
            if (!cu.trim() && nguoiMua) { $don.val(nguoiMua); daMuon = true; }
            try { _origSaveInv.call(this); }
            finally { if (daMuon) $don.val(cu); }
        };
    }

    /*------------------------------------------
    -- (2) Chụp cụm Thanh toán khỏi form (đồng bộ) — phải gọi TRƯỚC luồng lưu gốc.
    -- Cả 5 ô đều trống → trả null để không tạo dòng ngân hàng rỗng, và cũng là
    -- cách tránh ghi đè khi form chưa kịp nạp xong.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeCollectBank = function () {
        var g = function (id) { return ((edu.system.getValById(id) || '') + '').trim(); };
        var b = {
            loai: g('ddlKQ_HD_HinhThucTT'),
            nganHang: g('txtKQ_HD_NganHang'),
            soTK: g('txtKQ_HD_SoTK'),
            chuTK: g('txtKQ_HD_ChuTK'),
            ghiChu: g('txtKQ_HD_GhiChu')
        };
        return (b.loai || b.nganHang || b.soTK || b.chuTK || b.ghiChu) ? b : null;
    };

    /*------------------------------------------
    -- Ghi cụm Thanh toán xuống PERSON_BANK_ACCOUNT.
    -- Đã có bản ghi (_currentBankId của ĐÚNG người này) → Upd, chưa có → Ins.
    -- Các cột không có ô nhập trên modal (chi nhánh, loại tiền, ngày hiệu lực...)
    -- giữ nguyên giá trị cũ, không ghi rỗng đè lên.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeSaveBank = function (personId, b) {
        var dx = this;
        if (!edu.util.checkValue(personId) || !b) return;
        var oldId = (dx._zeXhdPersonId === personId) ? (dx._currentBankId || '') : '';
        var old = (dx._zeBankRow && dx._zeXhdPersonId === personId) ? dx._zeBankRow : {};
        var isUpd = !!(oldId && (oldId + '').length === 32);
        var giu = function (v) { return edu.util.checkValue(v) ? v : ''; };
        var so = function (v, mac) {
            var n = Number(v);
            return (v === null || v === undefined || v === '' || isNaN(n)) ? mac : n;
        };
        var payload = {
            'action': isUpd ? _ZE_BANK_UPD : _ZE_BANK_INS,
            'func': 'PKG_CORE_HOSONHANSU_06.' + (isUpd ? 'Upd_Person_Bank_Account' : 'Ins_Person_Bank_Account'),
            'iM': edu.system.iM,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strVaiTro_Id': '',
            'strPerson_Id': personId,
            'strAccount_Type_Code': b.loai,
            'strAccount_Status_Code': giu(old.ACCOUNT_STATUS_CODE),
            'strBank_Id': giu(old.BANK_ID),
            'strBank_Code': giu(old.BANK_CODE),
            'strBank_Name': b.nganHang,
            'strBranch_Id': giu(old.BRANCH_ID),
            'strBranch_Code': giu(old.BRANCH_CODE),
            'strBranch_Name': giu(old.BRANCH_NAME),
            'strAccount_Number': b.soTK,
            'strAccount_Name': b.chuTK,
            'strAccount_Currency_Code': giu(old.ACCOUNT_CURRENCY_CODE),
            // d* là NUMBER bên Oracle → luôn gửi số, không gửi chuỗi rỗng
            'dIs_Primary': so(old.IS_PRIMARY, 1),
            'dIs_Payroll_Default': so(old.IS_PAYROLL_DEFAULT, 0),
            'dIs_Verified': so(old.IS_VERIFIED, 0),
            'dIs_Active': 1,
            'strEffective_From': giu(old.EFFECTIVE_FROM),
            'strEffective_To': giu(old.EFFECTIVE_TO),
            'strNote': b.ghiChu,
            'strNguoiThucHien_Id': edu.system.userId
        };
        if (isUpd) payload.strId = oldId;
        edu.system.makeRequest({
            success: function (data) {
                if (data && data.Success) { if (!isUpd && data.Id) dx._currentBankId = data.Id; }
                else console.warn('[ZE Bank] fail:', data && data.Message);
            },
            error: function (er) { console.warn('[ZE Bank] err:', er); },
            type: 'POST',
            contentType: true,
            action: payload.action,
            data: payload,
            fakedb: []
        }, false, false, false, null);
    };

    /*------------------------------------------
    -- Nạp lại cụm Thanh toán. Bản gốc đã đổ 4 ô text rồi, nhưng ô "Loại tài khoản"
    -- nó chỉ tra theo option[name=MA] — dữ liệu cũ lưu MA thì đúng, dữ liệu mới
    -- (ô này lưu ID danh mục như mọi dropdown khác) thì tra trượt, ô trống hoài.
    -- Ở đây tra cả MA lẫn ID, và chỉ điền khi ô đang trống nên không đè bản gốc.
    -- Tiện thể giữ lại nguyên bản ghi để lúc Upd không ghi rỗng lên các cột
    -- không có ô nhập trên modal.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeLoadBank = function (personId) {
        var dx = this;
        dx._zeBankRow = null;
        if (!edu.util.checkValue(personId)) return;
        edu.system.makeRequest({
            success: function (data) {
                var rows = (data && data.Success && data.Data) || [];
                if (rows && rows.length === undefined) rows = [rows];
                var b = rows.filter(function (r) {
                    return r && r.PERSON_ID == personId && (r.IS_ACTIVE === undefined || r.IS_ACTIVE == 1);
                }).sort(function (x, y) {
                    return (y.IS_PRIMARY == 1 ? 1 : 0) - (x.IS_PRIMARY == 1 ? 1 : 0);
                })[0];
                if (!b) return;
                dx._zeBankRow = b;
                dx._currentBankId = b.ID || '';
                var datLoai = function () {
                    var $d = $('#ddlKQ_HD_HinhThucTT');
                    if (!$d.length || $d.val()) return;               // bản gốc đặt được rồi
                    var ma = b.ACCOUNT_TYPE_CODE;
                    if (!edu.util.checkValue(ma)) return;
                    var opt = document.querySelector('#ddlKQ_HD_HinhThucTT option[name="' + ma + '"]')
                        || document.querySelector('#ddlKQ_HD_HinhThucTT option[data-ma="' + ma + '"]')
                        || document.querySelector('#ddlKQ_HD_HinhThucTT option[value="' + ma + '"]');
                    if (opt && opt.value) $d.val(opt.value).trigger('change');
                };
                datLoai();
                setTimeout(datLoai, 600);
                setTimeout(datLoai, 1600);
            },
            error: function () { },
            type: 'POST',
            contentType: true,
            action: _ZE_BANK_GET,
            data: {
                'action': _ZE_BANK_GET,
                'func': 'PKG_CORE_HOSONHANSU_06.Get_Person_Bank_Account',
                'iM': edu.system.iM,
                'strChucNang_Id': edu.system.strChucNang_Id,
                'strVaiTro_Id': '',
                'strNguoiThucHien_Id': edu.system.userId,
                'strPerson_Id': personId
            },
            fakedb: []
        }, false, false, false, null);
    };

    /*------------------------------------------
    -- (3) Mở hồ sơ nào thì id hoá đơn / ngân hàng phải là của hồ sơ ĐÓ.
    -- Xoá trước khi bản gốc nạp: hồ sơ mới chưa có bản ghi thì 2 biến ở lại rỗng
    -- và luồng lưu tự đi đường Them_, không còn Sua_ nhầm sang hồ sơ trước.
    -------------------------------------------*/
    if (DeXuatHoSo.prototype._loadXHD_Section) {
        var _origLoadXHD = DeXuatHoSo.prototype._loadXHD_Section;
        DeXuatHoSo.prototype._loadXHD_Section = function (personId) {
            var dx = this;
            dx._currentInvoiceId = '';
            dx._currentBankId = '';
            dx._zeBankRow = null;
            dx._zeXhdPersonId = personId || '';
            _origLoadXHD.call(dx, personId);
            dx._zeLoadBank(personId);
            dx._zeSuaPlaceholderXHD();
        };
    }

    /*------------------------------------------
    -- 2 combo của tab Xuất hoá đơn gọi loadToCombo_DanhMucDuLieu mà KHÔNG truyền
    -- tham số thứ 5 (tiêu đề), nên dòng placeholder hiện thẳng mã bảng danh mục:
    -- "Chọn ts.doituonghoadon", "Chọn person_bank_account.account_type_code".
    -- Chỉ sửa chữ hiển thị của option rỗng, không đụng tới danh sách phía dưới.
    -- Chạy ở nhiều mốc vì danh mục nạp bất đồng bộ.
    -------------------------------------------*/
    DeXuatHoSo.prototype._zeSuaPlaceholderXHD = function () {
        var dat = function () {
            [['ddlKQ_HD_DoiTuong', '-- Chọn đối tượng --'],
            ['ddlKQ_HD_HinhThucTT', '-- Chọn loại tài khoản --']].forEach(function (c) {
                var o = document.querySelector('#' + c[0] + ' option[value=""]');
                if (o && o.textContent !== c[1]) o.textContent = c[1];
            });
        };
        dat();
        setTimeout(dat, 400);
        setTimeout(dat, 1200);
        setTimeout(dat, 2500);
    };

    // --- Móc vào luồng Lưu: chụp cụm ngân hàng ĐỒNG BỘ rồi ghi sau khi CorePerson xong.
    if (DeXuatHoSo.prototype.save_DeXuatHoSo && !DeXuatHoSo.prototype._bankChainHooked) {
        DeXuatHoSo.prototype._bankChainHooked = true;
        var _prevSaveBank = DeXuatHoSo.prototype.save_DeXuatHoSo;
        DeXuatHoSo.prototype.save_DeXuatHoSo = function () {
            var dx = this;
            // try/catch: xem chú thích cùng loại ở wrapper địa chỉ phía trên
            var bank = null;
            try { bank = dx._zeCollectBank(); } catch (e) { console.warn('[ZE Bank] collect err:', e); }
            var personId = dx.strDeXuatHoSo_Id || dx._lockedPersonId || '';
            _prevSaveBank.call(dx);
            if (!bank) return;
            setTimeout(function () {
                try {
                    dx._zeSaveBank(dx.strDeXuatHoSo_Id || dx._lockedPersonId || personId, bank);
                } catch (e) { console.warn('[ZE Bank] save err:', e); }
            }, 350);
        };
    }
}

/*==============================================================================
== BẤM LƯU MÀ KHÔNG CÓ GÌ XẢY RA — CHỐT AN TOÀN (2026-09-11)
==
== Chuỗi lưu gốc KHÔNG gọi thẳng save_DeXuatHoSo. Nó đi đường vòng:
==   btnSave → genHTML_Progress('zoneprocessXXXX', N)   (vẽ thanh tiến trình
==             vào trong modal thông báo #myModalAlert)
==           → N lần save_KiemTraDinhDanh / save_KiemTraLienHe
==           → mỗi lần gọi start_Progress(...) đếm lên 1
==           → đếm đủ N mới chạy callback = save_DeXuatHoSo()
==
== start_Progress (Corei/systemroot.js:6795) đếm như sau:
==   var x     = $('#zoneprocessXXXX #zonepercentInDS');
==   var iDem  = parseInt(x.attr('title')) + 1;
==   var iTotal= x.attr('name');
==   if (iDem == iTotal) { callback(); }
==
== Nếu thanh tiến trình KHÔNG có trong DOM (modal thông báo chưa mở kịp, bị
== modal khác chồng lên làm đóng, hoặc #alert_content bị ghi đè) thì:
==   parseInt(undefined) + 1 = NaN,  iTotal = undefined,  NaN == undefined = false
== → luôn rơi vào nhánh else, callback KHÔNG BAO GIỜ chạy, và tuyệt nhiên không
== có lỗi nào hiện ra. Người dùng bấm Lưu, form im lặng, mở lại thì trắng trơn.
==
== Chốt này KHÔNG đoán mò theo thời gian: nó kiểm tra đúng điều kiện hỏng — sau
== 600ms mà thanh tiến trình không tồn tại và save_DeXuatHoSo cũng chưa được gọi
== thì gọi thẳng 1 lần. Chuỗi gốc chạy bình thường thì chốt tự im.
== save_DeXuatHoSo vẫn tự chặn bằng `if (!me.icheck) return;` nên trường hợp
== trùng định danh vẫn không lưu — chốt này không phá validate.
==============================================================================*/
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._zeSaveWatchdogHooked) {
    DeXuatHoSo.prototype._zeSaveWatchdogHooked = true;

    // Đánh dấu chuỗi gốc đã chạy tới nơi
    var _prevSaveWD = DeXuatHoSo.prototype.save_DeXuatHoSo;
    DeXuatHoSo.prototype.save_DeXuatHoSo = function () {
        this._zeDaGoiSave = true;
        _prevSaveWD.call(this);
    };

    // mousedown chứ không phải click: phải đặt lại cờ TRƯỚC khi handler lưu chạy,
    // vì có nhánh gọi save_DeXuatHoSo đồng bộ ngay trong click.
    $(document).on('mousedown.zesavewd', '#btnSave_DeXuatHoSo', function () {
        var dx = (window.main_doc && window.main_doc.DeXuatHoSo) || null;
        if (!dx || typeof dx.save_DeXuatHoSo !== 'function') return;
        dx._zeDaGoiSave = false;
        // Không có loại định danh/liên hệ nào → chuỗi gốc đi nhánh hỏi xác nhận
        // ("Chưa có thông tin định danh. Bạn có muốn lưu không?"). Để người dùng
        // tự quyết, chốt không được tự lưu thay.
        var soLoai = (dx.dtLoaiDinhDanh || []).length + (dx.dtLoaiLienHe || []).length;
        if (!soLoai) return;
        clearTimeout(dx._zeSaveWDTimer);
        dx._zeSaveWDTimer = setTimeout(function () {
            if (dx._zeDaGoiSave) return;   // chuỗi gốc đã lưu rồi
            // Thanh tiến trình còn đó = chuỗi gốc đang chạy đúng, cứ để nó lo
            if (document.querySelector('#zoneprocessXXXX #zonepercentInDS')) return;
            dx.save_DeXuatHoSo();
        }, 600);
    });
}

/*==============================================================================
== TÁCH HOÁ ĐƠN / NGÂN HÀNG / ĐỊA CHỈ RA LƯU ĐỘC LẬP  (2026-09-11)
==
== Đây là khác biệt CỐT LÕI giữa trang này và kehoachtuyensinhnew.js, và là lý do
== "2 form giống hệt nhau mà bên kia lưu được, bên này không".
==
== Bên tuyển sinh: mỗi cụm tự gọi API của nó, không phụ thuộc nhau.
== Bên này: save_PersonInvoice bị chôn BÊN TRONG success của CorePerson
==          (dexuathoso.js:1012), mà CorePerson lại phải đi qua chuỗi
==          genHTML_Progress → start_Progress → callback. Chỉ cần một mắt xích
==          trong đó tắc là hoá đơn + ngân hàng + địa chỉ chết theo, dù người
==          dùng chỉ nhập đúng 2 ô của tab Xuất hoá đơn.
==
== Cách xử lý: bấm Lưu là chụp form ngay, rồi tự gọi thẳng 3 hàm lưu đó — không
== chờ CorePerson. Phần lưu Thông tin cơ bản vẫn chạy đường cũ của nó.
==
== Chống lưu 2 lần: mỗi lần bấm Lưu là 1 "lượt". Ba hàm lưu được bọc lại để mỗi
== lượt chỉ chạy đúng 1 lần — đường nào tới trước thì thắng, đường sau tự bỏ qua.
== Nhờ vậy chuỗi gốc chạy được hay không thì kết quả vẫn là lưu đúng 1 lần.
==============================================================================*/
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype._zeLuuDocLapHooked) {
    DeXuatHoSo.prototype._zeLuuDocLapHooked = true;

    // --- Bọc chống chạy trùng trong cùng 1 lượt bấm Lưu ---
    ['_zeSaveAddress', '_zeSaveBank', 'save_PersonInvoice'].forEach(function (ten) {
        var goc = DeXuatHoSo.prototype[ten];
        if (typeof goc !== 'function') return;
        var co = '_zeLuotCua_' + ten;
        DeXuatHoSo.prototype[ten] = function () {
            var luot = this._zeLuotLuu || 0;
            if (this[co] === luot) return;          // lượt này đã chạy rồi
            this[co] = luot;
            return goc.apply(this, arguments);
        };
    });

    // --- Đường lưu độc lập, không qua CorePerson ---
    $(document).on('mousedown.zeluudoclap', '#btnSave_DeXuatHoSo', function () {
        var dx = (window.main_doc && window.main_doc.DeXuatHoSo) || null;
        if (!dx) return;
        dx._zeLuotLuu = (dx._zeLuotLuu || 0) + 1;

        // Chụp form NGAY (đồng bộ) — 500ms nữa form có thể đã bị reset/đóng
        var pid = dx.strDeXuatHoSo_Id || dx._lockedPersonId || '';
        var blocks = null, bank = null;
        try { blocks = dx._zeCollectAddrBlocks(); } catch (e) { console.warn('[ZE] collect addr:', e); }
        try { bank = dx._zeCollectBank(); } catch (e) { console.warn('[ZE] collect bank:', e); }

        clearTimeout(dx._zeLuuTimer);
        dx._zeLuuTimer = setTimeout(function () {
            var id = dx.strDeXuatHoSo_Id || dx._lockedPersonId || pid;
            if (!id) { console.warn('[ZE] không có Person_Id → bỏ qua lưu phụ thuộc'); return; }
            // Mỗi cụm bọc try riêng: cụm này lỗi không được kéo 2 cụm kia chết theo
            try { if (blocks && blocks.length) dx._zeSaveAddress(id, blocks); } catch (e) { console.warn('[ZE] save addr:', e); }
            try { if (bank) dx._zeSaveBank(id, bank); } catch (e) { console.warn('[ZE] save bank:', e); }
            try { if (typeof dx.save_PersonInvoice === 'function') dx.save_PersonInvoice(); } catch (e) { console.warn('[ZE] save invoice:', e); }
        }, 500);
    });
}



