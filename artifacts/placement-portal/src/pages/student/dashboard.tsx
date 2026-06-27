import { useGetStudentDashboard } from "@workspace/api-client-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Building, FileText, Bell } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!dashboard) return null;

  const { student, applications, eligibleJobs, recentNotifications } = dashboard;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selected": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "shortlisted": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <StudentLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {student.name}</h1>
        
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              Profile Summary
              <Badge variant={student.status === "placed" ? "default" : "secondary"}>
                {student.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Roll Number</span>
                <span className="font-medium">{student.rollNumber || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Department</span>
                <span className="font-medium">{student.department || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">CGPA</span>
                <span className="font-medium">{student.cgpa ? student.cgpa.toFixed(2) : "-"}</span>
              </div>
              {student.status === "placed" && student.placedCompany && (
                <div>
                  <span className="text-muted-foreground block">Placed At</span>
                  <span className="font-medium text-primary">{student.placedCompany}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your latest job applications</CardDescription>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4 mt-2">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{app.jobTitle}</p>
                        <p className="text-xs text-muted-foreground">{app.companyName}</p>
                      </div>
                      <Badge className={getStatusColor(app.status)} variant="outline">
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <p>No active applications</p>
                  <Link href="/student/jobs" className="text-primary hover:underline text-sm mt-1 block">
                    Find jobs to apply
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Eligible Drives</CardTitle>
                <CardDescription>Upcoming jobs you can apply for</CardDescription>
              </div>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {eligibleJobs.length > 0 ? (
                <div className="space-y-4 mt-2">
                  {eligibleJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" /> {job.companyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{job.package ? `${job.package} LPA` : 'TBD'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(job.driveDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <p>No eligible drives at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
