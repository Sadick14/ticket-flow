

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Event, Ticket, UserProfile, NewsArticle, LaunchSubscriber, ContactSubmission } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, limit, orderBy } from 'firebase/firestore';

interface AppContextType {
  events: Event[];
  tickets: Ticket[];
  news: NewsArticle[];
  users: UserProfile[];
  launchSubscribers: LaunchSubscriber[];
  contactSubmissions: ContactSubmission[];
  loading: boolean;
  // Events
  addEvent: (event: Omit<Event, 'id' | 'collaboratorIds' | 'status'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Omit<Event, 'id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>; // This will now archive the event
  getEventById: (id: string) => Promise<Event | undefined>;
  getEventsByCreator: (creatorId: string) => Event[];
  getCollaboratedEvents: (userId: string) => Event[];
  getEventStats: (creatorId: string) => {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    upcomingEvents: number;
  };
  // Tickets
  addTicket: (ticket: Omit<Ticket, 'id' | 'purchaseDate' | 'checkedIn'>) => Promise<void>;
  checkInTicket: (ticketId: string, eventId: string, currentUserId: string) => Promise<void>;
  manualCheckInTicket: (ticketId: string, eventId: string, currentUserId: string, checkInStatus: boolean) => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket | undefined>;
  getUserTickets: (email: string) => Ticket[];
  getTicketsByEvent: (eventId: string) => Ticket[];
  // Users
  updateUser: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  addCollaborator: (eventId: string, email: string) => Promise<{success: boolean, message: string}>;
  removeCollaborator: (eventId: string, userId: string) => Promise<void>;
  getUsersByUids: (uids: string[]) => Promise<UserProfile[]>;
  // News
  addNewsArticle: (article: Omit<NewsArticle, 'id'>) => Promise<void>;
  updateNewsArticle: (id: string, articleData: Partial<Omit<NewsArticle, 'id' | 'publishedDate'>>) => Promise<void>;
  deleteNewsArticle: (id: string) => Promise<void>;
  // Launch Subscribers
  addLaunchSubscriber: (name: string, email: string) => Promise<void>;
  // General Subscribers
  addSubscriber: (email: string) => Promise<void>;
  // Contact Submissions
  replyToSubmission: (submission: ContactSubmission, replyMessage: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [launchSubscribers, setLaunchSubscribers] = useState<LaunchSubscriber[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventSnapshot = await getDocs(query(eventsCollection));
      const eventsList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
     try {
      const ticketsCollection = collection(db, 'tickets');
      const ticketSnapshot = await getDocs(query(ticketsCollection));
      const ticketsList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(ticketsList);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const newsCollection = collection(db, 'news');
      const newsSnapshot = await getDocs(query(newsCollection, orderBy('publishedDate', 'desc')));
      const newsList = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
      setNews(newsList);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(query(usersCollection));
      const usersList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  const fetchLaunchSubscribers = useCallback(async () => {
    try {
        const subscribersCollection = collection(db, 'launch_subscribers');
        const subscriberSnapshot = await getDocs(query(subscribersCollection, orderBy('subscribedAt', 'desc')));
        const subscribersList = subscriberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LaunchSubscriber));
        setLaunchSubscribers(subscribersList);
    } catch (error) {
        console.error("Error fetching launch subscribers:", error);
    }
  }, []);

  const fetchContactSubmissions = useCallback(async () => {
    try {
      const submissionsCollection = collection(db, 'contact_submissions');
      const snapshot = await getDocs(query(submissionsCollection, orderBy('submittedAt', 'desc')));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactSubmission));
      setContactSubmissions(list);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvents(), 
        fetchTickets(), 
        fetchNews(), 
        fetchUsers(), 
        fetchLaunchSubscribers(),
        fetchContactSubmissions()
      ]);
      setLoading(false);
    }
    loadData();
  }, [fetchEvents, fetchTickets, fetchNews, fetchUsers, fetchLaunchSubscribers, fetchContactSubmissions]);

  const addEvent = async (eventData: Omit<Event, 'id' | 'collaboratorIds' | 'status'>) => {
    try {
      await addDoc(collection(db, 'events'), { 
        ...eventData, 
        collaboratorIds: [],
        status: 'active' 
      });
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
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, { status: 'archived' });
      await fetchEvents();
    } catch (error) {
      console.error("Error archiving event:", error);
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

      // Send confirmation email via API route
      await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              eventId: ticketData.eventId,
              attendeeName: ticketData.attendeeName,
              attendeeEmail: ticketData.attendeeEmail,
          }),
      });

    } catch (error) {
       console.error("Error adding ticket:", error);
       throw error;
    }
  };

  const checkInTicket = async (ticketId: string, eventId: string, currentUserId: string) => {
    await manualCheckInTicket(ticketId, eventId, currentUserId, true);
  };

  const manualCheckInTicket = async (ticketId: string, eventId: string, currentUserId: string, checkInStatus: boolean) => {
    const event = await getEventById(eventId);
    if (!event) throw new Error("Event not found.");

    const isCreator = event.creatorId === currentUserId;
    const isCollaborator = event.collaboratorIds?.includes(currentUserId);

    if (!isCreator && !isCollaborator) {
      throw new Error("You do not have permission to modify check-ins for this event.");
    }

    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, { checkedIn: checkInStatus });
    await fetchTickets();
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
    return events.filter(event => event.creatorId === creatorId && event.status === 'active');
  }

  const getCollaboratedEvents = (userId: string): Event[] => {
    return events.filter(event => event.collaboratorIds?.includes(userId) && event.status === 'active');
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
    today.setHours(0, 0, 0, 0);

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

  const updateUser = async (uid: string, data: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, data);
      await fetchUsers(); // Refresh the local state
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const addCollaborator = async (eventId: string, email: string): Promise<{success: boolean, message: string}> => {
    const q = query(collection(db, "users"), where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "No user found with that email." };
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      collaboratorIds: arrayUnion(userId)
    });

    await fetchEvents();
    return { success: true, message: "Collaborator added successfully." };
  };

  const removeCollaborator = async (eventId: string, userId: string) => {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      collaboratorIds: arrayRemove(userId)
    });
    await fetchEvents();
  };

  const getUsersByUids = async (uids: string[]): Promise<UserProfile[]> => {
    if (!uids || uids.length === 0) return [];
    const users: UserProfile[] = [];
    // Firestore 'in' query is limited to 30 items. Batch if necessary.
    for (let i = 0; i < uids.length; i += 30) {
      const batchUids = uids.slice(i, i + 30);
      const q = query(collection(db, 'users'), where('uid', 'in', batchUids));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
    }
    return users;
  }

  // News Functions
  const addNewsArticle = async (articleData: Omit<NewsArticle, 'id'>) => {
    try {
      await addDoc(collection(db, 'news'), articleData);
      await fetchNews();
    } catch (error) {
      console.error("Error adding news article:", error);
      throw error;
    }
  };

  const updateNewsArticle = async (id: string, articleData: Partial<Omit<NewsArticle, 'id' | 'publishedDate'>>) => {
    try {
      const articleRef = doc(db, 'news', id);
      await updateDoc(articleRef, articleData);
      await fetchNews();
    } catch (error) {
      console.error("Error updating news article:", error);
      throw error;
    }
  };

  const deleteNewsArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      await fetchNews();
    } catch (error) {
      console.error("Error deleting news article:", error);
      throw error;
    }
  };

  // Launch Subscribers
  const addLaunchSubscriber = async (name: string, email: string) => {
    try {
      const subscriberData = {
        name,
        email,
        subscribedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'launch_subscribers'), subscriberData);
      await fetchLaunchSubscribers();
    } catch (error) {
      console.error("Error adding launch subscriber:", error);
      throw error;
    }
  };

  const addSubscriber = async (email: string) => {
     try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (error) {
      console.error("Error adding subscriber:", error);
      throw error;
    }
  }

  const replyToSubmission = async (submission: ContactSubmission, replyMessage: string) => {
    // This function will need to be implemented, likely involving another API endpoint
    console.log("Replying to submission...", submission.id, replyMessage);
    // 1. Send email to user (submission.email)
    // 2. Update submission status in Firestore
    const submissionRef = doc(db, 'contact_submissions', submission.id);
    await updateDoc(submissionRef, { 
      status: 'replied',
      adminReply: replyMessage,
      repliedAt: new Date().toISOString()
    });
    await fetchContactSubmissions();
  };

  return (
    <AppContext.Provider value={{ 
      events, 
      tickets, 
      news,
      users,
      launchSubscribers,
      contactSubmissions,
      loading, 
      addEvent, 
      updateEvent, 
      deleteEvent,
      addTicket, 
      checkInTicket,
      manualCheckInTicket,
      getTicketById,
      getEventById, 
      getEventsByCreator,
      getCollaboratedEvents,
      getUserTickets,
      getTicketsByEvent,
      getEventStats,
      updateUser,
      addCollaborator,
      removeCollaborator,
      getUsersByUids,
      addNewsArticle,
      updateNewsArticle,
      deleteNewsArticle,
      addLaunchSubscriber,
      addSubscriber,
      replyToSubmission
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
