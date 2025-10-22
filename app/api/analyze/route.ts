import { NextRequest, NextResponse } from 'next/server';

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

interface AnalysisRequest {
  urls: string[];
  useAdvancedInference: boolean;
}

interface AnalysisResponse {
  datasets: DatasetResult[];
  domainDetected: boolean;
  processingTime: string;
}

// Domain detection based on URL patterns
function detectDomain(url: string): { domain: string; confidence: number } {
  const urlLower = url.toLowerCase();

  const patterns = {
    healthcare: ['patient', 'medical', 'diagnos', 'healthcare', 'encounter', 'clinic', 'hospital', 'doctor'],
    financial: ['transaction', 'payment', 'account', 'financial', 'bank', 'credit', 'invoice', 'billing'],
    retail: ['product', 'customer', 'order', 'retail', 'inventory', 'purchase', 'cart', 'catalog'],
  };

  for (const [domain, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (urlLower.includes(keyword)) {
        return { domain, confidence: 0.85 + Math.random() * 0.1 }; // 85-95% confidence
      }
    }
  }

  return { domain: 'general', confidence: 1.0 };
}

// Generate mock dataset based on domain
function generateMockDataset(url: string, useAdvancedInference: boolean): DatasetResult {
  const { domain, confidence } = detectDomain(url);
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  const datasetName = pathParts[pathParts.length - 1] || 'dataset';

  let columns: Column[] = [];
  let insights: string[] = [];
  let complianceRequirements: string[] = [];

  if (domain === 'healthcare') {
    if (useAdvancedInference) {
      columns = [
        {
          name: 'patient_id',
          type: 'string',
          nullable: false,
          semantic: 'identifier',
          pii: true,
          compliance: 'HIPAA',
        },
        {
          name: 'first_name',
          type: 'string',
          nullable: false,
          semantic: 'name',
          pii: true,
          compliance: 'HIPAA',
        },
        {
          name: 'last_name',
          type: 'string',
          nullable: false,
          semantic: 'name',
          pii: true,
          compliance: 'HIPAA',
        },
        {
          name: 'date_of_birth',
          type: 'date',
          nullable: false,
          semantic: 'temporal',
          pii: true,
          compliance: 'HIPAA',
        },
        {
          name: 'diagnosis_code',
          type: 'string',
          nullable: true,
          semantic: 'medical_code',
          compliance: 'HIPAA',
        },
        {
          name: 'encounter_date',
          type: 'timestamp',
          nullable: false,
          semantic: 'temporal',
        },
        {
          name: 'provider_id',
          type: 'string',
          nullable: false,
          semantic: 'identifier',
        },
        {
          name: 'insurance_number',
          type: 'string',
          nullable: true,
          semantic: 'identifier',
          pii: true,
          compliance: 'HIPAA',
        },
      ];

      insights = [
        'Dataset contains Protected Health Information (PHI) requiring HIPAA compliance',
        'Multiple PII fields detected - implement encryption at rest and in transit',
        'Consider implementing role-based access control (RBAC) for sensitive fields',
        'Diagnosis codes should be validated against ICD-10 or SNOMED-CT standards',
        'Encounter dates suggest temporal analysis capabilities for patient care tracking',
      ];

      complianceRequirements = ['HIPAA', 'PHI Protection'];
    } else {
      columns = [
        { name: 'col_1', type: 'string', nullable: false },
        { name: 'col_2', type: 'string', nullable: false },
        { name: 'col_3', type: 'string', nullable: false },
        { name: 'col_4', type: 'date', nullable: false },
        { name: 'col_5', type: 'string', nullable: true },
        { name: 'col_6', type: 'timestamp', nullable: false },
        { name: 'col_7', type: 'string', nullable: false },
        { name: 'col_8', type: 'string', nullable: true },
      ];
    }
  } else if (domain === 'financial') {
    if (useAdvancedInference) {
      columns = [
        {
          name: 'transaction_id',
          type: 'string',
          nullable: false,
          semantic: 'identifier',
        },
        {
          name: 'account_number',
          type: 'string',
          nullable: false,
          semantic: 'account_id',
          pii: true,
          compliance: 'PCI-DSS',
        },
        {
          name: 'card_number_last4',
          type: 'string',
          nullable: true,
          semantic: 'payment_card',
          compliance: 'PCI-DSS',
          validation: 'regex:^\\d{4}$',
        },
        {
          name: 'amount',
          type: 'decimal',
          nullable: false,
          semantic: 'currency',
          validation: 'min:0',
        },
        {
          name: 'currency',
          type: 'string',
          nullable: false,
          semantic: 'currency_code',
          validation: 'enum:USD,EUR,GBP',
        },
        {
          name: 'transaction_date',
          type: 'timestamp',
          nullable: false,
          semantic: 'temporal',
        },
        {
          name: 'merchant_id',
          type: 'string',
          nullable: false,
          semantic: 'identifier',
        },
        {
          name: 'status',
          type: 'string',
          nullable: false,
          semantic: 'enum',
          validation: 'enum:pending,completed,failed,refunded',
        },
      ];

      insights = [
        'Dataset contains payment card data requiring PCI-DSS compliance',
        'Card numbers are properly masked (last 4 digits only) - good security practice',
        'Transaction amounts should be validated for reasonable ranges based on business rules',
        'Currency field enables multi-currency transaction support',
        'Consider implementing fraud detection based on transaction patterns',
        'Status field suggests workflow tracking - ensure proper audit logging',
      ];

      complianceRequirements = ['PCI-DSS', 'Financial Data Protection'];
    } else {
      columns = [
        { name: 'col_1', type: 'string', nullable: false },
        { name: 'col_2', type: 'string', nullable: false },
        { name: 'col_3', type: 'string', nullable: true },
        { name: 'col_4', type: 'decimal', nullable: false },
        { name: 'col_5', type: 'string', nullable: false },
        { name: 'col_6', type: 'timestamp', nullable: false },
        { name: 'col_7', type: 'string', nullable: false },
        { name: 'col_8', type: 'string', nullable: false },
      ];
    }
  } else if (domain === 'retail') {
    if (useAdvancedInference) {
      columns = [
        {
          name: 'product_id',
          type: 'string',
          nullable: false,
          semantic: 'identifier',
        },
        {
          name: 'sku',
          type: 'string',
          nullable: false,
          semantic: 'product_code',
          validation: 'unique',
        },
        {
          name: 'product_name',
          type: 'string',
          nullable: false,
          semantic: 'text',
        },
        {
          name: 'category',
          type: 'string',
          nullable: false,
          semantic: 'category',
        },
        {
          name: 'price',
          type: 'decimal',
          nullable: false,
          semantic: 'currency',
          validation: 'min:0',
        },
        {
          name: 'inventory_count',
          type: 'integer',
          nullable: false,
          semantic: 'quantity',
          validation: 'min:0',
        },
        {
          name: 'supplier_id',
          type: 'string',
          nullable: true,
          semantic: 'identifier',
        },
        {
          name: 'last_updated',
          type: 'timestamp',
          nullable: false,
          semantic: 'temporal',
        },
      ];

      insights = [
        'Product catalog structure detected with inventory management capabilities',
        'SKU field should be unique across all products for proper identification',
        'Price validation ensures no negative values - good data quality practice',
        'Inventory count enables real-time stock level tracking',
        'Category field suggests hierarchical product organization capability',
        'Last updated timestamp allows for change tracking and cache invalidation',
      ];

      complianceRequirements = [];
    } else {
      columns = [
        { name: 'col_1', type: 'string', nullable: false },
        { name: 'col_2', type: 'string', nullable: false },
        { name: 'col_3', type: 'string', nullable: false },
        { name: 'col_4', type: 'string', nullable: false },
        { name: 'col_5', type: 'decimal', nullable: false },
        { name: 'col_6', type: 'integer', nullable: false },
        { name: 'col_7', type: 'string', nullable: true },
        { name: 'col_8', type: 'timestamp', nullable: false },
      ];
    }
  } else {
    // General domain
    if (useAdvancedInference) {
      columns = [
        {
          name: 'id',
          type: 'integer',
          nullable: false,
          semantic: 'identifier',
        },
        {
          name: 'name',
          type: 'string',
          nullable: false,
          semantic: 'text',
        },
        {
          name: 'description',
          type: 'text',
          nullable: true,
          semantic: 'text',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          nullable: false,
          semantic: 'temporal',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          nullable: false,
          semantic: 'temporal',
        },
      ];

      insights = [
        'Standard entity structure with creation and update timestamps',
        'Auto-incrementing ID field suggests relational database backend',
        'Timestamp fields enable audit trail and change tracking',
      ];
    } else {
      columns = [
        { name: 'col_1', type: 'integer', nullable: false },
        { name: 'col_2', type: 'string', nullable: false },
        { name: 'col_3', type: 'text', nullable: true },
        { name: 'col_4', type: 'timestamp', nullable: false },
        { name: 'col_5', type: 'timestamp', nullable: false },
      ];
    }
  }

  // Generate random record count
  const recordCount = Math.floor(Math.random() * 900000) + 100000; // 100k-1M records

  return {
    url,
    name: datasetName
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    domain: domain.charAt(0).toUpperCase() + domain.slice(1),
    confidence,
    columns,
    insights,
    recordCount,
    complianceRequirements: complianceRequirements.length > 0 ? complianceRequirements : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { urls, useAdvancedInference } = body;

    // Validate request
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Invalid request: urls array is required' }, { status: 400 });
    }

    if (urls.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 endpoints allowed per batch' }, { status: 400 });
    }

    // Validate URLs
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: `Invalid URL: ${url}` }, { status: 400 });
      }
    }

    const startTime = Date.now();

    // Simulate processing time based on inference mode
    const processingTimePerUrl = useAdvancedInference ? 1100 : 600; // ms
    const totalProcessingTime = urls.length * processingTimePerUrl;

    // Simulate async processing
    await new Promise((resolve) => setTimeout(resolve, Math.min(totalProcessingTime, 3000)));

    // Generate mock datasets
    const datasets: DatasetResult[] = urls.map((url) => generateMockDataset(url, useAdvancedInference));

    const endTime = Date.now();
    const actualProcessingTime = ((endTime - startTime) / 1000).toFixed(1);

    const response: AnalysisResponse = {
      datasets,
      domainDetected: datasets.some((d) => d.domain !== 'General'),
      processingTime: `${actualProcessingTime}s`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'An error occurred during analysis' },
      { status: 500 }
    );
  }
}
