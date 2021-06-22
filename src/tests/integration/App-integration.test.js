// these are made available by near-cli/test_environment
// note: do not remove the line below as it is needed for these tests
/* global nearlib, nearConfig */

import 'regenerator-runtime/runtime';

let near;
let contract;
let accountId;

beforeAll(async function() {
  near = await nearlib.connect(nearConfig);
  accountId = nearConfig.contractName;
  contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['getStoredAssets'],
    changeMethods: ['storeNewAsset'],
    sender: accountId
  });
});

it('send one message and retrieve it', async() => {
  await contract.storeNewAsset({ id: 'id1', cid: 'cid1', rule: 'aloha1' });
  const msgs = await contract.getStoredAssets();
  const expectedMessagesResult = [{
    sender: accountId,
    id: 'id1',
    cid: 'cid1',
    rule: 'aloha1'
  }];
  expect(msgs).toEqual(expectedMessagesResult);
});

it('send two more messages and expect three total', async() => {
  await contract.storeNewAsset({ id: 'id2', cid: 'cid2', rule: 'aloha2' });
  await contract.storeNewAsset({ id: 'id3', cid: 'cid3', rule: 'aloha3' });
  const msgs = await contract.getStoredAssets();
  expect(msgs.length).toEqual(3);
});
