"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

GAME.Player = (function (window) {
  "use strict";

  var playerCounter = 0;

  return function Player(color) {
    _classCallCheck(this, Player);

    this.id = playerCounter++;
    this.color = color;
  };
})(window);
//# sourceMappingURL=E:\_g\public\js\game\player.js.map