import {lrscToClipboard, scToClipboard} from "../mapQueries/MapExtract.ts"
import {mapPrune} from "../mapQueries/MapPrune.ts"
import {
  getAXC,
  getAXS,
  getG,
  getLastIndexL,
  getLastIndexR,
  getLXS,
  getXC,
  getXS,
  mC,
  mL,
  mR,
  mS
} from "../mapQueries/MapQueries.ts"
import {rSaveOptional} from "../mapState/MapState.ts"
import {C, M, PC, PS, R, S} from "../mapState/MapStateTypes.ts"
import {genId} from "../utils/Utils"
import {unselectNodes} from "./MapSelect"
import {sortPath} from "./MapSort.ts"

const formatCb = (m: M) => "[\n" + m.map((e) => '  ' + JSON.stringify(e)).join(',\n') + "\n]"

const cbSave = (cb: M) => {
  navigator.permissions.query(<PermissionDescriptor><unknown>{name: "clipboard-write"}).then(result => {
    if (result.state === "granted" || result.state === "prompt") {
      navigator.clipboard
        .writeText(formatCb(cb))
        .then(() => {
          console.log('moved to clipboard')
        })
        .catch(err => {
          console.error('move to clipboard error: ', err)
        })
    }
  })
}

export const copyLRSC = (m: M) => {
  cbSave(mapPrune(lrscToClipboard(m).sort(sortPath)))
}

export const copySC = (m: M) => {
  cbSave(mapPrune(scToClipboard(m).sort(sortPath)))
}

const clipboardToLRSC = (m: M, cb: M) => {
  const lastIndexL = getLastIndexL(m)
  const lastIndexR = getLastIndexR(m)
  const nodeIdMappingR = new Map<string, string>(mR(cb).map(ri => [ri.nodeId, genId()]))
  const nodeIdMappingRIterator = nodeIdMappingR[Symbol.iterator]()
  mL(cb).forEach(li => Object.assign(li, {
    nodeId: genId(),
    path : ['l', li.path[1] + lastIndexL + 1],
    fromNodeId: nodeIdMappingR.get(li.fromNodeId),
    toNodeId: nodeIdMappingR.get(li.toNodeId)
  }))
  mR(cb).forEach(ri => Object.assign(ri, {
    nodeId: nodeIdMappingRIterator.next().value?.[1] ?? genId(),
    path: ['r', ri.path[1] + lastIndexR + 1],
    offsetW: (ri.offsetW ?? rSaveOptional.offsetW) + getG(m).selfW,
    offsetH: (ri.offsetH ?? rSaveOptional.offsetH) + getG(m).selfH
  }))
  mS(cb).forEach(si => Object.assign(si, {
    nodeId: genId(),
    path: ['r', si.path.at(1) + lastIndexR + 1, ...si.path.slice(2)],
  }))
  mC(cb).forEach(ci => Object.assign(ci, {
    nodeId: genId(),
    path: ['r', ci.path.at(1) + lastIndexR + 1, ...ci.path.slice(2)],
  }))
  return cb
}

const clipboardToSC = (cb: M, sl: R | S | C, su: S | undefined) => {
  mS(cb).forEach(si => Object.assign(si, {
    nodeId: genId(),
    path: [...sl.path, 's', (su ? su.path.at(-1) + 1 : 0) + si.path.at(1), ...si.path.slice(2)]
  }))
  mC(cb).forEach(ci => Object.assign(ci, {
    nodeId: genId(),
    path: [...sl.path, 's', (su ? su.path.at(-1) + 1 : 0) + ci.path.at(1), ...ci.path.slice(2)]
  }))
  return cb
}

export const pasteLRSC = (m: M, payload: string) => {
  const lrsc = JSON.parse(payload) as M
  unselectNodes(m)
  console.log('pushing',(lrsc))
  m.push(...clipboardToLRSC(m, lrsc))
}

export const pasteSC = (m: M, sl: R | S | C, su: S | undefined, payload: string) => {
  const sc = JSON.parse(payload) as M
  unselectNodes(m)
  m.push(...clipboardToSC(sc, sl, su))
}

export const duplicateLRSC = (m: M) => {
  const lrsc = lrscToClipboard(m)
  unselectNodes(m)
  m.push(...clipboardToLRSC(m, lrsc))
}

export const duplicateSC = (m: M) => {
  const sc = scToClipboard(m)
  const sl = getXS(m).ti1
  const su = getLXS(m)
  const sdx = getLXS(m).sd.at(-1)
  const offset = getAXS(m).length
  if (sdx) [sdx, ...sdx.sd].flatMap(si => [si, ...si.so, ...si.co]).map(ti => ti.path[sdx.path.length - 1] += offset)
  unselectNodes(m)
  m.push(...clipboardToSC(sc, sl, su))
}

export const moveSC = (m: M, sl: R | S | C, su: S | undefined, sd: S | undefined) => {
  const axs = getAXS(m)
  const sdx = getLXS(m).sd.at(-1)
  const offset = axs.length
  const pos = getXS(m).path.length - 1
  const sMap = new Map(axs.map(((si, i) => [si.path.at(-1), i])))
  if (sdx) [sdx, ...sdx.sd].flatMap(si => [si, ...si.so, ...si.co]).map(ti => ti.path[sdx.path.length - 1] -= offset)
  if (sd) [sd, ...sd.sd].filter(ti => !ti.selected).flatMap(si => [si, ...si.so, ...si.co]).map(ti => ti.path[sd.path.length - 1] += offset)
  axs.flatMap(si => [si, ...si.so, ...si.co]).forEach(ti => ti.path.splice(0, pos + 1, ...sl.path, 's', (su ? su.path.at(-1) + 1 : 0) + sMap.get(ti.path.at(pos))))
}

export const moveCRD = (m: M) => {
  getAXC(m).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 2] += 1)
  getAXC(m).map(ci => ci.cd.at(-1)!).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 2] -= 1)
}

export const moveCRU = (m: M) => {
  getAXC(m).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 2] -= 1)
  getAXC(m).map(ci => ci.cu.at(-1)!).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 2] += 1)
}

export const moveCCR = (m: M) => {
  getAXC(m).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 1] += 1)
  getAXC(m).map(ci => ci.cr.at(-1)!).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 1] -= 1)
}

export const moveCCL = (m: M) => {
  getAXC(m).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 1] -= 1)
  getAXC(m).map(ci => ci.cl.at(-1)!).flatMap(si => [si, ...si.so]).forEach(ti => ti.path[getXC(m).path.length - 1] += 1)
}

export const moveS2T = (m: M) => {
  const xs = getXS(m)
  const pos = getXS(m).path.length - 1
  unselectNodes(m)
  m.push(({path: [...xs.path, 's', 0] as PS, selected: 1} as S))
  m.push(...Array.from({length: xs.so1.length}).map((_, i) => ({path: [...xs.path, 's', 0, 'c', i, 0] as PC} as C)))
  xs.so1.flatMap(si => [si, ...si.so, ...si.co]).forEach(ti => ti.path.splice(pos + 1, 2, 's', 0, 'c', ti.path[pos + 2], 0, 's', 0))
}

export const transpose = (m: M) => {
  const pos = getXS(m).path.length - 1
  getXS(m).co.flatMap(ci => [ci, ...ci.so]).forEach(ti => ti.path.splice(pos + 2, 2, ti.path[pos + 3], ti.path[pos + 2]))
}
