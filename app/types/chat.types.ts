// TypeScript types for Chat & Follows

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatThread {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export type MessageType = 'text' | 'job_card' | 'referral_request' | 'system';

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}
