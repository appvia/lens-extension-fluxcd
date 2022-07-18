import React from "react";
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    MenuItem,
    Icon,
  },
} = Renderer;

export interface FluxCdObjectSuspendResumeMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.KubeObject> {
  api: Renderer.K8sApi.KubeApi<Renderer.K8sApi.KubeObject>;
}

export function FluxcdObjectSuspendResumeMenuItem(props: FluxCdObjectSuspendResumeMenuItemProps) {
  const { object, toolbar, api } = props;

  if (!object) return null;

  const suspend = async () => {
    object.spec.suspend = true
    await api.update({
      name: object.metadata.name, namespace: object.metadata.namespace
    }, object)
  };

  const resume = async () => {
    object.spec.suspend = false

    await api.update({
      name: object.metadata.name, namespace: object.metadata.namespace
    }, object)
  };

  if (object.spec.suspend === true) {
    return (
      <MenuItem onClick={resume}>
        <Icon material="play_circle_outline" interactive={toolbar} title="Resume" />
        <span className="title">Resume</span>
      </MenuItem>
    );
  }

  return (
    <MenuItem onClick={suspend}>
      <Icon material="pause_circle_filled" interactive={toolbar} title="Suspend" />
      <span className="title">Suspend</span>
    </MenuItem>
  );
}