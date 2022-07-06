# Lens "FluxCD" Extension

Adds FluxCD actions to Flux resources:

* Reconcile
* Suspend/Resume

## Install

```sh
mkdir -p ~/.k8slens/extensions
git clone https://github.com/eu-evops/lens-extension-fluxcd.git
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

Open Lens application and navigate to a cluster. You should see "Hello World" in a menu.

## Uninstall

```sh
rm ~/.k8slens/extensions/lens-extension-fluxcd
```

Restart Lens application.
