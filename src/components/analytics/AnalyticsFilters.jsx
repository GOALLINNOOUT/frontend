import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Chip } from '@mui/material';

/**
 * AnalyticsFilters - Date range filter for analytics dashboard.
 *
 * Props:
 *   onChange: function({ startDate, endDate })
 *     Called whenever the date range changes or is reset.
 */
const presetOptions = [
  { label: 'This Week', value: '1w' },
  { label: 'This Month', value: '1m' },
  { label: 'Last 3 Months', value: '3m' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'This Year', value: '1y' },
  { label: 'Today', value: 'today' },
  { label: 'Custom', value: 'custom' },
];

function getPresetRange(preset) {
  const today = new Date();
  let start, end;
  const pad = (n) => n.toString().padStart(2, '0');
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-based
  const d = today.getDate();
  switch (preset) {
    case 'today': {
      const month = pad(m + 1);
      const day = pad(d);
      start = `${y}-${month}-${day}T00:00:00.000Z`;
      end = `${y}-${month}-${day}T23:59:59.999Z`;
      break;
    }
    case '1w': {
      // Start: Monday of this week, End: Sunday of this week
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Sunday=0, so treat as 7
      const monday = new Date(today);
      monday.setDate(d - (dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      start = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}T00:00:00.000Z`;
      end = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}T23:59:59.999Z`;
      break;
    }
    case '1m': {
      // Start: 1st of this month, End: last day of this month
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      start = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}T00:00:00.000Z`;
      end = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}T23:59:59.999Z`;
      break;
    }
    case '3m': {
      // Start: 1st of (current month - 2), End: last day of this month
      const first = new Date(y, m - 2, 1);
      const last = new Date(y, m + 1, 0);
      start = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}T00:00:00.000Z`;
      end = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}T23:59:59.999Z`;
      break;
    }
    case '6m': {
      // Start: 1st of (current month - 5), End: last day of this month
      const first = new Date(y, m - 5, 1);
      const last = new Date(y, m + 1, 0);
      start = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}T00:00:00.000Z`;
      end = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}T23:59:59.999Z`;
      break;
    }
    case '1y': {
      // Start: Jan 1, End: Dec 31 of this year
      start = `${y}-01-01T00:00:00.000Z`;
      end = `${y}-12-31T23:59:59.999Z`;
      break;
    }
    default:
      start = '';
      end = '';
  }
  return { startDate: start, endDate: end };
}

const AnalyticsFilters = ({ onChange }) => {
  // Set initial preset to '1w' (This Week) and initialize filters accordingly
  const initialPreset = '1w';
  const initialRange = getPresetRange(initialPreset);
  const [filters, setFilters] = useState(initialRange);
  const [preset, setPreset] = useState(initialPreset);

  // Call onChange on mount to notify parent of initial range
  React.useEffect(() => {
    if (onChange) onChange(initialRange);
    // eslint-disable-next-line
  }, []);

  const handlePresetChip = (value) => {
    setPreset(value);
    if (value === 'custom') return;
    const range = getPresetRange(value);
    setFilters(range);
    if (onChange) onChange(range); // Auto-submit for presets
  };

  const handleChange = (e) => {
    setPreset('custom');
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
  };

  const handleReset = () => {
    setPreset('custom');
    const reset = { startDate: '', endDate: '' };
    setFilters(reset);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onChange) {
      // Convert custom date to ISO string with time for consistency
      const { startDate, endDate } = filters;
      let formatted = { startDate, endDate };
      if (startDate && endDate) {
        formatted = {
          startDate: `${startDate}T00:00:00.000Z`,
          endDate: `${endDate}T23:59:59.999Z`,
        };
      }
      onChange(formatted);
    }
  };

  return (
    <Box mb={2} component="form" onSubmit={handleSubmit}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Filter by Date Range
      </Typography>
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {presetOptions.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            color={preset === option.value ? 'primary' : 'default'}
            variant={preset === option.value ? 'filled' : 'outlined'}
            clickable
            onClick={() => handlePresetChip(option.value)}
          />
        ))}
      </Stack>
      {preset === 'custom' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="outlined" color="secondary" onClick={handleReset} size="small" type="button">
            Reset
          </Button>
          <Button variant="contained" color="primary" type="submit" size="small">
            Submit
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default AnalyticsFilters;
