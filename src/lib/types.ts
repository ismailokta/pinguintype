export interface Sentence {
  id: number;
  text: string;
  formality: "formal" | "informal" | "conversational";
  metadata: {
    tense: string;
    voice: string;
    structure: string;
    difficulty?: string;
    notes?: string;
  };
}

export interface Topic {
  id: number;
  name: string;
  description: string;
}
