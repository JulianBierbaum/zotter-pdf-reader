import { NewAnalysisClient } from "../../components/app/new-analysis-client";

export default function NewAnalysisPage() {
  return (
    <div className="max-w-6xl">
        <div className="space-y-2 mb-8 pt-2 md:pt-0">
            <h1 className="text-3xl font-bold tracking-tight">Neue Analyse starten</h1>
        </div>
        <NewAnalysisClient />
    </div>
  );
}
