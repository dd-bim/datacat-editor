import React, { useMemo, useCallback, useState } from 'react';
import {
    ReactFlow,
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SubjectDetailPropsFragment } from '../generated/graphql';
import { Box, Paper, Typography, IconButton, Collapse, Chip, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';
import { getEntityType } from '../domain';
import { T, useTranslate } from '@tolgee/react';
import FormSet, { FormSetTitle } from '../components/forms/FormSet';

// Relation type colors (consistent with RelationChipsViewEditable)
const RELATION_COLORS = {
    superClass: '#1565C0',   // Dark Blue - superclasses (incoming specializes)
    subClass: '#42A5F5',     // Light Blue - subclasses (outgoing specializes)
    part: '#2E7D32',         // Dark Green - parts (incoming partOf)
    partOf: '#66BB6A',       // Light Green - partOf (outgoing)
    other: '#FB8C00',        // Light Orange - outgoing other relations
    otherIncoming: '#FFB74D', // Lighter Orange - incoming other relations
    hasPropertyGroup: '#D32F2F', // Red - hasPropertyGroup relations
};

// Node dimensions (approximate)
const NODE_WIDTH = 150;  // Approximate width of a node
const CENTER_NODE_HALF_WIDTH = 75; // Half width of center node (for spacing calculation)

// Helper to estimate text width in pixels (approximate)
const estimateTextWidth = (text: string, fontSize: number = 10): number => {
    // Average character width is approximately 0.6 * fontSize for most fonts
    return text.length * fontSize * 0.6;
};

// Calculate horizontal spacing based on relation name length
// This returns the distance from CENTER of the central node to the LEFT EDGE of the target node
const calculateHorizontalSpacing = (relationName: string, margin: number = 40): number => {
    const textWidth = estimateTextWidth(relationName, 10);
    // Center node half width + margin + text width + margin + target node width
    const spacing = CENTER_NODE_HALF_WIDTH + margin + textWidth + margin + NODE_WIDTH;
    return Math.max(200, spacing);
};

// Type for handle counts per side
type HandleCounts = {
    top: number;       // superclasses coming in
    topSource: number; // (not used, superclasses are incoming)
    bottom: number;    // (not used)
    bottomSource: number; // subclasses going out + hasPropertyGroup
    left: number;      // incoming other relations
    leftSource: number; // other relations going out
    right: number;     // parts coming in
    rightSource: number; // partOf going out
    // Combined count for right side (parts + partOf)
    rightTotal: number;
    // Combined count for left side (other outgoing + other incoming)
    leftTotal: number;
};

// Custom node component for classes with dynamic handles
const ClassNode = ({ data }: { data: { 
    label: string; 
    isCenter: boolean; 
    recordType?: string; 
    tags?: Array<{ id: string }>;
    handleCounts?: HandleCounts;
} }) => {
    const theme = useTheme();
    
    // Generate dynamic handles for center node
    const renderDynamicHandles = () => {
        if (!data.isCenter || !data.handleCounts) {
            // Non-center nodes: simple handles at center of each edge
            return (
                <>
                    <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
                    <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
                    <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
                    <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
                    <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0 }} />
                    <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ opacity: 0 }} />
                    <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0 }} />
                    <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0 }} />
                </>
            );
        }

        const handles: React.ReactNode[] = [];
        const counts = data.handleCounts;

        // Helper to calculate position offset (distribute evenly across edge)
        const getPositionPercent = (index: number, total: number): string => {
            if (total === 1) return '50%';
            // Distribute from 20% to 80% of the edge
            const start = 20;
            const end = 80;
            const step = (end - start) / (total - 1);
            return `${start + index * step}%`;
        };

        // Top handles (incoming from superclasses)
        for (let i = 0; i < counts.top; i++) {
            handles.push(
                <Handle 
                    key={`top-${i}`}
                    type="target" 
                    position={Position.Top} 
                    id={`top-${i}`} 
                    style={{ opacity: 0, left: getPositionPercent(i, counts.top) }} 
                />
            );
        }

        // Bottom target handles (incoming from other relations)
        for (let i = 0; i < counts.bottom; i++) {
            handles.push(
                <Handle 
                    key={`bottom-${i}`}
                    type="target" 
                    position={Position.Bottom} 
                    id={`bottom-${i}`} 
                    style={{ opacity: 0, left: getPositionPercent(i, counts.bottom) }} 
                />
            );
        }

        // Bottom source handles (outgoing to subclasses)
        for (let i = 0; i < counts.bottomSource; i++) {
            handles.push(
                <Handle 
                    key={`bottom-source-${i}`}
                    type="source" 
                    position={Position.Bottom} 
                    id={`bottom-source-${i}`} 
                    style={{ opacity: 0, left: getPositionPercent(i, counts.bottomSource) }} 
                />
            );
        }

        // Right side handles - distribute ALL right handles together (parts incoming + partOf outgoing)
        // First come parts (target), then partOf (source)
        const rightTotal = counts.rightTotal;
        
        // Right target handles (incoming from parts) - use combined index
        for (let i = 0; i < counts.right; i++) {
            handles.push(
                <Handle 
                    key={`right-${i}`}
                    type="target" 
                    position={Position.Right} 
                    id={`right-${i}`} 
                    style={{ opacity: 0, top: getPositionPercent(i, rightTotal) }} 
                />
            );
        }

        // Right source handles (outgoing to partOf) - continue from where parts left off
        for (let i = 0; i < counts.rightSource; i++) {
            const combinedIndex = counts.right + i; // Continue after parts
            handles.push(
                <Handle 
                    key={`right-source-${i}`}
                    type="source" 
                    position={Position.Right} 
                    id={`right-source-${i}`} 
                    style={{ opacity: 0, top: getPositionPercent(combinedIndex, rightTotal) }} 
                />
            );
        }

        // Left side handles - distribute ALL left handles together (other outgoing + other incoming)
        const leftTotal = counts.leftTotal;
        
        // Left source handles (outgoing to other relations)
        for (let i = 0; i < counts.leftSource; i++) {
            handles.push(
                <Handle 
                    key={`left-source-${i}`}
                    type="source" 
                    position={Position.Left} 
                    id={`left-source-${i}`} 
                    style={{ opacity: 0, top: getPositionPercent(i, leftTotal) }} 
                />
            );
        }
        
        // Left target handles (incoming from other relations) - continue from where outgoing left off
        for (let i = 0; i < counts.left; i++) {
            const combinedIndex = counts.leftSource + i; // Continue after outgoing
            handles.push(
                <Handle 
                    key={`left-${i}`}
                    type="target" 
                    position={Position.Left} 
                    id={`left-${i}`} 
                    style={{ opacity: 0, top: getPositionPercent(combinedIndex, leftTotal) }} 
                />
            );
        }

        return handles;
    };
    
    return (
        <Box
            sx={{
                padding: '10px 16px',
                borderRadius: 2,
                border: data.isCenter ? '2px solid' : '1px solid',
                borderColor: data.isCenter ? 'primary.main' : 'divider',
                backgroundColor: data.isCenter ? 'primary.main' : 'primary.light',
                color: data.isCenter ? 'primary.contrastText' : 'text.primary',
                minWidth: 120,
                textAlign: 'center',
                cursor: data.isCenter ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': data.isCenter ? {} : {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                },
            }}
        >
            {renderDynamicHandles()}
            <Typography 
                variant="body2" 
                fontWeight={data.isCenter ? 600 : 400}
                noWrap
                sx={{ maxWidth: 150 }}
            >
                {data.label}
            </Typography>
        </Box>
    );
};

const nodeTypes = {
    classNode: ClassNode,
};

export type RelationGraphViewProps = {
    entry: SubjectDetailPropsFragment;
};

type RelationData = {
    id: string;
    name: string;
    recordType: string;
    tags: Array<{ id: string; name: string }>;
    relationType: 'subClass' | 'superClass' | 'part' | 'partOf' | 'other' | 'otherIncoming' | 'hasPropertyGroup';
    relationName: string;
};

export default function RelationGraphView(props: RelationGraphViewProps) {
    const { entry } = props;
    const navigate = useNavigate();
    const theme = useTheme();
    const { t } = useTranslate();
    const [expanded, setExpanded] = useState(true);

    // Extract all relations from the entry
    const relations = useMemo((): RelationData[] => {
        const result: RelationData[] = [];

        // ConnectedSubjects (outgoing relations: subClasses, partOf, other, hasPropertyGroup)
        (entry.connectedSubjects ?? []).forEach(rel => {
            const relationName = (rel as any).relationshipType?.name;
            
            // Skip relations without a name
            if (!relationName) return;
            
            (rel.targetSubjects ?? []).forEach(target => {
                let relationType: RelationData['relationType'] = 'other';
                
                if (relationName === 'specializes') {
                    relationType = 'subClass';
                } else if (relationName === 'partOf') {
                    relationType = 'partOf';
                } else if (relationName === 'hasPropertyGroup') {
                    relationType = 'hasPropertyGroup';
                }

                result.push({
                    id: target.id,
                    name: target.name ?? 'Unknown',
                    recordType: (target as any).recordType,
                    tags: target.tags ?? [],
                    relationType,
                    relationName,
                });
            });
        });

        // ConnectingSubjects (incoming relations: superClasses, parts, otherIncoming)
        (entry.connectingSubjects ?? []).forEach(rel => {
            const relationName = (rel as any).relationshipType?.name;
            const connectingSubject = rel.connectingSubject;
            
            // Skip relations without a name
            if (!relationName) return;
            
            if (connectingSubject) {
                let relationType: RelationData['relationType'] = 'otherIncoming';
                
                if (relationName === 'specializes') {
                    relationType = 'superClass';
                } else if (relationName === 'partOf') {
                    relationType = 'part';
                }

                result.push({
                    id: connectingSubject.id,
                    name: connectingSubject.name ?? 'Unknown',
                    recordType: (connectingSubject as any).recordType,
                    tags: connectingSubject.tags ?? [],
                    relationType,
                    relationName,
                });
            }
        });

        return result;
    }, [entry]);

    // Create nodes and edges for React Flow
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Center node (current class)
        const centerX = 300;
        const centerY = 250;

        // Group relations by type for positioning
        const superClasses = relations.filter(r => r.relationType === 'superClass');
        const subClasses = relations.filter(r => r.relationType === 'subClass');
        const parts = relations.filter(r => r.relationType === 'part');
        const partOf = relations.filter(r => r.relationType === 'partOf');
        const others = relations.filter(r => r.relationType === 'other');
        const othersIncoming = relations.filter(r => r.relationType === 'otherIncoming');
        const hasPropertyGroups = relations.filter(r => r.relationType === 'hasPropertyGroup');

        // Calculate handle counts for center node
        const handleCounts: HandleCounts = {
            top: superClasses.length,
            topSource: 0,
            bottom: 0,
            bottomSource: subClasses.length + hasPropertyGroups.length,
            left: othersIncoming.length,
            leftSource: others.length,
            right: parts.length,
            rightSource: partOf.length,
            rightTotal: parts.length + partOf.length, // Combined for right side distribution
            leftTotal: others.length + othersIncoming.length, // Combined for left side distribution
        };
        
        nodes.push({
            id: entry.id,
            type: 'classNode',
            position: { x: centerX, y: centerY },
            data: { 
                label: entry.name ?? 'Unknown',
                isCenter: true,
                handleCounts,
            },
        });

        // Spacing constants for better visibility of arrows and labels
        const verticalSpacing = 150;   // Distance for super/subclasses
        const nodeSpacingVertical = 80; // Spacing between multiple nodes in same group
        const margin = 60;             // Margin around relation labels

        // Calculate horizontal spacing based on longest relation name for each side
        const rightRelationName = 'partOf'; // parts and partOf both use "partOf" label
        const longestOtherName = others.length > 0 
            ? others.reduce((longest, rel) => rel.relationName.length > longest.length ? rel.relationName : longest, '')
            : '';
        
        const rightSpacing = calculateHorizontalSpacing(rightRelationName, margin);
        const leftSpacing = longestOtherName 
            ? calculateHorizontalSpacing(longestOtherName, margin)
            : rightSpacing; // Use same as right if no other relations

        // Position superclasses above (arrow points down: superclass -> this class)
        superClasses.forEach((rel, index) => {
            const x = centerX + (index - (superClasses.length - 1) / 2) * 180;
            nodes.push({
                id: rel.id,
                type: 'classNode',
                position: { x, y: centerY - verticalSpacing },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${rel.id}-${entry.id}-super`,
                source: rel.id,
                target: entry.id,
                sourceHandle: 'bottom-source',
                targetHandle: `top-${index}`,
                label: 'specializes',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.superClass },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.superClass, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.superClass },
            });
        });

        // Position subclasses below (arrow points down: this class -> subclass)
        subClasses.forEach((rel, index) => {
            const x = centerX + (index - (subClasses.length - 1) / 2) * 180;
            nodes.push({
                id: rel.id,
                type: 'classNode',
                position: { x, y: centerY + verticalSpacing },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${entry.id}-${rel.id}-sub`,
                source: entry.id,
                target: rel.id,
                sourceHandle: `bottom-source-${index}`,
                targetHandle: 'top',
                label: 'specializes',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.subClass },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.subClass, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.subClass },
            });
        });

        // Position parts to the right (parts that point TO this class with partOf)
        // Arrow: part -> this class (part is partOf this class)
        parts.forEach((rel, index) => {
            const y = centerY + (index - (parts.length - 1) / 2) * nodeSpacingVertical;
            nodes.push({
                id: rel.id,
                type: 'classNode',
                position: { x: centerX + rightSpacing, y },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${rel.id}-${entry.id}-part`,
                source: rel.id,
                target: entry.id,
                sourceHandle: 'left-source',
                targetHandle: `right-${index}`,
                label: 'partOf',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.part },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.part, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.part },
            });
        });

        // Position partOf to the right (this class is partOf these)
        // Arrow: this class -> target (this class is partOf target)
        partOf.forEach((rel, index) => {
            const y = centerY + (index - (partOf.length - 1) / 2) * nodeSpacingVertical + (parts.length * nodeSpacingVertical);
            nodes.push({
                id: rel.id,
                type: 'classNode',
                position: { x: centerX + rightSpacing, y },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${entry.id}-${rel.id}-partof`,
                source: entry.id,
                target: rel.id,
                sourceHandle: `right-source-${index}`,
                targetHandle: 'left',
                label: 'partOf',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.partOf },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.partOf, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.partOf },
            });
        });

        // Position other relations to the left (outgoing)
        others.forEach((rel, index) => {
            const y = centerY + (index - (others.length - 1) / 2) * nodeSpacingVertical;
            
            nodes.push({
                id: `other-${rel.id}-${index}`,
                type: 'classNode',
                position: { x: centerX - leftSpacing, y },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${entry.id}-${rel.id}-other-${index}`,
                source: entry.id,
                target: `other-${rel.id}-${index}`,
                sourceHandle: `left-source-${index}`,
                targetHandle: 'right',
                label: rel.relationName,
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.other },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.other, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.other },
            });
        });

        // Position incoming other relations to the left (incoming)
        // Arrow: other-in -> this class
        othersIncoming.forEach((rel, index) => {
            const y = centerY + (index - (othersIncoming.length - 1) / 2) * nodeSpacingVertical + (others.length * nodeSpacingVertical);
            nodes.push({
                id: `other-in-${rel.id}-${index}`,
                type: 'classNode',
                position: { x: centerX - leftSpacing, y },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${rel.id}-${entry.id}-other-in-${index}`,
                source: `other-in-${rel.id}-${index}`,
                target: entry.id,
                sourceHandle: 'right-source',
                targetHandle: `left-${index}`,
                label: rel.relationName,
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.otherIncoming },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.otherIncoming, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.otherIncoming },
            });
        });

        // Position hasPropertyGroup relations below (arrow points down: this class -> property group)
        hasPropertyGroups.forEach((rel, index) => {
            const handleIndex = subClasses.length + index; // Continue after subClasses
            const x = centerX + (index - (hasPropertyGroups.length - 1) / 2) * 180;
            nodes.push({
                id: `prop-group-${rel.id}-${index}`,
                type: 'classNode',
                position: { x, y: centerY + verticalSpacing + 80 },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });
            edges.push({
                id: `e-${entry.id}-${rel.id}-propgroup-${index}`,
                source: entry.id,
                target: `prop-group-${rel.id}-${index}`,
                sourceHandle: `bottom-source-${handleIndex}`,
                targetHandle: 'top',
                label: 'hasPropertyGroup',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.hasPropertyGroup },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.hasPropertyGroup, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.hasPropertyGroup },
            });
        });

        return { initialNodes: nodes, initialEdges: edges };
    }, [entry, relations, theme]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Handle node click for navigation
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.id !== entry.id && node.data) {
            // Find the relation data for this node
            const relation = relations.find(r => 
                r.id === node.id || 
                `other-${r.id}` === node.id.split('-').slice(0, 2).join('-') ||
                `other-in-${r.id}` === node.id.split('-').slice(0, 3).join('-') ||
                `prop-group-${r.id}` === node.id.split('-').slice(0, 3).join('-')
            );
            if (relation) {
                const definition = getEntityType(relation.recordType, relation.tags.map(t => t.id));
                navigate(`/${definition.path}/${relation.id}`);
            }
        }
    }, [entry.id, relations, navigate]);

    // Count relations for summary
    const relationCounts = useMemo(() => ({
        superClasses: relations.filter(r => r.relationType === 'superClass').length,
        subClasses: relations.filter(r => r.relationType === 'subClass').length,
        parts: relations.filter(r => r.relationType === 'part').length,
        partOf: relations.filter(r => r.relationType === 'partOf').length,
        others: relations.filter(r => r.relationType === 'other').length,
        othersIncoming: relations.filter(r => r.relationType === 'otherIncoming').length,
        hasPropertyGroups: relations.filter(r => r.relationType === 'hasPropertyGroup').length,
        total: relations.length,
    }), [relations]);

    if (relations.length === 0) {
        return null; // Don't show if no relations
    }

    return (
        <FormSet>
            <FormSetTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <b><T keyName="class.relation_graph">Beziehungsgraph</T></b>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={`${relationCounts.total} ${t('class.relations', 'Relationen')}`} 
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
                {/* Legend */}
                <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.superClass, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="class.superclasses">Superklassen</T> ({relationCounts.superClasses})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.subClass, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="class.subclasses">Subklassen</T> ({relationCounts.subClasses})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.part, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="class.parts">Hat Teile</T> ({relationCounts.parts})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.partOf, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="class.partof">Teil von</T> ({relationCounts.partOf})</Typography>
                    </Box>
                    {relationCounts.others > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.other, borderRadius: 1 }} />
                            <Typography variant="caption"><T keyName="class.otherRelations">Andere</T> ({relationCounts.others})</Typography>
                        </Box>
                    )}
                    {relationCounts.othersIncoming > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.otherIncoming, borderRadius: 1 }} />
                            <Typography variant="caption"><T keyName="class.otherRelations">Andere</T> (<T keyName="class.incoming">eingehend</T>: {relationCounts.othersIncoming})</Typography>
                        </Box>
                    )}
                    {relationCounts.hasPropertyGroups > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.hasPropertyGroup, borderRadius: 1 }} />
                            <Typography variant="caption"><T keyName="class.property_groups">Merkmalsgruppen</T> ({relationCounts.hasPropertyGroups})</Typography>
                        </Box>
                    )}
                </Box>

                {/* Graph */}
                <Paper 
                    variant="outlined" 
                    sx={{ 
                        height: 400, 
                        width: '100%',
                        overflow: 'hidden',
                        borderRadius: 1,
                    }}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        minZoom={0.5}
                        maxZoom={1.5}
                        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color={theme.palette.divider} gap={16} />
                        <Controls showInteractive={false} />
                        <MiniMap 
                            nodeColor={(node) => node.data?.isCenter ? theme.palette.primary.main : theme.palette.grey[300]}
                            maskColor={theme.palette.action.hover}
                            style={{ backgroundColor: theme.palette.background.paper }}
                        />
                    </ReactFlow>
                </Paper>
            </Collapse>
        </FormSet>
    );
}
