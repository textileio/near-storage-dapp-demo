import { useRef, useEffect } from 'react'

const Draw = (draw: any, width: number, onComplete: (img: string) => void) => {
  
  const canvasRef = useRef(null)
  
  const applyStyle = (canvas: HTMLCanvasElement) => {
    var size = Math.floor(width);
    canvas.style.width = size + "px";
    canvas.style.height = 2*size/3 + "px";

    // Set actual size in memory (scaled to account for extra pixel density).
    var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = Math.floor(size * scale);
    canvas.height = Math.floor(size * scale);

		canvas.style.top = "0px";
		canvas.style.left = "0px";
		canvas.style.bottom = "0px";
    canvas.style.right = "0px";
  }

  useEffect(() => {
    const canvas = canvasRef.current
    // @ts-ignore
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId: number
    const cellSize = 4
    const frameRate = 8
    // @ts-ignore
    applyStyle(canvas)

    const render = () => {
      frameCount++
      draw(context, frameCount, cellSize, frameRate)
      animationFrameId = window.requestAnimationFrame(render)
      // @ts-ignore
      if (frameCount > (canvas.height / cellSize) / frameRate) {
        // @ts-ignore
        onComplete(canvas.toDataURL("image/png"))
        window.cancelAnimationFrame(animationFrameId)
      }
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw, onComplete])
  
  return canvasRef
}

export default Draw