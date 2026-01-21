<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ChangePass.aspx.cs" Inherits="Apis.LoginVT.Pages.ChangePass" %>

<!DOCTYPE html>

<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Apis - Login</title>
        <!-- Tell the browser to be responsive to screen width -->
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link href="../App_Themes/Plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" /><!-- Bootstrap 3.3.7 -->
    <link href="../App_Themes/Plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" /><!--Plugin font awesome -->
    <link href="../App_Themes/Plugins/ionicons/css/ionicons.min.css" rel="stylesheet" /><!--Plugin Ionicons -->
    <link href="../App_Themes/Cms/adminlte/css/AdminLTE.min.css" rel="stylesheet" /><!--Template Style AdminLTE-->
    <link href="../App_Themes/Cms/css/index.css" rel="stylesheet" /><!--Index - user defined-->
    <!-- jQuery 3 -->
    <script type="text/javascript" src="../App_Themes/Plugins/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../App_Themes/Plugins/encrypt/encrypt.js"></script>
    <script type="text/javascript" src="../App_Themes/Plugins/jquery-slimscroll/jquery.slimscroll.min.js"></script>
</head>
<body class="hold-transition login-page">
    <form runat="server">
        <form action="#" method="post" onsubmit="return false">
            <div class="login-box">
                 <div class="login-logo">
                    <a href="#"><img border="0" src="<%=logo %>" height="120" /></a>
                </div>
                <!-- /.login-logo -->
                <div class="login-box-body">
                    <p class="login-box-msg">
                        <i class="fa fa-key icon-login"></i> 
                    </p>
                    <p class="login-box-msg">
                        <span style="font-size: 26px; color:#3c8dbc">Thay đổi mật khẩu</span>
                        <asp:Label Width="100%" runat="server" ForeColor="Red" Text="" ID="lblNotify"></asp:Label>
                    </p>
                    <div class="form-group has-feedback">
                        <input type="password" id="old_password" name="old_password" class="form-control" autocomplete="off" autofocus="autofocus" placeholder="Nhập mật khẩu hiện tại"/>
                        <span class="fa fa fa-eye-slash form-control-feedback"></span>
                    </div>
                    <div class="form-group has-feedback">
                        <input type="password" id="new_password" name="new_password" class="form-control" autocomplete="off" autofocus="autofocus" placeholder="Nhập mật khẩu mới"/>
                        <span class="fa fa fa-eye-slash form-control-feedback"></span>
                    </div>
                    <div class="form-group has-feedback">
                        <input type="password" id="retype_password" name="retype_password" class="form-control" autocomplete="off" placeholder="Nhập lại mật khẩu mới" >
                        <span class="fa fa fa-eye-slash form-control-feedback"></span>
                    </div>
                    <div class="row">
                        <div class="col-xs-5">
                        </div>
                        <!-- /.col -->
                        <div class="col-xs-7">
                            <div class="pull-right" style="width: auto">
                                <asp:Button ID="cms_authenticate_do_login" runat="server" CssClass="btn btn-primary btn-block btn-flat" Text="Thay đổi" OnClick="changePassword_Click" />
                            </div>
                        </div>
                        <!-- /.col -->
                    </div> 
                    <div class="row">
                        <p class="box-notify"><asp:Label Width="100%" runat="server" ForeColor="Red" Text="" ID="lblNotify_ChangePass"></asp:Label></p>
                    </div>
                </div>
                <div class="login-box-footer">
                    <a title="Quên mật khẩu" target="_blank" href="Pages/ForgetPass.aspx"><b>Quên mật khẩu?</b></a><br>
                    <a title="Trợ giúp" target="_blank" href="Pages/Support.aspx"><b>Trợ giúp!</b></a><br>
                </div>
            </div>
        </form>
    </form>
</body>
</html>