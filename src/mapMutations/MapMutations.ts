import {current, PayloadAction} from "@reduxjs/toolkit"
import isEqual from "react-fast-compare"
import {ControlType, Flow, LineType} from "../consts/Enums"
import {EditorState} from "../editorState/EditorStateTypes.ts"
import {getRD, getRL, getRR, getRU} from "../mapQueries/MapFindNearestR.ts"
import {mapPrune} from "../mapQueries/MapPrune.ts"
import {
  getAXC,
  getAXS,
  getFXS,
  getG,
  getLXS,
  getQuasiSD,
  getQuasiSU,
  getXC,
  getXR,
  getXS,
  idToC,
  idToR,
  idToS,
  mC,
  mR,
  mS,
  pathToC,
  pathToR,
  pathToS
} from "../mapQueries/MapQueries.ts"
import {sSaveOptional} from "../mapState/MapState.ts"
import {L, M, PC, PR, PS, R, S} from "../mapState/MapStateTypes.ts"
import {mapBuild} from "./MapBuild.ts"
import {deleteCC, deleteCR, deleteL, deleteLRSC, deleteS,} from "./MapDelete"
import {
  insertCCL,
  insertCCR,
  insertCRD,
  insertCRU,
  insertCSO,
  insertL,
  insertR,
  insertRSO,
  insertSCCL,
  insertSCCR,
  insertSCRD,
  insertSCRU,
  insertSD,
  insertSSO,
  insertSU,
  insertTable
} from "./MapInsert"
import {
  copyLRSC,
  copySC,
  duplicateLRSC,
  duplicateSC,
  moveCCL,
  moveCCR,
  moveCRD,
  moveCRU,
  moveS2T,
  moveSC,
  pasteLRSC,
  pasteSC,
  transpose
} from "./MapMove"
import {
  selectAddR,
  selectAddS,
  selectC,
  selectCL,
  selectR,
  selectRL,
  selectS,
  selectSL,
  unselectC,
  unselectNodes,
  unselectR,
  unselectS
} from "./MapSelect"

export const mapMutations = {
  setDensitySmall: (m: M) => getG(m).density = 'small',
  setDensityLarge: (m: M) => getG(m).density = 'large',
  setPlaceTypeExploded: (m: M) => getG(m).flow = Flow.EXPLODED,
  setPlaceTypeIndented: (m: M) => getG(m).flow = Flow.INDENTED,
  
  selectR: (m: M, path: PR) => selectR(m, pathToR(m, path)),
  selectS: (m: M, path: PS) => selectS(m, pathToS(m, path), 's'),
  selectC: (m: M, path: PC) => selectC(m, pathToC(m, path)),
  selectRR: (m: M) => selectR(m, getRR(m, getXR(m))!),
  selectRL: (m: M) => selectR(m, getRL(m, getXR(m))!),
  selectRD: (m: M) => selectR(m, getRD(m, getXR(m))!),
  selectRU: (m: M) => selectR(m, getRU(m, getXR(m))!),
  selectFirstR: (m: M) => selectR(m, mR(m).at(0)!),
  selectFirstS: (m: M) => selectS(m, mS(m).at(0)!, 's'),
  selectFirstC: (m: M) => selectC(m, mC(m).at(0)!),
  selectSelfX: (m: M) => selectS(m, getXS(m), 's'),
  selectFamilyX: (m: M) => selectS(m, getXS(m), 'f'),
  selectSD: (m: M) => selectS(m, getQuasiSD(m) as S, 's'),
  selectSU: (m: M) => selectS(m, getQuasiSU(m) as S, 's'),
  selectRSO: (m: M) => selectS(m, getXR(m).so1.at(0)!, 's'),
  selectSSO: (m: M) => selectS(m, getXS(m).so1.at(0)!, 's'),
  selectSSOLast: (m: M) => selectS(m, pathToS(m, [...getXS(m).path, 's', getXS(m).lastSelectedChild] as PS), 's'),
  selectCSO: (m: M) => selectS(m, getXC(m).so1.at(0)!, 's'),
  selectSI: (m: M) => { getXS(m).si1!.lastSelectedChild = getXS(m).path.at(-1); selectS(m, getXS(m).si1!, 's') },
  selectCFR0: (m: M) => selectC(m, pathToC(m, getXC(m).path.with(-2, 0) as PC)),
  selectCFC0: (m: M) => selectC(m, pathToC(m, getXC(m).path.with(-1, 0) as PC)),
  selectCFF: (m: M) => selectC(m, pathToC(m, [...getXS(m).path, 'c', 0, 0])),
  selectXSIR: (m: M) => selectR(m, getXS(m).ri),
  selectXSIRS: (m: M) => selectS(m, getXS(m).ri.so1.at(0)!, 's'),
  selectXSIC: (m: M) => selectC(m, getXS(m).ci!),
  selectXSICS: (m: M) => selectS(m, getXS(m).ci!.so1.at(0)!, 's'),
  selectXCIS: (m: M) => selectS(m, pathToS(m, getXC(m).path.slice(0, -3) as PS), 's'),
  selectAddR: (m: M, path: PR) => selectAddR(m, pathToR(m, path)),
  selectAddS: (m: M, path: PS) => selectAddS(m, pathToS(m, path), 's'),
  selectAddSD: (m: M) => selectAddS(m, getQuasiSD(m), 's'),
  selectAddSU: (m: M) => selectAddS(m, getQuasiSU(m), 's'),
  selectRA: (m: M) => selectRL(m, mR(m)),
  selectSA: (m: M) => selectSL(m, mS(m)),
  selectFirstCR: (m: M) => selectCL(m, mC(m).at(0)!.ch),
  selectFirstCC: (m: M) => selectCL(m, mC(m).at(0)!.cv),
  selectSameCR: (m: M) => selectCL(m, getXC(m).ch),
  selectSameCC: (m: M) => selectCL(m, getXC(m).cv),
  selectDC: (m: M) => selectC(m, getXC(m).cd.at(-1)!),
  selectUC: (m: M) => selectC(m, getXC(m).cu.at(-1)!),
  selectRC: (m: M) => selectC(m, getXC(m).cr.at(-1)!),
  selectLC: (m: M) => selectC(m, getXC(m).cl.at(-1)!),
  selectDCL: (m: M) => selectCL(m, getAXC(m).map(ci => ci.cd.at(-1)!)),
  selectUCL: (m: M) => selectCL(m, getAXC(m).map(ci => ci.cu.at(-1)!)),
  selectRCL: (m: M) => selectCL(m, getAXC(m).map(ci => ci.cr.at(-1)!)),
  selectLCL: (m: M) => selectCL(m, getAXC(m).map(ci => ci.cl.at(-1)!)),
  selectDCS: (m: M) => selectS(m, getXS(m).ci1!.cd.at(-1)!.so1.at(0)!, 's'),
  selectUCS: (m: M) => selectS(m, getXS(m).ci1!.cu.at(-1)!.so1.at(0)!, 's'),
  selectRCS: (m: M) => selectS(m, getXS(m).ci1!.cr.at(-1)!.so1.at(0)!, 's'),
  selectLCS: (m: M) => selectS(m, getXS(m).ci1!.cl.at(-1)!.so1.at(0)!, 's'),
  selectSByRectangle: (m: M, intersectingNodes: string[]) => selectSL(m, intersectingNodes.map((nid: string) => idToS(m, nid))),
  unselect: (m: M) => unselectNodes(m),
  unselectR: (m: M, path: PR) => unselectR(pathToR(m, path)),
  unselectS: (m: M, path: PS) => unselectS(pathToS(m, path)),
  unselectC: (m: M, path: PC) => unselectC(pathToC(m, path)),

  insertL: (m: M, l: L) => insertL(m, l),
  insertR: (m: M) => insertR(m),
  insertSD: (m: M) => insertSD(m, {taskStatus: getLXS(m).taskStatus}),
  insertSU: (m: M) => insertSU(m, {taskStatus: getFXS(m).taskStatus}),
  insertRSO: (m: M) => insertRSO(m),
  insertSSO: (m: M) => insertSSO(m, {taskStatus: getXS(m).taskStatus}),
  insertCSO: (m: M) => insertCSO(m),
  insertCRD: (m: M) => insertCRD(m),
  insertCRU: (m: M) => insertCRU(m),
  insertCCR: (m: M) => insertCCR(m),
  insertCCL: (m: M) => insertCCL(m),
  insertSCRD: (m: M) => insertSCRD(m),
  insertSCRU: (m: M) => insertSCRU(m),
  insertSCCR: (m: M) => insertSCCR(m),
  insertSCCL: (m: M) => insertSCCL(m),
  insertSSOTable: (m: M, {r, c}: {r: number, c: number}) => { insertSSO(m); insertTable(m, {r, c}) },

  deleteL: (m: M, nodeId: string) => deleteL(m, nodeId),
  deleteLRSC: (m: M) => { const reselect = mR(m).find(ri => !ri.selected)!.nodeId; deleteLRSC(m); selectR(m, idToR(m, reselect )) },
  deleteSJumpSU: (m: M) => { const reselect = getFXS(m).su.at(-1)!.nodeId; deleteS(m); selectS(m, idToS(m, reselect), 's') },
  deleteSJumpSD: (m: M) => { const reselect = getLXS(m).sd.at(-1)!.nodeId; deleteS(m); selectS(m, idToS(m, reselect), 's') },
  deleteSJumpSI: (m: M) => { const reselect = getXS(m).si1!.nodeId; deleteS(m); selectS(m, idToS(m, reselect), 's') },
  deleteSJumpCI: (m: M) => { const reselect = getXS(m).ci1!.nodeId; deleteS(m); selectC(m, idToC(m, reselect)) },
  deleteSJumpR: (m: M) => { const reselect = getXS(m).ri.nodeId; deleteS(m); selectR(m, idToR(m, reselect)) },
  deleteCRJumpU: (m: M) => { const reselectList = getAXC(m).map(ci => ci.cu.at(-1)!.nodeId); deleteCR(m); selectCL(m, reselectList.map(nid => idToC(m, nid))) },
  deleteCRJumpD: (m: M) => { const reselectList = getAXC(m).map(ci => ci.cd.at(-1)!.nodeId); deleteCR(m); selectCL(m, reselectList.map(nid => idToC(m, nid))) },
  deleteCRJumpSI: (m: M) => { const reselect = getXC(m).si1!.nodeId; deleteCR(m); selectS(m, idToS(m, reselect), 's') },
  deleteCCJumpL: (m: M) => { const reselectList = getAXC(m).map(ci => ci.cl.at(-1)!.nodeId); deleteCC(m); selectCL(m, reselectList.map(nid => idToC(m, nid))) },
  deleteCCJumpR: (m: M) => { const reselectList = getAXC(m).map(ci => ci.cr.at(-1)!.nodeId); deleteCC(m); selectCL(m, reselectList.map(nid => idToC(m, nid))) },
  deleteCCJumpSI: (m: M) => { const reselect = getXC(m).si1!.nodeId; deleteCC(m); selectS(m, idToS(m, reselect), 's') },

  cutLRJumpR: (m: M) => { const reselect = mR(m).find(ri => !ri.selected)!.nodeId; copyLRSC(m); deleteLRSC(m); selectR(m, idToR(m, reselect) as R) },
  cutSJumpRI: (m: M) => { const reselect = getXS(m).ri1!; copySC(m); deleteS(m); selectR(m, reselect) },
  cutSJumpSU: (m: M) => { const reselect = getFXS(m).su.at(-1)!; copySC(m); deleteS(m); selectS(m, reselect, 's') },
  cutSJumpSD: (m: M) => { const reselect = getLXS(m).sd.at(-1)!; copySC(m); deleteS(m); selectS(m, reselect, 's') },
  cutSJumpSI: (m: M) => { const reselect = getXS(m).si1!; copySC(m); deleteS(m); selectS(m, reselect, 's') },
  cutSJumpCI: (m: M) => { const reselect = getXS(m).ci1!; copySC(m); deleteS(m); selectC(m, reselect) },
  copyLR: (m: M) => copyLRSC(m),
  copyS: (m: M) => copySC(m),
  pasteLR: (m: M, mapAsString: string) => pasteLRSC(m, mapAsString),
  pasteRSO: (m: M, mapAsString: string) => pasteSC(m, getXR(m),  getXR(m).so1.at(-1), mapAsString),
  pasteSSO: (m: M, mapAsString: string) => pasteSC(m, getXS(m),  getXS(m).so1.at(-1), mapAsString),
  pasteCSO: (m: M, mapAsString: string) => pasteSC(m, getXC(m),  getXC(m).so1.at(-1), mapAsString),
  duplicateR: (m: M) => duplicateLRSC(m),
  duplicateS: (m: M) => duplicateSC(m),
  moveSD: (m: M) => moveSC(m, getXS(m).ti1, getLXS(m).sd.at(-1), getLXS(m).sd.at(-2)),
  moveST: (m: M) => moveSC(m, getXS(m).ti1, undefined, getXS(m).ti1.so1.at(0)),
  moveSU: (m: M) => moveSC(m, getXS(m).ti1, getFXS(m).su.at(-2), getFXS(m).su.at(-1)),
  moveSB: (m: M) => moveSC(m, getXS(m).ti1, getXS(m).ti1.so1.at(-1), undefined),
  moveSO: (m: M) => moveSC(m, getFXS(m).su.at(-1)!, getFXS(m).su.at(-1)!.so1.at(-1), undefined),
  moveSI: (m: M) => moveSC(m, getXS(m).si1!.ti1, getXS(m).si1!, getXS(m).si1!.sd.at(-1)),
  moveSByDrag: (m: M, {sl, su, sd}: {sl: string, su: string, sd: string}) => { if (sl) moveSC(m, idToS(m, sl),  idToS(m, su), idToS(m, sd)) },
  moveCRD: (m: M) => moveCRD(m),
  moveCRU: (m: M) => moveCRU(m),
  moveCCR: (m: M) => moveCCR(m),
  moveCCL: (m: M) => moveCCL(m),
  moveS2T: (m: M) => moveS2T(m),
  transpose: (m: M) => transpose(m),

  offsetD: (m: M) => Object.assign(getXR(m), { offsetH: getXR(m).offsetH += 20 }),
  offsetU: (m: M) => Object.assign(getXR(m), { offsetH: getXR(m).offsetH -= 20 }),
  offsetR: (m: M) => Object.assign(getXR(m), { offsetW: getXR(m).offsetW += 20 }),
  offsetL: (m: M) => Object.assign(getXR(m), { offsetW: getXR(m).offsetW -= 20 }),
  offsetRByDrag: (m: M, rOffsetCoords: number[]) => Object.assign(getXR(m), { offsetW: rOffsetCoords[0], offsetH: rOffsetCoords[1] }),
  setControlTypeNone: (m: M) => Object.assign(getXR(m), { controlType: ControlType.NONE }),
  setContentText: (m: M, content: string) => Object.assign(getXS(m), { contentType: 'text', content }),
  setContentEquation: (m: M, content: string) => Object.assign(getXS(m), { contentType: 'equation', content }),
  setLineWidth: (m: M, lineWidth: number) => getAXS(m).forEach(si => Object.assign(si, { lineWidth })),
  setLineType: (m: M, lineType: LineType) => getAXS(m).forEach(si => Object.assign(si, { lineType })),
  setLineColor: (m: M, lineColor: string) => getAXS(m).forEach(si => Object.assign(si, { lineColor })),
  setSBorderWidth: (m: M, sBorderWidth: number) => getAXS(m).forEach(si => Object.assign(si, { sBorderWidth })),
  setFBorderWidth: (m: M, fBorderWidth: number) => getAXS(m).forEach(si => Object.assign(si, { fBorderWidth })),
  setSBorderColor: (m: M, sBorderColor: string) => getAXS(m).forEach(si => Object.assign(si, { sBorderColor })),
  setFBorderColor: (m: M, fBorderColor: string) => getAXS(m).forEach(si => Object.assign(si, { fBorderColor })),
  setSFillColor: (m: M, sFillColor: string) => getAXS(m).forEach(si => Object.assign(si, { sFillColor })),
  setFFillColor: (m: M, fFillColor: string) => getAXS(m).forEach(si => Object.assign(si, { fFillColor })),
  setTextFontSize: (m: M, textFontSize: number) => getAXS(m).forEach(si => Object.assign(si, { textFontSize })),
  setTextColor: (m: M, textColor: string) => getAXS(m).forEach(si => Object.assign(si, { textColor })),
  setBlur: (m: M) => getAXS(m).forEach(si => Object.assign(si, { blur: 1 })),
  setTaskModeOn: (m: M) => [getXS(m), ...getXS(m).so].forEach(si => Object.assign(si, { taskStatus: si.taskStatus === 0 ? 1 : si.taskStatus })),
  setTaskModeOff: (m: M) => [getXS(m), ...getXS(m).so].forEach(si => Object.assign(si, { taskStatus: 0 })),
  setTaskModeReset: (m: M) => [getXS(m), ...getXS(m).so].forEach(si => Object.assign(si, { taskStatus: si.taskStatus > 0 ? 1 : si.taskStatus })),
  setTaskStatus: (m: M, {nodeId, taskStatus}: {nodeId: string, taskStatus: number}) => Object.assign(idToS(m, nodeId), { taskStatus: taskStatus }),
  clearLine: (m: M) => getAXS(m).forEach(si => Object.assign(si, { lineWidth: sSaveOptional.lineWidth, lineType: sSaveOptional.lineType, lineColor: sSaveOptional.lineColor })),
  clearSBorder: (m: M) => getAXS(m).forEach(si => Object.assign(si, { sBorderWidth: sSaveOptional.sBorderWidth, sBorderColor: sSaveOptional.sBorderColor })),
  clearFBorder: (m: M) => getAXS(m).forEach(si => Object.assign(si, { fBorderWidth: sSaveOptional.fBorderWidth, fBorderColor: sSaveOptional.fBorderColor })),
  clearSFill: (m: M) => getAXS(m).forEach(si => Object.assign(si, { sFillColor: sSaveOptional.sFillColor })),
  clearFFill: (m: M) => getAXS(m).forEach(si => Object.assign(si, { fFillColor: sSaveOptional.fFillColor })),
  clearText: (m: M) => getAXS(m).forEach(si => Object.assign(si, { textColor: sSaveOptional.textColor, textFontSize: sSaveOptional.textFontSize })),
  clearBlur: (m: M) => getAXS(m).forEach(si => Object.assign(si, { blur: sSaveOptional.blur })),
}

export function wrapFunction<P>(fn: (m: M, payload: P) => void) {
  return function (state: EditorState, action: PayloadAction<P>) {
    console.log(action.type)
    const pm = current(state.commitList[state.commitIndex])
    const m = structuredClone(pm)
    fn(m, action.payload)
    mapBuild(pm, m)
    if (!isEqual(mapPrune(pm), mapPrune(m))) {
      state.commitList = [...state.commitList.slice(0, state.commitIndex + 1), m]
      state.commitIndex = state.commitIndex + 1
    }
    return
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const wrappedFunctions: {
  [K in keyof typeof mapMutations]: (state: EditorState, action: PayloadAction<Parameters<typeof mapMutations[K]>[1]>) => void
} = {} as unknown

for (const fnName of Object.keys(mapMutations) as Array<keyof typeof mapMutations>) {
  const originalFunction = mapMutations[fnName]
  if (originalFunction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    wrappedFunctions[fnName] = wrapFunction(originalFunction)
  }
}
