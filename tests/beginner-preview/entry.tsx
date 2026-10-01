import React from 'react';
import { createRoot } from 'react-dom/client';
import { GrammarLearning } from '../../src/components/student/grammar-learning';

function Preview() {
  const [xp, setXp] = React.useState(0);
  return <main className="student" style={{ padding: 24 }}>
    <p>Local UI test · synthetic learner · XP awarded this visit: <output>{xp}</output></p>
    <GrammarLearning userId="beginner-ui-test" onAward={n => setXp(x => x + n)} onPractice={() => alert('Practice Corner navigation callback received')} />
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
