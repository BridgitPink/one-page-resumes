# One Page Resumes

AI-powered resume generator designed for **college students and early-career professionals**.
The application transforms minimal user input into a **clean, one-page professional resume**, analyzes keyword alignment with job descriptions, and provides actionable improvement suggestions.

This project demonstrates **full-stack AI integration**, including structured LLM outputs, resume scoring, keyword analysis, and recommendation systems.

---

# Project Goal

Build a **professional end-to-end AI product** that:

* Converts rough resume input into a **structured one-page resume**
* Highlights **ATS keywords**
* Scores resume competitiveness
* Suggests **projects, certifications, and improvements**
* Provides an **interactive preview interface**

The project is intended as a **portfolio piece demonstrating AI engineering and full-stack development skills**.

---

# Tech Stack

Frontend

* Next.js (App Router)
* React
* TypeScript
* TailwindCSS

Backend

* Next.js API Routes
* OpenAI API (structured JSON generation)

AI / Analysis

* Structured LLM resume generation
* Keyword matching engine
* Resume scoring rubric
* Recommendation generation

Development Tools

* Node.js
* npm
* Git / GitHub

---

# Current Architecture

User Flow

```
Landing Page
     ↓
Resume Builder Form
     ↓
AI Resume Generation
     ↓
Resume Analysis
     ↓
Interactive Preview
```

System Pipeline

```
Builder Form
     ↓
/api/generate-resume
     ↓
OpenAI Structured Resume JSON
     ↓
/api/analyze-resume
     ↓
Keyword Analysis
Resume Scoring
Recommendations
     ↓
Preview Page UI
```

---

# Features Implemented

## 1. Resume Builder

Location:

```
/builder
```

Collects minimal user input including:

* name
* school
* degree
* graduation date
* GPA
* experience
* projects
* skills
* target role
* job description

User input is intentionally **minimal and simple** to encourage quick completion.

The form data is stored in:

```
localStorage
```

---

## 2. AI Resume Generation

Endpoint:

```
/api/generate-resume
```

Uses the OpenAI API to convert user input into a structured resume object.

Output structure:

```
GeneratedResume
 ├ basics
 ├ target
 ├ summary
 ├ experience
 ├ projects
 ├ skills
 └ extras
```

The model uses a **JSON Schema output format** to ensure consistent structured responses.

Prompt engineering includes:

* STAR-style bullet rewriting
* strong technical verbs
* alignment with job descriptions
* no hallucinated experience

---

## 3. Resume Analysis Pipeline

Endpoint:

```
/api/analyze-resume
```

This pipeline performs:

### Keyword Matching

Analyzes overlap between:

```
resume content
vs
job description
```

Outputs:

* matched keywords
* missing keywords
* keyword match score

---

### Resume Scoring Engine

Generates a rubric score based on:

* keyword alignment
* content strength
* completeness
* formatting readiness

Example output:

```
Resume Score: 61 / 100
```

---

### Recommendations Engine

Suggests improvements such as:

Projects to build

Example:

* full-stack web application
* data analysis project
* dashboard project

Certifications

Example:

* AWS Cloud Practitioner
* Google Data Analytics
* CompTIA Security+

Resume Improvements

Example:

* add leadership
* strengthen technical bullets
* add measurable results

---

## 4. Preview Interface

Location:

```
/preview
```

Displays:

Left Sidebar

* resume score
* keyword match analysis
* strengths
* improvement suggestions
* recommended projects
* suggested certifications
* resume build snapshot

Right Panel

* formatted resume preview
* highlighted keyword matches
* structured resume sections

Sections:

```
Summary
Education
Experience
Projects
Skills
Additional Information
```

---

## 5. Resume Generation Test Page

Location:

```
/generated
```

Purpose:

* test AI resume generation independently
* display resume without analysis sidebar

Useful for debugging the generation pipeline.

---

# Prompt Engineering Improvements

The resume generation prompt has been upgraded to produce stronger resume bullets.

Key improvements:

* STAR-style bullet generation
* action verbs
* concise formatting
* job description alignment
* strict anti-hallucination rules

Example transformation:

Input

```
worked on website
```

Output

```
Developed web application features improving usability and performance using React and modern frontend tooling.
```

---

# Environment Setup

Required:

```
Node.js
npm
OpenAI API key
```

Create:

```
.env.local
```

Add:

```
OPENAI_API_KEY=your_api_key_here
```

Start development server:

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Repository Structure

```
src
 ├ app
 │  ├ api
 │  │  ├ analyze-resume
 │  │  └ generate-resume
 │  ├ builder
 │  ├ preview
 │  └ generated
 │
 ├ lib
 │  └ resume
 │      ├ keywordAnalysis
 │      ├ scoring
 │      ├ recommendations
 │      └ mockTransform
 │
 ├ types
 │  └ resume.ts
 │
 └ components
```

---

# What Has Been Accomplished

This project currently demonstrates:

Full-stack AI application architecture

Structured LLM outputs using JSON schema

Prompt engineering for resume generation

Resume scoring system

Keyword analysis pipeline

Recommendation engine

Interactive resume preview UI

Modular backend API routes

This forms a strong **AI engineering portfolio project**.

---

# Next Development Steps

## 1. Semantic ATS Scoring (Recommended Next)

Replace simple keyword overlap with semantic similarity.

Method:

```
OpenAI embeddings
cosine similarity
```

Pipeline:

```
Resume text embedding
Job description embedding
Cosine similarity score
```

This produces a more realistic ATS match score.

---

## 2. Resume PDF Export

Add ability to download a polished resume.

Options:

* react-pdf
* Puppeteer
* HTML to PDF rendering

This turns the tool into a **usable product**.

---

## 3. Multiple Resume Templates

Add three professional templates:

Example:

```
Modern Tech
Minimal Professional
Compact ATS-Friendly
```

Users could switch templates instantly.

---

## 4. Bullet Rewriter Tool

Allow users to paste individual bullets and receive improved versions.

Example:

Input:

```
worked with data
```

Output:

```
Analyzed datasets using Python to identify trends and support data-driven decision making.
```

---

## 5. Resume Version Saving

Add persistence:

* database
* user accounts
* saved resume versions

Suggested stack:

```
PostgreSQL
Prisma ORM
NextAuth
```

---

## 6. Deployment

Deploy the application.

Recommended platform:

```
Vercel
```

Benefits:

* easy Next.js deployment
* serverless API routes
* environment variable support

---

# Future Vision

This project can evolve into a full product:

```
AI Resume Builder
ATS Simulator
Career Coaching Tool
```

Potential features:

* LinkedIn resume import
* GitHub project analysis
* automatic portfolio suggestions
* internship preparation tools

---

# Resume Project Value

This project demonstrates:

* AI integration
* backend architecture
* prompt engineering
* structured LLM outputs
* product design thinking

It serves as a **strong portfolio example of applied AI engineering**.

---

# License

MIT License
