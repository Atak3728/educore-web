import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    // Simple logic: show all pages if <= 7, otherwise show start, end, and current window
    // For simplicity in this iteration, let's show a sliding window or just simple prev/next/numbers

    // Generating page numbers to display
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '0.25rem',
                    border: '1px solid var(--border)', background: 'var(--bg-card)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
            >
                <ChevronLeft size={16} />
            </button>

            {startPage > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        style={{
                            width: '32px', height: '32px', borderRadius: '0.25rem',
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            color: 'var(--text-main)', cursor: 'pointer'
                        }}
                    >
                        1
                    </button>
                    {startPage > 2 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={{
                        width: '32px', height: '32px', borderRadius: '0.25rem',
                        border: page === currentPage ? '1px solid var(--primary)' : '1px solid var(--border)',
                        background: page === currentPage ? 'var(--primary)' : 'var(--bg-card)',
                        color: page === currentPage ? 'white' : 'var(--text-main)',
                        cursor: 'pointer', fontWeight: page === currentPage ? 'bold' : 'normal'
                    }}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        style={{
                            width: '32px', height: '32px', borderRadius: '0.25rem',
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            color: 'var(--text-main)', cursor: 'pointer'
                        }}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '0.25rem',
                    border: '1px solid var(--border)', background: 'var(--bg-card)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;
