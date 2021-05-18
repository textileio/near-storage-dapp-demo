/// <reference lib="dom" />

import React from 'react';
import App from "./App"
import ReactDOM from 'react-dom';
// @ts-expect-error missing types
import getConfig from './config.js';
import { connect, keyStores, Contract, WalletConnection } from 'near-api-js';
import { init } from "@textile/near-storage"

// Seems like a strange hack
const ENV = process.env as unknown as Record<string, string>

declare global {
  interface Window {
    nearInitPromise: Promise<void>
  }
}

// Initializing contract
async function initConnection() {
  // Read the configuration
  const nearConfig = getConfig(ENV.NODE_ENV as any || 'testnet');

  // Initializing connection to the NEAR TestNet
  const near = await connect({
    deps: {
      keyStore: new keyStores.BrowserLocalStorageKeyStore()
    },
    ...nearConfig
  });

  // Needed to access wallet
  const walletConnection = new WalletConnection(near, null)

  // Load in account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = await new Contract(walletConnection.account(), nearConfig.contractName, {
    // View methods are read-only – they don't modify the state, but usually return some value
    viewMethods: ['getStoredAssets'],
    // Change methods can modify the state, but you don't receive the returned value when called
    changeMethods: ['storeNewAsset'],
    // Sender is the account ID to initialize transactions.
    // getAccountId() will return empty string if user is still unauthorized
    //@ts-ignore
    sender: walletConnection.getAccountId()
  });

  const storage = await init(walletConnection)
  return { contract, currentUser, nearConfig, walletConnection, storage }
}

window.nearInitPromise = initConnection()
  .then(({ contract, currentUser, nearConfig, walletConnection, storage }) => {
    ReactDOM.render(
      <App
        contract={contract}
        currentUser={currentUser}
        nearConfig={nearConfig}
        wallet={walletConnection}
        storage={storage}
      />,
      document.getElementById('root')
    );
  });
