# 🏥 Health Hive - হেলথ হাইভ

<div align="center">

![Health Hive Logo](public/img/logo.png)

**আলটিমেট এআই হেলথ কেয়ার সলুশ্যন**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini_2.0-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

---

**Live Demo:** [https://domain_name](https://domain_name)

</div>

---

## 📖 Overview

**Health Hive** is an advanced AI-powered healthcare application designed specifically for Bengali-speaking users. It provides comprehensive medical analysis, health risk prediction, and personalized wellness recommendations using Google's cutting-edge Gemini 2.0 AI model.

### 🎯 Mission

To democratize healthcare access by providing intelligent, AI-driven medical insights in Bengali language, making healthcare information more accessible to millions.

---

## ✨ Features

### 🔍 Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **সিম্পটম চেকার (Symptom Checker)** | Analyze symptoms to identify potential diseases | ✅ Active |
| **হেলথ রিস্ক প্রেডিক্টর (Health Risk Predictor)** | Predict future health risks based on lifestyle data | ✅ Active |
| **মেডিকেল রিপোর্ট অ্যানালাইসিস (Medical Report Analysis)** | AI-powered analysis of medical test reports | ✅ Active |
| **প্রেসক্রিপশন অ্যানালাইসিস (Prescription Analysis)** | Detailed prescription interpretation and drug information | ✅ Active |
| **ইমেজ টু ডিজিজ (Image to Disease)** | Disease identification from medical images | ✅ Active |
| **ডায়েট ও ফিটনেস প্ল্যান (Diet & Fitness Plan)** | Personalized diet and fitness recommendations | ✅ Active |
| **বেটার মি (Better Me)** | Mental wellness and breathing exercises | ✅ Active |
| **উইমেন্স কর্নার (Women's Corner)** | Women-specific health resources | ✅ Active |

### 🚀 Key Highlights

- 🤖 **AI-Powered Analysis** - Leverages Google Gemini 2.0 Flash Exp for intelligent insights
- 🇧🇩 **Bengali Language Support** - Full Bengali interface with UTF-8 encoding
- 📊 **Comprehensive Database** - 119 symptoms, 10 diseases, 150+ relationships
- 🖼️ **Image Analysis** - Medical report, prescription, and disease image processing
- 💾 **MySQL Integration** - Robust database with optimized queries
- 🔒 **Secure File Handling** - Multer-based file uploads with validation
- 📱 **Responsive Design** - Mobile-first, adaptive UI

---

## 🎬 Demo

### 🖥️ Screenshots

> **Note:** Add screenshots of your application here

```
public/img/screenshots/
├── homepage.png
├── symptom-checker.png
├── medical-report.png
└── prescription-analysis.png
```

### 🌐 Live Demo

**Visit:** [https://domain_name](https://domain_name)

**API Base URL:** `https://domain_name`

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4.21+
- **Database:** MySQL 8.0+ / MariaDB
- **AI Engine:** Google Generative AI (Gemini 2.0 Flash Exp)
- **File Upload:** Multer
- **Environment:** dotenv

### Frontend
- **Template Engine:** EJS
- **Styling:** Custom CSS with Material Icons
- **JavaScript:** Vanilla JS (ES6+)
- **Architecture:** Server-side rendering

### Database Schema
```sql
- symptoms (id, name)
- diseases (id, name, description, image, details, tests)
- disease_symptoms (disease_id, symptom_id)
- tips (id, content)
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/) (v8.0+) or [MariaDB](https://mariadb.org/)
- [Git](https://git-scm.com/)
- [Google AI API Key](https://ai.google.dev/) (Gemini 2.0)

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/khan-masud/health-hive.git
cd health-hive
```

### 2️⃣ Install Dependencies

```bash
cd backend
npm install
```

### 3️⃣ Database Setup

#### Option A: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE health_hive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit;
```

#### Option B: Using Setup Script

```bash
# Run the schema creation
mysql -u root -p < backend/schema.sql
```

### 4️⃣ Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=health_hive
DB_PORT=3306

# Google AI Configuration
API_KEY=your_google_ai_api_key_here
```

### 5️⃣ Database Migration

Populate the database with initial data:

```bash
npm run migrate
```

Expected output:
```
🗄️  Starting database migration...
✅ Database connected successfully!
🗑️  Clearing existing data...
📝 Inserting 119 symptoms...
🦠 Inserting 10 diseases...
💡 Inserting 5 health tips...
✅ Migration completed successfully!
```

### 6️⃣ Start the Server

```bash
npm start
```

The server will start at `http://localhost:3000`

---

## 📖 Usage

### Starting the Application

```bash
# Development mode
cd backend
npm start

# Or using node directly
node server.js
```

The server will start at `https://domain_name` (production) or `http://localhost:3000` (development)
```

### Running Database Migration

```bash
npm run migrate
```

### Accessing the Application

**Production:**
- **Homepage:** `https://domain_name`
- **Symptom Checker:** `https://domain_name/symptoms-checker.html`
- **Medical Report Analysis:** `https://domain_name/medical-report-analysis.html`
- **Better Me:** `https://domain_name/better-me`

**Development (Local):**
- **Homepage:** `http://localhost:3000`
- **Symptom Checker:** `http://localhost:3000/symptoms-checker.html`
- **Medical Report Analysis:** `http://localhost:3000/medical-report-analysis.html`
- **Better Me:** `http://localhost:3000/better-me`

---

## 🔌 API Documentation

### Base URL

**Production:** `https://domain_name`

**Development:** `http://localhost:3000`

### Endpoints

#### 📍 GET `/api/symptoms`
Get all available symptoms

**Response:**
```json
[
  "জ্বর",
  "কাশি",
  "মাথাব্যথা"
]
```

#### 📍 GET `/api/diseases`
Get all diseases with symptoms

**Response:**
```json
[
  {
    "id": 1,
    "name": "ডেঙ্গু জ্বর",
    "description": "মশাবাহিত ভাইরাল রোগ...",
    "image": "dengue.jpg",
    "details": "...",
    "tests": "...",
    "symptoms": ["জ্বর", "মাথাব্যথা"]
  }
]
```

#### 📍 GET `/api/long-tips`
Get health tips

**Response:**
```json
[
  "প্রতিদিন কমপক্ষে ৮ গ্লাস পানি পান করুন..."
]
```

#### 📍 POST `/api/medical-report-analysis`
Analyze medical report images

**Request:**
```
Content-Type: multipart/form-data

image: [file]
prompt: "অতিরিক্ত তথ্য" (optional)
```

**Response:**
```json
{
  "analysisResult": "<h2>১. রিপোর্টের পরিচিতি</h2>..."
}
```

#### 📍 POST `/api/prescription-analysis`
Analyze prescription images

**Request:**
```
Content-Type: multipart/form-data

image: [file]
prompt: "অতিরিক্ত প্রশ্ন" (optional)
```

#### 📍 POST `/api/image-to-disease`
Identify disease from images

**Request:**
```
Content-Type: multipart/form-data

image: [file]
prompt: "বিস্তারিত চাই" (optional)
```

#### 📍 POST `/api/health-risk-predictor`
Predict health risks

**Request:**
```json
{
  "age": "25",
  "gender": "male",
  "weight": "70",
  "height": "170",
  "lifestyle": "sedentary"
}
```

#### 📍 POST `/api/diet-and-fitness-plan`
Generate personalized diet plan

**Request:**
```json
{
  "age": "25",
  "weight": "70",
  "goal": "weight_loss",
  "activity_level": "moderate"
}
```

### Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `429` - API Rate Limit Exceeded
- `500` - Server Error

**Error Response:**
```json
{
  "error": "API rate limit exceeded. Please wait a moment and try again."
}
```

---

## 🗂️ Project Structure

```
Health Hive/
├── backend/
│   ├── data.js              # Symptom & disease data (backup)
│   ├── db.js                # Database connection pool
│   ├── migrate.js           # Database migration script
│   ├── package.json         # Node dependencies
│   ├── schema.sql           # Database schema
│   ├── server.js            # Express server (440 lines)
│   ├── tips.js              # Health tips (backup)
│   ├── uploads/             # Temporary file uploads
│   └── .env                 # Environment variables (create this)
├── public/
│   ├── css/                 # Stylesheets
│   ├── img/                 # Images & assets
│   ├── js/                  # Client-side JavaScript
│   ├── sounds/              # Audio files
│   ├── index.html           # Homepage
│   ├── symptoms-checker.html
│   ├── medical-report-analysis.html
│   ├── prescription-analysis.html
│   ├── image-to-disease.html
│   ├── health-risk-predictor.html
│   ├── diet-and-fitness-plan.html
│   ├── better-me.html
│   └── womens-corner.html
├── views/
│   ├── index.ejs            # Better Me main page
│   └── breathing.ejs        # Breathing exercises
└── README.md                # This file
```

---

## 🔧 Configuration

### Database Configuration

Edit `.env` file:

```env
DB_HOST=localhost        # Database host
DB_USER=root            # Database username
DB_PASSWORD=            # Database password (leave empty for no password)
DB_NAME=health_hive     # Database name
DB_PORT=3306            # Database port
```

### Google AI Configuration

1. Get API key from [Google AI Studio](https://ai.google.dev/)
2. Add to `.env`:
```env
API_KEY=your_api_key_here
```

### File Upload Limits

In `server.js`:
```javascript
const upload = multer({ 
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        // ...
    }
});
```

---

## 🧪 Testing

### Manual Testing

1. **Symptom Checker:**
   - Navigate to `/symptoms-checker.html`
   - Select symptoms and click "বিশ্লেষণ করুন"

2. **Medical Report Analysis:**
   - Navigate to `/medical-report-analysis.html`
   - Upload a medical report image
   - View AI-generated analysis

3. **API Testing:**
```bash
# Test symptoms endpoint (Production)
curl https://domain_name/api/symptoms

# Test diseases endpoint (Production)
curl https://domain_name/api/diseases

# Test symptoms endpoint (Development)
curl http://localhost:3000/api/symptoms

# Test diseases endpoint (Development)
curl http://localhost:3000/api/diseases
```

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your database credentials in `.env`

#### API Rate Limit Exceeded
```
Error: 429 Too Many Requests
```
**Solution:** Wait a few moments before retrying. Consider implementing caching.

#### File Upload Error
```
Error: File size too large
```
**Solution:** Ensure image is under 10MB

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Windows
taskkill //F //IM node.exe

# Linux/Mac
killall node
```

---

## 🚀 Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create health-hive

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set API_KEY=your_google_ai_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migration
heroku run npm run migrate
```

### Deploy to Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Set root directory to `/`
4. Deploy automatically on push

### Deploy to Vercel (Serverless)

> Note: Requires serverless architecture modifications

---

## 📊 Database Statistics

- **Symptoms:** 119 entries
- **Diseases:** 10 entries
- **Disease-Symptom Relations:** 150+ mappings
- **Health Tips:** 5 comprehensive tips
- **Character Encoding:** UTF-8 (utf8mb4_unicode_ci)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Write clear commit messages
- Update documentation for new features
- Test thoroughly before submitting

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Khan Masud** - *Initial work* - [khan-masud](https://github.com/khan-masud)

---

## 🙏 Acknowledgments

- **Google AI** - For providing the Gemini 2.0 API
- **Express.js** - For the robust web framework
- **MySQL** - For reliable data storage
- **Bengali Community** - For language support and feedback

---

## 📞 Contact & Support

- **GitHub:** [@khan-masud](https://github.com/khan-masud)
- **Website:** [https://domain_name](https://domain_name)
- **Issues:** [GitHub Issues](https://github.com/khan-masud/health-hive/issues)
- **Discussions:** [GitHub Discussions](https://github.com/khan-masud/health-hive/discussions)

---

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] User authentication & profiles
- [ ] Medical history tracking
- [ ] Doctor consultation integration
- [ ] Mobile app (React Native)
- [ ] Telemedicine features
- [ ] Multi-language support
- [ ] Advanced AI models
- [ ] Health data analytics dashboard

### Version 1.1 (In Progress)
- [x] MySQL database integration
- [x] Intelligent error handling
- [x] Code optimization (440 lines)
- [ ] API rate limiting
- [ ] Result caching
- [ ] Unit tests

---

## 📈 Performance

- **Response Time:** < 2s for database queries
- **Image Analysis:** 5-10s (depends on Google AI)
- **Database Queries:** Optimized with connection pooling (10 connections)
- **File Upload:** Supports up to 10MB images
- **Concurrent Users:** Tested up to 50 simultaneous requests

---

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ File type validation (JPEG, PNG, WebP only)
- ✅ File size limits (10MB max)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ⚠️ **TODO:** Add rate limiting
- ⚠️ **TODO:** Add user authentication

---

## 💡 Tips for Users

1. **For Best Results:**
   - Upload clear, high-quality medical images
   - Provide additional context in the prompt field
   - Select all relevant symptoms

2. **Privacy:**
   - All uploaded files are automatically deleted after processing
   - No personal data is stored permanently

3. **Limitations:**
   - AI analysis is informational only - not a medical diagnosis
   - Always consult qualified healthcare professionals
   - Works best with Bengali language medical documents

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ for the Bengali Healthcare Community**

[Back to Top](#-health-hive---হেলথ-হাইভ)

</div>
