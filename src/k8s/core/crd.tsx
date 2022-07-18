import { Renderer } from '@k8slens/extensions'

const { KubeApi } = Renderer.K8sApi;

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

type CustomResourceDefinition = Renderer.K8sApi.CustomResourceDefinition
const CustomResourceDefinition = Renderer.K8sApi.CustomResourceDefinition

export class CrdApi extends KubeApi<CustomResourceDefinition> {
}

export const crdApi = new CrdApi({ objectConstructor: CustomResourceDefinition });
export class CrdStore extends KubeObjectStore<CustomResourceDefinition> {
  api: Renderer.K8sApi.KubeApi<CustomResourceDefinition> = crdApi;
}

export const crdStore = new CrdStore();

Renderer.K8sApi.apiManager.registerStore(crdStore);
