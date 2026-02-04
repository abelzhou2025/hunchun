import React from 'react';
import { CoupletData } from '../types';

interface SelfieResultProps {
  resultImageUrl: string;
  couplet: CoupletData;
  recipient: string;
  theme: string;
  onDownload: () => void;
  onRegenerate: () => void;
  onClose: () => void;
}

const SelfieResult: React.FC<SelfieResultProps> = ({
  resultImageUrl,
  couplet,
  recipient,
  theme,
  onDownload,
  onRegenerate,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">✅ 生成成功！</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 生成的图片 */}
        <div className="mb-6">
          <img
            src={resultImageUrl}
            alt="手持对联照片"
            className="w-full h-auto rounded-lg border-2 border-gray-200"
          />
        </div>

        {/* 对联文字 */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 text-center">📜 对联内容</h3>
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 text-lg font-bold">
              <div className="text-yellow-300">{couplet.upper}</div>
              <div className="text-yellow-500">|</div>
              <div className="text-yellow-300">{couplet.lower}</div>
            </div>
            <div className="text-yellow-400 mt-2">{couplet.horizontal}</div>
          </div>
          <div className="mt-3 text-sm text-red-100 text-center">
            赠送对象: {recipient} | 主题: {theme}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDownload}
            className="flex-1 bg-red-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-red-500 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            保存图片
          </button>
          <button
            onClick={onRegenerate}
            className="flex-1 bg-amber-500 text-white px-6 py-4 rounded-lg font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重新生成
          </button>
        </div>

        {/* 提示 */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p>💡 提示：您可以保存图片分享到朋友圈，发送给亲朋好友拜年！</p>
        </div>
      </div>
    </div>
  );
};

export default SelfieResult;
