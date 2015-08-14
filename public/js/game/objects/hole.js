"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

GAME.Hole = (function (window) {
  "use strict";

  var holeCounter = 0;

  return (function () {
    function Hole(position, player) {
      _classCallCheck(this, Hole);

      this.id = holeCounter++;

      // Joueur
      this.player = player;

      // Position
      this.position = position;

      // Graines
      this.seeds = new Set();

      // Couleur
      this.color = new THREE.Color(player.color);
      this.highlightColor = this.color.clone().multiplyScalar(1.5);

      // Représentaton graphique
      this.material = null;
      this.object = null;

      // Objet pour les collisions
      this.sphere = null;

      // Initialiser l'image
      this._initObject();
    }

    /**
     * Création de l'effet de lumière
     */

    _createClass(Hole, [{
      key: "_initObject",
      value: function _initObject() {
        this.material = new THREE.SpriteMaterial({
          map: new THREE.ImageUtils.loadTexture('images/hole.png'),
          useScreenCoordinates: false,
          color: this.color,
          transparent: true,
          blending: THREE.AdditiveBlending
        });

        this.object = new THREE.Sprite(this.material);
        this.object.position.copy(this.position);
        this.object.scale.set(2, 2, 1);

        this.position = this.object.position;

        this.sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));

        this.sphere.position.copy(this.position);
        this.sphere.visible = false;
        this.sphere.userData.hole = this;
      }

      /**
       * Recalculer les positions des graines
       */
    }, {
      key: "updateSeedsDesiredPositions",
      value: function updateSeedsDesiredPositions() {
        var newSeed = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        var size = this.seeds.size;

        var n = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.seeds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var seed = _step.value;

            if (seed) {
              var a = Math.PI * 2 / size * n;

              if (size > 1) {
                seed.desiredPosition.set(Math.cos(a) * this.object.scale.x / 4 + this.position.x, this.position.y, Math.sin(a) * this.object.scale.y / 4 + this.position.z);
              } else {
                seed.desiredPosition.copy(this.position);
              }

              if (seed !== newSeed) {
                seed.animateTo(seed.desiredPosition);
              }

              n++;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      /**
       * Mettre en valeur le trou
       * @param duration
       */
    }, {
      key: "highlight",
      value: function highlight() {
        var duration = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        new TWEEN.Tween(this.material.color).to(this.highlightColor, 200).start();

        console.log("highlight");

        if (duration) {
          setTimeout(this.unhighlight.bind(this), duration);
        }
      }

      /**
       * Arrêter la mise en valeur le trou
       */
    }, {
      key: "unhighlight",
      value: function unhighlight() {
        new TWEEN.Tween(this.material.color).to(this.color, 300).start();
      }
    }]);

    return Hole;
  })();
})(window);
//# sourceMappingURL=E:\_g\public\js\game\objects\hole.js.map