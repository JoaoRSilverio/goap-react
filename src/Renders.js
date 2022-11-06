import {getClosestToStart} from "./Helpers";
import {SPEED} from "./Constants";

export function renderNode(canvasContext, x, y, text) {
  console.assert(canvasContext, "no context");
  canvasContext.fillRect(20 + x * 16, 20 + y * 16, 15, 15);
  canvasContext.stroke();
  if (text) {
    canvasContext.fillStyle = "white";
    canvasContext.font = "10px Comic Sans MS";
    canvasContext.fillText(text, 20 + x * 16 + 2, 20 + y * 16 + 10, 12);
    canvasContext.stroke();
  }

}

export async function renderVisited(canvasContext, x, y, cost) {
  canvasContext.fillStyle = "green";
  renderNode(canvasContext, x, y, cost);
}

export function renderExplored(canvasContext, x, y) {
  canvasContext.fillStyle = "blue";
  renderNode(canvasContext, x, y);
}

export function renderPathNode(canvasContext, x, y) {
  canvasContext.fillStyle = "yellow";
  renderNode(canvasContext, x, y);
}

/**
 * @param {*} context
 * @param {Entity[]} entities 
 */
export function renderEntities(context, entities) {
  entities.forEach(ent => {
    ent.visited.forEach((node, i) => {
      context.fillStyle = "yellow";
      renderNode(context, node[0], node[1]);
    })
    context.fillStyle = "red";
    renderNode(context, ent.destination[0], ent.destination[1])
  })
}

/** 
* @param {*} canvasContext 
 * @param {Node[]} grid 
 */
export function renderGraph(canvasContext, grid) {
  const spacing = 10
  canvasContext.fillStyle = "white"
  canvasContext.fillStroke = "black"
  for (let i = 0; i < grid.length; i++) {
    renderNode(canvasContext, grid[i].coords[0], grid[i].coords[1]);
  }
}

export function renderSolution(canvasContext, distanceFromStart,destinationIndex,grid,visits,visitor){

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
  console.log(" shortest path", path);
  path.reverse();
  path.forEach( (cursor,i) => {
    visits++;
    const xPos = grid[cursor[0]].coords[0];
    const yPos = grid[cursor[0]].coords[1];
    setTimeout(()=>{
      renderPathNode(canvasContext, xPos, yPos)
    },visits * SPEED +100)
   
  });
  renderEntities(canvasContext,[visitor]);
}