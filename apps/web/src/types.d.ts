export type Character = {
  id: string;
  name: string;
  systemPrompt: string;
  ollamaUrl: string;
  ollamaApiKey: string | null;
  ollamaModel: string;
};

export type Message = {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
  updatedAt: string;
};
