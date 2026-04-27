const db = require('./index');
const { modules, buildSeedData } = require('../data/seedContent');

function seed() {
  if (!db.prepare('SELECT id FROM users WHERE id = 1').get()) {
    db.prepare('INSERT INTO users (id, name, xp, level) VALUES (1, ?, 0, ?)').run('You', 'Beginner');
  }

  [['WatchRookie', 180, 'Enthusiast'], ['DialHunter', 420, 'Collector'], ['ComplicationNerd', 760, 'Expert']].forEach(([name, xp, level], idx) => {
    const id = idx + 2;
    if (!db.prepare('SELECT id FROM users WHERE id = ?').get(id)) {
      db.prepare('INSERT INTO users (id, name, xp, level) VALUES (?, ?, ?, ?)').run(id, name, xp, level);
    }
  });

  if (db.prepare('SELECT COUNT(*) AS count FROM modules').get().count === 0) {
    const insertModule = db.prepare('INSERT INTO modules (slug, title, category, summary, lesson_count) VALUES (?, ?, ?, ?, ?)');
    const insertLesson = db.prepare('INSERT INTO lessons (module_slug, title, content, position) VALUES (?, ?, ?, ?)');
    modules.forEach((module) => {
      insertModule.run(module.slug, module.title, module.category, module.summary, module.lessons.length);
      module.lessons.forEach((lesson, index) => insertLesson.run(module.slug, lesson.title, JSON.stringify(lesson.content), index + 1));
    });
  }

  if (db.prepare('SELECT COUNT(*) AS count FROM questions').get().count === 0) {
    const insertQuestion = db.prepare('INSERT INTO questions (id, module_slug, topic, type, prompt, choices_json, answer, keywords_json, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const tx = db.transaction((rows) => {
      rows.forEach((q) => insertQuestion.run(q.id, q.moduleSlug, q.topic, q.type, q.prompt, JSON.stringify(q.choices || []), q.answer, JSON.stringify(q.keywords || []), q.explanation, q.difficulty || 1));
    });
    tx(buildSeedData());
  }

  [['chronograph-expert', 'Chronograph Expert', 'Reach 80% accuracy in Complications topic.', 80, 'topic_complications_accuracy'], ['ten-day-streak', '10-day streak', 'Complete one quiz for 10 consecutive days.', 10, 'streak_days'], ['xp-500', 'Collector Momentum', 'Earn 500 XP.', 500, 'xp_total'], ['mastery-90', 'Mastery 90', 'Reach 90% overall mastery.', 90, 'mastery_percentage']].forEach((a) => {
    db.prepare('INSERT OR IGNORE INTO achievements (id, label, description, threshold, metric) VALUES (?, ?, ?, ?, ?)').run(...a);
  });

  console.log(`Seed complete. Questions: ${db.prepare('SELECT COUNT(*) AS c FROM questions').get().c}`);
}

seed();
