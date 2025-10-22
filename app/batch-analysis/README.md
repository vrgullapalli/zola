# Batch Dataset Analysis System

A comprehensive web-based application for analyzing multiple dataset API endpoints simultaneously with automated schema detection, domain-specific insights, and compliance requirements detection.

## Features

### Dynamic URL Field Management
- Add unlimited URL input fields (up to 20 per batch)
- Sequential numbering of fields
- Individual field removal with minimum of one field
- Clear all functionality to reset to single empty field
- Full URL validation with protocol checking

### Context-Aware Inference
Toggle between two analysis modes:

**Standard Inference (Fast)**
- Basic type detection (string, integer, decimal, date, timestamp, etc.)
- Generic column naming (col_1, col_2, etc.)
- Processing time: ~0.6s per endpoint

**Advanced Context-Aware Inference (Comprehensive)**
- Automatic domain detection (Healthcare, Financial, Retail, General)
- Semantic type identification
- Compliance requirement detection (HIPAA, PCI-DSS)
- PII/PHI identification and tagging
- Validation rules and recommendations
- Actionable insights based on domain
- Processing time: ~1.1s per endpoint

### Domain Detection

The system automatically detects dataset domains based on URL patterns:

**Healthcare Domain**
- Keywords: patient, medical, diagnos, healthcare, encounter, clinic, hospital, doctor
- Compliance: HIPAA, PHI Protection
- Special fields: patient_id, diagnosis_code, encounter_date, insurance_number

**Financial Domain**
- Keywords: transaction, payment, account, financial, bank, credit, invoice, billing
- Compliance: PCI-DSS, Financial Data Protection
- Special fields: account_number, card_number, transaction amounts, merchant data

**Retail Domain**
- Keywords: product, customer, order, retail, inventory, purchase, cart, catalog
- Special fields: product_id, sku, price, inventory_count, supplier_id

**General Domain**
- Default for unmatched patterns
- Standard entity structure with timestamps

## Usage

### Accessing the Feature

Navigate to `/batch-analysis` in your browser.

### Basic Workflow

1. **Add API Endpoints**
   - Enter dataset API URLs in the input fields
   - Click "Add Another Endpoint" to add more (up to 20)
   - Use the red X button to remove unwanted fields

2. **Configure Analysis Mode**
   - Toggle "Context-Aware Inference" switch for advanced analysis
   - The setting persists in browser localStorage
   - View active features when enabled (Beta badge shown)

3. **Analyze**
   - Click "Analyze Datasets" button
   - Wait for processing (progress indicator shown)
   - Results display below with domain-specific styling

### Example URLs for Testing

**Healthcare:**
```
https://api.example.com/v1/patient-records
https://api.healthcare.com/medical-encounters
```

**Financial:**
```
https://api.example.com/v1/transactions
https://api.payment.com/account-history
```

**Retail:**
```
https://api.example.com/v1/products
https://api.retail.com/customer-orders
```

## Results Display

### Result Cards

Each analyzed dataset displays:

- **Header**: Dataset name, domain badge with confidence score, URL, record count, column count
- **Compliance Requirements**: Badges for HIPAA, PCI-DSS, etc. (if applicable)
- **Schema Table**:
  - Column names
  - Data types
  - Nullable status
  - Semantic types (advanced mode)
  - Compliance tags and PII indicators (advanced mode)
- **Insights & Recommendations**: Actionable insights based on domain and structure

### Color Coding

- **Healthcare**: Red (bg-red-100, text-red-800)
- **Financial**: Green (bg-green-100, text-green-800)
- **Retail**: Purple (bg-purple-100, text-purple-800)
- **General**: Gray (bg-gray-100, text-gray-800)

## Technical Architecture

### Frontend
- **Framework**: React 18+ with Next.js 15 App Router
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS with utility-first approach
- **Icons**: Lucide React
- **State Management**: React useState/useEffect hooks
- **Persistence**: Browser localStorage for preferences

### Backend API
- **Endpoint**: `POST /api/analyze`
- **Request Body**:
  ```json
  {
    "urls": ["https://api.example.com/v1/data"],
    "useAdvancedInference": true
  }
  ```
- **Response Body**:
  ```json
  {
    "datasets": [...],
    "domainDetected": true,
    "processingTime": "3.2s"
  }
  ```

### Data Models

**URL Field**:
```typescript
{
  id: number;
  url: string;
}
```

**Dataset Result**:
```typescript
{
  url: string;
  name: string;
  domain: string;
  confidence: number;
  columns: Column[];
  insights: string[];
  recordCount: number;
  complianceRequirements?: string[];
}
```

**Column (Standard)**:
```typescript
{
  name: string;
  type: string;
  nullable: boolean;
}
```

**Column (Advanced)**:
```typescript
{
  name: string;
  type: string;
  nullable: boolean;
  semantic?: string;
  compliance?: string;
  pii?: boolean;
  validation?: string;
}
```

## Security & Compliance

### Data Protection
- All API calls use HTTPS protocol
- No dataset contents stored on client or server
- Metadata only persisted during session
- URLs validated before processing

### Compliance Detection
When advanced inference is enabled:
- **HIPAA**: Automatically flagged for healthcare data containing PHI
- **PCI-DSS**: Flagged for financial data with payment card information
- **GDPR**: Identified for personal data requiring consent

### PII/PHI Identification
Columns containing personally identifiable or protected health information are automatically tagged with PII badges.

## Performance

### Processing Time Targets
- Standard Inference: 0.6 seconds per endpoint
- Advanced Inference: 1.1 seconds per endpoint
- Maximum: 20 concurrent endpoints per batch

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Responsive Design
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## Development

### File Structure
```
/app/batch-analysis/
├── page.tsx           # Main page component
└── README.md          # This file

/app/api/analyze/
└── route.ts           # API endpoint with domain detection logic

/components/ui/
└── alert.tsx          # Alert component (created for this feature)
```

### Adding New Domains

To add support for new domains, update the domain detection logic in `/app/api/analyze/route.ts`:

1. Add domain patterns:
```typescript
const patterns = {
  healthcare: [...],
  financial: [...],
  retail: [...],
  education: ['student', 'course', 'grade', 'enrollment'], // New domain
};
```

2. Add mock data generator case:
```typescript
else if (domain === 'education') {
  // Define columns and insights
}
```

3. Update color scheme in `/app/batch-analysis/page.tsx`:
```typescript
case 'education':
  return 'bg-indigo-100 text-indigo-800 border-indigo-300';
```

## Future Enhancements

### Phase 2
- Cross-dataset relationship detection
- Automated data quality scoring
- Schema versioning and change detection
- Export results to PDF/CSV
- Saved analysis history

### Phase 3
- ML-based data type prediction
- Automated data catalog generation
- Integration with data governance platforms
- Real-time collaboration features
- API authentication management

## Troubleshooting

### "Please enter valid URLs" Error
- Ensure all URLs include `http://` or `https://` protocol
- Verify URLs are properly formatted

### "Maximum 20 endpoints allowed" Error
- The system limits analysis to 20 endpoints per batch for performance
- Split your analysis into multiple batches

### Results Not Displaying
- Check browser console for errors
- Verify the `/api/analyze` endpoint is accessible
- Ensure JavaScript is enabled

## License

This feature is part of the Zola project. See the main project LICENSE file for details.
