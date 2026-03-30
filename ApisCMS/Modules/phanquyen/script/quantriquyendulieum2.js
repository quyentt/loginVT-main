/*----------------------------------------------
--Author: 
--Date of created: 
--Note: Quản trị quyền dữ liệu - Hiển thị động theo vai trò
----------------------------------------------*/
function PhanQuyenDuLieuM2() { };
PhanQuyenDuLieuM2.prototype = {
    dsVaiTro: [], // Danh sách vai trò từ API
    dsDuLieu: [], // Danh sách dữ liệu phân quyền
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
            me.getList_DuLieu();
        });
        
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_DuLieu();
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
        
        // Sự kiện checkbox select all theo row
        $("#tblPhanQuyenDuLieu").delegate(".chkSelectAllRow", "click", function (e) {
            e.stopImmediatePropagation();
            var checked_status = this.checked;
            $(this).closest("tr").find("input[type='checkbox']:not(.chkSelectAllRow)").prop("checked", checked_status);
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
            'action': 'CMS_QuanTri01_MH/DSA4BRIXICgVMy4PJjQuKAU0LyYP',
            'func': 'PKG_CORE_QUANTRI_01.LayDSVaiTroNguoiDung',
            'iM': 'Azz',
            'strChucNang_Id': '',
            'strNguoiThucHien_Id': edu.system.userId
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dsVaiTro = data.Data;
                    // Sau khi có danh sách vai trò, load dữ liệu
                    me.getList_DuLieu();
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
    --Lấy danh sách dữ liệu phân quyền
    -------------------------------------------*/
    getList_DuLieu: function () {
        var me = this;
        
        // Gọi stored procedure để lấy dữ liệu hệ đào tạo
        var obj_list = {
            'action': 'CMS_PhanQuyen_DuLieu/LayDanhSachChieuDuLieu',
            'func': 'PKG_CORE_QUANTRI_02.LayDSCore_Data_Dimension',
            'ParamNguoiThucHien_Id': edu.system.userId,
            'ParamErr': '',
            'strTuKhoa': edu.util.getValById('txtSearch_TuKhoa'),
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dsDuLieu = data.Data;
                    me.genTable_DuLieu(data.Data);
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
    --Tạo bảng hiển thị dữ liệu động
    -------------------------------------------*/
    genTable_DuLieu: function (data) {
        var me = this;
        
        // Tạo header động
        var htmlHead = '<tr>';
        htmlHead += '<th class="td-center" style="min-width: 200px;">Chiều dữ liệu</th>';
        
        // Thêm các cột động từ danh sách vai trò
        for (var i = 0; i < me.dsVaiTro.length; i++) {
            htmlHead += '<th class="td-center" style="min-width: 150px;">';
            htmlHead += '<div style="margin-bottom: 5px;">' + me.dsVaiTro[i].TENVAITRO + '</div>';
            htmlHead += '<input type="checkbox" class="chkSelectAllCol" data-col-index="' + (i + 1) + '" title="Chọn tất cả cột này"/>';
            htmlHead += '</th>';
        }
        htmlHead += '</tr>';
        
        $("#tblPhanQuyenDuLieu thead").html(htmlHead);
        
        // Tạo body
        var htmlBody = '';
        
        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                htmlBody += '<tr>';
                
                // Cột đầu tiên: Hiển thị thông tin chiều dữ liệu
                htmlBody += '<td style="font-weight: 500;">';
                htmlBody += '<div style="margin-bottom: 3px;"><strong>' + (data[i].TEN || data[i].DIMENSION_NAME || 'Hệ đào tạo') + '</strong></div>';
                
                // Hiển thị chi tiết các cấp
                if (data[i].HEDAOTAO) {
                    htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
                    htmlBody += '<i class="fa-solid fa-graduation-cap" style="margin-right: 5px;"></i>' + data[i].HEDAOTAO;
                    htmlBody += '</div>';
                }
                if (data[i].KHOADAOTAO) {
                    htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
                    htmlBody += '<i class="fa-solid fa-calendar" style="margin-right: 5px;"></i>' + data[i].KHOADAOTAO;
                    htmlBody += '</div>';
                }
                if (data[i].KHOAQUANLY) {
                    htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
                    htmlBody += '<i class="fa-solid fa-building" style="margin-right: 5px;"></i>' + data[i].KHOAQUANLY;
                    htmlBody += '</div>';
                }
                if (data[i].CHUONGTRINH) {
                    htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
                    htmlBody += '<i class="fa-solid fa-book" style="margin-right: 5px;"></i>' + data[i].CHUONGTRINH;
                    htmlBody += '</div>';
                }
                if (data[i].LOPQUANLY) {
                    htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
                    htmlBody += '<i class="fa-solid fa-users" style="margin-right: 5px;"></i>' + data[i].LOPQUANLY;
                    htmlBody += '</div>';
                }
                
                htmlBody += '</td>';
                
                // Thêm checkbox cho từng vai trò
                for (var j = 0; j < me.dsVaiTro.length; j++) {
                    htmlBody += '<td class="td-center">';
                    var isChecked = me.checkQuyen(data[i], me.dsVaiTro[j].ID);
                    htmlBody += '<input type="checkbox" class="chkPhanQuyen" ';
                    htmlBody += 'data-row-id="' + (data[i].ID || data[i].DIMENSION_ID || '') + '" ';
                    htmlBody += 'data-vaitro-id="' + me.dsVaiTro[j].ID + '" ';
                    htmlBody += 'data-vaitro-ma="' + me.dsVaiTro[j].MAVAITRO + '" ';
                    if (isChecked) {
                        htmlBody += 'checked="checked" name="old" ';
                    }
                    htmlBody += '/>';
                    htmlBody += '</td>';
                }
                
                htmlBody += '</tr>';
            }
        } else {
            // Hiển thị dòng mẫu để demo cấu trúc
            htmlBody += '<tr>';
            htmlBody += '<td style="font-weight: 500;">';
            htmlBody += '<div style="margin-bottom: 3px;"><strong>Hệ đào tạo</strong></div>';
            htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
            htmlBody += '<i class="fa-solid fa-graduation-cap" style="margin-right: 5px;"></i>Hệ chính quy - Đại học - Văn bằng 1';
            htmlBody += '</div>';
            htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
            htmlBody += '<i class="fa-solid fa-calendar" style="margin-right: 5px;"></i>Khóa 2020 - 2024';
            htmlBody += '</div>';
            htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
            htmlBody += '<i class="fa-solid fa-building" style="margin-right: 5px;"></i>Khoa Công nghệ thông tin';
            htmlBody += '</div>';
            htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
            htmlBody += '<i class="fa-solid fa-book" style="margin-right: 5px;"></i>Công nghệ thông tin';
            htmlBody += '</div>';
            htmlBody += '<div style="font-size: 12px; color: #666; padding-left: 10px;">';
            htmlBody += '<i class="fa-solid fa-users" style="margin-right: 5px;"></i>Lớp CNTT01';
            htmlBody += '</div>';
            htmlBody += '</td>';
            
            for (var j = 0; j < me.dsVaiTro.length; j++) {
                htmlBody += '<td class="td-center">';
                htmlBody += '<input type="checkbox" class="chkPhanQuyen" ';
                htmlBody += 'data-row-id="demo" ';
                htmlBody += 'data-vaitro-id="' + me.dsVaiTro[j].ID + '" ';
                htmlBody += 'data-vaitro-ma="' + me.dsVaiTro[j].MAVAITRO + '" ';
                htmlBody += '/>';
                htmlBody += '</td>';
            }
            
            htmlBody += '</tr>';
        }
        
        $("#tblPhanQuyenDuLieu tbody").html(htmlBody);
    },
    
    /*------------------------------------------
    --Kiểm tra quyền đã được phân hay chưa
    -------------------------------------------*/
    checkQuyen: function (dataRow, vaiTroId) {
        // Logic kiểm tra quyền dựa vào dữ liệu từ server
        // Có thể check trong dataRow có field chứa danh sách vai trò đã được phân
        if (dataRow.DSVAITRO_ID) {
            var arrVaiTro = dataRow.DSVAITRO_ID.split(',');
            return arrVaiTro.indexOf(vaiTroId) > -1;
        }
        return false;
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
            var rowId = $chk.data("row-id");
            var vaiTroId = $chk.data("vaitro-id");
            var vaiTroMa = $chk.data("vaitro-ma");
            
            if ($chk.is(':checked')) {
                // Nếu checked mà không có attribute name="old" => thêm mới
                if (!$chk.attr("name")) {
                    arrThem.push({
                        rowId: rowId,
                        vaiTroId: vaiTroId,
                        vaiTroMa: vaiTroMa
                    });
                }
            } else {
                // Nếu không checked mà có attribute name="old" => xóa
                if ($chk.attr("name") === "old") {
                    arrXoa.push({
                        rowId: rowId,
                        vaiTroId: vaiTroId,
                        vaiTroMa: vaiTroMa
                    });
                }
            }
        }
        
        if ((arrThem.length + arrXoa.length) > 0) {
            edu.system.confirm("Bạn có chắc chắn thêm " + arrThem.length + " quyền và hủy " + arrXoa.length + " quyền?");
            
            $("#btnYes").click(function (e) {
                // Thêm quyền
                for (var i = 0; i < arrThem.length; i++) {
                    me.save_ThemQuyen(arrThem[i]);
                }
                
                // Xóa quyền
                for (var i = 0; i < arrXoa.length; i++) {
                    me.save_XoaQuyen(arrXoa[i]);
                }
                
                // Reload lại dữ liệu sau khi lưu
                setTimeout(function() {
                    me.getList_DuLieu();
                    edu.system.alert("Lưu phân quyền thành công!");
                }, 1000);
            });
        } else {
            edu.system.alert("Không có thay đổi để lưu");
        }
    },
    
    /*------------------------------------------
    --Thêm quyền
    -------------------------------------------*/
    save_ThemQuyen: function (objQuyen) {
        var me = this;
        var obj_list = {
            'action': 'CMS_PhanQuyen_DuLieu/ThemQuyen',
            'strDuLieu_Id': objQuyen.rowId,
            'strVaiTro_Id': objQuyen.vaiTroId,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (!data.Success) {
                    console.log("Lỗi thêm quyền: " + data.Message);
                }
            },
            error: function (er) {
                console.log("Lỗi: " + JSON.stringify(er));
            },
            type: "POST",
            action: obj_list.action,
            contentType: true,
            data: obj_list
        }, false, false, false, null);
    },
    
    /*------------------------------------------
    --Xóa quyền
    -------------------------------------------*/
    save_XoaQuyen: function (objQuyen) {
        var me = this;
        var obj_list = {
            'action': 'CMS_PhanQuyen_DuLieu/XoaQuyen',
            'strDuLieu_Id': objQuyen.rowId,
            'strVaiTro_Id': objQuyen.vaiTroId,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        
        edu.system.makeRequest({
            success: function (data) {
                if (!data.Success) {
                    console.log("Lỗi xóa quyền: " + data.Message);
                }
            },
            error: function (er) {
                console.log("Lỗi: " + JSON.stringify(er));
            },
            type: "POST",
            action: obj_list.action,
            contentType: true,
            data: obj_list
        }, false, false, false, null);
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
