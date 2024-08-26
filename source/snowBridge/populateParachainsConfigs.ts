import { configDotenv } from 'dotenv';
import {
  buildParachainConfig,
  RegisterOfParaConfigs,
} from './parachainConfigs';

export const parachainConfigs: RegisterOfParaConfigs = {};

export async function populateParachainConfigs() {
  configDotenv();
  const paraNodes = process.env.PARACHAIN_ENDPOINTS?.split(';');

  console.log(paraNodes);

  if (!paraNodes) {
    return;
  }

  for await (const endpoint of paraNodes) {
    const newConfig = await buildParachainConfig(endpoint);

    // // debugger:
    // console.log(
    //   'newConfig: ',
    //   JSON.stringify(
    //     newConfig,
    //     (_, v) => (typeof v === 'bigint' ? v.toString() : v), // replacer of bigInts
    //     2,
    //   ),
    // );

    if (!newConfig) {
      return;
    }
    if (newConfig.name in parachainConfigs) {
      // don't overwrite
    } else {
      parachainConfigs[newConfig.name] = newConfig;
    }
  }
}

populateParachainConfigs()
  .then(() =>
    console.log(
      'parachainConfigs: ',
      JSON.stringify(
        parachainConfigs,
        (_, v) => (typeof v === 'bigint' ? v.toString() : v), // replacer of bigInts
        2,
      ),
    ),
  )
  .catch(console.error);
