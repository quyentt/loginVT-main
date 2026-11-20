/*----------------------------------------------
--Author: nnthuong
--Phone:
--Date of created: 29/06/2018
--Input:
--Output:
--Note:
----------------------------------------------*/
function TraCuuDiem() { };
TraCuuDiem.prototype = {
    dtCotThongTinDiem: [],
    dtCotNguoiHoc: [],
    dtNguoiHoc: [],
    arrHeadDiem_Id: [],
    dtThongTinDiemTB: [],
    strPhamViMa: '',
    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.page_load();
        me.page_load();
        /*------------------------------------------
        --Discription: Load Select
        -------------------------------------------*/
        $(".btnClose").click(function () {
            me.toggle_notify();
        });
        $("#btnSearch").click(function () {
            me.getList_Hoc();
        });
        $("#dropHeDaoTao").on("select2:select", function () {
            me.getList_KhoaDaoTao();
            me.getList_LopQuanLy();
        });
        $("#dropKhoaDaoTao").on("select2:select", function () {
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $("#dropChuongTrinhDaoTao").on("select2:select", function () {
            me.getList_LopQuanLy();
        });
        $("#dropKhoaQuanLy").on("select2:select", function () {
            me.getList_ChuongTrinhDaoTao();
            me.getList_LopQuanLy();
        });
        $("#dropPhanViTongHop").on("select2:select", function () {
            var strMa = $("#dropPhanViTongHop option:selected").attr("id");
            me.strPhamViMa = strMa;
            edu.util.toggle_overide("zonePhamVi", "zone_" + strMa);
            me._capNhatNhanKQHT();
        });
        
        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_Hoc();
            }
        });

        $("[id$=chkSelectAll_Diem]").on("click", function () {
            edu.util.checkedAll_BgRow(this, { table_id: "tblDSDiem" });
        });
        $("#btnXemBangDiem").click(function () {
            me.getList_ThongTinHienThiCot();
        });
        $("#btnThongKeHocTap").click(function () {
            me.openThongKeHocTap();
        });
        $("#btnThongKeHocTapCTDT").click(function () {
            me.openThongKeHocTapCTDT();
        });
        // Kết quả học tập theo phạm vi (Học kỳ / Năm học / Toàn khóa)
        $("#btnKetQuaHocTap").click(function (e) {
            e.preventDefault();
            me.openKetQuaHocTap();
        });
        $("#btnXuatExcel_KQHT").click(function (e) {
            e.preventDefault();
            me.exportExcel_KQHT();
        });
        me._ganCuonNgang_KQHT();
        me._capNhatNhanKQHT();

        $("#zone_input_TraCuuDiem").delegate(".btnReportAll", "click", function () {
            edu.system.reportAllTable_User(this.name);
        });
        $("#zone_input_ThongKeHocTap").delegate(".btnReportAll", "click", function () {
            edu.system.reportAllTable_User(this.name);
        });
        $("#zone_input_ThongKeHocTapCTDT").delegate(".btnReportAll", "click", function () {
            edu.system.reportAllTable_User(this.name);
        });
        $("#tblThongKeHocTap").delegate(".btnXemDSSV_XepLoai", "click", function (e) {
            e.preventDefault();
            me.viewDSSV_XepLoai(
                $(this).data("nid"),
                $(this).data("kdid"),
                $(this).data("xlid"),
                $(this).data("tieude")
            );
        });
        $("#tblThongKeHocTapCTDT").delegate(".btnXemDSSV_XepLoai_CTDT", "click", function (e) {
            e.preventDefault();
            me.viewDSSV_XepLoai_CTDT(
                $(this).data("ctdtid"),
                $(this).data("kdid"),
                $(this).data("xlid"),
                $(this).data("tieude")
            );
        });

        edu.system.getList_MauImport("zonebtnBaoCao_TCD", function (addKeyValue) {
            var arrChecked_Id = edu.util.getArrCheckedIds("tblDSDiem", "checkX");
            if (arrChecked_Id.length > 100) {
                edu.system.alert("Số học phần được chọn không quá 100? Để xem cả lớp vui lòng không chọn học phần!");
                return false;
            }
            var obj_list = {
                'action': 'D_HocPhan_TraCuuDiem/LayDanhSach',
                'strNguoiThucHien_Id': edu.system.userId,
                'strHeDaoTao_Id': edu.util.getValCombo("dropHeDaoTao"),
                'strKhoaDaoTao_Id': edu.util.getValCombo("dropKhoaDaoTao"),
                'strKhoaQuanLy_Id': edu.util.getValCombo("dropKhoaQuanLy"),
                'strToChucCT_Id': edu.util.getValCombo("dropChuongTrinhDaoTao"),
                'strTinhTrangSinhVien_Id': edu.util.getValCombo("dropTinhTrangSinhVien"),
                //'strDaoTao_LopQuanLy_Id': edu.util.getValCombo("dropLopQuanLy"),
                'strPhamViTongHopDiem_Id': edu.util.getValCombo('dropPhanViTongHop'),
                'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValCombo('dropPhanViTongHop_' + main_doc.TraCuuDiem.strPhamViMa),
                'strKieuLocDuLieu': edu.util.getValCombo("dropLocTheo"),
                'strChucNang_Id': edu.system.strChucNang_Id,
                'strDaoTao_HocPhan_Ids': arrChecked_Id.toString()
            };
            var arrX = $("#dropLopQuanLy").val();
            for (var i = 0; i < arrX.length; i++) {
                if (arrX[i] == "" || arrX[i] == "SELECTALL") continue;
                addKeyValue("strDaoTao_LopQuanLy_Id", arrX[i]);
            }
            for (var x in obj_list) {
                addKeyValue(x, obj_list[x]);
            }
        });
    },

    page_load: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        edu.system.page_load();
        me.getList_HeDaoTao();
        me.getList_KhoaDaoTao();
        //me.getList_ChuongTrinhDaoTao();
        //me.getList_LopQuanLy();
        me.getList_KhoaQuanLy();
        me.getList_NamNhapHoc();
        me.getList_ThoiGianDaoTao();
        edu.system.loadToCombo_DanhMucDuLieu("DIEM.PHAMVITONGHOPDIEM", "dropPhamViTongHop", "", me.loadToCombo_PhamVi);
        //edu.system.loadToCombo_DanhMucDuLieu("KHCT.NCN", "dropKhoaQuanLy");
        edu.system.loadToCombo_DanhMucDuLieu("QLSV.TRANGTHAI", "", "", me.cbGenBo_TrangThai);
        edu.system.loadToCombo_DanhMucDuLieu("DIEM.LOAIDIEMTRUNGBINH", "dropSearch_LoaiDiemTrungBinh");
        edu.system.loadToCombo_DanhMucDuLieu("DIEM.THANGDIEM", "dropThangDiem");
        //me.getList_Hoc();
    },
    toggle_notify: function () {
        edu.util.toggle_overide("zone-bus", "zone_notify_TraCuuDiem");
    },
    toggle_detail: function () {
        var me = this;
    },
    toggle_edithienthi: function () {
        var me = this;
        edu.util.toggle_overide("zone-bus", "zone_edithienthi");
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_Hoc: function (strDeTai_Id) {
        var me = this;
        //--Edit
        //var arrChecked_Id = edu.util.getArrCheckedIds("tblDSDiem", "checkX");
        //if (arrChecked_Id.length > 100) {
        //    edu.system.alert("Số học phần được chọn không quá 100? Để xem cả lớp vui lòng không chọn học phần!");
        //    return false;
        //}
        var obj_list = {
            'action': 'D_HocPhan_TraCuuDiem/LayDanhSach',
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo("dropLopQuanLy"),
            'strPhamViTongHopDiem_Id': edu.util.getValById('dropPhanViTongHop'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
            'strKieuLocDuLieu': edu.util.getValCombo("dropLocTheo"),
            'strDaoTao_HocPhan_Ids': "",
        };
        //
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_Hoc(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "s");
                }
                
            },
            error: function (er) {
                
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,
            
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genTable_Hoc: function (data, iPager) {
        var me = this;
        edu.util.viewHTMLById("lblTraCuuDiem_Tong", iPager);
        var jsonForm = {
            strTable_Id: "tblDSDiem",
            aaData: data,
            //bPaginate: {
            //    strFuntionName: "main_doc.TraCuuDiem.getList_Hoc()",
            //    iDataRow: iPager
            //},
            colPos: {
                center: [0, 3]
            },
            aoColumns: [
                {
                    "mDataProp": "MA"
                },
                {
                    "mDataProp": "TEN"
                }
                , {
                    "mRender": function (nRow, aData) {
                        return '<input type="checkbox" id="checkX' + aData.ID + '">';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_ThongTinHienThiCot: function () {
        var me = this;
        var arrChecked_Id = edu.util.getArrCheckedIds("tblDSDiem", "checkX");
        //if (arrChecked_Id.length > 100) {
        //    edu.system.alert("Số học phần được chọn không quá 100? Để xem cả lớp vui lòng không chọn học phần!");
        //    return;
        //}
        edu.util.toggle_overide("zone-bus", "zone_input_TraCuuDiem");
        //--Edit
        var obj_list = {
            'action': 'D_HocPhan_TraCuuDiem/LayChiTiet_Post',
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo("dropLopQuanLy"),
            'strPhamViTongHopDiem_Id': edu.util.getValById('dropPhanViTongHop'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
            'strKieuLocDuLieu': edu.util.getValCombo("dropLocTheo"),
            'strDaoTao_HocPhan_Ids': arrChecked_Id.toString(),
        };
        //
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    var dtCot = dtReRult && dtReRult.rsDSCotThongTinDiemHocPhan;
                    if (!dtCot || dtCot.length === 0) {
                        edu.util.toggle_overide("zone-bus", "zone_notify_TraCuuDiem");
                        edu.system.alert('Không có cột điểm để hiển thị. Vui lòng chọn "Lọc theo" và tick ít nhất 1 học phần trong Danh sách bảng điểm, sau đó thử lại.', 'w');
                        return;
                    }
                    me.genHTML_ThongTinHienThiCot(dtReRult, data.Pager, data.Id);
                    me.getList_NguoiHoc();
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genHTML_ThongTinHienThiCot: function (data, iPager, strCongThuc) {
        var me = this;
        var dtThongTinDiem = data.rsDSCotThongTinDiemHocPhan;
        me.dtCotThongTinDiem = data.rsDSCotThongTinDiemHocPhan;

        var dtNguoiHoc = data.rsDSCotThongTinNguoiHoc;
        me.dtCotNguoiHoc = data.rsDSCotThongTinNguoiHoc;

        var dtThongTinDiemTB = data.rsDSCotThongTinDTB;
        me.dtCotThongTinDiemTB = data.rsDSCotThongTinDTB;
        var row = '';
        row += '<tr>';
        var dChieuDaiHead = 0;
        var iLeftPos = 0;
        for (var i = 0; i < dtNguoiHoc.length; i++) {
            var colWidth = edu.util.returnZero(dtNguoiHoc[i].DORONG);
            row += '<th rowspan="2" class="sticky-col sticky-col-' + i + '" ' + me.getstyle(dtNguoiHoc[i]) + ' >' + dtNguoiHoc[i].TENCOT + '</th>';
            dChieuDaiHead += colWidth;
            iLeftPos += colWidth;
        }
        me.stickyColCount = dtNguoiHoc.length;
        row += '</tr><tr></tr>';
        //$("#tblTraCuuDiemNguoiHoc thead").html(row);
        var strDiemTrungBinh = "";
        for (i = 0; i < dtThongTinDiemTB.length; i++) {
            strDiemTrungBinh += '<th>' + dtThongTinDiemTB[i].MACOT + '</th>';
        }
        //row += '<tr>';
        //for (var i = 0; i < dtThongTinDiem.length; i++) {
        //    row += '<th id="' + dtThongTinDiem[i].MACOT + '" ' + me.getstyle(dtThongTinDiem[i], true) + '>' + dtThongTinDiem[i].TENCOT + '</th>';
        //}
        //row += '</tr>';
        me.arrHeadDiem_Id = me.insertHeaderTable("tblTraCuuDiem", dtThongTinDiem, null, row, strDiemTrungBinh);
        //$("#tblTraCuuDiemNguoiHoc thead").attr("style", "height: 200px");
        //document.getElementById("tblTraCuuDiemNguoiHoc").parentNode.style.width = (dChieuDaiHead + 4) + "px";
        //$("#tblTraCuuDiemNguoiHoc thead")[0].style.height = ($("#tblTraCuuDiem thead")[0].clientHeight + 2) + "px";
        //document.getElementById("tblTraCuuDiem").parentNode.style.width = ($("#zoneHienThi")[0].clientWidth - dChieuDaiHead -20) + "px"; 
    },
    insertHeaderTable: function (strTable_Id, obj, strQuanHeCha, strHead, strDiemTrungBinh) {
        //Khởi tạo table
        $("#" + strTable_Id).html('<thead class="mauthangbo" style="font-weight: bold">' + strHead + '<tr></tr><tr></tr><tr></tr><tr></tr></thead><tbody></tbody>');

        var arrHeaderId = [];
        //Lấy toàn bộ phần tử gốc đầu tiền xong gọi đệ quy load header table theo công thức điểm
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].MACOT_CHA == strQuanHeCha) {
                recuseHeader(obj, obj[i], 0);
            }
        }
        //Thêm phần đuôi
        $("#" + strTable_Id + " thead tr:eq(0)").append(strDiemTrungBinh);
        //Add rowspan cho các thành phần không có phần từ con
        //rowspan = rowTheadOfTable - colspan
        var x = document.getElementById(strTable_Id).getElementsByTagName("thead")[0].rows;
        for (var i = 0; i < x.length; i++) {
            for (var j = 0; j < x[i].cells.length; j++) {
                var z = x[i].cells[j].colSpan;
                if (z == 1) {
                    var irowspan = (x.length - i);
                    if (irowspan > 1) x[i].cells[j].rowSpan = (x.length - i);
                }
            }
        }
        //Hàm đề quy insert các phần tử con ra thead (datatable của công thức, phần từ cha cần đệ quy, số thứ tự dòng của phần tử cha trong thead)
        //Nguyên tắc: rowspan phần tử cha = sum(rowspan phần tử con) -1;
        function recuseHeader(objAll, objRecuse, iBac) {
            var x = spliceData(objAll, objRecuse.MACOT);
            var iTong = x.length;
            for (var j = 0; j < x.length; j++) {
                var iSoLuong = spliceData(objAll, x[j].MACOT);
                if (iSoLuong.length > 0) {
                    var iDem = recuseHeader(objAll, x[j], iBac + 1);
                    iTong += iDem - 1;
                }
                else {
                    insertHeader(strTable_Id, x[j], iBac + 1, iSoLuong.length);
                }
            }
            insertHeader(strTable_Id, objRecuse, iBac, iTong);
            return iTong;
        }

        function insertHeader(strTable_Id, objHead, iThuTu, colspan) {
            //Kiểm tra số dòng nếu nhỏ hơn số thứ tự dòng iThuTu thì thêm 1 dòng
            //var lHeader = document.getElementById(strTable_Id).getElementsByTagName("thead")[0].rows;
            //if (lHeader.length <= iThuTu) {
            //    $("#" + strTable_Id + " thead").append("<tr></tr>");
            //    setTimeout(function () {
            //        $("#" + strTable_Id + " thead tr:eq(" + iThuTu + ")").append("<th class='td-center' id='" + objHead.ID + "' colspan='" + colspan + "'>" + objHead.HOCPHAN + "</th>");
            //    }, 1);
            //} else {
            //    $("#" + strTable_Id + " thead tr:eq(" + iThuTu + ")").append("<th class='td-center' id='" + objHead.ID + "' colspan='" + colspan + "'>" + objHead.HOCPHAN + "</th>");
            //}
            $("#" + strTable_Id + " thead tr:eq(" + iThuTu + ")").append("<th class='td-center' id='" + objHead.MACOT + "' colspan='" + colspan + "'>" + objHead.TENCOT + "</th>");
            if (colspan == 0) {
                arrHeaderId.push(objHead);
                //$("#" + strTable_Id + "_Data thead tr:eq(0)").append("<th style='width: 60px'>" + objHead.HOCPHAN + "</th>");
            }
        }
        //Lấy số con của thằng cha trong datatable công thức
        function spliceData(objData, strQuanHeCha_Id) {
            var arr = [];
            var iLength = objData.length;
            for (var i = 0; i < iLength; i++) {
                if (objData[i].MACOT_CHA == strQuanHeCha_Id) {
                    arr.push(objData[i]);
                }
            }
            return arr;
        }
        return arrHeaderId;
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_NguoiHoc: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'D_LopQuanLy_NguoiHoc/LayDanhSach',
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo("dropLopQuanLy"),
        };

        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtNguoiHoc = data.Data;
                    me.genTable_NguoiHoc(data.Data, data.Pager);
                }
                else {
                    console.log(data.Message);
                }
                
            },
            error: function (er) {  },
            type: "GET",
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTable_NguoiHoc: function (data, iPager) {
        var me = this;
        var row = '';
        for (var i = 0; i < data.length; i++) {
            row += '<tr id="' + data[i].ID + '">';
            for (var j = 0; j < me.dtCotNguoiHoc.length; j++) {
                row += '<td class="sticky-col sticky-col-' + j + '">' + edu.util.returnEmpty(data[i][me.dtCotNguoiHoc[j].MACOT]) + '</td>';
            }
            for (var j = 0; j < me.arrHeadDiem_Id.length; j++) {
                row += '<td id="' + data[i].QLSV_NGUOIHOC_ID + '_' + me.arrHeadDiem_Id[j].MACOT + '" ' + me.getstyledata(me.arrHeadDiem_Id[j]) + '>';
                //if (me.arrHeadDiem_Id[j].CHIXEM != 1) row += '<input id="input' + data[i].ID + "_" + me.arrHeadDiem_Id[j].MACOT + '" style="width: 40px"/>';
                row += '</td>';
            }
            for (var j = 0; j < me.dtCotThongTinDiemTB.length; j++) {
                row += '<td id="' + data[i].QLSV_NGUOIHOC_ID + '_' + me.dtCotThongTinDiemTB[j].MACOT + '" ' + me.getstyledata(me.dtCotThongTinDiemTB[j]) + '>';
                row += '</td>';
            }
            row += '</tr>';
        }
        $("#tblTraCuuDiem tbody").html(row);
        //row = '';
        //for (var i = 0; i < data.length; i++) {
        //    row += '<tr>';
        //    for (var j = 0; j < me.dtCotNguoiHoc.length; j++) {
        //        row += '<td>' + edu.util.returnEmpty(data[i][me.dtCotNguoiHoc[j].MACOT]) + '</td>';
        //    }
        //    row += '</tr>';
        //}
        //$("#tblTraCuuDiemNguoiHoc tbody").html(row);
        //console.log($("#tblTraCuuDiem thead").attr("height"));
        //$("#tblTraCuuDiemNguoiHoc thead").attr("height", $("#tblTraCuuDiem thead").attr("height"));

        edu.system.genHTML_Progress("divprogessdiem", (me.arrHeadDiem_Id.length));
        for (var j = 0; j < me.arrHeadDiem_Id.length; j++) {
            me.getList_Diem(data, me.arrHeadDiem_Id[j].MACOT);
        }
        me.getList_DiemTB(null, null);
        /*III. Callback*/
    },
    actionTable_NguoiHoc: function () {
        var me = main_doc.TraCuuDiem;
        function moveScroll() {
            var scroll = $(window).scrollTop();
            var anchor_top = $("#tblTraCuuDiem").offset().top;
            var anchor_bottom = $("#bottom_anchor").offset().top;
            if (scroll > anchor_top && scroll < anchor_bottom) {
                var anchor_left = $("#tblTraCuuDiem").offset().left;
                clone_table = $("#clone");
                if (clone_table.length == 0) {
                    clone_table = $("#tblTraCuuDiem").clone();
                    clone_table.attr('id', 'clone');
                    clone_table.css({
                        position: 'fixed',
                        'pointer-events': 'none',
                        top: 0,
                        left: anchor_left
                    });
                    clone_table.width($("#tblTraCuuDiem").width());
                    $("#table-container").append(clone_table);
                    $("#clone").css({ visibility: 'hidden' });
                    $("#clone thead").css({ visibility: 'visible' });
                }
            } else {
                $("#clone").remove();
            }
        }
        $(window).scroll(moveScroll);
        $("#table-container").scroll(function () {
            var x = $("#clone");
            if (x.length > 0) {
                x = x[0];
                var anchor_left = $("#tblTraCuuDiem").offset().left;
                $("#clone")[0].style.left = anchor_left + "px";
            }
        });
        //Chỉnh lại head rowspan
        //var headrow = $("#tblTraCuuDiem thead")[0].rows;
        //var headrowNguoiHoc = $("#tblTraCuuDiemNguoiHoc thead")[0].rows;
        //console.log($("#tblTraCuuDiem thead")[0].clientHeight);
        //$(headrowNguoiHoc[0]).attr("height", $("#tblTraCuuDiem thead")[0].clientHeight);
        ////
        //var row = $("#tblTraCuuDiem tbody")[0].rows;
        //var rowNguoiHoc = $("#tblTraCuuDiemNguoiHoc tbody")[0].rows;
        //for (var i = 0; i < row.length; i++) {
        //    var ilenghtDiem = row[i].clientHeight;
        //    var ilengthNguoiHoc = rowNguoiHoc[i].clientHeight;

        //    if (ilengthNguoiHoc < ilenghtDiem)
        //        $(rowNguoiHoc[i]).attr("height", row[i].clientHeight);
        //    else
        //        $(row[i]).attr("height", rowNguoiHoc[i].clientHeight);

        //    if (i < row.length - 1) {
        //        var iLengthTopDiem = $(row[i + 1]).offset().top;
        //        var iLengthTopNguoiHoc = $(rowNguoiHoc[i + 1]).offset().top;
        //        var iChenhLech = iLengthTopDiem - iLengthTopNguoiHoc;
        //        if (iChenhLech != 0) {
        //            if (iChenhLech > 0) {
        //                $(rowNguoiHoc[i]).attr("height", (rowNguoiHoc[i].clientHeight + iChenhLech));
        //            }
        //            else {
        //                $(row[i]).attr("height", (row[i].clientHeight - iChenhLech));
        //            }
        //        }
        //    }
            
        //}
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_NguoiHoc_Diem: function (rowNguoiHoc, strMaCot, dChiXem) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'D_Hoc_NguoiHoc_Diem/LayGiaTriDiemTheoNguoiHoc',
            'strChucNang_Id': edu.system.strChucNang_Id,//'8D42F005D1934295959197C5278F4BF9',
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_HocPhan_Id': rowNguoiHoc.DAOTAO_HOCPHAN_ID,
            'strDiem_DanhSachHoc_Id': rowNguoiHoc.DIEM_DANHSACHHOC_ID,
            'strQLSV_NguoiHoc_Id': rowNguoiHoc.QLSV_NGUOIHOC_ID,
            'strDiem_DanhSach_NguoiHoc_Id': rowNguoiHoc.DIEM_DANHSACH_NGUOIHOC_ID,
            'strKyHieuCotDuLieu': strMaCot,
        };
        var strNguoiHoc_Id = rowNguoiHoc.QLSV_NGUOIHOC_ID;
        //
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (dChiXem != 1) {
                        $("#" + strNguoiHoc_Id + "_" + strMaCot).html('<input id="input' + strNguoiHoc_Id + "_" + strMaCot + '" value="' + data.Id + '" name="' + data.Id + '" style="width: 40px"/>');
                    } else {
                        $("#" + strNguoiHoc_Id + "_" + strMaCot).html(data.Id);
                    }
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }
                
                edu.system.start_Progress("divprogessdiem", me.actionTable_NguoiHoc);
            },
            error: function (er) {
                
                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
                edu.system.start_Progress("divprogessdiem", me.actionTable_NguoiHoc);
            },
            type: 'POST',
            action: obj_list.action,
            
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    getList_Diem: function (dtNguoiHoc, strMaCot) {
        var me = this;
        //if (strMaCot != "DANHGIAHETHOCPHAN") return;
        if (strMaCot.includes("DANHGIAHETHOCPHAN_")) console.log(strMaCot);
        //--Edit
        var obj_list = {
            'action': 'D_LopQuanLy_Diem/LayGiaTriDiemTheoLopQuanLy',
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_HocPhan_Id': edu.util.getArrCheckedIds("tblDSDiem", "checkX").toString(),
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo("dropLopQuanLy"),
            'strKyHieuCotDuLieu': strMaCot,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    for (var i = 0; i < data.Data.length; i++) {
                        var strNguoiHoc_Id = data.Data[i].QLSV_NGUOIHOC_ID;
                        var dGiaTri = edu.util.returnEmpty(data.Data[i].GIATRICOTDULIEU).replace(/#/g, "<br/>");
                        $("#" + strNguoiHoc_Id + "_" + strMaCot).html(dGiaTri);
                    }
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }
                edu.system.start_Progress("divprogessdiem", me.actionTable_NguoiHoc);
            },
            error: function (er) {
                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
                edu.system.start_Progress("divprogessdiem", me.actionTable_NguoiHoc);
            },
            type: 'GET',
            action: obj_list.action,
            
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_DiemTB: function () {
        var me = this;
        //if (strMaCot != "DANHGIAHETHOCPHAN") return;
        //--Edit
        var obj_list = {
            'action': 'D_LopQuanLy_DiemTrungBinh/LayGiaTriDiemTBTheoLopQuanLy',
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId,
            'strDaoTao_LopQuanLy_Id': edu.util.getValCombo("dropLopQuanLy"),
            'strPhamViTongHopDiem_Id': edu.util.getValById('dropPhanViTongHop'),
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    for (var i = 0; i < data.Data.length; i++) {
                        var strNguoiHoc_Id = data.Data[i].QLSV_NGUOIHOC_ID;
                        for (var x in data.Data[i]) {
                            var dGiaTri = edu.util.returnEmpty(data.Data[i][x]);
                            $("#" + strNguoiHoc_Id + "_" + x).html(dGiaTri);
                        }
                    }
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }
                edu.system.start_Progress("divprogessdiem", me.actionTable_NguoiHoc);
            },
            error: function (er) {
                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
                edu.system.start_Progress("divprogessdiem", me.actionTable_NguoiHoc);
            },
            type: 'GET',
            action: obj_list.action,
            
            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genTable_Hoc_Diem: function (data, iPager) {
        var me = this;
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Tiến độ đề tài
    --ULR:  Modules
    -------------------------------------------*/
    getstyle: function (row, bcheckth) {
        var html = 'style="';
        if (edu.util.checkValue(row.DORONG) && row.DORONG != 0 && row.DORONG != '0') {
            html +='width: ' + row.DORONG + 'px;';
        }
        if (edu.util.checkValue(row.KICHTHUOCFONTCHU) && row.KICHTHUOCFONTCHU != 0 && row.KICHTHUOCFONTCHU != '0') {
            html += 'font-size: ' + row.KICHTHUOCFONTCHU + 'px;';
        }
        if (edu.util.checkValue(row.CANLE)) {
            html += row.CANLE + ';';
        }
        if (edu.util.checkValue(row.MAMAUHIENTHI)) {
            html +='color: #' + row.MAMAUHIENTHI + ';';
        }
        if (!bcheckth && edu.util.checkValue(row.CHUDAM)) {
            html += row.CHUDAM + ';';
        }
        html += '"';
        return html;
    },
    getstyle_KhongDoRong: function (row, bcheckth) {
        var html = 'style="';
        //if (edu.util.checkValue(row.DORONG) && row.DORONG != 0 && row.DORONG != '0') {
        //    html += 'width: ' + row.DORONG + 'px;';
        //}
        if (edu.util.checkValue(row.KICHTHUOCFONTCHU) && row.KICHTHUOCFONTCHU != 0 && row.KICHTHUOCFONTCHU != '0') {
            html += 'font-size: ' + row.KICHTHUOCFONTCHU + 'px;';
        }
        if (edu.util.checkValue(row.CANLE)) {
            html += row.CANLE + ';';
        }
        if (edu.util.checkValue(row.MAMAUHIENTHI)) {
            html += 'color: #' + row.MAMAUHIENTHI + ';';
        }
        if (!bcheckth && edu.util.checkValue(row.CHUDAM)) {
            html += row.CHUDAM + ';';
        }
        html += '"';
        return html;
    },
    getstyledata: function (row, bcheckth) {
        var html = 'style="';
        if (edu.util.checkValue(row.DORONG) && row.DORONG != 0 && row.DORONG != '0') {
            html += 'width: ' + row.DORONG + 'px;';
        }
        if (edu.util.checkValue(row.KICHTHUOCFONTCHU) && row.KICHTHUOCFONTCHU != 0 && row.KICHTHUOCFONTCHU != '0') {
            html += 'font-size: ' + row.KICHTHUOCFONTCHU + 'px;';
        }
        if (edu.util.checkValue(row.CANLE)) {
            html += row.CANLE + ';';
        }
        if (edu.util.checkValue(row.MAMAUHIENTHI)) {
            html += 'color: #' + row.MAMAUHIENTHI + ';';
        }
        if (!bcheckth && edu.util.checkValue(row.CHUDAM)) {
            html += row.CHUDAM + ';';
        }
        html += 'vertical-align: text-top!important;text-align: center;';
        html += '"';
        return html;
    },
    
    /*------------------------------------------
	--Discription: [2] ACCESS DB ==> Systemroot HeDaoTao/KhoaDaoTao/ChuongTrinhDaoTao
    --Author:
	-------------------------------------------*/
    getList_HeDaoTao: function () {
        var me = this;
        var obj_HeDT = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000
        };
        edu.system.getList_HeDaoTao(obj_HeDT, "", "", me.cbGenCombo_HeDaoTao);
    },
    getList_KhoaDaoTao: function (strHeDaoTao_Id) {
        var me = this;
        var obj_KhoaDT = {
            strHeDaoTao_Id: edu.util.getValCombo("dropHeDaoTao"),
            strCoSoDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 10000
        };
        edu.system.getList_KhoaDaoTao(obj_KhoaDT, "", "", me.cbGenCombo_KhoaDaoTao);
    },
    getList_ThoiGianDaoTao: function () {
        var me = this;
        var obj_list = {
            'action': 'D_ThoiGianDaoTao/LayDanhSach',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDaoTao_Nam_Id': edu.util.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 10000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.loadToCombo_ThoiGianDaoTao(dtReRult);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);

    },
    getList_ChuongTrinhDaoTao: function () {
        var me = this;
        var obj = {
            strKhoaDaoTao_Id: edu.util.getValCombo("dropKhoaDaoTao"),
            strN_CN_LOP_Id: "",
            strKhoaQuanLy_Id: edu.util.getValCombo("dropKhoaQuanLy"),
            strToChucCT_Cha_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 10000,
        };
        edu.system.getList_ChuongTrinhDaoTao(obj, me.loadToCombo_ChuongTrinhDaoTao);
    },
    getList_LopQuanLy: function () {
        var me = this;
        //var obj = {
        //    strCoSoDaoTao_Id: "",
        //    strKhoaDaoTao_Id: edu.util.getValCombo("dropKhoaDaoTao"),
        //    strNganh_Id: edu.util.getValCombo("dropKhoaQuanLy"),
        //    strLoaiLop_Id: "",
        //    strDaoTao_HeDaoTao_Id: edu.util.getValCombo("dropHeDaoTao"),
        //    strToChucCT_Id: edu.util.getValCombo("dropChuongTrinhDaoTao"),
        //    strNguoiThucHien_Id: "",
        //    strTuKhoa: "",
        //    pageIndex: 1,
        //    pageSize: 100000,
        //};
        //console.log(obj.strDaoTao_HeDaoTao_Id);
        //edu.system.getList_LopQuanLy(obj, "", "", me.loadToCombo_LopQuanLy);
        var obj_list = {
            'action': 'KHCT_LopQuanLy/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strDaoTao_HeDaoTao_Id': edu.util.getValCombo('dropHeDaoTao'),
            'strDaoTao_CoSoDaoTao_Id': edu.util.getValCombo('dropAAAA'),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValCombo('dropKhoaDaoTao'),
            'strDaoTao_Nganh_Id': edu.util.getValCombo('dropChuongTrinhDaoTao'),
            'strDaoTao_LoaiLop_Id': edu.util.getValCombo('dropAAAA'),
            'strDaoTao_ToChucCT_Id': edu.util.getValCombo('dropChuongTrinhDaoTao'),
            'strDaoTao_KhoaQuanLy_Id': edu.util.getValCombo('dropKhoaQuanLy'),
            'strNhomlop_Id': edu.util.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.loadToCombo_LopQuanLy(dtReRult);
                }
                else {
                    edu.system.alert(obj_list + " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(obj_list + " (er): " + JSON.stringify(er), "w");
            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);

    },
    getList_NamNhapHoc: function () {
        var me = this;
        edu.system.getList_NamNhapHoc(null, "", "", me.loadToCombo_NamNhapHoc)
    },
    getList_KhoaQuanLy: function () {
        var me = this;
        edu.system.getList_KhoaQuanLy(null, "", "", me.loadToCombo_KhoaQuanLy)
    },
    /*------------------------------------------
	--Discription: [2] GEN HTML ==> HeDaoTao/KhoaDaoTao/ChuongTrinhDaoTao
	--ULR:  
	-------------------------------------------*/
    cbGenCombo_HeDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENHEDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropHeDaoTao"],
            type: "",
            title: "Chọn hệ đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenCombo_KhoaDaoTao: function (data) {
        var me = this

        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKHOA",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropKhoaDaoTao"],
            type: "",
            title: "Chọn khóa đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_ChuongTrinhDaoTao: function (data) {
        // Ghép mã chương trình vào tên để phân biệt các khóa (TENCHUONGTRINH trùng nhau giữa các khóa)
        for (var i = 0; i < data.length; i++) {
            if (edu.util.checkValue(data[i].MACHUONGTRINH)) {
                data[i].TENCHUONGTRINH = data[i].TENCHUONGTRINH + ' - ' + data[i].MACHUONGTRINH;
            }
        }
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENCHUONGTRINH",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropChuongTrinhDaoTao"],
            type: "",
            title: "Chọn chương trình đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_ThoiGianDaoTao: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropPhanViTongHop_HOCKY", "dropPhanViTongHop_NHIEUKY", "dropPhanViTongHop_DOTHOC"],
            type: "",
            title: "Chọn thời gian đào tạo",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_LopQuanLy: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropLopQuanLy"],
            type: "",
            title: "Chọn lớp quản lý",
        }
        edu.system.loadToCombo_data(obj);
    },
    cbGenBo_TrangThai: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropTinhTrangSinhVien"]
        }
        edu.system.loadToCombo_data(obj);
        //$('#dropTinhTrangSinhVien option').prop('selected', true);
    },
    loadToCombo_PhamVi: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                avatar: "MA"
            },
            renderPlace: ["dropPhanViTongHop"],
            type: "",
            title: "Chọn phạm vi",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_NamNhapHoc: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "NAMNHAPHOC",
                parentId: "",
                name: "NAMNHAPHOC",
                code: "NAMNHAPHOC",
                avatar: "NAMNHAPHOC"
            },
            renderPlace: ["dropPhanViTongHop_NAMHOC"],
            type: "",
            title: "Chọn năm học",
        }
        edu.system.loadToCombo_data(obj);
    },
    loadToCombo_KhoaQuanLy: function (data) {
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
            },
            renderPlace: ["dropKhoaQuanLy"],
            type: "",
            title: "Chọn khoa quản lý",
        }
        edu.system.loadToCombo_data(obj);
    },
    /*------------------------------------------
    --Discription: [TK] Thống kê học tập theo ngành
    -------------------------------------------*/
    openThongKeHocTap: function () {
        var me = this;
        edu.util.toggle_overide("zone-bus", "zone_input_ThongKeHocTap");
        $("#tblThongKeHocTap thead").empty();
        $("#tblThongKeHocTap tbody").empty();
        me.getList_XepLoaiHocTap(function () {
            me.getList_NganhKhoaDaoTao();
        });
    },
    getList_XepLoaiHocTap: function (callback) {
        var me = this;
        var obj_list = {
            'action': 'SV_XepLoaiHocTap_Chung_MH/DSA4BQwZJDENLiAoCS4iFSAx',
            'func': 'PKG_XEPLOAIHOCTAP_CHUNG.LayDMXepLoaiHocTap',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': ''
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtXepLoai = data.Data || [];
                    if (callback) callback();
                } else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    getList_NganhKhoaDaoTao: function () {
        var me = this;
        var obj_list = {
            'action': 'KHCT_ThongTin_MH/DSA4BRIKEh4PJiAvKR4KKS4gBSAuFSAu',
            'func': 'PKG_KEHOACH_THONGTIN.LayDSKS_Nganh_KhoaDaoTao',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strDaoTao_HeDaoTao_Id': edu.util.getValCombo("dropHeDaoTao"),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValCombo("dropKhoaDaoTao"),
            'strDaoTao_N_CN_Id': edu.util.getValCombo("dropChuongTrinhDaoTao"),
            'strDaoTao_KhoaQuanLy_Id': edu.util.getValCombo("dropKhoaQuanLy"),
            'strDaoTao_ToChucCT_Cha_Id': '',
            'strTrangThaiNguoiHoc_Id': edu.util.getValCombo("dropTinhTrangSinhVien").toString(),
            'strNguoiThucHien_Id': edu.system.userId,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'pageIndex': 1,
            'pageSize': 10000
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtNganhKhoa = data.Data || [];
                    me.genTable_ThongKeHocTap(me.dtNganhKhoa);
                } else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    genTable_ThongKeHocTap: function (dtNganhKhoa) {
        var me = this;
        var dtXepLoai = me.dtXepLoai || [];

        // thead: 2 hàng, hàng 1 = STT|Ngành|Khóa|SL|xếp loại (colspan 2), hàng 2 = Sinh viên|Tỷ lệ
        var strThead = '<tr>';
        strThead += '<th rowspan="2" class="td-center">STT</th>';
        strThead += '<th rowspan="2" class="td-center">Ngành học</th>';
        strThead += '<th rowspan="2" class="td-center">Khóa học</th>';
        strThead += '<th rowspan="2" class="td-center">Số lượng SV</th>';
        for (var i = 0; i < dtXepLoai.length; i++) {
            strThead += '<th colspan="2" class="td-center">' + edu.util.returnEmpty(me.getXepLoaiTen(dtXepLoai[i])) + '</th>';
        }
        strThead += '</tr><tr>';
        for (var i = 0; i < dtXepLoai.length; i++) {
            strThead += '<th class="td-center">Sinh viên</th><th class="td-center">Tỷ lệ (%)</th>';
        }
        strThead += '</tr>';
        $("#tblThongKeHocTap thead").html(strThead);

        // Sort theo ngành để rowspan gộp đúng
        dtNganhKhoa.sort(function (a, b) {
            var na = me.getNCNId(a), nb = me.getNCNId(b);
            if (na < nb) return -1;
            if (na > nb) return 1;
            return 0;
        });

        // Đếm số khóa mỗi ngành để set rowspan
        var nganhCount = {};
        for (var i = 0; i < dtNganhKhoa.length; i++) {
            var k = me.getNCNId(dtNganhKhoa[i]);
            nganhCount[k] = (nganhCount[k] || 0) + 1;
        }

        var strTbody = '';
        var seen = {};
        var stt = 0;
        for (var i = 0; i < dtNganhKhoa.length; i++) {
            var row = dtNganhKhoa[i];
            var nid = me.getNCNId(row);
            var kdid = me.getKhoaDaoTaoId(row);
            var tongSV = edu.util.returnZero(me.getTongSoSV(row));
            strTbody += '<tr>';
            if (!seen[nid]) {
                seen[nid] = true;
                stt++;
                strTbody += '<td class="td-center" rowspan="' + nganhCount[nid] + '">' + stt + '</td>';
                strTbody += '<td rowspan="' + nganhCount[nid] + '">' + edu.util.returnEmpty(me.getNCNTen(row)) + '</td>';
            }
            strTbody += '<td>' + edu.util.returnEmpty(me.getKhoaDaoTaoTen(row)) + '</td>';
            strTbody += '<td class="td-center">' + tongSV + '</td>';
            for (var j = 0; j < dtXepLoai.length; j++) {
                var cellId = 'tk_' + nid + '_' + kdid + '_' + me.getXepLoaiId(dtXepLoai[j]);
                strTbody += '<td class="td-center" id="' + cellId + '_SL"></td>';
                strTbody += '<td class="td-center" id="' + cellId + '_TL"></td>';
            }
            strTbody += '</tr>';
        }
        $("#tblThongKeHocTap tbody").html(strTbody);

        // Gọi count cho từng cell (N ngành-khóa × M xếp loại)
        if (dtNganhKhoa.length === 0 || dtXepLoai.length === 0) return;
        edu.system.genHTML_Progress("divprogessThongKe", dtNganhKhoa.length * dtXepLoai.length);
        for (var i = 0; i < dtNganhKhoa.length; i++) {
            for (var j = 0; j < dtXepLoai.length; j++) {
                me.getCount_XepLoai(dtNganhKhoa[i], dtXepLoai[j]);
            }
        }
    },
    // Response field name có thể là UPPERCASE hoặc PascalCase tùy backend; hỗ trợ cả 2
    getNCNId: function (row) { return row.DAOTAO_N_CN_ID || row.DaoTao_N_CN_Id || ''; },
    getNCNTen: function (row) { return row.DAOTAO_N_CN_TEN || row.DaoTao_N_CN_Ten || ''; },
    getKhoaDaoTaoId: function (row) { return row.DAOTAO_KHOADAOTAO_ID || row.DaoTao_KhoaDaoTao_Id || ''; },
    getKhoaDaoTaoTen: function (row) { return row.DAOTAO_KHOADAOTAO_TEN || row.DaoTao_KhoaDaoTao_Ten || ''; },
    getTongSoSV: function (row) { return row.TONGSOSV || row.TongSoSV || 0; },
    getXepLoaiId: function (row) { return row.ID || row.Id || ''; },
    getXepLoaiTen: function (row) { return row.TEN || row.Ten || row.TENXEPLOAI || ''; },
    getCount_XepLoai: function (rowNK, rowXL) {
        var me = this;
        var nid = me.getNCNId(rowNK);
        var kdid = me.getKhoaDaoTaoId(rowNK);
        var xlid = me.getXepLoaiId(rowXL);
        var tongSV = edu.util.returnZero(me.getTongSoSV(rowNK));
        var cellId = 'tk_' + nid + '_' + kdid + '_' + xlid;
        var tieuDe = me.getXepLoaiTen(rowXL) + ' - ' + me.getNCNTen(rowNK) + ' - ' + me.getKhoaDaoTaoTen(rowNK);
        var obj_list = {
            'action': 'SV_XepLoaiHocTap_BaoCao_MH/DSA4BRIeFSkuLyYKJB4ZDQkVHgokNRA0IAPP',
            'func': 'PKG_XEPLOAIHOCTAP_BAOCAO.LayDS_ThongKe_XLHT_KetQua',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': '',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
            'strXepLoai_Id': xlid,
            'strTrangThaiNguoiHoc_Id': edu.util.getValCombo("dropTinhTrangSinhVien").toString(),
            'strDaoTao_N_CN_Id': nid,
            'strDaoTao_KhoaDaoTao_Id': kdid
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var arr = data.Data || [];
                    var count = arr.length;
                    var tyle = tongSV > 0 ? Math.round(10000 * count / tongSV) / 100 : 0;
                    var strXem = '<a href="#" class="btnXemDSSV_XepLoai" data-nid="' + nid + '" data-kdid="' + kdid + '" data-xlid="' + xlid + '" data-tieude="' + tieuDe.replace(/"/g, '&quot;') + '">' + count + ' - Xem</a>';
                    $("#" + cellId + "_SL").html(strXem);
                    $("#" + cellId + "_TL").html(tyle);
                } else {
                    $("#" + cellId + "_SL").html('-');
                    $("#" + cellId + "_TL").html('-');
                }
                edu.system.start_Progress("divprogessThongKe", function () { });
            },
            error: function (er) {
                $("#" + cellId + "_SL").html('-');
                $("#" + cellId + "_TL").html('-');
                edu.system.start_Progress("divprogessThongKe", function () { });
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    viewDSSV_XepLoai: function (nid, kdid, xlid, tieuDe) {
        var me = this;
        var obj_list = {
            'action': 'SV_XepLoaiHocTap_BaoCao_MH/DSA4BRIeFSkuLyYKJB4ZDQkVHgokNRA0IAPP',
            'func': 'PKG_XEPLOAIHOCTAP_BAOCAO.LayDS_ThongKe_XLHT_KetQua',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': '',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
            'strXepLoai_Id': xlid,
            'strTrangThaiNguoiHoc_Id': edu.util.getValCombo("dropTinhTrangSinhVien").toString(),
            'strDaoTao_N_CN_Id': nid,
            'strDaoTao_KhoaDaoTao_Id': kdid
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var arr = data.Data || [];
                    $("#lblDSSVXepLoai_TieuDe").text(tieuDe ? ' — ' + tieuDe : '');
                    $("#lblDSSVXepLoai_Tong").text(arr.length);
                    me.genTable_DSSVXepLoai(arr);
                    $("#modal_XemDSSVXepLoai").modal("show");
                } else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    genTable_DSSVXepLoai: function (data) {
        var row = '';
        function pick(d, keys) {
            for (var i = 0; i < keys.length; i++) {
                if (d[keys[i]] !== undefined && d[keys[i]] !== null) return d[keys[i]];
            }
            return '';
        }
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var ct = edu.util.returnEmpty(pick(d, ['DAOTAO_CHUONGTRINH_TEN', 'DaoTao_ChuongTrinh_Ten']));
            var ctMa = edu.util.returnEmpty(pick(d, ['DAOTAO_CHUONGTRINH_MA', 'DaoTao_ChuongTrinh_Ma']));
            var ctFull = ct + (ctMa ? ' (' + ctMa + ')' : '');
            row += '<tr>';
            row += '<td class="td-center">' + (i + 1) + '</td>';
            row += '<td class="td-center">' + edu.util.returnEmpty(pick(d, ['QLSV_NGUOIHOC_MASO', 'QLSV_NguoiHoc_MaSo'])) + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['QLSV_NGUOIHOC_HODEM', 'QLSV_NguoiHoc_HoDem'])) + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['QLSV_NGUOIHOC_TEN', 'QLSV_NguoiHoc_Ten'])) + '</td>';
            row += '<td class="td-center">' + edu.util.returnEmpty(pick(d, ['GIOITINH_TEN', 'GioiTinh_Ten'])) + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['XEPLOAI_TEN', 'XepLoai_Ten'])) + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['THOIGIANDAOTAO_TEN', 'ThoiGianDaoTao_Ten'])) + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['TRANGTHAINGUOIHOC_TEN', 'TrangThaiNguoiHoc_Ten'])) + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['DAOTAO_LOPQUANLY_TEN', 'DaoTao_LopQuanLy_Ten'])) + '</td>';
            row += '<td>' + ctFull + '</td>';
            row += '<td>' + edu.util.returnEmpty(pick(d, ['DAOTAO_KHOADAOTAO_TEN', 'DaoTao_KhoaDaoTao_Ten'])) + '</td>';
            row += '</tr>';
        }
        $("#tblDSSVXepLoai tbody").html(row);
    },
    /*------------------------------------------
    --Discription: [TK-CTDT] Thống kê học tập theo CTĐT
    -------------------------------------------*/
    openThongKeHocTapCTDT: function () {
        var me = this;
        edu.util.toggle_overide("zone-bus", "zone_input_ThongKeHocTapCTDT");
        $("#tblThongKeHocTapCTDT thead").empty();
        $("#tblThongKeHocTapCTDT tbody").empty();
        me.getList_XepLoaiHocTap(function () {
            me.getList_CTDT_KhoaDaoTao();
        });
    },
    getList_CTDT_KhoaDaoTao: function () {
        var me = this;
        var obj_list = {
            'action': 'KHCT_ThongTin_MH/DSA4BRIKEh4CFQUVHgopLiAFIC4VIC4P',
            'func': 'PKG_KEHOACH_THONGTIN.LayDSKS_CTDT_KhoaDaoTao',
            'iM': edu.system.iM,
            'strTuKhoa': '',
            'strDaoTao_HeDaoTao_Id': edu.util.getValCombo("dropHeDaoTao"),
            'strDaoTao_KhoaDaoTao_Id': edu.util.getValCombo("dropKhoaDaoTao"),
            'strDaoTao_N_CN_Id': edu.util.getValCombo("dropChuongTrinhDaoTao"),
            'strDaoTao_KhoaQuanLy_Id': edu.util.getValCombo("dropKhoaQuanLy"),
            'strDaoTao_ToChucCT_Cha_Id': '',
            'strTrangThaiNguoiHoc_Id': edu.util.getValCombo("dropTinhTrangSinhVien").toString(),
            'strNguoiThucHien_Id': edu.system.userId,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'pageIndex': 1,
            'pageSize': 10000
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtCTDTKhoa = data.Data || [];
                    me.genTable_ThongKeHocTapCTDT(me.dtCTDTKhoa);
                } else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    genTable_ThongKeHocTapCTDT: function (dtCTDTKhoa) {
        var me = this;
        var dtXepLoai = me.dtXepLoai || [];

        var strThead = '<tr>';
        strThead += '<th rowspan="2" class="td-center">STT</th>';
        strThead += '<th rowspan="2" class="td-center">CTĐT</th>';
        strThead += '<th rowspan="2" class="td-center">Khóa học</th>';
        strThead += '<th rowspan="2" class="td-center">Số lượng SV</th>';
        for (var i = 0; i < dtXepLoai.length; i++) {
            strThead += '<th colspan="2" class="td-center">' + edu.util.returnEmpty(me.getXepLoaiTen(dtXepLoai[i])) + '</th>';
        }
        strThead += '</tr><tr>';
        for (var i = 0; i < dtXepLoai.length; i++) {
            strThead += '<th class="td-center">Sinh viên</th><th class="td-center">Tỷ lệ (%)</th>';
        }
        strThead += '</tr>';
        $("#tblThongKeHocTapCTDT thead").html(strThead);

        dtCTDTKhoa.sort(function (a, b) {
            var ca = me.getCTDTId(a), cb = me.getCTDTId(b);
            if (ca < cb) return -1;
            if (ca > cb) return 1;
            return 0;
        });

        var ctdtCount = {};
        for (var i = 0; i < dtCTDTKhoa.length; i++) {
            var k = me.getCTDTId(dtCTDTKhoa[i]);
            ctdtCount[k] = (ctdtCount[k] || 0) + 1;
        }

        var strTbody = '';
        var seen = {};
        var stt = 0;
        for (var i = 0; i < dtCTDTKhoa.length; i++) {
            var row = dtCTDTKhoa[i];
            var ctdtid = me.getCTDTId(row);
            var kdid = me.getKhoaDaoTaoId(row);
            var tongSV = edu.util.returnZero(me.getTongSoSV(row));
            var ctdtMa = me.getCTDTMa(row);
            var ctdtTen = me.getCTDTTen(row);
            var ctdtFull = edu.util.returnEmpty(ctdtTen) + (ctdtMa ? '(' + ctdtMa + ')' : '');
            strTbody += '<tr>';
            if (!seen[ctdtid]) {
                seen[ctdtid] = true;
                stt++;
                strTbody += '<td class="td-center" rowspan="' + ctdtCount[ctdtid] + '">' + stt + '</td>';
                strTbody += '<td rowspan="' + ctdtCount[ctdtid] + '">' + ctdtFull + '</td>';
            }
            strTbody += '<td>' + edu.util.returnEmpty(me.getKhoaDaoTaoTen(row)) + '</td>';
            strTbody += '<td class="td-center">' + tongSV + '</td>';
            for (var j = 0; j < dtXepLoai.length; j++) {
                var cellId = 'tkctdt_' + ctdtid + '_' + kdid + '_' + me.getXepLoaiId(dtXepLoai[j]);
                strTbody += '<td class="td-center" id="' + cellId + '_SL"></td>';
                strTbody += '<td class="td-center" id="' + cellId + '_TL"></td>';
            }
            strTbody += '</tr>';
        }
        $("#tblThongKeHocTapCTDT tbody").html(strTbody);

        if (dtCTDTKhoa.length === 0 || dtXepLoai.length === 0) return;
        edu.system.genHTML_Progress("divprogessThongKeCTDT", dtCTDTKhoa.length * dtXepLoai.length);
        for (var i = 0; i < dtCTDTKhoa.length; i++) {
            for (var j = 0; j < dtXepLoai.length; j++) {
                me.getCount_XepLoai_CTDT(dtCTDTKhoa[i], dtXepLoai[j]);
            }
        }
    },
    getCTDTId: function (row) { return row.DAOTAO_CHUONGTRINH_ID || row.DaoTao_ChuongTrinh_Id || row.ID || row.Id || ''; },
    getCTDTTen: function (row) { return row.TENCHUONGTRINH || row.DAOTAO_CHUONGTRINH_TEN || row.DaoTao_ChuongTrinh_Ten || ''; },
    getCTDTMa: function (row) { return row.MACHUONGTRINH || row.DAOTAO_CHUONGTRINH_MA || row.DaoTao_ChuongTrinh_Ma || ''; },
    getCount_XepLoai_CTDT: function (rowCK, rowXL) {
        var me = this;
        var ctdtid = me.getCTDTId(rowCK);
        var kdid = me.getKhoaDaoTaoId(rowCK);
        var xlid = me.getXepLoaiId(rowXL);
        var tongSV = edu.util.returnZero(me.getTongSoSV(rowCK));
        var cellId = 'tkctdt_' + ctdtid + '_' + kdid + '_' + xlid;
        var ctdtTen = me.getCTDTTen(rowCK);
        var ctdtMa = me.getCTDTMa(rowCK);
        var ctdtFull = ctdtTen + (ctdtMa ? '(' + ctdtMa + ')' : '');
        var tieuDe = me.getXepLoaiTen(rowXL) + ' - ' + ctdtFull + ' - ' + me.getKhoaDaoTaoTen(rowCK);
        var obj_list = {
            'action': 'SV_XepLoaiHocTap_BaoCao_MH/DSA4BRIeFSkuLyYKJB4ZDQkVHgIVBRUeCiQ1EDQg',
            'func': 'PKG_XEPLOAIHOCTAP_BAOCAO.LayDS_ThongKe_XLHT_CTDT_KetQua',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': '',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
            'strXepLoai_Id': xlid,
            'strTrangThaiNguoiHoc_Id': edu.util.getValCombo("dropTinhTrangSinhVien").toString(),
            'strDaoTao_ChuongTrinh_Id': ctdtid,
            'strDaoTao_KhoaDaoTao_Id': kdid
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var arr = data.Data || [];
                    var count = arr.length;
                    var tyle = tongSV > 0 ? Math.round(10000 * count / tongSV) / 100 : 0;
                    var strXem = '<a href="#" class="btnXemDSSV_XepLoai_CTDT" data-ctdtid="' + ctdtid + '" data-kdid="' + kdid + '" data-xlid="' + xlid + '" data-tieude="' + tieuDe.replace(/"/g, '&quot;') + '">' + count + ' - Xem</a>';
                    $("#" + cellId + "_SL").html(strXem);
                    $("#" + cellId + "_TL").html(tyle);
                } else {
                    $("#" + cellId + "_SL").html('-');
                    $("#" + cellId + "_TL").html('-');
                }
                edu.system.start_Progress("divprogessThongKeCTDT", function () { });
            },
            error: function (er) {
                $("#" + cellId + "_SL").html('-');
                $("#" + cellId + "_TL").html('-');
                edu.system.start_Progress("divprogessThongKeCTDT", function () { });
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    viewDSSV_XepLoai_CTDT: function (ctdtid, kdid, xlid, tieuDe) {
        var me = this;
        var obj_list = {
            'action': 'SV_XepLoaiHocTap_BaoCao_MH/DSA4BRIeFSkuLyYKJB4ZDQkVHgIVBRUeCiQ1EDQg',
            'func': 'PKG_XEPLOAIHOCTAP_BAOCAO.LayDS_ThongKe_XLHT_CTDT_KetQua',
            'iM': edu.system.iM,
            'strNguoiThucHien_Id': edu.system.userId,
            'strVaiTroDangNhap_Id': edu.system.strVaiTroDangNhap_Id || '',
            'strChucNangHeThong_Id': edu.system.strChucNang_Id,
            'strHanhDong_Code': '',
            'strDaoTao_ThoiGianDaoTao_Id': edu.util.getValById('dropPhanViTongHop_' + me.strPhamViMa),
            'strXepLoai_Id': xlid,
            'strTrangThaiNguoiHoc_Id': edu.util.getValCombo("dropTinhTrangSinhVien").toString(),
            'strDaoTao_ChuongTrinh_Id': ctdtid,
            'strDaoTao_KhoaDaoTao_Id': kdid
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var arr = data.Data || [];
                    $("#lblDSSVXepLoai_TieuDe").text(tieuDe ? ' — ' + tieuDe : '');
                    $("#lblDSSVXepLoai_Tong").text(arr.length);
                    me.genTable_DSSVXepLoai(arr);
                    $("#modal_XemDSSVXepLoai").modal("show");
                } else {
                    edu.system.alert(obj_list.action + " : " + data.Message, "s");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [KQHT] Kết quả học tập theo phạm vi tổng hợp (Học kỳ / Năm học / Toàn khóa ...)
    --  Hàm: pkg_diem_baocao.LayDanhSachHoSoNhieuNganh (action D_BaoCao_MH — cùng action với ApisCongCanBo/Modules/nhapdiem/script/inbangdiem.js).
    --  Tham số lấy theo bộ lọc trên form (theo hướng dẫn của sếp): Năm nhập học rỗng; Phạm vi = Id ô "Phạm vi tổng hợp";
    --  Thời gian = giá trị ô theo phạm vi (Năm học: năm, vd 2025; Học kỳ: Id kỳ; Toàn khóa: rỗng); TN kế hoạch rỗng.
    --  Hiển thị có phân trang; "Xuất Excel" (edu.exporter) nạp lại TOÀN BỘ đúng điều kiện của lần xem gần nhất.
    --  Cột + tiêu đề khai 1 lần ở _cot_KQHT, dùng chung cho bảng trên màn hình và file Excel (mẫu "Xem điểm học tập của sv toàn trường").
    -------------------------------------------*/
    PHAMVI_TEN_KQHT: { TOANKHOA: "Toàn khóa", NHIEUKY: "Nhiều kỳ", NAMHOC: "Năm học", HOCKY: "Học kỳ", DOTHOC: "Đợt học" },
    _esc_KQHT: function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    // Giá trị ô chọn (nhiều) -> "id1,id2" (đã bỏ mục tiêu đề rỗng / SELECTALL); không chọn -> ""
    _val_KQHT: function (strId) {
        var v = edu.util.getValCombo(strId);
        return (v === null || v === undefined) ? "" : String(v);
    },
    // Tên các mục đang chọn của 1 ô (bỏ mục tiêu đề "-- Chọn ... --" và SELECTALL)
    _tenDangChon_KQHT: function (strId) {
        var arr = [];
        $("#" + strId + " option:selected").each(function () {
            var v = $(this).val(), t = $.trim($(this).text().replace(/\s+/g, " "));
            if (v && v !== "SELECTALL" && t) arr.push(t);
        });
        return arr;
    },
    // Phạm vi đang chọn: Id, mã (TOANKHOA/NAMHOC/HOCKY... = thuộc tính id của option, xem loadToCombo_PhamVi), tên hiển thị, giá trị theo phạm vi
    _phamVi_KQHT: function () {
        var me = this;
        var strId = me._val_KQHT("dropPhanViTongHop");
        var $op = $("#dropPhanViTongHop option:selected");
        var strMa = strId ? ($op.attr("id") || "") : "";
        var strTen = strId ? (me.PHAMVI_TEN_KQHT[strMa] || $.trim($op.text())) : "";
        var strDrop = "dropPhanViTongHop_" + strMa;
        // Toàn khóa không có ô giá trị -> gửi rỗng
        var bCoO = !!strMa && strMa !== "TOANKHOA" && $("#" + strDrop).length > 0;
        return {
            id: strId,
            ma: strMa,
            ten: strTen,
            canGiaTri: bCoO,
            giaTri: bCoO ? me._val_KQHT(strDrop) : "",
            giaTriTen: bCoO ? me._tenDangChon_KQHT(strDrop).join(", ") : ""
        };
    },
    // Tiêu đề nhóm cột kết quả: "KẾT QUẢ HỌC TẬP HỌC KỲ 2026_2027_2" / "KẾT QUẢ HỌC TẬP NĂM HỌC 2025" / "KẾT QUẢ HỌC TẬP TOÀN KHÓA"
    _tieuDeNhom_KQHT: function (pv) {
        var s = "KẾT QUẢ HỌC TẬP";
        if (pv && pv.ten) s += " " + pv.ten.toUpperCase();
        if (pv && pv.giaTriTen) s += " " + pv.giaTriTen;
        return s;
    },
    // Nhãn nút đổi theo phạm vi: "Kết quả học tập theo Học kỳ" ...; chưa chọn phạm vi thì để nhãn đầy đủ
    _capNhatNhanKQHT: function () {
        var pv = this._phamVi_KQHT();
        $("#lblBtnKetQuaHocTap").text("Kết quả học tập theo " + (pv.ten || "Học kỳ - Năm học - Toàn khóa"));
    },
    // Cột theo mẫu của sếp. Tên trường viết HOA vì API trả HOA (đã chuẩn hóa ở _chuanHoaKhoa_KQHT nếu BE trả kiểu khác).
    _cot_KQHT: function (strNhomKQ) {
        var TT = "THÔNG TIN NGƯỜI HỌC", TK = "TỔNG HỢP TOÀN KHÓA", KQ = strNhomKQ || "KẾT QUẢ HỌC TẬP";
        function e(v) { return (v === null || v === undefined) ? "" : String(v); }
        return [
            { header: "Mã số", field: "QLSV_NGUOIHOC_MASO", group: TT },
            { header: "Họ và tên", group: TT, render: function (r) { return $.trim(e(r.QLSV_NGUOIHOC_HODEM) + " " + e(r.QLSV_NGUOIHOC_TEN)); } },
            { header: "Ngày sinh", field: "QLSV_NGUOIHOC_NGAYSINH", align: "center", group: TT },
            { header: "Trạng thái", field: "QLSV_TRANGTHAINGUOIHOC_TEN", group: TT },
            { header: "Tên lớp", field: "DAOTAO_LOPQUANLY_MA", group: TT },      // mẫu ghi "Tên lớp" = daotao_lopquanly_ma
            { header: "Tên chương trình", field: "DAOTAO_CHUONGTRINH_TEN", group: TT },
            { header: "Mã chương trình", field: "DAOTAO_CHUONGTRINH_MA", group: TT },
            { header: "Tên khóa", field: "DAOTAO_KHOADAOTAO_TEN", group: TT },
            { header: "Mã khóa", field: "DAOTAO_KHOADAOTAO_MA", group: TT },
            { header: "Khoa quản lý", field: "DAOTAO_KHOAQUANLY_TEN", group: TT },
            { header: "Hệ đào tạo", field: "DAOTAO_HEDAOTAO_TEN", group: TT },
            { header: "ĐTBTL Hệ 4", field: "DTBTICHLUYHE4TOANKHOA", type: "number", align: "center", group: TK },
            { header: "ĐTBTL Hệ 10", field: "DTBTICHLUYHE10TOANKHOA", type: "number", align: "center", group: TK },
            { header: "Số TCTL", field: "SOTCTICHLUYTOANKHOA", type: "number", align: "center", group: TK },
            { header: "Số học phần học lại", field: "SOHPHOCLAI", type: "number", align: "center", group: KQ },
            { header: "Số học phần thi lại", field: "SOHPTHILAI", type: "number", align: "center", group: KQ },
            { header: "Điểm trung bình học tập hệ 10", field: "DTBCHE10", type: "number", align: "center", group: KQ },
            { header: "Điểm trung bình học tập hệ 4", field: "DTBCHE4", type: "number", align: "center", group: KQ },
            { header: "Điểm trung bình học tập hệ 10 - tích lũy", field: "DTBTLHE10", type: "number", align: "center", group: KQ },
            { header: "Điểm trung bình học tập hệ 4 - tích lũy", field: "DTBTLHE4", type: "number", align: "center", group: KQ },
            { header: "Xếp loại học tập", field: "XLHT_XEPLOAI_TEN", group: KQ },
            { header: "Xếp loại rèn luyện", field: "DRL_XEPLOAI_TEN", group: KQ },
            { header: "Điểm rèn luyện", field: "DRL_DIEM", type: "number", align: "center", group: KQ },
            { header: "Tình hình nộp học phí", field: "TONGNOPHI", type: "number", format: "int", align: "right", sum: true }
        ];
    },
    // Tiêu đề bảng 2 tầng dựng từ _cot_KQHT: tầng 1 = nhóm (gộp ngang), cột không nhóm gộp dọc; STT thuộc nhóm đầu như mẫu
    _dungTieuDe_KQHT: function (strNhomKQ) {
        var me = this;
        var cols = me._cot_KQHT(strNhomKQ);
        var all = [{ header: "STT", group: cols[0].group }].concat(cols);
        var r1 = "", r2 = "";
        for (var j = 0; j < all.length;) {
            var c = all[j];
            if (!c.group) {
                r1 += '<th rowspan="2">' + me._esc_KQHT(c.header) + '</th>';
                j++;
                continue;
            }
            var k = j;
            while (k + 1 < all.length && all[k + 1].group === c.group) k++;
            r1 += '<th colspan="' + (k - j + 1) + '">' + me._esc_KQHT(c.group) + '</th>';
            for (var m = j; m <= k; m++) r2 += '<th>' + me._esc_KQHT(all[m].header) + '</th>';
            j = k + 1;
        }
        $("#tblKetQuaHocTap thead").html('<tr>' + r1 + '</tr><tr>' + r2 + '</tr>');
        $("#tblKetQuaHocTap tbody").html("");
    },
    // BE có thể trả tên cột kiểu PascalCase (mẫu ghi DTBTichLuyHe4ToanKhoa...) -> thêm khóa viết HOA, giá trị giữ nguyên
    _chuanHoaKhoa_KQHT: function (rows) {
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            for (var k in r) {
                if (!Object.prototype.hasOwnProperty.call(r, k)) continue;
                var K = k.toUpperCase();
                if (K !== k && !(K in r)) r[K] = r[k];
            }
        }
        return rows;
    },
    // Cột nào trong mẫu mà API không trả thì báo ở Console (1 lần) để gửi BE, các ô đó để trống
    _canhBaoThieuCot_KQHT: function (rows) {
        var me = this;
        if (me._bDaCanhBao_KQHT || !rows.length) return;
        me._bDaCanhBao_KQHT = true;
        var arrCan = ["QLSV_NGUOIHOC_HODEM", "QLSV_NGUOIHOC_TEN"];
        me._cot_KQHT().forEach(function (c) { if (c.field) arrCan.push(c.field); });
        var arrThieu = arrCan.filter(function (f) {
            for (var i = 0; i < rows.length; i++) if (f in rows[i]) return false;
            return true;
        });
        if (arrThieu.length && window.console) {
            console.warn("[tracuudiem] pkg_diem_baocao.LayDanhSachHoSoNhieuNganh chưa trả các cột: " + arrThieu.join(", ") + " (các ô này để trống, cần báo BE). Dòng mẫu:", rows[0]);
        }
    },
    _oHienThi_KQHT: function (c, r) {
        var v = c.render ? c.render(r) : r[c.field];
        if (v === null || v === undefined) return "";
        if (c.field === "TONGNOPHI" && String(v) !== "") v = edu.util.formatCurrency(v);
        return this._esc_KQHT(v);
    },
    // Tham số API dựng từ bộ lọc trên form — dùng chung cho xem từng trang và Xuất Excel toàn bộ
    _req_KQHT: function (pv) {
        var me = this;
        return {
            'action': 'D_BaoCao_MH/DSA4BSAvKRIgIikJLhIuDykoJDQPJiAvKQPP',
            'func': 'pkg_diem_baocao.LayDanhSachHoSoNhieuNganh',
            'iM': edu.system.iM,
            'strTuKhoa': $.trim(edu.util.getValById('txtSearch_TuKhoa') || ''),
            'strNamNhapHoc': '',                                        // form không có -> rỗng
            'strKhoaQuanLy_Id': me._val_KQHT('dropKhoaQuanLy'),
            'strHeDaoTao_Id': me._val_KQHT('dropHeDaoTao'),
            'strKhoaDaoTao_Id': me._val_KQHT('dropKhoaDaoTao'),
            'strChuongTrinh_Id': me._val_KQHT('dropChuongTrinhDaoTao'),
            'strLopQuanLy_Id': me._val_KQHT('dropLopQuanLy'),
            'strTrangThaiNguoiHoc_Id': me._val_KQHT('dropTinhTrangSinhVien'),
            'strChucNang_Id': edu.system.strChucNang_Id,
            // 2 tham số mới của proc (ParamPhamViTongHopDiem_Id / ParamDaoTao_ThoiGianDaoTao_Id).
            // GIẢ ĐỊNH: tên str* theo quy ước Param* -> str*, chờ BE xác nhận controller D_BaoCao_MH đã nhận 2 tham số này.
            'strPhamViTongHopDiem_Id': pv.id,
            'strDaoTao_ThoiGianDaoTao_Id': pv.giaTri,                  // Năm học: năm (vd 2025); Học kỳ: Id kỳ; Toàn khóa: rỗng
            'strTN_KeHoach_Id': '',
            'strNguoiThucHien_Id': edu.system.userId
        };
    },
    // Chụp điều kiện lúc bấm xem: phân trang và Xuất Excel dùng đúng điều kiện này (không đọc lại ô lọc)
    _snapLoc_KQHT: function (pv) {
        var me = this;
        var items = [
            { label: "Hệ đào tạo", id: "dropHeDaoTao" },
            { label: "Khóa đào tạo", id: "dropKhoaDaoTao" },
            { label: "Khoa quản lý", id: "dropKhoaQuanLy" },
            { label: "Chương trình đào tạo", id: "dropChuongTrinhDaoTao" },
            { label: "Lớp quản lý", id: "dropLopQuanLy" },
            { label: "Tình trạng sinh viên", id: "dropTinhTrangSinhVien" }
        ];
        var parts = ["Phạm vi: " + pv.ten + (pv.giaTriTen ? " " + pv.giaTriTen : "")];
        var sel = {};
        items.forEach(function (it) {
            var arr = me._tenDangChon_KQHT(it.id);
            sel[it.id] = arr;
            if (arr.length) parts.push(it.label + ": " + (arr.length > 8 ? arr.slice(0, 8).join(", ") + " ... (+" + (arr.length - 8) + ")" : arr.join(", ")));
        });
        var strTuKhoa = $.trim(edu.util.getValById("txtSearch_TuKhoa") || "");
        if (strTuKhoa) parts.push("Từ khóa: " + strTuKhoa);
        return { pv: pv, nhom: me._tieuDeNhom_KQHT(pv), parts: parts, sel: sel };
    },
    openKetQuaHocTap: function () {
        var me = this;
        var pv = me._phamVi_KQHT();
        if (!pv.id) {
            edu.system.alert('Vui lòng chọn "Phạm vi tổng hợp" (Học kỳ / Năm học / Toàn khóa...) trước khi xem kết quả học tập.', 'w');
            return;
        }
        if (pv.canGiaTri && !pv.giaTri) {
            edu.system.alert('Vui lòng chọn giá trị cho phạm vi "' + pv.ten + '".', 'w');
            return;
        }
        me.objLoc_KQHT = me._req_KQHT(pv);
        me.snapLoc_KQHT = me._snapLoc_KQHT(pv);
        me._cacheXuat_KQHT = null;
        edu.system.pageIndex_default = 1;
        $("#lblKQHT_TieuDe").text("Kết quả học tập theo " + pv.ten + (pv.giaTriTen ? ": " + pv.giaTriTen : ""));
        $("#lblKQHT_Tong").html("");
        $("#lblKQHT_DieuKien").text(me.snapLoc_KQHT.parts.join("; "));
        me._dungTieuDe_KQHT(me.snapLoc_KQHT.nhom);
        edu.util.toggle_overide("zone-bus", "zone_input_KetQuaHocTap");
        me.getList_KetQuaHocTap();
    },
    // Nạp 1 trang (thanh phân trang gọi lại hàm này với edu.system.pageIndex_default/pageSize_default mới)
    getList_KetQuaHocTap: function () {
        var me = this;
        if (!me.objLoc_KQHT) return;
        var obj_list = $.extend({}, me.objLoc_KQHT, {
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default
        });
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var rows = me._chuanHoaKhoa_KQHT(data.Data || []);
                    me.dtKetQuaHocTap = rows;
                    me._canhBaoThieuCot_KQHT(rows);
                    me.genTable_KetQuaHocTap(rows, parseInt(data.Pager, 10) || rows.length);
                } else {
                    edu.system.alert("Kết quả học tập: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Kết quả học tập (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    genTable_KetQuaHocTap: function (data, iPager) {
        var me = this;
        $("#lblKQHT_Tong").html(iPager);
        var cols = me._cot_KQHT(me.snapLoc_KQHT ? me.snapLoc_KQHT.nhom : "");
        var aoColumns = [], center = [0], right = [];
        cols.forEach(function (c, i) {
            aoColumns.push({ "mRender": function (nRow, aData) { return me._oHienThi_KQHT(c, aData); } });
            if (c.align === "center") center.push(i + 1);   // +1 vì cột Stt do loadToTable_data tự thêm
            if (c.align === "right") right.push(i + 1);
        });
        edu.system.loadToTable_data({
            strTable_Id: "tblKetQuaHocTap",
            bPaginate: {
                strFuntionName: "main_doc.TraCuuDiem.getList_KetQuaHocTap()",
                iDataRow: iPager
            },
            aaData: data,
            colPos: { center: center, right: right },
            aoColumns: aoColumns
        });
        // systemroot chèn thanh phân trang ngay trước bảng (tức bên trong khung cuộn) -> đưa ra ngoài để luôn nhìn thấy
        $(".zone-pag-headertblKetQuaHocTap").insertBefore("#zoneKQHT_TopScroll");
        me._dongBoCuonNgang_KQHT();
    },
    // Thanh cuộn ngang giả phía trên bảng <-> khung bảng (so giá trị trước khi gán nên không lặp sự kiện)
    _ganCuonNgang_KQHT: function () {
        var top = document.getElementById("zoneKQHT_TopScroll"), wrap = document.getElementById("zoneKQHT_Wrap");
        if (!top || !wrap) return;
        top.addEventListener("scroll", function () { if (wrap.scrollLeft !== top.scrollLeft) wrap.scrollLeft = top.scrollLeft; });
        wrap.addEventListener("scroll", function () { if (top.scrollLeft !== wrap.scrollLeft) top.scrollLeft = wrap.scrollLeft; });
    },
    _dongBoCuonNgang_KQHT: function () {
        var tbl = document.getElementById("tblKetQuaHocTap"), top = document.getElementById("zoneKQHT_TopScroll");
        if (tbl && top && top.firstElementChild) top.firstElementChild.style.width = tbl.scrollWidth + "px";
    },
    /*------------------------------------------
    --Discription: [KQHT] Xuất Excel qua chuẩn chung edu.exporter (Corei/exportexcel.js):
    --  nạp lại TOÀN BỘ (pageSize lớn) theo điều kiện lần xem gần nhất, tiêu đề 2 tầng giống bảng, hỏi trước khi xuất + lọc thêm.
    -------------------------------------------*/
    exportExcel_KQHT: function () {
        var me = this;
        if (!edu.exporter || typeof edu.exporter.exportWithConfirm !== "function") {
            edu.system.alert("Trang chưa nạp bộ xuất Excel dùng chung (Corei/exportexcel.js).", "w");
            return;
        }
        if (!me.objLoc_KQHT) {
            edu.system.alert('Chưa có dữ liệu để xuất. Vui lòng bấm "Kết quả học tập theo ..." trước.', 'w');
            return;
        }
        if (me._bNapXuat_KQHT) return;   // đang nạp toàn bộ: bỏ qua các lần bấm thêm
        me._napToanBo_KQHT(function (rows, iTong) {
            if (!rows.length) {
                edu.system.alert("Không có sinh viên nào theo điều kiện đang xem.", "w");
                return;
            }
            edu.exporter.exportWithConfirm(me._optsExport_KQHT(rows, iTong));
        });
    },
    // Cùng API, cùng điều kiện, pageSize lớn. Giữ kết quả 5 phút; bấm xem lại (openKetQuaHocTap) thì bỏ.
    _napToanBo_KQHT: function (cb) {
        var me = this;
        var strKhoa = JSON.stringify(me.objLoc_KQHT);
        var c = me._cacheXuat_KQHT;
        if (c && c.key === strKhoa && Date.now() - c.at < 5 * 60 * 1000) { cb(c.rows, c.iTong); return; }
        var obj_list = $.extend({}, me.objLoc_KQHT, { 'pageIndex': 1, 'pageSize': 1000000 });
        me._bNapXuat_KQHT = true;
        edu.system.makeRequest({
            success: function (data) {
                me._bNapXuat_KQHT = false;
                if (data.Success) {
                    var rows = me._chuanHoaKhoa_KQHT(data.Data || []);
                    var iTong = parseInt(data.Pager, 10) || rows.length;
                    me._cacheXuat_KQHT = { key: strKhoa, rows: rows, iTong: iTong, at: Date.now() };
                    cb(rows, iTong);
                } else {
                    edu.system.alert("Xuất Excel kết quả học tập: " + data.Message, "w");
                }
            },
            error: function (er) {
                me._bNapXuat_KQHT = false;
                edu.system.alert("Xuất Excel kết quả học tập (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: []
        }, false, false, false, null);
    },
    _optsExport_KQHT: function (rows, iTong) {
        var me = this;
        var snap = me.snapLoc_KQHT || { pv: {}, nhom: "", parts: [], sel: {} };
        return {
            fileName: "KetQuaHocTap_" + (snap.pv.ma || "SinhVien"),
            title: "KẾT QUẢ HỌC TẬP CỦA SINH VIÊN",
            subTitles: snap.parts.length ? [snap.parts.join("; ")] : [],
            // Máy chủ trả thiếu so với tổng số thì báo rõ, không giả vờ xuất đủ
            notice: rows.length < iTong ? ("Máy chủ chỉ trả " + rows.length.toLocaleString("vi-VN") + " / " + iTong.toLocaleString("vi-VN")
                + " sinh viên — file sẽ thiếu. Hãy thu hẹp điều kiện rồi xuất lại.") : "",
            columns: me._cot_KQHT(snap.nhom),
            data: rows,
            filters: [
                { label: "Trạng thái", field: "QLSV_TRANGTHAINGUOIHOC_TEN", selected: snap.sel.dropTinhTrangSinhVien || [] },
                { label: "Hệ đào tạo", field: "DAOTAO_HEDAOTAO_TEN", selected: snap.sel.dropHeDaoTao || [] },
                { label: "Khóa đào tạo", field: "DAOTAO_KHOADAOTAO_TEN", selected: snap.sel.dropKhoaDaoTao || [] },
                { label: "Khoa quản lý", field: "DAOTAO_KHOAQUANLY_TEN", selected: snap.sel.dropKhoaQuanLy || [] },
                // Ô CTĐT hiện "TEN - MA", ô lớp hiện TEN còn cột là MA -> không tích sẵn để tránh khớp lệch
                { label: "Chương trình đào tạo", field: "DAOTAO_CHUONGTRINH_TEN" },
                { label: "Lớp", field: "DAOTAO_LOPQUANLY_MA" },
                { label: "Xếp loại học tập", field: "XLHT_XEPLOAI_TEN" },
                { label: "Xếp loại rèn luyện", field: "DRL_XEPLOAI_TEN" }
            ]
        };
    },
    reportAllTable: function (strTable_Id) {

        var arrTemp = [];
        var uuid = edu.util.uuid();
        var i = 0;
        i = addValueV2("#tblTraCuuDiemNguoiHoc thead", "HEAD", i, 0);
        i = addValueV2("#tblTraCuuDiemNguoiHoc tbody", "BODY", i, 0);
        i = 0;
        i = addValueV2("#" + strTable_Id + " thead", "HEAD", i, 4);
        i = addValueV2("#" + strTable_Id + " tbody", "BODY", i, 4);
        report();

        function addValueV2(strZone, strType, iBatDauDong, iBatDauCot) {
            console.log(iBatDauDong);
            if ($(strZone).length === 0) return 0;
            var head = $(strZone)[0].rows;
            for (var i = 0; i < head.length; i++) {
                if ($(head[i]).html() == "") break;
            }
            var lhang = i;
            var iRowMinus = head.length - i;
            for (i = 0; i < lhang; i++) {
                var lCot = head[i].cells.length;
                for (var j = 0; j < lCot; j++) {
                    if (head[i].cells[j].rowSpan > 1) {
                        for (var k = 1; k < head[i].cells[j].rowSpan - iRowMinus; k++) {
                            if (j == 0) {
                                $(head[i + k]).prepend('<td class="tdhidden" style="display:none"></td>');

                            }
                            else {
                                if (head[i + k].cells[j - 1] == undefined) {
                                    $(head[i + k]).append('<td class="tdhidden" style="display:none"></td>');
                                } else {

                                    $(head[i + k].cells[j - 1]).after('<td class="tdhidden" style="display:none"></td>');
                                }
                            }
                        }

                        //head[i].cells[j].rowSpan = 1;
                    }
                    if (head[i].cells[j].colSpan > 1) {
                        for (var k = 1; k < head[i].cells[j].colSpan; k++) {
                            $(head[i].cells[j]).after('<td class="tdhidden" style="display:none"></td>');
                            lCot++;
                        }
                        //head[i].cells[j].colSpan = 1;
                    }
                }
            }
            for (var i = 0; i < lhang; i++) {
                for (var j = 0; j < head[i].cells.length; j++) {
                    var cell = head[i].cells[j];
                    if (cell.style.display != "none") {
                        var point = cell;
                        var strValue = "";
                        var strTempId = "";
                        var arrSelect = $(point).find("select");
                        var arrInput = $(point).find("input");
                        for (var k = 0; k < arrSelect.length; k++) {
                            var strTempValue = "";
                            if ($(arrSelect[k]).val() != "") {
                                strTempValue = $(arrSelect[k]).find("option:selected").text();
                            }
                            strValue += ";" + strTempValue;
                            strTempId += ";" + arrSelect[k].id + "#select";
                        }
                        for (var k = 0; k < arrInput.length; k++) {
                            if ($(arrInput[k]).attr("type") == "checkbox") continue;
                            strValue += ";" + $(arrInput[k]).val();
                            strTempId += ";" + arrInput[k].id + "#input";
                        }
                        if (strValue != "") strValue = strValue.substring(1);
                        else strValue = $(cell).text();
                        if (strTempId != "") {
                            strTempId = strTempId.substring(1);
                            type = "input";
                        }
                        var cellrowspan = cell.rowSpan;
                        if (cellrowspan > 1) cellrowspan = cellrowspan - iRowMinus;
                        arrTemp.push({
                            strTable_Id: uuid,
                            iRow: i + iBatDauDong,
                            iCol: j + iBatDauCot,
                            iRowSpan: cellrowspan,
                            iColSpan: cell.colSpan,
                            strData_Cell: strValue,
                            strData_TempId: strTempId,
                            strData_Align: strType
                        });
                    }
                }
            }
            return i;
        }

        function report() {
            edu.system.makeRequest({
                type: "POST",
                action: 'SYS_Report/AllTable_Element',
                complete: function () {
                    var url_report = edu.system.strhost + "/reportcms/Modules/Common/BaoCao.aspx?id=" + uuid + "&table=" + strTable_Id;
                    console.log(url_report);
                    //alert(url_report);
                    location.href = url_report;
                },
                contentType2: 'application/json', 

                data: JSON.stringify(arrTemp),
                fakedb: [
                ]
            }, false, false, false, null);
        }
    }
}