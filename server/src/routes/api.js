const express = require('express');
const dayjs = require('dayjs');
const db = require('../db');
const { gradeAnswer } = require('../utils/scoring');
const { ensureDailyActivity, calculateStreak, updateUserXp, trackQuestionPerformance, getTopicAccuracy, unlockedAchievements } = require('../services/progressService');

const router = express.Router();
const USER_ID = 1;

const mapQuestion = (row) => ({
  id: row.id,
  moduleSlug: row.module_slug,
  topic: row.topic,
  type: row.type,
  prompt: row.prompt,
  choices: JSON.parse(row.choices_json || '[]'),
  explanation: row.explanation,
  difficulty: row.difficulty
});

router.get('/modules', (_req, res) => {
  const modules = db.prepare("SELECT m.slug, m.title, m.category, m.summary, m.lesson_count, COUNT(DISTINCT q.id) AS question_count, ROUND((SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(a.id),0), 1) AS accuracy, COUNT(a.id) AS attempts FROM modules m LEFT JOIN questions q ON q.module_slug = m.slug LEFT JOIN quiz_attempts a ON a.module_slug = m.slug AND a.user_id = ? GROUP BY m.slug ORDER BY m.rowid ASC").all(USER_ID);
  const lessonStmt = db.prepare('SELECT title, content, position FROM lessons WHERE module_slug = ? ORDER BY position ASC');
  res.json(modules.map((m) => ({ ...m, lessons: lessonStmt.all(m.slug).map((l) => ({ title: l.title, content: JSON.parse(l.content) })), completed: m.attempts >= m.question_count * 0.4 })));
});

router.get('/modules/:slug/quiz', (req, res) => {
  const { slug } = req.params;
  const mode = req.query.mode || 'module';
  let rows = [];
  if (mode === 'random') rows = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 10').all();
  else if (mode === 'review') {
    rows = db.prepare('SELECT q.* FROM user_question_stats uqs JOIN questions q ON q.id = uqs.question_id WHERE uqs.user_id = ? AND (uqs.miss_count > 0 OR datetime(uqs.next_review_at) <= datetime(?)) ORDER BY uqs.miss_count DESC, datetime(uqs.next_review_at) ASC LIMIT 10').all(USER_ID, dayjs().toISOString());
    if (!rows.length) rows = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 10').all();
  } else rows = db.prepare('SELECT * FROM questions WHERE module_slug = ? ORDER BY RANDOM() LIMIT 10').all(slug);
  res.json(rows.map(mapQuestion));
});

router.post('/quiz/submit', (req, res) => {
  const { questionId, answer } = req.body;
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const result = gradeAnswer(question, answer || '');
  ensureDailyActivity(USER_ID);
  const xpEarned = updateUserXp(USER_ID, result.isCorrect);
  trackQuestionPerformance(USER_ID, question.id, result.isCorrect);

  db.prepare('INSERT INTO quiz_attempts (user_id, question_id, module_slug, topic, answer_text, is_correct, xp_earned) VALUES (?, ?, ?, ?, ?, ?, ?)').run(USER_ID, question.id, question.module_slug, question.topic, answer || '', result.isCorrect ? 1 : 0, xpEarned);
  const user = db.prepare('SELECT xp, level FROM users WHERE id = ?').get(USER_ID);

  res.json({ correct: result.isCorrect, explanation: question.explanation, expectedAnswer: question.answer, matchedKeywords: result.matchedKeywords, xpEarned, streak: calculateStreak(USER_ID), level: user.level, totalXp: user.xp });
});

router.get('/dashboard', (_req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(USER_ID);
  const attempts = db.prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct FROM quiz_attempts WHERE user_id = ?').get(USER_ID);
  const mastery = attempts.total ? Math.round((attempts.correct * 100) / attempts.total) : 0;
  const topicAccuracy = getTopicAccuracy(USER_ID);
  const weakAreas = topicAccuracy.filter((t) => Number(t.accuracy || 0) < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const modulesCompleted = db.prepare('SELECT COUNT(*) AS count FROM (SELECT m.slug, COUNT(a.id) AS attempts, COUNT(q.id) AS total_questions FROM modules m LEFT JOIN questions q ON q.module_slug = m.slug LEFT JOIN quiz_attempts a ON a.module_slug = m.slug AND a.user_id = ? GROUP BY m.slug HAVING attempts >= total_questions * 0.4)').get(USER_ID).count;

  res.json({ user: { name: user.name, xp: user.xp, level: user.level }, streak: calculateStreak(USER_ID), mastery, modulesCompleted, totalAttempts: attempts.total || 0, topicAccuracy, weakAreas, leaderboard: db.prepare('SELECT name, xp, level FROM users ORDER BY xp DESC LIMIT 5').all(), achievements: unlockedAchievements(USER_ID) });
});

router.get('/stats', (_req, res) => {
  const timeline = db.prepare('SELECT DATE(attempted_at) AS day, COUNT(*) AS attempts, ROUND((SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 1) AS accuracy FROM quiz_attempts WHERE user_id = ? GROUP BY DATE(attempted_at) ORDER BY DATE(attempted_at) ASC').all(USER_ID);
  res.json({ timeline });
});

router.get('/search', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.json({ modules: [], questions: [] });
  res.json({
    modules: db.prepare('SELECT slug, title, category, summary FROM modules WHERE title LIKE ? OR summary LIKE ? LIMIT 10').all(`%${q}%`, `%${q}%`),
    questions: db.prepare('SELECT id, module_slug, type, prompt FROM questions WHERE prompt LIKE ? LIMIT 20').all(`%${q}%`)
  });
});

module.exports = router;
