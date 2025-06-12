"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    console.log("Connecting to WebSocket with token:", token);
    if (!token) {
      setError("No authentication token found. Please login first.");
      setIsConnecting(false);
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
      setIsConnecting(false);
      setError(null);

      const data = JSON.stringify({
        type: "join_room",
        roomId,
      });
      console.log("Sending join room data:", data);
      ws.send(data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to server");
      setIsConnecting(false);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setSocket(null);
      setIsConnecting(false);

      // Handle different close codes
      if (event.code === 1006) {
        setError("Connection lost. Please refresh the page.");
      } else if (event.code === 1000) {
        setError("Connection closed normally");
      } else {
        setError(`Connection closed with code: ${event.code}`);
      }
    };

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div>Connecting to server...</div>
        </div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500">Connection not established</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
