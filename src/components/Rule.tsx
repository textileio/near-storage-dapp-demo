import React from 'react';

interface Props {
  bytes: string,
  onOff: number
}

export default function Rule({ bytes, onOff}: Props) {
  const code = bytes.split("").map((b) => parseInt(b))
  return (
    <div className="rules">
      <div className="visual">
        <div className={`pixel ${code[0] == 1 ? "on" : "off"}`}></div>
        <div className={`pixel ${code[1] == 1 ? "on" : "off"}`}></div>
        <div className={`pixel ${code[2] == 1 ? "on" : "off"}`}></div>
        <div className="pixel blank"></div>
        <div className={`pixel ${onOff == 1 ? "on" : "off"}`}></div>
        <div className="pixel blank"></div>
      </div>
      <div className="onOff">{onOff}</div>
    </div>
  );
}

