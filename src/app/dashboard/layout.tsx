import AppSidebar from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import ChatbotDrawer from './_components/chatbot-drawer';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 p-4">
          <SidebarTrigger />
          {children}
          <ChatbotDrawer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
