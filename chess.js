$(function() {
    var templates = {
        table: '<div class="board"></div>',
        row: '<div class="row"></div>',
        cell: '<div class="cell"></div>',
        img: '<img class="chessman"/>',
        request: '<div class="request"><div>'
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
        this.cell = function(x, y) {
            return '[data-x=' + x + '][data-y=' + y + ']';
        };

        this.row = function(x) {
            return '[data-x=' + x + ']';
        };

        this.column = function(y) {
            return '[data-y=' + y + ']';
        };
    };

    // color: "dark" / "light"
    function King (color, x, y) {
        this.color = color;
        this.$chessman = $(templates.img);
        this.x = x;
        this.y = y;
        this.moved = false;

        this.$chessman.addClass(color);
        this.color === "dark"?
            this.$chessman.attr('src', images.king.dark) : this.$chessman.attr('src', images.king.light);
        $(finder.cell(this.x, this.y)).append(this.$chessman);

        this.$chessman.on("click", function(e) {

        }.bind(this));
    }

    King.prototype = new function() {
        this.move = function() {

        };

        this.castlingMove = function() {

        };

        this.availableMoves = function() {

        };
    };

    function Queen (color, x, y) {
        this.color = color;
        this.$chessman = $(templates.img);
        this.x = x;
        this.y = y;

        this.$chessman.addClass(color);
        this.color === "dark"?
            this.$chessman.attr('src', images.queen.dark) : this.$chessman.attr('src', images.queen.light);
        $(finder.cell(this.x, this.y)).append(this.$chessman);

        this.$chessman.on("click", function(e) {

        }.bind(this));
    }

    Queen.prototype = new function(){
        this.move = function() {

        };

        this.availableMoves = function() {

        };
    };

    function Rook (color, x, y) {
        this.color = color;
        this.$chessman = $(templates.img);
        this.x = x;
        this.y = y;
        this.moved = false;

        this.$chessman.addClass(color);
        this.color === "dark"?
            this.$chessman.attr('src', images.rook.dark) : this.$chessman.attr('src', images.rook.light);
        $(finder.cell(this.x, this.y)).append(this.$chessman);

        this.$chessman.on("click", function(e) {

        }.bind(this));
    }

    Rook.prototype = new function(){
        this.move = function() {

        };

        this.castlingMove = function() {

        };

        this.availableMoves = function() {

        };
    };

    function Knight (color, x, y) {
        this.color = color;
        this.$chessman = $(templates.img);
        this.x = x;
        this.y = y;

        this.$chessman.addClass(color);
        this.color === "dark"?
            this.$chessman.attr('src', images.knight.dark) : this.$chessman.attr('src', images.knight.light);
        $(finder.cell(this.x, this.y)).append(this.$chessman);

        this.$chessman.on("click", function(e) {

        }.bind(this));
    }

    Knight.prototype = new function(){
        this.move = function() {

        };

        this.availableMoves = function() {

        };
    };

    function Bishop (color, x, y) {
        this.color = color;
        this.$chessman = $(templates.img);
        this.x = x;
        this.y = y;

        this.$chessman.addClass(color);
        this.color === "dark"?
            this.$chessman.attr('src', images.bishop.dark) : this.$chessman.attr('src', images.bishop.light);
        $(finder.cell(this.x, this.y)).append(this.$chessman);

        this.$chessman.on("click", function(e) {

        }.bind(this));
    }

    Bishop.prototype = new function(){
        this.move = function() {

        };

        this.enPassantMove = function () {

        };

        this.availableMoves = function() {

        };
    };

    function Pawn (color, x, y) {
        this.color = color;
        this.$chessman = $(templates.img);
        this.x = x;
        this.y = y;
        this.moved = false;

        this.$chessman.addClass(color);
        this.color === "dark"?
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
            this.x = $(e.currentTarget).attr('data-x') - 0;
            this.y = $(e.currentTarget).attr('data-y') - 0;

            if (board.matrix[this.x][this.y] != null)
                board.kill(this.x, this.y);

            if (this.x == 0 || this.x == 7) {
                $('.board').hide();
                this.$chessman.remove();
                board.showRequest(this.x, this.y);
                board.kill(this.x, this.y);
            }
            else {
                board.matrix[this.x][this.y] = this;
                this.$chessman.appendTo($(finder.cell(this.x, this.y)));
                this.moved = true;
                board.changePlayer();

                if (ep === true) {
                    board.enPassant = {
                        shadowX: this.color == "dark" ? this.x - 1 : this.x + 1,
                        realX: this.x,
                        realY: this.y
                    };
                }
            }
        };

        var enPassantMove = function(e) {
            board.clearAvailableMoves();
            board.matrix[this.x][this.y] = null;
            this.x = $(e.currentTarget).attr('data-x') - 0;
            this.y = $(e.currentTarget).attr('data-y') - 0;

            board.kill(board.enPassant.realX, board.enPassant.realY);
            board.matrix[this.x][this.y] = this;
            this.$chessman.detach().appendTo($(finder.cell(this.x, this.y)));
            this.moved = true;

            board.changePlayer();
        };

        this.availableMoves = function() {
            var shift = this.color === 'dark'? 1 : -1;

            if (((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) && board.matrix[this.x + shift][this.y] === null) {
                $(finder.cell(this.x + shift, this.y)).addClass('available').on('click', move.bind(this));
            }

            if (this.moved === false && board.matrix[this.x + (2 * shift)][this.y] === null) {
                $(finder.cell(this.x + (2 * shift), this.y)).addClass('available').on('click', move.bind(this, true));
            }

            if (this.y > 0 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
                board.matrix[this.x + shift][this.y - 1] !== null && board.matrix[this.x + shift][this.y - 1].color != this.color) {
                    $(finder.cell(this.x + shift, this.y - 1)).addClass('available').on('click', move.bind(this));
            }

            if (this.y < 7 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
                board.matrix[this.x + shift][this.y + 1] !== null && board.matrix[this.x + shift][this.y + 1].color != this.color) {
                    $(finder.cell(this.x + shift, this.y + 1)).addClass('available').on('click', move.bind(this));
            }

            if (board.enPassant && this.y > 0 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
                board.enPassant.shadowX === this.x + shift && board.enPassant.realY === this.y - 1) {
                    $(finder.cell(this.x + shift, this.y - 1)).addClass('available').on('click', enPassantMove.bind(this));
            }

            if (board.enPassant && this.y < 7 && ((shift < 0 && this.x > 0) || (shift > 0 && this.x < 7)) &&
                board.enPassant.shadowX === this.x + shift && board.enPassant.realY === this.y + 1) {
                $(finder.cell(this.x + shift, this.y + 1)).addClass('available').on('click', enPassantMove.bind(this));
            }
        };
    };

    function Board(){
        this.size = 8;
        this.enPassant = null;
        this.move = "light";
        this.matrix = new Array(this.size);
        var $table = $(templates.table).appendTo($('body'));

        for (var i = 0; i < this.size; i++) {
            var $row = $(templates.row).appendTo($table);
            this.matrix[i] = new Array(this.size);

            for (var j = 0; j < this.size; j++) {
                var $cell = $(templates.cell).addClass('cell').appendTo($row);
                $cell.attr('data-x', i).attr('data-y', j);
                (i + j) % 2 === 1 ? $cell.addClass('black') : $cell.addClass('white');

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
                        }
                    }
                }
                else
                    this.matrix[i][j] = null;
            }
        }

        this.clearAvailableMoves = function() {
            $('.available').removeClass('available').off('click');
        };

        this.kill = function(x, y){
            this.matrix[x][y].$chessman.remove();
            this.matrix[x][y] = null;
        };

        this.changePlayer = function (){
            this.move = this.move === "dark"? "light" : "dark";

            if (this.enPassant)
                this.enPassant = null;
        };

        var $request = $(templates.request).appendTo('body').hide();
        this.showRequest = function(x, y) {
            var $palette = $(templates.row).appendTo($request);
            var $piece = $(templates.cell).appendTo($palette);
            $(templates.img).appendTo($piece).attr('src', this.color === "dark"? images.rook.dark : images.rook.light)
                .on('click', function(x, y){
                    $palette.remove();
                    $request.hide();
                    $('.board').show();

                    board.matrix[x][y] = new Rook(this.move, x, y);
                    this.moved = true;
                    board.changePlayer();
            }.bind(this, x, y));

            $piece = $(templates.cell).appendTo($palette);
            $(templates.img).appendTo($piece).attr('src', this.color === "dark"? images.knight.dark : images.knight.light)
                .on('click', function(x, y){
                    $palette.remove();
                    $request.hide();
                    $('.board').show();

                    board.matrix[x][y] = new Knight(this.move, x, y);
                    board.changePlayer();
                }.bind(this, x, y));

            $piece = $(templates.cell).appendTo($palette);
            $(templates.img).appendTo($piece).attr('src', this.color === "dark"? images.bishop.dark : images.bishop.light)
                .on('click', function(x, y){
                    $palette.remove();
                    $request.hide();
                    $('.board').show();

                    board.matrix[x][y] = new Bishop(this.move, x, y);
                    this.moved = true;
                    board.changePlayer();
                }.bind(this, x, y));

            $piece = $(templates.cell).appendTo($palette);
            $(templates.img).appendTo($piece).attr('src', this.color === "dark"? images.queen.dark : images.queen.light)
                .on('click', function(x, y){
                    $palette.remove();
                    $request.hide();
                    $('.board').show();

                    board.matrix[x][y] = new Queen(this.move, x, y);
                    this.moved = true;
                    board.changePlayer();
                }.bind(this, x, y));

            $request.show();
        };
    }

    var board = new Board();
});