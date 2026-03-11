import MCPTokenDetail from '@/components/mcp/MCPTokenDetail';

interface MCPTokenDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MCPTokenDetailPage({
  params,
}: MCPTokenDetailPageProps) {
  const { id } = await params;
  const tokenId = Number.parseInt(id, 10);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {Number.isNaN(tokenId) ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          无效的 MCP token ID：{id}
        </div>
      ) : (
        <MCPTokenDetail tokenId={tokenId} />
      )}
    </div>
  );
}
