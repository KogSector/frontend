'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoId?: string;
  directUrl?: string;
}

export function DemoModal({
  isOpen,
  onClose,
  demoId = 'cms0k8e4l6sgnqmblhhsfjfya',
  directUrl = 'https://app.supademo.com/demo/cms0k8e4l6sgnqmblhhsfjfya?utm_source=link',
}: DemoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  const embedUrl = `https://app.supademo.com/embed/${demoId}?embed_v=2`;

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, key]);

  const handleRetry = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl sm:max-w-5xl w-[95vw] p-4 sm:p-6 bg-background/95 backdrop-blur-md border-border text-foreground overflow-hidden">
        <DialogHeader className="mb-3 space-y-1">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Interactive Product Demo
            </DialogTitle>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors gap-1"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Step through the interactive walkthrough below to see how our platform works.
          </DialogDescription>
        </DialogHeader>

        {/* Demo Iframe Container with 16:9 Aspect Ratio */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/40 border border-border flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Loading interactive demo...
              </p>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md z-20">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Unable to embed demo preview</h4>
                <p className="text-xs text-muted-foreground">
                  Your browser configuration or ad blocker may be preventing the iframe from loading.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </Button>
                <Button
                  size="sm"
                  asChild
                >
                  <a href={directUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    Open Demo Directly
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              key={key}
              src={embedUrl}
              title="Supademo Interactive Product Walkthrough"
              className="w-full h-full border-0"
              allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
