import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Users, Clock, BookOpen, TrendingUp } from "lucide-react";

const categories = [
  { name: "Design", count: 24, color: "bg-blue-500" },
  { name: "Development", count: 32, color: "bg-green-500" },
  { name: "Marketing", count: 18, color: "bg-purple-500" },
  { name: "Business", count: 15, color: "bg-orange-500" },
  { name: "Photography", count: 12, color: "bg-pink-500" },
  { name: "Music", count: 9, color: "bg-yellow-500" },
];

const featuredCourses = [
  {
    id: "1",
    title: "Complete UI/UX Design Masterclass",
    instructor: "Sarah Johnson",
    rating: 4.8,
    students: 12453,
    duration: "24h 30m",
    category: "Design",
    featured: true,
  },
  {
    id: "2",
    title: "Advanced React & Modern JavaScript",
    instructor: "Michael Chen",
    rating: 4.9,
    students: 18234,
    duration: "32h 15m",
    category: "Development",
    featured: true,
  },
  {
    id: "3",
    title: "Digital Marketing Strategy 2024",
    instructor: "Emily Davis",
    rating: 4.7,
    students: 9876,
    duration: "18h 45m",
    category: "Marketing",
    featured: true,
  },
];

export default function Explore() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary via-blue-500 to-blue-600 border-0">
        <CardContent className="p-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4" data-testid="text-hero-title">
              Discover Your Next Learning Adventure
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Explore thousands of courses across various categories and skill levels
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="What do you want to learn today?"
                className="pl-12 h-12 text-base bg-white"
                data-testid="input-search-explore"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="hover-elevate cursor-pointer transition-all"
              data-testid={`category-${category.name.toLowerCase()}`}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className={`h-12 w-12 rounded-lg ${category.color} mx-auto flex items-center justify-center`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} courses</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Courses</h2>
          <Button variant="outline" data-testid="button-view-all">
            View All
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover-elevate cursor-pointer transition-all"
              data-testid={`featured-course-${course.id}`}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center relative">
                <BookOpen className="h-16 w-16 text-primary/40" />
                <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-0">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Featured
                </Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <h3 className="font-semibold text-lg leading-tight">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <Button className="w-full" data-testid={`button-enroll-${course.id}`}>
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <Card data-testid="card-trending">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Web Development",
              "UI/UX Design",
              "React",
              "Python",
              "Data Science",
              "Machine Learning",
              "Digital Marketing",
              "Photography",
              "Video Editing",
              "Graphic Design",
            ].map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                className="rounded-full"
                data-testid={`topic-${topic.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {topic}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
