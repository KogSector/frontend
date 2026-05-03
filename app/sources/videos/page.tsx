"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold text-foreground">Videos</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProfileAvatar />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Add Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You can add YouTube links or upload local video files to include as learning resources. Video ingestion and processing will be available shortly.</p>
            <div className="flex gap-3">
              <Button variant="outline">Add YouTube URL</Button>
              <Button>Add Local Video</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
