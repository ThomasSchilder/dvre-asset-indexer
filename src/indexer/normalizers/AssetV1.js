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
    { name: "policy_address", type: "TEXT" },
  ],
  handlers: {
    AssetCreated: (args, blockNumber) => ({
      action: "UPSERT",
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
    AssetPolicySet: (args) => ({
      action: "UPSERT",
      data: {
        asset_id: args.assetId,
        policy_address:
          args.policyAddress === "0x0000000000000000000000000000000000000000"
            ? null
            : args.policyAddress,
      },
    }),
  },
};
