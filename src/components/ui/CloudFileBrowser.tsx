"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Loader2, File, Folder, ChevronRight, ArrowLeft, FileText, FileSpreadsheet, Image as ImageIcon, FileCode, FileArchive, Search } from "lucide-react";
import { dataApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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

const getFileIcon = (mimeType?: string, fileName?: string) => {
  const name = (fileName || "").toLowerCase();

  if (name.endsWith(".pdf") || mimeType?.includes("pdf")) return <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />;
  if (name.endsWith(".xlsx") || name.endsWith(".csv") || mimeType?.includes("spreadsheet") || mimeType?.includes("excel") || mimeType?.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0" />;
  if (name.endsWith(".docx") || name.endsWith(".doc") || mimeType?.includes("word")) return <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />;
  if (mimeType?.startsWith("image/") || name.match(/\.(jpg|jpeg|png|gif|svg)$/)) return <ImageIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />;
  if (name.match(/\.(zip|tar|gz|rar)$/)) return <FileArchive className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
  if (name.match(/\.(js|ts|py|java|cpp|html|css|json)$/)) return <FileCode className="w-5 h-5 text-slate-600 flex-shrink-0" />;

  return <File className="w-5 h-5 text-gray-400 flex-shrink-0" />;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export function CloudFileBrowser({ open, onOpenChange, provider, onFilesSelected }: CloudFileBrowserProps) {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pathStack, setPathStack] = useState<{ id: string; name: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
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
      const errorMessage = error instanceof Error ? error.message : "Failed to load files from " + provider;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (folder: CloudFile) => {
    setPathStack([...pathStack, { id: folder.id, name: folder.name }]);
    setSearchQuery("");
  };

  const handleGoBack = () => {
    if (pathStack.length > 0) {
      setPathStack(pathStack.slice(0, -1));
      setSearchQuery("");
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

  const isSelectable = (file: CloudFile) => {
    if (provider === 'onedrive' && file.type === 'folder') return false;
    return true;
  };

  const handleSelectAll = () => {
    const selectableFiles = filteredFiles.filter(isSelectable);
    if (selectedIds.size === selectableFiles.length && selectableFiles.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set<string>();
      selectableFiles.forEach(f => newSelected.add(f.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSubmit = () => {
    const selectedFiles = Array.from(selectedIds).map(id => {
      const file = files.find(f => f.id === id);
      return file || { id, name: "Unknown", path: "", type: "file" };
    }) as CloudFile[];
    onFilesSelected(selectedFiles);
    onOpenChange(false);
    setPathStack([]);
    setSelectedIds(new Set());
    setSearchQuery("");
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "--";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const ALLOWED_EXTENSIONS = [
    '.md', '.doc', '.docx', '.txt', '.pdf',
    '.rtf', '.csv', '.xls', '.xlsx', '.ppt', '.pptx'
  ];

  const isAllowedDocument = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    return ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Always show folders for navigation
    if (f.type === "folder") return true;

    // For files, only show allowed documents
    return isAllowedDocument(f.name);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="capitalize text-xl flex items-center gap-2">
              <span className="bg-primary/10 p-2 rounded-md">
                <Folder className="w-5 h-5 text-primary" />
              </span>
              Browse {provider.replace("_", " ")}
            </DialogTitle>
            <DialogDescription>
              Select the files and folders you want to sync into your workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Toolbar & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b gap-3">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {pathStack.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleGoBack} className="px-2 h-8 hover:bg-background mr-1 shadow-sm border bg-background">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : null}

            <div className="flex items-center text-sm px-2 py-1.5 bg-background border rounded-md shadow-sm whitespace-nowrap">
              <span className="font-medium px-1 cursor-pointer hover:text-primary transition-colors" onClick={() => setPathStack([])}>Root</span>
              {pathStack.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-4 h-4 mx-0.5 text-muted-foreground" />
                  <span
                    className={`px-1 hover:text-primary cursor-pointer transition-colors ${idx === pathStack.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    onClick={() => setPathStack(pathStack.slice(0, idx + 1))}
                  >
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="h-9 pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* File List / Table */}
        <div className="flex-1 overflow-hidden min-h-0 relative bg-background">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10 transition-all duration-200">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Loading files...</span>
              </div>
            </div>
          )}

          <ScrollArea className="h-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase sticky top-0 z-0">
                <tr>
                  <th scope="col" className="p-3 w-10 text-center">
                    <Checkbox
                      checked={filteredFiles.filter(isSelectable).length > 0 && selectedIds.size === filteredFiles.filter(isSelectable).length}
                      onCheckedChange={handleSelectAll}
                      disabled={filteredFiles.filter(isSelectable).length === 0}
                    />
                  </th>
                  <th scope="col" className="p-3 font-medium">Name</th>
                  <th scope="col" className="p-3 font-medium w-32 hidden sm:table-cell">Modified</th>
                  <th scope="col" className="p-3 font-medium w-24 text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFiles.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Folder className="w-12 h-12 text-muted-foreground/30" />
                        <p>{searchQuery ? "No matching files found" : "This folder is empty"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      className={`hover:bg-muted/40 transition-colors group ${selectedIds.has(file.id) ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                    >
                      <td className="p-3 text-center">
                        {isSelectable(file) && (
                          <Checkbox
                            checked={selectedIds.has(file.id)}
                            onCheckedChange={() => handleToggleSelect(file)}
                            className={selectedIds.has(file.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"}
                          />
                        )}
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        {file.type === "folder" ? (
                          <div
                            className="flex items-center space-x-3 cursor-pointer group-hover:text-primary transition-colors w-max"
                            onClick={() => handleNavigate(file)}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
                            </div>
                            <span className="truncate">{file.name}</span>
                          </div>
                        ) : (
                          <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => handleToggleSelect(file)}
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              {getFileIcon(file.mime_type, file.name)}
                            </div>
                            <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">{file.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {formatDate(file.last_modified)}
                      </td>
                      <td className="p-3 text-muted-foreground text-right whitespace-nowrap">
                        {file.type === "folder" ? "--" : formatSize(file.size)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        <div className="p-4 border-t bg-muted/20">
          <DialogFooter>
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {selectedIds.size} item(s) selected
              </span>
              <div className="space-x-2 flex">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={selectedIds.size === 0} className="shadow-sm">
                  Add
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
