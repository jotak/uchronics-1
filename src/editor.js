_mw = 50;		// map width, in tiles
_mh = 100;		// map height, in tiles
_tsize = 16;		// tile size, in pixels
_indexCols = 32;	// sprites indice: number of columns
_indexRows = 48;	// sprites indice: number of rows
_selectorSize = 1;

map = [];
mapEntities = [];

// The main scene
Crafty.scene('Editor', function() {
	// Create one entity per map tile
	for (var x = 0; x < _mw; x++) {
		for (var y = 0; y < _mh; y++) {
			mapEntities[x][y] = Crafty.e('MapTile' + map[x][y]).at(x, y);
		}
	}

	// Create one entity per index tile
	var i = 0;
	for (var x = 0; x < _indexCols; x++) {
		for (var y = 0; y < _indexRows; y++) {
			var ent = Crafty.e('IdxTile' + i).at(_mw + 1 + x, y);
			if (i == 0) {
				selectedTile = ent;
			}
			i++;
		}
	}

	// Create the map selector (cursor) entity
	mapSelector = Crafty.e("2D, Canvas, Selector").Selector(0, 0, 1);
	// Create the tile index selector (cursor) entity
	tileSelector = Crafty.e("2D, Canvas, Selector").Selector(_mw + 1, 0, 1);

	// Global keyboard entity handles all "global" key events:
	// '+' and '-' keys to increase/decrease map selector size
	// CTRL-[SHIFT-]Z to navigate in history buffer
	globalKeyboard = Crafty.e("Keyboard").requires('Keyboard').bind('KeyDown', function () {
		if (this.isDown('ADD') && _selectorSize < 3) {
			_selectorSize++;
			mapSelector.resize(_selectorSize);
			Game.requestRefresh();
		} else if (this.isDown('SUBSTRACT') && _selectorSize > 1) {
			_selectorSize--;
			mapSelector.resize(_selectorSize);
			Game.requestRefresh();
		} else if (this.isDown('Z') && this.isDown('CTRL')) {
			var histItems = null;
			var takeNew = false;
			if (this.isDown('SHIFT')) {
				histData = History.unpop();
				takeNew = true;
			} else {
				histData = History.pop();
			}
			if (histData != null) {
				for (var idx in histData) {
					var item = histData[idx];
					Game.setSingleTile(item.x, item.y, takeNew ? item.new : item.old);
				}
			}
		}
	});
});

// "Loading" scene: loads sprites then calls "Editor" scene
Crafty.scene('Loading', function(){
	Crafty.load(['assets/Ultima_sprites.png'], function() {
		var allSprites = {};
		var i = 0;
		for (var x = 0; x < _indexCols; x++) {
			for (var y = 0; y < _indexRows; y++) {
				allSprites["spr_" + i] = [x,y];
				i++;
			}
		}
		Crafty.sprite(16, 'assets/Ultima_sprites.png', allSprites);
		Crafty.scene('Editor');
	});
});

Game = {

	// Game initialization
	start: function() {
		Crafty.init(_mw * _tsize + (_indexCols+1)*_tsize, (1+Math.max(_mh,_indexRows)) * _tsize);
		for (var x = 0; x < _mw; x++) {
			if (map[x] == undefined) {
				map[x] = [];
			}
			mapEntities[x] = [];
			if (map[x][0] == undefined) {
				for (var y = 0; y < _mh; y++) {
					map[x][y] = 193;
				}
			}
		}
		Crafty.background('grey');
		Crafty.scene('Loading');
	},

	redrawTimeout: null,
	// Refresh whole screen is requested
	requestRefresh: function() {
		// Call Crafty.DrawManager.drawAll();
		// But never twice or more within 100 ms (it's time-consuming)
		if (this.redrawTimeout == null) {
			this.redrawTimeout = setTimeout(function() {	
				Crafty.DrawManager.drawAll();
				this.redrawTimeout = null;	
			}, 100);
		}
	},

	// Set value on given single tile
	// Returns true if value was actually updated (different from old value)
	setSingleTile: function(x, y, val) {
		if (map[x][y] != val) {
			mapEntities[x][y].destroy();
			mapEntities[x][y] = Crafty.e('MapTile' + val).at(x, y);
			map[x][y] = val;
			return true;
		} else {
			return false;
		}
	},

	// Apply input tile on selection, and log change in history
	setTileWithSelection: function(tile) {
		if (selectedTile != undefined) {
			var xstart = tile.x / _tsize;
			var ystart = tile.y / _tsize;
			var histData = [];
			for (var x = xstart; x < xstart + _selectorSize; x++) {
				for (var y = ystart; y < ystart + _selectorSize; y++) {
					var histItem = {
						x: x,
						y: y,
						old: map[x][y],
						new: selectedTile.idx
					};
					if (Game.setSingleTile(x, y, selectedTile.idx)) {
						histData.push(histItem);
					}
				}
			}
			if (histData.length > 0) {
				History.push(histData);
			}
		}
	}
}
