import { Metadata } from "next";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const metadata: Metadata = {
  title: "Room",
  description: "Chat room page",
};

export default function RoomPage({ params }: Props) {
  const { slug } = params;

  return (
    <div>
      <h1>Room: {slug}</h1>
    </div>
  );
}
