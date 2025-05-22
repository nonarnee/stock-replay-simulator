import React, { useState, useEffect, useCallback, useMemo } from 'react';

import styled from '@emotion/styled';
import { subHours, format } from 'date-fns';
import { Link } from 'react-router';

import SVGRenderer from '../../components/chart/svg/SVGRenderer';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { apiClient } from '../../services/api';

import type { OHLCData } from '../../types/chart';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const Header = styled.header`
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1rem;
  color: #4a90e2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 500px;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
`;

const ControlPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #357ab8;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const InfoPanel = styled.div`
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const InfoValue = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SpeedLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const SpeedValue = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  width: 2rem;
  text-align: center;
`;

const Slider = styled.input`
  width: 150px;
`;

export default function SVGVisualizerPage() {
  // 상태 관리
  const [chartData, setChartData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  // 차트 데이터 로드
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        // 6시간 전부터 현재까지의 데이터 요청
        const startDate = subHours(new Date(), 6);
        const endDate = new Date();

        const response = await apiClient.getChartDataByTimeRange(
          startDate.getTime(),
          endDate.getTime(),
          'minute'
        );

        if (isMounted && response.success && response.data.length > 0) {
          setChartData(response.data);

          // 시작 및 종료 시간 설정
          setStartTime(response.data[0].timestamp);
          setEndTime(response.data[response.data.length - 1].timestamp);

          // 초기 현재 시간을 시작 시간으로 설정
          setCurrentTime(response.data[0].timestamp);
        } else if (isMounted) {
          setError('데이터를 로드하는 중 오류가 발생했습니다.');
        }
      } catch (err) {
        if (isMounted) {
          setError('데이터를 요청하는 중 예상치 못한 오류가 발생했습니다.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 애니메이션 업데이트 콜백
  const animationCallback = useCallback(() => {
    // 현재 시간 업데이트
    setCurrentTime(prevTime => {
      // 이미 종료 시간에 도달한 경우 재생 중지
      if (prevTime >= endTime) {
        setIsPlaying(false);
        return endTime;
      }

      // 타임스탬프 간격 (5분 = 300000ms)
      const interval = 300000;
      return Math.min(prevTime + interval, endTime);
    });
  }, [endTime, setIsPlaying]);

  // 애니메이션 프레임 설정
  const animationOptions = useMemo(
    () => ({
      enabled: isPlaying,
      fpsLimit: 30,
      speed: speed,
    }),
    [isPlaying, speed]
  );

  // 애니메이션 프레임 활용
  const { fps } = useAnimationFrame(animationCallback, animationOptions);

  // 재생/일시정지 토글
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setCurrentTime(startTime);
    setIsPlaying(false);
  }, [startTime]);

  // 속도 변경 핸들러
  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(e.target.value));
  }, []);

  // 차트 렌더링 옵션
  const chartOptions = useMemo(
    () => ({
      currentTimestamp: currentTime,
      isAnimating: isPlaying,
    }),
    [currentTime, isPlaying]
  );

  return (
    <PageContainer>
      <Header>
        <Title>SVG 기반 차트 시각화</Title>
        <BackLink to="/visualizer">← 뒤로 가기</BackLink>
      </Header>

      {error && <div style={{ color: 'red', margin: '1rem 0' }}>{error}</div>}

      <ChartContainer>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            로딩 중...
          </div>
        ) : (
          <SVGRenderer width={1000} height={500} data={chartData} options={chartOptions} />
        )}
      </ChartContainer>

      <ControlPanel>
        <ControlGroup>
          <Button onClick={handlePlayPause} disabled={loading || chartData.length === 0}>
            {isPlaying ? '일시정지' : '재생'}
          </Button>
          <Button onClick={handleReset} disabled={loading || chartData.length === 0}>
            초기화
          </Button>
        </ControlGroup>

        <SpeedControl>
          <SpeedLabel>속도:</SpeedLabel>
          <Slider
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={speed}
            onChange={handleSpeedChange}
            disabled={loading}
          />
          <SpeedValue>{speed}x</SpeedValue>
        </SpeedControl>
      </ControlPanel>

      <InfoPanel>
        <InfoItem>
          <InfoLabel>현재 시간</InfoLabel>
          <InfoValue>{format(new Date(currentTime), 'yyyy-MM-dd HH:mm')}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>FPS</InfoLabel>
          <InfoValue>{fps}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>데이터 포인트</InfoLabel>
          <InfoValue>{chartData.length}</InfoValue>
        </InfoItem>
      </InfoPanel>
    </PageContainer>
  );
}
