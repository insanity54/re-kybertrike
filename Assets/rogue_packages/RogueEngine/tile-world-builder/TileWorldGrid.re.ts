import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class TileWorldGrid extends RE.Component {
  @RE.props.prefab() tile: RE.Prefab;
  @RE.props.num(0) length = 20;
  @RE.props.num(0) tileSize = 2;
  @RE.props.vector3() scale = new THREE.Vector3(1, 1, 1);
  @RE.props.vector3() offset = new THREE.Vector3(0, 0, 0);
  @RE.props.vector3() rotation = new THREE.Vector3(0, 0, 0);
}

RE.registerComponent(TileWorldGrid);
        