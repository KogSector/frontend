'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Footer } from "@/components/layout/footer";
import { ConnectSourceModal } from "@/components/ui/ConnectSourceModal";
import { ArrowLeft, FileText, Plus, Upload, Cloud, HardDrive, RefreshCw, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { dataClient, deleteSource, syncSource } from "@/lib/api";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";

interface DocumentSource {
  id: string;
  name: string;
  type: 'local_files' | 'google_drive' | 'dropbox' | 'onedrive' | 'notion' | 'confluence';
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  documentCount: number;
  lastSync?: string;
  size?: string;
}

interface DocumentRecord {
  id: string;
  user_id: string;
  name: string;
  doc_type: string;
  source: string;
  size: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  status: string;
  source_id?: string;
}

interface DocumentAnalytics {
  total_documents: number;
  processed_documents: number;
  total_tags: number;
  unique_sources: number;
  sources: Record<string, number>;
  all_tags: string[];
}

export default function DocumentsPage() {
  const [sources, setSources] = useState<DocumentSource[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom dialog states
  const [deleteSourceId, setDeleteSourceId] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const hasLoadedRef = useRef(false);
  const { token } = useAuth();
  const { toast } = useToast();

  // Fetch documents and analytics from real API
  const fetchDocuments = useCallback(async (options?: { initial?: boolean }) => {
    const isInitialLoad = options?.initial && !hasLoadedRef.current;
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch documents, analytics and sources in parallel
      const [docsResp, analyticsResp, sourcesResp] = await Promise.allSettled([
        dataClient.get<{ success: boolean; data: DocumentRecord[]; total: number }>('/api/v1/documents', headers),
        dataClient.get<{ success: boolean; data: DocumentAnalytics }>('/api/v1/documents/analytics', headers),
        dataClient.get<{ sources: any[]; total: number }>('/api/v1/sources', headers)
      ]);

      // Process sources response
      const realSourcesMap = new Map<string, any>();
      if (sourcesResp.status === 'fulfilled' && (sourcesResp.value as any)?.sources) {
        (sourcesResp.value as any).sources.forEach((s: any) => {
          realSourcesMap.set(s.id, s);
        });
      }

      // Process documents response
      if (docsResp.status === 'fulfilled' && (docsResp.value as any)?.success) {
        const respData = (docsResp.value as any).data;
        const docsData = Array.isArray(respData?.data) ? respData.data : (Array.isArray(respData) ? respData : []);
        setDocuments(docsData);

        // Build sources from real sources first, then add derived ones for demo docs
        const sourceMap = new Map<string, DocumentSource>();

        // Add real document sources
        realSourcesMap.forEach((s) => {
          // Only show document-related sources here (upload, gdrive, etc)
          const docTypes = ['upload', 'google_drive', 'gdrive', 'dropbox', 'onedrive', 'notion', 'confluence'];
          if (docTypes.includes(s.type)) {
            sourceMap.set(s.id, {
              id: s.id,
              name: s.name,
              type: s.type as any,
              status: s.status as any,
              documentCount: 0,
              lastSync: 'Just now',
              size: '0 B'
            });
          }
        });

        // Add document counts and handle derived sources
        docsData.forEach((doc: DocumentRecord) => {
          let sourceFound = false;
          if (doc.source_id && sourceMap.has(doc.source_id)) {
            const s = sourceMap.get(doc.source_id)!;
            s.documentCount += 1;
            sourceFound = true;
          } else {
            // Fallback for demo docs without source_id
            for (const s of Array.from(sourceMap.values())) {
              if (s.type === doc.source) {
                s.documentCount += 1;
                sourceFound = true;
                break; // Only add to the first matching source
              }
            }
          }

          if (!sourceFound) {
            const sourceType = doc.source as DocumentSource['type'];
            if (!sourceMap.has(sourceType)) {
              sourceMap.set(sourceType, {
                id: sourceType,
                name: getTypeName(sourceType),
                type: sourceType,
                status: 'connected',
                documentCount: 0,
                lastSync: 'Just now',
                size: '0 B'
              });
            }
            const source = sourceMap.get(sourceType)!;
            source.documentCount += 1;
          }
        });

        setSources(Array.from(sourceMap.values()));
      }

      // Process analytics response
      if (analyticsResp.status === 'fulfilled' && (analyticsResp.value as any)?.success) {
        setAnalytics((analyticsResp.value as any).data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    }
  }, [token, toast]);

  useEffect(() => {
    fetchDocuments({ initial: true });
  }, [fetchDocuments]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'local_files': return <HardDrive className="w-5 h-5 text-gray-600" />;
      case 'google_drive': return <Cloud className="w-5 h-5 text-blue-500" />;
      case 'dropbox': return <Cloud className="w-5 h-5 text-blue-600" />;
      case 'onedrive': return <Cloud className="w-5 h-5 text-blue-700" />;
      case 'notion': return <FileText className="w-5 h-5 text-gray-700" />;
      case 'confluence': return <FileText className="w-5 h-5 text-blue-800" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'local_files': return 'Local Files';
      case 'local_upload': return 'Local Upload';
      case 'google_drive': return 'Google Drive';
      case 'dropbox': return 'Dropbox';
      case 'onedrive': return 'OneDrive';
      case 'notion': return 'Notion';
      case 'confluence': return 'Confluence';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500 shadow-lg shadow-green-500/50';
      case 'syncing': return 'bg-blue-500 shadow-lg shadow-blue-500/50';
      case 'processing': return 'bg-yellow-500 shadow-lg shadow-yellow-500/50';
      case 'processed': return 'bg-green-500 shadow-lg shadow-green-500/50';
      case 'error': return 'bg-red-500 shadow-lg shadow-red-500/50';
      default: return 'bg-gray-400';
    }
  };

  const handleSourceConnected = () => {
    // Refresh documents list without showing skeleton
    fetchDocuments();
    toast({
      title: "Success",
      description: "Document source connected successfully"
    });
  };

  const handleDeleteSource = (sourceId: string) => {
    // Check if it's a UUID (real source) or a derived demo source
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sourceId);

    if (!isUuid) {
      // Demo source - just remove from local state
      setSources(prev => prev.filter(s => s.id !== sourceId));
      toast({
        title: "Demo source removed",
        description: "The demo document source has been removed locally.",
      });
      return;
    }

    setDeleteSourceId(sourceId);
  };

  const confirmDeleteSource = async () => {
    if (!deleteSourceId) return;

    const sourceId = deleteSourceId;
    setDeleteSourceId(null);
    setIsDeleting(true);

    try {
      const resp = await deleteSource(sourceId);
      if (resp.success) {
        toast({
          title: "Source deleted",
          description: "The document source has been removed.",
        });
        // Update local state immediately for better UX
        setSources(prev => prev.filter(s => s.id !== sourceId));
        fetchDocuments(); // Refresh list in background to sync everything
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSyncSource = async (sourceId: string) => {
    try {
      // Set individual source syncing state if possible, but don't set global loading
      // For now we rely on the API status that will come back in fetchDocuments
      const resp = await syncSource(sourceId);
      if (resp.success) {
        toast({
          title: "Sync started",
          description: "Processing documents in the background.",
        });
        // Poll for updates in background
        fetchDocuments();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start sync",
        variant: "destructive",
      });
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Documents</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProfileAvatar />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Documents
              </CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analytics?.total_documents ?? documents.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Connected Documents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Connected Documents</h2>
            <p className="text-sm text-muted-foreground">Connect and manage your document sources</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchDocuments()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowConnectModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>

        {/* Document Sources */}
        <div className="space-y-4 mb-12">
          {sources.length === 0 ? (
            <Card className="bg-muted/50 border-dashed border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No document sources connected</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Connect your first document source to start indexing and accessing your documents with AI.
                </p>
                <Button onClick={() => setShowConnectModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Data Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sources.map((source) => (
                <Card key={source.id} className="bg-card border-border hover:bg-accent/5 transition-colors">
                  <div className="flex flex-col px-6 py-4 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(source.type)}
                        <div>
                          <h3 className="font-semibold text-foreground">{source.name}</h3>
                          <p className="text-sm text-muted-foreground">{getTypeName(source.type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                        <Badge variant="outline" className="text-xs">
                          {source.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{source.documentCount} documents</span>
                      {source.size && <span>{source.size}</span>}
                      {source.lastSync && <span>Last sync: {source.lastSync}</span>}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncSource(source.id)}
                        disabled={loading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${source.status === 'syncing' ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSource(source.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>


      </div>

      <Footer />

      <ConnectSourceModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onSourceConnected={handleSourceConnected}
      />

      <AlertDialog open={!!deleteSourceId} onOpenChange={(open) => !open && setDeleteSourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this source?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document source
              and all {documents.filter(d => {
                const source = sources.find(s => s.id === deleteSourceId);
                return d.source === source?.type;
              }).length} associated documents from our knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSource} className="bg-red-500 hover:bg-red-600">
              Delete Source
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}