// import { PolkadotPrimitivesV5PersistedValidationData } from '@kiltprotocol/augment-api/index';
import { ApiPromise } from '@polkadot/api';
import { Bytes, Option, Struct, u32 } from '@polkadot/types';
import { getSubstApi } from './getSubstApi';
import { SnowbridgeEnvironment } from '@snowbridge/api/dist/environment';
import { H256 } from '@polkadot/types/interfaces';

// explicit Type Definition:
/** @name PolkadotPrimitivesV5PersistedValidationData (352) */
interface PolkadotPrimitivesV5PersistedValidationData extends Struct {
  readonly parentHead: Bytes;
  readonly relayParentNumber: u32;
  readonly relayParentStorageRoot: H256;
  readonly maxPovSize: u32;
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

/** Unused */
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
getSubstApi(paraWsUrl)
  .then(async (paraApi) => {
    const relayApis = (await Promise.all(relayWSs.map(getSubstApi))).filter(
      (api): api is ApiPromise => api !== undefined,
    );
    if (!paraApi) {
      throw new Error('Api of parachain undefined');
    }
    return relaysOn(paraApi, relayApis);
  })
  .catch((error) => console.error('Error:', error))
  .finally(() => process.exit());

/** Returns to which `SnowbridgeEnvironment` the parachain under the give `paraApi` corresponds to. */
export async function getSnowEnvBasedOnRelayChain(
  paraApi: ApiPromise,
  snowEnvironments: { [id: string]: SnowbridgeEnvironment },
) {
  const { lastRelayParentBlock, lastRelayParentBlockStorageRoot } =
    await getRelaysChainLastParentBlockInfo(paraApi);

  const parachainName = await paraApi.rpc.system.chain();

  const coldEnvironments = Object.values(snowEnvironments);
  // .map(
  //   ({ config }) => config.RELAY_CHAIN_URL,
  // );

  for (const env of coldEnvironments) {
    const relayApi = await getSubstApi(env.config.RELAY_CHAIN_URL);

    if (!relayApi) {
      continue;
    }

    const examinedBlockHash =
      await relayApi.rpc.chain.getBlockHash(lastRelayParentBlock);

    const examinedBlock = await relayApi.rpc.chain.getBlock(examinedBlockHash);
    const relaychainName = await relayApi.rpc.system.chain();

    await relayApi.disconnect();

    if (
      examinedBlock.block.header.stateRoot.toHex() ===
      lastRelayParentBlockStorageRoot
    ) {
      console.log(`"${parachainName}" relays on chain: ${relaychainName}`);
      return env.name;
    }
    console.log(
      `"${parachainName}" does not relay on chain: ${relaychainName}`,
    );
  }

  console.log(
    `"${parachainName}" relays on a blockchain that is not part of the Snowbridge API.`,
  );

  return 'unsupported_relaychain';
}
