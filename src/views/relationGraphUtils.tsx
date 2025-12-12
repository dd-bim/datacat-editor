import React from 'react';
import { Position, Handle } from '@xyflow/react';
import { Box, Typography, useTheme } from '@mui/material';

// Node dimensions (approximate)
export const NODE_WIDTH = 150;  // Approximate width of a node
export const CENTER_NODE_HALF_WIDTH = 75; // Half width of center node (for spacing calculation)

/**
 * Helper to estimate text width in pixels (approximate)
 */
export const estimateTextWidth = (text: string, fontSize: number = 10): number => {
    // Average character width is approximately 0.6 * fontSize for most fonts
    return text.length * fontSize * 0.6;
};

/**
 * Calculate horizontal spacing based on relation name length.
 * Returns the distance from CENTER of the central node to the LEFT EDGE of the target node.
 */
export const calculateHorizontalSpacing = (relationName: string, margin: number = 40): number => {
    const textWidth = estimateTextWidth(relationName, 10);
    // Center node half width + margin + text width + margin + target node width
    const spacing = CENTER_NODE_HALF_WIDTH + margin + textWidth + margin + NODE_WIDTH;
    return Math.max(200, spacing);
};

/**
 * Calculate position percentage for distributing handles evenly across an edge.
 * Returns a percentage string (e.g., "50%", "20%", "80%").
 */
export const getPositionPercent = (index: number, total: number): string => {
    if (total === 1) return '50%';
    // Distribute from 20% to 80% of the edge
    const start = 20;
    const end = 80;
    const step = (end - start) / (total - 1);
    return `${start + index * step}%`;
};

/**
 * Renders simple handles at the center of each edge for non-center nodes
 */
export const renderSimpleHandles = () => (
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

/**
 * Common node box styling and structure.
 * Used by both ClassNode and PropertyNode components.
 */
export type GraphNodeData = {
    label: string;
    isCenter: boolean;
    recordType?: string;
    tags?: Array<{ id: string }>;
};

export type GraphNodeBoxProps = {
    data: GraphNodeData;
    children?: React.ReactNode;
};

export const GraphNodeBox: React.FC<GraphNodeBoxProps> = ({ data, children }) => {
    const theme = useTheme();
    
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
            {children}
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
