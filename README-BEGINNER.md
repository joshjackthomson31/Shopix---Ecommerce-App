# 🛒 Shopix - E-Commerce App (Beginner's Guide)

Welcome! This guide will walk you through **everything** step by step. No prior knowledge required.

---

## 📚 What is This Project?

**Shopix** is an online shopping website (like Amazon or Flipkart) built using the **MERN Stack**.

### What is MERN Stack?

MERN stands for 4 technologies that work together:

| Letter | Technology | What it Does | Real-World Analogy |
|--------|------------|--------------|-------------------|
| **M** | MongoDB | Stores all data (products, users, orders) | A digital filing cabinet |
| **E** | Express.js | Handles server requests | A receptionist who directs requests |
| **R** | React | Creates the website interface you see | The shop's interior design |
| **N** | Node.js | Runs JavaScript on the server | The electricity powering everything |

---

## 🖥️ Prerequisites (What You Need to Install First)

Before starting, you need to install these programs on your computer:

### 1. Node.js (Required)

Node.js lets your computer run JavaScript code.

**How to install:**
1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the big green button)
3. Run the installer - just click "Next" through all steps
4. Restart your computer

**How to verify it's installed:**
Open Terminal (Mac) or Command Prompt (Windows) and type:
```bash
node --version
```
You should see something like `v20.x.x` or higher.

### 2. MongoDB (Required)

MongoDB is where all the data gets stored.

**Option A: MongoDB Atlas (Recommended for beginners - FREE)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Create a new cluster (choose the FREE tier)
4. Click "Connect" and copy the connection string
5. It looks like: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/shopix`

**Option B: Install MongoDB Locally**
1. Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download and install
3. Your connection string will be: `mongodb://localhost:27017/shopix`

### 3. A Code Editor (Recommended: VS Code)

1. Go to [code.visualstudio.com](https://code.visualstudio.com)
2. Download and install

### 4. Git (Optional but useful)

Git helps you download and manage code.
1. Go to [git-scm.com](https://git-scm.com)
2. Download and install

---

## 📁 Understanding the Project Structure

When you open the project folder, you'll see:

```
MERN Chat/
├── client/          👈 Frontend (what users see in browser)
│   ├── src/
│   │   ├── components/   → Reusable UI pieces (buttons, headers)
│   │   ├── pages/        → Different screens (Home, Cart, Login)
│   │   ├── services/     → Code that talks to the server
│   │   ├── context/      → Shared data across pages
│   │   └── App.jsx       → Main app file
│   └── package.json      → List of frontend tools needed
│
├── server/          👈 Backend (handles data and logic)
│   ├── controllers/      → Functions that handle requests
│   ├── models/           → Data structure definitions
│   ├── routes/           → URL paths (like /api/products)
│   ├── middleware/       → Code that runs before routes
│   ├── config/           → Settings (database connection)
│   ├── utils/            → Helper functions
│   └── server.js         → Main server file
│
└── package.json     👈 Root config for running both
```

---

## 🚀 How to Run the Project (Step by Step)

### Step 1: Open Terminal/Command Prompt

**On Mac:**
- Press `Cmd + Space`, type "Terminal", press Enter

**On Windows:**
- Press `Win + R`, type "cmd", press Enter

### Step 2: Navigate to the Project Folder

Type this command and press Enter:
```bash
cd /path/to/MERN\ Chat
```

Replace `/path/to/` with the actual path where you saved the project.

**💡 Tip:** You can also drag the folder into Terminal to auto-fill the path!

### Step 3: Install Dependencies

Dependencies are tools/libraries the project needs to work.

```bash
# Install root dependencies
npm install

# Install both server and client dependencies at once
npm run install-all
```

**What's happening?** 
- `npm` is Node Package Manager - it downloads code libraries
- This downloads all the tools listed in `package.json` files
- It may take 2-5 minutes - be patient!

### Step 4: Set Up Environment Variables

Environment variables are secret settings (like passwords) that shouldn't be shared publicly.

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Create a file called `.env` (notice the dot at the start):
   ```bash
   touch .env
   ```

3. Open the `.env` file in VS Code and add these lines:
   ```env
   # MongoDB Connection String
   # Replace with YOUR connection string from MongoDB Atlas
   MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster.xxxxx.mongodb.net/shopix
   
   # JWT Secret (can be any random string - this encrypts user sessions)
   JWT_SECRET=my-super-secret-key-change-this-123
   
   # Port number (where server runs)
   PORT=5000
   ```

4. Go back to the main folder:
   ```bash
   cd ..
   ```

### Step 5: Start the Application

```bash
npm run dev
```

**What happens:**
- The server starts on `http://localhost:5000`
- The frontend starts on `http://localhost:5173`
- Both run at the same time!

### Step 6: Open in Browser

Open your web browser and go to:
```
http://localhost:5173
```

🎉 **You should see the Shopix homepage!**

---

## 🔧 Common Commands Explained

| Command | What it Does |
|---------|--------------|
| `npm run dev` | Starts both frontend and backend together |
| `npm run server` | Starts only the backend |
| `npm run client` | Starts only the frontend |
| `npm install` | Downloads dependencies |
| `Ctrl + C` | Stops the running server |

---

## 📱 Features of Shopix

| Feature | Description |
|---------|-------------|
| 🏠 **Home Page** | Browse all products with search & filters |
| 🔍 **Product Details** | View product info, images, prices |
| 🛒 **Shopping Cart** | Add/remove items, adjust quantities |
| 👤 **User Authentication** | Register, login, logout |
| 📦 **Orders** | Place orders and view order history |
| 💰 **Indian Pricing** | All prices in INR (₹) |

---

## 🐛 Troubleshooting (Common Problems)

### Problem: "npm: command not found"
**Solution:** Node.js is not installed properly. Reinstall from [nodejs.org](https://nodejs.org)

### Problem: "Cannot connect to MongoDB"
**Solutions:**
1. Check your internet connection
2. Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allows all IPs)
3. Double-check your connection string in `.env`

### Problem: "Port 5000 already in use"
**Solution:** Another program is using that port. Either:
- Close the other program, OR
- Change the PORT in `.env` to something else like `5001`

### Problem: "Module not found" errors
**Solution:** Dependencies weren't installed properly:
```bash
rm -rf node_modules
npm run install-all
```

### Problem: Page shows blank or errors
**Solution:** Open browser Developer Tools (press `F12`) and check the Console tab for error messages.

---

## 📖 Glossary (Terms You'll Hear)

| Term | Simple Explanation |
|------|-------------------|
| **API** | A way for programs to talk to each other (like a menu at a restaurant) |
| **Route** | A URL path like `/api/products` that the server responds to |
| **Component** | A reusable piece of the UI (like a button or card) |
| **State** | Data that can change and triggers UI updates |
| **Props** | Data passed from parent to child component |
| **Middleware** | Code that runs between receiving a request and sending a response |
| **JWT** | JSON Web Token - a secure way to verify logged-in users |
| **CRUD** | Create, Read, Update, Delete - the 4 basic operations |

---

## 🆘 Need Help?

1. **Google the error message** - Someone has probably had the same problem
2. **Stack Overflow** - [stackoverflow.com](https://stackoverflow.com) - Q&A for programmers
3. **React Docs** - [react.dev](https://react.dev)
4. **Express Docs** - [expressjs.com](https://expressjs.com)
5. **MongoDB Docs** - [docs.mongodb.com](https://docs.mongodb.com)

---

## 🎓 Want to Learn More?

If you want to understand how this project works:

1. **Start with `server/server.js`** - It's the entry point for the backend
2. **Look at `client/src/App.jsx`** - It's the entry point for the frontend
3. **Follow a request flow**: Browser → Route → Controller → Model → Database

Good luck! 🚀
