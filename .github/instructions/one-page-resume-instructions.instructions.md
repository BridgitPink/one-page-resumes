---
description: Instructions for AI agents working on the resume builder project. These instructions apply when modifying UI, editing behavior, bullet systems, resume generation logic, layout systems, or builder page architecture.

# applyTo: "**/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.css, **/*.md"

---

# Resume Builder Project Instructions for AI Agents

These instructions define the expected behavior, architecture rules, and UX standards for this project.

The AI must follow these instructions whenever generating code, editing components, refactoring layout, or implementing features.

---

# Project Overview

This project is an **AI-powered resume builder** designed to generate **clean, one-page professional resumes**.

The system allows users to:

- Generate resumes with AI
- Edit resumes inline like a document
- Add, remove, and regenerate bullet points
- Match resumes to job descriptions
- Maintain a **one-page printable layout**

The editor should feel **like editing a document**, not filling out a form.

---

# Core Design Philosophy

The resume itself is the primary focus.

The UI must feel:

- professional
- minimal
- document-first
- recruiter-friendly

Avoid dashboard-style editing interfaces.

Editing should feel **similar to editing a Word document**.

---

# Editing Behavior Rules

Editing must be **inline and direct**.

Users should:

- click directly on visible text to edit
- not need edit buttons
- not switch into a separate edit mode

Do NOT introduce:

- edit buttons for normal text editing
- colored edit containers
- large editing boxes
- opacity changes during editing
- form-style editing UIs

Text should remain visually identical before and during editing.

---

# Text Layout Rules

Text must **preserve layout during editing**.

Editing must NOT:

- collapse text into a single line
- change wrapping behavior
- shift surrounding content
- alter line height
- alter spacing
- change font size
- change margins

Use styling that keeps display and edit states consistent.

Examples:


white-space: pre-wrap
word-break: break-word
outline: none


---

# Bullet System Rules

Bullets exist in **experience** and **project** sections.

Users must be able to:

- add bullets
- delete bullets
- edit bullets inline
- regenerate bullets with AI
- request suggested bullets

Bullet actions must be reliable.

Deleting a bullet must:

- delete only the intended bullet
- not corrupt the bullet list
- not reorder incorrectly
- not delete the wrong bullet
- not create ghost bullets

---

# AI Bullet Generation Rules

AI can assist with bullets but must follow strict constraints.

AI must NOT:

- invent experience
- invent tools or technologies
- invent metrics
- invent achievements

AI must use existing context such as:

- role title
- organization
- nearby bullets
- summary
- job description
- skills
- keyword analysis

AI output should be:

- concise
- resume-appropriate
- professional
- ATS friendly

---

# Bullet Suggestion Behavior

AI should suggest **only one additional bullet at a time**.

The suggested bullet should:

- appear visually distinct
- not replace existing bullets
- be easy to accept
- be easy to dismiss

AI should **not suggest additional bullets** if the resume is already full enough to fill one page.

---

# One-Page Resume Constraint

Resumes must remain **one printable page**.

The editor should display a **page-like canvas**.

The system must avoid:

- infinite scroll resumes
- silently overflowing into multiple pages
- adding bullets that push the resume past one page unnecessarily

If possible, use actual layout measurement to determine if there is room for more content.

---

# Layout and App Shell Rules

The generated resume page should **remain inside the builder application shell**.

This means keeping:

- sidebars
- headers
- background layout

The resume itself should appear as a **document page inside the app**.

---

# Resume Page Content Rules

The resume page should contain **only resume content**.

Remove unnecessary UI elements inside the resume canvas.

Example:

Remove headers like:


Generated Resume


The resume page should look like a real resume sheet.

---

# Sidebar Rules

The sidebar layout must follow these rules:

### Left Sidebar

- must NOT contain the skills section

### Right Sidebar

Must contain the main navigation button:


Continue to Templates


This button must exist only once.

---

# Warning Banner Rules

Warnings or notices should appear:

- centered
- at the top of the page
- visually aligned with the layout

They must not collide with headers, sidebars, or resume content.

---

# Skills Rules

Users must be able to:

- add skills
- edit skills
- remove skills

Skills should update the resume content immediately.

Skills should **not appear in the left sidebar UI**.

---

# Code Architecture Rules

When modifying the project:

1. Inspect the repository first
2. Use existing architecture patterns
3. Reuse existing components when possible
4. Avoid introducing duplicate UI systems
5. Avoid large monolithic page files
6. Extract reusable logic where appropriate

Possible extraction targets:

- editable text primitives
- bullet list editor
- AI bullet helper
- page fit detection
- warning banner

---

# Styling Rules

Use minimal styling.

Avoid:

- bright colors
- heavy borders
- flashy UI elements
- distracting hover states

Editing visuals should remain subtle.

---

# Refactoring Guidelines

When refactoring:

- reduce bloated page files
- remove unused imports
- extract reusable logic
- maintain clean component boundaries

Do not refactor unnecessarily large portions of the system without clear benefit.

---

# Validation Checklist

Before completing changes, confirm:

Editing

- clicking text edits inline
- no edit buttons
- no opacity changes
- text wrapping preserved

Bullets

- add bullet works
- delete bullet works
- regenerate bullet works
- suggest bullet works

Layout

- resume appears on page canvas
- page remains one printable page
- generated resume header removed
- warning centered

Sidebars

- skills removed from left sidebar
- right sidebar contains Continue to Templates button

Architecture

- page not overly bloated
- imports reasonable
- reusable components extracted where needed

---

# Final Rule

Do not mark work as complete unless the UI actually behaves according to these instructions.

Inspect the repository first.
Follow existing architecture.
Implement behavior, not just superficial styling changes.