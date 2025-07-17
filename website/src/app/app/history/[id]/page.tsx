import { AnalysisViewClient } from '../../../../components/app/analysis-view-client';

export default async function HistoryPage({ params }: { params: { id: string } }) {
  const { id } = await params
  return <AnalysisViewClient id={id} />;
}
