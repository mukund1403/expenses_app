"use client";

import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import {ElementType, JSX, useEffect, useState} from "react";
import {SvgIconProps} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton";
import {usePathname} from "next/navigation";
import Link from "next/link";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

export interface NavItem {
    label: string;
    href: string;
    icon: ElementType<SvgIconProps>;
}

const navItems: readonly NavItem[] = [
    { label: "Home", href: "/home", icon: HomeRoundedIcon },
    { label: "Analytics", href: "/analytics", icon: AutoGraphRoundedIcon },
    { label: "Budgets", href: "/budgets", icon: AccountBalanceWalletRoundedIcon },
    { label: "Transactions", href: "/transactions", icon: ReceiptRoundedIcon },
    { label: "Settings", href: "/settings", icon: SettingsApplicationsRoundedIcon },
] as const;

export default function Sidebar(): JSX.Element {
    const pathname: string = usePathname();

    const [mounted, setMounted] = useState(false);
    // The effect only runs once ([] dependency array). No infinite re-render loop will happen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    if (!mounted) return(<></>); // don't render on server

    return(
        <Drawer
            variant="permanent"
            sx={{
                color: "background.default"
            }}
        >
            <List>
                {navItems.map((item: NavItem) => {
                    const { label, href, icon: Icon } = item;

                    const isActive: boolean =
                        pathname === href || pathname.startsWith(`${href}/`);

                    return (
                        <ListItemButton
                            key={href}
                            component={Link}
                            href={href}
                            selected={isActive}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <ListItemIcon sx={{ display: "flex", justifyContent: "center" }}>
                                <Icon fontSize="small" sx={{ color: isActive ? "primary.main" : "text.secondary" }}/>
                            </ListItemIcon>
                            <ListItemText primary={label} slotProps={{
                                primary: {
                                    fontSize: "0.6rem",
                                    textAlign: "center",
                                    color: isActive ? "primary.main" : "text.secondary",
                                }
                            }}/>
                        </ListItemButton>
                    );
                })}
            </List>
        </Drawer>
    );
}
