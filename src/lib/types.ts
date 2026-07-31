export interface Game {
  id: number;
  rank: number;
  title: string;
  category: string;
  size_gb: number;
  accent: string;
  status: string;
  nsfw: boolean;
}

export interface Todo {
  id: number;
  task: string;
  done: boolean;
  seconds: number;
}

export const CATEGORY_META: Record<string, { icon: string; accent: string; blurb: string }> = {
  'Action / Souls-like': { icon: '\u2694', accent: '#D9FFF4', blurb: 'Precision, pain, and perfect parries.' },
  'Open World / Adventure': { icon: '\uD83C\uDF0D', accent: '#EEF8CD', blurb: 'Endless horizons and untold stories.' },
  'Shooters / FPS': { icon: '\uD83D\uDD2B', accent: '#FFC5AA', blurb: 'Reflex, recoil, and raw firepower.' },
  'Narrative / Story-Driven': { icon: '\uD83C\uDFAD', accent: '#D9FFF4', blurb: 'Cinematic journeys that hit hard.' },
  'Racing / Sports': { icon: '\uD83C\uDFCE', accent: '#EEF8CD', blurb: 'Speed, grit, and the roar of engines.' },
  'Action-Adventure / Misc': { icon: '\uD83C\uDFAE', accent: '#FFC5AA', blurb: 'Bold experiments and beloved chaos.' },
};

export const CATEGORY_ORDER = [
  'Action / Souls-like',
  'Open World / Adventure',
  'Shooters / FPS',
  'Narrative / Story-Driven',
  'Racing / Sports',
  'Action-Adventure / Misc',
];
