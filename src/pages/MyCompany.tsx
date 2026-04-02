import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyEmployee, CompanyEmployeeCreatePayload, CompanyEmployeeUpdatePayload } from '@/types/ats';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Loader2, Mail, RefreshCw, Shield, Users, Plus, Edit2, Trash2 } from 'lucide-react';

function formatRole(role?: string) {
  if (!role) return 'Employee';
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type DialogState = { open: false } | { open: true, mode: 'create' } | { open: true, mode: 'edit', employee: CompanyEmployee };

export default function MyCompany() {
  const { clientName, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CompanyEmployeeCreatePayload>({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'ACTIVE',
    is_active: true,
    notes: '',
  });

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

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      status: 'ACTIVE',
      is_active: true,
      notes: '',
    });
    setDialogState({ open: true, mode: 'create' });
  };

  const handleOpenEdit = (employee: CompanyEmployee) => {
    setFormData({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      department: employee.department || '',
      status: employee.status,
      is_active: employee.isActive,
      notes: employee.notes || '',
    });
    setDialogState({ open: true, mode: 'edit', employee });
  };

  const handleCloseDialog = () => {
    setDialogState({ open: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogState.open) return;
    setIsSubmitting(true);
    try {
      if (dialogState.mode === 'create') {
        const created = await apiClient.createCompanyEmployee(formData);
        setEmployees(prev => [created, ...prev]);
      } else {
        const updated = await apiClient.updateCompanyEmployee(dialogState.employee.id, formData);
        setEmployees(prev => prev.map(emp => emp.id === updated.id ? updated : emp));
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('Failed to save employee:', err);
      alert(err.message || 'Failed to save employee record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (employee: CompanyEmployee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;
    try {
      await apiClient.deleteCompanyEmployee(employee.id);
      setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
    } catch (err: any) {
      console.error('Failed to delete employee:', err);
      alert(err.message || 'Failed to delete employee record.');
    }
  };

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
          <div className="flex items-center gap-3">
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
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="gap-2 rounded-xl bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Role & Dept</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{employee.name}</span>
                        {employee.notes && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{employee.notes}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {employee.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{employee.email}</span>
                          </div>
                        )}
                        {employee.phone && <span>{employee.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="outline">{formatRole(employee.role)}</Badge>
                        {employee.department && <span className="text-xs text-muted-foreground">{employee.department}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(employee)} title="Edit Employee">
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(employee)} title="Delete Employee" className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.open && dialogState.mode === 'create' ? 'Add Employee' : 'Edit Employee'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Job Title / Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val, is_active: val === 'ACTIVE' })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="LEFT">Left Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this employee..."
                rows={3}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
