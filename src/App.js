import logo from './logo.svg';
import './App.css';
import { useEffect, useState, useRef } from 'react';
import {renderEntities,renderExplored,renderGraph,renderSolution,renderVisited} from "./Renders";
import {isSameCoords,getShortestDistanceUnvisited} from "./Helpers";
import {SPEED} from "./Constants";
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


 const PATH_SPEED = 4;


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
  console.time("visitingNeighbours");
  visitNeighbours(currentNodeIndex, grid, distanceFromStart, canvasContext);
  console.timeEnd("visitingNeighbours");
  unvisitedList[currentNodeIndex] = false;
  let visits = 0;
  console.time("djisktraLoop");
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
        renderEntities(canvasContext,[visitor]);
      },visits * SPEED)
      visits ++;
   
  }
  console.timeEnd("djisktraLoop");
  visits ++;
  setTimeout(()=>{
    renderEntities(canvasContext, [visitor]);
  },visits * SPEED)

  console.log("finished running dijskra!");
  console.log("origin, destination", startPos, visitor.destination);

  renderSolution(canvasContext,distanceFromStart,destinationIndex,grid,visits,visitor);
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

function App() {
  const grid = createGrid(75, 75);
  const entities = new Array();
  const Canvas = props => {
    const canvasRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d');
      const visitor1 = new Entity();
      visitor1.visited.push(grid[0].coords);
      visitor1.destination = grid[2823].coords;
      entities.push(visitor1);
      //Our first draw
      context.fillStyle = '#d1d1d1'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      console.log(grid);
      renderGraph(context, grid);
      renderEntities(context, entities);
      dijkstraNavigation2(grid, visitor1, [15, 50], context);
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
