'use client';

import type { PresetProvider } from '@/lib/api/ai-configs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

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
      <label htmlFor="provider" className="block text-sm font-medium text-foreground">
        供应商 *
      </label>
      <Select value={providerId || ''} onValueChange={onChange}>
        <SelectTrigger id="provider">
          <SelectValue placeholder="选择供应商" />
        </SelectTrigger>
        <SelectContent>
        {presets.map((provider) => (
          <SelectItem key={provider.id} value={provider.id}>
            {provider.name}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
    </div>
  );
}
