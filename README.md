# 🎬 MovieStream Client (Frontend)

A modern, high-performance, and mobile-responsive frontend for the MovieStream platform. Built with **React**, **Vite**, and **NextUI**.

---

## 🚀 Features

- **Responsive Design**: Optimized for Desktop, Tablet, and Mobile.
- **Dynamic Content CMS**: Manage movies, TV series, and seasons directly from the Admin Panel.
- **SEO Optimized**: Dynamic meta tags, titles, and descriptions for every movie and series.
- **Admin Dashboard**: Full-featured panel for content management, site settings, and database backups.
- **Telegram Integration**: Direct file delivery and Force-Subscribe (FSub) support.
- **Theme Support**: Seamless Dark/Light mode transitions.

---

## 🛠 Tech Stack

- **Core**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [NextUI](https://nextui.org/)
- **Icons**: [React Icons (Pi)](https://react-icons.github.io/react-icons/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [Axios](https://axios-http.com/)
- **SEO**: [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Sliders**: [Swiper](https://swiperjs.com/)

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd Movie-Stream-Client
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your configuration:

```env
VITE_BASE_URL=https://your-api-domain.com
VITE_SITENAME=YourSiteName
VITE_TG_USERNAME=YourBotUsername
VITE_TG_URL=https://t.me/YourChannel
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=yourpassword
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
The output will be in the `dist/` folder, ready for deployment.

---

## 🌐 Deployment

### Vercel / Netlify (Recommended)
This project is pre-configured for **Vercel**. Simply connect your GitHub repository and it will auto-deploy.

### VPS / Manual
If deploying on a VPS, serve the `dist/` folder using **Nginx** or **Caddy**.

---

## 🔒 Security
- Admin access is protected via a session-based login system.
- Backend API calls require appropriate URL configuration.

## 🤝 Credits
- ThiruXD
