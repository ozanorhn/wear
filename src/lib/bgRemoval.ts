// Loaded from CDN at runtime so webpack never touches the ONNX runtime files.
// (Those .mjs files break Terser when bundled.)

type RemoveBg = (input: Blob | File | string) => Promise<Blob>;

let cached: RemoveBg | null = null;

export async function getRemoveBackground(): Promise<RemoveBg> {
  if (cached) return cached;
  const mod = await import(
    /* webpackIgnore: true */
    /* @ts-expect-error - ESM URL import resolved at runtime */
    "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (mod as any).removeBackground as RemoveBg;
  if (!fn) throw new Error("background-removal Modul konnte nicht geladen werden.");
  cached = fn;
  return fn;
}
