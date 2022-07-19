# Lens FluxCD Extension

Add FluxCD support to Lens. https://fluxcd.io/

The following features are available:

* FluxCD dashboard of Flux Application components (Kustomizations and HelmReleases) and Sources (GitRepositories, HelmRepositories, HelmCharts and Buckets)
* FluxCD resource menus
  * Reconcile
  * Suspend/Resume
* FluxCD Kustomization details

## Screenshots

Dashboard
![./docs/images/dashboard.png](./docs/images/dashboard.png)

Details
![./docs/images/details.png](./docs/images/details.png)


Events
![./docs/images/events.png](./docs/images/events.png)


## Install

To install open K8s Lens and go to Extensions (CTRL+SHIFT+E or CMD+SHIFT+E), and install `@appvia/lens-extension-fluxcd`.

or

Click on the following lens:// link [lens://app/extensions/install/lens-certificate-info](lens://app/extensions/install/lens-certificate-info)




## Development

To install the extension for development

```sh
mkdir -p ~/.k8slens/extensions
git clone https://github.com/appvia/lens-extension-fluxcd.git
ln -s $(pwd) ~/.k8slens/extensions/lens-extension-fluxcd
```

## Build

To build the extension you can use `make` or run the `npm` commands manually:

```sh
make build
```

OR

```sh
npm install
npm run build
```

If you want to watch for any source code changes and automatically rebuild the extension you can use:

```sh
npm run dev
```

## Test

Open Lens application and navigate to a cluster. You should see "FluxCD" dashboard in a cluster menu.

## Uninstall

```sh
rm ~/.k8slens/extensions/lens-extension-fluxcd
```

Restart Lens application.
