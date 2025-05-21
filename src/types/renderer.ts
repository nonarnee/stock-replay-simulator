import type { ChartOptions, OHLCData } from './chart';

/**
 * 렌더링 옵션
 */
export interface RenderOptions extends ChartOptions {
  /** 현재 애니메이션 타임스탬프 */
  currentTimestamp: number;
  /** 애니메이션 중인지 여부 */
  isAnimating: boolean;
  /** 추가 렌더링 옵션 (렌더러별 특화 옵션) */
  [key: string]: unknown;
}

/**
 * 차트 렌더러 인터페이스
 * SVG, Canvas, WebGL 렌더러는 모두 이 인터페이스를 구현해야 함
 */
export interface ChartRenderer {
  /**
   * 렌더러 초기화
   * @param container 렌더링 대상 컨테이너 요소
   */
  init(container: HTMLElement): void;

  /**
   * 데이터 렌더링
   * @param data OHLC 데이터 배열
   * @param options 렌더링 옵션
   */
  render(data: OHLCData[], options: RenderOptions): void;

  /**
   * 렌더링 영역 클리어
   */
  clear(): void;

  /**
   * 렌더링 크기 조정
   * @param width 너비
   * @param height 높이
   */
  resize(width: number, height: number): void;

  /**
   * 리소스 해제 및 정리
   */
  destroy(): void;
}

/**
 * SVG 렌더러 특화 옵션
 */
export interface SVGRenderOptions extends RenderOptions {
  /** SVG 요소 클래스명 */
  svgClassName?: string;
  /** SVG 애니메이션 사용 여부 */
  useSVGAnimation?: boolean;
}

/**
 * Canvas 렌더러 특화 옵션
 */
export interface CanvasRenderOptions extends RenderOptions {
  /** 픽셀 비율 (고해상도 디스플레이 지원) */
  pixelRatio?: number;
  /** 오프스크린 캔버스 사용 여부 */
  useOffscreenCanvas?: boolean;
}

/**
 * WebGL 렌더러 특화 옵션
 */
export interface WebGLRenderOptions extends RenderOptions {
  /** 안티앨리어싱 활성화 여부 */
  antialias?: boolean;
  /** 투명도 활성화 여부 */
  alpha?: boolean;
  /** 셰이더 프로그램 ID */
  shaderProgram?: string;
}
