# ![Logo](./public/static/logo.jpg)

# 🚗 Auto Occasion Application

This is a Single Page Application (SPA) for publishing and browsing used cars. Built with **React**, **Firebase** and **Vite**.

---

## 🛠️ Features

- 🔐 User registration & login (Firebase Authentication)
- 📄 Publish car listings
- 📷 Upload image URLs
- ❤️ Like and save favorite cars
- ✔️ Buy cars and track purchases
- 👤 Profile page with published, liked, and purchased cars
- 🔎 Search with filters
- 💬 Edit profile details
- 🔧 Admin tools (edit / delete own listings)

---

## 📦 Installation Instructions

> ⚠️ Firebase configuration is already included in the code — no `.env` needed!

### 1. Clone the Repository

```bash
git clone https://github.com/differing/my-prject-react
cd auto-occasion/client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔧 Technologies Used

- **React**
- **Vite**
- **Firebase Firestore**
- **Firebase Authentication**
- **React Router**
- **CSS Modules**
- **Responsive Design (Mobile Ready)**

---

## 📁 Project Structure

```
client/
│
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── firebase.js
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│   └── images/
│
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚠️ Notes

- Make sure you're connected to the internet to allow Firebase to function properly.
- All Firebase credentials are pre-included in `firebase.js`, no environment config needed.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).