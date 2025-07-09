export interface Event {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  description: string;
  price: number;
  capacity: number;
  imageUrl: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  purchaseDate: string;
}
