/**
 * 
 * @param {any[]} neighbours 
 * @param {[][]} distanceFromStartList
 */
 export function getClosestToStart(neighbours, distanceFromStartList) {
    let min = Number.POSITIVE_INFINITY;
    let minIndex = -1;
    for (let i = 0; i < neighbours.length; i++) {
      let currentNeighb = neighbours[i][0];
      let currentNeighbDistance = distanceFromStartList.find(node => node[0] === currentNeighb)[1];
      console.assert(currentNeighbDistance, "no distance for this neighbour");
      if (currentNeighbDistance <= min) {
        min = currentNeighbDistance;
        minIndex = currentNeighb;
      }
    }
    return minIndex;
  }


/**
 * 
 * @param {boolean[]} unvisited 
 * @param {number[]} distanceFromStart 
 * @param {Node[]} grid 
 */
export function getShortestDistanceUnvisited(unvisited, distanceFromStart) {

    for (let i = 0; i < distanceFromStart.length; i++) {
      if (unvisited[distanceFromStart[i][0]]) {
        return distanceFromStart[i][0];
      }
    }
    return false;
  }

export function isSameCoords(a, b) {
    if (a[0] === b[0] && a[1] === b[1]) {
      return true;
    }
    return false;
  }