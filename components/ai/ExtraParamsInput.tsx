'use client';

interface ExtraParamsInputProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

export function ExtraParamsInput({
  value,
  onChange,
}: ExtraParamsInputProps) {
  const entries = Object.entries(value);

  const handleAdd = () => {
    onChange({
      ...value,
      [`param_${Date.now()}`]: '',
    });
  };

  const handleRemove = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (newKey === oldKey) return;
    const newValue = { ...value };
    delete newValue[oldKey];
    newValue[newKey] = value[oldKey as string];
    onChange(newValue);
  };

  const handleValueChange = (key: string, newValue: unknown) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        额外参数 (高级)
      </label>
      <div className="rounded-lg border border-gray-300">
        {entries.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">
            无额外参数
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 text-left">Key</th>
                <th className="px-3 py-2 text-left">Value</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, val]) => (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleKeyChange(key, e.target.value)}
                      className="w-full rounded border-gray-300 border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={String(val)}
                      onChange={(e) =>
                        handleValueChange(key, e.target.value)
                      }
                      className="w-full rounded border-gray-300 border px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(key)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="删除参数"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
      >
        + 添加参数
      </button>
    </div>
  );
}
