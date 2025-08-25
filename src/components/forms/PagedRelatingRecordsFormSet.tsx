import React, { useState, useMemo, useCallback } from "react";
import { Typography, Box, Pagination, Stack } from "@mui/material";
import { CatalogRecord } from "../../types";
import { ObjectPropsFragment } from "../../generated/types";
import { sortEntries } from "./RelatingRecordsFormSet";
import FormSet, { FormSetProps } from "./FormSet";
import CatalogEntryChip from "../CatalogEntryChip";
import { styled } from "@mui/material/styles";
import { T } from "@tolgee/react";

const StyledFormSetTitle = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
}));

// Error Boundary Class Component für Chip-Rendering
class ChipErrorBoundary extends React.Component<
    { children: React.ReactNode; recordId?: string },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode; recordId?: string }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Error bereits geloggt
    }

    render() {
        if (this.state.hasError) {
            return (
                <div 
                    style={{ 
                        padding: '2px 6px', 
                        backgroundColor: '#ffebee', 
                        color: '#c62828', 
                        borderRadius: '3px',
                        fontSize: '11px',
                        border: '1px solid #ef5350',
                        display: 'inline-block'
                    }}
                    title={`Rendering error for ${this.props.recordId}: ${this.state.error?.message || 'Unknown error'}`}
                >
                    ⚠️ {this.props.recordId || 'Error'}
                </div>
            );
        }

        return this.props.children;
    }
}

// Memoized Chip Komponente für bessere Performance mit Fehlerbehandlung
const MemoizedChip = React.memo(function MemoizedChip({ record }: { record: CatalogRecord }) {
    return (
        <ChipErrorBoundary recordId={record.id}>
            <CatalogEntryChip
                catalogEntry={record}
            />
        </ChipErrorBoundary>
    );
});

// Konvertiert ObjectPropsFragment zu CatalogRecord für die Chips
const convertToCatalogRecord = (obj: ObjectPropsFragment): CatalogRecord | null => {
    // Prüfe nur auf absolut notwendige Felder
    if (!obj.id) {
        return null; // Überspringe nur Einträge ohne ID
    }
    
    return {
        id: obj.id,
        recordType: obj.recordType || 'Unknown', // Fallback für undefined recordType
        name: obj.name || undefined,
        comment: obj.comment || undefined,
        tags: obj.tags
    };
};

export interface PagedRelatingRecordsFormSetProps {
    title: React.ReactNode;
    emptyMessage: React.ReactNode;
    
    // Paginated data structure
    concepts: {
        nodes: Array<ObjectPropsFragment>;
        pageInfo: {
            pageNumber: number;
            pageSize?: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
        totalElements: number;
    };
    
    // Pagination controls
    currentPage: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    
    // Optional filtering
    tagged?: string;
    
    FormSetProps?: FormSetProps;
}

export default function PagedRelatingRecordsFormSet(props: PagedRelatingRecordsFormSetProps) {
    const {
        title,
        emptyMessage,
        concepts,
        currentPage,
        onPageChange,
        isLoading,
        tagged,
        FormSetProps
    } = props;

    // Filter und sortiere die aktuell geladenen Records
    const processedRecords = useMemo(() => {
        if (!concepts?.nodes || concepts.nodes.length === 0) {
            return [];
        }
        
        // Konvertiere zu CatalogRecord Format und filtere ungültige Einträge heraus
        const converted = concepts.nodes
            .map((node, index) => {
                try {
                    return convertToCatalogRecord(node);
                } catch (conversionError) {
                    return null;
                }
            })
            .filter((record): record is CatalogRecord => record !== null); // Type guard um null zu entfernen
        
        let filtered = converted;
        if (tagged) {
            filtered = converted.filter(record => 
                record.tags?.some((tag: any) => tag.id === tagged)
            );
        }

        // Sortierung nur bei überschaubaren Mengen
        if (filtered.length < 1000) {
            return [...filtered].sort(sortEntries);
        }
        
        return filtered;
    }, [concepts?.nodes, tagged]);

    const { pageInfo, totalElements } = concepts || { pageInfo: null, totalElements: 0 };
    const totalPages = pageInfo?.totalPages || 0;
    
    const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
        if (!isLoading) {
            onPageChange(page - 1); // Material-UI Pagination ist 1-basiert, Backend ist 0-basiert
        }
    }, [isLoading, onPageChange]);

    return (
        <FormSet {...FormSetProps}>
            <StyledFormSetTitle>{title}</StyledFormSetTitle>
            
            {processedRecords.length > 0 ? (
                <>
                    {/* Gesamtanzahl Info */}
                    <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ mb: 2, display: 'block' }}
                    >
                        {totalElements} <T keyName="pagination.entries" />
                    </Typography>

                    {/* Records */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {(() => {
                            try {
                                return processedRecords.map((record: CatalogRecord) => {
                                    // Zusätzliche Validierung vor dem Rendern
                                    if (!record || !record.id) {
                                        return null;
                                    }
                                    return <MemoizedChip key={record.id} record={record} />;
                                }).filter(Boolean); // Entferne null-Werte
                            } catch (renderError) {
                                return (
                                    <div style={{ color: 'red', padding: '8px' }}>
                                        <T keyName="pagination.error_rendering" />: {(renderError as Error).message}
                                    </div>
                                );
                            }
                        })()}
                    </Box>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <Stack spacing={2} alignItems="center">
                            {/* Material-UI Pagination Component */}
                            <Pagination
                                count={totalPages}
                                page={currentPage + 1} // Material-UI ist 1-basiert
                                onChange={handlePageChange}
                                disabled={isLoading}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                siblingCount={2} // Zeige 2 Seiten vor/nach aktueller Seite
                                boundaryCount={1} // Zeige erste/letzte Seite
                                size="medium"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: '0.875rem'
                                    }
                                }}
                            />
                        </Stack>
                    )}
                </>
            ) : (
                <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>
            )}
        </FormSet>
    );
}
