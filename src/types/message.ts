export type ConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  sentAt: Date;
  readAt?: Date;
}

export interface Conversation {
  id: string;
  flightId: string;
  participant1Id: string;
  participant2Id: string;
  status: ConversationStatus;
  createdAt: Date;
  closedAt?: Date;
  messages?: Message[];
}

export interface CreateMessageInput {
  conversationId: string;
  recipientId: string;
  content: string;
}

export interface CreateConversationInput {
  flightId: string;
  recipientId: string;
  initialMessage: string;
}
