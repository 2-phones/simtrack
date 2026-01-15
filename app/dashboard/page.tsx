'use client';

import { useEffect, useState } from 'react';

// 데이터 인터페이스 정의 (코드 내용과 스캔 시간)
interface ScanItem {
  code: string;
  time: string;
}

export default function Dashboard() {
  // --- [상태 관리] ---
  const [list, setList] = useState<ScanItem[]>([]);           // 서버에서 가져온 전체 스캔 목록
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]); // 사용자가 체크박스로 선택한 코드들
  const [copyStatus, setCopyStatus] = useState('전체 복사하기');    // 복사 버튼의 텍스트 상태

  // --- [데이터 통신] ---
  // 1. API로부터 최신 스캔 데이터를 가져오는 함수
  const fetchScans = async () => {
    try {
      const res = await fetch('/api/barcode');
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  };

  // 2. 실시간 업데이트 설정 (2초 간격으로 폴링)
  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchScans, 2000); 
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  // --- [주요 기능 로직] ---

  // 3. 클립보드 전체 복사 기능
  const copyAllToClipboard = async () => {
    if (list.length === 0) return alert("복사할 데이터가 없습니다.");
    
    // 가독성을 위해 넣었던 띄어쓰기(\s)를 제거하고 순수 번호만 추출하여 줄바꿈으로 연결
    const allCodes = list.map(item => item.code.replace(/\s/g, '')).join('\n');

    try {
      await navigator.clipboard.writeText(allCodes);
      setCopyStatus('✅ 복사 완료!');
      setTimeout(() => setCopyStatus('전체 복사하기'), 2000); // 2초 후 텍스트 복구
    } catch (err) {
      alert("복사 실패");
    }
  };

  // 4. 데이터 삭제 기능 (전체 삭제 또는 선택된 항목 삭제)
  const deleteData = async (type: 'all' | 'selected') => {
    const codesToDelete = type === 'selected' ? selectedCodes : null;
    const msg = type === 'selected' ? `${selectedCodes.length}개를 삭제하시겠습니까?` : "전체 삭제하시겠습니까?";

    if (confirm(msg)) {
      try {
        await fetch('/api/barcode', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codes: codesToDelete }), // 삭제할 코드 배열을 JSON으로 전송
        });
        setSelectedCodes([]); // 삭제 후 선택 상태 초기화
        fetchScans();         // 목록 새로고침
      } catch (err) {
        alert("삭제 실패");
      }
    }
  };

  // 5. CSV(엑셀) 다운로드 기능
  const downloadCSV = () => {
    if (list.length === 0) return alert("다운로드할 데이터가 없습니다.");
    const headers = "스캔 시간,USIM 번호\n";
    const csvContent = list.map(item => `${item.time},${item.code}`).join("\n");
    // UTF-8 BOM(\ufeff)을 추가하여 엑셀에서 한글 깨짐 방지
    const blob = new Blob(["\ufeff" + headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `USIM_목록_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  // 6. 개별 항목 선택/해제 토글 함수
  const toggleSelect = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="min-h-screen bg-white p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 영역: 대시보드 제목 및 액션 버튼들 */}
        <header className="flex justify-between items-end mb-10 border-b-4 border-black pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Usim Dashboard</h1>
            <p className="text-gray-500 font-bold mt-2">
              수신 수량: <span className="text-blue-600 font-black">{list.length}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* [선택 삭제] 버튼: 항목이 하나라도 선택되었을 때만 표시됨 */}
            {selectedCodes.length > 0 && (
              <button onClick={() => deleteData('selected')} className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold active:scale-95 shadow-md">
                선택 삭제 ({selectedCodes.length})
              </button>
            )}
            <button onClick={() => deleteData('all')} className="bg-red-50 text-red-600 px-5 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-all">
              전체 삭제
            </button>
            <button onClick={copyAllToClipboard} className={`px-5 py-3 rounded-xl font-bold transition-all ${
                copyStatus === '✅ 복사 완료!' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
              {copyStatus}
            </button>
            <button onClick={downloadCSV} className="bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
              CSV 다운로드
            </button>
          </div>
        </header>

        {/* 리스트 영역: 스캔 데이터 반복 출력 */}
        <div className="grid gap-3">
          {list.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 font-bold">
              스캔된 데이터가 없습니다.
            </div>
          ) : (
            list.map((item, index) => (
              <div 
                key={index} 
                onClick={() => toggleSelect(item.code)} // 항목 클릭 시 선택 토글
                className={`flex items-center p-6 bg-white rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedCodes.includes(item.code) ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 shadow-sm hover:border-gray-300'
                }`}
              >
                {/* 커스텀 체크박스 UI */}
                <div className={`w-6 h-6 rounded-full border-2 mr-6 flex items-center justify-center transition-colors ${
                  selectedCodes.includes(item.code) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedCodes.includes(item.code) && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">Serial Number</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">{item.code}</p>
                </div>
                <div className="text-right text-sm font-bold text-gray-400">{item.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}