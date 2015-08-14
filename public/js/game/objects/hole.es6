GAME.Hole = ( function ( window ) {
  "use strict";

  var holeCounter = 0;

  return class Hole {

    constructor( position, player ) {

      this.id = holeCounter++;

      // Joueur
      this.player = player;

      // Position
      this.position = position;

      // Graines
      this.seeds = new Set;

      // Couleur
      this.color = new THREE.Color( player.color );
      this.highlightColor = this.color.clone().multiplyScalar( 1.5 );

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
    _initObject() {
    	this.material = new THREE.SpriteMaterial( {
        map: new THREE.ImageUtils.loadTexture( 'images/hole.png' ),
        useScreenCoordinates: false,
        color: this.color,
        transparent: true,
        blending: THREE.AdditiveBlending
    	} );

    	this.object = new THREE.Sprite( this.material );
      this.object.position.copy( this.position );
      this.object.scale.set( 2, 2, 1 );

      this.position = this.object.position;

      this.sphere = new THREE.Mesh(
        new THREE.SphereGeometry( 1, 16, 16 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
      );

      this.sphere.position.copy( this.position );
      this.sphere.visible = false;
      this.sphere.userData.hole = this;
    }


    /**
     * Recalculer les positions des graines
     */
    updateSeedsDesiredPositions( newSeed = null ) {
      var size = this.seeds.size;

      var n = 0;
      for ( let seed of this.seeds ) {
        if ( seed ) {
          var a = Math.PI * 2 / size * n;

          if ( size > 1 ) {
            seed.desiredPosition.set(
              Math.cos( a ) * this.object.scale.x / 4 + this.position.x,
              this.position.y,
              Math.sin( a ) * this.object.scale.y / 4 + this.position.z
            );
          }
          else {
            seed.desiredPosition.copy( this.position );
          }

          if ( seed !== newSeed ) {
            seed.animateTo( seed.desiredPosition );
          }

          n++;
        }
      }
    }

    /**
     * Mettre en valeur le trou
     * @param duration
     */
    highlight( duration = null ) {
      new TWEEN.Tween( this.material.color )
        .to( this.highlightColor, 200 )
        .start();

      console.log("highlight");

      if ( duration ) {
        setTimeout(
          this.unhighlight.bind( this ),
          duration
        );
      }
    }

    /**
     * Arrêter la mise en valeur le trou
     */
    unhighlight() {
      new TWEEN.Tween( this.material.color )
        .to( this.color, 300 )
        .start();
    }
  }

} ) ( window );
