import { Renderer } from "@k8slens/extensions";
import React from "react";
import './pie-chart.scss'

const getStats = (objects: Renderer.K8sApi.KubeObject[]) => {
  const suspended = objects.filter(k => k.spec.suspend === true).length;
  const ready = objects.filter(k => !k.spec.suspend && k.status?.conditions?.find((c: any) => c.type === "Ready").status === "True").length;
  const notReady = objects.filter(k => !k.spec.suspend && k.status?.conditions?.find((c: any) => c.type === "Ready").status === "False").length;
  const inProgress = objects.length - ready - notReady - suspended;

  return [ready, notReady, inProgress, suspended];
}

export interface PieChartProps<A extends Renderer.K8sApi.KubeObject> {
  objects: A[];
  title: string;
  crd: Renderer.K8sApi.CustomResourceDefinition;
}

export function PieChart(props: PieChartProps<Renderer.K8sApi.KubeObject>): React.ReactElement {
  const { objects, title, crd } = props;
  const [ready, notReady, inProgress, suspended] = getStats(objects);

  return <>
    <a className="center" onClick={(e) => { e.preventDefault(); Renderer.Navigation.navigate({ pathname: `/crd/${crd.spec.group}/${crd.spec.names.plural}` }) }}>{title}: {objects.length}</a>
    <Renderer.Component.PieChart
      // title={`${title}: ${objects.length}`}
      options={{
        tooltips: {
          callbacks: {
            title(item, data) {
              return `${data.labels[item[0].index]}`;
            },
            label(tooltipItem, data) {
              return `${data.labels[tooltipItem.index]}`;
            },
          }
        }
      }}
      data={{
        labels: [
          `Ready: ${ready}`, `Not Ready: ${notReady}`, `In progress: ${inProgress}`, `Suspended: ${suspended}`
        ],
        datasets: [
          {
            data: [ready, notReady, inProgress, suspended],
            backgroundColor: ['#00FF00', '#FF0000', '#FF6600', '#3a3a3c'],
          }
        ]
      }}



    />
  </>
}