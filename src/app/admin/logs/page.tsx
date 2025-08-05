
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import type { AppLog, LogLevel } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Activity, Info, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const logConfig: Record<LogLevel, { color: string; icon: React.ReactNode }> = {
  info: { color: 'bg-blue-500', icon: <Info className="h-3 w-3" /> },
  activity: { color: 'bg-green-500', icon: <Users className="h-3 w-3" /> },
  warning: { color: 'bg-yellow-500', icon: <AlertCircle className="h-3 w-3" /> },
  error: { color: 'bg-red-500', icon: <AlertCircle className="h-3 w-3" /> },
  fatal: { color: 'bg-red-700', icon: <AlertCircle className="h-3 w-3" /> },
};

function LogDetailsDialog({ log }: { log: AppLog }) {
    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>Log Details</DialogTitle>
                <DialogDescription>
                    Full details for log entry from {format(new Date(log.timestamp), 'PPP p')}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                <pre className="p-4 bg-muted rounded-md text-xs whitespace-pre-wrap">
                    {JSON.stringify(log, null, 2)}
                </pre>
            </div>
        </DialogContent>
    )
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel | 'all'>('all');
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  
  const logCategories = useMemo(() => {
    return [...new Set(logs.map(log => log.category))].sort();
  }, [logs]);

  useEffect(() => {
    let q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    
    if (logLevelFilter !== 'all') {
      q = query(q, where('level', '==', logLevelFilter));
    }
    
    if (logCategoryFilter !== 'all') {
      q = query(q, where('category', '==', logCategoryFilter));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(),
        } as AppLog));
        setLogs(fetchedLogs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [logLevelFilter, logCategoryFilter]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Logs</h1>
          <p className="text-muted-foreground">View real-time activity, warnings, and errors.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log Stream</CardTitle>
          <CardDescription>Showing the last 100 log entries. This page updates in real-time.</CardDescription>
           <div className="flex items-center gap-4 pt-4">
            <Select value={logLevelFilter} onValueChange={(value) => setLogLevelFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Object.keys(logConfig).map(level => (
                  <SelectItem key={level} value={level}>
                    <span className="capitalize">{level}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={logCategoryFilter} onValueChange={setLogCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {logCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      No logs found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map(log => (
                    <Dialog key={log.id}>
                      <TableRow>
                        <TableCell>
                          <span title={format(new Date(log.timestamp), 'PPP p')}>
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`flex items-center gap-1.5 capitalize text-white`}
                            style={{ backgroundColor: logConfig[log.level].color }}
                          >
                            {logConfig[log.level].icon}
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{log.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="truncate font-medium">{log.message}</p>
                          {log.userEmail && <p className="text-xs text-muted-foreground">{log.userEmail}</p>}
                        </TableCell>
                        <TableCell className="text-right">
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">View</Button>
                            </DialogTrigger>
                        </TableCell>
                      </TableRow>
                      <LogDetailsDialog log={log} />
                    </Dialog>
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
