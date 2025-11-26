import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, Eye } from "lucide-react";

const certificates = [
  {
    id: "1",
    course: "UI Design Fundamentals",
    issueDate: "March 15, 2024",
    instructor: "Sarah Johnson",
    score: "95%",
  },
  {
    id: "2",
    course: "Advanced React Development",
    issueDate: "February 28, 2024",
    instructor: "Michael Chen",
    score: "92%",
  },
  {
    id: "3",
    course: "Digital Marketing Basics",
    issueDate: "January 10, 2024",
    instructor: "Emily Davis",
    score: "88%",
  },
];

export default function Certificate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">My Certificates</h1>
        <p className="text-muted-foreground mt-1">View and share your achievements</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">{certificates.length}</div>
            <p className="text-sm text-muted-foreground">Certificates Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">12</div>
            <p className="text-sm text-muted-foreground">Courses Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">92%</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((cert) => (
          <Card
            key={cert.id}
            className="overflow-hidden hover-elevate cursor-pointer transition-all"
            data-testid={`certificate-${cert.id}`}
          >
            <div className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 p-8 border-b">
              <div className="text-center space-y-3">
                <Award className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Certificate of Completion</h3>
                <p className="text-muted-foreground">This certifies that</p>
                <p className="text-2xl font-bold">Gareth Christopher</p>
                <p className="text-muted-foreground">has successfully completed</p>
                <p className="text-lg font-semibold">{cert.course}</p>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{cert.issueDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Instructor</p>
                  <p className="font-medium">{cert.instructor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Final Score</p>
                  <Badge className="mt-1">{cert.score}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Certificate ID</p>
                  <p className="font-mono text-xs mt-1">CERT-{cert.id}-2024</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" data-testid={`button-download-${cert.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" data-testid={`button-share-${cert.id}`}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="icon" data-testid={`button-view-${cert.id}`}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* In Progress */}
      <Card data-testid="card-in-progress">
        <CardHeader>
          <CardTitle className="text-lg">Certificates in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { course: "Python for Data Science", progress: 75 },
              { course: "Advanced CSS & Animations", progress: 45 },
              { course: "Business Strategy Fundamentals", progress: 30 },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border"
                data-testid={`progress-certificate-${index}`}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-2">{item.course}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{item.progress}%</span>
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
