import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const previousMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <Card data-testid="card-calendar">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">My Schedule</CardTitle>
        <Button size="icon" variant="ghost" data-testid="button-add-schedule">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            size="icon"
            variant="ghost"
            onClick={previousMonth}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-semibold" data-testid="text-current-month">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={nextMonth}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const isCurrentDay = isToday(day);
            const dayNum = format(day, "d");

            return (
              <button
                key={day.toISOString()}
                data-testid={`calendar-day-${dayNum}`}
                className={`
                  aspect-square rounded-md text-sm flex items-center justify-center transition-colors
                  ${isCurrentDay
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover-elevate text-foreground"
                  }
                `}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
