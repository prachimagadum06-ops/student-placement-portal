import { useState } from "react";
import { useListJobs, useCreateApplication, getListJobsQueryKey, useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StudentLayout } from "@/components/layout/student-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Building, MapPin, Calendar, IndianRupee, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function StudentJobs() {
  const [search, setSearch] = useState("");
  const { data: jobsData, isLoading: jobsLoading } = useListJobs({ search, status: "open", page: 1, limit: 50 });
  const { data: dashboard } = useGetStudentDashboard();
  const applyMutation = useCreateApplication();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const myApplications = dashboard?.applications || [];
  const hasApplied = (jobId: number) => myApplications.some(app => app.jobId === jobId);

  const handleApply = (jobId: number) => {
    applyMutation.mutate(
      { data: { jobId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          toast({ title: "Applied successfully!" });
        },
        onError: (err: any) => {
          toast({ 
            title: "Failed to apply", 
            description: err.message,
            variant: "destructive" 
          });
        }
      }
    );
  };

  return (
    <StudentLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Available Jobs & Drives</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="w-64 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {jobsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : jobsData?.jobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-md bg-card">
            No open jobs found. Check back later!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobsData?.jobs.map((job) => {
              const applied = hasApplied(job.id);
              const studentCgpa = dashboard?.student?.cgpa || 0;
              const isEligible = studentCgpa >= job.minCgpa;

              return (
                <Card key={job.id} className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="h-3 w-3" /> {job.companyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{job.location || "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <IndianRupee className="h-4 w-4" />
                        <span>{job.package ? `${job.package} LPA` : "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(job.driveDate), "MMM dd")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>Min {job.minCgpa} CGPA</span>
                      </div>
                    </div>
                    
                    {job.eligibleDepartments && (
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Depts</span>
                        <div className="flex flex-wrap gap-1">
                          {job.eligibleDepartments.split(',').slice(0, 3).map((d, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{d.trim()}</Badge>
                          ))}
                          {job.eligibleDepartments.split(',').length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">+{job.eligibleDepartments.split(',').length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4 bg-muted/20">
                    {applied ? (
                      <Button variant="secondary" className="w-full" disabled>Applied</Button>
                    ) : !isEligible ? (
                      <Button variant="outline" className="w-full" disabled>Not Eligible (CGPA)</Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleApply(job.id)}
                        disabled={applyMutation.isPending}
                      >
                        {applyMutation.isPending ? "Applying..." : "Apply Now"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
