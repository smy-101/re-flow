'use client';

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
      <label htmlFor="model" className="block text-sm font-medium text-gray-700">
        模型名称 *
      </label>
      <div className="space-y-2">
        <input
          id="model"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
        />
        {defaultModels && defaultModels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">常用模型:</span>
            {defaultModels.map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => onChange(model)}
                className="text-xs rounded bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200"
              >
                {model}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
