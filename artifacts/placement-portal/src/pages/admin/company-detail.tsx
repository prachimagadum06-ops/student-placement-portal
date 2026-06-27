import { useParams } from "wouter";
import { useGetCompany, getGetCompanyQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, Globe, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const companyId = parseInt(id, 10);
  const { data: company, isLoading } = useGetCompany(companyId, { query: { enabled: !!companyId, queryKey: getGetCompanyQueryKey(companyId) } });

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

  if (!company) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="h-16 w-16 rounded-md object-contain bg-white border p-1" />
          ) : (
            <div className="h-16 w-16 rounded-md bg-primary/10 flex items-center justify-center">
              <Building className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
            <p className="text-muted-foreground">{company.industry}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{company.description || "No description provided."}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{company.location || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                        {company.website}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Added On</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(company.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
