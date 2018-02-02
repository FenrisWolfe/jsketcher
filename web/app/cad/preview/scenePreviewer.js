import * as SceneGraph from 'scene/sceneGraph';
import {createTransparentPhongMaterial} from 'scene/materials';
import {createMesh} from 'scene/objects/mesh';


export function createPreviewer(sceneGeometryCreator, services) {

  return function(params) {
    const previewGroup = SceneGraph.createGroup();
    SceneGraph.addToGroup(services.cadScene.workGroup, previewGroup);
    
    let previewObject = null;
    function destroyPreviewObject() {
      if (previewObject === null) {
        return;
      }
      previewGroup.remove(previewObject);
      previewObject.geometry.dispose();
      previewObject = null;
    }

    function update(params) {
      destroyPreviewObject();
      previewObject = createMesh(sceneGeometryCreator(params, services), IMAGINARY_SURFACE_MATERIAL);
      previewGroup.add(previewObject);
      services.viewer.render();
    }

    function dispose() {
      destroyPreviewObject();
      SceneGraph.removeFromGroup(services.cadScene.workGroup, previewGroup);
      services.viewer.render();
    }
    update(params);
    
    return {update, dispose};
  }
}


function sketchBasedPreviewCreator(params) {
  const face = app.findFace(params.face);
  if (!face) return null;
  const triangles = this.createImpl(app, params, face.sketch.fetchContours(), face);
  return createMeshFromTriangles(triangles, IMAGINARY_SURFACE_MATERIAL);
}
//
// function sketchBasedNurbsPreviewCreator(params) {
//   const face = app.findFace(params.face);
//   if (!face) return null;
//   const needSketchRead = !this.sketch || params.face != this.face;
//   if (needSketchRead) {
//     this.sketch = ReadSketchFromFace(app, face);
//     this.face = params.face;
//   }
//   const nurbses = this.createNurbses(app, params, this.sketch, face);
//   const geom = new THREE.Geometry();
//  
//   for (let nurbs of nurbses) {
//     const off = geom.vertices.length;
//     const tess = nurbs.tessellate({maxDepth: 3});
//     const points = [];
//     tess.points.forEach(p => geom.vertices.push(new THREE.Vector3().fromArray(p)));
//     for (let faceIndices of tess.faces) {
//       let normales = faceIndices.map(function(x) {
//         var vn = tess.normals[x];
//         return new THREE.Vector3( vn[0], vn[1], vn[2] );
//       });
//       const face = new THREE.Face3(faceIndices[0] + off, faceIndices[1] + off, faceIndices[2] + off, normales);
//       geom.faces.push(face);
//     }
//   }
//   return new THREE.Mesh(geom, IMAGINARY_SURFACE_MATERIAL);
// }

export const IMAGINARY_SURFACE_MATERIAL = createTransparentPhongMaterial(0xFA8072, 0.5);
