'use client';

import { useState } from 'react';
import UsimScanner from '@/components/usimScanner';

export default function ScanPage() {
  const [lastScanned, setLastScanned] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);

  const handleScanSuccess = async (code: string) => {
    setIsPaused(true); // 스캔 성공 시 일시 정지
    setLastScanned(code); 

    await fetch('/api/barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  };

  const handleNextScan = () => {
    setLastScanned(''); // 이전 텍스트 비우기
    setIsPaused(false); // 스캐너 다시 활성화
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <header className="w-full max-w-md mb-6">
        <h1 className="text-2xl font-black text-gray-900 border-b-2 border-gray-100 pb-2">
          USIM 스캐너
        </h1>
      </header>
      
      <div className="w-full max-w-md space-y-4">
        <UsimScanner 
          onScanSuccess={handleScanSuccess} 
          isPaused={isPaused} 
          onReset={handleNextScan} 
        />
        
        {/* 스캔 완료 시 나타나는 안내 및 버튼 영역 */}
        <div className={`p-6 rounded-2xl border transition-all ${isPaused ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-gray-500 text-xs font-bold mb-2 uppercase text-center">
            {isPaused ? "스캔 완료!" : "바코드를 대주세요"}
          </p>
          
          <p className="text-xl font-mono font-bold text-center text-blue-700 break-all mb-4">
            {lastScanned || "대기 중..."}
          </p>

          {isPaused && (
            <button 
              onClick={handleNextScan}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
            >
              다음 바코드 찍기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}