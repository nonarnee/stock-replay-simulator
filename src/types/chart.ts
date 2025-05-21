/**
 * OHLC(Open, High, Low, Close) 캔들 데이터 타입
 */
export interface OHLCData {
  /** 타임스탬프 (Unix 밀리초) */
  timestamp: number;
  /** 시가 */
  open: number;
  /** 고가 */
  high: number;
  /** 저가 */
  low: number;
  /** 종가 */
  close: number;
  /** 거래량 (선택사항) */
  volume?: number;
}

/**
 * 차트 시각화 옵션
 */
export interface ChartOptions {
  /** 차트 너비 */
  width: number;
  /** 차트 높이 */
  height: number;
  /** 차트 여백 */
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** 캔들 너비 (픽셀) */
  candleWidth: number;
  /** 캔들 사이 간격 (픽셀) */
  candleGap: number;
  /** 캔들 상승 색상 */
  upColor: string;
  /** 캔들 하락 색상 */
  downColor: string;
  /** 그리드 표시 여부 */
  showGrid: boolean;
  /** 그리드 색상 */
  gridColor: string;
  /** X축 표시 여부 */
  showXAxis: boolean;
  /** Y축 표시 여부 */
  showYAxis: boolean;
}

/**
 * 차트 데이터셋
 */
export interface ChartDataset {
  /** 데이터셋 이름 */
  name: string;
  /** OHLC 데이터 배열 */
  data: OHLCData[];
  /** 현재 표시 중인 데이터 시작 인덱스 */
  startIndex: number;
  /** 현재 표시 중인 데이터 끝 인덱스 */
  endIndex: number;
}

/**
 * 차트 이벤트
 */
export enum ChartEventType {
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut',
  PAN_LEFT = 'panLeft',
  PAN_RIGHT = 'panRight',
  RESET = 'reset',
}

/**
 * 리플레이 상태
 */
export enum ReplayState {
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

/**
 * 리플레이 옵션
 */
export interface ReplayOptions {
  /** 리플레이 속도 (1 = 실제 시간, 2 = 2배 빠르게, 0.5 = 절반 속도) */
  speed: number;
  /** 리플레이 시작 타임스탬프 */
  startTime: number;
  /** 리플레이 종료 타임스탬프 (선택사항) */
  endTime?: number;
  /** 리플레이 반복 여부 */
  loop: boolean;
}
