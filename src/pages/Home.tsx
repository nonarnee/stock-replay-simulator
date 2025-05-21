import styled from '@emotion/styled';
import { Link } from 'react-router';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const FeatureItem = styled.li`
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid #4a90e2;
  border-radius: 4px;
  width: 100%;
  max-width: 600px;
  text-align: left;
`;

const StartButton = styled(Link)`
  display: inline-block;
  background-color: #4a90e2;
  color: white;
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
  margin-top: 2rem;

  &:hover {
    background-color: #357ab8;
  }
`;

export default function Home() {
  return (
    <HomeContainer>
      <Title>주식 차트 리플레이 시뮬레이터</Title>
      <Description>
        다양한 렌더링 방식(SVG, Canvas, WebGL)으로 구현된 주식 차트 데이터를
        <br />
        시간에 따라 리플레이하는 웹 애플리케이션입니다.
        <br />각 렌더링 방식의 성능과 특징을 비교해볼 수 있습니다.
      </Description>

      <FeatureList>
        <FeatureItem>📊 SVG, Canvas, WebGL로 구현된 다양한 차트 시각화 방식</FeatureItem>
        <FeatureItem>⏱️ 타임라인을 통한 과거 데이터 리플레이 기능</FeatureItem>
        <FeatureItem>🔍 차트 확대/축소 및 이동 기능</FeatureItem>
        <FeatureItem>📈 OHLC(시가, 고가, 저가, 종가) 캔들스틱 차트 지원</FeatureItem>
        <FeatureItem>⚡ 렌더링 성능 측정 및 비교 기능</FeatureItem>
      </FeatureList>

      <StartButton to="/visualizer">시각화 방식 선택하기</StartButton>
    </HomeContainer>
  );
}
