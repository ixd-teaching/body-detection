function calcDistance2D3D(pos1, pos2) {
   const vector = {}
   vector.x = pos1.x - pos2.x
   vector.y = pos1.y - pos2.y
   if ('z' in pos1 && 'z' in pos2) {
      vector.z = pos1.z - pos2.z
      return { vector: vector, absoluteDistance: Math.hypot(vector.x, vector.y, vector.z) }
   }
   return { vector: vector, absoluteDistance: Math.hypot(vector.x, vector.y) }
}

function calcSpeed2D3D(pos1, pos2, timeElapsed) {
   const distance = calcDistance2D3D(pos1, pos2)
   const result = {
      vector: { x: distance.vector.x / timeElapsed, y: distance.vector.y / timeElapsed },
      absoluteSpeed: distance.absoluteDistance / timeElapsed
   }
   if ('z' in pos1 && 'z' in pos2) {
      result.vector.z = distance.vector.z / timeElapsed
   }
   return result
}


export { calcDistance2D3D, calcSpeed2D3D }