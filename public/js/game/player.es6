GAME.Player = ( function ( window ) {
  "use strict";

  var playerCounter = 0;

  return class Player {

    constructor( color ) {

      this.id = playerCounter++;
      this.color = color;

    }

  }
} ) ( window );
