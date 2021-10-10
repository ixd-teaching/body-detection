function drawImageWithOverlay(canvas, video, drawOverlay) {
   const ctx = canvas.getContext("2d")
   // draw current frame from the video element onto the canvas
   ctx.drawImage(video, 0, 0, video.width, video.height)
   // draw overlay
   drawOverlay()
}

function drawSolidCircle(canvas, x, y, radius, color, opacity) {
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

function drawBodyParts(canvas, bodies, enabledBodyPartNames, has3DData) {
   const ctx = canvas.getContext("2d")
   let bodyPart2D
   // draw circle for each bodyPart
   let yOffset = 20
   let xOffset = 10

   function printData(bodyPartName) {
      let x, y, z, speed, confidenceScore, decimals
      if (has3DData) {
         const bodyPart3D = body.getBodyPart3D(bodyPartName)
         x = bodyPart3D.position.x
         y = bodyPart3D.position.y
         z = bodyPart3D.position.z
         speed = bodyPart3D.speed.absoluteSpeed
         confidenceScore = bodyPart3D.confidenceScore
         decimals = 2
      }
      else {
         x = bodyPart2D.position.x
         y = bodyPart2D.position.y
         speed = bodyPart2D.speed.absoluteSpeed
         confidenceScore = bodyPart2D.confidenceScore
         decimals = 0
      }
      const vDistance = 15
      ctx.font = "12px 'Arial'"
      ctx.fillText(`${bodyPartName}`, xOffset, yOffset)
      ctx.fillText(`x: ${x.toFixed(decimals)}`, xOffset, vDistance + yOffset)
      ctx.fillText(`y: ${y.toFixed(decimals)}`, xOffset, 2 * vDistance + yOffset)
      has3DData ? ctx.fillText(`z: ${z.toFixed(decimals)}`, xOffset, 3 * vDistance + yOffset) : ctx.fillText(`z: 0`, xOffset, 3 * vDistance + yOffset)
      ctx.fillText(`speed: ${speed.toFixed(decimals)}`, xOffset, 4 * vDistance + yOffset)
      ctx.fillText(`confidence: ${confidenceScore}`, xOffset, 5 * vDistance + yOffset)
      if (yOffset > canvas.height - 120) {
         yOffset = 20
         xOffset = 130
      }
      else {
         yOffset = yOffset + 93
      }
   }

   if (bodies) {
      bodies.forEach(body => {
         enabledBodyPartNames.forEach(bodyPartName => {
            bodyPart2D = body.getBodyPart2D(bodyPartName)
            drawSolidCircle(canvas, bodyPart2D.position.x, bodyPart2D.position.y, 10, 'white', 1)
            printData(bodyPartName)
         })
      })
   }
}

export { drawImageWithOverlay, drawSolidCircle, drawStar, drawBodyParts }