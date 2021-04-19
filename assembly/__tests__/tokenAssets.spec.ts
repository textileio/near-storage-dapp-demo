import { storeNewAsset, getStoredAssets } from '../main';
import { TokenAsset, assets } from '../model';
import { VMContext, Context, u128 } from 'near-sdk-as';

function createTokenAsset(cid: string, rule: string): TokenAsset {
  return new TokenAsset(cid, rule);
}

const asset = createTokenAsset('bafybeifcxjvbad4lgpnbwff2dafufmnlylylmku4qoqtlkwgidupwi6f3a', '0');

describe('message tests', () => {
  afterEach(() => {
    while(assets.length > 0) {
      assets.pop();
    }
  });

  it('adds an asset', () => {
    storeNewAsset('bafybeifcxjvbad4lgpnbwff2dafufmnlylylmku4qoqtlkwgidupwi6f3a', '0');
    expect(assets.length).toBe(
      1,
      'should only contain one asset'
    );
    expect(assets[0].cid).toStrictEqual(
      asset.cid,
      'message should be "hello world"'
    );
  });

  it('retrieves messages', () => {
    storeNewAsset('bafybeifcxjvbad4lgpnbwff2dafufmnlylylmku4qoqtlkwgidupwi6f3a', '0');
    const assetsArr = getStoredAssets();
    expect(assetsArr.length).toBe(
      1,
      'should be one asset'
    );
    expect(assetsArr).toIncludeEqual(
      asset,
      'assets should include:\n' + asset.toJSON()
    );
  });

  it('only show the last 10 messages', () => {
    storeNewAsset('bafybeifcxjvbad4lgpnbwff2dafufmnlylylmku4qoqtlkwgidupwi6f3a', '0');
    const newAssets: TokenAsset[] = [];
    for(let i: i32 = 0; i < 10; i++) {
      const cid = 'bafy' + i.toString();
      const rule = ''+i
      newAssets.push(createTokenAsset(cid, rule));
      storeNewAsset(cid, rule);
    }
    const assets = getStoredAssets();
    log(assets.slice(7, 10));
    expect(assets).toStrictEqual(
      newAssets,
      'should be the last ten assets'
    );
    expect(assets).not.toIncludeEqual(
      asset,
      'shouldn\'t contain the first element'
    );
  });
});
