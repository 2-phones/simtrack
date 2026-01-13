'use client';

import { useEffect, useState } from 'react';

interface ScanItem {
  code: string;
  time: string;
}

export default function Dashboard() {
  const [list, setList] = useState<ScanItem[]>([]);

  // 2초마다 새로운 데이터가 있는지 확인 (Polling)
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch('/api/barcode');
        const data = await res.json();
        setList(data);
      } catch (err) {
        console.error("데이터 로드 실패", err);
      }
    };

    fetchScans(); // 초기 로드
    const interval = setInterval(fetchScans, 2000); // 2초 간격
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-black text-blue-600">SIMTRACK DASHBOARD</h1>
          <div className="text-right">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></span>
            <span className="text-gray-600 font-medium">실시간 수신 중</span>
          </div>
        </header>

        <div className="grid gap-4">
          {list.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">모바일에서 바코드를 스캔하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            list.map((item, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-5 bg-white rounded-xl shadow-sm border-l-8 ${index === 0 ? 'border-blue-500 animate-bounce-subtle' : 'border-gray-200'}`}
              >
                <div>
                  <p className="text-xs text-gray-400 mb-1">USIM SERIAL NUMBER</p>
                  <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider">{item.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-500">{item.time}</p>
                  {index === 0 && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">NEW</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}