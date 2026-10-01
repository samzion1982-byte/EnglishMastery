export type Profile = { name: string; language: string };
export type View = 'home' | 'learn' | 'practice' | 'profile';
export type Word = {
  word: string;
  type: string;
  meaning: string;
  ta: string;
  hi: string;
  synonym: string;
  antonym: string;
  examples: string[];
  options: string[];
};
