// Envío del formulario de cita con token anti-bots (firmado, de un solo uso y con tiempo mínimo). Sin dependencias.
const MESSAGES: Record<string, string> = {
  nombre: 'Escriba su nombre.',
  telefono: 'Escriba un teléfono de contacto (al menos 9 cifras).',
  correo: 'Escriba un correo electrónico válido, con su arroba y su dominio.',
  tema: 'Elija el tema de su consulta.',
  mensaje: 'Cuéntenos brevemente su caso (mínimo 10 caracteres).',
  acepta: 'Para enviarlo debe aceptar la política de privacidad.',
};
let token: { value: string; at: number } | null = null;
async function getToken() {
  if (token && Date.now() - token.at < 90 * 60 * 1000) return token;
  const res = await fetch('/api/token.php', { cache: 'no-store' });
  if (!res.ok) throw new Error('');
  token = { value: (await res.json()).token, at: Date.now() };
  return token;
}

document.querySelectorAll<HTMLFormElement>('form.js-form').forEach((form) => {
  const status = form.querySelector<HTMLElement>('.fstatus')!;
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const label = button.textContent;
  form.addEventListener('focusin', () => { getToken().catch(() => {}); }, { once: true });

  const clearErrors = () => {
    form.querySelectorAll('.err').forEach((e) => e.remove());
    form.querySelectorAll('[aria-invalid]').forEach((e) => {
      e.removeAttribute('aria-invalid');
      const d = (e.getAttribute('aria-describedby') ?? '').split(' ').filter((x) => !x.endsWith('-err')).join(' ');
      d ? e.setAttribute('aria-describedby', d) : e.removeAttribute('aria-describedby');
    });
  };
  const showError = (el: HTMLInputElement | HTMLTextAreaElement, text: string) => {
    const p = document.createElement('p');
    p.className = 'err';
    p.id = `${el.id}-err`;
    p.textContent = text;
    (el.type === 'checkbox' ? el.parentElement! : el).after(p);
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), p.id].filter(Boolean).join(' '));
  };
  const validate = () => {
    clearErrors();
    const bad = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')].filter((el) => !el.validity.valid);
    bad.forEach((el) => showError(el, MESSAGES[el.name] ?? 'Revise este campo.'));
    bad[0]?.focus();
    return bad.length === 0;
  };

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');
    if (!validate()) return;
    button.disabled = true;
    button.textContent = 'Enviando…';
    try {
      const t = await getToken();
      const wait = 3200 - (Date.now() - t.at);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      const data = new FormData(form);
      data.set('token', t.value);
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error ?? '');
      token = null;
      status.textContent = form.dataset.ok ?? 'Enviado. Gracias.';
      location.assign('/gracias/');
    } catch (e) {
      token = null;
      status.classList.add('is-error');
      status.textContent = (e as Error).message || 'No se ha podido enviar. Inténtelo de nuevo en unos minutos o llame al 954 72 52 12.';
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
});

export {};
