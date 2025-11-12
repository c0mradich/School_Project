'use client'
import styles from "../../css/levels.module.css"
import { useRouter } from "next/navigation"

export default function Levels() {
  const router = useRouter()

  const handleClick = (level: number) => {
    router.push(`/ebene/${level}`)
  }

  return (
    <main className={styles.Main}>
      {[1, 2, 3].map((level) => (
        <div
          key={level}
          className={styles.Level}
          onClick={() => handleClick(level)}
        >
          <div className={styles.Level__Header}>
            <span>Ebene {level}</span>
          </div>
        </div>
      ))}
    </main>
    
  )
}
