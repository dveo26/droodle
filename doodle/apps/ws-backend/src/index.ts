import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
  return null;
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
    }

    console.log("message received");
    console.log(parsedData);

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const messageData = JSON.parse(message);

      if (messageData.action === "delete") {
        // Find and delete the shape from the database
        const shape = messageData.shape;
        console.log("Deleting shape from database:", shape);

        try {
          // Get all messages for this room
          const messages = await prismaClient.chat.findMany({
            where: {
              roomId: Number(roomId),
            },
          });

          // Find the exact message containing this shape
          const messageToDelete = messages.find((msg) => {
            try {
              const msgData = JSON.parse(msg.message);
              if (!msgData.shape) return false;

              // Compare shape properties
              const msgShape = msgData.shape;
              if (msgShape.type !== shape.type) return false;

              switch (shape.type) {
                case "rect":
                  return (
                    msgShape.left === shape.left &&
                    msgShape.top === shape.top &&
                    msgShape.width === shape.width &&
                    msgShape.height === shape.height
                  );
                case "circle":
                  return (
                    msgShape.left === shape.left &&
                    msgShape.top === shape.top &&
                    msgShape.radius === shape.radius
                  );
                case "line":
                  return (
                    msgShape.x1 === shape.x1 &&
                    msgShape.y1 === shape.y1 &&
                    msgShape.x2 === shape.x2 &&
                    msgShape.y2 === shape.y2
                  );
                case "pencil":
                  return msgShape.path === shape.path;
                case "text":
                  return (
                    msgShape.left === shape.left &&
                    msgShape.top === shape.top &&
                    msgShape.text === shape.text &&
                    msgShape.fontSize === shape.fontSize
                  );
                default:
                  return false;
              }
            } catch (e) {
              console.error("Error parsing message:", e);
              return false;
            }
          });

          if (messageToDelete) {
            console.log("Found message to delete:", messageToDelete.id);
            // Delete the message from the database
            await prismaClient.chat.delete({
              where: {
                id: messageToDelete.id,
              },
            });
            console.log("Message deleted from database");
          } else {
            console.log("No matching message found to delete");
          }
        } catch (error) {
          console.error("Error deleting shape:", error);
        }
      } else {
        // Create new shape
        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId,
          },
        });
      }

      // Broadcast the message to all users in the room
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
    }
  });
});
