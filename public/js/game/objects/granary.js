"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

GAME.Granary = (function (window) {
  "use strict";

  return (function () {
    function Granary(player, angle) {
      _classCallCheck(this, Granary);

      this.player = player;

      // Angle
      this.angle = angle;
      console.log(this.angle);

      // Position
      this.position = new THREE.Vector3(0, 0, 0);

      // Emplacements
      this.emplacements = [];

      // Initialiser
      this._initObject();
    }

    /**
     * Création de l'effet de lumière
     */

    _createClass(Granary, [{
      key: "_initObject",
      value: function _initObject() {
        this.material = new THREE.SpriteMaterial({
          map: new THREE.ImageUtils.loadTexture('images/granary-emplacement.png'),
          useScreenCoordinates: false,
          color: new THREE.Color("white"),
          transparent: true,
          blending: THREE.AdditiveBlending
        });

        this.object = new THREE.Sprite(this.material);
        this.object.position.copy(this.position);
        this.position = this.object.position;

        var angle,
            line = 0;

        for (var e = 0; e < 25; e++) {

          if (e < 10) {
            angle = e / 10 * (Math.PI / 3 * 2) + this.angle;
            line = 0;
          } else {
            angle = (e - 10) / 15 * (Math.PI / 3 * 2) + this.angle;
            line = 1;
          }

          var emplacement = new THREE.Sprite(this.material);
          emplacement.scale.set(0.1, 0.1, 0.1);

          emplacement.position.set(Math.cos(angle) * (2 + line / 3 * 2), 0, Math.sin(angle) * (2 + line / 3 * 2));

          this.object.add(emplacement);
        }
      }
    }]);

    return Granary;
  })();
})(window);
//# sourceMappingURL=E:\_g\public\js\game\objects\granary.js.map