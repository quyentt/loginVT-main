/*----------------------------------------------
--Author:
--Phone:
--Date of created:
--Input:
--Output:
--API URL:
--Note:
--Updated by: Quy trình phôi in (18/11/2026)
--  - chonMau(): 1 chỗ nạp mẫu (chọn ở ô / tạo mới / mở từ Quy trình phôi in với mẫu chọn sẵn)
--  - Lưu: chạy qua form tiến trình chung edu.process (thông tin chung + từng ô = 1 bản ghi), lưu xong nạp lại từ DB
--    -> hết lỗi Lưu lần 2 nhân đôi ô mới, hết N lần alert
--  - Nút Lưu luôn lấy mẫu ở ô chọn (trước đây mở "Thêm mẫu" rồi Đóng làm strMauPhoiIn_Id = "" -> Lưu tạo ra mẫu rác)
--  - Dòng "Trang" hiện lại khi đổi sang mẫu nhiều trang; iLienSelect về 0 mỗi lần nạp mẫu
--  - Nhật ký (PhoiInFlow — phoiinflow.js): Lưu ghi diff từng ô (cũ -> mới), Tạo mẫu, Xóa ô. API nhật ký BE chưa có:
--    ghi lỗi chỉ hiện dòng nhắc nhỏ dưới tiêu đề, không chặn việc lưu.
--Date of updated: 18/11/2026
----------------------------------------------*/
function MauPhoiIn() { }
MauPhoiIn.prototype = {
    strMauPhoiIn_Id: '',
    dtMauPhoiIn: [],
    iLienSelect: 0,
    dDoDai: 0,
    dDoRong: 0,
    _idDaNap: '',       // mẫu đang hiện trên khung phôi (chống nạp 2 lần khi onCache của combo đã tự chọn)
    _ctxMau: '',        // mẫu chọn sẵn khi mở từ trang Quy trình phôi in (dùng 1 lần)
    goc: null,          // ảnh chụp dữ liệu lúc nạp mẫu — để tính "cũ -> mới" khi Lưu

    init: function () {
        var me = this;
        var pointElement = null;
        // Mở từ trang Quy trình phôi in: banner "đang làm Bước n" + chọn sẵn mẫu
        if (window.PhoiInFlow) {
            var ctxQT = PhoiInFlow.veBannerNguCanh("zoneQuyTrinhPhoi");
            if (ctxQT && ctxQT.mauId) me._ctxMau = ctxQT.mauId;
        }
        $(".btnAdd").click(function () {
            me.popup();
            me.resetPopup();
        });
        $("#btnSave_MauPhoiIn").click(function () {
            me.save_MauPhoiIn();
        });
        me.getList_MauPhoiIn();
        $("#btnThemNoiDung").click(function () {
            if ($("#dropSearch_Phoi").val() == "") {
                edu.system.alert("Bạn cần chọn mẫu in");
                return;
            }
            var data = $("#txtNoiDungPhoi").val();
            if (data != "") {
                $("#zoneMotherPhoi .pr-containt:eq(" + me.iLienSelect + ")").append('<span class="phoi" style="margin-top: 100px; margin-left: 100px; " title="' + me.iLienSelect + '">' + data + '</span>');
                $("#txtNoiDungPhoi").val("");
            }
        });

        $(document).delegate(".phoi", "click", function (e) {
            e.preventDefault();
            pointElement = this;
            $(".phoi").each(function () {
                //this.style.border = "none";
                this.classList.remove("activeNoiDung");
            });
            $(".btnChuDam").each(function () {
                this.classList.remove("btn-primary");
                this.classList.add("btn-default");
            });
            $(".btnCanLe").each(function () {
                this.classList.remove("btn-primary");
                this.classList.add("btn-default");
            });
            this.classList.add("activeNoiDung");
            var stylePoint = $(this).attr("style");
            if (stylePoint.includes("font-weight: bold;")) {
                var classPoint = $(".btnChuDam[name='font-weight: bold;']")[0].classList;
                classPoint.add("btn-primary");
                classPoint.remove("btn-default");
            }
            if (stylePoint.includes("font-style: italic;")) {
                var classPoint = $(".btnChuDam[name='font-style: italic;']")[0].classList;
                classPoint.add("btn-primary");
                classPoint.remove("btn-default");
            }
            if (stylePoint.includes("text-decoration: underline;")) {
                var classPoint = $(".btnChuDam[name='text-decoration: underline;']")[0].classList;
                classPoint.add("btn-primary");
                classPoint.remove("btn-default");
            }

            if (stylePoint.includes("text-align: left;")) {
                var classPoint = $(".btnCanLe[name='text-align: left;']")[0].classList;
                classPoint.add("btn-primary");
                classPoint.remove("btn-default");
            }
            if (stylePoint.includes("text-align: center;")) {
                var classPoint = $(".btnCanLe[name='text-align: center;']")[0].classList;
                classPoint.add("btn-primary");
                classPoint.remove("btn-default");
            }
            if (stylePoint.includes("text-align: right;")) {
                var classPoint = $(".btnCanLe[name='text-align: right;']")[0].classList;
                classPoint.add("btn-primary");
                classPoint.remove("btn-default");
            }
            $("#txtPaddingLeft").val(this.style.marginLeft.replace("px", ""));
            $("#txtPaddingTop").val(this.style.marginTop.replace("px", ""));
            $("#txtFontSize").val(this.style.fontSize.replace("px", ""));
            $("#txtDoRong").val(this.style.width.replace("px", ""));
            $("#txtDinhDang").val($(this).attr("name"));
            $("#txtNoiDungPhoi").val(this.innerHTML);
        });
        $("#zoneMotherPhoi").click(function (e) {
            e.preventDefault();
            $(".phoi").each(function () {
                this.classList.remove("activeNoiDung");
            });
            $(".btnChuDam").each(function () {
                this.classList.remove("btn-primary");
                this.classList.add("btn-default");
            });
            pointElement = null;
            $("#txtPaddingLeft").val("");
            $("#txtPaddingTop").val("");
            $("#txtDinhDang").val("");
        });
        //Di chuyá»ƒn cÃ¡c pháº§n tá»­ trong phÃ´i
        $(document).keydown(function (e) {
            //e.preventDefault();
            if (pointElement == null || pointElement == undefined) return;
            switch (parseInt(e.which, 10)) {
                case 39: //Sang pháº£i
                    e.preventDefault();
                    var iChieuRong = parseInt(pointElement.style.marginLeft.replace("px", ""));
                    iChieuRong++;
                    //if (iChieuRong < 0) return;
                    pointElement.style.marginLeft = iChieuRong + "px";
                    $("#txtPaddingLeft").val(iChieuRong);
                    break;
                case 38: //LÃªn trÃªn
                    e.preventDefault();
                    var iChieuRong = parseInt(pointElement.style.marginTop.replace("px", ""));
                    iChieuRong--;
                    //if (iChieuRong < 0) return;
                    pointElement.style.marginTop = iChieuRong + "px";
                    $("#txtPaddingTop").val(iChieuRong);
                    break;
                case 37: //Sang trÃ¡i
                    e.preventDefault();
                    var iChieuRong = parseInt(pointElement.style.marginLeft.replace("px", ""));
                    iChieuRong--;
                    //if (iChieuRong < 0) return;
                    pointElement.style.marginLeft = iChieuRong + "px";
                    $("#txtPaddingLeft").val(iChieuRong);
                    break;
                case 40: //Xuá»‘ng dÆ°á»›i
                    e.preventDefault();
                    var iChieuRong = parseInt(pointElement.style.marginTop.replace("px", ""));
                    iChieuRong++;
                    //if (iChieuRong < 0) return;
                    pointElement.style.marginTop = iChieuRong + "px";
                    $("#txtPaddingTop").val(iChieuRong);
                    break;
            }
        });
        //Di chuyá»ƒn pháº§n tá»­ phÃ´i Ä‘ang chá»n
        $("#txtPaddingLeft").keyup(function (e) {
            e.preventDefault();
            if (pointElement == null || pointElement == undefined) return;
            pointElement.style.marginLeft = $("#txtPaddingLeft").val() + "px";
        });
        $("#txtPaddingTop").keyup(function (e) {
            e.preventDefault();
            if (pointElement == null || pointElement == undefined) return;
            pointElement.style.marginTop = $("#txtPaddingTop").val() + "px";
        });
        $("#txtFontSize").keyup(function (e) {
            e.preventDefault();
            if (pointElement == null || pointElement == undefined) return;
            var strFontSize = "";
            if ($("#txtFontSize").val() != "") strFontSize = $("#txtFontSize").val() + "px";
            pointElement.style.fontSize = strFontSize;
        });
        $("#txtDPI").keyup(function (e) {
            e.preventDefault();
            var strTyLe = $("#txtDPI").val() / 96;
            var dDoDai = me.dDoDai * strTyLe;
            var dDoRong = me.dDoRong * strTyLe;
            var point = $("#zoneMotherPhoi .pr-containt")[0];
            point.style.backgroundSize = dDoDai + "px";
            point.style.height = dDoRong + "px";

            var strPhanTram = $("#txtDPI").val() / 110;

            $("#txtChieuDaiKhoGiay").val((me.dDoDai * strPhanTram * 0.2645833333).toFixed(2));
            $("#txtChieuRongKhoGiay").val((me.dDoRong * strPhanTram * 0.2645833333).toFixed(2));
        });

        //$("#txtMarginTop").keyup(function (e) {
        //    e.preventDefault();
        //    var strMt = $("#txtMarginTop").val();
        //    $(".pr-containt").css({ paddingTop: strMt + "px" })
        //});
        //$("#txtMarginLeft").keyup(function (e) {
        //    e.preventDefault();
        //    var strMt = $("#txtMarginLeft").val();
        //    $(".pr-containt").css({ paddingLeft: strMt + "px" })
        //});
        $("#txtDoRong").keyup(function (e) {
            e.preventDefault();
            if (pointElement == null || pointElement == undefined) return;
            var strWidth = "";
            if ($("#txtDoRong").val() != "") strWidth = $("#txtDoRong").val() + "px";
            pointElement.style.width = strWidth;
        });
        $("#txtNoiDungPhoi").keyup(function (e) {
            e.preventDefault();
            if (pointElement) {
                pointElement.innerHTML = this.value;
            }
        });
        $("#btnSavePhoi").click(function (e) {
            e.preventDefault();
            //Cũ: me.save_MauPhoiIn() + save_NoiDung từng ô (N alert; ô mới không nhận Id nên Lưu lần 2 bị nhân đôi;
            //    strMauPhoiIn_Id có thể đã bị modal Thêm mẫu xóa -> tạo mẫu rác). Nay: luuPhoi() qua edu.process.
            //XÃ³a háº¿t viá»n Ä‘á» rá»“i áº¥n lÆ°u
            me.luuPhoi();
        });
        setTimeout(function () {
            edu.system.uploadAvatar(['txtAnhScan'], "");
        }, 200);
        $("#dropSearch_Phoi").on("select2:select", function () {
            me.chonMau($("#dropSearch_Phoi").val());
        });
        $("#btnDeleteNoiDung").click(function (e) {
            if (pointElement != null) {
                if (pointElement.id == "") {
                    console.log(pointElement.id);
                    $(pointElement).remove();
                } else {
                    edu.system.confirm('Bạn có chắc chắn muốn xóa không!', 'w');
                    $("#btnYes").click(function (e) {
                        var oXoa = me.docO(pointElement);
                        me.delete_NoiDung(pointElement.id, function () {
                            me.ghiNhatKyPhoi("XOA_O", "Xóa ô " + oXoa.nhan + " khỏi mẫu " + me.maPhoiHienTai(), {
                                mau: { id: me.strMauPhoiIn_Id, ma: me.maPhoiHienTai() },
                                xoa: { id: oXoa.ID, noiDung: oXoa.NOIDUNG, tren: oXoa.LETREN, trai: oXoa.LETRAI, trang: oXoa.TRANG }
                            });
                        });
                        $(pointElement).remove();
                    });
                }
            }
        });
        $("#btnInPhoi").click(function (e) {
            e.preventDefault();
            //console.log($("#zoneMotherPhoi").html());
            me.printHTML("zoneMotherPhoi");
        });
        document.getElementById("txtDinhDang").addEventListener("blur", function () {
            if (pointElement != null) {
                $(pointElement).attr("name", $("#txtDinhDang").val());
                pointElement.style = $(pointElement).attr("style") + $("#txtDinhDang").val();
            }
            $("#txtDinhDang").val("");
        });
        //me.getList_HSSV();
        //me.makeQRCode("#" + zoneMauIn + " #" + aPhoi_ChiTiet.ID, aData.HODEM, 80, 80);
        $("#zoneCauHinh").delegate('.btnChuDam', 'click', function (e) {
            e.preventDefault();
            if (pointElement != null) {
                var classPoint = this.classList;
                var name = $(this).attr("name");
                if (classPoint.contains("btn-primary")) {
                    classPoint.remove("btn-primary");
                    classPoint.add("btn-default");
                    $(pointElement).attr("style", $(pointElement).attr("style").replace(name, ""));
                    //$(pointElement).attr("chudam", $(pointElement).attr("style").replace(name, "").replace($("#txtDinhDang").val()));
                } else {
                    classPoint.add("btn-primary");
                    classPoint.remove("btn-default");
                    $(pointElement).attr("style", $(pointElement).attr("style") + name);
                    //$(pointElement).attr("chudam", $(pointElement).attr("style").replace($("#txtDinhDang").val()) + name);
                }
                var strStyleChuDam = "";
                $(".btnChuDam").each(function (e) {
                    var arrClass = this.classList;
                    if (arrClass.contains("btn-primary")) strStyleChuDam += $(this).attr("name");
                })
                $(pointElement).attr("chudam", strStyleChuDam);
            }
            
        });
        $("#zoneCauHinh").delegate('.btnCanLe', 'click', function (e) {
            e.preventDefault();
            var strName = this.name;
            var strName2 = strName;
            if (strName == "text-align: center;") strName2 += ";border: solid 2px gray;"
            if (pointElement != null) {
                $(".btnCanLe").each(function () {
                    this.classList.remove("btn-primary");
                    this.classList.add("btn-default");
                });
                var classPoint = this.classList;
                var strStyle = $(pointElement).attr("style").replace(/text-align: left;|text-align: center;|text-align: right;/g, '');
                if (classPoint.contains("btn-primary")) {
                    classPoint.remove("btn-primary");
                    classPoint.add("btn-default");
                } else {
                    classPoint.add("btn-primary");
                    classPoint.remove("btn-default");
                }
                $(pointElement).attr("style", strStyle + strName2);
                $(pointElement).attr("canle", strName);
            }

        });
    },

    popup: function () {
        //show
        $('#myModal').modal('show');
        $("#btnNotifyModal").remove();
    },
    resetPopup: function () {
        var me = this;
        //me.strMauPhoiIn_Id = ""; — bỏ: mở modal rồi Đóng làm mất mẫu đang chọn, bấm Lưu thành tạo mẫu rác (mã rỗng).
        //  Modal Thêm mẫu giờ luôn gửi strId rỗng (save_MauPhoiIn), không phụ thuộc biến này.
        edu.util.viewValById("txtMaMauIn", "");
        edu.util.viewValById("txtSoTrang", "1");
        edu.util.viewValById("txtAnhScan", "");
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_MauPhoiIn: function () {
        var me = this;
        var obj_notify = {};
        if (edu.util.getValById('txtSoTrang') == "") {
            obj_notify = {
                type: "w",
                content: "Số trang không được bỏ trống"
            };
            edu.system.alertOnModal(obj_notify);
            return;
        }
        //--Edit
        var obj_save = {
            'action': 'CMS_BaoCao_ThongTin_MH/FSkkLB4MIDQRKS4oCC8P',
            'func': 'pkg_baocao_thongtin.Them_MauPhoiIn',
            'iM': edu.system.iM,
            'strId': '', // hàm này giờ chỉ dùng cho modal "Thêm mẫu" (cập nhật mẫu đi qua req_SuaMauPhoiIn trong luuPhoi)
            'strMaPhoi': edu.util.getValById('txtMaMauIn'),
            'strTenPhoi': edu.util.getValById('txtTenBang'),
            'strKhogiay': edu.util.getValById('txtKhoangCach'),
            'strDoDai': edu.util.getValById('txtCoChu'),
            'strDoRong': edu.util.getValById('txtDPI'),
            'strFont': edu.util.getValById('dropFontChu'),
            'strSoTrang': edu.util.getValById('txtSoTrang'),
            'strDuongDanFile': me.getImage('txtAnhScan', edu.system.userId),
            'strMargin_Top': edu.util.getValById('txtMarginTop'),
            'strMargin_Left': edu.util.getValById('txtMarginLeft'),
        };
        if (edu.util.checkValue(obj_save.strId)) {
            var aData = me.dtMauPhoiIn.find(e => e.ID === obj_save.strId);
            obj_save.strMaPhoi = aData.MAPHOI;
            obj_save.strSoTrang = aData.SOTRANG;
            obj_save.strDuongDanFile = aData.DUONGDANFILE;
            obj_save.action = 'CMS_BaoCao_ThongTin_MH/EjQgHgwgNBEpLigILwPP';
            obj_save.func = 'CMS_BaoCao_ThongTin_MH/Sua_MauPhoiIn';
        }
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (!edu.util.checkValue(obj_save.strId)) {
                        me.strMauPhoiIn_Id = data.Id;
                        me._idDaNap = '';
                        // Nhật ký + (nếu đang làm Bước "Tạo mẫu" của quy trình) gắn mẫu mới vào ngữ cảnh để "Về quy trình" chọn sẵn
                        me.ghiNhatKyPhoi("TAO_MAU", "Tạo mẫu phôi " + obj_save.strMaPhoi + " (" + obj_save.strSoTrang + " trang)", {
                            mau: { id: data.Id, ma: obj_save.strMaPhoi },
                            soTrang: obj_save.strSoTrang, anhNen: obj_save.strDuongDanFile, font: obj_save.strFont, coChu: obj_save.strDoDai
                        }, { id: data.Id, ma: obj_save.strMaPhoi });
                        // Đóng modal rồi mới nạp mẫu + báo (alert chồng lên modal BS3 đang mở dễ làm mất modal-open)
                        $('#myModal').one('hidden.bs.modal', function () {
                            edu.system.alert("Thêm mới thành công! Đã mở mẫu " + obj_save.strMaPhoi + ".");
                        });
                        $('#myModal').modal('hide');
                    }
                    else {
                        edu.system.alert("Cập nhật thành công!");
                    }

                    localStorage.setItem(edu.system.strChucNang_Id + "dropSearch_Phoi", data.Id);
                    me.getList_MauPhoiIn();
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message
                    };
                    edu.system.alertOnModal(obj_notify);
                }
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_MauPhoiIn: function () {
        var me = this;
        //--Edit
        //me.strMauPhoiIn_Id = "";
        var obj_list = {
            'action': 'CMS_MauPhoiIn/LayDanhSach',
            'strId': edu.util.getValById('txtAAAA')
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtMauPhoiIn = dtReRult;
                    me.genCombo_MauPhoiIn(dtReRult, data.Pager);
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
    delete_MauPhoiIn: function (Ids) {
        var me = this;
        //--Edit
        var obj_delete = {
            'action': 'CMS_MauPhoiIn/Xoa',

            'strId': Ids,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    obj = {
                        title: "",
                        content: "Xóa dữ liệu thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
                else {
                    obj = {
                        title: "",
                        content: obj_delete + ": " + data.Message,
                        code: "w"
                    };
                    edu.system.afterComfirm(obj);
                }

            },
            error: function (er) {

                obj = {
                    title: "",
                    content: obj_delete + ": " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_delete.action,

            complete: function () {
                edu.system.start_Progress("zoneprocessMauPhoiIn", function () {
                    me.getList_MauPhoiIn();
                });
            },
            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    genCombo_MauPhoiIn: function (data) {
        var me = this;
        var obj = {
            data: data,
            renderInfor: {
                id: "ID",
                parentId: "",
                name: "MAPHOI",
                //selectOne: true
            },
            renderPlace: ["dropSearch_Phoi"],
            title: "Chọn mẫu phôi" 
        };
        edu.system.loadToCombo_data(obj);
        // Mẫu cần mở: vừa tạo / đang làm việc, hoặc mẫu chọn sẵn từ trang Quy trình phôi in (1 lần).
        // Cũ chỉ trigger("change") nên khung phôi không nạp (nạp gắn với select2:select) — nay gọi thẳng chonMau.
        var strMo = me.strMauPhoiIn_Id || me._ctxMau;
        if (me._ctxMau) me._ctxMau = '';
        if (strMo && (data || []).some(function (e) { return e.ID === strMo; })) {
            $("#dropSearch_Phoi").val(strMo).trigger("change");
            if (me._idDaNap !== strMo) me.chonMau(strMo);
        }
    },
    /*------------------------------------------
    --Discription: Nạp 1 mẫu lên khung thiết kế (dùng chung cho: chọn ở ô, tạo mới, mở từ Quy trình, nạp lại sau khi Lưu)
    -------------------------------------------*/
    chonMau: function (strId) {
        var me = this;
        if (!strId) {
            me.strMauPhoiIn_Id = "";
            return;
        }
        var aData = edu.util.objGetDataInData(strId, me.dtMauPhoiIn, "ID");
        if (!aData || !aData.length) return;
        me.strMauPhoiIn_Id = strId;
        me._idDaNap = strId;
        me.iLienSelect = 0;
        edu.util.viewValById("dropHoatDong", aData[0].HOATDONG_ID);
        edu.util.viewValById("txtTenBang", aData[0].TENPHOI);
        edu.util.viewValById("txtKhoangCach", aData[0].KHOGIAY);
        edu.util.viewValById("dropFontChu", aData[0].FONT);
        edu.util.viewValById("txtAnhScan", aData[0].DUONGDANFILE);
        edu.util.viewValById("txtCoChu", aData[0].DODAI ? aData[0].DODAI : 20);
        edu.util.viewValById("txtDPI", aData[0].DORONG ? aData[0].DORONG : 96);
        edu.util.viewValById("txtMarginTop", aData[0].MARGIN_TOP);
        edu.util.viewValById("txtMarginLeft", aData[0].MARGIN_LEFT);
        // Ảnh chụp thông tin chung lúc nạp -> tính "cũ -> mới" khi Lưu (đọc qua ô nhập để cùng cách so với lúc Lưu)
        me.goc = { mau: me.docThongTinChung(), o: {}, thuTu: {} };
        me.genChonTrang(aData[0].SOTRANG, aData[0].DUONGDANFILE);
        me.getList_NoiDung();
    },
    genChonTrang: function (iSoTrang, strAnhNen) {
        var me = this;

        var zoneTool = "zoneTrang";
        var zoneMauIn = "zoneMotherPhoi";
        var strhead = '<style>.phoi{font-family:"' + $("#dropFontChu").val() + '";position:absolute;cursor: pointer; font-size: ' + $("#txtCoChu").val() + 'px}</style>';
        $("#" + zoneMauIn).html(strhead);
        //
        var arrTemp = [];
        if (strAnhNen != null && strAnhNen.indexOf("_") != -1) {
            arrTemp = strAnhNen.split("_");
            me.dDoDai = arrTemp[1];
            me.dDoRong = arrTemp[2];
            var strTyLe = $("#txtDPI").val() / 96;
            var dDoDai = arrTemp[1] * strTyLe;
            var dDoRong = arrTemp[2] * strTyLe;
            $("#txtChieuDaiKhoGiay").val((arrTemp[1] * 0.2645833333).toFixed(2));
            $("#txtChieuRongKhoGiay").val((arrTemp[2] * 0.2645833333).toFixed(2));

            for (var i = 0; i < iSoTrang; i++) {
                $("#" + zoneMauIn).append('<div style="background: url(' + edu.system.getRootPathImg(strAnhNen) + ');background-repeat: no-repeat; background-size: ' + dDoDai + 'px;height: ' + dDoRong +'px;" ><div class="pr-containt"></div></div>');
            }
        } else {

            for (var i = 0; i < iSoTrang; i++) {
                $("#" + zoneMauIn).append('<div><div class="pr-containt"></div></div>');
            }
        }

        var Lien = $("#" + zoneMauIn + " .pr-containt");
        me.iLienSelect = 0;
        if (Lien.length > 1) {
            // Mẫu 1 trang làm ẩn cả dòng "Trang" (nhánh else) -> mẫu nhiều trang phải hiện lại, kẻo không chọn được trang để thêm ô
            $("#" + zoneTool).parent().show();
            var row = '<div id="zoneSelectedLien" class="compact-theme simple-pagination" style="float:left; width: 100%">';
            row += '<ul>';
            for (var i = 0; i < Lien.length; i++) {
                row += '<li>';
                row += '<a class="activeLien" name="' + i + '" style="cursor: pointer">' + (i + 1) + '</a>';
                row += '</li>';
            }
            row += '<li>';
            row += '<a class="activeLien" name="selectall" style="cursor: pointer">Tất cả</a>';
            row += '</li>';
            row += '</ul>';
            row += '</div>';
            $("#" + zoneTool).html(row);
            $("#zoneSelectedLien").delegate("li a", "click", function (e) {
                var point = this;
                var iVitri = $(point).attr("name");
                if (iVitri != "selectall") {
                    me.iLienSelect = iVitri;
                    for (var i = 0; i < Lien.length; i++) {
                        if (i == iVitri) {
                            Lien[i].style.display = "";
                            continue;
                        }
                        Lien[i].style.display = "none";
                    }
                    $("#" + zoneMauIn + " p[style='page-break-before: always;']").hide();
                }
                else {
                    me.iLienSelect = 0;
                    for (var i = 0; i < Lien.length; i++) {
                        Lien[i].style.display = "";
                    }
                    $("#" + zoneMauIn + " p[style='page-break-before: always;']").show();
                }
            });
        }
        else {
            //Cẩn thận nhé
            $("#" + zoneTool).parent().hide();
        }
    },
    /*------------------------------------------
    --Discription: [3] AccessDB HOC
    --ULR:  Modules
    -------------------------------------------*/
    save_NoiDung: function (point) {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'CMS_MauPhoiIn_ChiTiet/ThemMoi',

            'strId': point.id,
            'strNoiDung': point.innerHTML,
            'strLetrai': point.style.marginLeft.replace("px", ""),
            'strLephai': $(point).attr("chudam"),
            'strLeTren': point.style.marginTop.replace("px", ""),
            'strDinhDang': $(point).attr("name"),
            'strFontSize': point.style.fontSize.replace("px", ""),
            'strTrang': point.title,
            'strPhoi_MauPhoiIn_Id': edu.util.getValById('dropSearch_Phoi'),
            'strCanLe_Trai_Phai_Giua': $(point).attr("canle"),
            'strDoRongPhanTuCanLe': point.style.width.replace("px", ""),
        };
        if (edu.util.checkValue(obj_save.strId)) {
            obj_save.action = 'CMS_MauPhoiIn_ChiTiet/CapNhat';
        }
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (!edu.util.checkValue(obj_save.strId)) {
                        edu.system.alert("Thêm mới thành công!");
                    }
                    else {
                        edu.system.alert("Cập nhật thành công!");
                    }
                }
                else {
                    edu.system.alert(data.Message);
                }
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    getList_NoiDung: function () {
        var me = this;
        //--Edit
        //me.strMauPhoiIn_Id = "";
        var obj_list = {
            'action': 'CMS_MauPhoiIn_ChiTiet/LayDanhSach',
            'strId': edu.util.getValById('dropSearch_Phoi'),
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genHtml_NoiDung(dtReRult, data.Pager);
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
    delete_NoiDung: function (Ids, fnXongXoa) {
        var me = this;
        //--Edit
        var obj_delete = {
            'action': 'CMS_MauPhoiIn_ChiTiet/Xoa',

            'strId': Ids,
            'strChucNang_Id': edu.system.strChucNang_Id,
            'strNguoiThucHien_Id': edu.system.userId
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    if (typeof fnXongXoa === "function") fnXongXoa();
                    if (me.goc && me.goc.o) delete me.goc.o[Ids];
                    obj = {
                        title: "",
                        content: "Xóa dữ liệu thành công!",
                        code: ""
                    };
                    edu.system.afterComfirm(obj);
                }
                else {
                    obj = {
                        title: "",
                        content: obj_delete + ": " + data.Message,
                        code: "w"
                    };
                    edu.system.afterComfirm(obj);
                }

            },
            error: function (er) {

                obj = {
                    title: "",
                    content: obj_delete + ": " + JSON.stringify(er),
                    code: "w"
                };
                edu.system.afterComfirm(obj);
            },
            type: "POST",
            action: obj_delete.action,

            complete: function () {
                edu.system.start_Progress("zoneprocessMauPhoiIn", function () {
                    me.getList_MauPhoiIn();
                });
            },
            contentType: true,

            data: obj_delete,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    genHtml_NoiDung: function (data) {
        for (var i = 0; i < data.length; i++) {
            var strFontSize = "";
            var strClass = "";
            if (data[i].FONTSIZE) strFontSize = ' font-size: ' + data[i].FONTSIZE + 'px;'
            if (data[i].DORONGPHANTUCANLE) strFontSize += 'width: ' + data[i].DORONGPHANTUCANLE + 'px;';
            if (data[i].CANLE_TRAI_PHAI_GIUA == "text-align: center;") strFontSize += "border: solid 2px gray;";
            var html = '<span id="' + data[i].ID + '" class="phoi ' + strClass +'" style="margin-top: ' + data[i].LETREN + 'px; margin-left: ' + data[i].LETRAI + 'px; ' + strFontSize + ' ' + edu.util.returnEmpty(data[i].DINHDANG) + '; ' + edu.util.returnEmpty(data[i].LEPHAI) + edu.util.returnEmpty(data[i].CANLE_TRAI_PHAI_GIUA) + '" title="' + data[i].TRANG + '" name="' + edu.util.returnEmpty(data[i].DINHDANG) + '" chudam="' + edu.util.returnEmpty(data[i].LEPHAI) + '" canle="' + edu.util.returnEmpty(data[i].CANLE_TRAI_PHAI_GIUA) +'">' + data[i].NOIDUNG + '</span>';
            $("#zoneMotherPhoi .pr-containt:eq(" + edu.util.returnZero(data[i].TRANG) + ")").append(html);
        }
        // Ảnh chụp từng ô lúc nạp (đọc lại từ chính DOM, cùng cách đọc lúc Lưu) — dùng cho nhật ký "cũ -> mới"
        var me = this;
        if (!me.goc) me.goc = { mau: me.docThongTinChung(), o: {}, thuTu: {} };
        me.goc.o = {};
        me.goc.thuTu = {};
        for (var j = 0; j < data.length; j++) {
            var el = document.getElementById(data[j].ID);
            if (!el) continue;
            me.goc.thuTu[data[j].ID] = j + 1;   // khớp ký hiệu (1)(2)... ở Chế độ test màn Thực hiện in
            me.goc.o[data[j].ID] = me.docO(el);
        }
    },
    /*------------------------------------------
    --Discription: Lưu mẫu = 1 form tiến trình (edu.process): dòng 1 thông tin chung, mỗi ô 1 dòng.
    --  Xong không lỗi -> nạp lại mẫu từ DB (ô mới nhận Id thật, không còn nhân đôi khi Lưu lần 2).
    --  Nhật ký LUU_MAU ghi diff từng ô (cũ -> mới).
    -------------------------------------------*/
    luuPhoi: function () {
        var me = this;
        var strId = $("#dropSearch_Phoi").val();
        if (!strId) {
            edu.system.alert("Bạn cần chọn mẫu in");
            return;
        }
        me.strMauPhoiIn_Id = strId;
        $(".phoi").each(function () { this.classList.remove("activeNoiDung"); });
        var strMa = me.maPhoiHienTai();
        var diff = me.tinhThayDoi();
        var items = [{ ID: "__CHUNG__", TEN: "Thông tin chung: font, cỡ chữ, DPI, lề bù Top/Left", req: function () { return me.req_SuaMauPhoiIn(strId); } }];
        $("#zoneMotherPhoi .phoi").each(function (i) {
            var el = this, o = me.docO(el);
            items.push({
                ID: el.id || ("moi" + i),
                el: el,
                TEN: (el.id ? "Ô " + o.nhan : "Ô mới") + ": " + (o.NOIDUNG.length > 70 ? o.NOIDUNG.substring(0, 70) + "…" : o.NOIDUNG),
                req: function () { return me.req_NoiDung(el); }
            });
        });
        var loiChiTiet = [];
        var chay = function (it) {
            var call = (edu.process && edu.process.callApi) ? edu.process.callApi : (window.PhoiInFlow ? PhoiInFlow.callApi : null);
            return call(it.req()).then(function (r) {
                var idMoi = r.data ? (r.data.Id || r.data.ID) : "";
                if (r.ok && it.el && !it.el.id && idMoi) it.el.id = idMoi;
                if (!r.ok) loiChiTiet.push(it.TEN + ": " + r.message);
                return r;
            });
        };
        var ketThuc = function (sum) {
            diff.ketQua = { tong: sum.total, ok: sum.ok, loi: sum.err, loiChiTiet: loiChiTiet.slice(0, 50) };
            var soDoi = diff.thayDoi.length, soThem = diff.them.length;
            var noiDung = "Lưu mẫu " + strMa + ": "
                + (soDoi || soThem ? (soDoi ? soDoi + " thay đổi" : "") + (soDoi && soThem ? ", " : "") + (soThem ? soThem + " ô thêm mới" : "") : "không có thay đổi")
                + " — " + sum.ok + "/" + sum.total + " mục lưu thành công" + (sum.err ? ", " + sum.err + " lỗi" : "");
            me.ghiNhatKyPhoi("LUU_MAU", noiDung, diff);
        };
        var napLai = function (sum) {
            if (sum.err === 0) {
                me._idDaNap = '';
                me.getList_MauPhoiIn();   // nạp lại danh sách (thông tin chung mới) -> genCombo -> chonMau
            }
        };
        if (!(window.PhoiInFlow || (edu.process && edu.process.callApi))) {
            // không có cả 2 file chung: chạy kiểu cũ (từng ô) để không mất chức năng Lưu
            me.save_NoiDungKieuCu(items);
            return;
        }
        if (edu.process && typeof edu.process.run === "function") {
            edu.process.run({
                title: "Lưu mẫu phôi " + strMa,
                unit: "mục",
                infoHeader: "Nội dung lưu",
                items: items,
                info: function (it) { return it.TEN; },
                run: function (it) { return chay(it); },
                concurrency: 3,
                autoStart: true,
                fileName: "KetQuaLuuMauPhoi_" + strMa,
                okMessage: function (it) { return it.ID === "__CHUNG__" ? "Đã cập nhật" : (it.el && it.el.id && it.ID.indexOf("moi") === 0 ? "Đã thêm" : "Đã cập nhật"); },
                onFinish: ketThuc,
                onClose: napLai
            });
            return;
        }
        // Vỏ chưa có edu.process (index.aspx): chạy tuần tự, báo 1 lần
        var sum = { total: items.length, ok: 0, err: 0 };
        items.reduce(function (p, it) {
            return p.then(function () { return chay(it).then(function (r) { if (r.ok) sum.ok++; else sum.err++; }); });
        }, Promise.resolve()).then(function () {
            ketThuc(sum);
            edu.system.alert("Lưu mẫu " + strMa + ": " + sum.ok + "/" + sum.total + " mục thành công" + (sum.err ? ". Lỗi:\n" + loiChiTiet.join("\n") : "."), sum.err ? "w" : "s");
            napLai(sum);
        });
    },
    // Phương án cuối khi thiếu cả phoiinflow.js lẫn edu.process: giữ đúng hành vi cũ
    save_NoiDungKieuCu: function (items) {
        var me = this;
        items.forEach(function (it) {
            if (it.ID === "__CHUNG__") return;
            me.save_NoiDung(it.el);
        });
    },
    // Tham số cập nhật thông tin chung — giữ nguyên action/func/field của nhánh "Sửa" cũ trong save_MauPhoiIn
    req_SuaMauPhoiIn: function (strId) {
        var me = this;
        var aData = me.dtMauPhoiIn.find(function (e) { return e.ID === strId; }) || {};
        var obj_save = {
            'action': 'CMS_BaoCao_ThongTin_MH/EjQgHgwgNBEpLigILwPP',
            'func': 'CMS_BaoCao_ThongTin_MH/Sua_MauPhoiIn',
            'iM': edu.system.iM,
            'strId': strId,
            'strMaPhoi': aData.MAPHOI,
            'strTenPhoi': edu.util.getValById('txtTenBang'),
            'strKhogiay': edu.util.getValById('txtKhoangCach'),
            'strDoDai': edu.util.getValById('txtCoChu'),
            'strDoRong': edu.util.getValById('txtDPI'),
            'strFont': edu.util.getValById('dropFontChu'),
            'strSoTrang': aData.SOTRANG,
            'strDuongDanFile': aData.DUONGDANFILE,
            'strMargin_Top': edu.util.getValById('txtMarginTop'),
            'strMargin_Left': edu.util.getValById('txtMarginLeft'),
        };
        return { type: "POST", action: obj_save.action, contentType: true, data: obj_save };
    },
    // Tham số lưu 1 ô — giữ nguyên action/field của save_NoiDung
    req_NoiDung: function (point) {
        var obj_save = {
            'action': 'CMS_MauPhoiIn_ChiTiet/ThemMoi',
            'strId': point.id,
            'strNoiDung': point.innerHTML,
            'strLetrai': point.style.marginLeft.replace("px", ""),
            'strLephai': $(point).attr("chudam"),
            'strLeTren': point.style.marginTop.replace("px", ""),
            'strDinhDang': $(point).attr("name"),
            'strFontSize': point.style.fontSize.replace("px", ""),
            'strTrang': point.title,
            'strPhoi_MauPhoiIn_Id': edu.util.getValById('dropSearch_Phoi'),
            'strCanLe_Trai_Phai_Giua': $(point).attr("canle"),
            'strDoRongPhanTuCanLe': point.style.width.replace("px", ""),
        };
        if (edu.util.checkValue(obj_save.strId)) obj_save.action = 'CMS_MauPhoiIn_ChiTiet/CapNhat';
        return { type: "POST", action: obj_save.action, contentType: true, data: obj_save };
    },
    /*------------------------------------------
    --Discription: Nhật ký (diff khi Lưu, Tạo mẫu, Xóa ô) — qua PhoiInFlow (phoiinflow.js). API BE chưa có: chỉ báo nhẹ, không chặn.
    -------------------------------------------*/
    maPhoiHienTai: function () {
        var me = this;
        var a = (me.dtMauPhoiIn || []).find(function (e) { return e.ID === me.strMauPhoiIn_Id; });
        return a ? edu.util.returnEmpty(a.MAPHOI) : "";
    },
    docThongTinChung: function () {
        var v = function (id) { return $.trim(edu.util.returnEmpty(edu.util.getValById(id))); };
        return { FONT: v("dropFontChu"), DODAI: v("txtCoChu"), DORONG: v("txtDPI"), KHOGIAY: v("txtKhoangCach"), MARGIN_TOP: v("txtMarginTop"), MARGIN_LEFT: v("txtMarginLeft") };
    },
    docO: function (el) {
        var me = this, t = function (v) { return $.trim(edu.util.returnEmpty(v)); };
        var o = {
            ID: el.id,
            NOIDUNG: t(el.innerHTML),
            LETRAI: t(el.style.marginLeft.replace("px", "")),
            LETREN: t(el.style.marginTop.replace("px", "")),
            FONTSIZE: t(el.style.fontSize.replace("px", "")),
            LEPHAI: t($(el).attr("chudam")),
            DINHDANG: t($(el).attr("name")),
            CANLE_TRAI_PHAI_GIUA: t($(el).attr("canle")),
            DORONGPHANTUCANLE: t(el.style.width.replace("px", "")),
            TRANG: t(el.title)
        };
        var stt = me.goc && me.goc.thuTu ? me.goc.thuTu[el.id] : 0;
        o.nhan = (stt ? "(" + stt + ") " : "") + (o.NOIDUNG.length > 50 ? o.NOIDUNG.substring(0, 50) + "…" : o.NOIDUNG);
        return o;
    },
    tinhThayDoi: function () {
        var me = this, goc = me.goc || { mau: {}, o: {} }, thayDoi = [], them = [];
        var TEN_CHUNG = { FONT: "Font", DODAI: "Cỡ chữ mặc định (px)", DORONG: "DPI", KHOGIAY: "Khoảng cách dòng (bảng)", MARGIN_TOP: "Top — lề bù (px)", MARGIN_LEFT: "Left — lề bù (px)" };
        var TEN_O = { NOIDUNG: "Nội dung", LETREN: "Trên (px)", LETRAI: "Trái (px)", FONTSIZE: "Cỡ chữ (px)", LEPHAI: "Kiểu chữ", CANLE_TRAI_PHAI_GIUA: "Căn lề", DORONGPHANTUCANLE: "Độ rộng (px)", DINHDANG: "Định dạng bổ sung", TRANG: "Trang" };
        var dep = function (truong, v) {
            if (truong === "LEPHAI") return v.replace(/font-weight:\s*bold;?/g, "B ").replace(/font-style:\s*italic;?/g, "I ").replace(/text-decoration:\s*underline;?/g, "U ").trim();
            if (truong === "CANLE_TRAI_PHAI_GIUA") return v.replace(/text-align:\s*left;?/, "trái").replace(/text-align:\s*center;?/, "giữa").replace(/text-align:\s*right;?/, "phải");
            if (truong === "TRANG") return v === "" ? "" : String((parseInt(v, 10) || 0) + 1);
            return v;
        };
        var moi = me.docThongTinChung();
        Object.keys(TEN_CHUNG).forEach(function (k) {
            var a = edu.util.returnEmpty((goc.mau || {})[k]), b = moi[k];
            if (String(a) !== String(b)) thayDoi.push({ o: "Thông tin chung", truong: TEN_CHUNG[k], cu: a, moi: b });
        });
        $("#zoneMotherPhoi .phoi").each(function () {
            var o = me.docO(this);
            if (!this.id || !goc.o[this.id]) {
                them.push({ noiDung: o.NOIDUNG, tren: o.LETREN, trai: o.LETRAI, trang: dep("TRANG", o.TRANG) });
                return;
            }
            var c = goc.o[this.id];
            Object.keys(TEN_O).forEach(function (k) {
                if (String(c[k]) !== String(o[k])) thayDoi.push({ o: "Ô " + o.nhan, truong: TEN_O[k], cu: dep(k, c[k]), moi: dep(k, o[k]) });
            });
        });
        return { mau: { id: me.strMauPhoiIn_Id, ma: me.maPhoiHienTai() }, thayDoi: thayDoi, them: them };
    },
    // mauMoi: {id, ma} khi vừa tạo mẫu (chưa có trong danh sách)
    ghiNhatKyPhoi: function (hanhDong, noiDung, duLieu, mauMoi) {
        var me = this;
        if (!window.PhoiInFlow) return;
        var ctx = PhoiInFlow.getCtx();
        var mauId = mauMoi ? mauMoi.id : me.strMauPhoiIn_Id, mauMa = mauMoi ? mauMoi.ma : me.maPhoiHienTai();
        // Thuộc quy trình khi: đang mở từ Quy trình với đúng mẫu này, hoặc đang ở bước chưa có mẫu (Tạo mẫu) và vừa tạo
        var thuocQT = !!(ctx && ctx.quyTrinh && (ctx.mauId === mauId || (!ctx.mauId && mauMoi)));
        if (thuocQT && mauMoi && !ctx.mauId) {
            ctx.mauId = mauMoi.id;
            ctx.maPhoi = mauMoi.ma;
            PhoiInFlow.setCtx(ctx);
            PhoiInFlow.veBannerNguCanh("zoneQuyTrinhPhoi");
        }
        PhoiInFlow.nhatKy.ghi({
            maQuyTrinh: thuocQT ? ctx.quyTrinh : "PHOIIN_SUAMAU",
            phienId: thuocQT ? ctx.phienId : "",
            buoc: thuocQT ? ctx.buoc : "",
            doiTuongId: mauId,
            doiTuongMa: mauMa,
            hanhDong: hanhDong,
            noiDung: noiDung,
            duLieu: duLieu
        }).then(function (r) { me.baoNhatKy(r); });
    },
    baoNhatKy: function (r) {
        var $l = $("#lblNhatKyPhoi");
        if (!$l.length) return;
        clearTimeout(this._tNhatKy);
        if (r.ok) {
            $l.html('<i class="fa fa-check-circle" style="color:#16a34a"></i> Đã ghi nhật ký thay đổi.').css({ color: "#166534" }).show();
            this._tNhatKy = setTimeout(function () { $l.fadeOut(400); }, 4000);
        } else {
            $l.html('<i class="fa fa-exclamation-triangle" style="color:#b45309"></i> Chưa ghi được nhật ký thay đổi (API nhật ký chưa có trên máy chủ — chờ BE). Dữ liệu mẫu vẫn lưu bình thường. <span style="color:#64748b">' + $("<div>").text(r.message || "").html() + '</span>')
                .css({ color: "#78350f" }).show();
        }
    },
    getList_HSSV: function () {
        var me = this;

        //--Edit
        var obj_list = {
            'action': 'SV_HoSo/LayDanhSach',
            'versionAPI': 'v1.0',

            'strTuKhoa': edu.util.getValById("txtSearchDSSV_TuKhoa"),
            'strHeDaoTao_Id': edu.util.getValById("dropSearch_HeDaoTao"),
            'strKhoaDaoTao_Id': edu.util.getValById("dropSearch_KhoaDaoTao"),
            'strChuongTrinh_Id': edu.util.getValById("dropSearch_ChuongTrinhDaoTao"),
            'strLopQuanLy_Id': edu.util.getValById("dropSearch_LopQuanLy"),
            'strNguoiThucHien_Id': "",
            'pageIndex': edu.system.pageIndex_default,
            'pageSize': edu.system.pageSize_default
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
                    me.dt_HS = dtResult;
                    me.getList_NoiDungTheoMa("TEST_MAUIN", "zoneMotherPhoi", dtResult);
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
    --Discription: [3] tes
    --ULR:  Modules
    -------------------------------------------*/
    getList_NoiDungTheoMa: function (strMa, zoneMauIn, dataIn, callback) {
        var me = this;
        var obj_list = {
            'action': 'CMS_MauPhoiIn_ChiTiet/LayDanhSach',
            'strId': strMa,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    if (dtReRult.length > 0) {
                        var iMaxTrang = 0;
                        for (var i = 0; i < dtReRult.length; i++) {
                            if (dtReRult[i].TRANG > iMaxTrang) iMaxTrang = dtReRult[i].TRANG;
                        }
                        var strhead = '<style>.phoi{font-family:"' + dtReRult[0].FONT + '";position:absolute}</style>';
                        $("#" + zoneMauIn).html(strhead);
                        for (var i = 0; i < iMaxTrang + 1; i++) {
                            $("#" + zoneMauIn).append('<div class="pr-containt"></div>');
                            if (i < iMaxTrang) $("#" + zoneMauIn).append('<p style="page-break-before: always;">&nbsp;</p>');
                        }
                        for (var i = 0; i < dtReRult.length; i++) {
                            var html = '<span id="' + dtReRult[i].ID + '" class="phoi" style="margin-top: ' + dtReRult[i].LETREN + 'px; margin-left: ' + dtReRult[i].LETRAI + 'px; ' + edu.util.returnEmpty(dtReRult[i].DINHDANG) + '; '+ edu.util.returnEmpty(dtReRult[i].LEPHAI) + '"></span>';
                            $("#" + zoneMauIn + " .pr-containt:eq(" + edu.util.returnZero(dtReRult[i].TRANG) + ")").append(html);

                        }
                        if (typeof callback === "function") {
                            callback(dtReRult);
                        } else {
                            me.genData_Phoi(zoneMauIn, dataIn, dtReRult);
                        }
                    }
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
    genData_Phoi: function (zoneMauIn, dataIn, dataPhoi) {
        var me = this;
        var pointMauIn = $("#" + zoneMauIn);
        var htmlPhoi = pointMauIn.html();
        pointMauIn.html("");
        for (var i = 0; i < dataIn.length; i++) {
            pointMauIn.append('<div id="zoneIn' + dataIn[i].ID + '" class="zoneCon">' + htmlPhoi + '</div>');
            if (i < dataIn.length -1) $("#" + zoneMauIn).append('<p style="page-break-before: always;">&nbsp;</p>');
        }
        setTimeout(function () {
            for (var i = 0; i < dataIn.length; i++) {
                me.genData_ChiTiet("zoneIn" + dataIn[i].ID, dataIn[i], dataPhoi);
            }
        }, 1000);
        
    },
    genData_ChiTiet: function (zoneMauIn, aData, dataPhoi) {
        var me = this;
        var khoangcach = 30;
        if (dataPhoi.length > 0 && dataPhoi[0].KHOGIAY != null) khoangcach = dataPhoi[0].KHOGIAY;
        var arrCotBang = [];
        for (var i = 0; i < dataPhoi.length; i++) {
            var aPhoi_ChiTiet = dataPhoi[i];
            if (aPhoi_ChiTiet.NOIDUNG.includes("[x].")) {
                arrCotBang.push(aPhoi_ChiTiet);
                continue;
            }
            var strData = "";
            try {
                strData = eval(aPhoi_ChiTiet.NOIDUNG);
            } catch(ex) {
                strData = undefined;
            }
            if (strData !== null && strData !== undefined && strData !== "") {
                $("#" + zoneMauIn + " #" + aPhoi_ChiTiet.ID).html(strData);
            }
        }
        for (var i = 0; i < arrCotBang.length; i++) {
            var strNoiDung = arrCotBang[i].NOIDUNG;
            var tenCotBang = strNoiDung.substring(0, strNoiDung.indexOf("[x]."));
            if (tenCotBang.includes(" ") != -1) tenCotBang = tenCotBang.substring(strNoiDung.indexOf("[x].") + 1);
            var pointClone = $("#" + zoneMauIn + " #" + arrCotBang[j].ID).clone();
            var dosau = point.style.marginTop.replace("px", "");
            for (var j = 0; j < aData[tenCotBang].length; j++) {
                pointClone.css({
                    marginTop: dosau + (i * khoangcach) + "px"
                });
                try {
                    pointClone.html(eval(arrCotBang[j].NOIDUNG.replace(/[x]./g, '[' + j + '].')));
                    $("#" + zoneMauIn).append(pointClone);
                } catch (ex) {
                    console.log(ex);
                }
                
            }
        }
        //if (arrCotBang.length > 0) {
        //    for (var i = 0; i < aData[dulieu].length; i++) {
        //        for (var j = 0; j < arrCotBang.length; j++) {
        //            try {
        //                strData = eval(arrCotBang[j].NOIDUNG.replace(/[x]./g, '[' + i + '].'));
        //            } catch (ex) {
        //                strData = undefined;
        //            }
        //            if (strData !== null && strData !== undefined && strData !== "") {
        //                $("#" + zoneMauIn + " #" + arrCotBang[j].ID).html(strData);
        //            }
        //        }
        //    }
        //}
    },
    makeQRCode: function (zone, qrcode, width, height) {
        try {
            var point = $(zone);
            if (point.length > 0) {
                for (var i = 0; i < point.length; i++) {
                    var qrcodeA = new QRCode(point[i], {
                        width: width,
                        height: height
                    });
                    qrcodeA.makeCode(qrcode);
                }
            }
        } catch (ex) {
            console.log(ex);
            console.log("ERR QR:" + zone);
        }
        
    },
    makePicture: function (zone, strAnh, width, height) {
        $(zone).html('<img src="' + edu.system.getRootPathImg(strAnh) + '" style="width: ' + (width / 2.54 * 96) + 'px; height: ' + (height / 2.54 * 96) +'px">');
    },
    printHTML: function (divId) {
        ////Get the HTML of div
        //var divElements = document.getElementById(divId).innerHTML;
        ////Get the HTML of whole page
        //var oldPage = document.body.innerHTML;

        ////Reset the page's HTML with div's HTML only
        //document.body.innerHTML = "<html><head><title></title></head><body>" + divElements + "</body>";
        ////Print Page
        //window.print();

        ////Restore orignal HTML
        //document.body.innerHTML = oldPage;

        //the second print
        var content = document.getElementById(divId).innerHTML;
        var mywindow = window.open('', '', 'height=600,width=800,status=0');

        mywindow.document.write('<html><head><title>Print</title><style>@media print{@page{margin:0}body{margin:0.0cm}}</style></head><body>' + content + '</body></html>');

        mywindow.document.close();
        mywindow.focus();
        mywindow.print();
        //mywindow.close();//chrome bị lỗi phải comment lại
        setTimeout(function () {
            mywindow.close();//chrome bị lỗi phải comment lại
        }, 2000);
        return true;
    },

    /*------------------------------------------
    --Discription: [3] tes
    --ULR:  Modules
    -------------------------------------------*/
    getImage: function (strZoneUpload_Id, strId) {
        var me = this;
        var sourceFile = edu.util.getValById(strZoneUpload_Id);
        if (sourceFile.includes("unsave_")) {
            strId = me.getDimensions(sourceFile, strId);
            return me.copyFile(sourceFile, strId);
        }
        return sourceFile;
    },
    copyFile: function (sourceFile, strId) {
        var me = this;
        var result = "";
        var x = $.ajax({
            url: edu.system.rootPathUpload + '/Handler/copyfile.ashx?sourceFile=' + sourceFile + '&strId=' + strId+"&userId=" + edu.system.userId,
            headers: { 'Authorization': 'Bearer ' + edu.system.tokenJWT }, // ATTT 2026-11: handler upload xac thuc bang JWT
            method: 'post',
            async: false,
            success: function (data) {
                if (data.indexOf("Sys_error") != 0) {
                    result = data;
                }
                else {
                    console.log(data);
                    result = sourceFile;
                }
            }
        });
        return result;
    },
    getDimensions: function (sourceFile, strId) {
        var me = this;
        var result = "";
        var x = $.ajax({
            url: edu.system.rootPathUpload + '/Handler/getDimensions.ashx?strFileName=' + sourceFile,
            method: 'post',
            async: false,
            success: function (data) {
                if (data.indexOf("Sys_error") != 0) {
                    result = strId + "_" + data;
                }
                else {
                    console.log(data);
                    result = sourceFile;
                }
            }
        });
        return result;
    },

};