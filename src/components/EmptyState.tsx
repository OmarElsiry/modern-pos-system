import React from 'react';
import './EmptyState.css';
import { PackageSearch } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const defaultIcon = <PackageSearch size={64} strokeWidth={1} />;

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = defaultIcon,
    title,
    description,
    action,
}) => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            {description && <p className="empty-state-description">{description}</p>}
            {action && (
                <button className="empty-state-action" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
