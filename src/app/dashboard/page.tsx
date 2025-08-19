
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/image-uploader';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Organization } from '@/lib/types';


export default function OrganizationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { organizations, events, loading: appLoading, addOrganization } = useAppContext();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    logoUrl: '',
    description: '',
  });

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newOrgData.name) return;

    setIsCreating(true);
    try {
      await addOrganization({
        name: newOrgData.name,
        description: newOrgData.description,
        logoUrl: newOrgData.logoUrl,
        ownerId: user.uid,
        memberIds: [user.uid],
        followerIds: [], // Explicitly initialize followers
        socialLinks: {}, 
      });
      toast({ title: 'Organization Created!', description: `${newOrgData.name} has been successfully created.` });
      setNewOrgData({ name: '', logoUrl: '', description: '' });
      setIsFormOpen(false);
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
        
        {/* Create New Organization Card */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Card className="border-dashed hover:border-primary hover:text-primary transition-colors cursor-pointer flex items-center justify-center min-h-[240px]">
                    <div className="text-center">
                        <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Create New Organization</h3>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Organization</DialogTitle>
                    <DialogDescription>
                        Set up a new profile for your brand, company, or community.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleCreateOrganization} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input 
                            id="org-name" 
                            value={newOrgData.name} 
                            onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
                            placeholder="e.g., My Awesome Company"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="org-desc">Description</Label>
                        <Textarea 
                            id="org-desc" 
                            value={newOrgData.description} 
                            onChange={(e) => setNewOrgData({...newOrgData, description: e.target.value})}
                            placeholder="Tell us about your organization..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="org-logo">Logo</Label>
                        <ImageUploader 
                          value={newOrgData.logoUrl} 
                          onUpload={(url) => setNewOrgData({...newOrgData, logoUrl: url})}
                        />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                       <Button type="submit" disabled={isCreating || !newOrgData.name}>
                          {isCreating ? <Loader2 className="animate-spin" /> : 'Create Organization'}
                      </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        {userOrganizations.map(org => {
            const eventCount = events.filter(event => event.organizationId === org.id).length;
            const followerCount = org.followerIds?.length || 0;

            return (
              <Link key={org.id} href={`/dashboard/${org.id}/events`} className="block group">
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col h-full min-h-[240px]">
                  <CardHeader className="flex-row items-start gap-4">
                    <Image src={org.logoUrl || 'https://placehold.co/100x100.png'} alt={org.name} width={50} height={50} className="rounded-md" />
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">{org.name}</CardTitle>
                      <CardDescription>{org.ownerId === user?.uid ? 'Owner' : 'Member'}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">{org.description || 'No description provided.'}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{eventCount} Event{eventCount !== 1 ? 's' : ''}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{followerCount} Follower{followerCount !== 1 ? 's' : ''}</span>
                     </div>
                  </CardFooter>
                </Card>
              </Link>
            )
        })}

      </div>
    </div>
  );
}
