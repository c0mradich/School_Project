"use client"
import styles from "../../../css/level.module.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Room {
  id: number
  name: string
  tables: number
  chairs: number
  photo: string
  level: number
}

export default function LevelCounting({ level }: { level: string }) {
  const router = useRouter()
  const apiURL = process.env.NEXT_PUBLIC_API_URL
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(`${apiURL}/fetchLevelData?level=${level}`, {
          cache: "no-store",
        })
        const json = await res.json()
        setRooms(json.level_rooms || [])
      } catch (err) {
        console.error("Netzwerkfehler:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [level, apiURL])

  return (
    <main className={styles.Main}>
      <div className={styles.Header}>
        <h1>🏢 Ebene {level}</h1>
        <p className={styles.Subheader}>Übersicht aller Räume auf dieser Ebene</p>
      </div>

      {loading ? (
        <p className={styles.Loading}>Lade Daten...</p>
      ) : rooms.length === 0 ? (
        <p className={styles.Empty}>Keine Räume auf dieser Ebene gefunden.</p>
      ) : (
        <div className={styles.RoomGrid}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className={styles.RoomCard}
              onClick={() => router.push(`/room/${room.name}`)}
            >
              <div className={styles.RoomHeader}>
                <h2>{room.name}</h2>
                <span>Ebene {room.level}</span>
              </div>

              <div className={styles.RoomBody}>
                <p>🪑 <b>{room.chairs}</b> Stühle</p>
                <p>🧾 <b>{room.tables}</b> Tische</p>
              </div>

              <div className={styles.RoomFooter}>
                {room.photo && room.photo !== "[]" ? (
                  <p>📸 Fotos verfügbar</p>
                ) : (
                  <p>🚫 Keine Fotos vorhanden</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className={styles.AddRoomButton}
        onClick={() => router.push("/")}
        title="Neuen Raum hinzufügen"
      >
        +
      </button>
    </main>
  )
}
