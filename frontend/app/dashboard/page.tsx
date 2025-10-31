"use client"
import "../../css/dashboard.css"
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter()
  const {user} = useUser()

  // Identifying
  useEffect(()=>{
    !user && router.push("/login")
    console.log("SomeData: ", user)
  }, [])

  return (
    <main>
        <div className="RoomsContainer">
          
        </div>
    </main>
  );
}
