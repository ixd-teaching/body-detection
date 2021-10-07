async function createCameraFeed(width, height, facingMode) {
   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
         'Browser API navigator.mediaDevices.getUserMedia not available');
   }

   const camera = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
         facingMode: facingMode,
         width: width,
         height: height,
      },
   })

   const video = document.createElement('video')
   video.width = width
   video.height = height
   video.autoplay = true
   video.style.display = 'none'
   video.srcObject = camera

   return new Promise((resolve) => {
      video.onloadedmetadata = () => {
         resolve(video)
      }
   })
}

export { createCameraFeed }
