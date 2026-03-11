'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ModelInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultModels?: string[];
  placeholder?: string;
}

export function ModelInput({
  value,
  onChange,
  defaultModels,
  placeholder = 'gpt-4o',
}: ModelInputProps) {
  return (
    <div className="space-y-2">
      <Input
        id="model"
        type="text"
        label="模型名称 *"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {defaultModels && defaultModels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">常用模型:</span>
          {defaultModels.map((model) => (
            <Button
              key={model}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange(model)}
            >
              {model}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
