'use client';

import type { PresetProvider } from '@/lib/api/ai-configs';

interface ProviderSelectorProps {
  providerId: string;
  onChange: (providerId: string) => void;
  presets: PresetProvider[];
}

export function ProviderSelector({
  providerId,
  onChange,
  presets,
}: ProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
        供应商 *
      </label>
      <select
        id="provider"
        value={providerId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
      >
        {presets.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>
    </div>
  );
}
