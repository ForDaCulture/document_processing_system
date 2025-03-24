import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";
import { Document, ExtractedData, AISuggestionResponse } from "../../shared/schema";

const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch("/api/documents");
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
};

const fetchDocumentData = async (id: string): Promise<ExtractedData> => {
  const response = await fetch(`/api/documents/${id}/data`);
  if (!response.ok) throw new Error("Failed to fetch document data");
  return response.json();
};

const fetchSuggestions = async (id: string): Promise<AISuggestionResponse> => {
  const response = await fetch(`/api/documents/${id}/suggestions`);
  if (!response.ok) throw new Error("Failed to fetch suggestions");
  return response.json();
};

export default function Dashboard() {
  const { data: documents, isLoading, error } = useQuery(["documents"], fetchDocuments);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: docData, isLoading: dataLoading } = useQuery(
    ["documentData", selectedDocId],
    () => fetchDocumentData(selectedDocId!),
    { enabled: !!selectedDocId }
  );

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery(
    ["suggestions", selectedDocId],
    () => fetchSuggestions(selectedDocId!),
    { enabled: !!selectedDocId }
  );

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("document", file);
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Document uploaded successfully", type: "success" });
      queryClient.invalidateQueries(["documents"]);
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, type: "error" });
    },
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/suggestions/generate`, { method: "POST" });
      if (!response.ok) throw new Error("Suggestion generation failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Suggestions generated successfully", type: "success" });
      queryClient.invalidateQueries(["suggestions", selectedDocId]);
    },
    onError: (error: Error) => {
      toast({ title: "Suggestion generation failed", description: error.message, type: "error" });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Document Processing Dashboard</h1>
      <div className="mb-6">
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <Button
          onClick={() => uploadFile && uploadMutation.mutate(uploadFile)}
          disabled={!uploadFile || uploadMutation.isLoading}
        >
          {uploadMutation.isLoading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents?.map((doc) => (
          <Card key={doc.id} onClick={() => setSelectedDocId(doc.id)}>
            <h2>{doc.name}</h2>
            <p>Status: {doc.status}</p>
            <p>Confidence: {doc.confidence}%</p>
          </Card>
        ))}
      </div>
      {selectedDocId && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Document Details</h2>
          {dataLoading ? (
            <div>Loading data...</div>
          ) : docData ? (
            <div>
              <pre>{JSON.stringify(docData, null, 2)}</pre>
              <Button
                onClick={() => generateSuggestionsMutation.mutate(selectedDocId)}
                disabled={suggestionsLoading}
              >
                {suggestionsLoading ? "Generating..." : "Generate Suggestions"}
              </Button>
              {suggestionsLoading ? (
                <div>Loading suggestions...</div>
              ) : suggestions ? (
                <div>
                  <h3 className="text-lg font-bold">Suggestions</h3>
                  <pre>{JSON.stringify(suggestions, null, 2)}</pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}