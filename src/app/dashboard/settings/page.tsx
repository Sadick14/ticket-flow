'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Download,
  Trash2,
  Upload,
  AlertTriangle,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    website: '',
    organization: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    eventReminders: true,
    marketingEmails: false,
    weeklyReports: true,
    ticketSales: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showEventStats: true,
    allowEventDiscovery: true,
  });

  const handleProfileUpdate = async () => {
    try {
      // In a real app, you would update the user profile in Firebase
      // await updateProfile({ displayName: profileData.displayName });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    }
  };

  const handleAvatarUpload = () => {
    // In a real app, this would open a file picker and upload to storage
    toast({
      title: 'Avatar Upload',
      description: 'Avatar upload functionality would be implemented here.',
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog and delete the account
    toast({
      variant: 'destructive',
      title: 'Delete Account',
      description: 'Account deletion requires additional confirmation.',
    });
  };

  const exportData = () => {
    // In a real app, this would export user data
    toast({
      title: 'Data Export',
      description: 'Your data export will be emailed to you within 24 hours.',
    });
  };

  const planFeatures = {
    Free: ['2 Events', 'Basic Analytics', 'Email Support'],
    Starter: ['10 Events', 'Advanced Analytics', 'Priority Support', 'Custom Branding'],
    Pro: ['Unlimited Events', 'Full Analytics Suite', '24/7 Support', 'White Label', 'API Access'],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                  <AvatarFallback className="text-lg">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" onClick={handleAvatarUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG up to 2MB
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={profileData.organization}
                    onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                    placeholder="Your organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleProfileUpdate}>
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {user?.subscriptionPlan === 'Pro' ? (
                      <Crown className="h-5 w-5 text-yellow-600" />
                    ) : user?.subscriptionPlan === 'Starter' ? (
                      <Zap className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Star className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user?.subscriptionPlan || 'Free'} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.subscriptionPlan === 'Free' ? 'Basic features included' : 'Advanced features enabled'}
                    </p>
                  </div>
                </div>
                <Badge variant={user?.subscriptionPlan === 'Free' ? 'secondary' : 'default'}>
                  {user?.subscriptionPlan === 'Free' ? 'Free' : 'Active'}
                </Badge>
              </div>

              {/* Plan Features */}
              <div>
                <h4 className="font-medium mb-3">Your Plan Includes:</h4>
                <div className="space-y-2">
                  {planFeatures[user?.subscriptionPlan as keyof typeof planFeatures || 'Free']?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade Section */}
              {user?.subscriptionPlan === 'Free' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You're on the Free plan. Upgrade to create more events and access advanced features.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {user?.subscriptionPlan === 'Free' && (
                  <Button asChild>
                    <Link href="/pricing">Upgrade Plan</Link>
                  </Button>
                )}
                <Button variant="outline">
                  View Billing History
                </Button>
                {user?.subscriptionPlan !== 'Free' && (
                  <Button variant="outline">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailUpdates">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your events and tickets
                    </p>
                  </div>
                  <Switch
                    id="emailUpdates"
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, emailUpdates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="eventReminders">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming events
                    </p>
                  </div>
                  <Switch
                    id="eventReminders"
                    checked={notifications.eventReminders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, eventReminders: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ticketSales">Ticket Sales</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when someone buys your tickets
                    </p>
                  </div>
                  <Switch
                    id="ticketSales"
                    checked={notifications.ticketSales}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, ticketSales: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of your event performance
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, weeklyReports: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Tips, best practices, and product updates
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publicProfile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={privacy.publicProfile}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, publicProfile: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showEventStats">Show Event Stats</Label>
                    <p className="text-sm text-muted-foreground">
                      Display attendance numbers on public event pages
                    </p>
                  </div>
                  <Switch
                    id="showEventStats"
                    checked={privacy.showEventStats}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, showEventStats: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowEventDiscovery">Event Discovery</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your events to appear in search results
                    </p>
                  </div>
                  <Switch
                    id="allowEventDiscovery"
                    checked={privacy.allowEventDiscovery}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, allowEventDiscovery: checked })
                    }
                  />
                </div>
              </div>

              <Button>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data & Security</CardTitle>
              <CardDescription>Manage your account data and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" onClick={exportData} className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export My Data
                </Button>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your data including events, tickets, and settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-destructive/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Once you delete your account, there is no going back. All your events, tickets, and data will be permanently deleted.
                </AlertDescription>
              </Alert>
              
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
