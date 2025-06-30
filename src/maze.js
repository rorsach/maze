/**
 * Build a Maze Using recursive backtracking and print out an ascii representation
 */

import { currentAnimationSpeed, isPaused, shouldFinish } from './main.js';

function Cell() {
	this.isVisited = false;
	this.directions = [0,1,2,3];
	this.top	= 1; // 0001 << 0 = 0001 = 1
	this.right	= 2; // 0001 << 1 = 0010 = 2
	this.bottom = 4; // 0001 << 2 = 0100 = 4
	this.left	= 8; // 0001 << 3 = 1000 = 8
	this.walls = this.top | this.right | this.bottom | this.left;
	this.nextCellList = shuffleArray(this.directions);
}

Cell.prototype.deleteWall = function (direction) {
	direction  = 0b0001 << direction;
	switch (direction) {
	case this.top:
		this.top = 0;
		break;
	case this.right:
		this.right = 0;
		break;
	case this.bottom:
		this.bottom = 0;
		break;
	case this.left:
		this.left = 0;
		break;
	default:
		// do nothing
	}
	this.walls = this.top | this.right | this.bottom | this.left; 
};

Cell.prototype.deleteWallReverse = function(direction) {
	this.deleteWall(this.reverse(direction));
};

Cell.prototype.reverse = function(direction) {
	let reverse;
	switch (direction) {
	case 0: reverse = 2; break;
	case 1: reverse = 3; break;
	case 2: reverse = 0; break;
	case 3: reverse = 1; break;
	}
	return reverse;
};
    
function Maze(width, height) {
	this.width = width;
	this.height = height;
	this.grid = this.generateGrid(this.width, this.height);
}

Maze.prototype.generateGrid = function (width, height) {
	const length = width * height;
	const grid = [];
	for (let i = 0; i < length; i++) {
		grid.push(new Cell());
	}
	return grid;
};

Maze.prototype.getCell = function (x, y) {
	return this.grid[x + this.width * y];
};

Maze.prototype.getGridIndex = function (x, y) {
    return x + this.width * y;
};

Maze.prototype.isInGrid = function (x, y) {
	const isInHorizontalBound = x < this.width && x >= 0;
	const isInVerticalBound = y < this.height && y >= 0;
	return isInHorizontalBound && isInVerticalBound;
};

Maze.prototype.getDirectionDelta = function (direction) {
	let dx = 0, dy = 0;
	switch (direction) {
	case 0: dy = -1; break;
	case 1: dx = 1; break;
	case 2: dy = 1; break;
	case 3: dx = -1; break;
	}
	return { x: dx, y: dy };
};

Maze.prototype.burrow = function (x, y) { 
	const cell = this.getCell(x, y);
	cell.visited = true;
	cell.nextCellList.forEach(nextCellDirection => {
		const delta = this.getDirectionDelta(nextCellDirection);
		const xNext = x + delta.x;
		const yNext = y + delta.y;
		const nextCell = this.getCell(xNext, yNext);
		if (nextCell && !nextCell.visited && this.isInGrid(xNext, yNext)) {
			cell.deleteWall(nextCellDirection);
			nextCell.deleteWallReverse(nextCellDirection);
			this.burrow(xNext, yNext);
		}
	}, this);
};

Maze.prototype.burrowAnimated = function (x, y) {
	const self = this;
	return new Promise(function(resolve) {
		const cell = self.getCell(x, y);
		cell.visited = true;
		self.styleCell(x, y, 'current', true);
		
		let directionIndex = 0;
		function processNextDirection() {
            if (shouldFinish) {
                self.styleCell(x, y, 'current', false);
                return resolve();
            }
			if (isPaused) {
				setTimeout(processNextDirection, 100);
				return;
			}
			if (directionIndex >= cell.nextCellList.length) {
				self.styleCell(x, y, 'current', false);
				return resolve();
			}
			
			const nextCellDirection = cell.nextCellList[directionIndex];
			const delta = self.getDirectionDelta(nextCellDirection);
			const xNext = x + delta.x;
			const yNext = y + delta.y;
			const nextCell = self.getCell(xNext, yNext);
			
			if (nextCell && !nextCell.visited && self.isInGrid(xNext, yNext)) {
				cell.deleteWall(nextCellDirection);
				nextCell.deleteWallReverse(nextCellDirection);
				self.drawDivs('mazeDivs');
				
				setTimeout(() => {
					self.burrowAnimated(xNext, yNext).then(() => {
						directionIndex++;
						processNextDirection();
					});
				}, currentAnimationSpeed);
			} else {
				directionIndex++;
				processNextDirection();
			}
		}
		processNextDirection();
	});
};

Maze.prototype.shortestPath = function(start, end) {
    const queue = [new NodeTag(start, null)];
    const visited = new Set();
    visited.add(`${start[0]}-${start[1]}`);

    while (queue.length > 0) {
        const currentNode = queue.shift();
        const [x, y] = currentNode.node;

        if (x === end[0] && y === end[1]) {
            return currentNode;
        }

        const neighbors = this.neighbors(x, y);
        for (const neighbor of neighbors) {
            const key = `${neighbor[0]}-${neighbor[1]}`;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push(new NodeTag(neighbor, currentNode));
            }
        }
    }
    return undefined;
};

Maze.prototype.shortestPathAnimated = function(start, end) {
    const self = this;
    return new Promise(function(resolve) {
        const queue = [new NodeTag(start, null)];
        const visited = new Set();
        visited.add(`${start[0]}-${start[1]}`);
        
        function processNextNode() {
            if (shouldFinish) return resolve(null);
            if (isPaused) {
                setTimeout(processNextNode, 100);
                return;
            }
            if (queue.length === 0) return resolve(undefined);
            
            const currentNode = queue.shift();
            const [x, y] = currentNode.node;
            self.styleCell(x, y, 'searching', true);

            if (x === end[0] && y === end[1]) {
                self.clearSearchVisualization();
                return resolve(currentNode);
            }

            const neighbors = self.neighbors(x, y);
            for (const neighbor of neighbors) {
                const key = `${neighbor[0]}-${neighbor[1]}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(new NodeTag(neighbor, currentNode));
                }
            }
            setTimeout(processNextNode, Math.max(currentAnimationSpeed / 2, 10));
        }
        processNextNode();
    });
};

Maze.prototype.clearSearchVisualization = function() {
    document.querySelectorAll('#mazeDivs div.searching').forEach(div => div.classList.remove('searching'));
};

Maze.prototype.drawShortestPathAnimated = function(node) {
    const self = this;
    return new Promise(function(resolve) {
        const path = [];
        let parent = node;
        while (parent !== null) {
            path.unshift(parent.node);
            parent = parent.parent;
        }
        
        let index = 0;
        function drawStep() {
            if (shouldFinish) return resolve();
            if (isPaused) {
                setTimeout(drawStep, 100);
                return;
            }
            if (index >= path.length) return resolve();
            
            const coords = path[index];
            self.styleCell(coords[0], coords[1], 'red', true);
            index++;
            setTimeout(drawStep, Math.max(currentAnimationSpeed / 3, 5));
        }
        drawStep();
    });
};

Maze.prototype.neighbors = function(x, y) {
    const cell = this.getCell(x, y);
    const neighbors = [];
    if (!cell.top) neighbors.push([x, y - 1]);
    if (!cell.right) neighbors.push([x + 1, y]);
    if (!cell.bottom) neighbors.push([x, y + 1]);
    if (!cell.left) neighbors.push([x - 1, y]);
    return neighbors;
};

Maze.prototype.drawDivs = function(idSelector) {
    const el = document.getElementById(idSelector);
    const frag = document.createDocumentFragment();
    el.innerHTML = '';
    
    for (let i = 0; i < this.grid.length; i++) {
        const cell = this.grid[i];
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        if (cell.visited) cellDiv.classList.add('cellUnvisited');
        if (cell.top) cellDiv.classList.add('cellTop');
        if (cell.right) cellDiv.classList.add('cellRight');
        if (cell.bottom) cellDiv.classList.add('cellBottom');
        if (cell.left) cellDiv.classList.add('cellLeft');
        if (i % this.width === 0 && i !== 0) {
            frag.appendChild(document.createElement('br'));
        }
        frag.appendChild(cellDiv);
    }
    el.appendChild(frag);
};

Maze.prototype.drawShortestPath = function(node) {
    let parent = node;
    while (parent !== null) {
        this.styleCell(parent.node[0], parent.node[1], 'red', true);
        parent = parent.parent;
    }
};

Maze.prototype.styleCell = function(x, y, className, isToAdd) {
    const div = document.querySelectorAll('#mazeDivs div')[this.getGridIndex(x, y)];
    if (div) {
        if (isToAdd) div.classList.add(className);
        else div.classList.remove(className);
    }
};

function NodeTag(node, parent) {
    this.node = node;
    this.parent = parent;
}

function shuffleArray(array) {
	const arr = array.slice();
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export { Maze, Cell, NodeTag };
