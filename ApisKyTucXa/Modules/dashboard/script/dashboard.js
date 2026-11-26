/*----------------------------------------------
--Trang mở đầu Ký túc xá (chức năng có DUONGDANHIENTHI = "#dashboard")
--Mô tả luồng sử dụng: đi từ chức năng nào sang chức năng nào.
--Mỗi bước gắn với DUONGDANHIENTHI của chức năng trên menu; bấm bước = bấm menu tương ứng.
----------------------------------------------*/
function Dashboard() { };
Dashboard.prototype = {
    dtGiaiDoan: [
        {
            ma: 'gd1', so: 1, ten: 'Thiết lập cơ sở vật chất', icon: 'fa fa-building-o', mau: '#2563eb', nen: '#eef4ff',
            khi: 'Làm 1 lần khi mở KTX',
            mota: 'Khai báo danh mục, tòa nhà, phòng và công tơ trước khi nhận người ở.',
            nhanh: [{
                ten: '', buoc: [
                    { link: '#danhmucdulieu', ten: 'Khai báo danh mục', mota: 'Loại phòng, đối tượng, tính chất...' },
                    { link: '#toanha-sophong', ten: 'Tòa nhà - số phòng', mota: 'Tòa nhà, tầng, số phòng' },
                    { link: '#phong', ten: 'Phòng & công tơ', mota: 'Sức chứa, loại phòng, gán công tơ' },
                    { link: '#congtodien', ten: 'Công tơ điện', mota: 'Danh sách công tơ điện' },
                    { link: '#congtonuoc', ten: 'Công tơ nước', mota: 'Danh sách công tơ nước' }
                ]
            }, {
                ten: 'Thiết bị', buoc: [
                    { link: '#thietbi', ten: 'Thiết bị trong phòng', mota: 'Danh mục thiết bị' },
                    { link: '#quanlythietbi', ten: 'Quản lý thiết bị', mota: 'Cấp phát, theo dõi theo phòng' }
                ]
            }],
            ghichu: 'Phòng phải có công tơ điện / nước thì mới nhập được chỉ số và tính phí ở giai đoạn 5.'
        },
        {
            ma: 'gd2', so: 2, ten: 'Quy định mức phí', icon: 'fa fa-money', mau: '#0d9488', nen: '#e6f7f5',
            khi: 'Đầu mỗi năm học / khi đổi giá',
            mota: 'Đặt đơn giá phòng, giá dịch vụ điện nước và công thức tính phí.',
            nhanh: [{
                ten: '', buoc: [
                    { link: '#dongiaphongo', ten: 'Đơn giá phòng ở', mota: 'Giá theo phòng / loại phòng' },
                    { link: '#phidichvu', ten: 'Phí dịch vụ điện - nước', mota: 'Đơn giá điện, nước' },
                    { link: '#congthuctinhphi', ten: 'Công thức tính phí', mota: 'Xâu công thức, ngày áp dụng' }
                ]
            }]
        },
        {
            ma: 'gd3', so: 3, ten: 'Tiếp nhận người ở', icon: 'fa fa-user-plus', mau: '#7c3aed', nen: '#f3edff',
            khi: 'Mỗi đợt đăng ký',
            mota: 'Hai cách nhận người ở: sinh viên đăng ký theo kế hoạch, hoặc cán bộ đăng ký trực tiếp tại KTX.',
            nhanh: [{
                ten: 'Cách 1 — Đăng ký theo kế hoạch', buoc: [
                    { link: '#kehoach', ten: 'Kế hoạch đăng ký', mota: 'Mở đợt, thời gian, đối tượng, phòng' },
                    { ngoai: true, ten: 'Sinh viên đăng ký', mota: 'Trên cổng sinh viên' },
                    { link: '#xepphongdangky', ten: 'Xếp phòng đăng ký', mota: 'Xếp người vào phòng, tính tiền' }
                ]
            }, {
                ten: 'Cách 2 — Đăng ký trực tiếp tại KTX', buoc: [
                    { link: '#timkiemnguoi', ten: 'Hỗ trợ tìm phòng phù hợp', mota: 'Tìm phòng còn chỗ theo giới tính' },
                    { link: '#dangkynguoio', ten: 'Đăng ký người ở', mota: 'Nhập hồ sơ, tính tiền' },
                    { link: '#taovainhopdong', ten: 'Tạo và in hợp đồng', mota: 'Lưu và in ngay' }
                ]
            }]
        },
        {
            ma: 'gd4', so: 4, ten: 'Hợp đồng & hồ sơ người ở', icon: 'fa fa-file-text-o', mau: '#d97706', nen: '#fff4e0',
            khi: 'Sau khi xếp phòng',
            mota: 'Người đã xếp phòng nhưng chưa ký sẽ nằm ở "Chưa có hợp đồng"; ký xong chuyển sang "Đã có hợp đồng".',
            nhanh: [{
                ten: '', buoc: [
                    { link: '#hopdong', ten: 'Chưa có hợp đồng', mota: 'Lập, lưu và in hợp đồng' },
                    { link: '#dacohopdong', ten: 'Đã có hợp đồng', mota: 'Tra cứu, gia hạn, thanh lý' },
                    { link: '#khoitaohoso', ten: 'Danh sách người ở', mota: 'Hồ sơ, chuyển phòng, nộp / nợ / miễn' }
                ]
            }]
        },
        {
            ma: 'gd5', so: 5, ten: 'Vận hành hằng tháng', icon: 'fa fa-refresh', mau: '#dc2626', nen: '#fdecec',
            khi: 'Mỗi tháng',
            mota: 'Ghi chỉ số điện nước, tính phí cho người ở rồi chuyển số liệu sang kế toán.',
            nhanh: [{
                ten: '', buoc: [
                    { link: '#diennuoc', ten: 'Quản lý điện - nước', mota: 'Nhập / import chỉ số theo tháng' },
                    { link: '#tinhhocphi', ten: 'Tính phí', mota: 'Tính tiền phòng + điện nước' },
                    { link: '#chuyendulieuketoan', ten: 'Chuyển dữ liệu kế toán', mota: 'Đẩy khoản phải thu sang tài chính' }
                ]
            }],
            ghichu: 'Cần tra cứu mà không sửa chỉ số thì dùng "Xem điện nước" (chỉ xem).'
        }
    ],

    init: function () {
        var me = this;
        me.genTongQuan();
        me.genGiaiDoan();
        $("#zoneKtxDashboard").on("click", "[data-link]", function () {
            me.moChucNang($(this).attr("data-link"));
        });
        $("#zoneKtxDashboard").on("click", "[data-toi]", function (e) {
            e.preventDefault();
            var el = document.getElementById($(this).attr("data-toi"));
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    },
    /*----------------------------------------------
    --Tìm chức năng trên menu theo DUONGDANHIENTHI
    ----------------------------------------------*/
    timChucNang: function (strLink) {
        var ds = (window.edu && edu.system && edu.system.dtChucNang) || [];
        for (var i = 0; i < ds.length; i++) {
            if ((ds[i].DUONGDANHIENTHI || "").trim().toLowerCase() == strLink.toLowerCase()) return ds[i];
        }
        return null;
    },
    moChucNang: function (strLink) {
        var me = this;
        var obj = me.timChucNang(strLink);
        var el = obj ? document.getElementById("chucnang" + obj.ID) : null;
        if (!el) {
            if (edu.system && edu.system.alert) edu.system.alert("Bạn chưa được phân quyền chức năng này. Liên hệ quản trị để được gán vai trò.");
            return;
        }
        el.click();
    },
    escape: function (s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    },
    mauGD: function (gd) {
        return '--c:' + gd.mau + ';--s:' + gd.nen + ';';
    },
    genTongQuan: function () {
        var me = this;
        var html = '';
        me.dtGiaiDoan.forEach(function (gd) {
            html += '<a class="db-ov-item" href="#" data-toi="ktxdb_' + gd.ma + '" style="' + me.mauGD(gd) + '">';
            html += '<span class="db-ov-num">' + gd.so + '</span>';
            html += '<span class="db-ov-name">' + me.escape(gd.ten) + '</span>';
            html += '</a>';
        });
        $("#zoneKtxDb_TongQuan").html(html);
    },
    genGiaiDoan: function () {
        var me = this;
        var html = '';
        me.dtGiaiDoan.forEach(function (gd) {
            html += '<div class="db-phase" id="ktxdb_' + gd.ma + '" style="' + me.mauGD(gd) + '">';
            html += '<div class="db-phase-head">';
            html += '<div class="db-phase-icon"><i class="' + gd.icon + '"></i></div>';
            html += '<div><h3 class="db-phase-title"><small>GIAI ĐOẠN ' + gd.so + '</small>' + me.escape(gd.ten) + '</h3>';
            html += '<p class="db-phase-desc">' + me.escape(gd.mota) + '</p></div>';
            html += '<span class="db-when"><i class="fa fa-clock-o"></i> ' + me.escape(gd.khi) + '</span>';
            html += '</div>';
            var iSo = 0;
            gd.nhanh.forEach(function (nh) {
                html += '<div class="db-lane">';
                if (nh.ten) html += '<div class="db-lane-name">' + me.escape(nh.ten) + '</div>';
                html += '<div class="db-flow">';
                nh.buoc.forEach(function (b, k) {
                    if (k > 0) html += '<div class="db-arrow"><i class="fa fa-long-arrow-right"></i></div>';
                    iSo++;
                    html += me.genBuoc(b, gd.so + '.' + iSo);
                });
                html += '</div></div>';
            });
            if (gd.ghichu) html += '<div class="db-note"><i class="fa fa-info-circle"></i>' + me.escape(gd.ghichu) + '</div>';
            html += '</div>';
        });
        $("#zoneKtxDb_GiaiDoan").html(html);
    },
    genBuoc: function (b, strSo) {
        var me = this;
        var html = '';
        if (b.ngoai) {
            html += '<div class="db-step is-ngoai">';
            html += '<div class="db-step-top"><span class="db-step-no">' + strSo + '</span><span class="db-step-name">' + me.escape(b.ten) + '</span></div>';
            html += '<div class="db-step-desc">' + me.escape(b.mota) + '</div>';
            html += '</div>';
            return html;
        }
        var obj = me.timChucNang(b.link);
        var strTen = obj && obj.TENCHUCNANG ? obj.TENCHUCNANG.trim() : b.ten;
        html += '<button type="button" class="db-step' + (obj ? '' : ' is-khoa') + '" data-link="' + me.escape(b.link) + '"'
            + ' title="' + (obj ? 'Mở chức năng ' + me.escape(strTen) : 'Chưa được phân quyền') + '">';
        html += '<span class="db-step-top"><span class="db-step-no">' + strSo + '</span><span class="db-step-name">' + me.escape(strTen) + '</span></span>';
        html += '<span class="db-step-desc">' + me.escape(b.mota) + '</span>';
        if (!obj) html += '<span class="db-step-tag"><i class="fa fa-lock"></i> Chưa được phân quyền</span>';
        html += '</button>';
        return html;
    }
};
