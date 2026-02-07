# HoneyPrompt - PRD

## Problem Statement
AI Security Middleware to detect and analyze prompt injection attacks against LLM applications using honeypot approach.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + MongoDB + emergentintegrations (OpenAI GPT-5.2)
- **Auth**: JWT-based (bcrypt + PyJWT)
- **Detection**: Rule-based pattern matching engine (5 categories)

## User Personas
- Security engineers monitoring LLM apps
- Developers building AI-powered applications
- Enterprise security teams

## Core Requirements
1. Prompt injection detection engine (rule-based)
2. Honeypot decoy system with fake compliance responses
3. LLM proxy layer (GPT-5.2 via Emergent key)
4. Admin dashboard with analytics
5. Attack logging and alerting
6. User management with blocking

## Implemented (Feb 2026)
- JWT auth (register/login)
- Rule-based detection engine (5 categories: instruction_override, data_exfiltration, prompt_leakage, social_engineering, jailbreak)
- Fake compliance response system
- LLM proxy via GPT-5.2
- Dashboard with stats cards, area chart (7-day trend), pie chart (categories), bar chart (risk distribution)
- Attack logs table with filtering, search, detail dialog
- Real-time alerts with bell dropdown + sonner toasts
- Chat testing interface with quick prompts
- User management with block/unblock
- Honeypot CRUD configuration
- Dark SOC theme (Chivo + JetBrains Mono)

## Backlog
- **P0**: Session-based attacker profiling
- **P1**: Export attack logs (CSV/JSON), webhook alerts
- **P2**: Adaptive honeypots (ML-powered), multi-tenant support
- **P2**: Rate limiting, API key management for external LLM apps

## Next Tasks
1. Add session-based tracking to correlate multiple attacks from same user
2. Add export functionality for attack data
3. Add webhook/email notification support
4. Add API key system for external apps to use HoneyPrompt as middleware
