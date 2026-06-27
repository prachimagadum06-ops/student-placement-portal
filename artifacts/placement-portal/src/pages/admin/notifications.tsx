import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListNotifications, useCreateNotification, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send } from "lucide-react";
import { format } from "date-fns";

const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  targetRole: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function AdminNotifications() {
  const { data, isLoading } = useListNotifications();
  const createNotification = useCreateNotification();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: { title: "", message: "", targetRole: "all" },
  });

  const onSubmit = (data: NotificationFormValues) => {
    const payload = { ...data };
    if (payload.targetRole === "all") delete payload.targetRole;
    
    createNotification.mutate(
      { data: payload },
      {
        onSuccess: () => {
          form.reset({ title: "", message: "", targetRole: "all" });
          queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
          toast({ title: "Notification sent successfully" });
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send Announcement</CardTitle>
              <CardDescription>Broadcast messages to students</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Upcoming Drive: Google" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Details of the announcement..." className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="student">Students Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createNotification.isPending}>
                    {createNotification.isPending ? "Sending..." : "Send Notification"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Recent History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data?.notifications.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No notifications sent yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {data?.notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="flex gap-4 items-start">
                      <div className="bg-primary/10 p-2 rounded-full mt-1">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{notif.title}</p>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-medium text-muted-foreground border rounded px-1.5 py-0.5">
                            To: {notif.targetRole || "All"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notif.createdAt), "MMM dd, hh:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
