/**
 * Build a Maze Using recursive backtracking and print out an ascii representation
 */

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
	case this.top: this.top = 0; break;
	case this.right: this.right = 0; break;
	case this.bottom: this.bottom = 0; break;
	case this.left: this.left = 0; break;
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
    this.animationState = {};
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
	const stack = [[x, y]];
    this.getCell(x, y).visited = true;

    while (stack.length > 0) {
        const [cx, cy] = stack[stack.length - 1];
        const cell = this.getCell(cx, cy);
        
        const unvisitedNeighbors = [];
        cell.nextCellList.forEach(dir => {
            const delta = this.getDirectionDelta(dir);
            const nx = cx + delta.x;
            const ny = cy + delta.y;
            if (this.isInGrid(nx, ny) && !this.getCell(nx, ny).visited) {
                unvisitedNeighbors.push({ x: nx, y: ny, dir });
            }
        });

        if (unvisitedNeighbors.length > 0) {
            const { x: nx, y: ny, dir } = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
            const nextCell = this.getCell(nx, ny);
            cell.deleteWall(dir);
            nextCell.deleteWallReverse(dir);
            nextCell.visited = true;
            stack.push([nx, ny]);
        } else {
            stack.pop();
        }
    }
};

Maze.prototype.initBurrowAnimated = function(x, y) {
    this.animationState.burrowStack = [[x, y]];
    this.getCell(x, y).visited = true;
    this.drawDivs('mazeDivs');
};

Maze.prototype.stepBurrowAnimated = function() {
    const stack = this.animationState.burrowStack;
    if (stack.length === 0) return true; // Done

    const [cx, cy] = stack[stack.length - 1];
    const cell = this.getCell(cx, cy);
    this.styleCell(cx, cy, 'current', true);

    const unvisitedNeighbors = [];
    cell.nextCellList.forEach(dir => {
        const delta = this.getDirectionDelta(dir);
        const nx = cx + delta.x;
        const ny = cy + delta.y;
        if (this.isInGrid(nx, ny) && !this.getCell(nx, ny).visited) {
            unvisitedNeighbors.push({ x: nx, y: ny, dir });
        }
    });

    if (unvisitedNeighbors.length > 0) {
        const { x: nx, y: ny, dir } = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
        const nextCell = this.getCell(nx, ny);
        cell.deleteWall(dir);
        nextCell.deleteWallReverse(dir);
        nextCell.visited = true;
        stack.push([nx, ny]);
        
        // Only update the specific cells that changed
        this.updateCellDiv(cx, cy);
        this.updateCellDiv(nx, ny);
    } else {
        stack.pop();
    }
    
    this.styleCell(cx, cy, 'current', false);
    return false;
};

Maze.prototype.shortestPath = function(start, end) {
    const queue = [new NodeTag(start, null)];
    const visited = new Set([`${start[0]}-${start[1]}`]);

    while (queue.length > 0) {
        const currentNode = queue.shift();
        const [x, y] = currentNode.node;
        if (x === end[0] && y === end[1]) return currentNode;
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

Maze.prototype.initShortestPathAnimated = function(start, end) {
    this.animationState.pathQueue = [new NodeTag(start, null)];
    this.animationState.pathVisited = new Set([`${start[0]}-${start[1]}`]);
    this.animationState.pathEnd = end;
};

Maze.prototype.stepShortestPathAnimated = function() {
    const queue = this.animationState.pathQueue;
    const visited = this.animationState.pathVisited;
    const end = this.animationState.pathEnd;

    if (queue.length === 0) return { done: true, path: undefined };

    const currentNode = queue.shift();
    const [x, y] = currentNode.node;
    this.styleCell(x, y, 'searching', true);

    if (x === end[0] && y === end[1]) {
        this.clearSearchVisualization();
        return { done: true, path: currentNode };
    }

    const neighbors = this.neighbors(x, y);
    for (const neighbor of neighbors) {
        const key = `${neighbor[0]}-${neighbor[1]}`;
        if (!visited.has(key)) {
            visited.add(key);
            queue.push(new NodeTag(neighbor, currentNode));
        }
    }
    return { done: false, path: undefined };
};

Maze.prototype.clearSearchVisualization = function() {
    document.querySelectorAll('#mazeDivs div.searching').forEach(div => div.classList.remove('searching'));
};

Maze.prototype.initDrawShortestPathAnimated = function(node) {
    const path = [];
    let parent = node;
    while (parent !== null) {
        path.unshift(parent.node);
        parent = parent.parent;
    }
    this.animationState.path = path;
    this.animationState.pathIndex = 0;
};

Maze.prototype.stepDrawShortestPathAnimated = function() {
    const path = this.animationState.path;
    const index = this.animationState.pathIndex;
    if (index >= path.length) return true;

    const coords = path[index];
    this.styleCell(coords[0], coords[1], 'red', true);
    this.animationState.pathIndex++;
    return false;
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

Maze.prototype.updateCellDiv = function(x, y) {
    const cell = this.getCell(x, y);
    const div = document.querySelectorAll('#mazeDivs div')[this.getGridIndex(x, y)];
    if (!div) return;
    
    // Update wall classes
    div.classList.toggle('cellTop', !!cell.top);
    div.classList.toggle('cellRight', !!cell.right);
    div.classList.toggle('cellBottom', !!cell.bottom);
    div.classList.toggle('cellLeft', !!cell.left);
    div.classList.toggle('cellUnvisited', cell.visited);
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
