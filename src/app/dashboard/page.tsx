
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Building, ArrowRight, Users, Ticket, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/image-uploader';
import Link from 'next/link';
import Image from 'next/image';

export default function OrganizationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { organizations, loading: appLoading, addOrganization } = useAppContext();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgLogo, setNewOrgLogo] = useState('');

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newOrgName) return;

    setIsCreating(true);
    try {
      await addOrganization({
        name: newOrgName,
        logoUrl: newOrgLogo,
        ownerId: user.uid,
        memberIds: [user.uid],
      });
      toast({ title: 'Organization Created!', description: `${newOrgName} has been successfully created.` });
      setNewOrgName('');
      setNewOrgLogo('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the organization. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const userOrganizations = (organizations || []).filter(org => org.memberIds.includes(user?.uid || ''));

  if (authLoading || appLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Your Organizations</h1>
        <p className="text-muted-foreground">Select an organization to manage or create a new one.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userOrganizations.map(org => (
          <Card key={org.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row items-center gap-4">
              <Image src={org.logoUrl || 'https://placehold.co/100x100.png'} alt={org.name} width={50} height={50} className="rounded-md" />
              <div>
                <CardTitle>{org.name}</CardTitle>
                <CardDescription>{org.ownerId === user?.uid ? 'Owner' : 'Member'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/dashboard/${org.id}/events`}>Manage <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        
        {/* Create New Organization Card */}
        <Card className="border-dashed">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create New Organization
            </CardTitle>
            <CardDescription>Start a new team or brand profile.</CardDescription>
           </CardHeader>
           <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input 
                        id="org-name" 
                        value={newOrgName} 
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="e.g., My Awesome Company"
                        required
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="org-logo">Logo</Label>
                    <ImageUploader value={newOrgLogo} onUpload={setNewOrgLogo}/>
                </div>
                <Button type="submit" disabled={isCreating || !newOrgName} className="w-full">
                    {isCreating ? <Loader2 className="animate-spin" /> : 'Create'}
                </Button>
            </form>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
