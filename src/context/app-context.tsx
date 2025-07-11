
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Event, Ticket } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc, updateDoc, deleteDoc, DocumentData, orderBy, limit } from 'firebase/firestore';

interface AppContextType {
  events: Event[];
  tickets: Ticket[];
  loading: boolean;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Omit<Event, 'id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addTicket: (ticket: Omit<Ticket, 'id' | 'purchaseDate' | 'checkedIn'>) => Promise<void>;
  checkInTicket: (id: string) => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket | undefined>;
  getEventById: (id: string) => Promise<Event | undefined>;
  getEventsByCreator: (creatorId: string) => Event[];
  getUserTickets: (email: string) => Ticket[];
  getTicketsByEvent: (eventId: string) => Ticket[];
  getEventStats: (creatorId: string) => {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventSnapshot = await getDocs(query(eventsCollection, orderBy('date', 'desc')));
      const eventsList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
     try {
      const ticketsCollection = collection(db, 'tickets');
      const ticketSnapshot = await getDocs(query(ticketsCollection, orderBy('purchaseDate', 'desc')));
      const ticketsList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), checkedIn: doc.data().checkedIn || false } as Ticket));
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
      await addDoc(collection(db, 'events'), eventData);
      await fetchEvents();
    } catch (error) {
       console.error("Error adding event:", error);
       throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Omit<Event, 'id'>>) => {
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, eventData);
      await fetchEvents();
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'purchaseDate' | 'checkedIn'>) => {
    const newTicket = {
      ...ticketData,
      purchaseDate: new Date().toISOString(),
      checkedIn: false,
    };
    try {
      await addDoc(collection(db, 'tickets'), newTicket);
      await fetchTickets();
    } catch (error) {
       console.error("Error adding ticket:", error);
       throw error;
    }
  };

  const checkInTicket = async (id: string) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, { checkedIn: true });
      await fetchTickets();
    } catch (error) {
      console.error("Error checking in ticket:", error);
      throw error;
    }
  };
  
  const getTicketById = async (id: string): Promise<Ticket | undefined> => {
    const localTicket = tickets.find(ticket => ticket.id === id);
    if (localTicket) return localTicket;

    try {
        const docRef = doc(db, 'tickets', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Ticket;
        } else {
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching ticket by ID:", error);
        return undefined;
    }
  };

  const getEventById = async (id: string): Promise<Event | undefined> => {
    const localEvent = events.find(event => event.id === id);
    if (localEvent) return localEvent;
    
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
    }
  };

  const getEventsByCreator = (creatorId: string): Event[] => {
    return events.filter(event => event.creatorId === creatorId);
  }

  const getUserTickets = (email: string): Ticket[] => {
    return tickets.filter(t => t.attendeeEmail.toLowerCase() === email.toLowerCase());
  }

  const getTicketsByEvent = (eventId: string): Ticket[] => {
    return tickets.filter(ticket => ticket.eventId === eventId);
  };

  const getEventStats = (creatorId: string) => {
    const userEvents = getEventsByCreator(creatorId);
    const userTickets = tickets.filter(ticket => 
      userEvents.some(event => event.id === ticket.eventId)
    );
    
    const today = new Date();
    const upcomingEvents = userEvents.filter(event => 
      new Date(event.date) >= today
    ).length;

    return {
      totalEvents: userEvents.length,
      totalTicketsSold: userTickets.length,
      totalRevenue: userTickets.reduce((sum, ticket) => sum + ticket.price, 0),
      upcomingEvents,
    };
  };

  return (
    <AppContext.Provider value={{ 
      events, 
      tickets, 
      loading, 
      addEvent, 
      updateEvent, 
      deleteEvent,
      addTicket, 
      checkInTicket,
      getTicketById,
      getEventById, 
      getEventsByCreator, 
      getUserTickets,
      getTicketsByEvent,
      getEventStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
