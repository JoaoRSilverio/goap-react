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




 class Entity{
  visited;
  destination;
  navigator;

  constructor(){
    this.visited = new Array();
    this.destination = undefined;
    this.navigator = ()=>{}

  }
}

class Node{
  id;
  position;
  neighbours;
  data;
  constructor(id,x,y){
    this.id = id;
    this.position = [x,y];
    this.neighbours = new Array();

  }

}


async function runGraphSimulation(){
  const grid = createGrid();
}

function createGrid(heightInCells,widthInCells){
  const grid = new Array();
  let y = 0;
  while(y < heightInCells){
    let x = 0;

    while(x < widthInCells){
      grid.push(new Node(`${y}${x}`,x,y));
      x++
    }

    y++
  }

  grid.forEach( node =>{
    generateNeighbours(node, grid);
  })
  return grid;
}

/**
 * 
 * @param {Node} node 
 * @param {Node[]} grid 
 * @returns 
 */
async function generateNeighbours(node,grid){
  const neighbours = [ [-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1] ];
  const result = new Array();
  neighbours.forEach( neigh => {
    //const neighbour = [ parseInt( node[0]) + parseInt(neigh[0]),   parseInt(node[1]) + parseInt(neigh[1])];
    const neigbour = new Node(undefined,node.position[0] + neigh[0],node.position[1] + neigh[1]);
    const index = grid.findIndex(nd => nd.position[0] === neigbour.position[0] && neigbour.position[1] === nd.position[1] );
    if(index > -1){
      node.neighbours.push(grid[index]);
    }
  })
}

/**
 * 
 * @param {*} canvasContext 
 * @param {Node[]} grid 
 */
function renderGraph(canvasContext, grid){
  const spacing = 10
  canvasContext.fillStyle = "white"
  canvasContext.fillStroke = "black"
  grid.forEach( (node,i) => {
    renderNode(canvasContext,node);
  })
}
/**
 * 
 * @param {*} context 
 * @param {Node} node 
 * @param {string} color 
 */
function renderNode(canvasContext,node){
  canvasContext.fillRect(20 + node.position[0] * 60 ,20 + node.position[1] * 60,50,50);
  canvasContext.stroke();
}

class KnowledgeRow{
  id;
  distanceFromA;
  previousNode;
  /**
   * @param {Number} id
   * @param {Number} dA 
   * @param {Number} pN 
   */
  constructor(id,dA,pN){
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
async function dijkstraNavigation(grid,visitor,canvasContext){
  const knowledgeTable = new Array();
  knowledgeTable.push(new KnowledgeRow(visitor.visited[0].id,0,undefined));

  grid.forEach(node => {
    if(node.id !== visitor.visited[0].id){
      knowledgeTable.push(new KnowledgeRow(node.id,Number.POSITIVE_INFINITY,node.id));
    }
  });
  const unvisitedList = knowledgeTable.map(kr => kr.id); 

  knowledgeTable.sort((a,b)=>  b.distanceFromA - a.distanceFromA);

  

  while(unvisitedList.length){
    // visit next unkown vertice with shortest distance
    const unvNodeRef =  unvisitedList.shift();
    const unvNode =  grid.find(nod => nod.id === unvNodeRef);
    if(unvNode.id !== visitor.destination.id){
      canvasContext.fillStyle = "green";
      renderNode(canvasContext,unvNode);
    }
    
   // get neighbours for node
   const neighbours = grid[parseInt(unvNodeRef)].neighbours;
   neighbours.forEach(async neighbourNode => {
    if(neighbourNode.id !== visitor.destination.id){
      canvasContext.fillStyle = "lightBlue";
      renderNode(canvasContext,neighbourNode);
    } 
   
     if(unvisitedList.indexOf(neighbourNode.id) < 0 && neighbourNode.id !== visitor.destination.id){
      canvasContext.fillStyle = "lightGreen";
      renderNode(canvasContext,neighbourNode);
     }
    const unvNodekr = knowledgeTable.find(kr => kr.id === unvNode.id);
    const neighbourKr = knowledgeTable.find(kr => kr.id === neighbourNode.id);
    // for each calculate distance to startPoint
    const calculatedDistance =  unvNodekr.distanceFromA + 1;
    // if the calculated distance is lesser than previously known update value;
    if(calculatedDistance < neighbourKr.distanceFromA){
      neighbourKr.distanceFromA = calculatedDistance;
      neighbourKr.previousNode = unvNodeRef;
    }
   
   })
   //await new Promise(res => setTimeout(res,25));
   
   if(unvNodeRef !== visitor.destination.id){
   canvasContext.fillStyle = "lightGreen";
   renderNode(canvasContext,grid.find(nod => nod.id === unvNodeRef));
   }

  }
  console.log("knowledgeTable", knowledgeTable);

  const destinationKr = knowledgeTable.find( kr => kr.id === visitor.destination.id);
  let path = new Array();
  path.push(destinationKr);
  while(path.findIndex(kr => kr.id === "00") < 0){
    let next = knowledgeTable.find(kr => kr.id === path[path.length -1].previousNode);
    path.push(next);
  }
  console.log("path", path);

  path.reverse();

  async function walk(kr){
    const currNode = grid.find( node => node.id === kr.id);
    canvasContext.fillStyle = "purple";
    renderNode(canvasContext,currNode);
  }
  let i = 0;
  while(i < path.length){
    await new Promise(res => setTimeout(res,250));
    walk(path[i]);
    i++
  }
  path.forEach(walk)

  const lastVisitedIndex = grid.findIndex(nod => nod.id === visitor.visited[visitor.visited.length -1].id);
  
  

}

/**
 * @param {*} context
 * @param {Entity[]} entities 
 */
function renderEntities(context, entities){
    entities.forEach( ent => {
      ent.visited.forEach((node,i)=>{
        context.fillStyle = "yellow";
        renderNode(context,node);
      })
      context.fillStyle = "red";
      renderNode(context, ent.destination)
    })
}

const Square = { height: 13, width: 14 }


function App() {
  const grid = createGrid(10,10);
  const entities = new Array();
  const Canvas = props => {
    const canvasRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d');
      const visitor1 = new Entity();
      visitor1.visited.push(grid[0]);
      visitor1.destination = grid[79];
      entities.push(visitor1);
      //Our first draw
      context.fillStyle = '#d1d1d1'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      console.log(grid);
      renderGraph(context, grid);
      renderEntities(context, entities);
      dijkstraNavigation(grid,visitor1,context);    
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
