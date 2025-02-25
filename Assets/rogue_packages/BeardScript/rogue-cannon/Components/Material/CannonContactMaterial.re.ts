import * as RE from 'rogue-engine';
import * as CANNON from 'cannon-es';
import * as RogueCannon from '../../Lib/RogueCannon';

export default class CannonContactMaterial extends RE.Component {
  contactMaterial: CANNON.ContactMaterial;

  @RE.props.text() materialA: string;
  @RE.props.text() materialB: string;
  @RE.props.num() friction: number;
  @RE.props.num() restitution: number;

  start() {
    this.createContactMaterial();
  }

  private getMaterial(materialName: string) {
    return RogueCannon.getWorld().materials.find(material => material.name === materialName)
  }

  private createContactMaterial() {
    const cannonMaterialA = this.getMaterial(this.materialA);
    const cannonMaterialB = this.getMaterial(this.materialB);

    if (!cannonMaterialA || !cannonMaterialB) return;

    this.contactMaterial = new CANNON.ContactMaterial(cannonMaterialA, cannonMaterialB, {
      friction: this.friction,
      restitution: this.restitution,
    });

    this.contactMaterial.friction = this.friction;
    this.contactMaterial.restitution = this.restitution;

    RogueCannon.getWorld().addContactMaterial(this.contactMaterial);
  }
}

RE.registerComponent(CannonContactMaterial);
