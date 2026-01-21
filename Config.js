function Init_API() {
    var url = "";
//$(".wrapper").attr("style", "background-image: url('/assets/images/wrapper-bg_CMC.png')");
//$(".wrapper").css("background-image", "url('/assets/images/wrapper-bg_CMC.png')");
    return {
        DonVi: "Nhà test",
        urlNode: 'https://api-apis.com',
        CM: url + '/csacmapi/api',
        SYS: url + '/csacmapi/api',
        CMS: url + '/cmsapi/api',
        DKH: url + '/dangkyhocapi/api',
        KHCT: url + '/kehoachchuongtrinhapi/api',
        KS: url + '/qlkhaosatapi/api',
        KTX: url + '/kytucxaapi/api',
        NCKH: url + '/nckhapi/api',
        NS: url + '/nhansuapi/api',
        D: url + '/quanlydiemapi/api',
        SV: url + '/sinhvienapi/api',
        SMS: url + '/smsapi/api',
        TC: url + '/taichinhapi/api',
        TKGG: url + '/thongkegiogiangapi/api',
        L: url + '/luongapi/api',
        CC: url + '/chuyencanapi/api',
        HLTL: url + '/hoclaithilaiapi/api',
        RL: url + '/renluyenapi/api',
        XLHV: url + '/xulyhocvuapi/api',
        HDDT: url + '/hddtviettelapi/api',
        NH: url + '/nhaphocapi/api',
        TS: url + '/quanlytuyensinhapi/api',
        LVLA: url + '/luanvanluananapi/api',
        TN: url + '/totnghiepapi/api',
        HB: url + '/hocbongapi/api',         
	TT: url + '/tintucapi/api',
        QLTTN: url + ':57388/api',
        TP: url + '/thiphachapi/api',
        TTN: url + 'http://localhost:1766/api',
    };
}
//Replace html & js before load. warning 
function ReplicaWithText() {
    return {
        All: {

        },
        ApisCongCanBo: {

        }
    };
}
//replace html after load
function ReplicaWithDom() {
    return {
        All: {
            ".cosoxet": "trường."//
        },
        ApisCongCanBo: {
        }
    };
}
