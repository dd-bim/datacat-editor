/**
 * InferredPropertiesView - Zeigt von Superklassen abgeleitete Merkmale an
 * 
 * Diese Komponente sammelt alle Merkmale von Superklassen (rekursiv über alle Hierarchieebenen)
 * und zeigt sie als unveränderbare Chips unterhalb der direkten Merkmale an.
 * 
 * Die Rekursion durchläuft die gesamte Vererbungshierarchie:
 * - Direkte Superklassen
 * - Superklassen der Superklassen
 * - Und alle weiteren Ebenen bis zur Wurzel
 * 
 * Ein Zyklus-Schutz verhindert Endlosschleifen bei zirkulären Hierarchien.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { 
    SubjectDetailPropsFragment,
    GetSubjectEntryDocument,
    PropertyPropsFragment
} from '../generated/graphql';
import { 
    Box, 
    Paper, 
    Typography, 
    Chip,
    Tooltip,
    CircularProgress
} from '@mui/material';
import { T } from '@tolgee/react';
import FormSet, { FormSetTitle } from '../components/forms/FormSet';
import { PropertyEntity, getEntityType } from '../domain';
import InheritanceIcon from '@mui/icons-material/SubdirectoryArrowRight';
import ConceptChip from '../components/ConceptChip';

export type InferredPropertiesViewProps = {
    entry: SubjectDetailPropsFragment;
};

type InferredProperty = {
    property: PropertyPropsFragment;
    inheritedFrom: string[]; // Namen der Superklassen, von denen geerbt wurde
};

// Hook zum rekursiven Laden aller Superklassen (über alle Ebenen)
function useAllSuperClasses(entry: SubjectDetailPropsFragment) {
    const client = useApolloClient();
    const [superClasses, setSuperClasses] = useState<SubjectDetailPropsFragment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        let isMounted = true;
        
        const loadAllSuperClasses = async () => {
            setIsLoading(true);
            const loaded = new Map<string, SubjectDetailPropsFragment>();
            const toProcess = new Set<string>();
            const visited = new Set<string>([entry.id]);
            
            // Sammle initial direkte Superklassen-IDs
            (entry.connectingSubjects ?? [])
                .filter(rel => {
                    const relTyped = rel as any;
                    return relTyped.relationshipType?.name === 'specializes';
                })
                .forEach(rel => {
                    const superId = rel.connectingSubject?.id;
                    if (superId) {
                        toProcess.add(superId);
                        visited.add(superId);
                    }
                });
            
            // Rekursiv alle Superklassen laden
            while (toProcess.size > 0 && isMounted) {
                const currentBatch = Array.from(toProcess);
                toProcess.clear();
                
                // Lade alle IDs in diesem Batch parallel
                const results = await Promise.all(
                    currentBatch.map(id => 
                        client.query({
                            query: GetSubjectEntryDocument,
                            variables: { id },
                            fetchPolicy: 'cache-first',
                        })
                    )
                );
                
                // Verarbeite Ergebnisse und sammle weitere Superklassen
                results.forEach(result => {
                    if (result.data?.node) {
                        const subject = result.data.node as SubjectDetailPropsFragment;
                        loaded.set(subject.id, subject);
                        
                        // Sammle Superklassen dieser Klasse
                        (subject.connectingSubjects ?? [])
                            .filter(rel => {
                                const relTyped = rel as any;
                                return relTyped.relationshipType?.name === 'specializes';
                            })
                            .forEach(rel => {
                                const superId = rel.connectingSubject?.id;
                                if (superId && !visited.has(superId)) {
                                    toProcess.add(superId);
                                    visited.add(superId);
                                }
                            });
                    }
                });
            }
            
            if (isMounted) {
                setSuperClasses(Array.from(loaded.values()));
                setIsLoading(false);
            }
        };
        
        loadAllSuperClasses();
        
        return () => {
            isMounted = false;
        };
    }, [entry, client]);

    return { isLoading, superClasses };
}

export default function InferredPropertiesView(props: InferredPropertiesViewProps) {
    const { entry } = props;
    
    const { isLoading, superClasses } = useAllSuperClasses(entry);

    // Sammle alle abgeleiteten Merkmale mit Herkunftsinformationen (rekursiv)
    const inferredProperties = useMemo(() => {
        if (isLoading) return [];
        
        const propertyMap = new Map<string, InferredProperty>();
        const directPropertyIds = new Set(
            (entry.properties ?? []).map(p => p.id)
        );
        const visited = new Set<string>();
        
        // Erstelle eine Map für schnellen Zugriff auf Superklassen
        const superClassMap = new Map<string, SubjectDetailPropsFragment>();
        superClasses.forEach(sc => superClassMap.set(sc.id, sc));

        // Rekursive Funktion zum Sammeln von Merkmalen
        const collectProperties = (
            subject: SubjectDetailPropsFragment,
            inheritancePath: string[]
        ): void => {
            if (visited.has(subject.id)) return;
            visited.add(subject.id);
            
            const className = subject.name ?? 'Unbekannt';
            const currentPath = [...inheritancePath, className];

            // Sammle Merkmale dieser Klasse
            (subject.properties ?? []).forEach(property => {
                // Überspringe Merkmale, die direkt in der aktuellen Klasse definiert sind
                if (directPropertyIds.has(property.id)) return;

                if (!propertyMap.has(property.id)) {
                    propertyMap.set(property.id, {
                        property,
                        inheritedFrom: currentPath
                    });
                } else {
                    // Wenn das Merkmal schon existiert, behalte den kürzesten Pfad
                    const existing = propertyMap.get(property.id)!;
                    if (currentPath.length < existing.inheritedFrom.length) {
                        existing.inheritedFrom = currentPath;
                    }
                }
            });

            // Rekursiv: Sammle Merkmale von Superklassen dieser Klasse
            (subject.connectingSubjects ?? [])
                .filter(rel => {
                    const relTyped = rel as any;
                    return relTyped.relationshipType?.name === 'specializes';
                })
                .forEach(rel => {
                    const superId = rel.connectingSubject?.id;
                    if (superId && superClassMap.has(superId)) {
                        collectProperties(superClassMap.get(superId)!, currentPath);
                    }
                });
        };

        // Starte mit den direkten Superklassen des aktuellen Eintrags
        (entry.connectingSubjects ?? [])
            .filter(rel => {
                const relTyped = rel as any;
                return relTyped.relationshipType?.name === 'specializes';
            })
            .forEach(rel => {
                const superId = rel.connectingSubject?.id;
                if (superId && superClassMap.has(superId)) {
                    collectProperties(superClassMap.get(superId)!, []);
                }
            });

        return Array.from(propertyMap.values())
            .sort((a, b) => a.property.name.localeCompare(b.property.name));
    }, [entry, superClasses, isLoading]);

    // Zeige nichts an, wenn keine abgeleiteten Merkmale vorhanden sind
    if (inferredProperties.length === 0) {
        return null;
    }

    return (
        <FormSet>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InheritanceIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                <FormSetTitle sx={{ mb: 0 }}>
                    <b><T keyName="property.inferred_properties">Abgeleitete Merkmale</T></b>
                </FormSetTitle>
                <Chip 
                    label={inferredProperties.length} 
                    size="small" 
                    sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        backgroundColor: 'text.secondary',
                        color: 'white',
                    }} 
                />
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        <T keyName="property.inferred_properties_description">
                            Diese Merkmale werden von Superklassen geerbt und sind nicht direkt änderbar.
                        </T>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {inferredProperties.map(({ property, inheritedFrom }) => {
                            const inheritancePath = inheritedFrom.join(' → ');
                            const tagIds = property.tags?.map(t => t.id) || [];
                            const domainEntityType = getEntityType(property.recordType, tagIds);
                            
                            return (
                                <Tooltip 
                                    key={property.id}
                                    title={
                                        <Box>
                                            <Typography variant="caption" display="block">
                                                <strong>Geerbt von:</strong>
                                            </Typography>
                                            <Typography variant="caption">
                                                {inheritancePath}
                                            </Typography>
                                        </Box>
                                    }
                                    arrow
                                >
                                    <Box sx={{ display: 'inline-block' }}>
                                        <ConceptChip
                                            conceptType={domainEntityType!}
                                            id={property.id}
                                            label={property.name}
                                            title={property.name}
                                            sx={{ margin: '3px' }}
                                        />
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Box>
                </>
            )}
        </FormSet>
    );
}
