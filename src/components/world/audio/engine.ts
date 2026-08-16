export function createEngineAudio() {
  let started = false;
  const idle = new Audio('/audio/engine-idle.wav');
  const high = new Audio('/audio/engine-high.wav');
  [idle, high].forEach((audio) => {
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
  });
  return {
    start() {
      if (started) return;
      started = true;
      void idle.play();
      void high.play();
    },
    update(longitudinalSpeed: number, maxSpeed: number, muted: boolean) {
      if (!started) return;
      const ratio = Math.min(Math.abs(longitudinalSpeed) / maxSpeed, 1);
      const volume = muted ? 0.45 : 1;
      idle.playbackRate = 0.88 + ratio * 0.2;
      high.playbackRate = 0.72 + ratio * 0.68;
      idle.volume = Math.max(0, Math.min(0.026, (0.026 - ratio * 0.018) * volume));
      high.volume = Math.max(0, Math.min(0.038, (ratio - 0.12) * 0.042 * volume));
    },
    stop() {
      idle.pause();
      high.pause();
      idle.src = '';
      high.src = '';
    },
  };
}
