# Watch Academy

Watch Academy is a lightweight full-stack web app for learning watches through short modules, interactive quizzes, and progress-driven reinforcement.

## Stack

- Frontend: React + Vite (hooks-based UI)
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)

## Features

- Learning modules: Basics, Movements, Complications, Brands & Iconic Models, History
- Quiz types: True/False, Multiple Choice (4 options), and Short Answer (keyword grading)
- Immediate feedback with explanations
- Progress tracking by module and topic accuracy
- Weak area detection and spaced-repetition review mode
- Daily streaks, XP, levels, leaderboard, and achievement badges
- Search topics/questions and stats page (accuracy over time)
- Dark mode toggle and keyboard-friendly quiz input (`1-4`, `Enter`)

## Project structure

- `client/` React frontend
- `server/` Express API + SQLite + seed scripts
- `server/src/data/` lesson + seed content (easy to extend)

## Local setup

1. Install dependencies:

```bash
npm run install:all
```

2. Seed the database:

```bash
npm run seed
```

3. Run backend and frontend in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

4. Open the app at [http://localhost:5173](http://localhost:5173).

API runs at [http://localhost:4000](http://localhost:4000).

## Seed data

The seed script currently preloads:

- 5 learning modules
- 120 quiz questions with explanations across all categories
- Mock leaderboard users
- Achievement definitions

You can add more modules/questions by editing:

- `server/src/data/modules.js`
- `server/src/data/seedContent.js`

Then run `npm run seed` again (delete `server/watch_academy.db` to reseed from scratch).
