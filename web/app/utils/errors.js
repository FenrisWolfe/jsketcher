
export default class CadError extends Error {
  
  constructor({kind, code, relatedTopoObjects, userMessage} = __EMPTY) {
    super();
    this.kind = kind || CadError.KIND.INTERNAL_ERROR;
    this.code = code;
    this.relatedTopoObjects = relatedTopoObjects;
    this.userMessage = userMessage;
  }

  //https://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
  TYPE = CadError;
}

const __EMPTY = {};

CadError.KIND = {
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNSUPPORTED_CASE: 'UNSUPPORTED_CASE',
  INVALID_INPUT: 'INVALID_INPUT',
};