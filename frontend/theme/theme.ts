'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9b87f8',
    },
    background: {
      default: '#191a1c',
      paper: '#26282b',
    },
  },
});

export default theme;
