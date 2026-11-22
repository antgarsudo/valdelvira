// Ofuscación de correos: XOR + base64. Lo decodifica src/scripts/email.ts tras la primera interacción.
export const encodeEmail = (v: string) =>
  Buffer.from([...Buffer.from(v, 'utf8')].map((b, i) => b ^ (0x5a + (i % 7)))).toString('base64');
