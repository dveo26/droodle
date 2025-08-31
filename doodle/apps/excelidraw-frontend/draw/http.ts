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
  console.log("Fetched messages:", messages);

  
  const shapes = messages
    .map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
      } catch (e) {
        console.error("Error parsing message:", e);
        return null;
      }
    })
    .filter((shape: unknown) => shape !== null);

  console.log("Filtered shapes:", shapes);
  return shapes;
}
