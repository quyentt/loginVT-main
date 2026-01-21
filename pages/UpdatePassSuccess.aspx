<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UpdatePassSuccess.aspx.cs" Inherits="Apis.LoginVT.Pages.UpdatePassSuccess" %>

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
                        <i class="fa fa-unlock icon-login"></i> 
                    </p>
                    <p class="login-box-msg" style="font-size: 26px; color:#3c8dbc">
                        <asp:Label Width="100%" runat="server" Text="" ID="lblNotify_UPS"></asp:Label>
                    </p>
                    <div class="row">
                         <div class="col-xs-5">
                            
                        </div>
                        <!-- /.col -->
                        <div class="col-xs-7">
                            <div class="pull-right" style="width: auto">
                                <asp:LinkButton runat="server" ID="btnTurnBackLogin_UPS" OnClick="backLogin_Click"  Text="Quay lại đăng nhập"></asp:LinkButton>
                            </div>
                        </div>
                    </div>                
                    <div class="row login-notify">
                        
                    </div>
                </div>
            </div>
        </form>
    </form>
</body>
</html>
