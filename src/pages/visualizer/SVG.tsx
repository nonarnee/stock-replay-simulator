import React, { useState, useEffect } from 'react';

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

const SVGVisualizerPage: React.FC = () => {
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

        if (response.success && response.data.length > 0) {
          setChartData(response.data);

          // 시작 및 종료 시간 설정
          setStartTime(response.data[0].timestamp);
          setEndTime(response.data[response.data.length - 1].timestamp);

          // 초기 현재 시간을 시작 시간으로 설정
          setCurrentTime(response.data[0].timestamp);
        } else {
          setError('데이터를 로드하는 중 오류가 발생했습니다.');
        }
      } catch (err) {
        setError('데이터를 요청하는 중 예상치 못한 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 애니메이션 프레임 활용
  const { fps } = useAnimationFrame(
    _timestamp => {
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
    },
    {
      enabled: isPlaying,
      fpsLimit: 30,
      speed: speed,
    }
  );

  // 재생 컨트롤
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // 리셋 컨트롤
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(startTime);
  };

  // 속도 조절
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
  };

  // 현재 데이터 필터링 (현재 시간까지의 데이터만 표시)
  const filteredData = chartData.filter(d => d.timestamp <= currentTime);

  // 현재 날짜 및 시간 포맷팅
  const formattedDate = currentTime ? format(new Date(currentTime), 'yyyy-MM-dd') : '';
  const formattedTime = currentTime ? format(new Date(currentTime), 'HH:mm:ss') : '';

  // 진행률 계산
  const progress =
    currentTime && startTime && endTime
      ? Math.round(((currentTime - startTime) / (endTime - startTime)) * 100)
      : 0;

  return (
    <PageContainer>
      <Header>
        <BackLink to="/visualizer">← 시각화 방식 선택으로 돌아가기</BackLink>
        <Title>SVG 차트 시각화</Title>
      </Header>

      {loading ? (
        <div>데이터를 로드하는 중...</div>
      ) : error ? (
        <div>오류: {error}</div>
      ) : (
        <>
          <InfoPanel>
            <InfoItem>
              <InfoLabel>날짜</InfoLabel>
              <InfoValue>{formattedDate}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>시간</InfoLabel>
              <InfoValue>{formattedTime}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>데이터 포인트</InfoLabel>
              <InfoValue>
                {filteredData.length} / {chartData.length}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>진행률</InfoLabel>
              <InfoValue>{progress}%</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>FPS</InfoLabel>
              <InfoValue>{fps}</InfoValue>
            </InfoItem>
          </InfoPanel>

          <ChartContainer>
            <SVGRenderer
              width={1150}
              height={500}
              data={chartData}
              options={{
                currentTimestamp: currentTime,
                isAnimating: isPlaying,
                useSVGAnimation: true,
              }}
            />
          </ChartContainer>

          <ControlPanel>
            <ControlGroup>
              <Button onClick={handlePlayPause}>{isPlaying ? '일시정지' : '재생'}</Button>
              <Button onClick={handleReset} disabled={currentTime === startTime}>
                처음으로
              </Button>
            </ControlGroup>

            <SpeedControl>
              <SpeedLabel>속도:</SpeedLabel>
              <Slider
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={handleSpeedChange}
              />
              <SpeedValue>{speed.toFixed(1)}x</SpeedValue>
            </SpeedControl>
          </ControlPanel>
        </>
      )}
    </PageContainer>
  );
};

export default SVGVisualizerPage;
