import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useCallback, } from 'react';
import Big from 'big.js';
import { Artwork } from './components/Artwork';
import Rule from './components/Rule';
import Tokens from './components/Tokens';
import { ScreenClassProvider, Container, Row, Col, setConfiguration } from 'react-grid-system';
import { API, Status } from "@textile/near-storage"

setConfiguration({ defaultScreenClass: 'sm', gridColumns: 16 });

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const ruleset = ["111", "110", "101", "100", "011", "010", "001", "000"]
const highlights = [1, 3, 9, 11, 13, 22, 25, 26, 28, 30, 33, 37, 45, 50, 54, 57, 58, 60, 61, 62, 69, 73, 75, 78, 82, 86, 89, 90, 94, 99, 101, 102, 105, 107, 109, 110, 114, 118, 121, 124, 126, 129, 131, 133, 135, 137, 141, 145, 146, 147, 149, 150, 153, 154, 158, 161, 163, 165, 167, 169, 181, 193, 195, 210, 214, 222, 225, 230, 233, 246, 250]

const randomRuleNumber = () => {
  return highlights[Math.floor(Math.random() * highlights.length)]
}
interface Props {
  storage: API
  contract?: any
  currentUser?: any
  nearConfig?: any
  wallet?: any
};

const App = ({ contract, currentUser, nearConfig, wallet, storage, ...rest }: Props) => {
  const h = window.location.hash == "" ? randomRuleNumber() : Number(window.location.hash.replace("#", ""))
  const ruleToAutomata = (rule: number) => {
    return rule.toString(2).split("").reverse().concat(Array(8).fill("0")).slice(0, 8).map((s) => parseInt(s));
  }
  const automata = ruleToAutomata(h)
  const [tokens, setTokens] = useState<Array<{ cid: string, rule: string, status: string }>>([]);
  const [artwork, setArtwork] = useState<string>();
  const [positionals, setPositionals] = useState(automata);
  const [hasDeposit, setHasDeposit] = useState<boolean>(false);

  const [width, setWidth] = useState(0);
  const div = useCallback(node => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    const assets: Promise<{ id: string, cid: string, rule: string }[]> = contract.getStoredAssets()
    const statuses = assets.then((assets) => {
      const statusCalls = assets.map(async (asset) => {
        if (!asset.id || asset.id.length === 0) {
          return "Unknown"
        }
        return storage.status(asset.id).then(({ request }) => {
          switch (request.status_code) {
            case Status.Auctioning:
              return "Auctioning"
            case Status.Batching:
              return "Batching"
            case Status.DealMaking:
              return "Making deal"
            case Status.Preparing:
              return "Preparing"
            case Status.Success:
              return "Success"
            case Status.Unknown:
              "Unknown"
            default:
              return "Unknown"
          }
        }).catch(() => {
          return "Error checking status"
        })
      })
      return Promise.all(statusCalls)
    })
    Promise.all([assets, statuses]).then(([assets, statuses]) => {
      const combined = assets.map((asset, i) => {
        return { ...asset, status: statuses[i] };
      })
      setTokens(combined)
    })

    storage.hasDeposit().then(setHasDeposit)
  }, []);

  const ruleN = parseInt([...positionals].reverse().join(""), 2)

  window.location.hash = String(ruleN)

  const setRule = (rule: number) => {
    setPositionals(ruleToAutomata(rule))
    setArtwork(undefined)
  }

  const setRandom = () => {
    setRule(randomRuleNumber())
  }

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
    const { request } = await storage.store(file)
    const rule = "" + parseInt([...positionals].reverse().join(""), 2)
    contract.storeNewAsset(
      { id: request.id, cid: request.cid["/"], rule },
      BOATLOAD_OF_GAS,
      Big('0').toFixed()
    ).then(() => {
      contract.getStoredAssets().then((tokens: any) => {
        setTokens(tokens);
      });
    });
    return
  }

  const onComplete = (b: string) => {
    setArtwork(b)
  }

  const addDeposit = async () => {
    await storage.addDeposit()
  }

  const signIn = () => {
    storage.requestSignIn()
  };

  const signOut = async () => {
    storage.signOut()
    window.location.reload()
  };

  const flipPositional = (n: number, i: number) => {
    let p = [...positionals];
    p[i] = n ? 0 : 1;
    setPositionals(p)
  }

  const owned = -1 < tokens.map((t) => t.rule).indexOf("" + ruleN)

  const renderRuleDesc = () => {
    if (!currentUser) {
      return <div className={`currentRule`}>{`Rule ${ruleN} — `}<span className="link" onClick={signIn}>Log in</span>{` to get started.`}</div>
    }
    if (!hasDeposit) {
      return <div className={`currentRule active`}>{`Rule ${ruleN} — `}<span className="link" onClick={addDeposit}>Deposit funds</span>{` to start a storage session.`}</div>
    }
    let frag = artwork ? <><span className="link" onClick={mint}>Click here</span> to mint again.</> : <>Waiting to render...</>
    if (!owned) {
      frag = artwork ? <><span className="link" onClick={mint}>Click here</span> to mint.</> : <>Waiting to render...</>
    }
    return <div className={`currentRule active ${artwork ? "" : " blink"}`}>{`Rule ${ruleN} — `}{frag}</div>
  }
  return (
    <ScreenClassProvider>
      <Container fluid>
        <header>
          {currentUser
            ? <div className="headerItem link" onClick={signOut}>Log out</div>
            : <div className="headerItem link" onClick={signIn}>Log in</div>
          }
          {currentUser &&
            <div className="headerItem headerItemLast">Storage session: {hasDeposit ? "Active" : "Inactive"}</div>
          }
          <br />
          <h2>RULE TOKENS</h2>
        </header>
        <Row>
          <Col>
            {renderRuleDesc()}
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <div className="helpText">Toggle bytes to change rule (or <span className="link" onClick={setRandom}>click for random</span>).</div>
          </Col>
        </Row>
        <br />
        <Row className="controls" justify="between">
          {positionals.map((n, i) =>
            <Col key={i} className="ruleToggle" onClick={() => { flipPositional(n, i); setArtwork(undefined) }}>
              <Rule bytes={ruleset[i]} onOff={n} />
            </Col>
          )}
        </Row>
        <br />
        <Row className="artwork">
          <Col>
            {!!width &&
              <Artwork width={width} automata={positionals} onComplete={onComplete} />
            }
            <div ref={div}>&nbsp;</div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            {tokens.length > 0
              ? <div className="helpText">Recently minted.</div>
              : <div className="helpText">Mint a token to grow your collection.</div>
            }
          </Col>
        </Row>
        <br />
        <Tokens tokens={tokens} onClick={setRule} />
        <br />
        <br />
        <br />
        <Row>
          <Col>
            <h2>About</h2>
            <div>
              Sign in with NEAR and mint your cellular atomata! This contract will store a map to all your assets stored on Filecoin/IPFS. Deposit funds to upload new assets through the Filecoin Oracle, and you funds will be returned to you after your storage session expires in a hour or so. This contract and app were built with an AssemblyScript backend and a React frontend.
          </div>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <a href="https://mathworld.wolfram.com/ElementaryCellularAutomaton.html" className="helpText">Read more about elementary cellular automaton.</a>
          </Col>
        </Row>
        <br />
      </Container>
    </ScreenClassProvider>
  );
};

export default App;
