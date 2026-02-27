# Edunai Productivity Platform: Implementation Plan

## Proposed Features (Max 5)

1. **Planning Kegiatan (Smart Scheduler)**
   - Description: A calendar-based task manager for students to organize classes, study sessions, and exams.
   - Tech: Supabase tables for events, full-calendar or custom grid UI.
2. **AI Blackboard-to-Content (OCR & Powerpoint)**
   - Description: Users upload a photo of a whiteboard/blackboard. The AI converts it into formatted text or a structured PPT outline.
   - Tech: LangChain with Gemini Vision for OCR and structured data extraction.
3. **Collaborative Project Board (Trello-style)**
   - Description: A kanban board where students can collaborate on group projects. Supports real-time updates.
   - Tech: Supabase Realtime for board state sync.
4. **Advanced Note-taking**
   - Description: A rich-text/markdown note editor with tagging and search capabilities.
   - Tech: TipTap or React Markdown editor.
5. **AI Study Assistant**
   - Description: Generates automated summaries, flashcards, or practice questions from notes and uploaded materials.
   - Tech: LangChain chains for summarization and question generation (using RAG patterns).

## Technical Architecture

**Frontend:**

- Framework: Next.js 15+ (App Router)
- Styling: Tailwind CSS
- UI Components: Shadcn UI for a premium, modern feel (Glassmorphism aesthetics).
- Icons: Lucide React.

**Backend & Database:**

- Database: Supabase (PostgreSQL).
- Authentication: Supabase Auth (Email/Password & Social).
- Storage: Supabase Storage (for whiteboard photos and exports).
- AI Integration: LangChain (Google Gemini & Vision).

## Overview

This plan dictates how we build Edunai step-by-step to be functional and production-ready. We are transitioning from the landing page UI layout to backend integrations.
