'use client';

import { useMemo, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import type { ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { dataApiClient, authClient, apiClient, ApiResponse, unwrapResponse } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { GitBranch, AlertCircle } from 'lucide-react';
import GitHubIcon from '@/components/icons/GitHubIcon';
import GitLabIcon from '@/components/icons/GitLabIcon';
import BitbucketIcon from '@/components/icons/BitbucketIcon';

// Default file extensions to index - used when no language detection is available
const DEFAULT_FILE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.md',
  '.txt', '.json', '.yml', '.yaml', '.toml', '.css', '.scss', '.html'
];

// Map programming languages to file extensions
const LANGUAGE_TO_EXTENSIONS: Record<string, string[]> = {
  'JavaScript': ['.js', '.jsx', '.mjs', '.cjs'],
  'TypeScript': ['.ts', '.tsx'],
  'Python': ['.py', '.pyi'],
  'Rust': ['.rs'],
  'Go': ['.go'],
  'Java': ['.java'],
  'Kotlin': ['.kt', '.kts'],
  'C': ['.c', '.h'],
  'C++': ['.cpp', '.cc', '.cxx', '.hpp', '.hh'],
  'C#': ['.cs'],
  'Ruby': ['.rb'],
  'PHP': ['.php'],
  'Swift': ['.swift'],
  'Scala': ['.scala'],
  'Shell': ['.sh', '.bash', '.zsh'],
  'HTML': ['.html', '.htm'],
  'CSS': ['.css', '.scss', '.sass', '.less'],
  'Markdown': ['.md', '.mdx'],
  'JSON': ['.json'],
  'YAML': ['.yml', '.yaml'],
  'TOML': ['.toml'],
  'XML': ['.xml'],
  'SQL': ['.sql'],
  'Dockerfile': ['Dockerfile'],
};

// Convert detected languages to file extensions
function languagesToExtensions(languages: string[]): string[] {
  const extensions = new Set<string>();
  for (const lang of languages) {
    const exts = LANGUAGE_TO_EXTENSIONS[lang];
    if (exts) {
      exts.forEach(ext => extensions.add(ext));
    }
  }
  // Always include common config/doc files
  ['.md', '.json', '.yml', '.yaml', '.toml'].forEach(ext => extensions.add(ext));
  return Array.from(extensions).sort();
}

interface ConnectRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ConnectRepositoryDialog({ open, onOpenChange, onSuccess }: ConnectRepositoryDialogProps) {
  const router = useRouter();
  const { token, connections } = useAuth()
  const [provider, setProvider] = useState('');
  const [name, setName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  interface RepositoryConfigUI {
    fetchIssues: boolean;
    fetchPrs: boolean;
    defaultBranch: string;
    autoSync: boolean;
    fileExtensions: string[];
  }
  const [config, setConfig] = useState<RepositoryConfigUI>({
    fetchIssues: true,
    fetchPrs: true,
    defaultBranch: 'main',
    autoSync: false,
    fileExtensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.md']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [fetchBranchesError, setFetchBranchesError] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [availableFileExtensions, setAvailableFileExtensions] = useState<string[]>(DEFAULT_FILE_EXTENSIONS);
  const [needsSocialConnect, setNeedsSocialConnect] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  // Get connected providers
  const connectedProviders = useMemo(() => {
    if (!connections || !Array.isArray(connections)) return [];
    return connections
      .filter(c => c.is_active)
      .map(c => {
        // Map platform names
        if (c.platform === 'google') return 'google_drive';
        if (c.platform === 'windowslive') return 'onedrive';
        return c.platform;
      });
  }, [connections]);

  const allProviders = [
    { value: 'github', label: 'GitHub', icon: GitHubIcon },
    { value: 'gitlab', label: 'GitLab', icon: GitLabIcon },
    { value: 'bitbucket', label: 'BitBucket', icon: BitbucketIcon }
  ];

  const isProviderConnected = (provider: string) => {
    return connectedProviders.includes(provider);
  };

  const getProviderItemProps = (provider: string) => {
    const isConnected = isProviderConnected(provider);
    return {
      value: provider,
      disabled: !isConnected,
      className: !isConnected ? 'opacity-50 cursor-not-allowed' : ''
    };
  };
  const isProviderSelected = provider && isProviderConnected(provider);
  const hasBranches = branches.length > 0;

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const isUrlValid = useMemo(() => {
    if (!repositoryUrl) return false;
    try {

      new URL(repositoryUrl);
      return true;
    } catch (e) {

      if (repositoryUrl.startsWith('git@')) {
        return repositoryUrl.includes(':') && repositoryUrl.length > 10;
      }
      return false;
    }
  }, [repositoryUrl]);

  const ensureProviderConnected = async (): Promise<boolean> => {
    if (!isProviderSelected) return true;
    setCheckingConnection(true);
    try {
      const cached = Array.isArray(connections) ? connections : []
      const hasCached = cached.some((c) => c.platform === provider && c.is_active)
      if (hasCached) {
        setNeedsSocialConnect(null)
        return true
      }
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await apiClient.get('/api/auth/connections', headers);
      const list = unwrapResponse<Array<{ platform: string; is_active: boolean }>>(resp) || [];
      const connected = list.some((c) => c.platform === provider && c.is_active);
      if (!connected) {
        setNeedsSocialConnect(provider);
      } else {
        setNeedsSocialConnect(null);
      }
      return connected;
    } catch {
      return false;
    } finally {
      setCheckingConnection(false);
    }
  };


  const extractRepoName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        const owner = pathParts[pathParts.length - 2];
        const repo = pathParts[pathParts.length - 1].replace('.git', '');
        return `${owner}/${repo}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleFetchBranches = async () => {
    console.log('[FRONTEND] handleFetchBranches called');
    console.log('[FRONTEND] repositoryUrl:', repositoryUrl);
    console.log('[FRONTEND] provider:', provider);
    console.log('[FRONTEND] isProviderSelected:', isProviderSelected);

    if (!repositoryUrl || !isProviderSelected) {
      setFetchBranchesError("Please enter a repository URL and select a provider first.");
      return;
    }

    console.log('[FRONTEND] isUrlValid:', isUrlValid);
    const connected = await ensureProviderConnected();
    if (!connected) {
      setFetchBranchesError(`Please connect ${provider === 'github' ? 'GitHub' : provider === 'gitlab' ? 'GitLab' : 'BitBucket'} in Social Connections first.`);
      return;
    }
    if (!isUrlValid) {
      setFetchBranchesError("Please enter a valid repository URL.");
      return;
    }

    console.log('[FRONTEND] credentials:', credentials);

    setIsFetchingBranches(true);
    setFetchBranchesError(null);
    setBranches([]);
    setIsValidated(false);

    try {
      const response = await fetch('/api/repositories/fetch-branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ repoUrl: repositoryUrl.trim() })
      });

      const result = await response.json();

      if (!response.ok || (result && result.error)) {
        let message = result?.error || 'Repository access check failed. Please verify the URL and permissions.';
        if (message.toLowerCase().includes('connect') && message.toLowerCase().includes('social connections')) {
          setNeedsSocialConnect(provider);
        }
        setFetchBranchesError(message);
        setBranches([]);
        setIsValidated(false);
        return;
      }

      const fetchedBranches = result.branches || [];
      const default_branch = result.defaultBranch;
      const inferredExtensions = result.file_extensions && result.file_extensions.length > 0
        ? result.file_extensions.map((ext: string) => ext.startsWith('.') ? ext : `.${ext}`)
        : DEFAULT_FILE_EXTENSIONS;

      const repoName = extractRepoName(repositoryUrl.trim())
      setName(prev => prev || repoName)

      if (!fetchedBranches || fetchedBranches.length === 0) {
        setFetchBranchesError("No branches found. Please check the repository URL and permissions.");
        setBranches([]);
        setIsValidated(false);
      } else {
        setBranches(fetchedBranches);
        const inferredDefault = default_branch || (fetchedBranches.includes('main') ? 'main' : (fetchedBranches.includes('master') ? 'master' : fetchedBranches[0]))
        // Update config with inferred extensions
        setConfig(prev => ({
          ...prev,
          defaultBranch: inferredDefault || prev.defaultBranch,
          fileExtensions: inferredExtensions
        }));
        // Update available extensions for the UI badges
        setAvailableFileExtensions(inferredExtensions);
        setIsValidated(true);
      }
    } catch (err: unknown) {
      console.error('[FRONTEND] Branch fetching error:', err);
      let errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[FRONTEND] Error message:', errorMessage);


      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = "Authentication failed. Please check your credentials and token permissions.";
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage = "Repository not found. Please check the URL and ensure you have access.";
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = "Access denied. Please check your token permissions and repository access.";
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = "API rate limit exceeded. Please wait a few minutes before trying again.";
      }

      setFetchBranchesError(errorMessage);
      setBranches([]);
      setIsValidated(false);
    } finally {
      setIsFetchingBranches(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const connected = await ensureProviderConnected();
      if (!connected) {
        setError(`Please connect ${provider === 'github' ? 'GitHub' : provider === 'gitlab' ? 'GitLab' : 'BitBucket'} in Social Connections before connecting.`);
        return;
      }
      let finalCredentials = { ...credentials };
      if (!finalCredentials.access_token) {
        try {
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
          const tokenResp = await authClient.get<{ success?: boolean; access_token?: string }>(`/api/auth/connections/${provider}/token`, headers);
          const tokenData = unwrapResponse<{ access_token: string }>(tokenResp);
          if (tokenData && tokenData.access_token) {
            finalCredentials = { access_token: tokenData.access_token };
          }
        } catch (e) {
          console.warn('Failed to fetch token during connection:', e);
        }
      }

      const payload = {
        type: provider,
        name: name || extractRepoName(repositoryUrl) || `${provider}-${Date.now()}`,
        uri: repositoryUrl,
        credentials: finalCredentials,
        branch: config.defaultBranch || 'main',
        include_patterns: ["**/*"],
        exclude_patterns: ['node_modules', 'dist', 'build', '.git', 'target', '__pycache__', 'vendor', '.venv', 'venv'],
        metadata: {
          fetch_issues: config.fetchIssues,
          fetch_prs: config.fetchPrs,
          auto_sync: config.autoSync,
          file_extensions: config.fileExtensions
        }
      };

      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await dataApiClient.post<ApiResponse>('/api/v1/sources', payload, headers);
      if (resp.success) {
        const backendAlreadyStartedSync = (resp as any)?.syncStarted === true;
        if (backendAlreadyStartedSync) {
          console.log('[ConnectRepo] Connection successful, backend started indexing');
        } else {
          // Backward compatibility: if backend didn't start sync, trigger it here
          console.log('[ConnectRepo] Connection successful, triggering auto-sync (fallback)...');

          try {
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
            const syncPayload = {
              repo_url: repositoryUrl,
              branch: config.defaultBranch || 'main',
              include_languages: null,
              exclude_paths: ['node_modules', 'dist', 'build', '.git', 'target', '__pycache__', 'vendor', '.venv', 'venv'],
              max_file_size_mb: 5,
              file_extensions: config.fileExtensions || null,
              fetch_issues: config.fetchIssues ?? true,
              fetch_prs: config.fetchPrs ?? true,
            };

            // Fire sync in background - don't block the UI
            dataApiClient.post('/api/github/sync', syncPayload, headers)
              .then((syncResp: any) => {
                if (syncResp.success) {
                  console.log('[ConnectRepo] Auto-sync completed:', syncResp);
                } else {
                  console.warn('[ConnectRepo] Auto-sync failed:', syncResp.error_message || syncResp.error);
                }
              })
              .catch((syncErr: any) => {
                console.warn('[ConnectRepo] Auto-sync error:', syncErr);
              });

            console.log('[ConnectRepo] Auto-sync triggered in background');
          } catch (syncError) {
            // Don't fail the connection if sync fails - it can be retried
            console.warn('[ConnectRepo] Failed to trigger auto-sync:', syncError);
          }
        }

        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        const errorMessage = resp.error || 'Failed to connect repository';

        if (errorMessage.includes('token')) {
          setError(`${errorMessage}\n\nPlease check:\n• Token is not expired\n• Token has correct permissions\n• For public repos: use 'public_repo' scope\n• For private repos: use 'repo' scope`);
        } else if (errorMessage.includes('not found') || errorMessage.includes('Access denied')) {
          setError(`${errorMessage}\n\nPlease verify:\n• Repository URL is correct\n• Repository exists and is accessible\n• Token has access to the repository\n• Repository is not private (if using public_repo scope)`);
        } else if (errorMessage.includes('rate limit')) {
          setError(`${errorMessage}\n\nGitHub API rate limit exceeded. Please wait a few minutes before trying again.`);
        } else {
          setError(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error connecting repository:', error);
      setError(error.message || 'Network error occurred while connecting repository. Please check if all services are running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProvider('');
    setName('');
    setRepositoryUrl('');
    setCredentials({});
    setConfig({
      fetchIssues: true,
      fetchPrs: true,
      defaultBranch: 'main',
      autoSync: false,
      fileExtensions: DEFAULT_FILE_EXTENSIONS
    });
    setBranches([]);
    setShowAdvancedSettings(false);
    setError(null);
    setAvailableFileExtensions(DEFAULT_FILE_EXTENSIONS);
    setNeedsSocialConnect(null);
    setIsValidated(false);
    setFetchBranchesError(null);
  };

  const renderCredentialFields = () => {
    switch (provider) {
      case 'gitlab':
        return null;

      case 'bitbucket':
        return null;

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Connect Repository
          </DialogTitle>
          <DialogDescription>
            Connect a GitHub, GitLab, or Bitbucket repository to index and search your code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="font-medium">Connection Failed</div>
                  <div className="whitespace-pre-line">{error}</div>
                </div>
              </div>
            </div>
          )}

          {needsSocialConnect && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {`You need to connect ${needsSocialConnect === 'github' ? 'GitHub' : needsSocialConnect === 'gitlab' ? 'GitLab' : 'BitBucket'} before proceeding.`}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  title="Go to Social Connections"
                  aria-label="Go to Social Connections"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => { router.push('/dashboard/connections'); }}
                  disabled={checkingConnection}
                >
                  Go to Social Connections
                </Button>
              </div>
            </div>
          )}

          {isValidated && (
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium">Connection Name (Optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder={repositoryUrl ? extractRepoName(repositoryUrl) : "Auto-generated from repository URL"}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Leave empty to automatically use the repository name from the URL
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="provider" className="text-sm font-medium">Repository Provider</Label>
            <Select value={provider} onValueChange={(value) => isProviderConnected(value) && setProvider(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a repository provider" />
              </SelectTrigger>
              <SelectContent>
                {allProviders.map(({ value, label, icon: Icon }) => {
                  const isConnected = isProviderConnected(value);
                  return (
                    <SelectItem
                      key={value}
                      value={value}
                      disabled={!isConnected}
                      className={!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${!isConnected ? 'grayscale' : ''}`} />
                        <span className={!isConnected ? 'text-gray-500' : ''}>
                          {label}
                          {!isConnected && ' (Not Connected)'}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {isProviderSelected && (
            <div className="space-y-3">
              <Label htmlFor="repositoryUrl" className="text-sm font-medium">Repository URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="repositoryUrl"
                  placeholder={
                    provider === 'gitlab' ? 'https://gitlab.com/user/repo.git' :
                      provider === 'bitbucket' ? 'https://bitbucket.org/user/repo.git' :
                        'https://github.com/user/repo.git'
                  }
                  value={repositoryUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRepositoryUrl(e.target.value)}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleFetchBranches}
                  disabled={isFetchingBranches || !isUrlValid || !isProviderSelected}
                >
                  {isFetchingBranches ? 'Validating...' : 'Check'}
                </Button>
              </div>
              {fetchBranchesError && !needsSocialConnect && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <span>{fetchBranchesError}</span>
                    {fetchBranchesError.toLowerCase().includes('please connect') && (
                      <Button
                        variant="link"
                        className="text-blue-700 px-0"
                        onClick={() => { router.push('/dashboard/connections'); }}
                      >
                        Open Connections
                      </Button>
                    )}
                  </p>
                </div>
              )}
              {/* Success state is indicated by showing the configuration options below */}
            </div>
          )}

          {isProviderSelected && renderCredentialFields()}

          {isValidated && (
            <div className="space-y-6 border-t pt-6">
              <h4 className="font-medium text-base">Configuration Options</h4>

              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Fetch Issues</Label>
                    <p className="text-xs text-muted-foreground">Ingest GitHub issues (title, body, comments) for this repository</p>
                  </div>
                  <Switch
                    checked={config.fetchIssues}
                    onCheckedChange={(checked) => setConfig({ ...config, fetchIssues: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Fetch PRs</Label>
                    <p className="text-xs text-muted-foreground">Ingest pull requests, reviews, and discussions</p>
                  </div>
                  <Switch
                    checked={config.fetchPrs}
                    onCheckedChange={(checked) => setConfig({ ...config, fetchPrs: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Auto-sync</Label>
                    <p className="text-xs text-muted-foreground">Automatically re-sync this repository on a schedule</p>
                  </div>
                  <Switch
                    checked={config.autoSync}
                    onCheckedChange={(checked) => setConfig({ ...config, autoSync: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Default Branch</Label>
                  <Select
                    value={config.defaultBranch}
                    onValueChange={(value) => setConfig({ ...config, defaultBranch: value })}
                    disabled={!hasBranches}
                  >
                    <SelectTrigger className={`mt-2 ${!hasBranches ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <SelectValue placeholder={hasBranches ? "Select branch" : "Fetch branches first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!hasBranches && (
                    <p className="text-xs text-muted-foreground">
                      Click &quot;Check&quot; button above to fetch available branches
                    </p>
                  )}
                </div>

                {/* Advanced Settings */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <span className={`transform transition-transform duration-200 ${showAdvancedSettings ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    Advanced Settings
                  </button>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvancedSettings ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">File Extensions to Index</Label>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(availableFileExtensions.length > 0 ? availableFileExtensions : DEFAULT_FILE_EXTENSIONS).map((ext) => (
                            <Badge
                              key={ext}
                              variant={config.fileExtensions?.includes(ext) ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                const extensions = config.fileExtensions || [];
                                const newExtensions = extensions.includes(ext)
                                  ? extensions.filter((x) => x !== ext)
                                  : [...extensions, ext];
                                setConfig({ ...config, fileExtensions: newExtensions });
                              }}
                            >
                              {ext}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Select file types to include in indexing. Click badges to toggle.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!isValidated || !isProviderSelected || !repositoryUrl || loading}
            >
              {loading ? 'Connecting...' : 'Connect Repository'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
