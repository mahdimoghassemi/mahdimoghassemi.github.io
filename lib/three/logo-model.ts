import * as THREE from "three"
import { SVGLoader } from "three/addons/loaders/SVGLoader.js"

const loader = new SVGLoader()

export async function loadLogo(url: string, size = 1.5) {
  const { paths } = loader.parse(await (await fetch(url)).text())
  const logo = new THREE.Group()

  for (const path of paths) {
    const color = path.color.clone()
    const node =
      path.userData?.node instanceof Element ? path.userData.node : undefined
    const bevel = Number(node?.getAttribute("data-bevel") ?? 8)
    const geometry = new THREE.ExtrudeGeometry(path.toShapes(), {
      depth: Number(node?.getAttribute("data-depth") ?? 110),
      bevelEnabled: true,
      bevelThickness: bevel * 1.75,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments: 16,
    })
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.45,
        metalness: 0.35,
        roughness: 0.28,
      })
    )
    mesh.position.z = Number(node?.getAttribute("data-z") ?? 0)
    logo.add(mesh)
  }

  const box = new THREE.Box3().setFromObject(logo)
  const center = box.getCenter(new THREE.Vector3())
  const extent = box.getSize(new THREE.Vector3())
  for (const mesh of logo.children) mesh.position.sub(center)

  const pivot = new THREE.Group()
  pivot.add(logo)
  pivot.scale.set(1, -1, 1).multiplyScalar(size / Math.max(extent.x, extent.y))
  return pivot
}
