"use client"
import styles from "./searchroom.module.css"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const apiURL = process.env.NEXT_PUBLIC_API_URL

async function findRoom(room: string) {
  try {
    const res = await fetch(`${apiURL}/fetchRoomData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room })
    })
    const data = await res.json()
    return data
  } catch {
    return { error: "No Room found" }
  }
}

function Proofname(name: string) {
  if (name.length !== 4 || name[0] !== "H") return null
  return findRoom(name)
}

export default function SearchQuery() {
  const router = useRouter()
  const [room, setRoom] = useState("")
  const [recommendedRoom, setRecommendedRoom] = useState<any>(null)

  useEffect(() => {
    async function checkRoom() {
      const result = await Proofname(room)
      console.log(result)

      if (!result) {
        setRecommendedRoom(null)
        return
      }

      if (result.status === "ok" && !result.error) {
        console.log("success")
        setRecommendedRoom({
          id: result.room.id,
          name: result.room.name,
          chairs: result.room.chairs,
          tables: result.room.tables
        })
      } else {
        setRecommendedRoom(null)
      }
    }

    checkRoom()
  }, [room])

  return (
    <>
      <div className={styles.InputContainer}>
        <input
          type="text"
          placeholder="Enter room name"
          onChange={(e) => setRoom(e.target.value)}
        />
      </div>

    {recommendedRoom && (
    <div
        className={styles.RoomPreview}
        onClick={() => router.replace(`/room/${recommendedRoom.name}`)}
    >
        <div className={styles.RoomName}>
        {recommendedRoom.name}
        </div>

        <div className={styles.RoomInfo}>
        <p><b>Stuhle:</b> {recommendedRoom.chairs}</p>
        <p><b>Tische:</b> {recommendedRoom.tables}</p>
        </div>
    </div>
    )}


      {!recommendedRoom && room === "" && (
        <p className={styles.Hint}>Enter the room name</p>
      )}
    </>
  )
}
