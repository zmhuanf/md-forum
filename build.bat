@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

if not exist "package.json" (
    echo 未找到 package.json 请在项目根目录运行
    exit /b 1
)

set "OUT=%~dp0out"

if exist "%OUT%" (
    echo out 目录已存在 继续会清空其中的内容
    choice /c YN /m "确认覆盖"
    if errorlevel 2 exit /b 1
    rd /s /q "%OUT%" || goto fail
)

mkdir "%OUT%" || goto fail
xcopy "src" "%OUT%\src" /E /I /Y /Q >nul || goto fail
xcopy "public" "%OUT%\public" /E /I /Y /Q >nul || goto fail
for %%f in (package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs next-env.d.ts .env.example) do (
    copy /y "%%f" "%OUT%" >nul || goto fail
)
copy /y "start.sh" "%OUT%" >nul || goto fail

echo.
echo 打包完成 %OUT%
echo 1 把 out 里的全部内容上传到服务器项目目录
echo 2 把本地的 .data 目录上传到项目目录
echo 3 服务器上执行 bash start.sh
exit /b 0

:fail
echo 复制失败 请检查文件是否被占用
exit /b 1
