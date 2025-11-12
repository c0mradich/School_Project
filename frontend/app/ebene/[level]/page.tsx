import LevelCounting from "./Ebene";

export default async function Levels({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params; // вот здесь await
  console.log("Полученный level:", level);

  return <LevelCounting level={level} />;
}
