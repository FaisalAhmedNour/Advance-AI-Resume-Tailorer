import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface DiffViewerProps {
    oldText: string;
    newText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldText, newText }) => {
    return (
        <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm text-sm">
            <ReactDiffViewer
                oldValue={oldText}
                newValue={newText}
                splitView={true}
                hideLineNumbers={true}
                useDarkTheme={false}
                leftTitle="Original Form"
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
                            wordRemovedBackground: '#FEE2E2'
                        }
                    },
                    titleBlock: {
                        padding: '12px 16px',
                        borderBottom: '1px solid #CBD5E1',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    },
                    line: {
                        marginTop: '8px',
                        marginBottom: '8px'
                    }
                }}
            />
        </div>
    );
};
