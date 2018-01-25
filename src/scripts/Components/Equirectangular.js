// @flow

import type { Player, Settings } from '../types';
import TwoDVideo from './TwoDVideo';
import THREE from "three";
import { mergeOptions } from '../utils';

const defaults = {
    SphericalSegment : {
        start : 0,
        length : 1
    }
}

class Equirectangular extends TwoDVideo{
    _mesh: any;

    constructor(player: Player, options: Settings, renderElement: HTMLElement){
        super(player, options, renderElement);
        this._options = mergeOptions({}, defaults, options);
    
        let geometry = new THREE.SphereGeometry(500, 60, 40, 0, Math.PI * 2, Math.PI * this.options.SphericalSegment.start, Math.PI * this.options.SphericalSegment.length);
        geometry.scale( - 1, 1, 1 );
        //define mesh
        this._mesh = new THREE.Mesh(geometry,
            new THREE.MeshBasicMaterial({ map: this._texture})
        );
        this._scene.add(this._mesh);
    }
}

export default Equirectangular;