import React from "react";
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    MenuItem,
    Icon,
  },
} = Renderer;

export function FluxcdObjectSuspendResumeMenuItem(props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.KubeObject>) {
  const { object: kustomization, toolbar } = props;
  if (!kustomization) return null;

  const suspend = async () => {
    kustomization.spec.suspend = true
    await kustomization.update(kustomization)
  };

  const resume = async () => {
    kustomization.spec.suspend = false
    await kustomization.update(kustomization)
  };

  if (kustomization.spec.suspend === true) {
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