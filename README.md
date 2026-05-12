<<<<<<< HEAD
# MindMitra - Health Community Platform 🌿

MindMitra is a modern, responsive, and dynamic web application designed to connect individuals focused on fitness, mental health, diet, and yoga. Built with a premium, engaging UI heavily inspired by Twitter/Instagram, it serves as a community-driven social networking platform for wellness enthusiasts.

## 🚀 Key Features

* **Real-time Activity Feed**: A central community feed featuring posts categorized by wellness domains, complete with a beautifully optimized 'Create Post' dashboard.
* **Smart User Profiles**: Comprehensive user profiles with live-updating bios, mental health goals, and uploadable Cloudinary-powered avatars.
* **Trending Content Engine**: Dynamic Right Sidebar that tracks and displays the community's top trending posts sorted by user engagement (likes and comments) in real time.
* **Interactive Modals**: Seamless post interactions via modal popups from any context (feed, profile, or trending widget), supporting immediate viewing, commenting, and liking.
* **Dynamic Search & Discovery**: Intelligent search feature that automatically suggests fresh, random community members to follow and interact with.
* **Real-time Notifications**: A robust notification system altering users to new likes and comments on their posts, maintaining a high level of community engagement.

## 🛠️ Technology Stack

### Frontend (React Ecosystem)
- **Framework**: React.js 18
- **Styling**: Tailwind CSS (with highly customized dynamic layouts)
- **State Management**: React Query (TanStack Query) v5 for seamless data fetching and caching
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Toast Notifications**: React Toastify

### Backend (Laravel API Engine)
- **Framework**: Laravel 11.x (PHP)
- **Database**: MongoDB (via `mongodbnative` driver integration)
- **Authentication**: Laravel Sanctum / JWT for secure API networking
- **Media Storage**: Cloudinary integration for scalable profile and post image storage

## 📦 Project Structure

The repository is structured into two main independent modules:

```text
health-community/
├── backend/          # Laravel JSON API Application
│   ├── app/Http/Controllers/  # Business logic (AuthController, PostController)
│   ├── routes/                # API route definitions
│   └── .env                   # Environment & Secret Configuration
└── frontend/         # React Application
    ├── src/
    │   ├── components/        # Reusable UI (Navbar, RightSidebar, PostModal)
    │   ├── context/           # Global Contexts (AuthContext for real-time auth sync)
    │   ├── pages/             # Route configurations (Feed, Profile, Notifications)
    │   └── services/          # API Handlers (Axios integrations)
```

## ⚙️ Installation & Usage

### 1. Backend Setup (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure your MongoDB & Cloudinary credentials in .env
php artisan serve
```
*The backend server typically runs at `http://localhost:8000`.*

### 2. Frontend Setup (React/Vite)
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will spin up the UI at `http://localhost:5173`.*

## 🎨 UI/UX Design Philosophy

MindMitra prioritizes an ultra-modern aesthetic characterized by:
- **Bezel-less Inputs**: Stripped back borders on text areas for distraction-free content authoring.
- **Micro-interactions**: Subtle hover state translations, scaling animations, and state-change transitions everywhere.
- **Responsive Stacking**: Hand-crafted Tailwind viewports (`sm:`, `md:`, `lg:`) ensure the layout is exceptionally neat vertically on mobile devices while leveraging 3-column architecture on laptops. 

---
*Developed with a focus on clean code architecture and premium user experience.*
=======
# MindMitra---Health-Community-Platform
MindMitra is a modern, responsive, and dynamic web application designed to connect individuals focused on fitness, mental health, diet, and yoga.
>>>>>>> 264425d160a381d4d0570efb91a2e67fdc9046d0
