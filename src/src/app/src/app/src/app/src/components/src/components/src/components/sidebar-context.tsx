"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  media?: string;
  mediaType?: "image" | "video";
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

interface SidebarContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  addMessage: (content: string, media?: string, mediaType?: "image" | "video") => void;
  createNewConversation: () => string;
  setCurrentConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = "sophia_conversations";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0 && !currentConversationId) {
        setCurrentConversationId(parsed[0].id);
      }
    } else {
      const newId = createNewConversation();
      setCurrentConversationId(newId);
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: "Nova conversa",
      messages: [],
      lastUpdated: Date.now(),
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  const addMessage = (content: string, media?: string, mediaType?: "image" | "video") => {
    if (!currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
      media,
      mediaType,
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              lastUpdated: Date.now(),
            }
          : conv
      )
    );
  };

  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateConversationTitle = (id: string, title: string) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, title } : conv))
    );
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <SidebarContext.Provider
      value={{
        conversations,
        currentConversationId,
        addMessage,
        createNewConversation,
        setCurrentConversation,
        deleteConversation,
        updateConversationTitle,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};
