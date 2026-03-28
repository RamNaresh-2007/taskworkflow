import React, { useEffect, useState } from 'react';
import './MouseTrailer.css';

export function MouseTrailer() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });

            const interactable = e.target.closest('button, a, input, select');
            if (interactable) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
            <div
                className={`mouse-trailer ${isHovering ? 'hovering' : ''}`}
                style={{
                    transform: `translate(${position.x - 12}px, ${position.y - 12}px)`
                }}
            ></div>
            <div
                className="mouse-glow"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`
                }}
            ></div>
        </>
    );
}
