// import * as Kilt from '@kiltprotocol/sdk-js';
import { getSubstApi } from './getSubstApi';

async function testApi(webSocketAddress: string) {
  console.log('checkpoint_1');
  try {
    const api = await getSubstApi(webSocketAddress);
    console.log('checkpoint_2');
    return api;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error(JSON.stringify(e));
  }
}

// const webSocketAddress = 'ws://127.0.0.1:9004';
// const webSocketAddress = 'wss://sys.ibp.network/asset-hub-polkadot';
const webSocketAddress = 'wss://kilt-rpc.dwellir.com';

testApi(webSocketAddress)
  .then(async (api) => {
    if (api) {
      const chainName = (await api.rpc.system.chain()).toString();

      console.log('successfully connected to: ', chainName);
    } else {
      console.log(`could not connect to api under "${webSocketAddress}"`);
    }
  })
  .catch((e) => console.error(`caught error: ${e}`));

// don't close the connection nor the process to test behavior after externally closing the webSocket
