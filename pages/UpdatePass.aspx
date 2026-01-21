<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UpdatePass.aspx.cs" Inherits="Apis.LoginVT.Pages.UpdatePass" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Apis - Restore</title>
        <!-- Tell the browser to be responsive to screen width -->
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <link href="../App_Themes/Plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" /><!-- Bootstrap 3.3.7 -->
    <link href="../App_Themes/Plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" /><!--Plugin font awesome -->
    <link href="../App_Themes/Plugins/ionicons/css/ionicons.min.css" rel="stylesheet" /><!--Plugin Ionicons -->
    <link href="../App_Themes/Cms/adminlte/css/AdminLTE.min.css" rel="stylesheet" /><!--Template Style AdminLTE-->
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
                        <i class="fa fa-expeditedssl icon-login"></i> 
                    </p>
                    <p class="login-box-msg">
                        <span style="font-size: 26px; color:#3c8dbc">Vui lòng tạo mật khẩu mới</span>
                    </p>
                    <div class="form-group has-feedback">
                        <input type="password" id="new_pass" name="new_pass" class="form-control" placeholder="Nhập mật khẩu mới" autocomplete="off" autofocus="autofocus"/>
                        <i class="fa fa-eye-slash form-control-feedback"></i>
                    </div>
                    <div class="form-group has-feedback">
                        <input type="password" id="renew_pass" name="renew_pass" class="form-control" placeholder="Nhập lại mật khẩu" autocomplete="off" autofocus="autofocus"/>
                        <i class="fa fa-eye-slash form-control-feedback"></i>
                    </div>
                    <div class="row">
                        <div class="col-xs-5">
                            
                        </div>
                        <!-- /.col -->
                        <div class="col-xs-7">
                            <div class="pull-right" style="width: auto">
                                <asp:Button ID="cms_update_pass" runat="server" OnClick="updatePass_Click" CssClass="btn btn-primary btn-block btn-flat" Text="Cập nhật" />
                            </div>
                        </div>
                        <!-- /.col -->
                    </div>                
                    <div class="row login-notify">
                        <p class="box-notify">
                            <asp:Label Width="100%" runat="server" Text="" ID="lblNotify_UP"></asp:Label>
                        </p>
                    </div>
                </div>
            </div>
        </form>
    </form>
</body>
</html>
