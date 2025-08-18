import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// User types and operations
export interface User {
  id?: string
  civicId: string
  email: string
  name: string
  role: "ATTENDEE" | "ORGANIZER" | "SCANNER"
  createdAt: Timestamp
}

export const createUser = async (userData: Omit<User, "id" | "createdAt">) => {
  const docRef = await addDoc(collection(db, "users"), {
    ...userData,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export const getUserByCivicId = async (civicId: string): Promise<User | null> => {
  const q = query(collection(db, "users"), where("civicId", "==", civicId))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return { id: doc.id, ...doc.data() } as User
}

// Event types and operations
export interface Event {
  id?: string
  title: string
  description: string
  location: string
  date: Timestamp
  organizerId: string
  createdAt: Timestamp
}

export const createEvent = async (eventData: Omit<Event, "id" | "createdAt">) => {
  const docRef = await addDoc(collection(db, "events"), {
    ...eventData,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export const getAllEvents = async (): Promise<Event[]> => {
  const q = query(collection(db, "events"), orderBy("date", "asc"))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[]
}

export const getEventById = async (eventId: string): Promise<Event | null> => {
  const docRef = doc(db, "events", eventId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return { id: docSnap.id, ...docSnap.data() } as Event
}

// Ticket types and operations
export interface Ticket {
  id?: string
  userId: string
  eventId: string
  qrCode: string
  checkedIn: boolean
  createdAt: Timestamp
  checkedInAt?: Timestamp
}

export const createTicket = async (ticketData: Omit<Ticket, "id" | "createdAt">) => {
  const docRef = await addDoc(collection(db, "tickets"), {
    ...ticketData,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export const getTicketByQrCode = async (qrCode: string): Promise<Ticket | null> => {
  const q = query(collection(db, "tickets"), where("qrCode", "==", qrCode))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Ticket
}

export const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
  const eventRef = doc(db, "events", eventId)
  await updateDoc(eventRef, {
    ...eventData,
    updatedAt: Timestamp.now(),
  })
}

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const q = query(collection(db, "tickets"), where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Ticket[]
}

export const getExistingTicket = async (userId: string, eventId: string): Promise<Ticket | null> => {
  const q = query(
    collection(db, "tickets"), 
    where("userId", "==", userId),
    where("eventId", "==", eventId)
  )
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Ticket
}

export const checkInTicket = async (ticketId: string) => {
  const ticketRef = doc(db, "tickets", ticketId)
  await updateDoc(ticketRef, {
    checkedIn: true,
    checkedInAt: Timestamp.now(),
  })
}

export const getEventAttendees = async (eventId: string): Promise<Ticket[]> => {
  const q = query(collection(db, "tickets"), where("eventId", "==", eventId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[]
}
