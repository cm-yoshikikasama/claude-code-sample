import { callTool, close } from "./mcp-client.js";

interface SearchResponse {
	structuredContent?: {
		search_results?: Array<{
			rank_order: number;
			url: string;
			title: string;
			context: string;
		}>;
	};
}

interface CompactSearchResult {
	query: string;
	totalResults: number;
	topResults: Array<{
		title: string;
		url: string;
		summary: string;
	}>;
}

async function searchAwsDocs(
	query: string,
	limit = 5,
): Promise<CompactSearchResult> {
	try {
		console.error(`Searching AWS documentation for: "${query}"`);

		const result = (await callTool("search_documentation", {
			search_phrase: query,
			limit: limit * 2,
		})) as SearchResponse;

		const searchResults = result.structuredContent?.search_results || [];

		const topResults = searchResults
			.filter((doc) => doc.title && doc.url)
			.slice(0, limit)
			.map((doc) => ({
				title: doc.title,
				url: doc.url,
				summary: doc.context?.slice(0, 150) || "No summary available",
			}));

		return {
			query,
			totalResults: searchResults.length,
			topResults,
		};
	} finally {
		await close();
	}
}

const args = process.argv.slice(2);
if (args.length === 0) {
	console.error("Usage: tsx index.ts <query> [limit]");
	console.error('Example: tsx index.ts "Lambda concurrency" 5');
	process.exit(1);
}

const query = args[0];
const limit = args[1] ? Number.parseInt(args[1], 10) : 5;

searchAwsDocs(query, limit)
	.then((result) => {
		console.log(JSON.stringify(result, null, 2));
	})
	.catch((error) => {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	});
