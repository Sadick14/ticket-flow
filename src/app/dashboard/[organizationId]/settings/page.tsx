
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Shield,
  Users2,
  Loader2,
  X,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import type { Organization, UserProfile } from '@/lib/types';
import { ImageUploader } from '@/components/image-uploader';
import { Textarea } from '@/components/ui/textarea';


function TeamManager({ organization }: { organization: Organization }) {
  const { addCollaborator, removeCollaborator, getUsersByUids, loading: appLoading } = useAppContext();
  const { toast } = useToast();
  
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadingCollabs, setLoadingCollabs] = useState(false);

  useEffect(() => {
    const fetchCollaborators = async () => {
      if (organization && organization.memberIds) {
        setLoadingCollabs(true);
        const users = await getUsersByUids(organization.memberIds);
        setCollaborators(users);
        setLoadingCollabs(false);
      } else {
        setCollaborators([]);
      }
    };
    fetchCollaborators();
  }, [organization, getUsersByUids]);

  const handleAddCollaborator = async () => {
    if (!newCollabEmail || !organization.id) return;
    setIsAdding(true);
    const result = await addCollaborator(organization.id, newCollabEmail);
    if(result.success) {
      toast({ title: "Success", description: result.message });
      setNewCollabEmail('');
      const users = await getUsersByUids([...organization.memberIds, result.userId!]);
      setCollaborators(users);
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
    setIsAdding(false);
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!organization.id) return;
    await removeCollaborator(organization.id, collaboratorId);
    setCollaborators(prev => prev.filter(c => c.uid !== collaboratorId));
    toast({ title: "Collaborator Removed" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          Team Management
        </CardTitle>
        <CardDescription>Add or remove members from this organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Add Member</Label>
          <div className="flex gap-2">
            <Input 
              type="email" 
              placeholder="member@email.com" 
              value={newCollabEmail}
              onChange={e => setNewCollabEmail(e.target.value)}
              disabled={isAdding}
            />
            <Button onClick={handleAddCollaborator} disabled={isAdding || !newCollabEmail}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Add
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Current Members</h4>
          {loadingCollabs ? (
            <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>
          ) : collaborators.length > 0 ? (
            <div className="space-y-2">
              {collaborators.map(c => (
                <div key={c.uid} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.photoURL || ''} />
                      <AvatarFallback>{c.displayName?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{c.displayName}</p>
                      <p className="text-xs text-muted-foreground">{c.uid === organization.ownerId ? 'Owner' : 'Member'}</p>
                    </div>
                  </div>
                  {c.uid !== organization.ownerId && (
                     <Button variant="ghost" size="icon" onClick={() => handleRemoveCollaborator(c.uid)}>
                        <X className="h-4 w-4 text-destructive"/>
                     </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No members added yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


export default function OrgSettingsPage() {
  const { user } = useAuth();
  const { organizations, updateOrganization } = useAppContext();
  const params = useParams();
  const organizationId = params.organizationId as string;
  const { toast } = useToast();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const org = organizations.find(o => o.id === organizationId);
    if(org) setOrganization(org);
  }, [organizations, organizationId]);
  
  const handleUpdate = (field: keyof Organization, value: any) => {
    if (organization) {
      setOrganization({ ...organization, [field]: value });
    }
  }

  const handleSocialUpdate = (platform: keyof NonNullable<Organization['socialLinks']>, value: string) => {
    if (organization) {
      setOrganization({
        ...organization,
        socialLinks: {
          ...organization.socialLinks,
          [platform]: value
        }
      });
    }
  };


  const handleSaveChanges = async () => {
    if (!organization) return;
    setIsSaving(true);
    try {
      await updateOrganization(organization.id, organization);
      toast({ title: "Success!", description: "Organization details have been updated." });
    } catch {
      toast({ variant: 'destructive', title: "Error", description: "Failed to save changes." });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!organization) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">Manage your organization's profile and members</p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Organization Profile
              </CardTitle>
              <CardDescription>Update your organization's public information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input 
                        id="orgName" 
                        value={organization.name}
                        onChange={e => handleUpdate('name', e.target.value)}
                      />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="orgDesc">Description</Label>
                      <Textarea 
                        id="orgDesc" 
                        value={organization.description || ''}
                        onChange={e => handleUpdate('description', e.target.value)}
                        placeholder="A short description of your organization"
                      />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label>Logo</Label>
                    <ImageUploader 
                      value={organization.logoUrl || ''} 
                      onUpload={(url) => handleUpdate('logoUrl', url)} 
                    />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2"><Twitter className="h-4 w-4"/> Twitter URL</Label>
                  <Input id="twitter" value={organization.socialLinks?.twitter || ''} onChange={(e) => handleSocialUpdate('twitter', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2"><Facebook className="h-4 w-4"/> Facebook URL</Label>
                  <Input id="facebook" value={organization.socialLinks?.facebook || ''} onChange={(e) => handleSocialUpdate('facebook', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="h-4 w-4"/> Instagram URL</Label>
                  <Input id="instagram" value={organization.socialLinks?.instagram || ''} onChange={(e) => handleSocialUpdate('instagram', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2"><Linkedin className="h-4 w-4"/> LinkedIn URL</Label>
                  <Input id="linkedin" value={organization.socialLinks?.linkedin || ''} onChange={(e) => handleSocialUpdate('linkedin', e.target.value)} />
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <TeamManager organization={organization} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
