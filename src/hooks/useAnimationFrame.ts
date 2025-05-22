import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * AnimationFrame 훅 옵션
 */
interface UseAnimationFrameOptions {
  /** 활성화 여부 */
  enabled?: boolean;
  /** FPS 제한 (null이면 제한 없음) */
  fpsLimit?: number | null;
  /** 콜백 함수에 현재 FPS 전달 여부 */
  provideFps?: boolean;
  /** 타임스탬프 시작점 (null이면 첫 프레임부터 시작) */
  startTimestamp?: number | null;
  /** 타임스탬프 종료점 (null이면 무한 반복) */
  endTimestamp?: number | null;
  /** 반복 여부 */
  loop?: boolean;
  /** 재생 속도 (1 = 실제 시간, 2 = 2배 빠르게, 0.5 = 절반 속도) */
  speed?: number;
}

/**
 * AnimationFrame 콜백 함수 타입
 * @param timestamp 현재 타임스탬프
 * @param deltaTime 이전 프레임과의 시간 차이 (밀리초)
 * @param fps 현재 FPS (provideFps가 true인 경우에만 제공)
 */
type AnimationFrameCallback = (timestamp: number, deltaTime: number, fps?: number) => void;

/**
 * requestAnimationFrame을 사용한 애니메이션 훅
 * @param callback 애니메이션 프레임마다 호출할 콜백 함수
 * @param options 애니메이션 옵션
 * @returns 측정된 FPS 및 컨트롤 함수
 */
export function useAnimationFrame(
  callback: AnimationFrameCallback,
  options: UseAnimationFrameOptions = {}
) {
  // 옵션 기본값 설정
  const {
    enabled = true,
    fpsLimit = null,
    provideFps = false,
    startTimestamp = null,
    endTimestamp = null,
    loop = false,
    speed = 1,
  } = options;

  // 상태 및 레퍼런스
  const [fps, setFps] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(enabled);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const fpsCounterRef = useRef<{ frames: number; lastUpdate: number }>({
    frames: 0,
    lastUpdate: 0,
  });
  const initialTimeRef = useRef<number | null>(null);
  const simulatedTimeRef = useRef<number | null>(null);
  const frameIntervalRef = useRef<number | null>(fpsLimit ? 1000 / fpsLimit : null);

  // 프레임 처리 함수
  const animate = useCallback(
    (time: number) => {
      // 초기 시간 설정
      if (initialTimeRef.current === null) {
        initialTimeRef.current = time;
        simulatedTimeRef.current = startTimestamp || time;
        console.log('Animation initialized:', {
          initialTime: initialTimeRef.current,
          startTimestamp: startTimestamp,
          simulatedTime: simulatedTimeRef.current,
        });
      }

      // FPS 계산
      fpsCounterRef.current.frames++;
      if (time - fpsCounterRef.current.lastUpdate >= 1000) {
        // 1초마다 FPS 업데이트
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastUpdate = time;
      }

      // 델타 타임 계산 및 반올림
      const rawDeltaTime = previousTimeRef.current ? time - previousTimeRef.current : 0;
      const deltaTime = Math.round(rawDeltaTime);

      // 성능 최적화: 프레임 건너뛰기
      // 매우 짧은 시간 간격(16ms = 약 60fps)으로 호출되면 처리 건너뛰기
      const minFrameInterval = 16; // 약 60fps
      if (deltaTime < minFrameInterval && previousTimeRef.current !== null) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      // 시뮬레이션 시간 계산 (속도 적용)
      if (simulatedTimeRef.current !== null) {
        const adjustedDelta = Math.round(deltaTime * speed);
        simulatedTimeRef.current += adjustedDelta;

        // 로그 주기 제한 (100번에 1번만 로그)
        if (fpsCounterRef.current.frames % 100 === 0) {
          console.log('Animation frame:', {
            deltaTime,
            adjustedDelta,
            simulatedTime: simulatedTimeRef.current,
            fps: fps || 0,
          });
        }
      }

      // 종료 타임스탬프 체크
      if (endTimestamp !== null && simulatedTimeRef.current! >= endTimestamp) {
        console.log('Animation reached end timestamp:', {
          endTimestamp,
          simulatedTime: simulatedTimeRef.current,
        });

        if (loop) {
          // 반복 재생인 경우 시작점으로 되돌림
          console.log('Animation looping back to start');
          simulatedTimeRef.current = startTimestamp || initialTimeRef.current;
        } else {
          // 반복이 아닌 경우 정지
          console.log('Animation stopping (end reached, no loop)');
          setIsPlaying(false);
          return;
        }
      }

      // FPS 제한 확인
      let shouldRender = true;
      if (frameIntervalRef.current !== null) {
        if (previousTimeRef.current && time - previousTimeRef.current < frameIntervalRef.current) {
          shouldRender = false;
        }
      }

      // 콜백 호출
      if (shouldRender) {
        try {
          callback(simulatedTimeRef.current!, deltaTime, provideFps ? fps : undefined);
          previousTimeRef.current = time;
        } catch (error) {
          console.error('애니메이션 프레임 콜백 실행 중 오류:', error);
        }
      }

      // 다음 프레임 요청
      if (isPlaying) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    [callback, fps, fpsLimit, isPlaying, loop, provideFps, speed, startTimestamp, endTimestamp]
  );

  // 애니메이션 시작
  const start = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // 애니메이션 정지
  const stop = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // 애니메이션 재설정
  const reset = useCallback(() => {
    initialTimeRef.current = null;
    simulatedTimeRef.current = null;
    previousTimeRef.current = null;
    fpsCounterRef.current = { frames: 0, lastUpdate: 0 };
  }, []);

  // 애니메이션 상태 변경 감지
  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, animate]);

  // FPS 제한 변경 감지
  useEffect(() => {
    frameIntervalRef.current = fpsLimit ? 1000 / fpsLimit : null;
  }, [fpsLimit]);

  // 활성화 상태 변경 감지
  useEffect(() => {
    setIsPlaying(enabled);
  }, [enabled]);

  return {
    fps,
    isPlaying,
    start,
    stop,
    reset,
  };
}
