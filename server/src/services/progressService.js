const dayjs = require('dayjs');
const db = require('../db');
const { levelFromXp } = require('../utils/scoring');

function ensureDailyActivity(userId) {
  const today = dayjs().format('YYYY-MM-DD');
  db.prepare('INSERT INTO daily_activity (user_id, activity_date, quizzes_completed) VALUES (?, ?, 1) ON CONFLICT(user_id, activity_date) DO UPDATE SET quizzes_completed = quizzes_completed + 1').run(userId, today);
}

function calculateStreak(userId) {
  const days = db.prepare('SELECT activity_date FROM daily_activity WHERE user_id = ? ORDER BY activity_date DESC').all(userId);
  if (!days.length) return 0;
  let streak = 0;
  let expected = dayjs();
  for (const row of days) {
    if (row.activity_date === expected.format('YYYY-MM-DD')) {
      streak += 1;
      expected = expected.subtract(1, 'day');
    } else if (streak === 0 && row.activity_date === expected.subtract(1, 'day').format('YYYY-MM-DD')) {
      streak += 1;
      expected = expected.subtract(1, 'day');
    } else {
      break;
    }
  }
  return streak;
}

function updateUserXp(userId, isCorrect) {
  const streak = calculateStreak(userId);
  let xp = 0;
  if (isCorrect) {
    xp = 10 + (streak >= 3 ? 2 : 0) + (streak >= 7 ? 3 : 0);
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xp, userId);
    const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(userId);
    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(levelFromXp(user.xp), userId);
  }
  return xp;
}

function trackQuestionPerformance(userId, questionId, isCorrect) {
  const now = dayjs().toISOString();
  const nextReview = dayjs().add(isCorrect ? 4 : 1, 'day').toISOString();
  db.prepare('INSERT INTO user_question_stats (user_id, question_id, seen_count, correct_count, miss_count, last_seen_at, next_review_at) VALUES (?, ?, 1, ?, ?, ?, ?) ON CONFLICT(user_id, question_id) DO UPDATE SET seen_count = seen_count + 1, correct_count = correct_count + excluded.correct_count, miss_count = miss_count + excluded.miss_count, last_seen_at = excluded.last_seen_at, next_review_at = excluded.next_review_at').run(userId, questionId, isCorrect ? 1 : 0, isCorrect ? 0 : 1, now, nextReview);
}

function getTopicAccuracy(userId) {
  return db.prepare('SELECT topic, COUNT(*) AS total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct, ROUND((SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 1) AS accuracy FROM quiz_attempts WHERE user_id = ? GROUP BY topic').all(userId);
}

function unlockedAchievements(userId) {
  const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(userId);
  const streak = calculateStreak(userId);
  const attempts = db.prepare('SELECT COUNT(*) AS total, SUM(is_correct) AS correct FROM quiz_attempts WHERE user_id = ?').get(userId);
  const mastery = attempts.total ? Math.round((attempts.correct / attempts.total) * 100) : 0;
  const comp = db.prepare("SELECT ROUND((SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 1) AS accuracy FROM quiz_attempts WHERE user_id = ? AND topic = 'Complications'").get(userId);

  const checks = {
    topic_complications_accuracy: Number(comp?.accuracy || 0),
    streak_days: streak,
    xp_total: user.xp,
    mastery_percentage: mastery
  };

  db.prepare('SELECT * FROM achievements').all().forEach((achievement) => {
    if ((checks[achievement.metric] || 0) >= achievement.threshold) {
      db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, achievement.id);
    }
  });

  return db.prepare('SELECT a.id, a.label, a.description, ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id = ua.achievement_id WHERE ua.user_id = ? ORDER BY ua.unlocked_at DESC').all(userId);
}

module.exports = { ensureDailyActivity, calculateStreak, updateUserXp, trackQuestionPerformance, getTopicAccuracy, unlockedAchievements };
