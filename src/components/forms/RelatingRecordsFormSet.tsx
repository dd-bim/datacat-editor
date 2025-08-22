import FormSet, { FormSetProps, FormSetTitle } from "./FormSet";
import React, { useState, useMemo, useCallback } from "react";
import CatalogEntryChip from "../CatalogEntryChip";
import { Typography, Box, Button, CircularProgress } from "@mui/material";
import { CatalogRecord } from "../../types";
import { styled } from "@mui/material/styles";

// Memoized Chip Component für bessere Performance
const MemoizedChip = React.memo(({ record }: { record: CatalogRecord }) => (
    <CatalogEntryChip
        key={record.id}
        catalogEntry={record}
    />
));

// Replace makeStyles with styled component
const StyledFormSetTitle = styled(FormSetTitle)(({ theme }) => ({
    marginBottom: theme.spacing(1)
}));

export type MemberFormSetProps = {
    title: React.ReactNode;
    emptyMessage: React.ReactNode;
    relatingRecords: CatalogRecord[];
    FormSetProps?: FormSetProps;
    tagged?: string;
};

export const sortEntries = (left: CatalogRecord, right: CatalogRecord) => {
    const a = left.name ?? left.id;
    const b = right.name ?? right.id;
    return a.localeCompare(b);
};

export default function RelatingRecordsFormSet(props: MemberFormSetProps) {
    const {
        title,
        emptyMessage,
        relatingRecords,
        FormSetProps,
        tagged
    } = props;

    const [displayCount, setDisplayCount] = useState(20);
    const [isProcessing, setIsProcessing] = useState(false);

    // KRITISCH: Optimierte Filterung und Sortierung mit useMemo
    const processedRecords = useMemo(() => {
        if (!relatingRecords || relatingRecords.length === 0) return [];
        
        let filtered = relatingRecords;
        if (tagged) {
            filtered = relatingRecords.filter(record => 
                record.tags?.some(tag => tag.id === tagged)
            );
        }

        // Nur sortieren wenn weniger als 1000 Records (Performance-Schutz)
        if (filtered.length < 1000) {
            return [...filtered].sort(sortEntries);
        }
        
        return filtered;
    }, [relatingRecords, tagged]);

    // Nur die angezeigten Records rendern
    const displayedRecords = useMemo(() => {
        return processedRecords.slice(0, displayCount);
    }, [processedRecords, displayCount]);

    const hasMoreRecords = processedRecords.length > displayCount;
    const remainingCount = processedRecords.length - displayCount;

    // Asynchrones Laden für bessere Performance
    const handleLoadMore = useCallback(async () => {
        setIsProcessing(true);
        
        // Kurze Pause um UI responsive zu halten
        await new Promise(resolve => setTimeout(resolve, 10));
        
        setDisplayCount(prev => Math.min(prev + 20, processedRecords.length));
        setIsProcessing(false);
    }, [processedRecords.length]);

    return (
        <FormSet {...FormSetProps}>
            <StyledFormSetTitle>{title}</StyledFormSetTitle>
            
            {processedRecords.length ? (
                <>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {displayedRecords.map(record => (
                            <MemoizedChip key={record.id} record={record} />
                        ))}
                    </Box>
                    
                    {hasMoreRecords && (
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleLoadMore}
                                disabled={isProcessing}
                                startIcon={isProcessing ? <CircularProgress size={16} /> : null}
                                sx={{ 
                                    textTransform: "none",
                                    minWidth: 200
                                }}
                            >
                                {isProcessing 
                                    ? 'Lädt...' 
                                    : `${Math.min(20, remainingCount)} weitere von ${remainingCount} anzeigen`
                                }
                            </Button>
                        </Box>
                    )}
                </>
            ) : (
                <Typography variant="body2" color="textSecondary">{emptyMessage}</Typography>
            )}
        </FormSet>
    );
}
