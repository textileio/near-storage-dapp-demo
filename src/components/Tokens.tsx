import React from "react";
import { ScreenClassProvider, Container, Row, Col, setConfiguration } from 'react-grid-system';
interface Props {
  tokens: Array<{
    cid: string
    rule: string
  }>
  onClick: (rule: number) => void
}

export default function Tokens({ tokens, onClick }: Props) {
  return (
    <Row justify="around">
      {tokens.map((token, i) => 
      <Col key={i}>
        <div className="token-image" onClick={()=>onClick(parseInt(token.rule))}>
            <img src={`https://dweb.link/ipfs/${token.cid}`} />
            <h2>{token.rule}</h2>
        </div>
      </Col>
      )}
    </Row>
  );
}
