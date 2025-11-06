import RoomClient from "./RoomClient"

export default async function Page({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params
  return <RoomClient room={room} />
}
