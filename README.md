🌿 PlantCare AI

AI-Powered Plant Disease Detection Web Application

PlantCare AI is a computer-vision web application that analyzes an uploaded plant or leaf image, identifies the plant, and checks for visible disease symptoms using AI image inference.

The application is designed to provide an easy-to-use interface for students, gardeners, farmers, and anyone interested in understanding plant health.

«Note: PlantCare AI provides educational AI predictions. Disease results should be verified by a qualified agricultural or plant-health professional before taking treatment decisions.»

---

✨ Features

- 🌱 Plant Identification
  
  - Identifies the plant shown in an uploaded image.
  - Provides an estimated plant-identification confidence.

- 🔬 AI Plant Disease Detection
  
  - Analyzes visible symptoms such as spots, discoloration, lesions, mold, and other disease indicators.
  - Attempts to identify a likely disease when the symptoms support a reliable classification.

- 📊 Honest Confidence Handling
  
  - Confidence is shown only when the AI can provide a meaningful prediction.
  - If a disease cannot be reliably determined, the application reports "Unable to determine" instead of displaying a misleading confidence percentage.

- 📷 Image Upload & Preview
  
  - Supports JPG, PNG, and WEBP images.
  - Maximum upload size: 8 MB.
  - Preview the selected image before analysis.

- 🖥️ Dashboard
  
  - Displays total scans.
  - Shows the latest plant, disease, confidence, and status.
  - Provides a quick view of the most recent recognition.

- 🕘 Recognition History
  
  - Stores successful scan results in the browser using "localStorage".
  - View previous plant recognition results.
  - Clear stored recognition history when required.

- ⚠️ Error & Uncertainty States
  
  - Handles invalid images, unavailable AI services, rate limits, and uncertain predictions.
  - Provides clear messages when analysis cannot be completed.

- 📱 Responsive Interface
  
  - Designed to work across desktop and mobile screen sizes.

- ℹ️ About Project
  
  - Explains how the AI detection system works, its scope, and its limitations.

---

🧠 How It Works

The application follows a two-stage AI analysis process:

Upload Plant / Leaf Image
          ↓
      Image Preview
          ↓
    AI Image Inference
          ↓
    Identify the Plant
          ↓
Analyze Visible Symptoms
          ↓
Healthy / Diseased / Undetermined
          ↓
Display Result & Confidence
          ↓
Save Successful Scan
     (Browser Storage)

Detection Process

1. The user uploads a plant or leaf image.
2. The image is sent to the server-side "/api/detect" endpoint.
3. The AI model first attempts to identify the plant.
4. It then examines visible symptoms for possible diseases.
5. The application displays:
   - Plant name
   - Plant confidence
   - Disease name
   - Disease confidence
   - Health status
   - Explanation of the result
   - Basic plant information
6. Successful recognition results are stored locally in the user's browser.

---

🛠️ Tech Stack

Technology| Purpose
React 19| Frontend user interface
TypeScript| Type-safe application development
TanStack Start| Full-stack React framework and routing
TanStack Router| File-based application routing
Vite| Development server and build tool
Tailwind CSS v4| Styling and responsive UI
Lucide React| Interface icons
React Hook Form| Form handling
Zod| Data validation
Recharts| Data visualization support
Lovable AI Gateway| AI image inference
localStorage| Browser-side recognition history

---

📂 Project Structure

plantcare-src/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── hooks/                  # React hooks
│   │
│   ├── lib/
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── history.ts          # Recognition history utilities
│   │   └── utils.ts
│   │
│   ├── routes/
│   │   ├── api/
│   │   │   └── detect.ts       # AI image detection endpoint
│   │   ├── index.tsx           # Dashboard
│   │   ├── detect.tsx          # Disease detection page
│   │   ├── history.tsx         # Recognition history
│   │   ├── about.tsx            # Project information
│   │   └── __root.tsx
│   │
│   ├── AppNav.tsx
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bun.lock
└── roadmap.md

---

🚀 Getting Started

Prerequisites

Make sure you have:

- Node.js 20+
- npm

You can check your installed versions with:

node --version
npm --version

1. Clone the Repository

git clone https://github.com/<your-username>/plantcare-ai.git

2. Open the Project

cd plantcare-ai

If the repository contains the application inside the "plantcare-src" directory:

cd plantcare-src

3. Install Dependencies

npm install

4. Configure the AI API Key

PlantCare AI uses the Lovable AI Gateway for image inference.

Set the following environment variable:

LOVABLE_API_KEY=<your-key>

For local development, you can create a ".env" file in the project directory:

LOVABLE_API_KEY=your_key_here

Do not commit your API key or ".env" file to GitHub.

5. Start the Development Server

npm run dev

Open the local URL shown in the terminal.

---

📜 Available Scripts

npm run dev

Starts the development server.

npm run build

Creates a production build.

npm run preview

Runs a preview of the production build.

npm run lint

Checks the project for linting issues.

npm run format

Formats the project using Prettier.

---

🔐 Data & Privacy

PlantCare AI does not currently use:

- User accounts
- Login/authentication
- A database
- Cloud storage for recognition history

Recognition history is stored locally in the browser using "localStorage".

The uploaded image is sent to the configured AI inference service when the user starts a detection.

For production deployment, review the privacy policies and data-handling requirements of the selected AI service before using the application with sensitive images.

---

🤖 AI Detection

The AI detection endpoint uses multimodal image inference to analyze plant images.

The system is instructed to:

1. Determine whether the uploaded image contains a plant.
2. Identify the plant when possible.
3. Examine visible symptoms.
4. Determine whether the plant appears healthy or diseased.
5. Identify a disease only when the visible symptoms support the prediction.
6. Return an uncertain result when the disease cannot be reliably classified.

Possible statuses include:

- "Healthy"
- "Diseased"
- "Undetermined"
- "Not a plant"

The system intentionally avoids inventing a disease or displaying an artificial high-confidence score when the image is ambiguous.

---

⚠️ Limitations

PlantCare AI has several limitations:

- AI predictions depend on image quality.
- Poor lighting, blurry images, or partially visible leaves can reduce accuracy.
- Some diseases have similar visual symptoms.
- The model may not recognize every plant species or disease.
- AI predictions should not replace professional agricultural diagnosis.
- Recognition history is browser-specific because it uses "localStorage".
- A working "LOVABLE_API_KEY" is required for live AI detection outside an environment that provides the key automatically.

---

🔮 Future Improvements

Possible future enhancements include:

- 📱 Progressive Web App support
- 🌍 Multi-language support
- 📈 Plant health analytics
- 🌦️ Weather-based plant health insights
- 💧 Plant watering reminders
- 🗃️ Cloud-based user accounts and history
- 📚 Expanded plant and disease knowledge base
- 🧑‍🌾 Expert consultation features
- 📊 Advanced disease statistics
- 📷 Camera-based real-time plant scanning

---

🎓 Project Purpose

PlantCare AI was developed as an academic and practical AI/ML project demonstrating how computer vision and modern web technologies can be combined to create a useful plant-health application.

The project focuses on:

- Artificial Intelligence
- Computer Vision
- Image Classification
- Full-Stack Web Development
- TypeScript
- React
- AI-powered decision support

---

📄 License

This project is intended for educational and project demonstration purposes.

If you plan to publish or reuse the project commercially, review the licenses and terms of the third-party libraries and AI services used by the application.

---

👨‍💻 Author

Vignesh Madhan Babu

PlantCare AI — AI-powered plant disease detection.

Internship

CodeTech IT Solutions
Intern ID: "CITS9005"

---

⭐ If you find this project useful, consider giving the repository a star!
