# Admin Account Management

## Overview
The admin system has been simplified to use a unified login approach. There are 4 predefined admin accounts that can be accessed through the regular login form.

## Admin Accounts

### 1. Main Admin
- **Email:** admin@shopcong.io.vn
- **Password:** Admin123!@#
- **Name:** Admin Chính
- **Role:** Main system administrator

### 2. System Manager
- **Email:** manager@shopcong.io.vn
- **Password:** Manager123!@#
- **Name:** Quản lý Hệ thống
- **Role:** System management

### 3. System Administrator
- **Email:** system@shopcong.io.vn
- **Password:** System123!@#
- **Name:** Quản trị Hệ thống
- **Role:** Technical administration

### 4. Lead Teacher
- **Email:** teacher@shopcong.io.vn
- **Password:** Teacher123!@#
- **Name:** Giáo viên Chính
- **Role:** Educational content management

## How to Create Admin Accounts

### Method 1: Using NPM Script (Recommended)
```bash
cd backend
npm run create-admins
```

### Method 2: Direct Node Execution
```bash
cd backend
node scripts/createAdminAccounts.js
```

## Login Process

1. Open the website
2. Click "Đăng nhập" to go to login page
3. Use any of the admin email addresses and passwords above
4. Upon successful login, admin users will automatically be redirected to the admin dashboard

## Admin Dashboard Features

Once logged in as admin, you will have access to:

- **Dashboard Statistics** - Overview of system metrics
- **User Management** - Manage user accounts
- **Course Management** - Create and manage courses
- **Exam Management** - Create and manage assessments
- **Payment Management** - Handle subscription and payments
- **AI Management** - Configure AI chatbot settings
- **Settings** - System configuration

## Security Notes

- Admin accounts are created with secure passwords
- Passwords should be changed after first login in production
- The system automatically detects admin role and provides appropriate access
- All admin actions are logged and tracked

## Development Setup

1. Make sure MongoDB is running
2. Set up your environment variables in `.env`
3. Run the admin creation script:
   ```bash
   cd backend
   npm run create-admins
   ```

## Production Deployment

1. Before deploying, run the admin creation script on production database
2. Change default passwords immediately after deployment
3. Ensure proper backup procedures for admin accounts
4. Monitor admin access logs regularly

## Technical Implementation

- Admin accounts are stored in the same `users` collection with `role: 'admin'`
- Authentication uses the same JWT system for both users and admins
- Frontend automatically routes to admin dashboard based on user role
- No separate admin registration interface - all admin accounts are pre-created
