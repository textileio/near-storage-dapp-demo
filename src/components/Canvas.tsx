import React from 'react'
import Draw from './Draw'


interface Props {
  width: number
  draw: any,
  onComplete: (img: string) => void
}

const Canvas = (props: Props) => {  
  const { draw, width, onComplete, ...rest } = props
  const canvasRef = Draw(draw, width, onComplete)

  // @ts-ignore
  return <canvas className="ruleCanvas" ref={canvasRef} {...rest}/>
}

export default Canvas
