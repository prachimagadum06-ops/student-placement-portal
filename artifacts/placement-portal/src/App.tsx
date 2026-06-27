import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminStudents from "@/pages/admin/students";
import AdminStudentDetail from "@/pages/admin/student-detail";
import AdminCompanies from "@/pages/admin/companies";
import AdminCompanyDetail from "@/pages/admin/company-detail";
import AdminJobs from "@/pages/admin/jobs";
import AdminJobDetail from "@/pages/admin/job-detail";
import AdminApplications from "@/pages/admin/applications";
import AdminNotifications from "@/pages/admin/notifications";

import StudentDashboard from "@/pages/student/dashboard";
import StudentProfile from "@/pages/student/profile";
import StudentJobs from "@/pages/student/jobs";
import StudentApplications from "@/pages/student/applications";
import StudentNotifications from "@/pages/student/notifications";
import StudentChangePassword from "@/pages/student/change-password";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/students/:id" component={AdminStudentDetail} />
      <Route path="/admin/companies" component={AdminCompanies} />
      <Route path="/admin/companies/:id" component={AdminCompanyDetail} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route path="/admin/jobs/:id" component={AdminJobDetail} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/notifications" component={AdminNotifications} />

      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/jobs" component={StudentJobs} />
      <Route path="/student/applications" component={StudentApplications} />
      <Route path="/student/notifications" component={StudentNotifications} />
      <Route path="/student/change-password" component={StudentChangePassword} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
