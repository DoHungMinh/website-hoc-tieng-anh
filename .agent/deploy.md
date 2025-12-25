# 🚀 HƯỚNG DẪN DEPLOY ENGPRO

## Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    VERCEL (Free Tier)                       │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                 │  │
│  │  │  Client App     │    │  Admin App      │                 │  │
│  │  │  (React/Vite)   │    │  (React/Vite)   │                 │  │
│  │  │                 │    │                 │                 │  │
│  │  │  engpro.vercel  │    │  engpro-admin   │                 │  │
│  │  │     .app        │    │  .vercel.app    │                 │  │
│  │  └────────┬────────┘    └────────┬────────┘                 │  │
│  └───────────┼──────────────────────┼──────────────────────────┘  │
│              │                      │                             │
│              │    HTTPS requests    │                             │
│              └──────────┬───────────┘                             │
│                         ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              LINUX SERVER (Self-hosted)                     │  │
│  │                                                             │  │
│  │    ┌───────────────────────────────────────────────────┐    │  │
│  │    │              Tailscale Funnel                     │    │  │
│  │    │         (Public HTTPS endpoint)                   │    │  │
│  │    │   nguyenlehuy-xxx.tail86e288.ts.net/engpro/       │    │  │
│  │    └──────────────────────┬────────────────────────────┘    │  │
│  │                           │                                 │  │
│  │    ┌──────────────────────▼────────────────────────────┐    │  │
│  │    │           Nginx Reverse Proxy                     │    │  │
│  │    │              (Port 8080)                          │    │  │
│  │    └──────────────────────┬────────────────────────────┘    │  │
│  │                           │                                 │  │
│  │    ┌──────────────────────▼────────────────────────────┐    │  │
│  │    │         PM2 Process Manager                       │    │  │
│  │    │   ┌─────────────────────────────────────────┐     │    │  │
│  │    │   │  engpro-server (Node.js/Express)        │     │    │  │
│  │    │   │  Port: 5003                             │     │    │  │
│  │    │   └─────────────────────────────────────────┘     │    │  │
│  │    └───────────────────────────────────────────────────┘    │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## PHẦN 1: DEPLOY BACKEND LÊN LINUX SERVER

### 1.1. Chuẩn bị server Linux (SSH vào server)

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v  # Phải là v20.x.x
npm -v

# Cài PM2
sudo npm install -g pm2

# Cài Nginx
sudo apt install -y nginx

# Cài Tailscale (nếu chưa có)
curl -fsSL https://tailscale.com/install.sh | sh
sudo systemctl enable --now tailscaled
```

### 1.2. Tạo thư mục project

```bash
# Tạo thư mục cho EngPro
mkdir -p ~/projects/engpro
cd ~/projects/engpro
```

### 1.3. Clone hoặc upload code backend

**Cách 1: Dùng Git**
```bash
git clone https://github.com/YOUR_USERNAME/EngPro.git .
cd backend
npm ci
npm run build
```

**Cách 2: Dùng SCP từ Mac**
```bash
# Trên Mac, chạy lệnh này
scp -r /Users/nguyenlehuy/Downloads/Clone/EngPro/backend nguyenlehuy@YOUR_LINUX_IP:~/projects/engpro/

# SSH vào Linux và cài dependencies
cd ~/projects/engpro/backend
npm ci
npm run build
```

### 1.4. Tạo file .env trên server

```bash
nano ~/projects/engpro/backend/.env
```

Nội dung (thay bằng giá trị thực):
```env
NODE_ENV=production
PORT=5003

# MongoDB
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/engpro

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URLs (sẽ cập nhật sau khi deploy Vercel)
FRONTEND_URL=https://engpro-client.vercel.app
ADMIN_URL=https://engpro-admin.vercel.app

# OpenAI (nếu có)
OPENAI_API_KEY=sk-xxx

# Cloudinary (nếu có)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# PayOS (nếu có)
PAYOS_CLIENT_ID=xxx
PAYOS_API_KEY=xxx
PAYOS_CHECKSUM_KEY=xxx

# Email (nếu có)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=xxx@gmail.com
EMAIL_PASS=xxx
```

### 1.5. Cấu hình PM2

```bash
mkdir -p ~/server
nano ~/server/ecosystem.config.js
```

Nội dung:
```javascript
module.exports = {
  apps: [
    {
      name: 'engpro-server',
      script: 'dist/server.js',
      cwd: '/home/nguyenlehuy/projects/engpro/backend',
      env: {
        PORT: 5003,
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/home/nguyenlehuy/logs/engpro-error.log',
      out_file: '/home/nguyenlehuy/logs/engpro-out.log',
      log_file: '/home/nguyenlehuy/logs/engpro-combined.log',
      time: true
    }
  ]
};
```

```bash
# Tạo thư mục logs
mkdir -p ~/logs

# Khởi động PM2
cd ~/server
pm2 start ecosystem.config.js
pm2 list
pm2 logs engpro-server --lines 50

# Setup auto-start
pm2 startup systemd
# Chạy lệnh mà PM2 in ra (dạng: sudo env PATH=...)
pm2 save
```

### 1.6. Cấu hình Nginx

```bash
sudo nano /etc/nginx/nginx.conf
```

Thêm vào trong block `http { ... }`:
```nginx
server_names_hash_bucket_size 128;
```

Tạo file config:
```bash
sudo nano /etc/nginx/sites-available/engpro
```

Nội dung:
```nginx
# Server block cho Tailscale Funnel (HTTP port 8080)
server {
    listen 8080;
    server_name nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net;

    # EngPro API
    location /engpro/ {
        proxy_pass http://127.0.0.1:5003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # WebSocket support (cho Socket.IO)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Root
    location / {
        return 200 "EngPro Server is running!\n\nAccess API at: /engpro/\n";
        add_header Content-Type text/plain;
    }
}
```

Enable và reload:
```bash
sudo ln -s /etc/nginx/sites-available/engpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### 1.7. Setup Tailscale Funnel

```bash
# Tắt funnel cũ nếu có
sudo tailscale funnel off

# Bật Tailscale Funnel (HTTPS 443 -> HTTP 8080)
sudo tailscale funnel --bg --https=443 http://127.0.0.1:8080
tailscale funnel status
```

### 1.8. Test API

```bash
# Test local
curl http://localhost:5003/health
curl http://localhost:8080/engpro/health

# Test public (từ Mac/điện thoại)
curl https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/engpro/health
```

---

## PHẦN 2: DEPLOY FRONTEND LÊN VERCEL

### 2.1. Chuẩn bị Frontend Client

Tạo file `vercel.json` trong `frontend/client`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Cập nhật file `.env.production` trong `frontend/client`:

```env
VITE_API_URL=https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/engpro
```

### 2.2. Chuẩn bị Frontend Admin

Tạo file `vercel.json` trong `frontend/admin`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Cập nhật file `.env.production` trong `frontend/admin`:

```env
VITE_API_URL=https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/engpro
```

### 2.3. Deploy lên Vercel

**Bước 1: Cài Vercel CLI**
```bash
npm install -g vercel
```

**Bước 2: Deploy Client App**
```bash
cd frontend/client
vercel login  # Đăng nhập bằng GitHub/GitLab/Email

# Deploy production
vercel --prod

# Vercel sẽ hỏi:
# - Set up and deploy? Yes
# - Which scope? (Chọn account của bạn)
# - Link to existing project? No
# - What's your project's name? engpro-client
# - In which directory is your code located? ./
# - Want to override settings? No
```

**Bước 3: Deploy Admin App**
```bash
cd ../admin
vercel --prod

# Project name: engpro-admin
```

### 2.4. Cấu hình Environment Variables trên Vercel Dashboard

1. Vào https://vercel.com/dashboard
2. Chọn project `engpro-client`
3. Vào **Settings** → **Environment Variables**
4. Thêm:
   - `VITE_API_URL` = `https://nguyenlehuy-vivobook-asuslaptop-x512fa-a512fa.tail86e288.ts.net/engpro`

5. Làm tương tự cho `engpro-admin`

### 2.5. Cập nhật CORS trên Backend

Sau khi có URL Vercel, cập nhật file `.env` trên server Linux:

```bash
nano ~/projects/engpro/backend/.env
```

```env
FRONTEND_URL=https://engpro-client.vercel.app
```

Cũng cần cập nhật CORS trong `server.ts` nếu cần thêm domain:

```typescript
// Trong server.ts, thêm domain Vercel vào CORS
cors({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://engpro-client.vercel.app",
        "https://engpro-admin.vercel.app",
        // ... các origin khác
    ],
    credentials: true,
})
```

Sau đó restart server:
```bash
cd ~/projects/engpro/backend
git pull  # hoặc upload lại code
npm run build
pm2 restart engpro-server
```

---

## PHẦN 3: SETUP CI/CD VỚI GITHUB ACTIONS

### 3.1. Tạo Self-hosted Runner trên Linux

```bash
# Tạo thư mục
mkdir -p ~/github-runners/engpro
cd ~/github-runners/engpro

# Download runner (lấy link từ GitHub Settings -> Actions -> Runners)
curl -o actions-runner-linux-x64-2.329.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-x64-2.329.0.tar.gz

# Giải nén
tar xzf ./actions-runner-linux-x64-2.329.0.tar.gz

# Cấu hình (lấy token từ GitHub)
./config.sh --url https://github.com/YOUR_USERNAME/EngPro --token YOUR_GITHUB_TOKEN

# Cài như service
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

### 3.2. Tạo GitHub Actions Workflow

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy EngPro

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: self-hosted
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Check Node version
        run: |
          echo "=== Node & NPM Versions ==="
          node -v
          npm -v

      - name: Install backend dependencies
        run: |
          cd backend
          npm ci

      - name: Build backend
        run: |
          cd backend
          npm run build

      - name: Restart backend with PM2
        run: |
          cd backend
          pm2 restart engpro-server || pm2 start dist/server.js --name engpro-server
          pm2 save

  # Frontend auto-deploy qua Vercel Git Integration
  # Không cần job deploy-frontend vì Vercel tự động build khi push

  notify:
    runs-on: self-hosted
    needs: [deploy-backend]
    if: always()
    steps:
      - name: Deployment status
        run: |
          if [ "${{ needs.deploy-backend.result }}" == "success" ]; then
            echo "✅ Backend deployment successful!"
          else
            echo "❌ Backend deployment failed!"
            exit 1
          fi
```

### 3.3. Cấu hình Vercel Git Integration (Auto-deploy Frontend)

1. Vào https://vercel.com/dashboard
2. Chọn project → **Settings** → **Git**
3. Connect với GitHub repo
4. Mỗi khi push code, Vercel sẽ tự động build và deploy

---

## PHẦN 4: KIỂM TRA HỆ THỐNG

### 4.1. Kiểm tra Backend (SSH vào Linux)

```bash
pm2 list                  # engpro-server: online
sudo systemctl status nginx
tailscale funnel status
curl http://localhost:5003/health
curl https://YOUR_TAILSCALE_URL/engpro/health
```

### 4.2. Kiểm tra Frontend

- Client: https://engpro-client.vercel.app
- Admin: https://engpro-admin.vercel.app

### 4.3. Test sau reboot

```bash
sudo reboot
# Đợi 2 phút, SSH lại

pm2 list  # Phải thấy engpro-server online
sudo systemctl status nginx
tailscale funnel status

# Nếu funnel không tự bật, chạy lại:
sudo tailscale funnel --bg --https=443 http://127.0.0.1:8080
```

---

## CHECKLIST HOÀN THÀNH

- [ ] Node.js 20 cài đặt thành công
- [ ] Backend build thành công
- [ ] PM2 chạy engpro-server (port 5003)
- [ ] Nginx config và hoạt động
- [ ] Tailscale Funnel public HTTPS
- [ ] Test API health check thành công
- [ ] Vercel deploy client thành công
- [ ] Vercel deploy admin thành công
- [ ] CORS cấu hình đúng
- [ ] GitHub Actions runner online
- [ ] CI/CD workflow hoạt động
- [ ] Test sau reboot thành công

---

## LỆNH QUẢN LÝ HỮU ÍCH

### Xem logs
```bash
pm2 logs engpro-server --lines 100
sudo journalctl -u nginx -f
```

### Restart services
```bash
pm2 restart engpro-server
sudo systemctl restart nginx
```

### Stop services
```bash
pm2 stop engpro-server
sudo systemctl stop nginx
sudo tailscale funnel off
```

### Redeploy backend
```bash
cd ~/projects/engpro/backend
git pull origin main
npm ci
npm run build
pm2 restart engpro-server
```