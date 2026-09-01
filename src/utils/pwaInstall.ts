export interface PwaInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let promptEvent: PwaInstallPrompt | null = null;
const listeners = new Set<(prompt: PwaInstallPrompt | null) => void>();

export const getPwaInstallPrompt = () => promptEvent;

export const setPwaInstallPrompt = (prompt: PwaInstallPrompt | null) => {
  promptEvent = prompt;
  listeners.forEach((listener) => listener(prompt));
};

export const subscribeToPwaInstallPrompt = (listener: (prompt: PwaInstallPrompt | null) => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
