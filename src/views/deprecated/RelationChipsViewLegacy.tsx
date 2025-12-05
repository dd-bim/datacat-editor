import React, { useMemo, useState, useCallback } from 'react';
import { SubjectDetailPropsFragment } from '../generated/graphql';
import { 
    Box, 
    Paper, 
    Typography, 
    Chip, 
    IconButton, 
    Collapse,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { getEntityType } from '../domain';
import { T } from '@tolgee/react';
import FormSet, { FormSetTitle } from '../components/forms/FormSet';

// Relation type colors
const RELATION_COLORS = {
    superClass: '#1565C0',    // Dark Blue - inheritance up
    subClass: '#42A5F5',      // Light Blue - inheritance down
    part: '#2E7D32',          // Dark Green - has parts
    partOf: '#66BB6A',        // Light Green - is part of
    other: '#FF9800',         // Orange - other relations
};

export type RelationChipsViewProps = {
    entry: SubjectDetailPropsFragment;
};

type RelationData = {
    id: string;
    name: string;
    recordType: string;
    tags: Array<{ id: string; name: string }>;
    relationType: 'subClass' | 'superClass' | 'part' | 'partOf' | 'other';
    relationName: string;
};

export default function RelationChipsView(props: RelationChipsViewProps) {
    const { entry } = props;
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(true);

    // Extract all relations from the entry
    const relations = useMemo((): RelationData[] => {
        const result: RelationData[] = [];

        // ConnectedSubjects (outgoing relations: subClasses, partOf, other)
        (entry.connectedSubjects ?? []).forEach(rel => {
            const relationName = rel.relationshipType?.name;
            if (!relationName) return;
            
            (rel.targetSubjects ?? []).forEach(target => {
                let relationType: RelationData['relationType'] = 'other';
                
                if (relationName === 'specializes') {
                    relationType = 'subClass';
                } else if (relationName === 'partOf') {
                    relationType = 'partOf';
                }

                result.push({
                    id: target.id,
                    name: target.name ?? 'Unknown',
                    recordType: target.recordType,
                    tags: target.tags ?? [],
                    relationType,
                    relationName,
                });
            });
        });

        // ConnectingSubjects (incoming relations: superClasses, parts)
        (entry.connectingSubjects ?? []).forEach(rel => {
            const relationName = rel.relationshipType?.name;
            const connectingSubject = rel.connectingSubject;
            if (!relationName) return;
            
            if (connectingSubject) {
                let relationType: RelationData['relationType'] = 'other';
                
                if (relationName === 'specializes') {
                    relationType = 'superClass';
                } else if (relationName === 'partOf') {
                    relationType = 'part';
                }

                result.push({
                    id: connectingSubject.id,
                    name: connectingSubject.name ?? 'Unknown',
                    recordType: connectingSubject.recordType,
                    tags: connectingSubject.tags ?? [],
                    relationType,
                    relationName,
                });
            }
        });

        return result;
    }, [entry]);

    // Group relations by type
    const groupedRelations = useMemo(() => ({
        superClasses: relations.filter(r => r.relationType === 'superClass'),
        subClasses: relations.filter(r => r.relationType === 'subClass'),
        parts: relations.filter(r => r.relationType === 'part'),
        partOf: relations.filter(r => r.relationType === 'partOf'),
        others: relations.filter(r => r.relationType === 'other'),
    }), [relations]);

    // Handle chip click for navigation
    const handleChipClick = useCallback((relation: RelationData) => {
        const definition = getEntityType(relation.recordType, relation.tags.map(t => t.id));
        navigate(`/${definition.path}/${relation.id}`);
    }, [navigate]);

    if (relations.length === 0) {
        return null;
    }

    const renderRelationCard = (
        title: React.ReactNode,
        icon: React.ReactNode,
        relations: RelationData[],
        color: string,
        tooltipText: string
    ) => {
        if (relations.length === 0) return null;

        return (
            <Box sx={{ flex: '1 1 300px', minWidth: 250, maxWidth: 400 }}>
                <Paper 
                    variant="outlined" 
                    sx={{ 
                        p: 1.5, 
                        height: '100%',
                        borderLeft: `4px solid ${color}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Tooltip title={tooltipText}>
                            <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
                                {icon}
                            </Box>
                        </Tooltip>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {title}
                        </Typography>
                        <Chip 
                            label={relations.length} 
                            size="small" 
                            sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                backgroundColor: color,
                                color: 'white',
                            }} 
                        />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {relations.map((rel, index) => (
                            <Chip
                                key={`${rel.id}-${index}`}
                                label={rel.name}
                                size="small"
                                onClick={() => handleChipClick(rel)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: color,
                                        color: 'white',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </Paper>
            </Box>
        );
    };

    return (
        <FormSet>
            <FormSetTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon fontSize="small" />
                        <b><T keyName="class.relation_overview">Relationsübersicht</T></b>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={`${relations.length} Relationen`} 
                            size="small" 
                            variant="outlined" 
                        />
                        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                </Box>
            </FormSetTitle>
            
            <Collapse in={expanded}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {renderRelationCard(
                        <T keyName="class.superclasses">Superklassen</T>,
                        <ArrowUpwardIcon fontSize="small" />,
                        groupedRelations.superClasses,
                        RELATION_COLORS.superClass,
                        'Diese Klasse spezialisiert diese Klassen (Vererbung aufwärts)'
                    )}
                    {renderRelationCard(
                        <T keyName="class.subclasses">Subklassen</T>,
                        <ArrowDownwardIcon fontSize="small" />,
                        groupedRelations.subClasses,
                        RELATION_COLORS.subClass,
                        'Diese Klassen spezialisieren diese Klasse (Vererbung abwärts)'
                    )}
                    {renderRelationCard(
                        <T keyName="class.parts">Hat Teile</T>,
                        <CallSplitIcon fontSize="small" />,
                        groupedRelations.parts,
                        RELATION_COLORS.part,
                        'Diese Klassen sind Teil von dieser Klasse'
                    )}
                    {renderRelationCard(
                        <T keyName="class.partof">Teil von</T>,
                        <CallMergeIcon fontSize="small" />,
                        groupedRelations.partOf,
                        RELATION_COLORS.partOf,
                        'Diese Klasse ist Teil von diesen Klassen'
                    )}
                    {/* Other relations grouped by relation name */}
                    {Object.entries(
                        groupedRelations.others.reduce((acc, rel) => {
                            if (!acc[rel.relationName]) acc[rel.relationName] = [];
                            acc[rel.relationName].push(rel);
                            return acc;
                        }, {} as Record<string, RelationData[]>)
                    ).map(([relationName, rels]) => 
                        renderRelationCard(
                            relationName,
                            <LinkIcon fontSize="small" />,
                            rels,
                            RELATION_COLORS.other,
                            `Relation: ${relationName}`
                        )
                    )}
                </Box>
            </Collapse>
        </FormSet>
    );
}