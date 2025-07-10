
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Event, Ticket } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';

interface AppContextType {
  events: Event[];
  tickets: Ticket[];
  loading: boolean;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, eventData: Omit<Event, 'id'>) => Promise<void>;
  addTicket: (ticket: Omit<Ticket, 'id' | 'purchaseDate'>) => Promise<void>;
  getEventById: (id: string) => Promise<Event | undefined>;
  getEventsByCreator: (creatorId: string) => Event[];
  getUserTickets: (email: string) => Ticket[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventSnapshot = await getDocs(eventsCollection);
      const eventsList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
     try {
      const ticketsCollection = collection(db, 'tickets');
      const ticketSnapshot = await getDocs(ticketsCollection);
      const ticketsList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(ticketsList);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchTickets()]);
      setLoading(false);
    }
    loadData();
  }, [fetchEvents, fetchTickets]);

  const addEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), eventData);
      // Optimistic update
      setEvents(prevEvents => [{ id: docRef.id, ...eventData } as Event, ...prevEvents]);
      // Or fetch again to be sure
      await fetchEvents();
    } catch (error) {
       console.error("Error adding event:", error);
       throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Omit<Event, 'id'>) => {
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, eventData);
      // Optimistic update
      setEvents(prevEvents => prevEvents.map(event => event.id === id ? { ...event, ...eventData } : event));
       // Or fetch again to be sure
      await fetchEvents();
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
  }

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'purchaseDate'>) => {
    const newTicket = {
      ...ticketData,
      purchaseDate: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'tickets'), newTicket);
      // Optimistic update
      setTickets(prevTickets => [{ ...newTicket, id: docRef.id }, ...prevTickets]);
       // Or fetch again to be sure
      await fetchTickets();
    } catch (error) {
       console.error("Error adding ticket:", error);
       throw error;
    }
  };
  
  const getEventById = async (id: string): Promise<Event | undefined> => {
    // First, check local state
    const localEvent = events.find(event => event.id === id);
    if (localEvent) return localEvent;
    
    // If not found, fetch from Firestore
    setLoading(true);
    try {
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Event;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      return undefined;
    } finally {
        setLoading(false);
    }
  };

  const getEventsByCreator = (creatorId: string): Event[] => {
    return events.filter(event => event.creatorId === creatorId);
  }

  const getUserTickets = (email: string): Ticket[] => {
    return tickets.filter(t => t.attendeeEmail.toLowerCase() === email.toLowerCase());
  }

  return (
    <AppContext.Provider value={{ events, tickets, loading, addEvent, updateEvent, addTicket, getEventById, getEventsByCreator, getUserTickets }}>
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
