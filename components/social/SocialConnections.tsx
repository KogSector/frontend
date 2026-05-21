"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, Plus, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authClient, dataClient, unwrapResponse } from '@/lib/api';
import { useAuth } from '@/contexts/auth';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import GitHubIcon from '@/components/icons/GitHubIcon'
import GitLabIcon from '@/components/icons/GitLabIcon'
import BitbucketIcon from '@/components/icons/BitbucketIcon'
import SlackIcon from '@/components/icons/SlackIcon'
import GoogleDriveIcon from '@/components/icons/GoogleDriveIcon'
import DropboxIcon from '@/components/icons/DropboxIcon'
import NotionIcon from '@/components/icons/NotionIcon'
import JiraIcon from '@/components/icons/JiraIcon'
import ConfluenceIcon from '@/components/icons/ConfluenceIcon'
import CustomAppsIcon from '@/components/icons/CustomAppsIcon'

interface SocialConnection {
  id: string;
  platform: 'slack' | 'notion' | 'google_drive' | 'gmail' | 'dropbox' | 'linkedin' | 'github' | 'bitbucket' | 'gitlab' | 'jira' | 'confluence' | 'custom_apps' | 'google' | 'windowslive';
  username: string;
  is_active: boolean;
  connected_at: string;
  last_sync: string | null;
}

const PLATFORM_CONFIGS = {
  slack: { name: 'Slack', description: 'Connect to sync messages and channels', icon: (cls: string) => <SlackIcon className={cls} /> },
  notion: { name: 'Notion', description: 'Sync pages and databases', icon: (cls: string) => <NotionIcon className={cls} /> },
  google_drive: { name: 'Google Drive', description: 'Access files and documents', icon: (cls: string) => <GoogleDriveIcon className={cls} /> },
  onedrive: { name: 'OneDrive', description: 'Access files and documents', icon: (cls: string) => <Cloud className={cls} /> },
  dropbox: { name: 'Dropbox', description: 'Sync files and folders', icon: (cls: string) => <DropboxIcon className={cls} /> },
  github: { name: 'GitHub', description: 'Connect your GitHub account', icon: (cls: string) => <GitHubIcon className={cls} /> },
  bitbucket: { name: 'Bitbucket', description: 'Connect your Bitbucket account', icon: (cls: string) => <BitbucketIcon className={cls} /> },
  gitlab: { name: 'GitLab', description: 'Connect your GitLab account', icon: (cls: string) => <GitLabIcon className={cls} /> },
  jira: { name: 'Jira', description: 'Sync issues and projects', icon: (cls: string) => <JiraIcon className={cls} /> },
  confluence: { name: 'Confluence', description: 'Sync pages and spaces', icon: (cls: string) => <ConfluenceIcon className={cls} /> },
  custom_apps: { name: 'Custom Apps', description: 'Integrate third party apps', icon: (cls: string) => <CustomAppsIcon className={cls} /> },
} as const;

export function SocialConnections() {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  // Use a Set in a ref to track codes that have been processed (prevents duplicate exchanges)
  const processedCodesRef = useRef<Set<string>>(new Set());
  // Track whether initial load has completed to avoid skeleton flash on subsequent fetches
  const hasLoadedRef = useRef(false);
  const { toast } = useToast();
  const { token, refreshConnections, loginWithPopup } = useAuth();

  const fetchConnections = useCallback(async (options?: { initial?: boolean; overrideToken?: string }) => {
    // Use the override token if provided (avoids stale closure after loginWithPopup)
    const effectiveToken = options?.overrideToken || token;

    // Do not hit the services until we have an Auth0 access token;
    // otherwise we get an automatic 401 and show a spurious error toast.
    if (!effectiveToken) {
      setLoading(false);
      return;
    }

    // Only show skeleton on initial load, not on subsequent refreshes
    const isInitialLoad = options?.initial && !hasLoadedRef.current;
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${effectiveToken}` };

      const authResp = await authClient.get('/api/auth/connections', headers);

      const authData = unwrapResponse<SocialConnection[]>(authResp) ?? [];

      const connectionMap = new Map<string, SocialConnection>();
      authData.forEach((conn: any) => connectionMap.set(conn.platform, conn));

      const merged = Array.from(connectionMap.values());
      console.log('[SocialConnections] fetched connections', {
        tokenPresent: !!effectiveToken,
        tokenSource: options?.overrideToken ? 'override' : 'closure',
        authData,
        merged,
      });

      setConnections(merged);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social connections",
        variant: "destructive"
      });
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    }
  }, [toast, token]);

  useEffect(() => {
    fetchConnections({ initial: true });
    const handler = async (e: MessageEvent) => {
      const dataUnknown: unknown = e.data
      if (typeof dataUnknown !== 'object' || dataUnknown === null || !('type' in dataUnknown)) {
        return
      }

      const data = dataUnknown as { type: string; provider?: string; code?: string; error?: string }

      if (data.type === 'oauth-connected') {
        // Legacy: popup already did the exchange
        fetchConnections()
      } else if (data.type === 'oauth-code' && data.provider && data.code) {
        // Prevent duplicate exchange calls - OAuth codes are single-use
        const codeKey = `${data.provider}:${data.code}`
        if (processedCodesRef.current.has(codeKey)) {
          console.log('OAuth code already processed, skipping duplicate:', codeKey)
          return
        }
        processedCodesRef.current.add(codeKey)

        // New: popup sent us the code, we do the exchange here (we have the token)
        // IMPORTANT: Use the same token source as other API calls (useAuth's token)
        // to ensure consistent user_id across all flows. Fall back to localStorage
        // only if useAuth token is not yet available.
        try {
          const effectiveToken = token || localStorage.getItem('auth_token')
          if (!effectiveToken) {
            toast({
              title: "Error",
              description: "Please log in first before connecting accounts",
              variant: "destructive"
            })
            return
          }
          const headers: Record<string, string> = { Authorization: `Bearer ${effectiveToken}` }
          await authClient.post('/api/auth/oauth/exchange', { provider: data.provider, code: data.code }, headers)
          toast({
            title: "Success",
            description: `${data.provider} connected successfully!`,
          })
          
          // Auto-register data source
          try {
            const platformName = PLATFORM_CONFIGS[data.provider as keyof typeof PLATFORM_CONFIGS]?.name || data.provider;
            await dataClient.post('/api/v1/sources', {
              type: data.provider,
              name: `${platformName} Connection`,
              uri: `oauth://${data.provider}`,
            }, headers);
            console.log(`[registerDataSource] Successfully registered ${data.provider} source for data streaming`);
          } catch (err) {
            console.error(`[registerDataSource] Failed to register source for ${data.provider}:`, err);
          }

          // Refresh connections in-place (no skeleton) and update global state
          fetchConnections({ overrideToken: effectiveToken })
          if (refreshConnections) refreshConnections()
        } catch (error: any) {
          console.error('OAuth exchange error:', error)
          const errorMsg = error?.message || `Failed to connect ${data.provider}`

          // Provide specific guidance for common OAuth errors
          if (errorMsg.includes('bad_verification_code') || errorMsg.includes('incorrect or expired')) {
            toast({
              title: "Authorization Expired",
              description: "The GitHub authorization code has expired. Please click Connect again to restart.",
              variant: "destructive"
            })
          } else if (errorMsg.includes('redirect_uri_mismatch')) {
            toast({
              title: "Configuration Error",
              description: "OAuth callback URL mismatch. Please check the GitHub OAuth app settings.",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Error",
              description: errorMsg,
              variant: "destructive"
            })
          }
        }
      } else if (data.type === 'oauth-error' && data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [fetchConnections, toast]);



  const connectPlatform = async (platform: string) => {
    try {
      // ----------------------------------------------------------------
      // Auth0-based providers (Google Drive, OneDrive, Bitbucket, GitLab, Dropbox)
      // These use Auth0's loginWithPopup to link the social provider
      // ----------------------------------------------------------------
      if (platform === 'google_drive' || platform === 'onedrive' || platform === 'bitbucket' || platform === 'gitlab' || platform === 'dropbox') {
        let connectionName = platform;
        let authorizationParams: any = {};

        if (platform === 'google_drive') {
          connectionName = 'google-oauth2';
          authorizationParams.connection_scope = 'https://www.googleapis.com/auth/drive.readonly';
        } else if (platform === 'onedrive') {
          connectionName = 'windowslive';
        } else if (platform === 'gitlab') {
          connectionName = 'gitlab';
        } else if (platform === 'bitbucket') {
          connectionName = 'bitbucket';
        } else if (platform === 'dropbox') {
          connectionName = 'dropbox';
        }

        authorizationParams.connection = connectionName;

        await loginWithPopup({
          authorizationParams
        });

        console.log('[connectPlatform] loginWithPopup completed, syncing connections...');
        const effectiveToken = token || localStorage.getItem('confuse_auth_token') || '';
        const headers: Record<string, string> = effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};
        const syncResp = await authClient.post(`/api/auth/connections/sync`, { targetProvider: connectionName }, headers);
        console.log('[connectPlatform] sync response:', JSON.stringify(syncResp));

        await fetchConnections({ overrideToken: effectiveToken });
        if (refreshConnections) refreshConnections();

        const platformName = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]?.name || platform;
        toast({
          title: "Success",
          description: `${platformName} connected successfully!`,
        });

        // Auto-register data source
        try {
          await dataClient.post('/api/v1/sources', {
            type: platform,
            name: `${platformName} Connection`,
            uri: `oauth://${platform}`,
          }, headers);
          console.log(`[registerDataSource] Successfully registered ${platform} source for data streaming`);
        } catch (err) {
          console.error(`[registerDataSource] Failed to register source for ${platform}:`, err);
        }

        return;
      }

      // ----------------------------------------------------------------
      // Direct OAuth popup providers (GitHub, Slack, Notion, Jira, Confluence)
      // These open a popup to the provider's OAuth authorize URL directly
      // ----------------------------------------------------------------
      if (platform === 'github' || platform === 'slack' || platform === 'notion' || platform === 'jira' || platform === 'confluence') {
        const effectiveToken = token || localStorage.getItem('confuse_auth_token') || '';
        const headers: Record<string, string> = effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};

        // Get the OAuth URL from auth-middleware
        const urlResp = await authClient.get<{ url: string; provider: string }>(
          `/api/auth/oauth/url?provider=${platform}`,
          headers
        );

        if (!urlResp || !(urlResp as any).url) {
          toast({
            title: 'Configuration Required',
            description: `${PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]?.name || platform} OAuth is not configured yet. Please set up the OAuth credentials.`,
            variant: 'destructive'
          });
          return;
        }

        // Open the OAuth popup
        const popup = window.open(
          (urlResp as any).url,
          `${platform}-oauth`,
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Monitor popup close (the message handler in useEffect will handle the code exchange)
        if (popup) {
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
            }
          }, 1000);
        }

        return;
      }

      // ----------------------------------------------------------------
      // Custom Apps: API key/token dialog
      // ----------------------------------------------------------------
      if (platform === 'custom_apps') {
        const appName = prompt('Enter your app name:');
        if (!appName) return;

        const apiToken = prompt('Enter your API key or access token:');
        if (!apiToken) return;

        const effectiveToken = token || localStorage.getItem('confuse_auth_token') || '';
        const headers: Record<string, string> = effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {};

        await authClient.post('/api/auth/oauth/exchange', {
          provider: 'custom_apps',
          token: apiToken,
          metadata: { name: appName, app_id: appName.toLowerCase().replace(/\s+/g, '-') }
        }, headers);

        toast({
          title: "Success",
          description: `${appName} connected successfully!`,
        });

        // Auto-register data source
        try {
          await dataClient.post('/api/v1/sources', {
            type: 'custom',
            name: appName,
            uri: `custom://${appName.toLowerCase().replace(/\s+/g, '-')}`,
            credentials: { access_token: apiToken },
          }, headers);
          console.log(`[registerDataSource] Successfully registered custom app source for data streaming`);
        } catch (err) {
          console.error(`[registerDataSource] Failed to register source for custom app:`, err);
        }

        await fetchConnections({ overrideToken: effectiveToken });
        if (refreshConnections) refreshConnections();

        return;
      }

      toast({ title: 'Error', description: `Platform ${platform} connection is not supported.`, variant: 'destructive' });

    } catch (error) {
      console.error('Error connecting platform:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ title: 'Error', description: `Failed to connect to ${platform}: ${errorMessage}`, variant: 'destructive' });
    }
  };

  const disconnectPlatform = async (connectionId: string, platform: string) => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      await authClient.delete(`/api/auth/connections/${platform}`, headers);

      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      toast({
        title: "Success",
        description: "Platform disconnected successfully"
      });
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive"
      });
    }
  };

  const syncPlatform = async (connectionId: string, platform: string) => {
    setSyncing(connectionId);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      await authClient.post(`/api/auth/connections/sync`, {}, headers);
      toast({
        title: "Success",
        description: `${PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS].name} synced successfully`
      });
      fetchConnections();
    } catch (error) {
      console.error('Error syncing platform:', error);
      toast({
        title: "Error",
        description: `Failed to sync ${platform}`,
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Share2 className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Connections</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProfileAvatar />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-muted-foreground">
          Connect your accounts to enhance context and collaboration across platforms
        </p>

        {/* All Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(PLATFORM_CONFIGS) as Array<keyof typeof PLATFORM_CONFIGS>).map((platform) => {
          const config = PLATFORM_CONFIGS[platform];

          let targetPlatform = platform as string;
          if (platform === 'google_drive') targetPlatform = 'google';
          if (platform === 'onedrive') targetPlatform = 'windowslive';

          let connection = connections.find(c => c.platform === targetPlatform);
          const isConnected = connection?.is_active;

          return (
            <Card key={platform} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    {config.icon('w-8 h-8')}
                  </div>
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                </div>
                <CardDescription>
                  {isConnected ? (
                    <span className="text-green-600 dark:text-green-400">
                      Connected
                    </span>
                  ) : (
                    config.description
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isConnected ? (
                  <Button
                    title={`Disconnect ${config.name}`}
                    aria-label={`Disconnect ${config.name}`}
                    onClick={() => connection && disconnectPlatform(connection.id, platform)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    title={`Connect ${config.name}`}
                    aria-label={`Connect ${config.name}`}
                    onClick={() => connectPlatform(platform)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}

export default SocialConnections;
