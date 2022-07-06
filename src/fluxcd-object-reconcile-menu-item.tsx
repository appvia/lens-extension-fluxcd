import React from "react";
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    terminalStore,
    MenuItem,
    Icon,
  },
  Navigation,
} = Renderer;


export function FluxcdObjectReconcileMenuItem(props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.KubeObject> & { command: string }) {
  const { object, toolbar, command } = props;
  if (!object) return null;

  const sendToTerminal = (command: string) => {
    Navigation.hideDetails();
    terminalStore.sendCommand(command, {
      enter: true,
      newTab: true,
    });
  };

  const reconcile = async () => {
    if (!object.metadata.annotations) {
      object.metadata.annotations = {}
    }

    object.metadata.annotations["reconcile.fluxcd.io/requestedAt"] = new Date().toISOString()
    await object.update(object);
  };

  return (
    <MenuItem onClick={reconcile} disabled={object.spec.suspend === true}>
      <Icon material="autorenew" interactive={toolbar} title="Reconcile" />
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}