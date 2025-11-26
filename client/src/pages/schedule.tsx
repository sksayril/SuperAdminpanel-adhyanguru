import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, Video } from "lucide-react";
import type { Schedule } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulePage() {
  const { data: schedules, isLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  const groupedSchedules = schedules?.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">My Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your classes and events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-view-calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button data-testid="button-add-event">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Week View */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </>
        ) : (
          Object.entries(groupedSchedules || {}).map(([date, daySchedules]) => (
            <Card key={date} data-testid={`schedule-day-${date}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span>{date}</span>
                  <Badge variant="secondary" className="text-xs">
                    {daySchedules.length} {daySchedules.length === 1 ? "event" : "events"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 rounded-lg border hover-elevate cursor-pointer space-y-2"
                    data-testid={`schedule-item-${schedule.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={schedule.type === "Class" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {schedule.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {schedule.time}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm">{schedule.title}</h4>
                    <p className="text-xs text-muted-foreground">{schedule.course}</p>
                    {schedule.type === "Class" && (
                      <Button size="sm" className="w-full mt-2" variant="outline">
                        <Video className="h-3 w-3 mr-2" />
                        Join Class
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Week Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-7">
            {daysOfWeek.map((day) => {
              const daySchedules = schedules?.filter((s) => s.date.includes(day)) || [];
              return (
                <div
                  key={day}
                  className="space-y-2 p-3 rounded-lg border"
                  data-testid={`week-day-${day.toLowerCase()}`}
                >
                  <h4 className="font-semibold text-sm text-center">{day.substring(0, 3)}</h4>
                  <div className="space-y-1">
                    {daySchedules.length > 0 ? (
                      daySchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="h-2 rounded-full bg-primary"
                          title={schedule.title}
                        />
                      ))
                    ) : (
                      <div className="h-8 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-muted" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
