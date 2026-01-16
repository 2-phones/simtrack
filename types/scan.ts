export interface ScanItem {
  testId: string;    // 소속된 시험번호 ID
  code: string;      // 바코드 번호
  time: string;      // 스캔 시각
}

export interface ScanResponse {
  success: boolean;
  message?: string;
}