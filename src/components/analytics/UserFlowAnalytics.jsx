import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, useTheme, IconButton, Popover, Divider } from '@mui/material';
import { Sankey, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PropTypes from 'prop-types';
import * as api from '../../utils/api';

// Helper to convert path string to Sankey nodes/links
function buildSankeyData(paths, options = {}) {
  const { minPathLength = 2, maxNodes = 50, minLinkValue = 1 } = options;
  
  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    return { nodes: [], links: [] };
  }
  
  // Collect all unique node names in order of appearance
  const nodeNames = [];
  const nodeSet = new Set();
  // Use a map to aggregate duplicate links
  const linkMap = new Map();
  
  paths.forEach(({ path, count }) => {
    // Validate input data
    if (!path || typeof path !== 'string' || !count || count < minLinkValue) return;
    
    // Exclude any path containing an admin page
    if (path.includes('/admin/')) return;
    
    const steps = path.split(' → ').map(s => s.trim()).filter(Boolean);
    if (steps.length < minPathLength) return; // Skip short paths
    
    // Skip paths with cycles (node appears more than once)
    const uniqueSteps = new Set(steps);
    if (uniqueSteps.size !== steps.length) return;
    
    // Skip if any step is empty or not a string
    if (steps.some(s => !s || typeof s !== 'string')) return;
    
    // First pass: collect all nodes
    steps.forEach((step) => {
      if (!nodeSet.has(step) && nodeNames.length < maxNodes) {
        nodeSet.add(step);
        nodeNames.push(step);
      }
    });
  });
  
  // Second pass: create links only for paths where all nodes exist
  paths.forEach(({ path, count }) => {
    if (!path || typeof path !== 'string' || !count || count < minLinkValue) return;
    if (path.includes('/admin/')) return;
    
    const steps = path.split(' → ').map(s => s.trim()).filter(Boolean);
    if (steps.length < minPathLength) return;
    
    // Skip paths with cycles
    const uniqueSteps = new Set(steps);
    if (uniqueSteps.size !== steps.length) return;
    
    // Only process if all steps are in our node set
    if (steps.every(step => nodeSet.has(step))) {
      for (let i = 0; i < steps.length - 1; i++) {
        const source = steps[i];
        const target = steps[i + 1];
        const key = `${source}__${target}`;
        linkMap.set(key, (linkMap.get(key) || 0) + count);
      }
    }
  });
  
  // Map node names to their index in the nodes array
  const nodeMap = new Map(nodeNames.map((name, idx) => [name, idx]));
  
  // Build links using these indices, with strict validation
  const links = [];
  for (const [key, value] of linkMap.entries()) {
    if (!value || value < minLinkValue || !Number.isFinite(value)) continue;
    
    const parts = key.split('__');
    if (parts.length !== 2) continue;
    
    const [source, target] = parts;
    const sourceIdx = nodeMap.get(source);
    const targetIdx = nodeMap.get(target);
    
    if (
      typeof sourceIdx === 'number' &&
      typeof targetIdx === 'number' &&
      sourceIdx !== targetIdx &&
      Number.isFinite(sourceIdx) &&
      Number.isFinite(targetIdx) &&
      sourceIdx >= 0 &&
      targetIdx >= 0 &&
      sourceIdx < nodeNames.length &&
      targetIdx < nodeNames.length
    ) {
      links.push({ 
        source: sourceIdx, 
        target: targetIdx, 
        value: Number(value)
      });
    }
  });
  
  // Sort links by value for better visual hierarchy
  links.sort((a, b) => b.value - a.value);
  
  // Create nodes with proper formatting
  const nodes = nodeNames.map((name, index) => {
    const cleanName = String(name).trim();
    return {
      name: cleanName,
      displayName: cleanName.length > 25 ? `${cleanName.substring(0, 22)}...` : cleanName,
      nodeId: index
    };
  });
  
  // Final validation: ensure we have valid data
  if (!nodes.length || !links.length) {
    return { nodes: [], links: [] };
  }
  
  // Validate that all link indices are valid
  const validLinks = links.filter(link => 
    link.source >= 0 && 
    link.source < nodes.length && 
    link.target >= 0 && 
    link.target < nodes.length &&
    Number.isFinite(link.value) &&
    link.value > 0
  );
  
  if (!validLinks.length) {
    return { nodes: [], links: [] };
  }
  
  return { nodes, links: validLinks };
}

function getTooltipStyles(theme) {
  return {
    contentStyle: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: 8,
      fontSize: 14,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[1],
      maxWidth: 300,
    },
    labelStyle: {
      color: theme.palette.text.secondary,
      fontWeight: 600,
    },
    itemStyle: {
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
  };
}

// Custom tooltip component for better Sankey tooltip display
const CustomSankeyTooltip = ({ active, payload, theme }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  const tooltipStyles = getTooltipStyles(theme);
  
  if (data.source !== undefined && data.target !== undefined) {
    // This is a link
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>User Flow</div>
        <div style={tooltipStyles.itemStyle}>
          {data.sourceNode?.name || 'Unknown'} → {data.targetNode?.name || 'Unknown'}
        </div>
        <div style={tooltipStyles.itemStyle}>
          Users: {data.value}
        </div>
      </div>
    );
  } else if (data.name) {
    // This is a node
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>Page</div>
        <div style={tooltipStyles.itemStyle}>{data.name}</div>
      </div>
    );
  }
  
  return null;
};

const UserFlowAnalytics = ({ dateRange, options = {} }) => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState(null);
  const theme = useTheme();

  const infoText = 'This Sankey diagram shows the most common navigation paths users take through your site. Each flow represents a sequence of pages visited in a session. Thicker connections indicate more users following that path.';

  const handleInfoOpen = (event) => setInfoAnchor(event.currentTarget);
  const handleInfoClose = () => setInfoAnchor(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.startDate || !dateRange?.endDate) {
        setPaths([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).toString();
        
        const res = await api.get(`/v1/analytics/userflow?${params}`);
        setPaths(res.data.topPaths || []);
      } catch (err) {
        console.error('Failed to load user flow data:', err);
        setError('Failed to load user flow data. Please try again.');
        setPaths([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange]);

  // Memoize Sankey data to avoid unnecessary recalculations
  const sankeyData = useMemo(() => {
    return buildSankeyData(paths, options.sankeyOptions);
  }, [paths, options.sankeyOptions]);

  const hasValidSankey = sankeyData.nodes.length > 0 && sankeyData.links.length > 0;

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Loading user flow data...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ my: 3 }}>
          <Typography color="error" variant="body1" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your connection and try again.
          </Typography>
        </Box>
      );
    }

    if (!hasValidSankey) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ my: 3 }}>
          <Typography color="text.secondary" variant="body1" gutterBottom>
            No user flow data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting the date range or check back later when more data is available.
          </Typography>
        </Box>
      );
    }

    try {
      // Additional validation before rendering
      const hasValidData = sankeyData && 
        Array.isArray(sankeyData.nodes) && 
        Array.isArray(sankeyData.links) &&
        sankeyData.nodes.length > 0 && 
        sankeyData.links.length > 0 &&
        sankeyData.links.every(link => 
          Number.isFinite(link.source) && 
          Number.isFinite(link.target) && 
          Number.isFinite(link.value) &&
          link.source >= 0 && 
          link.target >= 0 && 
          link.value > 0
        );

      if (!hasValidData) {
        throw new Error('Invalid Sankey data structure');
      }

      return (
        <ResponsiveContainer width="100%" height={400}>
          <Sankey
            data={sankeyData}
            nodePadding={20}
            nodeWidth={15}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            link={{ 
              stroke: theme.palette.primary.main, 
              strokeOpacity: 0.6,
            }}
            node={{ 
              stroke: theme.palette.text.primary, 
              strokeWidth: 1,
              fill: theme.palette.primary.light,
              fillOpacity: 0.8,
            }}
          >
            <RechartsTooltip
              content={<CustomSankeyTooltip theme={theme} />}
            />
          </Sankey>
        </ResponsiveContainer>
      );
    } catch (renderError) {
      console.error('Error rendering Sankey diagram:', renderError);
      return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ my: 3 }}>
          <Typography color="error" variant="body1" gutterBottom>
            Error displaying diagram
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There was an issue rendering the user flow visualization.
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        mb: 3, 
        borderRadius: 3, 
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography 
            variant="subtitle1" 
            fontWeight={700} 
            color="primary.main" 
            flexGrow={1}
          >
            User Flow Analysis
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleInfoOpen} 
            aria-label="User flow information"
            sx={{ color: 'text.secondary' }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <Popover
            open={Boolean(infoAnchor)}
            anchorEl={infoAnchor}
            onClose={handleInfoClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ 
              sx: { 
                p: 2, 
                maxWidth: 320,
                border: `1px solid ${theme.palette.divider}`,
              } 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {infoText}
            </Typography>
          </Popover>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {renderContent()}
        
        {hasValidSankey && (
          <Box sx={{ 
            fontSize: 12, 
            color: theme.palette.text.secondary, 
            mt: 1,
            textAlign: 'center',
          }}>
            Showing {sankeyData.nodes.length} pages and {sankeyData.links.length} navigation paths
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

UserFlowAnalytics.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
  options: PropTypes.shape({
    sankeyOptions: PropTypes.shape({
      minPathLength: PropTypes.number,
      maxNodes: PropTypes.number,
      minLinkValue: PropTypes.number,
    }),
  }),
};

export default UserFlowAnalytics;