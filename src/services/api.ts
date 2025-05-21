import { generateOHLCData } from './mockData';

import type { OHLCData } from '../types/chart';

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

/**
 * 차트 데이터 필터 옵션
 */
export interface ChartDataFilter {
  /** 시작 타임스탬프 */
  startTimestamp?: number;
  /** 종료 타임스탬프 */
  endTimestamp?: number;
  /** 데이터 간격 (minute, hour, day) */
  interval?: 'minute' | 'hour' | 'day';
  /** 트렌드 타입 */
  trend?: 'up' | 'down' | 'sideways' | 'mixed';
}

/**
 * 지연 효과를 적용하는 함수
 * @param ms 지연 시간 (밀리초)
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 랜덤 지연 시간 생성 (네트워크 지연 시뮬레이션)
 * @param min 최소 지연 시간 (밀리초)
 * @param max 최대 지연 시간 (밀리초)
 */
const randomDelay = (min: number = 100, max: number = 800): Promise<void> => {
  const delayTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(delayTime);
};

/**
 * 목업 API 클래스
 */
export class MockApiClient {
  private static instance: MockApiClient;
  private cachedData: OHLCData[] = [];
  private simulateErrors: boolean = false;
  private errorRate: number = 0.1; // 10% 오류 발생률

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): MockApiClient {
    if (!MockApiClient.instance) {
      MockApiClient.instance = new MockApiClient();
    }
    return MockApiClient.instance;
  }

  /**
   * 생성자 - 기본 데이터 캐싱
   */
  private constructor() {
    // 기본 데이터 생성 (현재부터 30일 전 데이터, 5분 간격)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 30일 x 24시간 x 12(5분 간격) = 8,640개의 데이터 포인트
    this.cachedData = generateOHLCData(thirtyDaysAgo, 8640, 'minute', 'mixed');
  }

  /**
   * 에러 시뮬레이션 설정
   */
  public setErrorSimulation(simulate: boolean, rate: number = 0.1): void {
    this.simulateErrors = simulate;
    this.errorRate = rate;
  }

  /**
   * 데이터 필터링
   */
  private filterData(data: OHLCData[], filter?: ChartDataFilter): OHLCData[] {
    if (!filter) return data;

    let filtered = [...data];

    if (filter.startTimestamp) {
      filtered = filtered.filter(d => d.timestamp >= filter.startTimestamp!);
    }

    if (filter.endTimestamp) {
      filtered = filtered.filter(d => d.timestamp <= filter.endTimestamp!);
    }

    return filtered;
  }

  /**
   * 차트 데이터 페이지 가져오기
   */
  public async getChartData(
    page: number = 1,
    pageSize: number = 100,
    filter?: ChartDataFilter
  ): Promise<PaginatedResponse<OHLCData>> {
    // 네트워크 지연 시뮬레이션
    await randomDelay();

    // 오류 시뮬레이션 (설정된 확률로 오류 발생)
    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        data: [],
        error: '서버 요청 중 오류가 발생했습니다.',
        pagination: {
          page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    // 필터 적용
    const filteredData = this.filterData(this.cachedData, filter);

    // 페이지네이션 계산
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    // 페이지 데이터 추출
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * 특정 기간의 차트 데이터 가져오기
   */
  public async getChartDataByTimeRange(
    startTimestamp: number,
    endTimestamp: number,
    interval: 'minute' | 'hour' | 'day' = 'minute'
  ): Promise<ApiResponse<OHLCData[]>> {
    // 네트워크 지연 시뮬레이션
    await randomDelay();

    // 오류 시뮬레이션
    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        data: [],
        error: '데이터를 가져오는 중 오류가 발생했습니다.',
      };
    }

    // 필터 적용
    const filteredData = this.filterData(this.cachedData, {
      startTimestamp,
      endTimestamp,
      interval,
    });

    return {
      success: true,
      data: filteredData,
    };
  }

  /**
   * 특정 트렌드 패턴의 새 데이터 생성
   */
  public async generateNewData(
    count: number = 100,
    trend: 'up' | 'down' | 'sideways' | 'mixed' = 'mixed',
    basePrice: number = 100
  ): Promise<ApiResponse<OHLCData[]>> {
    // 네트워크 지연 시뮬레이션
    await randomDelay(300, 1200); // 데이터 생성은 더 오래 걸릴 수 있음

    // 오류 시뮬레이션
    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        data: [],
        error: '데이터 생성 중 오류가 발생했습니다.',
      };
    }

    const now = new Date();
    const newData = generateOHLCData(now, count, 'minute', trend, basePrice);

    return {
      success: true,
      data: newData,
    };
  }

  /**
   * 스트리밍 데이터 시뮬레이션을 위한 새 데이터 생성
   * (기존 데이터 기반으로 추가 데이터 생성)
   */
  public async getStreamingData(
    lastTimestamp: number,
    count: number = 1
  ): Promise<ApiResponse<OHLCData[]>> {
    await randomDelay(50, 300); // 스트리밍은 응답이 빠름

    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        data: [],
        error: '스트리밍 데이터를 받는 중 오류가 발생했습니다.',
      };
    }

    // 마지막 데이터 찾기
    const lastDataIndex = this.cachedData.findIndex(d => d.timestamp === lastTimestamp);

    if (lastDataIndex === -1 || lastDataIndex >= this.cachedData.length - 1) {
      // 마지막 데이터가 없거나 이미 캐시된 데이터의 끝에 도달한 경우, 새 데이터 생성
      const lastData =
        lastDataIndex === -1
          ? this.cachedData[this.cachedData.length - 1]
          : this.cachedData[lastDataIndex];

      const startTime = new Date(lastTimestamp + 300000); // 5분 이후
      const newData = generateOHLCData(startTime, count, 'minute', 'mixed', lastData.close);

      return {
        success: true,
        data: newData,
      };
    }

    // 기존 캐시된 데이터에서 다음 데이터 반환
    const nextData = this.cachedData.slice(lastDataIndex + 1, lastDataIndex + 1 + count);

    return {
      success: true,
      data: nextData,
    };
  }
}

// API 클라이언트 싱글톤 인스턴스 내보내기
export const apiClient = MockApiClient.getInstance();
