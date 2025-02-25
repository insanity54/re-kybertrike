import * as RE from 'rogue-engine';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonConstraint from './CannonConstraint';
import * as RogueCannon from '../../Lib/RogueCannon';
export default class CannonDistanceConstraint extends CannonConstraint {
  constraint: CANNON.DistanceConstraint;

  @RE.props.object3d() target: THREE.Object3D;
  @RE.props.num() distance: number = 1;
  @RE.props.num() maxForce: number = 1e6;

  protected createConstraint() {
    if (!this.target) throw "CannonHinge requires a target";

    const bodyA = this.getCannonBodyComponent(this.object3d).body;
    const bodyB = this.getCannonBodyComponent(this.target).body;

    this.constraint = new CANNON.DistanceConstraint(bodyA, bodyB, this.distance, this.maxForce);

    RogueCannon.getWorld().addConstraint(this.constraint);
  }
}

RE.registerComponent(CannonDistanceConstraint);
