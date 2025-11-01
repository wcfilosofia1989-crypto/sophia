import ChatInterface from "@/components/chat-interface";
import { SidebarProvider } from "@/components/sidebar-context";

export default function Home() {
  return (
    <SidebarProvider>
      <main className="flex h-screen bg-background">
        <ChatInterface />
      </main>
    </SidebarProvider>
  );
}
