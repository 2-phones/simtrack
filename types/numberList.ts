export interface NumberListGroup {
  id: string;        // 시험번호 (Unique Key)
  title: string;     // 작업 명칭
  count: number;     // 스캔된 수량
  date: string;      // 등록 날짜
  description?: string; // (선택) 상세 설명
}