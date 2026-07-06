import { useEffect, useState } from 'react';
import { getModels } from '../services/api';

interface ModelSelectorProps {
  selected: string;
  onSelect: (model: string) => void;
}

export default function ModelSelector({ selected, onSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    getModels().then(setModels).catch(() => setModels([]));
  }, []);

  return (
    <select
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
      className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5
                 focus:outline-none focus:border-emerald-500/50"
    >
      {models.map((model) => (
        <option key={model} value={model}>{model}</option>
      ))}
      {models.length === 0 && <option value={selected}>{selected}</option>}
    </select>
  );
}
