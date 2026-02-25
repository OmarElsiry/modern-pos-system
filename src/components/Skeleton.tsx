import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    variant?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
}) => {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`skeleton skeleton-${variant} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
