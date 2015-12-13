/**
 * Build a Maze Using recursive backtracking and print out an ascii representation
 */
// (function() {


	
	function Cell() {
		this.visited = false;
		this.top	= 1; // 0001
		this.right	= 2; // 0010
		this.bottom = 4; // 0100
		this.left	= 8; // 1000
		this.walls = this.top | this.right | this.bottom | this.left; 
	}

	function Maze(width, height) {
		this.width = width;
		this.height = height;
		this.grid = this.generateGrid(this.width, this.height);
	}

	Maze.prototype.generateGrid = function(width, height) {
		var length = width * height;
		var grid = [];
		var i;
		
		for (i = 0; i < length; i++) {
			grid.push(new Cell());
		}

		return grid;
	};

	Maze.prototype.getXYIndex = function (x, y) {
		return this.grid[x + this.width * y];
	};

	Maze.prototype.isInGrid = function (x, y) {
		var isInHorizontalBound = x < this.width && x >= 0;
		var isInVerticalBound = x < this.height && y >= 0;
		return isInHorizontalBound && isInVerticalBound;
	};

	Maze.prototype.burrow = function (x, y) {
		var direction; 
		var currentCell;
		var isInGrid = this.isInGrid(x, y);
		if (isInGrid) {
			currentCell = this.grid[this.getXYIndex(x, y)];
			currentCell.visited = true;
		} else {
			return;
		}
		
		// recurse
		direction = randomRangeInt(0,3);
		if (direction === 0) {
			this.burrow(x, y - 1);
		} else if (direction === 1) {
			this.burrow(x + 1, y);
		} else if (direction === 2) {
			this.burrow(x, y + 1);
		} else if (direction === 3) {
			this.burrow(x - 1, y);
		}
	};

	function randomRangeInt(min, max) {
		return Math.round( ( Math.random() * (max-min) ) + min);
	}

	var maze = new Maze(10, 10);

	window.console && console.log(maze.grid);
	
// })();
