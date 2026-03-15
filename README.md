One Page Resumes

AI-powered resume generator designed for college students and early-career professionals.

The application transforms minimal user input into a clean, one-page professional resume, analyzes keyword alignment with job descriptions, and provides actionable improvement suggestions.

This project demonstrates full-stack AI integration, including structured LLM outputs, resume scoring, keyword analysis, recruiter-signal detection, and recommendation systems.

Project Goal

Build a professional end-to-end AI product that:

Converts rough resume input into a structured one-page resume

Highlights ATS keywords

Scores resume competitiveness

Detects recruiter signals (tools, metrics, verbs)

Suggests projects, certifications, and resume bullets

Provides an interactive analysis interface

The project is intended as a portfolio piece demonstrating AI engineering and full-stack development skills.

Tech Stack

Frontend

Next.js (App Router)

React

TypeScript

TailwindCSS

Backend

Next.js API Routes

OpenAI API

AI / Analysis

Structured LLM resume generation

Keyword matching engine

Recruiter signal detection

Resume scoring rubric

Recommendation generation

Suggested bullet generator

Development Tools

Node.js

npm

Git / GitHub

Current Architecture

User Flow

Landing Page
     ↓
Resume Builder Form
     ↓
AI Resume Generation
     ↓
Resume Analysis
     ↓
Interactive Resume Interface

System Pipeline

Builder Form
     ↓
/api/generate-resume
     ↓
OpenAI Structured Resume JSON
     ↓
/api/analyze-resume
     ↓
Keyword Analysis
Recruiter Signal Detection
Resume Scoring
Recommendations
Suggested Bullets
     ↓
Generated Resume UI
Analyze UI
Features Implemented
1. Resume Builder

Location

/builder

Collects minimal input including

name

school

degree

graduation date

GPA

experience

projects

skills

target role

job description

The builder intentionally uses minimal input fields to encourage fast completion.

Data is temporarily stored in

localStorage
2. AI Resume Generation

Endpoint

/api/generate-resume

Uses OpenAI to convert user input into a structured resume object.

Structure

GeneratedResume
 ├ basics
 ├ target
 ├ summary
 ├ experience
 ├ projects
 ├ skills
 └ extras

The system uses JSON schema structured outputs to ensure consistent responses.

Prompt engineering ensures

STAR-style bullets

strong action verbs

job description alignment

no hallucinated experience

3. Resume Analysis Pipeline

Endpoint

/api/analyze-resume

Performs four major analyses.

Keyword Matching

Compares

resume text
vs
job description

Outputs

matched keywords

missing keywords

match score

Example

Keyword Match Score: 67%
Resume Scoring Engine

Evaluates resumes using a rubric.

Categories

Keyword alignment
Content strength
Completeness
Formatting readiness

Example

Resume Score: 61 / 100
Recruiter Signal Detection

The system extracts signals recruiters quickly scan for.

Detected signals include

Tools

Python
React
SQL
Docker
AWS

Metrics

20%
5 projects
3 months
$10K

Action verbs

developed
implemented
designed
optimized

These signals appear in the analysis interface.

Recommendation Engine

Suggests improvements including

Projects

Example

Full-stack web application
Data analysis project
Interactive dashboard

Certifications

Example

AWS Cloud Practitioner
Google Data Analytics
CompTIA Security+

Resume improvements

Example

Add measurable results
Improve technical bullets
Add leadership experience
4. Keyword Highlighting Engine

Resume text highlights matched ATS keywords.

Example

Developed a React dashboard to visualize API data

Keywords are highlighted directly in the resume preview.

The highlighting system ensures

full word matches

no partial matches

case-insensitive detection

5. Suggested Bullet Generator

The analysis page now suggests resume bullets that improve keyword alignment.

Example suggestion

Applied machine learning techniques in an academic project to analyze datasets and generate predictive insights.

Each suggestion includes

confidence level

missing keywords addressed

rationale

Users can

Add This Bullet
Dismiss

Accepted bullets are stored in

localStorage

and shown under

Accepted Suggested Bullets
6. Recruiter Signal Dashboard

The analysis page now includes a recruiter-focused panel.

Displays

Matched Keywords
Tools Recruiters Notice
Metrics Detected
Strong Action Verbs

This helps users understand what recruiters see quickly.

Repository Structure
src
 ├ app
 │  ├ api
 │  │  ├ analyze-resume
 │  │  └ generate-resume
 │  │
 │  ├ builder
 │  ├ generated
 │  └ analyze
 │
 ├ lib
 │  └ resume
 │      ├ highlightKeywords
 │      ├ recruiterSignals
 │      ├ keywordAnalysis
 │      ├ scoring
 │      ├ recommendations
 │
 ├ types
 │  └ resume.ts
 │
 └ components
What This Project Demonstrates

This repository now demonstrates

full-stack AI architecture

structured LLM outputs

prompt engineering

ATS keyword analysis

recruiter signal detection

resume scoring

bullet recommendation system

interactive UI feedback loops

This forms a strong AI engineering portfolio project.

Environment Setup

Requirements

Node.js
npm
OpenAI API key

Create

.env.local

Add

OPENAI_API_KEY=your_api_key_here

Run

npm run dev

Open

http://localhost:3000
Next Development Session

When returning to the project, continue from here.

Next tasks

1. Move Suggested Bullet Engine to Backend

Currently

suggested bullets are generated on the client

Move logic to

/api/analyze-resume

so the pipeline becomes

resume
↓
analysis
↓
suggested bullets
2. Allow Bullets to be Injected Into Resume Sections

Current state

Accepted bullets appear separately

Next step

insert accepted bullets into resume sections dynamically

Example

Experience → suggested bullet appended
Projects → suggested bullet appended
Skills → keyword added
3. Semantic ATS Scoring

Replace simple keyword overlap with embeddings.

Method

OpenAI embeddings
cosine similarity

Pipeline

Resume embedding
Job description embedding
Similarity score
4. Resume PDF Export

Allow users to download a polished resume.

Options

react-pdf
Puppeteer
HTML to PDF
5. Resume Templates

Add selectable templates

Modern Tech
Minimal Professional
Compact ATS
6. Persistent User Accounts

Add authentication and storage

Stack

PostgreSQL
Prisma
NextAuth
Future Vision

This project can evolve into

AI Resume Builder
ATS Simulator
Career Coaching Tool

Future ideas

LinkedIn resume import

GitHub project scanning

internship preparation tools

portfolio project suggestions

License

MIT License

Where to Resume Tomorrow

Continue development starting here:

src/lib/resume/suggestedBullets.ts

Then update

/api/analyze-resume

to move bullet suggestions server-side instead of client-side.