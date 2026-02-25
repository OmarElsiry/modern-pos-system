import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'right' | 'left';
    delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    let timeout: ReturnType<typeof setTimeout>;

    const showTooltip = () => {
        timeout = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        clearInterval(timeout);
        setIsVisible(false);
    };

    return (
        <div
            className="tooltip-container"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {isVisible && (
                <div className={`tooltip-bubble tooltip-${position}`}>
                    {content}
                    <div className="tooltip-arrow" />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
