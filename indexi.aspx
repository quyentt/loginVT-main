<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="indexi.aspx.cs" Inherits="Apis.LoginVT.indexi" %>
<!DOCTYPE html>
<html>
    <head runat="server">
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <title>Cổng cán bộ</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport"/><!--Tell the browser to be responsive to screen width-->
        <!--no cache in browser-->
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <!--STYLE CSS load from code_behind, only font-awesome pulgin here-->
        <link href="App_Themes/Plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" /><!--Plugin font awesome -->
        <link href="App_Themes/Plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Plugins/ionicons/css/ionicons.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Cms/adminlte/css/AdminLTE.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Cms/adminlte/css/_all-skins.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Plugins/select2/css/select2.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Plugins/pagination/simplePagination.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Plugins/jstree/dist/themes/default/style.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Plugins/datepicker/datepicker3.min.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Cms/css/index.css" rel="stylesheet" /><!-- editor -->
        <link href="App_Themes/Cms/css/index.min.css?v=2" rel="stylesheet" /><!-- editor -->
        <!-- custom theme v1- bich -->
        <link href="App_Themes/Custom_V1/styles.css" rel="stylesheet" />
    </head>
    <!--sidebar-mini-expand-feature sidebar-collapse colage when pageload ==>hold-transition skin-blue fixed sidebar-mini sidebar-mini-expand-feature sidebar-collapse-->
    <!--sidebar-mini only for display left-menu, tooglle this-->
     <!--onload="edu.system.initMain()" ==> link to dashboad-->
    <body class="hold-transition skin-blue">
        <form id="c_login" runat="server">
            <div class="wrapper">          
                <div id="loading"></div>
                <div class="overlay" id="overlay" style="position:fixed; margin-top:150px; z-index:1051; margin-left:50%; display:none">
                    <i style="color:#00a65a; font-size: 40px" class="fa fa-refresh fa-spin"></i>
                </div>
                <!-- Header-horizontal -->
                <header class="main-header">
                    <a class="logo refeshlogo poiter"> <!-- Logo -->
                        <span class="logo-mini">
                            <asp:Label runat="server" ID="lbLogo_mini"></asp:Label>
                        </span><!-- mini logo for sidebar mini 50x50 pixels -->
                        <span class="logo-lg">
                            <asp:Label runat="server" ID="lbLogo_large"></asp:Label>
                        </span><!-- logo for regular state and mobile devices -->
                        
                    </a>
                    <nav class="navbar navbar-static-top"><!-- Header Navbar: style can be found in header.less -->
                        <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button"> <!-- Sidebar toggle button-->
                            <span class="sr-only">Cổng cán bộ</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </a>
                        <div class="navbar-custom-menu">
                            <ul class="nav navbar-nav">
                                <!-- alert timer -->
                                <li class="dropdown">
                                    <ul class="dropdown-menu alert_timer" style="margin-top: 50px;">
                                    </ul>
                                </li>
                            
                                <li class="dropdown messages-menu" style="display: none">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="true"  id="zoneAllMessage">
                                      <i class="fa fa-comments-o"></i>
                                      <!--<span class="label label-success">4</span>-->
                                    </a>
                                    <ul class="dropdown-menu">
                                      <li class="header">
                                          <a class="btn btn-default" id="btnAddUserChat">
                                            <i class="fa fa-plus cl-active"></i>
                                            Thêm mới
                                        </a>
                                      </li>
                                      <li>
                                        <!-- inner menu: contains the actual data -->
                                        <ul class="menu" id="zoneUserChat">
                          
                                        </ul>
                                      </li>
                                      <li class="footer"><a href="#">See All Messages</a></li>
                                    </ul>
                                  </li>
                                <!-- board - notify -->
                                <li class="dropdown notifications-menu"><!-- Notifications: style can be found in dropdown.less -->
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                        <i class="fa fa-bell-o"></i>
                                        <span class="label label-warning" id="zone_number_notify">0</span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        <li class="header">Không có thông báo mới</li>
                                        <li>
                                            <ul class="menu"><!-- inner menu: contains the actual data -->
                               
                                            </ul>
                                        </li>
                                        <li class="footer"><a href="#">Xem tất cả</a></li>
                                    </ul>
                                </li>
                                <!-- board - task -->
                                <li class="dropdown tasks-menu">
                                    <!-- Menu Toggle Button -->
                                    <a class="dropdown-toggle" aria-expanded="false" href="#" data-toggle="dropdown">
                                        <i class="fa fa-flag-o"></i>
                                        <span class="label label-danger" id="sysTask_Notify">0</span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        <li class="header">Tiến trình của bạn</li>
                                        <li id="sysTask_Content">
                                        <!-- Inner menu: contains the tasks -->
                                        <div class="slimScrollDiv" style="width: auto; height: 200px; overflow: hidden; position: relative;">
                                            <ul id="sysTask_Name" class="menu" style="width: 100%; height: 200px; overflow: hidden;">
                                                <!-- call from js -->
                
                                            </ul>
                                            <div class="slimScrollBar" style="background: rgb(0, 0, 0); border-radius: 7px; top: 0px; width: 3px; right: 1px; display: block; position: absolute; z-index: 99; opacity: 0.4;"></div><div class="slimScrollRail" style="background: rgb(51, 51, 51); border-radius: 7px; top: 0px; width: 3px; height: 100%; right: 1px; display: none; position: absolute; z-index: 90; opacity: 0.2;"></div></div>
                                        </li>
                                        <li class="footer">
                                            <a href="#">Xem tất cả</a>
                                        </li>
                                    </ul>
                                </li>
                                <!-- board - login -->
                                <li class="dropdown user user-menu">
                                    <!-- Menu Toggle Button -->
                                    <a class="dropdown-toggle" aria-expanded="false" href="#" data-toggle="dropdown">
                                        <!-- The user image in the navbar-->
                                        <img class="user-image" id="imgavatar">
                                        <!-- hidden-xs hides the username on small devices so only the image appears. -->
                                        <span class="hidden-xs"><%=fullname %></span>
                                    </a>
                                    <ul class="dropdown-menu">
                                        <!-- The user image in the menu -->
                                        <li class="user-header">
                                        <img class="img-circle" id="imgavatardrop" />
                                        <p id="lblHoTenNguoiDung">
                                            <%=fullname %>
                                        </p>
                                        </li>
                                        <!-- Menu Body -->
                                        <li class="user-body">
                                        <div class="col-xs-12 text-center">
                                            <a href="Pages/ChangePass.aspx"><i class="fa fa-exchange"></i> Đổi mật khẩu</a>
                                        </div>
                                        </li>
                                        <!-- Menu Footer-->
                                        <li class="user-footer">
                                        <div class="pull-left">
                                            <a class="btn btn-default btn-flat" id="btnProfile" href="#"><i class="fa fa-user-secret"></i> Hồ sơ cá nhân</a>
                                        </div>
                                        <div class="pull-right">
                                            <a class="btn btn-default btn-flat" href="Logout.aspx"><i class="fa fa-sign-out"></i> Đăng xuất</a>
                                        </div>
                                        </li>
                                    </ul>
                                </li>
                                <!-- board - list_app -->
                                <li>
                                    <a href="#" data-toggle="control-sidebar" id="btnSileApp"><i class="fa fa-th"></i></a>
                                </li>
                            </ul>   
                        </div>
                    </nav>
                </header>
                <!--Menu_left_vertical-->
                <aside class="main-sidebar">
                    
                    <%--<div class="sidebar-menu">
                      <div class="accordion" id="sidebar-menu">
                      </div>
                    </div>--%>
                    <section class="sidebar"><!-- sidebar: style can be found in sidebar.less -->
                        <div class="sidebar-form">
                            <div class="input-group">
                                <input type="text" name="q" id="txtSearch_Fun" class="form-control" placeholder="Tìm kiếm chức năng">
                                <span class="input-group-btn"><button name="search" class="btn btn-flat"><i class="fa fa-search"></i></button></span>
                            </div>
                        </div>
                        <ul class="sidebar-menu" data-widget="tree" id="menu_vertical">
                            <!--Load js from ../Core/systemextend/getlist_ChucNang()-->
                        </ul>
                    </section>
                </aside>
                <!-- Content Wrapper. Contains page content -->
                <div>
                   <div class="content-wrapper">
                        <section class="content-header">
                            <div class="row">
                                <div class="col-lg-12">
                                    <ul class="list-group">
                                        <li class="list-group-item list-group-title" id="lblPath_ChucNang">
                                            <!-- Load path chucnang from systemroot.js -->
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                        <div id="main-content-wrapper">
                            <!--LOAD HTML HERE-->
                        </div>
                   
                        <div class="modal fade" id="myModalRoomChat" role="dialog" aria-labelledby="myModalRoomChat" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content" style="width: 1000px">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                                        <h4 class="modal-title"><span class="myModalLabel"><i class="fa fa-plus"></i> Thêm mới - </span> <span class="lang" key="">Tin nhắn</span> </h4>
                                    </div>
                                    <div class="modal-body" id="dsUserChat">
                                    
                                        <div class="nav-tabs-custom">
                                            <ul class="nav nav-tabs">
                                                <li class="active"><a href="#tab_online" data-toggle="tab" aria-expanded="true"><span class="lang" key=""><i class="fa fa-clipboard"></i> Online</span></a></li>
                                                <li class=""><a href="#tab_banbe" data-toggle="tab" aria-expanded="true"><span class="lang" key=""><i class="fa fa-retweet"></i> Bạn bè</span></a></li>
                                                <li class=""><a href="#tab_trongtruong" data-toggle="tab" aria-expanded="true"><span class="lang" key=""><i class="fa fa-retweet"></i> Trong trường</span></a></li>
                                            </ul>
                                            <div class="tab-content">
                                                <!-- HO SO LY LICH -->
                                                <div class="tab-pane active" id="tab_online">
                                                    <div class="box-body">
                                                        <div class="pull-right">
                                                            <div class="col-sm-12 item-search">
                                                                <input id="txtUserOnline_TuKhoa" class="form-control" placeholder="Nhập từ khóa tìm kiếm" />
                                                            </div>
                                                            <div class="col-sm-12 item-search">
                                                                <a class="btn btn-default" id="btnReload"><i class="fa fa-refresh"></i> <span class="lang" key="">Refresh user</span></a>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <table id="tblUserOnline" class="table table-hover table-bordered">
                                                                <thead>
                                                                    <tr>
                                                                        <th class="td-fixed td-center">Stt</th>
                                                                        <th class="td-center">Ảnh</th>
                                                                        <th class="td-center">Họ tên</th>
                                                                        <th class="td-center">Đơn vị</th>
                                                                        <th class="td-center">Ứng dụng</th>
                                                                        <th class="td-center">Chức năng</th>
                                                                        <th class="td-center td-fixed"><input type="checkbox" id="chkSelectAll_Online"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody></tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="tab-pane " id="tab_banbe">
                                                    <div class="box-body">
                                                        <div class="pull-right">
                                                            <div class="col-sm-12 item-search">
                                                                <input id="txtUserBanBe_TuKhoa" class="form-control" placeholder="Nhập từ khóa tìm kiếm" />
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <table id="tblUserBanBe" class="table table-hover table-bordered">
                                                                <thead>
                                                                    <tr>
                                                                        <th class="td-fixed td-center">Stt</th>
                                                                        <th class="td-center">Ảnh</th>
                                                                        <th class="td-center">Họ tên</th>
                                                                        <th class="td-center">Đã dùng</th>
                                                                        <th class="td-center">Đơn vị</th>
                                                                        <th class="td-center">Truy cập</th>
                                                                        <th class="td-center td-fixed"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody></tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="tab-pane" id="tab_trongtruong">
                                                    <div class="box-body">
                                                        <div>
                                                            <div class="col-sm-3 item-search">
                                                                <select id="dropSearch_DonViChat" class="select-opt">
                                                                    <option value="TRONGTRUONG">Trong trường</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-sm-3 item-search">
                                                                <select id="dropSearch_PhanLoaiSuDung" class="select-opt">
                                                                    <option value="CANBO">Cán bộ</option>
                                                                    <option value="SINHVIEN">Sinh viên</option>
                                                                    <option value="CUUSINHVIEN">Cựu sinh viên</option>
                                                                    <option value="GIADINH">Gia đình</option>
                                                                    <option value="DOITAC">Đối tác</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-sm-3 item-search">
                                                                <input id="txtUserKhac_TuKhoa" class="form-control" placeholder="Nhập từ khóa tìm kiếm" />
                                                            </div>
                                                            <div class="col-sm-3 item-search">
                                                                <a class="btn btn-default" id="btnUserKhac_Search"><i class="fa fa-search"></i> <span class="lang" key="">Tìm kiếm</span></a>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <table id="tblUserKhac" class="table table-hover table-bordered">
                                                                <thead>
                                                                    <tr>
                                                                        <th class="td-fixed td-center">Stt</th>
                                                                        <th class="td-center">Ảnh</th>
                                                                        <th class="td-center">Họ tên</th>
                                                                        <th class="td-center">Mã số</th>
                                                                        <th class="td-center">Email</th>
                                                                        <th class="td-center td-fixed"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody></tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!--End row-->
                                    </div>
                                    <div id="notifyRoomChat"></div>
                                    <div class="modal-footer">
                                        <%--<a class="submit btn btn-primary" id="btnSave_DMTB"><i class="fa fa-toggle-on"></i><span class="lang" key="">Lưu</span></a>--%>
                                        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-times-circle"></i><span class="lang" key=""> Đóng</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="position: fixed; bottom: 0; right: 0" id="zoneChat"></div>
                    </div>
                </div>
                <!-- Footer -->
                <footer class="main-footer">
                    <div class="pull-right hidden-xs"><b>Version</b> 1.0.0</div>
                </footer>
                <!--App_List_rightSide_vertical-->
                <aside class="control-sidebar control-sidebar-light"> 
                    <div class="control-sidebar-app">
                        <div class="input-group search-app">
                            <input name="q" id="txtSearch_App" class="form-control" placeholder="Tìm kiếm ứng dụng" type="text">
                            <span class="input-group-btn"><button name="search" class="btn btn-flat"><i class="fa fa-search"></i></button></span>
                        </div>
                        <table id="tblApp" class="table table-hover tblApp table-noborder table-bordered">
                            <tbody>                                
                            </tbody>
                        </table>
                    </div>               
                </aside><!-- /.control-sidebar -->
                <!-- Add the sidebar's background. This div must be placed immediately after the control sidebar -->
                <div class='control-sidebar-bg'></div>      
                <div id="alert"></div>
                <asp:HiddenField ID="myTextBox" runat="server" ></asp:HiddenField>
            </div>
        </form>
        <!--SCRIPTS-->
        <script type="text/javascript" src="App_Themes/Plugins/jquery/jquery.min.js"></script><!-- jQuery 3 -->
        <script type="text/javascript" src="App_Themes/Plugins/jquery-iu/jquery-ui.min.js"></script><!-- jQuery-iu 2.1.4 -->
        <script> $.widget.bridge('uibutton', $.ui.button);</script><!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
        <script type="text/javascript" src="App_Themes/Plugins/bootstrap/js/bootstrap.min.js"></script><!-- Bootstrap 3.3.7 -->
        <script type="text/javascript" src="App_Themes/Plugins/jquery-slimscroll/jquery.slimscroll.min.js"></script><!--SlimScroll -->
        <script type="text/javascript" src="App_Themes/Plugins/fastclick/lib/fastclick.min.js"></script><!-- FastClick -->
        <script type="text/javascript" src="App_Themes/Cms/adminlte/js/adminlte.min.js"></script><!--Template AdminLTE App -->
        <script type="text/javascript" src="App_Themes/Plugins/select2/js/select2.min.js"></script><!--select_option-->
        <script type="text/javascript" src="App_Themes/Plugins/currency/ax5core.min.js"></script><!--Start script cho currency number-->
        <script type="text/javascript" src="App_Themes/Plugins/currency/ax5formatter.min.js"></script><!--Start script cho currency number-->
        <script type="text/javascript" src="App_Themes/Plugins/chartjs/Chart.min.js"></script><!--ChartJS-->
        <script type="text/javascript" src="App_Themes/Plugins/pagination/jquery.simplePagination.min.js"></script><!--Plugin pagination-->
        <script type="text/javascript" src="App_Themes/Plugins/jstree/dist/jstree.min.js"></script><!--Plugin jstree-->
        <script type="text/javascript" src="App_Themes/Plugins/datepicker/bootstrap-datepicker.min.js"></script><!--Plugin bootstrap-->
        <script type="text/javascript" src="App_Themes/Plugins/cleave.js/dist/cleave.min.js"></script><!--Plugin cleave-->
        <script type="text/javascript" src="App_Themes/Plugins/pagination/crypto-js.js"></script><!-- jQuery 3 -->
        <script type="text/javascript" src="Scripts/ckeditor/ckeditor.js?v=1.0.0.41"></script><!-- editor -->
        <script type="text/javascript" src="Scripts/ckfinder/ckfinder.js?v=1.0.0.31"></script>  
        <script type="text/javascript" src="Scripts/ckeditor/plugins/ckeditor_wiris/integration/WIRISplugins.js?v=1.0.0.31"></script>  
        <!--  src="https://www.wiris.net/demo/plugins/app/WIRISplugins.js?viewer=image" -->

        <script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>  
        <!-- <script type="text/javascript" src="Scripts/MathJax/MathJax.js"></script> -->
        <!--  src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=MML_HTMLorMML" -->
        <script src="<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload") %>/Core/uploadfile.js?v=1.0.0.12"></script><!--CORE JS-->
        <script src="<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload") %>/Core/uploadavatar.js?v=1.0.0.12"></script><!--CORE JS-->

        <script type="text/javascript" src="Corei/constant.js?v=<%= Guid.NewGuid().ToString() %>"></script>    <!--CORE JS-->
        <script type="text/javascript" src="Corei/systemroot.js?v=<%= Guid.NewGuid().ToString() %>"></script>  <!--CORE JS-->
        <script type="text/javascript" src="Corei/util.js?v=1.3.1.14"></script>        <!--CORE JS-->
        <script type="text/javascript" src="Corei/systemextend.js?v=<%= Guid.NewGuid().ToString() %>"></script><!--CORE JS-->
        <script type="text/javascript" src="Config.js?v=1.3.1.6"></script><!--CORE JS-->
               <script type="text/javascript" src="App_Themes/Cms/Custom_V1/customs.js"></script><!-- custom -->

        <script type="text/javascript">
          
            if (typeof Init_API != "function") {
                function Init_API() {
                    var oApi = {
                        CM: '<%= Apis.CommonV1.Base.AppSetting.GetString("CM") %>',
                        SYS: '<%= Apis.CommonV1.Base.AppSetting.GetString("CM") %>',
                        CMS: '<%= Apis.CommonV1.Base.AppSetting.GetString("CMS") %>',
                        DKH: '<%= Apis.CommonV1.Base.AppSetting.GetString("DKH") %>',
                        KHCT: '<%= Apis.CommonV1.Base.AppSetting.GetString("KHCT") %>',
                        KS: '<%= Apis.CommonV1.Base.AppSetting.GetString("KS") %>',
                        KTX: '<%= Apis.CommonV1.Base.AppSetting.GetString("KTX") %>',
                        NCKH: '<%= Apis.CommonV1.Base.AppSetting.GetString("NCKH") %>',
                        NS: '<%= Apis.CommonV1.Base.AppSetting.GetString("NS") %>',
                        D: '<%= Apis.CommonV1.Base.AppSetting.GetString("D") %>',
                        SV: '<%= Apis.CommonV1.Base.AppSetting.GetString("SV") %>',
                        SMS: '<%= Apis.CommonV1.Base.AppSetting.GetString("SMS") %>',
                        TC: '<%= Apis.CommonV1.Base.AppSetting.GetString("TC") %>',
                        TKGG: '<%= Apis.CommonV1.Base.AppSetting.GetString("TKGG") %>',
                        L: '<%= Apis.CommonV1.Base.AppSetting.GetString("L") %>',
                        CC: '<%= Apis.CommonV1.Base.AppSetting.GetString("CC") %>',
                        HLTL: '<%= Apis.CommonV1.Base.AppSetting.GetString("HLTL") %>',
                        RL: '<%= Apis.CommonV1.Base.AppSetting.GetString("RL") %>',
                        XLHV: '<%= Apis.CommonV1.Base.AppSetting.GetString("XLHV") %>',
                        HDDT: '<%= Apis.CommonV1.Base.AppSetting.GetString("HDDT") %>',
                        NH: '<%= Apis.CommonV1.Base.AppSetting.GetString("NH") %>',
                        TS: '<%= Apis.CommonV1.Base.AppSetting.GetString("TS") %>',
                        LVLA: '<%= Apis.CommonV1.Base.AppSetting.GetString("LVLA") %>',
                        QLTTN: '<%= Apis.CommonV1.Base.AppSetting.GetString("QLTTN") %>',
                        TTN: '<%= Apis.CommonV1.Base.AppSetting.GetString("TTN") %>',
                        TN: '<%= Apis.CommonV1.Base.AppSetting.GetString("TN") %>',
                        CTT: '<%= Apis.CommonV1.Base.AppSetting.GetString("CTT") %>',
                        TP: '<%= Apis.CommonV1.Base.AppSetting.GetString("TP") %>',
                        TT: '<%= Apis.CommonV1.Base.AppSetting.GetString("TT") %>',
                    };

                    return oApi;
                }
            } else {
                console.log("Load config form config.js");
            }
            
            var edu = {};
            edu['system']   = new systemroot();
            edu['extend']   = new systemextend();
            edu['constant'] = new constant();
            edu['util']     = new util();
            $(document).ready(function () {
                edu.system.startApp();
                edu.extend.init();
                edu.constant.init();
            });
        </script>
    </body>
</html>
