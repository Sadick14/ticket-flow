"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Event, Ticket } from '@/lib/types';
import { initialEvents } from '@/lib/data';

interface AppContextType {
  events: Event[];
  tickets: Ticket[];
  addEvent: (event: Event) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'purchaseDate'>) => void;
  getEventById: (id: string) => Event | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const addEvent = (event: Event) => {
    setEvents(prevEvents => [event, ...prevEvents]);
  };

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'purchaseDate'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      purchaseDate: new Date().toISOString(),
    };
    setTickets(prevTickets => [newTicket, ...prevTickets]);
  };
  
  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  return (
    <AppContext.Provider value={{ events, tickets, addEvent, addTicket, getEventById }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
