# My Basic Skill

A simple single-tool skill for AgentFoundry.

## Description

[Describe what your skill does and why it's useful]

## Installation

```bash
agentfoundry install my-basic-skill
```

## Usage

### Basic Example

```typescript
// Example usage of the tool
const result = await myTool({
  input_param: "example value"
});

console.log(result);
// Output: { result: "Processed: example value", metadata: { ... } }
```

## Tools

### `my_tool`

Describe what this tool does.

**Input:**
- `input_param` (string, required): Description of the parameter

**Output:**
- `result` (string): The processed result
- `metadata` (object, optional): Additional metadata

**Example:**

```json
{
  "input_param": "test"
}
```

## Configuration

No configuration required.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## License

MIT
