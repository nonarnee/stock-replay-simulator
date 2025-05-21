import React, { useRef, useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { format } from 'date-fns';

import type { OHLCData } from '@/types/chart';
import type { ChartRenderer, SVGRenderOptions } from '@/types/renderer';

const SVGContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const StyledSVG = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  max-width: 200px;
`;

/**
 * SVG 렌더러 Props
 */
interface SVGRendererProps {
  width: number;
  height: number;
  data: OHLCData[];
  options?: Partial<SVGRenderOptions>;
  className?: string;
}

/**
 * SVGRenderer 컴포넌트
 */
const SVGRenderer: React.FC<SVGRendererProps> & ChartRenderer = ({
  width,
  height,
  data,
  options = {},
  className,
}) => {
  // 컨테이너 및 SVG 참조
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 차트 영역 계산을 위한 상태
  const [chartArea, setChartArea] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // 옵션 기본값 설정
  const defaultOptions: SVGRenderOptions = {
    width,
    height,
    margin: { top: 20, right: 50, bottom: 30, left: 60 },
    candleWidth: 6,
    candleGap: 2,
    upColor: '#26a69a',
    downColor: '#ef5350',
    showGrid: true,
    gridColor: 'rgba(0, 0, 0, 0.1)',
    showXAxis: true,
    showYAxis: true,
    currentTimestamp: data.length > 0 ? data[data.length - 1].timestamp : Date.now(),
    isAnimating: false,
    svgClassName: 'chart-svg',
    useSVGAnimation: true,
  };

  // 옵션 병합
  const mergedOptions: SVGRenderOptions = { ...defaultOptions, ...options };

  // 마우스 오버 핸들러
  const handleMouseOver = (e: React.MouseEvent, dataPoint: OHLCData) => {
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current;
      tooltip.style.opacity = '1';
      tooltip.style.left = `${e.nativeEvent.offsetX + 10}px`;
      tooltip.style.top = `${e.nativeEvent.offsetY + 10}px`;

      // 날짜 포맷
      const date = new Date(dataPoint.timestamp);
      const formattedDate = format(date, 'yyyy-MM-dd HH:mm');

      // 툴크 내용 설정
      tooltip.innerHTML = `
        <div><strong>시간:</strong> ${formattedDate}</div>
        <div><strong>시가:</strong> ${dataPoint.open.toFixed(2)}</div>
        <div><strong>고가:</strong> ${dataPoint.high.toFixed(2)}</div>
        <div><strong>저가:</strong> ${dataPoint.low.toFixed(2)}</div>
        <div><strong>종가:</strong> ${dataPoint.close.toFixed(2)}</div>
        ${dataPoint.volume ? `<div><strong>거래량:</strong> ${dataPoint.volume.toLocaleString()}</div>` : ''}
      `;
    }
  };

  // 마우스 아웃 핸들러
  const handleMouseOut = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  };

  // 차트 영역 계산
  useEffect(() => {
    const { margin } = mergedOptions;
    setChartArea({
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
      offsetX: margin.left,
      offsetY: margin.top,
    });
  }, [width, height, mergedOptions]);

  // 스케일 계산 함수
  const calculateScales = () => {
    if (!data || data.length === 0) return null;

    // 데이터 범위 계산
    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const paddedMinPrice = minPrice - priceRange * 0.05;
    const paddedMaxPrice = maxPrice + priceRange * 0.05;

    // Y축 스케일 계산 (가격)
    const yScale = (price: number) => {
      return (
        chartArea.height -
        ((price - paddedMinPrice) / (paddedMaxPrice - paddedMinPrice)) * chartArea.height
      );
    };

    // X축 스케일 계산 (시간)
    const totalWidth = data.length * (mergedOptions.candleWidth + mergedOptions.candleGap);
    const xScale = (index: number) => {
      return index * (mergedOptions.candleWidth + mergedOptions.candleGap);
    };

    return {
      xScale,
      yScale,
      minPrice: paddedMinPrice,
      maxPrice: paddedMaxPrice,
      totalWidth,
    };
  };

  // 그리드 라인 생성
  const renderGridLines = (scales: ReturnType<typeof calculateScales>) => {
    if (!scales) return null;
    const { minPrice, maxPrice, yScale } = scales;

    // 가격 눈금 계산 (5개 정도의 수평선)
    const priceStep = (maxPrice - minPrice) / 5;
    const gridPrices = Array.from({ length: 6 }, (_, i) => minPrice + priceStep * i);

    return (
      <g className="grid-lines">
        {/* 수평 그리드 라인 */}
        {mergedOptions.showGrid &&
          gridPrices.map((price, i) => (
            <line
              key={`h-grid-${i}`}
              x1={0}
              y1={yScale(price) + chartArea.offsetY}
              x2={chartArea.width}
              y2={yScale(price) + chartArea.offsetY}
              stroke={mergedOptions.gridColor}
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          ))}

        {/* Y축 레이블 */}
        {mergedOptions.showYAxis &&
          gridPrices.map((price, i) => (
            <text
              key={`y-label-${i}`}
              x={chartArea.offsetX - 10}
              y={yScale(price) + chartArea.offsetY + 4}
              textAnchor="end"
              fontSize="10"
              fill="#666"
            >
              {price.toFixed(2)}
            </text>
          ))}
      </g>
    );
  };

  // X축 레이블 생성
  const renderXAxisLabels = (scales: ReturnType<typeof calculateScales>) => {
    if (!scales || !data || data.length === 0) return null;
    const { xScale } = scales;

    // 적절한 간격으로 레이블 표시 (겹치지 않게)
    const labelInterval = Math.max(1, Math.floor(data.length / 10));
    const xLabels = data.filter((_, i) => i % labelInterval === 0);

    return (
      <g className="x-axis-labels">
        {mergedOptions.showXAxis &&
          xLabels.map((d, i) => {
            const index = data.findIndex(item => item.timestamp === d.timestamp);
            return (
              <text
                key={`x-label-${i}`}
                x={xScale(index) + chartArea.offsetX + mergedOptions.candleWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
                transform={`rotate(-45, ${
                  xScale(index) + chartArea.offsetX + mergedOptions.candleWidth / 2
                }, ${height - 10})`}
              >
                {format(new Date(d.timestamp), 'HH:mm')}
              </text>
            );
          })}
      </g>
    );
  };

  // 캔들 차트 렌더링
  const renderCandles = (scales: ReturnType<typeof calculateScales>) => {
    if (!scales || !data || data.length === 0) return null;
    const { xScale, yScale } = scales;

    return (
      <g className="candles" transform={`translate(${chartArea.offsetX}, 0)`}>
        {data.map((d, i) => {
          const isUp = d.close >= d.open;
          const color = isUp ? mergedOptions.upColor : mergedOptions.downColor;
          const x = xScale(i);
          const candleTop = yScale(Math.max(d.open, d.close)) + chartArea.offsetY;
          const candleBottom = yScale(Math.min(d.open, d.close)) + chartArea.offsetY;
          const candleHeight = Math.max(1, candleBottom - candleTop);

          // 현재 타임스탬프보다 미래의 데이터인 경우 표시하지 않음
          if (d.timestamp > mergedOptions.currentTimestamp && mergedOptions.isAnimating) {
            return null;
          }

          // 애니메이션 적용 (현재 타임스탬프와 가까울수록 투명도 감소)
          let opacity = 1;
          if (mergedOptions.isAnimating && mergedOptions.useSVGAnimation) {
            const timeDistance = mergedOptions.currentTimestamp - d.timestamp;
            if (timeDistance < 60000) {
              // 1분 이내의 데이터는 페이드인 효과
              opacity = Math.max(0.3, 1 - timeDistance / 60000);
            }
          }

          return (
            <g
              key={`candle-${i}`}
              opacity={opacity}
              onMouseOver={e => handleMouseOver(e, d)}
              onMouseOut={handleMouseOut}
            >
              {/* 고가-저가 라인 (심지) */}
              <line
                x1={x + mergedOptions.candleWidth / 2}
                y1={yScale(d.high) + chartArea.offsetY}
                x2={x + mergedOptions.candleWidth / 2}
                y2={yScale(d.low) + chartArea.offsetY}
                stroke={color}
                strokeWidth="1"
              />

              {/* 캔들 몸통 */}
              <rect
                x={x}
                y={candleTop}
                width={mergedOptions.candleWidth}
                height={candleHeight}
                fill={color}
                stroke={color}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </g>
    );
  };

  // 현재 가격 표시
  const renderCurrentPrice = (scales: ReturnType<typeof calculateScales>) => {
    if (!scales || !data || data.length === 0) return null;
    const { yScale } = scales;

    const currentData = data.filter(d => d.timestamp <= mergedOptions.currentTimestamp);
    if (currentData.length === 0) return null;

    const lastPrice = currentData[currentData.length - 1].close;
    const y = yScale(lastPrice) + chartArea.offsetY;

    return (
      <g className="current-price">
        {/* 현재 가격 라인 */}
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#ff9800"
          strokeWidth="1"
          strokeDasharray="3,2"
        />

        {/* 현재 가격 레이블 */}
        <rect x={width - 60} y={y - 10} width={50} height={20} fill="#ff9800" rx="2" />
        <text
          x={width - 35}
          y={y + 4}
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="bold"
        >
          {lastPrice.toFixed(2)}
        </text>
      </g>
    );
  };

  return (
    <SVGContainer ref={containerRef} className={className}>
      <StyledSVG ref={svgRef} width={width} height={height} className={mergedOptions.svgClassName}>
        {calculateScales() && (
          <>
            {renderGridLines(calculateScales())}
            {renderCandles(calculateScales())}
            {renderXAxisLabels(calculateScales())}
            {renderCurrentPrice(calculateScales())}
          </>
        )}
      </StyledSVG>
      <Tooltip ref={tooltipRef} />
    </SVGContainer>
  );
};

// ChartRenderer 인터페이스 구현
SVGRenderer.init = (container: HTMLElement): void => {
  // SVG 렌더러는 React 컴포넌트로 초기화는 React에서 자동으로 처리
  console.log('SVG Renderer initialized with container', container);
};

SVGRenderer.render = (data: OHLCData[], _options: SVGRenderOptions): void => {
  // React 컴포넌트로 렌더링은 React에서 처리
  console.log('Rendering SVG with data length:', data.length);
};

SVGRenderer.clear = (): void => {
  // 컴포넌트 리렌더링으로 처리
  console.log('Clearing SVG renderer');
};

SVGRenderer.resize = (width: number, height: number): void => {
  // 컴포넌트 리렌더링으로 처리
  console.log(`Resizing SVG renderer to ${width}x${height}`);
};

SVGRenderer.destroy = (): void => {
  // React 컴포넌트 언마운트로 처리
  console.log('Destroying SVG renderer');
};

export default SVGRenderer;
