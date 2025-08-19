
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Event, Ticket, UserProfile, NewsArticle, LaunchSubscriber, ContactSubmission, Message, FeaturedArticle, SubscriptionRequest, SubscriptionPlan, Course, Lesson, CourseEnrollmentRequest, Organization } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, limit, orderBy, serverTimestamp, writeBatch, documentId, setDoc } from 'firebase/firestore';
import { renderTemplate } from '@/lib/email-templates';
import { PaymentCalculator } from '@/lib/payment-config';
import { FirebasePaymentService } from '@/lib/firebase-payment-service';

interface AppContextType {
  events: Event[];
  tickets: Ticket[];
  news: NewsArticle[];
  users: UserProfile[];
  courses: Course[];
  organizations: Organization[];
  launchSubscribers: LaunchSubscriber[];
  contactSubmissions: ContactSubmission[];
  featuredArticle: FeaturedArticle | null;
  subscriptionRequests: SubscriptionRequest[];
  courseEnrollmentRequests: CourseEnrollmentRequest[];
  loading: boolean;
  // Organizations
  addOrganization: (orgData: Omit<Organization, 'id' | 'followerIds'>) => Promise<void>;
  updateOrganization: (id: string, orgData: Partial<Omit<Organization, 'id'>>) => Promise<void>;
  // Events
  addEvent: (event: Omit<Event, 'id' | 'collaboratorIds' | 'status'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Omit<Event, 'id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
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
  checkInTicket: (ticketId: string, eventId: string, currentUserId: string) => Promise<void>;
  manualCheckInTicket: (ticketId: string, eventId: string, currentUserId: string, checkInStatus: boolean) => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket | undefined>;
  getUserTicketsByEmail: (email: string) => Promise<Ticket[]>;
  getTicketsByEvent: (eventId: string) => Ticket[];
  updateTicket: (id: string, ticketData: Partial<Omit<Ticket, 'id'>>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  // Users
  updateUser: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  addCollaborator: (organizationId: string, email: string) => Promise<{success: boolean, message: string, userId?: string}>;
  removeCollaborator: (organizationId: string, userId: string) => Promise<void>;
  getUsersByUids: (uids: string[]) => Promise<UserProfile[]>;
  addEnrolledCourse: (userId: string, courseId: string) => Promise<void>;
  // News
  addNewsArticle: (article: Omit<NewsArticle, 'id'>) => Promise<void>;
  updateNewsArticle: (id: string, articleData: Partial<Omit<NewsArticle, 'id' | 'publishedDate'>>) => Promise<void>;
  deleteNewsArticle: (id: string) => Promise<void>;
  // Courses
  addCourse: (courseData: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, courseData: Partial<Omit<Course, 'id'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourseById: (courseId: string) => Promise<Course | undefined>;
  // Featured Article
  saveFeaturedArticle: (article: Omit<FeaturedArticle, 'id' | 'updatedAt'>) => Promise<void>;
  // Subscribers
  addSubscriber: (email: string, name?: string) => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;
  bulkAddSubscribers: (subscribers: {email: string, name?: string}[]) => Promise<void>;
  // Subscription Requests
  createSubscriptionRequest: (userId: string, plan: SubscriptionPlan, price: number, bookingCode: string) => Promise<void>;
  approveSubscriptionRequest: (requestId: string, userId: string, plan: SubscriptionPlan, userEmail: string | null, userName: string | null) => Promise<void>;
  getUserSubscriptionRequests: (email: string) => Promise<SubscriptionRequest[]>;
  // Course Enrollment Requests
  createCourseEnrollmentRequest: (userId: string, courseId: string, courseTitle: string, price: number, bookingCode: string) => Promise<void>;
  approveCourseEnrollment: (requestId: string, userId: string, courseId: string) => Promise<void>;
  // Contact Submissions
  replyToSubmission: (submission: ContactSubmission, replyMessage: string) => Promise<void>;
  // AI Chat
  getChatHistory: (userId: string) => Promise<Message[]>;
  saveChatMessage: (userId: string, message: Message) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const removeDuplicates = <T extends { id: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => {
        if (seen.has(item.id)) {
            return false;
        }
        seen.add(item.id);
        return true;
    });
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [launchSubscribers, setLaunchSubscribers] = useState<LaunchSubscriber[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<FeaturedArticle | null>(null);
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>([]);
  const [courseEnrollmentRequests, setCourseEnrollmentRequests] = useState<CourseEnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
        const [
            eventsSnapshot, 
            ticketsSnapshot, 
            newsSnapshot, 
            usersSnapshot,
            coursesSnapshot,
            organizationsSnapshot,
            launchSubscribersSnapshot,
            contactSubmissionsSnapshot,
            featuredArticleDoc,
            subscriptionRequestsSnapshot,
            courseEnrollmentRequestsSnapshot,
        ] = await Promise.all([
            getDocs(query(collection(db, 'events'))),
            getDocs(query(collection(db, 'tickets'))),
            getDocs(query(collection(db, 'news'), orderBy('publishedDate', 'desc'))),
            getDocs(query(collection(db, 'users'))),
            getDocs(query(collection(db, 'courses'), orderBy('title'))),
            getDocs(query(collection(db, 'organizations'), orderBy('name'))),
            getDocs(query(collection(db, 'launch_subscribers'), orderBy('subscribedAt', 'desc'))),
            getDocs(query(collection(db, 'contact_submissions'), orderBy('submittedAt', 'desc'))),
            getDoc(doc(db, 'featured_content', 'current')),
            getDocs(query(collection(db, 'subscription_requests'), orderBy('requestedAt', 'desc'))),
            getDocs(query(collection(db, 'course_enrollment_requests'), orderBy('requestedAt', 'desc'))),
        ]);

        const fetchedCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        // Enrich courses with lessons subcollection
        for (const course of fetchedCourses) {
          const lessonsSnapshot = await getDocs(query(collection(db, 'courses', course.id, 'lessons')));
          course.lessons = lessonsSnapshot.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
        }

        setEvents(removeDuplicates(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event))));
        setTickets(removeDuplicates(ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket))));
        setNews(removeDuplicates(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle))));
        setUsers(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        setCourses(fetchedCourses);
        setOrganizations(organizationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization)));
        setLaunchSubscribers(launchSubscribersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LaunchSubscriber)));
        setContactSubmissions(contactSubmissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactSubmission)));
        
        setSubscriptionRequests(subscriptionRequestsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                requestedAt: data.requestedAt?.toDate().toISOString() || new Date().toISOString()
            } as SubscriptionRequest
        }));

        setCourseEnrollmentRequests(courseEnrollmentRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseEnrollmentRequest)));
        
        if (featuredArticleDoc.exists()) {
            setFeaturedArticle({ id: featuredArticleDoc.id, ...featuredArticleDoc.data() } as FeaturedArticle);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    }
    loadData();
  }, [fetchAllData]);

  // --- Organization Functions ---
  const addOrganization = async (orgData: Omit<Organization, 'id' | 'followerIds'>) => {
    try {
      await addDoc(collection(db, 'organizations'), {
        ...orgData,
        followerIds: [], // Ensure followerIds is initialized
      });
      await fetchAllData();
    } catch (error) {
       console.error("Error adding organization:", error);
       throw error;
    }
  };

  const updateOrganization = async (id: string, orgData: Partial<Omit<Organization, 'id'>>) => {
    try {
      const orgRef = doc(db, 'organizations', id);
      await updateDoc(orgRef, orgData);
      await fetchAllData();
    } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
    }
  };


  // --- Course Functions ---
  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    const { lessons, ...mainCourseData } = courseData;
    const batch = writeBatch(db);
    const courseRef = doc(collection(db, 'courses'));
    
    batch.set(courseRef, mainCourseData);

    if (lessons) {
        lessons.forEach(lesson => {
            const lessonRef = doc(collection(db, 'courses', courseRef.id, 'lessons'));
            batch.set(lessonRef, lesson);
        });
    }
    
    await batch.commit();
    await fetchAllData();
  };

  const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id'>>) => {
    try {
      const courseRef = doc(db, 'courses', id);
      await updateDoc(courseRef, courseData);
      await fetchAllData();
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  };

  const getCourseById = async (id: string): Promise<Course | undefined> => {
    try {
      const courseRef = doc(db, 'courses', id);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
          const course = { id: courseSnap.id, ...courseSnap.data() } as Course;
          const lessonsSnapshot = await getDocs(query(collection(db, 'courses', course.id, 'lessons')));
          course.lessons = lessonsSnapshot.docs.map(lessonDoc => ({ id: lessonDoc.id, ...lessonDoc.data() } as Lesson));
          return course;
      }
      return undefined;
    } catch (error) {
        console.error("Error getting course by id", error);
        return undefined;
    }
  }

  const notifyAllSubscribers = async (item: Event | NewsArticle, type: 'event' | 'news') => {
    // Combine users and launch subscribers, ensuring unique emails
    const allUserEmails = users.map(u => u.email).filter(Boolean) as string[];
    const allSubscriberEmails = launchSubscribers.map(s => s.email);
    const uniqueEmails = [...new Set([...allUserEmails, ...allSubscriberEmails])];
    
    if (uniqueEmails.length === 0) return;

    const emailData = {
      type: 'template',
      recipientType: 'custom',
      recipients: uniqueEmails,
      senderRole: 'admin',
      templateId: 'newContentAnnouncement',
      templateContent: {
        subject: type === 'event' 
          ? `🎉 New Event: ${item.name}` 
          : `📰 New Article: ${item.title}`,
        headline: type === 'event' ? "Don't Miss This Event!" : "Latest News & Insights",
        contentTitle: item.title || (item as Event).name,
        imageUrl: item.imageUrl,
        description: item.description.substring(0, 150) + '...',
        buttonText: type === 'event' ? 'View Event & Register' : 'Read Full Article',
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${type === 'event' ? 'events' : 'news'}/${item.id}`
      }
    };
    
    // Fire-and-forget the email sending API call
    fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
    }).catch(error => console.error("Failed to trigger email notification:", error));
  };


  const addEvent = async (eventData: Omit<Event, 'id' | 'collaboratorIds' | 'status'>) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), { 
        ...eventData, 
        collaboratorIds: [],
        status: 'active' 
      });
      await fetchAllData();
      // Notify subscribers after event is created
      notifyAllSubscribers({ id: docRef.id, ...eventData, title: eventData.name }, 'event');
    } catch (error) {
       console.error("Error adding event:", error);
       throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Omit<Event, 'id'>>) => {
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, eventData);
      await fetchAllData();
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, { status: 'archived' });
      await fetchAllData();
    } catch (error) {
      console.error("Error archiving event:", error);
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
    await fetchAllData();
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

  const updateTicket = async (id: string, ticketData: Partial<Omit<Ticket, 'id'>>) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, ticketData);
      await fetchAllData();
    } catch (error) {
        console.error("Error updating ticket:", error);
        throw error;
    }
  }
  
  const deleteTicket = async (id: string) => {
    try {
      const ticketRef = doc(db, 'tickets', id);
      await deleteDoc(ticketRef);
      await fetchAllData();
    } catch (error) {
        console.error("Error deleting ticket:", error);
        throw error;
    }
  };

  const getEventById = async (id: string): Promise<Event | undefined> => {
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

  const getUserTicketsByEmail = async (email: string): Promise<Ticket[]> => {
    const q = query(collection(db, "tickets"), where("attendeeEmail", "==", email));
    const querySnapshot = await getDocs(q);
    const userTickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    
    // Enrich with event data
    for (let ticket of userTickets) {
      if (ticket.eventId) {
        ticket.event = await getEventById(ticket.eventId);
      }
    }
    return userTickets;
  }

  const getUserSubscriptionRequests = async (email: string): Promise<SubscriptionRequest[]> => {
    // Subscriptions are linked by userId, so first find the user by email
    const usersQuery = query(collection(db, "users"), where("email", "==", email), limit(1));
    const userSnapshot = await getDocs(usersQuery);

    if (userSnapshot.empty) {
      return [];
    }
    const userId = userSnapshot.docs[0].id;
    
    // Now find subscription requests for that userId
    const subsQuery = query(collection(db, "subscription_requests"), where("userId", "==", userId));
    const subsSnapshot = await getDocs(subsQuery);
    return subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriptionRequest));
  };


  const getTicketsByEvent = (eventId: string): Ticket[] => {
    return tickets.filter(ticket => ticket.eventId === eventId);
  };

  const getEventStats = (creatorId: string) => {
    const userEvents = getEventsByCreator(creatorId);
    
    const userEventIds = new Set(userEvents.map(e => e.id));
    const userTickets = tickets.filter(ticket => userEventIds.has(ticket.eventId));
    
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
      await fetchAllData();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };
  
  const addEnrolledCourse = async (userId: string, courseId: string) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      enrolledCourseIds: arrayUnion(courseId)
    });
    await fetchAllData();
  }

  const addCollaborator = async (organizationId: string, email: string): Promise<{success: boolean, message: string, userId?: string}> => {
    const q = query(collection(db, "users"), where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "No user found with that email." };
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    const orgRef = doc(db, 'organizations', organizationId);
    await updateDoc(orgRef, {
      memberIds: arrayUnion(userId)
    });

    await fetchAllData();
    return { success: true, message: "Collaborator added successfully.", userId };
  };

  const removeCollaborator = async (organizationId: string, userId: string) => {
    const orgRef = doc(db, 'organizations', organizationId);
    await updateDoc(orgRef, {
      memberIds: arrayRemove(userId)
    });
    await fetchAllData();
  };

  const getUsersByUids = async (uids: string[]): Promise<UserProfile[]> => {
    if (!uids || uids.length === 0) return [];
    const usersList: UserProfile[] = [];
    // Firestore 'in' query supports up to 30 elements
    for (let i = 0; i < uids.length; i += 30) {
      const batchUids = uids.slice(i, i + 30);
      const q = query(collection(db, 'users'), where(documentId(), 'in', batchUids));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
    }
    return usersList;
  }

  // News Functions
  const addNewsArticle = async (articleData: Omit<NewsArticle, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'news'), articleData);
      await fetchAllData();
      notifyAllSubscribers({ id: docRef.id, ...articleData, name: articleData.title }, 'news');
    } catch (error) {
      console.error("Error adding news article:", error);
      throw error;
    }
  };

  const updateNewsArticle = async (id: string, articleData: Partial<Omit<NewsArticle, 'id' | 'publishedDate'>>) => {
    try {
      const articleRef = doc(db, 'news', id);
      await updateDoc(articleRef, articleData);
      await fetchAllData();
    } catch (error) {
      console.error("Error updating news article:", error);
      throw error;
    }
  };

  const deleteNewsArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting news article:", error);
      throw error;
    }
  };

  // Featured Article
  const saveFeaturedArticle = async (article: Omit<FeaturedArticle, 'id' | 'updatedAt'>) => {
    try {
      const articleRef = doc(db, 'featured_content', 'current');
      await setDoc(articleRef, { ...article, updatedAt: serverTimestamp() });
      await fetchAllData();
    } catch (error) {
      console.error("Error setting featured article:", error);
      throw error;
    }
  }

  // Subscribers
  const addSubscriber = async (email: string, name?: string) => {
    if (!email) throw new Error("Email is required.");
    const q = query(collection(db, 'launch_subscribers'), where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("This email is already subscribed.");
    }
    
    await addDoc(collection(db, 'launch_subscribers'), {
      email,
      name: name || '',
      subscribedAt: serverTimestamp(),
    });
    await fetchAllData();
  };

  const deleteSubscriber = async (id: string) => {
    await deleteDoc(doc(db, 'launch_subscribers', id));
    setLaunchSubscribers(prev => prev.filter(s => s.id !== id));
  };
  
  const bulkAddSubscribers = async (subscribers: { email: string; name?: string }[]) => {
    const batch = writeBatch(db);
    const subscribersRef = collection(db, "launch_subscribers");

    for (const sub of subscribers) {
        if (sub.email && !launchSubscribers.some(s => s.email === sub.email)) {
            const docRef = doc(subscribersRef);
            batch.set(docRef, {
                email: sub.email,
                name: sub.name || '',
                subscribedAt: serverTimestamp()
            });
        }
    }
    await batch.commit();
    await fetchAllData();
  };


  // Subscription Requests
  const createSubscriptionRequest = async (userId: string, plan: SubscriptionPlan, price: number, bookingCode: string) => {
    await addDoc(collection(db, 'subscription_requests'), {
      userId,
      plan,
      price,
      bookingCode,
      status: 'pending',
      requestedAt: serverTimestamp()
    });
    await fetchAllData();
  };

  const approveSubscriptionRequest = async (requestId: string, userId: string, plan: SubscriptionPlan, userEmail: string | null, userName: string | null) => {
    const batch = writeBatch(db);
    const requestRef = doc(db, 'subscription_requests', requestId);
    batch.update(requestRef, { status: 'approved', approvedAt: serverTimestamp() });

    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { subscriptionPlan: plan });

    await batch.commit();

    if (userEmail) {
      const planBenefits = {
        'Essential': 'Sell Paid Tickets\n3% commission rate\nPromotional Codes',
        'Pro': 'Lowest commission (1%)\nMarketing & Analytics Tools\nEmbeddable Widget\nPriority Support',
        'Free': '', // Not applicable but good to have
        'Custom': 'Custom benefits as discussed.'
      };
      const planPrices = { 'Essential': 5000, 'Pro': 15000, 'Free': 0, 'Custom': 0 };

      const emailData = {
        type: 'template',
        recipientType: 'custom',
        recipients: [userEmail],
        senderRole: 'admin',
        templateId: 'subscriptionApproved',
        templateContent: {
          userName: userName || 'there',
          planName: plan,
          planPrice: PaymentCalculator.formatCurrency(planPrices[plan as keyof typeof planPrices] || 0, 'GHS'),
          planBenefits: planBenefits[plan as keyof typeof planBenefits] || 'Custom benefits as discussed.'
        }
      };

      fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData),
      }).catch(err => console.error("Failed to send approval email:", err));
    }

    await fetchAllData();
  };
  
  // Course Enrollment
  const createCourseEnrollmentRequest = async (userId: string, courseId: string, courseTitle: string, price: number, bookingCode: string) => {
      await addDoc(collection(db, "course_enrollment_requests"), {
          userId,
          courseId,
          courseTitle,
          price,
          bookingCode,
          status: 'pending',
          requestedAt: serverTimestamp(),
      });
      await fetchAllData();
  };

  const approveCourseEnrollment = async (requestId: string, userId: string, courseId: string) => {
    const batch = writeBatch(db);
    const requestRef = doc(db, 'course_enrollment_requests', requestId);
    batch.update(requestRef, { status: 'approved' });

    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { enrolledCourseIds: arrayUnion(courseId) });

    await batch.commit();
    await fetchAllData();
  };


  const replyToSubmission = async (submission: ContactSubmission, replyMessage: string) => {
    const submissionRef = doc(db, 'contact_submissions', submission.id);
    await updateDoc(submissionRef, { 
      status: 'replied',
      adminReply: replyMessage,
      repliedAt: serverTimestamp()
    });
    
    const emailData = {
        type: 'template',
        recipientType: 'custom',
        recipients: [submission.email],
        senderRole: 'admin',
        templateId: 'simpleAnnouncement',
        templateContent: {
            subject: `Re: ${submission.subject}`,
            headline: 'A reply from TicketFlow Support',
            message: replyMessage,
        }
    };

    fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
    }).catch(err => console.error("Failed to send contact reply email:", err));
    
    await fetchAllData();
  };

  const getChatHistory = async (userId: string): Promise<Message[]> => {
    try {
      const historyCollection = collection(db, 'users', userId, 'ai_chat_history');
      const historySnapshot = await getDocs(query(historyCollection, orderBy('timestamp', 'asc')));
      return historySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Message
      });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  };
  
  const saveChatMessage = async (userId: string, message: Message) => {
    try {
      const historyCollection = collection(db, 'users', userId, 'ai_chat_history');
      await addDoc(historyCollection, {
        ...message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const contextValue: AppContextType = {
      events, 
      tickets, 
      news,
      users,
      courses,
      organizations,
      launchSubscribers,
      contactSubmissions,
      featuredArticle,
      subscriptionRequests,
      courseEnrollmentRequests,
      loading,
      addOrganization,
      updateOrganization,
      addEvent, 
      updateEvent, 
      deleteEvent,
      checkInTicket,
      manualCheckInTicket,
      getTicketById,
      getUserTicketsByEmail,
      getTicketsByEvent,
      updateTicket,
      deleteTicket,
      getEventById, 
      getEventsByCreator,
      getCollaboratedEvents,
      getEventStats,
      updateUser,
      addEnrolledCourse,
      addCollaborator,
      removeCollaborator,
      getUsersByUids,
      addNewsArticle,
      updateNewsArticle,
      deleteNewsArticle,
      addCourse,
      updateCourse,
      deleteCourse,
      getCourseById,
      saveFeaturedArticle,
      addSubscriber,
      deleteSubscriber,
      bulkAddSubscribers,
      createSubscriptionRequest,
      approveSubscriptionRequest,
      getUserSubscriptionRequests,
      createCourseEnrollmentRequest,
      approveCourseEnrollment,
      replyToSubmission,
      getChatHistory,
      saveChatMessage
  };

  return (
    <AppContext.Provider value={contextValue}>
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

