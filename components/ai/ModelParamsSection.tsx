'use client';

import type { ApiFormat, ModelParams } from '@/lib/api/ai-configs';
import { useState } from 'react';
import { ExtraParamsInput } from './ExtraParamsInput';

interface ModelParamsSectionProps {
  apiFormat: ApiFormat;
  params?: ModelParams;
  extraParams?: Record<string, unknown>;
  onChange: (params: ModelParams | undefined, extraParams: Record<string, unknown>) => void;
}

export function ModelParamsSection({
  apiFormat,
  params = {},
  extraParams = {},
  onChange,
}: ModelParamsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const handleParamChange = <K extends keyof ModelParams>(
    key: K,
    value: ModelParams[K],
  ) => {
    const newParams = { ...params };
    if (value === undefined) {
      delete newParams[key];
    } else {
      newParams[key] = value;
    }
    onChange(
      Object.keys(newParams).length > 0 ? newParams : undefined,
      extraParams,
    );
  };

  const handleExtraParamsChange = (value: Record<string, unknown>) => {
    onChange(params, value);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>模型参数</span>
        <span
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
              Temperature
            </label>
            <div className="flex items-center gap-4">
              <input
                id="temperature"
                type="range"
                min={apiFormat === 'anthropic' ? 0 : 0}
                max={apiFormat === 'anthropic' ? 1 : 2}
                step={0.1}
                value={params.temperature ?? (apiFormat === 'anthropic' ? 0.7 : 0.7)}
                onChange={(e) =>
                  handleParamChange('temperature', Number.parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">
                {params.temperature?.toFixed(1) ?? '0.7'}
              </span>
            </div>
            <p className="text-xs text-gray-500">控制输出的随机性</p>
          </div>

          <div>
            <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700">
              Max Tokens
            </label>
            <input
              id="maxTokens"
              type="number"
              min={1}
              value={params.maxTokens ?? ''}
              onChange={(e) =>
                handleParamChange(
                  'maxTokens',
                  e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                )
              }
              className="block w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2"
              placeholder="无限制"
            />
            <p className="text-xs text-gray-500">
              最大输出 token 数{apiFormat === 'anthropic' ? '，最大 4096' : ''}
            </p>
          </div>

          <div>
            <label htmlFor="topP" className="block text-sm font-medium text-gray-700">
              Top P
            </label>
            <div className="flex items-center gap-4">
              <input
                id="topP"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={params.topP ?? 1}
                onChange={(e) =>
                  handleParamChange('topP', Number.parseFloat(e.target.value))
                }
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12">
                {params.topP?.toFixed(1) ?? '1.0'}
              </span>
            </div>
            <p className="text-xs text-gray-500">核采样概率</p>
          </div>

          {apiFormat === 'openai' && (
            <>
              <div>
                <label
                  htmlFor="frequencyPenalty"
                  className="block text-sm font-medium text-gray-700"
                >
                  Frequency Penalty
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="frequencyPenalty"
                    type="range"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={params.frequencyPenalty ?? 0}
                    onChange={(e) =>
                      handleParamChange(
                        'frequencyPenalty',
                        Number.parseFloat(e.target.value),
                      )
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {params.frequencyPenalty?.toFixed(1) ?? '0.0'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">减少重复内容的惩罚</p>
              </div>

              <div>
                <label
                  htmlFor="presencePenalty"
                  className="block text-sm font-medium text-gray-700"
                >
                  Presence Penalty
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="presencePenalty"
                    type="range"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={params.presencePenalty ?? 0}
                    onChange={(e) =>
                      handleParamChange(
                        'presencePenalty',
                        Number.parseFloat(e.target.value),
                      )
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {params.presencePenalty?.toFixed(1) ?? '0.0'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">鼓励新话题的惩罚</p>
              </div>
            </>
          )}

          <ExtraParamsInput
            value={extraParams}
            onChange={handleExtraParamsChange}
          />
        </div>
      )}
    </div>
  );
}
