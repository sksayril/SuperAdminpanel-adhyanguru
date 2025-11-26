import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { TrendingUp, TrendingDown, Clock, Target, Award, BookOpen } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import type { LearningActivity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const performanceData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 68 },
  { month: "Apr", score: 78 },
  { month: "May", score: 85 },
  { month: "Jun", score: 82 },
];

const courseCompletionData = [
  { course: "UI Design", completion: 85 },
  { course: "Frontend Dev", completion: 72 },
  { course: "Copywriting", completion: 60 },
  { course: "Marketing", completion: 45 },
];

export default function Analytics() {
  const { data: learningData, isLoading } = useQuery<LearningActivity[]>({
    queryKey: ["/api/learning-activity"],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your learning progress and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            Export Report
          </Button>
          <Button data-testid="button-download">
            Download PDF
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Study Hours"
          value="124h"
          icon={Clock}
          data-testid="stat-study-hours"
        />
        <StatCard
          title="Courses Completed"
          value="12"
          icon={BookOpen}
          data-testid="stat-courses-completed"
        />
        <StatCard
          title="Average Score"
          value="85%"
          icon={Target}
          data-testid="stat-average-score"
        />
        <StatCard
          title="Certificates Earned"
          value="8"
          icon={Award}
          data-testid="stat-certificates"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Over Time */}
        <Card data-testid="card-performance-chart">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Performance Over Time</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Completion */}
        <Card data-testid="card-course-completion">
          <CardHeader>
            <CardTitle className="text-lg">Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  type="category"
                  dataKey="course"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="completion" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card data-testid="card-weekly-activity">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Learning Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={learningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="uiDesign" stackId="a" fill="hsl(var(--chart-4))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="frontEnd" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="copywriting" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card data-testid="card-achievements">
        <CardHeader>
          <CardTitle className="text-lg">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Fast Learner", description: "Complete 5 courses in a month", earned: true },
              { title: "Perfect Score", description: "Score 100% on any assignment", earned: true },
              { title: "Dedicated Student", description: "Study for 30 consecutive days", earned: false },
              { title: "Master Certificate", description: "Earn 10 certificates", earned: false },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${achievement.earned ? "bg-primary/5 border-primary/20" : "bg-muted/30"}`}
                data-testid={`achievement-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 ${achievement.earned ? "bg-primary/10" : "bg-muted"}`}>
                    <Award className={`h-5 w-5 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
