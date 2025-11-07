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
  const [roomName, setRoomName] = useState('')
  const [chairs, setChairs] = useState('')
  const [tables, setTables] = useState('')
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
      setRoomName(json.room.name)
      setChairs(json.room.chairs)
      setTables(json.room.tables)
    }

    fetchData()
  }, [room, apiURL])

  const editFunc = async (msg: Object)=>{
    const res = await fetch(`${apiURL}/editRoomDetail`, {
      method: "POST",
      body: JSON.stringify({roomName: roomName, msg: msg})
    })
    const data = await res.json()
    console.log(data)
    return data
  }

  if (!data) return <p className={styles.loading}>Lade Raumdaten...</p>

  return (
    <div className={styles.container}>
            <div className={styles.card}>
        <h1 className={styles.roomName}>Raum: {roomName}</h1>

        <div className={styles.infoBlock}>
          <div className={styles.infoRow}>
            <label className={styles.details}>
              Tische: 
              <input
                type="text"
                value={tables}
                onChange={(e) => setTables(e.target.value)}
                className={styles.inputField}
              />
            </label>
            <button className={styles.saveBtn} onClick={()=>{editFunc({tables: tables})}}>Save</button>
          </div>

          <div className={styles.infoRow}>
            <label className={styles.details}>
              Stühle:
              <input
                type="text"
                value={chairs}
                onChange={(e) => setChairs(e.target.value)}
                className={styles.inputField}
              />
            </label>
            <button className={styles.saveBtn} onClick={()=>{editFunc({chairs: chairs})}}>Save</button>
          </div>


          {data.message && (
            <div className={styles.infoRow}>
              <p className={styles.details}>{data.message}</p>
              <button className={styles.editBtn}>Edit</button>
            </div>
          )}
        </div>

        <div className={styles.photos}>
          {data.room.photo.map((p, i) => (
            <img
              key={i}
              src={`${apiURL}/uploads/${p}`}
              alt={`Room ${data.room.name} photo`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
