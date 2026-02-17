🚀 Social Media Content Analyzer
📌 Overview

The Social Media Content Analyzer is a full-stack web application that extracts text from PDF and image files and provides engagement-based content analysis for social media posts.

The application enables users to upload content, automatically extract text using OCR or PDF parsing, and receive structured suggestions to improve engagement quality.



🛠️ Tech Stack
Frontend

Next.js

TypeScript

Tailwind CSS

Axios

Backend

Node.js

Express.js

Multer (File Upload Handling)

Text Processing

Tesseract.js (OCR for Images)

pdf-parse (PDF Text Extraction)



Deployment

Vercel (Frontend)

Render (Backend)

✨ Features

📂 Drag-and-drop file upload

📄 PDF text extraction

🖼️ Image OCR processing

📊 Word count analysis

#️⃣ Hashtag detection

📢 Call-to-action keyword detection

💡 Engagement improvement suggestions

⏳ Loading states and user feedback

⚠️ File validation and error handling


🌐 Live Demo

Frontend:
👉 https://social-media-analyzer-one.vercel.app/


🔄 How It Works

The user uploads a PDF or image file.

The backend processes the file:

PDFs → Extracted using pdf-parse

Images → Processed using Tesseract.js OCR

Extracted text is returned as a JSON response.

The frontend analyzes:

Word count

Hashtag usage

Call-to-action presence

Engagement suggestions are generated dynamically.


🧠 Engagement Analysis Logic

The application includes lightweight rule-based heuristics:

Optimal caption length detection (50–200 words)

Hashtag presence validation

Call-to-action keyword scanning (e.g., follow, comment, share)

Dynamic suggestion generation
