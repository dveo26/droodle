"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/api";

export default function DashboardPage() {
  const [roomName, setRoomName] = useState("");
  const [roomSlug, setRoomSlug] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      return;
    }

    console.log("Token before request:", token);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded JWT:", payload);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
    }

    api
      .get("/user/rooms", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) setRooms(res.data.rooms);
      })
      .catch((error) => {
        console.error("Failed to fetch rooms:", error.response?.data || error);
      });
  }, []);

  const createRoom = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in first");
      return;
    }

    try {
      console.log("Creating room with token:", token);
      const res = await api.post(
        "/room",
        { name: roomName },
        {
          headers: {
            Authorization: ` ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.success) {
        router.push(`/canvas/${res.data.roomId}`);
      }
    } catch (err: any) {
      console.error("Create room error:", err.response?.data || err);
      alert(err?.response?.data?.message || "Failed to create room");
    }
  };

  const joinRoom = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in first");
      return;
    }

    try {
      const res = await api.get(`/room/${roomSlug}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      if (res.data.success && res.data.room?.id) {
        router.push(`/canvas/${res.data.room.id}`);
      } else {
        alert("Room not found");
      }
    } catch (e) {
      console.error("Join room error:", e);
      alert("Failed to join room");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Create Room */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Create Room</h2>
        <input
          className="w-full p-2 mt-2 rounded bg-gray-800 text-white border border-gray-600"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button
          onClick={createRoom}
          className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* Join Room */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Join Room by Slug</h2>
        <input
          className="w-full p-2 mt-2 rounded bg-gray-800 text-white border border-gray-600"
          placeholder="Room slug"
          value={roomSlug}
          onChange={(e) => setRoomSlug(e.target.value)}
        />
        <button
          onClick={joinRoom}
          className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Join
        </button>
      </div>

      {/* User Rooms */}
      <div>
        <h2 className="text-xl font-semibold">Your Created Rooms</h2>
        <ul className="mt-4 space-y-2">
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                className="w-full text-left bg-gray-700 p-2 rounded hover:bg-gray-600"
                onClick={() => router.push(`/canvas/${room.id}`)}
              >
                {room.slug} (ID: {room.id})
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
