import { NextResponse } from 'next/server';

// 데이터 저장용 배열
let scanHistory: { code: string; time: string }[] = [];

export async function GET() {
  return NextResponse.json(scanHistory);
}

export async function POST(request: Request) {
  const { code } = await request.json();
  
  // 띄어쓰기 파싱 로직 (6자 5자 9자)
  let formattedCode = code;
  if (code.length === 20) {
    const part1 = code.substring(0, 6);
    const part2 = code.substring(6, 11);
    const part3 = code.substring(11);
    formattedCode = `${part1} ${part2} ${part3}`;
  }

  const newScan = { 
    code: formattedCode, 
    time: new Intl.DateTimeFormat('ko-KR', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).format(new Date()) 
  };
  
  scanHistory = [newScan, ...scanHistory].slice(0, 100);
  return NextResponse.json({ success: true });
}

// 삭제 로직
export async function DELETE(request: Request) {
  const { codes } = await request.json().catch(() => ({ codes: null }));

  if (codes && Array.isArray(codes)) {
    // 선택 삭제: 요청받은 코드들을 제외한 나머지만 남김
    scanHistory = scanHistory.filter(item => !codes.includes(item.code));
    return NextResponse.json({ success: true, message: "선택 삭제 완료" });
  } else {
    // 전체 삭제: 기존처럼 배열 비우기
    scanHistory = [];
    return NextResponse.json({ success: true, message: "전체 삭제 완료" });
  }
}
