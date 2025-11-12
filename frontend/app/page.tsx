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
    console.log(data);

    console.log({ klassname, amountOfTables, amountOfChairs, fileNames });
  };


  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("roomPhoto", file);
    formData.append("username", userName);
    formData.append("userId", userId);
    console.log(formData)

    const res = await fetch(`${apiURL}/file`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setFileNames(prev => [...prev, data.filename]);
    console.log(data)
  };


  return (
<main>
  <form className={main.form} onSubmit={handleSubmit}>
    
    <div className={main.inputContainer}>
      <input
        className={main.inputText}
        type="text"
        name="klassname"
        placeholder=" "
        value={klassname}
        onChange={(e) => setKlassname(e.target.value)}
      />
      <label className={main.label} htmlFor="klassname">Name of Room</label>
    </div>

    <div className={main.inputContainer}>
      <input
        className={main.inputText}
        type="number"
        name="amountOfTables"
        placeholder=" "
        value={amountOfTables}
        onChange={(e) => setAmountOfTables(Number(e.target.value))}
      />
      <label className={main.label} htmlFor="amountOfTables">Amount of Tables</label>
    </div>

    <div className={main.inputContainer}>
      <input
        className={main.inputText}
        type="number"
        name="amountOfChairs"
        placeholder=" "
        value={amountOfChairs}
        onChange={(e) => setAmountOfChairs(Number(e.target.value))}
      />
      <label className={main.label} htmlFor="amountOfChairs">Amount of Chairs</label>
    </div>

    <div className={main.inputFileContainer}>
      <input 
        type="file" 
        name="RoomPhoto" 
        id="RoomPhoto" 
        onChange={handleFile}
        ref={inputFileRef}
        className={main.inputFile}
      />

      <label 
        htmlFor="RoomPhoto" 
        className={main.fileLabel}
      >
        📸 Upload room photo
      </label>

      <span className={main.fileName}>
        {fileNames.map((name, i) => (
          <div key={i}>{name}</div>
        ))}
      </span>
    </div>

    <div>
      <input 
        className={main.button}
        type="submit" 
        value="Add Room"
      />
    </div>
    
  </form>
</main>
  );
}