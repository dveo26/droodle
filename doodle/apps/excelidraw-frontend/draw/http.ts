import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
