import * as RE from 'rogue-engine';
import * as THREE from 'three';
import TileWorldGrid from '../TileWorldGrid.re';
const REditor = window["rogue-editor"];

const v3Zero = new THREE.Vector3();

export default class TileWorldBuilder extends RE.Component {
  static isEditorComponent = true;

  paintModeActive = false;

  transformControls;
  raycaster = new THREE.Raycaster();
  worldBuilder: TileWorldGrid | undefined;

  builderGridMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
  builderGridPlane = new THREE.PlaneGeometry(1, 1, 1, 1);
  builderGridMesh = new THREE.Mesh(this.builderGridPlane, this.builderGridMaterial);
  builderGridHelper = new THREE.GridHelper();

  selectedFile: string | undefined;
  selectedObject: THREE.Object3D;

  private pos = new THREE.Vector3();
  private sceneGrid: THREE.GridHelper;

  start() {
    this.builderGridMesh.rotateX(THREE.MathUtils.degToRad(-90));
    this.builderGridHelper.userData.isEditorObject = true;
    this.builderGridMesh.userData.isEditorObject = true;
    this.builderGridHelper.name = "RE_EDITOR_WORLD_BUILDER_GUIDE";

    this.paintModeActive = false;
  }

  onRemoved() {
    this.builderGridHelper.removeFromParent();
    RE.dispose(this.builderGridHelper);
    this.showScenGrid();
  }

  update() {
    const selectedObject = REditor.Project.selectedObjects[0];

    if (selectedObject !== this.selectedObject) {
      this.selectedObject = selectedObject;
      if (this.selectedObject) {
        const worldBuilder = RE.getComponent(TileWorldGrid, this.selectedObject);
        if (!worldBuilder) this.paintModeActive = false;

        if (worldBuilder && this.paintModeActive) {
          this.worldBuilder = worldBuilder;
        } else {
          this.worldBuilder = undefined;
        }

        if (this.paintModeActive) {
          this.builderGridHelper.clear();
          this.builderGridHelper.parent?.remove(this.builderGridHelper);
        }
      } else {
        this.worldBuilder = undefined;
        this.paintModeActive = false;
        this.showScenGrid();
      }
    }

    if (this.selectedObject && !RE.Runtime.isRunning && RE.Input.keyboard.getKeyDown("ControlLeft")) {
      if (!this.worldBuilder) {
        this.worldBuilder = RE.getComponent(TileWorldGrid, this.selectedObject);
      } 

      if (this.worldBuilder && !this.paintModeActive) {
        this.paintModeActive = true;
      } else {
        this.paintModeActive = false;
      }
    }

    if (this.paintModeActive) {
      window["reCanSelectObject"] = false;

      if (!this.transformControls) {
        this.transformControls = REditor.Project.currentScene.getObjectByName("EDITOR_TRANSFORM_CONTROLS");
      }

      if (this.transformControls) {
        this.transformControls.enabled = false;
      }

      if (!this.builderGridHelper.parent && this.worldBuilder) {
        this.addPaintGrid();
      }

      if (RE.Input.mouse.isLeftButtonDown && RE.Input.keyboard.getKeyPressed("ShiftLeft")) {
        const obj = this.getOccupiedTileObject();
        obj && obj.parent?.remove(obj);
        REditor.Project.reselectObjects();
      }
      else if (RE.Input.mouse.isMidButtonDown && this.worldBuilder) {
        const obj = this.getOccupiedTileObject();
        if (obj) {
          this.pos = this.pos.copy(this.worldBuilder.offset).normalize();
          obj.translateOnAxis(this.pos, -this.worldBuilder.offset.length());
          obj.rotateY(THREE.MathUtils.degToRad(90));
          this.worldBuilder.rotation.y += 90;
          if (this.worldBuilder.rotation.y > 360) {
            this.worldBuilder.rotation.y -= 360;
          }
          if (this.worldBuilder.rotation.y === 360) {
            this.worldBuilder.rotation.y = 0;
          }
          obj.translateOnAxis(this.pos, this.worldBuilder.offset.length());
          REditor.Project.reselectObjects();
        }
      }
      else if (RE.Input.mouse.isLeftButtonDown && this.worldBuilder) {
        const pos = this.getObjectPosition();
        if (pos && this.worldBuilder.tile) {
          const prefab = this.worldBuilder.tile;
          const clone = prefab.instantiate(this.worldBuilder?.object3d);

          clone && this.setObjectPosition(clone, pos, this.worldBuilder.offset, this.worldBuilder.rotation);
          clone && clone.scale.multiply(this.worldBuilder.scale);

          REditor.Project.reselectObjects();
        }
      }

    } else {
      window["reCanSelectObject"] = true;
      if (!this.transformControls) {
        this.transformControls = REditor.Project.currentScene.getObjectByName("EDITOR_TRANSFORM_CONTROLS");
      }
      if (this.transformControls) {
        this.transformControls.enabled = true;
      }

      if (this.builderGridHelper.parent) {
        this.builderGridHelper.parent.remove(this.builderGridHelper);
        REditor.Project.reselectObjects();
        this.showScenGrid();
      }
    }
  }

  private hideScenGrid() {
    this.sceneGrid = RE.App.currentScene.getObjectByProperty("type", "GridHelper") as THREE.GridHelper;
    this.sceneGrid && (this.sceneGrid.visible = false);
  }

  private showScenGrid() {
    this.sceneGrid = RE.App.currentScene.getObjectByProperty("type", "GridHelper") as THREE.GridHelper;
    this.sceneGrid && (this.sceneGrid.visible = true);
  }

  private addPaintGrid() {
    if (!this.worldBuilder) return;
    let length = this.worldBuilder.length;
    let tileSize = this.worldBuilder.tileSize;
    let size = length * tileSize;

    this.builderGridMesh.parent?.remove(this.builderGridMesh);
    this.builderGridMesh.rotation.set(0,0,0);
    this.builderGridMesh.rotateX(THREE.MathUtils.degToRad(-90));
    
    RE.dispose(this.builderGridHelper);
    this.hideScenGrid();

    this.builderGridHelper = new THREE.GridHelper(size, length);
    this.builderGridMesh.scale.set(size, size, 1);
    this.builderGridHelper.userData.isEditorObject = true;

    RE.App.currentScene.attach(this.builderGridHelper);
    this.worldBuilder.object3d.getWorldPosition(this.pos);
    this.builderGridHelper.position.copy(this.pos);
    this.builderGridHelper.attach(this.builderGridMesh);
    this.builderGridMesh.position.set(0,0,0);
  }

  private setObjectPosition(object: THREE.Object3D, position: THREE.Vector3, offset: THREE.Vector3, rotation: THREE.Vector3) {
    object.position.copy(position);

    object.rotateY(THREE.MathUtils.degToRad(rotation.y)); 
    object.rotateX(THREE.MathUtils.degToRad(rotation.x)); 
    object.rotateZ(THREE.MathUtils.degToRad(rotation.z));

    this.pos = this.pos.copy(offset).normalize();
    object.translateOnAxis(this.pos, offset.length());
  }

  private getMousePickPosition() {
    let canv = document.getElementById('rogue-app');
    let rect: DOMRect;

    if( !canv )
      return new THREE.Vector3();

    rect = canv.getBoundingClientRect();

    const mouseX = RE.Input.mouse.x;
    const mouseY = RE.Input.mouse.y;

    if( mouseX > ( rect.left + rect.width ) || mouseX < rect.left )
      return v3Zero;
     
    if( mouseY > ( rect.top + rect.height ) || mouseY < rect.top )
      return v3Zero;

    let mouse: THREE.Vector2 = new THREE.Vector2(
      ( ( mouseX - rect.left ) / rect.width ) * 2 - 1,
      -( ( mouseY - rect.top ) / rect.height ) * 2 + 1
    );

    return mouse;
  }

  private getOccupiedTileObject() {
    if (!this.worldBuilder) return;

    let mouse = this.getMousePickPosition();

    this.raycaster.setFromCamera( mouse as THREE.Vector2, REditor.Project.editorCamera );

    const targets = this.worldBuilder.object3d.children;
    const intersects = this.raycaster.intersectObjects( targets, true );

    if( intersects.length > 0 ) {
      const intersect = intersects[0];
      if (intersect.object.userData.isEditorObject) return;

      const obj = this.getRootObject(intersect.object, this.worldBuilder.object3d);

      return obj;
    }
    
    return;
  }

  private getRootObject(obj: THREE.Object3D, parent: THREE.Object3D): THREE.Object3D {
    if (obj.parent === parent) {
      return obj;
    }

    return this.getRootObject(obj.parent as THREE.Object3D, parent);
  }

  private getObjectPosition() {
    if (!this.worldBuilder) return;

    let mouse = this.getMousePickPosition();

    this.raycaster.setFromCamera( mouse as THREE.Vector2, REditor.Project.editorCamera );

    const targets = [this.builderGridMesh as THREE.Object3D].concat(this.worldBuilder.object3d.children);
    const intersects = this.raycaster.intersectObjects( targets, true );

    if( intersects.length > 0 ) {
      const intersect = intersects[0];
      if (!intersect.object.userData.isEditorObject) return;
      this.builderGridHelper.worldToLocal(intersect.point);

      const tileSize = this.worldBuilder.tileSize;
      const halfSize = tileSize * 0.5;

      const ratioX = intersect.point.x/tileSize;
      const ratioZ = intersect.point.z/tileSize;

      const truncX = Math.trunc(ratioX);
      const truncZ = Math.trunc(ratioZ);

      const xRelPos = truncX * tileSize;
      const zRelPos = truncZ * tileSize;

      let xMod = intersect.point.x < 0 ? -1 : 1;
      let zMod = intersect.point.z < 0 ? -1 : 1;

      let x = Math.abs(ratioX) - Math.abs(truncX) < 1 ? xRelPos : xRelPos + xMod;
      let z = Math.abs(ratioZ) - Math.abs(truncZ) < 1 ? zRelPos : zRelPos + zMod;

      x = intersect.point.x < 0 ? x - halfSize : x + halfSize;
      z = intersect.point.z < 0 ? z - halfSize : z + halfSize;

      return this.pos.set(x, 0, z);
    }
    
    return;
  }
}

RE.registerComponent(TileWorldBuilder);
        