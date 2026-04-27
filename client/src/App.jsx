import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from './api';
import './index.css';

function ProgressBar({ label, value }) {
  return (
    <div className="progress-row">
      <div className="between"><span>{label}</span><span>{Math.round(value || 0)}%</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, value || 0)}%` }} /></div>
    </div>
  );
}

function QuizPane({ quiz, onAnswer, result, onNext }) {
  const [answer, setAnswer] = useState('');
  useEffect(() => setAnswer(''), [quiz?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (!quiz || result) return;
      if (quiz.type === 'multiple_choice' || quiz.type === 'true_false') {
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < quiz.choices.length) setAnswer(quiz.choices[idx]);
      }
      if (e.key === 'Enter') onAnswer(answer);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quiz, result, answer, onAnswer]);

  if (!quiz) return <p>No questions found.</p>;

  return (
    <div className="card">
      <h3>{quiz.prompt}</h3>
      {(quiz.type === 'multiple_choice' || quiz.type === 'true_false') && (
        <div className="option-grid">
          {quiz.choices.map((choice, idx) => (
            <button key={choice} className={`option ${answer === choice ? 'selected' : ''}`} onClick={() => setAnswer(choice)}>
              <span className="kbd">{idx + 1}</span> {choice}
            </button>
          ))}
        </div>
      )}
      {quiz.type === 'short_answer' && (
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type a short explanation..." rows={4} />
      )}
      {!result && <button className="primary" onClick={() => onAnswer(answer)} disabled={!answer.trim()}>Submit Answer</button>}
      {result && (
        <div className={`feedback ${result.correct ? 'ok' : 'bad'}`}>
          <strong>{result.correct ? 'Correct' : 'Not quite'}</strong>
          <p>{result.explanation}</p>
          <p>+{result.xpEarned} XP | Streak: {result.streak} days | Level: {result.level}</p>
          <button className="primary" onClick={onNext}>Next Question</button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({ timeline: [] });
  const [activeModule, setActiveModule] = useState(null);
  const [quizMode, setQuizMode] = useState('module');
  const [quizList, setQuizList] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState({ modules: [], questions: [] });
  const [dark, setDark] = useState(false);

  const currentQuiz = quizList[quizIndex];

  const load = async () => {
    const [d, m, s] = await Promise.all([api.getDashboard(), api.getModules(), api.getStats()]);
    setDashboard(d); setModules(m); setStats(s);
    if (!activeModule && m[0]) setActiveModule(m[0]);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { document.body.className = dark ? 'dark' : ''; }, [dark]);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!search.trim()) return setSearchResults({ modules: [], questions: [] });
      setSearchResults(await api.search(search));
    }, 250);
    return () => clearTimeout(id);
  }, [search]);

  const masteryLabel = useMemo(() => {
    if (!dashboard) return '...';
    return `${dashboard.mastery}% mastery`;
  }, [dashboard]);

  const startQuiz = async (mode = 'module') => {
    if (!activeModule) return;
    const payload = await api.getQuiz(activeModule.slug, mode);
    setQuizMode(mode);
    setQuizList(payload);
    setQuizIndex(0);
    setResult(null);
    setTab('quiz');
  };

  const submitAnswer = async (answer) => {
    if (!currentQuiz || !answer?.trim()) return;
    const feedback = await api.submitQuiz({ questionId: currentQuiz.id, answer });
    setResult(feedback);
    await load();
  };

  const nextQuestion = () => {
    setResult(null);
    setQuizIndex((idx) => (idx + 1 < quizList.length ? idx + 1 : 0));
  };

  return (
    <div className="layout">
      <header className="topbar">
        <h1>Watch Academy</h1>
        <div className="top-actions">
          <input placeholder="Search topics/questions" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={() => setDark((v) => !v)}>{dark ? 'Light' : 'Dark'} mode</button>
        </div>
      </header>

      <nav className="tabs">
        {['dashboard', 'learn', 'quiz', 'stats'].map((name) => (
          <button key={name} onClick={() => setTab(name)} className={tab === name ? 'active' : ''}>{name}</button>
        ))}
      </nav>

      {searchResults.modules.length > 0 && (
        <section className="card">
          <h3>Search matches</h3>
          {searchResults.modules.map((m) => <p key={m.slug}><strong>{m.title}</strong> - {m.summary}</p>)}
          {searchResults.questions.slice(0, 3).map((q) => <p key={q.id}>{q.prompt}</p>)}
        </section>
      )}

      {tab === 'dashboard' && dashboard && (
        <section className="grid">
          <div className="card"><h2>{dashboard.user.level}</h2><p>{dashboard.user.xp} XP</p><p>{masteryLabel}</p></div>
          <div className="card"><h2>{dashboard.streak} day streak</h2><p>{dashboard.modulesCompleted} modules completed</p><button className="primary" onClick={() => setTab('learn')}>Continue Learning</button></div>
          <div className="card"><h2>Weak Areas</h2>{dashboard.weakAreas.length ? dashboard.weakAreas.map((w) => <ProgressBar key={w.topic} label={w.topic} value={w.accuracy} />) : <p>No weak areas yet. Keep going.</p>}</div>
          <div className="card"><h2>Leaderboard</h2>{dashboard.leaderboard.map((row, idx) => <p key={row.name}>{idx + 1}. {row.name} - {row.xp} XP ({row.level})</p>)}</div>
          <div className="card"><h2>Achievements</h2>{dashboard.achievements.length ? dashboard.achievements.map((a) => <p key={a.id}>{a.label}</p>) : <p>No badges yet.</p>}</div>
        </section>
      )}

      {tab === 'learn' && (
        <section className="grid split">
          <div className="card">
            <h2>Learning Modules</h2>
            {modules.map((m) => (
              <button key={m.slug} className={`module-btn ${activeModule?.slug === m.slug ? 'active' : ''}`} onClick={() => setActiveModule(m)}>
                {m.title} ({m.question_count} Qs)
              </button>
            ))}
          </div>
          {activeModule && <div className="card"><h2>{activeModule.title}</h2><p>{activeModule.summary}</p>{activeModule.lessons.map((lesson) => <article key={lesson.title}><h4>{lesson.title}</h4>{lesson.content.map((line) => <p key={line}>{line}</p>)}</article>)}<div className="row"><button className="primary" onClick={() => startQuiz('module')}>Quiz This Module</button><button onClick={() => startQuiz('review')}>Weak Areas Review</button><button onClick={() => startQuiz('random')}>Random Quiz</button></div></div>}
        </section>
      )}

      {tab === 'quiz' && (
        <section>
          <p>Mode: {quizMode} | Question {quizIndex + 1} of {Math.max(quizList.length, 1)}</p>
          <QuizPane quiz={currentQuiz} onAnswer={submitAnswer} result={result} onNext={nextQuestion} />
        </section>
      )}

      {tab === 'stats' && (
        <section className="card">
          <h2>Accuracy Over Time</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={stats.timeline}>
                <XAxis dataKey="day" /><YAxis domain={[0, 100]} /><Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#2b7fff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
