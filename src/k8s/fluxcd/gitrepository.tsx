import { Renderer } from '@k8slens/extensions'

const { KubeApi } = Renderer.K8sApi;

type Pod = Renderer.K8sApi.Pod;
const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;


export class GitRepository extends KubeObject {
  static readonly kind = "GitRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/gitrepositories";
}

export class GitRepositoryApi extends KubeApi<GitRepository> {
}

export const gitRepositoryApi = new GitRepositoryApi({ objectConstructor: GitRepository });
export class GitRepositoryStore extends KubeObjectStore<GitRepository> {
  api: Renderer.K8sApi.KubeApi<GitRepository> = gitRepositoryApi;
}

export const gitRepositoryStore = new GitRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(gitRepositoryStore);
