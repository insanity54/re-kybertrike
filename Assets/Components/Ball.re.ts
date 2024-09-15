import CannonBody from '@RE/BeardScript/rogue-cannon/Components/CannonBody.re';
import * as RE from 'rogue-engine';

@RE.registerComponent
export default class Ball extends RE.Component {
  @RE.Prop("Number") speed = 50;
  bodyComponent: CannonBody;
  awake() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this.bodyComponent.body.velocity.set(0.3, 0.7, 0)
  }

  update() {
    const velocity = this.bodyComponent.body.velocity;
    if (velocity.length() !== this.speed) {
      velocity.normalize();
      velocity.scale(this.speed, velocity);
    }
  }
}
