'use client';

import { useState, useCallback } from 'react';
import UsimScanner from '@/components/usimScanner';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // 공통 클라이언트 불러오기

export default function ScanPage() {
  // --- 상태 관리 ---
  const [lastScanned, setLastScanned] = useState<string>(''); // 마지막으로 스캔된 바코드 값
  const [isPaused, setIsPaused] = useState(false);             // 스캐너 일시정지 여부 (중복 스캔 방지)
  const [hasStarted, setHasStarted] = useState(false);       // 스캔 시작 버튼 클릭 여부
  const [errorMsg, setErrorMsg] = useState<string>('');       // 화면에 표시할 에러 메시지

  /**
   * 바코드 인식 성공 시 실행되는 콜백 함수
   */
  const handleScanSuccess = useCallback(async (code: string) => {
    // 1. 중복 실행 및 보안 컨텍스트 오류 방지
    if (isPaused) return;
    
    setIsPaused(true); // 스캔 성공 즉시 스캐너를 멈춤
    const scannedCode = code.trim();

    // 2. 유효성 검사 (Validation)
    let currentError = "";
    if (scannedCode.length !== 20) {
      currentError = `오류: 20자리가 아닙니다 (현재 ${scannedCode.length}자)`;
    } else if (!/^[a-zA-Z0-9]+$/.test(scannedCode)) {
      currentError = "오류: 영어와 숫자만 포함되어야 합니다.";
    }

    // 검증 실패 시 에러 표시 후 종료
    if (currentError) {
      setErrorMsg(currentError);
      setLastScanned(scannedCode);
      return;
    }

    // 3. 정상 데이터 처리
    setErrorMsg('');
    setLastScanned(scannedCode); 

    try {
      /**
       * Supabase의 'barcodes' 테이블에 데이터를 삽입합니다.
       * ngrok을 통해 HTTPS로 접속해야 이 로직까지 안전하게 도달합니다.
       */
      const { error } = await supabase
        .from('barcodes') 
        .insert([{ code: scannedCode }]);

      if (error) throw error; // 에러 발생 시 catch 블록으로 이동

    } catch (err: any) {
      console.error("Supabase Error:", err.message);
      setErrorMsg("데이터 저장 중 오류가 발생했습니다.");
    }
  }, [isPaused]);

  /**
   * '다음 스캔' 또는 '시작' 버튼 클릭 시 상태 초기화
   */
  const handleNextScan = () => {
    setLastScanned(''); 
    setErrorMsg('');
    setIsPaused(false); // 스캐너 다시 활성화
    setHasStarted(true); // 시작 화면 숨김
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center">
      {/* 헤더 영역 */}
      <header className="w-full max-w-md flex justify-between items-center my-4 border-b-2 pb-2">
        <Link href="/" className="text-gray-400 font-bold hover:text-black transition-colors flex items-center gap-1">
          <span className="text-xl leading-none">←</span> BACK
        </Link>
        <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">
          Usim Validator
        </h1>
      </header>
      
      <div className="w-full max-w-md space-y-4">
        {/* 스캐너 화면 컨테이너 */}
        <div className="relative overflow-hidden rounded-2xl bg-black aspect-video">
          <UsimScanner isPaused={isPaused} onScanSuccess={handleScanSuccess} />
          
          {/* 시작 전 덮개 화면 (Secure Context 안내 등) */}
          {!hasStarted && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-10">
              <button 
                onClick={handleNextScan}
                className="bg-black text-white px-10 py-4 rounded-2xl font-black shadow-2xl active:scale-95 transition-all"
              >
                스캐너 활성화
              </button>
              <p className="mt-4 text-[10px] text-gray-400">HTTPS 연결이 필요합니다</p>
            </div>
          )}
        </div>
        
        {/* 상태 표시 및 결과창 */}
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

          {/* 버튼 제어 */}
          {hasStarted && (
            <button 
              onClick={handleNextScan}
              disabled={!isPaused} // 스캔 중일 때는 버튼 비활성화
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