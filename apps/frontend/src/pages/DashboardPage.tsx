import { BarChart3, CalendarPlus, CheckCircle2, Clapperboard, ListVideo, Percent, Tv } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { StatsCard } from "../components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useDashboardStats } from "../hooks/useDashboardStats";

const palette = ["#24756e", "#e16645", "#4a6670"];

export const DashboardPage = () => {
  const statsQuery = useDashboardStats();
  const stats = statsQuery.data;

  const statusData = [
    { name: "Watched", value: stats?.watched ?? 0 },
    { name: "Want to Watch", value: stats?.wantToWatch ?? 0 }
  ];

  const typeData = [
    { name: "Movies", value: stats?.movies ?? 0 },
    { name: "TV Shows", value: stats?.shows ?? 0 }
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-muted-foreground">A quick read on what you are saving and finishing.</p>
      </div>

      {statsQuery.isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : statsQuery.isError ? (
        <Card className="mt-6">
          <CardContent className="p-8 text-center text-destructive">Dashboard stats failed to load.</CardContent>
        </Card>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Items" value={stats?.total ?? 0} icon={ListVideo} />
            <StatsCard title="Watched" value={stats?.watched ?? 0} icon={CheckCircle2} />
            <StatsCard title="Want To Watch" value={stats?.wantToWatch ?? 0} icon={Clapperboard} />
            <StatsCard title="Completion Rate" value={`${stats?.completionRate ?? 0}%`} icon={Percent} />
            <StatsCard title="Added in Last 7 Days" value={stats?.recentlyAdded ?? 0} icon={CalendarPlus} />
            <StatsCard title="Movies Count" value={stats?.movies ?? 0} icon={BarChart3} />
            <StatsCard title="TV Shows Count" value={stats?.shows ?? 0} icon={Tv} />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Watched vs Want To Watch</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                      {statusData.map((entry, index) => (
                        <Cell key={entry.name} fill={palette[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Movies vs TV Shows</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill={palette[2]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </main>
  );
};
