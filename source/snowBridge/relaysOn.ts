import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api';
import { Option, Struct } from '@polkadot/types';
import { PolkadotPrimitivesV5PersistedValidationData } from '@kiltprotocol/augment-api/index';

// explicit Type Definition:
// /** @name PolkadotPrimitivesV5PersistedValidationData (352) */
// interface PolkadotPrimitivesV5PersistedValidationData extends Struct {
//   readonly parentHead: Bytes;
//   readonly relayParentNumber: u32;
//   readonly relayParentStorageRoot: H256;
//   readonly maxPovSize: u32;
// }

async function getApi(wsUrl: string): Promise<ApiPromise | undefined> {
  try {
    const api = await ApiPromise.create({
      provider: wsUrl.startsWith('http')
        ? new HttpProvider(wsUrl)
        : new WsProvider(wsUrl),
      throwOnConnect: true,
    });
    return api;
  } catch (error) {
    console.error(`Could not connect to api under ${wsUrl}`);
    return undefined;
  }
}

async function getRelaysChainLastParentBlockInfo(api: ApiPromise) {
  const validationData =
    await api.query.parachainSystem.validationData<
      Option<PolkadotPrimitivesV5PersistedValidationData>
    >();

  if (validationData.isNone) {
    throw new Error(
      'This is not a parachain or validation data is unavailable',
    );
  }
  const { relayParentNumber, relayParentStorageRoot } = validationData.unwrap();

  const lastRelayParentBlock = relayParentNumber.toNumber();
  const lastRelayParentBlockStorageRoot = relayParentStorageRoot.toHex();

  console.log('lastRelayParentBlock: ', lastRelayParentBlock);
  console.log(
    'lastRelayParentBlockStorageRoot: ',
    lastRelayParentBlockStorageRoot,
  );

  return {
    lastRelayParentBlock,
    lastRelayParentBlockStorageRoot,
  };
}

async function getLastParentBlockRelaysValidation(api: ApiPromise) {
  const signedBlock = await api.rpc.chain.getBlock();

  const validationDataExtrinsic = signedBlock.block.extrinsics.find((extr) => {
    const methy = extr.method.method;
    console.log('method: ', methy);
    return methy === 'setValidationData';
  });

  if (!validationDataExtrinsic) {
    throw new Error(
      'This is not a parachain or validation data is unavailable',
    );
  }
  const { relayParentNumber, relayParentStorageRoot } = (
    validationDataExtrinsic?.method.args[0] as any
  ).validationData;

  const lastRelayParentBlock = relayParentNumber.toNumber();
  const lastRelayParentBlockStorageRoot = relayParentStorageRoot.toHex();

  console.log('lastRelayParentBlock: ', lastRelayParentBlock);
  console.log(
    'lastRelayParentBlockStorageRoot: ',
    lastRelayParentBlockStorageRoot,
  );

  return {
    lastRelayParentBlock,
    lastRelayParentBlockStorageRoot,
  };
}

async function relaysOn(paraApi: ApiPromise, relayApis: ApiPromise[]) {
  const { lastRelayParentBlock, lastRelayParentBlockStorageRoot } =
    await getRelaysChainLastParentBlockInfo(paraApi);

  const parachainName = await paraApi.rpc.system.chain();

  for (const relayApi of relayApis) {
    if (!relayApi) {
      continue;
    }

    const examinedBlockHash =
      await relayApi.rpc.chain.getBlockHash(lastRelayParentBlock);

    const examinedBlock = await relayApi.rpc.chain.getBlock(examinedBlockHash);
    const relaychainName = await relayApi.rpc.system.chain();

    if (
      examinedBlock.block.header.stateRoot.toHex() ===
      lastRelayParentBlockStorageRoot
    ) {
      console.log(`"${parachainName}" relays on chain: ${relaychainName}`);
      return relaychainName;
    }
    console.log(
      `"${parachainName}" does not relay on chain: ${relaychainName}`,
    );
  }
  const unknownRelayChain = 'a blockchain whose API was not provided';
  console.log(`"${parachainName}" relays on ${unknownRelayChain}.`);

  return unknownRelayChain;
}

// Example usage
const paraWsUrl = 'wss://rilt.kilt.io';
// const wsUrl = 'wss://kilt.dotters.network';
const relayWSs = [
  'https://polkadot-rpc.dwellir.com',
  'ws://127.0.0.1:9944',
  'https://rococo-rpc.polkadot.io',
];
getApi(paraWsUrl)
  .then(async (paraApi) => {
    const relayApis = (await Promise.all(relayWSs.map(getApi))).filter(
      (api): api is ApiPromise => api !== undefined,
    );
    if (!paraApi) {
      throw new Error('Api of parachain undefined');
    }
    return relaysOn(paraApi, relayApis);
  })
  .catch((error) => console.error('Error:', error))
  .finally(() => process.exit());
