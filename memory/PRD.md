# HoneyPrompt - PRD

## Problem Statement
AI Security Middleware to detect and analyze prompt injection attacks against LLM applications using honeypot approach. Separate user/admin experiences.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + MongoDB + emergentintegrations (OpenAI GPT-5.2)
- **Auth**: JWT-based with role separation (user/admin)
- **Detection**: Rule-based pattern matching engine (5 categories)

## User Personas
- **Users**: Chat with AI assistant, unknowingly tested for prompt injection
- **Admins**: Security engineers monitoring attacks, managing decoy data, blocking users

## Core Requirements
1. Prompt injection detection engine (rule-based)
2. Honeypot decoy system with configurable fake data
3. LLM proxy layer (GPT-5.2 via Emergent key)
4. Role-based access: Users get ChatGPT-like UI, Admins get full dashboard
5. Attack logging, alerting, threat profiling
6. User management with blocking
7. Decoy data management for realistic fake responses
8. Webhook alerts for external integrations
9. API key system for external apps

## Implemented (Feb 2026)
- **Role-based auth**: User/Admin registration & login with separate experiences
- **User Experience**: Full-screen ChatGPT-like chat interface with suggestions
- **Admin Dashboard**: Stats, area chart (7-day trend), pie chart (categories), bar chart (risk)
- **Attack Logs**: Table with filters, search, export (CSV/JSON), detail dialog
- **Threat Profiles**: Session-based attacker profiling with accumulated risk scores
- **Decoy Data**: Admin-managed fake responses served to attackers per category
- **Honeypot Config**: CRUD for honeypot prompts injected into LLM system prompt
- **User Management**: Block/unblock with reason tracking
- **Webhooks**: Configurable HTTP POST alerts with category/risk filters
- **API Keys**: External app integration with /api/external/scan endpoint
- **Real-time Alerts**: Bell dropdown + sonner toasts on attack detection
- **Chat Test**: Admin testing interface with quick attack prompts

## Backlog
- **P1**: Rate limiting per user/API key
- **P2**: Adaptive honeypots (ML-powered), multi-tenant support
- **P2**: Email notification channel for webhooks
