import React, { useState, useRef, TouchEvent, MouseEvent } from 'react';
import Image from 'next/image';
import styles from './ZoomableImage.module.css';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isSoldOut?: boolean;
}

export default function ZoomableImage({ src, alt, onSwipeLeft, onSwipeRight, isSoldOut }: Props) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  // Mouse events for panning
  const handleMouseDown = (e: MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch events for pinch-to-zoom and swipe
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
      } else {
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const delta = distance - lastTouchDistance.current;
      
      setScale(prev => {
        const newScale = Math.min(Math.max(prev + delta * 0.01, 1), 4);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      if (scale > 1 && isDragging) {
        setPosition({
          x: e.touches[0].clientX - dragStart.current.x,
          y: e.touches[0].clientY - dragStart.current.y
        });
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    lastTouchDistance.current = null;
    setIsDragging(false);
    
    // Swipe detection
    if (scale === 1 && e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - dragStart.current.x;
      const dy = touchEndY - dragStart.current.y;
      
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx > 0) onSwipeLeft();
        else onSwipeRight();
      }
    }
  };

  // Skeleton loader data URL (gray placeholder)
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=';

  return (
    <div 
      className={styles.container}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className={styles.imageWrapper}
        style={{ 
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={styles.image}
          sizes="(max-width: 900px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL={blurDataURL}
          priority
        />
      </div>
      
      {isSoldOut && <span className={styles.soldBadgeLarge}>Sold Out</span>}

      <div className={styles.controls} onClick={e => e.stopPropagation()}>
        <button onClick={handleZoomOut} disabled={scale === 1} className={styles.iconBtn} aria-label="Zoom out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleZoomIn} disabled={scale === 4} className={styles.iconBtn} aria-label="Zoom in">
          <ZoomIn size={20} />
        </button>
      </div>

      <button 
        className={`${styles.navBtn} ${styles.prevBtn}`} 
        onClick={(e) => { e.stopPropagation(); onSwipeLeft(); }}
        aria-label="Previous artwork"
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        className={`${styles.navBtn} ${styles.nextBtn}`} 
        onClick={(e) => { e.stopPropagation(); onSwipeRight(); }}
        aria-label="Next artwork"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
