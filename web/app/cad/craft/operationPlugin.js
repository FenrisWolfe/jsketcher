import {createToken} from 'bus';
import {TOKENS as WIZARD_TOKENS} from './wizard/wizardPlugin'

export function activate(context) {
  let {bus, services} = context;

  let registry = {}; 
  
  function addOperation(descriptor, actions) {
    let {id, label, info, icon, actionParams} = descriptor;

    let opAction = {
      id: id,
      appearance: {
        label,
        info,
        icon32: icon + '32.png',
        icon96: icon + '96.png',
      },
      invoke: () => bus.dispatch(WIZARD_TOKENS.OPEN, {type: id}),
      ...actionParams
    };
    actions.push(opAction);

    registry[id] = descriptor;

    bus.subscribe(TOKENS.RUN, ({type, params}) => registry[type].run(params));
  }

  function registerOperations(operations) {
    let actions = [];
    for (let op of operations) {
      addOperation(op, actions);
    }
    services.action.registerActions(actions);
  }
  
  function get(id) {
    let op = registry[id];
    if (!op) {
      this `operation ${id} is not registered`;
    }
    return op;
  }
  
  services.operation = {
    registerOperations,
    registry,
    get
  }
}


export const TOKENS = {
  RUN: createToken('operation', 'run'),
};