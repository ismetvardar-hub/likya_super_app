'use client';

import React, { useRef, type ReactNode, type TouchEvent } from 'react';
import {
  detectPinch, detectSwipe, detectLongPress,
  type GestureOptions, type SwipeDirection, type PinchDirection,
} from '../../app/lib/ui/useTouchGestures.ts';

// ============================================================================
// 👆 SAHA JEST KAPSLAYICI (Adım 70)
// Swipe sol/sağ → sporcu değişimi • uzun basış → acil duraklatma/sakatlık
// Pinch → 3D/geospatial zoom. Motor: useTouchGestures.ts
// ============================================================================

export interface FieldGestureHandlers {
  onSwipe?: (direction: SwipeDirection) => void;
  onLongPress?: () => void;
  onPinch?: (direction: PinchDirection) => void;
  onTap?: () => void;
}

export interface FieldGestureContainerProps extends FieldGestureHandlers {
  children: ReactNode;
  options?: GestureOptions;
}

interface ActiveTouch {
  startX: number;
  startY: number;
  startT: number;
  startDist: number | null;
}

export default function FieldGestureContainer({ children, onSwipe, onLongPress, onPinch, onTap, options }: FieldGestureContainerProps) {
  const active = useRef<ActiveTouch | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const touches = Array.from(e.touches);
    if (touches.length === 1) {
      active.current = { startX: touches[0].clientX, startY: touches[0].clientY, startT: performance.now(), startDist: null };
    } else if (touches.length === 2) {
      const d = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      active.current = { startX: 0, startY: 0, startT: 0, startDist: d };
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    const touches = Array.from(e.touches);
    const cur = active.current;
    if (!cur) return;
    if (touches.length === 2 && cur.startDist) {
      const d = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      const dir = detectPinch(cur.startDist, d, options);
      if (dir) { onPinch?.(dir); active.current = null; }
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    const cur = active.current;
    if (!cur) return;
    active.current = null;
    const last = Array.from(e.changedTouches)[0];
    if (!last) return;
    if (cur.startDist !== null) return; // pinch zaten ele alındı

    const dx = last.clientX - cur.startX;
    const dy = last.clientY - cur.startY;
    const swipe = detectSwipe(dx, dy, options);
    if (swipe) { onSwipe?.(swipe); return; }
    const pressMs = performance.now() - cur.startT;
    if (detectLongPress(pressMs, options)) { onLongPress?.(); return; }
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) onTap?.();
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'none', width: '100%', height: '100%', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {children}
    </div>
  );
}
