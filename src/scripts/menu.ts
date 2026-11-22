const menu = document.querySelector<HTMLDetailsElement>('details.menu');
if (menu) {
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { menu.open = false; }));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); }
  });
  addEventListener('pointerdown', (e) => { if (menu.open && !menu.contains(e.target as Node)) menu.open = false; });
}

export {};
