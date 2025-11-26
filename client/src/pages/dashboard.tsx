import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { ProgressRing } from "@/components/progress-ring";
import { CalendarWidget } from "@/components/calendar-widget";
import { ListTodo, CheckCircle2, Trophy, TrendingUp, Clock, MoreHorizontal, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { DashboardStats, Assignment, Schedule, Activity, LearningActivity, ProgressData } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: learningData, isLoading: learningLoading } = useQuery<LearningActivity[]>({
    queryKey: ["/api/learning-activity"],
  });

  const { data: progressData, isLoading: progressLoading } = useQuery<ProgressData[]>({
    queryKey: ["/api/progress"],
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary via-blue-500 to-blue-600 border-0">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" data-testid="text-greeting">
                  Hello, Gareth!
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  We've missed you! Check out what's new and improved in your dashboard
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-white/95 hover:bg-white text-primary"
                data-testid="button-explore-courses"
              >
                Explore More Courses
              </Button>
            </div>
            <div className="hidden md:block flex-shrink-0">
              <div className="w-48 h-48 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" fill="#60A5FA" opacity="0.2" />
                  <path
                    d="M100 40 L100 100 L140 140"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="100" cy="100" r="6" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Active Tasks"
          value={stats?.activeTasks || 18}
          icon={ListTodo}
          data-testid="stat-active-tasks"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks || 8}
          icon={CheckCircle2}
          data-testid="stat-completed-tasks"
        />
        <StatCard
          title="Total Score"
          value={stats?.totalScore || 132}
          icon={Trophy}
          data-testid="stat-total-score"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance & Learning Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Card */}
            <Card data-testid="card-performance">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Performance</CardTitle>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-6">
                  <ProgressRing progress={stats?.performance || 1274} total={2000}>
                    <div className="text-center">
                      <div className="text-3xl font-bold" data-testid="text-performance-value">
                        {stats?.performance || 1274}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Points</div>
                    </div>
                  </ProgressRing>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">4th in leaderboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Activity */}
            <Card data-testid="card-learning-activity">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Learning Activity</CardTitle>
                <Button size="sm" variant="ghost" className="text-xs h-8">
                  Last Week
                </Button>
              </CardHeader>
              <CardContent>
                {learningLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
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
                      <Bar dataKey="uiDesign" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="frontEnd" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="copywriting" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-4))]" />
                    <span className="text-muted-foreground">UI Design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-1))]" />
                    <span className="text-muted-foreground">Front End</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-[hsl(var(--chart-5))]" />
                    <span className="text-muted-foreground">Copywriting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Progress */}
          <Card data-testid="card-my-progress">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">My Progress</CardTitle>
              <Button size="sm" variant="ghost" className="text-xs h-8" data-testid="button-view-all-progress">
                All Status
              </Button>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <ProgressRing progress={124} total={200} size={160} strokeWidth={12}>
                    <div className="text-center">
                      <div className="text-4xl font-bold">124</div>
                      <div className="text-sm text-muted-foreground">Your Tasks</div>
                    </div>
                  </ProgressRing>
                  <div className="ml-12 space-y-4">
                    {progressData?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-foreground">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card data-testid="card-assignments">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Assignments</CardTitle>
              <Button size="sm" variant="ghost" className="text-xs h-8" data-testid="button-search-assignments">
                Search
              </Button>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments?.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                      data-testid={`assignment-${assignment.id}`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{assignment.title}</h4>
                          <p className="text-xs text-muted-foreground">{assignment.course}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={assignment.status === "Pending" ? "secondary" : "default"}
                          className="text-xs"
                          data-testid={`badge-status-${assignment.id}`}
                        >
                          {assignment.status}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{assignment.progress}%</span>
                          <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${assignment.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[60px] text-right">
                          {assignment.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendar */}
          <CalendarWidget />

          {/* Schedule */}
          <Card data-testid="card-schedule">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">My Schedule</CardTitle>
              <Button size="icon" variant="ghost" data-testid="button-view-more-schedule">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules?.slice(0, 3).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 rounded-lg bg-accent space-y-2"
                      data-testid={`schedule-${schedule.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {schedule.date}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{schedule.time}</span>
                      </div>
                      <h4 className="font-medium text-sm">{schedule.title}</h4>
                      <p className="text-xs text-muted-foreground">{schedule.course}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card data-testid="card-recent-activities">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
              <p className="text-sm text-muted-foreground">Today</p>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities?.map((activity) => (
                    <div key={activity.id} className="flex gap-3" data-testid={`activity-${activity.id}`}>
                      <div className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
