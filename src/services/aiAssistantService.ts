import axiosClient from '../api/axiosClient';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isMock?: boolean;
  provider?: string;
  model?: string;
  timestamp: string;
}

export interface ChatApiResponse {
  reply: string;
  isMock: boolean;
  provider: string;
  model: string;
  region?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  fallbackReason?: string;
  timestamp: string;
}

export const aiAssistantService = {
  async sendMessage(message: string, history: AiChatMessage[] = []): Promise<ChatApiResponse> {
    const formattedHistory = history.map((h) => ({
      role: h.role,
      content: h.content,
    }));

    const response = await axiosClient.post<ChatApiResponse>('/bedrock/chat', {
      message,
      history: formattedHistory,
    });

    return response.data;
  },
};
