"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

GAME.Game = (function (window) {
  "use strict";

  return (function () {
    function Game() {
      _classCallCheck(this, Game);

      // Etats possibles du jeu
      this.STATES = {
        CONNECTING: 0,
        PLAYER_TURN: 1,
        ENEMY_TURN: 2
      };

      // Etat actuel
      this.state = this.STATES.CONNECTING;

      // Couleur de fond
      this.backgroundColor = new THREE.Color("#000000");

      // Moteur de rendu
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor(this.backgroundColor, 1);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      // Scène
      this.scene = new THREE.Scene();

      // Caméra
      this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 8, 5);
      this.camera.lookAt(new THREE.Vector3(0, 0, 1));

      // Position de la souris
      this.mouse = new THREE.Vector2(0, 0);
      this._mouseDownPosition = this.mouse.clone();

      // Objet survolé par la souris
      this.hovered = null;

      // Listes d'objets
      this.holes = [];
      this.seeds = [];
      this.granaries = [];

      // Initialisation des objets
      this._initObjects();

      // Ajout des écouteurs
      document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
      document.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
      document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
      window.addEventListener('resize', this.handleWindowResize.bind(this), false);
    }

    /**
     * Mise à jour de la scène & affichage.
     */

    _createClass(Game, [{
      key: "update",
      value: function update() {

        TWEEN.update();

        this.updateHoveredObject();

        // Affichage
        this.renderer.render(this.scene, this.camera);
      }

      /**
       * Au redimensionnement de la fenêtre
       */
    }, {
      key: "handleWindowResize",
      value: function handleWindowResize(event) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }

      /**
       * Début du clic de la souris.
       * @param <Event> event
       */
    }, {
      key: "handleMouseDown",
      value: function handleMouseDown(event) {
        this._mouseDownPosition = this.mouse.clone();

        if (this.hovered) {
          if (this.hovered.handleMouseDown) {
            this.hovered.handleMouseDown(event);
          }
        }
      }

      /**
       * Fin du clic de la souris.
       * @param <Event> event
       */
    }, {
      key: "handleMouseUp",
      value: function handleMouseUp(event) {
        if (this.hovered) {
          console.log("click on:", this.hovered);

          if (this.hovered.handleMouseUp) {
            this.hovered.handleMouseUp(event);
          }

          if (this.hovered instanceof GAME.Hole && !this._animated) {
            // TODO : Conditions d'application du déplacement des graines
            this.distributeSeeds(this.hovered);
          }
        }
      }

      /**
       * Déplacement de la souris sur la scène.
       * @param <Event> event
       */
    }, {
      key: "handleMouseMove",
      value: function handleMouseMove(event) {
        this.mouse.x = +(event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      }

      /**
       * Initialisation des objets
       */
    }, {
      key: "_initObjects",
      value: function _initObjects() {

        /*/ Grille
        		var line_material = new THREE.LineBasicMaterial( { color: 0x303030 } ),
        	geometry = new THREE.Geometry(),
        	floor = -5, step = 2;
        		for ( var i = 0; i <= 100; i ++ ) {
        			geometry.vertices.push( new THREE.Vector3( - 50, floor, i * step - 50 ) );
        	geometry.vertices.push( new THREE.Vector3(   50, floor, i * step - 50 ) );
        			geometry.vertices.push( new THREE.Vector3( i * step - 50, floor, -50 ) );
        	geometry.vertices.push( new THREE.Vector3( i * step - 50, floor,  50 ) );
        		}
        		var line = new THREE.Line( geometry, line_material, THREE.LinePieces );
        this.scene.add( line );
           /**/

        // Holes

        var holesPerPlayer = 6;

        var player = new GAME.Player("#0085ff");

        // Grenier 1
        var granary = new GAME.Granary(player, Math.PI / 10);
        this.granaries.push(granary);
        this.scene.add(granary.object);

        for (var h = 0; h < holesPerPlayer * 2; h++) {

          if (h === holesPerPlayer) {
            player = new GAME.Player("#ff5c00");

            // Grenier
            var granary = new GAME.Granary(player, Math.PI + Math.PI / 10);
            this.granaries.push(granary);
            this.scene.add(granary.object);
          }

          var position = new THREE.Vector3(Math.cos(Math.PI * 2 * (h + .5) / (holesPerPlayer * 2)) * 5, 0, Math.sin(Math.PI * 2 * (h + .5) / (holesPerPlayer * 2)) * 5);

          var hole = new GAME.Hole(position, player);

          this.holes.push(hole);
          this.scene.add(hole.object);
          this.scene.add(hole.sphere);

          // Graines

          for (var s = 0; s < 4; s++) {
            var seed = new GAME.Seed(hole);

            this.seeds.push(seed);
            this.scene.add(seed.object);
          }

          hole.updateSeedsDesiredPositions();
        }
      }

      /**
       * Mise à jour de la détection du noeud pointé par la souris.
       */
    }, {
      key: "updateHoveredObject",
      value: function updateHoveredObject() {
        var hovered = this.hovered;

        // Création d'un rayon à la position de la souris et dans la même direction que la caméra
        var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 1).unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        // Détection de tous les objects touchés par le rayon
        var holesObjects = [];
        for (var h in this.holes) holesObjects.push(this.holes[h].sphere);
        var intersects = ray.intersectObjects(holesObjects);

        // Si il y a au moins une intersection
        if (intersects.length > 0) {

          // Si c'est une nouvelle intersection
          if (intersects[0].object.userData.hole && intersects[0].object.userData.hole !== hovered) {

            // Si un objet était précédemment survolé
            if (hovered && typeof hovered.handleBlur === 'function') {
              hovered.handleBlur();
            }

            // Nouvel élément survolé
            hovered = intersects[0].object.userData.hole;

            if (typeof hovered.handleFocus === 'function') {
              hovered.handleFocus();
            }

            this.renderer.context.canvas.style.cursor = "pointer";
          }
        }

        // Pas d'intersections
        else {
            if (hovered) {
              if (typeof hovered.handleBlur === 'function') {
                hovered.handleBlur();
              }

              hovered = null;
            }

            this.renderer.context.canvas.style.cursor = "default";
          }

        this.hovered = hovered;
      }

      /**
       * Répartir les graines d'un trou, sans conditions.
       * @param <Hole> hole
       */
    }, {
      key: "distributeSeeds",
      value: function distributeSeeds(sourceHole) {
        var holesIterator = this.getHoleGenerator(this.holes, sourceHole);

        var n = 0;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function () {
            var seed = _step.value;

            var hole = holesIterator.next().value;

            sourceHole.seeds["delete"](seed);
            hole.seeds.add(seed);

            hole.updateSeedsDesiredPositions(seed);

            setTimeout(function () {
              seed.animateToNewHole();

              hole.highlight(n * 100 + 200);
            }, n * 100);

            n++;
          };

          for (var _iterator = sourceHole.seeds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
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

        this._animated = true;

        setTimeout((function () {
          this._animated = false;
        }).bind(this), n * 100);
      }

      /**
       * Génère une fonction pour itérer infiniment sur un tableau de trous
       * En évitant le trou original
       * @param <Array<Hole>> holes
       * @param <Hole>
       * @return function*
       */
    }, {
      key: "getHoleGenerator",
      value: function getHoleGenerator(holes, sourceHole) {
        return regeneratorRuntime.mark(function callee$3$0(holes, sourceHole) {
          var nextIndex, h;
          return regeneratorRuntime.wrap(function callee$3$0$(context$4$0) {
            while (1) switch (context$4$0.prev = context$4$0.next) {
              case 0:
                nextIndex = -1;

                if (!sourceHole) {
                  context$4$0.next = 10;
                  break;
                }

                context$4$0.t0 = regeneratorRuntime.keys(holes);

              case 3:
                if ((context$4$0.t1 = context$4$0.t0()).done) {
                  context$4$0.next = 10;
                  break;
                }

                h = context$4$0.t1.value;

                if (!(holes[h] === sourceHole)) {
                  context$4$0.next = 8;
                  break;
                }

                nextIndex = h;
                return context$4$0.abrupt("break", 10);

              case 8:
                context$4$0.next = 3;
                break;

              case 10:
                if (!true) {
                  context$4$0.next = 18;
                  break;
                }

                nextIndex++;

                if (nextIndex >= holes.length) {
                  nextIndex = 0;
                }

                if (!(holes[nextIndex] && holes[nextIndex] !== sourceHole)) {
                  context$4$0.next = 16;
                  break;
                }

                context$4$0.next = 16;
                return holes[nextIndex];

              case 16:
                context$4$0.next = 10;
                break;

              case 18:
              case "end":
                return context$4$0.stop();
            }
          }, callee$3$0, this);
        })(holes, sourceHole);
      }
    }]);

    return Game;
  })();
})(window);
//# sourceMappingURL=E:\_g\public\js\game\game.js.map