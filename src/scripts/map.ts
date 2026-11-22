// Carga el mapa de Google solo cuando el visitante pulsa el botón (consentimiento para sus cookies).
document.querySelectorAll<HTMLElement>('[data-map]').forEach((box) => {
  box.querySelector('.js-map')?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = box.dataset.map!;
    f.title = 'Mapa de situación del despacho en Google Maps';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.replaceChildren(f);
  });
});

export {};
