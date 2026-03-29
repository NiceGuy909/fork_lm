// src/api/chatApi.tsx
import axios from "axios";

const API_BASE_URL = "/api";

export interface Chat {
  id: string;
  user_id: number;
  title: string;
  created_at: string;
}

export interface Node {
  id: string;
  chat_id: string;
  parent_id: string | null;
  prompt: string;
  response: string;
  token: number;
  path: string;
}

export interface NodesResponse {
  view: "linear" | "tree";
  nodes: Node[];
}

export async function getChats(): Promise<Chat[]> {
  try {
    console.log("Fetching chats from:", `${API_BASE_URL}/chats`);
    const res = await axios.get(`${API_BASE_URL}/chats`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Chats response:", res.data);
    
    // Handle both array response and wrapped response
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data?.chats && Array.isArray(res.data.chats)) {
      return res.data.chats;
    } else if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    
    console.warn("Unexpected response format:", res.data);
    return [];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error fetching chats:", {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
        },
      });
    } else {
      console.error("Error fetching chats:", err);
    }
    return [];
  }
}

export async function getNodes(
  chatId: string,
  selectedNodeId: string | null
): Promise<NodesResponse> {
  try {
    const params = selectedNodeId ? { node_id: selectedNodeId } : {};
    const res = await axios.get(`${API_BASE_URL}/chats/${chatId}/nodes`, {
      params,
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching nodes:", err);
    return { view: "linear", nodes: [] };
  }
}

export async function sendMessage(
  chatId: string,
  body: { prompt: string; selectedNodeId: string | null }
) {
  return axios.post(`/chat/${chatId}/send`, {
    prompt: body.prompt,
    selected_node_id: body.selectedNodeId,
  });
}