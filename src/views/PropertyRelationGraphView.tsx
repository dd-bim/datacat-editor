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
import { PropertyDetailPropsFragment, XtdPropertyRelationshipTypeEnum } from '../generated/graphql';
import { Box, Paper, Typography, IconButton, Collapse, Chip, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';
import { getEntityType } from '../domain';
import { T, useTranslate } from '@tolgee/react';
import FormSet, { FormSetTitle } from '../components/forms/FormSet';
import { 
    calculateHorizontalSpacing, 
    getPositionPercent, 
    renderSimpleHandles, 
    GraphNodeBox,
    type GraphNodeData 
} from './relationGraphUtils';

// Relation type colors (consistent with PropertyRelationChipsViewEditable)
const RELATION_COLORS = {
    superProperty: '#1565C0',      // Dark Blue - super properties (incoming specializes)
    subProperty: '#42A5F5',        // Light Blue - sub properties (outgoing specializes)
    dependsOn: '#FF9800',          // Orange - outgoing depends
};

// Type for handle counts per side
type HandleCounts = {
    top: number;       // super properties coming in
    topSource: number; // (not used, super properties are incoming)
    bottom: number;    // (not used)
    bottomSource: number; // sub properties going out
    left: number;      // (not used)
    leftSource: number; // outgoing depends (dependsOn)
    right: number;     // (not used)
    rightSource: number; // (not used)
};

// Custom node component for properties with dynamic handles
interface PropertyNodeData extends GraphNodeData {
    handleCounts?: HandleCounts;
}

const PropertyNode = ({ data }: { data: PropertyNodeData }) => {
    // Generate dynamic handles for center node
    const renderDynamicHandles = () => {
        if (!data.isCenter || !data.handleCounts) {
            return renderSimpleHandles();
        }

        const handles: React.ReactNode[] = [];
        const counts = data.handleCounts;

        // Top handles (incoming from super properties)
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

        // Bottom source handles (outgoing to sub properties)
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

        // Left source handles (outgoing depends)
        for (let i = 0; i < counts.leftSource; i++) {
            handles.push(
                <Handle 
                    key={`left-source-${i}`}
                    type="source" 
                    position={Position.Left} 
                    id={`left-source-${i}`} 
                    style={{ opacity: 0, top: getPositionPercent(i, counts.leftSource) }} 
                />
            );
        }

        return handles;
    };
    
    return (
        <GraphNodeBox data={data}>
            {renderDynamicHandles()}
        </GraphNodeBox>
    );
};

const nodeTypes = {
    propertyNode: PropertyNode,
};

export type PropertyRelationGraphViewProps = {
    entry: PropertyDetailPropsFragment;
};

type RelationData = {
    id: string;
    name: string;
    recordType: string;
    tags: Array<{ id: string; name: string }>,
    relationType: 'subProperty' | 'superProperty' | 'dependsOn';
};

export default function PropertyRelationGraphView(props: PropertyRelationGraphViewProps) {
    const { entry } = props;
    const navigate = useNavigate();
    const theme = useTheme();
    const { t } = useTranslate();
    const [expanded, setExpanded] = useState(true);

    // Extract all relations from the entry
    const relations = useMemo((): RelationData[] => {
        const result: RelationData[] = [];

        // ConnectedProperties (outgoing relations: subProperties via Specializes, dependsOn via Depends)
        (entry.connectedProperties ?? []).forEach(rel => {
            const relationshipType = rel.relationshipType;
            if (!relationshipType) return;
            
            (rel.targetProperties ?? []).forEach(target => {
                const data: RelationData = {
                    id: target.id,
                    name: target.name ?? 'Unknown',
                    recordType: (target as any).recordType,
                    tags: target.tags ?? [],
                    relationType: relationshipType === XtdPropertyRelationshipTypeEnum.XtdSpecializes 
                        ? 'subProperty' 
                        : 'dependsOn',
                };
                result.push(data);
            });
        });

        // ConnectingProperties (incoming relations: superProperties via Specializes)
        (entry.connectingProperties ?? []).forEach(rel => {
            const relationshipType = rel.relationshipType;
            const connectingProperty = (rel as any).connectingProperty;
            if (!relationshipType || !connectingProperty) return;
            
            // Only process Specializes relationships (superProperties)
            if (relationshipType === XtdPropertyRelationshipTypeEnum.XtdSpecializes) {
                const data: RelationData = {
                    id: connectingProperty.id,
                    name: connectingProperty.name ?? 'Unknown',
                    recordType: connectingProperty.recordType,
                    tags: connectingProperty.tags ?? [],
                    relationType: 'superProperty',
                };
                result.push(data);
            }
        });

        return result;
    }, [entry]);

    // Create nodes and edges for React Flow
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Center node (current property)
        const centerX = 300;
        const centerY = 250;

        // Group relations by type for positioning
        const superProperties = relations.filter(r => r.relationType === 'superProperty');
        const subProperties = relations.filter(r => r.relationType === 'subProperty');
        const dependsOn = relations.filter(r => r.relationType === 'dependsOn');

        // Calculate handle counts for center node
        const handleCounts: HandleCounts = {
            top: superProperties.length,
            topSource: 0,
            bottom: 0,
            bottomSource: subProperties.length,
            left: 0,
            leftSource: dependsOn.length,
            right: 0,
            rightSource: 0,
        };
        
        nodes.push({
            id: entry.id,
            type: 'propertyNode',
            position: { x: centerX, y: centerY },
            data: { 
                label: entry.name ?? 'Unknown',
                isCenter: true,
                handleCounts,
            },
        });

        // Spacing constants for better visibility of arrows and labels
        const verticalSpacing = 150;   // Distance for super/sub properties
        const nodeSpacingVertical = 80; // Spacing between multiple nodes in same group
        const margin = 60;             // Margin around relation labels

        // Calculate horizontal spacing based on longest relation name for left side
        const leftSpacing = calculateHorizontalSpacing('depends', margin);

        // Position super properties above (arrow points down: super property -> this property)
        superProperties.forEach((rel, index) => {
            const offsetX = (superProperties.length - 1) * nodeSpacingVertical / 2 - index * nodeSpacingVertical;
            const nodeId = `super-${rel.id}`;
            
            nodes.push({
                id: nodeId,
                type: 'propertyNode',
                position: { x: centerX + offsetX, y: centerY - verticalSpacing },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });

            // Create edge from super to center (using the corresponding handle)
            edges.push({
                id: `e-${nodeId}-${entry.id}`,
                source: nodeId,
                target: entry.id,
                targetHandle: `top-${index}`,
                sourceHandle: 'bottom-source',
                label: 'specializes',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.superProperty },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.superProperty, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.superProperty },
            });
        });

        // Position sub properties below (arrow points down: this property -> sub property)
        subProperties.forEach((rel, index) => {
            const offsetX = (subProperties.length - 1) * nodeSpacingVertical / 2 - index * nodeSpacingVertical;
            const nodeId = `sub-${rel.id}`;
            
            nodes.push({
                id: nodeId,
                type: 'propertyNode',
                position: { x: centerX + offsetX, y: centerY + verticalSpacing },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });

            // Create edge from center to sub (using the corresponding handle)
            edges.push({
                id: `e-${entry.id}-${nodeId}`,
                source: entry.id,
                target: nodeId,
                sourceHandle: `bottom-source-${index}`,
                targetHandle: 'top',
                label: 'specializes',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.subProperty },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.subProperty, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.subProperty },
            });
        });

        // Position dependsOn to the left (outgoing)
        // Arrow: this property -> target (this property depends on target)
        dependsOn.forEach((rel, index) => {
            const y = centerY + (index - (dependsOn.length - 1) / 2) * 180;
            const nodeId = `depends-${rel.id}`;
            
            nodes.push({
                id: nodeId,
                type: 'propertyNode',
                position: { x: centerX - leftSpacing, y },
                data: { 
                    label: rel.name,
                    isCenter: false,
                    recordType: rel.recordType,
                    tags: rel.tags,
                },
            });

            // Create edge from center to depends
            edges.push({
                id: `e-${entry.id}-${nodeId}`,
                source: entry.id,
                target: nodeId,
                sourceHandle: `left-source-${index}`,
                targetHandle: 'right',
                label: 'depends',
                labelStyle: { fontSize: 10, fill: RELATION_COLORS.dependsOn },
                labelBgStyle: { fill: theme.palette.background.paper },
                style: { stroke: RELATION_COLORS.dependsOn, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: RELATION_COLORS.dependsOn },
            });
        });

        return { initialNodes: nodes, initialEdges: edges };
    }, [entry, relations, theme]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Handle node click for navigation
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.id !== entry.id && node.data) {
            const nodeData = node.data;
            const relation = relations.find(r => 
                node.id === `super-${r.id}` || 
                node.id === `sub-${r.id}` || 
                node.id === `depends-${r.id}`
            );
            
            if (relation) {
                const definition = getEntityType(relation.recordType, relation.tags.map(t => t.id));
                navigate(`/${definition.path}/${relation.id}`);
            }
        }
    }, [entry.id, relations, navigate]);

    // Count relations for summary
    const relationCounts = useMemo(() => ({
        superProperties: relations.filter(r => r.relationType === 'superProperty').length,
        subProperties: relations.filter(r => r.relationType === 'subProperty').length,
        dependsOn: relations.filter(r => r.relationType === 'dependsOn').length,
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
                        <b><T keyName="property.relation_graph">Relationsgraph</T></b>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={`${relationCounts.total} ${t('property.relations', 'Relationen')}`} 
                            size="small" 
                            variant="outlined" 
                        />
                        <IconButton onClick={() => setExpanded(!expanded)} size="small">
                            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>
                </Box>
            </FormSetTitle>
            
            <Collapse in={expanded}>
                {/* Legend */}
                <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.superProperty, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="property.super_properties">Supermerkmale</T> ({relationCounts.superProperties})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.subProperty, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="property.sub_properties">Submerkmale</T> ({relationCounts.subProperties})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 20, height: 3, backgroundColor: RELATION_COLORS.dependsOn, borderRadius: 1 }} />
                        <Typography variant="caption"><T keyName="property.depends_on">Hängt ab von</T> ({relationCounts.dependsOn})</Typography>
                    </Box>
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
