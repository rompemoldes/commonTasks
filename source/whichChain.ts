import { getApi } from './connection';
import readFlags from './flags';

async function whichChain() {
  const flags = await readFlags();
  const api = await getApi(flags.chain);

  const chainName = (await api.rpc.system.chain()).toHuman();

  console.log('The API is connected to a node of the blockchain: ', chainName);

  return chainName;
}

whichChain().then(() => process.exit());
