/*----------------------------------------------
--Author: Văn Hiệp
--Phone: 
--Date of created: 
--Input: 
--Output:
--Note:
----------------------------------------------*/
function HopDong() { };
HopDong.prototype = {
    dtHopDong: [],
    strHopDong_Id: '',
    arrSinhVien_Id: [],
    arrSinhVien: [],
    dtSinhVien: [],
    dtKieuHoc: [],
    dtKhoanThu: [],

    init: function () {
        var me = this;
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        
        //me.getList_ThoiGianDaoTao();
        me.getList_HopDong();
        me.getList_DoiTuongKhac();
        edu.system.loadToCombo_DanhMucDuLieu("TAICHINH.DOITAC.NGUYENTACPHANBO", "dropNguyenTac");
        edu.system.loadToCombo_DanhMucDuLieu("KHDT.DIEM.KIEUHOC", "", "", function (data) {
            me.dtKieuHoc = data;
        });
        me.getList_DMLKT();
        me.getList_HSSV();

        $("#btnSearch").click(function (e) {
            me.getList_HopDong();
        });
        $("#txtSearch").keypress(function (e) {
            if (e.which === 13) {
                me.getList_HopDong();
            }
        });
        $(".btnClose").click(function () {
            me.toggle_form();
        });
        $(".btnAdd").click(function () {
            me.rewrite();
            me.toggle_edit();
        });
        $("#btnSave_HopDong").click(function (e) {
            var valid = edu.util.validInputForm(me.arrValid);

            if (valid) {
                me.save_HopDong();
            }
        });
        $("[id$=chkSelectAll_HopDong]").on("click", function () {
            edu.util.checkedAll_BgRow(this, { table_id: "tblHopDong" });
        });
        $("#btnDelete_HopDong").click(function () {
            edu.system.confirm("Bạn có chắc chắn xóa dữ liệu không?");
            $("#btnYes").click(function (e) {
                $('#myModalAlert').modal('hide');
                me.delete_HopDong(me.strHopDong_Id);
            });
        });
        $("#tblHopDong").delegate('.btnEdit', 'click', function (e) {
            var strId = this.id;
            me.toggle_edit();
            me.strHopDong_Id = strId;
            strId = edu.util.cutPrefixId(/edit/g, strId);
            edu.util.setOne_BgRow(strId, "tblHopDong");
            if (edu.util.checkValue(strId)) {
                var data = edu.util.objGetDataInData(strId, me.dtHopDong, "ID")[0];
                me.viewEdit_HopDong(data);
            }
            else {
                edu.system.alert(edu.constant.getting("NOTIFY", "SELECT_F"));
            }
        });
        /*------------------------------------------
        --Discription: [2] Action SinhVien
        --Order: 
        -------------------------------------------*/
        $(".btnSearchDTSV_SinhVien").click(function () {
            edu.extend.genModal_SinhVien();
            edu.extend.getList_SinhVien("SEARCH");
        });
        $("#modal_sinhvien").delegate('.btnSelect', 'click', function () {
            var id = this.id;
            var strNhanSu_Id = edu.util.cutPrefixId(/slnhansu/g, id);
            me.addHTMLinto_SinhVien(strNhanSu_Id);
        });
        $("#tblInput_DTSV_SinhVien").delegate('.btnDeletePoiter', 'click', function () {
            var id = this.id;
            var strcheck = $(this).attr("name");
            var strNhanSu_Id = edu.util.cutPrefixId(/remove_nhansu/g, id);
            if (!edu.util.checkValue(strcheck)) {
                me.removeHTMLoff_SinhVien(strNhanSu_Id);
            }
            else {
                edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
                $("#btnYes").click(function (e) {
                    me.delete_SinhVien(strNhanSu_Id);
                });
            }
        });
        /*------------------------------------------
        --Discription: [2] Xóa nhiều sinh viên cùng lúc
        -------------------------------------------*/
        $("#chkSelectAll_SinhVien").on("click", function () {
            $("#tblInput_DTSV_SinhVien tbody .chkSinhVien").prop("checked", this.checked);
            me.update_SinhVienChon();
        });
        $("#tblInput_DTSV_SinhVien").delegate(".chkSinhVien", "click", function () {
            me.update_SinhVienChon();
        });
        $("#btnDelete_SinhVien_Chon").click(function () {
            var arrRow = me.getArr_SinhVienChon();
            if (arrRow.length == 0) {
                edu.system.alert("Vui lòng chọn sinh viên cần xóa!");
                return;
            }
            me.deleteMulti_SinhVien(arrRow);
        });

        /*------------------------------------------
        --Discription: [2] Action SinhVien
        --Order:
        -------------------------------------------*/
        me.arrValid= [
            //EM-empty, FL-float, IN-int, DA-date, seperated by '#' character...
            { "MA": "txtHopDong_So", "THONGTIN1": "EM" },
            //{ "MA": "txtDeTai_ToChucCoDeTai", "THONGTIN1": "EM" },
            //{ "MA": "txtDeTai_TongSoTacGia", "THONGTIN1": "EM" },
            //{ "MA": "dropDeTai_PhanLoai", "THONGTIN1": "EM" }
        ];

        $("#tblHopDong").delegate('.btnDSDoiTuong', 'click', function (e) {
            $('#myModal').modal('show');
            me.getList_QuanSoTheoLop(this.id);
        });

        /*------------------------------------------
       --Discription: [4-1] Action KetQua_Detai
       --Order:
       -------------------------------------------*/
        $("#btnAddChinhSach").click(function () {
            var id = edu.util.randomString(30, "");
            me.genHTML_ChinhSach(id, "");
        });
        $("#tblChinhSach").delegate(".deleteRowButton", "click", function () {
            var strRowId = this.id;
            $("#tblChinhSach tr[id='" + strRowId + "']").remove();
        });
        $("#tblChinhSach").delegate(".deleteChinhSach", "click", function () {
            var strId = this.id;
            edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
            $("#btnYes").click(function (e) {
                me.delete_ChinhSach(strId);
            });
        });

        /*------------------------------------------
       --Discription: [4-1] Action KetQua_Detai
       --Order:
       -------------------------------------------*/
        $("#btnAddChinhSachRieng").click(function () {
            var id = edu.util.randomString(30, "");
            me.genHTML_ChinhSachRieng(id, "");
        });
        $("#tblChinhSachRieng").delegate(".deleteRowButton", "click", function () {
            var strRowId = this.id;
            $("#tblChinhSachRieng tr[id='" + strRowId + "']").remove();
        });
        $("#tblChinhSachRieng").delegate(".deleteChinhSachRieng", "click", function () {
            var strId = this.id;
            edu.system.confirm(edu.constant.getting("NOTIFY", "CF_DELETE"));
            $("#btnYes").click(function (e) {
                me.delete_ChinhSachRieng(strId);
            });
        });
    },

    rewrite: function () {
        //reset id
        var me = this;
        //
        me.strHopDong_Id = "";
        me.arrSinhVien_Id = [];
        me.arrSinhVien = [];

        edu.util.viewValById("dropDoiTac", edu.util.getValById("dropSearch_DoiTac"));
        edu.util.viewValById("txtMoTa", "");
        edu.util.viewValById("txtSoHopDong", );
        edu.util.viewValById("dropHieuLuc", edu.util.getValById("dropSearch_HieuLuc"));
        edu.util.viewValById("txtNgayKy", "");
        edu.util.viewValById("dropNguyenTac", "");
        $("#tblInput_DTSV_SinhVien tbody").html("");
        me.update_SinhVienChon();
        $("#tblChinhSach tbody").html("");
        for (var i = 0; i < 1; i++) {
            var id = edu.util.randomString(30, "");
            me.genHTML_ChinhSach(id, "");
        }
        $("#tblChinhSachRieng tbody").html("");
        for (var i = 0; i < 1; i++) {
            var id = edu.util.randomString(30, "");
            me.genHTML_ChinhSachRieng(id, "");
        }
    },
    toggle_form: function () {
        edu.util.toggle_overide("zone-bus", "zonebatdau");
        this.getList_HopDong();
    },
    toggle_edit: function () {
        edu.util.toggle_overide("zone-bus", "zoneEdit");
    },
    /*------------------------------------------
    --Discription: [1] ACCESS DB ==> KhoanThu
    --ULR: Modules
    -------------------------------------------*/
    getList_HopDong: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TC_HopDong/LayDSTaiChinh_NguoiHoc_HopDong',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtSearch'),
            'strDonViKyHopDong_Id': edu.util.getValById('dropSearch_DoiTac'),
            'strNguoiTao_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtHopDong = dtReRult;
                    me.genTable_HopDong(dtReRult, data.Pager);
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
    save_HopDong: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'TC_NguoiHoc_HopDong/ThemMoi',
            
            'strId': me.strHopDong_Id,
            'strSoHopDong': edu.util.getValById('txtSoHopDong'),
            'strNgayKy': edu.util.getValById('txtNgayKy'),
            'strMoTa': edu.util.getValById('txtMoTa'),
            'dHieuLuc': edu.util.getValById('dropHieuLuc'),
            'strDonViKyHopDong_Id': edu.util.getValById('dropDoiTac'),
            'strNguyenTacPhanBo_Id': edu.util.getValById('dropNguyenTac'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strChucNang_Id': edu.system.strChucNang_Id,
        };
        if (obj_save.strId != "") {
            obj_save.action = 'TC_NguoiHoc_HopDong/CapNhat';
        }
        //default
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var bThemMoi = (obj_save.strId == "");
                    var strHopDong_Id = bThemMoi ? data.Id : obj_save.strId;
                    //Gán lại Id: bấm Lưu lần nữa là Cập nhật, không tạo thêm hợp đồng mới
                    me.strHopDong_Id = strHopDong_Id;
                    //Lưu sinh viên + chính sách qua form tiến trình (thông báo hiện trong form, không alert chồng modal)
                    me.saveChiTiet_HopDong(strHopDong_Id, bThemMoi ? "Thêm mới thành công!" : "Cập nhật thành công!");
                }
                else {
                    edu.system.alert(data.Message);
                    me.getList_HopDong();
                }
            },
            error: function (er) {
                edu.system.alert("XLHV_HopDong/ThemMoi (er): " + JSON.stringify(er), "w");
                
            },
            type: 'POST',
            
            contentType: true,
            
            action: obj_save.action,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    delete_HopDong: function (strId) {
        var me = this;
        //--Edit
        var obj = {};
        var obj_delete = {
            'action': 'TC_NguoiHoc_HopDong/Xoa',
            

            'strIds': strId,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                    me.getList_HopDong();
                }
                else {
                    obj = {
                        content: "TC_NguoiHoc_HopDong/Xoa: " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
                
            },
            error: function (er) {
                var obj = {
                    content: "TC_NguoiHoc_HopDong/Xoa (er): " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
                
            },
            type: 'POST',
            action: obj_delete.action,

            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [1] Lưu chi tiết hợp đồng qua form tiến trình chung (Corei/processrun.js, edu.process).
    -- Duyệt TẤT CẢ dòng đang có trên giao diện, từ trên xuống, mỗi dòng 1 lời gọi xuống DB.
    -- FE không lọc/kiểm tra trùng (DB tự kiểm tra):
    --   1. Sinh viên: mọi dòng, kể cả dòng đã lưu trước đó     -> TC_NguoiHoc_QuanLy/ThemMoi
    --   2. Chính sách áp dụng (dòng đã chọn Loại khoản + Kiểu học) -> TC_NguoiHoc_Khoan/ThemMoi | CapNhat
    --   3. Chính sách riêng theo học viên (như trên)              -> TC_HopDong_NH_Khoan/ThemMoi | CapNhat
    -- Mã người học đọc từ thuộc tính data-nguoihoc-id gắn trên dòng lúc thêm. Trước đây tra lại edu.extend.dtSinhVien,
    -- nhưng mảng này bị ghi đè mỗi lần tìm/chuyển trang trong modal chọn SV: chọn qua nhiều lần tìm (vài trăm SV)
    -- thì dòng đầu tiên đã không tìm thấy -> lỗi JS -> không gọi DB dòng nào, kể cả chính sách.
    -------------------------------------------*/
    saveChiTiet_HopDong: function (strHopDong_Id, strThongBao) {
        var me = this;
        var arrItem = me.getItems_LuuHopDong(strHopDong_Id);
        if (arrItem.length == 0) {
            edu.system.alert(strThongBao);
            me.getList_HopDong();
            return;
        }
        if (!edu.process) {
            edu.system.alert(strThongBao + "<br/>Chưa lưu danh sách sinh viên / chính sách: thiếu form tiến trình (Corei/processrun.js).", "w");
            me.getList_HopDong();
            return;
        }
        var iSinhVien = arrItem.filter(function (it) { return it.LOAI == "Sinh viên"; }).length;
        edu.process.run({
            title: "Lưu hợp đồng",
            subTitles: [
                "Hợp đồng số " + edu.util.getValById("txtSoHopDong") + " - " + me.getText_Combo("dropDoiTac") + ": " + strThongBao,
                "Sinh viên: " + iSinhVien + "; chính sách: " + (arrItem.length - iSinhVien)
            ],
            unit: "bản ghi",
            items: arrItem,
            columns: [
                { header: "Phần", render: function (it) { return it.LOAI; } },
                { header: "Nội dung", render: function (it) { return it.NOIDUNG; } }
            ],
            run: function (it) {
                return edu.process.callApi(it.params).then(function (r) {
                    //Chính sách vừa thêm mới: nhớ Id để lần Lưu sau là Cập nhật, không thêm trùng
                    if (r.ok && it.bThemMoi && r.data && r.data.Id) {
                        $("#" + it.strTable_Id + " tbody tr[id='" + it.strRow_Id + "']").attr("data-saved-id", r.data.Id);
                    }
                    return r;
                });
            },
            okMessage: "Đã lưu",
            concurrency: 5,
            autoStart: true,
            fileName: "KetQuaLuuHopDong",
            onClose: function (sum) {
                me.getList_HopDong();
                //Không lỗi: nạp lại từ DB để màn hình khớp dữ liệu đã lưu. Có lỗi: giữ nguyên màn hình để sửa rồi Lưu lại
                if (sum.err == 0 && me.strHopDong_Id == strHopDong_Id) {
                    me.getList_SinhVien();
                    me.getList_ChinhSach();
                    me.getList_ChinhSachRieng();
                }
            }
        });
    },
    getItems_LuuHopDong: function (strHopDong_Id) {
        var me = this;
        var arr = [];
        //1. Sinh viên: mọi dòng có mã người học, đúng thứ tự trên màn hình
        $("#tblInput_DTSV_SinhVien tbody tr[data-nguoihoc-id]").each(function () {
            var $td = $(this).children("td");
            arr.push({
                LOAI: "Sinh viên",
                NOIDUNG: $td.eq(2).text() + " - " + $td.eq(3).text() + " - " + $td.eq(4).text(),
                params: me.req_SinhVien($(this).attr("data-nguoihoc-id"), strHopDong_Id)
            });
        });
        //2-3. Chính sách: bỏ dòng trống (chưa chọn Loại khoản + Kiểu học), như cách lưu cũ
        [
            { strTable_Id: "tblChinhSach", LOAI: "Chính sách áp dụng", bRieng: false },
            { strTable_Id: "tblChinhSachRieng", LOAI: "Chính sách riêng", bRieng: true }
        ].forEach(function (objBang) {
            $("#" + objBang.strTable_Id + " tbody tr").each(function () {
                var strRow_Id = this.id;
                var objReq = me.req_ChinhSach(strRow_Id, $(this).attr("data-saved-id"), strHopDong_Id, objBang.bRieng);
                if (!objReq) return;
                var strNoiDung = me.getText_Combo("dropKhoanThu" + strRow_Id) + " - " + me.getText_Combo("dropKieuHoc" + strRow_Id);
                if (objBang.bRieng) strNoiDung += " - " + me.getText_Combo("dropNguoiHoc" + strRow_Id);
                arr.push({
                    LOAI: objBang.LOAI,
                    NOIDUNG: strNoiDung,
                    params: objReq,
                    bThemMoi: objReq.data.strId == "",
                    strTable_Id: objBang.strTable_Id,
                    strRow_Id: strRow_Id
                });
            });
        });
        return arr;
    },
    getText_Combo: function (strId) {
        var $opt = $("#" + strId + " option:selected");
        return ($opt.length > 0 && $opt.val()) ? $opt.text() : "";
    },
    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
    -------------------------------------------*/
    genTable_HopDong: function (data, iPager) {
        var me = this;
        $("#lblHopDong_Tong").html(iPager);
        var jsonForm = {
            strTable_Id: "tblHopDong",

            bPaginate: {
                strFuntionName: "main_doc.HopDong.getList_HopDong()",
                iDataRow: iPager,
            },
            aaData: data,
            colPos: {
                center: [0,3, 5, 7, 8],
            },
            aoColumns: [
                {
                    "mDataProp": "DONVIKYHOPDONG_TEN",
                },
                {
                    "mDataProp": "SOHOPDONG"
                },
                {
                    "mDataProp": "NGAYKY"
                },
                {
                    "mDataProp": "MOTA"
                },
                {
                    "mData": "HIEULUC",

                    "mRender": function (nRow, aData) {
                        return aData.HIEULUC ? "Hiệu lực" : "Hết hiệu lực";
                    }
                },
                {
                    "mDataProp": "NGUYENTACPHANBO_TEN"
                },
                {
                    "mData": "SOLUONG",
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnDSDoiTuong" id="' + aData.ID + '" title="Chi tiết">Chi tiết</a></span>';
                    }
                },
                {
                    "mRender": function (nRow, aData) {
                        return '<span><a class="btn btn-default btnEdit" id="' + aData.ID + '" title="Sửa"><i class="fa fa-edit color-active"></i></a></span>';
                    }
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
    },
    viewEdit_HopDong: function (data) {
        var me = this;
        //View - Thong tin
        edu.util.viewValById("dropDoiTac", data.DONVIKYHOPDONG_ID);
        edu.util.viewValById("txtMoTa", data.MOTA);
        edu.util.viewValById("txtSoHopDong", data.SOHOPDONG);
        edu.util.viewValById("txtNgayKy", data.NGAYKY);
        edu.util.viewValById("dropHieuLuc", data.HIEULUC);
        edu.util.viewValById("dropNguyenTac", data.NGUYENTACPHANBO_ID);
        me.strHopDong_Id = data.ID;
        
        me.getList_SinhVien();
        me.getList_ChinhSach();
        me.getList_ChinhSachRieng();
    },
    /*------------------------------------------
   --Discription: [1] AcessDB ThanhVien
   --ULR:  Modules
   -------------------------------------------*/
    getList_SinhVien: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'TC_NguoiHoc_QuanLy/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strQLSV_NguoiHoc_DoiTac_Id': edu.util.getValById('dropAAAA'),
            'dHieuLuc': 1,
            'strTaiChinh_NguoiHoc_HD_Id': me.strHopDong_Id,
            'strNguoiTao_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': 1,
            'pageSize': 100000,
        };

        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        iPager = data.Pager;
                    }
                    me.genTable_SinhVien(dtResult);
                }
                else {
                    edu.system.alert(obj_list.action + ": " + data.Message, "w");
                }
                
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
                
            },
            type: "GET",
            action: obj_list.action,
            
            contentType: true,
            
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    //Tham số thêm 1 sinh viên vào hợp đồng (chạy trong form tiến trình — xem saveChiTiet_HopDong)
    req_SinhVien: function (strQLSV_NguoiHoc_Id, strQLSV_HopDong_Id) {
        var obj_save = {
            'action': 'TC_NguoiHoc_QuanLy/ThemMoi',
            'type': 'POST',
            'strQLSV_NguoiHoc_Id': strQLSV_NguoiHoc_Id,
            'strQLSV_NguoiHoc_DoiTac_Id': edu.util.getValById('dropDoiTac'),
            'strGhiChu': edu.util.getValById('txtAAAA'),
            'strPhanLoai_Id': edu.util.getValById('dropAAAA'),
            'strTaiChinh_NguoiHoc_HD_Id': strQLSV_HopDong_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        return {
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        };
    },
    //Tham số xóa 1 bản ghi sinh viên - hợp đồng (Id bản ghi TC_NguoiHoc_QuanLy)
    req_XoaSinhVien: function (strId) {
        return {
            type: 'POST',
            action: 'TC_NguoiHoc_QuanLy/Xoa',
            contentType: true,
            data: {
                'action': 'TC_NguoiHoc_QuanLy/Xoa',
                'strIds': strId,
                'strNguoiThucHien_Id': edu.system.userId
            }
        };
    },
    delete_SinhVien: function (strIds) {
        var me = this;
        //--Edit
        var obj_delete = {
            'action': 'TC_NguoiHoc_QuanLy/Xoa',
            
            'strIds': strIds,
            'strNguoiThucHien_Id': edu.system.userId
        };
        var obj = {};
        //default
        
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.alert("Xóa thành công!");
                    me.getList_SinhVien();
                }
                else {
                    obj = {
                        content: obj_delete.action + ": " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
                
            },
            error: function (er) {
                var obj = {
                    content: obj_delete.action + ": " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
                
            },
            type: 'POST',
            action: obj_delete.action,
            
            contentType: true,
            
            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [2] GenHTML NhanSu
    --ULR:  Modules
    -------------------------------------------*/
    genTable_SinhVien: function (data) {
        var me = this;
        //3. create html
        me.arrSinhVien_Id = [];
        me.arrSinhVien = [];
        $("#tblInput_DTSV_SinhVien tbody").html("");
        for (var i = 0; i < data.length; i++) {
            var html = "";
            html += "<tr id='rm_row" + data[i].QLSV_NGUOIHOC_ID + "' data-nguoihoc-id='" + data[i].QLSV_NGUOIHOC_ID + "'>";
            html += "<td class='td-center'>" + (i + 1) + "</td>";
            html += "<td class='td-center'><img class='table-img' src='" + edu.system.getRootPathImg(data[i].ANH) + "'></td>";
            html += "<td class='td-left'><span>" + edu.util.returnEmpty(data[i].QLSV_NGUOIHOC_MASO) + "</span></td>";
            html += "<td class='td-left'><span>" + edu.util.returnEmpty(data[i].QLSV_NGUOIHOC_HOTEN) + "</span></td>";
            html += "<td class='td-left'><span>" + edu.util.returnEmpty(data[i].DAOTAO_LOPQUANLY_TEN) + "</span></td>";
            html += "<td class='td-left'><span>" + edu.util.returnEmpty(data[i].DAOTAO_CHUONGTRINH_TEN) + "</span></td>";
            html += "<td class='td-left'><span>" + edu.util.returnEmpty(data[i].DAOTAO_KHOADAOTAO_TEN) + "</span></td>";
            html += "<td class='td-center'><a id='remove_nhansu" + data[i].ID + "' name='true' class='btnDeletePoiter poiter'><i class='fa fa-trash'></i></a></td>";
            html += "<td class='td-center'><input type='checkbox' class='chkSinhVien'></td>";
            html += "</tr>";
            //4. fill into tblNhanSu
            $("#tblInput_DTSV_SinhVien tbody").append(html);
            //5. create data danhmucvaitro
            me.arrSinhVien_Id.push(data[i].QLSV_NGUOIHOC_ID);
            me.arrSinhVien.push(data[i]);
        }
        me.update_SinhVienChon();
    },
    addHTMLinto_SinhVien: function (strNhanSu_Id) {
        var me = main_doc.HopDong;
        //strNhanSu_Id = ID dòng trong modal chọn SV (edu.extend.dtSinhVien), KHÁC mã người học.
        //Lấy mã người học ngay lúc chọn rồi gắn lên dòng (data-nguoihoc-id): lúc Lưu đọc từ dòng,
        //vì edu.extend.dtSinhVien bị ghi đè mỗi lần tìm/chuyển trang trong modal.
        var aData = edu.util.objGetOneDataInData(strNhanSu_Id, edu.extend.dtSinhVien, "ID");
        var strNguoiHoc_Id = edu.util.returnEmpty(aData.QLSV_NGUOIHOC_ID);
        var obj_notify;
        if (strNguoiHoc_Id == "") {
            obj_notify = {
                renderPlace: "slnhansu" + strNhanSu_Id,
                type: "w",
                title: "Không lấy được mã người học!"
            }
            edu.system.notifyLocal(obj_notify);
            return false;
        }
        //[1] add to arrSinhVien_Id — cùng khóa mã người học với dòng đã lưu (genTable_SinhVien)
        if (edu.util.arrEqualVal(me.arrSinhVien_Id, strNguoiHoc_Id)) {
            obj_notify = {
                renderPlace: "slnhansu" + strNhanSu_Id,
                type: "w",
                title: "Đã tồn tại!"
            }
            edu.system.notifyLocal(obj_notify);
            return false;
        }
        else {
            obj_notify = {
                renderPlace: "slnhansu" + strNhanSu_Id,
                type: "s",
                title: "Đã chọn!"
            }
            edu.system.notifyLocal(obj_notify);
            me.arrSinhVien_Id.push(strNguoiHoc_Id);
        }
        me.arrSinhVien.push(aData);
        //bỏ dòng "Không tìm thấy dữ liệu!" (nếu có) trước khi thêm
        $("#tblInput_DTSV_SinhVien tbody tr:not([id^='rm_row'])").remove();
        //3. create html
        var html = "";
        html += "<tr id='rm_row" + strNguoiHoc_Id + "' name='new' data-nguoihoc-id='" + strNguoiHoc_Id + "'>";
        html += "<td class='td-center'>" + me.arrSinhVien_Id.length + "</td>";
        html += "<td class='td-center'><img class='table-img' src='" + edu.system.getRootPathImg(aData.ANH) + "'></td>";
        html += "<td class='td-left'><span>" + edu.util.returnEmpty(aData.QLSV_NGUOIHOC_MASO) + "</span></td>";
        html += "<td class='td-left'><span>" + edu.util.returnEmpty(aData.QLSV_NGUOIHOC_HODEM) + " " + edu.util.returnEmpty(aData.QLSV_NGUOIHOC_TEN) + "</span></td>";
        html += "<td class='td-left'><span>" + edu.util.returnEmpty(aData.DAOTAO_LOPQUANLY_TEN) + "</span></td>";
        html += "<td class='td-left'><span>" + edu.util.returnEmpty(aData.DAOTAO_CHUONGTRINH_TEN) + "</span></td>";
        html += "<td class='td-left'><span>" + edu.util.returnEmpty(aData.DAOTAO_KHOADAOTAO_TEN) + "</span></td>";
        html += "<td class='td-center'><a id='remove_nhansu" + strNguoiHoc_Id + "' class='btnDeletePoiter poiter'><i class='fa fa-trash'></i></a></td>";
        html += "<td class='td-center'><input type='checkbox' class='chkSinhVien'></td>";
        html += "</tr>";
        //4. fill into tblNhanSu
        $("#tblInput_DTSV_SinhVien tbody").append(html);
        me.update_SinhVienChon();
    },
    removeHTMLoff_SinhVien: function (strNhanSu_Id) {
        var me = main_doc.HopDong;
        $("#rm_row" + strNhanSu_Id).remove();
        edu.util.arrExcludeVal(me.arrSinhVien_Id, strNhanSu_Id);
        if (me.arrSinhVien_Id.length === 0) {
            $("#tblInput_DTSV_SinhVien tbody").html("");
            $("#tblInput_DTSV_SinhVien tbody").html('<tr><td colspan="9">Không tìm thấy dữ liệu!</td></tr>');
        }
    },
    /*------------------------------------------
    --Discription: [2] Xóa nhiều sinh viên cùng lúc
    --Row đã lưu (name="true"): gọi API xóa từng id; row mới thêm (chưa lưu): chỉ gỡ khỏi form
    -------------------------------------------*/
    update_SinhVienChon: function () {
        var $chk = $("#tblInput_DTSV_SinhVien tbody .chkSinhVien");
        var iChon = $chk.filter(":checked").length;
        $("#lblSinhVien_DaChon").html(iChon > 0 ? "(" + iChon + ")" : "");
        $("#chkSelectAll_SinhVien").prop("checked", $chk.length > 0 && iChon == $chk.length);
    },
    getArr_SinhVienChon: function () {
        var arr = [];
        $("#tblInput_DTSV_SinhVien tbody .chkSinhVien:checked").each(function () {
            var $tr = $(this).closest("tr");
            var $btn = $tr.find(".btnDeletePoiter");
            var $td = $tr.children("td");
            arr.push({
                strRow_Id: $tr.attr("id").replace(/rm_row/g, ""), //khóa trong arrSinhVien_Id
                strLink_Id: edu.util.cutPrefixId(/remove_nhansu/g, $btn.attr("id")), //Id bản ghi TC_NguoiHoc_QuanLy
                bDaLuu: edu.util.checkValue($btn.attr("name")),
                MASO: $td.eq(2).text(),
                HOTEN: $td.eq(3).text(),
                LOP: $td.eq(4).text()
            });
        });
        return arr;
    },
    renumber_SinhVien: function () {
        $("#tblInput_DTSV_SinhVien tbody tr[id^='rm_row']").each(function (i) {
            $(this).children("td").first().html(i + 1);
        });
    },
    deleteMulti_SinhVien: function (arrRow) {
        var me = this;
        var iDaLuu = arrRow.filter(function (r) { return r.bDaLuu; }).length;
        var iChuaLuu = arrRow.length - iDaLuu;
        function xong() {
            me.renumber_SinhVien();
            me.update_SinhVienChon();
        }
        //Chỉ có dòng chưa lưu: gỡ khỏi màn hình, không gọi DB
        if (iDaLuu == 0) {
            edu.system.confirm("Gỡ " + iChuaLuu + " sinh viên chưa lưu khỏi danh sách?");
            $("#btnYes").off("click.delSVChon").on("click.delSVChon", function () {
                arrRow.forEach(function (r) { me.removeHTMLoff_SinhVien(r.strRow_Id); });
                xong();
            });
            return;
        }
        if (!edu.process) {
            edu.system.alert("Thiếu form tiến trình (Corei/processrun.js).", "w");
            return;
        }
        //Form tiến trình chung: Bước 1 thay hộp xác nhận, bấm RUN mới xóa
        edu.process.run({
            title: "Xóa sinh viên khỏi hợp đồng",
            subTitles: ["Hợp đồng số " + edu.util.getValById("txtSoHopDong") + " - " + me.getText_Combo("dropDoiTac")],
            unit: "sinh viên",
            items: arrRow,
            columns: [
                { header: "Mã số", render: function (it) { return it.MASO; } },
                { header: "Họ tên", render: function (it) { return it.HOTEN; } },
                { header: "Lớp", render: function (it) { return it.LOP; } }
            ],
            notes: [
                "Xóa " + iDaLuu + " sinh viên đã lưu khỏi hợp đồng (không khôi phục được).",
                iChuaLuu > 0 ? iChuaLuu + " sinh viên chưa lưu chỉ gỡ khỏi màn hình." : ""
            ],
            run: function (it) {
                if (!it.bDaLuu) {
                    me.removeHTMLoff_SinhVien(it.strRow_Id);
                    return { ok: true, message: "Gỡ khỏi màn hình (chưa lưu)" };
                }
                return edu.process.callApi(me.req_XoaSinhVien(it.strLink_Id)).then(function (r) {
                    if (r.ok) me.removeHTMLoff_SinhVien(it.strRow_Id);
                    return r;
                });
            },
            okMessage: "Đã xóa",
            concurrency: 5,
            fileName: "KetQuaXoaSinhVien_HopDong",
            onClose: xong
        });
    },

    /*----------------------------------------------
    --Author: 
    --Date of created: 
    --Discription: SinhVien Modal
    ----------------------------------------------*/
    /*------------------------------------------
    --Discription: [1] ACCESS DB ==>Systemroot
    --ULR: Modules
    -------------------------------------------*/
    getList_HeDaoTao: function () {
        var me = this;
        var objList = {
            strHinhThucDaoTao_Id: "",
            strBacDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_HeDaoTao(objList, "", "", me.cbGenCombo_HeDaoTao);
    },
    getList_KhoaDaoTao: function () {
        var me = this;
        var objList = {
            strHeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao"),
            strCoSoDaoTao_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_KhoaDaoTao(objList, "", "", me.cbGenCombo_KhoaDaoTao);
    },
    getList_ChuongTrinhDaoTao: function () {
        var me = this;
        var objList = {
            strKhoaDaoTao_Id: edu.util.getValCombo("dropSearch_KhoaDaoTao"),
            strN_CN_LOP_Id: "",
            strKhoaQuanLy_Id: "",
            strToChucCT_Cha_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_ChuongTrinhDaoTao(objList, "", "", me.cbGenCombo_ChuongTrinhDaoTao);
    },
    getList_LopQuanLy: function () {
        var me = this;
        var objList = {
            strCoSoDaoTao_Id: "",
            strDaoTao_HeDaoTao_Id: edu.util.getValCombo("dropSearch_HeDaoTao"),
            strKhoaDaoTao_Id: edu.util.getValCombo("dropSearch_KhoaDaoTao"),
            strNganh_Id: "",
            strLoaiLop_Id: "",
            strToChucCT_Id: edu.util.getValCombo("dropSearch_ChuongTrinh"),
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 1000000
        }
        edu.system.getList_LopQuanLy(objList, "", "", me.cbGenCombo_LopQuanLy);
    },
    getList_ThoiGianDaoTao: function () {
        var me = this;
        var objList = {
            strNam_Id: "",
            strNguoiThucHien_Id: "",
            strTuKhoa: "",
            pageIndex: 1,
            pageSize: 100000,
        };
        edu.system.getList_ThoiGianDaoTao(objList, "", "", me.cbGenCombo_ThoiGianDaoTao);
    },
    getList_NamNhapHoc: function () {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'KHCT_NamNhapHoc/LayDanhSach',

            'strNguoiThucHien_Id': '',
        }

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var json = data.Data;
                    me.cbGenCombo_NamNhapHoc(json);
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
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    getList_KhoaQuanLy: function () {
        var me = this;
        var objList = {
        };
        edu.system.getList_KhoaQuanLy({}, "", "", me.cbGenCombo_KhoaQuanLy);
    },
    /*------------------------------------------
    --Discription: [0] GEN HTML ==> Systemroot
    --ULR: Modules
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
            renderPlace: ["dropSearch_HeDaoTao"],
            type: "",
            title: "Tất cả hệ đào tạo",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_HeDaoTao").val("").trigger("change");
    },
    cbGenCombo_KhoaDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENKHOA",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_KhoaDaoTao"],
            type: "",
            title: "Tất cả khóa đào tạo",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_KhoaDaoTao").val("").trigger("change");
    },
    cbGenCombo_ChuongTrinhDaoTao: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENCHUONGTRINH",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ChuongTrinh"],
            type: "",
            title: "Tất cả chương trình đào tạo",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_ChuongTrinh").val("").trigger("change");
    },
    cbGenCombo_LopQuanLy: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_Lop"],
            type: "",
            title: "Tất cả lớp",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_Lop").val("").trigger("change");
    },
    cbGenCombo_ThoiGianDaoTao: function (data) {
        var me = main_doc.HopDong;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_ThoiGianDaoTao", "dropHopDong_ThoiGianDaoTao"],
            type: "",
            title: "Tất cả học kỳ",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_ThoiGianDaoTao").val("").trigger("change");
        me.cbGenCombo_ThoiGianDaoTao_input(data);
    },
    cbGenCombo_ThoiGianDaoTao_input: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "DAOTAO_THOIGIANDAOTAO",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropThoiGianDaoTao"],
            type: "",
            title: "Chọn học kỳ",
        }
        edu.system.loadToCombo_data(obj);
    },
    genList_TrangThaiSV: function (data) {
        var me = this;
        main_doc.HopDong.dtTrangThai = data;
        var row = '';
        row += '<div class="col-lg-3 checkbox-inline user-check-print">';
        row += '<input type="checkbox" class="ckbDSTrangThaiSV_ALL" style="float: left;"  checked="checked"/>';
        row += '<span><b>Tất cả</b></p></span>';
        row += '</div>';
        for (var i = 0; i < data.length; i++) {
            var strcheck = "";
            //if (dataKhoanThu[i].TEN.includes('ọc phí') || dataKhoanThu[i].TEN.includes('inh phí')) strcheck = 'checked="checked"'
            row += '<div class="col-lg-3 checkbox-inline user-check-print">';
            row += '<input checked="checked" type="checkbox" style="float: left;"  id="' + data[i].ID + '" class="ckbDSTrangThaiSV" title="' + data[i].TEN + '"' + strcheck + '/>';
            row += '<span><p>' + data[i].TEN + '</p></span>';
            row += '</div>';
        }
        $("#DSTrangThaiSV").html(row);
    },
    cbGenCombo_NamNhapHoc: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "NAMNHAPHOC",
                parentId: "",
                name: "NAMNHAPHOC",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_NamNhapHoc"],
            type: "",
            title: "Tất cả năm nhập học",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_NguoiThu").val("").trigger("change");
    },
    cbGenCombo_KhoaQuanLy: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_KhoaQuanLy"],
            type: "",
            title: "Tất cả khoa quản lý",
        }
        edu.system.loadToCombo_data(obj);
        if (data.length != 1) $("#dropSearch_NguoiThu").val("").trigger("change");
    },
    
    /*------------------------------------------
    --Discription: [2] GenHTML ThanhVien/NhanSu
    --ULR:  Modules
    -------------------------------------------*/

    getList_QuanSoTheoLop: function (strTC_NguoiHoc_HopDong_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TC_NguoiHoc_QuanLy/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strQLSV_NguoiHoc_DoiTac_Id': edu.util.getValById('dropAAAA'),
            'dHieuLuc': 1,
            'strTaiChinh_NguoiHoc_HD_Id': strTC_NguoiHoc_HopDong_Id,
            'strNguoiTao_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_QuanSoTheoLop(dtReRult, data.Pager, strTC_NguoiHoc_HopDong_Id);
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
    genTable_QuanSoTheoLop: function (data, iPager, strTC_NguoiHoc_HopDong_Id) {
        var me = this;
        var jsonForm = {
            strTable_Id: "tblQuanSoLop",

            bPaginate: {
                strFuntionName: "main_doc.HopDong.getList_QuanSoTheoLop('" + strTC_NguoiHoc_HopDong_Id +"')",
                iDataRow: iPager,
            },
            aaData: data,
            colPos: {
                center: [0, 1, 3, 4, 5, 6, 7, 8, 9],
            },
            aoColumns: [
                {
                    "mDataProp": "QLSV_NGUOIHOC_MASO"
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_HOTEN",
                    "mRender": function (nRow, aData) {
                        return aData.QLSV_NGUOIHOC_HODEM + " " + aData.QLSV_NGUOIHOC_TEN;
                    }
                },
                {
                    "mDataProp": "QLSV_NGUOIHOC_NGAYSINH"
                },
                {
                    "mDataProp": "QLSV_TRANGTHAINGUOIHOC_TEN"
                },
                {
                    "mDataProp": "DAOTAO_LOPQUANLY_TEN"
                },
                {
                    "mDataProp": "DAOTAO_CHUONGTRINH_TEN"
                },
                {
                    "mDataProp": "DAOTAO_KHOADAOTAO_TEN"
                },
                {
                    "mDataProp": "KHOAQUANLY_TEN"
                },
                {
                    "mDataProp": "DAOTAO_HEDAOTAO_TEN"
                }
            ]
        };
        edu.system.loadToTable_data(jsonForm);
        /*III. Callback*/
    },
    
    getList_DoiTuongKhac: function (strDanhSach_Id) {
        var me = this;
        //--Edit
        var obj_list = {
            'action': 'TC_DoiTuongKhac/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.cbGenCombo_DoiTuongKhac(dtReRult, data.Pager);
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
    cbGenCombo_DoiTuongKhac: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TENDOITUONG",
                code: "",
                avatar: ""
            },
            renderPlace: ["dropSearch_DoiTac", "dropDoiTac"],
            type: "",
            title: "Chọn đối tác",
        }
        edu.system.loadToCombo_data(obj);
    },
    
    getList_DMLKT: function () {
        var me = this;

        var obj_list = {
            'action': 'TC_KhoanThu/LayDanhSach',
            'strTuKhoa': '',
            'pageIndex': 1,
            'pageSize': 10000,
            'strNhomCacKhoanThu_Id': '',
            'strCanBoQuanLy_Id': '',
            'strNguoiThucHien_Id': '',
        }

        edu.system.beginLoading();
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.dtKhoanThu = data.Data;
                }
                else {
                    console.log(data.Message);
                }
                edu.system.endLoading();
            },
            error: function (er) { edu.system.endLoading(); },
            type: "GET",
            versionAPI: "v1.0",
            contentType: true,
            action: obj_list.action,
            data: obj_list,
            fakedb: [

            ]
        }, false, false, false, null);
    },


    getList_HSSV: function () {
        var me = this;
        var obj_list = {
            'action': 'SV_HoSo/LayDanhSach',
            'versionAPI': 'v1.0',

            'strTuKhoa': edu.util.getValById("txtSearchDSSV_TuKhoa"),
            'strHeDaoTao_Id': edu.util.getValById("dropSearch_HeDaoTao"),
            'strKhoaDaoTao_Id': edu.util.getValById("dropSearch_KhoaDaoTao"),
            'strChuongTrinh_Id': edu.util.getValById("dropSearch_ChuongTrinhDaoTao"),
            'strLopQuanLy_Id': edu.util.getValById("dropSearch_LopQuanLy"),
            'strNguoiThucHien_Id': "",
            'pageIndex': 1,
            'pageSize': 1000000
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
                    me.dtSinhVien = dtResult;
                }
                else {
                    edu.system.alert("Lỗi: " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert("Lỗi (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,
            contentType: true,
            data: obj_list,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    /*------------------------------------------
    --Discription: [2] AccessDB DeTai_KetQua
    --ULR:  Modules
    -------------------------------------------*/
    /*------------------------------------------
    --Tham số lưu 1 dòng chính sách (chạy trong form tiến trình — xem saveChiTiet_HopDong).
    -- bRieng = false: Chính sách áp dụng (TC_NguoiHoc_Khoan); true: Chính sách riêng theo học viên (TC_HopDong_NH_Khoan, thêm strQLSV_NguoiHoc_Id).
    -- Dòng chưa chọn Loại khoản + Kiểu học -> null (không lưu), như cách cũ.
    -- Id: Id đã lưu trong lần Lưu trước (data-saved-id) -> Id dòng nạp từ DB -> dòng mới (Id ngẫu nhiên 30 ký tự) = Thêm mới.
    -------------------------------------------*/
    req_ChinhSach: function (strRow_Id, strSaved_Id, strTaiChinh_NguoiHoc_HD_Id, bRieng) {
        var strKieuHoc_Id = edu.util.getValById('dropKieuHoc' + strRow_Id);
        var strTaiChinh_CacKhoanThu_Id = edu.util.getValById('dropKhoanThu' + strRow_Id);
        if (!edu.util.checkValue(strKieuHoc_Id) || !edu.util.checkValue(strTaiChinh_CacKhoanThu_Id)) {
            return null;
        }
        var strId = edu.util.checkValue(strSaved_Id) ? strSaved_Id : (strRow_Id.length == 30 ? "" : strRow_Id);
        var strModule = bRieng ? 'TC_HopDong_NH_Khoan' : 'TC_NguoiHoc_Khoan';
        var obj_save = {
            'action': strModule + (strId == "" ? '/ThemMoi' : '/CapNhat'),

            'strId': strId,
            'strTaiChinh_NguoiHoc_HD_Id': strTaiChinh_NguoiHoc_HD_Id,
            'strKieuHoc_Id': strKieuHoc_Id,
            'strTaiChinh_CacKhoanThu_Id': strTaiChinh_CacKhoanThu_Id,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        if (bRieng) obj_save.strQLSV_NguoiHoc_Id = edu.util.getValById('dropNguoiHoc' + strRow_Id);
        return {
            type: 'POST',
            action: obj_save.action,
            contentType: true,
            data: obj_save
        };
    },
    getList_ChinhSach: function () {
        var me = this;
        var obj_list = {
            'action': 'TC_NguoiHoc_Khoan/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strTaiChinh_CacKhoanThu_Id': edu.util.getValById('dropAAAA'),
            'strKieuHoc_Id': edu.util.getValById('dropAAAA'),
            'strTaiChinh_NguoiHoc_HD_Id': me.strHopDong_Id,
            'strNguoiTao_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': 1,
            'pageSize': 10000,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        me.genHTML_ChinhSach_Data(dtResult);
                    }
                }
                else {
                    edu.system.alert(obj_list.action + ": " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,

            contentType: true,

            data: obj_list,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    delete_ChinhSach: function (strIds) {
        var me = this;
        var obj = {};
        var obj_delete = {
            'action': 'TC_NguoiHoc_Khoan/Xoa',

            'strIds': strIds,
            'strNguoiThucHien_Id': edu.system.userId
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                    me.getList_ChinhSach();
                }
                else {
                    obj = {
                        content: "NCKH_DeTai_ThanhVien/Xoa: " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
            },
            error: function (er) {
                var obj = {
                    content: "NCKH_DeTai_ThanhVien/Xoa (er): " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: 'POST',
            action: obj_delete.action,

            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Kết quả Đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genHTML_ChinhSach_Data: function (data) {
        var me = this;
        $("#tblChinhSach tbody").html("");
        for (var i = 0; i < data.length; i++) {
            var aData = data[i];
            var strKetQua_Id = aData.ID;
            var row = '';
            row += '<tr id="' + strKetQua_Id + '">';
            row += '<td style="text-align: center"><label id="txtStt' + strKetQua_Id + '">' + (i + 1) + '</label></td>';
            row += '<td><select id="dropKhoanThu' + strKetQua_Id + '" class="select-opt"></select ></td>';
            row += '<td><select id="dropKieuHoc' + strKetQua_Id + '" class="select-opt"></select ></td>';
            row += '<td style="text-align: center"><a title="Xóa" class="deleteKetQua" id="' + strKetQua_Id + '" href="javascript:void(0)" style="color: red">Xóa</a></td>';
            row += '</tr>';
            $("#tblChinhSach tbody").append(row);
            me.genComBo_KhoanThu("dropKhoanThu" + strKetQua_Id, aData.TAICHINH_CACKHOANTHU_ID);
            me.genComBo_KieuHoc("dropKieuHoc" + strKetQua_Id, aData.KIEUHOC_ID);
        }
        for (var i = data.length; i < 2; i++) {
            var id = edu.util.randomString(30, "");
            me.genHTML_ChinhSach(id, "");
        }
    },
    genHTML_ChinhSach: function (strKetQua_Id) {
        var me = this;
        var iViTri = document.getElementById("tblChinhSach").getElementsByTagName('tbody')[0].rows.length + 1;
        var row = '';
        row += '<tr id="' + strKetQua_Id + '">';
        row += '<td style="text-align: center"><label id="txtStt' + strKetQua_Id + '">' + iViTri + '</label></td>';
        row += '<td><select id="dropKhoanThu' + strKetQua_Id + '" class="select-opt"></select ></td>';
        row += '<td><select id="dropKieuHoc' + strKetQua_Id + '" class="select-opt"></select ></td>';
        row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strKetQua_Id + '" href="javascript:void(0)">Xóa dòng</a></td>';
        row += '</tr>';
        $("#tblChinhSach tbody").append(row);
        me.genComBo_KhoanThu("dropKhoanThu" + strKetQua_Id, "");
        me.genComBo_KieuHoc("dropKieuHoc" + strKetQua_Id, "");
    },

    /*------------------------------------------
    --Discription: [2] AccessDB DeTai_KetQua
    --ULR:  Modules
    -------------------------------------------*/
    //save_ChinhSachRieng: gộp vào req_ChinhSach(..., bRieng = true)
    getList_ChinhSachRieng: function () {
        var me = this;
        var obj_list = {
            'action': 'TC_HopDong_NH_Khoan/LayDanhSach',
            'type': 'GET',
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strTaiChinh_CacKhoanThu_Id': edu.util.getValById('dropAAAA'),
            'strKieuHoc_Id': edu.util.getValById('dropAAAA'),
            'strTaiChinh_NguoiHoc_HD_Id': me.strHopDong_Id,
            'strNguoiTao_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': 1,
            'pageSize': 10000,
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtResult = [];
                    var iPager = 0;
                    if (edu.util.checkValue(data.Data)) {
                        dtResult = data.Data;
                        me.genHTML_ChinhSachRieng_Data(dtResult);
                    }
                }
                else {
                    edu.system.alert(obj_list.action + ": " + data.Message, "w");
                }
            },
            error: function (er) {
                edu.system.alert(obj_list.action + " (er): " + JSON.stringify(er), "w");
            },
            type: "GET",
            action: obj_list.action,

            contentType: true,

            data: obj_list,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    delete_ChinhSachRieng: function (strIds) {
        var me = this;
        var obj = {};
        var obj_delete = {
            'action': 'TC_HopDong_NH_Khoan/Xoa',

            'strIds': strIds,
            'strNguoiThucHien_Id': edu.system.userId
        };
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        content: "Xóa thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                    me.getList_ChinhSachRieng();
                }
                else {
                    obj = {
                        content: "NCKH_DeTai_ThanhVien/Xoa: " + data.Message,
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
            },
            error: function (er) {
                var obj = {
                    content: "NCKH_DeTai_ThanhVien/Xoa (er): " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: 'POST',
            action: obj_delete.action,

            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    /*------------------------------------------
    --Discription: [4] GenHTML Kết quả Đề tài
    --ULR:  Modules
    -------------------------------------------*/
    genHTML_ChinhSachRieng_Data: function (data) {
        var me = this;
        $("#tblChinhSachRieng tbody").html("");
        for (var i = 0; i < data.length; i++) {
            var aData = data[i];
            var strKetQua_Id = aData.ID;
            var row = '';
            row += '<tr id="' + strKetQua_Id + '">';
            row += '<td style="text-align: center"><label id="txtStt' + strKetQua_Id + '">' + (i + 1) + '</label></td>';
            row += '<td><select id="dropKhoanThu' + strKetQua_Id + '" class="select-opt"></select ></td>';
            row += '<td><select id="dropKieuHoc' + strKetQua_Id + '" class="select-opt"></select ></td>';
            row += '<td><select id="dropNguoiHoc' + strKetQua_Id + '" class="select-opt"></select ></td>';
            row += '<td style="text-align: center"><a title="Xóa" class="deleteKetQua" id="' + strKetQua_Id + '" href="javascript:void(0)" style="color: red">Xóa</a></td>';
            row += '</tr>';
            $("#tblChinhSachRieng tbody").append(row);
            me.genComBo_KhoanThu("dropKhoanThu" + strKetQua_Id, aData.TAICHINH_CACKHOANTHU_ID);
            me.genComBo_KieuHoc("dropKieuHoc" + strKetQua_Id, aData.KIEUHOC_ID);
            me.genComBo_NguoiHoc("dropNguoiHoc" + strKetQua_Id, aData.QLSV_NGUOIHOC_ID);
        }
        for (var i = data.length; i < 2; i++) {
            var id = edu.util.randomString(30, "");
            me.genHTML_ChinhSachRieng(id, "");
        }
    },
    genHTML_ChinhSachRieng: function (strKetQua_Id) {
        var me = this;
        var iViTri = document.getElementById("tblChinhSachRieng").getElementsByTagName('tbody')[0].rows.length + 1;
        var row = '';
        row += '<tr id="' + strKetQua_Id + '">';
        row += '<td style="text-align: center"><label id="txtStt' + strKetQua_Id + '">' + iViTri + '</label></td>';
        row += '<td><select id="dropKhoanThu' + strKetQua_Id + '" class="select-opt"></select ></td>';
        row += '<td><select id="dropKieuHoc' + strKetQua_Id + '" class="select-opt"></select ></td>';
        row += '<td><select id="dropNguoiHoc' + strKetQua_Id + '" class="select-opt"></select ></td>';
        row += '<td style="text-align: center"><a title="Xóa dòng" class="deleteRowButton" id="' + strKetQua_Id + '" href="javascript:void(0)">Xóa dòng</a></td>';
        row += '</tr>';
        $("#tblChinhSachRieng tbody").append(row);
        me.genComBo_KhoanThu("dropKhoanThu" + strKetQua_Id, "");
        me.genComBo_KieuHoc("dropKieuHoc" + strKetQua_Id, "");
        me.genComBo_NguoiHoc("dropNguoiHoc" + strKetQua_Id, "");
    },

    genComBo_KhoanThu: function (strId, default_val) {
        var me = this;
        var obj = {
            data: me.dtKhoanThu,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                default_val: default_val
            },
            renderPlace: [strId],
            type: "",
            title: "Chọn khoản thu"
        };
        edu.system.loadToCombo_data(obj);
        $("#" + strId).select2();
    },
    genComBo_KieuHoc: function (strId, default_val) {
        var me = this;
        var obj = {
            data: me.dtKieuHoc,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                default_val: default_val
            },
            renderPlace: [strId],
            type: "",
            title: "Chọn kiểu học"
        };
        edu.system.loadToCombo_data(obj);
        $("#" + strId).select2();
    },
    genComBo_NguoiHoc: function (strId, default_val) {
        var me = this;
        var obj = {
            data: me.dtSinhVien,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "TEN",
                code: "MA",
                default_val: default_val,

                mRender: function (nrow, aData) {
                    return edu.util.returnEmpty(aData.HODEM) + " " + edu.util.returnEmpty(aData.TEN) + " - "+ edu.util.returnEmpty(aData.MASO);
                },
            },
            renderPlace: [strId],
            type: "",
            title: "Chọn sinh viên"
        };
        edu.system.loadToCombo_data(obj);
        $("#" + strId).select2();
    },
}