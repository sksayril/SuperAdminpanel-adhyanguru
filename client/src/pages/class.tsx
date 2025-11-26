import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Users, MessageSquare, FileText, Download } from "lucide-react";

export default function Class() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Live Classes</h1>
        <p className="text-muted-foreground mt-1">Join live sessions and interact with instructors</p>
      </div>

      {/* Active Class */}
      <Card className="border-primary bg-primary/5" data-testid="card-active-class">
        <CardContent className="p-8">
          <Badge className="mb-4">Live Now</Badge>
          <h2 className="text-2xl font-bold mb-2">UI Design Fundamentals - Week 3</h2>
          <p className="text-muted-foreground mb-6">with Sarah Johnson</p>
          <div className="flex gap-4">
            <Button size="lg" data-testid="button-join-class">
              <Video className="h-5 w-5 mr-2" />
              Join Class
            </Button>
            <Button size="lg" variant="outline" data-testid="button-class-details">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              id: "1",
              title: "Advanced React Patterns",
              instructor: "Michael Chen",
              time: "Today, 3:00 PM",
              duration: "2 hours",
              attendees: 24,
            },
            {
              id: "2",
              title: "Digital Marketing Strategy",
              instructor: "Emily Davis",
              time: "Tomorrow, 10:00 AM",
              duration: "1.5 hours",
              attendees: 18,
            },
            {
              id: "3",
              title: "Introduction to Python",
              instructor: "James Wilson",
              time: "Tomorrow, 2:00 PM",
              duration: "2 hours",
              attendees: 32,
            },
          ].map((classItem) => (
            <Card key={classItem.id} data-testid={`upcoming-class-${classItem.id}`}>
              <CardHeader>
                <CardTitle className="text-base">{classItem.title}</CardTitle>
                <p className="text-sm text-muted-foreground">with {classItem.instructor}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">{classItem.time}</div>
                  <Badge variant="secondary">{classItem.duration}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{classItem.attendees} attendees registered</span>
                </div>
                <Button className="w-full" variant="outline" data-testid={`button-register-${classItem.id}`}>
                  Register for Class
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Class Resources */}
      <Card data-testid="card-resources">
        <CardHeader>
          <CardTitle className="text-lg">Class Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { name: "Week 3 Lecture Slides", type: "PDF", size: "2.4 MB" },
              { name: "Assignment Template", type: "DOCX", size: "156 KB" },
              { name: "Reading Materials", type: "PDF", size: "1.8 MB" },
              { name: "Code Examples", type: "ZIP", size: "524 KB" },
            ].map((resource, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                data-testid={`resource-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{resource.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {resource.type} • {resource.size}
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discussion */}
      <Card data-testid="card-discussion">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Class Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                author: "John Doe",
                message: "Great session today! The examples really helped clarify the concepts.",
                time: "10 minutes ago",
              },
              {
                author: "Jane Smith",
                message: "Can someone share the link to the design resources mentioned in class?",
                time: "25 minutes ago",
              },
              {
                author: "Sarah Johnson",
                message: "Sure! I've just uploaded all the resources to the Class Resources section above.",
                time: "20 minutes ago",
                isInstructor: true,
              },
            ].map((comment, index) => (
              <div key={index} className="flex gap-3" data-testid={`comment-${index}`}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {comment.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    {comment.isInstructor && (
                      <Badge variant="secondary" className="text-xs">
                        Instructor
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
