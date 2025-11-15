
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface MessagePart {
  text?: string;
  image?: string; 
  searchResults?: GroundingChunk[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
}
