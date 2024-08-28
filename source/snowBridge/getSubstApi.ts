import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api';

/** Tries to establish an API connection with a _Substrate_ blockchain node under the given URL `wsUrl`.
 *
 * If the initial connection is successful, returns the api; otherwise returns `undefined`.
 *
 * If the WebSocket turns unavailable after the initial connection, it will persistently retry to connect.
 *
 * @param wsUrl HTTP or WS endpoint of a _Substrate_ blockchain node.
 * @returns the api `ApiPromise` if connection was established or `undefined` otherwise.
 */
export async function getSubstApi(
  wsUrl: string,
): Promise<ApiPromise | undefined> {
  const provider = wsUrl.startsWith('http')
    ? new HttpProvider(wsUrl)
    : new WsProvider(wsUrl);
  try {
    // // #1 Variant
    // const api = await ApiPromise.create({
    //   provider,
    //   throwOnConnect: true,
    // });

    // return api;

    // #2 Variant
    const api = new ApiPromise({
      provider,
    });

    return await api.isReadyOrError;
  } catch (error) {
    console.error(
      `Could not connect to API under ${wsUrl}. Because: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    );

    // stop from trying to reconnect to the webSocket
    provider.disconnect();
    return undefined;
  }
}
