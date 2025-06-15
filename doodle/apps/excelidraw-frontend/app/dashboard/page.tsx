"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/api";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@repo/ui/button";
import { Plus, Users, ArrowRight, LayoutGrid } from "lucide-react";
import { Card } from "@repo/ui/card";

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
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        toast.error(
          (err.response.data as { message: string }).message ||
            "Failed to create room"
        );
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

  const formatRoomId = (id: string) => {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                Welcome to Your
                <span className="text-primary block mt-2">Drawing Space</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Create new rooms or join existing ones to start collaborating
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Room Section */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Create New Room</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Room Name
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Enter room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={createRoom}
                  size="lg"
                  className="w-full"
                >
                  Create Room
                </Button>
              </div>
            </Card>

            {/* Join Room Section */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Join Room</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Room Code
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Enter room code"
                    value={roomSlug}
                    onChange={(e) => setRoomSlug(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={joinRoom}
                  className="w-full"
                >
                  Join Room
                </Button>
              </div>
            </Card>
          </div>

          {/* Your Rooms Section */}
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Your Rooms</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg border border-border bg-card"
                  onClick={() => router.push(`/canvas/${room.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{room.slug}</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {formatRoomId(room.id)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {rooms.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No rooms created yet. Create your first room to get started!
                </div>
              )}
            </div>
          </div>
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
