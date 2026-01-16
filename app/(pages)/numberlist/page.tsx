'use client';

import { useState } from 'react';
import Link from 'next/link';
// 분리한 인터페이스 불러오기
import { NumberListGroup } from '@/types'; 

export default function NumberListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState<NumberListGroup[]>([
    { id: 'T2026-001', title: '강남지점 샘플 스캔', count: 20, date: '2026-01-16' },
    { id: 'T2026-002', title: '서초센터 정기 검수', count: 0, date: '2026-01-16' },
  ]);

  // 새로운 리스트 추가 처리
  const handleAddList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = formData.get('testId') as string;
    const title = formData.get('testTitle') as string;

    const newList: NumberListGroup = {
      id,
      title,
      count: 0,
      date: new Date().toISOString().split('T')[0],
    };

    setGroups([newList, ...groups]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="text-gray-400 font-bold hover:text-black transition-colors">← HOME</Link>
          <h1 className="text-xl font-black italic tracking-tighter">SIMTRACK</h1>
        </header>

        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">번호 목록</h2>
          <p className="text-gray-400 text-sm font-bold">총 {groups.length}개의 작업이 등록됨</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all mb-8"
        >
          + 새 번호 목록 만들기
        </button>

        {/* 목록 리스트 */}
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div className="flex-1">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase mb-2 inline-block">
                  {group.id}
                </span>
                <h3 className="font-bold text-lg leading-tight">{group.title}</h3>
                <p className="text-xs text-gray-400 mt-1 font-bold">{group.date}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-mono font-black mb-1">{group.count}</p>
                <Link 
                  href={`/dashboard?id=${group.id}`} 
                  className="text-[11px] font-black bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  데이터 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 새 목록 생성 모달(팝업) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
            <h3 className="text-2xl font-black mb-6">새 작업 등록</h3>
            <form onSubmit={handleAddList} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">시험번호 (ID)</label>
                <input 
                  name="testId" 
                  required 
                  placeholder="예: TEST-001" 
                  className="w-full bg-gray-100 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">작업 명칭 (Title)</label>
                <input 
                  name="testTitle" 
                  required 
                  placeholder="예: 강남지점 1차 검수" 
                  className="w-full bg-gray-100 border-none rounded-2xl p-4 mt-1 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-gray-400 hover:text-black transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}