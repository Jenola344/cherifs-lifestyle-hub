'use client';
import { useEffect, useRef, ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export default function Reveal({ children, className = '', delay = 0 }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const delayClass = delay ? `delay-${delay}` : '';

    return (
        <div ref={ref} className={`reveal ${delayClass} ${className}`}>
            {children}
        </div>
    );
}
