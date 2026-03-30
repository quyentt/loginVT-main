/*----------------------------------------------
--Author: 
--Date of created: 
--Note: Quản trị quyền dữ liệu - Hiển thị động theo vai trò
----------------------------------------------*/
function PhanQuyenDuLieuM2() { };
PhanQuyenDuLieuM2.prototype = {
    dsVaiTro: [], // Danh sách vai trò từ API
    dsHeDaoTao: [], // Danh sách hệ đào tạo
    dsKhoaDaoTao: [], // Danh sách khóa đào tạo
    dsKhoaQuanLy: [], // Danh sách khoa quản lý
    dsChuongTrinh: [], // Danh sách chương trình
    dsLopQuanLy: [], // Danh sách lớp quản lý
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: new Date(),
    
    init: function () {
        var me = this;
        me.page_load();
        
        // Khởi tạo calendar
        me.initCalendar();
        
        // Sự kiện tìm kiếm
        $("#btnSearch").click(function () {
            me.genTable_DuLieu();
        });
        
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.genTable_DuLieu();
            }
        });
        
        // Sự kiện lưu phân quyền
        $("#btnLuuPhanQuyen").click(function () {
            me.save_PhanQuyen();
        });
        
        // Sự kiện checkbox select all theo cột
        $("#tblPhanQuyenDuLieu").delegate(".chkSelectAllCol", "click", function (e) {
            e.stopImmediatePropagation();
            var checked_status = this.checked;
            var colIndex = $(this).data("col-index");
            $("#tblPhanQuyenDuLieu tbody tr").each(function() {
                $(this).find("td").eq(colIndex).find("input[type='checkbox']").prop("checked", checked_status);
            });
        });
        
        // Sự kiện calendar
        $("#btnPrevMonth").click(function () {
            me.changeMonth(-1);
        });
        
        $("#btnNextMonth").click(function () {
            me.changeMonth(1);
        });
    },
    
    page_load: function () {
        var me = this;
        // Load danh sách vai trò
        me.getList_VaiTro();
    },
    
    /*------------------------------------------
    --Lấy danh sách vai trò từ API
    -------------------------------------------*/
    getList_VaiTro: function () {
        var me = this;
        var obj_list = {
            'action': 'CMS_VaiTro/LayDanhSach',
            'strLoaiVaiTro_Id': '',
            'strTuKhoa': '',
            'pageIndex': 1,
            'pageSize': 1000,
            'dTrangThai': 1,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dsVaiTro = data.Data;
                    console.log('Đã load ' + me.dsVaiTro.length + ' vai trò');
                    // Sau khi có vai trò, load dữ liệu
                    me.loadAllData();
                } else {
                    edu.system.alert("Lỗi: " + data.Message);
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi: " + JSON.stringify(er));
            },
            type: "GET",
            action: obj_list.action,
            contentType: true,
            data: obj_list
        }, false, false, false, null);
    },
    
    /*------------------------------------------
    --Load tất cả dữ liệu cần thiết
    -------------------------------------------*/
    loadAllData: function () {
        var me = this;
        
        // Tạm thời dùng dữ liệu demo
        // Sau này thay bằng API thực tế
        me.dsHeDaoTao = [
            { ID: '1', TEN: 'Hệ chính quy - Đại học - Văn bằng 1' },
            { ID: '2', TEN: 'Hệ chính quy - Đại học - Văn bằng 2' },
            { ID: '3', TEN: 'Hệ vừa làm vừa học' }
        ];
        
        me.dsKhoaDaoTao = [
            { ID: '1', TEN: 'Khóa 2020 - 2024' },
            { ID: '2', TEN: 'Khóa 2021 - 2025' },
            { ID: '3', TEN: 'Khóa 2022 - 2026' }
        ];
        
        me.dsKhoaQuanLy = [
            { ID: '1', TEN: 'Khoa Công nghệ thông tin' },
            { ID: '2', TEN: 'Khoa Kinh tế' },
            { ID: '3', TEN: 'Khoa Ngoại ngữ' }
        ];
        
        me.dsChuongTrinh = [
            { ID: '1', TEN: 'Công nghệ thông tin' },
            { ID: '2', TEN: 'Quản trị kinh doanh' },
            { ID: '3', TEN: 'Tiếng Anh' }
        ];
        
        me.dsLopQuanLy = [
            { ID: '1', TEN: 'CNTT01' },
            { ID: '2', TEN: 'QTKD01' },
            { ID: '3', TEN: 'TA01' }
        ];
        
        console.log('Đã load xong tất cả dữ liệu');
        me.genTable_DuLieu();
    },
    
    /*------------------------------------------
    --Tạo bảng hiển thị dữ liệu
    --Dòng: Vai trò | Cột: Hệ đào tạo, Khóa, Khoa, Chương trình, Lớp
    -------------------------------------------*/
    genTable_DuLieu: function () {
        var me = this;
        
        console.log('========== BẮT ĐẦU RENDER BẢNG ==========');
        
        // Cập nhật số lượng
        $("#lblSoLuongVaiTro").text(me.dsVaiTro.length);
        
        // Tạo header
        var htmlHead = '<tr>';
        htmlHead += '<th class="td-center" style="min-width: 200px; background: #223771; color: white; position: sticky; left: 0; z-index: 12;">Vai trò</th>';
        htmlHead += '<th class="td-center" style="min-width: 180px; background: #223771; color: white; padding: 10px 8px;">';
        htmlHead += '<div style="margin-bottom: 8px; font-weight: 600; font-size: 12px;">Hệ đào tạo</div>';
        htmlHead += '<input type="checkbox" class="chkSelectAllCol" data-col-index="1" title="Chọn tất cả cột này" style="width: 20px; height: 20px;"/>';
        htmlHead += '</th>';
        htmlHead += '<th class="td-center" style="min-width: 180px; background: #223771; color: white; padding: 10px 8px;">';
        htmlHead += '<div style="margin-bottom: 8px; font-weight: 600; font-size: 12px;">Khóa đào tạo</div>';
        htmlHead += '<input type="checkbox" class="chkSelectAllCol" data-col-index="2" title="Chọn tất cả cột này" style="width: 20px; height: 20px;"/>';
        htmlHead += '</th>';
        htmlHead += '<th class="td-center" style="min-width: 180px; background: #223771; color: white; padding: 10px 8px;">';
        htmlHead += '<div style="margin-bottom: 8px; font-weight: 600; font-size: 12px;">Khoa quản lý</div>';
        htmlHead += '<input type="checkbox" class="chkSelectAllCol" data-col-index="3" title="Chọn tất cả cột này" style="width: 20px; height: 20px;"/>';
        htmlHead += '</th>';
        htmlHead += '<th class="td-center" style="min-width: 180px; background: #223771; color: white; padding: 10px 8px;">';
        htmlHead += '<div style="margin-bottom: 8px; font-weight: 600; font-size: 12px;">Chương trình</div>';
        htmlHead += '<input type="checkbox" class="chkSelectAllCol" data-col-index="4" title="Chọn tất cả cột này" style="width: 20px; height: 20px;"/>';
        htmlHead += '</th>';
        htmlHead += '<th class="td-center" style="min-width: 180px; background: #223771; color: white; padding: 10px 8px;">';
        htmlHead += '<div style="margin-bottom: 8px; font-weight: 600; font-size: 12px;">Lớp quản lý</div>';
        htmlHead += '<input type="checkbox" class="chkSelectAllCol" data-col-index="5" title="Chọn tất cả cột này" style="width: 20px; height: 20px;"/>';
        htmlHead += '</th>';
        htmlHead += '</tr>';
        
        $("#tblPhanQuyenDuLieu thead").html(htmlHead);
        
        // Tạo body - mỗi dòng là 1 vai trò
        var htmlBody = '';
        
        for (var i = 0; i < me.dsVaiTro.length; i++) {
            htmlBody += '<tr>';
            
            // Cột 1: Tên vai trò (sticky)
            htmlBody += '<td style="padding: 12px 15px; background: #f8f9fa; position: sticky; left: 0; z-index: 5; font-weight: 600; color: #223771;">';
            htmlBody += '<div style="display: flex; align-items: center; gap: 10px;">';
            htmlBody += '<i class="fa-solid fa-user-shield" style="color: #223771;"></i>';
            htmlBody += '<span>' + me.dsVaiTro[i].TENVAITRO + '</span>';
            htmlBody += '</div>';
            htmlBody += '</td>';
            
            // Cột 2: Hệ đào tạo
            htmlBody += '<td style="padding: 8px; vertical-align: top;">';
            htmlBody += me.renderCheckboxList(me.dsHeDaoTao, me.dsVaiTro[i].ID, 'HEDAOTAO');
            htmlBody += '</td>';
            
            // Cột 3: Khóa đào tạo
            htmlBody += '<td style="padding: 8px; vertical-align: top;">';
            htmlBody += me.renderCheckboxList(me.dsKhoaDaoTao, me.dsVaiTro[i].ID, 'KHOADAOTAO');
            htmlBody += '</td>';
            
            // Cột 4: Khoa quản lý
            htmlBody += '<td style="padding: 8px; vertical-align: top;">';
            htmlBody += me.renderCheckboxList(me.dsKhoaQuanLy, me.dsVaiTro[i].ID, 'KHOAQUANLY');
            htmlBody += '</td>';
            
            // Cột 5: Chương trình
            htmlBody += '<td style="padding: 8px; vertical-align: top;">';
            htmlBody += me.renderCheckboxList(me.dsChuongTrinh, me.dsVaiTro[i].ID, 'CHUONGTRINH');
            htmlBody += '</td>';
            
            // Cột 6: Lớp quản lý
            htmlBody += '<td style="padding: 8px; vertical-align: top;">';
            htmlBody += me.renderCheckboxList(me.dsLopQuanLy, me.dsVaiTro[i].ID, 'LOPQUANLY');
            htmlBody += '</td>';
            
            htmlBody += '</tr>';
        }
        
        $("#tblPhanQuyenDuLieu tbody").html(htmlBody);
        console.log('========== KẾT THÚC RENDER BẢNG ==========');
    },
    
    /*------------------------------------------
    --Render danh sách checkbox
    -------------------------------------------*/
    renderCheckboxList: function (dataList, vaiTroId, loaiDuLieu) {
        var html = '';
        
        if (dataList && dataList.length > 0) {
            for (var i = 0; i < dataList.length; i++) {
                html += '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">';
                html += '<input type="checkbox" class="chkPhanQuyen" ';
                html += 'data-vaitro-id="' + vaiTroId + '" ';
                html += 'data-loai="' + loaiDuLieu + '" ';
                html += 'data-dulieu-id="' + dataList[i].ID + '" ';
                html += 'style="width: 16px; height: 16px; flex-shrink: 0;" ';
                html += '/>';
                html += '<span style="font-size: 12px; color: #555; line-height: 1.3;">' + dataList[i].TEN + '</span>';
                html += '</div>';
            }
        } else {
            html = '<span style="color: #999; font-size: 12px; font-style: italic;">Chưa có dữ liệu</span>';
        }
        
        return html;
    },
    
    /*------------------------------------------
    --Lưu phân quyền
    -------------------------------------------*/
    save_PhanQuyen: function () {
        var me = this;
        
        var arrThem = [];
        var arrXoa = [];
        
        // Duyệt qua tất cả checkbox
        var checkboxes = $("#tblPhanQuyenDuLieu .chkPhanQuyen");
        
        for (var i = 0; i < checkboxes.length; i++) {
            var $chk = $(checkboxes[i]);
            var vaiTroId = $chk.data("vaitro-id");
            var loai = $chk.data("loai");
            var duLieuId = $chk.data("dulieu-id");
            
            if ($chk.is(':checked')) {
                // Nếu checked mà không có attribute name="old" => thêm mới
                if (!$chk.attr("name")) {
                    arrThem.push({
                        vaiTroId: vaiTroId,
                        loai: loai,
                        duLieuId: duLieuId
                    });
                }
            } else {
                // Nếu không checked mà có attribute name="old" => xóa
                if ($chk.attr("name") === "old") {
                    arrXoa.push({
                        vaiTroId: vaiTroId,
                        loai: loai,
                        duLieuId: duLieuId
                    });
                }
            }
        }
        
        if ((arrThem.length + arrXoa.length) > 0) {
            edu.system.confirm("Bạn có chắc chắn thêm " + arrThem.length + " quyền và hủy " + arrXoa.length + " quyền?");
            
            $("#btnYes").click(function () {
                console.log('Thêm quyền:', arrThem);
                console.log('Xóa quyền:', arrXoa);
                
                // TODO: Gọi API để lưu
                edu.system.alert("Lưu phân quyền thành công!");
            });
        } else {
            edu.system.alert("Không có thay đổi để lưu");
        }
    },
    
    /*------------------------------------------
    --Khởi tạo calendar
    -------------------------------------------*/
    initCalendar: function () {
        var me = this;
        me.renderCalendar();
    },
    
    /*------------------------------------------
    --Render calendar
    -------------------------------------------*/
    renderCalendar: function () {
        var me = this;
        var firstDay = new Date(me.currentYear, me.currentMonth, 1);
        var lastDay = new Date(me.currentYear, me.currentMonth + 1, 0);
        var prevLastDay = new Date(me.currentYear, me.currentMonth, 0);
        var firstDayIndex = firstDay.getDay();
        var lastDayIndex = lastDay.getDay();
        var nextDays = 7 - lastDayIndex - 1;
        
        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        
        var months = [
            "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
            "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        ];
        
        $("#thang").text(months[me.currentMonth]);
        $("#nam").text(me.currentYear);
        
        var days = "";
        
        // Previous month days
        for (var x = firstDayIndex; x > 0; x--) {
            days += '<li class="day-of-other-month">' + (prevLastDay.getDate() - x + 1) + '</li>';
        }
        
        // Current month days
        for (var i = 1; i <= lastDay.getDate(); i++) {
            var today = new Date();
            var isToday = i === today.getDate() && 
                         me.currentMonth === today.getMonth() && 
                         me.currentYear === today.getFullYear();
            
            var isSelected = i === me.selectedDate.getDate() && 
                            me.currentMonth === me.selectedDate.getMonth() && 
                            me.currentYear === me.selectedDate.getFullYear();
            
            var className = "poiter";
            if (isSelected) className += " active";
            
            days += '<li class="' + className + '" data-date="' + i + '">' + i + '</li>';
        }
        
        // Next month days
        for (var j = 1; j <= nextDays; j++) {
            days += '<li class="day-of-other-month">' + j + '</li>';
        }
        
        $(".calendar-body .days").html(days);
        
        // Add click event for days
        $(".calendar-body .days li.poiter").click(function () {
            var day = parseInt($(this).data("date"));
            me.selectedDate = new Date(me.currentYear, me.currentMonth, day);
            me.renderCalendar();
        });
    },
    
    /*------------------------------------------
    --Thay đổi tháng
    -------------------------------------------*/
    changeMonth: function (direction) {
        var me = this;
        me.currentMonth += direction;
        
        if (me.currentMonth < 0) {
            me.currentMonth = 11;
            me.currentYear--;
        } else if (me.currentMonth > 11) {
            me.currentMonth = 0;
            me.currentYear++;
        }
        
        me.renderCalendar();
    }
};
