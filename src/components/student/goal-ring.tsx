/** Red at the start, bright green when the goal is full. */
function progressColor(ratio: number) {
  const t = Math.min(1, Math.max(0, ratio));
  const hue = 2 + 130 * t;
  return `hsl(${hue} 92% 50%)`;
}

export function GoalRing({
  value,
  goal,
  size = 132,
  label = 'words today',
  doneLabel = 'Goal done',
}: {
  value: number;
  goal: number;
  size?: number;
  label?: string;
  doneLabel?: string;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const ratio = goal > 0 ? Math.min(1, value / goal) : 0;
  const done = goal > 0 && value >= goal;
  const color = progressColor(ratio);
  return (
    <div className={`goal-ring${done ? ' done' : ''}`} style={{ width: size, height: size, ['--goal-color' as string]: color }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ width: size, height: size }}>
        <circle className="goal-rim" cx="50" cy="50" r="48" />
        <circle className="goal-disc" cx="50" cy="50" r="39.2" />
        <circle className="goal-inner" cx="50" cy="50" r="40" />
        <circle className="goal-track" cx="50" cy="50" r={r} style={{ stroke: 'rgba(255,255,255,0.28)', strokeWidth: 9 }} />
        <circle
          className="goal-fill"
          cx="50"
          cy="50"
          r={r}
          style={{
            stroke: color,
            strokeWidth: 9,
            opacity: ratio > 0 ? 1 : 0,
          }}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="goal-copy">
        <strong>
          {Math.min(value, 999)}
          <span>/{goal}</span>
        </strong>
        <em>{done ? doneLabel : label}</em>
      </div>
      <span className="sr-only">
        {value} of {goal} {label}
      </span>
    </div>
  );
}
