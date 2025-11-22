# Wordle X

A modern, full-stack Wordle game with user authentication, customizable word lengths, and persistent game sessions. Built with React, FastAPI, and MongoDB, fully containerized with Docker.
This was built entirely with LLMs Claude Sonnet 4.5 and Google Gemini 3 Pro inside of Google Antigravity.  This is intended to be a personal project to see what the capabilities are of this tool, and is not intended to be something used for wide-spread use.  There is no warranty for this software, and it is provided as-is.

That being said, if you want to clone this and tweak things yourself, you are free to do so.  Any publishing must reference back to me as the original creator.

## Features

- **Multiple Word Lengths**: Play with 5, 6, 7, or 8-letter words
- **User Authentication**: Sign up and log in to track your progress
- **Session Persistence**: Your game state is saved across devices and sessions
- **Statistics Tracking**: View your win rate, current streak, and games played
- **Customizable Preferences**: Choose which word lengths you want to play
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Dark Mode Support**: Modern, eye-friendly interface

## Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Sonner** - Toast notifications
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **Passlib** - Password hashing

### Database
- **MongoDB** - NoSQL database for user data and game sessions

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wordle_x
   ```

2. **First-time setup** (build and start)
   ```bash
   docker-compose up --build
   ```

3. **Subsequent runs** (no rebuild needed)
   ```bash
   docker-compose up
   ```

4. **Run in background** (detached mode)
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The backend API is available at `http://localhost:8000`

### Stopping the Application

```bash
docker-compose down
```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### When to Rebuild

You only need to rebuild (`--build` flag) when:
- You've made changes to source code
- Dependencies have been updated (`package.json`, `requirements.txt`)
- Dockerfiles have been modified
- Configuration files have changed

```bash
docker-compose up --build
```

## Project Structure

```
wordle_x/
├── frontend/               # React frontend application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── lib/           # Utilities and word lists
│   │   └── pages/         # Page components
│   ├── Dockerfile         # Frontend container config
│   └── nginx.conf         # Nginx configuration
├── backend/               # FastAPI backend application
│   ├── auth.py           # Authentication logic
│   ├── models.py         # Pydantic models
│   ├── routes.py         # API endpoints
│   ├── server.py         # FastAPI app setup
│   ├── Dockerfile        # Backend container config
│   └── requirements.txt  # Python dependencies
└── docker-compose.yml    # Multi-container orchestration
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info

### Game
- `GET /api/game/session` - Get current game session
- `POST /api/game/session` - Create new game session
- `PUT /api/game/session` - Update game session
- `POST /api/game/complete` - Record game completion
- `POST /api/game/abandon` - Abandon current game

### User Profile
- `GET /api/profile` - Get user profile and statistics
- `PUT /api/profile/display-name` - Update display name
- `PUT /api/profile/password` - Change password

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update word length preferences

## Environment Variables

The application uses the following environment variables (configured in `docker-compose.yml`):

### Backend
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `CORS_ORIGINS` - Allowed CORS origins (set to `*` for development)

### Frontend
- `REACT_APP_BACKEND_URL` - Backend API URL (empty for relative paths)

## Development

### Making Code Changes

1. Edit your code files
2. Rebuild the affected service:
   ```bash
   docker-compose up --build frontend  # For frontend changes
   docker-compose up --build backend   # For backend changes
   ```

### Accessing the Database

MongoDB is accessible on `localhost:27017` when containers are running.

## Troubleshooting

### Container won't start
```bash
# Remove all containers and volumes, then rebuild
docker-compose down -v
docker-compose up --build
```

### Port already in use
Edit `docker-compose.yml` to change the port mappings:
```yaml
ports:
  - "3001:80"  # Change 3000 to 3001 for frontend
  - "8001:8000"  # Change 8000 to 8001 for backend
```

### Clear browser cache
If you see old content, clear your browser cache or do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R).

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
