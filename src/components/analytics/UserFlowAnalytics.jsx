
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, useTheme, IconButton, Popover, Divider } from '@mui/material';
import { Sankey, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PropTypes from 'prop-types';
import * as api from '../../utils/api';

// Helper to convert path string to Sankey nodes/links
function buildSankeyData(paths) {
  const nodeMap = new Map();
  const links = [];
  let nodeIdx = 0;
  paths.forEach(({ path, count }) => {
    const steps = path.split(' → ');
    for (let i = 0; i < steps.length - 1; i++) {
      const source = steps[i];
      const target = steps[i + 1];
      if (!nodeMap.has(source)) nodeMap.set(source, nodeIdx++);
      if (!nodeMap.has(target)) nodeMap.set(target, nodeIdx++);
      links.push({
        source: nodeMap.get(source),
        target: nodeMap.get(target),
        value: count
      });
    }
  });
  const nodes = Array.from(nodeMap.entries()).map(([name]) => ({ name }));
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

// Color palette for nodes
const NODE_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc0cb', '#b0e0e6', '#ffb347',
];

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

  // Custom node renderer for labeling and color
  const renderNode = (nodeProps) => {
    const { x, y, width, height, index, name } = nodeProps;
    const fill = NODE_COLORS[index % NODE_COLORS.length];
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#333" strokeWidth={1} rx={4} />
        <text
          x={x + width + 6}
          y={y + height / 2}
          textAnchor="start"
          alignmentBaseline="middle"
          fontSize={13}
          fill="#333"
          aria-label={name}
        >
          {name}
        </text>
      </g>
    );
  };

  // Custom link renderer for color and interactivity
  const renderLink = (linkProps) => {
    const { source, target, value, path } = linkProps;
    const color = NODE_COLORS[source.index % NODE_COLORS.length];
    return (
      <g>
        <path d={path} stroke={color} strokeWidth={Math.max(1, value)} fill="none" opacity={0.4} />
      </g>
    );
  };

  // Enhanced tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      if (item.source && item.target) {
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2">{item.source.name} → {item.target.name}</Typography>
            <Typography variant="body2">Count: {item.value}</Typography>
          </Box>
        );
      }
      if (item.name) {
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2">{item.name}</Typography>
          </Box>
        );
      }
    }
    return null;
  };

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
        ) : !paths.length ? (
          <Typography color="text.secondary" sx={{ my: 3 }}>
            No user flow data available for the selected date range.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <Sankey
              data={sankeyData}
              nodePadding={30}
              margin={{ top: 20, bottom: 20 }}
              node={renderNode}
              link={renderLink}
            >
              <RechartsTooltip
                content={<CustomTooltip />}
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
