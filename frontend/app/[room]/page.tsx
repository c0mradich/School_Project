export default async function Room({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params

  return (
    <div>
      Room: {room}
    </div>
  )
}
