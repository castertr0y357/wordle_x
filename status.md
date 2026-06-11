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
  - Refactored `docker-compose.yml` to interpolate variables from `.env` for:
    - Backend environment variables (`MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`).
    - Frontend build args (`REACT_APP_BACKEND_URL`).
    - Service port mappings (`BACKEND_PORT`, `FRONTEND_PORT`, `MONGO_PORT`).
    - MongoDB image version tag (`MONGO_VERSION`).
  - Verified configurations using `docker-compose config` command.
