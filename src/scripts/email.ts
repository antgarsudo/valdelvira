const decode = (v: string) => {
  const bytes = Uint8Array.from(atob(v), (c, i) => c.charCodeAt(0) ^ (0x5a + (i % 7)));
  return new TextDecoder().decode(bytes);
};
const reveal = () => {
  document.querySelectorAll<HTMLAnchorElement>('a.eml[data-e]').forEach((a) => {
    const email = decode(a.dataset.e!);
    a.href = `mailto:${email}`;
    if (!a.dataset.label) a.textContent = email;
    a.removeAttribute('data-e');
  });
};
// Un rastreador simple no llega a ejecutar esto; a una persona le aparece casi al instante.
const events = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
let done = false;
const once = () => {
  if (done) return;
  done = true;
  events.forEach((e) => removeEventListener(e, once));
  reveal();
};
events.forEach((e) => addEventListener(e, once, { passive: true, once: true }));
setTimeout(once, 900);

export {};
