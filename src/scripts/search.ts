const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const input = document.querySelector<HTMLInputElement>('#s')!;
const status = document.querySelector<HTMLElement>('#search-status')!;
const list = document.querySelector<HTMLElement>('#search-results')!;
const q = new URLSearchParams(location.search).get('s')?.trim() ?? '';
input.value = q;
if (!q) input.focus();
else run(q);

async function run(query: string) {
  status.textContent = 'Buscando…';
  try {
    const res = await fetch('/search-index.json');
    if (!res.ok) throw new Error();
    const items: { t: string; u: string; d: string; k: string }[] = await res.json();
    const terms = norm(query).split(/\s+/).filter((w) => w.length > 1);
    const scored = items
      .map((i) => {
        const t = norm(i.t), k = norm(i.k), d = norm(i.d);
        let s = 0;
        for (const w of terms) {
          if (t.includes(w)) s += 5; else if (k.includes(w)) s += 3; else if (d.includes(w)) s += 1; else return { i, s: 0 };
        }
        return { i, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    list.replaceChildren(...scored.slice(0, 40).map(({ i }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = i.u;
      a.textContent = i.t;
      const p = document.createElement('p');
      p.textContent = i.d;
      li.append(a, p);
      return li;
    }));
    status.textContent = scored.length === 0
      ? `Sin resultados para «${query}». Pruebe con otra palabra, como «accidente», «herencia» o «divorcio», o llámenos al 954 72 52 12.`
      : `${scored.length} ${scored.length === 1 ? 'resultado' : 'resultados'} para «${query}».`;
  } catch {
    status.textContent = 'No se ha podido completar la búsqueda. Inténtelo de nuevo en un momento.';
  }
}

export {};
