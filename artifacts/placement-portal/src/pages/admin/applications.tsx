import { useState } from "react";
import { useListApplications, useUpdateApplicationStatus, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminApplications() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data, isLoading } = useListApplications({ 
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: 1, 
    limit: 50 
  });
  
  const updateStatus = useUpdateApplicationStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
          toast({ title: "Application status updated" });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selected": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "rejected": return "bg-red-100 text-red-800 hover:bg-red-100";
      case "shortlisted": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default: return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : data?.applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.studentName}</TableCell>
                    <TableCell>{app.jobTitle}</TableCell>
                    <TableCell>{app.companyName}</TableCell>
                    <TableCell>{format(new Date(app.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(app.status)} variant="outline">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        defaultValue={app.status} 
                        onValueChange={(val) => handleStatusChange(app.id, val)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px] ml-auto h-8">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="selected">Selected</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
