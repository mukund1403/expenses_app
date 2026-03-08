'use client';

import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { MONTH_NAMES } from '@/components/analytics/utils';

interface MonthNavigatorProps {
  year: number;
  month: number; // 0-indexed
  onChange: (year: number, month: number) => void;
}

const YEAR_RANGE_BACK = 5;
const YEAR_RANGE_FORWARD = 1;

export default function MonthNavigator({
  year,
  month,
  onChange,
}: MonthNavigatorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: YEAR_RANGE_BACK + YEAR_RANGE_FORWARD + 1 },
    (_, i) => currentYear - YEAR_RANGE_BACK + i,
  );

  const handlePrev = () => {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  };

  const handleNext = () => {
    if (month === 11) onChange(year + 1, 0);
    else onChange(year, month + 1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      {/* Prev arrow */}
      <IconButton onClick={handlePrev} size='small'>
        <ChevronLeftRounded />
      </IconButton>

      {/* Current month/year label */}
      <Typography variant='h6' sx={{ minWidth: '10rem', textAlign: 'center' }}>
        {MONTH_NAMES[month]} {year}
      </Typography>

      {/* Next arrow */}
      <IconButton onClick={handleNext} size='small'>
        <ChevronRightRounded />
      </IconButton>

      {/* Month dropdown */}
      <Select
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        size='small'
        sx={{ fontSize: 'small', minWidth: '7rem' }}
      >
        {MONTH_NAMES.map((name, i) => (
          <MenuItem key={name} value={i}>
            {name}
          </MenuItem>
        ))}
      </Select>

      {/* Year dropdown */}
      <Select
        value={year}
        onChange={(e) => onChange(Number(e.target.value), month)}
        size='small'
        sx={{ fontSize: 'small', minWidth: '5rem' }}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
