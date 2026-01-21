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
            me.getList_LopQuanLy();
        });
        $("#dropPhanViTongHop").on("select2:select", function () {
            var strMa = $("#dropPhanViTongHop option:selected").attr("id");
            me.strPhamViMa = strMa;
            edu.util.toggle_overide("zonePhamVi", "zone_" + strMa);
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

        $("#zone_input_TraCuuDiem").delegate(".btnReportAll", "click", function () {
            edu.system.reportAllTable_User(this.name);
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
        for (var i = 0; i < dtNguoiHoc.length; i++) {
            row += '<th rowspan="2" ' + me.getstyle(dtNguoiHoc[i]) + ' >' + dtNguoiHoc[i].TENCOT + '</th>';
            dChieuDaiHead += edu.util.returnZero(dtNguoiHoc[i].DORONG);
        }
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
                row += '<td>' + edu.util.returnEmpty(data[i][me.dtCotNguoiHoc[j].MACOT]) + '</td>';
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