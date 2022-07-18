import { Renderer } from '@k8slens/extensions'

const { KubeApi } = Renderer.K8sApi;

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;


export class HelmRepository extends KubeObject {
  static readonly kind = "HelmRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta2/helmrepositories";
}

export class HelmRepositoryApi extends KubeApi<HelmRepository> {
}
export const helmRepositoryApi = new HelmRepositoryApi({ objectConstructor: HelmRepository });
export class HelmRepositoryStore extends KubeObjectStore<HelmRepository> {
  api: Renderer.K8sApi.KubeApi<HelmRepository> = helmRepositoryApi;
}
export const helmRepositoryStore = new HelmRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(helmRepositoryStore);

