import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StudentLayout } from "@/components/layout/student-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info } from "lucide-react";
import { format } from "date-fns";

export default function StudentNotifications() {
  const { data, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkRead = (id: number) => {
    markRead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        }
      }
    );
  };

  return (
    <StudentLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : data?.notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border rounded-md">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.notifications.map((notif) => (
              <Card key={notif.id} className={!notif.isRead ? 'border-primary/50 bg-primary/5' : ''}>
                <CardContent className="p-4 flex gap-4">
                  <div className="mt-1">
                    {!notif.isRead ? (
                      <div className="h-2 w-2 mt-1.5 bg-primary rounded-full animate-pulse" />
                    ) : (
                      <Info className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-base font-semibold ${!notif.isRead ? 'text-primary' : ''}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notif.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{notif.message}</p>
                    
                    {!notif.isRead && (
                      <div className="pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs" 
                          onClick={() => handleMarkRead(notif.id)}
                          disabled={markRead.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
