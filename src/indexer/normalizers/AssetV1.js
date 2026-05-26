export default {
  tableName: "asset_v1",
  conflictColumn: "asset_id",
  columns: [
    { name: "asset_id", type: "BIGINT PRIMARY KEY" },
    { name: "asset_type", type: "SMALLINT" },
    { name: "owner", type: "TEXT" },
    { name: "name", type: "TEXT" },
    { name: "url", type: "TEXT" },
    { name: "protocol", type: "SMALLINT" },
    { name: "metadata", type: "TEXT" },
    { name: "created_block", type: "INTEGER" },
  ],
  handlers: {
    AssetCreated: (args, blockNumber) => ({
      action: "INSERT",
      data: {
        asset_id: args.assetId,
        asset_type: args.assetType,
        owner: args.owner,
        name: args.name,
        url: args.url,
        protocol: args.protocol,
        metadata: args.metadata,
        created_block: blockNumber,
      },
    }),
  },
};
