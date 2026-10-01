export type BeginnerVisual = 'sentence' | 'object' | 'amount' | 'ownership' | 'comparison' | 'place' | 'repair';
export type BeginnerSection = { title: string; paragraphs: string[]; examples: string[] };
export type BeginnerVisualGuide = {
  title: string;
  afterSection?: string;
  rows: { label: string; parts: { text: string; label: string }[]; note: string }[];
  check: { prompt: string; answer: string };
};
export type BeginnerVideo = {
  title: string; publisher: string; url: string; youtubeId?: string;
  note: string; focus: string; recap: string[]; checkedOn: string;
};
type TaskBase = { id: string; phase: 'guided' | 'quiz' | 'write'; prompt: string; explanation: string };
export type BeginnerTask = TaskBase & (
  | { kind: 'choice'; options: string[]; answer: number }
  | { kind: 'response' }
);
export type BeginnerLesson = {
  id: string;
  title: string;
  kind: 'concept' | 'review' | 'capstone';
  sections: BeginnerSection[];
  tasks: BeginnerTask[];
  visual?: BeginnerVisual;
  visualGuide?: BeginnerVisualGuide;
  video?: BeginnerVideo;
};
