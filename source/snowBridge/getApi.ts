import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api';

export async function getApi(wsUrl: string): Promise<ApiPromise | undefined> {
  try {
    const api = await ApiPromise.create({
      provider: wsUrl.startsWith('http')
        ? new HttpProvider(wsUrl)
        : new WsProvider(wsUrl),
      throwOnConnect: true,
    });
    return api.isReadyOrError;
  } catch (error) {
    console.error(`Could not connect to api under ${wsUrl}`);
    return undefined;
  }
}
