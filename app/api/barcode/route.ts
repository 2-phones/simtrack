import { NextResponse } from 'next/server';

let scanHistory: { code: string; time: string }[] = [];

export async function POST(request: Request) {
  const { code } = await request.json();
  
  // [추가] 바코드 파싱 로직 (6자, 5자, 나머지)
  // 예: 0000001111122222222F -> 000000 11111 22222222F
  let formattedCode = code;
  if (code.length >= 11) {
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
  
  scanHistory = [newScan, ...scanHistory].slice(0, 50);
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(scanHistory);
}