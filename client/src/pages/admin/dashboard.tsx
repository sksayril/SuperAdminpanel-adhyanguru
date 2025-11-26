import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const enrollmentData = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 145 },
  { month: "Mar", students: 168 },
  { month: "Apr", students: 192 },
  { month: "May", students: 215 },
  { month: "Jun", students: 238 },
];

const coursePopularityData = [
  { course: "UI Design Fundamentals", students: 156 },
  { course: "Frontend Development", students: 132 },
  { course: "Advanced React", students: 98 },
  { course: "Digital Marketing", students: 87 },
  { course: "Copywriting Basics", students: 76 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,234"
          icon={Users}
          data-testid="stat-total-students"
        />
        <StatCard
          title="Active Courses"
          value="42"
          icon={BookOpen}
          data-testid="stat-active-courses"
        />
        <StatCard
          title="Instructors"
          value="28"
          icon={GraduationCap}
          data-testid="stat-instructors"
        />
        <StatCard
          title="Completion Rate"
          value="78%"
          icon={TrendingUp}
          data-testid="stat-completion-rate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Enrollment Trends */}
        <Card data-testid="card-enrollment-trends">
          <CardHeader>
            <CardTitle className="text-lg">Student Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
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
                  dataKey="students"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Popularity */}
        <Card data-testid="card-course-popularity">
          <CardHeader>
            <CardTitle className="text-lg">Most Popular Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePopularityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  type="category"
                  dataKey="course"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  stroke="hsl(var(--border))"
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card data-testid="card-recent-activity">
        <CardHeader>
          <CardTitle className="text-lg">Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New student enrolled", details: "Sarah Johnson joined UI Design Fundamentals", time: "2 minutes ago" },
              { action: "Course published", details: "Advanced React Patterns is now live", time: "1 hour ago" },
              { action: "Assignment submitted", details: "42 new assignments submitted across all courses", time: "3 hours ago" },
              { action: "Instructor added", details: "Michael Chen joined as Frontend instructor", time: "5 hours ago" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b last:border-0"
                data-testid={`activity-${index}`}
              >
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
