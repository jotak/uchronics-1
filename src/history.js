// History buffer for handling undo/redo
History = {
	SIZE: 100,
	stack: [],
	cursor: 0,
	top: 0,
	push: function(histData) {
		this.stack[this.cursor++] = histData;
		this.cursor %= this.SIZE;
		this.top = this.cursor;
	},
	pop: function() {
		var nextCursor = (this.cursor + this.SIZE - 1) % this.SIZE;
		if (nextCursor == this.top || this.stack[nextCursor] == undefined) {
			// already popped full history
			return null;
		} else {
			this.cursor = nextCursor;
			return this.stack[this.cursor];
		}
	},
	unpop: function() {
		if (this.cursor == this.top) {
			// Reach top
			return null;
		} else {
			var item = this.stack[this.cursor];
			this.cursor = (this.cursor + 1) % this.SIZE;
			return item;
		}
	}
};
