'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient, authClient, ApiResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OAuthEmailDialog } from '../../connections/components/OAuthEmailDialog';

interface ConnectDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConnectDataSourceDialog({ open, onOpenChange, onSuccess }: ConnectDataSourceDialogProps) {
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailDialogPlatform, setEmailDialogPlatform] = useState<string | null>(null);
  const { loginWithPopup, getAccessTokenSilently, token } = useAuth();

  // Fetch connected providers on open
  const fetchConnections = async () => {
    try {
      const resp = await authClient.get<ApiResponse<any[]>>('/api/auth/connections');
      if (resp.success && Array.isArray(resp.data)) {
        setConnectedProviders(resp.data.filter(c => c.is_active).map(c => c.platform));
      }
    } catch (e) {
      console.error('Failed to fetch connections', e);
    }
  };

  if (open && connectedProviders.length === 0) {
    // Trigger fetch when opened
    // Use efficient pattern or useEffect
  }

  // Use useEffect instead of condition in render
  // imports needed: useEffect


  const handleConnect = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const userId = localStorage.getItem('confuse_user_id');
      if (userId) {
        headers['x-user-id'] = userId;
      }

      const response = await fetch('/api/sources/connect', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, credentials, config: { ...config, name } }),
      });
      const resp = await response.json();
      if (resp.success) {
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        console.error('Error connecting data source:', resp.error || resp.message);
      }
    } catch (error) {
      console.error('Error connecting data source:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchConnections();
    }
  }, [open]);

  const handleOAuthConnect = async (provider: string, emailHint?: string) => {
    try {
      setLoading(true);
      const authorizationParams: any = { connection: provider };
      if (emailHint) {
        authorizationParams.login_hint = emailHint;
      }
      await loginWithPopup({
        authorizationParams
      });

      // Sync connections after successful login/link
      const token = await getAccessTokenSilently();
      await authClient.post('/api/auth/connections/sync', {}, {
        Authorization: `Bearer ${token}`
      });

      await fetchConnections();
    } catch (e) {
      console.error('OAuth connection failed', e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType('');
    setName('');
    setCredentials({});
    setConfig({});
  };

  const renderCredentialFields = () => {
    switch (type) {
      case 'github':
        const isGithubConnected = connectedProviders.includes('github');
        return (
          <div className="space-y-4">
            {!isGithubConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with GitHub to access your repositories.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthConnect('github')}
                >
                  Connect GitHub
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to GitHub
              </div>
            )}

            <div>
              <Label htmlFor="repository">Repository</Label>
              <Input
                id="repository"
                placeholder="owner/repo"
                value={config.repository || ''}
                onChange={(e) => setConfig({ ...config, repository: e.target.value })}
                disabled={!isGithubConnected}
              />
            </div>
          </div>
        );

      case 'gitlab':
        const isGitlabConnected = connectedProviders.includes('gitlab');
        return (
          <div className="space-y-4">
            {!isGitlabConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with GitLab to access your projects.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthConnect('gitlab')}
                >
                  Connect GitLab
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to GitLab
              </div>
            )}

            <div>
              <Label htmlFor="repository">Project Path</Label>
              <Input
                id="repository"
                placeholder="namespace/project"
                value={config.repository || ''}
                onChange={(e) => setConfig({ ...config, repository: e.target.value })}
                disabled={!isGitlabConnected}
              />
            </div>
            <div>
              <Label htmlFor="gitlabUrl">GitLab URL (optional, for self-hosted)</Label>
              <Input
                id="gitlabUrl"
                placeholder="https://gitlab.example.com"
                value={config.gitlab_url || ''}
                onChange={(e) => setConfig({ ...config, gitlab_url: e.target.value })}
                disabled={!isGitlabConnected}
              />
            </div>
          </div>
        );

      case 'bitbucket':
        const isBitbucketConnected = connectedProviders.includes('bitbucket');
        return (
          <div className="space-y-4">
            {!isBitbucketConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with Bitbucket to access your repositories.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthConnect('bitbucket')}
                >
                  Connect Bitbucket
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to Bitbucket
              </div>
            )}

            <div>
              <Label htmlFor="workspace">Workspace</Label>
              <Input
                id="workspace"
                placeholder="workspace-name"
                value={config.workspace || ''}
                onChange={(e) => setConfig({ ...config, workspace: e.target.value })}
                disabled={!isBitbucketConnected}
              />
            </div>
            <div>
              <Label htmlFor="repository">Repository</Label>
              <Input
                id="repository"
                placeholder="repo-slug"
                value={config.repository || ''}
                onChange={(e) => setConfig({ ...config, repository: e.target.value })}
                disabled={!isBitbucketConnected}
              />
            </div>
          </div>
        );

      case 'gdrive':
        const isGoogleDriveConnected = connectedProviders.includes('google_drive');
        return (
          <div className="space-y-4">
            {!isGoogleDriveConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with Google Drive to access your files.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailDialogPlatform('google-oauth2');
                    setEmailDialogOpen(true);
                  }}
                >
                  Connect Google Drive
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to Google Drive
              </div>
            )}
            <div>
              <Label htmlFor="folderId">Folder ID (optional)</Label>
              <Input
                id="folderId"
                placeholder="Leave empty for all files"
                value={config.folder_id || ''}
                onChange={(e) => setConfig({ ...config, folder_id: e.target.value })}
                disabled={!isGoogleDriveConnected}
              />
            </div>
          </div>
        );

      case 'dropbox':
        const isDropboxConnected = connectedProviders.includes('dropbox');
        return (
          <div className="space-y-4">
            {!isDropboxConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with Dropbox to access your files.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailDialogPlatform('dropbox');
                    setEmailDialogOpen(true);
                  }}
                >
                  Connect Dropbox
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to Dropbox
              </div>
            )}
            <div>
              <Label htmlFor="folderPath">Folder Path (optional)</Label>
              <Input
                id="folderPath"
                placeholder="/Documents (leave empty for root)"
                value={config.folder_path || ''}
                onChange={(e) => setConfig({ ...config, folder_path: e.target.value })}
                disabled={!isDropboxConnected}
              />
            </div>
          </div>
        );

      case 'onedrive':
        const isOneDriveConnected = connectedProviders.includes('onedrive');
        return (
          <div className="space-y-4">
            {!isOneDriveConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with OneDrive to access your files.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailDialogPlatform('onedrive');
                    setEmailDialogOpen(true);
                  }}
                >
                  Connect OneDrive
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to OneDrive
              </div>
            )}
            <div>
              <Label htmlFor="folderPath">Folder Path (optional)</Label>
              <Input
                id="folderPath"
                placeholder="/Documents (leave empty for root)"
                value={config.folder_path || ''}
                onChange={(e) => setConfig({ ...config, folder_path: e.target.value })}
                disabled={!isOneDriveConnected}
              />
            </div>
          </div>
        );

      case 'notion':
        const isNotionConnected = connectedProviders.includes('notion');
        return (
          <div className="space-y-4">
            {!isNotionConnected ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with Notion to access your workspace.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailDialogPlatform('notion');
                    setEmailDialogOpen(true);
                  }}
                >
                  Connect Notion
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-green-50/10 border border-green-200/20 rounded text-sm text-green-600 mb-4 flex items-center">
                <span className="mr-2">✓</span> Connected to Notion
              </div>
            )}
          </div>
        );

      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="urls">URLs (comma-separated)</Label>
              <Textarea
                id="urls"
                placeholder="https://example.com, https://docs.example.com"
                value={config.urls?.join(', ') || ''}
                onChange={(e) => setConfig({
                  ...config,
                  urls: e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Data Source</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Data Source"
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="gdrive">Google Drive</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
                <SelectItem value="bitbucket">BitBucket</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
                <SelectItem value="onedrive">OneDrive</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="url">URLs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderCredentialFields()}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!type || !name || loading}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>
      </DialogContent>
      {emailDialogPlatform && (
        <OAuthEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          platformName={emailDialogPlatform === 'google-oauth2' ? 'Google Drive' : emailDialogPlatform.charAt(0).toUpperCase() + emailDialogPlatform.slice(1)}
          onContinue={(email) => handleOAuthConnect(emailDialogPlatform, email)}
        />
      )}
    </Dialog>
  );
}
