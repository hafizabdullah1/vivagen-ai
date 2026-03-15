# Vivagen AI – Product Scope & Development Roadmap

## 1. Product Overview

**Vivagen AI** is an AI-powered technical interview platform designed to help instructors, developers, and hiring teams conduct structured technical interviews efficiently.

The system assists interviewers in:

* Generating technical interview questions using AI
* Conducting structured interviews with scoring and notes
* Automatically evaluating candidate performance
* Generating professional interview reports
* Maintaining a history of conducted interviews

The primary goal is to reduce interviewer preparation time while improving consistency and professionalism in the technical evaluation process.

The initial release will focus on **single-user interviewers**, with future scalability planned for teams and organizations.

---

# 2. Current Core Workflow

The current application follows the following flow:

### Step 1 — Interview Setup

The interviewer provides the following details:

* Candidate Name
* Role / Position
* Experience Level (Beginner / Intermediate / Advanced)
* Technology Stack (e.g., JavaScript, React, Python)
* Optional description of the candidate profile

---

### Step 2 — AI Question Generation

The system sends the information to the AI provider and generates structured interview questions including:

* Conceptual questions
* Scenario-based questions
* Practical coding questions

Each question is generated with a difficulty level and category.

---

### Step 3 — Interview Conduct Mode

During the interview:

* Questions are displayed one by one
* Interviewer provides:

  * Score (0–10)
  * Optional notes for each question
* The system continuously calculates:

  * Total score
  * Average score
  * Percentage performance

---

### Step 4 — AI Evaluation

Once the interview is completed:

The system sends the following data to the AI model:

* Questions
* Scores
* Interview notes
* Overall performance

AI generates a structured evaluation including:

* Performance summary
* Candidate strengths
* Candidate weaknesses
* Hiring recommendation

---

### Step 5 — Interview Report

The system generates a professional report that includes:

* Candidate details
* Questions asked
* Scores for each question
* Interviewer notes
* Overall performance
* AI evaluation summary
* Hiring recommendation

The report can be exported as a **PDF document**.

---

# 3. Technology Stack

The current technology stack is optimized for rapid development and scalability.

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Shadcn UI (optional component system)

### Backend Layer

* Next.js API Routes

### Database & Authentication

* Supabase
* PostgreSQL database
* Supabase authentication system

### AI Integration

* Google Gemini API (primary AI provider)

### Deployment

* Vercel

### Client Utilities

* Client-side PDF generation
* Structured JSON parsing for AI responses

This stack allows fast development while remaining scalable for thousands of users in the early stages.

---

# 4. SaaS Architecture Principles

Vivagen AI is designed following these architectural principles:

1. **AI calls must be handled through backend API routes**
2. **No API keys should be exposed on the frontend**
3. **AI responses must always return structured JSON**
4. **Database schema must support future multi-user and team features**
5. **Usage limits must be enforced to control AI costs**

---

# 5. Usage Control & Freemium Model

To manage AI costs while allowing public access, the product will implement a **freemium usage model**.

### Free Tier

* Maximum **5 interviews total**
* Maximum **5 questions per interview**
* No PDF export
* No advanced analytics

Purpose:
Allow users to experience the product while limiting AI costs.

> [!TIP]
> **Growth Hack:** When a user reaches their 5-interview limit, show a "Limit Reached" modal that offers a "Social Share" option (e.g., share on X/LinkedIn) to unlock 2 additional bonus interviews. This helps with organic reach.

---

### Paid Model (Future)

Two monetization approaches may be implemented.

#### Option 1 — Credit System

Users purchase **AI Credits**.

Example:

* Question Generation → 10 Credits
* AI Evaluation Summary → 5 Credits

Benefits:

* Granular usage control
* Flexible monetization

---

#### Option 2 — Subscription Model

Example plan:

**Pro Plan ($29/month)**

Includes:

* Unlimited interviews
* PDF export
* Advanced analytics
* Priority AI processing
* Team collaboration features

---

# 6. Database Architecture (Initial)

### interviews

Stores interview sessions.

Fields include:

* id
* user_id
* candidate_name
* role
* level
* tech_stack
* description
* total_score
* percentage
* created_at

---

### interview_questions

Stores questions associated with each interview.

Fields include:

* id
* interview_id
* question
* type
* difficulty
* score
* notes

---

### interview_summary

Stores the AI-generated evaluation.

Fields include:

* id
* interview_id
* summary
* strengths
* weaknesses
* recommendation

---

### usage_tracking

Tracks AI usage per user.

Fields include:

* user_id
* usage_month
* interviews_used

---

# 7. Development Phases

The product will evolve through multiple development phases.

---

# Phase 1 — MVP Completion

Goal: Deliver a fully functional core interview platform.

Features:

* User authentication
* Interview setup form
* AI question generation
* Interview conduct interface
* Scoring and notes
* AI evaluation summary
* Interview history dashboard

This phase focuses on **core usability**.

---

# Phase 2 — Product Enhancement

Goal: Improve user experience and reporting.

Features:

* PDF interview report export
* Shareable interview report links
* Dashboard analytics
* Candidate score visualization
* Interview templates

Example templates:

* Frontend Developer Interview
* Backend Developer Interview
* Fullstack Developer Interview
* Junior Developer Interview

---

# Phase 3 — Advanced AI Capabilities

Goal: Improve interview intelligence.

Features:

* AI follow-up question generator
* Ideal answer reference for interviewers
* Smart question difficulty control
* AI-generated interview observations

Example observations:

* Communication ability
* Problem solving approach
* Technical depth

---

# Phase 4 — Business Features

Goal: Transform the product into a full SaaS platform.

Features:

* Team workspaces
* Multiple interviewer accounts
* Shared interview libraries
* Organization dashboards
* White-label interview reports

Target users:

* Recruitment agencies
* Training institutes
* Development companies

---

# Phase 5 — Expansion Features

Goal: Expand product capabilities and audience.

Potential additions:

### Mock Interview Mode

Candidates can practice interviews with AI.

### Live Coding Interface

Candidates write code during the interview.

### AI Code Evaluation

AI evaluates candidate code quality.

### Voice Notes (Speech-to-Text)

Interviewers can record verbal notes.

---

# 8. AI Provider Strategy

The current system uses **Google Gemini** due to its free tier and strong performance for structured text generation.

Future AI provider strategy may include:

Primary AI Provider:

* Gemini

Secondary AI Provider (fallback):

* DeepSeek

Enterprise AI Option:

* Claude

Using multiple providers allows:

* cost optimization
* redundancy
* better performance tuning

---

# 9. Security & Reliability

To ensure stability and security:

* All AI requests handled through server APIs
* API keys stored in environment variables
* Rate limiting applied to prevent abuse
* JSON schema validation for AI responses
* Error handling for failed AI calls

---

# 10. Future Growth Vision

Vivagen AI has potential to evolve into a full **AI-powered hiring platform**.

Possible long-term capabilities include:

* Automated candidate screening
* AI technical assessments
* AI interview assistants
* Candidate skill benchmarking
* Interview performance analytics

The goal is to make Vivagen AI a **complete technical interview operating system for developers and hiring teams**.

---

# Conclusion

Vivagen AI has a strong foundation with a modern full-stack architecture and a clear product vision.

The current focus is to:

1. Stabilize the MVP
2. Improve reporting and usability
3. Introduce scalable SaaS features
4. Expand into team-based hiring workflows

With structured development phases and controlled AI usage, Vivagen AI can evolve into a powerful and scalable technical interview platform.
