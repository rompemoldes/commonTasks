import * as Kilt from "@kiltprotocol/sdk-js";

import dotenv from "dotenv";

dotenv.config();

export const WSS_ADDRESS = process.env.WSS_ADDRESS;
// export const DID = loadEnv("DID") as Kilt.DidUri;
// export const SECRET_BACKUP_PHRASE = loadEnv("SECRET_BACKUP_PHRASE");
export const ACCOUNT_MNEMONIC = loadEnv("ACCOUNT_MNEMONIC");
export const DID_MNEMONIC = loadEnv("DID_MNEMONIC");

function loadEnv(name: string) {
  const envValue = process.env[name];
  if (!envValue) {
    throw new Error(
      `Environment constant '${name}' is missing. Define it on the project's root directory '.env'-file. \n`
    );
  }
  return envValue;
}
export function setupSubscanApi(chain?: "p" | "s") {
  // This is the subscan key for the andres@kilt.io account:
  const xApiKey = "fd1db8265bd444aba743ad07dd8b7dad";

  const peregrineNetwork = "kilt-testnet";
  const spiritnetNetwork = "spiritnet";

  const socialKYCPeregrineAddress =
    "4sQR3dfZrrxobV69jQmLvArxyUto5eJtmyc2f9xs1Hc4quu3";

  const socialKYCSpiritnetAddress =
    "4qEmG7bexsWtG1LiPFj95GL38xGcNfBz83LYeErixgHB47PW";

  const socialKYCPeregrineDidUri: Kilt.DidUri =
    "did:kilt:4pehddkhEanexVTTzWAtrrfo2R7xPnePpuiJLC7shQU894aY";

  const socialKYCSpiritnetDidUri: Kilt.DidUri =
    "did:kilt:4pnfkRn5UurBJTW92d9TaVLR2CqJdY4z5HPjrEbpGyBykare";

  let network = chain === "s" ? spiritnetNetwork : peregrineNetwork;

  const apiUrl = `https://${network}.api.subscan.io`;

  const subscan = {
    apiUrl,
    network,
    xApiKey,
    headers: { "Content-Type": "application/json", "X-API-Key": xApiKey },
    isCrawlingFrom:
      network === spiritnetNetwork ? "Kilt Spiritnet" : "Kilt Peregrine",
    socialKYCAddress:
      network === spiritnetNetwork
        ? socialKYCSpiritnetAddress
        : socialKYCPeregrineAddress,
    socialKYCDidUri:
      network === spiritnetNetwork
        ? socialKYCSpiritnetDidUri
        : socialKYCPeregrineDidUri,
  };

  return subscan;
}
