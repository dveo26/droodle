import { Metadata } from "next";
import { RoomCanvas } from "@/components/RoomCanvas";

export const metadata: Metadata = {
  title: "Canvas Room",
  description: "Collaborative drawing canvas",
};

interface PageProps {
  params: Promise<{ roomId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CanvasPage({ params }: PageProps) {
  const { roomId } = await params;
  return <RoomCanvas roomId={roomId} />;
}
