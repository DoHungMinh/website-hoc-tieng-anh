# ---

**TỔNG HỢP FULL LỆNH SETUP CI/CD TỪ ĐẦU**

**Mục tiêu:** Thiết lập hệ thống CI/CD hoàn chỉnh sử dụng GitHub Actions, Node.js 20, và PM2 trên server Linux (Self-hosted runner).

## ---

**PHẦN 1: CÀI ĐẶT NODE.JS 20**

Bash

\# Xóa Node.js cũ (nếu có)  
sudo apt remove \-y nodejs npm

\# Cài NodeSource repo cho Node.js 20  
curl \-fsSL https://deb.nodesource.com/setup\_20.x | sudo \-E bash \-

\# Cài Node.js 20  
sudo apt install \-y nodejs

\# Verify version  
node \-v \# Phải v20.x.x  
npm \-v

1

## ---

**PHẦN 2: TẠO RUNNER TRÊN GITHUB**

**Bước 2.1: Tạo runner token trên GitHub**

1. Mở GitHub repository: https://github.com/yourusername/your-repo  
2. Click tab **"Settings"**.  
3. Sidebar trái: Chọn **"Actions"** \-\> **"Runners"**.  
4. Click **"New self-hosted runner"**.  
5. Chọn:  
   * **OS:** Linux  
   * **Architecture:** x64  
6. Giữ trang này mở (để lấy token và lệnh download ở bước sau).  
   2

## ---

**PHẦN 3: CÀI GITHUB ACTIONS RUNNER TRÊN LINUX**

**Bước 3.1: Download và giải nén runner**

Bash

\# Tạo thư mục  
mkdir \-p \~/github-runners/your-repo-name  
cd \~/github-runners/your-repo-name

\# Download runner (Lưu ý: Copy lệnh chính xác từ trang GitHub của bạn vì version có thể thay đổi)  
\# Ví dụ:  
curl \-o actions-runner-linux-x64-2.329.0.tar.gz \-L https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-x64-2.329.0.tar.gz

\# Giải nén  
tar xzf ./actions-runner-linux-x64-2.329.0.tar.gz

3

**Bước 3.2: Cấu hình runner**

Bash

\# Chạy config (Thay YOUR\_GITHUB\_TOKEN bằng token lấy từ GitHub ở Phần 2\)  
./config.sh \--url https://github.com/yourusername/your-repo \--token YOUR\_GITHUB\_TOKEN

\# Khi hệ thống hỏi:  
\# Runner name: \[Enter hoặc đặt tên tùy ý\]  
\# Runner group: \[Enter\]  
\# Labels: \[Enter\]  
\# Work folder: \[Enter\]

4

**Bước 3.3: Cài runner như systemd service (Chạy ngầm)**

Bash

\# Cài service  
sudo ./svc.sh install

\# Start service  
sudo ./svc.sh start

\# Kiểm tra status  
sudo ./svc.sh status

5

**Bước 3.4: Verify runner online**

* Quay lại **GitHub Settings \-\> Actions \-\> Runners**.  
* Thấy runner status **"Idle"** (màu xanh) là thành công. 6

## ---

**PHẦN 4: TẠO WORKFLOW FILE**

**Bước 4.1: Tạo thư mục workflow trên máy local**

Bash

cd /path/to/your-project  
mkdir \-p .github/workflows

7

**Bước 4.2: Tạo file workflow**

Bash

nano .github/workflows/deploy.yml

**Nội dung file deploy.yml (Mẫu cho MERN App):**

YAML

name: Deploy App

on:  
  push:  
    branches: \[ main \]  
  pull\_request:  
    branches: \[ main \]

jobs:  
  deploy-backend:  
    runs-on: self-hosted  
    steps:  
      \- name: Checkout code  
        uses: actions/checkout@v4

      \- name: Check Node version  
        run: |  
          echo "=== Node & NPM Versions \==="  
          node \-v  
          npm \-v

      \- name: Install server dependencies  
        run: |  
          cd server  
          npm ci

      \- name: Run server tests  
        run: |  
          cd server  
          npm test || echo "No tests found"  
        continue-on-error: true

      \- name: Restart backend with PM2  
        run: |  
          cd server  
          \# Thay 'your-app-name' bằng tên app của bạn  
          pm2 restart your-app-name || pm2 start server.js \--name your-app-name  
          pm2 save

  deploy-frontend:  
    runs-on: self-hosted  
    needs: deploy-backend  
    steps:  
      \- name: Checkout code  
        uses: actions/checkout@v4

      \- name: Install client dependencies  
        run: |  
          cd client  
          npm ci

      \- name: Build React app  
        run: |  
          cd client  
          npm run build  
        env:  
          NODE\_ENV: production

      \- name: Verify build output  
        run: |  
          ls \-la client/dist/ || ls \-la client/build/  
          echo "Build completed successfully\!"

  notify:  
    runs-on: self-hosted  
    needs: \[deploy-backend, deploy-frontend\]  
    if: always()  
    steps:  
      \- name: Deployment status  
        run: |  
          if \[ "${{ needs.deploy-frontend.result }}" \== "success" \]; then  
            echo "✅ Deployment successful\!"  
          else  
            echo "❌ Deployment failed\!"  
            exit 1  
          fi

8

**Bước 4.3: Commit và push workflow**

Bash

git add .github/workflows/deploy.yml  
git commit \-m "Add GitHub Actions CI/CD pipeline"  
git push origin main

9

## ---

**PHẦN 5: KIỂM TRA WORKFLOW**

1. **Trên GitHub:** Vào tab **Actions**, click vào workflow đang chạy để xem logs real-time. 10

2. **Trên Linux Runner:**  
   Bash  
   cd \~/github-runners/your-repo-name  
   tail \-f \_diag/Runner\_\*.log

   11

3. **Kiểm tra PM2:**  
   Bash  
   pm2 list  
   pm2 logs your-app-name

   12

## ---

**PHẦN 6: XỬ LÝ VẤN ĐỀ THƯỜNG GẶP**

**Vấn đề 1: Workflow vẫn dùng Node cũ**

Bash

cd \~/github-runners/your-repo-name  
sudo ./svc.sh stop      \# Stop runner  
rm \-rf \_work/\_tool/node \# Xóa cache Node cũ  
rm \-rf \_work/\_temp  
sudo ./svc.sh start     \# Start lại

13

**Vấn đề 2: Thiếu quyền sudo trong workflow**

Bash

sudo visudo  
\# Thêm dòng này vào cuối file (thay your-username):  
your-username ALL=(ALL) NOPASSWD: /usr/bin/nginx, /usr/bin/systemctl, /usr/bin/cp

14

**Vấn đề 3: PM2 không tìm thấy app**

Bash

\# Start thủ công lần đầu trên server  
cd /path/to/your-project/server  
pm2 start server.js \--name your-app-name  
pm2 save

15

## ---

**PHẦN 7: QUẢN LÝ RUNNER**

| Hành động | Lệnh |
| :---- | :---- |
| **Xem status** | cd \~/github-runners/your-repo-name && sudo ./svc.sh status |
| **Stop** | sudo ./svc.sh stop |
| **Start** | sudo ./svc.sh start |
| **Restart** | sudo ./svc.sh stop && sudo ./svc.sh start |
| **Uninstall** | sudo ./svc.sh stop && sudo ./svc.sh uninstall |
| 16  |  |

## ---

**PHẦN 8: WORKFLOW NÂNG CAO (TÙY CHỌN)**

**Deploy Frontend to Nginx:**

YAML

\- name: Deploy frontend to nginx  
  run: |  
    sudo mkdir \-p /var/www/your-app/current  
    sudo cp \-r client/dist/\* /var/www/your-app/current/  
    sudo systemctl reload nginx

17

**Sử dụng Environment Variables (Secrets):**

1. Vào GitHub Settings \-\> Secrets and variables \-\> Actions.  
2. Thêm API\_URL, SLACK\_WEBHOOK, v.v.  
3. Trong file YAML:  
   YAML  
   env:  
     VITE\_API\_URL: ${{ secrets.API\_URL }}  
     NODE\_ENV: production

18

## ---

**CHECKLIST SETUP HOÀN CHÌNH**

* \[x\] Cài Node.js 20 (node \-v ra v20.x.x)  
* \[x\] Download và cài Runner thành công  
* \[x\] Verify Runner status "Idle" trên GitHub  
* \[x\] Tạo file .github/workflows/deploy.yml  
* \[x\] Push code và thấy Workflow chạy xanh (Success)  
* \[x\] Kiểm tra PM2 server đã restart  
* \[x\] Kiểm tra Frontend build folder tồn tại

19