import {TopoObject} from './topo-object'
import {Loop} from './loop'
import PIP from '../../3d/tess/pip';
import {NurbsCurve} from "../geom/impl/nurbs";
import {eqSqTol, veq, veqNeg} from "../geom/tolerance";
import {
  ENCLOSE_CLASSIFICATION, isCurveEntersEdgeAtPoint, isCurveEntersEnclose, isInsideEnclose,
  isOnPositiveHalfPlaneFromVec
} from "../operations/boolean";

export class Face extends TopoObject {

  constructor(surface) {
    super();
    this.surface = surface;
    this.shell = null;
    this.outerLoop = new Loop(this);
    this.innerLoops = [];
    this.defineIterable('loops', () => loopsGenerator(this));
    this.defineIterable('edges', () => halfEdgesGenerator(this));
    Object.defineProperty(this, "id", {
      get: () => this.data.id,
      set: (value) => this.data.id = value,
    });
  }

  createWorkingPolygon() {
    return [this.outerLoop, ...this.innerLoops].map(loop => loop.tess().map(pt => this.surface.workingPoint(pt)));
  }

  env2D() {
    if (this.__2d === undefined) {
      let workingPolygon = this.createWorkingPolygon();
      let [inner, ...outers] = workingPolygon;
      this.__2d = {
        pip: PIP(inner, outers),
        workingPolygon
      }
    }
    return this.__2d;
  }
  
  getAnyHalfEdge() {
    let e = this.outerLoop.halfEdges[0];
    if (!e && this.innerLoops[0]) {
      e = this.innerLoops[0].halfEdges[0];
    }
    return e;
  }
  
  getAnyVertex() {
    return this.getAnyHalfEdge().vertexA;
  }
  
  rayCast(pt) {

    for (let edge of this.edges) {
      if (veq(pt, edge.vertexA.point)) {
        return {
          inside: true,
          strictInside: false,
          vertex: edge.vertexA
        };
      }
    }

    for (let edge of this.edges) {
      if (edge.edge.curve.passesThrough(pt)) {
        return {
          inside: true,
          strictInside: false,
          edge
        }
      }
    }

    function closestPointToEdge(edge) {
      return edge.edge.curve.point(edge.edge.curve.param(pt));
    }
    
    let closest = null;    
    for (let edge of this.edges) {
      let closestPoint = closestPointToEdge(edge);
      let dist = pt.distanceToSquared(closestPoint);
      if (closest === null || dist < closest.dist) {
        closest = {dist, pt: closestPoint, edge};
      }
    }
    let enclose = null;
    function findEnclosure(vertex) {
      for (let e of closest.edge.loop.encloses) {
        if (e[2] === vertex) {
          return e;
        }
      }
    }
    if (veq(closest.pt, closest.edge.vertexA.point)) {
      enclose = findEnclosure(closest.edge.vertexA);
    } else if (veq(closest.pt, closest.edge.vertexB.point)) {
      enclose = findEnclosure(closest.edge.vertexB);
    }

    let normal = this.surface.normal(closest.pt);
    let testee = closest.pt.minus(pt)._normalize();
    let inside;
    
    if (enclose !== null) {

      let [a, b] = enclose;
      
      let inVec = a.tangentAtEnd();
      let outVec = b.tangentAtStart();

      let coiIn = veqNeg(inVec, testee);
      let coiOut = veq(outVec, testee);

      if (coiIn && coiOut) {
        return null;
      }

      let negate = coiIn || coiOut;
      if (negate) {
        testee = testee.negate();
      }
      let insideEnclose = isInsideEnclose(normal, testee, inVec, outVec);
      if (negate) {
        insideEnclose = !insideEnclose;
      }  
      inside = !insideEnclose;
    } else {
      inside = !isOnPositiveHalfPlaneFromVec(closest.edge.tangent(closest.pt), testee, normal);
    }
    return {
      inside,
      strictInside: inside,
    };
  }
}

export function* loopsGenerator(face) {
  if (face.outerLoop !== null) {
    yield face.outerLoop;
  }
  for (let innerLoop of face.innerLoops) {
    yield innerLoop;
  }
}

export function* halfEdgesGenerator(face) {
  for (let loop of face.loops) {
    for (let halfEdge of loop.halfEdges) {
      yield halfEdge;
    }
  }
}
