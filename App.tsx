import React, { useState } from 'react';
import InputForm from './components/InputForm';
import SelfieUpload from './components/SelfieUpload';
import SelfieResult from './components/SelfieResult';
import { generateCoupletText } from './services/apiService';
import { generateCoupletImage } from './services/jimengService';
import { CoupletData, GenerationStatus } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hunchun-api.abelzhou3399.workers.dev';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [coupletData, setCoupletData] = useState<CoupletData | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 自拍相关状态
  const [showSelfieUpload, setShowSelfieUpload] = useState(false);
  const [selfieResult, setSelfieResult] = useState<any>(null);
  const [currentRecipient, setCurrentRecipient] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string>('');

  const handleGenerateText = async (recipient: string, theme: string) => {
    setStatus(GenerationStatus.LOADING_TEXT);
    setErrorMsg(null);
    setCoupletData(null);
    setGeneratedImageUrl(null);
    setSelfieResult(null);

    // 保存当前的主题信息，用于自拍生成
    setCurrentRecipient(recipient);
    setCurrentTheme(theme);

    try {
      const data = await generateCoupletText(recipient, theme);
      setCoupletData(data);
      setStatus(GenerationStatus.SUCCESS_TEXT);
    } catch (error) {
      console.error(error);
      setErrorMsg("生成对联文字失败，请重试。");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleGenerateImage = async () => {
    if (!coupletData) return;

    setStatus(GenerationStatus.LOADING_IMAGE);
    setErrorMsg(null);

    try {
      const imageUrl = await generateCoupletImage(coupletData);
      setGeneratedImageUrl(imageUrl);
      setStatus(GenerationStatus.SUCCESS_IMAGE);
    } catch (error) {
      console.error(error);
      setErrorMsg("生成图片失败，请重试。");
      setStatus(GenerationStatus.SUCCESS_TEXT);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `对联-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyText = () => {
    if (coupletData) {
      const text = `上联：${coupletData.upper}\n下联：${coupletData.lower}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('对联文字已复制到剪贴板！');
      });
    }
  };

  // 自拍生成处理
  const handleGenerateSelfie = async (imageUrl: string) => {
    if (!coupletData) return;

    setShowSelfieUpload(false);
    setStatus(GenerationStatus.LOADING_IMAGE);
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-selfie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          couplet: coupletData, // 直接传递前端已生成的对联数据
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成失败');
      }

      const result = await response.json();
      setSelfieResult(result);
      setStatus(GenerationStatus.SUCCESS_IMAGE);
    } catch (error) {
      console.error(error);
      setErrorMsg('生成手持对联照片失败，请重试。');
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleDownloadSelfie = () => {
    if (selfieResult?.resultImageUrl) {
      const link = document.createElement('a');
      link.href = selfieResult.resultImageUrl;
      link.download = `手持对联-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRegenerateSelfie = () => {
    setSelfieResult(null);
    setShowSelfieUpload(true);
  };

  return (
    <div className="min-h-screen bg-red-800 text-gray-900 font-sans pb-12 relative overflow-hidden">

      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
           style={{
             backgroundImage: 'radial-gradient(circle at 50% 50%, #fbbf24 1px, transparent 1px)',
             backgroundSize: '30px 30px'
           }}
      ></div>

      <header className="relative z-10 pt-12 pb-8 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-amber-400 drop-shadow-md mb-2 font-serif tracking-tighter">
          珲 春
        </h1>
        <p className="text-red-200 text-lg md:text-xl font-light tracking-widest">
          春节对联生成器
        </p>
      </header>

      <main className="relative z-10 container mx-auto px-4 flex flex-col items-center">

        {/* 错误消息 */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-sm animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* 输入表单 */}
        <div className="w-full mb-8">
          <InputForm
            onGenerate={handleGenerateText}
            isLoading={status === GenerationStatus.LOADING_TEXT}
          />
        </div>

        {/* 结果区域 */}
        {coupletData && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 纯文字展示对联 */}
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center space-y-3">
                {/* 上联和下联 */}
                <div className="flex justify-center items-center gap-8 text-xl text-gray-800">
                  <div className="text-red-700 font-bold">{coupletData.upper}</div>
                  <div className="text-red-500">|</div>
                  <div className="text-red-700 font-bold">{coupletData.lower}</div>
                </div>
              </div>

              {/* 一键复制按钮 */}
              <button
                onClick={handleCopyText}
                className="w-full mt-3 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors text-sm"
              >
                复制文字
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* 生成对联图片按钮 */}
              <button
                onClick={handleGenerateImage}
                disabled={status === GenerationStatus.LOADING_IMAGE}
                className={`
                  px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform
                  ${status === GenerationStatus.LOADING_IMAGE
                    ? 'bg-amber-200 text-amber-800 cursor-wait'
                    : 'bg-amber-400 text-red-900 hover:bg-amber-300 hover:scale-105 ring-4 ring-amber-400/30'
                  }
                `}
              >
                 {status === GenerationStatus.LOADING_IMAGE ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     正在生成图片...
                   </span>
                 ) : (
                   '生成对联图片'
                 )}
              </button>

              {/* 对联自拍按钮 */}
              <button
                onClick={() => setShowSelfieUpload(true)}
                disabled={status === GenerationStatus.LOADING_IMAGE}
                className={`
                  px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform
                  ${status === GenerationStatus.LOADING_IMAGE
                    ? 'bg-gray-300 text-gray-600 cursor-wait'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500 hover:scale-105 ring-4 ring-pink-400/30'
                  }
                `}
              >
                📸 对联自拍
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 自拍上传模态框 */}
      {showSelfieUpload && coupletData && (
        <SelfieUpload
          couplet={coupletData}
          recipient={currentRecipient}
          theme={currentTheme}
          onGenerate={handleGenerateSelfie}
          isGenerating={status === GenerationStatus.LOADING_IMAGE}
          onCancel={() => setShowSelfieUpload(false)}
        />
      )}

      {/* 自拍结果模态框 */}
      {selfieResult && coupletData && (
        <SelfieResult
          resultImageUrl={selfieResult.resultImageUrl}
          couplet={coupletData}
          recipient={currentRecipient}
          theme={currentTheme}
          onDownload={handleDownloadSelfie}
          onRegenerate={handleRegenerateSelfie}
          onClose={() => setSelfieResult(null)}
        />
      )}

      {/* 对联图片预览 */}
      {generatedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">✅ 图片生成成功</h3>
              <button
                onClick={() => setGeneratedImageUrl(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* 缩略图预览 */}
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              <img
                src={generatedImageUrl}
                alt="生成的对联"
                className="w-full h-auto object-contain max-h-64"
              />
            </div>

            <p className="text-sm text-gray-600 mb-3 text-center">预览缩略图，满意后下载高清原图</p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载图片
              </button>
              <button
                onClick={() => setGeneratedImageUrl(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
