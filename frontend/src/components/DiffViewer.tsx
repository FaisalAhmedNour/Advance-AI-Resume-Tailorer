import React from 'react';
import dynamic from 'next/dynamic';

// react-diff-viewer-continued is a CJS-only package — must be imported client-side only
const ReactDiffViewerDynamic = dynamic(() => import('react-diff-viewer-continued'), {
    ssr: false,
    loading: () => (
        <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-400 animate-pulse bg-slate-50">
            Loading diff viewer...
        </div>
    )
});

interface DiffViewerProps {
    oldText: string;
    newText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText }) => {
    return (
        <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm text-sm">
            <ReactDiffViewerDynamic
                oldValue={oldText}
                newValue={newText}
                splitView={true}
                hideLineNumbers={true}
                useDarkTheme={false}
                leftTitle="Original"
                rightTitle="ATS Optimized"
                styles={{
                    variables: {
                        light: {
                            diffViewerBackground: '#F8FAFC',
                            addedBackground: '#EFF6FF',
                            addedColor: '#1D4ED8',
                            removedBackground: '#FEF2F2',
                            removedColor: '#B91C1C',
                            wordAddedBackground: '#DBEAFE',
                            wordRemovedBackground: '#FEE2E2',
                        }
                    },
                    titleBlock: {
                        padding: '12px 16px',
                        borderBottom: '1px solid #CBD5E1',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }
                }}
            />
        </div>
    );
};
