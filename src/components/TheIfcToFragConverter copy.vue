<template>
    <div class="ifc-to-frag-converter-container">
        <div ref="theConverterContainer" class="viewer-container"></div>
    </div>
</template>
<script setup lang="ts">
import Stats from "stats.js";
import * as BUI from "@thatopen/ui";
// You have to import * as OBC from "@thatopen/components"
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import { onMounted, onUnmounted, ref } from "vue";
const theConverterContainer = ref<HTMLElement | null>(null);

//
//
//
// Global error handler for worker errors
const handleWorkerError = (event: ErrorEvent) => {
  console.error("Worker error caught:", event)
  if (event.message && event.message.includes("incorrect header check")) {
    console.error("This is the 'incorrect header check' error we're trying to fix")
  }
}

// Add global error listener
onMounted(() => {
  window.addEventListener('error', handleWorkerError)
})

// Clean up the event listener
onUnmounted(() => {
  window.removeEventListener('error', handleWorkerError)
})



onMounted(async() => {
    if (!theConverterContainer.value) {
        console.error('Нет элемента-контейнера!')
        return;
    }

    const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);
const world = worlds.create<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera,
  OBC.SimpleRenderer
>();
world.scene = new OBC.SimpleScene(components);
world.scene.setup();
world.scene.three.background = null;

world.renderer = new OBC.SimpleRenderer(components, theConverterContainer.value)
world.camera = new OBC.OrthoPerspectiveCamera(components);
await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);
components.init();
components.get(OBC.Grids).create(world);

const ifcLoader = components.get(OBC.IfcLoader);
ifcLoader.onIfcImporterInitialized.add((importer) => {  console.log(importer.classes)})

await ifcLoader.setup({
    autoSetWasm: false,
    wasm: {
        path: "https://unpkg.com/web-ifc@0.0.72/",
        absolute: true,
    }
})

  const workerUrl = "/resources/worker.mjs"

  const fragments = components.get(OBC.FragmentsManager)
  fragments.init(workerUrl)

  world.camera.controls.addEventListener('rest', () => {
    fragments.core.update(true)
  })


  fragments.list.onItemSet.add(({value: model}) => {
    model.useCamera(world.camera.three)
    world.scene.three.add(model.object)
    fragments.core.update(true)
  })

  const loadIfc =  async (path: string) => {
    const file = await fetch(path)
    const data = await file.arrayBuffer()
    const buffer = new Uint8Array(data)
    await ifcLoader.load(buffer, false, 'example', {
        processData: {
            progressCallback: (progress: number) => {
                console.log(progress)
            }
        }
    } )
     }
    const downloadTheFragment = async () => {
        const [model] = fragments.list.values()
        if (!model) return
        const fragsBuffer = await model.getBuffer(false)
        const file = new File([fragsBuffer], 'fragments.frag')
        const link = document.createElement('a')
        link.href = URL.createObjectURL(file)
        link.download = file.name
        link.click()
        URL.revokeObjectURL(link.href)
    }

    BUI.Manager.init()

    const [panel, updatePanel] = BUI.Component.create<BUI.PanelSection, {}>((_) => {
  let downloadBtn: BUI.TemplateResult | undefined;
  if (fragments.list.size > 0) {
    downloadBtn = BUI.html`
      <bim-button label="Download Fragments" @click=${downloadTheFragment}></bim-button>
    `;
  }

  let loadBtn: BUI.TemplateResult | undefined;
  if (fragments.list.size === 0) {
    const onLoadIfc = async ({ target }: { target: BUI.Button }) => {
      target.label = "Conversion in progress...";
      target.loading = true;
      await loadIfc("https://thatopen.github.io/engine_components/resources/ifc/school_str.ifc");
      target.loading = false;
      target.label = "Load IFC";
    };

    loadBtn = BUI.html`
      <bim-button label="Load IFC" @click=${onLoadIfc}></bim-button>
      <bim-label>Open the console to see the progress!</bim-label>
    `;
  }

  return BUI.html`
    <bim-panel active label="IfcLoader Tutorial" class="options-menu">
      <bim-panel-section label="Controls">
        ${loadBtn}
        ${downloadBtn}
      </bim-panel-section>
    </bim-panel>
  `;
}, {});

document.body.append(panel);
fragments.list.onItemSet.add(() => updatePanel());

const button = BUI.Component.create<BUI.PanelSection>(() => {
  return BUI.html`
      <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
        @click="${() => {
          if (panel.classList.contains("options-menu-visible")) {
            panel.classList.remove("options-menu-visible");
          } else {
            panel.classList.add("options-menu-visible");
          }
        }}">
      </bim-button>
    `;
});

document.body.append(button);


const stats = new Stats();
stats.showPanel(2);
document.body.append(stats.dom);
stats.dom.style.left = "0px";
stats.dom.style.zIndex = "unset";
world.renderer.onBeforeUpdate.add(() => stats.begin());
world.renderer.onAfterUpdate.add(() => stats.end());
})
</script>

<style scoped>
.ifc-to-frag-converter-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.viewer-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>