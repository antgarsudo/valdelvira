// Envuelve [PENDIENTE: …] y [VERIFICAR …] en <span class="pending"> para que la abogada los localice al revisar.
const RE = /\[(?:PENDIENTE|VERIFICAR)[^\]]*\]/g;
export function rehypePending() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return;
      const out = [];
      for (const child of node.children) {
        if (child.type === 'text' && RE.test(child.value)) {
          RE.lastIndex = 0;
          let last = 0;
          for (const m of child.value.matchAll(RE)) {
            if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) });
            out.push({ type: 'element', tagName: 'span', properties: { className: ['pending'] }, children: [{ type: 'text', value: m[0] }] });
            last = m.index + m[0].length;
          }
          if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) });
        } else {
          visit(child);
          out.push(child);
        }
      }
      node.children = out;
    };
    visit(tree);
  };
}
