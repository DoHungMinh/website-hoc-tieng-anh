# ---

**TỔNG HỢP FULL LỆNH: SETUP DEVENIR \+ N8N CHẠY 24/7 & PUBLIC**

**Mô tả:** Dưới đây là toàn bộ lệnh từ đầu đến cuối để thiết lập hệ thống 1 MERN app (devenir) \+ n8n chạy 24/7 và public ra internet qua Tailscale Funnel1.

---

PHẦN 1: CÀI ĐẶT CÔNG CỤ CƠ BẢN 2

Chạy lần lượt các lệnh sau để cài đặt môi trường cần thiết:

Bash

\# Cập nhật Ubuntu  
sudo apt update && sudo apt upgrade \-y \[cite: 5, 6\]

\# Cài Node.js & npm  
sudo apt install \-y nodejs npm \[cite: 7, 8\]

\# Cài PM2 (Quản lý process cho Node.js)  
sudo npm install \-g pm2 \[cite: 9, 10\]

\# Cài Docker & Docker Compose  
sudo apt install \-y docker.io \[cite: 11, 12\]  
sudo systemctl enable-now docker \[cite: 13\]  
sudo apt install \-y docker-compose-plugin \[cite: 14\]

\# Thêm user hiện tại vào group docker (để chạy docker không cần sudo)  
sudo usermod \-aG docker $USER \[cite: 15, 16\]

\# Cài Nginx  
sudo apt install \-y nginx \[cite: 17, 18\]

\# Cài Tailscale (nếu chưa có)  
curl \-fsSL https://tailscale.com/install.sh | sh \[cite: 19, 20\]  
sudo systemctl enable-now tailscaled \[cite: 21\]

\# Logout và login lại để áp dụng group docker  
exit \[cite: 22\]  
\# (Sau đó SSH lại vào máy Linux) \[cite: 23\]

---

PHẦN 2: SETUP PM2 CHO DEVENIR 3

Bước 2.1: Chuẩn bị project devenir 4

Kiểm tra đường dẫn project và đảm bảo file server.js nhận PORT từ environment:

JavaScript

// Đảm bảo trong code server.js có đoạn:  
const port \= process.env.PORT || 3111;  
app.listen(port, '0.0.0.0', () \=\> {  
    console.log(\`Devenir server listening on port ${port}\`);  
});

5

Bước 2.2: Dọn dẹp PM2 cũ (nếu có) 6

Bash

pm2 delete all  \# Xóa tất cả apps cũ \[cite: 33, 34\]  
pm2 list        \# Kiểm tra đã sạch \[cite: 35, 36\]

Bước 2.3: Tạo file cấu hình PM2 7

Bash

mkdir \-p \~/server  
nano \~/server/ecosystem.config.js \[cite: 38-41\]

**Nội dung file ecosystem.config.js:**

JavaScript

module.exports \= {  
  apps: \[  
    {  
      name: 'devenir-server',  
      script: 'server.js',  
      cwd: '/home/nguyenlehuy/projects/devenir', // Thay path này nếu khác project của bạn  
      env: {  
        PORT: 3111,  
        NODE\_ENV: 'production'  
      },  
      instances: 1,  
      autorestart: true,  
      watch: false,  
      max\_memory\_restart: '500M'  
    }  
  \]  
};

8*(Lưu: Ctrl+O, Enter, Ctrl+X)* 9

\+1

Bước 2.4: Khởi động PM2 10

Bash

cd \~/server  
pm2 start ecosystem.config.js \[cite: 61-64\]  
pm2 list      \# Phải thấy "devenir-server" status "online" \[cite: 66, 67\]  
pm2 logs devenir-server \--lines 50 \[cite: 68, 69\]

Bước 2.5: Setup auto-start (Khởi động cùng hệ thống) 11

Bash

pm2 startup systemd \[cite: 71, 72\]  
\# Copy và chạy lệnh mà PM2 in ra màn hình (dạng: sudo env PATH=...) \[cite: 73\]  
pm2 save \[cite: 74\]

---

PHẦN 3: SETUP N8N VỚI DOCKER 12

Bước 3.1: Tạo docker-compose.yml 13

Bash

mkdir \-p \~/n8n-server  
cd \~/n8n-server  
nano docker-compose.yml \[cite: 77-81\]

**Nội dung file docker-compose.yml:**

YAML

version: '3.8'  
services:  
  n8n:  
    image: n8nio/n8n:latest  
    restart: unless-stopped  
    ports:  
      \- "5678:5678"  
    environment:  
      \- TZ=Asia/Ho\_Chi\_Minh  
      \- N8N\_PORT=5678  
      \- N8N\_PROTOCOL=https  
      \- N8N\_HOST=nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net  
      \- N8N\_PATH=/n8n/  
      \- WEBHOOK\_URL=https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/n8n/  
      \- N8N\_PROXY\_HOPS=1  
    volumes:  
      \- n8n\_data:/home/node/.n8n  
    user: "1000:1000"

volumes:  
  n8n\_data:

14*(Lưu: Ctrl+O, Enter, Ctrl+X)* 15

\+1

Bước 3.2: Khởi động n8n 16

Bash

cd \~/n8n-server  
docker compose up \-d \[cite: 102, 103\]  
docker compose ps      \# Phải thấy n8n status "Up" \[cite: 104-106\]  
docker compose logs \-f n8n  \# Ctrl+C để thoát \[cite: 107, 108\]

Bước 3.3: Test local 17

Bash

curl http://localhost:5678  
curl http://localhost:3111  
ss \-tlnp | grep \-E '3111|5678' \[cite: 110-113\]

---

PHẦN 4: SETUP NGINX REVERSE PROXY 18

Bước 4.1: Cấu hình chung Nginx 19

Bash

sudo nano /etc/nginx/nginx.conf \[cite: 116\]

Thêm dòng này vào trong khối http { ... }:

Nginx

server\_names\_hash\_bucket\_size 128;

20*(Lưu: Ctrl+O, Enter, Ctrl+X)* 21

\+1

Bước 4.2: Tạo file site config 22

Bash

sudo nano /etc/nginx/sites-available/devenir-n8n \[cite: 125\]

**Nội dung file:**

Nginx

\# Server block cho Tailscale Funnel (HTTP trên port 8080\)  
server {  
    listen 8080;  
    server\_name nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net;

    \# Devenir MERN app  
    location /devenir/ {  
        proxy\_pass http://127.0.0.1:3111/;  
        proxy\_set\_header Host $host;  
        proxy\_set\_header X-Real-IP $remote\_addr;  
        proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
        proxy\_set\_header X-Forwarded-Proto https;  
    }

    \# n8n  
    location /n8n/ {  
        proxy\_pass http://127.0.0.1:5678/;  
        proxy\_set\_header Host $host;  
        proxy\_set\_header X-Real-IP $remote\_addr;  
        proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
        proxy\_set\_header X-Forwarded-Proto https;  
        proxy\_http\_version 1.1;  
        proxy\_set\_header Upgrade $http\_upgrade;  
        proxy\_set\_header Connection "upgrade";  
        proxy\_read\_timeout 300s;  
        proxy\_connect\_timeout 75s;  
    }

    \# Root  
    location / {  
        return 200 "Devenir Server is running\!\\n\\nAccess: \\n- Devenir: /devenir/\\n- n8n: /n8n/";  
        add\_header Content-Type text/plain;  
    }  
}

\# Server block HTTPS cho local testing (tùy chọn)  
server {  
    listen 443 ssl;  
    server\_name nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net;  
    ssl\_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;  
    ssl\_certificate\_key /etc/ssl/private/ssl-cert-snakeoil.key;

    location /devenir/ {  
        proxy\_pass http://127.0.0.1:3111/;  
        proxy\_set\_header Host $host;  
        proxy\_set\_header X-Real-IP $remote\_addr;  
        proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
        proxy\_set\_header X-Forwarded-Proto $scheme;  
    }

    location /n8n/ {  
        proxy\_pass http://127.0.0.1:5678/;  
        proxy\_set\_header Host $host;  
        proxy\_set\_header X-Real-IP $remote\_addr;  
        proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;  
        proxy\_set\_header X-Forwarded-Proto $scheme;  
        proxy\_http\_version 1.1;  
        proxy\_set\_header Upgrade $http\_upgrade;  
        proxy\_set\_header Connection "upgrade";  
        proxy\_read\_timeout 300s;  
        proxy\_connect\_timeout 75s;  
    }

    location / {  
        return 200 "Devenir Server is running\!\\n\\nAccess: \\n- Devenir: /devenir/\\n- n8n: /n8n/";  
        add\_header Content-Type text/plain;  
    }  
}

\# Redirect HTTP to HTTPS (Port 80 \-\> HTTPS)  
server {  
    listen 80;  
    server\_name nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net;  
    return 301 https://$host$request\_uri;  
}

23*(Lưu: Ctrl+O, Enter, Ctrl+X)* 24

\+1

Bước 4.3: Enable và reload Nginx 25

Bash

\# Enable site  
sudo ln \-s /etc/nginx/sites-available/devenir-n8n /etc/nginx/sites-enabled/ \[cite: 195\]

\# Xóa default site  
sudo rm /etc/nginx/sites-enabled/default \[cite: 196, 197\]

\# Test config  
sudo nginx \-t \[cite: 198, 199\]

\# Reload và Enable nginx  
sudo systemctl reload nginx \[cite: 200, 201\]  
sudo systemctl enable nginx \[cite: 202, 203\]

Bước 4.4: Test local 26

Bash

\# Test HTTP port 8080 (Funnel port)  
curl http://localhost:8080/n8n/  
curl http://localhost:8080/devenir/ \[cite: 205-207\]

\# Test HTTPS port 443 (Local SSL)  
curl \-k https://localhost/n8n/  
curl \-k https://localhost/devenir/ \[cite: 208-210\]

---

PHẦN 5: PUBLIC RA INTERNET VỚI TAILSCALE FUNNEL 27

Bước 5.1: Tắt funnel cũ (nếu có) 28

Bash

sudo tailscale funnel off \[cite: 213\]

Bước 5.2: Bật Tailscale Funnel 29

Cấu hình: Nhận HTTPS port 443 từ internet, forward vào HTTP localhost:8080.

Bash

sudo tailscale funnel \--bg \--https=443 http://127.0.0.1:8080 \[cite: 215\]  
tailscale funnel status \[cite: 216, 217\]

Bước 5.3: Test từ Mac/điện thoại 30

Truy cập trình duyệt:

* https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/n8n/ 31

* https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/devenir/ 32

---

PHẦN 6: KIỂM TRA TOÀN BỘ HỆ THỐNG 33

Bash

pm2 list                  \# devenir-server: online \[cite: 224, 226\]  
docker compose ps         \# n8n: Up \[cite: 225, 227\]  
sudo systemctl status nginx \# nginx: active \[cite: 228\]  
tailscale funnel status   \# funnel: active \[cite: 229, 231\]  
ss \-tlnp | grep \-E '3111|5678|8080|443' \[cite: 232\]

---

PHẦN 7: TEST SAU REBOOT 34

Bash

sudo reboot \[cite: 235\]  
\# Đợi 2 phút, SSH lại và kiểm tra \[cite: 236\]  
pm2 list  
docker compose ps  
sudo systemctl status nginx  
tailscale funnel status \[cite: 238-241\]

\# Nếu funnel không tự động bật, chạy lại:  
sudo tailscale funnel \--bg \--https=443 http://127.0.0.1:8080 \[cite: 242, 243\]

---

LỆNH QUẢN LÝ HỮU ÍCH 35

Xem logs 36

* **PM2:** pm2 logs devenir-server 37

* **Docker:** cd \~/n8n-server && docker compose logs \-f n8n 38

* **Nginx:** sudo journalctl \-u nginx \-f 39

Restart services 40

* **Devenir:** pm2 restart devenir-server 41

* **n8n:** cd \~/n8n-server && docker compose restart 42

* **Nginx:** sudo systemctl restart nginx 43

* **Funnel:**  
  Bash  
  sudo tailscale funnel off  
  sudo tailscale funnel \--bg \--https=443 http://127.0.0.1:8080

  44

Stop services 45

* **PM2:** pm2 stop all 46

* **n8n:** cd \~/n8n-server && docker compose down 47

* **Nginx:** sudo systemctl stop nginx 48

* **Funnel:** sudo tailscale funnel off 49

---

CHECKLIST HOÀN THÀNH 50

* \[x\] PM2 chạy devenir-server (port 3111\) 51

* \[x\] Docker chạy n8n (port 5678\) 52

* \[x\] Nginx listen HTTP port 8080 (cho Funnel) 53

* \[x\] Nginx listen HTTPS port 443 (cho local) 54

* \[x\] Tailscale Funnel public ra internet 55

* \[x\] Test local thành công 56

* \[x\] Test public thành công 57

* \[x\] Test sau reboot thành công 58

**Hoàn thành\!** Hệ thống chạy 24/7, tự động khởi động và public an toàn qua Tailscale Funnel. 59

---

**Bạn có muốn tôi tạo file .md này để bạn tải về ngay không?**