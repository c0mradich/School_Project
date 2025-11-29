'use client';
import main from  "../css/main.module.css"
import { useState, useEffect ,useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const apiURL = process.env.NEXT_PUBLIC_API_URL
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [klassname, setKlassname] = useState('');
  const [amountOfTables, setAmountOfTables] = useState(0);
  const [amountOfChairs, setAmountOfChairs] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter()
  
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const uid = sessionStorage.getItem("user_id")
    const uname = sessionStorage.getItem("user_name")

    setUserId(uid || '')
    setUserName(uname || '')

      if (!uid || !uname) {
        window.location.href = "/login"; // полный переход на страницу логина
      } else {
        setReady(true);
      }
  }, [])

  if (!ready) return null


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: klassname,
      tables: amountOfTables,
      chairs: amountOfChairs,
      filename: JSON.stringify(fileNames)
    };

    const res = await fetch(`${apiURL}/create-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // важный момент
      body: JSON.stringify(payload)
    });

    const data = await res.json();
  };


const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("roomPhoto", file);
  formData.append("username", userName);
  formData.append("userId", userId);
  formData.append("roomName", klassname); // вот это ключевой момент

  try {
    const res = await fetch(`${apiURL}/file`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Upload error:", err);
      return;
    }

    const data = await res.json();
    setFileNames(prev => [...prev, data.url]); // сразу пушим публичный URL
    console.log("Upload success:", data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
};




  return (
<main>
  <form className={main.form} onSubmit={handleSubmit}>

    <h2 className={main.title}>Create Room</h2>
    <p className={main.subtitle}>Configure a new classroom setup</p>

    <div className={main.inputContainer}>
      <input
        className={main.inputText}
        type="text"
        placeholder=" "
        value={klassname}
        onChange={(e) => setKlassname(e.target.value)}
      />
      <label className={main.label}>Name of Room</label>
    </div>

    <div className={main.inputContainer}>
      <input
        className={main.inputText}
        type="number"
        placeholder=" "
        min={0}
        value={amountOfTables}
        onChange={(e) => setAmountOfTables(Number(e.target.value))}
      />
      <label className={main.label}>Amount of Tables</label>
    </div>

    <div className={main.inputContainer}>
      <input
        className={main.inputText}
        type="number"
        placeholder=" "
        min={0}
        value={amountOfChairs}
        onChange={(e) => setAmountOfChairs(Number(e.target.value))}
      />
      <label className={main.label}>Amount of Chairs</label>
    </div>

    <div className={main.inputFileContainer}>
      <input 
        type="file"
        id="RoomPhoto"
        onChange={handleFile}
        ref={inputFileRef}
        className={main.inputFile}
      />

      <label htmlFor="RoomPhoto" className={main.fileLabel}>
        📸 Upload room photo
      </label>

      <div className={main.previewList}>
        {fileNames.map((url, i) => (
          <div key={i} className={main.previewItem}>
            <img src={url} alt="" className={main.previewImage}/>
            <span>{url}</span>
          </div>
        ))}
      </div>
    </div>

    <input 
      className={main.button}
      type="submit"
      value="Add Room"
    />

  </form>
</main>
  );
}