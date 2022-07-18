import { Renderer } from '@k8slens/extensions'

const { KubeApi } = Renderer.K8sApi;

type Pod = Renderer.K8sApi.Pod;
const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;


export class HelmChart extends KubeObject {
  static readonly kind = "HelmChart";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta2/helmcharts";
}

export class HelmChartApi extends KubeApi<HelmChart> {
}
export const helmChartApi = new HelmChartApi({ objectConstructor: HelmChart });
export class HelmChartStore extends KubeObjectStore<HelmChart> {
  api: Renderer.K8sApi.KubeApi<HelmChart> = helmChartApi;
}
export const helmChartStore = new HelmChartStore();

Renderer.K8sApi.apiManager.registerStore(helmChartStore);

