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

  // Filter out deleted shapes and only return active shapes
  const shapes = messages
    .map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        // Skip messages with delete action
        if (messageData.action === "delete") {
          console.log("Skipping deleted shape:", messageData.shape);
          return null;
        }
        return messageData.shape;
      } catch (e) {
        console.error("Error parsing message:", e);
        return null;
      }
    })
    .filter((shape: any) => shape !== null);

  console.log("Filtered shapes:", shapes);
  return shapes;
}
