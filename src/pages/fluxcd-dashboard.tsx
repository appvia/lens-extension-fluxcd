import { Renderer } from '@k8slens/extensions'
import { KubeEvent } from '@k8slens/extensions/dist/src/common/k8s-api/endpoints';
import { PieChart } from '../components/pie-chart'
// import type { KubeObjectAge } from '@k8slens/extensions/dist/src/renderer/components/kube-object/age';
// import type { Link } from "react-router-dom";
// import type { ReactiveDuration } from "@k8slens/extensions/dist/src/renderer/components/duration/reactive-duration";


import React, { useEffect, useState } from "react";
const { Component: { TableHead, TableRow, TableCell, Table, Spinner, Tooltip, DrawerItem }, } = Renderer;
const KubeObject = Renderer.K8sApi.KubeObject;

class FluxEventsStore extends Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.KubeEvent> {
  api = Renderer.K8sApi.eventApi;

  protected filterItemsOnLoad(items: Renderer.K8sApi.KubeEvent[]): Renderer.K8sApi.KubeEvent[] {
    return items.filter(i => FluxTypes.findIndex(ft => i.involvedObject.kind === ft.kind) !== -1);
  }
}

const fluxEventsStore = new FluxEventsStore();

import { gitRepositoryStore, GitRepository } from '../k8s/fluxcd/gitrepository'
import { helmChartStore, HelmChart } from '../k8s/fluxcd/helmchart'
import { helmRepositoryStore, HelmRepository } from '../k8s/fluxcd/helmrepository'
import { helmReleaseStore, HelmRelease } from '../k8s/fluxcd/helmrelease'
import { kustomizationStore, Kustomization, kustomizationApi } from '../k8s/fluxcd/kustomization'
import { bucketStore, Bucket } from '../k8s/fluxcd/bucket'
import { crdStore } from '../k8s/core/crd'
import { FluxcdObjectReconcileMenuItem } from '../menus/fluxcd-object-reconcile-menu-item'
import { FluxcdObjectSuspendResumeMenuItem } from '../menus/fluxcd-object-suspend-resume-menu-item'

import './fluxcd-dashboard.scss'

import { formatDuration } from '../utils';
import { makeObservable } from 'mobx';
import { observer } from 'mobx-react';

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
  lastSeen = "last-seen",
}

interface FluxCDDashboardState {
  kustomizations: Kustomization[]
  gitRepositories: GitRepository[]
  helmReleases: HelmRelease[]
  helmCharts: HelmChart[]
  helmRepositories: HelmRepository[]
  buckets: Bucket[]
  crds: Renderer.K8sApi.CustomResourceDefinition[]

  selectedTableRowId: string
}

interface IApiConf {
  api: Renderer.K8sApi.KubeApi<any>;
  state: Renderer.K8sApi.KubeObject[];
  stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => void;
}

@observer
export class FluxCDDashboard extends React.Component<{ extension: Renderer.LensExtension }, FluxCDDashboardState> {
  public readonly state: Readonly<FluxCDDashboardState> = {
    kustomizations: [],
    gitRepositories: [],
    helmReleases: [],
    helmCharts: [],
    helmRepositories: [],
    buckets: [],
    crds: [],
    selectedTableRowId: ""
  }

  private readonly watches: (() => void)[] = [];
  private readonly abortController = new AbortController();

  constructor(props: { extension: Renderer.LensExtension }) {
    super(props);

    makeObservable(this)
  }

  componentWillUnmount(): void {
    this.abortController.abort();
    this.watches.forEach(w => { console.log('Unregistering watch'); w() });
    this.watches.splice(0, this.watches.length);
    this.watches.length = 0;
  }

  getCrd(kubeObject: Renderer.K8sApi.KubeObject): Renderer.K8sApi.CustomResourceDefinition {
    const { crds } = this.state

    if (!kubeObject) {
      return null
    }

    if (!crds) {
      return null;
    }

    return crds.find(crd => crd.spec.names.kind === kubeObject.kind && crd.spec.group === kubeObject.apiVersion.split("/")[0])
  }

  getChart(title: string, objects: Renderer.K8sApi.KubeObject[]) {
    if (!objects || objects.length === 0) {
      return null
    }

    const crd = this.getCrd(objects[0])
    if (!crd) {
      return null
    }

    return <div className="column">
      <PieChart title={title} objects={objects} crd={this.getCrd(objects[0])} />
    </div>
  }

  async componentDidMount() {
    crdStore.loadAll().then(l => this.setState({ crds: l }));

    [
      kustomizationStore,
      helmReleaseStore,
      gitRepositoryStore,
      helmChartStore,
      helmRepositoryStore,
      bucketStore,
    ].forEach(store => {
      store.loadAll().then(() => this.watches.push(store.subscribe()))
    })

    // [
    //   { api: kustomizationApi, state: kustomizations, stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => this.setState({ kustomizations: list }) },
    //   { api: gitRepositoryApi, state: gitRepositories, stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => this.setState({ gitRepositories: list }) },
    //   { api: helmReleaseApi, state: helmReleases, stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => this.setState({ helmReleases: list }) },
    //   { api: helmChartApi, state: helmCharts, stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => this.setState({ helmCharts: list }) },
    //   { api: helmRepositoryApi, state: helmRepositories, stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => this.setState({ helmRepositories: list }) },
    //   { api: bucketApi, state: buckets, stateUpdate: (list: Renderer.K8sApi.KubeObject[]) => this.setState({ buckets: list }) },
    // ].forEach((apiConf: IApiConf) => {
    //   const something = apiConf.api.watch({
    //     namespace: "",
    //     abortController: this.abortController,
    //     callback: (data: IKubeWatchEvent<KubeJsonApiData>) => {
    //       if (!data) {
    //         return
    //       }

    //       if (data.type === 'ERROR') return

    //       const { type, object } = data
    //       const { state: items } = apiConf;

    //       const existingObjectIndex = apiConf.state.findIndex(k => k.metadata.uid === object.metadata.uid)
    //       const existingObject = apiConf.state[existingObjectIndex]

    //       switch (type) {
    //         case 'ADDED':
    //         case 'MODIFIED':
    //           const kubeObject = new KubeObject(data.object)
    //           console.log('Modified [%s](%s) [%s](%s)',
    //             existingObject?.metadata.name,
    //             existingObject?.metadata.resourceVersion,
    //             kubeObject.metadata.name,
    //             kubeObject.metadata.resourceVersion
    //           )
    //           if (!existingObject) {
    //             items.push(kubeObject)
    //           } else {
    //             items[existingObjectIndex] = kubeObject
    //           }

    //           break;
    //         case 'DELETED':
    //           if (existingObject) {
    //             items.splice(existingObjectIndex, 1)
    //           }
    //       }

    //       apiConf.stateUpdate(items)
    //     }
    //   })

    //   this.watches.push(something);
    // });
  }

  render() {
    // const { gitRepositories, helmReleases, helmCharts, helmRepositories, buckets } = this.state;

    const getStatusClassName = (obj: any) => {
      if (obj.spec.suspend) return 'statusSuspended';
      if (obj.status?.conditions.find((c: any) => c.type === "Ready").status === "True") return 'statusReady';
      if (obj.status?.conditions.find((c: any) => c.type === "Ready").status === "False") return 'statusNotReady';
      return 'statusInProgress';
    }

    if (this.state.crds.length === 0) {
      return <div>No Flux components found in the cluster</div>
    }

    return <Renderer.Component.TabLayout>
        <div className="fluxContent">
            <header className="flex gaps align-center pb-3">
                <h1>FluxCD Dashboard</h1>
            </header>

            <div className="grid flex FluxWorkloads pb-3">
                {this.getChart('Kustomizations', kustomizationStore.items)}
                {this.getChart('Helm releases', helmReleaseStore.items)}

                {this.getChart('Git Repositories', gitRepositoryStore.items)}
                {this.getChart('Helm Repositories', helmRepositoryStore.items)}
                {this.getChart('Helm Charts', helmChartStore.items)}
                {this.getChart('Buckets', bucketStore.items)}
            </div>

            <h2>Applications</h2>
            <div className='grid flex gaps mb-3 FluxPanels'>
                {kustomizationStore.items.map(k => (<div className={['fluxPanel', 'column', getStatusClassName(k)].join(' ')}>
                <header>
                    <h3>
                    <a onClick={e => {
                        e.preventDefault();
                        Renderer.Navigation.createPageParam({
                        name: "kube-details",
                        defaultValue: k.selfLink,
                        })
                        Renderer.Navigation.showDetails(k.selfLink);
                    }}>{k.metadata.name}</a>
                    </h3>
                </header>
                <article>
                    <DrawerItem name="Type">{k.kind}</DrawerItem>
                    <DrawerItem name="Source">{k.spec.sourceRef.kind}:{k.spec.sourceRef.name}</DrawerItem>
                    <DrawerItem name="Path">{k.spec.path}</DrawerItem>
                    <DrawerItem name="Interval">{k.spec.interval}</DrawerItem>
                    <DrawerItem name="Status">{k.status.conditions.find((c: any) => c.type === 'Ready').message}</DrawerItem>
                </article>
                </div>))
                }
                {
                helmReleaseStore.items.map(h => (<div className={['fluxPanel', 'column', getStatusClassName(h)].join(' ')}>
                    <header>
                    <h3><a onClick={e => { e.preventDefault(); Renderer.Navigation.showDetails(h.selfLink) }}>{h.metadata.name}</a></h3>
                    </header>
                    <article>
                    <DrawerItem name="Type">{h.kind}</DrawerItem>
                    <DrawerItem name="Source">{h.spec.chart.spec.sourceRef.kind}:{h.spec.chart.spec.sourceRef.name}</DrawerItem>
                    <DrawerItem name="Chart">{h.spec.chart.spec.chart}</DrawerItem>
                    <DrawerItem name="Version">{h.spec.chart.spec.version}</DrawerItem>
                    <DrawerItem name="Interval">{h.spec.interval}</DrawerItem>
                    <DrawerItem name="Status">{h.status.conditions.find((c: any) => c.type === 'Ready').message}</DrawerItem>
                    </article>
                </div>))
                }
            </div >

            <h2>Sources</h2>
            <div className='grid flex gaps mb-3 FluxPanels'>
                {gitRepositoryStore.items.map(s => (<div className={['fluxPanel', 'column', getStatusClassName(s)].join(' ')}>
                <header>
                    <h3><a onClick={e => {
                    e.preventDefault();
                    Renderer.Navigation.createPageParam({
                        name: "kube-details",
                        defaultValue: s.selfLink,
                    })
                    Renderer.Navigation.showDetails(s.selfLink);
                    }}>{s.metadata.name}</a></h3>
                </header>
                <article>
                    <DrawerItem name="Type">{s.kind}</DrawerItem>
                    <DrawerItem name="URL">{s.spec.url}</DrawerItem>
                    <DrawerItem name="Ref">{s.spec.ref.branch || s.spec.ref.tag}</DrawerItem>
                    <DrawerItem name="Interval">{s.spec.interval}</DrawerItem>
                    <DrawerItem name="Status">{s.status.conditions.find((c: any) => c.type === 'Ready').message}</DrawerItem>
                </article>
                </div>))
                }
                {helmRepositoryStore.items.map(s => (<div className={['fluxPanel', 'column', getStatusClassName(s)].join(' ')}>
                <header>
                    <h3><a onClick={e => { e.preventDefault(); Renderer.Navigation.showDetails(s.selfLink) }}>{s.metadata.name}</a></h3>
                </header>
                <article>
                    <DrawerItem name="Type">{s.kind}</DrawerItem>
                    <DrawerItem name="URL">{s.spec.url}</DrawerItem>
                    <DrawerItem name="Interval">{s.spec.interval}</DrawerItem>
                    <DrawerItem name="Status">{s.status.conditions.find((c: any) => c.type === 'Ready').message}</DrawerItem>
                </article>
                </div>))
                }
                {helmChartStore.items.map(s => (<div className={['fluxPanel', 'column', getStatusClassName(s)].join(' ')}>
                <header>
                    <h3><a onClick={e => { e.preventDefault(); Renderer.Navigation.showDetails(s.selfLink) }}>{s.metadata.name}</a></h3>
                </header>
                <article>
                    <DrawerItem name="Type">{s.kind}</DrawerItem>
                    <DrawerItem name="Chart">{s.spec.chart}</DrawerItem>
                    <DrawerItem name="Version">{s.spec.version}</DrawerItem>
                    <DrawerItem name="Interval">{s.spec.interval}</DrawerItem>
                    <DrawerItem name="Status">{s.status.conditions.find((c: any) => c.type === 'Ready').message}</DrawerItem>
                </article>
                </div>))
                }
                {bucketStore.items.map(s => (<div className={['fluxPanel', 'column', getStatusClassName(s)].join(' ')}>
                <header>
                    <h3><a onClick={e => { e.preventDefault(); Renderer.Navigation.showDetails(s.selfLink) }}>{s.metadata.name}</a></h3>
                </header>
                <article>
                    <DrawerItem name="Type">{s.kind}</DrawerItem>
                    <DrawerItem name="URL">{s.spec.url}</DrawerItem>
                    <DrawerItem name="Interval">{s.spec.interval}</DrawerItem>
                    <DrawerItem name="Status">{s.status.conditions.find((c: any) => c.type === 'Ready').message}</DrawerItem>
                </article>
                </div>))
                }
            </div>

            <Renderer.Component.KubeObjectListLayout
                className="Events" store={fluxEventsStore}
                tableProps={{
                sortSyncWithUrl: false,
                sortByDefault: {
                    sortBy: columnId.lastSeen,
                    orderBy: 'asc',
                }
                }}
                isSelectable={false}
                getItems={() => fluxEventsStore
                .contextItems
                .filter(onlyFluxEvents)
                .sort((a, b) => (new Date(b.lastTimestamp).getTime() || 0) - (new Date(a.lastTimestamp).getTime() || 0))}

                sortingCallbacks={{
                [columnId.namespace]: event => event.getNs(),
                [columnId.type]: event => event.type,
                [columnId.object]: event => event.involvedObject.name,
                [columnId.count]: event => event.count,
                [columnId.age]: event => -event.getCreationTimestamp(),
                [columnId.lastSeen]: event => event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0,
                }}
                searchFilters={[
                event => event.getSearchFields(),
                event => event.message,
                event => event.getSource(),
                event => event.involvedObject.name,
                ]}
                renderHeaderTitle="Flux Events"
                renderTableHeader={[
                { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
                { title: "Message", className: "message", id: columnId.message },
                { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
                { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
                { title: "Source", className: "source", id: columnId.source },
                { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
                { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
                { title: "Last Seen", className: "last-seen", sortBy: columnId.lastSeen, id: columnId.lastSeen },
                ]}
                renderTableContents={event => {
                const { involvedObject, type, message } = event;
                const tooltipId = `message-${event.getId()}`;
                const isWarning = event.isWarning();

                return [
                    type,
                    {
                    className: isWarning ? "warning" : "",
                    title: (
                        <>
                        <span id={tooltipId}>{message}</span>
                        <Tooltip targetId={tooltipId} formatters={{ narrow: true, warning: isWarning }}>
                            {message}
                        </Tooltip>
                        </>
                    ),
                    },
                    event.getNs(),
                    <>{`${involvedObject.kind}: ${involvedObject.name}`}</>,
                    // </Link>,
                    event.getSource(),
                    event.count,
                    <KubeEventAge timestamp={event.getCreationTimestamp()} />,
                    <KubeEventAge timestamp={new Date(event.lastTimestamp).getTime()} />,
                ];
                }}
            />
        </div>
    </Renderer.Component.TabLayout >
  }
}

export function KubeEventAge(props: { timestamp: number }): React.ReactElement {
  const getAge = (ts: number): string => {

    const diff = Date.now() - new Date(ts).getTime()
    return formatDuration(diff, true)
  }

  const [age, setAge] = useState(getAge(props.timestamp));

  useEffect(() => {
    const timeout = setInterval(() => {
      setAge(getAge(props.timestamp));
    }, 1000);

    return () => {
      clearInterval(timeout);
    }
  }, [])


  return <>{age}</>
}

const FluxTypes = [
  { kind: "Kustomization", apiVersions: ["kustomize.toolkit.fluxcd.io/v1beta1", "kustomize.toolkit.fluxcd.io/v1beta2"] },
  { kind: "HelmRelease", apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"] },
  { kind: "GitRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "HelmChart", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "HelmRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "Bucket", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
]

function onlyFluxEvents(event: KubeEvent) {
  return FluxTypes.findIndex(ft => { return ft.kind === event.involvedObject.kind && ft.apiVersions.includes(event.involvedObject.apiVersion) }) !== -1
}

