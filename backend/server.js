require("dotenv").config();
const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { promisePool, testConnection } = require('./db');

if (!process.env.API_KEY) {
    console.error('ERROR: API_KEY is not set in environment variables!');
    process.exit(1);
}

const upload = multer({ 
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
        }
    }
});

const app = express();
const PORT = process.env.PORT || 3000;
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const cleanupFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
    });
};

const getErrorMessage = (error) => {
    if (error.message?.includes("429")) {
        return "API rate limit exceeded. Please wait a moment and try again.";
    } else if (error.message?.includes("quota")) {
        return "API quota exceeded. Please try again later.";
    } else if (error.message?.includes("invalid")) {
        return "Invalid image format. Please upload a valid image.";
    }
    return "Failed to process the request. Please try again.";
};

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set('views', path.join(__dirname, '../views')); 
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');

app.get('/better-me', (req, res) => {
  res.render('index');
});

app.get('/better-me/breathing', (req, res) => {
  res.render('breathing');
});

app.get('/api/symptoms', async (req, res) => {
    try {
        const [symptoms] = await promisePool.query('SELECT name FROM symptoms ORDER BY name');
        res.json(symptoms.map(s => s.name));
    } catch (error) {
        console.error('Error fetching symptoms:', error);
        res.status(500).json({ error: 'Failed to fetch symptoms' });
    }
});

app.get('/api/diseases', async (req, res) => {
    try {
        const [diseases] = await promisePool.query(`
            SELECT id, name, description, image, details, tests 
            FROM diseases ORDER BY id
        `);

        for (let i = 0; i < diseases.length; i++) {
            const [symptoms] = await promisePool.query(`
                SELECT s.name 
                FROM symptoms s
                INNER JOIN disease_symptoms ds ON s.id = ds.symptom_id
                WHERE ds.disease_id = ?
                ORDER BY s.name
            `, [diseases[i].id]);
            diseases[i].symptoms = symptoms.map(s => s.name);
        }

        res.json(diseases);
    } catch (error) {
        console.error('Error fetching diseases:', error);
        res.status(500).json({ error: 'Failed to fetch diseases' });
    }
});

app.get('/api/long-tips', async (req, res) => {
    try {
        const [tips] = await promisePool.query('SELECT content FROM tips ORDER BY id');
        res.json(tips.map(t => t.content));
    } catch (error) {
        console.error('Error fetching tips:', error);
        res.status(500).json({ error: 'Failed to fetch tips' });
    }
});

app.post("/api/medical-report-analysis", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Please upload an image." });
      }

      const { path: filePath, originalname, mimetype } = req.file;
      const userPrompt = req.body.prompt || "";  
  
      const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: mimetype,
        displayName: originalname,
      });
  
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  

      const result = await model.generateContent([
        `এই ইমেজটি অ্যানালাইসিস (অবশ্যই ইমেজটিকে একটি মেডিকেল টেস্টের রিপোর্ট হতে হবে) করে নিচের পয়েন্ট গুলোর যত টুকু পারো ইনফরমেটিভ উত্তর দিবা। ইমেজটি প্রেসক্রিপশন হলে কোনো উত্তর দিতে হবে না। ১. রিপোর্টের পরিচিতি ২. যে জন্য টেস্টটি করা হয়েছে ৩. রিপোর্টিতে যা যা বলা হয়েছে ৪.রিপোর্ট অনুযায়ী রোগীর ঝুকি ও রোগ চিহ্নিতকরণ ৫. রিপোর্টের ডাটার সাথে সাধারণ মানুষের শরীরের ডাটা তুলনা ৬. রোগীর পরবর্তী পদক্ষেপ । এগুলো দেওয়ার পাশাপাশি ইউজারের কমান্ডও পুরণ করে আউটপুট দিবা। 
        'রিপোর্টিতে যা যা বলা হয়েছে' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'রিপোর্টিতে যা যা বলা হয়েছে' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">বর্ণনা</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        'রিপোর্ট অনুযায়ী রোগীর ঝুকি ও রোগ চিহ্নিতকরণ' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'রিপোর্ট অনুযায়ী রোগীর ঝুকি ও রোগ চিহ্নিতকরণ' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">ঝুকি/রোগ</th>
          <th style="border: 1px solid #ddd; padding: 8px;">কারণ</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        'রিপোর্টের ডাটার সাথে সাধারণ মানুষের শরীরের ডাটা তুলনা' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'রিপোর্টের ডাটার সাথে সাধারণ মানুষের শরীরের ডাটা তুলনা' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">প্রাপ্তমান</th>
          <th style="border: 1px solid #ddd; padding: 8px;">আদর্শ মান</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        Tag আর Attribute হিসেবে যেগুলো must ব্যবহার করবা b, p, br, hr, h2, h3, ul, li. পয়েন্ট গুলো রাখবা h3 ট্যাগে এবং পয়েন্টের উত্তর গুলো রাখবা p ট্যাগের ভিতরে। p ট্যাগের ভিতরে b, p, br, hr, h2, h3, ul, li এসব অবশ্যই ইউজ করবা। প্রতিটা p ট্যাগের পর একটা অবশ্যই <br /> ব্যবহার করবা। নোটেবল লাইন বা টেক্সট গুলো লাল কালারের টেক্সট দিয়ে হাইলাইট করে দিবা। পয়েন্ট গুলোর টাইটেল h2 ট্যাগের ভিতরে রাখবা। এছাড়া আর কোন html ট্যাগ ইউজ করতে পারবা না। <html> <body> এগুলোও না। কোনো # ব্যবহার করবা না কোডে। আর সবার নিচে লাল কালারে একটা ডিসক্লেইমার দিবা (মেডিকেল রিপোর্ট না হলে ডিসক্লেইমার দিবা না) আর যার টেক্সট হবে 'নোটঃ উপরোক্ত বিশ্লেষণ শুধুমাত্র তথ্যমূলক যা রিপোর্টের ডেটার ভিত্তিতে করা হয়েছে এবং কোনওভাবেই মেডিকেল পরামর্শের বিকল্প নয়। যথাযথ মেডিকেল পরামর্শের জন্য একজন যোগ্য চিকিৎসকের সাথে যোগাযোগ করুন।' যদি ইউজারের কমান্ড ফাকা থাকে তাহলে ইউজারের কমান্ড স্কিপ করবা। আর যদি ইউজার কমান্ড থাকে তাহলে অবশ্যই সেটা পুরণ করবা। ইউজারের কমান্ডঃ ${userPrompt} ।
        `,
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
      ]);
  
      const description = result.response.text();
      cleanupFile(filePath);
      res.json({ analysisResult: description });
    } catch (error) {
      console.error("Error during image analysis:", error.message);
      if (req.file) cleanupFile(req.file.path);
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

app.post("/api/prescription-analysis", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please upload an image." });
    }

    const { path: filePath, originalname, mimetype } = req.file;
    const userPrompt = req.body.prompt || ""; 

    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimetype,
      displayName: originalname,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent([
      `ইমেজটি অ্যানালাইসিস করে (হাতের লিখা প্রেসক্রিপশন হলেও হবে) এই পয়েন্ট গুলো একটা একটা অ্যানালাইসিস করে আউটপুট দিবা। ১. প্রেসক্রিপশনের সাথারণ তথ্য সমূহ ২. প্রেসক্রিপশনে যা যা বলা হয়েছে ৩. প্রেসক্রিপশনের ওষুধ গুলোর কাজ ৪. প্রেসক্রিপশনের ওষুধ গুলোর পার্শ্বপ্রতিক্রিয়া। এগুলো দেওয়ার পাশাপাশি ইউজারের কমান্ডও পুরণ করে আউটপুট দিবা।
      'প্রেসক্রিপশনে যা যা বলা হয়েছে' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'প্রেসক্রিপশনে যা যা বলা হয়েছে' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">সময়(সকাল/দুপুর/রাত)</th>
          <th style="border: 1px solid #ddd; padding: 8px;">খাওয়ার আগে/পরে</th>
          <th style="border: 1px solid #ddd; padding: 8px;">সময়কাল</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        'প্রেসক্রিপশনের ওষুধ গুলোর কাজ' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'প্রেসক্রিপশনের ওষুধ গুলোর কাজ' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">ওষুধের নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">কাজ</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        'প্রেসক্রিপশনের ওষুধ গুলোর পার্শ্বপ্রতিক্রিয়া' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'প্রেসক্রিপশনের ওষুধ গুলোর পার্শ্বপ্রতিক্রিয়া' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">ওষুধের নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">পার্শ্বপ্রতিক্রিয়া</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
      Tag আর Attribute হিসেবে যেগুলো must ব্যবহার করবা b, p, br, hr, h2, h3, ul, li. পয়েন্ট গুলো রাখবা h3 ট্যাগে এবং পয়েন্টের উত্তর গুলো রাখবা p ট্যাগের ভিতরে। p ট্যাগের ভিতরে b, p, br, hr, h2, h3, ul, li এসব অবশ্যই ইউজ করবা। প্রতিটা p ট্যাগের পর একটা অবশ্যই <br /> ব্যবহার করবা। নোটেবল লাইন বা টেক্সট গুলো লাল কালারের টেক্সট দিয়ে হাইলাইট করে দিবা। পয়েন্ট গুলোর টাইটেল h2 ট্যাগের ভিতরে রাখবা। এছাড়া আর কোন html ট্যাগ ইউজ করতে পারবা না। <html> <body> এগুলোও না। কোনো # ব্যবহার করবা না কোডে। আর সবার নিচে লাল কালারে একটা ডিসক্লেইমার দিবা (প্রেসক্রিপশন না হলে ডিসক্লেইমার দিবা না) আর যার টেক্সট হবে 'নোটঃ উপরোক্ত বিশ্লেষণ শুধুমাত্র তথ্যমূলক যা প্রেসক্রিপশনের ডেটার ভিত্তিতে করা হয়েছে এবং কোনওভাবেই মেডিকেল পরামর্শের বিকল্প নয়। যথাযথ মেডিকেল পরামর্শের জন্য একজন যোগ্য চিকিৎসকের সাথে যোগাযোগ করুন।' সবার যদি ইউজারের কমান্ড ফাকা থাকে তাহলে ইউজারের কমান্ড স্কিপ করবা। আর যদি ইউজার কমান্ড থাকে তাহলে অবশ্যই সেটা পুরণ করবা। ইউজারের কমান্ডঃ ${userPrompt} ।
      `,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const description = result.response.text();
    cleanupFile(filePath);
    res.json({ analysisResult: description });
  } catch (error) {
    console.error("Error during image analysis:", error.message);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});


app.post("/api/image-to-disease", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please upload an image." });
    }

    const { path: filePath, originalname, mimetype } = req.file;
    const userPrompt = req.body.prompt || ""; 

    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimetype,
      displayName: originalname,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent([
      `এই ইমেজটি বিশ্লেষণ করবা এবং নিচের পয়েন্ট গুলো একটা একটা অ্যানালাইসিস করে আউটপুট দিবা। ১. ইমেজ সম্পর্কে সাধারণ তথ্য, ২. যেকারণে এরকম হতে পা্রে, ৩. সম্ভাব্য ঝুকি বা রোগ, ৪. ঝুকি এড়াতে পরবর্তী পদক্ষেপ, ৫. প্রাথমিক চিকিৎসা। এগুলো দেওয়ার পাশাপাশি ইউজারের কমান্ডও পুরণ করে আউটপুট দিবা।
      'যেকারণে এরকম হতে পারে' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'যেকারণে এরকম হতে পারে' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">কারণ</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        'ঝুকি এড়াতে পরবর্তী পদক্ষেপ' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'ঝুকি এড়াতে পরবর্তী পদক্ষেপ' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">পদক্ষেপ</th>
          <th style="border: 1px solid #ddd; padding: 8px;">নির্দেশনা</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
        'প্রাথমিক চিকিৎসা' একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। 'প্রাথমিক চিকিৎসা' এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">চিকিৎসা</th>
          <th style="border: 1px solid #ddd; padding: 8px;">নির্দেশনা</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
      Tag আর Attribute হিসেবে যেগুলো must ব্যবহার করবা b, p, br, hr, h2, h3, ul, li. পয়েন্ট গুলো রাখবা h3 ট্যাগে এবং পয়েন্টের উত্তর গুলো রাখবা p ট্যাগের ভিতরে। p ট্যাগের ভিতরে b, p, br, hr, h2, h3, ul, li এসব অবশ্যই ইউজ করবা। প্রতিটা p ট্যাগের পর একটা অবশ্যই <br /> ব্যবহার করবা। নোটেবল লাইন বা টেক্সট গুলো লাল কালারের টেক্সট দিয়ে হাইলাইট করে দিবা। পয়েন্ট গুলোর টাইটেল h2 ট্যাগের ভিতরে রাখবা। এছাড়া আর কোন html ট্যাগ ইউজ করতে পারবা না। <html> <body> এগুলোও না। কোনো # ব্যবহার করবা না কোডে। আর সবার নিচে লাল কালারে একটা ডিসক্লেইমার দিবা (প্রেসক্রিপশন না হলে ডিসক্লেইমার দিবা না) আর যার টেক্সট হবে 'নোটঃ উপরোক্ত বিশ্লেষণ শুধুমাত্র তথ্যমূলক যা প্রেসক্রিপশনের ডেটার ভিত্তিতে করা হয়েছে এবং কোনওভাবেই মেডিকেল পরামর্শের বিকল্প নয়। যথাযথ মেডিকেল পরামর্শের জন্য একজন যোগ্য চিকিৎসকের সাথে যোগাযোগ করুন।' সবার যদি ইউজারের কমান্ড ফাকা থাকে তাহলে ইউজারের কমান্ড স্কিপ করবা। আর যদি ইউজার কমান্ড থাকে তাহলে অবশ্যই সেটা পুরণ করবা। ইউজারের কমান্ডঃ ${userPrompt} ।
      `,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const description = result.response.text();
    cleanupFile(filePath);
    res.json({ analysisResult: description });
  } catch (error) {
    console.error("Error during image analysis:", error.message);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});


app.post("/api/health-risk-predictor", async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(400).json({ error: "No data provided. Please fill in the form." });
    }
    
    const userText = JSON.stringify(userData);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent([
      `${userText} - এটি অ্যানালাইসিস করে বিস্তারিত একটা রিপোর্ট দেবা যে আমার ভবিষ্যতের কোনো রোগের রিস্ক আছে কিনা বা আমার কি কি সমস্যা হতে পারে। এর জন্য যে পয়েন্ট গুলোর প্রত্যেকটির উত্তর দিবা সেগুলো হলো ১. বর্তমান স্বাস্থ্য অবস্থা, ২. বর্তমান স্বাস্থ্য সমস্যা, ৩. ভবিষ্যতে রোগের সম্ভাবনা, ৪. জীবনযাপনে প্রয়োজনীয় পরিবর্তন, ৫. গুরুত্বপূর্ণ বিষয়, ৬. মেডিকেল পরামর্শ। এগুলোর উত্তর পয়েন্ট বা লিস্ট আকারে দিবা। আউটপুট হিসেবে Tag আর Attribute হিসেবে যেগুলো must ব্যবহার করবা b, p, br, hr, h2, h3, ul, li. পয়েন্ট গুলো রাখবা h3 ট্যাগে এবং পয়েন্টের উত্তর গুলো রাখবা p ট্যাগের ভিতরে। 
        ভবিষ্যতে রোগের সম্ভাবনা একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। ভবিষ্যতে রোগের সম্ভাবনা এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">রোগের নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">কারণ</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>

        জীবনযাপনে প্রয়োজনীয় পরিবর্তন একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। জীবনযাপনে প্রয়োজনীয় পরিবর্তন এর টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">পরিবর্তনের নাম</th>
          <th style="border: 1px solid #ddd; padding: 8px;">কারণ</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
          <td style="border: 1px solid #ddd; padding: 8px;">#</td>
        </tr>
        </table>
      
      p ট্যাগের ভিতরে b, p, br, hr, h2, h3, ul, li এসব অবশ্যই ইউজ করবা। প্রতিটা p ট্যাগের পর একটা অবশ্যই <br /> ব্যবহার করবা। নোটেবল লাইন বা টেক্সট গুলো লাল কালারের টেক্সট দিয়ে হাইলাইট করে দিবা। পয়েন্ট গুলোর টাইটেল h2 ট্যাগের ভিতরে রাখবা। এছাড়া আর কোন html ট্যাগ ইউজ করতে পারবা না। কোনো # ব্যবহার করবা না কোডে। <html> <body> এগুলোও না। আর সবার নিচে লাল কালারে একটা ডিসক্লেইমার দিবা যার টেক্সট হবে 'নোটঃ উপরোক্ত বিশ্লেষণ শুধুমাত্র তথ্যমূলক যা কোনওভাবেই মেডিকেল পরামর্শের বিকল্প নয়। যথাযথ মেডিকেল পরামর্শের জন্য একজন যোগ্য চিকিৎসকের সাথে যোগাযোগ করুন।' ।
      `
    ]);

    const description = result.response.text();
    res.json({ analysisResult: description });
  } catch (error) {
    console.error("Error during analysis:", error.message);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

app.post("/api/diet-and-fitness-plan", async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(400).json({ error: "No data provided. Please fill in the form." });
    }
    
    const userText = JSON.stringify(userData);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent([
      `${userText} - এটি অ্যানালাইসিস করে আমাকে একটা পার্সোনাল ডায়েট ও ফিটনেস প্ল্যান করে একটি রুটিন করে দেবা। এর জন্য নিচের পয়েন্ট গুলোর প্রত্যেকটির বিস্তারিত উত্তর দিবা। ১. ওভারভিউ ২. ডায়েট প্ল্যান, ৩. ফিটনেস প্ল্যান, ৪. দৈনন্দিন খাদ্যতালিকা ৪. প্রয়োজনীয় ব্যায়াম, ৫. রুটিন, ৬. যেসব বিষয়ে খেয়াল রাখা দরকার। এগুলোর উত্তর পয়েন্ট বা লিস্ট আকারে দিবা। আউটপুট হিসেবে Tag আর Attribute হিসেবে যেগুলো must ব্যবহার করবা b, p, br, hr, h2, h3, ul, li, table, td, tr, th. পয়েন্ট গুলো রাখবা h3 ট্যাগে এবং পয়েন্টের উত্তর গুলো রাখবা p ট্যাগের ভিতরে। রুটিন ও দৈনন্দিন খাদ্যতালিকা একটি স্টাইলিশ টেবিলের ভিতরে রাখবা। টেবিলের স্টাইল যেরকম হবে - 
        <table style="width:100%; border-collapse: collapse;">
        <tr style="background-color:#f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">সময়</th>
          <th style="border: 1px solid #ddd; padding: 8px;">টাস্ক</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">সময়</td>
          <td style="border: 1px solid #ddd; padding: 8px;">টাস্কের নাম</td>
        </tr>
        </table>
        'যেসব বিষয়ে খেয়াল রাখা দরকার' এই পয়েন্টটা li আকারে দিবা।
      p ট্যাগের ভিতরে b, p, br, hr, h2, h3, ul, li, table, td, tr, th এসব অবশ্যই ইউজ করবা। প্রতিটা p ট্যাগের পর একটা অবশ্যই <br /> ব্যবহার করবা। নোটেবল লাইন বা টেক্সট গুলো লাল কালারের টেক্সট দিয়ে হাইলাইট করে দিবা। পয়েন্টের টাইটেল গুলোকে h2 এর ভিতর রাখবা। এছাড়া আর কোন html ট্যাগ ইউজ করতে পারবা না। <html> <body> এগুলোও না। কোনো # ব্যবহার করবা না কোডে। আর সবার নিচে লাল কালারে একটা ডিসক্লেইমার দিবা যার টেক্সট হবে 'নোটঃ উপরোক্ত বিশ্লেষণ শুধুমাত্র তথ্যমূলক যা কোনওভাবেই মেডিকেল পরামর্শের বিকল্প নয়। যথাযথ মেডিকেল পরামর্শের জন্য একজন যোগ্য চিকিৎসকের সাথে যোগাযোগ করুন।' ।
      `
    ]);

    const description = result.response.text();
    res.json({ analysisResult: description });
  } catch (error) {
    console.error("Error during analysis:", error.message);
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

async function startServer() {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('⚠️  Server starting without database connection!');
        console.error('Please check your database configuration in .env file');
    }

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer();
