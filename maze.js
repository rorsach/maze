/**
 * Build a Maze Using recursive backtracking and print out an ascii representation
 */
(function() {
	
	function Cell() {
		this.visited = false;
		this.top	= 1; // 0001 << 0 = 0001 = 1
		this.right	= 2; // 0001 << 1 = 0010 = 2
		this.bottom = 4; // 0001 << 2 = 0100 = 4
		this.left	= 8; // 0001 << 3 = 1000 = 8
		this.walls = this.top | this.right | this.bottom | this.left; 
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
		// Update walls otherwise this will contain original value.
		this.walls = this.top | this.right | this.bottom | this.left; 
	};

	function Maze(width, height) {
		this.width = width;
		this.height = height;
		this.grid = this.generateGrid(this.width, this.height);
		this.up = 0;
		this.down = 0;
		this.left = 0;
		this.right = 0;
	}

	Maze.prototype.generateGrid = function (width, height) {
		var length = width * height;
		var grid = [];
		var i;
		
		for (i = 0; i < length; i++) {
			grid.push(new Cell());
		}

		return grid;
	};

	Maze.prototype.getCell = function (x, y) {
		return this.grid[x + this.width * y];
	};

	Maze.prototype.isInGrid = function (x, y) {
		var isInHorizontalBound = x < this.width && x >= 0;
		var isInVerticalBound = y < this.height && y >= 0;
		return isInHorizontalBound && isInVerticalBound;
	};

	Maze.prototype.burrow = function (visitedCells, direction, x1, y1) { 
		var cell;
		var wallString;
		visitedCells = visitedCells || [];
		if (this.isInGrid(x1, y1)) {
			cell = this.getCell(x1, y1);
			if (!cell.visited) {
				cell.visited = true;
				visitedCells.push(cell);
			} else {
				if (cell.walls > 0) {
					wallString = (cell.walls >>> 0).toString(2);
					wallString = zeroPad(wallString, 4);
					window.console && console.log(wallString);
				} else {
					return false;
				}
			}
		} else {
			return false;
		}
		
		// recurse
		direction = randomRangeInt(0, 3);
		cell.deleteWall(direction);
		
		if (direction === 0) {
			this.up++;
			this.burrow(visitedCells, direction, x1, y1 - 1);
		} else if (direction === 1) {
			this.right++;
			this.burrow(visitedCells, direction, x1 + 1, y1);
		} else if (direction === 2) {
			this.down++;
			this.burrow(visitedCells, direction, x1, y1 + 1);
		} else if (direction === 3) {
			this.left++;
			this.burrow(visitedCells, direction, x1 - 1, y1);
		}

		return visitedCells;
	};

	Maze.prototype.draw = function(idSelector) {
		var element = document.getElementById(idSelector);
		var output = '';
		var i;
		var len;
		for (i = 0, len = this.grid.length; i < len; i++) {
			if (i % (this.width) === 0) {
				output += '\n';
			}
			output += this.grid[i].visited ? '&middot;' : '&#x25A0;';
		}
		element.innerHTML = output;
	};

	function randomRangeInt(min, max) {
		return Math.floor( ( Math.random() * (max-min+1) ) + min);
	}

	function zeroPad(num, len) {
		var output = num.toString();
		while (output.length < len) {
			output = "0" + output;
		}
		return output;
	}
	// clamp : function(c, b, d) {
	// 	return (d > b) ? b : (d < c) ? c : d
	// },
	
	var maze = new Maze(10, 10);

	window.console && console.log(maze.isInGrid(9, 10));
	window.console && console.log(maze.grid);

	window.console && console.log(maze.draw('mazeOutput'));

	maze.burrow([], 2, 5, 5);
	
	window.console && console.log(maze.draw('mazeOutput'));
	
	document.querySelector('.c-generateMaze').addEventListener('click', function(event) {
		maze = new Maze(10, 10);
		maze.burrow([], 2, 5, 5);
		maze.draw('mazeOutput');
	});

	// var counter = {
	// 	a0: 0,
	// 	a1: 0,
	// 	a2: 0,
	// 	a3: 0
	// };
	// for (var i = 0; i < 10000; i++) {
	// 	var rand = randomRangeInt(0, 3);
	// 	counter['a' + rand]++;
	// }
	// window.console && console.log(counter);
})();
