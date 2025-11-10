// Simulates a direct-to-cloud upload in dev.
// Emits progress 0..100% over a short period, then resolves.
export type UploadHandle = {
  pause: () => void;
  resume: () => void;
  cancel: () => void;
};

export function fakeUpload(
  file: File,
  onProgress: (pct: number) => void,
  opts?: { speed?: number } // higher is faster
): Promise<{ etag: string; handle: UploadHandle }> {
  let pct = 0;
  let timer: any = null;
  let paused = false;
  let cancelled = false;
  const speed = Math.max(1, opts?.speed ?? 1);

  const tick = () => {
    if (paused || cancelled) return;
    pct = Math.min(100, pct + Math.max(1, Math.round(4 * speed * Math.random())));
    onProgress(pct);
    if (pct >= 100) {
      clearInterval(timer);
    }
  };

  return new Promise((resolve, reject) => {
    timer = setInterval(() => {
      if (cancelled) {
        clearInterval(timer);
        reject(new Error('cancelled'));
        return;
      }
      tick();
      if (pct >= 100) {
        resolve({
          etag: Math.random().toString(36).slice(2),
          handle: {
            pause: () => { /* no-op */ },
            resume: () => { /* no-op */ },
            cancel: () => { /* no-op */ },
          },
        });
      }
    }, 120);
  });
}
