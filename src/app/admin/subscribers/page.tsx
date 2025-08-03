
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';
import { Loader2, Mail, Users, Trash2, PlusCircle, Upload, Download, FileWarning } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';

export default function AdminSubscribersPage() {
  const { launchSubscribers, loading, addSubscriber, deleteSubscriber, bulkAddSubscribers } from useAppContext();
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);

  // States for manual add
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // States for bulk import
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && file.type === 'text/csv') {
        setCsvFile(file);
        setCsvError(null);
      } else {
        setCsvError('Please upload a valid CSV file.');
      }
    },
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleNotify = async () => {
    setIsNotifying(true);
    try {
      const response = await fetch('/api/notify-subscribers?key=your-super-secret-key');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send notifications.');
      toast({ title: 'Notifications Sent!', description: `Emails have been sent to ${data.sentCount} subscribers.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Sending Emails', description: error.message || 'An unknown error occurred.' });
    } finally {
      setIsNotifying(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubEmail) return;
    setIsAdding(true);
    try {
      await addSubscriber(newSubEmail, newSubName);
      toast({ title: "Subscriber Added", description: `${newSubEmail} has been added.` });
      setNewSubEmail('');
      setNewSubName('');
      setIsAddDialogOpen(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: "Error", description: e.message });
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber(id);
      toast({ title: "Subscriber Removed" });
    } catch {
      toast({ variant: 'destructive', title: "Error", description: "Failed to remove subscriber." });
    }
  };

  const handleExport = () => {
    const csv = Papa.unparse(launchSubscribers.map(s => ({
      email: s.email,
      name: s.name,
      subscribedAt: s.subscribedAt
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'subscribers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImport = async () => {
    if (!csvFile) return;
    setIsImporting(true);
    Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const data = results.data as { email: string; name?: string }[];
            const validSubscribers = data.filter(row => row.email && /S+@S+.S+/.test(row.email));
            
            if (validSubscribers.length === 0) {
              toast({ variant: "destructive", title: "Import Error", description: "No valid subscribers found in the CSV file. Make sure you have an 'email' column." });
              setIsImporting(false);
              return;
            }
            
            try {
              await bulkAddSubscribers(validSubscribers);
              toast({ title: "Import Successful", description: `${validSubscribers.length} subscribers have been added or updated.` });
              setIsImportDialogOpen(false);
              setCsvFile(null);
            } catch (error) {
              toast({ variant: "destructive", title: "Import Error", description: "An error occurred during the bulk import." });
            } finally {
              setIsImporting(false);
            }
        },
        error: () => {
            toast({ variant: "destructive", title: "Parsing Error", description: "Could not parse the CSV file." });
            setIsImporting(false);
        }
    });
  };

  const getSubscribedAtDate = (subscribedAt: any): Date | null => {
      if (!subscribedAt) return null;
      if (typeof subscribedAt.toDate === 'function') {
          return subscribedAt.toDate();
      }
      if (typeof subscribedAt === 'string') {
          return parseISO(subscribedAt);
      }
      return null;
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscriber Management</h1>
          <p className="text-muted-foreground">Manage users who subscribed to launch and newsletter notifications.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Add Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                  <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Subscriber</Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Add New Subscriber</DialogTitle>
                      <DialogDescription>Manually add a new subscriber to your mailing list.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="sub-name">Name (Optional)</Label>
                          <Input id="sub-name" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="sub-email">Email</Label>
                          <Input id="sub-email" type="email" value={newSubEmail} onChange={(e) => setNewSubEmail(e.target.value)} required />
                      </div>
                  </div>
                  <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={handleAddSubscriber} disabled={isAdding || !newSubEmail}>
                          {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Add
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

          {/* Import Dialog */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Import CSV</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Subscribers from CSV</DialogTitle>
                <DialogDescription>Upload a CSV file with 'email' and optional 'name' columns.</DialogDescription>
              </DialogHeader>
              <div {...getRootProps()} className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-input'}`}>
                <input {...getInputProps()} />
                {csvFile ? (
                    <p>{csvFile.name}</p>
                ) : (
                    <p>Drag & drop a .csv file here, or click to select a file</p>
                )}
              </div>
              {csvError && <p className="text-sm text-destructive mt-2">{csvError}</p>}
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleImport} disabled={!csvFile || isImporting}>
                      {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Import
                  </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleExport} variant="outline" disabled={launchSubscribers.length === 0}>
              <Download className="mr-2 h-4 w-4"/> Export CSV
          </Button>
          <Button onClick={handleNotify} disabled={launchSubscribers.length === 0 || isNotifying}>
              {isNotifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              {isNotifying ? 'Sending...' : 'Notify All'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>{launchSubscribers.length} user(s) have subscribed for notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Subscribed On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                ) : launchSubscribers.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">
                     <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    No subscribers found yet.
                    </TableCell></TableRow>
                ) : (
                  launchSubscribers.map(sub => {
                    const subscribedDate = getSubscribedAtDate(sub.subscribedAt);
                    return (
                        <TableRow key={sub.id}>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>{sub.name || 'N/A'}</TableCell>
                        <TableCell>{subscribedDate ? format(subscribedDate, 'MMM dd, yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently remove the subscriber. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(sub.id)}>
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
