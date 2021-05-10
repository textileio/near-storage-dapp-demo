import { context, u128, PersistentVector } from "near-sdk-as";

/** 
 * Exporting a new class TokenAsset so it can be used outside of this file.
 */
@nearBindgen
export class TokenAsset {
  sender: string;
  constructor(public id: string, public cid: string, public rule: string) {
    this.sender = context.sender;
  }
}
/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const assets = new PersistentVector<TokenAsset>("a");
