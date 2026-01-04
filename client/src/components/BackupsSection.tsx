import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Archive, Trash2, RotateCcw, HardDrive, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

export default function BackupsSection() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');

  // Fetch backups
  const { data: backups, refetch } = trpc.backups.listBackups.useQuery();

  // Create backup mutation
  const createBackupMutation = trpc.backups.createBackup.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Backup Created",
        description: data.message,
      });
      setShowCreateDialog(false);
      setBackupName('');
      setBackupDescription('');
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create backup.",
        variant: "destructive",
      });
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = trpc.backups.deleteBackup.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Backup Deleted",
        description: data.message,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete backup.",
        variant: "destructive",
      });
    },
  });

  // Restore backup mutation
  const restoreBackupMutation = trpc.backups.restoreBackup.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Backup Restored",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore backup.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a backup name.",
        variant: "destructive",
      });
      return;
    }

    createBackupMutation.mutate({
      name: backupName,
      description: backupDescription,
      backupType: 'manual',
    });
  };

  const handleDeleteBackup = (backupId: number, backupName: string) => {
    if (confirm(`Are you sure you want to delete backup "${backupName}"?`)) {
      deleteBackupMutation.mutate({ backupId });
    }
  };

  const handleRestoreBackup = (backupId: number, backupName: string) => {
    if (confirm(`Are you sure you want to restore from backup "${backupName}"? This will revert your system to the state at backup creation.`)) {
      restoreBackupMutation.mutate({ backupId });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">System Backups</h2>
          <p className="text-muted-foreground mt-1">Create and manage system restore points</p>
        </div>
        <Button size="lg" onClick={() => setShowCreateDialog(true)}>
          <Archive className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      {!backups || backups.length === 0 ? (
        <Card className="p-8 text-center">
          <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Backups Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first backup to protect your system state.
          </p>
          <Button size="lg" onClick={() => setShowCreateDialog(true)}>
            <Archive className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {backups.map((backup) => (
            <Card key={backup.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Archive className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">{backup.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      backup.backupType === 'manual' ? 'bg-blue-500/10 text-blue-400' :
                      backup.backupType === 'automatic' ? 'bg-green-500/10 text-green-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {backup.backupType}
                    </span>
                  </div>
                  
                  {backup.description && (
                    <p className="text-sm text-muted-foreground mb-3">{backup.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(backup.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      {backup.sizeMB} MB
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreBackup(backup.id, backup.name)}
                    disabled={restoreBackupMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBackup(backup.id, backup.name)}
                    disabled={deleteBackupMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Backup Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create System Backup</DialogTitle>
            <DialogDescription>
              Create a restore point to save your current system state.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input
                id="backup-name"
                placeholder="e.g., Before Windows Update"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-description">Description (Optional)</Label>
              <Textarea
                id="backup-description"
                placeholder="Add notes about this backup..."
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isPending}
            >
              {createBackupMutation.isPending ? 'Creating...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
