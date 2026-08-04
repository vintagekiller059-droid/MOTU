import { create } from "zustand";

export type CognitiveModule = 'memory' | 'knowledge' | 'reasoning' | 'context';
export type SignalPhase = 'idle' | 'activating' | 'transmitting' | 'core-processing' | 'answering';

interface CoreState {
  activeModules: CognitiveModule[];
  signalPhase: SignalPhase;
  lastQuery: string;
  triggerModules: (query: string) => void;
  setPhase: (phase: SignalPhase) => void;
  reset: () => void;
}

function analyzeQuery(query: string): CognitiveModule[] {
  const q = query.toLowerCase().trim();
  const modules = new Set<CognitiveModule>();

  if (!q) return ['knowledge', 'reasoning'];

  // MEMORY: anything about the user
  const memoryTriggers = ['i ', 'my ', 'me ', 'mine', 'myself', 'remember', 'recall', 'forget', 'saved', 'earlier', 'before', 'ago', 'previously', 'yesterday', 'last time', 'we talked', 'you said', 'who am i', 'do you know me', 'about me'];
  for (const w of memoryTriggers) {
    if (q.includes(w)) { modules.add('memory'); break; }
  }

  // CONTEXT: short, vague, or referring to prior things
  if (q.length < 35) modules.add('context');
  const contextTriggers = ['this', 'that', 'these', 'those', 'it', 'they', 'them', 'here', 'there', 'the same', 'the other', 'the previous', 'continue', 'go on', 'anyway', 'therefore', 'thus', 'moreover', 'furthermore', 'what about', 'how about', 'and ', 'but ', 'so ', 'then '];
  for (const w of contextTriggers) {
    if (q.includes(w)) { modules.add('context'); break; }
  }
  if (/^\s*(yes|no|maybe|sure|ok|okay|fine|right|exactly|correct|why|how|what|when|where|who|which)\s*$/i.test(q)) modules.add('context');
  if (q.split(/\s+/).filter(Boolean).length <= 4) modules.add('context');

  // KNOWLEDGE: factual / informational
  const whWords = ['what', 'who', 'when', 'where', 'why', 'which', 'whose', 'whom', 'how'];
  const hasWh = whWords.some(w => q.includes(w));
  if (q.endsWith('?') && hasWh) modules.add('knowledge');
  const knowledgeTriggers = ['explain', 'define', 'meaning', 'definition', 'history', 'information', 'facts', 'tell me about', 'describe', 'overview', 'summary', 'science', 'physics', 'math', 'biology', 'chemistry', 'geography', 'technology', 'programming', 'world', 'universe', 'planet', 'galaxy', 'country', 'language', 'culture'];
  for (const w of knowledgeTriggers) {
    if (q.includes(w)) { modules.add('knowledge'); break; }
  }

  // REASONING: analysis, logic, problem-solving
  const reasoningTriggers = ['think', 'analyze', 'analyse', 'compare', 'comparison', 'difference', 'different', 'versus', 'vs', 'better', 'best', 'worse', 'worst', 'should', 'recommend', 'suggest', 'advice', 'opinion', 'evaluate', 'assess', 'judge', 'solve', 'solution', 'calculate', 'compute', 'equation', 'formula', 'proof', 'prove', 'logic', 'logical', 'reason', 'infer', 'deduce', 'conclude', 'conclusion', 'strategy', 'plan', 'approach', 'method', 'optimize', 'improve', 'fix', 'debug', 'because', 'therefore', 'thus', 'hence', 'since', 'implies', 'leads to', 'results in'];
  for (const w of reasoningTriggers) {
    if (q.includes(w)) { modules.add('reasoning'); break; }
  }

  // Fallback: always return at least 2
  if (modules.size === 0) {
    modules.add('knowledge');
    modules.add('reasoning');
  } else if (modules.size === 1) {
    if (modules.has('memory')) modules.add('context');
    else if (modules.has('context')) modules.add('memory');
    else if (modules.has('knowledge')) modules.add('reasoning');
    else if (modules.has('reasoning')) modules.add('knowledge');
  }

  return Array.from(modules);
}

export const useCoreStore = create<CoreState>((set) => ({
  activeModules: [],
  signalPhase: 'idle',
  lastQuery: '',

  triggerModules: (query: string) => {
    const modules = analyzeQuery(query);
    console.log('[MOTU Core] Query:', query, '-> Modules:', modules);
    set({ activeModules: modules, lastQuery: query, signalPhase: 'activating' });
  },

  setPhase: (signalPhase: SignalPhase) => set({ signalPhase }),

  reset: () => set({ activeModules: [], signalPhase: 'idle', lastQuery: '' }),
}));    