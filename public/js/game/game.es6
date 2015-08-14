GAME.Game = ( function ( window ) {
  "use strict";

  return class Game {

    constructor() {

      // Etats possibles du jeu
      this.STATES = {
        CONNECTING: 0,
        PLAYER_TURN: 1,
        ENEMY_TURN: 2
      };

      // Etat actuel
      this.state = this.STATES.CONNECTING;

      // Couleur de fond
      this.backgroundColor = new THREE.Color( "#000000" );

      // Moteur de rendu
      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
      this.renderer.setClearColor( this.backgroundColor, 1 );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( this.renderer.domElement );

      // Scène
      this.scene = new THREE.Scene();

      // Caméra
      this.camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 1000 );
      this.camera.position.set( 0, 8, 5 );
      this.camera.lookAt( new THREE.Vector3( 0, 0, 1 ) );

      // Position de la souris
      this.mouse = new THREE.Vector2( 0, 0 );
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
      document.addEventListener( 'mousemove', this.handleMouseMove.bind( this ), false );
      document.addEventListener( 'mousedown', this.handleMouseDown.bind( this ), false );
      document.addEventListener( 'mouseup', this.handleMouseUp.bind( this ), false );
      window.addEventListener( 'resize', this.handleWindowResize.bind( this ), false );
    }


    /**
     * Mise à jour de la scène & affichage.
     */
    update() {

      TWEEN.update();

      this.updateHoveredObject();

      // Affichage
      this.renderer.render( this.scene, this.camera );
    }


    /**
     * Au redimensionnement de la fenêtre
     */
    handleWindowResize( event ) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }


    /**
     * Début du clic de la souris.
     * @param <Event> event
     */
    handleMouseDown( event ) {
      this._mouseDownPosition = this.mouse.clone();

      if ( this.hovered ) {
        if ( this.hovered.handleMouseDown ) {
          this.hovered.handleMouseDown( event );
        }
      }
    }


    /**
     * Fin du clic de la souris.
     * @param <Event> event
     */
    handleMouseUp( event ) {
      if ( this.hovered ) {
        console.log("click on:", this.hovered);

        if ( this.hovered.handleMouseUp ) {
          this.hovered.handleMouseUp( event );
        }

        if ( this.hovered instanceof GAME.Hole && ! this._animated ) {
          // TODO : Conditions d'application du déplacement des graines
          this.distributeSeeds( this.hovered );
        }
      }
    }


    /**
     * Déplacement de la souris sur la scène.
     * @param <Event> event
     */
    handleMouseMove( event ) {
      this.mouse.x = +( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    }


    /**
     * Initialisation des objets
     */
    _initObjects() {

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

      var player = new GAME.Player( "#0085ff" );

      // Grenier 1
      var granary = new GAME.Granary( player, Math.PI / 10 );
      this.granaries.push( granary );
      this.scene.add( granary.object );

      for ( var h = 0 ; h < holesPerPlayer * 2 ; h++ ) {

        if ( h === holesPerPlayer ) {
          player = new GAME.Player( "#ff5c00" );

          // Grenier
          var granary = new GAME.Granary( player, Math.PI + Math.PI / 10 );
          this.granaries.push( granary );
          this.scene.add( granary.object );
        }

        var position = new THREE.Vector3(
          Math.cos( ( Math.PI * 2 * ( h + .5 ) ) / ( holesPerPlayer * 2 ) ) * 5,
          0,
          Math.sin( ( Math.PI * 2 * ( h + .5 ) ) / ( holesPerPlayer * 2 ) ) * 5
        );

        var hole = new GAME.Hole( position, player );

        this.holes.push( hole );
        this.scene.add( hole.object );
        this.scene.add( hole.sphere );

        // Graines

        for ( let s = 0 ; s < 4 ; s++ ) {
          var seed = new GAME.Seed( hole );

          this.seeds.push( seed );
          this.scene.add( seed.object );
        }

        hole.updateSeedsDesiredPositions();
      }
    }


    /**
     * Mise à jour de la détection du noeud pointé par la souris.
     */
    updateHoveredObject() {
      var hovered = this.hovered;

      // Création d'un rayon à la position de la souris et dans la même direction que la caméra
      var vector = ( new THREE.Vector3( this.mouse.x, this.mouse.y, 1 ) ).unproject( this.camera );

      var ray = new THREE.Raycaster(
        this.camera.position,
        vector.sub( this.camera.position ).normalize()
      );

      // Détection de tous les objects touchés par le rayon
      var holesObjects = [];
      for ( var h in this.holes ) holesObjects.push( this.holes[ h ].sphere );
      var intersects = ray.intersectObjects( holesObjects );

      // Si il y a au moins une intersection
      if ( intersects.length > 0 ) {

        // Si c'est une nouvelle intersection
        if ( intersects[ 0 ].object.userData.hole && intersects[ 0 ].object.userData.hole !== hovered ) {

          // Si un objet était précédemment survolé
          if ( hovered && typeof hovered.handleBlur === 'function' ) {
            hovered.handleBlur();
          }

          // Nouvel élément survolé
          hovered = intersects[ 0 ].object.userData.hole;

          if ( typeof hovered.handleFocus === 'function' ) {
            hovered.handleFocus();
          }

          this.renderer.context.canvas.style.cursor = "pointer";
        }
      }

      // Pas d'intersections
      else {
        if ( hovered ) {
          if ( typeof hovered.handleBlur === 'function' ) {
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
    distributeSeeds( sourceHole ) {
      var holesIterator = this.getHoleGenerator( this.holes, sourceHole );

      var n = 0;

      for ( let seed of sourceHole.seeds ) {
        let hole = holesIterator.next().value;

        sourceHole.seeds.delete( seed );
        hole.seeds.add( seed );

        hole.updateSeedsDesiredPositions( seed );

        setTimeout( function () {
          seed.animateToNewHole();

          hole.highlight( n * 100 + 200 );
        }, n * 100);

        n++;
      }

      this._animated = true;

      setTimeout(
        ( function () {
          this._animated = false;
        } ).bind( this ),
        n * 100
      );
    }

    /**
     * Génère une fonction pour itérer infiniment sur un tableau de trous
     * En évitant le trou original
     * @param <Array<Hole>> holes
     * @param <Hole>
     * @return function*
     */
    getHoleGenerator( holes, sourceHole ) {
      return ( function* ( holes, sourceHole ) {
        var nextIndex = -1;

        if ( sourceHole ) {
          for ( var h in holes ) {
            if ( holes[ h ] === sourceHole ) {
              nextIndex = h;
              break;
            }
          }
        }

        while ( true ) {
          nextIndex++;

          if ( nextIndex >= holes.length ) {
            nextIndex = 0;
          }

          if ( holes[ nextIndex ] && holes[ nextIndex ] !== sourceHole ) {
            yield holes[ nextIndex ];
          }
        }
     } )( holes, sourceHole );
    }

  }
} ) ( window );
