import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetStudentDashboard, useUpdateStudent, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StudentLayout } from "@/components/layout/student-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { User, FileText, Settings } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  tenthPercent: z.coerce.number().min(0).max(100).optional(),
  twelfthPercent: z.coerce.number().min(0).max(100).optional(),
  skills: z.string().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function StudentProfile() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();
  const updateStudent = useUpdateStudent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      cgpa: 0,
      tenthPercent: 0,
      twelfthPercent: 0,
      skills: "",
      resumeUrl: "",
    },
  });

  useEffect(() => {
    if (dashboard?.student) {
      form.reset({
        name: dashboard.student.name,
        phone: dashboard.student.phone || "",
        cgpa: dashboard.student.cgpa || 0,
        tenthPercent: dashboard.student.tenthPercent || 0,
        twelfthPercent: dashboard.student.twelfthPercent || 0,
        skills: dashboard.student.skills || "",
        resumeUrl: dashboard.student.resumeUrl || "",
      });
    }
  }, [dashboard, form]);

  const onSubmit = (data: ProfileFormValues) => {
    if (!dashboard?.student?.id) return;
    
    updateStudent.mutate(
      { id: dashboard.student.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          toast({ title: "Profile updated successfully" });
        },
        onError: (err: any) => {
          toast({ 
            title: "Failed to update profile", 
            description: err.message,
            variant: "destructive" 
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Edit Profile</CardTitle>
                <CardDescription>Update your academic and contact details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cgpa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CGPA (out of 10)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills (comma separated)</FormLabel>
                            <FormControl><Input placeholder="React, Node, Python" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tenthPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>10th Percentage</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twelfthPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>12th Percentage</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="resumeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume URL (Google Drive, Dropbox, etc.)</FormLabel>
                          <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={updateStudent.isPending}>
                        {updateStudent.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{dashboard?.student?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{dashboard?.student?.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{dashboard?.student?.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Placement Status</p>
                  <p className="font-medium capitalize">{dashboard?.student?.status}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.student?.resumeUrl ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={dashboard.student.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Current Resume
                    </a>
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                    No resume linked
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
