$(function() {
	var templates = {
		table: '<div class="board"></div>',
		row: '<div class="row"></div>',
		cell: '<div class="cell"></div>',
		img: '<img class="chessman"/>',
        request: '<div class="request-wrapper"><div class="request"><div class="text">Выберите фигуру:</div><div class="pieces"></div></div></div>',
        response: '<div class="response-wrapper"><div class="text"></div></div>'
	};

	var images = {
		king: {dark: 'img/king_dark.svg', light: 'img/king_light.svg'},
		queen: {dark: 'img/queen_dark.svg', light: 'img/queen_light.svg'},
		rook: {dark: 'img/rook_dark.svg', light: 'img/rook_light.svg'},
		bishop: {dark: 'img/bishop_dark.svg', light: 'img/bishop_light.svg'},
		knight: {dark: 'img/knight_dark.svg', light: 'img/knight_light.svg'},
		pawn: {dark: 'img/pawn_dark.svg', light: 'img/pawn_light.svg'}
	};

    var finder = new function() {
        this.size = 8;
        this.$cells = new Array(this.size);
        for (var i = 0; i < this.size; i++) {
            this.$cells[i] = new Array(this.size);
        }

        this.addCell = function(x, y) {
            this.$cells[x][y] = $('[data-x=' + x + '][data-y=' + y + ']');
        };

        this.cell = function(x, y) {
            return this.$cells[x][y];
        };
    };

	// color: "dark" / "light"
	function King (color, x, y) {
		this.color = color;
		this.$chessman = $(templates.img);
		this.x = x;
		this.y = y;
		this.moves = [];
		this.moved = false;
		this.locked = false;
        this.currentX = x;
        this.currentY = y;

		this.$chessman.addClass(color);
		this.color === "dark" ?
		   this.$chessman.attr('src', images.king.dark) : this.$chessman.attr('src', images.king.light);
		$(finder.cell(this.x, this.y)).append(this.$chessman);

		this.$chessman.on("click", function(e) {
			if (this.color === board.move) {
				board.clearAvailableMoves();
				this.availableMoves();
				e.stopPropagation();
			}
		}.bind(this));
	}

	King.prototype = new function() {
		var move = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');
            this.currentX = this.x;
            this.currentY = this.y;

			if (board.matrix[this.x][this.y] != null)
				board.kill(this.x, this.y);

			this.moved = true;
			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
			board.changePlayer();
		};

		var castlingMove = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');
            this.currentX = this.x;
            this.currentY = this.y;

			this.moved = true;
			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
			this.y === 2? board.matrix[this.x][0].castlingMove() : board.matrix[this.x][7].castlingMove();
			board.changePlayer();
		};

        var shift = [
            {x: 1, y: 0},
            {x: -1, y: 0},
            {x: 0, y: 1},
            {x: 0, y: -1},
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: 1},
            {x: -1, y: -1}
        ];

		this.findMoves = function() {
			board.matrix[this.x][this.y] = null;
			shift.forEach(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;

				if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                    if (!board.matrix[x][y]) {
                        board.matrix[x][y] = this;
                        this.currentX = x;
                        this.currentY = y;
                        if (!board.canKillKing())
                            this.moves.push({x: x, y: y});

                        board.matrix[x][y] = null;
                        x += item.x;
                        y += item.y;
                    }
                    else if (board.matrix[x][y].color != this.color) {
                        var temp = board.matrix[x][y];
                        temp.locked = true;
                        board.matrix[x][y] = this;
                        this.currentX = x;
                        this.currentY = y;

                        if (!board.canKillKing())
                            this.moves.push({x: x, y: y});

                        temp.locked = false;
                        board.matrix[x][y] = temp;
                    }
                }
			}.bind(this));

			var can = true;
			var i = 0;
			if (!this.moved) {
				if (board.matrix[this.x][3] === null && board.matrix[this.x][2] === null &&
					board.matrix[this.x][1] === null && board.matrix[this.x][0] !== null &&
					board.matrix[this.x][0].color === this.color && board.matrix[this.x][0] instanceof Rook &&
					!board.matrix[this.x][0].moved) {
						can = true;

						for (i = this.y; i >= 2 && can; i--) {
							board.matrix[this.x][i] = this;
                            this.currentX = this.x;
                            this.currentY = i;
							if (board.canKillKing())
								can = false;
							board.matrix[this.x][i] = null;
						}

						if (can)
							this.moves.push({x: this.x, y: 2, castling: true});
				}

				if (board.matrix[this.x][5] === null && board.matrix[this.x][6] === null &&
					board.matrix[this.x][7] !== null && board.matrix[this.x][7].color === this.color &&
					board.matrix[this.x][7] instanceof Rook && !board.matrix[this.x][7].moved) {
						can = true;

						for (i = this.y; i <= 6 && can; i++) {
							board.matrix[this.x][i] = this;
                            this.currentX = this.x;
                            this.currentY = i;
							if (board.canKillKing())
								can = false;
							board.matrix[this.x][i] = null;
						}

						if (can)
							this.moves.push({x: this.x, y: 6, castling: true});
				}
			}

			board.matrix[this.x][this.y] = this;
            this.currentX = this.x;
            this.currentY = this.y;
			return this.moves.length;
		};

		this.availableMoves = function() {
			this.moves.forEach(function(item) {
				if (!item.castling)
					$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this));
				else
					$(finder.cell(item.x, item.y)).addClass('available').on('click', castlingMove.bind(this));
			}.bind(this));
		};

		this.clearMovesArray = function () {
			this.moves = [];
		};

		this.canKill = function(xKing, yKing) {
			return shift.some(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				return x === xKing && y === yKing;
			}.bind(this));
		};

		this.constructor = King;
	};

	function Queen (color, x, y) {
		this.color = color;
		this.$chessman = $(templates.img);
		this.x = x;
		this.y = y;
		this.moves = [];
		this.locked = false;

		this.$chessman.addClass(color);
		this.color === "dark" ?
			this.$chessman.attr('src', images.queen.dark) : this.$chessman.attr('src', images.queen.light);
		$(finder.cell(this.x, this.y)).append(this.$chessman);

		this.$chessman.on("click", function(e) {
			if (this.color === board.move) {
				board.clearAvailableMoves();
				this.availableMoves();
				e.stopPropagation();
			}
		}.bind(this));
	}

	Queen.prototype = new function(){
		var move = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');

			if (board.matrix[this.x][this.y] != null)
				board.kill(this.x, this.y);

			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
			board.changePlayer();
		};

		var shift = [
			{x: 1, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1},
			{x: 1, y: 1},
			{x: 1, y: -1},
			{x: -1, y: 1},
			{x: -1, y: -1}
		];

		this.findMoves = function() {
			board.matrix[this.x][this.y] = null;
			shift.forEach(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				while (x >= 0 && x <= 7 && y >= 0 && y <= 7 && !board.matrix[x][y]) {
					board.matrix[x][y] = this;
					if (!board.canKillKing())
						this.moves.push({x: x, y: y});

					board.matrix[x][y] = null;
					x += item.x;
					y += item.y;
				}

				if (x >= 0 && x <= 7 && y >= 0 && y <= 7 && board.matrix[x][y].color != this.color) {
					var temp = board.matrix[x][y];
					temp.locked = true;
					board.matrix[x][y] = this;

					if (!board.canKillKing())
						this.moves.push({x: x, y: y});

					temp.locked = false;
					board.matrix[x][y] = temp;
				}
			}.bind(this));

			board.matrix[this.x][this.y] = this;
			return this.moves.length;
		};

		this.availableMoves = function() {
			this.moves.forEach(function(item) {
					$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this));
			}.bind(this));
		};

		this.clearMovesArray = function () {
			this.moves = [];
		};

		this.canKill = function(xKing, yKing) {
			return shift.some(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				while (x >= 0 && x <= 7 && y >= 0 && y <= 7 && !board.matrix[x][y]) {
					x += item.x;
					y += item.y;
				}
				return x === xKing && y === yKing;
			}.bind(this));
		};

		this.constructor = Queen;
	};

	function Rook (color, x, y) {
		this.color = color;
		this.$chessman = $(templates.img);
		this.x = x;
		this.y = y;
		this.moves = [];
		this.moved = false;
		this.locked = false;

		this.$chessman.addClass(color);
		this.color === "dark" ?
			this.$chessman.attr('src', images.rook.dark) : this.$chessman.attr('src', images.rook.light);
		$(finder.cell(this.x, this.y)).append(this.$chessman);

		this.$chessman.on("click", function(e) {
			if (this.color === board.move) {
				board.clearAvailableMoves();
				this.availableMoves();
				e.stopPropagation();
			}
		}.bind(this));
	}

	Rook.prototype = new function(){
		var move = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');

			if (board.matrix[this.x][this.y] != null)
				board.kill(this.x, this.y);

			this.moved = true;
			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
			board.changePlayer();
		};

		this.castlingMove = function() {
			board.matrix[this.x][this.y] = null;
			this.y = this.y === 0 ? 3 : 5;
			this.moved = true;
			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
		};

		var shift = [
			{x: 1, y: 0},
			{x: -1, y: 0},
			{x: 0, y: 1},
			{x: 0, y: -1}
		];

		this.findMoves = function() {
			board.matrix[this.x][this.y] = null;
			shift.forEach(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				while (x >= 0 && x <= 7 && y >= 0 && y <= 7 && !board.matrix[x][y]) {
					board.matrix[x][y] = this;
					if (!board.canKillKing())
						this.moves.push({x: x, y: y});

					board.matrix[x][y] = null;
					x += item.x;
					y += item.y;
				}

				if (x >= 0 && x <= 7 && y >= 0 && y <= 7 && board.matrix[x][y].color != this.color) {
					var temp = board.matrix[x][y];
					temp.locked = true;
					board.matrix[x][y] = this;

					if (!board.canKillKing())
						this.moves.push({x: x, y: y});

					temp.locked = false;
					board.matrix[x][y] = temp;
				}
			}.bind(this));

			board.matrix[this.x][this.y] = this;
			return this.moves.length;
		};

		this.availableMoves = function() {
			this.moves.forEach(function(item) {
				$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this));
			}.bind(this));
		};

		this.clearMovesArray = function () {
			this.moves = [];
		};

		this.canKill = function(xKing, yKing) {
			return shift.some(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				while (x >= 0 && x <= 7 && y >= 0 && y <= 7 && !board.matrix[x][y]) {
					x += item.x;
					y += item.y;
				}
				return x === xKing && y === yKing;
			}.bind(this));
		};

		this.constructor = Rook;
	};

	function Knight (color, x, y) {
		this.color = color;
		this.$chessman = $(templates.img);
		this.x = x;
		this.y = y;
		this.moves = [];
		this.locked = false;

		this.$chessman.addClass(color);
		this.color === "dark" ?
			this.$chessman.attr('src', images.knight.dark) : this.$chessman.attr('src', images.knight.light);
		$(finder.cell(this.x, this.y)).append(this.$chessman);

		this.$chessman.on("click", function(e) {
			if (this.color === board.move) {
				board.clearAvailableMoves();
				this.availableMoves();
				e.stopPropagation();
			}
		}.bind(this));
	}

	Knight.prototype = new function(){
		var move = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');

			if (board.matrix[this.x][this.y] != null)
				board.kill(this.x, this.y);

			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
			board.changePlayer();
		};

		var shift = [
			{x: 2, y: 1},
			{x: 2, y: -1},
			{x: -2, y: 1},
			{x: -2, y: -1},
			{x: 1, y: 2},
			{x: 1, y: -2},
			{x: -1, y: 2},
			{x: -1, y: -2}
		];

		this.findMoves = function() {
			board.matrix[this.x][this.y] = null;
			shift.forEach(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;

				if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
					if (!board.matrix[x][y]) {
						board.matrix[x][y] = this;
						if (!board.canKillKing())
							this.moves.push({x: x, y: y});
						board.matrix[x][y] = null;
					}
					else if (board.matrix[x][y].color != this.color){
						var temp = board.matrix[x][y];
						temp.locked = true;
						board.matrix[x][y] = this;

						if (!board.canKillKing())
							this.moves.push({x: x, y: y});

						temp.locked = false;
						board.matrix[x][y] = temp;
					}
				}
			}.bind(this));

			board.matrix[this.x][this.y] = this;
			return this.moves.length;
		};

		this.availableMoves = function() {
			this.moves.forEach(function(item) {
				$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this));
			}.bind(this));
		};

		this.clearMovesArray = function () {
			this.moves = [];
		};

		this.canKill = function(xKing, yKing) {
			return shift.some(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				return x === xKing && y === yKing;
			}.bind(this));
		};

		this.constructor = Knight;
	};

	function Bishop (color, x, y) {
		this.color = color;
		this.$chessman = $(templates.img);
		this.x = x;
		this.y = y;
		this.moves = [];
		this.locked = false;

		this.$chessman.addClass(color);
		this.color === "dark" ?
			this.$chessman.attr('src', images.bishop.dark) : this.$chessman.attr('src', images.bishop.light);
		$(finder.cell(this.x, this.y)).append(this.$chessman);

		this.$chessman.on("click", function(e) {
			if (this.color === board.move) {
				board.clearAvailableMoves();
				this.availableMoves();
				e.stopPropagation();
			}
		}.bind(this));
	}

	Bishop.prototype = new function(){
		var move = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');

			if (board.matrix[this.x][this.y] != null)
				board.kill(this.x, this.y);

			this.moved = true;
			board.matrix[this.x][this.y] = this;
			this.$chessman.appendTo($(finder.cell(this.x, this.y)));
			board.changePlayer();
		};

		var shift = [
			{x: 1, y: 1},
			{x: 1, y: -1},
			{x: -1, y: 1},
			{x: -1, y: -1}
		];

		this.findMoves = function() {
			board.matrix[this.x][this.y] = null;
			shift.forEach(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				while (x >= 0 && x <= 7 && y >= 0 && y <= 7 && !board.matrix[x][y]) {
					board.matrix[x][y] = this;
					if (!board.canKillKing())
						this.moves.push({x: x, y: y});

					board.matrix[x][y] = null;
					x += item.x;
					y += item.y;
				}

				if (x >= 0 && x <= 7 && y >= 0 && y <= 7 && board.matrix[x][y].color != this.color) {
					var temp = board.matrix[x][y];
					temp.locked = true;
					board.matrix[x][y] = this;

					if (!board.canKillKing())
						this.moves.push({x: x, y: y});

					temp.locked = false;
					board.matrix[x][y] = temp;
				}
			}.bind(this));

			board.matrix[this.x][this.y] = this;
			return this.moves.length;
		};

		this.availableMoves = function() {
			this.moves.forEach(function(item) {
				$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this));
			}.bind(this));
		};

		this.clearMovesArray = function () {
			this.moves = [];
		};

		this.canKill = function(xKing, yKing) {
			return shift.some(function(item) {
				var x = this.x + item.x;
				var y = this.y + item.y;
				while (x >= 0 && x <= 7 && y >= 0 && y <= 7 && !board.matrix[x][y]) {
					x += item.x;
					y += item.y;
				}
				return x === xKing && y === yKing;
			}.bind(this));
		};

		this.constructor = Bishop;
	};

	function Pawn (color, x, y) {
		this.color = color;
		this.$chessman = $(templates.img);
		this.x = x;
		this.y = y;
		this.moves = [];
		this.moved = false;
		this.locked = false;

		this.$chessman.addClass(color);
		this.color === "dark" ?
			this.$chessman.attr('src', images.pawn.dark) : this.$chessman.attr('src', images.pawn.light);
		$(finder.cell(this.x, this.y)).append(this.$chessman);

		this.$chessman.on("click", function(e) {
			if (this.color === board.move) {
				board.clearAvailableMoves();
				this.availableMoves();
				e.stopPropagation();
			}
		}.bind(this));
	}

	Pawn.prototype = new function(){
		var move = function(e, ep) {
			if (e === true) {
				e = ep;
				ep = true;
			}

			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');

			if (board.matrix[this.x][this.y] != null)
				board.kill(this.x, this.y);

			if (this.x == 0 || this.x == 7) {
				this.$chessman.remove();
				board.showRequest(this.x, this.y);
				board.kill(this.x, this.y);
			}
			else {
				board.matrix[this.x][this.y] = this;
				this.$chessman.appendTo($(finder.cell(this.x, this.y)));
				this.moved = true;
                if (ep === true) {
                    board.enPassant = {
                        shadowX: this.color == "dark" ? this.x - 1 : this.x + 1,
                        realX: this.x,
                        realY: this.y,
                        color: this.color
                    };
                }
                board.changePlayer();
			}
		};

		var enPassantMove = function(e) {
			board.clearAvailableMoves();
			board.matrix[this.x][this.y] = null;
			this.x = $(e.currentTarget).data('x');
			this.y = $(e.currentTarget).data('y');

			board.kill(board.enPassant.realX, board.enPassant.realY);
			board.matrix[this.x][this.y] = this;
			this.$chessman.detach().appendTo($(finder.cell(this.x, this.y)));
			this.moved = true;

			board.changePlayer();
		};

		this.findMoves = function() {
			board.matrix[this.x][this.y] = null;
			var shift = this.color === 'dark'? 1 : -1;

			if (((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) && board.matrix[this.x + shift][this.y] === null) {
				board.matrix[this.x + shift][this.y] = this;
					if (!board.canKillKing())
						this.moves.push({x: this.x + shift, y: this.y});
					board.matrix[this.x + shift][this.y] = null;
			}

			if (this.moved === false && board.matrix[this.x + shift][this.y] === null &&
				board.matrix[this.x + (2 * shift)][this.y] === null) {
					board.matrix[this.x + (2 * shift)][this.y] = this;
					if (!board.canKillKing())
						this.moves.push({x: this.x + (2 * shift), y: this.y, move: true});
					board.matrix[this.x + (2 * shift)][this.y] = null;
			}

			var temp = null;
			if (this.y > 0 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
				board.matrix[this.x + shift][this.y - 1] !== null && board.matrix[this.x + shift][this.y - 1].color != this.color) {
					temp = board.matrix[this.x + shift][this.y - 1];
					temp.locked = true;
					board.matrix[this.x + shift][this.y - 1] = this;

					if (!board.canKillKing())
						this.moves.push({x: this.x + shift, y: this.y - 1});

					temp.locked = false;
					board.matrix[this.x + shift][this.y - 1] = temp;
			}

			if (this.y < 7 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
				board.matrix[this.x + shift][this.y + 1] !== null && board.matrix[this.x + shift][this.y + 1].color != this.color) {
					temp = board.matrix[this.x + shift][this.y + 1];
					temp.locked = true;
					board.matrix[this.x + shift][this.y + 1] = this;

					if (!board.canKillKing())
						this.moves.push({x: this.x + shift, y: this.y + 1});

					temp.locked = false;
					board.matrix[this.x + shift][this.y + 1] = temp;
			}

			if (board.enPassant && this.y > 0 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
				board.enPassant.shadowX === this.x + shift && board.enPassant.realY === this.y - 1 &&
                board.enPassant.color != this.color) {
					temp = board.matrix[board.enPassant.realX][this.y - 1];
					temp.locked = true;
					board.matrix[this.x + shift][this.y - 1] = this;

					if (!board.canKillKing())
						this.moves.push({x: this.x + shift, y: this.y - 1, ep: true});

					temp.locked = false;
					board.matrix[board.enPassant.realX][this.y - 1] = temp;
					board.matrix[this.x + shift][this.y - 1] = null;
			}

			if (board.enPassant && this.y < 7 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
				board.enPassant.shadowX === this.x + shift && board.enPassant.realY === this.y + 1 &&
                board.enPassant.color != this.color) {
					temp = board.matrix[board.enPassant.realX][this.y + 1];
					temp.locked = true;
					board.matrix[this.x + shift][this.y + 1] = this;

					if (!board.canKillKing())
						this.moves.push({x: this.x + shift, y: this.y + 1, ep: true});

					temp.locked = false;
					board.matrix[board.enPassant.realX][this.y + 1] = temp;
					board.matrix[this.x + shift][this.y + 1] = null;
			}

			board.matrix[this.x][this.y] = this;
			return this.moves.length;
		};

		this.availableMoves = function() {
			this.moves.forEach(function(item) {
				if (item.move)
					$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this, true));
				else if (item.ep)
					$(finder.cell(item.x, item.y)).addClass('available').on('click', enPassantMove.bind(this));
				else
					$(finder.cell(item.x, item.y)).addClass('available').on('click', move.bind(this));
			}.bind(this));
		};

		this.clearMovesArray = function () {
			this.moves = [];
		};

		this.canKill = function(xKing, yKing) {
			var shift = this.color === 'dark'? 1 : -1;
			return this.x + shift === xKing && (this.y - 1 === yKing || this.y + 1 === yKing);
		};

		this.constructor = Pawn;
	};

	function Board() {
		this.size = 8;
		this.enPassant = null;
		this.move = "light";

		this.lights = [];
		this.darks = [];
		this.lightKing = null;
		this.darkKing = null;

		this.matrix = new Array(this.size);
		var $table = $(templates.table).appendTo($('body'));

		for (var i = 0; i < this.size; i++) {
			var $row = $(templates.row).appendTo($table);
			this.matrix[i] = new Array(this.size);

			for (var j = 0; j < this.size; j++) {
				var $cell = $(templates.cell).addClass('cell').appendTo($row);
				$cell.attr('data-x', i).attr('data-y', j);
				(i + j) % 2 === 1 ? $cell.addClass('black') : $cell.addClass('white');
                finder.addCell(i, j);

				if (i <= 1 || i >= 6) {
					var color = i <= 1 ? "dark" : "light";
					if (i === 1 || i === 6)
						this.matrix[i][j] = new Pawn(color, i, j);
					else {
						switch (j) {
							case 0:
							case 7:
								this.matrix[i][j] = new Rook(color, i, j);
								break;
							case 1:
							case 6:
								this.matrix[i][j] = new Knight(color, i, j);
								break;
							case 2:
							case 5:
								this.matrix[i][j] = new Bishop(color, i, j);
								break;
							case 3:
								this.matrix[i][j] = new Queen(color, i, j);
								break;
							case 4:
								this.matrix[i][j] = new King(color, i, j);
								color === "dark"? this.darkKing = this.matrix[i][j] : this.lightKing = this.matrix[i][j];
						}
					}
					color === "dark"? this.darks.push(this.matrix[i][j]) : this.lights.push(this.matrix[i][j]);
				}
				else
					this.matrix[i][j] = null;
			}
		}

		this.start = function() {
			this.lights.forEach(function(item) {
				item.findMoves();
			});
		};

		this.canKillKing = function() {
			if (this.move === 'dark')
				return this.lights.some(function(item) {
					return !item.locked && item.canKill(this.darkKing.currentX, this.darkKing.currentY);
				}.bind(this));
			else
				return this.darks.some(function(item) {
					return !item.locked && item.canKill(this.lightKing.currentX, this.lightKing.currentY);
				}.bind(this));
		};

		this.clearAvailableMoves = function () {
			$('.available').removeClass('available').off('click');
		};

		this.kill = function (x, y) {
			if (this.matrix[x][y]) {
				var index;
				if (this.matrix[x][y].color === "dark") {
					index = this.darks.indexOf(this.matrix[x][y]);
					this.darks.splice(index, 1);
				}
				else {
					index = this.lights.indexOf(this.matrix[x][y]);
					this.lights.splice(index, 1);
				}

				this.matrix[x][y].$chessman.remove();
				this.matrix[x][y] = null;
			}
		};

		this.changePlayer = function () {
            console.log(this.matrix);
			var sum = 0;

			if (this.move === "dark") {
				this.darks.forEach(function(item) {
					item.clearMovesArray();
				});
                this.move = "light";
				this.lights.forEach(function(item) {
				   sum += item.findMoves();
				});

				if (sum === 0) {
					alert("Выиграли черные");
				}
			}
			else {
				this.lights.forEach(function(item) {
					item.clearMovesArray();
				});
                this.move = "dark";
				this.darks.forEach(function(item) {
					sum += item.findMoves();
				});

				if (sum === 0) {
					alert("Выиграли белые");
				}
			}

            if (this.enPassant && this.enPassant.color === this.move)
                this.enPassant = null;
		};

		var $request = $(templates.request).appendTo('body').hide();
		this.showRequest = function (x, y) {
			var $palette = $(templates.row).appendTo('.pieces');
			var $piece = $(templates.cell).appendTo($palette);
			$(templates.img).appendTo($piece).attr('src', this.move === "dark" ? images.rook.dark : images.rook.light)
				.on('click', function (x, y) {
					$palette.remove();
					$request.hide();

					board.matrix[x][y] = new Rook(this.move, x, y);
					this.moved = true;
                    this.move === "dark" ? this.darks.push(board.matrix[x][y]) : this.lights.push(board.matrix[x][y]);
					board.changePlayer();
				}.bind(this, x, y));

			$piece = $(templates.cell).appendTo($palette);
			$(templates.img).appendTo($piece).attr('src', this.move === "dark" ? images.knight.dark : images.knight.light)
				.on('click', function (x, y) {
					$palette.remove();
					$request.hide();

					board.matrix[x][y] = new Knight(this.move, x, y);
                    this.move === "dark" ? this.darks.push(board.matrix[x][y]) : this.lights.push(board.matrix[x][y]);
                    board.changePlayer();
				}.bind(this, x, y));

			$piece = $(templates.cell).appendTo($palette);
			$(templates.img).appendTo($piece).attr('src', this.move === "dark" ? images.bishop.dark : images.bishop.light)
				.on('click', function (x, y) {
					$palette.remove();
					$request.hide();

					board.matrix[x][y] = new Bishop(this.move, x, y);
                    this.move === "dark" ? this.darks.push(board.matrix[x][y]) : this.lights.push(board.matrix[x][y]);
					board.changePlayer();
				}.bind(this, x, y));

			$piece = $(templates.cell).appendTo($palette);
			$(templates.img).appendTo($piece).attr('src', this.move === "dark" ? images.queen.dark : images.queen.light)
				.on('click', function (x, y) {
					$palette.remove();
					$request.hide();

					board.matrix[x][y] = new Queen(this.move, x, y);
                    this.move === "dark" ? this.darks.push(board.matrix[x][y]) : this.lights.push(board.matrix[x][y]);
					board.changePlayer();
				}.bind(this, x, y));

			if (this.move === "dark")
				$('.request').css({right: 0});
			else
				$('.request').css({right: ""});
			$request.show();
		};
	}

	var board = new Board();
	board.start();
});