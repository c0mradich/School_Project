"use client"

import { useEffect, useState } from "react"
import styles from "../../../css/room.module.css"
import { useRouter } from "next/navigation"

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
  const [popUp, setPopUp] = useState(false)
  const apiURL = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()

  useEffect(() => {
  let isMounted = true; // verhindert setState auf ungemounteter Komponente

  async function fetchData() {
    try {
      const res = await fetch(`${apiURL}/fetchRoomData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room }),
        cache: "no-store", // gut für immer frische Daten
      });

      if (!res.ok) {
        console.error(`❌ Fehler beim Laden: ${res.status}`);
        router.push("/ebene");
        return;
      }

      const json = await res.json();
      console.log("📦 Raumdaten:", json);

      if (json.error) {
        console.warn("⚠️ Fehler im JSON:", json.error);
        router.push("/ebene");
        return;
      }

      // 🔧 Falls photo als JSON-String kommt → parse sicher
      if (json.room?.photo && typeof json.room.photo === "string") {
        try {
          json.room.photo = JSON.parse(json.room.photo);
        } catch (e) {
          console.warn("⚠️ Fehler beim Parsen von photo:", e);
          json.room.photo = [];
        }
      }

      // ✅ Nur State setzen, wenn Komponente noch gemountet ist
      if (isMounted && json.room) {
        setData(json);
        setRoomName(json.room.name || "");
        setChairs(json.room.chairs || []);
        setTables(json.room.tables || []);
      }

    } catch (err) {
      console.error("❌ Fetch-Fehler:", err);
      router.push("/ebene");
    }
  }

  fetchData();

  // cleanup: falls Komponente unmounted wird, verhindern wir setState()
  return () => {
    isMounted = false;
  };
}, [room, apiURL, router]);

  const editFunc = async (msg: Object)=>{
    const res = await fetch(`${apiURL}/editRoomDetail`, {
      method: "POST",
      body: JSON.stringify({roomName: roomName, msg: msg})
    })
    const data = await res.json()
    console.log(data)
    return data
  }

const deleteFunc = async (id: number) => {
  try {
    const res = await fetch(`${apiURL}/DeleteRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId: id }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Fehler beim Löschen: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log("Delete response:", data);
    router.push("/ebene");
  } catch (err) {
    console.error("Fehler in deleteFunc:", err);
  }
};


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
        <div>
          <div className={styles.DeleteBtn} onClick={() => setPopUp(true)}>
            Delete
          </div>

          <div
            className={`${styles.Popup} ${popUp ? styles.show : ""}`}
            onClick={() => setPopUp(false)} // schließt beim Klick aufs Popup
          >
            <div className={styles.PopupContent} onClick={(e) => e.stopPropagation()}>
              <h3>Sicher löschen?</h3>
              <div className={styles.ButtonGroup}>
                <button
                  className={styles.DeleteConfirm}
                  onClick={() => deleteFunc(data.room.id)}
                >
                  Ja, löschen
                </button>
                <button
                  className={styles.DeleteCancel}
                  onClick={() => setPopUp(false)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
