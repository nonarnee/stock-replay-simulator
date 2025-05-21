import styled from '@emotion/styled';
import { Link } from 'react-router';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  background-color: #4a90e2;
  padding: 1.5rem;
  color: white;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  color: #444;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  color: #4a90e2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export default function VisualizerIndex() {
  return (
    <Container>
      <BackLink to="/">← 홈으로 돌아가기</BackLink>
      <Title>차트 시각화 방식 선택</Title>

      <CardContainer>
        <Card to="/visualizer/svg">
          <CardHeader>
            <CardTitle>SVG 렌더러</CardTitle>
          </CardHeader>
          <CardBody>
            <CardDescription>
              SVG(Scalable Vector Graphics)를 사용한 차트 렌더링 방식입니다. 선명한 벡터 그래픽과
              DOM 기반의 이벤트 처리가 특징이며, 복잡한 시각화를 구현하기에 적합합니다.
            </CardDescription>
          </CardBody>
          <CardFooter>특징: 벡터 그래픽, DOM 이벤트, 인터랙티브, CSS 스타일링</CardFooter>
        </Card>

        <Card to="/visualizer/canvas">
          <CardHeader style={{ backgroundColor: '#e2574a' }}>
            <CardTitle>Canvas 렌더러</CardTitle>
          </CardHeader>
          <CardBody>
            <CardDescription>
              HTML5 Canvas 기반의 차트 렌더링 방식입니다. 픽셀 기반 렌더링으로 많은 데이터를
              효율적으로 처리할 수 있으며, 애니메이션 성능이 우수합니다.
            </CardDescription>
          </CardBody>
          <CardFooter>특징: 픽셀 기반, 고성능, 메모리 효율적, 애니메이션 친화적</CardFooter>
        </Card>

        <Card to="/visualizer/webgl">
          <CardHeader style={{ backgroundColor: '#27ae60' }}>
            <CardTitle>WebGL 렌더러</CardTitle>
          </CardHeader>
          <CardBody>
            <CardDescription>
              WebGL을 사용한 차트 렌더링 방식입니다. GPU 가속을 통해 대량의 데이터를 실시간으로
              처리할 수 있으며, 가장 뛰어난 성능을 제공합니다.
            </CardDescription>
          </CardBody>
          <CardFooter>특징: GPU 가속, 3D 그래픽 지원, 최고 성능, 복잡한 구현</CardFooter>
        </Card>
      </CardContainer>
    </Container>
  );
}
