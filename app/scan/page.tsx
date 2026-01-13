'use client';

import { useState } from 'react';
import UsimScanner from '@/components/usimScanner';

export default function ScanPage() {
  const [lastScanned, setLastScanned] = useState<string>('');
  const [isPaused, setIsPaused] = useState(true); // 처음엔 일시정지(대기) 상태로 시작
  const [hasStarted, setHasStarted] = useState(false); // 카메라 시작 여부

  const handleScanSuccess = async (code: string) => {
    if (isPaused) return;
    
    setIsPaused(true);
    setLastScanned(code); 

    await fetch('/api/barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  };

  const handleStartOrNext = () => {
    setLastScanned(''); 
    setIsPaused(false);
    setHasStarted(true); // 카메라 시작 상태로 변경
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center">
      <header className="w-full max-w-md my-4">
        <h1 className="text-xl font-black text-gray-900 border-b-2 pb-2">USIM 스캐너</h1>
      </header>
      
      <div className="w-full max-w-md space-y-4">
        {/* 스캐너 영역 */}
        <div className="relative">
          <UsimScanner isPaused={isPaused} onScanSuccess={handleScanSuccess} />
          
          {/* 초기 접속 시 카메라 권한 문구를 가리고 커스텀 버튼 배치 */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-gray-100 rounded-2xl flex flex-col items-center justify-center z-10 p-6 text-center">
              <p className="text-gray-600 mb-4 text-sm">카메라 권한을 허용해야 스캔이 가능합니다.</p>
              <button 
                onClick={handleStartOrNext}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
              >
                카메라 시작하기
              </button>
            </div>
          )}
        </div>
        
        {/* 하단 제어 및 정보창 */}
        <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="mb-4 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-tighter">최근 인식된 번호</p>
            <p className="text-lg font-mono font-black text-blue-600 break-all min-h-[1.5rem]">
              {lastScanned || (hasStarted ? "바코드를 찍어주세요" : "카메라를 먼저 켜주세요")}
            </p>
          </div>

          {hasStarted && (
            <button 
              onClick={handleStartOrNext}
              disabled={!isPaused}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 ${
                isPaused 
                  ? 'bg-blue-600 text-white shadow-lg animate-pulse' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPaused ? "다음 바코드 찍기" : "스캔 중..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}