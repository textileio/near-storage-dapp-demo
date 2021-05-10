import { TokenAsset, assets } from './model';

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const ASSET_LIMIT = 10;

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function storeNewAsset(id: string, cid: string, rule: string): void {
  // Creating a new message and populating fields with our data
  const message = new TokenAsset(id, cid, rule);
  // Adding the message to end of the the persistent collection
  assets.push(message);
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getStoredAssets(): TokenAsset[] {
  const numMessages = min(ASSET_LIMIT, assets.length);
  const startIndex = assets.length - numMessages;
  const result = new Array<TokenAsset>(numMessages);
  for(let i = 0; i < numMessages; i++) {
    result[i] = assets[i + startIndex];
  }
  return result;
}
