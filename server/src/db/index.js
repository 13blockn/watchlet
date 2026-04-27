const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', '..', 'watch_academy.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, xp INTEGER DEFAULT 0, level TEXT DEFAULT 'Beginner', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS modules (slug TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, summary TEXT NOT NULL, lesson_count INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS lessons (id INTEGER PRIMARY KEY AUTOINCREMENT, module_slug TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, position INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY, module_slug TEXT NOT NULL, topic TEXT NOT NULL, type TEXT NOT NULL, prompt TEXT NOT NULL, choices_json TEXT, answer TEXT NOT NULL, keywords_json TEXT, explanation TEXT NOT NULL, difficulty INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS quiz_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, question_id INTEGER NOT NULL, module_slug TEXT NOT NULL, topic TEXT NOT NULL, answer_text TEXT, is_correct INTEGER NOT NULL, xp_earned INTEGER DEFAULT 0, attempted_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS user_question_stats (user_id INTEGER NOT NULL, question_id INTEGER NOT NULL, seen_count INTEGER DEFAULT 0, correct_count INTEGER DEFAULT 0, miss_count INTEGER DEFAULT 0, last_seen_at TEXT, next_review_at TEXT, PRIMARY KEY(user_id, question_id));
CREATE TABLE IF NOT EXISTS daily_activity (user_id INTEGER NOT NULL, activity_date TEXT NOT NULL, quizzes_completed INTEGER DEFAULT 0, PRIMARY KEY(user_id, activity_date));
CREATE TABLE IF NOT EXISTS achievements (id TEXT PRIMARY KEY, label TEXT NOT NULL, description TEXT NOT NULL, threshold INTEGER NOT NULL, metric TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS user_achievements (user_id INTEGER NOT NULL, achievement_id TEXT NOT NULL, unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, achievement_id));
`);

module.exports = db;
