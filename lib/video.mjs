async function createCameraFeed(width, height, facingMode) {

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
   video.style.display = 'none'
   video.srcObject = camera

   return new Promise((resolve) => {
      video.onloadedmetadata = () => {
         video.play() // won't work in Safari without
         resolve(video)
      }
   })
}

export { createCameraFeed }
