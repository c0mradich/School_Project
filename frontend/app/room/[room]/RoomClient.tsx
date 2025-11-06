"use client"

import { useEffect, useState } from "react"
import styles from "../../../css/room.module.css"

type RoomDesc = {
  id: number
  name: string
  tables: number
  chairs: number
  photo: string[]  // массив строк
}

type RoomData = {
  room: RoomDesc
  status: string
  message?: string
}

export default function RoomClient({ room }: { room: string }) {
  const [data, setData] = useState<RoomData | null>(null)
  const apiURL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${apiURL}/fetchRoomData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room }),
        cache: "no-store",
      })

      const json = await res.json()

      // Если photo приходит как JSON-строка, парсим её
      if (json.room?.photo && typeof json.room.photo === "string") {
        try {
          json.room.photo = JSON.parse(json.room.photo)
        } catch {
          json.room.photo = [] // fallback на пустой массив
        }
      }

      setData(json)
      console.log(json)
    }

    fetchData()
  }, [room, apiURL])

  if (!data) return <p className={styles.loading}>Lade Raumdaten...</p>

  return (
  <div className={styles.container}>
    <div className={styles.card}>
      <h1 className={styles.roomName}>Room: {data.room.name}</h1>
      <p className={styles.details}>Tische: {data.room.tables}</p>
      <p className={styles.details}>Stühle: {data.room.chairs}</p>
      {data.message && <p className={styles.details}>{data.message}</p>}

      <div className={styles.photos}>
        {data.room.photo.map((p, i) => (
          <img key={i} src={`${apiURL}/uploads/${p}`} alt={`Room ${data.room.name} photo`} />
        ))}
      </div>
    </div>
  </div>
  )
}
