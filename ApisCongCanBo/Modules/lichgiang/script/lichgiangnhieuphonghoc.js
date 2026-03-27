/*----------------------------------------------
--Author: 
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note: Lịch giảng nhiều phòng học
----------------------------------------------*/
function LichGiangNhieuPhong() { };
LichGiangNhieuPhong.prototype = {
    strNgayBatDau: '',
    strNgayKetThuc: '',
    dtLichHoc: [],
    dtPhongHoc: [],
    dtPhongHocFull: [],
    dtToaNha: [],
    arrMauNen: ["#223771", "#d49f3a", "#ec4c00", "#5a7adb", "#3c5398"],
    arrLopHocPhanMau: [],
    iPageSize: 30,
    iCurrentPage: 1,
    isLoading: false,
    strSelectedBuilding: '',

    // Helper function to clean HTML tags from text
    cleanHtmlTags: function(text) {
        if (!text) return '';
        return text
            .replace(/<br\s*\/?>/gi, ', ')  // Replace <br> with comma
            .replace(/,\s*,/g, ',')          // Remove double commas
            .replace(/^,\s*/, '')            // Remove leading comma
            .replace(/,\s*$/, '');           // Remove trailing comma
    },

    init: function () {
        var me = this;
        
        var date = new Date();
        var nMonth = date.getMonth() + 1;
        var nYear = date.getFullYear();

        $("#nam").attr("title", nYear);
        $("#nam").html(nYear);

        $("#thang").attr("title", nMonth);
        $("#thang").html("Tháng " + nMonth);
        me.genHtml_Month(0);

        // Calendar click event
        $(".days").delegate(".poiter", "click", function () {
            $(".days .active").removeClass("active");
            this.classList.add("active");
            var strNgayBatDau = $(this).attr('batdau');
            var strNgayKetThuc = $(this).attr('ketthuc');
            var strNgayDangChon = $(this).attr('title');
            me.strNgayBatDau = strNgayBatDau;
            me.strNgayKetThuc = strNgayKetThuc;
            
            // Update week info
            $("#weekInfo").html("Tuần (" + strNgayBatDau + " - " + strNgayKetThuc + ")");
            
            me.getList_TuanHienTai(strNgayBatDau, strNgayKetThuc, strNgayDangChon);
        });

        // Month navigation
        $("#btnPrevMonth").click(function () {
            me.genHtml_Month(-1);
        });
        $("#btnNextMonth").click(function () {
            me.genHtml_Month(1);
        });
        
        // Legacy support for old calendar
        $(".month").delegate(".prev", "click", function () {
            me.genHtml_Month(-1);
        });
        $(".month").delegate(".next", "click", function () {
            me.genHtml_Month(1);
        });

        // Week navigation buttons
        $("#btnPrevWeek").click(function () {
            me.navigateWeek(-7);
        });
        
        $("#btnNextWeek").click(function () {
            me.navigateWeek(7);
        });

        // Search button
        $("#btnSearch").click(function () {
            me.strSelectedBuilding = edu.util.getValById("dropSearch_ToaNha");
            if (me.strSelectedBuilding) {
                $(".days .active").trigger("click");
            } else {
                edu.system.alert("Vui lòng chọn phòng học");
            }
        });

        // View all button
        $("#btnViewAll").click(function () {
            me.strSelectedBuilding = '';
            $("#dropSearch_ToaNha").val('').trigger('change');
            $(".days .active").trigger("click");
        });

        // Export Excel button
        $("#btnExportExcel").click(function () {
            me.showExportModal();
        });

        // Export modal events
        $("#exportTimeRange").change(function () {
            var value = $(this).val();
            $("#customDateSection").hide();
            $("#customRangeSection").hide();
            
            if (value === "custom_date") {
                $("#customDateSection").show();
            } else if (value === "custom_range") {
                $("#customRangeSection").show();
            }
        });

        $("#exportRoomFilter").change(function () {
            var value = $(this).val();
            if (value === "custom") {
                $("#customRoomSection").show();
            } else {
                $("#customRoomSection").hide();
            }
        });

        $("#btnConfirmExport").click(function () {
            me.processExport();
        });

        // Schedule event click
        $("#scheduleGrid").delegate(".schedule-event", "click", function () {
            var $el = $(this);
            var eventId = $el.data('event-id');
            var roomId = $el.data('room-id');
            var date = $el.data('date');
            var lopHocPhan = $el.data('lophocphan');
            
            console.log("Click event:", { eventId: eventId, roomId: roomId, date: date, lopHocPhan: lopHocPhan });
            
            me.showScheduleDetail(eventId, roomId, date, lopHocPhan);
        });

        // Scroll event for lazy loading
        $(".schedule-grid-container").scroll(function () {
            if (me.isLoading) return;
            
            var container = $(this);
            var scrollTop = container.scrollTop();
            var scrollHeight = container[0].scrollHeight;
            var clientHeight = container.height();
            
            // Load more when scrolled to 80% of content
            if (scrollTop + clientHeight >= scrollHeight * 0.8) {
                me.loadMoreRooms();
            }
        });

        // Initialize
        me.getList_ToaNha();
    },

    navigateWeek: function (days) {
        var me = this;
        if (!me.strNgayBatDau) return;
        
        var parts = me.strNgayBatDau.split('/');
        var currentDate = new Date(parts[2], parts[1] - 1, parts[0]);
        currentDate.setDate(currentDate.getDate() + days);
        
        // Find the Monday of the new week
        var dayOfWeek = currentDate.getDay();
        var diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentDate.setDate(currentDate.getDate() + diff);
        
        var newMonth = currentDate.getMonth() + 1;
        var newYear = currentDate.getFullYear();
        
        // Update calendar if month changed
        var currentMonth = parseInt($("#thang").attr("title"));
        var currentYear = parseInt($("#nam").attr("title"));
        
        if (newMonth !== currentMonth || newYear !== currentYear) {
            $("#thang").attr("title", newMonth);
            $("#thang").html("Tháng " + newMonth);
            $("#nam").attr("title", newYear);
            $("#nam").html(newYear);
            me.genHtml_Month(0);
        }
        
        // Trigger click on the new week
        setTimeout(function () {
            var targetDay = currentDate.getDate();
            var targetElement = $(".days li[ngay='" + targetDay + "']");
            if (targetElement.length > 0) {
                targetElement.trigger("click");
            }
        }, 100);
    },

    getList_TuanHienTai: function (strNgayBatDau, strNgayKetThuc, strNgayDangChon) {
        var me = this;
        me.iCurrentPage = 1;
        me.dtLichHoc = [];
        me.arrLopHocPhanMau = [];
        
        $("#scheduleGrid").html('<div style="padding: 40px; text-align: center; grid-column: 1/-1;"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i><br/><br/><h5>Đang tải dữ liệu...</h5></div>');
        
        me.getList_PhongHoc(function() {
            if (me.dtPhongHocFull.length === 0) {
                $("#scheduleGrid").html('<div style="padding: 40px; text-align: center; grid-column: 1/-1;">Không có dữ liệu phòng học</div>');
                return;
            }
            
            me.dtPhongHoc = me.dtPhongHocFull.slice(0, me.iPageSize);
            
            console.log("Trang 1: Hiển thị", me.dtPhongHoc.length, "/", me.dtPhongHocFull.length, "phòng");
            
            me.loadSchedulesForPage(me.dtPhongHoc, function() {
                me.genTable_ThongTin(me.dtLichHoc, null);
            });
        });
    },

    loadSchedulesForPage: function (rooms, callback) {
        var me = this;
        var loadedCount = 0;
        
        if (rooms.length === 0) {
            if (typeof callback === 'function') callback();
            return;
        }
        
        rooms.forEach(function(room) {
            me.getList_LichPhongHoc(room.ID, function(schedules) {
                me.dtLichHoc = me.dtLichHoc.concat(schedules);
                loadedCount++;
                
                if (loadedCount === rooms.length) {
                    if (typeof callback === 'function') callback();
                }
            });
        });
    },

    loadMoreRooms: function () {
        var me = this;
        
        if (me.isLoading) return;
        if (me.dtPhongHoc.length >= me.dtPhongHocFull.length) return;
        
        me.isLoading = true;
        me.iCurrentPage++;
        
        var startIndex = (me.iCurrentPage - 1) * me.iPageSize;
        var endIndex = Math.min(startIndex + me.iPageSize, me.dtPhongHocFull.length);
        var newRooms = me.dtPhongHocFull.slice(startIndex, endIndex);
        
        console.log("Trang", me.iCurrentPage, ": Tải thêm", newRooms.length, "phòng");
        
        me.loadSchedulesForPage(newRooms, function() {
            me.dtPhongHoc = me.dtPhongHoc.concat(newRooms);
            me.appendRoomsToGrid(newRooms);
            me.isLoading = false;
        });
    },

    appendRoomsToGrid: function (newRooms) {
        var me = this;
        var arrDays = me.getDaysInWeek(me.strNgayBatDau, me.strNgayKetThuc);
        var html = '';
        
        // Remove scroll notice if exists
        $(".scroll-notice").remove();
        
        // Tính row hiện tại
        var currentRow = $("#scheduleGrid > div").length / (arrDays.length + 1) + 2;
        
        newRooms.forEach(function (room) {
            var roomInfo = '<div style="font-weight: 600; margin-bottom: 3px;">' + room.TEN + '</div>';
            
            // Thêm kiểu phòng nếu có
            if (room.KIEUPHONG) {
                roomInfo += '<div style="font-size: 10px; color: #666; margin-bottom: 2px;">';
                roomInfo += '<span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-weight: 600;">' + room.KIEUPHONG + '</span>';
                roomInfo += '</div>';
            }
            
            // Thêm mô tả kiểu phòng
            var moTa = room.MOTAKIEUPHONG;
            if (!moTa && room.KIEUPHONG === 'TH') {
                moTa = 'Phòng thực hành';
            }
            if (moTa) {
                roomInfo += '<div style="font-size: 9px; color: #888; font-style: italic;">' + moTa + '</div>';
            }
            
            html += '<div class="schedule-cell room-name" style="grid-column: 1; grid-row: ' + currentRow + ';">' + roomInfo + '</div>';
            
            arrDays.forEach(function (day, dayIndex) {
                var colStart = dayIndex + 2;
                
                var events = me.dtLichHoc.filter(function (item) {
                    return item.IDPHONGHOC === room.ID && item.NGAYHOC === day.date;
                });
                
                // Phân loại theo ca
                var sangEvents = events.filter(function(e) { 
                    return e.TIETBATDAU && e.TIETBATDAU >= 1 && e.TIETBATDAU <= 6; 
                });
                var chieuEvents = events.filter(function(e) { 
                    return e.TIETBATDAU && e.TIETBATDAU >= 7 && e.TIETBATDAU <= 10; 
                });
                var toiEvents = events.filter(function(e) { 
                    return e.TIETBATDAU && e.TIETBATDAU >= 11 && e.TIETBATDAU <= 15; 
                });
                
                [sangEvents, chieuEvents, toiEvents].forEach(function(arr) {
                    arr.sort(function (a, b) {
                        return (a.GIOBATDAU * 60 + a.PHUTBATDAU) - (b.GIOBATDAU * 60 + b.PHUTBATDAU);
                    });
                });
                
                html += '<div style="grid-column: ' + colStart + '; grid-row: ' + currentRow + '; display: flex; border: 1px solid #e0e0e0; min-height: 120px;">';
                
                // Ca sáng
                html += '<div style="flex: 1; padding: 4px; border-right: 1px solid #e0e0e0; background: #FFFEF5;">';
                sangEvents.forEach(function (event, idx) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var uniqueId = event.ID || ('evt_' + room.ID + '_' + day.date + '_sang_' + idx);
                    var giangVien = me.cleanHtmlTags(event.THONGTINGIANGVIEN);
                    html += '<div class="schedule-event ' + colorClass + '" data-event-id="' + uniqueId + '" data-room-id="' + room.ID + '" data-date="' + day.date + '" data-lophocphan="' + event.IDLOPHOCPHAN + '" title="' + event.TENHOCPHAN + '" style="margin: 2px 0;">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (giangVien) {
                        html += '<div class="event-teacher">' + giangVien + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                
                // Ca chiều
                html += '<div style="flex: 1; padding: 4px; border-right: 1px solid #e0e0e0; background: #F5F9FF;">';
                chieuEvents.forEach(function (event, idx) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var uniqueId = event.ID || ('evt_' + room.ID + '_' + day.date + '_chieu_' + idx);
                    var giangVien = me.cleanHtmlTags(event.THONGTINGIANGVIEN);
                    html += '<div class="schedule-event ' + colorClass + '" data-event-id="' + uniqueId + '" data-room-id="' + room.ID + '" data-date="' + day.date + '" data-lophocphan="' + event.IDLOPHOCPHAN + '" title="' + event.TENHOCPHAN + '" style="margin: 2px 0;">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (giangVien) {
                        html += '<div class="event-teacher">' + giangVien + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                
                // Ca tối
                html += '<div style="flex: 1; padding: 4px; background: #F9F5FF;">';
                toiEvents.forEach(function (event, idx) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var uniqueId = event.ID || ('evt_' + room.ID + '_' + day.date + '_toi_' + idx);
                    var giangVien = me.cleanHtmlTags(event.THONGTINGIANGVIEN);
                    html += '<div class="schedule-event ' + colorClass + '" data-event-id="' + uniqueId + '" data-room-id="' + room.ID + '" data-date="' + day.date + '" data-lophocphan="' + event.IDLOPHOCPHAN + '" title="' + event.TENHOCPHAN + '" style="margin: 2px 0;">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (giangVien) {
                        html += '<div class="event-teacher">' + giangVien + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                
                html += '</div>';
            });
            
            currentRow++;
        });

        $("#scheduleGrid").append(html);
        
        // Add scroll notice if more rooms available
        if (me.dtPhongHoc.length < me.dtPhongHocFull.length) {
            var remaining = me.dtPhongHocFull.length - me.dtPhongHoc.length;
            $("#scheduleGrid").append('<div class="scroll-notice" style="grid-column: 1/-1; padding: 20px; text-align: center; background: #f8f9fa; color: #666;"><i class="fas fa-arrow-down"></i> Cuộn xuống để xem thêm ' + remaining + ' phòng</div>');
        }
    },

    getList_PhongHoc: function (callback) {
        var me = this;
        
        var obj_save = {
            'action': 'NS_ThongTinCanBo_MH/DSA4BRIRKS4vJgkuIgPP',
            'func': 'pkg_congthongtincanbo.LayDSPhongHoc',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtPhongHocFull = data.Data || [];
                    
                    // Apply room filter if selected
                    if (me.strSelectedBuilding) {
                        console.log("Lọc theo phòng ID:", me.strSelectedBuilding);
                        me.dtPhongHocFull = me.dtPhongHocFull.filter(function(room) {
                            return room.ID === me.strSelectedBuilding;
                        });
                        console.log("Sau khi lọc:", me.dtPhongHocFull.length, "phòng");
                    }
                    
                    if (typeof callback === 'function') callback();
                }
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
        }, false, false, false, null);
    },

    getList_LichPhongHoc: function (strPhongHoc_Id, callback) {
        var me = this;
        
        var obj_save = {
            'action': 'NS_ThongTinCanBo_MH/DSA4DSgiKREpLi8mCS4i',
            'func': 'pkg_congthongtincanbo.LayLichPhongHoc',
            'iM': edu.system.iM,
            'strIdPhongHoc': strPhongHoc_Id,
            'strNgayBatDau': me.strNgayBatDau,
            'strNgayKetThuc': me.strNgayKetThuc,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (typeof callback === 'function') {
                    callback(data.Success ? (data.Data || []) : []);
                }
            },
            error: function () {
                if (typeof callback === 'function') callback([]);
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
        }, false, false, false, null);
    },

    getList_ToaNha: function () {
        var me = this;
        
        var obj_save = {
            'action': 'NS_ThongTinCanBo_MH/DSA4BRIRKS4vJgkuIgPP',
            'func': 'pkg_congthongtincanbo.LayDSPhongHoc',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var rooms = data.Data || [];
                    
                    console.log("Tổng số phòng học:", rooms.length);
                    
                    // Convert rooms to dropdown format
                    var roomList = rooms.map(function(room) {
                        return {
                            ID: room.ID,
                            TEN: room.TEN || room.TENPHONGHOC || room.MA || 'Phòng ' + room.ID
                        };
                    });
                    
                    // Sort by name
                    roomList.sort(function(a, b) {
                        return a.TEN.localeCompare(b.TEN);
                    });
                    
                    me.dtToaNha = roomList;
                    me.genCombo_ToaNha(roomList);
                }
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
        }, false, false, false, null);
    },

    genCombo_ToaNha: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
            },
            renderPlace: ["dropSearch_ToaNha"],
            title: "Chọn phòng học"
        };
        edu.system.loadToCombo_data(obj);
        $("#dropSearch_ToaNha").select2({
            placeholder: "Tìm kiếm phòng học...",
            allowClear: true
        });
    },

    genTable_ThongTin: function (data, iPager) {
        var me = this;
        
        console.log("=== genTable_ThongTin ===");
        console.log("Số phòng:", me.dtPhongHoc.length);
        console.log("Số lịch:", data.length);
        
        if (me.dtPhongHoc.length === 0) {
            $("#scheduleGrid").html('<div style="padding: 40px; text-align: center; grid-column: 1/-1;">Không có dữ liệu phòng học</div>');
            return;
        }

        var arrDays = me.getDaysInWeek(me.strNgayBatDau, me.strNgayKetThuc);
        
        // Thay đổi grid template để có 3 hàng cho mỗi phòng (Sáng/Chiều/Tối)
        var html = '';
        
        // Header chính - Phòng và các ngày
        html += '<div class="schedule-header" style="grid-column: 1; grid-row: 1 / 3;">Phòng</div>';
        
        arrDays.forEach(function (day, index) {
            var colStart = index + 2;
            html += '<div class="schedule-header" style="grid-column: ' + colStart + '; grid-row: 1;">';
            html += '<div>' + day.dayName + '</div>';
            html += '<div style="font-size: 12px; font-weight: normal;">' + day.dateStr + '</div>';
            html += '</div>';
        });
        
        // Sub-header - Sáng/Chiều/Tối cho mỗi ngày
        arrDays.forEach(function (day, index) {
            var colStart = index + 2;
            html += '<div class="schedule-subheader" style="grid-column: ' + colStart + '; grid-row: 2;">';
            html += '<div>';
            html += '<div class="session-label" style="border-right: 1px solid #ddd; background: #FFF9E6;">';
            html += '<div class="session-name">☀️ SÁNG</div>';
            html += '<div class="session-time">Tiết 1-6</div>';
            html += '</div>';
            html += '<div class="session-label" style="border-right: 1px solid #ddd; background: #E6F3FF;">';
            html += '<div class="session-name">🌤️ CHIỀU</div>';
            html += '<div class="session-time">Tiết 7-10</div>';
            html += '</div>';
            html += '<div class="session-label" style="background: #F0E6FF;">';
            html += '<div class="session-name">🌙 TỐI</div>';
            html += '<div class="session-time">Tiết 11-15</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });

        // Dữ liệu từng phòng
        var currentRow = 3;
        me.dtPhongHoc.forEach(function (room) {
            var roomInfo = '<div style="font-weight: 600; margin-bottom: 3px;">' + room.TEN + '</div>';
            
            // Thêm kiểu phòng nếu có
            if (room.KIEUPHONG) {
                roomInfo += '<div style="font-size: 10px; color: #666; margin-bottom: 2px;">';
                roomInfo += '<span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-weight: 600;">' + room.KIEUPHONG + '</span>';
                roomInfo += '</div>';
            }
            
            // Thêm mô tả kiểu phòng
            var moTa = room.MOTAKIEUPHONG;
            if (!moTa && room.KIEUPHONG === 'TH') {
                moTa = 'Phòng thực hành';
            }
            if (moTa) {
                roomInfo += '<div style="font-size: 9px; color: #888; font-style: italic;">' + moTa + '</div>';
            }
            
            html += '<div class="schedule-cell room-name" style="grid-column: 1; grid-row: ' + currentRow + ';">' + roomInfo + '</div>';
            
            arrDays.forEach(function (day, dayIndex) {
                var colStart = dayIndex + 2;
                
                // Lấy tất cả events của ngày này
                var events = data.filter(function (item) {
                    return item.IDPHONGHOC === room.ID && item.NGAYHOC === day.date;
                });
                
                // Debug: Log events
                if (events.length > 0) {
                    console.log("Events for room", room.TEN, "day", day.date, ":", events.length);
                    console.log("Sample event ID:", events[0].ID);
                }
                
                // Phân loại theo ca
                var sangEvents = events.filter(function(e) { 
                    return e.TIETBATDAU && e.TIETBATDAU >= 1 && e.TIETBATDAU <= 6; 
                });
                var chieuEvents = events.filter(function(e) { 
                    return e.TIETBATDAU && e.TIETBATDAU >= 7 && e.TIETBATDAU <= 10; 
                });
                var toiEvents = events.filter(function(e) { 
                    return e.TIETBATDAU && e.TIETBATDAU >= 11 && e.TIETBATDAU <= 15; 
                });
                
                // Sort theo giờ
                [sangEvents, chieuEvents, toiEvents].forEach(function(arr) {
                    arr.sort(function (a, b) {
                        return (a.GIOBATDAU * 60 + a.PHUTBATDAU) - (b.GIOBATDAU * 60 + b.PHUTBATDAU);
                    });
                });
                
                // Container cho 3 ca
                html += '<div style="grid-column: ' + colStart + '; grid-row: ' + currentRow + '; display: flex; border: 1px solid #e0e0e0; min-height: 120px;">';
                
                // Ca sáng
                html += '<div style="flex: 1; padding: 4px; border-right: 1px solid #e0e0e0; background: #FFFEF5;">';
                sangEvents.forEach(function (event, idx) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var uniqueId = event.ID || ('evt_' + room.ID + '_' + day.date + '_sang_' + idx);
                    var giangVien = me.cleanHtmlTags(event.THONGTINGIANGVIEN);
                    html += '<div class="schedule-event ' + colorClass + '" data-event-id="' + uniqueId + '" data-room-id="' + room.ID + '" data-date="' + day.date + '" data-lophocphan="' + event.IDLOPHOCPHAN + '" title="' + event.TENHOCPHAN + '" style="margin: 2px 0;">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (giangVien) {
                        html += '<div class="event-teacher">' + giangVien + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                
                // Ca chiều
                html += '<div style="flex: 1; padding: 4px; border-right: 1px solid #e0e0e0; background: #F5F9FF;">';
                chieuEvents.forEach(function (event, idx) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var uniqueId = event.ID || ('evt_' + room.ID + '_' + day.date + '_chieu_' + idx);
                    var giangVien = me.cleanHtmlTags(event.THONGTINGIANGVIEN);
                    html += '<div class="schedule-event ' + colorClass + '" data-event-id="' + uniqueId + '" data-room-id="' + room.ID + '" data-date="' + day.date + '" data-lophocphan="' + event.IDLOPHOCPHAN + '" title="' + event.TENHOCPHAN + '" style="margin: 2px 0;">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (giangVien) {
                        html += '<div class="event-teacher">' + giangVien + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                
                // Ca tối
                html += '<div style="flex: 1; padding: 4px; background: #F9F5FF;">';
                toiEvents.forEach(function (event, idx) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var uniqueId = event.ID || ('evt_' + room.ID + '_' + day.date + '_toi_' + idx);
                    var giangVien = me.cleanHtmlTags(event.THONGTINGIANGVIEN);
                    html += '<div class="schedule-event ' + colorClass + '" data-event-id="' + uniqueId + '" data-room-id="' + room.ID + '" data-date="' + day.date + '" data-lophocphan="' + event.IDLOPHOCPHAN + '" title="' + event.TENHOCPHAN + '" style="margin: 2px 0;">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (giangVien) {
                        html += '<div class="event-teacher">' + giangVien + '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                
                html += '</div>';
            });
            
            currentRow++;
        });

        $("#scheduleGrid").html(html);
        
        if (me.dtPhongHocFull.length > me.dtPhongHoc.length) {
            var remaining = me.dtPhongHocFull.length - me.dtPhongHoc.length;
            $("#scheduleGrid").append('<div class="scroll-notice" style="grid-column: 1/-1; padding: 20px; text-align: center; background: #f8f9fa; color: #666;"><i class="fas fa-arrow-down"></i> Cuộn xuống để xem thêm ' + remaining + ' phòng</div>');
        }
        
        console.log("Grid đã được tạo với format Sáng/Chiều/Tối");
    },

    showScheduleDetail: function (strId, roomId, date, lopHocPhan) {
        var me = this;
        
        console.log("=== Show Schedule Detail ===");
        console.log("ID:", strId, "Room:", roomId, "Date:", date, "LopHocPhan:", lopHocPhan);
        console.log("Total schedules:", me.dtLichHoc.length);
        
        // Try to find by ID first
        var objLich = me.dtLichHoc.find(function(e) { return e.ID === strId; });
        
        // If not found by ID, try to find by other properties
        if (!objLich && roomId && date && lopHocPhan) {
            console.log("Searching by room, date, and lophocphan...");
            objLich = me.dtLichHoc.find(function(e) { 
                return e.IDPHONGHOC === roomId && 
                       e.NGAYHOC === date && 
                       e.IDLOPHOCPHAN === lopHocPhan;
            });
        }
        
        console.log("Found schedule:", objLich);
        
        if (!objLich) {
            console.error("Không tìm thấy lịch với ID:", strId);
            edu.system.alert("Không tìm thấy thông tin lịch học!");
            return;
        }
        
        // Học phần
        $("#lblHocPhan").html(objLich.TENHOCPHAN || 'Chưa có thông tin');
        
        // Lớp học phần
        $("#lblLopHocPhan").html('Lớp: ' + (objLich.TENLOPHOCPHAN || 'Chưa có thông tin'));
        
        // Phòng học
        $("#txtPhongHoc_Detail").val(objLich.TENPHONGHOC || 'Chưa có thông tin');
        
        // Ngày học
        $("#txtNgayHoc_Detail").val(objLich.NGAYHOC || 'Chưa có thông tin');
        
        // Thời gian
        var thoiGian = me.returnTwo(objLich.GIOBATDAU) + ':' + me.returnTwo(objLich.PHUTBATDAU) + 
                       ' - ' + me.returnTwo(objLich.GIOKETTHUC) + ':' + me.returnTwo(objLich.PHUTKETTHUC);
        $("#txtThoiGian_Detail").val(thoiGian);
        
        // Tiết học
        var tietHoc = 'Tiết ' + (objLich.TIETBATDAU || '?') + ' - ' + (objLich.TIETKETTHUC || '?');
        $("#txtTietHoc_Detail").val(tietHoc);
        
        // Giảng viên - Remove <br> tags
        var giangVienText = me.cleanHtmlTags(objLich.THONGTINGIANGVIEN) || 'Chưa có thông tin';
        $("#txtGiangVien_Detail").val(giangVienText);
        
        // Show modal
        try {
            var modalEl = document.getElementById('modal_detail');
            if (modalEl) {
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    var modal = new bootstrap.Modal(modalEl);
                    modal.show();
                } else {
                    $("#modal_detail").modal("show");
                }
                console.log("Modal opened successfully");
            } else {
                console.error("Modal element not found!");
            }
        } catch (e) {
            console.error("Error opening modal:", e);
            $("#modal_detail").modal("show");
        }
    },

    getDaysInWeek: function (strStart, strEnd) {
        var arrDays = [];
        var dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        
        var parts = strStart.split('/');
        var currentDate = new Date(parts[2], parts[1] - 1, parts[0]);
        
        var endParts = strEnd.split('/');
        var endDate = new Date(endParts[2], endParts[1] - 1, endParts[0]);
        
        while (currentDate <= endDate) {
            var day = currentDate.getDate();
            var month = currentDate.getMonth() + 1;
            var year = currentDate.getFullYear();
            var dayOfWeek = currentDate.getDay();
            
            arrDays.push({
                date: this.returnTwo(day) + '/' + this.returnTwo(month) + '/' + year,
                dateStr: this.returnTwo(day) + '/' + this.returnTwo(month),
                dayName: dayNames[dayOfWeek]
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return arrDays;
    },

    getColorClass: function (strLopHocPhan_Id) {
        var me = this;
        
        var found = me.arrLopHocPhanMau.find(function (item) {
            return item.ID === strLopHocPhan_Id;
        });
        
        if (!found) {
            var colorIndex = me.arrLopHocPhanMau.length % me.arrMauNen.length;
            me.arrLopHocPhanMau.push({
                ID: strLopHocPhan_Id,
                COLOR_INDEX: colorIndex + 1
            });
            return 'color-' + (colorIndex + 1);
        }
        
        return 'color-' + found.COLOR_INDEX;
    },

    genHtml_Month: function (cal) {
        var nMonth = parseInt($("#thang").attr("title"));
        var nYear = parseInt($("#nam").attr("title"));
        nMonth += cal;
        if (nMonth == 0) {
            nMonth = 12;
            nYear--;
            $("#nam").attr("title", nYear);
            $("#nam").html(nYear);
        }
        if (nMonth == 13) {
            nMonth = 1;
            nYear++;
            $("#nam").attr("title", nYear);
            $("#nam").html(nYear);
        }
        $("#thang").attr("title", nMonth);
        $("#thang").html("Tháng " + nMonth);

        var iDayOfMonth = getDay(nMonth, nYear);

        var strDay = edu.util.dateToday();
        var iDay = parseInt(strDay.substr(0, strDay.indexOf("/")));

        var iThu = new Date(nYear, nMonth - 1, 1, 0, 0, 0, 0);
        iThu = iThu.getDay();
        if (iThu == 0) iThu = 7;
        var html = "";
        var strNgayBatDau = '';
        var strNgayKetThuc = '';
        var uuid = edu.util.uuid();
        var iDayOfPreMonth = getDay(nMonth - 1, nYear);
        for (var i = iThu - 2; i >= 0; i--) {
            html += '<li class="day-of-other-month ' + uuid + '" title="' + getSMonth(iDayOfPreMonth - i, (nMonth - 1), nYear) + '" >' + (iDayOfPreMonth - i) + '</li>';
        }

        var date = new Date();
        if (date.getMonth() + 1 != nMonth || date.getFullYear() != nYear) iDay = 1;

        if (iThu > 1) {
            strNgayBatDau = getSMonth(iDayOfPreMonth - iThu + 2, (nMonth - 1), nYear);
            strNgayKetThuc = getSMonth(8 - iThu, nMonth, nYear);
        }
        for (var i = 1; i <= iDayOfMonth; i++) {
            var strClass = "";
            if (i == iDay) strClass = 'active';
            if ((i % 7 + iThu) % 7 == 2) {
                strNgayBatDau = getSMonth(i, nMonth, nYear);
                strNgayKetThuc = (i + 6 > iDayOfMonth) ? getSMonth(i + 6 - iDayOfMonth, (nMonth + 1), nYear) : getSMonth(i + 6, nMonth, nYear);
                uuid = edu.util.uuid();
            }

            html += '<li class="poiter ' + strClass + ' ' + uuid + '" ngay="' + i + '"  title="' + getSMonth(i, nMonth, nYear) + '" name="' + uuid + '" batdau="' + strNgayBatDau + '" ketthuc="' + strNgayKetThuc + '"><span>' + i + '</span></li>';
        }
        var iMax = 35 - iDayOfMonth - iThu;
        if (iMax < 0) iMax += 7;
        for (var i = 1; i < iMax + 2; i++) {
            html += '<li class="day-of-other-month ' + uuid + '" title="' + getSMonth(i, (nMonth + 1), nYear) + '">' + i + '</li>';
        }
        $(".days").html(html);
        setTimeout(function () {
            $(".days .active").trigger("click");
        }, 1000);

        function getDay(nMonth, nYear) {
            var iDayOfMonth = 31;
            switch (nMonth) {
                case 2: {
                    iDayOfMonth = 28;
                    if (nYear % 4 == 0) iDayOfMonth = 29;
                } break;
                case 4:
                case 6:
                case 9:
                case 11: iDayOfMonth = 30; break;
            }
            return iDayOfMonth;
        }
        function getSMonth(iDay, nMonth, Year) {
            if (nMonth == 0) {
                nMonth = 12;
                Year--;
            }
            if (nMonth == 13) {
                nMonth = 1;
                Year++;
            }
            return returnTwo(iDay) + '/' + returnTwo(nMonth) + '/' + Year;
        }

        function returnTwo(iDay) {
            iDay = "" + iDay;
            if (iDay.length == 1) return "0" + iDay;
            else return iDay;
        }
    },
    
    returnTwo: function (iDay) {
        iDay = "" + iDay;
        if (iDay.length == 1) return "0" + iDay;
        else return iDay;
    },

    showExportModal: function () {
        var me = this;
        
        if (!me.strNgayBatDau || !me.strNgayKetThuc) {
            edu.system.alert("Vui lòng chọn tuần trước khi xuất");
            return;
        }
        
        console.log("Opening export modal...");
        
        // Load danh sách phòng vào dropdown
        var roomOptions = '<option value="">-- Chọn phòng --</option>';
        if (me.dtToaNha && me.dtToaNha.length > 0) {
            me.dtToaNha.forEach(function(room) {
                roomOptions += '<option value="' + room.ID + '">' + room.TEN + '</option>';
            });
        }
        $("#exportCustomRoom").html(roomOptions);
        
        // Set default dates
        var startParts = me.strNgayBatDau.split('/');
        var endParts = me.strNgayKetThuc.split('/');
        var startDate = startParts[2] + '-' + startParts[1] + '-' + startParts[0];
        var endDate = endParts[2] + '-' + endParts[1] + '-' + endParts[0];
        
        $("#exportSingleDate").val(startDate);
        $("#exportStartDate").val(startDate);
        $("#exportEndDate").val(endDate);
        
        // Reset form
        $("#exportTimeRange").val("current_week");
        $("#exportRoomFilter").val("all");
        $("#exportFileFormat").val("xlsx");
        $("#customDateSection").hide();
        $("#customRangeSection").hide();
        $("#customRoomSection").hide();
        
        // Show modal - thử cả 2 cách
        try {
            var modalEl = document.getElementById('modal_export_excel');
            if (modalEl) {
                // Bootstrap 5
                if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    var modal = new bootstrap.Modal(modalEl);
                    modal.show();
                } else {
                    // Bootstrap 4 hoặc jQuery
                    $("#modal_export_excel").modal("show");
                }
                console.log("Modal opened successfully");
            } else {
                console.error("Modal element not found!");
                edu.system.alert("Không tìm thấy modal. Vui lòng refresh trang!");
            }
        } catch (e) {
            console.error("Error opening modal:", e);
            edu.system.alert("Lỗi mở modal: " + e.message);
        }
    },

    processExport: function () {
        var me = this;
        
        var timeRange = $("#exportTimeRange").val();
        var roomFilter = $("#exportRoomFilter").val();
        var fileFormat = $("#exportFileFormat").val();
        
        var startDate, endDate;
        
        // Xác định khoảng thời gian
        if (timeRange === "current_week") {
            startDate = me.strNgayBatDau;
            endDate = me.strNgayKetThuc;
        } else if (timeRange === "custom_date") {
            var dateVal = $("#exportSingleDate").val();
            if (!dateVal) {
                edu.system.alert("Vui lòng chọn ngày");
                return;
            }
            var parts = dateVal.split('-');
            startDate = endDate = parts[2] + '/' + parts[1] + '/' + parts[0];
        } else if (timeRange === "custom_range") {
            var startVal = $("#exportStartDate").val();
            var endVal = $("#exportEndDate").val();
            if (!startVal || !endVal) {
                edu.system.alert("Vui lòng chọn đầy đủ khoảng thời gian");
                return;
            }
            var startParts = startVal.split('-');
            var endParts = endVal.split('-');
            startDate = startParts[2] + '/' + startParts[1] + '/' + startParts[0];
            endDate = endParts[2] + '/' + endParts[1] + '/' + endParts[0];
        }
        
        // Xác định phòng cần xuất
        var roomsToExport = [];
        if (roomFilter === "all") {
            // Lấy TẤT CẢ phòng từ API, không phải từ dtPhongHocFull
            if (me.dtToaNha && me.dtToaNha.length > 0) {
                roomsToExport = me.dtToaNha;
            } else {
                edu.system.alert("Đang tải danh sách phòng...");
                // Gọi lại API để lấy đầy đủ
                me.getList_ToaNha();
                setTimeout(function() {
                    me.processExport();
                }, 1000);
                return;
            }
        } else if (roomFilter === "current") {
            if (me.strSelectedBuilding) {
                // Nếu đang lọc 1 phòng
                roomsToExport = me.dtPhongHocFull;
            } else {
                // Nếu đang xem tất cả nhưng chỉ load 1 phần
                roomsToExport = me.dtPhongHocFull;
            }
        } else if (roomFilter === "custom") {
            var selectedRoomId = $("#exportCustomRoom").val();
            if (!selectedRoomId) {
                edu.system.alert("Vui lòng chọn phòng");
                return;
            }
            roomsToExport = me.dtToaNha.filter(function(r) {
                return r.ID === selectedRoomId;
            });
        }
        
        if (roomsToExport.length === 0) {
            edu.system.alert("Không có phòng nào để xuất");
            return;
        }
        
        console.log("Xuất Excel:");
        console.log("- Thời gian:", startDate, "-", endDate);
        console.log("- Số phòng:", roomsToExport.length);
        console.log("- Định dạng:", fileFormat);
        
        // Đóng modal
        $("#modal_export_excel").modal("hide");
        
        // Hiển thị loading
        edu.system.alert("Đang xử lý dữ liệu...");
        
        // Gọi API lấy dữ liệu theo khoảng thời gian mới
        me.exportWithCustomData(startDate, endDate, roomsToExport, fileFormat);
    },

    exportWithCustomData: function (startDate, endDate, rooms, fileFormat) {
        var me = this;
        var exportData = [];
        var loadedCount = 0;
        
        // Load lịch cho từng phòng
        rooms.forEach(function(room) {
            var obj_save = {
                'action': 'NS_ThongTinCanBo_MH/DSA4DSgiKREpLi8mCS4i',
                'func': 'pkg_congthongtincanbo.LayLichPhongHoc',
                'iM': edu.system.iM,
                'strIdPhongHoc': room.ID,
                'strNgayBatDau': startDate,
                'strNgayKetThuc': endDate,
            };

            edu.system.makeRequest({
                success: function (data) {
                    if (data.Success && data.Data) {
                        exportData = exportData.concat(data.Data);
                    }
                    loadedCount++;
                    
                    if (loadedCount === rooms.length) {
                        // Đã load xong tất cả
                        if (fileFormat === "xlsx") {
                            me.exportToExcelAdvanced(startDate, endDate, rooms, exportData);
                        } else {
                            me.exportToCSVAdvanced(startDate, endDate, rooms, exportData);
                        }
                    }
                },
                error: function () {
                    loadedCount++;
                    if (loadedCount === rooms.length) {
                        if (fileFormat === "xlsx") {
                            me.exportToExcelAdvanced(startDate, endDate, rooms, exportData);
                        } else {
                            me.exportToCSVAdvanced(startDate, endDate, rooms, exportData);
                        }
                    }
                },
                type: 'POST',
                action: obj_save.action,
                contentType: true,
                data: obj_save,
            }, false, false, false, null);
        });
    },

    exportToExcelAdvanced: function (startDate, endDate, rooms, scheduleData) {
        var me = this;
        
        console.log("=== Export Excel ===");
        console.log("ExcelJS available:", typeof ExcelJS !== 'undefined');
        console.log("XLSX available:", typeof XLSX !== 'undefined');
        
        // Check if ExcelJS library is available
        if (typeof ExcelJS === 'undefined') {
            console.warn('ExcelJS library not available, trying XLSX with better format');
            me.exportToExcelWithXLSX(startDate, endDate, rooms, scheduleData);
            return;
        }
        
        console.log("Using ExcelJS for export...");
        
        // Tạo workbook với ExcelJS
        var workbook = new ExcelJS.Workbook();
        workbook.creator = 'Hệ thống quản lý';
        workbook.created = new Date();
        
        var worksheet = workbook.addWorksheet('Lịch giảng', {
            pageSetup: { 
                paperSize: 9, 
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1
            }
        });
        
        var arrDays = me.getDaysInWeek(startDate, endDate);
        var numCols = arrDays.length + 2; // STT + Phòng + các ngày
        
        // ===== TIÊU ĐỀ CHÍNH =====
        worksheet.mergeCells(1, 1, 1, numCols);
        var titleCell = worksheet.getCell(1, 1);
        titleCell.value = 'LỊCH GIẢNG NHIỀU PHÒNG HỌC';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 30;
        
        // ===== THÔNG TIN THỜI GIAN =====
        worksheet.mergeCells(2, 1, 2, numCols);
        var timeCell = worksheet.getCell(2, 1);
        timeCell.value = 'Thời gian: ' + startDate + ' - ' + endDate;
        timeCell.font = { name: 'Arial', size: 12, bold: true };
        timeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
        timeCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(2).height = 25;
        
        // ===== THÔNG TIN THỐNG KÊ =====
        worksheet.mergeCells(3, 1, 3, Math.floor(numCols/2));
        var statsCell1 = worksheet.getCell(3, 1);
        statsCell1.value = 'Số phòng: ' + rooms.length;
        statsCell1.font = { name: 'Arial', size: 11, bold: true };
        statsCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        statsCell1.alignment = { vertical: 'middle', horizontal: 'center' };
        
        worksheet.mergeCells(3, Math.floor(numCols/2) + 1, 3, numCols);
        var statsCell2 = worksheet.getCell(3, Math.floor(numCols/2) + 1);
        statsCell2.value = 'Ngày xuất: ' + new Date().toLocaleString('vi-VN');
        statsCell2.font = { name: 'Arial', size: 11, bold: true };
        statsCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        statsCell2.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(3).height = 22;
        
        // ===== HEADER =====
        var headerRow = worksheet.getRow(5);
        headerRow.height = 35;
        
        // STT
        var sttCell = headerRow.getCell(1);
        sttCell.value = 'STT';
        sttCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        sttCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        sttCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        sttCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        
        // Phòng học
        var roomCell = headerRow.getCell(2);
        roomCell.value = 'Phòng học';
        roomCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        roomCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        roomCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        roomCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        
        // Các ngày trong tuần
        arrDays.forEach(function (day, index) {
            var dayCell = headerRow.getCell(index + 3);
            dayCell.value = day.dayName + '\n' + day.dateStr;
            dayCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            dayCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            dayCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            dayCell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        });
        
        // ===== DỮ LIỆU TỪNG PHÒNG =====
        var currentRow = 6;
        rooms.forEach(function (room, roomIndex) {
            var dataRow = worksheet.getRow(currentRow);
            dataRow.height = 60; // Chiều cao tự động theo nội dung
            
            // STT
            var sttDataCell = dataRow.getCell(1);
            sttDataCell.value = roomIndex + 1;
            sttDataCell.font = { name: 'Arial', size: 11 };
            sttDataCell.alignment = { vertical: 'middle', horizontal: 'center' };
            sttDataCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
            sttDataCell.border = {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
            };
            
            // Tên phòng
            var roomDataCell = dataRow.getCell(2);
            roomDataCell.value = room.TEN;
            roomDataCell.font = { name: 'Arial', size: 11, bold: true };
            roomDataCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            roomDataCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
            roomDataCell.border = {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
            };
            
            // Lịch học từng ngày
            arrDays.forEach(function (day, dayIndex) {
                var events = scheduleData.filter(function (item) {
                    return item.IDPHONGHOC === room.ID && item.NGAYHOC === day.date;
                });
                
                // Sort theo giờ
                events.sort(function (a, b) {
                    return (a.GIOBATDAU * 60 + a.PHUTBATDAU) - (b.GIOBATDAU * 60 + b.PHUTBATDAU);
                });
                
                var dayDataCell = dataRow.getCell(dayIndex + 3);
                
                if (events.length > 0) {
                    // Tạo rich text với format đẹp
                    var richText = [];
                    
                    events.forEach(function (event, eventIndex) {
                        if (eventIndex > 0) {
                            richText.push({ text: '\n━━━━━━━━━━\n', font: { color: { argb: 'FF999999' }, size: 9 } });
                        }
                        
                        // Thời gian
                        richText.push({
                            text: '⏰ ' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + 
                                  ' - ' + me.returnTwo(event.GIOKETTHUC) + ':' + me.returnTwo(event.PHUTKETTHUC),
                            font: { bold: true, color: { argb: 'FF0066CC' }, size: 10 }
                        });
                        
                        if (event.TIETBATDAU) {
                            richText.push({
                                text: ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')',
                                font: { color: { argb: 'FF666666' }, size: 9 }
                            });
                        }
                        
                        // Học phần
                        richText.push({
                            text: '\n📚 ' + event.TENHOCPHAN,
                            font: { bold: true, color: { argb: 'FF000000' }, size: 10 }
                        });
                        
                        // Lớp
                        if (event.TENLOPHOCPHAN) {
                            richText.push({
                                text: '\n👥 ' + event.TENLOPHOCPHAN,
                                font: { color: { argb: 'FF333333' }, size: 9 }
                            });
                        }
                        
                        // Giảng viên
                        if (event.THONGTINGIANGVIEN) {
                            richText.push({
                                text: '\n👨‍🏫 ' + event.THONGTINGIANGVIEN,
                                font: { color: { argb: 'FF006600' }, size: 9, italic: true }
                            });
                        }
                    });
                    
                    dayDataCell.value = { richText: richText };
                    dayDataCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFACD' } };
                } else {
                    dayDataCell.value = '';
                    dayDataCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }
                
                dayDataCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                dayDataCell.border = {
                    top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                };
            });
            
            currentRow++;
        });
        
        // ===== THỐNG KÊ CUỐI =====
        currentRow += 1;
        worksheet.mergeCells(currentRow, 1, currentRow, numCols);
        var summaryCell = worksheet.getCell(currentRow, 1);
        summaryCell.value = 'THỐNG KÊ: Tổng ' + rooms.length + ' phòng | ' + scheduleData.length + ' lịch học';
        summaryCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(currentRow).height = 25;
        
        // ===== SET COLUMN WIDTH =====
        worksheet.getColumn(1).width = 6;  // STT
        worksheet.getColumn(2).width = 25; // Phòng
        for (var i = 3; i <= numCols; i++) {
            worksheet.getColumn(i).width = 35; // Các ngày
        }
        
        // ===== XUẤT FILE =====
        var fileName = 'LichGiang_' + startDate.replace(/\//g, '') + '_' + 
                       endDate.replace(/\//g, '') + '_' + rooms.length + 'phong.xlsx';
        
        workbook.xlsx.writeBuffer().then(function(buffer) {
            var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            
            edu.system.alert("✅ Xuất Excel thành công!\n📁 File: " + fileName);
        }).catch(function(error) {
            console.error("Lỗi xuất Excel:", error);
            edu.system.alert("❌ Có lỗi khi xuất Excel: " + error.message);
        });
    },
    
    exportToExcelWithXLSX: function (startDate, endDate, rooms, scheduleData) {
        var me = this;
        
        console.log("Using XLSX (SheetJS) for export - limited formatting");
        
        if (typeof XLSX === 'undefined') {
            me.exportToCSVAdvanced(startDate, endDate, rooms, scheduleData);
            return;
        }
        
        var wb = XLSX.utils.book_new();
        var wsData = [];
        var arrDays = me.getDaysInWeek(startDate, endDate);
        
        // Tiêu đề
        wsData.push(['═══════════════════════════════════════════════════════════════']);
        wsData.push(['LỊCH GIẢNG NHIỀU PHÒNG HỌC']);
        wsData.push(['═══════════════════════════════════════════════════════════════']);
        wsData.push(['Thời gian: ' + startDate + ' → ' + endDate]);
        wsData.push(['Số phòng: ' + rooms.length + ' | Tổng lịch: ' + scheduleData.length]);
        wsData.push(['Ngày xuất: ' + new Date().toLocaleString('vi-VN')]);
        wsData.push([]);
        
        // Header
        var headerRow = ['STT', 'PHÒNG HỌC'];
        arrDays.forEach(function (day) {
            headerRow.push(day.dayName.toUpperCase() + ' - ' + day.dateStr);
        });
        wsData.push(headerRow);
        wsData.push([]); // Dòng phân cách
        
        // Dữ liệu
        rooms.forEach(function (room, index) {
            var row = [index + 1, '📍 ' + room.TEN];
            
            arrDays.forEach(function (day) {
                var events = scheduleData.filter(function (item) {
                    return item.IDPHONGHOC === room.ID && item.NGAYHOC === day.date;
                });
                
                events.sort(function (a, b) {
                    return (a.GIOBATDAU * 60 + a.PHUTBATDAU) - (b.GIOBATDAU * 60 + b.PHUTBATDAU);
                });
                
                var cellContent = '';
                events.forEach(function (event, idx) {
                    if (idx > 0) cellContent += '\n' + '─'.repeat(30) + '\n';
                    
                    cellContent += '⏰ ' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + 
                                  ' → ' + me.returnTwo(event.GIOKETTHUC) + ':' + me.returnTwo(event.PHUTKETTHUC);
                    
                    if (event.TIETBATDAU) {
                        cellContent += ' (Tiết ' + event.TIETBATDAU + '→' + event.TIETKETTHUC + ')';
                    }
                    
                    cellContent += '\n📚 ' + event.TENHOCPHAN.toUpperCase();
                    
                    if (event.TENLOPHOCPHAN) {
                        cellContent += '\n👥 Lớp: ' + event.TENLOPHOCPHAN;
                    }
                    
                    if (event.THONGTINGIANGVIEN) {
                        cellContent += '\n👨‍🏫 GV: ' + event.THONGTINGIANGVIEN;
                    }
                });
                
                row.push(cellContent || '(Trống)');
            });
            
            wsData.push(row);
        });
        
        // Thống kê
        wsData.push([]);
        wsData.push(['═══════════════════════════════════════════════════════════════']);
        wsData.push(['📊 THỐNG KÊ: ' + rooms.length + ' phòng | ' + scheduleData.length + ' lịch học']);
        wsData.push(['═══════════════════════════════════════════════════════════════']);
        
        var ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column width
        var colWidths = [
            { wch: 5 },   // STT
            { wch: 28 }   // Phòng
        ];
        for (var i = 0; i < arrDays.length; i++) {
            colWidths.push({ wch: 45 });
        }
        ws['!cols'] = colWidths;
        
        // Set row heights
        var rowHeights = [];
        for (var i = 0; i < wsData.length; i++) {
            if (i === 1) {
                rowHeights.push({ hpt: 30 }); // Tiêu đề
            } else if (i === 7) {
                rowHeights.push({ hpt: 25 }); // Header
            } else if (i >= 9 && i < wsData.length - 3) {
                rowHeights.push({ hpt: 80 }); // Data rows
            } else {
                rowHeights.push({ hpt: 20 });
            }
        }
        ws['!rows'] = rowHeights;
        
        // Merge cells cho tiêu đề
        var numCols = arrDays.length + 1;
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: numCols } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: numCols } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: numCols } },
            { s: { r: 3, c: 0 }, e: { r: 3, c: numCols } },
            { s: { r: 4, c: 0 }, e: { r: 4, c: numCols } },
            { s: { r: 5, c: 0 }, e: { r: 5, c: numCols } },
            { s: { r: wsData.length - 3, c: 0 }, e: { r: wsData.length - 3, c: numCols } },
            { s: { r: wsData.length - 2, c: 0 }, e: { r: wsData.length - 2, c: numCols } },
            { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: numCols } }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Lịch giảng');
        
        var fileName = 'LichGiang_' + startDate.replace(/\//g, '') + '_' + 
                       endDate.replace(/\//g, '') + '_' + rooms.length + 'phong.xlsx';
        
        try {
            XLSX.writeFile(wb, fileName);
            edu.system.alert("✅ Xuất Excel thành công!\n📁 File: " + fileName + "\n\n⚠️ Lưu ý: File dùng định dạng cơ bản (XLSX không hỗ trợ màu sắc đầy đủ)");
        } catch (e) {
            console.error("Lỗi xuất Excel:", e);
            edu.system.alert("❌ Có lỗi khi xuất Excel: " + e.message);
        }
    },
    
    exportToCSVAdvanced: function (startDate, endDate, rooms, scheduleData) {
        var me = this;
        
        // Tạo CSV content
        var csvContent = '';
        
        // Tiêu đề
        csvContent += 'LỊCH GIẢNG NHIỀU PHÒNG HỌC\n';
        csvContent += 'Thời gian: ' + startDate + ' - ' + endDate + '\n';
        csvContent += 'Số phòng: ' + rooms.length + '\n';
        csvContent += 'Ngày xuất: ' + new Date().toLocaleString('vi-VN') + '\n\n';
        
        // Header
        var arrDays = me.getDaysInWeek(startDate, endDate);
        csvContent += 'STT,Phòng học';
        arrDays.forEach(function (day) {
            csvContent += ',' + day.dayName + ' (' + day.dateStr + ')';
        });
        csvContent += '\n';
        
        // Dữ liệu từng phòng
        rooms.forEach(function (room, index) {
            csvContent += (index + 1) + ',"' + room.TEN + '"';
            
            arrDays.forEach(function (day) {
                var events = scheduleData.filter(function (item) {
                    return item.IDPHONGHOC === room.ID && item.NGAYHOC === day.date;
                });
                
                // Sort theo giờ
                events.sort(function (a, b) {
                    return (a.GIOBATDAU * 60 + a.PHUTBATDAU) - (b.GIOBATDAU * 60 + b.PHUTBATDAU);
                });
                
                // Ghép các buổi học
                var cellContent = '';
                events.forEach(function (event, idx) {
                    if (idx > 0) cellContent += ' | ';
                    
                    cellContent += me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + 
                                  '-' + me.returnTwo(event.GIOKETTHUC) + ':' + me.returnTwo(event.PHUTKETTHUC);
                    
                    if (event.TIETBATDAU) {
                        cellContent += ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')';
                    }
                    
                    cellContent += ' ' + event.TENHOCPHAN;
                    
                    if (event.TENLOPHOCPHAN) {
                        cellContent += ' - Lớp: ' + event.TENLOPHOCPHAN;
                    }
                    
                    if (event.THONGTINGIANGVIEN) {
                        cellContent += ' - GV: ' + event.THONGTINGIANGVIEN;
                    }
                });
                
                csvContent += ',"' + cellContent.replace(/"/g, '""') + '"';
            });
            
            csvContent += '\n';
        });
        
        // Thống kê
        csvContent += '\nTHỐNG KÊ\n';
        csvContent += 'Tổng số phòng:,' + rooms.length + '\n';
        csvContent += 'Tổng số lịch:,' + scheduleData.length + '\n';
        
        // Tạo Blob và download
        var BOM = "\uFEFF"; // UTF-8 BOM for Excel
        var blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        
        var fileName = 'LichGiang_' + startDate.replace(/\//g, '') + '_' + 
                       endDate.replace(/\//g, '') + '_' + rooms.length + 'phong.csv';
        
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        edu.system.alert("✅ Xuất file CSV thành công!\n📁 File: " + fileName);
    },
}
