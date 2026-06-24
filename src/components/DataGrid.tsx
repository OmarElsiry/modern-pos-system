import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './DataGrid.css';
import Button from './Button'; // Default import
import Skeleton from './Skeleton';

export interface Column<T> {
    field: keyof T;
    headerName: string;
    width?: number | string;
    renderCell?: (row: T) => React.ReactNode;
    sortable?: boolean;
}

export interface DataGridProps<T> {
    rows: T[];
    columns: Column<T>[];
    loading?: boolean;
    pageSize?: number;
    className?: string;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
}

const DataGrid = <T extends { id?: string | number } & Record<string, any>>({
    rows,
    columns,
    loading = false,
    pageSize = 10,
    className = '',
    onRowClick,
    emptyMessage: customEmptyMessage,
}: DataGridProps<T>) => {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: keyof T) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedRows = useMemo(() => {
        if (!sortField) return rows;

        return [...rows].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === bValue) return 0;

            const comparison = aValue > bValue ? 1 : -1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [rows, sortField, sortDirection]);

    const paginatedRows = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedRows.slice(startIndex, startIndex + pageSize);
    }, [sortedRows, currentPage, pageSize]);

    const totalPages = Math.ceil(rows.length / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className={`datagrid-container ${className}`}>
                <div className="datagrid-wrapper">
                    <table className="datagrid-table">
                        <thead>
                            <tr>
                                {columns.map((col, i) => (
                                    <th key={i} className="datagrid-header" style={{ width: col.width }}>
                                        <Skeleton variant="text" width="60%" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(pageSize)].map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} className="datagrid-cell">
                                            <Skeleton variant="text" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className={`datagrid-container ${className}`}>
            <div className="datagrid-wrapper">
                <table className="datagrid-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.field)}
                                    className={`datagrid-header ${col.sortable ? 'sortable' : ''}`}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && handleSort(col.field)}
                                >
                                    <div className="header-content">
                                        {col.headerName}
                                        {sortField === col.field && (
                                            <span className="sort-icon">
                                                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={onRowClick ? 'clickable-row' : ''}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={String(col.field)}
                                            className="datagrid-cell"
                                            data-label={col.headerName}
                                        >
                                            {col.renderCell ? col.renderCell(row) : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="datagrid-empty">
                                    {customEmptyMessage || t('common.noData')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="datagrid-pagination">
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        {t('common.previous')}
                    </Button>
                    <span className="page-info">
                        {t('common.pageInfo', { current: currentPage, total: totalPages })}
                    </span>
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DataGrid;
