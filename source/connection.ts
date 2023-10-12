import * as Kilt from "@kiltprotocol/sdk-js";
import { WSS_ADDRESS } from "./configuration";

const spiritnet_socket = "wss://spiritnet.kilt.io";
const peregrine_socket = "wss://peregrine.kilt.io";
const wssAddress = WSS_ADDRESS;

/**
 * Makes sure you only connect once to the API of the Blockchain. If you are connected, return it.
 * If not connected yet, connect through the Web-Socket Address.
 *
 * If not connected yet, the blockchain can be specified with a letter:
 *  - "s" for Spiritnet Kilt (real).
 *  - "p" for Peregrine Kilt (testnet), default.
 *
 * @returns active ApiPromise
 */
export async function getApi(webSocketLetter?: "p" | "s") {
  const wishedChain =
    webSocketLetter === "s" ? "KILT Spiritnet" : "KILT Peregrine";

  // If the API is already set up, return it
  if (Kilt.ConfigService.isSet("api")) {
    const api = Kilt.ConfigService.get("api");
    // If you specified the chain you want to connect, check that matches the currently connected one
    if (webSocketLetter) {
      const nameOfChainCurrentlyConnected = (
        await api.rpc.system.chain()
      ).toHuman();
      if (nameOfChainCurrentlyConnected !== wishedChain) {
        throw new Error(
          "Disconnect from one chain before connecting to the other one!"
        );
      }
    }
    return api;
  }

  // Try to assign from the .env file through WSS_ADDRESS

  let webSocketAddress: string = wssAddress ?? peregrine_socket;
  // "wss" stands for WebSocket Secure

  // if one of the letters is specified, overwrite the wss-address
  if (webSocketLetter === "s") {
    webSocketAddress = spiritnet_socket;
  }
  if (webSocketLetter === "p") {
    webSocketAddress = peregrine_socket;
  }

  // If not, set up a new one (connect)
  await Kilt.connect(webSocketAddress);
  // internally Kilt.connect() calls cryptoWaitReady()

  return Kilt.ConfigService.get("api");
}
