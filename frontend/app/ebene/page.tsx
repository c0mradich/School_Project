'use client'
import styles from "../../css/levels.module.css"
import { useRouter } from "next/navigation"
import SearchRoom from "./SearchRoom"

export default function Levels() {
  const levelNames = ["", "Erdgeschoss", "Obergeschoss 1", "Obergeschoss 2"]
  const arr = ["", "https://bbs-me.de/wp-content/themes/BBSME/src/dist/img/footer/footer-image.png", "https://christmann.info/wp-content/uploads/2021/11/bbs-me-abgerundet.png", "https://www.meyer-architekten.de/wp-content/uploads/10-Schule-BBSme-Hannover-wpcf_750x562.jpg"]
  const router = useRouter()

  const handleClick = (level: number) => {
    router.push(`/ebene/${level}`)
  }

  return (
    <main className={styles.Main}>
      <SearchRoom></SearchRoom>
      <div className={styles.Levels}>
      {[1, 2, 3].map((level) => (
        <div
          style={{
          background: `url(${arr[level]}) center center`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
          key={level}
          className={styles.Level}
          onClick={() => handleClick(level)}
        >
          <div className={styles.Level__Header}>
            <span>{levelNames[level]}</span>
          </div>
        </div>
      ))}
      </div>
    </main>
    
  )
}
