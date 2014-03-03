// The Grid component allows an element to be located
// on a grid of tiles
Crafty.c('Tile', {
	init: function() {
		this.attr({
			w: _tsize,
			h: _tsize
		})
	},

	// Locate this entity at the given position on the grid
	at: function(x, y) {
		if (x === undefined && y === undefined) {
			return { x: this.x/_tsize, y: this.y/_tsize }
		} else {
			this.attr({ x: x * _tsize, y: y * _tsize });
			return this;
		}
	}
});

// Dynamically create components from each available tile
var i = 0;
for (var x = 0; x < _indexCols; x++) {
	for (var y = 0; y < _indexRows; y++) {
		Crafty.c('IdxTile' + i, {
			init: function(inner_i) { return function() {
				this.idx = inner_i;
				this.requires('2D, Canvas, Tile, Mouse, ' + "spr_" + inner_i);
				this.bind('Click', function(data) {
					selectedTile = this;
					tileSelector.x = this.x;
					tileSelector.y = this.y;
					Game.requestRefresh();
				});
				this.bind('DoubleClick', function(data) {
					if (confirm("Reset whole map with tile?")) {
						var tileName = 'MapTile' + this.idx;
						for (var x = 0; x < _mw; x++) {
							for (var y = 0; y < _mh; y++) {
								mapEntities[x][y].destroy();
								mapEntities[x][y] = Crafty.e(tileName).at(x, y);
								map[x][y] = this.idx;
							}
						}
						Game.requestRefresh();
					}
				});
			}}(i)
		});
		Crafty.c('MapTile' + i, {
			init: function(inner_i) { return function() {
				this.idx = inner_i;
				this.requires('2D, Canvas, Tile, Mouse, Keyboard, ' + "spr_" + inner_i);
				this.bind('Click', function(data) {
					Game.setTile(this);
				});
				this.bind('MouseOver', function(data) {
					mapSelector.x = this.x;
					mapSelector.y = this.y;
					Game.requestRefresh();
					if (this.isDown("SHIFT")) {
						Game.setTile(this);
					}
				});
			}}(i)
		});
		i++;
	}
}

Crafty.c("Selector", {
	Selector: function(x, y, size) {
		this.w = size * _tsize;
		this.h = size * _tsize;
		this.x = x * _tsize;
		this.y = y * _tsize;
		return this;
	},

	resize: function(size) {
		this.w = size * _tsize;
		this.h = size * _tsize;
		return this;
	},

	draw: function() {
		var ctx = Crafty.canvas.context;
		ctx.strokeStyle = "#AA9900";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
	}
});
