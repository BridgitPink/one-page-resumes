description: Instructions for implementing the Templates page in the resume builder. Applies when modifying template selection UI, resume rendering on the templates page, bold/unbold interactions, and resume export/download behavior.

# applyTo: "**/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.css, **/*.md"

---

# Templates Page Implementation Instructions

These instructions define the expected behavior and constraints for the Templates page.

The AI must follow these instructions when implementing the templates page, template selection, bold/unbold interactions, and resume download/export behavior.

---

# Feature Goal

After generating a resume, the user clicks **Continue to Templates** and lands on a Templates page.

This page allows the user to:

- view and choose from 3 resume templates
- preview the selected template
- bold or unbold words in the Experience and Project sections
- download the resume as a PDF or Word document

This page is **not** for editing text content.
It is only for:
- template selection
- bold/unbold formatting
- download/export

---

# Existing Flow Constraint

The navigation flow from generated resume page to templates page is already working.

Do not rebuild or replace that flow unless absolutely necessary.

Preserve the current architecture and extend it carefully.

---

# Page Layout Requirements

The Templates page should use a structured two-sidebar layout.

## Left Sidebar
The left sidebar must contain:
- the 3 available template options

These templates should be displayed as selectable options.

Recommended templates:
- Classic / Professional
- Modern / Clean
- Compact / ATS-Friendly

Selecting a template should update the rendered resume preview.

## Right Sidebar
The right sidebar must contain:
- a bold keywords option
- download resume controls

Do not add these controls directly onto the rendered resume page itself.

## Main Content Area
The main content area should render the resume preview using the selected template.

The resume preview should remain polished and recruiter-friendly.

---

# Rendered Resume Constraints

The rendered resume on the Templates page must:

- show the selected template
- not allow text editing
- not show editing controls
- not show generated-page-style buttons or UI overlays
- not contain inline action buttons on the resume itself

Important:
This page should feel like a template preview/customization page, not a text editor.

The user should be able to interact with words only for bold/unbold behavior in specific sections.

---

# Bold/Unbold Functionality

The user should be able to interactively click individual words to bold or unbold them in:

- Experience section
- Project section

## Important constraints
- text must NOT be editable on this page
- only bold/unbold interactions are allowed
- do not add edit controls
- do not add floating action buttons on the resume page
- do not add visible inline formatting toolbars on the rendered resume

## Word-level bolding rules
- clicking an individual word should toggle bold/unbold for that full word
- bolding must apply to the entire word only
- no partial word highlights
- no character-level formatting
- no substring highlighting

## Scope rules
Bold/unbold interaction should only apply to:
- Experience section text
- Project section text

Do not apply this interaction to:
- headings
- contact info
- skills unless explicitly intended by the real implementation
- unrelated sections unless already part of the design

## Persistence
Bold/unbold choices must persist in the actual resume state used by the templates page.

Changing templates should preserve the user’s bolded/unbolded word selections if reasonably supported by the current architecture.

---

# Bold Keywords Option in Right Sidebar

A bold keywords option should exist in the right sidebar.

This should support the bold/unbold feature on the templates page.

Use the current architecture to determine the best implementation, but the final experience must support:
- interactive word clicking in Experience and Projects
- full-word toggle only
- no partial highlights

Do not clutter the UI.

The right sidebar control should feel minimal and professional.

---

# Template Requirements

Implement exactly 3 templates.

They should differ visually enough to feel meaningfully distinct, while still using the same underlying resume data.

Do not create separate incompatible data models per template.

Templates should reuse the same resume source-of-truth and only change presentation/styling/layout.

All templates must remain:
- professional
- printable
- recruiter-friendly
- one-page aware where possible

Suggested template categories:
1. Classic / Professional
2. Modern / Clean
3. Compact / ATS-Friendly

---

# Download Resume Feature

The Templates page must allow the user to download the resume as:

- PDF
- Word document

This should be exposed from the right sidebar, not from the rendered resume page.

## Constraints
- keep download controls off the rendered resume itself
- preserve a clean preview page
- use the existing architecture and tools available in the repo where possible

## Output expectations
- PDF export should produce a usable resume document
- Word export should produce a usable resume document
- exported documents should reflect:
  - selected template
  - current resume content
  - current bold/unbold formatting where supported

If exact styling parity between on-screen preview and exported format is not fully achievable, preserve resume readability and professionalism first.

---

# Architecture Constraints

This is very important.

Do NOT:
- do not do a broad architecture rewrite
- do not replace working builder/generate flow
- do not refactor unrelated pages
- do not move large portions of the app unnecessarily
- do not reintroduce editing behavior on the templates page

Use the current working architecture and extend it carefully.

Add only what is necessary for:
- template selection
- bold/unbold word interactions
- download/export

---

# UI Constraints

The Templates page should feel polished and minimal.

Do NOT:
- add visible formatting buttons on the resume page
- add generated-page action buttons onto the rendered template preview
- make text editable on this page
- clutter the preview with controls

The resume preview should remain resume-first.

Controls belong in sidebars, not on top of the resume preview.

---

# Data Model Expectations

Update the existing resume data model minimally and safely if needed.

Possible additions may include:
- selected template identifier
- bolded words metadata for experience/project content
- export-related template selection handling

Use the smallest change necessary.

Do not break existing resume generation or rendering logic.

---

# Validation Checklist

Before marking this task complete, verify all of the following:

## Navigation / structure
- Continue to Templates flow still works
- Templates page renders successfully

## Templates
- 3 template options appear in the left sidebar
- selecting a template updates the preview
- template changes do not break resume rendering

## Bold/unbold behavior
- text on this page is not editable
- only word-level bold/unbold is possible
- clicking a word in Experience toggles full-word bold/unbold
- clicking a word in Projects toggles full-word bold/unbold
- no partial word highlighting occurs
- no inline formatting buttons appear on the resume page
- bold/unbold changes persist correctly for the page state

## Sidebar controls
- bold keywords option exists in the right sidebar
- download controls exist in the right sidebar

## Download/export
- user can download resume as PDF
- user can download resume as Word document
- export uses current resume/template state

## Regression checks
- generated page behavior is not reintroduced here
- text editing is disabled on templates page
- app architecture remains intact
- existing builder/generation flow is preserved

---

# Final Rule

Implement the Templates page as a clean presentation/customization/export layer.

This page is for:
- choosing templates
- toggling bold formatting on words in Experience and Projects
- downloading the resume

This page is NOT for:
- editing text
- showing floating action buttons on the resume
- rebuilding the app architecture