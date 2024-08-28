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

export async function getEtherApi(
  nodeUrl: string,
): Promise<AbstractProvider | undefined> {
  console.log('checkpoint_a');

  const provider = nodeUrl.startsWith('http')
    ? new JsonRpcProvider(nodeUrl)
    : new WebSocketProvider(nodeUrl);
  console.log('checkpoint_b');

  try {
    console.log('Checkpoint C: Verifying connection by fetching block number.');

    if (provider instanceof WebSocketProvider) {
      console.log('checkpoint_websocket');

      await new Promise<void>((resolve, reject) => {
        // Check if the connection is established successfully
        provider
          .getBlockNumber()
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    } else {
      console.log('checkpoint_http');

      // For HTTP provider, a single request is sufficient
      await provider.getBlockNumber();
    }
    console.log('checkpoint_d');

    return provider;
  } catch (err) {
    console.error(
      `Could not connect to Ethereum node at ${nodeUrl}. Reason: ${err instanceof Error ? err.message : JSON.stringify(err)}`,
    );
    provider.destroy();
    return undefined;
  }
}
