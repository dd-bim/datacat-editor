import {
    DictionaryPropsFragment
} from "../../generated/types";
import { useDeleteEntry } from "../../hooks/useDeleteEntry";
import { Typography, Button, Alert, CircularProgress, Box, Chip } from "@mui/material";
import { useSnackbar } from "notistack";
import MetaFormSet from "../../components/forms/MetaFormSet";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NameFormSet from "../../components/forms/NameFormSet";
import { DictionaryEntity } from "../../domain";
import FormView, { FormProps } from "./FormView";
import { T } from "@tolgee/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

// MINIMALE Query nur für Dictionary ohne Concepts
const GET_DICTIONARY_BASIC = gql`
    query GetDictionaryBasic($id: ID!) {
        node: getDictionary(id: $id) {
            id
            name {
                texts {
                    language {
                        code
                    }
                    text
                }
            }
            tags {
                id
                name
            }
            recordType
            createdAt
            modifiedAt
        }
    }
`;

// Separate Query für Concept Count (ohne die Daten selbst)
const GET_DICTIONARY_CONCEPT_COUNT = gql`
    query GetDictionaryConceptCount($id: ID!) {
        node: getDictionary(id: $id) {
            concepts {
                id
                # Nur ID - keine anderen Daten
            }
        }
    }
`;


function DictionaryForm(props: FormProps<DictionaryPropsFragment>) {
    const { id } = props;
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [isProcessingConcepts, setIsProcessingConcepts] = useState(false);
    const [processedConcepts, setProcessedConcepts] = useState<any[]>([]);

    // Optimiert: Lazy Query für große Dictionaries
    const { loading, error, data, refetch } = useGetDictionaryEntryQuery({
        fetchPolicy: "cache-first",
        variables: { id },
        notifyOnNetworkStatusChange: true,
        onCompleted: (data) => {
            // Concepts asynchron verarbeiten um UI-Blocking zu vermeiden
            if (data?.node?.concepts) {
                const concepts = data.node.concepts;
                console.log(`Dictionary geladen: ${concepts.length} Konzepte`);
                
                if (concepts.length > 500) {
                    // Große Listen asynchron verarbeiten
                    setIsProcessingConcepts(true);
                    setTimeout(() => {
                        setProcessedConcepts(concepts);
                        setIsProcessingConcepts(false);
                    }, 50); // Kurze Pause um UI responsive zu halten
                } else {
                    setProcessedConcepts(concepts);
                }
            }
        }
    });
    
    let entry = data?.node as DictionaryPropsFragment | undefined;

    const [deleteEntry] = useDeleteEntry({
        cacheTypename: 'XtdDictionary',
        id
    });

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Dictionary wird geladen...</Typography>
        </Box>
    );
    
    if (error || !entry) return (
        <Alert severity="error">
            <Typography><T keyName={"error.error"} /></Typography>
        </Alert>
    );

    const handleOnUpdate = async () => {
        await refetch();
        enqueueSnackbar(<T keyName="update.update_success">Update erfolgreich.</T>);
    }

    const handleOnDelete = async () => {
        await deleteEntry({ variables: { id } });
        enqueueSnackbar(<T keyName="dictionary.delete_success">Dictionary gelöscht.</T>);
            navigate(`/${DictionaryEntity.path}`, { replace: true });
    };

    // Verwende verarbeitete Concepts anstatt direkte entry.concepts
    const conceptsToDisplay = processedConcepts.length > 0 ? processedConcepts : (entry?.concepts ?? []);
    const conceptsCount = conceptsToDisplay.length;
    const isLargeDictionary = conceptsCount > 500; // Reduziert von 1000 auf 500

    return (
        <FormView>
            {/* Warning für große Dictionaries */}
            {isLargeDictionary && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>⚠️ Großes Dictionary!</strong> {conceptsCount} Konzepte werden 
                        für optimale Performance schrittweise geladen.
                    </Typography>
                </Alert>
            )}

            <NameFormSet
                catalogEntryId={id}
                names={entry.name.texts}
                refetch={refetch}
            />

            {/* Concepts Section mit Conditional Rendering */}
            {isProcessingConcepts ? (
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <CircularProgress size={20} />
                    <Typography sx={{ ml: 2 }} variant="body2">
                        Konzepte werden verarbeitet... ({conceptsCount} Elemente)
                    </Typography>
                </Box>
            ) : (
                <LazyRelatingRecordsFormSet
                    title={<Typography><b><T keyName="concept.titlePlural" /></b><T keyName="dictionary.related_concepts"/></Typography>}
                    emptyMessage={<T keyName="dictionary.no_related_concepts"/>}
                    relatingRecords={conceptsToDisplay}
                    initialDisplayCount={isLargeDictionary ? 5 : 20} // Noch konservativer
                    incrementalLoadCount={isLargeDictionary ? 10 : 30}
                    enableLazyLoading={true}
                />
            )}

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