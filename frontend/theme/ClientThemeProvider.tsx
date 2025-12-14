"use client";

import { createTheme } from '@mui/material/styles';
import {ThemeProvider} from "@emotion/react";
import {ReactNode} from "react";

const clientThemeProvider = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#9b87f8',
        },
    },
});

export default function ClientThemeProvider({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={clientThemeProvider}>{children}</ThemeProvider>
};
