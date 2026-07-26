# AI-Powered Recipe Generator (GCP Free-Tier Only)

A full-stack web application where users can enter their available ingredients and optional dietary/allergen constraints to generate recipes using Gemini 1.5 Flash. Logged-in users can save recipes to their favorites list, synced to Firestore.

---

## ⚠️ CRITICAL FIRST STEP
Before deploying any GCP resources, **set a Budget Alert at $1.00** in your GCP Console:
1. Go to **Billing** > **Budgets & alerts** in the Google Cloud Console.
2. Click **Create Budget**, select this project, set the budget type to **Specified amount**, and input **$1.00**.
3. Set actions to trigger email alerts to the billing administrator at **50%**, **90%**, and **100%** of the budget.

---

## Technical Stack & Free-Tier Reference
Every service utilized in this project is configured to stay within the **GCP Always-Free Tier**:
*   **Gemini API via Google AI Studio**: 1.5 Flash (15 RPM, 1,500 Requests/day free).
*   **Cloud Functions (2nd gen)**: 2 Million invocations/month; 400,000 GB-seconds memory; 200,000 GHz-seconds CPU free.
*   **Firestore**: Native mode, 1 GiB storage; 50,000 reads, 20,000 writes, 20,000 deletes per day free.
*   **Firebase Hosting**: 10 GiB storage; 10 GiB transfer/month free.
*   **Firebase Authentication**: 50,000 Monthly Active Users (MAU) free.

---

## Project Structure
```
.
├── firebase.json                 # Firebase deployment configuration
├── firestore.rules               # Database access security rules
├── firestore.indexes.json        # Firestore indexes index
├── backend/                      # Node.js Cloud Function
│   ├── index.js                  # Entrypoint & Express handler
│   ├── promptTemplate.js         # Prompt structure & JSON schema
│   └── validator.js              # Programmatic allergen/diet validator
└── frontend/                     # React + Vite application
    ├── src/
    │   ├── firebase.js           # Firebase Client SDK init
    │   ├── App.jsx               # App container and logic
    │   └── components/           # Sub-components (Navbar, Form, Card, MyRecipes)
```

---

## Local Development & Setup

### 1. Environment Variables Setup

#### Backend (`backend/.env`):
Create a file named `.env` in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_from_ai_studio
PORT=8080
```
*(Get a free API key from [Google AI Studio](https://aistudio.google.com/))*

#### Frontend (`frontend/.env.local`):
Create a file named `.env.local` in the `frontend/` directory with your Firebase configuration values:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://127.0.0.1:8080
```
*(Create a Firebase Project at [Firebase Console](https://console.firebase.google.com/), add a Web App, and paste the config details here)*

### 2. Running Locally

#### Run the Backend Function:
```bash
cd backend
npm install
npm start
```
The backend will run on `http://127.0.0.1:8080`.

#### Run the Frontend Web App:
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React development server will start (usually on `http://localhost:5173`). Open it in your browser!

---

## Programmatic Constraint Testing
The backend features an automated **double-check validation layer** in `backend/validator.js` that checks for keyword violations (e.g. if dairy was excluded but the model still suggested "butter"). 
1. If Gemini returns a recipe containing a forbidden ingredient, the backend detects this, builds a correction feedback prompt, and queries Gemini a second time (repair loop).
2. If it still fails, the backend returns the recipe with `flagged: true` and a list of `violations`, displaying warning banners on the frontend UI.
*   **Test Case**: Select **Gluten-Free** and add **Soy Sauce** to ingredients. The model should either substitute soy sauce for "gluten-free tamari" or "coconut aminos" and list it under `substitutions`, or if it fails, a warning banner will appear in the UI.

---

## Deployment Steps (GCP Free-Tier Optimized)

### 1. Enable Required GCP APIs
Make sure your CLI is logged in and pointed to your project:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable the Google AI, Cloud Build, and Cloud Functions APIs
gcloud services enable generativelanguage.googleapis.com \
                       cloudfunctions.googleapis.com \
                       run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com
```

### 2. Deploy Backend Cloud Function
Deploy with optimized settings to restrict resource consumption:
```bash
cd backend
gcloud functions deploy generateRecipe \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --trigger-http \
  --allow-unauthenticated \
  --max-instances=1 \
  --memory=256Mi \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
*   `--max-instances=1`: Strict scaling limit to prevent cost run-ups.
*   `--memory=256Mi`: Standard low-memory allocation sufficient for API proxying.

**Important**: Make a note of the HTTPS trigger URL output by the deployment command (e.g. `https://generaterecipe-xxxxxx-uc.a.run.app`). Update your `frontend/.env.local` key `VITE_BACKEND_URL` with this value before building your production bundle.

### 3. Deploy Frontend and Database Rules to Firebase
Make sure the Firebase CLI is installed and configured:
```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID

# 1. Build the production assets
cd frontend
npm run build
cd ..

# 2. Deploy Firestore Rules and Hosting static files
firebase deploy --only firestore,hosting
```

---

## How to Keep Everything Free

To ensure you never pay a single cent, perform these monitoring routines:

1.  **Monitor Artifact Registry**: 
    Each time you deploy the Cloud Function, Cloud Build compiles a container image and stores it in Artifact Registry. Artifact Registry has a **500 MB free storage limit**.
    *   Go to **Artifact Registry** in the GCP Console.
    *   Locate the repository for Cloud Functions (e.g. `gcf-artifacts`).
    *   Delete older versions of images manually, or set up a Cleanup Policy to retain only the 1 or 2 latest images.
2.  **Verify Scaling is Set to Zero**:
    Confirm that Cloud Functions has `min-instances` set to `0` (this is the default, ensuring you pay $0 when the app is idle).
3.  **Monitor Firestore Operations**:
    In the Firebase Console, monitor the usage dashboard. The free limits of 50k reads and 20k writes per day are high for personal projects but worth keeping an eye on if you share the link.
