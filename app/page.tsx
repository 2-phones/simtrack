import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-3xl font-bold mb-2">SIMTRACK</h1>
      <p className="text-gray-500 mb-8">시험번호 및 USIM 관리 시스템</p>

      <div className="grid gap-4 w-full max-w-xs">
        <Link 
          href="/scan" 
          className="bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          새 USIM 스캔하기
        </Link>
          <Link href="/numberlist" className="border border-gray-300 py-4 rounded-xl font-bold hover:bg-gray-50 transition">
    시험번호 목록 보기
</Link>

      </div>
    </main>
  );
}