import {
    useGetDictionaryEntryWithPaginationQuery,
    useGetDictionaryEntryQuery,
    DictionaryPropsFragment,
    ObjectPropsFragment,
    ItemPropsFragment,
    MetaPropsFragment
} from "../../generated/types";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import { DictionaryEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import PagedRelatingRecordsFormSet from "../../components/forms/PagedRelatingRecordsFormSet";
import { T } from "@tolgee/react";
import { useNavigate } from "react-router-dom";
import React, { useState, useCallback, useEffect } from "react";


function DictionaryForm(props: FormProps<DictionaryPropsFragment>) {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    
    // Seitenweise Navigation State
    const [currentPage, setCurrentPage] = useState(0);
    const [lastSuccessfulConcepts, setLastSuccessfulConcepts] = useState<ObjectPropsFragment[]>([]);
    const [lastSuccessfulPageInfo, setLastSuccessfulPageInfo] = useState<{
        totalElements: number;
        totalPages: number;
    }>({ totalElements: 0, totalPages: 0 });
    const pageSize = 50; // Pro Seite
    
    // 1. Dictionary-Grunddaten (Name, Meta) - lädt nur EINMAL
    const { 
        data: dictionaryData, 
        loading: dictionaryLoading, 
        error: dictionaryError, 
        refetch: refetchDictionary 
    } = useGetDictionaryEntryQuery({
        variables: { id },
        errorPolicy: 'all'
    });

    // 2. Nur Konzepte mit Pagination - lädt bei jedem Seitenwechsel
    const { 
        data: conceptsData, 
        loading: conceptsLoading, 
        error: conceptsError,
        networkStatus
    } = useGetDictionaryEntryWithPaginationQuery({
        variables: {
            id,
            pageSize,
            pageNumber: currentPage
        },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        // Keine Cache-Policy - immer frische Konzepte laden
        fetchPolicy: 'network-only'
    });

    // Ersetzt onCompleted Callback
    useEffect(() => {
        if (conceptsData?.node?.concepts?.nodes) {
            // Filtere nur wirklich korrupte Daten heraus (ohne ID)
            const validConcepts = conceptsData.node.concepts.nodes.filter(concept => 
                concept?.id // Nur ID ist wirklich erforderlich
            );
            
            setLastSuccessfulConcepts(validConcepts);
        }
        if (conceptsData?.node?.concepts?.totalElements !== undefined) {
            const pageInfo = {
                totalElements: conceptsData.node.concepts.totalElements,
                totalPages: Math.ceil(conceptsData.node.concepts.totalElements / pageSize)
            };
            
            setLastSuccessfulPageInfo(pageInfo);
        }
    }, [conceptsData, pageSize]);

    // Ersetzt onError Callback
    useEffect(() => {
        if (conceptsError) {
            console.error('❌ [DictionaryForm] Concepts error:', conceptsError);
            // Bei Fehler verwende alte Daten weiter
            // Hier könntest du auch einen Snackbar zeigen falls gewünscht
        }
    }, [conceptsError]);

    // Dictionary-Daten kommen aus der ersten Query
    const entry = dictionaryData?.node as DictionaryPropsFragment | undefined;

    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdDictionary',
        id
    });

    const handleOnDelete = useCallback(async () => {
        try {
            await deleteEntry({ variables: { id } });
            enqueueSnackbar("Dictionary wurde gelöscht", { variant: "success" });
            navigate("/");
        } catch (error: any) {
            enqueueSnackbar("Fehler beim Löschen des Dictionary", { variant: "error" });
        }
    }, [deleteEntry, id, enqueueSnackbar, navigate]);

    // Seitenwechsel Handler - lädt NUR die Konzepte neu!
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        // Nur conceptsData Query wird neu ausgeführt, Dictionary-Daten bleiben unverändert!
    }, []);

    // Error handling
    const error = dictionaryError || conceptsError;
    if (error) {
        enqueueSnackbar("Fehler beim Laden des Dictionary", { variant: "error" });
    }

    // Loading fallback - nur wenn Dictionary-Grunddaten fehlen
    if (dictionaryLoading && !dictionaryData) {
        return (
            <FormView>
                <Typography component="div"><T keyName="dictionary.loading" /></Typography>
            </FormView>
        );
    }

    if (!entry) {
        return (
            <FormView>
                <Typography component="div"><T keyName="dictionary.not_found" /></Typography>
            </FormView>
        );
    }

    // Format der Konzepte für PagedRelatingRecordsFormSet
    // Verwende erfolgreiche Daten beim Loading um Flackern zu vermeiden
    const currentConcepts = conceptsLoading ? lastSuccessfulConcepts : (conceptsData?.node?.concepts?.nodes || []);
    const hasValidConceptsData = conceptsData?.node?.concepts !== undefined;
    
    // Verwende stabile Pagination-Daten beim Loading
    const currentTotalElements = conceptsLoading ? 
        lastSuccessfulPageInfo.totalElements : 
        (conceptsData?.node?.concepts?.totalElements || 0);
    const currentTotalPages = conceptsLoading ?
        lastSuccessfulPageInfo.totalPages :
        Math.ceil((conceptsData?.node?.concepts?.totalElements || 0) / pageSize);
    
    const conceptsForDisplay = {
        nodes: currentConcepts,
        pageInfo: {
            pageNumber: currentPage,
            pageSize: pageSize,
            totalPages: currentTotalPages,
            hasNext: (currentPage + 1) * pageSize < currentTotalElements,
            hasPrevious: currentPage > 0
        },
        totalElements: currentTotalElements
    };

    return (
        <FormView>
            {/* Name lädt nur einmal aus dictionaryData */}
            <NameFormSet
                catalogEntryId={id}
                names={entry?.name?.texts || []}
                refetch={refetchDictionary}
            />

            {/* Konzepte mit besserer Loading-Behandlung */}
            <PagedRelatingRecordsFormSet
                title={
                    <Typography component="div">
                        <b><T keyName="concept.titlePlural" /></b>
                        <T keyName="dictionary.related_concepts"/>
                    </Typography>
                }
                emptyMessage={
                    // Zeige "keine Konzepte" nur wenn wir sicher sind, dass es keine gibt
                    conceptsLoading && !hasValidConceptsData ? 
                        <Typography variant="body2" color="textSecondary" component="div">
                            <T keyName="pagination.loading_concepts" />
                        </Typography> :
                        <T keyName="dictionary.no_related_concepts"/>
                }
                concepts={conceptsForDisplay}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isLoading={conceptsLoading}
            />

            {/* Meta lädt nur einmal aus dictionaryData */}
            <MetaFormSet entry={entry as unknown as ItemPropsFragment & MetaPropsFragment} />

            <Button
                variant="contained"
                color="primary"
                startIcon={<DeleteForeverIcon />}
                onClick={handleOnDelete}
            >
                <T keyName="delete.delete_button">Löschen</T>
            </Button>
        </FormView>
    );
}

export default DictionaryForm;