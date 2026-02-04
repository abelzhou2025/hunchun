import React, { useState } from 'react';

interface InputFormProps {
  onGenerate: (recipient: string, theme: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [recipient, setRecipient] = useState('');
  const [theme, setTheme] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipient && theme) {
      onGenerate(recipient, theme);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-red-100">
      <div className="space-y-6">
        <div>
          <label htmlFor="recipient" className="block text-sm font-bold text-red-900 mb-2">
            赠送对象
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="例如：父母、老板、好友"
            className="w-full px-4 py-3 rounded-lg border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-red-50 text-gray-800 placeholder-red-300"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-bold text-red-900 mb-2">
            祝福主题
          </label>
          <input
            id="theme"
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="例如：身体健康、财源广进、升职加薪"
            className="w-full px-4 py-3 rounded-lg border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-red-50 text-gray-800 placeholder-red-300"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !recipient || !theme}
          className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transform transition-all duration-200
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 hover:-translate-y-1 hover:shadow-xl'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在思考...
            </span>
          ) : (
            '生成对联'
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
