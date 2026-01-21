<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="phuhuynhdangky.aspx.cs" Inherits="Apis.LoginVT.pages.theodoinhaphoc" %>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Education management</title>
    <link rel="stylesheet" href="../assets/css/styles.css?v=1">
</head>

<body>
    <div class="overlay" id="overlay" style="position:fixed; margin-top:150px; z-index:1051; margin-left:50%; display:none">
        <i style="color:#00a65a; font-size: 80px" class="fad fa-sync-alt fa-spin"></i>
    </div>
    <div class="page-parent-register">
        <form class="parent-register-content">
            <div class="parent-title mt-30 mt-lg-55 px-15 px-lg-55">
                Đề nghị xin cấp tài khoản cho phụ huynh
            </div>
            <div class="fs-20 fw-bold mt-22 mb-30 px-15 px-lg-55">Nhập thông tin cá nhân phụ huynh</div>
            <div class="parent-resgiter-form px-15 px-lg-40">
                <div class="row">
                    <div class="col-12 col-md-6 px-md-15 px-lg-35">
                        <div class="input-label-left mb-16">
                            <label class="mt-7 min-w-70p">Họ đệm</label>
                            <span class="mx-5 mt-7 text-red">*</span>
                            <div class="input">
                                <input type="text" id="txtHoDem" class="form-control">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 px-md-15 px-lg-35">
                        <div class="input-label-left mb-16">
                            <label class="mt-7 min-w-70p">Tên</label>
                            <span class="mx-5 mt-7 text-red">*</span>
                            <div class="input">
                                <input type="text" class="form-control" id="txtTen">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 px-md-15 px-lg-35">
                        <div class="input-label-left mb-16">
                            <label class="mt-7 min-w-70p">Số điện thoại</label>
                            <span class="mx-5 mt-7 text-red">*</span>
                            <div class="input">
                                <input type="text" class="form-control" id="txtSoDienThoai">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 px-md-15 px-lg-35">
                        <div class="input-label-left mb-16">
                            <label class="mt-7 min-w-70p">Email cá nhân</label>
                            <span class="mx-5 mt-7 text-red">*</span>
                            <div class="input">
                                <input type="text" class="form-control" id="txtEmail">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 px-md-15 px-lg-35">
                        <div class="input-label-left mb-16">
                            <label class="mt-7 min-w-70p">Mối quan hệ gia đình</label>
                            <div class="d-flex flex-grow-1">
                                <span class="mx-5 mt-7 text-red">*</span>
                                <div class="position-relative" style="width: 100%">
                                    <select id="dropMoiQuanHe" class="form-select  select-opt">
                                        <option value="">Chọn mối quan hệ</option>
                                    </select>

                                </div>

                            </div>
                        </div>

                    </div>
                    <div class="col-12 col-md-6 px-md-15 px-lg-35 d-none d-md-block">
                        <div class="opacity-50 fs-14 mt-7" style="margin-left: -65px;">(Người học đang học tai trường)</div>
                    </div>
                    <div class="col-12 px-md-15 px-lg-35">

                        <div class="input-label-left mb-16">
                            <label class="mt-7 min-w-70p">Có thể nêu thêm các đề xuất, mong muốn khác với trường (nếu có)</label>
                            <span class="mx-5 mt-7 opacity-0">*</span>
                            <textarea name="" id="txtGhiChu" rows="4" class="form-control"></textarea>
                        </div>

                    </div>
                </div>
            </div>
            <div class="fs-20 fw-bold mt-22 mb-20 px-15 px-lg-55">Nhập thông tin sinh viên</div>
            <div class="px-15 px-lg-55">
                <div class="table-responsive fs-14 ">
                    <table class="table" id="tblSinhVien">
                        <thead>
                            <tr>
                                <th class="text-center border-top-1" scope="col">STT</th>
                                <th class="min-w-85p border-top-1" scope="col">Mã sinh viên</th>
                                <th class="min-w-110p border-top-1" scope="col">Họ đệm</th>
                                <th class="min-w-100p border-top-1" scope="col">Tên</th>
                                <th class="min-w-180p border-top-1 py-11" scope="col">Ngành học</th>
                                <th class="min-w-100p border-top-1  py-11" scope="col">Khóa học</th>
                                <th class="text-center border-top-1  py-11" scope="col">Xóa</th>

                            </tr>

                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div class="d-flex justify-content-end ">
                        <a class="btn btn-add btn-sm btnAdd_SinhVien">
                                <i class="fal fa-plus "></i>
                                <span>Thêm</span>
                            </a>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end px-15 px-lg-55 mt-20 mb-50">
                <a id="btnSaveGiaDinh" class="btn btn-btn-parent-send  gradient-1 pointer-event">
                    <span>Gửi thông tin</span>
                    <i class="fa-solid fa-paper-plane-top ms-10"></i>
                </a>
            </div>
        </form>
        <div class="parent-register-logo ">
            <a href="# " class=" ">
                <img src="../assets/images/logo/logo-full.png " alt=" ">
            </a>

        </div>
    </div>
    <div id="alert"></div>
    <!-- JS -->
    <script src="../assets/bootstrap-5.3.2/js/bootstrap.bundle.js "></script>
    <script src="../assets/swiper-slide/swiper-bundle.min.js "></script>
    <script src="../assets/js/jquery-3.7.1.min.js "></script>
    <script src="../assets/js/customs.js "></script>
    
<script type="text/javascript" src="../Core/constant.js?v=1.3.1.0"></script>    <!--CORE JS-->
<script type="text/javascript" src="../Core/systemroot.js?v=1.3.1.18"></script>  <!--CORE JS-->
<script type="text/javascript" src="../Core/util.js?v=1.3.1.14"></script>        <!--CORE JS-->
<script type="text/javascript" src="../Core/systemextend.js?v=1.3.1.2"></script><!--CORE JS-->
<script type="text/javascript" src="../Config.js?v=1.3.1.2"></script><!--CORE JS-->
<script type="text/javascript">

    function Init_Prammater() {
        var rootPath        = '<%= Apis.CommonV1.Base.AppSetting.GetString("RootPath") %>';
        var rootPathUpload  = '<%= Apis.CommonV1.Base.AppSetting.GetString("RootPathUpload") %>';

        var oConfig = {
            rootPath: rootPath,
            rootPathUpload: rootPathUpload,
            rootPathReport: "",
                    
            avatar: '',
            folderAvatar: '',
            folderDoc: '',

            appId: '',
            userId: '',
            langId: '',
            tokenJWT: '',
            iDisableChucNang: true
        };
                
        return oConfig;
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
    
<script src="phuhuynhdangky.js?v=<%=  Guid.NewGuid().ToString() %>"></script>
    
<script type="text/javascript">
    var main_doc = {};
    main_doc['PhuHuynh'] = new PhuHuynh();
    $(document).ready(function () {
        main_doc.PhuHuynh.init();
    });
</script>

</body>

</html>