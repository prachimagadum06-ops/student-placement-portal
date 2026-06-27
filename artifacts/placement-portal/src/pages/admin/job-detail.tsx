import { useParams } from "wouter";
import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Building, MapPin, Calendar, IndianRupee, GraduationCap } from "lucide-react";
import { format } from "date-fns";

export default function AdminJobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id, 10);
  const { data: job, isLoading } = useGetJob(jobId, { query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) } });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!job) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {job.companyName}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || "Location TBD"}</span>
            </div>
          </div>
          <Badge className={job.status === 'open' ? 'bg-green-100 text-green-800' : ''} variant={job.status === 'open' ? 'outline' : 'secondary'}>
            {job.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                {job.description ? (
                  <p className="whitespace-pre-wrap">{job.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requirements & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Min CGPA</span>
                  <span className="font-medium">{job.minCgpa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Package</span>
                  <span className="font-medium">{job.package ? `${job.package} LPA` : "TBD"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Drive Date</span>
                  <span className="font-medium">{format(new Date(job.driveDate), "MMM dd, yyyy")}</span>
                </div>
                
                {job.eligibleDepartments && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-2">Eligible Departments</span>
                    <div className="flex flex-wrap gap-2">
                      {job.eligibleDepartments.split(',').map((dept, i) => (
                        <Badge key={i} variant="outline">{dept.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
