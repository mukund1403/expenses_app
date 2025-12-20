'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9b87f8',
    },
    background: {
      paper: '#303030',
    },
  },
});

export default theme;
