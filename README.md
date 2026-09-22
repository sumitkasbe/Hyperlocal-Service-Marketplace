# 🔧 RepairWalla – Hyperlocal Service Marketplace

RepairWalla is a full-stack hyperlocal service marketplace that connects customers with nearby service providers such as electricians, plumbers, cleaners, technicians, and other professionals.

The platform provides secure authentication, role-based dashboards, service discovery, booking management, provider workflows, and payment tracking.

---

## 🚀 Live Demo

### Frontend
🔗 https://repair-walla.vercel.app/

### Backend API
🔗 https://hyperlocal-service-marketplace-acb2.onrender.com

> Replace the above URLs with your actual deployed Vercel and Render URLs.

---

## 📌 Project Overview

Finding reliable local service professionals can be difficult and time-consuming.

RepairWalla provides a centralized platform where:

- 👤 Customers can discover and book local services.
- 🧑‍🔧 Providers can manage service requests and bookings.
- 🛡️ Administrators can manage providers, bookings, and platform activities.

The application follows a role-based architecture where different users have access to different features and dashboards.

---

## ✨ Key Features

### 👤 Customer

- User registration and login
- JWT-based authentication
- Browse available services
- View service details and pricing
- Create service bookings
- Track booking status
- View booking information
- Payment status tracking
- Protected customer dashboard

### 🧑‍🔧 Service Provider

- Provider registration
- Secure provider login
- Provider dashboard
- View pending booking requests
- Accept or reject bookings
- Manage active bookings
- Complete service requests
- Track booking status
- Protected provider routes

### 🛡️ Admin

- Admin authentication
- Provider verification workflow
- Approve or reject provider requests
- Monitor bookings
- Manage platform services
- Monitor users and providers
- Track payment and transaction information
- Platform management dashboard

---

## 🔐 Authentication & Authorization

RepairWalla uses **JWT (JSON Web Token)** based authentication.

The system supports role-based access control:

```text
Customer
   ↓
Customer Dashboard

Provider
   ↓
Provider Dashboard

Admin
   ↓
Admin Dashboard
