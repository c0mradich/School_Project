"use client";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header style={{ padding: "1rem" }}>
      <span
        style={{ cursor: "pointer", fontWeight: 700, fontSize: "1.2rem" }}
        onClick={() => router.push("/dashboard")}
      >
        TeachBetter
      </span>
    </header>
  );
}
