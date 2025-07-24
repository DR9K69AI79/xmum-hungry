Write-Host "Starting XMUM Hungry Server..." -ForegroundColor Green
Write-Host ""
Write-Host "This script will start the PHP development server from the project root" -ForegroundColor Yellow
Write-Host "so that both the frontend (public/) and API (api/) are accessible." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server will be available at: http://localhost:8082" -ForegroundColor Cyan
Write-Host "Login page: http://localhost:8082/public/login.html" -ForegroundColor Cyan
Write-Host "Main app: http://localhost:8082/public/index.html" -ForegroundColor Cyan
Write-Host "Admin panel: http://localhost:8082/public/admin.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo credentials:" -ForegroundColor Magenta
Write-Host "Email: demo@xmum.edu.my" -ForegroundColor White
Write-Host "Password: demo123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

php -t . -S localhost:8082
