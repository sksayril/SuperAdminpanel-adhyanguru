import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Users, Shield, Wallet, TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardOverview,
  getSubscriptionGrowth,
  getPopularSubscriptions,
  getRevenueAnalytics,
} from "@/lib/api";

export default function AdminDashboard() {
  const { data: overviewResponse, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/super-admin/dashboard"],
    queryFn: async () => {
      return await getDashboardOverview(30);
    },
  });

  const { data: subscriptionGrowthResponse } = useQuery({
    queryKey: ["/api/super-admin/dashboard/subscription-growth"],
    queryFn: async () => {
      return await getSubscriptionGrowth({ period: 30, groupBy: "day" });
    },
  });

  const { data: popularSubscriptionsResponse } = useQuery({
    queryKey: ["/api/super-admin/dashboard/popular-subscriptions"],
    queryFn: async () => {
      return await getPopularSubscriptions({ period: 30, limit: 5 });
    },
  });

  const { data: revenueResponse } = useQuery({
    queryKey: ["/api/super-admin/dashboard/revenue"],
    queryFn: async () => {
      return await getRevenueAnalytics({ period: 30, groupBy: "day" });
    },
  });

  const overview = overviewResponse?.data;
  const subscriptionGrowth = subscriptionGrowthResponse?.data?.growth || [];
  const popularSubscriptions = popularSubscriptionsResponse?.data?.plans || [];
  const revenueData = revenueResponse?.data?.revenue || [];

  // Format subscription growth data for chart
  const growthChartData = subscriptionGrowth.map((item: any) => ({
    date: `${item._id?.day || item._id?.month || ""}/${item._id?.month || ""}/${item._id?.year || ""}`,
    count: item.count || 0,
    revenue: item.revenue || 0,
  }));

  // Format revenue data for chart
  const revenueChartData = revenueData.map((item: any) => ({
    date: `${item._id?.date || item._id?.day || ""}/${item._id?.month || ""}/${item._id?.year || ""}`,
    revenue: item.revenue || 0,
    count: item.count || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and analytics</p>
      </div>

      {/* Stats Grid */}
      {overviewLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={overview.overview.totalStudents.toLocaleString()}
            icon={Users}
            data-testid="stat-total-students"
          />
          <StatCard
            title="Total Agents"
            value={overview.overview.totalAgents.toLocaleString()}
            icon={Shield}
            data-testid="stat-total-agents"
          />
          <StatCard
            title="Total Admins"
            value={overview.overview.totalAdmins.toLocaleString()}
            icon={Shield}
            data-testid="stat-total-admins"
          />
          <StatCard
            title="Active Subscriptions"
            value={overview.overview.activeSubscriptions.toLocaleString()}
            icon={TrendingUp}
            data-testid="stat-active-subscriptions"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${overview.overview.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            data-testid="stat-total-revenue"
          />
          <StatCard
            title="Pending Withdrawals"
            value={`₹${overview.overview.pendingWithdrawals.toLocaleString()}`}
            icon={Wallet}
            data-testid="stat-pending-withdrawals"
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Growth */}
        <Card data-testid="card-subscription-growth">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {growthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                    name="Subscriptions"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Subscriptions */}
        <Card data-testid="card-popular-subscriptions">
          <CardHeader>
            <CardTitle className="text-lg">Popular Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {popularSubscriptions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularSubscriptions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    type="category"
                    dataKey="planName"
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
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <Card data-testid="card-revenue-analytics">
        <CardHeader>
          <CardTitle className="text-lg">Revenue Analytics (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      {overview && (
        <Card data-testid="card-growth-metrics">
          <CardHeader>
            <CardTitle className="text-lg">Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {overview.growth.growthRate > 0 ? "+" : ""}
                  {overview.growth.growthRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {overview.growth.currentPeriod} | Previous: {overview.growth.previousPeriod}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{overview.activeUsers.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Students: {overview.activeUsers.students} | Agents: {overview.activeUsers.agents} | Admins: {overview.activeUsers.admins}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-2xl font-bold">{overview.period} days</p>
                <p className="text-xs text-muted-foreground mt-1">Analysis period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
