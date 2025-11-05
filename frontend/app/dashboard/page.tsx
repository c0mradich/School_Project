"use client"
import styles from "../../css/dashboard.module.css"
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
<main className={styles.mainGrid}>
  {rooms.map((room) => {
    const photos: string[] = JSON.parse(room.photo || "[]");
    return (
      <div className={styles.roomsContainer} key={room.id} onClick={()=>{router.push(`/${room.name}`)}} >
        <div className={styles.roomName}>
          <span>Name: {room.name}</span>
        </div>
        <div className={styles.chairs}>
          <span>Stuhle: {room.chairs}</span>
        </div>
        <div className={styles.tables}>
          <span>Tische: {room.tables}</span>
        </div>
        <div className={styles.photos}>
          {photos.map((file, idx) => (
            <img
              key={idx}
              src={`${apiURL}/uploads/${file}`}
              alt={`Room photo ${idx + 1}`}
              width={150}
              className={styles.photoImg}
            />
          ))}
        </div>
      </div>
    );
  })}
</main>
  )
}
