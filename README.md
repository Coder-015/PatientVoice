<div align="center">
  <img src="public/medical_scan.png" alt="PatientVoice Architecture" width="100%" style="border-radius:12px; margin-bottom:16px;" />
  <h1>🩺 PatientVoice AI</h1>
  <p><strong>Next-Generation Clinical Diagnostics & Empathetic Patient Companion</strong></p>
</div>

---

## 📖 Overview

**PatientVoice** is a full-stack, AI-powered health technology application designed to bridge the communication gap between patients and medical professionals. By combining the ultra-fast inferencing capabilities of the **Groq LLaMA-3.1 model** with the secure infrastructure of **Supabase**, PatientVoice empowers users to log their symptoms, receive highly accurate differential diagnoses based on the Human Phenotype Ontology, and generate printable, clinical-grade reports.

## ✨ Key Features

- **🧠 Elite Medical Diagnostics:** Cross-references patient symptom narratives against established clinical guidelines and peer-reviewed literature to generate robust differential diagnoses.
- **🗣️ Doctor-Patient Translation:** Automatically translates complex medical terminology into actionable "What to tell your doctor" talking points to improve clinical encounters.
- **🔐 Secure Authentication & Profiles:** Engineered with strict Supabase Row Level Security (RLS). Users maintain persistent customized profiles (Age, Gender, Baseline Medical History) for personalized LLM context injection.
- **📊 Dynamic Reporting Dashboard:** Automatically aggregates recent medical insights into an interactive analytics dashboard featuring your latest session data.
- **🖨️ Clinical Exporting:** Seamlessly generates print-ready, CSS-optimized PDF medical reports stripped of UI boilerplate using `@media print` engineering.
- **💻 Lightning Fast Stack:** Built natively on Next.js App Router, strictly typed with TypeScript, and styled with high-fidelity custom CSS variables.

## 🛠️ Technology Stack

- **Frontend Core:** Next.js, React, TypeScript
- **Styling UI/UX:** Custom Vanilla CSS Grid/Flexbox architecture, Web Fonts (Inter, Manrope)
- **AI / LLM Integration:** Groq SDK (`llama-3.1-8b-instant`)
- **Backend & Database:** Supabase (PostgreSQL, GoTrue Auth, Row Level Security)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Coder-015/PatientVoice.git
cd PatientVoice
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env.local` file in the root directory containing your API and Database tokens:
```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the `setup_v2.sql` and `fix_delete.sql` scripts located in the root of the project within your Supabase SQL Editor. This automatically generates the tables for `profiles`, `consultations`, and securely binds the Row Level Security limits.

### 5. Launch the Application
```bash
npm run dev
```

---

## 👨‍💻 About the Developer

Designed and engineered by **[Coder-015](https://github.com/Coder-015)**. 

Passionate about leveraging bleeding-edge Large Language Models and modern full-stack web architectures to solve meaningful, real-world problems. PatientVoice was built to address the friction in preliminary symptom assessment and to push the boundaries of what empathetic AI can achieve in consumer health tech. 

Check out more of my work on my [GitHub Profile](https://github.com/Coder-015).

---
*Disclaimer: PatientVoice is an experimental AI application designed for informational augmentation. It does not replace professional medical diagnosis or advice.*
