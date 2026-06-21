import type { TransitionKey } from "./heroOffsetAnimation";

export type SeparatorTone = "light" | "light-red" | "red" | "muted-red";

export type SeparatorLength = "short" | "medium" | "long";

export type SeparatorWordDef = {
  text: string;
  tone: SeparatorTone;
};

export type SeparatorPhraseDef = {
  id: string;
  transitionKey: TransitionKey;
  ariaLabel: string;
  length: SeparatorLength;
  words: SeparatorWordDef[];
  phraseClass?: string;
};

export const SEPARATOR_TONE_COLORS: Record<
  SeparatorTone,
  { final: string; start: string }
> = {
  light: { final: "#fafaff", start: "#fafaff" },
  "light-red": { final: "rgba(236, 0, 0, 0.8)", start: "rgba(236, 0, 0, 0.55)" },
  red: { final: "#ec0000", start: "rgba(236, 0, 0, 0.55)" },
  "muted-red": { final: "rgba(236, 0, 0, 0.58)", start: "rgba(236, 0, 0, 0.45)" },
};

export const HERO_SEPARATOR_PHRASES: SeparatorPhraseDef[] = [
  {
    id: "nos-encargamos-de-todo",
    transitionKey: "t1",
    ariaLabel: "NOS ENCARGAMOS DE TODO",
    length: "medium",
    words: [
      { text: "NOS", tone: "light" },
      { text: "ENCARGAMOS", tone: "light" },
      { text: "DE", tone: "light" },
      { text: "TODO", tone: "red" },
    ],
  },
  {
    id: "de-todo-lo-demas",
    transitionKey: "t2",
    ariaLabel: "DE TODO LO DEMÁS ...",
    length: "medium",
    words: [
      { text: "DE", tone: "light" },
      { text: "TODO", tone: "light-red" },
      { text: "LO", tone: "light" },
      { text: "DEMÁS", tone: "red" },
      { text: "...", tone: "muted-red" },
    ],
  },
  {
    id: "te-impulsamos",
    transitionKey: "t3",
    ariaLabel: "TE IMPULSAMOS",
    length: "short",
    phraseClass: "phraseTeImpulsamos",
    words: [
      { text: "TE", tone: "light" },
      { text: "IMPULSAMOS", tone: "red" },
    ],
  },
  {
    id: "menos-ruido",
    transitionKey: "t4",
    ariaLabel: "MENOS RUIDO",
    length: "short",
    words: [
      { text: "MENOS", tone: "light" },
      { text: "RUIDO", tone: "red" },
    ],
  },
  {
    id: "empieza-evoluciona-escala",
    transitionKey: "t5",
    ariaLabel: "EMPIEZA EVOLUCIONA ESCALA",
    length: "long",
    words: [
      { text: "EMPIEZA", tone: "light" },
      { text: "EVOLUCIONA", tone: "light-red" },
      { text: "ESCALA", tone: "red" },
    ],
  },
  {
    id: "final-dots",
    transitionKey: "final",
    ariaLabel: "···",
    length: "short",
    words: [
      { text: "·", tone: "light" },
      { text: "·", tone: "light-red" },
      { text: "·", tone: "red" },
    ],
  },
];

export const HERO_SEPARATOR_BY_KEY = Object.fromEntries(
  HERO_SEPARATOR_PHRASES.map((p) => [p.transitionKey, p]),
) as Record<TransitionKey, SeparatorPhraseDef>;
