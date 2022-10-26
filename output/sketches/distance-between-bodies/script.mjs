import { detectBodies } from '../../lib/bodydetection.mjs';
import { drawImageOnCanvas } from '../../lib/drawing.mjs';
import { continuosly } from '../../lib/system.mjs';
import { createCameraFeed, facingMode } from '../../lib/camera.mjs';
import { bodyPartsList } from '../../lib/bodydetection.mjs';
async function run(canvas, status) {
    let bodies;
    // create a video element connected to the camera feed
    status.innerHTML = 'Setting up camera feed...';
    const video = await createCameraFeed(canvas.width, canvas.height, facingMode.environment);
    const config = {
        video: video,
        multiPose: true,
        sampleRate: 100
    };
    // start listening to bodies in camera-feed
    status.innerHTML = 'Loading model...';
    detectBodies(config, (e) => {
        status.innerHTML = '';
        const bodies = e.detail.bodies;
        if (bodies.listOfBodies.length > 1) {
            const id1 = bodies.listOfBodies[0].getId();
            const id2 = bodies.listOfBodies[1].getId();
            status.innerHTML = `Distance between body parts: ${bodies.getDistanceBetweenBodyParts2D(id1, bodyPartsList.nose, id2, bodyPartsList.rightWrist).absoluteDistance}`;
        }
    });
    // draw camera feed on canvas
    continuosly(() => drawImageOnCanvas(canvas, video));
}
export { run };
