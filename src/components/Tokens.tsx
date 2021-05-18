import React from "react";
import { ScreenClassProvider, Container, Row, Col, setConfiguration } from 'react-grid-system';
interface Props {
  tokens: Array<{
    cid: string
    rule: string
    status: string
  }>
  onClick: (rule: number) => void
}

export default function Tokens({ tokens, onClick }: Props) {
  return (
    <Row justify="around">
      {tokens.map((token, i) =>
        <Col key={i}>
          <div className="token-image" onClick={() => onClick(parseInt(token.rule))}>
            <img src={`https://dweb.link/ipfs/${token.cid}`} />
            <h2>{token.rule}</h2>
            <p className="asset-text" >
              View
              (<a href={`https://dweb.link/ipfs/${token.cid}`} target="_blank">gateway</a>)
            </p>
            <p className="asset-text label">Filecoin status:</p>
            <p className="asset-text">{token.status}</p>
          </div>
        </Col>
      )}
    </Row>
  );
}
