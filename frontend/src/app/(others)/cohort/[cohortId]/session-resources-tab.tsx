"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Film, Code, FileImage, File, Loader2, ExternalLink, Upload, X, Link2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  getSessionResources,
  addSessionResource,
  updateSessionResource,
  deleteSessionResource,
  uploadSessionResourceFile,
  SessionResource,
  SessionResourceDto
} from "@/lib/api/cohort-sessions";
import { getCohortSessions, CohortSession } from "@/lib/api/cohort-sessions";

interface SessionResourcesTabProps {
  cohortId: string;
}

export function SessionResourcesTab({ cohortId }: SessionResourcesTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<CohortSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [resources, setResources] = useState<SessionResource[]>([]);
  const [activeTab, setActiveTab] = useState<string>("view");
  
  // Form state for uploading resources
  const [resourceType, setResourceType] = useState<'video' | 'document' | 'code' | 'image' | 'other'>('document');
  const [externalLink, setExternalLink] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching sessions for cohort ID: ${cohortId}`);
        const sessionsData = await getCohortSessions(cohortId);
        console.log(`Sessions fetched for cohort ${cohortId}:`, sessionsData);
        setSessions(sessionsData);
        
        // Select the first session by default
        if (sessionsData.length > 0 && !selectedSessionId) {
          console.log(`Selecting first session by default: ${sessionsData[0].id}`);
          setSelectedSessionId(sessionsData[0].id);
        } else if (sessionsData.length === 0) {
          console.log('No sessions available for this cohort');
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to fetch sessions");
      } finally {
        setIsLoading(false);
      }
    };

    if (cohortId) {
      fetchSessions();
    }
  }, [cohortId]);

  // Fetch resources when session is selected
  useEffect(() => {
    const fetchResources = async () => {
      if (!selectedSessionId) return;
      
      try {
        setIsLoading(true);
        console.log(`Fetching resources for session ID: ${selectedSessionId}`);
        const resourcesData = await getSessionResources(selectedSessionId);
        console.log(`Resources fetched for session ${selectedSessionId}:`, resourcesData);
        setResources(resourcesData || []);
        
        if (resourcesData.length === 0) {
          console.log('No resources available for this session');
        }
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to fetch session resources");
        setResources([]); // Set empty array on error to prevent undefined errors
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedSessionId) {
      fetchResources();
    }
  }, [selectedSessionId]);

  // Handle session change
  const handleSessionChange = (sessionId: string) => {
    console.log(`Changing selected session to: ${sessionId}`);
    setSelectedSessionId(sessionId);
  };

  // Handle resource upload
  const handleResourceUpload = async () => {
    if (!selectedSessionId) {
      toast.error("Please select a session first");
      return;
    }

    // Check if either file or external link is provided
    if (!selectedFile && !externalLink) {
      toast.error("Please provide either a file or an external link");
      return;
    }

    try {
      setIsUploading(true);
      console.log(`Uploading resource for session ${selectedSessionId}, type: ${resourceType}`);
      
      let result = null;
      
      // If a file is selected, use the direct file upload method
      if (selectedFile) {
        console.log(`Uploading file: ${selectedFile.name}, size: ${selectedFile.size}, type: ${resourceType}`);
        result = await uploadSessionResourceFile(
          selectedSessionId,
          selectedFile,
          resourceType,
          externalLink || undefined
        );
      } else {
        // Otherwise, just add the external link
        console.log(`Adding external link resource, type: ${resourceType}, link: ${externalLink}`);
        const resourceData: SessionResourceDto = {
          resource_type: resourceType,
          external_link: externalLink || undefined
        };
        
        result = await addSessionResource(selectedSessionId, resourceData);
      }
      
      console.log("Upload result:", result);
      
      if (result) {
        toast.success("Resource uploaded successfully");
        
        // Reset form
        setResourceType('document');
        setExternalLink("");
        setSelectedFile(null);
        
        // Refresh resources list
        const updatedResources = await getSessionResources(selectedSessionId);
        setResources(updatedResources);
        
        // Switch to view tab
        setActiveTab("view");
      } else {
        toast.error("Failed to upload resource");
      }
    } catch (err) {
      console.error("Error uploading resource:", err);
      toast.error("An error occurred while uploading the resource");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle resource deletion
  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      setIsLoading(true);
      const success = await deleteSessionResource(selectedSessionId, resourceId);
      
      if (success) {
        toast.success("Resource deleted successfully");
        // Remove the resource from the list
        setResources(resources.filter(r => r.id !== resourceId));
      } else {
        toast.error("Failed to delete resource");
      }
    } catch (err) {
      console.error("Error deleting resource:", err);
      toast.error("An error occurred while deleting the resource");
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      case 'image':
        return <FileImage className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Session Resources</h2>
            <p className="text-muted-foreground">View and share resources for cohort sessions</p>
          </div>
          
          {sessions.length > 0 && (
            <div className="w-full md:w-64">
              <Select 
                value={selectedSessionId} 
                onValueChange={handleSessionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.title} ({new Date(session.session_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 text-center">
                  {error}. Please try refreshing the page.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !selectedSessionId ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <File className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Please select a session to view or upload resources
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-end mb-4">
              <TabsList>
                <TabsTrigger value="view">View Resources</TabsTrigger>
                <TabsTrigger value="upload">Upload Resources</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="view">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : resources.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12">
                      <File className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        No resources available for this session
                      </p>
                      <Button 
                        onClick={() => setActiveTab("upload")} 
                        variant="outline" 
                        className="mt-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resources
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {getResourceIcon(resource.resource_type)}
                            <CardTitle className="ml-2 text-lg">
                              {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                            </CardTitle>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>
                          Added on {new Date(resource.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {resource.file_url && (
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                              <a 
                                href={resource.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate"
                              >
                                Uploaded File
                              </a>
                            </div>
                          )}
                          
                          {resource.external_link && (
                            <div className="flex items-center">
                              <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                              <a 
                                href={resource.external_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate"
                              >
                                {resource.external_link}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Resource</CardTitle>
                  <CardDescription>
                    Share learning materials with your cohort
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource-type">Resource Type</Label>
                      <Select 
                        value={resourceType} 
                        onValueChange={(value) => setResourceType(value as any)}
                      >
                        <SelectTrigger id="resource-type">
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="external-link">External Link (Optional)</Label>
                      <div className="flex items-center space-x-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="external-link"
                          placeholder="https://example.com/resource"
                          value={externalLink}
                          onChange={(e) => setExternalLink(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add a link to YouTube, Google Docs, GitHub, or other external resources
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Upload File (Optional)</Label>
                      <div className="flex items-center justify-center w-full">
                        <label 
                          htmlFor="file-upload" 
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              {selectedFile 
                                ? `Selected: ${selectedFile.name}` 
                                : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Any file type supported (up to 50MB)
                            </p>
                          </div>
                          <input 
                            id="file-upload" 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleResourceUpload} disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Resource
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
} 