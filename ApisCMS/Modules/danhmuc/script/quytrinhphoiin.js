/*----------------------------------------------
--Quy trình phôi in (18/11/2026)
--2 quy trình:
--  PHOIIN_MOI      : phôi / ảnh MỚI cần thiết lập (8 bước)
--  PHOIIN_CANCHINH : phôi ĐÃ CHẠY cần căn chỉnh (6 bước)
--Mỗi bước: mục đích, cách làm, lưu ý, link tới đúng màn hình (tra theo menu vai trò), kiểm tra tự động trên dữ liệu thật,
--  công cụ (bảng khổ giấy, nhập độ lệch, đề xuất Top/Left, tọa độ test), checklist xác nhận, ghi chú. Mọi thao tác ghi nhật ký.
--TÙY BIẾN: sửa mảng QUY_TRINH dưới đây (thêm/bớt/đổi thứ tự bước, đổi chữ) — giao diện tự dựng theo cấu hình.
--  view    : khóa trong PhoiInFlow.MAN_HINH (mauphoiin | thuchienin | quanlythongtin) | null = làm ngoài hệ thống
--  congCu  : khogiay | dolech | dexuat | hientuong | toadotest | null
--  kiemTra : anh | mau | chung | noidung | ganmau | intest | dexuat | nghiemthu | tongquan | toadotest | sosanh
--  doLechTu: bước lấy số đo (dùng cho dexuat / sosanh) · canMau: bước cần chọn mẫu · ketThuc: hoàn thành = kết thúc phiên
--Tiến độ suy ra từ nhật ký của phiên. API nhật ký BE CHƯA CÓ (phoiinflow.js) -> chưa có BE thì tiến độ không giữ được khi rời trang.
----------------------------------------------*/
function QuyTrinhPhoiIn() { }
QuyTrinhPhoiIn.prototype = {
    QUY_TRINH: [
        {
            ma: "PHOIIN_MOI",
            ten: "Phôi / ảnh MỚI cần thiết lập",
            tenNgan: "Phôi mới",
            moTa: "Khi nhận mẫu phôi mới, đổi ảnh scan, hoặc thêm loại văn bằng mới.",
            icon: "fa-plus-square", mau: "blue",
            buoc: [
                {
                    ma: "A1", ten: "Chuẩn bị ảnh scan phôi", view: null, congCu: "anh", kiemTra: "anh",
                    mucDich: "Ảnh nền đúng kích thước thật thì vị trí đặt trên màn thiết kế mới khớp khi in.",
                    cachLam: [
                        "Scan phôi <b>trắng</b> (chưa in) ở chế độ màu (150–300 DPI), đặt thẳng.",
                        "Mở ảnh ở công cụ <b>Xem trước & chỉnh ảnh nền</b> bên dưới (chọn từ máy, hoặc lấy ảnh nền của mẫu đang chọn).",
                        "Chọn khổ giấy + hướng; chỉnh nghiêng, cắt viền đen / viền máy scan cho sát mép giấy — xem trực tiếp trên lưới 10 mm.",
                        "Bấm <b>Tải ảnh chuẩn về</b>: công cụ xuất JPG đúng số px theo 96 DPI (A4 ngang 1123 × 794 px), thường dưới 1 MB. Dùng phần mềm khác thì số px = số mm × 3,78 (bảng quy đổi bên dưới)."
                    ],
                    luuY: [
                        "Để nguyên ảnh scan 300 DPI (A4 = 2480 × 3508 px) thì trang thiết kế to gấp ~3 lần, in ra sai tỉ lệ.",
                        "Mẫu nhiều trang dùng <b>chung 1 ảnh nền</b> cho mọi trang."
                    ],
                    checklist: ["Ảnh đúng số px theo khổ giấy (96 DPI)", "Ảnh thẳng, cắt sát mép giấy", "Đã có mã mẫu dự kiến (viết liền không dấu)"]
                },
                {
                    ma: "A2", ten: "Tạo mẫu phôi", view: "mauphoiin", kiemTra: "mau",
                    mucDich: "Tạo bản ghi mẫu phôi gắn với ảnh nền.",
                    cachLam: [
                        "Bấm <b>Mở màn hình</b> → nút <b>Thêm mẫu</b> (cạnh ô chọn mẫu).",
                        "Nhập <b>Mã mẫu in</b> (viết liền không dấu, VD <code>VB_CUNHAN_2026</code>), <b>Số trang</b>, chọn <b>Ảnh scan</b> → <b>Lưu</b>.",
                        "Quay lại trang này (nút <b>Về quy trình</b>), chọn mẫu vừa tạo ở ô <b>Mẫu phôi</b> phía trên."
                    ],
                    luuY: [
                        "Tạo xong <b>không sửa được</b> Mã / Số trang / Ảnh scan — sai thì tạo mẫu mới.",
                        "Kích thước trang lấy từ ảnh lúc tải lên; Dài × Rộng (mm) hiện ở màn thiết kế phải đúng khổ giấy."
                    ],
                    checklist: ["Đã tạo mẫu và chọn mẫu ở trang này", "Dài × Rộng hiển thị đúng khổ giấy"]
                },
                {
                    ma: "A3", ten: "Thiết lập chung", view: "mauphoiin", kiemTra: "chung", canMau: true,
                    mucDich: "Font, cỡ chữ mặc định và lề bù máy in áp cho cả tờ.",
                    cachLam: [
                        "Chọn mẫu → khối <b>Tùy chọn khổ giấy</b>: chọn <b>Font chữ</b>, nhập <b>Cỡ chữ</b> (px).",
                        "<b>Top / Left</b>: lề bù toàn trang (px) — để trống lúc đầu, chỉnh ở Bước 7 sau khi in thử.",
                        "Bấm <b>Lưu</b> (góc trên phải khung Phôi)."
                    ],
                    luuY: [
                        "Đổi font / cỡ chữ phải Lưu rồi chọn lại mẫu mới thấy trên màn thiết kế.",
                        "Top / Left không xem trước được ở màn thiết kế, chỉ có tác dụng ở màn Thực hiện in. Top trống thì Left cũng bị bỏ qua khi in."
                    ],
                    checklist: ["Đã chọn font", "Đã nhập cỡ chữ", "Đã Lưu"]
                },
                {
                    ma: "A4", ten: "Đặt các ô nội dung", view: "mauphoiin", kiemTra: "noidung", canMau: true,
                    mucDich: "Mỗi ô là 1 thông tin của người học, đặt đúng vị trí trên phôi.",
                    cachLam: [
                        "Gõ biểu thức vào ô <b>Thêm nội dung</b> → <b>Thêm</b>. Biểu thức dạng <code>aData.TEN_COT</code>, VD <code>aData.HOTEN</code>; chữ cố định đặt trong nháy đơn, VD <code>'Hà Nội'</code>.",
                        "Chưa biết tên cột: chọn một mẫu đang chạy ở màn Mẫu phôi in, bấm vào ô để xem biểu thức; hoặc xem cột Biểu thức ở Chế độ test của màn Thực hiện in.",
                        "Bấm vào ô để chọn (viền đỏ) → dịch bằng <b>phím mũi tên</b> (1 px/lần) hoặc nhập <b>Khoảng cách bên trái / phía trên</b>.",
                        "Tùy chỉnh từng ô: Font size, <b>B</b> / <i>I</i> / <u>U</u>, Căn lề (căn giữa / phải cần nhập <b>Độ rộng</b>), Định dạng bổ sung (CSS).",
                        "Bấm <b>Lưu</b> — form tiến trình hiện kết quả từng ô."
                    ],
                    luuY: [
                        "Không dùng <code>&amp;&amp;</code>, <code>&lt;</code>, <code>&gt;</code> trong biểu thức — bị mã hoá HTML khi lưu nên lỗi lúc in.",
                        "Biểu thức dạng bảng <code>[x].</code> đang lỗi ở màn in — chưa dùng.",
                        "Đang chọn 1 ô thì phím mũi tên dịch ô, kể cả khi đang gõ trong ô nhập — bấm ra vùng trống để bỏ chọn trước khi gõ."
                    ],
                    checklist: ["Đủ các thông tin cần in", "Biểu thức hiện đúng giá trị mẫu (xem ở Chế độ test)", "Đã Lưu"]
                },
                {
                    ma: "A5", ten: "Đưa mẫu vào danh sách in & gắn cho văn bằng", view: "quanlythongtin", kiemTra: "ganmau", canMau: true,
                    mucDich: "Màn Thực hiện in chỉ liệt kê mẫu nằm trong danh sách bản chính / bản sao; văn bằng phải được gắn mẫu.",
                    cachLam: [
                        "Xem kiểm tra tự động bên dưới: mẫu đã có trong danh sách bản chính / bản sao chưa.",
                        "Mở màn <b>Thông tin văn bằng</b> → mở văn bằng cần in → chọn <b>Mẫu phôi</b> (bản chính) hoặc <b>Mẫu phôi bản sao</b> → Lưu."
                    ],
                    luuY: ["Mẫu không có trong cả 2 danh sách: việc phân loại bản chính / bản sao do máy chủ quyết định — liên hệ BE / quản trị."],
                    checklist: ["Mẫu có trong danh sách in", "Đã gắn mẫu cho văn bằng cần in"]
                },
                {
                    ma: "A6", ten: "In thử trên giấy trắng & đo lệch", view: "thuchienin", congCu: "dolech", kiemTra: "intest", canMau: true,
                    mucDich: "Đo độ lệch thật giữa bản in và phôi.",
                    cachLam: [
                        "Mở <b>Thực hiện in</b> (mẫu được chọn sẵn) → lọc 1–2 người học → <b>Tìm kiếm</b>.",
                        "Bật <b>Chế độ test</b>; muốn dễ đo thì tick \"Chỉ hiện ký hiệu (1)(2)…\".",
                        "<b>In lần lượt</b> ra GIẤY TRẮNG cùng khổ. Hộp thoại in: Lề = <b>Không / None</b>, Tỷ lệ = <b>100% / Thực tế</b>, tắt Đầu trang / Chân trang.",
                        "Chồng tờ in lên phôi thật, soi đèn, đo lệch (mm) rồi nhập vào ô bên dưới."
                    ],
                    luuY: [
                        "Máy đang có tọa độ test (từng kéo ô ở Chế độ test) thì bản in KHÔNG phản ánh mẫu — xóa trước khi đo (xem kiểm tra tự động).",
                        "Quy ước: lệch ngang <b>dương</b> = chữ in lệch sang PHẢI; lệch dọc <b>dương</b> = chữ in lệch XUỐNG."
                    ],
                    checklist: ["Hộp thoại in: lề None, tỷ lệ 100%", "Đã đo và nhập độ lệch"]
                },
                {
                    ma: "A7", ten: "Chốt tọa độ chuẩn trên mẫu", view: "mauphoiin", congCu: "dexuat", kiemTra: "dexuat", doLechTu: "A6", canMau: true,
                    mucDich: "Chốt tọa độ vào mẫu để MỌI máy in ra giống nhau.",
                    cachLam: [
                        "Lệch <b>đều</b> cả tờ → sửa <b>Top / Left</b> theo đề xuất bên dưới.",
                        "Lệch <b>riêng</b> vài ô → chọn từng ô, sửa <b>Khoảng cách bên trái / phía trên</b> (1 mm ≈ 3,78 px).",
                        "Bấm <b>Lưu</b>. Nhật ký tự ghi ô nào đổi từ bao nhiêu sang bao nhiêu."
                    ],
                    luuY: ["Kéo ô ở Chế độ test chỉ lưu trên trình duyệt máy đó — KHÔNG phải cách chốt tọa độ."],
                    checklist: ["Đã sửa Top / Left hoặc tọa độ ô", "Đã Lưu mẫu"]
                },
                {
                    ma: "A8", ten: "In thật & nghiệm thu", view: "thuchienin", congCu: "dolech", kiemTra: "nghiemthu", canMau: true, ketThuc: true,
                    mucDich: "Xác nhận mẫu đạt trước khi in cả lô.",
                    cachLam: [
                        "Tắt Chế độ test; từng kéo ô thì bấm <b>Reset tọa độ</b> (hoặc nút Xóa ở kiểm tra tự động).",
                        "In lại giấy trắng kiểm tra lần cuối (lệch ≤ 0,5 mm là đạt), nhập số đo bên dưới.",
                        "In 1 tờ trên phôi thật; đạt thì in cả lô."
                    ],
                    checklist: ["Máy in không còn tọa độ test", "In thử lần cuối đạt (≤ 0,5 mm)", "In 1 tờ phôi thật đạt"]
                }
            ]
        },
        {
            ma: "PHOIIN_CANCHINH",
            ten: "Phôi ĐÃ CHẠY cần căn chỉnh",
            tenNgan: "Căn chỉnh",
            moTa: "Khi in bị lệch, đổi máy in / driver, đổi lô phôi, hoặc máy này in khác máy kia.",
            icon: "fa-crosshairs", mau: "amber",
            buoc: [
                {
                    ma: "B1", ten: "Ghi nhận hiện tượng", view: null, congCu: "hientuong", kiemTra: "tongquan", canMau: true,
                    mucDich: "Khoanh vùng nguyên nhân trước khi sửa mẫu.",
                    cachLam: [
                        "Chọn mẫu đang chạy ở ô <b>Mẫu phôi</b> phía trên.",
                        "Ghi lại: máy in nào, lô phôi nào, từ khi nào; phân loại hiện tượng ở ô bên dưới.",
                        "Kiểm tra nhanh hộp thoại in: Tỷ lệ <b>100%</b>, Lề <b>None</b> — nhiều ca lệch do cài đặt in chứ không phải do mẫu."
                    ],
                    luuY: ["Chỉ 1 máy lệch, máy khác đúng → thường do tọa độ test trên máy đó hoặc cài đặt máy in (Bước 2), KHÔNG sửa mẫu."],
                    checklist: ["Đã ghi máy in / lô phôi", "Đã kiểm tra tỷ lệ 100%, lề None"]
                },
                {
                    ma: "B2", ten: "Kiểm tra tọa độ test trên máy in", view: "thuchienin", congCu: "toadotest", kiemTra: "toadotest", canMau: true,
                    mucDich: "Tọa độ kéo ở Chế độ test lưu trong trình duyệt và ĐÈ tọa độ mẫu khi in — kể cả khi đã tắt Chế độ test.",
                    cachLam: [
                        "Mở trang này <b>trên chính máy đang in lệch</b>, đăng nhập đúng tài khoản dùng để in.",
                        "Xem số ô đang dùng tọa độ test ở bên dưới.",
                        "Có → bấm <b>Xóa tọa độ test</b> (hoặc Reset tọa độ ở màn Thực hiện in), in lại xem còn lệch không."
                    ],
                    luuY: ["Tọa độ test lưu theo trình duyệt + tài khoản: máy khác / tài khoản khác không thấy."],
                    checklist: ["Đã kiểm tra trên máy in lệch", "Không còn tọa độ test (hoặc đã xóa)"]
                },
                {
                    ma: "B3", ten: "In thử & đo lệch", view: "thuchienin", congCu: "dolech", kiemTra: "intest", canMau: true,
                    mucDich: "Đo độ lệch thật giữa bản in và phôi.",
                    cachLam: [
                        "Mở <b>Thực hiện in</b> (mẫu được chọn sẵn) → lọc 1–2 người học → <b>Tìm kiếm</b>.",
                        "<b>In lần lượt</b> ra giấy trắng cùng khổ (lề None, tỷ lệ 100%); tick \"Chỉ hiện ký hiệu\" ở Chế độ test nếu cần.",
                        "Chồng lên phôi thật, soi đèn, đo lệch (mm) rồi nhập bên dưới."
                    ],
                    luuY: ["Quy ước: lệch ngang <b>dương</b> = chữ in lệch sang PHẢI; lệch dọc <b>dương</b> = chữ in lệch XUỐNG."],
                    checklist: ["Hộp thoại in: lề None, tỷ lệ 100%", "Đã đo và nhập độ lệch"]
                },
                {
                    ma: "B4", ten: "Chỉnh trên mẫu", view: "mauphoiin", congCu: "dexuat", kiemTra: "dexuat", doLechTu: "B3", canMau: true,
                    mucDich: "Sửa tọa độ trong mẫu để mọi máy in giống nhau.",
                    cachLam: [
                        "Lệch <b>đều</b> cả tờ → sửa <b>Top / Left</b> theo đề xuất bên dưới.",
                        "Lệch <b>riêng</b> vài ô → chọn từng ô, sửa <b>Khoảng cách bên trái / phía trên</b> (1 mm ≈ 3,78 px).",
                        "Sai font / cỡ chữ → khối Tùy chọn khổ giấy hoặc Font size của ô.",
                        "Bấm <b>Lưu</b>. Nhật ký tự ghi ô nào đổi từ bao nhiêu sang bao nhiêu."
                    ],
                    luuY: ["Kéo ô ở Chế độ test chỉ lưu trên trình duyệt máy đó — KHÔNG phải cách chốt tọa độ."],
                    checklist: ["Đã sửa Top / Left hoặc tọa độ ô", "Đã Lưu mẫu"]
                },
                {
                    ma: "B5", ten: "In thử lại & so sánh", view: "thuchienin", congCu: "dolech", kiemTra: "sosanh", doLechTu: "B3", canMau: true,
                    mucDich: "Xác nhận độ lệch đã hết sau khi chỉnh.",
                    cachLam: [
                        "Tắt giá trị test, in lại giấy trắng cùng cài đặt như Bước 3.",
                        "Đo và nhập độ lệch còn lại — kiểm tra tự động so với lần đo ở Bước 3."
                    ],
                    luuY: ["Còn lệch trên 0,5 mm → bấm <b>Mở lại</b> Bước 4 để chỉnh tiếp."],
                    checklist: ["Lệch còn ≤ 0,5 mm"]
                },
                {
                    ma: "B6", ten: "Áp dụng & nghiệm thu", view: "thuchienin", kiemTra: "nghiemthu", canMau: true, ketThuc: true,
                    mucDich: "Đảm bảo mọi máy in dùng tọa độ mới.",
                    cachLam: [
                        "Trên <b>mọi máy</b> từng kéo ô ở Chế độ test: Reset tọa độ (hoặc mở trang này ở máy đó, Bước 2 → Xóa).",
                        "Báo người in dùng mẫu đã chỉnh; in 1 tờ trên phôi thật."
                    ],
                    checklist: ["Đã xóa tọa độ test trên mọi máy từng kéo ô", "Đã báo người in", "In 1 tờ phôi thật đạt"]
                }
            ]
        }
    ],

    HIEN_TUONG: [
        { ma: "deu", ten: "Lệch đều cả tờ", goiY: "Thường chỉ cần chỉnh Top / Left (Bước 4)." },
        { ma: "rieng", ten: "Lệch một vài ô", goiY: "Chỉnh tọa độ từng ô (Bước 4)." },
        { ma: "font", ten: "Sai font / cỡ chữ", goiY: "Bước 4: đổi Font / Cỡ chữ ở khối Tùy chọn khổ giấy, hoặc Font size của ô." },
        { ma: "noidung", ten: "Sai / thiếu nội dung", goiY: "Xem kiểm tra biểu thức ở Bước 4, hoặc dữ liệu văn bằng." },
        { ma: "mayin", ten: "Chỉ 1 máy in lệch", goiY: "Bước 2: kiểm tra tọa độ test & cài đặt máy in — thường KHÔNG cần sửa mẫu." },
        { ma: "khac", ten: "Khác", goiY: "Mô tả ở Ghi chú." }
    ],

    F: null,
    qt: null,
    strMau_Id: "",
    mau: null,
    dtMau: [],
    dtChiTiet: [],
    chiTietTT: "",          // "" | dang | ok | loi
    chiTietLoi: "",
    dsBanChinh: null,
    dsBanSao: null,
    tnTT: "",
    tnLoi: "",
    phienId: "",
    phienInfo: null,        // { luc, nguoi, ma }
    dsPhien: [],
    trangThai: {},          // { A1: { tt: xong|boqua|"", luc, nguoi, duLieu, chuaLuu } }
    form: {},               // nháp đang nhập theo bước
    buocXem: "",
    nkServer: [],
    nkPhien: [],
    nkMo: {},
    locNK: "phien",
    tuKhoaNK: "",
    xacNhan: null,          // { buoc, loai }
    thongBao: null,         // { buoc, lv, text }
    pref: null,

    /*------------------------------------------
    --[0] Khởi tạo
    -------------------------------------------*/
    init: function () {
        var me = this;
        me.F = window.PhoiInFlow;
        if (!me.F) {
            $("#qtpWrap").html('<div class="qtp-card" style="padding:20px">Thiếu file <code>modules/danhmuc/script/phoiinflow.js</code> — copy file này cùng thư mục với quytrinhphoiin.js.</div>');
            return;
        }
        me.docPref();
        // Quay về từ màn khác (nút "Về quy trình"): lấy lại quy trình / mẫu / phiên / bước đang làm, rồi bỏ ngữ cảnh
        var ctx = me.F.getCtx();
        if (ctx && ctx.quyTrinh) {
            me.pref.qt = ctx.quyTrinh;
            if (ctx.mauId) me.pref.mau = ctx.mauId;
            if (ctx.phienId) me.pref.phien[ctx.quyTrinh] = ctx.phienId;
            if (ctx.buoc) me.pref.buoc[ctx.quyTrinh] = ctx.buoc;
            me.luuPref();
        }
        me.F.clearCtx();
        me.F.nhatKy.boNghe();
        me.F.nhatKy.nghe(function (st) { me.veTrangThaiApi(st); me.veBannerNK(); });
        me.bindEvents();
        me.veTrangThaiApi(me.F.nhatKy.trangThai());
        if (me.pref.qt && me.timQT(me.pref.qt)) me.chonQuyTrinh(me.pref.qt);
        else me.veTatCa();
        me.getList_Mau();
    },

    bindEvents: function () {
        var me = this;
        var $w = $("#qtpWrap");
        $w.off(".qtp");
        $w.on("click.qtp", "[data-qt]", function () { me.chonQuyTrinh($(this).attr("data-qt")); });
        $w.on("click.qtp", "[data-buoc]", function () { me.xemBuoc($(this).attr("data-buoc")); });
        $w.on("click.qtp", "[data-go]", function (e) { e.preventDefault(); me.xemBuoc($(this).attr("data-go")); });
        $w.on("click.qtp", "[data-act]", function (e) {
            e.preventDefault();
            var act = $(this).attr("data-act"), arg = $(this).attr("data-arg");
            if (typeof me["act_" + act] === "function") me["act_" + act](arg, this);
        });
        $w.on("click.qtp", "[data-loc]", function () {
            me.locNK = $(this).attr("data-loc");
            $("#qtpNKLoc [data-loc]").removeClass("on");
            $(this).addClass("on");
            me.taiNhatKy();
        });
        $w.on("input.qtp change.qtp", "[data-f]", function () {
            me.datForm(me.buocXem, $(this).attr("data-f"), this.type === "checkbox" ? this.checked : this.value);
            me.capNhatTrucTiep(this);
        });
        $w.on("change.qtp", "[data-radio]", function () {
            me.datForm(me.buocXem, $(this).attr("data-radio"), this.value);
            me.veChiTiet();
        });
        $w.on("change.qtp", "[data-ck]", function () {
            var f = me.layForm(me.buocXem);
            f.ck = f.ck || {};
            f.ck[$(this).attr("data-ck")] = this.checked;
            me.luuDraft();
            $(this).closest("label").toggleClass("on", this.checked);
            me.xacNhan = null;
            $("#qtpConfirmBar").html("");
        });
        $w.on("input.qtp", "[data-conv]", function () { me.capNhatQuyDoi(); });
        $w.on("keyup.qtp", "#qtpNKTuKhoa", function () {
            me.tuKhoaNK = $(this).val();
            me.veNhatKy();
        });
        $w.on("change.qtp", "#qtpPhienSel", function () {
            var id = $(this).val();
            if (id && id !== me.phienId) me.chuyenPhien(id);
        });
        $("#qtpBtnLamMoi").off("click").on("click", function () { me.act_lamMoi(); });
        $("#dropMau_QTP").off("select2:select.qtp change.qtp").on("select2:select.qtp", function () {
            var id = $(this).val() || "";
            if (id !== me.strMau_Id) me.chonMau(id);
        });
    },

    /*------------------------------------------
    --[1] Tùy chọn người dùng (localStorage — chỉ là tiện ích nhớ lựa chọn, KHÔNG phải nhật ký)
    -------------------------------------------*/
    khoaUser: function () { return (edu && edu.system && edu.system.userId) || "anon"; },
    docPref: function () {
        var me = this, p = null;
        try { p = JSON.parse(localStorage.getItem("PHOIIN_QT_PREF_" + me.khoaUser()) || "null"); } catch (e) { p = null; }
        me.pref = p && typeof p === "object" ? p : {};
        me.pref.phien = me.pref.phien || {};
        me.pref.buoc = me.pref.buoc || {};
    },
    luuPref: function () {
        var me = this;
        try { localStorage.setItem("PHOIIN_QT_PREF_" + me.khoaUser(), JSON.stringify(me.pref)); } catch (e) { }
    },
    khoaDraft: function () {
        var me = this;
        return "PHOIIN_QT_DRAFT_" + me.khoaUser() + "_" + (me.phienId || ("MOI_" + (me.qt ? me.qt.ma : "")));
    },
    docDraft: function () {
        var me = this, d = null;
        try { d = JSON.parse(localStorage.getItem(me.khoaDraft()) || "null"); } catch (e) { d = null; }
        return d && typeof d === "object" ? d : {};
    },
    luuDraft: function () {
        var me = this;
        try { localStorage.setItem(me.khoaDraft(), JSON.stringify(me.form)); } catch (e) { }
    },
    xoaDraft: function () {
        var me = this;
        try { localStorage.removeItem(me.khoaDraft()); } catch (e) { }
    },
    layForm: function (buoc) {
        var me = this;
        if (!me.form[buoc]) me.form[buoc] = {};
        return me.form[buoc];
    },
    datForm: function (buoc, path, val) {
        var me = this, f = me.layForm(buoc), p = String(path).split("."), o = f, i;
        for (i = 0; i < p.length - 1; i++) { if (!o[p[i]] || typeof o[p[i]] !== "object") o[p[i]] = {}; o = o[p[i]]; }
        o[p[p.length - 1]] = val;
        me.luuDraft();
    },
    docForm: function (buoc, path) {
        var me = this, o = me.form[buoc], p = String(path).split("."), i;
        for (i = 0; i < p.length; i++) { if (!o) return ""; o = o[p[i]]; }
        return o === undefined || o === null ? "" : o;
    },

    /*------------------------------------------
    --[2] Tiện ích
    -------------------------------------------*/
    esc: function (v) { return this.F.util.esc(v); },
    so: function (v) {
        if (v === null || v === undefined || v === "") return NaN;
        return parseFloat(String(v).replace(",", "."));
    },
    fmt: function (n, d) {
        if (isNaN(n)) return "";
        var k = Math.pow(10, d === undefined ? 1 : d);
        return String(Math.round(n * k) / k).replace(".", ",").replace("-", "−");
    },
    fmtDau: function (n, d) { return isNaN(n) ? "" : (n > 0 ? "+" : "") + this.fmt(n, d); },
    timQT: function (ma) {
        var arr = this.QUY_TRINH, i;
        for (i = 0; i < arr.length; i++) if (arr[i].ma === ma) return arr[i];
        return null;
    },
    timBuoc: function (ma) {
        var me = this, i;
        if (!me.qt) return null;
        for (i = 0; i < me.qt.buoc.length; i++) if (me.qt.buoc[i].ma === ma) return me.qt.buoc[i];
        return null;
    },
    viTriBuoc: function (ma) {
        var me = this, i;
        if (!me.qt) return -1;
        for (i = 0; i < me.qt.buoc.length; i++) if (me.qt.buoc[i].ma === ma) return i;
        return -1;
    },
    ttBuoc: function (ma) { var t = this.trangThai[ma]; return t ? t.tt : ""; },
    buocGoiY: function () {
        var me = this, i;
        if (!me.qt) return "";
        for (i = 0; i < me.qt.buoc.length; i++) {
            var t = me.ttBuoc(me.qt.buoc[i].ma);
            if (t !== "xong" && t !== "boqua") return me.qt.buoc[i].ma;
        }
        return "";
    },
    soBuocXong: function () {
        var me = this, n = 0;
        if (!me.qt) return 0;
        me.qt.buoc.forEach(function (b) { var t = me.ttBuoc(b.ma); if (t === "xong" || t === "boqua") n++; });
        return n;
    },
    idsChiTiet: function () { return (this.dtChiTiet || []).map(function (x) { return x.ID; }); },

    /*------------------------------------------
    --[3] Dữ liệu: mẫu phôi, ô nội dung, danh sách in bên Tốt nghiệp
    --  Cùng API màn Mẫu phôi in (CMS_MauPhoiIn*) và màn Thực hiện in (TN_PhoiIn/LayDS_MauPhoiIn_*)
    -------------------------------------------*/
    getList_Mau: function () {
        var me = this;
        me.F.callApi({ type: "GET", action: "CMS_MauPhoiIn/LayDanhSach", data: { action: "CMS_MauPhoiIn/LayDanhSach", strId: "" } }).then(function (r) {
            if (!r.ok) {
                me.thongBao = { buoc: "", lv: "err", text: "Không tải được danh sách mẫu phôi (CMS_MauPhoiIn/LayDanhSach): " + me.esc(r.message) };
                me.veTatCa();
                return;
            }
            me.dtMau = (r.data && r.data.Data) || [];
            edu.system.loadToCombo_data({
                data: me.dtMau,
                renderInfor: { id: "ID", parentId: "", name: "MAPHOI" },
                renderPlace: ["dropMau_QTP"],
                title: "Chọn mẫu phôi"
            });
            var id = me.pref.mau && me.dtMau.some(function (x) { return x.ID === me.pref.mau; }) ? me.pref.mau : "";
            if (id) {
                $("#dropMau_QTP").val(id).trigger("change");
                if (id !== me.strMau_Id || !me.mau) me.chonMau(id, true);
            } else {
                if (me.strMau_Id) {
                    $("#dropMau_QTP").val(me.strMau_Id).trigger("change");
                    me.mau = me.timMau(me.strMau_Id);
                }
                me.veTatCa();
            }
        });
    },
    timMau: function (id) {
        var arr = this.dtMau || [], i;
        for (i = 0; i < arr.length; i++) if (arr[i].ID === id) return arr[i];
        return null;
    },
    chonMau: function (id, giuLoc) {
        var me = this;
        me.strMau_Id = id || "";
        me.mau = me.timMau(me.strMau_Id);
        me.pref.mau = me.strMau_Id;
        me.luuPref();
        me.dtChiTiet = [];
        me.chiTietTT = me.strMau_Id ? "dang" : "";
        me.chiTietLoi = "";
        me.dsBanChinh = null;
        me.dsBanSao = null;
        me.tnTT = me.strMau_Id ? "dang" : "";
        me.tnLoi = "";
        me.thongBao = null;
        me.veTatCa();
        if (!me.strMau_Id) return;
        me.getList_ChiTiet(me.strMau_Id);
        me.getList_TN();
        if (me.locNK === "mau" && !giuLoc) me.taiNhatKy();
    },
    getList_ChiTiet: function (id) {
        var me = this;
        me.F.callApi({ type: "GET", action: "CMS_MauPhoiIn_ChiTiet/LayDanhSach", data: { action: "CMS_MauPhoiIn_ChiTiet/LayDanhSach", strId: id } }).then(function (r) {
            if (id !== me.strMau_Id) return;
            if (r.ok) {
                me.dtChiTiet = (r.data && r.data.Data) || [];
                me.chiTietTT = "ok";
            } else {
                me.chiTietTT = "loi";
                me.chiTietLoi = r.message;
            }
            me.veMauInfo();
            me.veChiTiet();
        });
    },
    getList_TN: function () {
        var me = this, id = me.strMau_Id;
        var lay = function (action) {
            return me.F.callApi({ type: "GET", action: action, data: { action: action, strId: "" } });
        };
        Promise.all([lay("TN_PhoiIn/LayDS_MauPhoiIn_BanChinh"), lay("TN_PhoiIn/LayDS_MauPhoiIn_BanSao")]).then(function (rs) {
            if (id !== me.strMau_Id) return;
            var loi = [];
            me.dsBanChinh = rs[0].ok ? ((rs[0].data && rs[0].data.Data) || []).map(function (x) { return x.ID; }) : null;
            me.dsBanSao = rs[1].ok ? ((rs[1].data && rs[1].data.Data) || []).map(function (x) { return x.ID; }) : null;
            if (!rs[0].ok) loi.push("bản chính: " + rs[0].message);
            if (!rs[1].ok) loi.push("bản sao: " + rs[1].message);
            me.tnTT = loi.length === 2 ? "loi" : "ok";
            me.tnLoi = loi.join(" · ");
            me.veChiTiet();
        });
    },

    /*------------------------------------------
    --[4] Quy trình, phiên, trạng thái bước
    -------------------------------------------*/
    chonQuyTrinh: function (ma) {
        var me = this, q = me.timQT(ma);
        if (!q) return;
        me.qt = q;
        me.pref.qt = ma;
        me.luuPref();
        me.phienId = me.pref.phien[ma] || "";
        me.phienInfo = null;
        me.trangThai = {};
        me.nkPhien = [];
        me.nkServer = [];
        me.xacNhan = null;
        me.thongBao = null;
        me.form = me.docDraft();
        me.buocXem = me.pref.buoc[ma] && me.timBuoc(me.pref.buoc[ma]) ? me.pref.buoc[ma] : q.buoc[0].ma;
        me.veTatCa();
        me.taiPhien();
        me.taiDSPhien();
    },
    xemBuoc: function (ma) {
        var me = this;
        if (!me.timBuoc(ma)) return;
        me.buocXem = ma;
        me.xacNhan = null;
        if (me.thongBao && me.thongBao.buoc !== ma) me.thongBao = null;
        me.pref.buoc[me.qt.ma] = ma;
        me.luuPref();
        me.veBuoc();
        me.veChiTiet();
        var el = document.getElementById("qtpDetail");
        if (el && window.innerWidth < 1200 && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    // Dựng trạng thái bước từ nhật ký của phiên (cũ -> mới)
    dungTrangThai: function (rows) {
        var me = this, st = {}, info = null;
        rows.slice().sort(function (a, b) { return a.luc - b.luc; }).forEach(function (r) {
            if (r.hanhDong === "BAT_DAU_PHIEN" && !info) info = { luc: r.luc, nguoi: r.nguoiTao };
            if (!r.buoc) return;
            var s = st[r.buoc] || (st[r.buoc] = { tt: "" });
            if (r.hanhDong === "HOAN_THANH") { s.tt = "xong"; s.luc = r.luc; s.nguoi = r.nguoiTao; s.duLieu = r.duLieu; }
            else if (r.hanhDong === "BO_QUA") { s.tt = "boqua"; s.luc = r.luc; s.nguoi = r.nguoiTao; s.duLieu = r.duLieu; }
            else if (r.hanhDong === "MO_LAI") { s.tt = ""; s.luc = r.luc; s.nguoi = r.nguoiTao; }
        });
        return { st: st, info: info };
    },
    taiPhien: function () {
        var me = this, id = me.phienId;
        if (!id) { me.taiNhatKy(); return; }
        me.F.nhatKy.layDS({ phienId: id }).then(function (r) {
            if (id !== me.phienId) return;
            if (r.ok) {
                var d = me.dungTrangThai(r.rows);
                me.trangThai = d.st;
                me.phienInfo = d.info;
                if (me.locNK === "phien") {
                    me.nkServer = r.rows;
                    me.nkPhien = me.nkPhien.filter(function (x) { return x.trangThaiGhi !== "ok"; });
                }
            }
            me.veTatCa();
            if (me.locNK !== "phien") me.taiNhatKy();
        });
    },
    taiDSPhien: function () {
        var me = this, q = me.qt;
        if (!q) return;
        me.F.nhatKy.layDS({ maQuyTrinh: q.ma, hanhDong: "BAT_DAU_PHIEN", pageSize: 30 }).then(function (r) {
            if (q !== me.qt) return;
            me.dsPhien = r.ok ? r.rows : [];
            me.vePhien();
        });
    },
    // Bắt đầu phiên nếu chưa có (lần thao tác đầu tiên tự bắt đầu)
    damBaoPhien: function () {
        var me = this;
        if (me.phienId) return Promise.resolve();
        var cuDraft = me.khoaDraft();
        me.phienId = me.F.util.guid();
        me.phienInfo = { luc: Date.now(), nguoi: "Bạn" };
        me.pref.phien[me.qt.ma] = me.phienId;
        me.luuPref();
        try { localStorage.removeItem(cuDraft); } catch (e) { }
        me.luuDraft();
        me.vePhien();
        return me._ghi("BAT_DAU_PHIEN", "", "Bắt đầu phiên «" + me.qt.ten + "»" + (me.mau ? " với mẫu " + me.mau.MAPHOI : ""), { quyTrinh: me.qt.ma });
    },
    chuyenPhien: function (id) {
        var me = this;
        me.phienId = id;
        me.pref.phien[me.qt.ma] = id;
        me.luuPref();
        me.trangThai = {};
        me.phienInfo = null;
        me.nkPhien = [];
        me.form = me.docDraft();
        me.xacNhan = null;
        me.veTatCa();
        me.taiPhien();
    },
    ghiNhatKy: function (hanhDong, buoc, noiDung, duLieu) {
        var me = this;
        return me.damBaoPhien().then(function () { return me._ghi(hanhDong, buoc, noiDung, duLieu); });
    },
    _ghi: function (hanhDong, buoc, noiDung, duLieu) {
        var me = this;
        var e = {
            id: "", maQuyTrinh: me.qt ? me.qt.ma : "", phienId: me.phienId, doiTuongId: me.strMau_Id,
            doiTuongMa: me.mau ? me.mau.MAPHOI : "", buoc: buoc || "", hanhDong: hanhDong, noiDung: noiDung, duLieu: duLieu || null,
            nguoiTao: "Bạn", luc: Date.now(), trangThaiGhi: "dang", loi: "", key: "s" + Date.now() + Math.random()
        };
        me.nkPhien.push(e);
        me.veNhatKy();
        return me.F.nhatKy.ghi(e).then(function (r) {
            e.trangThaiGhi = r.ok ? "ok" : "loi";
            e.loi = r.ok ? "" : r.message;
            if (r.id) e.id = r.id;
            me.veNhatKy();
            return r;
        });
    },

    /*------------------------------------------
    --[5] Hành động (data-act)
    -------------------------------------------*/
    act_lamMoi: function () {
        var me = this;
        me.F.datLaiVaiTroKhac();     // quản trị vừa gán quyền / lần trước lỗi: tìm lại màn hình ở các vai trò khác
        if ($("#qtpViewBox").length) me.veChiTiet();
        me.getList_Mau();
        if (me.strMau_Id) { me.chiTietTT = "dang"; me.tnTT = "dang"; me.getList_ChiTiet(me.strMau_Id); me.getList_TN(); }
        if (me.qt) { me.taiPhien(); me.taiDSPhien(); } else me.taiNhatKy();
    },
    act_truoc: function () {
        var me = this, i = me.viTriBuoc(me.buocXem);
        if (i > 0) me.xemBuoc(me.qt.buoc[i - 1].ma);
    },
    act_sau: function () {
        var me = this, i = me.viTriBuoc(me.buocXem);
        if (i >= 0 && i < me.qt.buoc.length - 1) me.xemBuoc(me.qt.buoc[i + 1].ma);
    },
    act_kiemTraLai: function () {
        var me = this;
        if (!me.strMau_Id) { me.veChiTiet(); return; }
        me.chiTietTT = "dang";
        me.tnTT = "dang";
        me.veChiTiet();
        // nạp lại mẫu (Top/Left/Font vừa sửa) rồi tới ô nội dung + danh sách in
        me.F.callApi({ type: "GET", action: "CMS_MauPhoiIn/LayDanhSach", data: { action: "CMS_MauPhoiIn/LayDanhSach", strId: "" } }).then(function (r) {
            if (r.ok) { me.dtMau = (r.data && r.data.Data) || me.dtMau; me.mau = me.timMau(me.strMau_Id); }
            me.veMauInfo();
            me.getList_ChiTiet(me.strMau_Id);
            me.getList_TN();
        });
    },
    act_moView: function () {
        var me = this, b = me.timBuoc(me.buocXem);
        if (!b || !b.view) return;
        if (b.canMau && !me.strMau_Id) {
            me.baoLoi(b.ma, "warn", "Chọn mẫu phôi ở ô <b>Mẫu phôi</b> phía trên trước khi mở màn hình.");
            return;
        }
        var t = me.F.timManHinh(b.view);
        if (!t) return;
        // Không có ở vai trò đang đăng nhập -> dùng kết quả tìm ở vai trò khác (htmlManHinh đã chạy tìm)
        var k = t.chucNang ? null : me.F.ketQuaVaiTroKhac(b.view);
        if (!t.chucNang && !(k && k.trangThai === "co")) {
            me.baoLoi(b.ma, "err", me.esc(k && k.message ? k.message
                : (k && k.trangThai === "dang" ? "Đang tìm «" + t.manHinh.ten + "» ở các vai trò khác của bạn — thử lại sau giây lát." : me.F.moManHinh(b.view).message)));
            return;
        }
        var cn = t.chucNang || k.chucNang;
        var qtMh = me.F.timManHinh("quytrinhphoiin");
        var i = me.viTriBuoc(b.ma);
        var ctx = {
            quyTrinh: me.qt.ma, tenQuyTrinh: me.qt.ten, buoc: b.ma, tenBuoc: b.ten, thuTu: i + 1, tong: me.qt.buoc.length,
            phienId: "", mauId: me.strMau_Id, maPhoi: me.mau ? me.mau.MAPHOI : "",
            // để nút "Về quy trình" ở màn đích đổi lại đúng vai trò này khi màn đích nằm ở vai trò khác
            veVaiTroId: (edu.system && edu.system.appId) || "",
            veVaiTroTen: me.F.tenVaiTroHienTai(),
            veChucNangId: (qtMh && qtMh.chucNang && qtMh.chucNang.ID) || (edu.system && edu.system.strChucNang_Id) || ""
        };
        var di = false;
        var chuyen = function () {
            if (di) return;
            di = true;
            ctx.phienId = me.phienId;
            var r = me.F.moManHinh(b.view, ctx);
            if (!r.ok) me.baoLoi(b.ma, "err", me.esc(r.message));
        };
        var duLieu = { manHinh: t.manHinh.ten, duongDan: cn.DUONGDANFILE, chucNang_Id: cn.ID, menu: t.chucNang ? t.duongMenu : k.duongMenu };
        var noiDung = "Mở màn hình «" + t.manHinh.ten + "» từ Bước " + b.ma + " – " + b.ten;
        if (!t.chucNang) {
            duLieu.doiVaiTro = { tu: ctx.veVaiTroTen, sang: me.F.util.s(k.vaiTro.TENVAITRO), sangId: k.vaiTro.ID };
            noiDung += " (chuyển vai trò " + (ctx.veVaiTroTen ? "«" + ctx.veVaiTroTen + "» " : "") + "→ «" + me.F.util.s(k.vaiTro.TENVAITRO) + "»)";
        }
        me.ghiNhatKy("MO_MAN_HINH", b.ma, noiDung, duLieu).then(chuyen);
        setTimeout(chuyen, 900);   // máy chủ chậm / API nhật ký chưa có: không bắt người dùng chờ
    },
    act_hoanThanh: function (arg) {
        var me = this, b = me.timBuoc(me.buocXem);
        if (!b) return;
        if (b.canMau && !me.strMau_Id) { me.baoLoi(b.ma, "warn", "Chưa chọn mẫu phôi."); return; }
        var f = me.layForm(b.ma), thieu = [];
        (b.checklist || []).forEach(function (c, i) { if (!(f.ck && f.ck[i])) thieu.push(c); });
        if ((b.congCu === "dolech") && (isNaN(me.so(me.docForm(b.ma, "doLech.ngang"))) && isNaN(me.so(me.docForm(b.ma, "doLech.doc"))))) {
            thieu.push("Chưa nhập độ lệch đo được");
        }
        if (thieu.length && arg !== "force") {
            me.xacNhan = { buoc: b.ma, loai: "thieu", ds: thieu };
            me.veXacNhan();
            return;
        }
        var duLieu = me.duLieuBuoc(b);
        me.trangThai[b.ma] = { tt: "xong", luc: Date.now(), nguoi: "Bạn", duLieu: duLieu, chuaLuu: true };
        me.xacNhan = null;
        me.thongBao = null;
        var st = me.trangThai[b.ma];
        var p = me.ghiNhatKy("HOAN_THANH", b.ma, me.tomTat("Hoàn thành", b, duLieu), duLieu).then(function (r) {
            st.chuaLuu = !r.ok;
            me.veBuoc();
            me.veChiTiet();
        });
        if (b.ketThuc) {
            p.then(function () {
                var con = me.qt.buoc.filter(function (x) { var t = me.ttBuoc(x.ma); return t !== "xong" && t !== "boqua"; });
                me._ghi("KET_THUC_PHIEN", "", "Kết thúc phiên «" + me.qt.ten + "»" + (me.mau ? " — mẫu " + me.mau.MAPHOI : "")
                    + (con.length ? " (còn " + con.length + " bước chưa làm: " + con.map(function (x) { return x.ma; }).join(", ") + ")" : ""),
                    { conLai: con.map(function (x) { return x.ma; }) });
            });
        }
        var goiY = me.buocGoiY();
        if (goiY && goiY !== b.ma && !b.ketThuc) me.buocXem = goiY;
        me.pref.buoc[me.qt.ma] = me.buocXem;
        me.luuPref();
        me.veTatCa();
    },
    act_boQua: function (arg) {
        var me = this, b = me.timBuoc(me.buocXem);
        if (!b) return;
        var ghiChu = $.trim(me.docForm(b.ma, "ghiChu"));
        if (!ghiChu) {
            me.xacNhan = { buoc: b.ma, loai: "boqua" };
            me.veXacNhan();
            $("#qtpGhiChu").focus();
            return;
        }
        var duLieu = me.duLieuBuoc(b);
        me.trangThai[b.ma] = { tt: "boqua", luc: Date.now(), nguoi: "Bạn", duLieu: duLieu, chuaLuu: true };
        var st = me.trangThai[b.ma];
        me.xacNhan = null;
        me.ghiNhatKy("BO_QUA", b.ma, "Bỏ qua Bước " + b.ma + " – " + b.ten + ". Lý do: " + ghiChu, duLieu).then(function (r) {
            st.chuaLuu = !r.ok;
            me.veBuoc();
            me.veChiTiet();
        });
        var goiY = me.buocGoiY();
        if (goiY) me.buocXem = goiY;
        me.veTatCa();
    },
    act_moLai: function () {
        var me = this, b = me.timBuoc(me.buocXem);
        if (!b) return;
        me.trangThai[b.ma] = { tt: "", luc: Date.now(), nguoi: "Bạn" };
        me.ghiNhatKy("MO_LAI", b.ma, "Mở lại Bước " + b.ma + " – " + b.ten, null);
        me.veTatCa();
    },
    act_luuGhiChu: function () {
        var me = this, b = me.timBuoc(me.buocXem);
        if (!b) return;
        var g = $.trim(me.docForm(b.ma, "ghiChu"));
        if (!g) { me.baoLoi(b.ma, "warn", "Ghi chú đang trống."); return; }
        me.ghiNhatKy("GHI_CHU", b.ma, "Ghi chú Bước " + b.ma + ": " + g, me.duLieuBuoc(b));
        me.baoLoi(b.ma, "ok", "Đã gửi ghi chú vào nhật ký.");
    },
    act_huyXacNhan: function () {
        this.xacNhan = null;
        $("#qtpConfirmBar").html("");
        this.vePhien();
    },
    act_phienMoi: function () {
        this.xacNhan = { buoc: "", loai: "phienmoi" };
        this.vePhien();
    },
    act_phienMoiOk: function () {
        var me = this;
        me.xacNhan = null;
        me.phienId = "";
        me.phienInfo = null;
        me.pref.phien[me.qt.ma] = "";
        me.luuPref();
        me.trangThai = {};
        me.form = {};
        me.xoaDraft();
        me.nkPhien = [];
        me.nkServer = [];
        me.buocXem = me.qt.buoc[0].ma;
        me.pref.buoc[me.qt.ma] = me.buocXem;
        me.luuPref();
        me.veTatCa();
        me.damBaoPhien().then(function () { me.taiDSPhien(); });
    },
    act_xoaToaDoTest: function () {
        var me = this, ids = me.idsChiTiet();
        var n = me.F.xoaToaDoTest(ids);
        me.ghiNhatKy("XOA_TOADO_TEST", me.buocXem, "Xóa tọa độ test của " + n + " ô (mẫu " + (me.mau ? me.mau.MAPHOI : "") + ") trên máy này",
            { soO: n, mayTinh: navigator.userAgent });
        me.baoLoi(me.buocXem, "ok", "Đã xóa tọa độ test của " + n + " ô trên máy này (tài khoản đang đăng nhập).");
    },
    act_taiNhatKy: function () { this.taiNhatKy(); },
    act_nkct: function (key) {
        var me = this;
        me.nkMo[key] = !me.nkMo[key];
        $("#qtpNKList [data-key='" + key + "']").toggleClass("open", !!me.nkMo[key]);
    },
    baoLoi: function (buoc, lv, text) {
        this.thongBao = { buoc: buoc, lv: lv, text: text };
        this.veThongBao();
    },

    /*------------------------------------------
    --[6] Dữ liệu ghi nhật ký khi hoàn thành / bỏ qua
    -------------------------------------------*/
    duLieuBuoc: function (b) {
        var me = this, f = me.layForm(b.ma), d = {};
        if (b.checklist && b.checklist.length) d.checklist = b.checklist.map(function (c, i) { return { muc: c, ok: !!(f.ck && f.ck[i]) }; });
        if (f.doLech && (f.doLech.ngang !== undefined || f.doLech.doc !== undefined || f.doLech.rieng)) {
            d.doLech = { ngangMm: me.so(f.doLech.ngang), docMm: me.so(f.doLech.doc), rieng: f.doLech.rieng || "" };
        }
        if (f.hienTuong) d.hienTuong = f.hienTuong;
        if (f.anhChuan) d.anhChuan = f.anhChuan;
        if (f.ghiChu) d.ghiChu = f.ghiChu;
        var kt = me.kiemTra(b).filter(function (x) { return x.lv !== "wait"; });
        if (kt.length) d.kiemTra = kt.map(function (x) { return { muc: x.lv, noiDung: me.boHtml(x.text) }; });
        if (b.congCu === "dexuat") { var dx = me.tinhDeXuat(b); if (dx) d.deXuat = dx; }
        if (me.mau) d.mau = { id: me.mau.ID, ma: me.mau.MAPHOI, top: me.mau.MARGIN_TOP, left: me.mau.MARGIN_LEFT, font: me.mau.FONT, coChu: me.mau.DODAI };
        return d;
    },
    boHtml: function (h) { return $("<div>").html(h).text(); },
    tomTat: function (dongTu, b, d) {
        var me = this, p = [dongTu + " Bước " + b.ma + " – " + b.ten];
        if (d.doLech) {
            var t = [];
            if (!isNaN(d.doLech.ngangMm)) t.push("lệch ngang " + me.fmtDau(d.doLech.ngangMm) + " mm");
            if (!isNaN(d.doLech.docMm)) t.push("lệch dọc " + me.fmtDau(d.doLech.docMm) + " mm");
            if (d.doLech.rieng) t.push("ô lệch riêng: " + d.doLech.rieng);
            if (t.length) p.push(t.join(", "));
        }
        if (d.hienTuong && d.hienTuong.loai) {
            var ht = me.HIEN_TUONG.filter(function (x) { return x.ma === d.hienTuong.loai; })[0];
            p.push("hiện tượng: " + (ht ? ht.ten : d.hienTuong.loai) + (d.hienTuong.mayIn ? " · máy in " + d.hienTuong.mayIn : ""));
        }
        if (d.anhChuan) p.push("ảnh chuẩn " + d.anhChuan.ten + " " + d.anhChuan.w + "×" + d.anhChuan.h + " px (" + d.anhChuan.kho + " " + d.anhChuan.huong + ", từ ảnh gốc " + d.anhChuan.nguon.w + "×" + d.anhChuan.nguon.h + ")");
        if (d.checklist) p.push("checklist " + d.checklist.filter(function (x) { return x.ok; }).length + "/" + d.checklist.length);
        if (d.ghiChu) p.push("ghi chú: " + d.ghiChu);
        return p.join(" · ");
    },

    /*------------------------------------------
    --[7] Kiểm tra tự động (từ dữ liệu thật)
    --  mỗi dòng { lv: ok|warn|err|info|wait, text (HTML), nut: { act, nhan } }
    -------------------------------------------*/
    kiemTra: function (b) {
        var me = this, fn = me["kt_" + b.kiemTra];
        if (typeof fn !== "function") return [];
        try { return fn.call(me, b) || []; } catch (ex) { return [{ lv: "err", text: "Lỗi khi kiểm tra: " + me.esc(ex.message) }]; }
    },
    ktCanMau: function () {
        return this.mau ? null : [{ lv: "err", text: "Chưa chọn mẫu phôi ở ô <b>Mẫu phôi</b> phía trên." }];
    },
    ktAnh: function (m) {
        var me = this, F = me.F;
        if (!F.util.s(m.DUONGDANFILE)) return [{ lv: "err", text: "Mẫu chưa có ảnh scan làm nền." }];
        var d = F.docAnhNen(m.DUONGDANFILE);
        if (!d) return [{ lv: "warn", text: "Không đọc được kích thước từ tên file ảnh (<code>" + me.esc(m.DUONGDANFILE) + "</code>) — màn thiết kế sẽ không có ảnh nền đúng khổ." }];
        var k = F.khoGiay(d.w, d.h);
        var txt = "Ảnh " + d.w + " × " + d.h + " px = " + me.fmt(k.wmm) + " × " + me.fmt(k.hmm) + " mm";
        if (k.kho) return [{ lv: "ok", text: txt + " → khớp <b>" + k.kho.ten + " " + k.kho.huong + "</b>." }];
        // quy trình có bước chỉnh ảnh -> nút mở ngay ảnh nền này trong công cụ
        var nut = me.qt && me.qt.buoc.some(function (x) { return x.congCu === "anh"; }) ? { act: "anhTuMau", nhan: '<i class="fa fa-picture-o"></i> Chỉnh ảnh này' } : null;
        if (k.dpiNghi) {
            return [{
                lv: "err", text: txt + " — không khớp khổ nào. Có vẻ ảnh scan " + k.dpiNghi + " DPI chưa thu về 96 DPI (thu nhỏ còn 1/"
                    + me.fmt(k.dpiNghi / 96, 2) + " sẽ khớp " + k.khoNeuThuNho.ten + " " + k.khoNeuThuNho.huong + "). Chỉnh ảnh ở Bước 1 rồi tạo lại mẫu với ảnh đúng kích thước.",
                nut: nut
            }];
        }
        return [{ lv: "warn", text: txt + " — không khớp khổ chuẩn nào (A3 / A4 / A5 / B5 / Letter). Kiểm tra lại ảnh nếu phôi là khổ chuẩn.", nut: nut }];
    },
    kt_anh: function () {
        var me = this;
        if (!me.mau) return [{ lv: "info", text: "Chưa chọn mẫu — tạo mẫu ở Bước 2 rồi chọn ở ô <b>Mẫu phôi</b> để kiểm tra kích thước ảnh." }];
        return me.ktAnh(me.mau);
    },
    kt_mau: function () {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        return [{ lv: "ok", text: "Đã chọn mẫu <b>" + me.esc(me.mau.MAPHOI) + "</b> · " + me.esc(me.mau.SOTRANG || 1) + " trang." }].concat(me.ktAnh(me.mau));
    },
    kt_chung: function () {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        var m = me.mau, out = [], s = me.F.util.s;
        out.push(s(m.FONT) ? { lv: "ok", text: "Font: <b>" + me.esc(m.FONT) + "</b>" } : { lv: "warn", text: "Chưa chọn font — màn in dùng font mặc định của trình duyệt." });
        out.push(s(m.DODAI) ? { lv: "ok", text: "Cỡ chữ mặc định: <b>" + me.esc(m.DODAI) + " px</b>" } : { lv: "warn", text: "Chưa có cỡ chữ mặc định." });
        var dpi = me.so(m.DORONG);
        if (isNaN(dpi) || dpi === 96) out.push({ lv: "ok", text: "DPI: 96 (chuẩn)." });
        else out.push({ lv: "warn", text: "DPI đang là <b>" + me.esc(m.DORONG) + "</b>: màn thiết kế phóng ảnh nền theo " + me.esc(m.DORONG) + "/96 nhưng màn in thì không → vị trí thấy trên màn thiết kế lệch so với bản in." });
        var top = s(m.MARGIN_TOP), left = s(m.MARGIN_LEFT);
        if (!me.so(top) && me.so(left)) out.push({ lv: "warn", text: "Đang có Left = " + me.esc(left) + " px nhưng Top trống/0 → khi in Left bị bỏ qua (màn in chỉ áp lề khi có Top). Đặt Top = 1 px nếu chỉ cần chỉnh Left." });
        else if (top || left) out.push({ lv: "info", text: "Lề bù: Top <b>" + me.esc(top || 0) + " px</b>, Left <b>" + me.esc(left || 0) + " px</b>." });
        else out.push({ lv: "info", text: "Chưa đặt lề bù Top / Left — bình thường ở lần đầu." });
        return out;
    },
    kt_noidung: function () {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        if (me.chiTietTT === "dang") return [{ lv: "wait", text: "Đang tải các ô nội dung…" }];
        if (me.chiTietTT === "loi") return [{ lv: "err", text: "Không tải được ô nội dung: " + me.esc(me.chiTietLoi) }];
        var ds = me.dtChiTiet || [], s = me.F.util.s;
        if (!ds.length) return [{ lv: "err", text: "Mẫu chưa có ô nội dung nào." }];
        var dim = me.F.docAnhNen(me.mau.DUONGDANFILE), soTrang = parseInt(me.mau.SOTRANG, 10) || 1;
        var trang = {}, trung = {}, loi = [];
        ds.forEach(function (o, i) {
            var nd = s(o.NOIDUNG), ten = "Ô (" + (i + 1) + ") <code>" + me.esc(nd.length > 60 ? nd.substring(0, 60) + "…" : nd) + "</code>";
            trang[s(o.TRANG) || "0"] = 1;
            var k = nd + "|" + s(o.LETRAI) + "|" + s(o.LETREN) + "|" + s(o.TRANG);
            trung[k] = (trung[k] || 0) + 1;
            if (!$.trim(nd)) { loi.push({ lv: "warn", text: "Ô (" + (i + 1) + ") không có nội dung." }); return; }
            if (/&(amp|lt|gt|quot|nbsp);/.test(nd)) loi.push({ lv: "err", text: ten + ": có ký tự bị mã hoá HTML (&amp;amp; &amp;lt; …) — sẽ lỗi khi in. Viết lại biểu thức không dùng &amp;&amp;, &lt;, &gt;." });
            else {
                try { new Function("aData", "me", nd); }
                catch (ex) { loi.push({ lv: "err", text: ten + ": sai cú pháp (" + me.esc(ex.message) + "). Chữ cố định phải đặt trong nháy đơn, VD <code>'Hà Nội'</code>." }); }
            }
            if (/^\s*[A-Za-z_$][\w$]*\s*;?\s*$/.test(nd) && !/^\s*(aData|me|true|false|null)\s*;?\s*$/.test(nd)) {
                loi.push({ lv: "warn", text: ten + ": có vẻ thiếu tiền tố <code>aData.</code> (VD <code>aData." + me.esc($.trim(nd).replace(";", "")) + "</code>) — để nguyên sẽ in ra trống." });
            }
            if (nd.indexOf("[x].") !== -1) loi.push({ lv: "warn", text: ten + ": dạng bảng <code>[x].</code> đang lỗi ở màn in." });
            var l = me.so(o.LETRAI), t = me.so(o.LETREN);
            if (dim && (l < 0 || t < 0 || l > dim.w || t > dim.h)) loi.push({ lv: "warn", text: ten + ": nằm ngoài khổ giấy (Trái " + me.esc(o.LETRAI) + ", Trên " + me.esc(o.LETREN) + " px; khổ " + dim.w + " × " + dim.h + " px)." });
            if ((parseInt(o.TRANG, 10) || 0) >= soTrang) loi.push({ lv: "warn", text: ten + ": thuộc trang " + ((parseInt(o.TRANG, 10) || 0) + 1) + " nhưng mẫu chỉ có " + soTrang + " trang." });
        });
        var soTrung = 0;
        Object.keys(trung).forEach(function (k) { if (trung[k] > 1) soTrung += trung[k] - 1; });
        var out = [{ lv: "ok", text: "Có <b>" + ds.length + "</b> ô nội dung trên " + Object.keys(trang).length + " trang." }];
        if (soTrung) out.push({ lv: "warn", text: "Có <b>" + soTrung + "</b> ô trùng (cùng nội dung, cùng vị trí) — thường do lỗi Lưu 2 lần trước đây; xóa bớt ở màn Mẫu phôi in." });
        if (!loi.length && !soTrung) out.push({ lv: "ok", text: "Biểu thức đúng cú pháp, nằm trong khổ giấy, không trùng lặp." });
        var max = 8;
        out = out.concat(loi.slice(0, max));
        if (loi.length > max) out.push({ lv: "info", text: "…và " + (loi.length - max) + " vấn đề khác." });
        return out;
    },
    kt_ganmau: function () {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        if (me.tnTT === "dang") return [{ lv: "wait", text: "Đang kiểm tra danh sách mẫu bên Tốt nghiệp…" }];
        var out = [], id = me.strMau_Id;
        var coChinh = me.dsBanChinh && me.dsBanChinh.indexOf(id) !== -1, coSao = me.dsBanSao && me.dsBanSao.indexOf(id) !== -1;
        if (me.dsBanChinh === null && me.dsBanSao === null) return [{ lv: "warn", text: "Không kiểm tra được (TN_PhoiIn/LayDS_MauPhoiIn_*): " + me.esc(me.tnLoi) }];
        if (coChinh) out.push({ lv: "ok", text: "Có trong danh sách mẫu <b>bản chính</b> — màn Thực hiện in chọn được." });
        if (coSao) out.push({ lv: "ok", text: "Có trong danh sách mẫu <b>bản sao</b>." });
        if (!coChinh && !coSao) out.push({ lv: "err", text: "Chưa có trong danh sách bản chính lẫn bản sao → màn Thực hiện in và Thông tin văn bằng KHÔNG chọn được mẫu này. Phân loại do máy chủ quyết định — liên hệ BE / quản trị." });
        if (me.tnLoi) out.push({ lv: "warn", text: "Một danh sách không tải được: " + me.esc(me.tnLoi) });
        return out;
    },
    ktToaDoTest: function () {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        if (me.chiTietTT === "dang") return [{ lv: "wait", text: "Đang tải các ô nội dung…" }];
        var ids = me.idsChiTiet(), r = me.F.demToaDoTest(ids), out = [];
        if (r.soO > 0) {
            out.push({
                lv: "warn", text: "Máy này (tài khoản đang đăng nhập) có <b>" + r.soO + "/" + ids.length + "</b> ô dùng tọa độ test — khi in, các ô này đặt theo tọa độ test chứ KHÔNG theo mẫu, kể cả khi đã tắt Chế độ test.",
                nut: { act: "xoaToaDoTest", nhan: "Xóa tọa độ test (máy này)" }
            });
        } else out.push({ lv: "ok", text: "Máy này không có tọa độ test cho mẫu — bản in theo đúng tọa độ mẫu." });
        if (r.cheDoTestBat) out.push({ lv: "info", text: "Chế độ test đang BẬT trên máy này" + (r.soGiaTriTest ? " và có " + r.soGiaTriTest + " giá trị test ghi đè nội dung" : "") + "." });
        return out;
    },
    kt_toadotest: function () { return this.ktToaDoTest(); },
    kt_intest: function () {
        var me = this, out = me.ktToaDoTest();
        if (me.mau && me.chiTietTT === "ok") out.push({ lv: "info", text: "Mẫu có " + me.dtChiTiet.length + " ô — tick \"Chỉ hiện ký hiệu\" sẽ in (1) … (" + me.dtChiTiet.length + ") để đối chiếu." });
        return out;
    },
    layDoLech: function (ma) {
        var me = this, f = me.form[ma] && me.form[ma].doLech, st = me.trangThai[ma];
        var ngang = f ? me.so(f.ngang) : NaN, doc = f ? me.so(f.doc) : NaN, rieng = f ? f.rieng : "", tu = "nháp";
        if (isNaN(ngang) && isNaN(doc) && st && st.duLieu && st.duLieu.doLech) {
            ngang = st.duLieu.doLech.ngangMm; doc = st.duLieu.doLech.docMm; rieng = st.duLieu.doLech.rieng; tu = "nhật ký";
            ngang = ngang === null ? NaN : ngang; doc = doc === null ? NaN : doc;
        }
        if (isNaN(ngang) && isNaN(doc) && !rieng) return null;
        return { ngang: ngang, doc: doc, rieng: rieng || "", tu: tu };
    },
    kt_dexuat: function (b) {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        var d = me.layDoLech(b.doLechTu);
        if (!d) return [{ lv: "info", text: "Chưa có số đo ở Bước " + b.doLechTu + ". <a class='qtp-link' data-go='" + b.doLechTu + "'>Đến Bước " + b.doLechTu + " →</a>" }];
        var out = [{ lv: "ok", text: "Số đo Bước " + b.doLechTu + " (" + d.tu + "): ngang " + (isNaN(d.ngang) ? "—" : me.fmtDau(d.ngang) + " mm") + ", dọc " + (isNaN(d.doc) ? "—" : me.fmtDau(d.doc) + " mm") + "." }];
        return out.concat(me.kt_chung().filter(function (x) { return x.lv === "warn"; }));
    },
    kt_nghiemthu: function (b) {
        var me = this, out = me.ktToaDoTest();
        var d = me.layDoLech(b.ma);
        if (d) {
            var maxL = Math.max(Math.abs(isNaN(d.ngang) ? 0 : d.ngang), Math.abs(isNaN(d.doc) ? 0 : d.doc));
            out.push(maxL <= 0.5 ? { lv: "ok", text: "Lần đo cuối lệch tối đa " + me.fmt(maxL) + " mm — đạt (≤ 0,5 mm)." }
                : { lv: "warn", text: "Lần đo cuối còn lệch " + me.fmt(maxL) + " mm — nên quay lại bước chỉnh tọa độ." });
        }
        return out;
    },
    kt_tongquan: function () {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        var out = [{ lv: "ok", text: "Mẫu <b>" + me.esc(me.mau.MAPHOI) + "</b>" + (me.mau.FONT ? " · font " + me.esc(me.mau.FONT) : "") + (me.mau.DODAI ? " " + me.esc(me.mau.DODAI) + " px" : "") + (me.chiTietTT === "ok" ? " · " + me.dtChiTiet.length + " ô" : "") + "." }];
        out = out.concat(me.ktAnh(me.mau));
        var r = me.F.demToaDoTest(me.idsChiTiet());
        if (r.soO) out.push({ lv: "warn", text: "Máy này đang có " + r.soO + " ô dùng tọa độ test — nghi ngờ nguyên nhân, xem Bước 2." });
        return out;
    },
    kt_sosanh: function (b) {
        var me = this, c = me.ktCanMau();
        if (c) return c;
        var truoc = me.layDoLech(b.doLechTu), sau = me.layDoLech(b.ma), out = [];
        if (!truoc) out.push({ lv: "info", text: "Chưa có số đo Bước " + b.doLechTu + " để so sánh." });
        if (!sau) { out.push({ lv: "info", text: "Nhập độ lệch đo được sau khi chỉnh ở ô bên dưới." }); return out; }
        var mx = function (d) { return Math.max(Math.abs(isNaN(d.ngang) ? 0 : d.ngang), Math.abs(isNaN(d.doc) ? 0 : d.doc)); };
        var ms = mx(sau);
        if (truoc) out.push({ lv: "info", text: "Trước chỉnh: tối đa " + me.fmt(mx(truoc)) + " mm → sau chỉnh: " + me.fmt(ms) + " mm." });
        out.push(ms <= 0.5 ? { lv: "ok", text: "Đạt (≤ 0,5 mm)." } : { lv: "warn", text: "Còn lệch " + me.fmt(ms) + " mm — <a class='qtp-link' data-go='B4'>mở lại Bước 4</a> để chỉnh tiếp." });
        return out;
    },

    /*------------------------------------------
    --[8] Công cụ trong bước
    -------------------------------------------*/
    tinhDeXuat: function (b) {
        var me = this, d = me.layDoLech(b.doLechTu);
        if (!d || !me.mau) return null;
        var k = me.F.PX_PER_MM;
        var topCu = me.so(me.mau.MARGIN_TOP), leftCu = me.so(me.mau.MARGIN_LEFT);
        topCu = isNaN(topCu) ? 0 : topCu;
        leftCu = isNaN(leftCu) ? 0 : leftCu;
        var dTop = isNaN(d.doc) ? 0 : -Math.round(d.doc * k), dLeft = isNaN(d.ngang) ? 0 : -Math.round(d.ngang * k);
        return { doLech: d, topCu: topCu, leftCu: leftCu, dTop: dTop, dLeft: dLeft, topMoi: topCu + dTop, leftMoi: leftCu + dLeft };
    },
    congCu: function (b) {
        var me = this, fn = me["cc_" + b.congCu];
        return typeof fn === "function" ? fn.call(me, b) : "";
    },
    // Bước 1: công cụ xem trước & chỉnh ảnh nền (phoiinanh.js — gắn sau khi vẽ, xem ganCongCuAnh) + bảng quy đổi
    cc_anh: function (b) {
        return '<div id="qtpAnhTool" style="margin-bottom:12px"></div>' + this.cc_khogiay(b);
    },
    ganCongCuAnh: function () {
        var me = this;
        if (!$("#qtpAnhTool").length) return;
        if (!window.PhoiInAnh) {
            $("#qtpAnhTool").html('<div class="qtp-callout warn">Thiếu file <code>modules/danhmuc/script/phoiinanh.js</code> — copy file này cùng thư mục với quytrinhphoiin.js để dùng công cụ chỉnh ảnh.</div>');
            return;
        }
        window.PhoiInAnh.mount("#qtpAnhTool", {
            mau: me.mau,
            urlAnh: function (p) { return edu.system.getRootPathImg(p); },
            tenMacDinh: me.mau ? me.mau.MAPHOI : "",
            onTai: function (info) { me.daTaiAnh(info); }
        });
    },
    // Tải ảnh chuẩn xong: lưu thông tin vào bước (đi vào nhật ký khi Hoàn thành) + tick mục "Ảnh đúng số px"
    daTaiAnh: function (info) {
        var me = this, b = me.timBuoc(me.buocXem);
        if (!b || b.congCu !== "anh") return;
        me.datForm(b.ma, "anhChuan", info);
        me.datForm(b.ma, "ck.0", true);
        $("#qtpDetail [data-ck='0']").prop("checked", true).closest("label").addClass("on");
        me.xacNhan = null;
        $("#qtpConfirmBar").html("");
    },
    act_anhTuMau: function () {
        var me = this;
        if (!me.mau || !me.qt) return;
        var b = me.qt.buoc.filter(function (x) { return x.congCu === "anh"; })[0];
        if (!b) return;
        if (me.buocXem !== b.ma) me.xemBuoc(b.ma);
        if (window.PhoiInAnh) window.PhoiInAnh.napUrl(edu.system.getRootPathImg(me.mau.DUONGDANFILE), me.mau.MAPHOI);
        var el = document.getElementById("qtpAnhTool");
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    cc_khogiay: function () {
        var me = this, F = me.F, h = "";
        h += '<div class="qtp-tool"><div class="qtp-tool-title"><i class="fa fa-calculator"></i> Bảng quy đổi khổ giấy (96 DPI: 1 mm ≈ 3,78 px)</div>';
        h += '<table class="qtp-tbl"><thead><tr><th>Khổ</th><th class="num">Kích thước (mm)</th><th class="num">Ảnh dọc (px)</th><th class="num">Ảnh ngang (px)</th></tr></thead><tbody>';
        F.KHO_GIAY.forEach(function (k) {
            var w = Math.round(F.mmToPx(k.w)), hh = Math.round(F.mmToPx(k.h));
            h += "<tr><td><b>" + k.ten + "</b></td><td class='num'>" + k.w + " × " + k.h + "</td><td class='num'>" + w + " × " + hh + "</td><td class='num'>" + hh + " × " + w + "</td></tr>";
        });
        h += "</tbody></table>";
        h += '<div class="qtp-conv"><span>Quy đổi nhanh:</span><input class="qtp-input sm" data-conv="mm" placeholder="mm" /> mm = <b data-conv-out="px">—</b> px'
            + '<span style="width:14px"></span><input class="qtp-input sm" data-conv="px" placeholder="px" /> px = <b data-conv-out="mm">—</b> mm</div>';
        h += "</div>";
        return h;
    },
    capNhatQuyDoi: function () {
        var me = this, F = me.F;
        var mm = me.so($("#qtpDetail [data-conv='mm']").val()), px = me.so($("#qtpDetail [data-conv='px']").val());
        $("#qtpDetail [data-conv-out='px']").text(isNaN(mm) ? "—" : me.fmt(F.mmToPx(mm), 1));
        $("#qtpDetail [data-conv-out='mm']").text(isNaN(px) ? "—" : me.fmt(F.pxToMm(px), 1));
    },
    moTaLech: function (v, truc) {
        var me = this, n = me.so(v);
        if (isNaN(n)) return truc === "ngang" ? "dương = chữ in lệch sang PHẢI" : "dương = chữ in lệch XUỐNG";
        if (n === 0) return "không lệch";
        var px = me.fmt(Math.abs(n) * me.F.PX_PER_MM, 1);
        if (truc === "ngang") return "≈ " + px + " px · in lệch sang " + (n > 0 ? "PHẢI" : "TRÁI");
        return "≈ " + px + " px · in lệch " + (n > 0 ? "XUỐNG" : "LÊN");
    },
    cc_dolech: function (b) {
        var me = this, h = "", ng = me.docForm(b.ma, "doLech.ngang"), dc = me.docForm(b.ma, "doLech.doc");
        h += '<div class="qtp-tool"><div class="qtp-tool-title"><i class="fa fa-crosshairs"></i> Độ lệch đo được (bản in so với phôi)</div>';
        h += '<div class="qtp-grid2">';
        h += '<label class="qtp-field"><span>Lệch ngang (mm)</span><input class="qtp-input" data-f="doLech.ngang" inputmode="decimal" placeholder="VD 1,5 hoặc -2" value="' + me.esc(ng) + '" /><small data-out="doLech.ngang">' + me.moTaLech(ng, "ngang") + "</small></label>";
        h += '<label class="qtp-field"><span>Lệch dọc (mm)</span><input class="qtp-input" data-f="doLech.doc" inputmode="decimal" placeholder="VD -0,5" value="' + me.esc(dc) + '" /><small data-out="doLech.doc">' + me.moTaLech(dc, "doc") + "</small></label>";
        h += "</div>";
        h += '<label class="qtp-field"><span>Ô lệch riêng (nếu có)</span><textarea class="qtp-input" rows="2" data-f="doLech.rieng" placeholder="VD: (3) Ngày sinh lệch phải 2 mm; (7) Số hiệu thấp 1 mm">' + me.esc(me.docForm(b.ma, "doLech.rieng")) + "</textarea></label>";
        if (b.doLechTu) {
            var t = me.layDoLech(b.doLechTu);
            h += '<div class="qtp-hint">Lần đo trước (Bước ' + b.doLechTu + "): " + (t ? "ngang " + (isNaN(t.ngang) ? "—" : me.fmtDau(t.ngang) + " mm") + ", dọc " + (isNaN(t.doc) ? "—" : me.fmtDau(t.doc) + " mm") : "chưa có") + "</div>";
        }
        h += "</div>";
        return h;
    },
    capNhatTrucTiep: function (el) {
        var me = this, f = $(el).attr("data-f");
        if (f === "doLech.ngang" || f === "doLech.doc") {
            $("#qtpDetail [data-out='" + f + "']").text(me.moTaLech(el.value, f === "doLech.ngang" ? "ngang" : "doc"));
            // Kiểm tra tự động phụ thuộc số đo (so sánh / nghiệm thu) -> vẽ lại riêng khối kiểm tra
            var b = me.timBuoc(me.buocXem);
            if (b && (b.kiemTra === "sosanh" || b.kiemTra === "nghiemthu")) $("#qtpChecks").html(me.htmlKiemTra(b));
        }
        if (f === "hienTuong.mayIn" || f === "hienTuong.loPhoi" || f === "ghiChu") { me.xacNhan = null; $("#qtpConfirmBar").html(""); }
    },
    cc_dexuat: function (b) {
        var me = this, h = "", dx = me.tinhDeXuat(b);
        h += '<div class="qtp-tool"><div class="qtp-tool-title"><i class="fa fa-magic"></i> Đề xuất chỉnh (từ số đo Bước ' + b.doLechTu + ")</div>";
        if (!me.mau) return h + '<div class="qtp-empty-sm">Chọn mẫu phôi trước.</div></div>';
        if (!dx) return h + '<div class="qtp-empty-sm">Chưa có số đo ở Bước ' + b.doLechTu + '. <a class="qtp-link" data-go="' + b.doLechTu + '">Nhập độ lệch ở Bước ' + b.doLechTu + " →</a></div></div>";
        var d = dx.doLech;
        var dong = function (ten, lech, chieu, cu, delta, moi) {
            return "<tr><td><b>" + ten + "</b></td><td class='num'>" + (isNaN(lech) ? "—" : me.fmtDau(lech) + " mm" + (lech ? " (" + chieu + ")" : "")) + "</td><td class='num'>" + me.fmt(cu, 0) + " px</td><td class='num'><b>"
                + me.fmt(moi, 0) + " px</b>" + (delta ? " <span style='color:#64748b'>(" + (delta > 0 ? "tăng " : "giảm ") + Math.abs(delta) + ")</span>" : "") + "</td></tr>";
        };
        h += '<table class="qtp-tbl"><thead><tr><th>Lề bù</th><th class="num">Đo được</th><th class="num">Hiện tại</th><th class="num">Đề xuất</th></tr></thead><tbody>';
        h += dong("Top", d.doc, d.doc > 0 ? "in lệch xuống" : "in lệch lên", dx.topCu, dx.dTop, dx.topMoi);
        h += dong("Left", d.ngang, d.ngang > 0 ? "in lệch phải" : "in lệch trái", dx.leftCu, dx.dLeft, dx.leftMoi);
        h += "</tbody></table>";
        h += '<div class="qtp-hint">Áp khi lệch <b>đều</b> cả tờ: nhập Top / Left đề xuất ở khối Tùy chọn khổ giấy rồi Lưu. Lệch riêng từng ô: sửa Khoảng cách trái / trên của ô đó theo cùng quy tắc (lệch +1 mm → bớt 4 px).</div>';
        if (dx.topMoi === 0 && dx.leftMoi !== 0) h += '<div class="qtp-callout warn">Top đề xuất = 0 mà Left khác 0: màn in bỏ qua lề khi Top trống / 0 → nhập Top = 1 px (≈ 0,26 mm).</div>';
        if (d.rieng) h += '<div class="qtp-hint"><b>Ô lệch riêng đã ghi:</b> ' + me.esc(d.rieng) + "</div>";
        h += "</div>";
        return h;
    },
    cc_hientuong: function (b) {
        var me = this, h = "", loai = me.docForm(b.ma, "hienTuong.loai");
        h += '<div class="qtp-tool"><div class="qtp-tool-title"><i class="fa fa-bullseye"></i> Hiện tượng</div>';
        h += '<div class="qtp-seg">';
        me.HIEN_TUONG.forEach(function (x) {
            h += '<label class="' + (loai === x.ma ? "on" : "") + '"><input type="radio" name="qtpHT" data-radio="hienTuong.loai" value="' + x.ma + '"' + (loai === x.ma ? " checked" : "") + " />" + x.ten + "</label>";
        });
        h += "</div>";
        var ht = me.HIEN_TUONG.filter(function (x) { return x.ma === loai; })[0];
        if (ht) h += '<div class="qtp-callout info"><i class="fa fa-lightbulb-o"></i> ' + ht.goiY + "</div>";
        h += '<div class="qtp-grid3">';
        h += '<label class="qtp-field"><span>Máy in</span><input class="qtp-input" data-f="hienTuong.mayIn" placeholder="VD Canon LBP 2900 – P.Đào tạo" value="' + me.esc(me.docForm(b.ma, "hienTuong.mayIn")) + '" /></label>';
        h += '<label class="qtp-field"><span>Lô phôi</span><input class="qtp-input" data-f="hienTuong.loPhoi" placeholder="VD Lô 2026-02" value="' + me.esc(me.docForm(b.ma, "hienTuong.loPhoi")) + '" /></label>';
        h += '<label class="qtp-field"><span>Từ khi nào</span><input class="qtp-input" data-f="hienTuong.tuKhi" placeholder="VD sau khi đổi máy in" value="' + me.esc(me.docForm(b.ma, "hienTuong.tuKhi")) + '" /></label>';
        h += "</div></div>";
        return h;
    },
    cc_toadotest: function () {
        var me = this, h = "";
        h += '<div class="qtp-tool"><div class="qtp-tool-title"><i class="fa fa-crosshairs"></i> Tọa độ test trên máy này</div>';
        if (!me.mau) return h + '<div class="qtp-empty-sm">Chọn mẫu phôi trước.</div></div>';
        if (me.chiTietTT !== "ok") return h + '<div class="qtp-empty-sm">Đang tải các ô nội dung…</div></div>';
        var ids = me.idsChiTiet(), r = me.F.demToaDoTest(ids);
        h += '<div class="qtp-stat"><div class="qtp-stat-num ' + (r.soO ? "warn" : "ok") + '">' + r.soO + '<span style="font-size:15px;color:#64748b;font-weight:600"> / ' + ids.length + " ô</span></div>";
        h += '<div class="qtp-hint" style="flex:1">' + (r.soO ? "đang dùng tọa độ test thay cho tọa độ mẫu khi in trên trình duyệt này (tài khoản " + me.esc(me.khoaUser()) + ")." : "Không có ô nào dùng tọa độ test — bản in trên máy này theo đúng mẫu.") + "</div>";
        if (r.soO) h += '<button type="button" class="qtp-btn qtp-btn-amber" data-act="xoaToaDoTest"><i class="fa fa-eraser"></i> Xóa tọa độ test</button>';
        h += "</div></div>";
        return h;
    },

    /*------------------------------------------
    --[9] Vẽ giao diện
    -------------------------------------------*/
    veTatCa: function () {
        var me = this;
        me.veQuyTrinhChon();
        me.veMauInfo();
        me.vePhien();
        me.veBuoc();
        me.veChiTiet();
        me.veNhatKy();
        me.veBannerNK();
    },
    veTrangThaiApi: function (st) {
        var $c = $("#qtpApiChip");
        if (!st || st.ok === null) { $c.attr("class", "qtp-chip").html('<span class="dot"></span> Nhật ký: chưa kiểm tra'); return; }
        if (st.ok) $c.attr("class", "qtp-chip ok").attr("title", "").html('<span class="dot"></span> Nhật ký: đã kết nối');
        else $c.attr("class", "qtp-chip err").attr("title", st.message || "").html('<span class="dot"></span> Nhật ký: chưa kết nối (chờ BE)');
    },
    veQuyTrinhChon: function () {
        var me = this, h = "";
        me.QUY_TRINH.forEach(function (q) {
            var on = me.qt && me.qt.ma === q.ma;
            h += '<div class="qtp-card qtp-flow' + (on ? " active" : "") + '" data-qt="' + q.ma + '" role="button" tabindex="0">';
            h += '<div class="qtp-flow-icon ' + q.mau + '"><i class="fa ' + q.icon + '"></i></div>';
            h += '<div style="min-width:0"><div class="qtp-flow-name">' + q.ten + '</div><div class="qtp-flow-desc">' + q.moTa + "</div>";
            h += '<div class="qtp-flow-meta"><span class="qtp-chip">' + q.buoc.length + " bước</span>";
            var views = {};
            q.buoc.forEach(function (b) { if (b.view) views[b.view] = 1; });
            Object.keys(views).forEach(function (v) { var mh = me.F.MAN_HINH[v]; if (mh) h += '<span class="qtp-chip"><i class="fa ' + mh.icon + '"></i> ' + mh.ten + "</span>"; });
            h += "</div></div><span class='qtp-flow-check'><i class='fa fa-check'></i></span></div>";
        });
        $("#qtpFlows").html(h);
    },
    veMauInfo: function () {
        var me = this, m = me.mau, h = "", F = me.F;
        if (!m) {
            h = '<span class="qtp-empty-sm">' + (me.qt && me.qt.ma === "PHOIIN_MOI" ? "Phôi mới: chưa có mẫu thì làm Bước 1–2 trước, tạo xong chọn mẫu ở đây." : "Chọn mẫu phôi để xem thông tin và chạy kiểm tra tự động.") + "</span>";
            if (me.thongBao && me.thongBao.buoc === "" && me.thongBao.lv === "err") h = '<span class="qtp-chip err"><span class="dot"></span> ' + me.thongBao.text + "</span>";
            $("#qtpMauInfo").html(h);
            return;
        }
        var d = F.docAnhNen(m.DUONGDANFILE);
        if (d) {
            var k = F.khoGiay(d.w, d.h);
            h += '<span class="qtp-chip"><i class="fa fa-file-image-o"></i> ' + (k.kho ? k.kho.ten + " " + k.kho.huong : me.fmt(k.wmm, 0) + "×" + me.fmt(k.hmm, 0) + " mm") + "</span>";
        } else h += '<span class="qtp-chip err"><span class="dot"></span> Ảnh nền không rõ khổ</span>';
        h += '<span class="qtp-chip"><i class="fa fa-font"></i> ' + me.esc(m.FONT || "Chưa chọn font") + (m.DODAI ? " · " + me.esc(m.DODAI) + "px" : "") + "</span>";
        h += '<span class="qtp-chip"><i class="fa fa-files-o"></i> ' + me.esc(m.SOTRANG || 1) + " trang</span>";
        h += '<span class="qtp-chip"><i class="fa fa-th"></i> ' + (me.chiTietTT === "ok" ? me.dtChiTiet.length + " ô" : me.chiTietTT === "dang" ? "… ô" : "? ô") + "</span>";
        if (m.MARGIN_TOP || m.MARGIN_LEFT) h += '<span class="qtp-chip"><i class="fa fa-arrows"></i> Top ' + me.esc(m.MARGIN_TOP || 0) + " · Left " + me.esc(m.MARGIN_LEFT || 0) + "</span>";
        $("#qtpMauInfo").html(h);
    },
    vePhien: function () {
        var me = this, h = "", u = me.F.util;
        if (!me.qt) { $("#qtpPhien").html(""); return; }
        if (me.xacNhan && me.xacNhan.loai === "phienmoi") {
            h += '<div class="qtp-inline-confirm"><i class="fa fa-exclamation-triangle"></i> Bắt đầu phiên mới? Tiến độ phiên hiện tại vẫn còn trong nhật ký.'
                + '<button type="button" class="qtp-btn qtp-btn-sm qtp-btn-primary" data-act="phienMoiOk">Bắt đầu</button>'
                + '<button type="button" class="qtp-btn qtp-btn-sm" data-act="huyXacNhan">Hủy</button></div>';
            $("#qtpPhien").html(h);
            return;
        }
        h += '<div class="qtp-phien-row">';
        if (me.phienId) {
            h += '<span class="qtp-phien-text">Phiên <b>#' + me.phienId.substring(0, 6) + "</b>" + (me.phienInfo && me.phienInfo.luc ? " · bắt đầu " + u.fmtThoiGian(me.phienInfo.luc) : "") + (me.phienInfo && me.phienInfo.nguoi ? " · " + me.esc(me.phienInfo.nguoi) : "") + "</span>";
        } else h += '<span class="qtp-phien-text">Chưa bắt đầu phiên — thao tác đầu tiên sẽ tự bắt đầu.</span>';
        h += '<button type="button" class="qtp-btn qtp-btn-sm qtp-btn-outline" data-act="phienMoi"><i class="fa fa-plus"></i> Phiên mới</button>';
        h += "</div>";
        if (me.dsPhien && me.dsPhien.length) {
            h += '<div class="qtp-phien-row"><select class="qtp-select" id="qtpPhienSel" title="Mở lại phiên đã làm">';
            var co = false;
            me.dsPhien.forEach(function (p) {
                var sel = p.phienId === me.phienId;
                if (sel) co = true;
                h += '<option value="' + me.esc(p.phienId) + '"' + (sel ? " selected" : "") + ">" + u.fmtThoiGian(p.luc) + " · " + me.esc(p.doiTuongMa || "chưa có mẫu") + " · " + me.esc(p.nguoiTao) + "</option>";
            });
            if (!co) h = h.replace('id="qtpPhienSel" title="Mở lại phiên đã làm">', 'id="qtpPhienSel" title="Mở lại phiên đã làm"><option value="" selected>Phiên gần đây…</option>');
            h += "</select></div>";
        }
        $("#qtpPhien").html(h);
    },
    veBuoc: function () {
        var me = this, h = "";
        if (!me.qt) {
            $("#qtpSteps").html('<div class="qtp-empty"><i class="fa fa-hand-o-up"></i>Chọn 1 trong 2 quy trình phía trên để bắt đầu.</div>');
            return;
        }
        var n = me.qt.buoc.length, xong = me.soBuocXong(), pt = Math.round(xong * 100 / n), goiY = me.buocGoiY();
        h += '<div class="qtp-steps-head"><div class="qtp-steps-title"><span>' + me.qt.tenNgan + " · " + n + ' bước</span><span class="qtp-pill ' + (xong === n ? "done" : "cur") + '">' + xong + "/" + n + "</span></div>";
        h += '<div class="qtp-progress"><span style="width:' + pt + '%"></span></div><div class="qtp-progress-text">' + (xong === n ? "Đã hoàn tất mọi bước." : "Bước nên làm tiếp: <b>" + goiY + "</b>") + "</div>";
        if (xong === n) h += '<div class="qtp-done-box"><i class="fa fa-flag-checkered" style="margin-top:2px"></i><div>Quy trình đã hoàn tất. Lần sau cần làm lại thì bấm <b>Phiên mới</b>.</div></div>';
        h += "</div><ul class='qtp-step-list'>";
        me.qt.buoc.forEach(function (b, i) {
            var t = me.ttBuoc(b.ma), st = me.trangThai[b.ma];
            var cls = "qtp-step" + (t === "xong" ? " is-done" : "") + (t === "boqua" ? " is-skip" : "") + (b.ma === goiY ? " is-cur" : "") + (b.ma === me.buocXem ? " is-view" : "");
            var dot = t === "xong" ? '<i class="fa fa-check"></i>' : t === "boqua" ? '<i class="fa fa-forward"></i>' : (i + 1);
            var mh = b.view ? me.F.MAN_HINH[b.view] : null;
            var pill = t === "xong" ? '<span class="qtp-pill done">Xong</span>' : t === "boqua" ? '<span class="qtp-pill skip">Bỏ qua</span>' : (b.ma === goiY ? '<span class="qtp-pill cur">Tiếp theo</span>' : "");
            if (st && st.chuaLuu) pill = '<span class="qtp-pill unsaved" title="Chưa ghi được nhật ký">Chưa lưu</span>';
            h += '<li class="' + cls + '" data-buoc="' + b.ma + '"><span class="qtp-step-dot">' + dot + "</span>";
            h += '<div class="qtp-step-body"><div class="qtp-step-name">' + b.ten + '</div><div class="qtp-step-meta">' + (mh ? '<i class="fa ' + mh.icon + '"></i> ' + mh.ten : b.congCu === "anh" ? '<i class="fa fa-picture-o"></i> Chỉnh ảnh ngay trên trang' : '<i class="fa fa-hand-paper-o"></i> Làm ngoài hệ thống') + "</div></div>";
            h += '<div class="qtp-step-side">' + pill + "</div></li>";
        });
        h += "</ul>";
        $("#qtpSteps").html(h);
    },
    htmlKiemTra: function (b) {
        var me = this, ds = me.kiemTra(b), h = "";
        if (!ds.length) return '<div class="qtp-empty-sm">Không có kiểm tra tự động cho bước này.</div>';
        var icon = { ok: "fa-check", warn: "fa-exclamation", err: "fa-times", info: "fa-info", wait: "fa-circle-o-notch fa-spin" };
        h += '<ul class="qtp-checks">';
        ds.forEach(function (x) {
            h += '<li class="lv-' + x.lv + '"><span class="ic"><i class="fa ' + (icon[x.lv] || "fa-info") + '"></i></span><div class="tx">' + x.text + "</div>";
            if (x.nut) h += '<div class="act"><button type="button" class="qtp-btn qtp-btn-sm qtp-btn-amber" data-act="' + x.nut.act + '">' + x.nut.nhan + "</button></div>";
            h += "</li>";
        });
        h += "</ul>";
        return h;
    },
    veChiTiet: function () {
        var me = this, h = "";
        if (!me.qt) {
            $("#qtpDetail").html('<div class="qtp-empty" style="padding:60px 20px"><i class="fa fa-sitemap"></i>Mỗi quy trình gồm các bước có hướng dẫn chi tiết, link tới đúng màn hình, kiểm tra tự động và nhật ký.</div>');
            return;
        }
        var b = me.timBuoc(me.buocXem) || me.qt.buoc[0], i = me.viTriBuoc(b.ma), n = me.qt.buoc.length;
        var t = me.ttBuoc(b.ma), st = me.trangThai[b.ma], f = me.layForm(b.ma);
        // Đầu
        h += '<div class="qtp-d-head"><div style="min-width:0"><div class="qtp-eyebrow">Bước ' + (i + 1) + "/" + n + " · " + me.qt.tenNgan + "</div>";
        h += '<div class="qtp-d-title">' + b.ten;
        if (t === "xong") h += ' <span class="qtp-pill done"><i class="fa fa-check"></i> Đã xong</span>';
        if (t === "boqua") h += ' <span class="qtp-pill skip">Đã bỏ qua</span>';
        if (st && st.chuaLuu) h += ' <span class="qtp-pill unsaved">Chưa ghi được nhật ký</span>';
        h += '</div><div class="qtp-d-purpose">' + b.mucDich + "</div></div>";
        h += '<div class="qtp-d-nav"><button type="button" class="qtp-btn qtp-btn-icon" data-act="truoc" title="Bước trước"' + (i === 0 ? " disabled" : "") + '><i class="fa fa-chevron-left"></i></button>'
            + '<button type="button" class="qtp-btn qtp-btn-icon" data-act="sau" title="Bước sau"' + (i === n - 1 ? " disabled" : "") + '><i class="fa fa-chevron-right"></i></button></div></div>';
        h += '<div class="qtp-d-body">';
        // Màn hình
        h += me.htmlManHinh(b);
        // Thông báo của bước
        h += '<div id="qtpMsg"></div>';
        // Cách làm
        h += '<div><div class="qtp-sec-title">Cách làm</div><ol class="qtp-howto">' + b.cachLam.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></div>";
        if (b.luuY && b.luuY.length) h += '<div class="qtp-callout warn"><ul>' + b.luuY.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>";
        // Kiểm tra tự động
        h += '<div><div class="qtp-sec-title"><span>Kiểm tra tự động</span><a class="qtp-link" data-act="kiemTraLai" style="text-transform:none;letter-spacing:0;font-size:12.5px"><i class="fa fa-refresh"></i> Kiểm tra lại</a></div><div id="qtpChecks">' + me.htmlKiemTra(b) + "</div></div>";
        // Công cụ
        if (b.congCu) h += "<div>" + me.congCu(b) + "</div>";
        // Checklist
        if (b.checklist && b.checklist.length) {
            h += '<div><div class="qtp-sec-title">Xác nhận đã làm</div><ul class="qtp-cklist">';
            b.checklist.forEach(function (c, k) {
                var on = !!(f.ck && f.ck[k]);
                h += '<li><label class="' + (on ? "on" : "") + '"><input type="checkbox" data-ck="' + k + '"' + (on ? " checked" : "") + " /><span>" + c + "</span></label></li>";
            });
            h += "</ul></div>";
        }
        // Ghi chú
        h += '<div><div class="qtp-sec-title">Ghi chú</div><textarea class="qtp-input" id="qtpGhiChu" rows="2" data-f="ghiChu" placeholder="Ghi chú cho bước này (bắt buộc khi Bỏ qua)…">' + me.esc(f.ghiChu || "") + "</textarea></div>";
        if (st && (t === "xong" || t === "boqua") && st.luc) h += '<div class="qtp-done-info"><i class="fa fa-check-circle"></i> ' + (t === "xong" ? "Hoàn thành" : "Bỏ qua") + " lúc " + me.F.util.fmtThoiGian(st.luc) + (st.nguoi ? " · " + me.esc(st.nguoi) : "") + "</div>";
        h += "</div>";
        // Xác nhận + hành động
        h += '<div class="qtp-confirm-bar" id="qtpConfirmBar"></div>';
        h += '<div class="qtp-actions"><div class="qtp-actions-l">';
        if (t === "xong" || t === "boqua") h += '<button type="button" class="qtp-btn" data-act="moLai"><i class="fa fa-undo"></i> Mở lại bước</button>';
        else h += '<button type="button" class="qtp-btn qtp-btn-ghost" data-act="boQua"><i class="fa fa-forward"></i> Bỏ qua bước</button>';
        h += '</div><div class="qtp-actions-r"><button type="button" class="qtp-btn qtp-btn-outline" data-act="luuGhiChu"><i class="fa fa-commenting-o"></i> Lưu ghi chú</button>';
        if (t !== "xong") h += '<button type="button" class="qtp-btn qtp-btn-success" data-act="hoanThanh"><i class="fa fa-check"></i> ' + (b.ketThuc ? "Hoàn thành & kết thúc phiên" : "Hoàn thành bước") + "</button>";
        else if (i < n - 1) h += '<button type="button" class="qtp-btn qtp-btn-primary" data-act="sau">Bước tiếp theo <i class="fa fa-arrow-right"></i></button>';
        h += "</div></div>";
        $("#qtpDetail").html(h);
        me.ganCongCuAnh();
        me.veXacNhan();
        me.veThongBao();
    },
    htmlManHinh: function (b) {
        var me = this, h = "";
        if (!b.view && b.congCu === "anh") {
            return '<div class="qtp-view"><div class="qtp-view-icon"><i class="fa fa-picture-o"></i></div><div class="qtp-view-main"><div class="qtp-view-name">Làm ngay trên trang này</div><div class="qtp-view-desc">Mở ảnh scan ở công cụ <b>Xem trước & chỉnh ảnh nền</b> bên dưới → chỉnh → <b>Tải ảnh chuẩn về</b>, tick xác nhận rồi bấm Hoàn thành. Bước 2 dùng file vừa tải để tạo mẫu.</div></div></div>';
        }
        if (!b.view) {
            return '<div class="qtp-view offline"><div class="qtp-view-icon"><i class="fa fa-hand-paper-o"></i></div><div class="qtp-view-main"><div class="qtp-view-name">Làm ngoài hệ thống</div><div class="qtp-view-desc">Bước này không có màn hình — làm theo hướng dẫn, tick xác nhận rồi bấm Hoàn thành.</div></div></div>';
        }
        var t = me.F.timManHinh(b.view), mh = t.manHinh;
        if (!t.chucNang) return '<div id="qtpViewBox">' + me.htmlManHinhVaiTroKhac(b, mh) + "</div>";
        h += '<div class="qtp-view"><div class="qtp-view-icon"><i class="fa ' + mh.icon + '"></i></div><div class="qtp-view-main"><div class="qtp-view-name">' + mh.ten + '</div>';
        h += '<div class="qtp-view-path"><i class="fa fa-bars"></i> ' + me.esc(t.duongMenu || mh.ten) + "</div>";
        h += '<div class="qtp-view-desc">' + mh.moTa + (b.canMau && me.mau ? " · mở sẵn mẫu <b>" + me.esc(me.mau.MAPHOI) + "</b>" : "") + "</div></div>";
        h += '<button type="button" class="qtp-btn qtp-btn-primary" data-act="moView"><i class="fa fa-external-link"></i> Mở màn hình</button></div>';
        return h;
    },
    // Màn hình không có trong menu vai trò đang đăng nhập: tìm ở các vai trò khác của người dùng (vd Thực hiện in ở vai trò
    // "Xét tốt nghiệp"); thấy thì nút Mở màn hình tự đổi vai trò. Tìm xong chỉ vẽ lại ô này (không đụng form đang nhập).
    htmlManHinhVaiTroKhac: function (b, mh) {
        var me = this, h = "", k = me.F.ketQuaVaiTroKhac(b.view);
        if (!k) {   // chỉ tự tìm 1 lần; lỗi thì bấm Làm mới để tìm lại (tránh vòng gọi lặp)
            me.F.timVaiTroKhac(b.view).then(function () {
                if (me.buocXem === b.ma && $("#qtpViewBox").length) $("#qtpViewBox").html(me.htmlManHinhVaiTroKhac(b, mh));
            });
            k = { trangThai: "dang" };
        }
        var head = '<div class="qtp-view-icon"><i class="fa ' + mh.icon + '"></i></div><div class="qtp-view-main"><div class="qtp-view-name">' + mh.ten + "</div>";
        if (k.trangThai === "co") {
            var tenVT = me.F.util.s(k.vaiTro.TENVAITRO), tenHT = me.F.tenVaiTroHienTai();
            h += '<div class="qtp-view other">' + head;
            h += '<div class="qtp-view-path"><i class="fa fa-user-circle-o"></i> Vai trò <b>' + me.esc(tenVT) + "</b> › " + me.esc(k.duongMenu || mh.ten) + "</div>";
            h += '<div class="qtp-view-desc">' + mh.moTa + (b.canMau && me.mau ? " · mở sẵn mẫu <b>" + me.esc(me.mau.MAPHOI) + "</b>" : "") + "</div>";
            h += '<div class="qtp-view-note"><i class="fa fa-exchange"></i> Màn này thuộc vai trò <b>' + me.esc(tenVT) + "</b>" + (tenHT ? " (bạn đang ở <b>" + me.esc(tenHT) + "</b>)" : "")
                + ". Bấm Mở màn hình sẽ tự chuyển vai trò, menu trái đổi theo; xong việc bấm <b>Về quy trình</b> trên banner xanh để quay lại.</div></div>";
            h += '<button type="button" class="qtp-btn qtp-btn-primary" data-act="moView" title="Chuyển sang vai trò ' + me.esc(tenVT) + ' rồi mở ' + me.esc(mh.ten) + '"><i class="fa fa-external-link"></i> Mở màn hình</button></div>';
            return h;
        }
        if (k.trangThai === "dang") {
            h += '<div class="qtp-view">' + head;
            h += '<div class="qtp-view-path">' + me.esc(mh.app + "/Modules/" + mh.duongDan) + "</div>";
            h += '<div class="qtp-view-desc"><i class="fa fa-spinner fa-spin"></i> Vai trò đang đăng nhập không có màn này — đang tìm ở các vai trò khác của bạn…</div></div>';
            h += '<button type="button" class="qtp-btn" disabled><i class="fa fa-external-link"></i> Mở màn hình</button></div>';
            return h;
        }
        h += '<div class="qtp-view missing">' + head;
        h += '<div class="qtp-view-path">' + me.esc(mh.app + "/Modules/" + mh.duongDan) + "</div>";
        h += '<div class="qtp-view-err"><i class="fa fa-exclamation-triangle"></i> ' + me.esc(k.message || "Vai trò đang đăng nhập chưa có chức năng này trong menu — nhờ quản trị gán quyền hoặc đổi vai trò.") + "</div></div>";
        h += '<button type="button" class="qtp-btn" disabled><i class="fa fa-external-link"></i> Mở màn hình</button></div>';
        return h;
    },
    veXacNhan: function () {
        var me = this, x = me.xacNhan, h = "";
        if (!x || x.buoc !== me.buocXem) { $("#qtpConfirmBar").html(""); return; }
        if (x.loai === "thieu") {
            h = '<div class="qtp-inline-confirm" style="margin-top:4px"><i class="fa fa-exclamation-triangle"></i><span style="flex:1 1 260px">Còn ' + x.ds.length + " mục chưa xác nhận: " + x.ds.map(function (s) { return "<b>" + s + "</b>"; }).join("; ") + ".</span>"
                + '<button type="button" class="qtp-btn qtp-btn-sm qtp-btn-success" data-act="hoanThanh" data-arg="force" style="min-height:30px;padding:5px 10px;font-size:12.5px">Vẫn hoàn thành</button>'
                + '<button type="button" class="qtp-btn qtp-btn-sm" data-act="huyXacNhan">Quay lại</button></div>';
        } else if (x.loai === "boqua") {
            h = '<div class="qtp-inline-confirm" style="margin-top:4px"><i class="fa fa-info-circle"></i><span style="flex:1 1 260px">Nhập <b>lý do bỏ qua</b> vào ô Ghi chú rồi bấm Bỏ qua bước lần nữa.</span>'
                + '<button type="button" class="qtp-btn qtp-btn-sm" data-act="huyXacNhan">Đóng</button></div>';
        }
        $("#qtpConfirmBar").html(h);
    },
    veThongBao: function () {
        var me = this, x = me.thongBao;
        if (!x || x.buoc !== me.buocXem) { $("#qtpMsg").html(""); return; }
        var cls = x.lv === "err" ? "err" : x.lv === "ok" ? "info" : "warn";
        var icon = x.lv === "err" ? "fa-times-circle" : x.lv === "ok" ? "fa-check-circle" : "fa-exclamation-triangle";
        $("#qtpMsg").html('<div class="qtp-callout ' + cls + '"><i class="fa ' + icon + '"></i> ' + x.text + "</div>");
    },

    /*------------------------------------------
    --[10] Nhật ký
    -------------------------------------------*/
    taiNhatKy: function () {
        var me = this, loc = me.locNK, f = null;
        if (loc === "phien") f = me.phienId ? { phienId: me.phienId } : null;
        else if (loc === "mau") f = me.strMau_Id ? { doiTuongId: me.strMau_Id } : null;
        else f = { maQuyTrinh: "PHOIIN" };
        if (!f) { me.nkServer = []; me.veNhatKy(); return; }
        $("#qtpNKList").html('<li class="qtp-empty"><i class="fa fa-circle-o-notch fa-spin"></i>Đang tải nhật ký…</li>');
        me.F.nhatKy.layDS(f).then(function (r) {
            if (loc !== me.locNK) return;
            me.nkServer = r.ok ? r.rows : [];
            if (r.ok) me.nkPhien = me.nkPhien.filter(function (x) { return x.trangThaiGhi !== "ok"; });
            if (r.ok && loc === "phien") {
                var d = me.dungTrangThai(r.rows);
                me.trangThai = d.st;
                if (d.info) me.phienInfo = d.info;
                me.veBuoc();
            }
            me.veNhatKy();
        });
    },
    veBannerNK: function () {
        var me = this, st = me.F.nhatKy.trangThai(), A = me.F.API_NHATKY;
        if (st.ok !== false) { $("#qtpNKBanner").html(""); return; }
        $("#qtpNKBanner").html('<div class="qtp-callout err"><b><i class="fa fa-exclamation-triangle"></i> Chưa ghi / đọc được nhật ký</b> — API nhật ký quy trình chưa có trên máy chủ (đang chờ BE). '
            + "Các bước vẫn làm được, nhưng tiến độ và nhật ký <b>không được giữ</b> khi rời trang.<br/>"
            + '<span style="font-size:12px">Hàm: <code>' + me.esc(A.them.func) + "</code>, <code>" + me.esc(A.layDS.func) + "</code> · Lỗi gần nhất: " + me.esc(st.message) + "</span></div>");
    },
    veNhatKy: function () {
        var me = this, u = me.F.util, HD = me.F.HANH_DONG;
        var loc = me.locNK, kw = $.trim(me.tuKhoaNK || "").toLowerCase();
        var ds = me.nkServer.slice();
        me.nkPhien.forEach(function (e) {
            if (loc === "phien" && e.phienId !== me.phienId) return;
            if (loc === "mau" && e.doiTuongId !== me.strMau_Id) return;
            if (e.trangThaiGhi === "ok" && me.F.nhatKy.trangThai().ok && ds.some(function (x) { return x.id && x.id === e.id; })) return;
            ds.push(e);
        });
        if (kw) ds = ds.filter(function (e) { return (e.noiDung + " " + e.doiTuongMa + " " + e.nguoiTao + " " + e.buoc + " " + (HD[e.hanhDong] ? HD[e.hanhDong].ten : e.hanhDong)).toLowerCase().indexOf(kw) !== -1; });
        ds.sort(function (a, b) { return b.luc - a.luc; });
        $("#qtpNKDem").text(ds.length);
        if (!ds.length) {
            var txt = loc === "phien" && !me.phienId ? "Chưa có phiên — thao tác đầu tiên ở các bước sẽ bắt đầu phiên và ghi nhật ký."
                : loc === "mau" && !me.strMau_Id ? "Chọn mẫu phôi để xem nhật ký của mẫu (gồm cả lần sửa mẫu ngoài quy trình)."
                    : kw ? "Không có dòng nhật ký khớp từ khóa." : "Chưa có nhật ký.";
            $("#qtpNKList").html('<li class="qtp-empty"><i class="fa fa-history"></i>' + txt + "</li>");
            return;
        }
        var h = "";
        ds.slice(0, 300).forEach(function (e) {
            var hd = HD[e.hanhDong] || { ten: e.hanhDong, mau: "slate", icon: "fa-circle" };
            var key = e.key || e.id || (e.luc + e.hanhDong);
            var tenBuoc = "";
            if (e.buoc) {
                var q = me.timQT(e.maQuyTrinh), bb = null;
                if (q) q.buoc.forEach(function (x) { if (x.ma === e.buoc) bb = x; });
                tenBuoc = e.buoc + (bb ? " · " + bb.ten : "");
            }
            var ct = me.htmlDuLieuNK(e.duLieu);
            h += '<li class="qtp-log-item' + (me.nkMo[key] ? " open" : "") + '" data-key="' + me.esc(key) + '">';
            h += '<span class="qtp-log-dot c-' + hd.mau + '"><i class="fa ' + hd.icon + '"></i></span><div style="min-width:0">';
            h += '<div class="qtp-log-l1"><span class="qtp-log-act">' + hd.ten + "</span>" + (tenBuoc ? '<span class="qtp-log-tag">' + me.esc(tenBuoc) + "</span>" : "");
            if (e.doiTuongMa && loc !== "mau") h += '<span class="qtp-log-tag"><i class="fa fa-th-large"></i> ' + me.esc(e.doiTuongMa) + "</span>";
            if (e.maQuyTrinh === "PHOIIN_SUAMAU") h += '<span class="qtp-log-tag">Ngoài quy trình</span>';
            h += "</div>";
            h += '<div class="qtp-log-text">' + me.esc(e.noiDung) + "</div>";
            h += '<div class="qtp-log-l3"><span><i class="fa fa-user-o"></i> ' + me.esc(e.nguoiTao || "—") + "</span>";
            if (e.trangThaiGhi === "dang") h += '<span class="pend"><i class="fa fa-circle-o-notch fa-spin"></i> Đang ghi…</span>';
            if (e.trangThaiGhi === "loi") h += '<span class="bad" title="' + me.esc(e.loi) + '"><i class="fa fa-exclamation-triangle"></i> Chưa lưu: ' + me.esc(e.loi) + "</span>";
            if (ct) h += '<a class="qtp-link" data-act="nkct" data-arg="' + me.esc(key) + '">Chi tiết</a>';
            h += "</div>";
            if (ct) h += '<div class="qtp-log-detail">' + ct + "</div>";
            h += '</div><div class="qtp-log-time">' + u.fmtThoiGian(e.luc) + "</div></li>";
        });
        if (ds.length > 300) h += '<li class="qtp-empty-sm" style="padding:8px 0">Hiển thị 300/' + ds.length + " dòng gần nhất — dùng ô tìm kiếm để lọc.</li>";
        $("#qtpNKList").html(h);
    },
    htmlDuLieuNK: function (d) {
        var me = this, h = "", co = false;
        if (!d || typeof d !== "object") return "";
        if (d.thayDoi && d.thayDoi.length) {
            co = true;
            h += '<table class="qtp-tbl" style="margin-bottom:8px"><thead><tr><th>Ô / phần</th><th>Thông tin</th><th class="num">Cũ</th><th class="num">Mới</th></tr></thead><tbody>';
            d.thayDoi.slice(0, 200).forEach(function (x) {
                h += "<tr><td>" + me.esc(x.o) + "</td><td>" + me.esc(x.truong) + "</td><td class='num'>" + me.esc(x.cu === "" ? "(trống)" : x.cu) + "</td><td class='num'><b>" + me.esc(x.moi === "" ? "(trống)" : x.moi) + "</b></td></tr>";
            });
            h += "</tbody></table>";
        }
        if (d.them && d.them.length) {
            co = true;
            h += '<div class="qtp-hint"><b>Thêm ô:</b> ' + d.them.map(function (x) { return "<code>" + me.esc(x.noiDung) + "</code> (Trên " + me.esc(x.tren) + ", Trái " + me.esc(x.trai) + ")"; }).join("; ") + "</div>";
        }
        if (d.xoa) { co = true; h += '<div class="qtp-hint"><b>Ô đã xóa:</b> <code>' + me.esc(d.xoa.noiDung) + "</code> (Trên " + me.esc(d.xoa.tren) + ", Trái " + me.esc(d.xoa.trai) + ")</div>"; }
        if (d.ketQua) {
            co = true;
            h += '<div class="qtp-hint"><b>Kết quả lưu:</b> ' + me.esc(d.ketQua.ok) + "/" + me.esc(d.ketQua.tong) + " thành công" + (d.ketQua.loi ? ", " + me.esc(d.ketQua.loi) + " lỗi" : "") + "</div>";
            if (d.ketQua.loiChiTiet && d.ketQua.loiChiTiet.length) h += '<div class="qtp-hint" style="color:#b91c1c">' + d.ketQua.loiChiTiet.map(function (x) { return me.esc(x); }).join("<br/>") + "</div>";
        }
        if (d.doLech) {
            co = true;
            h += '<div class="qtp-hint"><b>Độ lệch:</b> ngang ' + (d.doLech.ngangMm === null || isNaN(d.doLech.ngangMm) ? "—" : me.fmtDau(d.doLech.ngangMm) + " mm") + ", dọc " + (d.doLech.docMm === null || isNaN(d.doLech.docMm) ? "—" : me.fmtDau(d.doLech.docMm) + " mm") + (d.doLech.rieng ? " · riêng: " + me.esc(d.doLech.rieng) : "") + "</div>";
        }
        if (d.deXuat) { co = true; h += '<div class="qtp-hint"><b>Đề xuất:</b> Top ' + me.esc(d.deXuat.topCu) + " → " + me.esc(d.deXuat.topMoi) + " px, Left " + me.esc(d.deXuat.leftCu) + " → " + me.esc(d.deXuat.leftMoi) + " px</div>"; }
        if (d.hienTuong) {
            co = true;
            var ht = me.HIEN_TUONG.filter(function (x) { return x.ma === d.hienTuong.loai; })[0];
            h += '<div class="qtp-hint"><b>Hiện tượng:</b> ' + me.esc(ht ? ht.ten : (d.hienTuong.loai || "—")) + (d.hienTuong.mayIn ? " · máy in " + me.esc(d.hienTuong.mayIn) : "") + (d.hienTuong.loPhoi ? " · lô " + me.esc(d.hienTuong.loPhoi) : "") + (d.hienTuong.tuKhi ? " · từ " + me.esc(d.hienTuong.tuKhi) : "") + "</div>";
        }
        if (d.checklist && d.checklist.length) {
            co = true;
            h += '<div class="qtp-hint"><b>Checklist:</b> ' + d.checklist.map(function (x) { return (x.ok ? "✓ " : "✗ ") + me.esc(x.muc); }).join(" · ") + "</div>";
        }
        if (d.kiemTra && d.kiemTra.length) {
            co = true;
            var nhan = { ok: "✓", warn: "⚠", err: "✗", info: "ℹ" };
            h += '<div class="qtp-hint"><b>Kiểm tra tự động lúc đó:</b><br/>' + d.kiemTra.map(function (x) { return (nhan[x.muc] || "•") + " " + me.esc(x.noiDung); }).join("<br/>") + "</div>";
        }
        if (d.manHinh) { co = true; h += '<div class="qtp-hint"><b>Màn hình:</b> ' + me.esc(d.menu || d.manHinh) + " <code>" + me.esc(d.duongDan) + "</code></div>"; }
        if (d.ghiChu) { co = true; h += '<div class="qtp-hint"><b>Ghi chú:</b> ' + me.esc(d.ghiChu) + "</div>"; }
        if (!co) h += "<pre>" + me.esc(JSON.stringify(d, null, 2)) + "</pre>";
        return h;
    }
};
