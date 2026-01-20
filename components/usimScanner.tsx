'use client';

import { useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface UsimScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isPaused: boolean;
}

export default function UsimScanner({ onScanSuccess, isPaused }: UsimScannerProps) {

  useEffect(() => {
    const config = {
      fps: 20,
      qrbox: { width: 280, height: 120 },
      aspectRatio: 1.77, // 16:9 비율 유지 (스마트폰 카메라 최적)
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // 브라우저 자체 바코드 감지기 사용 (매우 빠름)
      },
      formatsToSupport: [ 
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.EAN_13
      ],
      videoConstraints: {
        facingMode: { exact: "environment" },
        width: { min: 1280, ideal: 1920 },
        height: { min: 720, ideal: 1080 }
      }
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);

    scanner.render(
      (decodedText) => {
        // 부모의 isPaused 상태를 체크하여 실행
        if (!isPaused) {
        onScanSuccess(decodedText);
          if (navigator.vibrate) navigator.vibrate(100);
        }
      },
      (error) => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess, isPaused]); // isPaused가 변경될 때마다 효과 재설정

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-md">
      <div id="reader" className="w-full" />
    </div>
  );
}