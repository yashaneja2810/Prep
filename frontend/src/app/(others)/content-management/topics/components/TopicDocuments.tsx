import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Document,
  createDocument,
  getDocumentsByTopicId,
  updateDocument,
} from "@/lib/api/documents";

interface TopicDocumentsProps {
  topicId?: string;
  isEditMode?: boolean;
}

export function TopicDocuments({
  topicId,
  isEditMode = false
}: TopicDocumentsProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  
  // Load existing document for this topic
  useEffect(() => {
    if (topicId) {
      loadDocument();
    }
  }, [topicId]);
  
  const loadDocument = async () => {
    if (!topicId) return;
    
    setLoading(true);
    try {
      const docs = await getDocumentsByTopicId(topicId);
      if (docs && docs.length > 0) {
        setDocument(docs[0]);
        setDocumentContent(docs[0].content);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveDocument = async () => {
    if (!topicId) {
      toast.error("Please save the topic first to add a document");
      return;
    }
    
    if (!documentContent.trim()) {
      toast.error("Document content is required");
      return;
    }
    
    setSaving(true);
    try {
      if (document) {
        // Update existing document
        const updatedDoc = await updateDocument(document.id, {
          content: documentContent
        });
        setDocument(updatedDoc);
        toast.success("Document updated successfully");
      } else {
        // Create new document
        const newDoc = await createDocument({
          topic_id: topicId,
          content: documentContent
        });
        setDocument(newDoc);
        toast.success("Document created successfully");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };
  
  if (!topicId && !isEditMode) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Document</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please save the basic topic information first to add a document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Topic Document</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add detailed content for this topic.
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              {document ? "Edit Document" : "Add Document"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentContent">Content</Label>
                  <Textarea
                    id="documentContent"
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    placeholder="Enter document content..."
                    className="min-h-[400px] font-mono"
                    disabled={saving}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={handleSaveDocument}
                    disabled={saving || !documentContent.trim()}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {document ? "Update Document" : "Save Document"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 