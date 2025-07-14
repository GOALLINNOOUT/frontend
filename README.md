# JC's Closet Frontend

Welcome to the frontend for **JC's Closet**, a modern e-commerce and fashion web application. This project is built with **React** (v18), **Vite**, and **Material UI (MUI)** for a fast, beautiful, and responsive user experience.

---

## Table of Contents

- [Features](#features)
- [Project Structure & File Explanations](#project-structure--file-explanations)
- [Getting Started](#getting-started)
- [Build for Production](#build-for-production)
- [Environment](#environment)
- [License](#license)

---

## Features

- Modern **React (v18)** with **Vite** for fast development and builds
- **Material UI (MUI)** for a beautiful, responsive UI
- State management with **Zustand**
- **REST API** integration with the JC's Closet backend
- Admin dashboard, product catalog, cart, checkout, and more

---

## Project Structure & File Explanations

```
client/
│  index.html            # Main HTML file
│  package.json          # Project metadata and dependencies
│  vite.config.js        # Vite configuration
│  eslint.config.js      # ESLint configuration
│  README.md             # This documentation file
│
├─public/                # Static assets (favicons, images, manifest, etc.)
│   favicon.ico
│   manifest.json
│   ...
│
├─src/                   # Main source code for the React app
│   App.jsx              # Root React component
│   App.css              # Global styles for the app
│   index.css            # Base CSS
│   main.jsx             # Entry point for React/Vite
│   theme.js             # MUI theme configuration
│   themeCssVars.js      # CSS variables for theming
│
│   ├─assets/            # Images, fonts, and other static assets
│   ├─components/        # Reusable React components (buttons, forms, etc.)
│   ├─context/           # React context providers (e.g., auth, cart)
│   ├─hooks/             # Custom React hooks
│   ├─pages/             # Page-level React components (Home, Product, Cart, etc.)
│   └─utils/             # Utility/helper functions
```

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. The app will be available at [http://localhost:5173](http://localhost:5173)

---

## Build for Production

To build the app for production:

```bash
npm run build
```

The output will be in the `dist/` folder, ready to be deployed to your preferred hosting platform.

---

## Environment

The frontend expects the backend API to be running and accessible. Update API URLs in the code or use environment variables as needed (e.g., `.env` files for Vite).

---

## License

MIT