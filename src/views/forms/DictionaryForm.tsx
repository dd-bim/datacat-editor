import {
    useGetDictionaryEntryQuery,
    DictionaryDetailPropsFragment,
    ConceptPropsFragment
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
import React, { useState, useCallback, useMemo } from "react";


function DictionaryForm(props: FormProps<DictionaryDetailPropsFragment>) {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 20; // Performance-optimierte Seitengröße
    
    // Dictionary mit allen Konzepten laden - einmalig
    const { 
        data: dictionaryData, 
        loading: dictionaryLoading, 
        error: dictionaryError, 
        refetch: refetchDictionary 
    } = useGetDictionaryEntryQuery({
        variables: { id },
        errorPolicy: 'all'
    });

    // Dictionary-Grunddaten
    const entry = dictionaryData?.node as DictionaryDetailPropsFragment | undefined;
    
    // Alle Konzepte aus der Response
    const allConcepts = useMemo(() => {
        return entry?.concepts || [];
    }, [entry?.concepts]);
    
    // Client-seitige Pagination der Konzepte
    const paginatedConcepts = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const concepts = allConcepts.slice(startIndex, endIndex);
        
        return {
            nodes: concepts,
            pageInfo: {
                pageNumber: currentPage,
                pageSize: pageSize,
                totalPages: Math.ceil(allConcepts.length / pageSize),
                hasNext: endIndex < allConcepts.length,
                hasPrevious: currentPage > 0
            },
            totalElements: allConcepts.length
        };
    }, [allConcepts, currentPage, pageSize]);

    // Pagination Handler
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        // Konzepte werden automatisch neu geladen durch die Query
    }, []);

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

    // Error handling mit useEffect
    React.useEffect(() => {
        if (dictionaryError && !dictionaryData) {
            enqueueSnackbar("Fehler beim Laden des Dictionary", { variant: "error" });
        }
    }, [dictionaryError, dictionaryData, enqueueSnackbar]);

    // Loading fallback - nur wenn Dictionary-Grunddaten fehlen
    if (dictionaryLoading && !dictionaryData) {
        return (
            <FormView>
                <Typography><T keyName="dictionary.loading" /></Typography>
            </FormView>
        );
    }

    if (!entry) {
        return (
            <FormView>
                <Typography><T keyName="dictionary.not_found" /></Typography>
            </FormView>
        );
    }

    return (
        <FormView>
            {/* Name */}
            <NameFormSet
                catalogEntryId={id}
                names={entry?.name?.texts || []}
                refetch={refetchDictionary}
            />

            {/* Konzepte mit automatischem Lazy Loading */}
            <PagedRelatingRecordsFormSet
                title={<Typography component="div"><b><T keyName="concept.titlePlural" /></b> <T keyName="dictionary.related_concepts"/></Typography>}
                emptyMessage={<T keyName="dictionary.no_related_concepts"/>}
                concepts={paginatedConcepts}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isLoading={dictionaryLoading}
            />

            {/* Meta */}
            <MetaFormSet entry={entry} />

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
