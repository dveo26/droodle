"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/api";
import { toast ,ToastContainer} from "react-toastify";
import { Button } from "@repo/ui/button";
interface Room {
  id: string;
  slug: string;
}

export default function DashboardPage() {
  const [roomName, setRoomName] = useState("");
  const [roomSlug, setRoomSlug] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("No token found. Please sign in.");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded JWT:", payload);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
    }

    api
      .get("/user/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) setRooms(res.data.rooms);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Failed to fetch your rooms"
        );
        console.error("Failed to fetch rooms:", error);
      });
  }, []);

  const createRoom = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const res = await api.post(
        "/room",
        { name: roomName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.success) {
        toast.success("Room created successfully!");
        router.push(`/canvas/${res.data.roomId}`);
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        // @ts-expect-error: err is typed as unknown but we expect it to have a response property here
        toast.error(err.response.data?.message || "Failed to create room");
      } else {
        toast.error("Failed to create room");
      }
    }
  };

  const joinRoom = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const res = await api.get(`/room/${roomSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success && res.data.room?.id) {
        toast.success("Joined room successfully!");
        router.push(`/canvas/${res.data.room.id}`);
      } else {
        toast.warning("Room not found");
      }
    } catch (e) {
      console.error("Join room error:", e);
      toast.error("Failed to join room");
    }
  };

  return (
    <>
      <div className="max-w- mx-auto text-white py-24 bg-gradient-to-r from-primary/20 via-transparent to-primary/10">
      <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-6xl sm:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
                User
                <span className="text-primary block drop-shadow-[0_0_12px_rgba()]">
                  Dashboard
                </span>
              </h1>
</div>
        {/* Create Room */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Create Room</h2>
          <input
            className="w-full p-2 mt-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <div className="px-2 py-4">
            <Button
              variant="primary"
              onClick={createRoom}
              size="lg"
              className="px-4 py-2 rounded"
            >
              Create
            </Button>
          </div>
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
          <div className="px-2 py-4">
            <Button
              variant="outline"
              size="lg"
              onClick={joinRoom}
              className=" px-4 py-2 rounded"
            >
              Join
            </Button>
          </div>
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-card text-card-foreground border border-border"
      />
    </>
  );
}
