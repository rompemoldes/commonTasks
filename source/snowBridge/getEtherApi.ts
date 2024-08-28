// TODO:

// das hier nachmachen aber ohne den context:
// export const assetErc20Metadata = async (
//     context: Context,
//     tokenAddress: string
// ): Promise<ERC20Metadata> => {
//     const tokenMetadata = IERC20Metadata__factory.connect(tokenAddress, context.ethereum.api)
//     const [name, symbol, decimals] = await Promise.all([
//         tokenMetadata.name(),
//         tokenMetadata.symbol(),
//         tokenMetadata.decimals(),
//     ])
//     return { name, symbol, decimals }
// }

// Question:
// Do we really need to add this to the environment?
// the metadata is being fetch here again anyways:
// https://github.com/KILTprotocol/snowbridge-app/blob/a1818fe7387c6467fd90e73e9d9f817615e83525/hooks/useSnowbridgeContext.ts#L40-L41

import { AbstractProvider, JsonRpcProvider, WebSocketProvider } from 'ethers';

export function getEtherApi(wsUrl: string): AbstractProvider | undefined {
  if (wsUrl.startsWith('http')) {
    return new JsonRpcProvider(wsUrl);
  }
  if (wsUrl.startsWith('ws')) {
    return new WebSocketProvider(wsUrl);
  }
}
