
import React, { useState, useEffect, useCallback } from 'react';
import { AgeGroup, DinoGroup, ImageType, ArtStyle, AspectRatio, DinoImage } from './types';
import { generateDinoImage, generateDinoInfo, playDinoAudio } from './services/geminiService';

const App: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(AgeGroup.THREE_FOUR);
  const [selectedGroup, setSelectedGroup] = useState<DinoGroup>(DinoGroup.HERBIVORE);
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.COLOR_ILLUSTRATION);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.CUTE);
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>(AspectRatio.SQUARE);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<DinoImage[]>([]);
  const [currentImage, setCurrentImage] = useState<DinoImage | null>(null);

  const aspectLabels: Record<AspectRatio, string> = {
    [AspectRatio.A4_PORTRAIT]: 'A4 dọc',
    [AspectRatio.A4_LANDSCAPE]: 'A4 ngang',
    [AspectRatio.SQUARE]: '1:1 (Vuông)',
    [AspectRatio.MOBILE]: '9:16 (Dọc)',
    [AspectRatio.WIDESCREEN]: '16:9 (Ngang)',
    [AspectRatio.LANDSCAPE_43]: '4:3 (Ngang)'
  };

  const handleCreate = async () => {
    setIsGenerating(true);
    try {
      const imageUrl = await generateDinoImage(selectedAge, selectedGroup, selectedType, selectedStyle, selectedAspect);
      const info = await generateDinoInfo(selectedGroup, selectedAge);
      
      const newImage: DinoImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        type: selectedType,
        group: selectedGroup,
        age: selectedAge,
        prompt: `Khủng long ${selectedGroup}`,
        question: info.question,
        timestamp: Date.now()
      };

      setGallery(prev => [newImage, ...prev]);
      setCurrentImage(newImage);
      
      // Auto-play name if possible
      playDinoAudio(info.name);

    } catch (error) {
      console.error("Error creating dino image:", error);
      alert("Oops! Có lỗi một chút, hãy thử lại nhé bé!");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printImage = (url: string) => {
    const win = window.open("");
    if (win) {
      win.document.write(`<img src="${url}" onload="window.print();window.close()" style="width:100%"/>`);
      win.document.close();
    }
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="bg-green-500 text-white py-6 px-4 shadow-lg text-center rounded-b-3xl mb-8">
        <h1 className="text-3xl md:text-5xl font-bold flex items-center justify-center gap-3">
          🦖 BÉ KHÁM PHÁ THẾ GIỚI KHỦNG LONG
        </h1>
        <p className="mt-2 text-lg opacity-90">Khám phá, tô màu và học cùng bạn khủng long</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Selection Area */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-green-200">
            <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <span>🎨</span> Tùy chọn học liệu
            </h2>

            {/* Age */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Độ tuổi</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(AgeGroup).map(age => (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age)}
                    className={`px-4 py-2 rounded-xl text-left transition-all ${
                      selectedAge === age ? 'bg-green-500 text-white scale-105 shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Group */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Nhóm khủng long</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(DinoGroup).map(group => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`px-4 py-2 rounded-xl text-left text-sm transition-all ${
                      selectedGroup === group ? 'bg-orange-400 text-white scale-105 shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Loại hình ảnh</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ImageType)}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {Object.values(ImageType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Phong cách tranh</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ArtStyle).map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedStyle === style ? 'bg-purple-500 text-white scale-105 shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Kích thước</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(AspectRatio).map(val => (
                  <button
                    key={val}
                    onClick={() => setSelectedAspect(val)}
                    className={`px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedAspect === val ? 'bg-blue-500 text-white scale-105 shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {aspectLabels[val]}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCreate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl text-xl font-bold text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tạo...
                </>
              ) : (
                <>✨ TẠO ẢNH NGAY ✨</>
              )}
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Current Image View */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-t-4 border-orange-200">
            {currentImage ? (
              <div className="space-y-6">
                <div className="relative group rounded-2xl overflow-hidden shadow-inner bg-gray-50 flex items-center justify-center min-h-[400px]">
                  <img 
                    src={currentImage.url} 
                    alt="Khủng long AI" 
                    className="max-h-[600px] w-auto object-contain transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => downloadImage(currentImage.url, `khung-long-${currentImage.id}.png`)}
                      className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-green-600 transition-colors"
                      title="Tải về"
                    >
                      📥
                    </button>
                    <button 
                      onClick={() => printImage(currentImage.url)}
                      className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-blue-600 transition-colors"
                      title="In tranh"
                    >
                      🖨️
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 relative">
                  <span className="absolute -top-4 -left-2 text-4xl">💡</span>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">Gợi ý cho ba mẹ & cô:</h3>
                  <p className="text-lg text-yellow-900 italic">"{currentImage.question}"</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-yellow-600 border border-yellow-200"># {currentImage.age}</span>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-yellow-600 border border-yellow-200"># {currentImage.group}</span>
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-yellow-600 border border-yellow-200"># {currentImage.type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 space-y-4">
                <div className="text-8xl animate-bounce">🦕</div>
                <p className="text-xl font-medium">Bé hãy chọn thông số và nhấn "Tạo ảnh" để bắt đầu nhé!</p>
              </div>
            )}
          </div>

          {/* Gallery History */}
          {gallery.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-700 px-2 flex items-center gap-2">
                <span>📚</span> Bộ sưu tập của bé
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map(img => (
                  <div 
                    key={img.id} 
                    onClick={() => setCurrentImage(img)}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all hover:shadow-lg ${
                      currentImage?.id === img.id ? 'border-green-500 scale-105' : 'border-white hover:border-green-200'
                    }`}
                  >
                    <img src={img.url} alt="Dino" className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-16 text-center text-gray-600 px-4 py-8 bg-green-50/50 rounded-t-[3rem]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg">
            <span className="font-bold text-green-700">GV: Nguyễn Phương</span>
            <span className="hidden md:inline">|</span>
            <a 
              href="https://www.facebook.com/groups/nhomtinhocsangtao?locale=vi_VN" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Nhóm Facebook Tin học sáng tạo
            </a>
          </div>
          <p className="text-sm opacity-75">© 2026 Ứng dụng Giáo dục Mầm non Việt Nam</p>
          <p className="text-xs italic">Hình ảnh được tạo bởi AI với các đặc điểm sinh học khủng long được mô phỏng phù hợp giáo dục trẻ em.</p>
        </div>
      </footer>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-9xl mb-6 animate-pulse">🥚</div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">Trứng đang nở...</h2>
          <p className="text-xl text-gray-600">Bạn Khủng Long đang chuẩn bị ra mắt bé đấy!</p>
          <div className="mt-8 flex gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce delay-200"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
