import { Renderer } from "@k8slens/extensions";
import React from "react"
import * as Doodles from 'react-open-doodles'

import { FluxcdObjectReconcileMenuItem } from "./src/fluxcd-object-reconcile-menu-item";
import { FluxcdObjectSuspendResumeMenuItem } from "./src/fluxcd-object-suspend-resume-menu-item";

export default class FluxCDExtension extends Renderer.LensExtension {

  kubeObjectMenuItems = [
    { kind: "Kustomization", apiVersions: ["kustomize.toolkit.fluxcd.io/v1beta2"], command: 'kustomization' },
    { kind: "HelmRelease", apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"], command: 'helmrelease' },
    { kind: "GitRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta2"], command: 'source git' },
    { kind: "HelmRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta2"], command: 'source helm' },
  ].map(el => {
    return {
      kind: el.kind,
      apiVersions: el.apiVersions,
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.KubeObject>) => <FluxcdObjectReconcileMenuItem {...props} command={el.command} />,
      }
    }
  }).concat([
    { kind: "Kustomization", apiVersions: ["kustomize.toolkit.fluxcd.io/v1beta2"] },
    { kind: "HelmRelease", apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"] },
    { kind: "GitRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta2"] },
    { kind: "HelmChart", apiVersions: ["source.toolkit.fluxcd.io/v1beta1"] },
    { kind: "HelmChart", apiVersions: ["source.toolkit.fluxcd.io/v1beta2"] },
    { kind: "HelmRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta2"] },
  ].map(el => {
    return {
      kind: el.kind,
      apiVersions: el.apiVersions,
      components: {
        MenuItem: (props: Renderer.Component.KubeObjectMenuProps<Renderer.K8sApi.KubeObject>) => <FluxcdObjectSuspendResumeMenuItem {...props} />,
      }
    }
  }))

}
