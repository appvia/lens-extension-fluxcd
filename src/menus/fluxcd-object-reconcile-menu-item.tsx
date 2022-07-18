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

export interface FluxcdObjectReconcileMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.KubeObject> {
  api: Renderer.K8sApi.KubeApi<Renderer.K8sApi.KubeObject>;
}

export function FluxcdObjectReconcileMenuItem(props: FluxcdObjectReconcileMenuItemProps) {
  const { object, toolbar, api } = props;
  if (!object) return null;

  const reconcile = async () => {
    if (!object.metadata.annotations) {
      object.metadata.annotations = {}
    }

    object.metadata.annotations["reconcile.fluxcd.io/requestedAt"] = new Date().toISOString()
    await api.update({ name: object.metadata.name, namespace: object.metadata.namespace }, object)
  };

  return (
    <MenuItem onClick={reconcile} disabled={object.spec.suspend === true}>
      <Icon material="autorenew" interactive={toolbar} title="Reconcile" />
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}