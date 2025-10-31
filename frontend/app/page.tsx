'use client';
import "../css/main.css"
import { useState, useRef } from "react";

export default function Home() {
  const [klassname, setKlassname] = useState('');
  const [amountOfTables, setAmountOfTables] = useState(0);
  const [amountOfChairs, setAmountOfChairs] = useState(0);
  const [fileName, setFileName] = useState("File not selected");
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ klassname, amountOfTables, amountOfChairs });
  };
const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setFileName(file.name);
  console.log(file);
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

        <span className="fileName">{fileName}</span>
      </div>

      <div className="inputContainer">
        <input type="submit" value="Add Room"/>
      </div>
    </form>
    </main>
  );
}
