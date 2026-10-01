/** Flies a gold XP chip from the Got it button to the score pill in the top bar. */
export function flyXp(from: Element): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
  const to = document.querySelector('[data-xp-bucket]');
  if (!(to instanceof HTMLElement)) return Promise.resolve();

  const start = from.getBoundingClientRect();
  const end = to.getBoundingClientRect();
  const node = from.cloneNode(true) as HTMLElement;
  node.classList.add('xp-fly');
  node.setAttribute('aria-hidden', 'true');
  Object.assign(node.style, {
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
  });
  document.body.appendChild(node);

  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);

  const finished = new Promise<void>((resolve) => {
    const done = () => {
      node.remove();
      to.classList.add('xp-pop');
      window.setTimeout(() => to.classList.remove('xp-pop'), 420);
      resolve();
    };
    node.addEventListener('transitionend', done, { once: true });
    window.setTimeout(done, 700);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      node.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
      node.style.opacity = '0.2';
    });
  });

  return finished;
}
