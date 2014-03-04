_mw = 50;		// map width, in tiles
_mh = 100;		// map height, in tiles
_tsize = 16;		// tile size, in pixels
_indexCols = 32;	// sprites indice: number of columns
_indexRows = 48;	// sprites indice: number of rows
_selectorSize = 1;

map = [];
mapEntities = [];

Crafty.scene('Editor', function() {
	for (var x = 0; x < _mw; x++) {
		for (var y = 0; y < _mh; y++) {
			mapEntities[x][y] = Crafty.e('MapTile' + map[x][y]).at(x, y);
		}
	}

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

	mapSelector = Crafty.e("2D, Canvas, Selector").Selector(0, 0, 1);
	tileSelector = Crafty.e("2D, Canvas, Selector").Selector(_mw + 1, 0, 1);

	globalKeyboard = Crafty.e("Keyboard").requires('Keyboard').bind('KeyDown', function () {
		if (this.isDown('ADD') && _selectorSize < 3) {
			_selectorSize++;
			mapSelector.resize(_selectorSize);
			Game.requestRefresh();
		} else if (this.isDown('SUBSTRACT') && _selectorSize > 1) {
			_selectorSize--;
			mapSelector.resize(_selectorSize);
			Game.requestRefresh();
		}
	});
});

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

/*function initComponents() {
// Some stuff to be done only once, to convert sprites into 'IdxTileXXX' and 'MapTileXXX' entities.

}*/

Game = {
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
	requestRefresh: function() {
		if (this.redrawTimeout == null) {
			this.redrawTimeout = setTimeout(function() {	
				Crafty.DrawManager.drawAll();
				this.redrawTimeout = null;	
			}, 100);
		}
	},

	setTile: function(tile) {
		if (selectedTile != undefined) {
			var xstart = tile.x / _tsize;
			var ystart = tile.y / _tsize;
			for (var x = xstart; x < xstart + _selectorSize; x++) {
				for (var y = ystart; y < ystart + _selectorSize; y++) {
					mapEntities[x][y].destroy();
					mapEntities[x][y] = Crafty.e('MapTile' + selectedTile.idx).at(x, y);
					map[x][y] = selectedTile.idx;
				}
			}
		}
	}
}
