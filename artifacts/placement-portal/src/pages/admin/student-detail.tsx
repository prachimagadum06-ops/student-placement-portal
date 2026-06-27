import { useParams } from "wouter";
import { useGetStudent, getGetStudentQueryKey, useUpdateStudent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Mail, Phone, BookOpen, User, Star } from "lucide-react";
import { format } from "date-fns";

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id, 10);
  const { data: student, isLoading } = useGetStudent(studentId, { query: { enabled: !!studentId, queryKey: getGetStudentQueryKey(studentId) } });
  
  const updateStudent = useUpdateStudent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: string) => {
    updateStudent.mutate(
      { id: studentId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentQueryKey(studentId) });
          toast({ title: "Student status updated" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!student) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
          <Select 
            defaultValue={student.status} 
            onValueChange={handleStatusChange}
            disabled={updateStudent.isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile Information
                </CardTitle>
                <CardDescription>Roll No: {student.rollNumber} • {student.department}</CardDescription>
              </div>
              <Badge variant={student.status === "placed" ? "default" : "secondary"} className="text-sm px-3 py-1">
                {student.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <p className="font-medium">{student.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" /> Phone
                </span>
                <p className="font-medium">{student.phone || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" /> Joined
                </span>
                <p className="font-medium">{format(new Date(student.createdAt), "MMM dd, yyyy")}</p>
              </div>
              {student.status === "placed" && (
                <>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-4 w-4" /> Placed Company
                    </span>
                    <p className="font-medium text-primary">{student.placedCompany}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> Package
                    </span>
                    <p className="font-medium">{student.placedPackage ? `${student.placedPackage} LPA` : "-"}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">CGPA</span>
                <span className="font-medium">{student.cgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">10th Percentage</span>
                <span className="font-medium">{student.tenthPercent ? `${student.tenthPercent}%` : "-"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">12th Percentage</span>
                <span className="font-medium">{student.twelfthPercent ? `${student.twelfthPercent}%` : "-"}</span>
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground block mb-1">Skills</span>
                {student.skills ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.split(',').map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-muted/50">{skill.trim()}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm">-</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {student.resumeUrl ? (
                <div className="rounded-md border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Resume</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">
                    View
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                  No resume uploaded
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
