/** A labelled set, such as the eight parts of speech, shown as a colour board rather than a plain list. */
export function boardItems(examples: string[]) {
  if (examples.length < 2 || examples.some(line => !line.includes(' — '))) return null;
  return examples.map(line => {
    const [label, detail] = line.split(' — ');
    return { label, detail };
  });
}

export function BeginnerBoard({ items }: { items: { label: string; detail: string }[] }) {
  return (
    <div className={`beginner-board count-${Math.min(items.length, 8)}`} role="list">
      {items.map((item, index) => (
        <article key={item.label} className={`beginner-board-card tone-${index % 8}`} role="listitem">
          <span aria-hidden="true">{index + 1}</span>
          <h4>{item.label}</h4>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
