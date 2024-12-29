import { TestButton } from "@/components/TestButton";

export default function Index() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Панель управления</h1>
      <div className="space-y-4">
        <TestButton />
      </div>
    </div>
  );
}