import CannonBody from '@RE/BeardScript/rogue-cannon/Components/CannonBody.re';
import * as RE from 'rogue-engine';

@RE.registerComponent
export default class Brick extends RE.Component {
  bodyComponent: CannonBody;
  start() {
    this.bodyComponent = RE.getComponent(CannonBody, this.object3d) as CannonBody;
    this.bodyComponent.onCollide(() => {
      this.object3d.parent!.remove(this.object3d)
    })
  }
}
