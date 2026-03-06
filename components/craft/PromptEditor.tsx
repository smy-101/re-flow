'use client';

import { useState } from 'react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AVAILABLE_VARIABLES = [
  { name: 'title', label: '文章标题', description: 'RSS 文章标题' },
  { name: 'content', label: '文章内容', description: 'RSS 文章内容（HTML）' },
  { name: 'author', label: '作者', description: '文章作者' },
  { name: 'link', label: '原文链接', description: '文章原始链接' },
  { name: 'publishedAt', label: '发布时间', description: '文章发布时间' },
  { name: 'readingTime', label: '阅读时长', description: '预计阅读时长（分钟）' },
  { name: 'feedTitle', label: '订阅源名称', description: 'RSS 订阅源名称' },
  { name: 'feedUrl', label: '订阅源地址', description: 'RSS 订阅源地址' },
  { name: 'prev_output', label: '上一步输出', description: '管道中上一步的输出（仅管道可用）' },
];

export default function PromptEditor({
  value,
  onChange,
  placeholder = '输入 Prompt 模板，使用 {{variable}} 插入变量...',
}: PromptEditorProps) {
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const insertVariable = (variable: string) => {
    const before = value.substring(0, cursorPosition);
    const after = value.substring(cursorPosition);
    const newText = `${before}{{${variable}}}${after}`;
    onChange(newText);
    setShowVariableMenu(false);

    // Set cursor after inserted variable
    setTimeout(() => {
      const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
      if (textarea) {
        const newCursorPos = cursorPosition + variable.length + 4; // +4 for {{}}
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="relative">
      <label htmlFor="prompt-textarea" className="block text-sm font-medium text-gray-700 mb-2">
        Prompt 模板
      </label>
      <div className="relative">
        <textarea
          id="prompt-textarea"
          value={value}
          onChange={handleInputChange}
          onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
          placeholder={placeholder}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-y"
          required
        />
        <button
          type="button"
          onClick={() => setShowVariableMenu(!showVariableMenu)}
          className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          {showVariableMenu ? '收起变量' : '插入变量'}
        </button>
      </div>

      {showVariableMenu && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 mb-2 px-2">点击变量插入到 Prompt：</p>
            {AVAILABLE_VARIABLES.map((variable) => (
              <button
                key={variable.name}
                type="button"
                onClick={() => insertVariable(variable.name)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-blue-600">
                    {`{${variable.name}}`}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-600">
                    {variable.label}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {variable.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <p>可用变量：</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {AVAILABLE_VARIABLES.map((variable) => (
            <button
              key={variable.name}
              type="button"
              onClick={() => insertVariable(variable.name)}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-mono"
            >
              {`{${variable.name}}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
