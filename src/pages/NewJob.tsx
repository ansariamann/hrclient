import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Building2, CheckCircle2, Loader2, MapPin, SendHorizonal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import type { JobInput } from "@/types/ats";

const initialForm: JobInput = {
  title: "",
  requirements: "",
  experienceRequired: undefined,
  salaryLpa: undefined,
  location: "",
};

export default function NewJob() {
  const navigate = useNavigate();
  const { isAuthenticated, error, clientName } = useAuth();
  const [formData, setFormData] = useState<JobInput>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedTitle, setLastSubmittedTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      navigate("/", { replace: true });
    }
  }, [error, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Job title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdJob = await apiClient.createJob({
        ...formData,
        title: formData.title.trim(),
        location: formData.location?.trim() || undefined,
        requirements: formData.requirements?.trim() || undefined,
        companyName: clientName || undefined,
      });

      setLastSubmittedTitle(createdJob.title);
      setFormData(initialForm);
      toast.success("Job sent to HR admin");
    } catch (submitError: any) {
      toast.error(submitError?.message || "Failed to send job to HR admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Send New Job To HR</h1>
                <p className="text-sm text-muted-foreground">
                  Submit a job request and it will appear in the HR admin jobs page.
                </p>
              </div>
            </div>
            {clientName && (
              <Badge variant="secondary" className="w-fit">
                <Building2 className="mr-1 h-3.5 w-3.5" />
                {clientName}
              </Badge>
            )}
          </div>

          {lastSubmittedTitle && (
            <Card className="border-primary/20 bg-primary/5 lg:max-w-sm">
              <CardContent className="flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Latest request sent</p>
                  <p className="text-sm text-muted-foreground">{lastSubmittedTitle}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-xl">Job Request Form</CardTitle>
            <CardDescription>
              Fill the job details. HR admin will receive this as a new job in their jobs section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Senior React Developer"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative mt-2">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
                    placeholder="Hyderabad, India"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experienceRequired">Experience Required</Label>
                <Input
                  id="experienceRequired"
                  type="number"
                  min={0}
                  max={60}
                  value={formData.experienceRequired ?? ""}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      experienceRequired: event.target.value === "" ? undefined : Number(event.target.value),
                    }))
                  }
                  placeholder="5"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="salaryLpa">Salary (LPA)</Label>
                <Input
                  id="salaryLpa"
                  type="number"
                  min={0}
                  step={0.1}
                  value={formData.salaryLpa ?? ""}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      salaryLpa: event.target.value === "" ? undefined : Number(event.target.value),
                    }))
                  }
                  placeholder="18"
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements || ""}
                  onChange={(event) => setFormData((current) => ({ ...current, requirements: event.target.value }))}
                  placeholder="Add responsibilities, must-have skills, notice period preference, and any hiring notes."
                  className="mt-2 min-h-[180px]"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Posting date is set automatically when you send this job to HR admin.
                </p>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(initialForm)}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[170px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendHorizonal className="h-4 w-4" />
                      Send To HR Admin
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
