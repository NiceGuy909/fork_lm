import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export type Chat = {
  id: string;
  user_id: number;
  title: string | null;
  created_at: string;
};

export type Node = {
  id: string;
  chat_id: string;
  parent_id: string | null;
  token: number;
  path: string;
  prompt: string;
  response: string;
  created_at: string;
  depth: number;
};

export type GetNodesResponse =
  | { view: "linear"; nodes: Node[] }
  | { view: "tree"; nodes: Node[] };

export async function getChats() {
  const res = await api.get<Chat[]>("/chats");
  return res.data;
}

export async function createChat(title?: string) {
  const res = await api.post<Chat>("/chats", null, {
    params: { title },
  });
  return res.data;
}

export async function deleteChat(chatId: string) {
  const res = await api.delete(`/chats/${chatId}`);
  return res.data;
}

export async function getNodes(chatId: string, selectedNodeId: string | null) {
  const res = await api.get<GetNodesResponse>(`/chats/${chatId}/nodes`, {
    params: selectedNodeId ? { selected_node_id: selectedNodeId } : {},
  });
  return res.data;
}

export async function sendMessage(
  chatId: string,
  body: { prompt: string; selectedNodeId: string | null }
) {
  const res = await api.post(`/chats/${chatId}/send`, {
    prompt: body.prompt,
    selected_node_id: body.selectedNodeId,
  });
  return res.data;
}