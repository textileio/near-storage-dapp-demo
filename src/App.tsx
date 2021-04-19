import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useCallback } from 'react';
import Big from 'big.js';
import {Artwork} from './components/Artwork';
import Rule from './components/Rule';
import Tokens from './components/Tokens';
import { ScreenClassProvider, Container, Row, Col, setConfiguration } from 'react-grid-system';
import type { StoreFunction, LockBox } from "@textile/near-storage"

setConfiguration({ defaultScreenClass: 'sm', gridColumns: 16 });

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const ruleset = ["111", "110", "101", "100", "011", "010", "001", "000"]
const highlights = [1, 3, 9, 11, 13, 22, 25, 26, 28, 30, 33, 37, 45, 50, 54, 57, 58, 60, 61, 62, 69, 73, 75, 78, 82, 86, 89, 90, 94, 99, 101, 102, 105, 107, 109, 110, 114, 118, 121, 124, 126, 129, 131, 133, 135, 137, 141, 145, 146, 147, 149, 150, 153, 154, 158, 161, 163, 165, 167, 169, 181, 193, 195, 210, 214, 222, 225, 230, 233, 246, 250]

interface Props {
  store: StoreFunction
  lockBox: LockBox
  contract?: any
  currentUser?: any
  nearConfig?: any
  wallet?: any
};

const App = ({ contract, currentUser, nearConfig, wallet, lockBox, store }: Props) => {

  const h = highlights[Math.floor(Math.random() * highlights.length)]
  const ruleToAutomata = (rule: number) => {
    return rule.toString(2).split("").reverse().concat(Array(8).fill("0")).slice(0,8).map((s) => parseInt(s));
  }
  const automata = ruleToAutomata(h)
  const [tokens, setTokens] = useState<Array<{cid: string, rule: string}>>([]);
  const [artwork, setArtwork] = useState<string>();
  const [positionals, setPositionals] = useState(automata);
  const [locked, setLocked] = useState<boolean>(false);

  const [width, setWidth] = useState(0);
  const div = useCallback(node => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    // TODO: don't just fetch once; subscribe!
    contract.getStoredAssets().then((t: any) => {setTokens(t)});
    lockBox.hasLocked().then(setLocked);
  }, []);


  const setRule = (rule: number) => {
    setPositionals(ruleToAutomata(rule))
    setArtwork(undefined)
  }

  const mint = async () => {
    if (artwork == undefined) {
      alert("error: no token selected"); 
      return;
    }
    await lockBox.lockFunds()

    const data = await fetch(artwork)
    const blob = await data.blob()

    const file = new File([blob], "rule.png", {
      type: "image/png",
      lastModified: new Date().getTime(),
    });
    const stored = await store(file)
    const rule = "" + parseInt([...positionals].reverse().join(""), 2)
    contract.storeNewAsset(
      { cid: stored.cid["/"], rule},
      BOATLOAD_OF_GAS,
      Big('0').toFixed()
    ).then(() => {
      contract.getStoredAssets().then((tokens: any) => {
        setTokens(tokens);
      });
    });
    // const store = async () => {
      // await storage.signIn()
      // await storage.lockFunds()
      // const data = await fetch(artwork)
      // const blob = await data.blob()
      // const file = new File([blob], "sun.webm", {
      //   type: "video/webm",
      //   lastModified: new Date().getTime(),
      // });
      // return await storage.store(file)
    // }
    return
  }

  const onComplete = (b: string) => {
    setArtwork(b)
  }
  
  const unlock = async () => {
    await lockBox.unlockFunds()
    setLocked(false)
    alert("funds unlocked!")
  };
  
  const signIn = () => {
    // wallet.requestSignIn(
    //   nearConfig.contractName,
    //   'RULE TOKENS'
    // );
    lockBox.requestSignIn('RULE TOKENS');
  };

  const signOut = async () => {
    // wallet.signOut();
    await unlock()
    await lockBox.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  const flipPositional = (n: number, i: number) => {
    let p = [...positionals];
    p[i] = n ? 0 : 1;
    setPositionals(p)
  }

  const ruleN = parseInt([...positionals].reverse().join(""), 2)
  const owned = -1 < tokens.map((t) => t.rule).indexOf(""+ruleN)  
  return (
    <ScreenClassProvider>
      <Container fluid>
      <header>
        { currentUser
          ? <div className="auth" onClick={signOut}>log out</div>
          : <div className="auth" onClick={signIn}>log in</div>
        }
        { locked
          && <div className="auth" onClick={unlock}>unlock funds</div>
        }
        <br/>
        <h2>RULE TOKENS</h2>
      </header>
      <Row>
        <Col>
          {!currentUser 
            ? <div className={`currentRule`}>{`Rule ${ruleN} — Log in to mint.`}</div>
            : owned
            ? <div className={`currentRule`}>{`Rule ${ruleN} — From your collection.`}</div>
            : <div className={`currentRule ${artwork ? "" : " blink"}`} onClick={mint}>{`Rule ${ruleN} — ${artwork ? "Click here to mint" : "Waiting to render.."}.`}</div>
          }
        </Col>
      </Row>
      <br/>
      <Row>
        <Col>
          <div className="helpText">Toggle bytes to change rule (refresh for random).</div>
        </Col>
      </Row>
      <br/>
      <Row className="controls" justify="between">
        {positionals.map((n, i) => 
          <Col key={i} className="ruleToggle" onClick={()=>{flipPositional(n,i); setArtwork(undefined)}}>
            <Rule bytes={ruleset[i]} onOff={n}/>
          </Col>
        )}
      </Row>
      <br/>
      <Row className="artwork">
        <Col>
        { !!width &&
          <Artwork width={width} automata={positionals} onComplete={onComplete}/>
        }
        <div ref={div}>&nbsp;</div>
        </Col>
      </Row>
      <br/>
      <Row>
        <Col>
          {tokens.length > 0 
            ? <div className="helpText">Your rule token collction.</div>
            : <div className="helpText">Mint a token to grow your collection.</div>
          }
        </Col>
      </Row>
      <br/>
      <Tokens tokens={tokens} onClick={setRule}/>
      <br/>
      <Row>
        <Col>
          <a href="https://mathworld.wolfram.com/ElementaryCellularAutomaton.html" className="helpText">Read more about elementary cellular automaton.</a>
        </Col>
      </Row>
      </Container>
    </ScreenClassProvider>
  );
};

export default App;
