# SmartWeb

**Your Professional Academic Website — Crafted by AI, Built Without Code**

SmartWeb is a Django-based platform that lets professors, researchers, and academic labs generate a polished personal portfolio website in minutes — no coding, no designer, no developer fees. Unlike generic site builders, SmartWeb is purpose-built for academia: publications, teaching, research interests, and CVs are first-class citizens, not generic text blocks.

🔗 **Live demo:** [smartweb.onrender.com](https://smartweb.onrender.com)

---

## ✨ Why SmartWeb

Academics need a professional online presence, but most lack the time, budget, or technical skill to build one. SmartWeb solves this with:

- **Dual-Input System** — fill in your details manually, or simply upload your CV and let AI do the rest.
- **AI-Powered CV Parsing** — upload a CV (PDF/DOCX) and SmartWeb automatically extracts your education, publications, teaching history, research interests, and contact info, then generates a polished, tenure-appropriate biography in your own voice (not copy-pasted from the CV).
- **Live Dashboard** — update your portfolio instantly, anytime, without touching code.
- **Export Source Code** — own your site. Download the full source and self-host anywhere, with no recurring subscription.
- **Academic-Centric Templates** — sections designed around real academic needs: bibliographies, syllabi, research highlights — not generic "About Me" pages.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **AI CV Parsing** | Upload a PDF/DOCX CV → structured JSON extraction → auto-populated profile, education, publications, teaching, research interests, and contact links |
| **AI-Generated Bio** | 2–4 sentence academic biography synthesized (not copied) from CV content |
| **Manual Editor** | Full manual entry option for users who prefer not to upload a CV |
| **Publications Manager** | Structured publication entries with links to PDFs and GitHub repos |
| **Teaching Module** | Course listings with syllabus links and semester info |
| **Google Login** | Sign in with Google via `django-allauth` |
| **Cloud Media Storage** | Profile images and uploaded CVs stored on Cloudinary (persistent across deploys) |
| **Publish Portofolio** | Publish your portofolio by clicking on one button |
| **Responsive Design** | Mobile-first layout that works cleanly across devices |

---

## 🛠️ Tech Stack

- **Backend:** Python, Django
- **Frontend:** HTML5, CSS3, Bootstrap
- **Database:** SQLite (local development) / MySQL (production)
- **AI Integration:** [Together AI](https://www.together.ai/) Chat Completions API — CV data extraction and bio generation
- **File Parsing:** `pypdf` + `pdfplumber` (PDF fallback chain), `python-docx` (DOCX)
- **Media Storage:** Cloudinary (`django-cloudinary-storage`) — images and CV/PDF files
- **Auth:** `django-allauth` (Google OAuth)
- **Hosting:** [Render](https://render.com)
- **Dev Tools:** Git & GitHub (branch-based workflow), Figma (wireframing/prototyping)

---

## 🧠 How CV Parsing Works

```
User uploads CV (PDF/DOCX)
      │
      ▼
Extract raw text  ──── pypdf → pdfplumber fallback (PDF) / python-docx (DOCX)
      │
      ▼
Send text to Together AI with a structured JSON prompt
      │
      ▼
Clean & repair response  ──── handles truncated/malformed JSON automatically
      │
      ▼
Normalize to fixed schema  ──── guarantees all expected keys exist
      │
      ▼
Save to database  ──── Profile, Education, Publication, Teaching,
                        ResearchInterest, ContactLink (bulk_create,
                        duplicate-safe — skips sections that already
                        have data)
      │
      ▼
Portfolio is live
```

The extraction pipeline includes retry logic (up to 3 attempts), a dual PDF-reading fallback for damaged or unusual files, and automatic JSON-repair for truncated AI responses — built to hold up against real, messy user uploads rather than just clean demo files.

---
