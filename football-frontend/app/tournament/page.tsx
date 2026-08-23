'use client';
import { TournamentDashboard } from '../../components/TournamentDashboard';

export default function PublicTournamentPage() {
  return (
    <div className="min-h-screen bg-ink text-chalk font-body pb-12">
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10">
        <TournamentDashboard />
      </main>
    </div>
  );
}
