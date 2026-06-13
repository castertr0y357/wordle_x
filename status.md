# Project Status: Wordle X

A modern, full-stack Wordle game with authentication, customizable word lengths, and persistent game sessions.

## Current Configuration & Architecture
- **Infrastructure**: Container-based setup using Docker Compose.
- **Environment Management**: Environment variables extracted from raw `docker-compose.yml` into a root-level `.env` file.
- **Database**: MongoDB for storing user authentication and game session data.
- **Backend**: FastAPI (Python) serving REST APIs under `/api`.
- **Frontend**: React (JavaScript/Tailwind CSS) served via Nginx.

## Feature Status
- [x] **Core Wordle Mechanics**: Game grid, virtual keyboard, letter color states.
- [x] **Word Length Customization**: Supports 5, 6, 7, and 8-letter words.
- [x] **Expanded Scrabble Dictionary**: Expanded from ~2,000 to ~75,000 words.
- [x] **Input Validation**: Length limits, duplicate guess prevention, Scrabble dictionary lookup.
- [x] **Authentication & Profiles**: JWT-based signup, login, persistent user sessions, and user stats page.
- [x] **Guest Mode**: Play without authentication (with prompts to sign in on completion).
- [x] **Word Length Preference Selector**: Allows players to toggle preferred word lengths.
- [x] **New Game Confirmation Dialog**: Warns players before abandoning active games/streaks.

## Recent Changes (June 11, 2026)
- **Environment Externalization**:
  - Created `.env.example` containing configuration templates.
  - Initialized local `.env` with default ports and configurations.
  - Refactored `docker-compose.yml` to interpolate variables from `.env` for MongoDB, backend, and frontend ports.
  - Verified configurations using `docker-compose config`.

## Recent Changes (June 12, 2026)
- **Project Standards Compliance Audit & Alignment**:
  - **Setup & Portability**: Bootstrapped `JWT_SECRET_KEY` config variable. Added configuration validation checks and self-healing DB connection ping retries (with exponential backoff) on backend startup.
  - **Database Indexing**: Configured automatic initialization of indexes for MongoDB collections (`users`, `user_stats`, `user_preferences`, and `game_sessions`).
  - **Docker Security Enhancements**: Updated backend and frontend Docker configurations to execute as non-privileged users (`appuser` in backend and `nginxinc/nginx-unprivileged` in frontend).
  - **UI Safeguards**: Implemented double-submit prevention and loading states on frontend Display Name, Change Password, and New Game modals.
  - **Diagnostics & Data Safety Utilities**: Created `doctor.py` diagnostic verification script and `backup.py` database backup/restore tool. Updated `README.md` to document them.
