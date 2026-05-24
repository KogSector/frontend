"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Loader2, File, Folder, ChevronRight, ArrowLeft } from "lucide-react";
import { dataApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface CloudFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  size?: number;
  mime_type?: string;
  last_modified?: string;
}

interface CloudFileBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string;
  onFilesSelected: (files: CloudFile[]) => void;
}

export function CloudFileBrowser({ open, onOpenChange, provider, onFilesSelected }: CloudFileBrowserProps) {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pathStack, setPathStack] = useState<{ id: string; name: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const currentFolderId = pathStack.length > 0 ? pathStack[pathStack.length - 1].id : "";

  useEffect(() => {
    if (open) {
      fetchFiles(currentFolderId);
    }
  }, [open, currentFolderId]);

  const fetchFiles = async (folderId: string) => {
    setLoading(true);
    try {
      const response = await dataApiClient.get<{ data: CloudFile[] }>(`/api/v1/external/browse/${provider}?path=${folderId}`);
      if (response && (response as any).data) {
        setFiles((response as any).data);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast({
        title: "Error",
        description: "Failed to load files from " + provider,
        variant: "destructive"
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (folder: CloudFile) => {
    setPathStack([...pathStack, { id: folder.id, name: folder.name }]);
  };

  const handleGoBack = () => {
    if (pathStack.length > 0) {
      setPathStack(pathStack.slice(0, -1));
    }
  };

  const handleToggleSelect = (file: CloudFile) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      newSelected.add(file.id);
    }
    setSelectedIds(newSelected);
  };

  const handleSubmit = () => {
    const selectedFiles = Array.from(selectedIds).map(id => {
      // Try to find the file in current view, otherwise we just pass the ID
      const file = files.find(f => f.id === id);
      return file || { id, name: "Unknown", path: "", type: "file" };
    }) as CloudFile[];
    onFilesSelected(selectedFiles);
    onOpenChange(false);
    // Reset state for next open
    setPathStack([]);
    setSelectedIds(new Set());
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="capitalize">Browse {provider.replace("_", " ")}</DialogTitle>
          <DialogDescription>
            Select the files and folders you want to sync.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-2 border-b">
          {pathStack.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="px-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <span className="px-2 font-medium">Root</span>
          )}
          {pathStack.map((crumb, idx) => (
            <div key={idx} className="flex items-center text-sm text-muted-foreground">
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className={idx === pathStack.length - 1 ? "font-medium text-foreground" : ""}>
                {crumb.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-hidden min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : null}
          
          <ScrollArea className="h-full border rounded-md">
            {files.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No files found
              </div>
            ) : (
              <div className="divide-y">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3 overflow-hidden flex-1">
                      <Checkbox 
                        checked={selectedIds.has(file.id)}
                        onCheckedChange={() => handleToggleSelect(file)}
                        className="mr-2"
                      />
                      {file.type === "folder" ? (
                        <div 
                          className="flex items-center space-x-2 flex-1 cursor-pointer"
                          onClick={() => handleNavigate(file)}
                        >
                          <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <span className="truncate hover:underline">{file.name}</span>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center space-x-2 flex-1 cursor-pointer"
                          onClick={() => handleToggleSelect(file)}
                        >
                          <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                      )}
                    </div>
                    {file.size !== undefined && (
                      <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                        {formatSize(file.size)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} item(s) selected
            </span>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={selectedIds.size === 0}>
                Sync Selected
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
