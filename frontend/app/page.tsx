'use client';
import "../css/main.css"
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
      router.replace("/login")
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return null


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append("name", klassname)
    formData.append("tables", amountOfTables.toString())
    formData.append("chairs", amountOfChairs.toString())
    formData.append("userId", userId)
    formData.append("userName", userName)
    formData.append("fileNames", JSON.stringify(fileNames));

    const res = await fetch(`${apiURL}/create-room`, {
      method: "POST",
      body: formData
    }) 

    const data = await res.json()
    console.log(data)

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
    <form onSubmit={handleSubmit}>
      <div className="inputContainer">
        <input
          type="text"
          name="klassname"
          placeholder=" "
          value={klassname}
          onChange={(e) => setKlassname(e.target.value)}
        />
        <label htmlFor="klassname">Name of Room</label>
      </div>

      <div className="inputContainer">
        <input
          type="number"
          name="amountOfTables"
          placeholder=" "
          value={amountOfTables}
          onChange={(e) => setAmountOfTables(Number(e.target.value))}
        />
        <label htmlFor="amountOfTables">Amount of Tables</label>
      </div>

      <div className="inputContainer">
        <input
          type="number"
          name="amountOfChairs"
          placeholder=" "
          value={amountOfChairs}
          onChange={(e) => setAmountOfChairs(Number(e.target.value))}
        />
        <label htmlFor="amountOfChairs">Amount of Chairs</label>
      </div>

      <div className="inputFileContainer">
        <input 
          type="file" 
          name="RoomPhoto" 
          id="RoomPhoto" 
          onChange={handleFile}
          ref={inputFileRef}
        />
        <span onClick={() => inputFileRef.current?.click()}>
            📸 Upload room photo
        </span>

        <span className="fileName">
          {fileNames.map((name, i) => (
            <div key={i}>{name}</div>
          ))}
        </span>
      </div>

      <div className="inputContainer">
        <input type="submit" value="Add Room"/>
      </div>
    </form>
    </main>
  );
}