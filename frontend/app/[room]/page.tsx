export default async function Room({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params
  const apiURL = process.env.NEXT_PUBLIC_API_URL

  async function fetchData(){
    const res = await fetch(`${apiURL}/fetchRoomData`, {
        method: "POST",
        body: JSON.stringify({room: room})
    })
    const data = await res.json()
    return data
  }

  return (
    <div>
      Room: {room}
    </div>
  )
}
