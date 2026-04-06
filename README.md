<div align="center">

<img src="public/medical_scan.png" alt="PatientVoice AI" width="20%" style="border-radius:12px;" />

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_API-F55036?style=flat-square)
![LLaMA](https://img.shields.io/badge/LLaMA_3.1-4F46E5?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

# 🩺 PatientVoice AI

**Bridging the gap between what you feel and what your doctor hears.**

[**Live Demo →**](https://your-deployment-link.vercel.app) &nbsp;·&nbsp; [**Source Code**](https://github.com/Coder-015) &nbsp;·&nbsp; [**Report a Bug**](https://github.com/Coder-015/issues)

</div>

---

## What is PatientVoice?

PatientVoice is an AI-powered health communication tool built for real people — not just doctors. You describe your symptoms in plain English. It maps them against the **Human Phenotype Ontology (HPO)**, generates a clinical differential using **Groq's blazingly fast LLaMA 3.1 inference**, and hands you a personalised report of exactly what to tell your doctor.

Everything is secured with **Supabase Auth + Row Level Security**, persisted to a Postgres backend, and exportable as a clean clinical PDF — no UI chrome, no clutter.

---

## ✨ Features — v4

| Feature | Description |
|---|---|
| 🧠 **Symptom Analysis** | HPO-grounded clinical differentials via LLaMA 3.1 |
| 🎙️ **Voice-to-Text** | Dictate symptoms — microphone maps directly to input |
| 💬 **Follow-up AI Chat** | Iterate on your diagnosis with an embedded chat interface |
| 🫀 **Body Quick-Select** | Tap body zones (Head, Chest, Joints, Stomach) to tag symptoms |
| 🖨️ **Clean PDF Export** | Custom CSS print routing — pristine clinical printout |
| 🌙 **Dark Mode** | Persistent toggle via `localStorage`, zero flash on load |
| 📧 **Forward to Doctor** | Set doctor name + email in Settings → one-click email forward |
| 🔐 **Secure Auth + RLS** | Supabase Row Level Security — your data never leaks |

---

## 🏗️ Architecture — RAG Pipeline
```
User Input → HPO Embedding → Vector Retrieval → LLaMA 3.1 (Groq) → Clinical Report → Supabase
```

1. **Ingestion** — Raw symptom text from the user
2. **Retrieval** — Semantic search against Human Phenotype Ontology embeddings
3. **Augmentation** — Retrieved HPO terms injected into the LLM context window
4. **Generation** — Groq LLaMA 3.1 produces structured clinical differentials
5. **Persistence** — Report saved to Supabase Postgres with RLS

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| LLM Inference | Groq API — LLaMA 3.1 |
| Knowledge Base | Human Phenotype Ontology (HPO) |
| Auth + DB | Supabase (Auth, Postgres, RLS) |
| Styling | Tailwind CSS |
| Deployment | Vercel (Edge runtime) |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/Coder-015/patientvoice-ai
cd patientvoice-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Open `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```
```bash
# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live.

---

## 📁 Project Structure
```
patientvoice-ai/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Auth routes (login, signup)
│   ├── dashboard/        # Report history dashboard
│   ├── report/           # AI report generation + chat
│   └── settings/         # Profile, doctor connect
├── components/           # Reusable UI components
├── lib/
│   ├── supabase/         # Supabase client + types
│   ├── groq/             # LLM API helpers
│   └── hpo/              # HPO ontology retrieval
└── public/               # Static assets
```

---

## 👨‍💻 Built By

**[Coder-015](https://github.com/Coder-015)** — CS undergrads obsessed with shipping things that actually matter.

PatientVoice was designed, engineered, and deployed entirely solo. The goal was simple: health tech should feel empathetic and smart — not rigid and clinical. This project is my attempt at that.

Check out my other work on [GitHub →](https://github.com/Coder-015)

---

> **Disclaimer:** PatientVoice is an experimental project built for informational augmentation only. It does not replace professional medical advice, diagnosis, or treatment from a qualified physician. Always consult a real doctor for medical decisions.
