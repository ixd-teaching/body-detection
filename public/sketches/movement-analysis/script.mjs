
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
import { drawImageWithOverlay, drawBodyParts } from '../../lib/drawing.mjs'
import { detectBodies, AnalyzeBodyMovement, bodyPartsList, movementState } from '../../lib/bodydetection.mjs'
import { continuosly } from '../../lib/system.mjs'

async function run(canvas, status) {
  let listOfBodies


  status.innerHTML = 'Setting up camera feed...'

  // create a video element connected to the camera feed
  const video = await createCameraFeed(640, 480, facingMode.environment)

  // configuration of machine learning framework
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100
  }

  const enabledBodyParts = [bodyPartsList.rightWrist]
  const analyzeBodyMovement = new AnalyzeBodyMovement(enabledBodyParts, 0.1)
  status.innerHTML = 'Loading model...'
  detectBodies(config, (e) => {
    listOfBodies = e.detail.bodies.listOfBodies
    analyzeBodyMovement.analyze(listOfBodies[0])
  })

  analyzeBodyMovement.addEventListener('bodyAnalyzed', e => {
    e.detail.analyzedBodyParts.forEach(analyzedBodyPart => {
      status.innerHTML = `Distance from start: ${analyzedBodyPart.distanceFromStartPos.toFixed(2)}`
    })
  })

  analyzeBodyMovement.addEventListener('backAtStartPos', e => {
    const analyzedBodyPart = e.detail.analyzedBodyPart
    console.log(`Back at start position: ${analyzedBodyPart.bodyPart.name}`)
  })

  analyzeBodyMovement.addEventListener('awayFromStartPos', e => {
    const analyzedBodyPart = e.detail.analyzedBodyPart
    console.log(`Away from start position: ${analyzedBodyPart.bodyPart.name}`)
  })

  // draw video with overlay onto canvas continuously 
  continuosly(() => drawImageWithOverlay(canvas, video, () => drawBodyParts(canvas, listOfBodies, enabledBodyParts, !config.multiPose)))
}

export { run }