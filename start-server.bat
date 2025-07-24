@echo off
echo Starting XMUM Hungry Server...
echo.
echo This script will start the PHP development server from the project root
echo so that both the frontend (public/) and API (api/) are accessible.
echo.
echo Server will be available at: http://localhost:8082
echo Login page: http://localhost:8082/public/login.html
echo Main app: http://localhost:8082/public/index.html
echo Admin panel: http://localhost:8082/public/admin.html
echo.
echo Demo credentials:
echo Email: demo@xmum.edu.my
echo Password: demo123
echo.
echo Press Ctrl+C to stop the server
echo.

php -t . -S localhost:8082
