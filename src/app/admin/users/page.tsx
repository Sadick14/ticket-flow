
'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Search, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { UserProfile, SubscriptionPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const { users, loading, updateUser } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSubscriptionChange = async (userId: string, plan: SubscriptionPlan) => {
    try {
      await updateUser(userId, { subscriptionPlan: plan });
      toast({ title: 'Success', description: `User plan updated to ${plan}.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update subscription.' });
    }
  };

  const handleStatusChange = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'deactivated' : 'active';
    try {
      await updateUser(user.uid, { status: newStatus });
      toast({ title: 'Success', description: `User account has been ${newStatus}.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user status.' });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all platform users.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>{users.length} user(s) on the platform.</CardDescription>
                </div>
                <div className="w-full max-w-sm">
                    <Input 
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subscription Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No users found.
                  </TableCell></TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.subscriptionPlan === 'Free' ? 'outline' : 'default'}>{user.subscriptionPlan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastSeen ? format(new Date(user.lastSeen), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSubscriptionChange(user.uid, 'Free')}>Set to Free</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSubscriptionChange(user.uid, 'Starter')}>Set to Starter</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSubscriptionChange(user.uid, 'Pro')}>Set to Pro</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(user)}>
                              {user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
