@echo off
setlocal EnableExtensions

set "SRC=D:\Cloud\Dropbox\LoginVTGit"
set "DST=D:\Cloud\Dropbox\LoginVT"

echo ================================================
echo Copy danh sach FIX CUNG tu LoginVTGit sang LoginVT
echo ================================================

echo [FOLDER] ApisChuyenCan
if exist "%SRC%\ApisChuyenCan\" (
    robocopy "%SRC%\ApisChuyenCan" "%DST%\ApisChuyenCan" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisChuyenCan
)

echo [FOLDER] ApisCMS
if exist "%SRC%\ApisCMS\" (
    robocopy "%SRC%\ApisCMS" "%DST%\ApisCMS" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisCMS
)

echo [FOLDER] ApisCongCanBo
if exist "%SRC%\ApisCongCanBo\" (
    robocopy "%SRC%\ApisCongCanBo" "%DST%\ApisCongCanBo" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisCongCanBo
)

echo [FOLDER] ApisCongSinhVien
if exist "%SRC%\ApisCongSinhVien\" (
    robocopy "%SRC%\ApisCongSinhVien" "%DST%\ApisCongSinhVien" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisCongSinhVien
)

echo [FOLDER] ApisDangKyHoc
if exist "%SRC%\ApisDangKyHoc\" (
    robocopy "%SRC%\ApisDangKyHoc" "%DST%\ApisDangKyHoc" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisDangKyHoc
)

echo [FOLDER] ApisDanhHieu
if exist "%SRC%\ApisDanhHieu\" (
    robocopy "%SRC%\ApisDanhHieu" "%DST%\ApisDanhHieu" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisDanhHieu
)

echo [FOLDER] ApisHocBong
if exist "%SRC%\ApisHocBong\" (
    robocopy "%SRC%\ApisHocBong" "%DST%\ApisHocBong" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisHocBong
)

echo [FOLDER] ApisHocLaiThiLai
if exist "%SRC%\ApisHocLaiThiLai\" (
    robocopy "%SRC%\ApisHocLaiThiLai" "%DST%\ApisHocLaiThiLai" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisHocLaiThiLai
)

echo [FOLDER] ApisKeHoachChuongTrinh
if exist "%SRC%\ApisKeHoachChuongTrinh\" (
    robocopy "%SRC%\ApisKeHoachChuongTrinh" "%DST%\ApisKeHoachChuongTrinh" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisKeHoachChuongTrinh
)

echo [FOLDER] ApisNhanSu
if exist "%SRC%\ApisNhanSu\" (
    robocopy "%SRC%\ApisNhanSu" "%DST%\ApisNhanSu" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisNhanSu
)

echo [FOLDER] ApisNhapHoc
if exist "%SRC%\ApisNhapHoc\" (
    robocopy "%SRC%\ApisNhapHoc" "%DST%\ApisNhapHoc" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisNhapHoc
)

echo [FOLDER] ApisQuanLyDiem
if exist "%SRC%\ApisQuanLyDiem\" (
    robocopy "%SRC%\ApisQuanLyDiem" "%DST%\ApisQuanLyDiem" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisQuanLyDiem
)

echo [FOLDER] ApisQuanLyTuyenSinh
if exist "%SRC%\ApisQuanLyTuyenSinh\" (
    robocopy "%SRC%\ApisQuanLyTuyenSinh" "%DST%\ApisQuanLyTuyenSinh" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisQuanLyTuyenSinh
)

echo [FOLDER] ApisRenLuyen
if exist "%SRC%\ApisRenLuyen\" (
    robocopy "%SRC%\ApisRenLuyen" "%DST%\ApisRenLuyen" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisRenLuyen
)

echo [FOLDER] ApisSinhVien
if exist "%SRC%\ApisSinhVien\" (
    robocopy "%SRC%\ApisSinhVien" "%DST%\ApisSinhVien" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisSinhVien
)

echo [FOLDER] ApisTaiChinh
if exist "%SRC%\ApisTaiChinh\" (
    robocopy "%SRC%\ApisTaiChinh" "%DST%\ApisTaiChinh" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisTaiChinh
)

echo [FOLDER] ApisThiPhach
if exist "%SRC%\ApisThiPhach\" (
    robocopy "%SRC%\ApisThiPhach" "%DST%\ApisThiPhach" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisThiPhach
)

echo [FOLDER] ApisTinTuc
if exist "%SRC%\ApisTinTuc\" (
    robocopy "%SRC%\ApisTinTuc" "%DST%\ApisTinTuc" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisTinTuc
)

echo [FOLDER] ApisTKGG
if exist "%SRC%\ApisTKGG\" (
    robocopy "%SRC%\ApisTKGG" "%DST%\ApisTKGG" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisTKGG
)

echo [FOLDER] ApisTotNghiep
if exist "%SRC%\ApisTotNghiep\" (
    robocopy "%SRC%\ApisTotNghiep" "%DST%\ApisTotNghiep" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisTotNghiep
)

echo [FOLDER] ApisXuLyHocVu
if exist "%SRC%\ApisXuLyHocVu\" (
    robocopy "%SRC%\ApisXuLyHocVu" "%DST%\ApisXuLyHocVu" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\ApisXuLyHocVu
)

echo [FOLDER] App_Themes
if exist "%SRC%\App_Themes\" (
    robocopy "%SRC%\App_Themes" "%DST%\App_Themes" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\App_Themes
)

echo [FOLDER] assets
if exist "%SRC%\assets\" (
    robocopy "%SRC%\assets" "%DST%\assets" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\assets
)

echo [FOLDER] Core
if exist "%SRC%\Core\" (
    robocopy "%SRC%\Core" "%DST%\Core" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\Core
)

echo [FOLDER] Corei
if exist "%SRC%\Corei\" (
    robocopy "%SRC%\Corei" "%DST%\Corei" /E /COPY:DAT /DCOPY:DAT /R:1 /W:1
) else (
    echo [KHONG TIM THAY] %SRC%\Corei
)

echo [FILE] index.aspx
if exist "%SRC%\index.aspx" (
    copy /Y "%SRC%\index.aspx" "%DST%\index.aspx" >nul
) else (
    echo [KHONG TIM THAY] %SRC%\index.aspx
)

echo [FILE] indexi.aspx
if exist "%SRC%\indexi.aspx" (
    copy /Y "%SRC%\indexi.aspx" "%DST%\indexi.aspx" >nul
) else (
    echo [KHONG TIM THAY] %SRC%\indexi.aspx
)

echo ================================================
echo Hoan tat.
echo ================================================
pause
endlocal