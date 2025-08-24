

'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserCog, PlusCircle, Save, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, AdminPermissions } from '@/lib/types';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const permissionLabels: Record<keyof AdminPermissions, string> = {
    canManageEvents: 'Manage Events',
    canManageUsers: 'Manage Users',
    canManagePayouts: 'Manage Payouts',
    canManageSubscriptions: 'Manage Subscriptions',
    canManageNews: 'Manage News',
    canManageCourses: 'Manage Courses',
    canManageSettings: 'Platform Settings',
    canViewLogs: 'View Logs',
    canManageEmails: 'Manage Emails',
    canManageContactMessages: 'Manage Contact Messages',
};

export default function StaffManagementPage() {
    const { user: currentUser } = useAuth();
    const { users: allUsers, updateUser, loading: appLoading } = useAppContext();
    const { toast } = useToast();

    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        setStaff(allUsers.filter(u => u.role === 'admin' || u.role === 'super-admin'));
    }, [allUsers]);

    const handleInviteAdmin = async () => {
        if (!newAdminEmail) return;
        setIsInviting(true);

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", newAdminEmail), limit(1));
            const querySnapshot = await getDocs(q);

            let targetUser: UserProfile;
            let userId: string;

            if (querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'User Not Found', description: 'No user with this email exists on the platform.' });
                setIsInviting(false);
                return;
            }

            const userDoc = querySnapshot.docs[0];
            userId = userDoc.id;
            targetUser = userDoc.data() as UserProfile;
            
            if (targetUser.role === 'admin' || targetUser.role === 'super-admin') {
                toast({ title: 'Already an Admin', description: 'This user already has admin privileges.' });
                setIsInviting(false);
                return;
            }

            await updateUser(userId, { 
                role: 'admin',
                permissions: {
                    canManageEvents: true,
                    canManageUsers: false,
                    canManagePayouts: false,
                    canManageSubscriptions: false,
                    canManageNews: true,
                    canManageCourses: true,
                    canManageSettings: false,
                    canViewLogs: false,
                    canManageEmails: false,
                    canManageContactMessages: false,
                }
            });
            
            // Send invitation email (fire-and-forget)
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'template',
                    templateId: 'simpleAnnouncement',
                    templateContent: {
                        subject: "You're Invited to be an Admin!",
                        headline: "You Have Been Promoted!",
                        message: `Hello ${targetUser.displayName || 'User'},\n\nYou have been invited to become an administrator for TicketFlow by ${currentUser?.displayName}. You can now access the admin dashboard to help manage the platform.\n\nPlease log in to access your new permissions.`,
                    },
                    recipientType: 'custom',
                    recipients: [newAdminEmail],
                    senderRole: 'admin',
                }),
            });

            toast({ title: 'Success!', description: `${newAdminEmail} has been promoted to Admin.` });
            setNewAdminEmail('');

        } catch (error) {
            toast({ variant: 'destructive', title: 'Invitation Failed', description: 'Could not promote the user.' });
        } finally {
            setIsInviting(false);
        }
    };

    const handlePermissionChange = (userId: string, permission: keyof AdminPermissions, value: boolean) => {
        setStaff(prevStaff => prevStaff.map(s => 
            s.uid === userId 
                ? { ...s, permissions: { ...s.permissions!, [permission]: value } }
                : s
        ));
    };

    const handleSaveChanges = async (userId: string) => {
        setIsUpdating(userId);
        const userToUpdate = staff.find(s => s.uid === userId);
        if (!userToUpdate || !userToUpdate.permissions) return;
        
        try {
            await updateUser(userId, { permissions: userToUpdate.permissions });
            toast({ title: 'Permissions Updated', description: `Permissions for ${userToUpdate.displayName} have been saved.`});
        } catch {
            toast({ variant: 'destructive', title: 'Update Failed' });
        } finally {
            setIsUpdating(null);
        }
    }
    
    if (currentUser?.role !== 'super-admin') {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view this page.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invite New Admin</CardTitle>
                    <CardDescription>Add a new staff member by their email address. They must have an existing user account.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <Input 
                        placeholder="user@example.com" 
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                        disabled={isInviting}
                    />
                    <Button onClick={handleInviteAdmin} disabled={isInviting || !newAdminEmail}>
                        {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mail className="mr-2 h-4 w-4"/>}
                        Send Invite
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Manage roles and permissions for your team.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="animate-spin"/></TableCell></TableRow>
                                ) : staff.map(s => (
                                    <TableRow key={s.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={s.photoURL || ''} /><AvatarFallback>{s.displayName?.charAt(0)}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="font-medium">{s.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">{s.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant={s.role === 'super-admin' ? 'destructive' : 'secondary'} className="capitalize">{s.role}</Badge></TableCell>
                                        <TableCell>
                                            {s.role === 'admin' && s.permissions ? (
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                    {Object.entries(permissionLabels).map(([key, label]) => (
                                                        <div key={key} className="flex items-center space-x-2">
                                                            <Switch
                                                                id={`${s.uid}-${key}`}
                                                                checked={s.permissions?.[key as keyof AdminPermissions]}
                                                                onCheckedChange={(checked) => handlePermissionChange(s.uid, key as keyof AdminPermissions, checked)}
                                                            />
                                                            <Label htmlFor={`${s.uid}-${key}`} className="text-sm">{label}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <ShieldCheck className="h-4 w-4 text-green-500"/>
                                                    <span>Full Access</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {s.role === 'admin' && (
                                                <Button size="sm" onClick={() => handleSaveChanges(s.uid)} disabled={isUpdating === s.uid}>
                                                    {isUpdating === s.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                                    Save
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}
