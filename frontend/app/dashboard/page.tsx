"use client"
import "../../css/dashboard.css"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const apiURL = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])

  async function someFunc() {
    try {
      const res = await fetch(`${apiURL}/dashboard`, {
        credentials: "include"
      })
      const data = await res.json()
      setRooms(data.rooms)
      console.log(data.rooms) 
    } catch (err) {
      console.log("fetching fail pipeline", err)
    }
  }

  // Auth gatekeeping layer
  useEffect(() => {
    const uid = sessionStorage.getItem("user_id")
    const uname = sessionStorage.getItem("user_name")

    if (!uid || !uname) {
      router.replace("/login")
    } 
  }, [])

  useEffect(() => {
    someFunc()
  }, [])

  return (
  <main>
    {rooms.map((room) => {
      const photos: string[] = JSON.parse(room.photo || "[]");
      return (
        <div className="RoomsContainer" key={room.id}>
          <div className="Room_Name">
            <span>Name: {room.name}</span>
          </div>
          <div className="chairs">
            <span>Chairs: {room.chairs}</span>
          </div>
          <div className="tables">
            <span>Tables: {room.tables}</span>
          </div>
          <div className="photos">
            {photos.map((file, idx) => (
              <img
                key={idx}
                src={`${apiURL}/uploads/${file}`}
                alt={`Room photo ${idx + 1}`}
                width={150}
              />
            ))}
          </div>
        </div>
      );
    })}
  </main>
  )
}
