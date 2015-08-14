"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

GAME.Seed = (function (window) {
  "use strict";

  var seedCounter = 0;

  return (function () {
    function Seed(hole) {
      _classCallCheck(this, Seed);

      this.id = seedCounter++;

      this.hole = hole;

      // Position désirée
      this.position = hole.position.clone();
      this.desiredPosition = this.position.clone();

      // Représentaton graphique
      this.material = null;
      this.object = null;

      this._initObject();

      // Ajouter la graine au trou
      this.hole.seeds.add(this);
    }

    /**
     * Aller à une position
     */

    _createClass(Seed, [{
      key: "animateTo",
      value: function animateTo(newPosition) {
        new TWEEN.Tween(this.position).to(newPosition, 200).easing(TWEEN.Easing.Quintic.Out).start();
      }

      /**
       * Changer de trou.
       */
    }, {
      key: "animateToNewHole",
      value: function animateToNewHole() {
        var duration = this.position.distanceTo(this.desiredPosition) / 2 * 200;

        new TWEEN.Tween(this.position).to(this.desiredPosition, duration).easing(TWEEN.Easing.Quintic.Out).start();
      }

      /**
       * Création de l'effet de lumière
       */
    }, {
      key: "_initObject",
      value: function _initObject() {
        this.material = new THREE.SpriteMaterial({
          map: new THREE.ImageUtils.loadTexture('images/seed.png'),
          useScreenCoordinates: false,
          color: 0xffffff,
          transparent: true,
          blending: THREE.AdditiveBlending
        });

        this.object = new THREE.Sprite(this.material);
        this.object.position.copy(this.position);
        this.position = this.object.position;
        this.object.scale.set(0.5, 0.5, 1);
      }
    }]);

    return Seed;
  })();
})(window);
//# sourceMappingURL=E:\_g\public\js\game\objects\seed.js.map