import { Renderer } from "@k8slens/extensions";
import React from "react";
import { KubeJsonApiData } from '@k8slens/extensions/dist/src/common/k8s-api/kube-json-api'
import { IKubeWatchEvent } from '@k8slens/extensions/dist/src/common/k8s-api/kube-watch-event'
import { Kustomization } from "../k8s/fluxcd/kustomization";

interface KustomizationDetailsState {
  events: Renderer.K8sApi.KubeEvent[]
}

const KubeObject = Renderer.K8sApi.KubeObject;

const { Component: { Table, TableHead, TableRow, TableCell, DrawerTitle, DrawerItem } } = Renderer

export class FluxCDKustomizationDetails extends React.Component<Renderer.Component.KubeObjectDetailsProps<Kustomization>, KustomizationDetailsState> {
  public readonly state: Readonly<KustomizationDetailsState> = {
    events: []
  }
  unsubscribe: any;

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  }

  async loadData() {
    this.setState({ events: [] })
    const events = await Renderer.K8sApi.eventApi.list({}, {
      fieldSelector: [
        `involvedObject.uid=${this.props.object.metadata.uid}`,
      ]
    }).then(res => res.sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp)))
    this.setState({ events })

    console.log("Will watch %s (%s)", this.props.object.metadata.name, this.props.object.metadata.uid)
    this.unsubscribe = Renderer.K8sApi.eventApi.watch({
      namespace: "", callback: (data: IKubeWatchEvent<KubeJsonApiData>) => {
        if (!data) {
          return
        }

        if (data.type === "ERROR") {
          return
        }


        const { object: currentObject } = this.props
        const { type, object } = data

        const kubeObject = new KubeObject(object)
        const event = new Renderer.K8sApi.KubeEvent(kubeObject)

        const existingObjectIndex = events.findIndex(e => e.metadata.uid === object.metadata.uid)
        const existingObject = events[existingObjectIndex]

        if (event.involvedObject.uid !== currentObject.metadata.uid) {
          return
        }

        switch (type) {
          case 'ADDED':
          case 'MODIFIED':
            if (!existingObject) {
              events.unshift(event)
            } else {
              events[existingObjectIndex] = event
            }

            break;
          case 'DELETED':
            if (existingObject) {
              events.splice(existingObjectIndex, 1)
            }
        }

        this.setState({ events })
      }
    })
  }

  getSnapshotBeforeUpdate(prevProps: Readonly<Renderer.Component.KubeObjectDetailsProps<Kustomization>>, prevState: Readonly<KustomizationDetailsState>) {
    if (this.props.object.metadata.uid !== prevProps.object.metadata.uid) {
      this.loadData()
    }
  }

  async componentDidMount() {
    this.loadData()
  }

  render() {
    const { events } = this.state
    const { object } = this.props
    return (
      <div>

        <DrawerItem name="Name">{object.metadata.name}</DrawerItem>
        <DrawerItem name="Namespace">{object.metadata.namespace}</DrawerItem>
        <DrawerItem name="Source">
          <a onClick={e => { e.preventDefault(); Renderer.Navigation.showDetails(object.selfLink, true) }}>
            {object.spec.sourceRef.kind}:{object.spec.sourceRef.name}
          </a>
        </DrawerItem>
        <DrawerItem name="Path">{object.spec.path}</DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? 'Yes' : 'No'}</DrawerItem>
        <DrawerItem name="Prune">{object.spec.prune === true ? 'Yes' : 'No'}</DrawerItem>
        <DrawerItem name="Last Applied Revision">{object.status.lastAppliedRevision}</DrawerItem>
        <DrawerItem name="Ready">{object.status?.conditions.find((s: any) => s.type === "Ready").status}</DrawerItem>
        <DrawerItem name="Status">{object.status?.conditions.find((s: any) => s.type === "Ready").message}</DrawerItem>
        <DrawerItem name="Version">{object.metadata.resourceVersion}</DrawerItem>
        <DrawerItem name="UID">{object.metadata.uid}</DrawerItem>

        <DrawerTitle title="Events">
          Events
        </DrawerTitle>

        <div className="KubeEventDetails">
          {events.map(e => (
            <div className="event">
              <div className="title">{e.message}</div>
              <DrawerItem name="Source">
                {e.source.component}
              </DrawerItem>

              <DrawerItem name="Count">
                {e.count}
              </DrawerItem>

              <DrawerItem name="Sub-object">
                {e.involvedObject.fieldPath}
              </DrawerItem>

              <DrawerItem name="Last seen">
                {e.lastTimestamp}
              </DrawerItem>

              <DrawerItem name="Reason">
                {e.reason}
              </DrawerItem>
            </div>
          ))}
        </div>
      </div>
    )
  }

}

