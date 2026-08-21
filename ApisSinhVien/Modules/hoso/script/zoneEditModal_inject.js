/*----------------------------------------------
-- zoneEditModal_inject.js (2026-08-21)
-- Tự động inject modal #zoneEdit (Chỉnh sửa - Hồ sơ đề xuất, 3 tabs) + CSS vào page.
-- Idempotent: nếu #zoneEdit đã có trong DOM thì bỏ qua (case: hoso_taomoi.html có sẵn inline).
-- Dùng cho các trang muốn mở modal chỉnh sửa hồ sơ từ dexuathoso.js openEditByPerson().
----------------------------------------------*/
(function () {
    if (document.getElementById('zoneEdit')) return;
    // Inline mode nếu page có `<div id="zeInlineHost">` — render trực tiếp vào đó, không overlay
    var inlineHost = document.getElementById('zeInlineHost');

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
            '<div class="nav-content-left"><p class="link"><a><span class="zeIcon"><i class="fa-regular fa-file-circle-question fw-bold"></i></span> Chỉnh sửa - Hồ sơ đề xuất</a></p></div>' +
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
                        '<div class="aps-sv-field"><label class="aps-sv-label">Số CCCD</label><div class="aps-sv-input-icon"><i class="fa-light fa-hashtag"></i><input class="aps-sv-input" id="txtCCCD_So" placeholder="12 chữ số"></div></div>' +
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
        // Ẩn các sibling khác của host (form cũ của trang)
        var sib = inlineHost.parentNode ? inlineHost.parentNode.children : [];
        for (var i = 0; i < sib.length; i++) {
            if (sib[i] !== inlineHost) sib[i].style.display = 'none';
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
})();

/*==============================================================================
== Patch DeXuatHoSo.prototype nếu server còn dexuathoso.js cũ (2026-08-21)
== Cho phép mọi trang chỉ cần include dexuathoso.js + zoneEditModal_inject.js
==============================================================================*/
if (typeof DeXuatHoSo === 'function' && !DeXuatHoSo.prototype.openEditByPerson) {
    DeXuatHoSo.prototype.openEditByPerson = function (person) {
        var dx = this;
        if (!person || !person.id) return;
        dx.strDeXuatHoSo_Id = person.id;
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
                edu.util.viewValById("ddlKQ_HD_HinhThucTT", b.ACCOUNT_TYPE_CODE);
                edu.util.viewValById("txtKQ_HD_NganHang", b.BANK_NAME);
                edu.util.viewValById("txtKQ_HD_SoTK", b.ACCOUNT_NUMBER);
                edu.util.viewValById("txtKQ_HD_ChuTK", b.ACCOUNT_NAME);
                edu.util.viewValById("txtKQ_HD_GhiChu", b.NOTE);
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
            (dx.dtLienHe || []).forEach(function (item) {
                var typeName = ((item.CONTACT_TYPE_CODE_NAME || item.CONTACT_TYPE_NAME || '') + '').toLowerCase();
                var typeMa = ((item.CONTACT_TYPE_CODE_MA || item.MA || '') + '').toUpperCase();
                var val = item.CONTACT_VALUE || item.VALUE || '';
                if (typeMa === 'EMAIL' || typeName.indexOf('mail') > -1) edu.util.viewValById('txtEmailCaNhan', val);
                else if (typeMa === 'PHONE' || typeMa === 'MOBILE' || typeName.indexOf('điện thoại') > -1 || typeName.indexOf('phone') > -1) edu.util.viewValById('txtDienThoai', val);
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
