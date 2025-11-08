# My API Integration

Integration with [API Name] for AgentFoundry.

## Description

This skill provides seamless integration with [API Name], allowing you to [describe capabilities].

## Prerequisites

- [API Name] account
- API key (get one at https://example.com/api-keys)

## Installation

```bash
agentfoundry install my-api-integration
```

## Configuration

Set the following environment variables:

```bash
export API_KEY="your-api-key-here"
export API_BASE_URL="https://api.example.com"  # Optional
```

## Usage

### Fetch Data

```typescript
const result = await fetchData({
  query: "search term"
});

console.log(result.data);
```

## Tools

### `fetch_data`

Fetches data from the API.

**Input:**
- `query` (string, required): Search query or identifier

**Output:**
- `success` (boolean): Whether the request succeeded
- `data` (any): API response data
- `error` (string, optional): Error message if failed
- `metadata` (object): Request metadata

**Environment Variables:**
- `API_KEY` (required): Your API key
- `API_BASE_URL` (optional): Custom API base URL

## Rate Limiting

This skill respects API rate limits:
- Max 60 requests per minute
- Auto-retry with exponential backoff

## Error Handling

Common errors:
- `401 Unauthorized`: Invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `404 Not Found`: Resource not found
- `500 Server Error`: API service issue

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
