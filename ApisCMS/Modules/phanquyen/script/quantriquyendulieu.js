/*----------------------------------------------
--Author: 
--Date of created: 
--Note: Quản trị quyền dữ liệu theo Cán bộ - Giao diện dạng lưới (CHỈ CÁN BỘ, KHÔNG SINH VIÊN)
----------------------------------------------*/
function QuanTriQuyenDuLieu() { };
QuanTriQuyenDuLieu.prototype = {
    // Dữ liệu
    dsUser: [], // Danh sách cán bộ (không bao gồm sinh viên)
    dsUserFiltered: [], // Danh sách cán bộ sau khi filter
    dsDataTypes: [], // Danh sách loại dữ liệu (Khoa, Chương trình, Lớp, Hệ đào tạo...)
    dsDataItems: {}, // Chi tiết từng loại dữ liệu {KHOA: [...], CHUONGTRINH: [...], ...}
    dsPermissions: [], // Quyền hiện tại từ DB
    dsFunctions: [], // Danh sách function có thể phân quyền
    
    // Pagination
    currentPage: 1,
    pageSize: 20,
    totalRecords: 0,
    totalPages: 0,
    
    // Filter
    currentFilters: {
        tuKhoa: '',
        khoaId: '',
        chucVuId: '',
        trangThai: ''
    },
    
    init: function () {
        var me = this;
        me.page_load();
        me.bindEvents();
    },
    
    page_load: function () {
        var me = this;
        me.showLoading(true);
        
        // Load dữ liệu song song
        Promise.all([
            me.loadUsers(),
            me.loadDataTypes(),
            me.loadFunctions(),
            me.loadFilterData()
        ]).then(function() {
            me.showLoading(false);
            me.renderGrid();
            me.updateStats();
        }).catch(function(error) {
            me.showLoading(false);
            edu.system.alert("Lỗi tải dữ liệu: " + error);
        });
    },
    
    bindEvents: function () {
        var me = this;
        
        // Tìm kiếm
        $("#btnSearch").click(function () {
            me.applyFilters();
        });
        
        $("#txtSearchUser").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.applyFilters();
            }
        });
        
        // Lưu phân quyền
        $("#btnSavePermissions").click(function () {
            me.savePermissions();
        });
        
        // Chọn/Bỏ chọn tất cả
        $("#btnSelectAll").click(function () {
            me.selectAllCheckboxes(true);
        });
        
        $("#btnDeselectAll").click(function () {
            me.selectAllCheckboxes(false);
        });
        
        // Xuất Excel
        $("#btnExport").click(function () {
            me.exportToExcel();
        });
        
        // Filter change
        $("#ddlKhoa, #ddlChucVu, #ddlTrangThai").change(function () {
            me.applyFilters();
        });
        
        // Page size change
        $("#ddlPageSize").change(function () {
            me.pageSize = parseInt($(this).val());
            me.currentPage = 1;
            me.renderGrid();
        });
    },
    
    /*------------------------------------------
    --Load danh sách User/Cán bộ (CHỈ CÁN BỘ, KHÔNG SINH VIÊN)
    -------------------------------------------*/
    loadUsers: function () {
        var me = this;
        return new Promise(function(resolve, reject) {
            var obj_list = {
                'action': 'NS_HoSo_V2_MH/DSA4BRIPKSAvEjQeCS4SLh43cwPP',
                'func': 'pkg_nhansu_hoso_v2.LayDSNhanSu_HoSo_v2',
                'iM': 'Azz',
                'strTuKhoa': me.currentFilters.tuKhoa,
                'strDaoTao_CoCauToChuc_Id': me.currentFilters.khoaId,
                'strChucVu_Id': me.currentFilters.chucVuId,
                'strTinhTrangNhanSu_Id': me.currentFilters.trangThai,
                'dLaCanBoNgoaiTruong': 0, // Chỉ lấy cán bộ trong trường
                'pageIndex': 1,
                'pageSize': 10000,
                'strChucNang_Id': edu.system.strChucNang_Id,
                'strNguoiThucHien_Id': edu.system.userId
            };
            
            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success) {
                        var allData = data.Data || [];
                        
                        // Lọc chỉ lấy cán bộ, loại bỏ sinh viên
                        // Sinh viên thường có MASO bắt đầu bằng số hoặc không có CHUCVU
                        me.dsUser = allData.filter(function(item) {
                            // Loại bỏ nếu là sinh viên (MASO thường là số thuần túy hoặc bắt đầu bằng số)
                            var maSo = item.MASO || '';
                            var isStudent = /^\d+$/.test(maSo); // Mã toàn số = sinh viên
                            
                            // Chỉ lấy cán bộ (có mã cán bộ dạng chữ + số hoặc có chức vụ)
                            var isStaff = !isStudent || item.CHUCVU_ID || item.CHUCDANH_ID;
                            
                            return isStaff;
                        });
                        
                        me.dsUserFiltered = me.dsUser;
                        me.totalRecords = me.dsUser.length;
                        me.totalPages = Math.ceil(me.totalRecords / me.pageSize);
                        console.log('Đã load ' + me.dsUser.length + ' cán bộ (đã loại bỏ sinh viên)');
                        resolve();
                    } else {
                        reject(data.Message);
                    }
                },
                error: function (er) {
                    reject(JSON.stringify(er));
                },
                type: "GET",
                action: obj_list.action,
                contentType: true,
                data: obj_list
            }, false, false, false, null);
        });
    },
    
    /*------------------------------------------
    --Load các loại dữ liệu cần phân quyền
    -------------------------------------------*/
    loadDataTypes: function () {
        var me = this;
        return new Promise(function(resolve) {
            // Định nghĩa các loại dữ liệu cần phân quyền
            me.dsDataTypes = [
                { ID: 'KHOA', TEN: 'Khoa/Đơn vị', ICON: 'fa-building' },
                { ID: 'HEDAOTAO', TEN: 'Hệ đào tạo', ICON: 'fa-graduation-cap' },
                { ID: 'KHOADAOTAO', TEN: 'Khóa đào tạo', ICON: 'fa-calendar-alt' },
                { ID: 'CHUONGTRINH', TEN: 'Chương trình', ICON: 'fa-book' },
                { ID: 'LOP', TEN: 'Lớp', ICON: 'fa-users' },
                { ID: 'NGANH', TEN: 'Ngành', ICON: 'fa-sitemap' }
            ];
            
            // Load chi tiết từng loại (có thể gọi API riêng cho từng loại)
            // Tạm thời dùng demo data
            me.dsDataItems = {
                'KHOA': [
                    { ID: '1', TEN: 'Khoa CNTT', MA: 'K.CNTT' },
                    { ID: '2', TEN: 'Khoa QTKD', MA: 'K.QTKD' },
                    { ID: '3', TEN: 'Khoa Ngoại ngữ', MA: 'K.NN' }
                ],
                'HEDAOTAO': [
                    { ID: '1', TEN: 'Đại học chính quy', MA: 'DHCQ' },
                    { ID: '2', TEN: 'Văn bằng 2', MA: 'VB2' }
                ],
                'KHOADAOTAO': [
                    { ID: '1', TEN: 'Khóa 2020-2024', MA: 'K2020' },
                    { ID: '2', TEN: 'Khóa 2021-2025', MA: 'K2021' }
                ],
                'CHUONGTRINH': [
                    { ID: '1', TEN: 'Công nghệ thông tin', MA: 'CNTT' },
                    { ID: '2', TEN: 'Quản trị kinh doanh', MA: 'QTKD' }
                ],
                'LOP': [
                    { ID: '1', TEN: 'CNTT01', MA: 'CNTT01' },
                    { ID: '2', TEN: 'QTKD01', MA: 'QTKD01' }
                ],
                'NGANH': [
                    { ID: '1', TEN: 'Công nghệ thông tin', MA: '7480201' },
                    { ID: '2', TEN: 'Quản trị kinh doanh', MA: '7340101' }
                ]
            };
            
            resolve();
        });
    },
    
    /*------------------------------------------
    --Load danh sách Function
    -------------------------------------------*/
    loadFunctions: function () {
        var me = this;
        return new Promise(function(resolve) {
            // Danh sách function có thể phân quyền
            me.dsFunctions = [
                { ID: 'VIEW', TEN: 'Xem' },
                { ID: 'ADD', TEN: 'Thêm' },
                { ID: 'EDIT', TEN: 'Sửa' },
                { ID: 'DELETE', TEN: 'Xóa' },
                { ID: 'EXPORT', TEN: 'Xuất' },
                { ID: 'IMPORT', TEN: 'Nhập' },
                { ID: 'APPROVE', TEN: 'Duyệt' }
            ];
            resolve();
        });
    },
    
    /*------------------------------------------
    --Load dữ liệu cho filter
    -------------------------------------------*/
    loadFilterData: function () {
        var me = this;
        return new Promise(function(resolve) {
            // Load danh sách Khoa
            var htmlKhoa = '<option value="">-- Tất cả --</option>';
            if (me.dsDataItems['KHOA']) {
                me.dsDataItems['KHOA'].forEach(function(item) {
                    htmlKhoa += '<option value="' + item.ID + '">' + item.TEN + '</option>';
                });
            }
            $("#ddlKhoa").html(htmlKhoa);
            
            // Load danh sách Chức vụ (demo)
            var htmlChucVu = '<option value="">-- Tất cả --</option>';
            htmlChucVu += '<option value="1">Giảng viên</option>';
            htmlChucVu += '<option value="2">Trưởng khoa</option>';
            htmlChucVu += '<option value="3">Phó khoa</option>';
            $("#ddlChucVu").html(htmlChucVu);
            
            resolve();
        });
    },
    
    /*------------------------------------------
    --Render Grid
    -------------------------------------------*/
    renderGrid: function () {
        var me = this;
        console.log('========== BẮT ĐẦU RENDER GRID ==========');
        
        // Tính toán phân trang
        me.totalRecords = me.dsUserFiltered.length;
        me.totalPages = Math.ceil(me.totalRecords / me.pageSize);
        
        // Đảm bảo currentPage hợp lệ
        if (me.currentPage > me.totalPages && me.totalPages > 0) {
            me.currentPage = me.totalPages;
        }
        if (me.currentPage < 1) {
            me.currentPage = 1;
        }
        
        // Render Header
        me.renderHeader();
        
        // Render Body
        me.renderBody();
        
        // Render Pagination
        me.renderPagination();
        
        console.log('========== KẾT THÚC RENDER GRID ==========');
    },
    
    /*------------------------------------------
    --Render Header
    -------------------------------------------*/
    renderHeader: function () {
        var me = this;
        var html = '<tr>';
        
        // Cột đầu tiên: Cán bộ
        html += '<th style="position: sticky; left: 0; z-index: 12;">';
        html += '<i class="fa-solid fa-user-tie"></i> Cán bộ';
        html += '</th>';
        
        // Các cột loại dữ liệu
        me.dsDataTypes.forEach(function(dataType, index) {
            html += '<th class="select-all-col" data-col-index="' + (index + 1) + '" data-type="' + dataType.ID + '">';
            html += '<div class="header-content">';
            html += '<div class="header-title">';
            html += '<i class="fa-solid ' + dataType.ICON + '"></i> ' + dataType.TEN;
            html += '</div>';
            html += '<input type="checkbox" class="chkSelectAllCol" title="Chọn tất cả cột này"/>';
            html += '</div>';
            html += '</th>';
        });
        
        html += '</tr>';
        $("#tblPhanQuyenDuLieu thead").html(html);
        
        // Bind event cho checkbox select all column
        $(".chkSelectAllCol").click(function(e) {
            e.stopPropagation();
            var checked = this.checked;
            var colIndex = $(this).parent().parent().parent().data("col-index");
            
            $("#tblPhanQuyenDuLieu tbody tr").each(function() {
                $(this).find("td").eq(colIndex).find(".permission-checkbox").prop("checked", checked);
            });
            
            me.updateStats();
        });
    },
    
    /*------------------------------------------
    --Render Body
    -------------------------------------------*/
    renderBody: function () {
        var me = this;
        var html = '';
        
        // Tính toán dữ liệu cho trang hiện tại
        var startIndex = (me.currentPage - 1) * me.pageSize;
        var endIndex = Math.min(startIndex + me.pageSize, me.totalRecords);
        var pageData = me.dsUserFiltered.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            html = '<tr><td colspan="' + (me.dsDataTypes.length + 1) + '" style="text-align: center; padding: 30px; color: #999;">';
            html += '<i class="fa-solid fa-inbox fa-3x" style="display: block; margin-bottom: 15px; opacity: 0.3;"></i>';
            html += '<div style="font-size: 16px; font-weight: 500;">Không có dữ liệu</div>';
            html += '</td></tr>';
        } else {
            pageData.forEach(function(user) {
                html += '<tr>';
                
                // Cột 1: Thông tin User (sticky)
                html += '<td style="position: sticky; left: 0; z-index: 5;">';
                html += me.renderUserCell(user);
                html += '</td>';
                
                // Các cột dữ liệu
                me.dsDataTypes.forEach(function(dataType) {
                    html += '<td>';
                    html += me.renderDataCell(user, dataType);
                    html += '</td>';
                });
                
                html += '</tr>';
            });
        }
        
        $("#tblPhanQuyenDuLieu tbody").html(html);
        
        // Bind events
        me.bindGridEvents();
    },
    
    /*------------------------------------------
    --Render User Cell
    -------------------------------------------*/
    renderUserCell: function (user) {
        var html = '<div class="user-info">';
        
        // Avatar
        var initials = '';
        if (user.TEN) {
            initials = user.TEN.charAt(0).toUpperCase();
        }
        html += '<div class="user-avatar">' + initials + '</div>';
        
        // Details
        html += '<div class="user-details">';
        html += '<div class="user-name" title="' + (user.HOTEN || '') + '">' + (user.HOTEN || 'N/A') + '</div>';
        html += '<div class="user-code">Mã: ' + (user.MASO || 'N/A') + '</div>';
        if (user.DAOTAO_COCAUTOCHUC_TEN) {
            html += '<div class="user-dept">' + user.DAOTAO_COCAUTOCHUC_TEN + '</div>';
        }
        html += '</div>';
        
        html += '</div>';
        return html;
    },
    
    /*------------------------------------------
    --Render Data Cell
    -------------------------------------------*/
    renderDataCell: function (user, dataType) {
        var me = this;
        var html = '<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">';
        
        // Checkbox chính
        html += '<input type="checkbox" class="permission-checkbox" ';
        html += 'data-user-id="' + user.ID + '" ';
        html += 'data-type="' + dataType.ID + '" ';
        html += '/>';
        
        // Dropdown chọn function (hiện khi có quyền)
        html += '<select class="function-selector" multiple ';
        html += 'data-user-id="' + user.ID + '" ';
        html += 'data-type="' + dataType.ID + '" ';
        html += 'style="display: none;">';
        html += '<option value="">-- Tất cả --</option>';
        me.dsFunctions.forEach(function(func) {
            html += '<option value="' + func.ID + '">' + func.TEN + '</option>';
        });
        html += '</select>';
        
        html += '</div>';
        return html;
    },
    
    /*------------------------------------------
    --Bind Grid Events
    -------------------------------------------*/
    bindGridEvents: function () {
        var me = this;
        
        // Checkbox change
        $(".permission-checkbox").change(function() {
            var $parent = $(this).parent();
            var $selector = $parent.find(".function-selector");
            
            if (this.checked) {
                $selector.show();
            } else {
                $selector.hide();
                $selector.val("");
            }
            me.updateStats();
        });
    },
    
    /*------------------------------------------
    --Apply Filters
    -------------------------------------------*/
    applyFilters: function () {
        var me = this;
        
        me.currentFilters.tuKhoa = $("#txtSearchUser").val().trim().toLowerCase();
        me.currentFilters.khoaId = $("#ddlKhoa").val();
        me.currentFilters.chucVuId = $("#ddlChucVu").val();
        me.currentFilters.trangThai = $("#ddlTrangThai").val();
        
        // Filter local
        me.dsUserFiltered = me.dsUser.filter(function(user) {
            var matchTuKhoa = true;
            var matchKhoa = true;
            var matchChucVu = true;
            var matchTrangThai = true;
            
            // Filter từ khóa
            if (me.currentFilters.tuKhoa) {
                var searchText = (user.HOTEN || '') + ' ' + (user.MASO || '');
                matchTuKhoa = searchText.toLowerCase().indexOf(me.currentFilters.tuKhoa) >= 0;
            }
            
            // Filter khoa
            if (me.currentFilters.khoaId) {
                matchKhoa = user.DAOTAO_COCAUTOCHUC_ID === me.currentFilters.khoaId;
            }
            
            // Filter chức vụ
            if (me.currentFilters.chucVuId) {
                matchChucVu = user.CHUCVU_ID === me.currentFilters.chucVuId;
            }
            
            // Filter trạng thái
            if (me.currentFilters.trangThai) {
                matchTrangThai = user.TINHTRANGNHANSU_ID === me.currentFilters.trangThai;
            }
            
            return matchTuKhoa && matchKhoa && matchChucVu && matchTrangThai;
        });
        
        me.currentPage = 1;
        me.renderGrid();
        me.updateStats();
    },
    
    /*------------------------------------------
    --Select/Deselect All Checkboxes
    -------------------------------------------*/
    selectAllCheckboxes: function (checked) {
        var me = this;
        $(".permission-checkbox").prop("checked", checked).trigger("change");
        me.updateStats();
    },
    
    /*------------------------------------------
    --Update Stats
    -------------------------------------------*/
    updateStats: function () {
        var me = this;
        
        $("#totalUsers").text(me.totalRecords);
        $("#totalDataTypes").text(me.dsDataTypes.length);
        
        var totalPermissions = $(".permission-checkbox:checked").length;
        $("#totalPermissions").text(totalPermissions);
    },
    
    /*------------------------------------------
    --Render Pagination
    -------------------------------------------*/
    renderPagination: function () {
        var me = this;
        
        // Update info
        var recordFrom = me.totalRecords > 0 ? ((me.currentPage - 1) * me.pageSize + 1) : 0;
        var recordTo = Math.min(me.currentPage * me.pageSize, me.totalRecords);
        
        $("#recordFrom").text(recordFrom);
        $("#recordTo").text(recordTo);
        $("#totalRecords").text(me.totalRecords);
        
        // Render buttons
        var html = '';
        
        // First button
        html += '<button class="btn btn-sm btn-outline-primary" id="btnFirstPage" ' + (me.currentPage === 1 ? 'disabled' : '') + '>';
        html += '<i class="fa-solid fa-angles-left"></i>';
        html += '</button>';
        
        // Previous button
        html += '<button class="btn btn-sm btn-outline-primary" id="btnPrevPage" ' + (me.currentPage === 1 ? 'disabled' : '') + '>';
        html += '<i class="fa-solid fa-angle-left"></i>';
        html += '</button>';
        
        // Page numbers
        var startPage = Math.max(1, me.currentPage - 2);
        var endPage = Math.min(me.totalPages, me.currentPage + 2);
        
        if (startPage > 1) {
            html += '<button class="btn btn-sm btn-outline-primary" data-page="1">1</button>';
            if (startPage > 2) {
                html += '<span style="padding: 0 8px;">...</span>';
            }
        }
        
        for (var i = startPage; i <= endPage; i++) {
            html += '<button class="btn btn-sm btn-outline-primary ' + (i === me.currentPage ? 'active' : '') + '" data-page="' + i + '">';
            html += i;
            html += '</button>';
        }
        
        if (endPage < me.totalPages) {
            if (endPage < me.totalPages - 1) {
                html += '<span style="padding: 0 8px;">...</span>';
            }
            html += '<button class="btn btn-sm btn-outline-primary" data-page="' + me.totalPages + '">' + me.totalPages + '</button>';
        }
        
        // Next button
        html += '<button class="btn btn-sm btn-outline-primary" id="btnNextPage" ' + (me.currentPage === me.totalPages ? 'disabled' : '') + '>';
        html += '<i class="fa-solid fa-angle-right"></i>';
        html += '</button>';
        
        // Last button
        html += '<button class="btn btn-sm btn-outline-primary" id="btnLastPage" ' + (me.currentPage === me.totalPages ? 'disabled' : '') + '>';
        html += '<i class="fa-solid fa-angles-right"></i>';
        html += '</button>';
        
        $("#paginationButtons").html(html);
        
        // Bind events
        $("#btnFirstPage").click(function() {
            me.goToPage(1);
        });
        
        $("#btnPrevPage").click(function() {
            me.goToPage(me.currentPage - 1);
        });
        
        $("#btnNextPage").click(function() {
            me.goToPage(me.currentPage + 1);
        });
        
        $("#btnLastPage").click(function() {
            me.goToPage(me.totalPages);
        });
        
        $("[data-page]").click(function() {
            var page = parseInt($(this).data("page"));
            me.goToPage(page);
        });
    },
    
    /*------------------------------------------
    --Go To Page
    -------------------------------------------*/
    goToPage: function (page) {
        var me = this;
        if (page < 1 || page > me.totalPages) return;
        me.currentPage = page;
        me.renderGrid();
    },
    
    /*------------------------------------------
    --Save Permissions
    -------------------------------------------*/
    savePermissions: function () {
        var me = this;
        
        var arrPermissions = [];
        
        // Duyệt qua tất cả checkbox đã check
        $(".permission-checkbox:checked").each(function() {
            var $checkbox = $(this);
            var userId = $checkbox.data("user-id");
            var dataType = $checkbox.data("type");
            var $cell = $checkbox.closest(".checkbox-cell");
            var functions = $cell.find(".function-selector").val() || [];
            
            arrPermissions.push({
                userId: userId,
                dataType: dataType,
                functions: functions.length > 0 ? functions : null // null = tất cả function
            });
        });
        
        if (arrPermissions.length === 0) {
            edu.system.alert("Chưa có quyền nào được chọn!");
            return;
        }
        
        edu.system.confirm("Bạn có chắc chắn lưu " + arrPermissions.length + " quyền dữ liệu?");
        
        $("#btnYes").click(function () {
            me.showLoading(true);
            
            console.log('Dữ liệu lưu:', arrPermissions);
            
            // TODO: Gọi API lưu
            var obj_save = {
                'action': 'CMS_PhanQuyen/LuuQuyenDuLieu',
                'arrPermissions': JSON.stringify(arrPermissions),
                'strChucNang_Id': edu.system.strChucNang_Id,
                'strNguoiThucHien_Id': edu.system.userId
            };
            
            // Giả lập API call
            setTimeout(function() {
                me.showLoading(false);
                edu.system.alert("Lưu phân quyền thành công!");
            }, 1000);
            
            /*
            edu.system.makeRequest({
                success: function (data) {
                    me.showLoading(false);
                    if (data.Success) {
                        edu.system.alert("Lưu phân quyền thành công!");
                        me.page_load();
                    } else {
                        edu.system.alert("Lỗi: " + data.Message);
                    }
                },
                error: function (er) {
                    me.showLoading(false);
                    edu.system.alert("Lỗi: " + JSON.stringify(er));
                },
                type: "POST",
                action: obj_save.action,
                contentType: true,
                data: obj_save
            }, false, false, false, null);
            */
        });
    },
    
    /*------------------------------------------
    --Export to Excel
    -------------------------------------------*/
    exportToExcel: function () {
        var me = this;
        
        // TODO: Implement export logic
        edu.system.alert("Chức năng xuất Excel đang được phát triển!");
    },
    
    /*------------------------------------------
    --Show/Hide Loading
    -------------------------------------------*/
    showLoading: function (show) {
        if (show) {
            $("#loadingOverlay").addClass("active");
        } else {
            $("#loadingOverlay").removeClass("active");
        }
    }
};
