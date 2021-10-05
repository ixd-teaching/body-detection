
function drawImageWithOverlay(canvas, video, drawOverlay) {
   const ctx = canvas.getContext("2d")
   // draw current frame from the video element onto the canvas
   ctx.drawImage(video, 0, 0, video.width, video.height)
   // draw overlay
   drawOverlay()
}

function drawSolidCircle (canvas, x, y, radius, color, opacity) {
   const ctx = canvas.getContext("2d")
   if (!opacity)
      opacity = 1
   ctx.beginPath()
   ctx.arc(x, y, radius, 0, 2 * Math.PI)
   ctx.opacity = opacity
   ctx.fillStyle = color
   ctx.fill()
}

function drawStar(canvas, cx, cy, spikes, outerRadius, innerRadius, color, opacity) {
   const ctx = canvas.getContext("2d")
   const step = Math.PI / spikes
   let rot = Math.PI / 2 * 3
   let x = cx
   let y = cy
   if (!opacity)
      opacity = 1

   ctx.beginPath()
   ctx.moveTo(cx, cy - outerRadius)
   for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y)
      rot += step
   }
   ctx.lineTo(cx, cy - outerRadius)
   ctx.closePath()
   ctx.fillStyle = color
   ctx.opacity = opacity
   ctx.fill()
}

export { drawImageWithOverlay, drawSolidCircle, drawStar }