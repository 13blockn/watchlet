function normalize(value = '') {
  return value.toString().trim().toLowerCase();
}

function gradeAnswer(question, answer) {
  const normalizedAnswer = normalize(answer);
  if (question.type === 'short_answer') {
    const keywords = JSON.parse(question.keywords_json || '[]').map((k) => normalize(k));
    const hits = keywords.filter((kw) => normalizedAnswer.includes(kw));
    return { isCorrect: hits.length >= Math.max(1, Math.min(2, keywords.length)), matchedKeywords: hits };
  }
  return { isCorrect: normalizedAnswer === normalize(question.answer), matchedKeywords: [] };
}

function levelFromXp(xp) {
  if (xp >= 800) return 'Expert';
  if (xp >= 500) return 'Collector';
  if (xp >= 200) return 'Enthusiast';
  return 'Beginner';
}

module.exports = { gradeAnswer, levelFromXp };
