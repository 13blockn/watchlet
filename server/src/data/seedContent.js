const modules = require('./modules');

const watchFacts = {
  basics: [
    ['The bezel surrounds the crystal and can be fixed or rotating.', 'true'],
    ['Sapphire crystal is generally more scratch resistant than mineral crystal.', 'true'],
    ['The crown is only decorative and never affects time-setting.', 'false'],
    ['Lug-to-lug measurement affects how a watch fits your wrist.', 'true']
  ],
  movements: [
    ['Quartz watches are powered by a battery and quartz oscillator.', 'true'],
    ['Automatic watches are powered by wrist motion winding a mainspring.', 'true'],
    ['The escapement controls energy release in a mechanical watch.', 'true'],
    ['All mechanical watches are more accurate than quartz watches.', 'false']
  ],
  complications: [
    ['A complication is any feature beyond basic time display.', 'true'],
    ['A GMT complication tracks an additional time zone.', 'true'],
    ['A minute repeater is a water resistance technology.', 'false'],
    ['Chronographs are designed for measuring elapsed time.', 'true']
  ],
  'brands-models': [
    ['The Rolex Submariner is an iconic dive watch.', 'true'],
    ['The Omega Speedmaster is linked to NASA missions.', 'true'],
    ['Seiko has never produced mechanical watches.', 'false'],
    ['The Nautilus is associated with Patek Philippe.', 'true']
  ],
  history: [
    ['The quartz crisis impacted Swiss mechanical watchmaking.', 'true'],
    ['Reference numbers help identify model variants.', 'true'],
    ['Originality and condition matter in collecting.', 'true'],
    ['Box and papers never influence collectability.', 'false']
  ]
};

const mcqBank = {
  basics: [
    ['Which part typically controls winding and time setting?', 'Crown', ['Caseback', 'Rotor', 'Crown', 'Bezel']],
    ['Which crystal material is most scratch resistant?', 'Sapphire', ['Acrylic', 'Mineral', 'Sapphire', 'Plastic']],
    ['What does lug-to-lug describe?', 'Distance between top and bottom lugs', ['Case thickness', 'Bracelet width', 'Distance between top and bottom lugs', 'Dial diameter']],
    ['Why use luminous material on hands and indices?', 'To improve low-light readability', ['To increase power reserve', 'To improve low-light readability', 'To reduce servicing', 'To waterproof the case']]
  ],
  movements: [
    ['What powers a quartz movement?', 'Battery and quartz oscillator', ['Mainspring only', 'Battery and quartz oscillator', 'Solar spring', 'Escapement wheel']],
    ['Automatic movement means:', 'Self-winding mechanical movement', ['Digital quartz movement', 'Self-winding mechanical movement', 'Hand-wound only', 'Radio-controlled timekeeping']],
    ['What component oscillates in a mechanical movement?', 'Balance wheel', ['Rotor screw', 'Balance wheel', 'Date disk', 'Case clamp']],
    ['A typical modern mechanical beat rate is:', '28,800 vph', ['3,600 vph', '14,400 vph', '28,800 vph', '120,000 vph']]
  ],
  complications: [
    ['Which complication helps travelers most?', 'GMT', ['Power reserve only', 'GMT', 'Skeletonization', 'Open-heart']],
    ['A chronograph is best described as:', 'A stopwatch function integrated into a watch', ['A date-only module', 'A stopwatch function integrated into a watch', 'A solar battery', 'A decorative engraving']],
    ['Which is considered a high complication?', 'Minute repeater', ['Date window', 'Minute repeater', 'Luminous paint', 'Rotating clasp']],
    ['Perpetual calendar tracks:', 'Month length and leap years', ['Only weekends', 'Month length and leap years', 'Moonrise daily', 'Sunset time']]
  ],
  'brands-models': [
    ['Which brand is linked to the Submariner?', 'Rolex', ['Omega', 'Rolex', 'Seiko', 'Cartier']],
    ['Speedmaster is most associated with:', 'Omega', ['Tudor', 'Tag Heuer', 'Omega', 'IWC']],
    ['Nautilus belongs to which brand?', 'Patek Philippe', ['Audemars Piguet', 'Patek Philippe', 'Rolex', 'Longines']],
    ['Royal Oak is made by:', 'Audemars Piguet', ['Vacheron Constantin', 'Audemars Piguet', 'Breitling', 'Oris']]
  ],
  history: [
    ['The quartz crisis most strongly affected:', 'Traditional mechanical manufacturers', ['Only strap makers', 'Traditional mechanical manufacturers', 'Dial printers', 'Modern smartwatch startups']],
    ['What helps verify specific watch configuration?', 'Reference number', ['Case color only', 'Reference number', 'Lume tone', 'Anecdotal forum post']],
    ['A key collecting principle is:', 'Buy condition and provenance', ['Ignore service history', 'Buy condition and provenance', 'Only buy largest case', 'Avoid all paperwork']],
    ['Wristwatches gained mass adoption around:', 'Early 20th century', ['17th century', 'Early 20th century', '1980s only', 'After smartphones']]
  ]
};

function buildSeedData() {
  const questions = [];
  let questionId = 1;

  modules.forEach((module) => {
    const slug = module.slug;
    const trueFalse = watchFacts[slug] || [];
    const mcqs = mcqBank[slug] || [];

    trueFalse.forEach(([prompt, answer], index) => {
      questions.push({
        id: questionId++, moduleSlug: slug, topic: module.category, type: 'true_false', prompt,
        choices: ['True', 'False'], answer,
        keywords: answer === 'true' ? ['true', 'yes'] : ['false', 'no'],
        explanation: `Key concept: ${module.title}. Statement #${index + 1} is ${answer}.`, difficulty: (index % 3) + 1
      });
    });

    mcqs.forEach(([prompt, correct, options], index) => {
      questions.push({
        id: questionId++, moduleSlug: slug, topic: module.category, type: 'multiple_choice', prompt,
        choices: options, answer: correct, keywords: [correct.toLowerCase()],
        explanation: `${correct} is the best answer based on standard watchmaking knowledge.`, difficulty: ((index + 1) % 3) + 1
      });
    });

    for (let i = 0; i < 16; i += 1) {
      const lesson = module.lessons[i % module.lessons.length];
      const sentence = lesson.content[i % lesson.content.length];
      const keywordSource = sentence.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 4).slice(0, 3);
      questions.push({
        id: questionId++, moduleSlug: slug, topic: module.category, type: 'short_answer',
        prompt: `In one or two sentences: ${lesson.title} — explain: ${sentence}`,
        choices: [], answer: keywordSource[0] || 'watch',
        keywords: [...new Set([module.category.toLowerCase(), ...keywordSource])],
        explanation: `Strong responses reference concepts like ${keywordSource.join(', ') || 'watch fundamentals'}.`,
        difficulty: (i % 3) + 1
      });
    }
  });

  return questions;
}

module.exports = { modules, buildSeedData };
