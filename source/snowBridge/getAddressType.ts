import { ApiPromise, WsProvider } from '@polkadot/api';
import { TypeDefInfo } from '@polkadot/types';

type AddressType = '20byte' | '32byte' | 'both';

async function getAddressType(): Promise<AddressType> {
  // Connect to the parachain using its WebSocket endpoint
  const wsProvider = new WsProvider('wss://rococo-muse-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  // Fetch the AccountId type from the metadata
  const lookedUpType = api.registry.lookup.getTypeDef(0);

  console.log('lookedUpType: ', JSON.stringify(lookedUpType, null, 2));

  api.disconnect();

  if (lookedUpType.type === 'AccountId32') {
    return '32byte';
  }

  if (lookedUpType.type === 'AccountId20') {
    return '20byte';
  }

  if (lookedUpType.info === TypeDefInfo.VecFixed) {
    const length = lookedUpType.length;
    if (length === 20) {
      return '20byte';
    }
    if (length === 32) {
      return '32byte';
    }
  }
  return 'both';
}

getAddressType()
  .then((addrType) => console.log(`The address type used is: ${addrType}`))
  .catch(console.error);
