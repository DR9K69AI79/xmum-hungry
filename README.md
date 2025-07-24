# XMUM Hungry 🍽️

> Xiamen University Malaysia Campus Dining Recommendation System
> An interactive, map-based platform for discovering campus eateries

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.1-8892BF.svg)](https://php.net/)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/bootstrap-5.3.0-7952B3.svg)](https://getbootstrap.com/)

## 📖 Project Overview

XMUM Hungry is a campus dining recommendation system designed specifically for Xiamen University Malaysia. Through an interactive map interface, students and staff can easily discover quality restaurants around campus, browse dish details, share dining experiences, and enjoy personalized recommendations.

### ✨ Key Features

* 🗺️ **Interactive Map Interface** – Real-time map powered by Leaflet.js showing restaurant locations
* 🎯 **Smart Recommendation Engine** – Multi-dimensional algorithm supporting sorting by distance, rating, price, etc.
* 🔍 **Advanced Filters** – Filter by cuisine type, price range, distance, rating, and more
* 📱 **Responsive Design** – Fully adaptive on desktop and mobile devices
* 🎥 **Multimedia Support** – Video previews of restaurants and dishes for enhanced visual experience
* ⭐ **User Reviews** – Text, image, and voice reviews with real-time rating updates
* 👨‍💼 **Admin Dashboard** – Complete restaurant and dish management tools
* 🔐 **Secure Authentication** – Session-based user authentication and permission control

## 📂 Project Structure

```
xmum-hungry/
├── 📁 api/                     # Backend API endpoints
│   ├── api.php                 # Main API controller
│   ├── helpers.php             # Utility functions library
│   └── admin_guard.php         # Admin authorization
├── 📁 config/                  # Configuration files
│   └── config.php              # Application settings
├── 📁 db/                      # Database files
│   ├── app.sqlite              # SQLite database file
│   ├── schema.sql              # Database schema
│   └── init_data.sql           # Seed data
├── 📁 public/                  # Web root
│   ├── index.html              # Main page
│   ├── login.html              # Login page
│   ├── detail.html             # Restaurant detail page
│   ├── admin.html              # Admin console
│   ├── 📁 css/                 # Stylesheets
│   │   └── variables.css       # CSS variable definitions
│   └── 📁 js/                  # JavaScript files
│       ├── main.js             # Core application logic
│       └── 📁 components/      # Custom Web Components
│           ├── map-container.js
│           ├── fab-recommend.js
│           ├── fab-filter.js
│           ├── filter-sheet.js
│           ├── mini-card.js
│           ├── toast-msg.js
│           └── upload-modal.js
├── 📁 uploads/                 # User uploads
│   ├── *.jpg                   # Image files
│   └── 📁 videos/              # Video files
│       └── *.mp4               # Restaurant and dish videos
├── deployment_info.md          # Deployment guide
├── final_test_report.md        # Final test report
├── test_results.md             # Test results log
└── README.md                   # Project documentation
```

## 🚀 Quick Start

### System Requirements

* **PHP 8.1+**
* **SQLite 3**
* **Modern Browser** (Chrome 88+, Firefox 85+, Safari 14+)

### Local Deployment

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd xmum-hungry
   ```

2. **Initialize the Database**

   ```powershell
   # Windows PowerShell
   sqlite3 .\db\app.sqlite ".read .\db\schema.sql"
   sqlite3 .\db\app.sqlite ".read .\db\init_data.sql"
   ```

   ```bash
   # Unix/Linux/macOS
   sqlite3 ./db/app.sqlite < ./db/schema.sql
   sqlite3 ./db/app.sqlite < ./db/init_data.sql
   ```

3. **Start the Development Server**

   **Recommended (using provided scripts):**

   ```bash
   # Windows (Command Prompt)
   start-server.bat

   # Windows (PowerShell)
   .\start-server.ps1

   # Unix/Linux/macOS
   chmod +x start-server.sh && ./start-server.sh
   ```

   **Manual Start:**

   ```bash
   # From project root (important!)
   php -t . -S localhost:8082
   ```

4. **Access the Application**

   * Login page: [http://localhost:8082/public/login.html](http://localhost:8082/public/login.html)
   * User portal: [http://localhost:8082/public/index.html](http://localhost:8082/public/index.html)
   * Admin portal: [http://localhost:8082/public/admin.html](http://localhost:8082/public/admin.html)
   * API test: [http://localhost:8082/api/api.php?action=checkAuth](http://localhost:8082/api/api.php?action=checkAuth)

### Test Accounts

| Role      | Email                                         | Password | Permissions       |
| --------- | --------------------------------------------- | -------- | ----------------- |
| Demo User | [demo@xmum.edu.my](mailto:demo@xmum.edu.my)   | demo123  | Basic user access |
| Admin     | [admin@xmum.edu.my](mailto:admin@xmum.edu.my) | admin123 | Full admin access |

## 🎮 Features

### 🗺️ Map Navigation

* **Real-time Location** – Auto-detect user location and show nearby restaurants
* **Restaurant Markers** – Clearly display all restaurants on the map
* **Distance Calculation** – Precise distance using the Haversine formula
* **Route Preview** – Click markers to view details and get directions

### 🎯 Smart Recommendations

* **Multi-dimensional Sorting** – Random, distance, rating, price, etc.
* **Long-press Toggle** – Long-press the recommend button to switch modes
* **Personalized Suggestions** – Algorithm based on user behavior

### 🔍 Advanced Filters

* **Cuisine Types** – Chinese, Malay, Western, Japanese, etc.
* **Price Range** – Customizable price slider
* **Distance Radius** – Set search radius
* **Rating Threshold** – Filter by minimum star rating
* **Text Search** – Search by restaurant or dish name

### ⭐ Review System

* **Multimedia Reviews** – Text, image, and voice feedback
* **Live Rating Updates** – 5-star system with real-time update
* **Sort by Time** – Latest reviews shown first
* **Anonymous Mode** – Privacy-protecting anonymous reviews

### 👨‍💼 Admin Dashboard

* **Data Analytics** – Live stats for users, restaurants, dishes, and reviews
* **Restaurant Management** – CRUD operations with video upload
* **Map Editor** – Visual drag‑and‑drop coordinate adjustment
* **User Management** – Account and permission controls

## 🛠️ Developer Guide

### API Endpoints

#### Authentication

```php
POST /api/api.php?action=login
POST /api/api.php?action=signup
POST /api/api.php?action=logout
GET  /api/api.php?action=checkAuth
```

#### Restaurant Data

```php
GET  /api/api.php?action=getAllRestaurants
GET  /api/api.php?action=filterRestaurants
GET  /api/api.php?action=restDetail&id={id}
GET  /api/api.php?action=random3
```

#### Reviews

```php
POST /api/api.php?action=addReview
```

#### Admin Endpoints

```php
GET    /api/api.php?action=admin_getRestaurants
POST   /api/api.php?action=admin_addRestaurant
PUT    /api/api.php?action=admin_updateRestaurant
DELETE /api/api.php?action=admin_deleteRestaurant
```

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    pass_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Restaurants Table

```sql
CREATE TABLE restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    cuisines TEXT,
    avg_price INTEGER,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Dishes Table

```sql
CREATE TABLE dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rest_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    FOREIGN KEY (rest_id) REFERENCES restaurants(id)
);
```

#### Reviews Table

```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dish_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    photo_url TEXT,
    audio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Web Components

This project uses modern Web Components architecture—each feature is a standalone custom element:

```javascript
// Example: Defining a custom component
class MyComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="my-component">
                <!-- component structure -->
            </div>
        `;
    }
}

customElements.define('my-component', MyComponent);
```

## 🧪 Testing

### Test Checklist

* [x] **Authentication** – Login/Logout/Permission checks
* [x] **Map Functions** – Display, markers, interactions
* [x] **Recommendation Engine** – Multi-dimensional sorting
* [x] **Filtering & Search** – Multi-facet filters and text search
* [x] **Detail Page** – Restaurant details view
* [x] **Review System** – Multimedia reviews functionality
* [x] **Admin Panel** – Full CRUD management
* [x] **Responsive Layout** – Mobile and desktop support
* [x] **Video Playback** – Multimedia content support
