# NEAR dApp + Filecoin Storage Demo

This project is an example of how to integrate Textile's Filecoin Storage into any
NEAR dApp using the Filecoin Storage library for NEAR, `@textile/near-storage`. The library interacts with
the `near-api-js` code you've already written to provide an easy to use API for storing any
amount of data off of the NEAR blockchain, and in the Filecoin network.

This example allows users to authenticate with their NEAR account, create unique visualizations of
[cellular automata](https://mathworld.wolfram.com/ElementaryCellularAutomaton.html), store those
visualizations on the Filecoin network, and mint verifiable records of the stored visualizations
within a NEAR smart contract.

This app was built starting from one of the many [NEAR example apps](https://github.com/near-examples),
so be sure you're familiar with those examples and the [NEAR docs](https://docs.near.org/docs/concepts/new-to-near) 
so you know the basics of NEAR smart contracts and `near-api-js` usage.

# Table of Contents

- [Quick start](#quick-start)
- [How it Works](#how-it-works)
- [Learn More](#learn-more)
- [Exploring the Code](#exploring-the-code)
- [Deploy](#deploy)

# Quick Start

To run this project locally:

1. Prerequisites: Make sure you have Node.js ≥ 12 installed (https://nodejs.org).
2. Install dependencies: `npm install` (or just `npm i`)
3. Run the local development server: `npm run dev` (see `package.json` for a
   full list of `scripts` you can run with `npm`)

Now you'll have a local development environment backed by the NEAR TestNet and Filecoin Storage!
Running `npm run dev` will tell you the URL you can visit in your browser to see the app.

# How it Works

There are two main components in this example NEAR dApp using Filecoin Storage:

1. The example NEAR dApp and associated smart contract. This would be replaced by your own app and smart contract.
2. The `@textile/near-storage` library which abstracts use of the Filecoin Storage NEAR smart contract and Filecoin Storage Provider into an easy-to-use API.


## Example dApp and Smart Contract

We start with code you'll typically see in any NEAR dApp... In `src/index.tsx`, we read our configuration,
initialize the `Near` client, create a `WalletConnection`, get a reference to the current NEAR user, 
and create a reference to our example app's smart contract:

```
import getConfig from './config.js';
import { connect, keyStores, Contract, WalletConnection } from 'near-api-js';

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
const walletConnection = new WalletConnection(near, null);

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
  viewMethods: ['getStoredAssets'],
  changeMethods: ['storeNewAsset'],
  sender: walletConnection.getAccountId()
});
```

Our app's smart contract (the source is in the `assembly` directory) exposes two functions;
`storeNewAsset` which we'll use to store on chain records of the cellular automata visualizations
stored on Filecoin and `getStoredAssets` which will be used to retrieve the list of all records
previously stored using `storeNewAsset`.

## Using Filecoin Storage

### Initializing the API

After creating a NEAR `WalletConnection` in the `src/index.tsx` code above, we pass that object into the
`init` function provided by `@textile/near-storage`. This provides the API we'll use from then on to
interact with Filecoin Storage.

```
import { init } from "@textile/near-storage"

const storage = await init(walletConnection)
```

We bind our newly created NEAR and Filecoin Storage objects to the `App` React component, and the web
app is then rendered in `App.tsx`.

### User Sign In

Before using Filecoin Storage to store data, the web app user must be signed in to their NEAR account.
If they aren't already signed in, Filecoin Storage provides a helper method to initiate the sign in.
Here, we use it inside a function that is bound to a clickable UI element:

```
const signIn = () => {
  storage.requestSignIn('RULE TOKENS')
};
```

### Adding a Deposit

Before a user can store data using Filecoin Storage, a deposit of 1 NEAR must be made, either by the user or by
you (the dApp developer) on the user's behalf, into the Filecoin Storage NEAR smart contract. The deposited
funds help provide the Filecoin Storage Provider some amount of Sybil attack resistance. After depositing
funds, the user has an active storage session. The session will expire after an hour, and the deposited
funds will be returned to the sender.

```
const addDeposit = async () => {
  await storage.addDeposit()
}
```

### Storing Data

Once a deposit is made and the user has an active storage session, we can now store data.
It's as simple as passing a `File` object into the Filecoin Storage `store` function. Our
`mint` funtion in `App.tsx` builds a `File` from a blob of data, our cellular automaton visualization,
stores the file using the `store` function, and then saves the resulting information about
the stored data in our dApp's smart contract using its `storeNewAsset` function:

```
const mint = async () => {
  if (artwork == undefined) {
    alert("error: no token selected");
    return;
  }

  const data = await fetch(artwork)
  const blob = await data.blob()

  const file = new File([blob], "rule.png", {
    type: "image/png",
    lastModified: new Date().getTime(),
  });
  const stored = await storage.store(file)
  const rule = "" + parseInt([...positionals].reverse().join(""), 2)
  contract.storeNewAsset(
    { id: stored.id, cid: stored.cid["/"], rule },
    BOATLOAD_OF_GAS,
    Big('0').toFixed()
  ).then(() => {
    contract.getStoredAssets().then((tokens: any) => {
      setTokens(tokens);
    });
  });
  return
}
```

We've now stored data using Filecoin Storage and kept a record of that data storage on
the NEAR blockchain.

### Checking Filecoin Storage Status

You stored data is always available on the IPFS network, but stored data takes time 
to make it through the Filecoin Storage Provider, become sealed in a Filecoin miner, 
and verified on the Filecoin blockchain. You can check the data's status at any time
by calling the Filecoin Storage `status` method. In `App.tsx` we do that when the page
loads by getting a list of stored data IDs from our dApp's smart contract and passing
those IDs to the `status` method. It's a bit of Javascript async `Promise` wrangling,
but all comes down to calling:

```
useEffect(() => {
  ...
  return await storage.status(asset.id)
  ...
}, []);
```

# Learn More
Our example dApp provides a thorough example of integrating Filecoin Storage into a
NEAR dApp. We've covered all the highlights of the integration in this README, but 
be sure to check out the [full Filecoin Storage documentation](https://near.storage/docs/)
for more.

# Exploring the Code

1. The backend code lives in the `/assembly` folder. This code gets deployed to
   the NEAR blockchain when you run `npm run deploy:contract`. This sort of
   code-that-runs-on-a-blockchain is called a "smart contract" – [learn more
   about NEAR smart contracts][smart contract docs].
2. The frontend code lives in the `/src` folder.
   [/src/index.html](/src/index.html) is a great place to start exploring. Note
   that it loads in `/src/index.js`, where you can learn how the frontend
   connects to the NEAR blockchain.
3. Tests: there are different kinds of tests for the frontend and backend. The
   backend code gets tested with the [asp] command for running the backend
   AssemblyScript tests, and [jest] for running frontend tests. You can run
   both of these at once with `npm test`.

Both contract and client-side code will auto-reload as you change source files.

# Deploy

Every smart contract in NEAR has its [own associated account][near accounts]. Ours is deployed to `{TODO}.testnet`.

One command:

    npm run deploy

As you can see in `package.json`, this does two things:

1. builds & deploys smart contracts to NEAR TestNet
2. builds & deploys frontend code to GitHub using [gh-pages].

For now, you can view the "app" at: https://textileio.github.io/near-storage-dapp-demo/

[near]: https://nearprotocol.com/
[assemblyscript]: https://docs.assemblyscript.org/
[react]: https://reactjs.org
[smart contract docs]: https://docs.nearprotocol.com/docs/roles/developer/contracts/assemblyscript
[asp]: https://www.npmjs.com/package/@as-pect/cli
[jest]: https://jestjs.io/
[near accounts]: https://docs.nearprotocol.com/docs/concepts/account
[near wallet]: https://wallet.nearprotocol.com
[near-cli]: https://github.com/nearprotocol/near-cli
[cli]: https://www.w3schools.com/whatis/whatis_cli.asp
[create-near-app]: https://github.com/nearprotocol/create-near-app
[gh-pages]: https://github.com/tschaub/gh-pages
