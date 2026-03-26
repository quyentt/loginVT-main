/*----------------------------------------------
--Author: 
--Date of created: 
--Description: Lịch giảng nhiều phòng học
----------------------------------------------*/
function LichGiangNhieuPhong() { };
LichGiangNhieuPhong.prototype = {
    strNgayBatDau: '',
    strNgayKetThuc: '',
    dtLichHoc: [],
    dtPhongHoc: [],
    arrMauNen: ["#223771", "#d49f3a", "#ec4c00", "#5a7adb", "#3c5398"],
    arrLopHocPhanMau: [],
    iWeekOffset: 0,

    init: function () {
        var me = this;
        
        // Khởi tạo calendar
        var date = new Date();
        var nMonth = date.getMonth() + 1;
        var nYear = date.getFullYear();

        $("#nam").attr("title", nYear);
        $("#nam").html(nYear);
        $("#thang").attr("title", nMonth);
        $("#thang").html("Tháng " + nMonth);
        
        me.genHtml_Month(0);

        // Load danh sách tòa nhà
        me.getList_ToaNha();

        // Sự kiện click ngày trên calendar
        $(".days").delegate(".poiter", "click", function () {
            $(".days .active").removeClass("active");
            this.classList.add("active");
            
            var strNgayBatDau = $(this).attr('batdau');
            var strNgayKetThuc = $(this).attr('ketthuc');
            
            me.strNgayBatDau = strNgayBatDau;
            me.strNgayKetThuc = strNgayKetThuc;
            me.iWeekOffset = 0;
            
            me.updateWeekInfo(strNgayBatDau, strNgayKetThuc);
            me.getList_LichHoc();
        });

        // Sự kiện chuyển tháng
        $(".month").delegate(".prev", "click", function () {
            me.genHtml_Month(-1);
        });
        $(".month").delegate(".next", "click", function () {
            me.genHtml_Month(1);
        });

        // Sự kiện nút tuần trước/sau
        $("#btnPrevWeek").click(function () {
            me.changeWeek(-1);
        });

        $("#btnNextWeek").click(function () {
            me.changeWeek(1);
        });

        // Sự kiện tìm kiếm
        $("#btnSearch").click(function () {
            $(".days .active").trigger("click");
        });

        // Sự kiện xem tất cả
        $("#btnViewAll").click(function () {
            // Reset dropdown về "Tất cả"
            $("#dropSearch_ToaNha").val('').trigger('change');
            // Load lại dữ liệu
            $(".days .active").trigger("click");
        });

        // Sự kiện click vào lịch học
        $("#scheduleGrid").delegate(".schedule-event", "click", function () {
            var strId = this.id;
            me.showDetail(strId);
        });

        // Tự động load tuần hiện tại
        setTimeout(function () {
            $(".days .active").trigger("click");
        }, 500);
    },

    /*------------------------------------------
    --Description: Lấy danh sách phòng học (dùng làm filter)
    -------------------------------------------*/
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
                    console.log("Dữ liệu phòng học:", data.Data);
                    
                    // Trích xuất danh sách tòa nhà từ phòng học
                    var toaNhaMap = {};
                    (data.Data || []).forEach(function(room) {
                        // Thử nhiều field name khác nhau
                        var idToaNha = room.IDTOANHA || room.ID_TOANHA || room.TOANHA_ID;
                        var tenToaNha = room.TENTOANHA || room.TEN_TOANHA || room.TOANHA_TEN || room.TEN;
                        
                        if (idToaNha && tenToaNha) {
                            toaNhaMap[idToaNha] = tenToaNha;
                        }
                    });
                    
                    console.log("Map tòa nhà:", toaNhaMap);
                    
                    // Chuyển thành mảng
                    var arrToaNha = [];
                    for (var id in toaNhaMap) {
                        arrToaNha.push({
                            ID: id,
                            TEN: toaNhaMap[id]
                        });
                    }
                    
                    // Sắp xếp theo tên
                    arrToaNha.sort(function(a, b) {
                        return a.TEN.localeCompare(b.TEN);
                    });
                    
                    console.log("Danh sách tòa nhà:", arrToaNha);
                    
                    if (arrToaNha.length === 0) {
                        console.warn("Không tìm thấy thông tin tòa nhà trong dữ liệu phòng học!");
                        // Fallback: Dùng danh sách phòng học làm filter
                        me.genCombo_ToaNha_Fallback(data.Data);
                    } else {
                        me.genCombo_ToaNha(arrToaNha);
                    }
                } else {
                    console.log("Error loading buildings:", data.Message);
                }
            },
            error: function (er) {
                console.log("Error loading rooms:", er);
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    genCombo_ToaNha: function (data) {
        // Thêm option "Tất cả"
        var allOption = [{
            ID: '',
            TEN: 'Tất cả tòa nhà'
        }];
        
        var obj = {
            data: allOption.concat(data),
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
            },
            renderPlace: ["dropSearch_ToaNha"],
            title: "Chọn tòa nhà"
        };
        edu.system.loadToCombo_data(obj);
        
        // Thêm chức năng search
        $("#dropSearch_ToaNha").select2({
            placeholder: "Chọn tòa nhà",
            allowClear: true,
            width: '100%'
        });
    },

    genCombo_ToaNha_Fallback: function (data) {
        // Nếu không có thông tin tòa nhà, dùng danh sách phòng học
        console.log("Fallback: Sử dụng danh sách phòng học");
        
        var allOption = [{
            ID: '',
            TEN: 'Tất cả phòng học'
        }];
        
        var obj = {
            data: allOption.concat(data),
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
            },
            renderPlace: ["dropSearch_ToaNha"],
            title: "Chọn phòng học"
        };
        edu.system.loadToCombo_data(obj);
        
        // Thêm chức năng search
        $("#dropSearch_ToaNha").select2({
            placeholder: "Tìm kiếm phòng học...",
            allowClear: true,
            width: '100%'
        });
    },

    /*------------------------------------------
    --Description: Lấy danh sách lịch học nhiều phòng (TỐI ƯU)
    -------------------------------------------*/
    getList_LichHoc: function () {
        var me = this;
        
        // Hiển thị loading
        $("#scheduleGrid").html('<div style="padding: 40px; text-align: center; grid-column: 1/-1;"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i><br/><br/><h5>Đang tải dữ liệu...</h5></div>');
        
        // Lấy danh sách phòng học và lịch học cùng lúc
        me.getList_PhongHoc(function() {
            me.getList_TatCaLichHoc();
        });
    },

    /*------------------------------------------
    --Description: Lấy danh sách phòng học
    -------------------------------------------*/
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
                    me.dtPhongHoc = data.Data || [];
                    
                    // Lọc theo tòa nhà hoặc phòng học
                    var strFilter = edu.util.getValById('dropSearch_ToaNha');
                    console.log("Filter được chọn:", strFilter);
                    
                    if (strFilter) {
                        var beforeFilter = me.dtPhongHoc.length;
                        
                        // Thử lọc theo tòa nhà trước
                        var filteredByBuilding = me.dtPhongHoc.filter(function(room) {
                            var idToaNha = room.IDTOANHA || room.ID_TOANHA || room.TOANHA_ID;
                            return idToaNha === strFilter;
                        });
                        
                        // Nếu không có kết quả, thử lọc theo ID phòng
                        if (filteredByBuilding.length === 0) {
                            me.dtPhongHoc = me.dtPhongHoc.filter(function(room) {
                                return room.ID === strFilter;
                            });
                            console.log("Lọc theo phòng: Từ", beforeFilter, "phòng xuống còn", me.dtPhongHoc.length, "phòng");
                        } else {
                            me.dtPhongHoc = filteredByBuilding;
                            console.log("Lọc theo tòa nhà: Từ", beforeFilter, "phòng xuống còn", me.dtPhongHoc.length, "phòng");
                        }
                    } else {
                        console.log("Không lọc - hiển thị tất cả", me.dtPhongHoc.length, "phòng");
                    }
                    
                    if (typeof callback === 'function') {
                        callback();
                    }
                } else {
                    console.log("Error:", data.Message);
                    me.dtPhongHoc = [];
                    me.genScheduleGrid();
                }
            },
            error: function (er) {
                console.log("Error loading rooms:", er);
                me.dtPhongHoc = [];
                me.genScheduleGrid();
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Description: Lấy TẤT CẢ lịch học trong 1 lần gọi API
    -------------------------------------------*/
    getList_TatCaLichHoc: function () {
        var me = this;
        
        // Tạo danh sách ID phòng học
        var arrPhongHocIds = me.dtPhongHoc.map(function(room) {
            return room.ID;
        }).join(',');
        
        if (!arrPhongHocIds) {
            me.genScheduleGrid();
            return;
        }
        
        // Thử gọi API mới trước
        var obj_save = {
            'action': 'NS_ThongTinCanBo_MH/DSA4DSgiKREpLi8mCS4i',
            'func': 'pkg_congthongtincanbo.LayLichNhieuPhongHoc',
            'iM': edu.system.iM,
            'strIdPhongHocs': arrPhongHocIds, // Gửi danh sách ID phòng
            'strNgayBatDau': me.strNgayBatDau,
            'strNgayKetThuc': me.strNgayKetThuc,
        };

        console.log("Thử gọi API mới cho", me.dtPhongHoc.length, "phòng...");

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success && data.Data && data.Data.length > 0) {
                    // API mới hoạt động
                    me.dtLichHoc = data.Data || [];
                    console.log("API mới: Đã load", me.dtLichHoc.length, "lịch học");
                    me.genScheduleGrid();
                } else {
                    // API mới không trả về dữ liệu, dùng cách cũ
                    console.log("API mới không có dữ liệu, chuyển sang fallback");
                    me.loadAllRoomSchedules_Fallback();
                }
            },
            error: function (er) {
                console.log("API mới lỗi, chuyển sang fallback:", er);
                // Nếu lỗi, dùng cách cũ (gọi từng phòng)
                me.loadAllRoomSchedules_Fallback();
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Description: Fallback - Load lịch từng phòng (nếu API không hỗ trợ)
    -------------------------------------------*/
    loadAllRoomSchedules_Fallback: function () {
        var me = this;
        me.dtLichHoc = [];
        
        if (me.dtPhongHoc.length === 0) {
            me.genScheduleGrid();
            return;
        }

        console.log("Đang load lịch cho", me.dtPhongHoc.length, "phòng...");
        
        var totalRooms = me.dtPhongHoc.length;
        var loadedCount = 0;
        var startTime = new Date().getTime();

        // Hiển thị loading ban đầu
        $("#scheduleGrid").html('<div style="padding: 40px; text-align: center; grid-column: 1/-1;"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i><br/><br/><h5>Đang tải lịch học...</h5><div class="progress" style="height: 25px; max-width: 500px; margin: 20px auto;"><div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: 0%" id="loadProgress">0%</div></div><p id="loadStatus">Đang khởi tạo...</p></div>');

        // Gọi song song tất cả các request (không delay)
        me.dtPhongHoc.forEach(function(room) {
            me.getList_LichPhongHoc(room.ID, function(schedules) {
                me.dtLichHoc = me.dtLichHoc.concat(schedules);
                loadedCount++;
                
                // Cập nhật progress
                var percent = Math.round((loadedCount / totalRooms) * 100);
                var elapsed = Math.round((new Date().getTime() - startTime) / 1000);
                var remaining = loadedCount > 0 ? Math.round((elapsed / loadedCount) * (totalRooms - loadedCount)) : 0;
                
                $("#loadProgress").css("width", percent + "%").text(percent + "%");
                $("#loadStatus").html("Đã tải: <b>" + loadedCount + "/" + totalRooms + "</b> phòng | Thời gian: " + elapsed + "s | Còn lại: ~" + remaining + "s");
                
                if (loadedCount === totalRooms) {
                    console.log("✓ Hoàn thành load", me.dtLichHoc.length, "lịch học từ", totalRooms, "phòng trong", elapsed, "giây");
                    me.genScheduleGrid();
                }
            });
        });
    },

    /*------------------------------------------
    --Description: Lấy lịch của 1 phòng học
    -------------------------------------------*/
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
                if (data.Success) {
                    if (typeof callback === 'function') {
                        callback(data.Data || []);
                    }
                } else {
                    if (typeof callback === 'function') {
                        callback([]);
                    }
                }
            },
            error: function (er) {
                if (typeof callback === 'function') {
                    callback([]);
                }
            },
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save,
            fakedb: []
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Description: Trích xuất danh sách phòng học
    -------------------------------------------*/
    extractRooms: function (data) {
        var rooms = [];
        var roomIds = [];
        
        data.forEach(function (item) {
            if (roomIds.indexOf(item.IDPHONGHOC) === -1) {
                roomIds.push(item.IDPHONGHOC);
                rooms.push({
                    ID: item.IDPHONGHOC,
                    TEN: item.TENPHONGHOC,
                    MA: item.MAPHONGHOC
                });
            }
        });
        
        // Sắp xếp theo tên phòng
        rooms.sort(function (a, b) {
            return a.TEN.localeCompare(b.TEN);
        });
        
        return rooms;
    },

    /*------------------------------------------
    --Description: Tạo lưới lịch học
    -------------------------------------------*/
    genScheduleGrid: function () {
        var me = this;
        
        console.log("=== genScheduleGrid ===");
        console.log("Số phòng:", me.dtPhongHoc.length);
        console.log("Số lịch:", me.dtLichHoc.length);
        console.log("Ngày bắt đầu:", me.strNgayBatDau);
        console.log("Ngày kết thúc:", me.strNgayKetThuc);
        
        if (me.dtPhongHoc.length === 0) {
            $("#scheduleGrid").html('<div style="padding: 20px; text-align: center; grid-column: 1/-1;">Không có dữ liệu phòng học</div>');
            return;
        }

        // Tạo mảng ngày trong tuần
        var arrDays = me.getDaysInWeek(me.strNgayBatDau, me.strNgayKetThuc);
        console.log("Số ngày trong tuần:", arrDays.length);
        
        // Tạo header
        var html = '';
        html += '<div class="schedule-header" style="grid-column: 1;">Phòng</div>';
        
        arrDays.forEach(function (day) {
            html += '<div class="schedule-header">';
            html += '<div>' + day.dayName + '</div>';
            html += '<div style="font-size: 12px; font-weight: normal;">' + day.dateStr + '</div>';
            html += '</div>';
        });

        // Tạo các hàng cho từng phòng
        me.dtPhongHoc.forEach(function (room) {
            // Cột tên phòng
            html += '<div class="schedule-cell room-name">' + room.TEN + '</div>';
            
            // Các cột ngày
            arrDays.forEach(function (day) {
                html += '<div class="schedule-cell" data-room="' + room.ID + '" data-date="' + day.date + '">';
                
                // Lọc lịch học của phòng này trong ngày này
                var events = me.dtLichHoc.filter(function (item) {
                    return item.IDPHONGHOC === room.ID && 
                        item.NGAYHOC === day.date;
                });
                
                // Sắp xếp theo giờ bắt đầu
                events.sort(function (a, b) {
                    var timeA = a.GIOBATDAU * 60 + a.PHUTBATDAU;
                    var timeB = b.GIOBATDAU * 60 + b.PHUTBATDAU;
                    return timeA - timeB;
                });
                
                // Hiển thị các sự kiện
                events.forEach(function (event) {
                    var colorClass = me.getColorClass(event.IDLOPHOCPHAN);
                    var tietInfo = '';
                    if (event.TIETBATDAU && event.TIETKETTHUC) {
                        tietInfo = ' (T' + event.TIETBATDAU + '-' + event.TIETKETTHUC + ')';
                    }
                    
                    html += '<div class="schedule-event ' + colorClass + '" id="' + event.ID + '" title="' + event.TENHOCPHAN + '">';
                    html += '<div class="event-time">' + me.returnTwo(event.GIOBATDAU) + ':' + me.returnTwo(event.PHUTBATDAU) + '-' + me.returnTwo(event.GIOKETTHUC) + ':' + me.returnTwo(event.PHUTKETTHUC) + tietInfo + '</div>';
                    html += '<div class="event-subject">' + event.TENHOCPHAN + '</div>';
                    if (event.THONGTINGIANGVIEN) {
                        html += '<div class="event-teacher">' + event.THONGTINGIANGVIEN + '</div>';
                    }
                    html += '</div>';
                });
                
                html += '</div>';
            });
        });

        $("#scheduleGrid").html(html);
        console.log("Grid đã được tạo");
    },

    /*------------------------------------------
    --Description: Lấy danh sách ngày trong tuần
    -------------------------------------------*/
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
                dayName: dayNames[dayOfWeek],
                dayOfWeek: dayOfWeek
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return arrDays;
    },

    /*------------------------------------------
    --Description: Lấy màu cho lớp học phần
    -------------------------------------------*/
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

    /*------------------------------------------
    --Description: Hiển thị chi tiết lịch học
    -------------------------------------------*/
    showDetail: function (strId) {
        var me = this;
        var objLich = me.dtLichHoc.find(function (e) {
            return e.ID === strId;
        });
        
        if (!objLich) return;
        
        $("#lblHocPhan").html('<b>Học phần: ' + objLich.TENHOCPHAN + '</b>');
        $("#lblLopHocPhan").html('<b>Lớp: ' + objLich.TENLOPHOCPHAN + '</b>');
        $("#txtPhongHoc_Detail").val(objLich.TENPHONGHOC);
        $("#txtNgayHoc_Detail").val(objLich.NGAYHOC);
        $("#txtThoiGian_Detail").val(me.returnTwo(objLich.GIOBATDAU) + ':' + me.returnTwo(objLich.PHUTBATDAU) + ' - ' + me.returnTwo(objLich.GIOKETTHUC) + ':' + me.returnTwo(objLich.PHUTKETTHUC));
        $("#txtTietHoc_Detail").val('Tiết ' + objLich.TIETBATDAU + ' - ' + objLich.TIETKETTHUC);
        $("#txtGiangVien_Detail").val(objLich.THONGTINGIANGVIEN || '');
        
        $("#modal_detail").modal("show");
    },

    /*------------------------------------------
    --Description: Chuyển tuần
    -------------------------------------------*/
    changeWeek: function (offset) {
        var me = this;
        me.iWeekOffset += offset;
        
        var parts = me.strNgayBatDau.split('/');
        var startDate = new Date(parts[2], parts[1] - 1, parts[0]);
        startDate.setDate(startDate.getDate() + (offset * 7));
        
        var endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        me.strNgayBatDau = me.returnTwo(startDate.getDate()) + '/' + me.returnTwo(startDate.getMonth() + 1) + '/' + startDate.getFullYear();
        me.strNgayKetThuc = me.returnTwo(endDate.getDate()) + '/' + me.returnTwo(endDate.getMonth() + 1) + '/' + endDate.getFullYear();
        
        me.updateWeekInfo(me.strNgayBatDau, me.strNgayKetThuc);
        me.getList_LichHoc();
    },

    /*------------------------------------------
    --Description: Cập nhật thông tin tuần
    -------------------------------------------*/
    updateWeekInfo: function (strStart, strEnd) {
        var weekNum = this.getWeekNumber(strStart);
        $("#weekInfo").html('Tuần ' + weekNum + ' (' + strStart + ' - ' + strEnd + ')');
    },

    /*------------------------------------------
    --Description: Tính số tuần trong năm
    -------------------------------------------*/
    getWeekNumber: function (strDate) {
        var parts = strDate.split('/');
        var d = new Date(parts[2], parts[1] - 1, parts[0]);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        var yearStart = new Date(d.getFullYear(), 0, 1);
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    },

    /*------------------------------------------
    --Description: Tạo calendar tháng
    -------------------------------------------*/
    genHtml_Month: function (cal) {
        var me = this;
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
    }
}
