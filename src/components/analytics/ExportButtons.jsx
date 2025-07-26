import React, { useRef } from 'react';
import * as api from '../../utils/api';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';

/**
 * ExportButtons component
 * @param {Object} props
 * @param {{startDate: string, endDate: string}} props.dateRange - Date range filter for export
 * @param {string} props.tab - Current analytics tab (e.g., 'sales', 'orders', 'traffic', etc.)
 * @param {string} [props.chartImage] - Optional chart image as data URL (for PDF export)
 * @param {object} [props.chartRef] - Optional ref to the Recharts chart container
 */
const ExportButtons = ({ dateRange, tab, chartImage, chartRef }) => {
  // If chartRef is provided and PDF export is triggered, auto-capture chart
  const handleExport = async (type) => {
    let imageToExport = chartImage;
    if (type === 'pdf' && chartRef && chartRef.current) {
      // Try to capture chart as PNG data URL from SVG
      const svg = chartRef.current.container.children[0];
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = svg.width.baseVal.value;
      canvas.height = svg.height.baseVal.value;
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          imageToExport = canvas.toDataURL('image/png');
          resolve();
        };
        img.src = url;
      });
    }
    const buildQuery = () => {
      const params = [];
      if (dateRange?.startDate) params.push(`startDate=${encodeURIComponent(dateRange.startDate)}`);
      if (dateRange?.endDate) params.push(`endDate=${encodeURIComponent(dateRange.endDate)}`);
      if (tab) params.push(`tab=${encodeURIComponent(tab)}`);
      return params.length ? `?${params.join('&')}` : '';
    };
    const query = buildQuery();
    const endpoint = `/v1/analytics/export/${type}${query}`;
    let response;
    if (type === 'pdf' && imageToExport) {
      const formData = new FormData();
      formData.append('chartImage', imageToExport);
      response = await api.request(endpoint, { method: 'POST', data: formData, responseType: 'blob' });
    } else {
      response = await api.request(endpoint, { method: 'GET', responseType: 'blob' });
    }
    if (response && response.ok && response.data) {
      const fileURL = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      const baseName = tab ? `${tab}-analytics` : 'analytics-export';
      a.href = fileURL;
      a.download = type === 'csv' ? `${baseName}.csv` : `${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <Box display="flex" gap={2} mb={2}>
      <Button variant="outlined" color="primary" onClick={() => handleExport('csv')}>Export CSV</Button>
      <Button variant="outlined" color="secondary" onClick={() => handleExport('pdf')}>Export PDF</Button>
    </Box>
  );
};

ExportButtons.propTypes = {
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  tab: PropTypes.string.isRequired,
  chartImage: PropTypes.string,
  chartRef: PropTypes.object,
};

export default ExportButtons;
