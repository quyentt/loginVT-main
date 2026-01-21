/*----------------------------------------------
--Author: nnthuong
--Phone: 
--Date of created: 02/8/2018
--Input: 
--Output:
--Note:
----------------------------------------------*/
function DiemHoc() { };
DiemHoc.prototype = {
    dtKetQua: [],
    init: function () {
        var me = this;

        $("#zoneDiemMoi").delegate('.chitietdiem', 'mouseenter', function (e) {
            var point = this;
            var id = this.id;
            me.popover_DiemHoc(id, point);
        });

        $("#zone_bangdiem").delegate('.btnXemDiemThanhPhan', 'mouseenter', function (e) {
            var point = this;
            var id = this.id;
            me.popover_DiemThanhPhan(id, point);
        });
        me.strNguoiHoc_Id = edu.system.userId;// 'e7c4d5e4b2ed4ea1a50c3aaaac1988f6';
        me.getList_ChuongTrinhHoc();

        // test
        //me.dtKetQua = JSON.parse(dtResult).Data;
        //var arrThanhPhan = [];
        //me.dtKetQua.rsDiemThanhPhan.forEach(element => {
        //    if (arrThanhPhan.indexOf(element.DIEM_THANHPHANDIEM_TEN) === -1) arrThanhPhan.push(element.DIEM_THANHPHANDIEM_TEN);
        //});
        //me.dtKetQua["arrThanhPhan"] = arrThanhPhan;
        //me.genHtml_ThongTinCaNhan();
        //me.genHtml_DiemMoi();
        //me.genHtml_TongDiem();
        //me.genHtml_BangDiem();
        //me.genHtml_HocPhanChuaQua();
        //end test
    },
    /*------------------------------------------
    --Discription: Hàm chung 
    -------------------------------------------*/
    getList_KetQuaHocTap: function () {
        var me = this;
        var obj_list = {
            'action': 'SV_ThongTin/KetQuaHocTapCaNhan',
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strQLSV_NguoiHoc_Id': me.strNguoiHoc_Id,
            'strDaoTao_ChuongTrinh_Id': edu.util.getValById('dropSearch_ChuongTrinh'),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.dtKetQua = dtResult;
                    var arrThanhPhan = [];
                    me.dtKetQua.rsDiemThanhPhan.forEach(element => {
                        if (arrThanhPhan.indexOf(element.DIEM_THANHPHANDIEM_TEN) === -1) arrThanhPhan.push(element.DIEM_THANHPHANDIEM_TEN);
                    });
                    me.genHtml_ThongTinCaNhan();
                    me.genHtml_DiemMoi();
                    me.genHtml_TongDiem();
                    me.genHtml_BangDiem();
                    me.genHtml_HocPhanChuaQua();
                }
                else {
                    edu.system.alert(data.Message, "w");
                }

            },
            error: function (er) {
                edu.system.alert(JSON.stringify(er), "w");

            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,

            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genHtml_ThongTinCaNhan: function () {
        var me = this;
        var jsonSV = me.dtKetQua.rsThongTinNguoiHoc[0];
        $("#lblHoTen").html(edu.util.returnEmpty(jsonSV.QLSV_NGUOIHOC_HODEM) + " " + edu.util.returnEmpty(jsonSV.QLSV_NGUOIHOC_TEN));
        $("#lblMaSo").html(edu.util.returnEmpty(jsonSV.QLSV_NGUOIHOC_MASO));
        $("#lblNgaySinh").html(edu.util.returnEmpty(jsonSV.QLSV_NGUOIHOC_NGAYSINH));
        $("#lblGioiTinh").html(edu.util.returnEmpty(jsonSV.QLSV_NGUOIHOC_GIOITINH));
        $("#lblTrangThai").html(edu.util.returnEmpty(jsonSV.QLSV_TRANGTHAINGUOIHOC_TEN));
        $("#lblLop").html(edu.util.returnEmpty(jsonSV.DAOTAO_LOPQUANLY_TEN));
    },
    genHtml_DiemMoi: function () {
        var me = this;
        var htmlDiemMoi = '';
        me.dtKetQua.rsDiemMoiNhat.forEach(element => {
            var classBG = "";
            if (element.DIEM === 0) classBG = "badge bg-red";
            if (element.DIEM >= 3) classBG = "color-orange";
            if (element.DIEM >= 5) classBG = "";
            if (element.DIEM >= 7) classBG = "color-blue";
            if (element.DIEM >= 8.5) classBG = "badge color-active";
            htmlDiemMoi += '<li id="' + element.ID + '"  class="chitietdiem"><span class="subject">' + edu.util.returnEmpty(element.DAOTAO_HOCPHAN_TEN) + '</span><span class="' + classBG + '"><b>' + edu.util.returnEmpty(element.DIEM) + '</b></span></li>';
        });
        $("#zoneDiemMoi").html(htmlDiemMoi);
    },
    popover_DiemHoc: function (strId, point) {
        var me = this;
        var data = me.dtKetQua.rsDiemMoiNhat.find(element => element.ID === strId);
        var row = "";
        row += '<div class="pcard" style="width: 330px; float: left; padding-left: 0px; margin-top: -7px; font-size: 18px"></td>';
        row += '<table  class="table">';
        row += '<thead>';
        row += '<tr>';
        row += '<th class="td-center td-fixed">Stt</th>';
        row += '<th class="td-center">Lần học</th>';
        row += '<th class="td-center">Lần thi</th>';
        row += '<th class="td-center">Điểm</th>';
        row += '</tr>';
        row += '</thead>';
        row += '<tbody>';
        row += '<tr>';
        row += '<td class="td-center">1</td>';
        row += '<td class="td-center">' + edu.util.returnEmpty(data.LANHOC) + '</td>';
        row += '<td class="td-center">' + edu.util.returnEmpty(data.LANTHI) + '</td>';
        row += '<td class="td-center">' + edu.util.returnEmpty(data.DIEM) + '</td>';
        row += '</tr>';
        row += '</tbody>';
        row += '</table>';
        row += '</div>';
        $(point).popover({
            container: 'body',
            content: row,
            trigger: 'hover',
            html: true,
            placement: 'top',
        });
        $(point).popover('show');
    },
    genHtml_TongDiem: function () {
        var me = this;
        var jsonSV = me.dtKetQua.rsDiemTrungBinhChung;

        var temp = jsonSV.find(element => element.DAOTAO_THOIGIANDAOTAO_ID === null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHCHUNG' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10');
        temp !== undefined ? $("#lblTongTinChi").html(edu.util.returnEmpty(temp.TONGSOTINCHI)) : $("#lblTongTinChi").html("");
        
        //temp = jsonSV.find(element => element.DAOTAO_THOIGIANDAOTAO_ID === null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHCHUNG' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10');
        temp !== undefined ? $("#lblTrungBinh10").html(edu.util.returnEmpty(temp.DIEMTRUNGBINH)) : $("#lblTrungBinh10").html("");

        temp = jsonSV.find(element => element.DAOTAO_THOIGIANDAOTAO_ID === null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHCHUNG' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '4');
        temp !== undefined ? $("#lblTrungBinh4").html(edu.util.returnEmpty(temp.DIEMTRUNGBINH)) : $("#lblTrungBinh4").html("");
        
        temp = jsonSV.find(element => element.DAOTAO_THOIGIANDAOTAO_ID === null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHTICHLUY' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10');
        temp !== undefined ? $("#lblTichLuy").html(edu.util.returnEmpty(temp.TONGSOTINCHI)) : $("#lblTichLuy").html("");

        //temp = jsonSV.find(element => element.DAOTAO_THOIGIANDAOTAO_ID === null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHTICHLUY' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10');
        temp !== undefined ? $("#lblTichLuy10").html(edu.util.returnEmpty(temp.DIEMTRUNGBINH)) : $("#lblTichLuy10").html("");

        temp = jsonSV.find(element => element.DAOTAO_THOIGIANDAOTAO_ID === null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHTICHLUY' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '4');
        temp !== undefined ? $("#lblTichLuy4").html(edu.util.returnEmpty(temp.DIEMTRUNGBINH)) : $("#lblTichLuy4").html("");
    },
    genHtml_BangDiem: function () {
        var me = this;
        var data = me.dtKetQua.rsDiemKetThucHocPhan;

        var arrHocKy = [];
        data.forEach(element => {
            var strHocKy = element.NAMHOC + "_" + element.HOCKY;
            if (arrHocKy.indexOf(strHocKy) === -1) arrHocKy.push(strHocKy);
        });

        var htmlBangDiem = "";
        var check = true;
        arrHocKy.forEach(element => {
            var strNamHoc = element.substring(0, element.lastIndexOf('_'));
            var strHocKy = element.substring(element.lastIndexOf('_') + 1);
            var jsonDiem = data.filter(element => element.NAMHOC === strNamHoc && element.HOCKY == strHocKy);
            
            htmlBangDiem += '<a class="color-active poiter" data-toggle="collapse" data-target="#hocky_' + element + '"> + Năm học ' + strNamHoc + ' - Học kỳ ' + strHocKy + '</a><br />';
            htmlBangDiem += '<div id="hocky_' + element + '" class="collapse ';
            htmlBangDiem += check ? "in" : ''; check = false;
            htmlBangDiem += '">';
            htmlBangDiem += '<div class="zone-content scroll-table-x">';
            htmlBangDiem += '<table class="table">';
            htmlBangDiem += '<thead>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<th class="td-center td-fixed">Stt</th>';
            htmlBangDiem += '<th class="td-left">Mã học phần</th>';
            htmlBangDiem += '<th class="td-left">Tên học phần</th>';
            htmlBangDiem += '<th class="td-center">Số tín chỉ</th>';
            htmlBangDiem += '<th class="td-center">Lần học</th>';
            htmlBangDiem += '<th class="td-center">Lần thi</th>';
            htmlBangDiem += '<th class="td-center">Điểm hệ 10</th>';
            htmlBangDiem += '<th class="td-center">Điểm hệ 4</th>';
            htmlBangDiem += '<th class="td-center">Điểm chữ</th>';
            htmlBangDiem += '<th class="td-center">Đánh giá</th>';
            htmlBangDiem += '<th class="td-center">Chi tiết</th>';
            htmlBangDiem += '</tr>';
            htmlBangDiem += '</thead>';
            htmlBangDiem += '<tbody>';

            for (var i = 0; i < jsonDiem.length; i++) {
                htmlBangDiem += '<tr>';
                htmlBangDiem += '<td class="td-center td-fixed">' + (i + 1) + '</td>';
                htmlBangDiem += '<td class="td-left">' + edu.util.returnEmpty(jsonDiem[i].DAOTAO_HOCPHAN_MA) + '</td>';
                htmlBangDiem += '<td class="td-left">' + edu.util.returnEmpty(jsonDiem[i].DAOTAO_HOCPHAN_TEN) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].DAOTAO_HOCPHAN_HOCTRINH) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].LANHOC) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].LANTHI) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].DIEM) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].DIEMQUYDOI) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].DIEMQUYDOI_TEN) + '</td>';
                htmlBangDiem += '<td class="td-center">' + edu.util.returnEmpty(jsonDiem[i].DANHGIA_TEN) + '</td>';
                htmlBangDiem += '<td class="td-center"><span><a class="btn btn-default btnXemDiemThanhPhan" id="' + jsonDiem[i].ID + '" title="Chi tiết"> Chi tiết</a></span></td>';
                htmlBangDiem += '</tr>';
            }

            htmlBangDiem += '</tbody>';
            htmlBangDiem += '</table>';



            htmlBangDiem += '<table class="table table-noborder">';
            htmlBangDiem += '<tbody>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<td class="td-right italic" colspan="5">Tổng số tín chỉ:</td>';

            htmlBangDiem += '<td class="td-right italic">';
            var temp = me.dtKetQua.rsDiemTrungBinhChung.find(element => element.DAOTAO_THOIGIANDAOTAO_ID !== null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHCHUNG' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10' && element.NAMHOC === strNamHoc && element.DAOTAO_THOIGIANDAOTAO_KY == strHocKy && element.DOTHOC === null);
            //console.log(temp);
            htmlBangDiem += temp !== undefined ? edu.util.returnEmpty(temp.TONGSOTINCHI) : "...";
            htmlBangDiem += '</td>';

            htmlBangDiem += '</tr>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<td class="td-right italic" colspan="5">Điểm trung bình hệ 10:</td>';

            htmlBangDiem += '<td class="td-right italic">';
            //temp = me.dtKetQua.rsDiemTrungBinhChung.find(element => element.DAOTAO_THOIGIANDAOTAO_ID !== null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHCHUNG' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10' && element.NAMHOC === strNamHoc && element.DAOTAO_THOIGIANDAOTAO_KY == strHocKy && element.DOTHOC === null);
            htmlBangDiem += temp !== undefined ? edu.util.returnEmpty(temp.DIEMTRUNGBINH) : "...";
            htmlBangDiem += '</td>';

            htmlBangDiem += '</tr>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<td class="td-right italic" colspan="5">Điểm trung bình hệ 4:</td>';

            htmlBangDiem += '<td class="td-right italic">';
            temp = me.dtKetQua.rsDiemTrungBinhChung.find(element => element.DAOTAO_THOIGIANDAOTAO_ID !== null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHCHUNG' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '4' && element.NAMHOC === strNamHoc && element.DAOTAO_THOIGIANDAOTAO_KY == strHocKy && element.DOTHOC === null);
            htmlBangDiem += temp !== undefined ? edu.util.returnEmpty(temp.DIEMTRUNGBINH) : "...";
            htmlBangDiem += '</td>';

            htmlBangDiem += '</tr>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<td class="td-right italic" colspan="5">Tổng số tín chỉ tích lũy:</td>';

            htmlBangDiem += '<td class="td-right italic">';
            temp = me.dtKetQua.rsDiemTrungBinhChung.find(element => element.DAOTAO_THOIGIANDAOTAO_ID !== null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHTICHLUY' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10' && element.NAMHOC === strNamHoc && element.DAOTAO_THOIGIANDAOTAO_KY == strHocKy && element.DOTHOC === null);
            htmlBangDiem += temp !== undefined ? edu.util.returnEmpty(temp.TONGSOTINCHI) : "...";
            htmlBangDiem += '</td>';

            htmlBangDiem += '</tr>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<td class="td-right italic" colspan="5">Điểm trung bình tích lũy hệ 10:</td>';

            htmlBangDiem += '<td class="td-right italic">';
            //temp = me.dtKetQua.rsDiemTrungBinhChung.find(element => element.DAOTAO_THOIGIANDAOTAO_ID !== null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHTICHLUY' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '10' && element.NAMHOC === strNamHoc && element.DAOTAO_THOIGIANDAOTAO_KY == strHocKy && element.DOTHOC === null);
            htmlBangDiem += temp !== undefined ? edu.util.returnEmpty(temp.DIEMTRUNGBINH) : "...";
            htmlBangDiem += '</td>';

            htmlBangDiem += '</tr>';
            htmlBangDiem += '<tr>';
            htmlBangDiem += '<td class="td-right italic" colspan="5">Điểm trung bình tĩnh lũy hệ 4:</td>';

            htmlBangDiem += '<td class="td-right italic">';
            temp = me.dtKetQua.rsDiemTrungBinhChung.find(element => element.DAOTAO_THOIGIANDAOTAO_ID !== null && element.LOAIDIEMTRUNGBINH_MA === 'TRUNGBINHTICHLUY' && element.THUOCTINHLANTINH === 0 && element.THANGDIEM_MA === '4' && element.NAMHOC === strNamHoc && element.DAOTAO_THOIGIANDAOTAO_KY == strHocKy && element.DOTHOC === null);
            htmlBangDiem += temp !== undefined ? edu.util.returnEmpty(temp.DIEMTRUNGBINH) : "...";
            htmlBangDiem += '</td>';

            htmlBangDiem += '</tr>';
            htmlBangDiem += '</tbody>';

            htmlBangDiem += '</table>';
            htmlBangDiem += '</div>';
            htmlBangDiem += '</div>';

        });
        $("#zone_bangdiem").html(htmlBangDiem);
    },
    popover_DiemThanhPhan: function (strId, point) {
        var me = this;
        var jsonSoSanh = me.dtKetQua.rsDiemKetThucHocPhan.find(element => element.ID == strId); 
        console.log(jsonSoSanh);
        var data = me.dtKetQua.rsDiemThanhPhan.filter(element => element.DAOTAO_HOCPHAN_ID === jsonSoSanh.DAOTAO_HOCPHAN_ID && element.LANHOC === jsonSoSanh.LANHOC && element.LANTHI === jsonSoSanh.LANTHI);
        if (data != undefined) {
            var row = "";
            row += '<div class="pcard" style="width: 330px; float: left; padding-left: 0px; margin-top: -7px; font-size: 18px"></td>';
            row += '<table  class="table">';
            row += '<thead>';
            row += '<tr>';
            row += '<th class="td-center td-fixed">Stt</th>';
            row += '<th class="td-center">Lần học</th>';
            row += '<th class="td-center">Lần thi</th>';
            for (var i = 0; i < me.dtKetQua.arrThanhPhan.length; i++) {
                row += '<th class="td-center">' + edu.util.returnEmpty(me.dtKetQua.arrThanhPhan[i]) + '</th>';
            }
            row += '</tr>';
            row += '</thead>';
            row += '<tbody>';
            var idem = 1;
            var arrcheck = [];
            data.forEach(element => {
                var strCheck = element.LANHOC + ":" + element.LANTHI;
                if (arrcheck.indexOf(strCheck) !== -1) return;
                arrcheck.push(strCheck);
                row += '<tr>';
                row += '<td class="td-center">' + idem + '</td>';
                row += '<td class="td-center">' + edu.util.returnEmpty(element.LANHOC) + '</td>';
                row += '<td class="td-center">' + edu.util.returnEmpty(element.LANTHI) + '</td>';
                for (var i = 0; i < me.dtKetQua.arrThanhPhan.length; i++) {
                    var temp = data.find(e => e.LANHOC === element.LANHOC && e.LANTHI === element.LANTHI && e.DIEM_THANHPHANDIEM_TEN === me.dtKetQua.arrThanhPhan[i]);
                    if (temp !== undefined) row += '<td class="td-center">' + edu.util.returnEmpty(temp.DIEM) + '</td>';
                }
                row += '</tr>';
                idem++;
            });

            row += '</tbody>';
            row += '</table>';
            row += '</div>';
            $(point).popover({
                container: 'body',
                content: row,
                trigger: 'hover',
                html: true,
                placement: 'top',
            });
            $(point).popover('show');
        }
        
    },
    genHtml_HocPhanChuaQua: function () {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblHocPhanChuaQua",
            aaData: me.dtKetQua.rsHocPhanChuaHoanThanh,
            colPos: {
                center: [0, 4, 5,6, 7, 8, 9],
                //right: [5]
            },
            aoColumns: [
                {
                    "mDataProp": "DAOTAO_HOCPHAN_MA"
                },
                {
                    "mDataProp": "DAOTAO_HOCPHAN_TEN"
                },
                {
                    "mDataProp": "DAOTAO_HOCPHAN_HOCTRINH"
                },
                {
                    "mDataProp": "LANHOC"
                },
                {
                    "mDataProp": "LANTHI"
                },
                {
                    "mDataProp": "DIEM"
                },
                {
                    "mDataProp": "DIEMQUYDOI"
                }
                , {
                    "mDataProp": "DIEMQUYDOI_TEN"
                }
                , {
                    "mDataProp": "DANHGIA_TEN"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
    /*------------------------------------------
	--Discription: [4]  ACESS DB ==> thoi gian dao tao
    --Author: duyentt
	-------------------------------------------*/
    getList_ChuongTrinhHoc: function () {
        var me = this;
        var obj_list = {
            'action': 'SV_ThongTin/LayThongTinChuongTrinhHoc',
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strQLSV_NguoiHoc_Id': me.strNguoiHoc_Id,//edu.util.getValById('dropAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genCombo_ChuongTrinhHoc(dtResult);
                }
                else {
                    edu.system.alert(data.Message, "w");
                }

            },
            error: function (er) {
                edu.system.alert(JSON.stringify(er), "w");

            },
            type: 'GET',
            action: obj_list.action,

            contentType: true,

            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genCombo_ChuongTrinhHoc: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "DAOTAO_TOCHUCCHUONGTRINH_ID",
                parentId: "",
                name: "DAOTAO_CHUONGTRINH_TEN",
            },
            renderPlace: ["dropSearch_ChuongTrinh"],
            title: "Chọn chương trình"
        };
        edu.system.loadToCombo_data(obj);
        if (data.length > 0) {
            edu.util.viewValById("dropSearch_ChuongTrinh", data[0].DAOTAO_TOCHUCCHUONGTRINH_ID);
            me.getList_KetQuaHocTap();
        }
    },
}