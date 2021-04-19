import React from 'react';
import Canvas from './Canvas'

interface Props {
  width: number
  automata: Array<number>
  onComplete: (img: string) => void
}

export const Artwork = React.memo((props: Props) => {
  let cells: Array<number> = []
  const automata = props.automata;
  
  const run = (c1: number, c2: number, c3: number) => automata[Number.parseInt("" + c1 + c2 + c3, 2)];

  const getWidth = (ctx: CanvasRenderingContext2D, cellSize: number) => {
    return 3 * Math.floor(ctx.canvas.width / cellSize)
  }

  const rowArray = (ctx: CanvasRenderingContext2D, cellSize: number) => {
    return new Array(getWidth(ctx, cellSize));
  }

  const next = (ctx: CanvasRenderingContext2D, cellSize: number) => {
    var row = rowArray(ctx, cellSize);
    for (var i = 1; i < cells.length - 1; i++) {
        var left = cells[i - 1];
        if (left == undefined) left = 0
        var mid = cells[i];
        var right = cells[i + 1];
        if (right == undefined) right = 0
        row[i] = run(left, mid, right);
    }
    cells = row;
  }

  // creates a first row with single cell in middle
  const rowOne = (ctx: CanvasRenderingContext2D, cellSize: number) => {
    cells = rowArray(ctx, cellSize).fill(0)
    cells[Math.floor(cells.length / 2)] = 1;
  }

  // draws a new row. row n based on frame
  const draw = (ctx: CanvasRenderingContext2D, frameCount: number, cellSize: number, frameRate: number) => {
    if (frameCount==1) {rowOne(ctx, cellSize);}
    let startFrame = ((frameCount - 1) * frameRate);
    let frameIndex = ((frameCount - 1) * frameRate);
    let offset = Math.floor(ctx.canvas.width / cellSize)
    while(frameIndex < startFrame + frameRate) {
      for (var i = 0; i < ctx.canvas.width; i++) {
        if (cells[offset + i] === 1) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(i * cellSize, (frameIndex+1) * cellSize, cellSize, cellSize);
          ctx.stroke();
        }
      }
      next(ctx, cellSize);
      frameIndex+=1;
    }
  }
  return <Canvas width={props.width} draw={draw} onComplete={props.onComplete}/>
}, (prevProps, nextProps) => {
  if (prevProps.width !== nextProps.width) {
    return false;
  }
  // ensures canvas is only ever re-rendered on rule change
  for (let i = 0; i <= nextProps.automata.length; i++) {
    if (prevProps.automata[i] !== nextProps.automata[i]) {
      return false; 
    }
  }
  return true;
});