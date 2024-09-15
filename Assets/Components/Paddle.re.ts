import CannonBody from '@RE/BeardScript/rogue-cannon/Components/CannonBody.re';
import * as RE from 'rogue-engine';

@RE.registerComponent
export default class Paddle extends RE.Component {
  @RE.Prop("Number") speed = 6;
  @RE.Prop("Number") xLimit = 25;
  bodyComponent: CannonBody;
  private actualXLimit: number;
  awake() {
    this.actualXLimit = this.xLimit - this.object3d.scale.x / 2
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
  }

  start() {

  }

  update() {
    const movementX = RE.Input.mouse.movementX;
    this.bodyComponent.body.position.x += movementX * this.speed * RE.Runtime.deltaTime;

    if (this.bodyComponent.body.position.x < -this.actualXLimit) {
      this.bodyComponent.body.position.x = -this.actualXLimit
    }
    
    else if (this.bodyComponent.body.position.x > this.actualXLimit) {
      this.bodyComponent.body.position.x = this.actualXLimit
    }
  }
}
