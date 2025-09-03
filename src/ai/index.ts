import { PrioAI } from './types';
import { LocalStubAI } from './localStub';

// Switch AI implementation based on environment
const AI_MODE = import.meta.env.VITE_AI_MODE || 'stub';

export function createAI(): PrioAI {
  switch (AI_MODE) {
    case 'llm':
      // TODO: Implement LLM-based AI when needed
      // return new LLMAi(import.meta.env.VITE_LLM_ENDPOINT, import.meta.env.VITE_LLM_KEY);
      console.warn('LLM mode not implemented yet, falling back to stub');
      return new LocalStubAI();
    case 'stub':
    default:
      return new LocalStubAI();
  }
}

export const ai = createAI();
