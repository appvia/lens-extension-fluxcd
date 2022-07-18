import { Renderer } from '@k8slens/extensions'

const { KubeApi } = Renderer.K8sApi;

type Pod = Renderer.K8sApi.Pod;
const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;


export class HelmRelease extends KubeObject {
  static readonly kind = "HelmRelease";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases";
}

export class HelmReleaseApi extends KubeApi<HelmRelease> {
}
export const helmReleaseApi = new HelmReleaseApi({ objectConstructor: HelmRelease });
export class HelmReleaseStore extends KubeObjectStore<HelmRelease> {
  api: Renderer.K8sApi.KubeApi<HelmRelease> = helmReleaseApi;
}
export const helmReleaseStore = new HelmReleaseStore();

Renderer.K8sApi.apiManager.registerStore(helmReleaseStore);

