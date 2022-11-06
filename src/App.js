import logo from './logo.svg';
import './App.css';
import { useEffect, useState, useRef, u } from 'react';

/**
 * @title Graph Render
 * 
 *  createNode
 *  createGrid
 *  addNeighboursToNode(node,gridBounds);
 * 
 *  renderGraph()
 *  renderEntities(entity[]) 
 * 
 *  Data Structures
 *  node [id,pos:[x,y,z],edges:[],data:{}];
 *  entity {visitedNodes[],navigator,destination}
 * 
 *  navigate()
 *  - useGrid plus entity position
 *  - run pathFindingAlgOnce return new position
 *  - update entity position
 *  
 * 
 * 
 */

/**
 * 
 * @param {*} heightInCells 
 * @param {*} widthInCells 
 */


 const SPEED = 2;


class Entity {
  visited;
  destination;
  navigator;

  constructor() {
    this.visited = new Array();
    this.destination = new Array();
    this.navigator = () => { }

  }
}
class Edge {

}

class Neighbour {
  x;
  y;
}

class Node {
  neighbours;
  data;
  constructor(x, y) {
    this.coords = [x, y];
    this.neighbours = new Array();
  }

  removeNeighbour(x, y) {
    let index = this.neighbours.findIndex(ngb => ngb[0] === x && ngb[1] === y);
    console.assert(index < 0, "neighbour does not exist");
    let removed = this.neighbours.splice(index, 1);
    return removed;
  }

  addNeighbour(indexPosition, x, y, cost) {
    this.neighbours.push([indexPosition, cost, x, y]);
  }

}


async function runGraphSimulation() {
  const grid = createGrid();
}

function createGrid(heightInCells, widthInCells) {
  const grid = new Array();
  let y = 0;
  while (y < heightInCells) {
    let x = 0;

    while (x < widthInCells) {
      grid.push(new Node(x, y));
      x++
    }
    y++
  }
  generateNeighbours(grid);
  return grid;
}

/**
 * 
 * 
 * @param {Node[]} grid 
 * @returns 
 */
async function generateNeighbours(grid) {
  console.assert(grid.length, "grid is empty");
  for (let i = 0; i < grid.length; i++) {
    const neighbours = [[0, -1], [-1, 0], [1, 0], [0, 1]];
    neighbours.forEach(neigh => {
      let xVal = grid[i].coords[0] + neigh[0];
      let yVal = grid[i].coords[1] + neigh[1];
      if (grid.findIndex(node => isSameCoords(node.coords, [xVal, yVal])) > -1) {
        const neighbourIndex = grid.findIndex(node => isSameCoords(node.coords, [xVal, yVal]));
        grid[i].addNeighbour(neighbourIndex, xVal, yVal, 1);
      }
    })
  }
}

/**
 * //const neighbour = [ parseInt( node[0]) + parseInt(neigh[0]),   parseInt(node[1]) + parseInt(neigh[1])];
    const neigbour = new Node(undefined, node.position[0] + neigh[0], node.position[1] + neigh[1]);
    const index = grid.findIndex(nd => nd.position[0] === neigbour.position[0] && neigbour.position[1] === nd.position[1]);
    if (index > -1) {
      node.neighbours.push(grid[index]);
    }
 * @param {*} canvasContext 
 * @param {Node[]} grid 
 */
function renderGraph(canvasContext, grid) {
  const spacing = 10
  canvasContext.fillStyle = "white"
  canvasContext.fillStroke = "black"
  for (let i = 0; i < grid.length; i++) {
    renderNode(canvasContext, grid[i].coords[0], grid[i].coords[1]);
  }
}
/**
 * 
 * @param {*} context 
 * @param {Node} node 
 * @param {string} color 
 */
function renderNode(canvasContext, x, y, text) {
  canvasContext.fillRect(20 + x * 16, 20 + y * 16, 15, 15);
  canvasContext.stroke();
  if (text) {
    canvasContext.fillStyle = "white";
    canvasContext.font = "10px Comic Sans MS";
    canvasContext.fillText(text, 20 + x * 16 + 2, 20 + y * 16 + 10, 12);
    canvasContext.stroke();
  }

}

async function renderVisited(canvasContext, x, y, cost) {
  canvasContext.fillStyle = "green";
  renderNode(canvasContext, x, y, cost);
}

function renderExplored(canvasContext, x, y) {
  canvasContext.fillStyle = "blue";
  renderNode(canvasContext, x, y);
}

function renderPathNode(canvasContext, x, y) {
  console.assert(canvasContext,"no context");
  canvasContext.fillStyle = "yellow";
  renderNode(canvasContext, x, y);
}

class KnowledgeRow {
  id;
  distanceFromA;
  previousNode;
  /**
   * @param {Number} id
   * @param {Number} dA 
   * @param {Number} pN 
   */
  constructor(id, dA, pN) {
    this.id = id;
    this.distanceFromA = dA;
    this.previousNode = pN;
  }
}
/**
 * 
 * @param {Node[]} grid 
 * @param {Entity} visitor 
 */
async function dijkstraNavigation(grid, visitor, canvasContext) {
  const knowledgeTable = new Array();
  knowledgeTable.push(new KnowledgeRow(visitor.visited[0].id, 0, undefined));
  grid.forEach(node => {
    if (node.id !== visitor.visited[0].id) {
      knowledgeTable.push(new KnowledgeRow(node.id, Number.POSITIVE_INFINITY, node.id));
    }
  });
  const unvisitedList = knowledgeTable.map(kr => kr.id);
  knowledgeTable.sort((a, b) => b.distanceFromA - a.distanceFromA);

  while (unvisitedList.length) {
    // visit next unkown vertice with shortest distance
    const unvNodeRef = unvisitedList.shift();
    const unvNode = grid.find(nod => nod.id === unvNodeRef);
    if (unvNode.id !== visitor.destination.id) {
      canvasContext.fillStyle = "green";
      renderNode(canvasContext, unvNode);
    }

    // get neighbours for node
    const neighbours = grid[parseInt(unvNodeRef)].neighbours;
    neighbours.forEach(async neighbourNode => {
      if (neighbourNode.id !== visitor.destination.id) {
        canvasContext.fillStyle = "lightBlue";
        renderNode(canvasContext, neighbourNode);
      }

      if (unvisitedList.indexOf(neighbourNode.id) < 0 && neighbourNode.id !== visitor.destination.id) {
        canvasContext.fillStyle = "lightGreen";
        renderNode(canvasContext, neighbourNode);
      }
      const unvNodekr = knowledgeTable.find(kr => kr.id === unvNode.id);
      const neighbourKr = knowledgeTable.find(kr => kr.id === neighbourNode.id);
      // for each calculate distance to startPoint
      const calculatedDistance = unvNodekr.distanceFromA + 1;
      // if the calculated distance is lesser than previously known update value;
      if (calculatedDistance < neighbourKr.distanceFromA) {
        neighbourKr.distanceFromA = calculatedDistance;
        neighbourKr.previousNode = unvNodeRef;
      }

    })
    await new Promise(res => setTimeout(res, 25));

    if (unvNodeRef !== visitor.destination.id) {
      canvasContext.fillStyle = "lightGreen";
      renderNode(canvasContext, grid.find(nod => nod.id === unvNodeRef));
    }

  }

  console.log("knowledgeTable", knowledgeTable);

  const destinationKr = knowledgeTable.find(kr => kr.id === visitor.destination.id);
  let path = new Array();
  path.push(destinationKr);
  while (path.findIndex(kr => kr.id === "00") < 0) {
    let next = knowledgeTable.find(kr => kr.id === path[path.length - 1].previousNode);
    path.push(next);
  }
  console.log("path", path);

  path.reverse();

  async function walk(kr) {
    const currNode = grid.find(node => node.id === kr.id);
    canvasContext.fillStyle = "purple";
    renderNode(canvasContext, currNode);
  }
  let i = 0;
  while (i < path.length) {
    await new Promise(res => setTimeout(res, 250));
    walk(path[i]);
    i++
  }
  path.forEach(walk)




}
/**
 * 
 * @param {Node[]} grid 
 * @param {Entity} visitor 
 * @param {number[]} startPos
 * 
 */
async function dijkstraNavigation2(grid, visitor, startPos, canvasContext) {
  const unvisitedList = new Array();
  const distanceFromStart = new Array();
  for (let i = 0; i < grid.length; i++) {
    unvisitedList.push(true);
    distanceFromStart.push([i, Number.POSITIVE_INFINITY]);
  }
  // step 2 set origin as current
  const currentNodeIndex = grid.findIndex(node => isSameCoords(node.coords, startPos));
  const destinationIndex = grid.findIndex(node => isSameCoords(node.coords, visitor.destination));
  console.assert(currentNodeIndex > -1, "no such starting point exists");
  distanceFromStart[currentNodeIndex] = [currentNodeIndex, 0];
  visitNeighbours(currentNodeIndex, grid, distanceFromStart, canvasContext);
  unvisitedList[currentNodeIndex] = false;
  let visits = 0;
  while (unvisitedList[destinationIndex] === false || !unvisitedList.every(node => node === false)) {
      distanceFromStart.sort((a, b) => { if (a[1] < b[1]) { return -1 } return +1 });
      const unvisitedIndex = getShortestDistanceUnvisited(unvisitedList, distanceFromStart, grid);
      console.assert(unvisitedIndex, "no more nodes to visit");
      if (!unvisitedIndex) {
        break;
      }
      visitNeighbours(unvisitedIndex, grid, distanceFromStart, canvasContext);
      unvisitedList[unvisitedIndex] = false;
      setTimeout(()=>{
        renderVisited(canvasContext, grid[unvisitedIndex].coords[0], grid[unvisitedIndex].coords[1], distanceFromStart.find(d => d[0] === unvisitedIndex)[1]);
        renderEntities(canvasContext,visitor);
      },visits * SPEED)
      visits ++;
   
   
  }
  visits ++;
  setTimeout(()=>{
    renderEntities(canvasContext, [visitor]);
  },visits * SPEED)


  const destNode = distanceFromStart.find(node => node[0] === destinationIndex);
  console.assert(destNode, "no destination node in distanceList");
  let cursor = [...destNode];
  const path = new Array();
  while (cursor[1] !== 0) {
    
   
    let nextCursorPosition = getClosestToStart(grid[cursor[0]].neighbours, distanceFromStart);
    console.assert(nextCursorPosition, "no neighbours");
    cursor[0] = nextCursorPosition;
    cursor[1] = distanceFromStart.find(node => node[0] === nextCursorPosition)[1];
    path.push([...cursor]);
  }

  path.reverse();
  setTimeout(()=>{
  path.forEach( cursor => {
    const xPos = grid[cursor[0]].coords[0];
    const yPos = grid[cursor[0]].coords[1];
      renderPathNode(canvasContext, xPos, yPos)
   
  });
  renderEntities(canvasContext,visitor);
}, 7000);

  console.log("finished running dijskra!");
  console.log("origin, destination", startPos, visitor.destination);
  console.log(" shortest path", path);

}

function isSameCoords(a, b) {
  if (a[0] === b[0] && a[1] === b[1]) {
    return true;
  }
  return false;
}

/**
 * 
 * @param {any[]} neighbours 
 * @param {[][]} distanceFromStartList
 */
function getClosestToStart(neighbours, distanceFromStartList) {
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
function getShortestDistanceUnvisited(unvisited, distanceFromStart, grid) {

  for (let i = 0; i < distanceFromStart.length; i++) {
    if (unvisited[distanceFromStart[i][0]]) {
      return distanceFromStart[i][0];
    }
  }
  return false;
}

/**
 * 
 * @param {Node[]} grid 
 * @param {Node} node 
 */
async function visitNeighbours(currentNodeIndex, grid, distanceFromStartList, canvasContext) {
  const currentDistance = distanceFromStartList.find(node => node[0] === currentNodeIndex)[1];
  grid[currentNodeIndex].neighbours.forEach((ngr, i) => {
    const costToNode = ngr[1];
    const neighbIndex = distanceFromStartList.findIndex(node => node[0] === ngr[0]);
    if (currentDistance + costToNode < distanceFromStartList[neighbIndex][1]) {
      distanceFromStartList[neighbIndex][1] = currentDistance + costToNode;
      setTimeout(()=>{
        renderExplored(canvasContext, grid[ngr[0]].coords[0], grid[ngr[0]].coords[1], distanceFromStartList[neighbIndex][1]);
      },i * SPEED)
    }
  })
}

/**
 * @param {*} context
 * @param {Entity[]} entities 
 */
function renderEntities(context, entities) {
  entities.forEach(ent => {
    ent.visited.forEach((node, i) => {
      context.fillStyle = "yellow";
      renderNode(context, node[0], node[1]);
    })
    context.fillStyle = "red";
    renderNode(context, ent.destination[0], ent.destination[1])
  })
}

const Square = { height: 13, width: 14 }


function App() {
  const grid = createGrid(50, 50);
  const entities = new Array();
  const Canvas = props => {
    const canvasRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d');
      const visitor1 = new Entity();
      visitor1.visited.push(grid[0].coords);
      visitor1.destination = grid[79].coords;
      entities.push(visitor1);
      //Our first draw
      context.fillStyle = '#d1d1d1'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      console.log(grid);
      renderGraph(context, grid);
      renderEntities(context, entities);
      dijkstraNavigation2(grid, visitor1, [0, 0], context);
      //renderWorld(15, 15, { ...AGENT, position: [xPos, yPos] }, GOAL, context);
      //renderVisited(visited, context)
      //goTo(AGENT,GOAL,setXPos,setYPos,setVisitedPos)
    }, [])

    return <canvas width={window.screen.width} height={window.screen.height} ref={canvasRef} {...props} />
  }


  return (
    <div className="App" style={{ height: "100%" }}>
      <Canvas />
    </div>
  );
}

export default App;
