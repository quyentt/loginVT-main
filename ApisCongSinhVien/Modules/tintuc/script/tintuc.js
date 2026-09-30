function TinTuc() { };
TinTuc.prototype = {
    strDaoTao_CoCauToChuc_Id: '',
    dtTinTuc: [],
    dtTinTucDaLuu: [],
    strTinTuc_Id: '',
    init: function () {
        var me = this;
        //try {
        //    function encrypted(input, strkey) {
        //        if (!strkey) {
        //            var date = new Date(Date.now());
        //            strkey = "" + date.getFullYear() + (date.getMonth() + 1);
        //        }
        //        var key = Array.from(strkey);
        //        var output = [];
        //        for (var i = 0; i < input.length; i++) {
        //            var charCode = input.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
        //            output.push(String.fromCharCode(charCode));
        //        }
        //        return btoa(output.join(""));
        //    }
        //    function decrypted(input, strkey) {
        //        input = atob(input);
        //        if (!strkey) {
        //            var date = new Date(Date.now());
        //            strkey = "" + date.getFullYear() + (date.getMonth() + 1);
        //        }
        //        var key = Array.from(strkey);;
        //        var output = [];

        //        for (var i = 0; i < input.length; i++) {
        //            var charCode = input.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
        //            output.push(String.fromCharCode(charCode));
        //        }
        //        return output.join("");
        //    }


        //    var encrypted1 = encrypted("vanhieptn95@gmail.com");
        //    console.log("Encrypted:" + encrypted1);

        //    var decrypted1 = decrypted('c11CV01LRHJyA25AWlVXX1VfaE5XUm51SVtDHGVMU15 TW1aWWZGWFF VVxQV10cdWl7Hx0=');
        //    console.log("Decrypted:" + decrypted1);
        //} catch(ex) {

        //}
        //return;
        

        me.getList_NguonTin();
        me.getList_TinTuc();
        me.getList_DanhDau();
        
        /*------------------------------------------
        --Discription: Initial system
        -------------------------------------------*/
        $(".btnSearch").click(function () {
            $("#zonetintuc").html("");
            me.getList_TinTuc();
        });
        $(".btnClose").click(function () {
            me.toggle_notify();
        });
        //$("#txtSearch_TuNgay").datepicker({ dateFormat: 'dd/mm/yy' });
        //edu.system.pickerNumber();
        $("#zonetintuc").delegate('.bantin', 'click', function () {
            //var strLink = $(this).attr("href");
            //if (strLink) window.open(strLink);
            me.toggle_form_input();
            var strId = this.id;
            me.strTinTuc_Id = strId;
            var objTinTuc = me.dtTinTuc.find(e => e.ID == strId);
            me.viewForm_TinTuc(objTinTuc);
            me.save_DaXem(strId);
        });
        $("#tindanhdau").delegate('.bantin', 'click', function () {
            //var strLink = $(this).attr("href");
            //if (strLink) window.open(strLink);
            me.toggle_form_input();
            var strId = this.id;
            me.strTinTuc_Id = strId;
            var objTinTuc = me.dtTinTucDaLuu.find(e => e.TINTUC_BANGTIN_ID == strId);
            me.viewForm_TinTuc(objTinTuc);
            me.save_DaXem(strId);
        });
        $("#zoneDonVi").delegate('.nav-new-item', 'click', function () {
            var strId = this.id;
            me.strDaoTao_CoCauToChuc_Id = strId;
            me.getList_TinTuc();
        });

        $("#btnLuuDanhDau").click(function () {
            me.save_DanhDau();
        });

        $("#btntindaluu").click(function () {
            //me.delete_DanhDau();
        });
        $("#btnGuiTin").click(function () {
            me.save_TinNhan();
        });

        $("#txtSearch_TuKhoa").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.getList_TinTuc();
            }
        });
        $("#txtNoiDungTinNhan").keypress(function (e) {
            if (e.which === 13) {
                e.preventDefault();
                me.save_TinNhan();
            }
        });
    },

    toggle_notify: function () {
        edu.util.toggle_overide("zone-bus", "zonetintuc");
    },
    toggle_form_input: function () {
        edu.util.toggle_overide("zone-bus", "newsdetail");
    },
    /*------------------------------------------
    --Discription: Hàm chung 
    -------------------------------------------*/

    getList_NguonTin: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/DSA4BRIFLi8XKAI0LyYCIDEPJjQuLwPP',
            'func': 'pkg_tintuc.LayDSDonViCungCapNguon',
            'iM': edu.system.iM,
            'strQLSV_NguoiHoc_Id': edu.system.userId,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_NguonTin(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(" : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(" (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },
    genTable_NguonTin: function (data, iPager) {
        data.forEach(e => {
            $("#zoneDonVi").append('<a href="#" class="nav-new-item" id="' + e.ID +'">' + edu.util.returnEmpty(e.TEN) +'</a>');
        });
    },
    getList_TinTuc: function () {
        var me = this;
        console.log(main_doc.DashBoard);
        if (main_doc && main_doc.DashBoard && main_doc.DashBoard.objTinTuc) {
            var objTinTuc = main_doc.DashBoard.objTinTuc;
            me.strTinTuc_Id = objTinTuc.ID;
            me.viewForm_TinTuc(objTinTuc);
            me.save_DaXem(me.strTinTuc_Id);
            me.toggle_form_input();
            main_doc.DashBoard = {};
        } else {
            if ($("#newsdetail").is(":visible")) {
                me.toggle_notify();
            }
        }
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/DSA4BRIVKC8VNCIeAyAvJhUoLx4PJjQuKAU0LyYP',
            'func': 'pkg_tintuc.LayDSTinTuc_BangTin_NguoiDung',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtSearch_TuKhoa'),
            'strTuNgay': edu.util.getValById('txtSearch_TuNgay'),
            'strDenNgay': edu.util.getValById('txtSearch_DenNgay'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strChuyenMuc_Id': '',
            'strChung_UngDung_Id': edu.system.appId,
            'dTinQuanTrong': -1,
            'strDaoTao_CoCauToChuc_Id': me.strDaoTao_CoCauToChuc_Id,
            'dHieuLuc': 1,
            'pageIndex': 1,
            'pageSize': 10000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtTinTuc = dtReRult;
                    me.genTable_TinTuc(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(" : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(" (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    genTable_TinTuc: function (data) {
        var me = this;
        var html = '';
        $("#zonetintuc").html('');
        data.forEach(e => {
            //var strLink = edu.system.apiUrlTemp + '/congsinhvien/Pages/thread.aspx?id=' + e.ID + '&name=' + edu.system.change_alias(e.TIEUDE);
            html += '<div class="col-12 col-md-6 pb-4 bantin" id="'+ e.ID +'" style="cursor: pointer">';
            html += '<div class="news-item box-shadow">';
            html += '<a class="image-z image">';
            var strDuongDan = e.DUONGDANANHHIENTHI ? e.DUONGDANANHHIENTHI : '/Core/images/thongbao.jpg'
            html += '<img src="' + edu.system.getRootPathImg(strDuongDan) + '" alt="' + e.TIEUDE +'">';
            html += '</a>';
            html += '<div class="news-item-right">';
            html += '<a class="title" title="">';
            html += e.TIEUDE;
            html += '</a>';
            html += '<div class="meta">';
            html += '<a class="cate-link" href="#"><i class="fas fa-caret-right me-1"></i><span>' + edu.util.returnEmpty(e.DAOTAO_COCAUTOCHUC_TEN) + '</span></a>';
            html += '<p class="mb-0 ms4"><i class="fal fa-calendar-alt me-1"></i><span>' + edu.util.returnEmpty(e.NGAYBATDAU) + '</span></p>';
            html += '</div>';
            html += '<div class="home-text mb-0"></div>';

            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
        $("#zonetintuc").append(html);
    },
    viewForm_TinTuc: function (data) {
        var me = this;
        //view data --Edit
        var strNoiDung = data.NOIDUNG + '<div class="author mb-4">' + edu.util.returnEmpty(data.NGUOITAO_TENDAYDU) + '</div>';
        edu.util.viewHTMLById("newstitle", data.TIEUDE);
        edu.util.viewHTMLById("newscoso", data.DAOTAO_COCAUTOCHUC_TEN);
        edu.util.viewHTMLById("newsngay", data.NGAYBATDAU);
        edu.util.viewHTMLById("newscontent", strNoiDung);

        me.checkDaLuu();
        me.getList_TinNhan();

        edu.system.viewFiles("txtFileDinhKem", data.ID, "SV_Files");
    },
    
    save_TinTuc: function (strTinTuc_BangTin_Id) {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/FSkkLB4VKC8VNCIeAyAvJhUoLx4NNC41GSQs',
            'func': 'pkg_tintuc.Them_TinTuc_BangTin_LuotXem',
            'iM': edu.system.iM,
            'strTinTuc_BangTin_Id': strTinTuc_BangTin_Id,
            'strDiaChiMayTram': edu.util.getValById('txtAAAA'),
            'strTrinhDuyetSuDungTruyCap': edu.util.getValById('txtAAAA'),
            'strTenThietBi': edu.util.getValById('txtAAAA'),
            'strThoiGianMayTram': edu.util.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    
                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alertOnModal(obj_save.action + " (er): " + data.Message);
                }
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,

            //complete: function () {
            //    me.getList_GiayTo();
            //},
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    save_DaXem: function (strTinTuc_BangTin_Id) {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/FSkkLB4VKC8VNCIeAyAvJhUoLx4NNC41GSQs',
            'func': 'pkg_tintuc.Them_TinTuc_BangTin_LuotXem',
            'iM': edu.system.iM,
            'strTinTuc_BangTin_Id': strTinTuc_BangTin_Id,
            'strDiaChiMayTram': edu.util.getValById('txtAAAA'),
            'strTrinhDuyetSuDungTruyCap': edu.util.getValById('txtAAAA'),
            'strTenThietBi': edu.util.getValById('txtAAAA'),
            'strThoiGianMayTram': edu.util.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {

                }
                else {
                    obj_notify = {
                        type: "w",
                        content: obj_save.action + " (er): " + data.Message,
                    }
                    edu.system.alertOnModal(obj_save.action + " (er): " + data.Message);
                }
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,

            //complete: function () {
            //    me.getList_GiayTo();
            //},
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },
    save_DanhDau: function (strTinTuc_BangTin_Id) {
        var me = this;
        var obj_notify = {};
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/FSkkLB4VKC8VNCIeAyAvJhUoLx4NNDQVMzQP',
            'func': 'pkg_tintuc.Them_TinTuc_BangTin_LuuTru',
            'iM': edu.system.iM,
            'strTinTuc_BangTin_Id': me.strTinTuc_Id,
            'strNguoiDung_Id': edu.system.userId,
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    edu.system.alert("Lưu thành công");
                    me.getList_DanhDau();
                }
                
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,

            //complete: function () {
            //    me.getList_GiayTo();
            //},
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    getList_DanhDau: function () {
        var me = this;
        
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/DSA4BRIVKC8VNCIeAyAvJhUoLx4NNDQVMzQP',
            'func': 'pkg_tintuc.LayDSTinTuc_BangTin_LuuTru',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strTinTuc_BangTin_Id': edu.util.getValById('dropAAAA'),
            'strNguoiDung_Id': edu.system.userId,
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.dtTinTucDaLuu = dtReRult;
                    me.genTable_DanhDau(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert(" : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(" (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    genTable_DanhDau: function (data) {
        var me = this;
        var html = '';
        $("#tindanhdau").html('');
        if (data.length > 0) {
            $("#zonetindadanhdau").show();
        } else {
            $("#zonetindadanhdau").hide();
        }
        me.checkDaLuu();
        data.forEach(e => {
            //var strLink = edu.system.apiUrlTemp + '/congsinhvien/Pages/thread.aspx?id=' + e.ID + '&name=' + edu.system.change_alias(e.TIEUDE);

            html += '<div class="col-12 col-md-6 col-lg-12 bantin" id="' + e.TINTUC_BANGTIN_ID +'" style="cursor: pointer">';
            html += '<div class="news-item">';
            html += '<a href="#" class="image-z image">';
            html += '<img src="' + edu.system.getRootPathImg(e.DUONGDANANHHIENTHI) + '" alt="">';
            html += '</a>';
            html += '<div class="news-item-right">';
            html += '<a>';
            html += edu.util.returnEmpty(e.TIEUDE);
            html += '</a>';
            html += '<div class="meta">';
            html += '<a class="cate-link" href=""><i class="fas fa-caret-right me-1"></i><span>' + edu.util.returnEmpty(e.DAOTAO_COCAUTOCHUC_TEN) + '</span></a>';
            html += '<p class="mb-0 ms4"><i class="fal fa-calendar-alt me-1"></i><span>' + edu.util.returnEmpty(e.NGAYBATDAU) + '</span></p>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
        $("#tindanhdau").append(html);
    },
    checkDaLuu: function () {
        var me = this;
        if (me.strTinTuc_Id) {
            var objCheckDaLuu = me.dtTinTucDaLuu.find(e => e.ID == me.strTinTuc_Id);
            if (objCheckDaLuu) {
                $("#btntindaluu").show();
                $("#btnLuuDanhDau").hide();
            } else {
                $("#btntindaluu").hide();
                $("#btnLuuDanhDau").show();
            }
        }
    },
    
    save_TinNhan: function () {
        var me = this;
        var obj_notify = {};
        if ($("#txtNoiDungTinNhan").val() == "") return;
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/FSkkLB4VKC8VNCIeAyAvJhUoLx4DKC8pDTQgLwPP',
            'func': 'pkg_tintuc.Them_TinTuc_BangTin_BinhLuan',
            'iM': edu.system.iM,
            'strTinTuc_BangTin_Id': me.strTinTuc_Id,
            'strNguoiDung_Id': edu.util.getValById('dropAAAA'),
            'strNoiDung': edu.util.getValById('txtNoiDungTinNhan'),
            'strNguoiThucHien_Id': edu.system.userId,
        };
        //default
        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    me.getList_TinNhan();
                    $("#txtNoiDungTinNhan").val("");
                }
            },
            error: function (er) {
                edu.system.alertOnModal(obj_notify);
            },
            type: "POST",
            action: obj_save.action,

            //complete: function () {
            //    me.getList_GiayTo();
            //},
            contentType: true,
            data: obj_save,
            fakedb: [
            ]
        }, false, false, false, null);
    },

    getList_TinNhan: function () {
        var me = this;
        //--Edit
        var obj_save = {
            'action': 'TS_TinTuc_MH/DSA4BRIVKC8VNCIeAyAvJhUoLx4DKC8pDTQgLwPP',
            'func': 'pkg_tintuc.LayDSTinTuc_BangTin_BinhLuan',
            'iM': edu.system.iM,
            'strTuKhoa': edu.util.getValById('txtAAAA'),
            'strNguoiThucHien_Id': edu.system.userId,
            'strTinTuc_BangTin_Id': me.strTinTuc_Id,
            'strNguoiDung_Id': edu.util.getValById('dropAAAA'),
            'pageIndex': 1,
            'pageSize': 100000,
        };
        //

        edu.system.makeRequest({
            success: function (data) {
                if (data.Success) {
                    var dtReRult = data.Data;
                    me.genTable_BinhLuan(dtReRult, data.Pager);
                }
                else {
                    edu.system.alert( " : " + data.Message, "s");
                }

            },
            error: function (er) {

                edu.system.alert(" (er): " + JSON.stringify(er), "w");
            },
            type: 'POST',
            action: obj_save.action,

            contentType: true,
            data: obj_save,
            fakedb: [

            ]
        }, false, false, false, null);
    },

    genTable_BinhLuan: function (data) {
        var me = this;
        var html = '';
        $("#lblTongBinhLuan").html('Bình luận (' + data.length + ')');
        $("#commented").html('');
        data.forEach(e => {
            //var strLink = edu.system.apiUrlTemp + '/congsinhvien/Pages/thread.aspx?id=' + e.ID + '&name=' + edu.system.change_alias(e.TIEUDE);

            html += '<div class="comment-item">';
            html += '<img src="assets/images/avata.png">';
            html += '<div class="right">';
            html += '<p>';
            html += '<b>' + edu.util.returnEmpty(e.NGUOIDUNG_TENDAYDU) +'</b> ' + edu.util.returnEmpty(e.NOIDUNG);
            html += '</p>';
            html += '<div class="meta">';
            html += '<p class="mb-0 ms4"><i class="fal fa-calendar-alt me-1"></i><span>' + edu.util.returnEmpty(e.NGAYTAO) +'</span></p>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
        $("#commented").append(html);
    },
}