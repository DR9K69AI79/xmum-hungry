#!/bin/bash

echo -e "\033[32mStarting XMUM Hungry Server...\033[0m"
echo ""
echo -e "\033[33mThis script will start the PHP development server from the project root\033[0m"
echo -e "\033[33mso that both the frontend (public/) and API (api/) are accessible.\033[0m"
echo ""
echo -e "\033[36mServer will be available at: http://localhost:8082\033[0m"
echo -e "\033[36mLogin page: http://localhost:8082/public/login.html\033[0m"
echo -e "\033[36mMain app: http://localhost:8082/public/index.html\033[0m"
echo -e "\033[36mAdmin panel: http://localhost:8082/public/admin.html\033[0m"
echo ""
echo -e "\033[35mDemo credentials:\033[0m"
echo -e "\033[37mEmail: demo@xmum.edu.my\033[0m"
echo -e "\033[37mPassword: demo123\033[0m"
echo ""
echo -e "\033[31mPress Ctrl+C to stop the server\033[0m"
echo ""

php -t . -S localhost:8082
