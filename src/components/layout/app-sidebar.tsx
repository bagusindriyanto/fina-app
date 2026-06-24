'use client';

import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import Link from 'next/link';
import { BanknoteIcon, CoinsIcon, LayoutDashboardIcon } from 'lucide-react';

const sidebarItems = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboardIcon />,
    href: '/dashboard',
  },
  {
    label: 'Transaction',
    icon: <BanknoteIcon />,
    href: '/dashboard/transaction',
  },
];

export default function AppSidebar() {
  const pathName = usePathname();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="flex-row gap-2 items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/dashboard" />}>
              <CoinsIcon className="text-primary size-5!" />
              <h1 className="text-2xl font-bold text-primary">Fina App</h1>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    tooltip={item.label}
                    isActive={pathName === item.href}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
