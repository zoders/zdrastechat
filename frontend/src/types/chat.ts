export interface Message {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  is_read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  last_message?: Message | null;
}

export interface MessagesPage {
  results: Message[];
  has_more: boolean;
  next_before: string | null;
}

export interface FoundUser {
  id: string;
  username: string;
}
