<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs" Inherits="Apis.LoginVT.Index" %>
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Education management</title>
    <link rel="stylesheet" href="assets/css/styles.css?v=<%= Guid.NewGuid().ToString() %>">
    <link href="assets/select2/css/select2.min.css" rel="stylesheet" />
    <link href="assets/pagination/simplePagination.min.css" rel="stylesheet" />
    <link href="App_Themes/Plugins/jstree/dist/themes/default/style.min.css" rel="stylesheet" /><!-- editor -->
    <link rel="shortcut icon" type="image/x-icon" href="assets/images/logo.ico" />

    <style>
      /* FCM header notifications: layout only (no new colors) */
      #fcm-noti-button {
        position: relative;
      }

      #fcm-noti-badge {
        position: absolute;
        top: -6px;
        right: -10px;
        line-height: 1;
      }

      #fcm-noti-menu {
        min-width: 340px;
        max-width: 420px;
        max-height: 420px;
        overflow: auto;
      }

      .fcm-noti-item-title {
        font-weight: 600;
      }

      .head-search-box { position: relative; }
      .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #e3e6ef;
        border-radius: 6px;
        box-shadow: 0 6px 20px rgba(0,0,0,.12);
        margin-top: 4px;
        max-height: 360px;
        overflow-y: auto;
        z-index: 2050;
        display: none;
        padding: 4px 0;
        list-style: none;
      }
      .search-suggestions.show { display: block; }
      .search-suggestions li {
        padding: 8px 14px;
        cursor: pointer;
        color: #333;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .search-suggestions li:hover,
      .search-suggestions li.active { background: #f1f5ff; color: #1967d2; }
      .search-suggestions li i { color: #1967d2; width: 16px; text-align: center; }
      .search-suggestions li .parent {
        margin-left: auto;
        font-size: 12px;
        color: #8a8f99;
      }
      .search-suggestions .empty {
        padding: 10px 14px;
        color: #8a8f99;
        font-style: italic;
        cursor: default;
      }
    </style>
  </head>

  <body>


    <div id="overlay" style="position:fixed; margin-top:150px; z-index:2051; margin-left:50%; display:none">
      <i style="font-size: 40px" class="fad fa-sync-alt fa-spin"></i>
    </div>
    <div class="header fixed-top">
      <div class="top-nav">
        <div class="sidebar-bars">
          <i class="fa-light fa-bars-sort"></i>
        </div>
        <div class="head-logo refeshlogo">
          <a href="#">
            <img class="logo-icon" src="logo.png" title="QTDH" />
          </a>
        </div>
        <div class="head-search-form">
          <div class="head-search-toggle">
            <i class="fal fa-search"></i>
          </div>
          <div class="head-search-box">
            <div class="form">
              <input type="text" id="global-search-input" class="search-imput" placeholder="Tìm kiếm thông tin" autocomplete="off" />
              <button class="search-btn">
                <i class="fal fa-search"></i>
              </button>
            </div>
            <ul id="global-search-suggestions" class="search-suggestions"></ul>
          </div>
        </div>
        <div class="main-menu">
          <ul class="list-unstyled">
            <%--<li class="item active">
              <a class="menu-link" href="index.html">
                <i class="fal fa-home"></i>
                <span>Trang chủ</span>
              </a>
              </li>
              <li class="item">
                <a class="menu-link" href="dashboard.html">
                  <span>Dashboard</span>
                </a>
              </li>
              <li class="item">
                <a class="menu-link" href="modul.html">
                  <span>Modul</span>
                </a>
              </li>
              <li class="item">
                <a class="menu-link" href="chucnang-cuaban.html">
                  <span>Chức năng của bạn</span>
                </a>
              </li>
              <li class="item">
                <a class="menu-link" href="tintuc.html">
                  <span>Tin tức</span>
                </a>
              </li>--%>
          </ul>
          <div class="menu-toggle">
            <i class="fal fa-bars"></i>
          </div>
        </div>
        <div class="account-group">
          <%--<div class="dropdown">
            <div class="item" data-bs-toggle="dropdown">
              <i class="fal fa-circle-check"></i>
              <span>3</span>
            </div>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
        </div>
        <div class="dropdown">
          <div class="item message" data-bs-toggle="dropdown">
            <i class="fal fa-messages"></i>
            <span>3</span>
          </div>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
        --%>

        <div class="dropdown box-notify">
          <div class="item noti" id="fcm-noti-button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fal fa-bell"></i>
            <span id="fcm-noti-badge" class="badge rounded-pill bg-danger" style="display:none">0</span>
          </div>
          <ul class="dropdown-menu dropdown-menu-end p-0" id="fcm-noti-menu">
            <li class="dropdown-header py-2 px-3">Thông báo</li>
            <li><hr class="dropdown-divider my-0"></li>
            <li><a class="dropdown-item py-3 text-center" href="javascript:void(0)" id="fcm-noti-empty">Chưa có thông báo</a></li>
          </ul>
        </div>
        <div class="dropdown box-acc-user">
          <div class="item" data-bs-toggle="dropdown">
            <img src="assets/images/avata-user.png" class="avatar" />
            <span class="hidden-xs">
              <%=fullname %>
            </span>
            <span class="hidden-xs">
              <%=fullname %>
            </span>
          </div>
          <ul class="dropdown-menu user-action">
            <li>
              <a class="dropdown-item" href="#">
                <i class="fa-light fa-user"></i>
                <span>Thông tin cá nhân</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="fa-light fa-gear text-green"></i>
                <span>Cài đặt</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="fa-light fa-browser text-red"></i>
                <span>Theme Option</span>
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="Logout.aspx">
                <i class="fa-light fa-right-from-bracket"></i>
                <span>Đăng xuất</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </div>

    <div class="main-wrap">
      <div class="left-sidebar">
        <div class="sidebar-menu">
          <div class="accordion" id="sidebar-menu">
            <div class="sidebar-menu-item active">
              <a class="sidebar-menu-header" href="">
                <i class="fa-light fa-house-window item-icon"></i>
                <span>Dashboads</span>
              </a>
            </div>
            <!-- siderbar menu  item -->

            <!-- end siderbar menu  item -->
          </div>
        </div>
      </div>
      <div class="main-content" id="main-content-wrapper">
        <div class="dashboard-content">
          <div class="quick-action">
            <div class="welcome">Chào mừng bạn!</div>
            <div class="quick-acction-title">Danh sách vai trò</div>
            <div class="action-group" id="zonedashbroad">
            </div>
          </div>
          <div class="for-u-today" style="display: none">
            <div class="title-main">Thông tin chung</div>
            <div class="today-group">
              <div class="item">
                <div class="card today-card today-card-1">
                  <div class="card-header">
                    <div class="title">
                      <div class="icon">
                        <i class="fa-solid fa-newspaper"></i>
                      </div>
                      <div class="feature-name text-uppercase">
                        Bản tin nội bộ trường
                      </div>
                    </div>
                    <div class="dropdown">
                      <div class="dropdow-label" data-bs-toggle="dropdown">
                        <i class="fal fa-ellipsis"></i>
                      </div>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">Action</a></li>
                        <li>
                          <a class="dropdown-item" href="#">Another action</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="#">Something else here</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="dashboard-tinnoibo">
                      <div class="item">
                        <a href="#" class="label label-sukien">Sự kiện</a>
                        <a href="#" class="title">
                          Ngày hội việc làm 2025 sẽ tổ chức tại sàn A-15/06
                        </a>
                      </div>
                      <div class="item">
                        <a href="#" class="label label-thongbao">Thông báo</a>
                        <a href="#" class="title">
                          Thay đổi thời khóa biểu học kỳ hè ( Khóa CNTT)
                        </a>
                      </div>
                      <div class="item">
                        <a href="#" class="label label-tingiangvien">Tin giảng viên</a>
                        <a href="#" class="title">
                          PGS,TS nguyễn Văn B nhận giải thưởng KHCN cấp bộ
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="line-1 bg-f1"></div>
                    <a href="#" class="view-all">Xem tất cả</a>
                  </div>
                </div>
              </div>
              <div class="item">
                <div class="card today-card today-card-2">
                  <div class="card-header">
                    <div class="title">
                      <div class="icon">
                        <i class="fas fa-users-gear"></i>
                      </div>
                      <div class="feature-name">NHÂN SỰ QUẢN LÝ</div>
                    </div>
                    <div class="dropdown">
                      <div class="dropdow-label" data-bs-toggle="dropdown">
                        <i class="fal fa-ellipsis"></i>
                      </div>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">Action</a></li>
                        <li>
                          <a class="dropdown-item" href="#">Another action</a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="#">Something else here</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="dashboard-nhansuquanly">
                      <div class="item">
                        <div class="left">
                          <div class="avatar">
                            <img src="assets/images/avatar.jpg" />
                          </div>
                          <div class="meta">
                            <a href="#" class="name" title="Nguyễn Thị Bích">Nguyễn Thị Bích</a>
                            <a href="#" class="link" title="b,nguyen@uviv.edu"><i class="fa-light fa-envelope-open"></i>
                              <span>b.nguyen@univ.edu</span>
                            </a>
                            <a href="tel:0123456789" class="link" title="0123456789"><i class="fa-light fa-phone"></i>
                              <span>0123456789</span>
                            </a>
                          </div>
                        </div>
                        <div class="right">
                          <div>
                            <div class="link" title="Khoa CNTT">
                              <i class="fa-light fa-chalkboard-user"></i>
                              <span>Khoa CNTT</span>
                            </div>
                            <div class="link" title="Ten VT">
                              <i class="fa-light fa-screen-users"></i>
                              <span>Tên VT</span>
                            </div>
                            <a href="#" class="link" title="Giao việc">
                              <i class="fa-light fa-briefcase"></i>
                              <span>Giao việc</span>
                            </a>
                          </div>
                          <button class="btn-detail">
                            <i class="fa-light fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                      <div class="item">
                        <div class="left">
                          <div class="avatar">
                            <img src="assets/images/avatar.jpg" />
                          </div>
                          <div class="meta">
                            <a href="#" class="name" title="Nguyễn Thị Bích">Nguyễn Thị Bích</a>
                            <a href="#" class="link" title="b,nguyen@uviv.edu"><i class="fa-light fa-envelope-open"></i>
                              <span>b.nguyen@univ.edu</span>
                            </a>
                            <a href="tel:0123456789" class="link" title="0123456789"><i class="fa-light fa-phone"></i>
                              <span>0123456789</span>
                            </a>
                          </div>
                        </div>
                        <div class="right">
                          <div>
                            <div class="link" title="Khoa CNTT">
                              <i class="fa-light fa-chalkboard-user"></i>
                              <span>Khoa CNTT</span>
                            </div>
                            <div class="link" title="Ten VT">
                              <i class="fa-light fa-screen-users"></i>
                              <span>Tên VT</span>
                            </div>
                            <a href="#" class="link" title="Giao việc">
                              <i class="fa-light fa-briefcase"></i>
                              <span>Giao việc</span>
                            </a>
                          </div>
                          <button class="btn-detail">
                            <i class="fa-light fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                      <div class="item">
                        <div class="left">
                          <div class="avatar">
                            <img src="assets/images/avatar.jpg" />
                          </div>
                          <div class="meta">
                            <a href="#" class="name" title="Nguyễn Thị Bích">Nguyễn Thị Bích</a>
                            <a href="#" class="link" title="b,nguyen@uviv.edu"><i class="fa-light fa-envelope-open"></i>
                              <span>b.nguyen@univ.edu</span>
                            </a>
                            <a href="tel:0123456789" class="link" title="0123456789"><i class="fa-light fa-phone"></i>
                              <span>0123456789</span>
                            </a>
                          </div>
                        </div>
                        <div class="right">
                          <div>
                            <div class="link" title="Khoa CNTT">
                              <i class="fa-light fa-chalkboard-user"></i>
                              <span>Khoa CNTT</span>
                            </div>
                            <div class="link" title="Ten VT">
                              <i class="fa-light fa-screen-users"></i>
                              <span>Tên VT</span>
                            </div>
                            <a href="#" class="link" title="Giao việc">
                              <i class="fa-light fa-briefcase"></i>
                              <span>Giao việc</span>
                            </a>
                          </div>
                          <button class="btn-detail">
                            <i class="fa-light fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <div class="line-1 bg-f1"></div>
                    <a href="#" class="view-all">Xem tất cả</a>
                  </div>
                </div>
              </div>
              <!--  -->
            </div>
          </div>
        </div>
      </div>

      <script type="text/javascript">AXYZCLRVN = () => "<%= lblXYZCLRVN %>"</script>

      <div id="alert"></div>
    </div>
  </body>


  <script src="assets/js/bootstrap.bundle.min.js "></script>
  <script src="assets/js/jquery-2.2.0.min.js" type="text/javascript"></script>
  <script src="assets/js/jquery-ui.min.js" type="text/javascript"></script>
  <script src="assets/js/select2.min.js"></script>
  <script src="assets/js/swiper-bundle.min.js"></script>
  <script src="assets/js/slick.js"></script>
  <script src="assets/js/tab.js"></script>
  <script src="assets/js/crypto-js.js?v=32"></script>
  <script src="assets/pagination/jquery.simplePagination.min.js?v=<%= Guid.NewGuid().ToString() %>"></script>
  <script src="assets/js/masonry.pkgd.min.js"></script>
  <script src="assets/js/custom.js"></script>
  <!-- <script src="assets/js/customs.js"></script> -->
  <script src="assets/js/cleave.min.js"></script>

  <!-- Firebase Web Push (FCM) -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"></script>
  <script type="text/javascript">window.FCM_VAPID_KEY = "BAaMGqYzL8EbC8cBXgEPwzgTwtF-4fTJ2x7XyusAxZuEyrCGKpIuij6VanSwjLQWRetpgpM32y98zlUZo-ZVuEE";</script>
  <script src="assets/js/fcm-notify.js?v=<%= Guid.NewGuid().ToString() %>"></script>
  <script type="text/javascript" src="App_Themes/Plugins/jstree/dist/jstree.min.js"></script><!--Plugin jstree-->

  <script type="text/javascript" src="Core/constant.js?v=<%= Guid.NewGuid().ToString() %>"></script> <!--CORE JS-->
  <script type="text/javascript" src="Core/systemroot.js?v=<%= Guid.NewGuid().ToString() %>"></script> <!--CORE JS-->
  <script type="text/javascript" src="Core/util.js?v=<%= Guid.NewGuid().ToString() %>"></script> <!--CORE JS-->
  <script type="text/javascript" src="Core/systemextend.js?v=<%= Guid.NewGuid().ToString() %>"></script><!--CORE JS-->
  <script type="text/javascript" src="Config.js?v=<%= Guid.NewGuid().ToString() %>"></script>
  <script src="<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload")%>/Core/uploadfile.js?v=1.0.0.12"></script><!--CORE JS-->
  <script src="<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload")%>/Core/uploadavatar.js?v=1.0.0.12"></script><!--CORE JS-->
  <%--<script async type="text/javascript" src="https://api-apis.com/socket.io/socket.io.js"></script><!--CORE JS-->--%>
    <%--<script src="Scripts/MathJax/es5/tex-mml-chtml.js"></script>--%>

      <script type="text/javascript">

        var edu = window.edu || {};
        window.edu = edu;
        edu['system'] = new systemroot();
        edu['extend'] = new systemextend();
        edu['constant'] = new constant();
        edu['util'] = new util();
        $(document).ready(function () {
          edu.system.startApp();
          edu.extend.init();
          edu.constant.init();

          try {

            if (edu.fcm && typeof edu.fcm.init === 'function')
            {
              edu.fcm.init();
            }
          } catch (e) {
          }

          initGlobalSearch();
        });

        function initGlobalSearch() {
          var $input = $('#global-search-input');
          var $box = $('#global-search-suggestions');
          if (!$input.length) return;

          var _allScreens = [];
          var _allScreensRaw = [];
          var _allApps = [];
          var _loading = false;

          function removeDiacritics(s) {
            return (s || '').toString().toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'd');
          }

          function loadAllApps() {
            if (_allApps.length) return;
            edu.system.makeRequest({
              type: 'GET',
              action: 'CMS_UngDung/LayDanhSach',
              contentType: true,
              data: { strTuKhoa: '', pageIndex: 1, pageSize: 1000, dTrangThai: 1 },
              success: function (data) {
                if (data && data.Success && data.Data) {
                  _allApps = data.Data;
                  console.log('[global-search] loaded', _allApps.length, 'apps. Sample:', _allApps[0]);
                }
              },
              error: function () {},
              fakedb: []
            }, false, false, false, null);
          }

          function loadAllScreens(cb) {
            if (_loading) return;
            if (_allScreens.length) { cb && cb(); return; }
            _loading = true;
            edu.system.makeRequest({
              type: 'GET',
              action: 'CMS_ChucNang/LayDanhSach',
              contentType: true,
              data: {
                action: 'CMS_ChucNang/LayDanhSach',
                versionAPI: 'v1.0',
                strTuKhoa: '',
                strChung_UngDung_Id: '',
                strCHUCNANGCHA_Id: '',
                pageIndex: 1,
                pageSize: 5000,
                strNGUONTRUYCAP_Id: '',
                dTrangThai: 1
              },
              success: function (data) {
                _loading = false;
                if (data && data.Success && data.Data) {
                  _allScreensRaw = data.Data;
                  _allScreens = data.Data.filter(function (e) { return e && e.DUONGDANFILE; });
                  console.log('[global-search] loaded', _allScreens.length, 'screens. Sample:', _allScreens[0]);
                  cb && cb();
                }
              },
              error: function () { _loading = false; },
              fakedb: []
            }, false, false, false, null);
          }

          function resolveAppCode(obj) {
            if (obj.MAUNGDUNG) return obj.MAUNGDUNG;
            if (obj.MA_UNGDUNG) return obj.MA_UNGDUNG;
            var appId = obj.CHUNG_UNGDUNG_ID || obj.UNGDUNG_ID;
            if (appId && _allApps.length) {
              var app = _allApps.find(function (a) { return a.ID === appId; });
              if (app) return app.MAUNGDUNG || app.MA_UNGDUNG || app.MA || app.TENUNGDUNG;
            }
            var sysMatch = ((edu.system.dtChucNang) || []).find(function (e) { return e.ID === obj.ID; });
            if (sysMatch && sysMatch.MAUNGDUNG) return sysMatch.MAUNGDUNG;
            return null;
          }

          function getRaw() {
            if (_allScreens.length) return _allScreens;
            return ((edu && edu.system && edu.system.dtChucNang) || [])
              .filter(function (e) { return e && e.DUONGDANFILE; });
          }
          function getList() { return getRaw(); }

          function render(items, keyword) {
            if (!getRaw().length) {
              $box.html('<li class="empty">Đang tải danh sách màn hình, vui lòng thử lại sau giây lát...</li>').addClass('show');
              return;
            }
            if (!items.length) {
              $box.html('<li class="empty">Không tìm thấy màn hình phù hợp với "' + (keyword || '') + '"</li>').addClass('show');
              return;
            }
            var all = getList();
            var html = items.map(function (it) {
              var parent = all.find(function (x) { return x.ID === it.CHUCNANGCHA_ID; });
              var icon = it.TENANH && it.TENANH.indexOf('fa') === 0 ? it.TENANH : 'fal fa-file';
              return '<li data-id="' + it.ID + '" data-href="' + (it.DUONGDANHIENTHI || '#') + '" data-file="' + (it.DUONGDANFILE || '') + '">' +
                '<i class="' + icon + '"></i>' +
                '<span>' + highlight(it.TENCHUCNANG, keyword) + '</span>' +
                (parent ? '<span class="parent">' + parent.TENCHUCNANG + '</span>' : '') +
                '</li>';
            }).join('');
            $box.html(html).addClass('show');
          }

          function highlight(text, kw) {
            if (!kw) return text;
            var t = text || '';
            var normT = removeDiacritics(t);
            var normKw = removeDiacritics(kw);
            var idx = normT.indexOf(normKw);
            if (idx < 0) return t;
            return t.substring(0, idx) + '<mark>' + t.substring(idx, idx + kw.length) + '</mark>' + t.substring(idx + kw.length);
          }

          function search(kw) {
            var list = getList();
            var nKw = removeDiacritics(kw);
            if (!nKw) { $box.removeClass('show').empty(); return; }
            if (!list.length) {
              render([], kw);
              loadAllScreens(function () {
                if ($input.val().trim() === kw) search(kw);
              });
              return;
            }
            var matches = list.filter(function (e) {
              return removeDiacritics(e.TENCHUCNANG).indexOf(nKw) >= 0
                  || removeDiacritics(e.MACHUCNANG).indexOf(nKw) >= 0;
            }).slice(0, 15);
            render(matches, kw);
          }

          loadAllScreens();
          loadAllApps();

          $input.on('input', function () { search($(this).val().trim()); });
          $input.on('focus', function () {
            loadAllScreens();
            var v = $(this).val().trim();
            if (v) search(v);
          });

          $input.on('keydown', function (ev) {
            var $items = $box.find('li[data-id]');
            if (!$items.length) return;
            var idx = $items.index($items.filter('.active'));
            if (ev.key === 'ArrowDown') {
              ev.preventDefault();
              idx = (idx + 1) % $items.length;
              $items.removeClass('active').eq(idx).addClass('active')[0].scrollIntoView({ block: 'nearest' });
            } else if (ev.key === 'ArrowUp') {
              ev.preventDefault();
              idx = idx <= 0 ? $items.length - 1 : idx - 1;
              $items.removeClass('active').eq(idx).addClass('active')[0].scrollIntoView({ block: 'nearest' });
            } else if (ev.key === 'Enter') {
              ev.preventDefault();
              var $chosen = idx >= 0 ? $items.eq(idx) : $items.first();
              $chosen.trigger('click');
            } else if (ev.key === 'Escape') {
              $box.removeClass('show');
            }
          });

          $box.on('click', 'li[data-id]', function () {
            var id = $(this).data('id');
            $box.removeClass('show');
            $input.val('');
            var obj = _allScreens.find(function (e) { return e.ID === id; });
            if (!obj) return;
            console.log('[global-search] click obj:', obj);
            try {
              var sys = edu.system;
              var appCode = resolveAppCode(obj);
              if (!appCode) {
                console.warn('[global-search] cannot resolve appCode for obj', obj, 'apps:', _allApps);
                edu.system.alert && edu.system.alert('Không xác định được ứng dụng cho chức năng này.', 'w');
                return;
              }
              var objFull = Object.assign({}, obj, { MAUNGDUNG: appCode });
              sys.dtChucNang = sys.dtChucNang || [];

              function upsert(item) {
                if (!item) return;
                var i = sys.dtChucNang.findIndex(function (e) { return e.ID === item.ID; });
                if (i < 0) sys.dtChucNang.push(item); else sys.dtChucNang[i] = item;
              }

              var parent = obj.CHUCNANGCHA_ID
                ? _allScreensRaw.find(function (e) { return e.ID === obj.CHUCNANGCHA_ID; })
                : null;
              var grandparent = parent && parent.CHUCNANGCHA_ID
                ? _allScreensRaw.find(function (e) { return e.ID === parent.CHUCNANGCHA_ID; })
                : null;
              upsert(grandparent);
              upsert(parent);
              upsert(objFull);

              sys.strChucNang_Id = obj.ID;
              sys.appCode = appCode;
              if (obj.TENFILEDINHKEM) sys.rootPathReport = obj.TENFILEDINHKEM;
              sessionStorage.setItem('strChucNang_Id', obj.ID);

              var _origInitMain = sys.initMain;
              sys.initMain = function () {};
              try {
                if (typeof sys.genHTML_MenuVertical === 'function') {
                  sys.genHTML_MenuVertical(sys.dtChucNang);
                }
              } finally {
                sys.initMain = _origInitMain;
              }

              $('#sidebar-menu .active').removeClass('active');
              var $menuItem = $('#chucnang' + obj.ID);
              if ($menuItem.length) {
                if (objFull.CHUCNANGCHA_ID) {
                  $menuItem.addClass('active');
                  var $parent = $('#chucnang' + objFull.CHUCNANGCHA_ID);
                  $parent.removeClass('collapsed').parent().addClass('active');
                  $('#collapse' + objFull.CHUCNANGCHA_ID).addClass('show');
                } else {
                  $menuItem.parent().addClass('active');
                }
              }

              if (obj.DUONGDANHIENTHI) {
                try { window.location.hash = obj.DUONGDANHIENTHI.replace(/^#/, ''); } catch (e) {}
              }
              if (typeof sys.loadFunctionPath === 'function') {
                sys.loadFunctionPath(obj.DUONGDANFILE);
              }
            } catch (e) { console.error('[global-search] click error:', e); }
          });

          $(document).on('click', function (ev) {
            if (!$(ev.target).closest('.head-search-box').length) {
              $box.removeClass('show');
            }
          });

          $('.search-btn').on('click', function (ev) {
            ev.preventDefault();
            search($input.val().trim());
            $input.focus();
          });
        }
      </script>

  </html>