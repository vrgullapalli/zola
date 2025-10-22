'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface URLField {
  id: number;
  url: string;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  semantic?: string;
  compliance?: string;
  pii?: boolean;
  validation?: string;
}

interface DatasetResult {
  url: string;
  name: string;
  domain: string;
  confidence: number;
  columns: Column[];
  insights: string[];
  recordCount: number;
  complianceRequirements?: string[];
}

interface AnalysisResponse {
  datasets: DatasetResult[];
  domainDetected: boolean;
  processingTime: string;
}

export default function BatchAnalysisPage() {
  const [urlFields, setUrlFields] = useState<URLField[]>([{ id: 1, url: '' }]);
  const [useAdvancedInference, setUseAdvancedInference] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load advanced inference preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('useAdvancedInference');
    if (saved !== null) {
      setUseAdvancedInference(JSON.parse(saved));
    }
  }, []);

  // Save advanced inference preference to localStorage
  const handleToggleInference = (checked: boolean) => {
    setUseAdvancedInference(checked);
    localStorage.setItem('useAdvancedInference', JSON.stringify(checked));
  };

  const addUrlField = () => {
    const newId = Math.max(...urlFields.map((f) => f.id), 0) + 1;
    setUrlFields([...urlFields, { id: newId, url: '' }]);
  };

  const removeUrlField = (id: number) => {
    if (urlFields.length > 1) {
      setUrlFields(urlFields.filter((field) => field.id !== id));
    }
  };

  const updateUrlField = (id: number, url: string) => {
    setUrlFields(urlFields.map((field) => (field.id === id ? { ...field, url } : field)));
  };

  const clearAll = () => {
    setUrlFields([{ id: 1, url: '' }]);
    setResults(null);
    setError(null);
  };

  const analyzeDatasets = async () => {
    setError(null);
    setResults(null);

    // Validate URLs
    const validUrls = urlFields
      .map((field) => field.url.trim())
      .filter((url) => url.length > 0);

    if (validUrls.length === 0) {
      setError('Please enter at least one URL');
      return;
    }

    // Validate URL format
    const invalidUrls = validUrls.filter((url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:';
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      setError('Please enter valid URLs with http:// or https:// protocol');
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: validUrls,
          useAdvancedInference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data: AnalysisResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'healthcare':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'financial':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'retail':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    // Full viewport container with fixed positioning to avoid sidebar conflicts
    <div className="fixed inset-0 overflow-auto bg-gradient-to-b from-background to-muted/20">
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <Database className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold tracking-tight">Batch Dataset Analysis</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Analyze multiple dataset API endpoints simultaneously with automated schema detection
          </p>
        </div>

        {/* Feature Flag Card */}
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>Context-Aware Inference</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    BETA
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Enable advanced domain detection, compliance analysis, and intelligent metadata inference
                </CardDescription>
              </div>
              <Switch
                checked={useAdvancedInference}
                onCheckedChange={handleToggleInference}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </CardHeader>
          {useAdvancedInference && (
            <CardContent className="space-y-2 border-t pt-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Domain Detection (Healthcare, Financial, Retail)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Compliance Requirements (HIPAA, PCI-DSS)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>PII/PHI Identification</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span>Actionable Insights & Recommendations</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* URL Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Endpoints</CardTitle>
            <CardDescription>
              Enter API endpoint URLs to analyze. Maximum 20 endpoints per batch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {urlFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/v1/data"
                    value={field.url}
                    onChange={(e) => updateUrlField(field.id, e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUrlField(field.id)}
                    disabled={urlFields.length === 1}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addUrlField}
                disabled={urlFields.length >= 20}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Endpoint
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            <Button onClick={analyzeDatasets} disabled={isAnalyzing} className="w-full" size="lg">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Datasets'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <Badge variant="secondary" className="text-sm">
                Processed in {results.processingTime}
              </Badge>
            </div>

            {results.datasets.map((dataset, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{dataset.name}</CardTitle>
                      <Badge className={getDomainColor(dataset.domain)} variant="outline">
                        {dataset.domain}
                        {dataset.confidence && ` (${Math.round(dataset.confidence * 100)}%)`}
                      </Badge>
                    </div>
                    <CardDescription className="break-all font-mono text-xs">
                      {dataset.url}
                    </CardDescription>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{dataset.recordCount.toLocaleString()} records</span>
                      <span>•</span>
                      <span>{dataset.columns.length} columns</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Compliance Requirements */}
                  {dataset.complianceRequirements && dataset.complianceRequirements.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Compliance Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {dataset.complianceRequirements.map((req, i) => (
                          <Badge key={i} variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schema */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold">Schema</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="pb-2 pr-4 text-left font-medium">Column Name</th>
                            <th className="pb-2 pr-4 text-left font-medium">Type</th>
                            <th className="pb-2 pr-4 text-left font-medium">Nullable</th>
                            {useAdvancedInference && (
                              <>
                                <th className="pb-2 pr-4 text-left font-medium">Semantic Type</th>
                                <th className="pb-2 pr-4 text-left font-medium">Tags</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {dataset.columns.map((col, colIdx) => (
                            <tr key={colIdx} className="border-b border-muted">
                              <td className="py-2 pr-4 font-mono">{col.name}</td>
                              <td className="py-2 pr-4">
                                <Badge variant="secondary" className="text-xs">
                                  {col.type}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4">{col.nullable ? 'Yes' : 'No'}</td>
                              {useAdvancedInference && (
                                <>
                                  <td className="py-2 pr-4 text-muted-foreground">{col.semantic || '-'}</td>
                                  <td className="py-2 pr-4">
                                    <div className="flex flex-wrap gap-1">
                                      {col.pii && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                          PII
                                        </Badge>
                                      )}
                                      {col.compliance && (
                                        <Badge variant="outline" className="text-xs">
                                          {col.compliance}
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Insights */}
                  {dataset.insights && dataset.insights.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Insights & Recommendations</h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {dataset.insights.map((insight, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
