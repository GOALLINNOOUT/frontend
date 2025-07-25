
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, useTheme, IconButton, Popover, Divider } from '@mui/material';
import { Sankey, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PropTypes from 'prop-types';
import * as api from '../../utils/api';

// Helper to convert path string to Sankey nodes/links
function buildSankeyData(paths) {
  // Collect all unique node names in order of appearance
  const nodeNames = [];
  const nodeSet = new Set();
  // Use a map to aggregate duplicate links
  const linkMap = new Map();
  paths.forEach(({ path, count }) => {
    if (!path || typeof path !== 'string') return;
    const steps = path.split(' → ').map(s => s.trim()).filter(Boolean);
    if (steps.length < 2) return; // Skip single-page paths
    // Skip paths with cycles (node appears more than once)
    const uniqueSteps = new Set(steps);
    if (uniqueSteps.size !== steps.length) return;
    steps.forEach((step) => {
      if (!nodeSet.has(step)) {
        nodeSet.add(step);
        nodeNames.push(step);
      }
    });
    // Aggregate links
    for (let i = 0; i < steps.length - 1; i++) {
      const source = steps[i];
      const target = steps[i + 1];
      const key = `${source}__${target}`;
      linkMap.set(key, (linkMap.get(key) || 0) + count);
    }
  });
  // Map node names to their index in the nodes array
  const nodeMap = new Map(nodeNames.map((name, idx) => [name, idx]));
  // Build links using these indices, skip invalid
  const links = [];
  for (const [key, value] of linkMap.entries()) {
    const [source, target] = key.split('__');
    const sourceIdx = nodeMap.get(source);
    const targetIdx = nodeMap.get(target);
    if (
      typeof sourceIdx === 'number' &&
      typeof targetIdx === 'number' &&
      sourceIdx !== targetIdx &&
      !isNaN(sourceIdx) &&
      !isNaN(targetIdx)
    ) {
      links.push({ source: sourceIdx, target: targetIdx, value });
    }
  }
  const nodes = nodeNames.map((name) => ({ name }));
  // Final validation: if no valid links, return empty
  if (!nodes.length || !links.length) return { nodes: [], links: [] };
  return { nodes, links };
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

const UserFlowAnalytics = ({ dateRange }) => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoAnchor, setInfoAnchor] = useState(null);
  const theme = useTheme();
  const tooltipStyles = getTooltipStyles(theme);

  const infoText = 'This Sankey diagram shows the most common navigation paths users take through your site. Each flow represents a sequence of pages visited in a session.';

  const handleInfoOpen = (event) => setInfoAnchor(event.currentTarget);
  const handleInfoClose = () => setInfoAnchor(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!dateRange?.startDate || !dateRange?.endDate) return;
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).toString();
        const res = await api.get(`/v1/analytics/userflow?${params}`);
        setPaths(res.data.topPaths || []);
      } catch (err) {
        setError('Failed to load user flow');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const sankeyData = buildSankeyData(paths);
  const hasValidSankey = sankeyData.nodes.length > 0 && sankeyData.links.length > 0;

  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main" flexGrow={1}>
            User Flow Analysis
          </Typography>
          <IconButton size="small" onClick={handleInfoOpen} aria-label="info">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
          <Popover
            open={Boolean(infoAnchor)}
            anchorEl={infoAnchor}
            onClose={handleInfoClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { p: 2, maxWidth: 320 } }}
          >
            <Typography variant="body2" color="text.secondary">{infoText}</Typography>
          </Popover>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={220}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 3 }}>{error}</Typography>
        ) : !hasValidSankey ? (
          <Typography color="text.secondary" sx={{ my: 3 }}>
            No multi-step user flow data available for the selected date range.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <Sankey
              data={sankeyData}
              nodePadding={30}
              margin={{ top: 20, bottom: 20 }}
              link={{ stroke: '#8884d8' }}
              node={{ stroke: '#333', strokeWidth: 1 }}
            >
              <RechartsTooltip
                contentStyle={tooltipStyles.contentStyle}
                labelStyle={tooltipStyles.labelStyle}
                itemStyle={tooltipStyles.itemStyle}
              />
            </Sankey>
          </ResponsiveContainer>
        )}
        <Box sx={{ fontSize: 12, color: '#888', mt: 1 }}>
          Most common navigation paths (Sankey diagram)
        </Box>
      </CardContent>
    </Card>
  );
};

UserFlowAnalytics.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
};

export default UserFlowAnalytics;
