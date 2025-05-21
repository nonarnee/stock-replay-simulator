// 다음 단계에서 구현 예정: mockData.ts

import { addMinutes, addDays, addHours } from 'date-fns';

import type { OHLCData } from '../types/chart';

/**
 * 특정 범위 내에서 임의의 숫자를 생성합니다.
 */
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * 상승 추세의 OHLC 데이터를 생성합니다.
 */
export const generateUptrendData = (
  startTime: Date,
  dataPoints: number,
  basePrice: number = 100,
  intervalMinutes: number = 5,
  volatility: number = 2
): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < dataPoints; i++) {
    // 전체적으로 상승 추세 (평균 0.5% 상승)
    const upBias = 0.5;
    currentPrice = currentPrice * (1 + (upBias + randomInRange(-volatility / 2, volatility)) / 100);

    const timestamp = addMinutes(startTime, i * intervalMinutes).getTime();
    const open = currentPrice;
    // 고가는 시가보다 0~3% 높음
    const high = open * (1 + randomInRange(0, 3) / 100);
    // 저가는 시가보다 0~2% 낮음
    const low = open * (1 - randomInRange(0, 2) / 100);
    // 종가는 고가와 저가 사이 (상승 추세이므로 고가에 가까운 값이 더 많음)
    const close = randomInRange(
      low + (high - low) * 0.4, // 저가보다 조금 높은 지점부터
      high // 고가까지
    );

    const volume = Math.round(randomInRange(1000, 10000));

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
};

/**
 * 하락 추세의 OHLC 데이터를 생성합니다.
 */
export const generateDowntrendData = (
  startTime: Date,
  dataPoints: number,
  basePrice: number = 100,
  intervalMinutes: number = 5,
  volatility: number = 2
): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < dataPoints; i++) {
    // 전체적으로 하락 추세 (평균 0.5% 하락)
    const downBias = 0.5;
    currentPrice =
      currentPrice * (1 - (downBias + randomInRange(-volatility / 2, volatility)) / 100);

    const timestamp = addMinutes(startTime, i * intervalMinutes).getTime();
    const open = currentPrice;
    // 고가는 시가보다 0~2% 높음
    const high = open * (1 + randomInRange(0, 2) / 100);
    // 저가는 시가보다 0~3% 낮음 (하락 추세이므로 더 많이 떨어질 수 있음)
    const low = open * (1 - randomInRange(0, 3) / 100);
    // 종가는 고가와 저가 사이 (하락 추세이므로 저가에 가까운 값이 더 많음)
    const close = randomInRange(
      low, // 저가부터
      low + (high - low) * 0.6 // 중간값보다 조금 아래까지
    );

    const volume = Math.round(randomInRange(1000, 10000));

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
};

/**
 * 횡보 추세의 OHLC 데이터를 생성합니다.
 */
export const generateSidewaysData = (
  startTime: Date,
  dataPoints: number,
  basePrice: number = 100,
  intervalMinutes: number = 5,
  volatility: number = 1.5
): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < dataPoints; i++) {
    // 횡보 추세 (상승/하락 확률 동일)
    currentPrice = currentPrice * (1 + randomInRange(-volatility, volatility) / 100);

    const timestamp = addMinutes(startTime, i * intervalMinutes).getTime();
    const open = currentPrice;
    // 고가는 시가보다 0~2% 높음
    const high = open * (1 + randomInRange(0, 2) / 100);
    // 저가는 시가보다 0~2% 낮음
    const low = open * (1 - randomInRange(0, 2) / 100);
    // 종가는 고가와 저가 사이 (랜덤)
    const close = randomInRange(low, high);

    const volume = Math.round(randomInRange(800, 8000));

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
};

/**
 * 여러 추세가 혼합된 OHLC 데이터를 생성합니다.
 */
export const generateMixedTrendData = (
  startTime: Date,
  dataPoints: number,
  basePrice: number = 100,
  intervalMinutes: number = 5
): OHLCData[] => {
  // 총 데이터를 세 부분으로 나눔 (상승, 하락, 횡보)
  const firstPartSize = Math.floor(dataPoints / 3);
  const secondPartSize = Math.floor(dataPoints / 3);
  const thirdPartSize = dataPoints - firstPartSize - secondPartSize;

  // 첫 번째 부분: 상승 추세
  const uptrendData = generateUptrendData(startTime, firstPartSize, basePrice, intervalMinutes);

  // 두 번째 부분: 하락 추세
  const downtrendStartTime = addMinutes(startTime, firstPartSize * intervalMinutes);
  const lastUptrendPrice = uptrendData[uptrendData.length - 1].close;
  const downtrendData = generateDowntrendData(
    downtrendStartTime,
    secondPartSize,
    lastUptrendPrice,
    intervalMinutes
  );

  // 세 번째 부분: 횡보 추세
  const sidewaysStartTime = addMinutes(downtrendStartTime, secondPartSize * intervalMinutes);
  const lastDowntrendPrice = downtrendData[downtrendData.length - 1].close;
  const sidewaysData = generateSidewaysData(
    sidewaysStartTime,
    thirdPartSize,
    lastDowntrendPrice,
    intervalMinutes
  );

  // 모든 데이터 합치기
  return [...uptrendData, ...downtrendData, ...sidewaysData];
};

/**
 * 지정된 일수만큼의 일봉 데이터를 생성합니다.
 */
export const generateDailyData = (
  startDate: Date,
  days: number,
  basePrice: number = 100,
  volatility: number = 2
): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < days; i++) {
    const timestamp = addDays(startDate, i).getTime();

    // 일별 변동
    currentPrice = currentPrice * (1 + randomInRange(-volatility, volatility) / 100);

    const open = currentPrice;
    const high = open * (1 + randomInRange(0, 3) / 100);
    const low = open * (1 - randomInRange(0, 3) / 100);
    const close = randomInRange(low, high);
    const volume = Math.round(randomInRange(10000, 100000));

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
};

/**
 * 지정된 시간만큼의 시간봉 데이터를 생성합니다.
 */
export const generateHourlyData = (
  startDate: Date,
  hours: number,
  basePrice: number = 100,
  volatility: number = 1.5
): OHLCData[] => {
  const data: OHLCData[] = [];
  let currentPrice = basePrice;

  for (let i = 0; i < hours; i++) {
    const timestamp = addHours(startDate, i).getTime();

    // 시간별 변동
    currentPrice = currentPrice * (1 + randomInRange(-volatility, volatility) / 100);

    const open = currentPrice;
    const high = open * (1 + randomInRange(0, 2) / 100);
    const low = open * (1 - randomInRange(0, 2) / 100);
    const close = randomInRange(low, high);
    const volume = Math.round(randomInRange(5000, 50000));

    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return data;
};

/**
 * 지정된 설정에 따라 OHLC 데이터를 생성합니다.
 */
export const generateOHLCData = (
  startDate: Date = new Date(),
  count: number = 100,
  interval: 'minute' | 'hour' | 'day' = 'minute',
  trend: 'up' | 'down' | 'sideways' | 'mixed' = 'mixed',
  basePrice: number = 100,
  volatility: number = 2
): OHLCData[] => {
  switch (trend) {
    case 'up':
      return generateUptrendData(
        startDate,
        count,
        basePrice,
        interval === 'minute' ? 5 : 0, // 분봉은 5분 간격으로
        volatility
      );
    case 'down':
      return generateDowntrendData(
        startDate,
        count,
        basePrice,
        interval === 'minute' ? 5 : 0,
        volatility
      );
    case 'sideways':
      return generateSidewaysData(
        startDate,
        count,
        basePrice,
        interval === 'minute' ? 5 : 0,
        volatility
      );
    case 'mixed':
    default:
      return generateMixedTrendData(startDate, count, basePrice, interval === 'minute' ? 5 : 0);
  }
};
