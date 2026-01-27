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
		env: process.env as Record<string, string>,
	});

	client = new Client(
		{
			name: "diagram-mcp-server-client",
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
			throw new Error(`Diagram MCP Server call failed: ${error.message}`);
		}
		throw error;
	}
}

export async function listTools(): Promise<string[]> {
	const mcpClient = await getClient();
	const tools = await mcpClient.listTools();
	return tools.tools.map((t) => t.name);
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
