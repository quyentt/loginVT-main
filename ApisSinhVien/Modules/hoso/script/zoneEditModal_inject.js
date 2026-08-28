/*----------------------------------------------
-- zoneEditModal_inject.js (2026-08-21)
-- Tự động inject modal #zoneEdit (Chỉnh sửa - Hồ sơ đề xuất, 3 tabs) + CSS vào page.
-- Idempotent: nếu #zoneEdit đã có trong DOM thì bỏ qua (case: hoso_taomoi.html có sẵn inline).
-- Dùng cho các trang muốn mở modal chỉnh sửa hồ sơ từ dexuathoso.js openEditByPerson().
----------------------------------------------*/
function _zeDoInject(forceOverlay) {
    if (document.getElementById('zoneEdit')) { console.log('[ZE-Inject] skip: #zoneEdit exists'); return; }
    // Inline mode nếu page có `<div id="zeInlineHost">` — render trực tiếp vào đó, không overlay
    var inlineHost = document.getElementById('zeInlineHost');
    console.log('[ZE-Inject] running, inlineHost=', inlineHost ? 'FOUND' : 'not found', ', forceOverlay=', !!forceOverlay);
    if (!inlineHost && !forceOverlay) { return; } // Chưa có host, defer retry — không fallback overlay ngay

    var css = ''
        + '#zoneEdit.fake-modal{position:fixed !important;top:24px;left:50%;transform:translateX(-50%);width:96vw;max-width:1500px;max-height:calc(100vh - 48px);overflow-y:auto;overflow-x:hidden;z-index:10050;background:#ffffff;border-radius:12px;box-shadow:0 25px 70px rgba(15,23,42,.4);padding:0 !important;}'
        + 'body.zoneEdit-open::before{content:"";position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:10040;}'
        + 'body.zoneEdit-open{overflow:hidden;}'
        + 'body.zoneEdit-open .select2-container{z-index:10060 !important;}'
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
            console.log('[ZE-Inject] timeout waiting for #zeInlineHost → fallback overlay');
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
    DeXuatHoSo.prototype.save_DeXuatHoSo = function () {
        var me = this;
        _origSaveDX.call(me);
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
    console.warn('[ZE-Inject] DeXuatHoSo.prototype.openEditByPerson patched');
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
