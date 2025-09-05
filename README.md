# workplace-tracker-ui

Frontend application for the **Workplace Tracker** system.
Provides an interface for user login, registration, attendance logging, user management (admin), and reports dashboard.

---

## **📝 Last Updated :** **`2025-09-05`**

## Table of Contents

- [workplace-tracker-ui](#workplace-tracker-ui)
  - [**📝 Last Updated :** **`2025-09-05`**](#-last-updated--2025-09-05)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Project Structure](#project-structure)
  - [Configuration](#configuration)
  - [Available Scripts](#available-scripts)
  - [API Integration](#api-integration)
  - [Pages \& Components](#pages--components)
  - [Styling](#styling)
  - [Deployment](#deployment)
    - [Production build](#production-build)
    - [Docker (optional)](#docker-optional)
  - [Troubleshooting](#troubleshooting)
  - [Contact \& License](#contact--license)

---

## Overview

The UI is built with **React** and styled using **Bootstrap** (with custom CSS effects). It connects to the backend `workplace-tracker-service` via REST APIs.

- User portal (dashboard, attendance, profile)
- Admin portal (user management, reports, DB backup)
- JWT authentication flow
- Responsive UI (desktop & mobile)

---

## Features

- **Authentication:** Signup, login, logout
- **Dashboard:** Role-based (User vs Admin)
- **Admin Tools:** Manage users, view reports, lock/unlock accounts
- **Attendance:** Log work-from-home/office, view history
- **Last Login Popup:** Shows last login timestamp on login
- **Responsive Navbar:** Home, Admin Tools, About, Contact
- **Theming:** Background effects, animated cards, blurred overlays

---

## Tech Stack

- **React 18+**
- **TypeScript**
- **React Router v6**
- **Bootstrap 5** & Bootstrap Icons
- **Axios** (API calls)
- **Context API (AuthContext)** for global auth state
- **Custom CSS** for effects (glassmorphism, animations)

---

## Prerequisites

- Node.js 18+
- npm or yarn package manager
- Running instance of [workplace-tracker-service](../workplace-tracker-service) backend

---

## Quick Start

1. **Clone repo**

   ```bash
   git clone <repo-url>
   cd workplace-tracker-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoints**
   Update `src/constants/apiEndpoints.ts`:

   ```ts
   export const API_ENDPOINTS = {
     AUTH: {
       LOGIN: "/api/v1/workplace-tracker-service/login",
       SIGNUP: "/api/v1/workplace-tracker-service/register",
       RESET_PASSWORD: "/api/v1/workplace-tracker-service/forgot/reset",
     },
     USERS: {
       GET_ALL: "/api/v1/workplace-tracker-service/user/fetch",
     },
   };
   ```

   You can set the **base URL** inside `src/services/axiosInstance.ts`.

4. **Run the app**

   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
 ├── assets/               # Images, logos, backgrounds
 ├── components/           # Shared UI components (Navbar, Header, LastLoginPopup, etc.)
 ├── context/              # AuthContext (login, signup, logout)
 ├── pages/                # Page-level components
 │    ├── Landing/
 │    ├── AdminDashboard/
 │    ├── UserDashboard/
 │    ├── UserManagement/
 │    └── Reports/
 ├── services/             # API service layer (authService, axiosInstance)
 ├── types/                # TypeScript types (User, Role, etc.)
 ├── constants/            # API endpoints, roles
 ├── App.tsx               # Routing setup
 ├── index.tsx             # App entry point
 └── index.css             # Global styles
```

---

## Configuration

- **Auth Context:**
  Manages user state, token, role, last login time.
- **Axios Instance:**
  Injects JWT token into headers automatically.
- **LocalStorage:**
  Stores session token + user data (`user`, `token`).

---

## Available Scripts

- `npm start` — Run development server
- `npm build` — Build production bundle
- `npm test` — Run tests
- `npm run lint` — Run linter

---

## API Integration

- Auth flows via `authService.ts`
- API endpoints centrally managed in `constants/apiEndpoints.ts`
- Token stored in `localStorage` and added to every request by `axiosInstance.ts`

---

## Pages & Components

- **Landing Page** — Login/Signup toggle
- **Admin Dashboard** — Cards (User Management, Reports, Backup, Attendance)
- **User Dashboard** — Attendance log, history
- **User Management (Admin)** — View users, toggle active/locked, see last login & attempts
- **Reports** — (to be integrated with backend reporting)
- **Header/Navbar** — Role-aware navigation
- **LastLoginPopup** — Shows once after login

---

## Styling

- Bootstrap + custom **CSS effects**
- Features: blurred backgrounds, animated hover cards, responsive tables
- Custom table styling with sticky headers, zebra rows, attempts badges

---

## Deployment

### Production build

```bash
npm run build
```

- Output in `/build` folder
- Serve with any static hosting (Nginx, Apache, Netlify, Vercel)
- Ensure backend API URL is correctly set in `axiosInstance.ts`

### Docker (optional)

Add a Dockerfile:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

---

## Troubleshooting

- **401 Unauthorized** → Token expired → login again (or implement refresh token)
- **CORS issues** → Configure CORS in backend (`@CrossOrigin`)
- **White screen after build** → Check `homepage` in `package.json` or React Router config
- **API not reachable** → Verify `axiosInstance` base URL

---

## Contact & License

- Maintainer: **Siddhant Patni**
- License: MIT / Apache-2.0 (choose)

---
