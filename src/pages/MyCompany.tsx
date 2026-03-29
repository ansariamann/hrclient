import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyEmployee } from '@/types/ats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Loader2, Mail, RefreshCw, Shield, Users } from 'lucide-react';

function formatRole(role: string) {
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function MyCompany() {
  const { clientName, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCompanyEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load company employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadEmployees();
    }
  }, [isAuthenticated]);

  const activeCount = useMemo(
    () => employees.filter((employee) => employee.isActive).length,
    [employees]
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Company</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View your company employees and their roles.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmployees}
            disabled={isLoading}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Company</p>
                <p className="text-lg font-semibold text-foreground">{clientName || 'My Company'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Employees</p>
                <p className="text-lg font-semibold text-foreground">{employees.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Active Users</p>
                <p className="text-lg font-semibold text-foreground">{activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading company employees...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <Button variant="outline" onClick={loadEmployees}>Try Again</Button>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="text-base font-medium text-foreground">No employees found</p>
              <p className="text-sm text-muted-foreground">
                No users are currently assigned to this company.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.fullName || employee.email.split('@')[0]}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{employee.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatRole(employee.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
