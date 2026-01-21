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
    <link rel="shortcut icon" type="image/x-icon" href="assets/images/logo.ico" />
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
            <img class="logo-icon" src="assets/images/logo/logo-icon.png" />
            <img class="logo-text" src="assets/images/logo/logo-text.png" />
          </a>
        </div>
        <div class="head-search-form">
          <div class="head-search-toggle">
            <i class="fal fa-search"></i>
          </div>
          <div class="head-search-box">
            <div class="form">
              <input
                type="text"
                class="search-imput"
                placeholder="Tìm kiếm thông tin"
              />
              <button class="search-btn">
                <i class="fal fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="main-menu">
          <ul class="list-unstyled">
            <li class="item active">
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
            </li>
          </ul>
          <div class="menu-toggle">
            <i class="fal fa-bars"></i>
          </div>
        </div>
        <div class="account-group">
          <div class="dropdown">
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
          <div class="dropdown">
            <div class="item noti" data-bs-toggle="dropdown">
              <i class="fal fa-bell"></i>
              <span>9+</span>
            </div>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </div>
          <div class="dropdown">
            <div class="item" data-bs-toggle="dropdown">
              <img src="assets/images/avatar.jpg" class="avatar" />
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
                <a class="dropdown-item" href="theme-option.html">
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
          <div class="for-u-today">
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
                          <a class="dropdown-item" href="#"
                            >Something else here</a
                          >
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
                        <a href="#" class="label label-tingiangvien"
                          >Tin giảng viên</a
                        >
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
                          <a class="dropdown-item" href="#"
                            >Something else here</a
                          >
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
                            <a href="#" class="name" title="Nguyễn Thị Bích"
                              >Nguyễn Thị Bích</a
                            >
                            <a href="#" class="link" title="b,nguyen@uviv.edu"
                              ><i class="fa-light fa-envelope-open"></i>
                              <span>b.nguyen@univ.edu</span>
                            </a>
                            <a
                              href="tel:0123456789"
                              class="link"
                              title="0123456789"
                              ><i class="fa-light fa-phone"></i>
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
                            <a href="#" class="name" title="Nguyễn Thị Bích"
                              >Nguyễn Thị Bích</a
                            >
                            <a href="#" class="link" title="b,nguyen@uviv.edu"
                              ><i class="fa-light fa-envelope-open"></i>
                              <span>b.nguyen@univ.edu</span>
                            </a>
                            <a
                              href="tel:0123456789"
                              class="link"
                              title="0123456789"
                              ><i class="fa-light fa-phone"></i>
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
                            <a href="#" class="name" title="Nguyễn Thị Bích"
                              >Nguyễn Thị Bích</a
                            >
                            <a href="#" class="link" title="b,nguyen@uviv.edu"
                              ><i class="fa-light fa-envelope-open"></i>
                              <span>b.nguyen@univ.edu</span>
                            </a>
                            <a
                              href="tel:0123456789"
                              class="link"
                              title="0123456789"
                              ><i class="fa-light fa-phone"></i>
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
    
    <script type="text/javascript" src="Core/constant.js?v=<%= Guid.NewGuid().ToString() %>"></script>    <!--CORE JS-->
    <script type="text/javascript" src="Core/systemroot.js?v=<%= Guid.NewGuid().ToString() %>"></script>  <!--CORE JS-->
    <script type="text/javascript" src="Core/util.js?v=<%= Guid.NewGuid().ToString() %>"></script>        <!--CORE JS-->
    <script type="text/javascript" src="Core/systemextend.js?v=<%= Guid.NewGuid().ToString() %>"></script><!--CORE JS-->
    <script type="text/javascript" src="Config.js?v=<%= Guid.NewGuid().ToString() %>"></script>
    <script src="<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload") %>/Core/uploadfile.js?v=1.0.0.12"></script><!--CORE JS-->
    <script src="<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload") %>/Core/uploadavatar.js?v=1.0.0.12"></script><!--CORE JS-->
    <%--<script async type="text/javascript" src="https://api-apis.com/socket.io/socket.io.js"></script><!--CORE JS-->--%>
    <%--<script src="Scripts/MathJax/es5/tex-mml-chtml.js"></script>--%>

    <script type="text/javascript">
            
        var edu = {};
        edu['system']   = new systemroot();
        edu['extend']   = new systemextend();
        edu['constant'] = new constant();
        edu['util']     = new util();
        $(document).ready(function () {
            edu.system.startApp();
            edu.extend.init();
            edu.constant.init();
            console.log(111);
        });
    </script>
</html>
