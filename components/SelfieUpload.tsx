import React, { useState, useRef } from 'react';
import { CoupletData } from '../types';

interface SelfieUploadProps {
  couplet: CoupletData;
  recipient: string;
  theme: string;
  onGenerate: (imageUrl: string) => void;
  isGenerating: boolean;
  onCancel: () => void;
}

const SelfieUpload: React.FC<SelfieUploadProps> = ({
  couplet,
  recipient,
  theme,
  onGenerate,
  isGenerating,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('请选择 JPG 或 PNG 格式的图片');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setSelectedFile(file);

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!selectedFile) {
      alert('请先选择图片');
      return;
    }

    // 将图片转换为 Base64 并触发生成
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      onGenerate(base64Url);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📸 生成手持对联自拍</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 对联信息展示 */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2">📜 将要生成的对联</h3>
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

        {/* 上传区域 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              上传您的自拍照
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                disabled={isGenerating}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-gray-50 text-gray-800 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500"
              />
              <p className="text-xs text-gray-600 mt-1">支持 JPG/PNG 格式，最大 5MB</p>
            </div>
          </div>

          {/* 预览区域 */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="预览"
                className="w-full h-80 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm">
            <p className="font-bold mb-2">📸 拍照建议：</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>请上传有喜庆笑容的照片</strong>（AI 不会修改面部表情）</li>
              <li>正面或侧面半身照效果最佳</li>
              <li>光线明亮，面部清晰可见</li>
              <li><strong>背景可以随意</strong>，AI 会自动生成春节氛围背景</li>
            </ul>
            <p className="font-bold mt-3 mb-2">🎨 生成说明：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>AI 会在您手中添加<strong>两张对联</strong></li>
              <li><strong>面部保持原样</strong>，不会被修改</li>
              <li><strong>自动替换背景</strong>为春节喜庆场景（红灯笼、金色装饰等）</li>
              <li>生成时间约 10-30 秒</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile}
              className={`flex-1 py-4 rounded-lg font-bold text-lg shadow-lg transition-all
                ${isGenerating || !selectedFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600'
                }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在生成您的拜年大片...
                </span>
              ) : (
                '🧧 开始生成'
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isGenerating}
              className="px-6 py-4 rounded-lg font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfieUpload;
