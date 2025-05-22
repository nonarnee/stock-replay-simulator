import { useState, useRef, useEffect } from 'react';

import styled from '@emotion/styled';
import { Link } from 'react-router';

import CanvasRenderer from '@/components/chart/canvas/CanvasRenderer';
import { MockApiClient } from '@/services/api';

import type { OHLCData } from '@/types/chart';

// 스타일 컴포넌트
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const BackLink = styled(Link)`
  color: #1976d2;
  text-decoration: none;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  height: 60px;
`;

const PlayButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: #1976d2;
  }

  &:disabled {
    background-color: #bbdefb;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #666;
`;

/**
 * Canvas 기반 시각화 페이지
 */
export default function CanvasVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stockData, setStockData] = useState<OHLCData[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [chartSize, setChartSize] = useState({ width: 800, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 차트 컨테이너 크기 변경 감지
  useEffect(() => {
    function updateChartSize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        setChartSize({ width, height });
      }
    }

    window.addEventListener('resize', updateChartSize);
    updateChartSize();

    return () => {
      window.removeEventListener('resize', updateChartSize);
    };
  }, []);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      console.log('Canvas 페이지: 데이터 로드 시작');

      // 현재 시간 기준 과거 1시간의 데이터
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000);

      try {
        const apiClient = MockApiClient.getInstance();
        const response = await apiClient.getChartDataByTimeRange(
          startTime.getTime(),
          endTime.getTime(),
          'minute'
        );

        if (response.success && response.data.length > 0) {
          console.log('Canvas 페이지: 데이터 로드 성공', response.data.length);
          setStockData(response.data);
          setCurrentTimestamp(response.data[0].timestamp);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    }

    loadData();
  }, []);

  // 재생/정지 토글
  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <PageContainer>
      <Header>
        <Title>Canvas 차트 시각화</Title>
        <BackLink to="/visualizer">← 시각화 방식 선택으로 돌아가기</BackLink>
      </Header>

      <ChartContainer ref={containerRef}>
        {stockData.length > 0 ? (
          <CanvasRenderer
            width={chartSize.width}
            height={chartSize.height}
            data={stockData}
            options={{
              currentTimestamp,
              isAnimating: isPlaying,
            }}
          />
        ) : (
          <Message>데이터를 로드하는 중입니다...</Message>
        )}
      </ChartContainer>

      <ControlsContainer>
        <PlayButton onClick={togglePlayPause}>{isPlaying ? '일시정지' : '재생'}</PlayButton>
      </ControlsContainer>
    </PageContainer>
  );
}
