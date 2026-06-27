import { useGetStudentDashboard } from "@workspace/api-client-react";
import { StudentLayout } from "@/components/layout/student-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function StudentApplications() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

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
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>

        <div className="rounded-md border bg-card mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : dashboard?.applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    You haven't applied to any jobs yet.
                  </TableCell>
                </TableRow>
              ) : (
                dashboard?.applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.companyName}</TableCell>
                    <TableCell>{app.jobTitle}</TableCell>
                    <TableCell>{format(new Date(app.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(app.status)} variant="outline">
                        {app.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </StudentLayout>
  );
}
