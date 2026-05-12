# Database Schema

## Collection: queries

Document
```json
{
  "_id": "ObjectId",
  "source_language": "string",
  "original_transcript": "string",
  "translated_transcript": "string",
  "phone_country_code": "string",
  "phone_number": "string",
  "phone_full": "string",
  "client_timestamp": "string",
  "client_timezone": "string",
  "submitted_at": "string",
  "status": "string"
}
```

Indexes
- submitted_at: descending
- phone_full: hashed
- status: ascending

Relationships
- None for MVP

Future Extensibility
- Add tenant_id for multi-tenant
- Add language detection metadata
- Add audio storage references
