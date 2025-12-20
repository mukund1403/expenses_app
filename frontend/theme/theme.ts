'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9b87f8',
    },
    background: {
      paper: '#1c1c1c',
    },
  },
});

export default theme;
