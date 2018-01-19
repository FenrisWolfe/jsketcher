import Bus from 'bus';
import * as DomPlugin from '../dom/domPlugin';
import * as PickControlPlugin from '../scene/controls/pickControlPlugin';
import * as ScenePlugin from '../scene/scenePlugin';
import * as SelectionMarkerPlugin from '../scene/selectionMarker/selectionMarkerPlugin';
import * as ActionSystemPlugin from '../actions/actionSystemPlugin';
import * as UiEntryPointsPlugin from '../dom/uiEntryPointsPlugin';
import * as MenuPlugin from '../dom/menu/menuPlugin';
import * as KeyboardPlugin from '../keyboard/keyboardPlugin';
import * as WizardPlugin from '../craft/wizard/wizardPlugin';
import * as OperationPlugin from '../craft/operationPlugin';

import * as PartModellerPlugin from '../part/partModellerPlugin';

import startReact from "../dom/startReact";

export default function startApplication(callback) {

  let applicationPlugins = [PartModellerPlugin];
  
  let preUIPlugins = [
    ActionSystemPlugin,
    MenuPlugin,
    UiEntryPointsPlugin,
    KeyboardPlugin,
    WizardPlugin,
    OperationPlugin
  ];
  
  let plugins = [
    DomPlugin,
    ScenePlugin,
    PickControlPlugin,
    SelectionMarkerPlugin,
    ...applicationPlugins,
  ];

  let context = {
    bus: new Bus(),
    services: {}
  };

  activatePlugins(preUIPlugins, context);

  startReact(context, () => {
    activatePlugins(plugins, context);
    context.services.viewer.render();
    callback(context);
  });
}

export function activatePlugins(plugins, context) {
  for (let plugin of plugins) {
    plugin.activate(context);
  }
}

