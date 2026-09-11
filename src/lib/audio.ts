export type SoundEffect = "flash" | "objection" | "slide" | "alert";

// Pre-load audio elements if in browser
const audioCache = new Map<SoundEffect, HTMLAudioElement>();

export function playSound(effect: SoundEffect, volume: number = 0.5) {
  if (typeof window === "undefined") return; // SSR check

  try {
    let audio = audioCache.get(effect);
    if (!audio) {
      audio = new Audio(`/media/sounds/${effect}.mp3`);
      audioCache.set(effect, audio);
    }
    
    // Reset and play
    audio.volume = volume;
    audio.currentTime = 0;
    const playPromise = audio.play();
    
    // Handle autoplay restrictions gracefully
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Silently catch - usually due to missing file or autoplay policy
      });
    }
  } catch (err) {
    // Silently catch
  }
}
