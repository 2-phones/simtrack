'use client';

import { useState, useCallback } from 'react';
import UsimScanner from '@/components/usimScanner';

export default function ScanPage() {
  const [lastScanned, setLastScanned] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false); // 처음부터 스캔 가능하도록 false
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleScanSuccess = useCallback(async (code: string) => {
    // 1. 중복 실행 방지 (이미 일시정지 중이면 즉시 리턴)
    if (isPaused) return;
    
    // 2. 즉시 스캔 중단 처리
    setIsPaused(true);
    const scannedCode = code.trim();

    // 3. 검증 로직 (반드시 서버 전송 전에 체크)
    let currentError = "";

    // [검증 A] 글자 수 체크 (정확히 20자리)
    if (scannedCode.length !== 20) {
      currentError = `오류: 20자리가 아닙니다 (현재 ${scannedCode.length}자)`;
    } 
    // [검증 B] 영어/숫자 외 문자 포함 체크
    else if (!/^[a-zA-Z0-9]+$/.test(scannedCode)) {
      currentError = "오류: 영어와 숫자만 포함되어야 합니다.";
    }

    if (currentError) {
      setErrorMsg(currentError);
      setLastScanned(scannedCode);
      return; // 에러가 있으면 여기서 종료 (서버 전송 안 함)
    }

    // 4. 모든 검증 통과 시 서버 전송
    setErrorMsg('');
    setLastScanned(scannedCode); 

    try {
      await fetch('/api/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: scannedCode }),
      });
    } catch (err) {
      setErrorMsg("서버 전송 오류가 발생했습니다.");
    }
  }, [isPaused]);

  const handleNextScan = () => {
    setLastScanned(''); 
    setErrorMsg('');
    setIsPaused(false); // 다시 스캔 가능 상태로 해제
    setHasStarted(true);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center">
      <header className="w-full max-w-md my-4">
        <h1 className="text-xl font-black text-gray-900 border-b-2 pb-2 tracking-tighter uppercase">Usim Validator</h1>
      </header>
      
      <div className="w-full max-w-md space-y-4">
        <div className="relative overflow-hidden rounded-2xl">
          <UsimScanner isPaused={isPaused} onScanSuccess={handleScanSuccess} />
          {!hasStarted && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-10">
              <button 
                onClick={handleNextScan}
                className="bg-black text-white px-10 py-4 rounded-2xl font-black shadow-2xl active:scale-95 transition-all"
              >
                스캐너 활성화
              </button>
            </div>
          )}
        </div>
        
        <div className={`w-full rounded-2xl border-2 p-5 transition-all ${
          errorMsg ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="mb-4 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Scan Status</p>
            
            {errorMsg ? (
              <div className="py-2">
                <p className="text-red-600 font-black text-sm mb-1">{errorMsg}</p>
                <p className="text-xs font-mono text-red-400 bg-red-100 py-1 px-2 rounded inline-block">{lastScanned}</p>
              </div>
            ) : (
              <p className="text-xl font-mono font-black text-blue-600 break-all leading-tight">
                {lastScanned || (hasStarted ? "바코드를 스캔하세요" : "준비 중...")}
              </p>
            )}
          </div>

          {hasStarted && (
            <button 
              onClick={handleNextScan}
              disabled={!isPaused}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg ${
                isPaused 
                  ? errorMsg ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-wait'
              }`}
            >
              {isPaused ? (errorMsg ? "다시 시도하기" : "다음 스캔 진행") : "인식 대기 중..."}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}