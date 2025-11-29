'use client';
import { useUser } from './context/UserContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <header>
      <span onClick={() => router.push("/ebene")}>TeachBetter</span>
      <span className="username">{user?.name || "guest"}</span>
    </header>
  );
}
