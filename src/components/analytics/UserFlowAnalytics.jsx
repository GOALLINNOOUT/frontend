import React, { useEffect, useState } from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../../utils/api';

// Helper to convert path string to Sankey nodes/links
function buildSankeyData(paths) {
  const nodeMap = new Map();
  const links = [];
  let nodeIdx = 0;

  // Build nodes and links from path strings
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
  // Build nodes array
  const nodes = Array.from(nodeMap.entries()).map(([name], i) => ({ name }));
  return { nodes, links };
}


import PropTypes from 'prop-types';

const UserFlowAnalytics = ({ dateRange }) => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }).toString();
    api.get(`/api/analytics/userflow?${params}`)
      .then(res => {
        setPaths(res.data.topPaths || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load user flow');
        setLoading(false);
      });
  }, [dateRange]);


  if (loading) return <div>Loading user flow...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!paths.length) return <div>No user flow data available for the selected date range.</div>;

  const sankeyData = buildSankeyData(paths);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <h2>User Flow Analysis</h2>
      <ResponsiveContainer width="100%" height={400}>
        <Sankey
          data={sankeyData}
          nodePadding={30}
          margin={{ top: 20, bottom: 20 }}
          link={{ stroke: '#8884d8' }}
          node={{ stroke: '#333', strokeWidth: 1 }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        Most common navigation paths (Sankey diagram)
      </div>
    </div>
  );
};


UserFlowAnalytics.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }).isRequired,
};

export default UserFlowAnalytics;
