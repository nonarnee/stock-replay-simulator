import { useRef, useEffect } from 'react';

import styled from '@emotion/styled';

import type { OHLCData } from '@/types/chart';

// 스타일
const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

// 인터페이스
interface CanvasRendererProps {
  width: number;
  height: number;
  data: OHLCData[];
  options?: {
    currentTimestamp?: number;
    isAnimating?: boolean;
  };
}

/**
 * 간단한 캔버스 렌더러 컴포넌트
 */
export default function CanvasRenderer({ width, height, data, options = {} }: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스 크기 설정
    canvas.width = width;
    canvas.height = height;

    // 컨텍스트 가져오기
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 간단한 메시지 표시
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('새로운 캔버스 렌더러가 구현 중입니다', width / 2, height / 2);
    ctx.fillText(`데이터 포인트: ${data.length}개`, width / 2, height / 2 + 20);

    if (options.currentTimestamp) {
      ctx.fillText(
        `현재 타임스탬프: ${new Date(options.currentTimestamp).toLocaleTimeString()}`,
        width / 2,
        height / 2 + 40
      );
    }
  }, [width, height, data, options]);

  return (
    <CanvasContainer>
      <StyledCanvas ref={canvasRef} />
    </CanvasContainer>
  );
}
