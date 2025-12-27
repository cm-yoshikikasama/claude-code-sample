import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let client: Client | null = null;

export async function getClient(): Promise<Client> {
	if (client) {
		return client;
	}

	const transport = new StdioClientTransport({
		command: "uvx",
		args: ["awslabs.aws-diagram-mcp-server"],
	});

	client = new Client(
		{
			name: "aws-diagram-mcp-client",
			version: "1.0.0",
		},
		{
			capabilities: {},
		},
	);

	await client.connect(transport);
	return client;
}

export async function callTool(
	toolName: string,
	args: Record<string, unknown>,
): Promise<unknown> {
	try {
		const mcpClient = await getClient();
		const result = await mcpClient.callTool({
			name: toolName,
			arguments: args,
		});
		return result;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`MCP tool call failed: ${error.message}`);
		}
		throw error;
	}
}

export async function close(): Promise<void> {
	if (client) {
		await client.close();
		client = null;
	}
}

process.on("exit", () => {
	if (client) {
		client.close().catch(() => {});
	}
});
