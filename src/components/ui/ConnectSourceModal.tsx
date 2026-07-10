"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { docDataClient, listAuthConnections, unwrapResponse, ApiResponse, isToggleEnabled } from "@/lib/api";
import { Upload, Cloud, Loader2, CheckCircle2, XCircle, FolderOpen, FileText, HardDrive, Droplets, BookOpen } from "lucide-react";
import { CloudFileBrowser, CloudFile } from "./CloudFileBrowser";

interface ConnectSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceConnected?: () => void;
}

type ConnectorType = "local_files" | "third_party";

interface ConnectionStatus {
  status: "idle" | "connecting" | "success" | "error";
  message?: string;
}

export function ConnectSourceModal({ open, onOpenChange, onSourceConnected }: ConnectSourceModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ConnectorType>("local_files");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: "idle" });
  const [needsSocialConnect, setNeedsSocialConnect] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCloudFiles, setSelectedCloudFiles] = useState<{ file: CloudFile, provider: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  useEffect(() => {
    isToggleEnabled('deployedTesting')
      .then(enabled => setIsTesting(enabled))
      .catch(console.error);
  }, []);

  // Expanded file types: documents, code, config files
  const allowedExtensions = [
    // Documents
    '.docx', '.txt', '.md', '.pdf', '.rtf',
    // Code files
    '.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php',
    // Config/data files
    '.json', '.yml', '.yaml', '.toml', '.xml', '.csv'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      return allowedExtensions.includes(ext);
    });
    
    if (validFiles.length < files.length) {
      toast({ title: "Invalid file type", description: "Some files were skipped. Supported: docs, code, and config files.", variant: "destructive" });
    }
    
    const existingNames = new Set(selectedFiles.map(f => f.name));
    const newFiles = validFiles.filter(f => !existingNames.has(f.name));
    
    let combined = [...selectedFiles, ...newFiles];
    if (combined.length > 100) {
      toast({ title: "Limit reached", description: "You can upload up to 100 files at once", variant: "destructive" });
    }
    combined = combined.slice(0, 100);
    setSelectedFiles(combined);
    e.target.value = "";
  };

  const handleUploadSelected = async () => {
    if (selectedFiles.length === 0 && selectedCloudFiles.length === 0) {
      toast({ title: "Error", description: "Please select files to upload", variant: "destructive" });
      return;
    }
    setConnectionStatus({ status: "connecting" });
    try {
      const localPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("files", file);
        formData.append("source_name", file.name);
        return docDataClient.postForm<ApiResponse<{ source_id?: string; files_processed?: number; files_received?: number; message?: string }>>("/api/v1/documents/upload", formData);
      });

      const cloudPromises = selectedCloudFiles.map(async ({ file, provider }) => {
        const payload = {
          type: provider,
          name: file.name,
          uri: `oauth://${provider}/${file.id}`,
          metadata: { item_ids: [file.id] }
        };
        return docDataClient.post("/api/v1/sources", payload);
      });

      const [localResults, cloudResults] = await Promise.all([
        Promise.all(localPromises),
        Promise.all(cloudPromises)
      ]);
      
      const allLocalSuccess = localResults.every(res => {
        const resultData = (res as any).data;
        return resultData?.source_id || resultData?.files_processed > 0;
      });

      if (allLocalSuccess) {
        const total = selectedFiles.length + selectedCloudFiles.length;
        setConnectionStatus({ status: "success", message: `Successfully uploaded ${total} file(s)` });
        toast({ title: "Success", description: `Uploaded ${total} file(s) successfully` });
        setTimeout(() => { onSourceConnected?.(); onOpenChange(false); resetForm(); }, 1500);
      } else {
        throw new Error("One or more uploads failed");
      }
    } catch (error) {
      setConnectionStatus({ status: "error", message: "Failed to upload files" });
      toast({ title: "Error", description: "Failed to upload files", variant: "destructive" });
    }
  };

  

  const ensureProviderConnected = async (platform: string): Promise<boolean> => {
    setCheckingConnection(true);
    try {
      const resp = await listAuthConnections();
      const list = unwrapResponse<Array<{ platform: string; is_active: boolean }>>(resp) || [];
      const connected = list.some((c) => c.platform === platform && c.is_active);
      if (!connected) {
        setNeedsSocialConnect(platform);
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

  const handleThirdPartyConnect = async (service: string) => {
    setConnectionStatus({ status: "connecting" });
    try {
      const connected = await ensureProviderConnected(service);
      if (!connected) {
        const providerName = service === 'google_drive' ? 'Google Drive' :
                             service === 'onedrive' ? 'OneDrive' :
                             service === 'dropbox' ? 'Dropbox' :
                             service === 'notion' ? 'Notion' : service;
        setConnectionStatus({ status: "error", message: `Please connect ${providerName} in Social Connections first` });
        return;
      }

      if (['onedrive', 'google_drive', 'dropbox'].includes(service)) {
         setConnectionStatus({ status: "idle" });
         setActiveProvider(service);
         setBrowserOpen(true);
         return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectionStatus({ status: "success", message: `Successfully connected to ${service}` });
      toast({ title: "Success", description: `Connected to ${service} successfully` });
      setTimeout(() => { onSourceConnected?.(); onOpenChange(false); resetForm(); }, 1000);
    } catch {
      setConnectionStatus({ status: "error", message: `Failed to connect to ${service}` });
      toast({ title: "Error", description: `Failed to connect to ${service}`, variant: "destructive" });
    }
  };

  const handleFilesSelected = async (files: CloudFile[]) => {
    const newFiles = files.map(file => ({ file, provider: activeProvider }));
    setSelectedCloudFiles(prev => [...prev, ...newFiles]);
    toast({ title: "Files added", description: `Added ${files.length} file(s) from ${activeProvider} to selection` });
  };

  const resetForm = () => {
    setActiveTab("local_files");
    setConnectionStatus({ status: "idle" });
    setSelectedFiles([]);
    setSelectedCloudFiles([]);
  };

  const renderStatusIcon = () => {
    switch (connectionStatus.status) {
      case "connecting": return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "error": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Connect Data Source</DialogTitle>
          <DialogDescription>Connect to repositories, cloud storage, or upload local files</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConnectorType)} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local_files"><HardDrive className="w-4 h-4 mr-2" />Local Files</TabsTrigger>
            <TabsTrigger value="third_party"><Cloud className="w-4 h-4 mr-2" />Third Party</TabsTrigger>
          </TabsList>

          <TabsContent value="local_files" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="files">Select Files (max 100) - Documents, code, and config files</Label>
              <div className="rounded-xl p-10 text-center border border-border bg-card/60 hover:bg-card transition-colors">
                <FolderOpen className="w-12 h-12 mx-auto text-primary mb-6" />
                <input
                  id="files"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".docx,.txt,.md,.pdf,.rtf,.js,.ts,.jsx,.tsx,.py,.rs,.go,.java,.c,.cpp,.h,.hpp,.cs,.rb,.php,.json,.yml,.yaml,.toml,.xml,.csv"
                  title="Select .docx or .txt files to upload"
                  aria-label="Select .docx or .txt files to upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" className="mx-auto" onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
                <div className="mt-3 text-sm text-muted-foreground">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No files chosen'}
                </div>
              </div>
            </div>
          </TabsContent>

          

          <TabsContent value="third_party" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" title="Connect Google Drive" aria-label="Connect Google Drive" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-accent" onClick={() => handleThirdPartyConnect('google_drive')}>
                <Cloud className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-medium">Google Drive</span>
              </Button>
              <Button variant="outline" title="Connect Dropbox" aria-label="Connect Dropbox" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-accent" onClick={() => handleThirdPartyConnect('dropbox')}>
                <Droplets className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium">Dropbox</span>
              </Button>
              <Button variant="outline" title="Connect OneDrive" aria-label="Connect OneDrive" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-accent" onClick={() => handleThirdPartyConnect('onedrive')}>
                <Cloud className="w-8 h-8 text-blue-700" />
                <span className="text-sm font-medium">OneDrive</span>
              </Button>
              <Button variant="outline" title="Connect Notion" aria-label="Connect Notion" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-accent" onClick={() => handleThirdPartyConnect('notion')}>
                <BookOpen className="w-8 h-8 text-gray-700" />
                <span className="text-sm font-medium">Notion</span>
              </Button>
            </div>
            {needsSocialConnect && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  {`You need to connect ${needsSocialConnect === 'google_drive' ? 'Google Drive' : needsSocialConnect === 'onedrive' ? 'OneDrive' : needsSocialConnect === 'dropbox' ? 'Dropbox' : needsSocialConnect === 'notion' ? 'Notion' : needsSocialConnect} before proceeding.`}
                </p>
                <div className="mt-2">
                  <Button
                    title="Go to Social Connections"
                    aria-label="Go to Social Connections"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => { window.location.href = '/connections'; }}
                    disabled={checkingConnection}
                  >
                    Go to Social Connections
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Selected files summary shared across tabs */}
        {(selectedFiles.length > 0 || selectedCloudFiles.length > 0) && (
          <div className="mt-2 mb-2 p-3 border rounded-md bg-muted/30">
            <h4 className="text-sm font-semibold mb-2">Selected Files to Upload</h4>
            <div className="max-h-36 overflow-auto space-y-1">
              {selectedFiles.map((f, i) => (
                <div key={`local-${i}`} className="text-xs text-muted-foreground flex justify-between items-center group">
                  <span className="truncate pr-2">{f.name} (Local)</span>
                  <button 
                    onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} 
                    className="text-white hover:text-gray-200 bg-red-500 hover:bg-red-600 rounded-full transition-colors opacity-100 p-0.5"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedCloudFiles.map((f, i) => (
                <div key={`cloud-${i}`} className="text-xs text-muted-foreground flex justify-between items-center group">
                  <span className="truncate pr-2">{f.file.name} ({f.provider})</span>
                  <button 
                    onClick={() => setSelectedCloudFiles(prev => prev.filter((_, idx) => idx !== i))} 
                    className="text-white hover:text-gray-200 bg-red-500 hover:bg-red-600 rounded-full transition-colors opacity-100 p-0.5"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {connectionStatus.status !== "idle" && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md mb-2">{renderStatusIcon()}<span className="text-sm">{connectionStatus.message}</span></div>
        )}
        {isTesting && (selectedFiles.length + selectedCloudFiles.length > 5) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md mb-2 border border-red-200">
            <span className="text-sm font-medium">Max. limit reached (5 documents)</span>
          </div>
        )}
        <Button onClick={handleUploadSelected} disabled={connectionStatus.status === "connecting" || (selectedFiles.length === 0 && selectedCloudFiles.length === 0) || (isTesting && (selectedFiles.length + selectedCloudFiles.length > 5))} className="w-full">
          {connectionStatus.status === "connecting" ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload Selected ({selectedFiles.length + selectedCloudFiles.length})</>)}
        </Button>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            <strong>Local Files:</strong> Upload documents directly from your computer.<br/>
            <strong>Third Party:</strong> Connect to cloud storage and document platforms for seamless access.
          </p>
        </div>
      </DialogContent>
      {browserOpen && (
        <CloudFileBrowser
          open={browserOpen}
          onOpenChange={setBrowserOpen}
          provider={activeProvider}
          onFilesSelected={handleFilesSelected}
        />
      )}
    </Dialog>
  );
}
