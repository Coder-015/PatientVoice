<div align="center">
  <img src="public/medical_scan.png" alt="PatientVoice Graphic" width="100%" style="border-radius:12px; margin-bottom:16px;" />
  <h1>🩺 PatientVoice AI</h1>
  <p><strong>Bridging the gap between what you feel and what your doctor hears.</strong></p>
</div>

---

## 💡 What's the Vibe?

Ever tried explaining a weird symptom to a doctor and totally blanked out on the details? **PatientVoice** is built to fix exactly that. It's an AI-powered project I built to literally translate everyday human symptoms into clinical-grade terminology. 

You just dump whatever's bothering you into the text box, and the web app leverages the ridiculously fast **Groq LLaMA-3.1 model** to act like an elite medical diagnostician. It maps your symptoms against the Human Phenotype Ontology, generates potential medical conditions, and hands you concrete bullet points so you know *exactly* what to ask your doc. 

Everything is wrapped in a super clean, responsive UI built natively on **Next.js**, and securely synced to the cloud using **Supabase** backend auth. Plus, it features a dynamic dashboard tracking your medical reporting history!

## ✨ The Cool Stuff

- **🧠 Elite Symptom Sleuthing:** Uses top-tier LLMs to analyze your raw symptom narratives and return highly accurate clinical differentials.
- **🗣️ Doc-Translation:** It doesn't just guess what's wrong—it hands you a personalized cheat sheet of "What to tell your doctor" so you sound prepared during your appointment.
- **🔐 Secure & Personal:** Hooked up with Supabase Auth and Row Level Security. It remembers your customized profile context (Age, History) so the AI gets smarter and more relevant the more you use it.
- **🖨️ Magic PDF Exports:** Instead of taking screenshots, just hit 'Download' and the app uses custom CSS routing to strip all the UI elements out, giving you a pristine, professional clinical printout ready for a physician.
- **💻 The Stack:** Natively built on Next.js 14 App Router, strictly typed with TS, connected to Postgres, and blazingly fast.

## 👨‍💻 Built By

Designed, engineered, and shipped by **[Coder-015](https://github.com/Coder-015)**. 

I'm super passionate about mashing bleeding-edge AI models with modern web stacks to build things that actually matter. PatientVoice was cooked up because health tech shouldn't feel incredibly rigid and complicated—it should feel empathetic, smart, and genuinely useful.

Feel free to check out my other repos and projects over on my [GitHub Profile](https://github.com/Coder-015). Peace! ✌️

---
*Disclaimer: PatientVoice is an experimental side project built for informational augmentation. It definitely doesn't replace real medical advice from an actual doctor.*
