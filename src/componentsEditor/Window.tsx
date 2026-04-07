import {FC, useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import {api} from "../api/Api.ts"
import {AppDispatch, RootState} from "../appStore/appStore.ts"
import {shortcutColors} from "../consts/Colors.ts"
import {DialogState, MidMouseMode} from "../consts/Enums.ts"
import {actions} from "../editorMutations/EditorMutations.ts"
import {getMap, mSelector} from "../editorQueries/EditorQueries.ts"
import {getRD, getRL, getRR, getRU} from "../mapQueries/MapFindNearestR.ts"
import {
  getFXS,
  getLastIndexR,
  getLXS,
  getXC,
  getXR,
  getXS,
  hasQuasiSD,
  hasQuasiSU,
  isAXC,
  isAXC1,
  isAXCC,
  isAXCR,
  isAXCS,
  isAXR,
  isAXRS,
  isAXS,
  isAXSN,
  isAXSS,
  mR
} from "../mapQueries/MapQueries.ts"
import {M} from "../mapState/MapStateTypes.ts"
import {isUrl} from "../utils/Utils.ts"

export let timeoutId: NodeJS.Timeout
let mapListener: AbortController
let midMouseListener: AbortController

export const Window: FC = () => {
  const midMouseMode = useSelector((state: RootState) => state.editor.midMouseMode)
  const dialogState = useSelector((state: RootState) => state.editor.dialogState)
  const commitList = useSelector((state: RootState) => state.editor.commitList)
  const m = useSelector((state:RootState) => mSelector(state))
  const mExists = m && Object.keys(m).length
  const editedNodeId = useSelector((state: RootState) => state.editor.editedNodeId)
  const dispatch = useDispatch<AppDispatch>()

  const keydown = (e: KeyboardEvent) => {
    if (
      +e.ctrlKey && e.code === 'KeyD' ||
      +e.ctrlKey && e.code === 'KeyZ' ||
      +e.ctrlKey && e.code === 'KeyY' ||
      +e.ctrlKey && e.which >= 96 && e.which <= 105 ||
      e.which < 48 ||
      e.key === 'F1' ||
      e.key === 'F3'
    ) {
      e.preventDefault()
    }

    const m = getMap()
    const ckm = [
      +e.ctrlKey ? 'c' : '-',
      +e.shiftKey ? 's' : '-',
      +e.altKey ? 'a' : '-'
    ].join('')

    if (ckm === '---' && e.key === 'F2' && isAXS(m) && getXS(m).contentType === 'text' && getXS(m).co1.length === 0) dispatch(actions.startEditAppend())
    if (ckm === '---' && e.key === 'Enter' && isAXS(m)) dispatch(actions.insertSD())
    if (ckm === '-s-' && e.key === 'Enter' && isAXS(m)) dispatch(actions.insertSU())
    if (ckm === '---' && e.key === 'Insert' && isAXR(m)) dispatch(actions.insertR())
    if (ckm === '---' && e.key === 'Insert' && isAXS(m)) dispatch(actions.insertSSO())
    if (ckm === '---' && e.key === 'Insert' && isAXC1(m)) dispatch(actions.insertCSO())
    if (ckm === '---' && e.key === 'Tab' && isAXR(m)) dispatch(actions.insertR())
    if (ckm === '---' && e.key === 'Tab' && isAXS(m)) dispatch(actions.insertSSO())
    if (ckm === '---' && e.key === 'Tab' && isAXC1(m)) dispatch(actions.insertCSO())
    if (ckm === '---' && e.key === 'Delete' && isAXSN(m) && getFXS(m).su.length > 0) dispatch(actions.deleteSJumpSU())
    if (ckm === '---' && e.key === 'Delete' && isAXSN(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length > 0) dispatch(actions.deleteSJumpSD())
    if (ckm === '---' && e.key === 'Delete' && isAXSN(m) && isAXSS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length === 0) dispatch(actions.deleteSJumpSI())
    if (ckm === '---' && e.key === 'Delete' && isAXSN(m) && isAXCS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length === 0) dispatch(actions.deleteSJumpCI())
    if (ckm === '---' && e.key === 'Delete' && isAXS(m) && !isAXSN(m)) dispatch(actions.deleteSJumpR())
    if (ckm === '---' && e.key === 'Delete' && isAXR(m) && getLastIndexR(m) > 0 && mR(m).some(ri => !ri.selected)) dispatch(actions.deleteLRSC())
    if (ckm === '---' && e.key === 'Delete' && isAXCR(m) && getXC(m).cu.length > 0) dispatch(actions.deleteCRJumpU())
    if (ckm === '---' && e.key === 'Delete' && isAXCR(m) && getXC(m).cu.length === 0 && getXC(m).cd.length > 0) dispatch(actions.deleteCRJumpD())
    if (ckm === '---' && e.key === 'Delete' && isAXCR(m) && getXC(m).cu.length === 0 && getXC(m).cd.length === 0) dispatch(actions.deleteCRJumpSI())
    if (ckm === '---' && e.key === 'Delete' && isAXCC(m) && getXC(m).cl.length > 0) dispatch(actions.deleteCCJumpL())
    if (ckm === '---' && e.key === 'Delete' && isAXCC(m) && getXC(m).cl.length === 0 && getXC(m).cr.length > 0) dispatch(actions.deleteCCJumpR())
    if (ckm === '---' && e.key === 'Delete' && isAXCC(m) && getXC(m).cl.length === 0 && getXC(m).cr.length === 0) dispatch(actions.deleteCCJumpSI())
    if (ckm === '---' && e.code === 'Space' && !isAXR(m) && !isAXS(m) && !isAXC(m)) dispatch(actions.selectFirstR())
    if (ckm === '---' && e.code === 'Space' && isAXR(m)) dispatch(actions.selectRSO())
    if (ckm === '---' && e.code === 'Space' && isAXS(m) && getXS(m).co1.length > 0) dispatch(actions.selectCFF())
    if (ckm === '---' && e.code === 'Space' && isAXC1(m) && getXC(m).so1.length > 0) dispatch(actions.selectCSO())
    if (ckm === '---' && e.code === 'Space' && isAXCR(m)) dispatch(actions.selectCFC0())
    if (ckm === '---' && e.code === 'Space' && isAXCC(m)) dispatch(actions.selectCFR0())
    if (ckm === '---' && e.code === 'Backspace' && isAXR(m)) dispatch(actions.unselect())
    if (ckm === '---' && e.code === 'Backspace' && isAXS(m) && !getXS(m).path.includes('c')) dispatch(actions.selectXSIR())
    if (ckm === '---' && e.code === 'Backspace' && isAXS(m) && getXS(m).path.includes('c')) dispatch(actions.selectXSIC())
    if (ckm === '---' && e.code === 'Backspace' && isAXC(m)) dispatch(actions.selectXCIS())
    if (ckm === '---' && e.code === 'Escape' && isAXS(m) && !getXS(m).path.includes('c')) dispatch(actions.selectXSIRS())
    if (ckm === '---' && e.code === 'Escape' && isAXS(m) && getXS(m).path.includes('c')) dispatch(actions.selectXSICS())
    if (ckm === 'c--' && e.code === 'KeyC' && isAXR(m)) dispatch(actions.copyLR())
    if (ckm === 'c--' && e.code === 'KeyC' && isAXSN(m)) dispatch(actions.copyS())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXR(m) && getLastIndexR(m) > 0) dispatch(actions.cutLRJumpR())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXRS(m) && getFXS(m).su.length > 0) dispatch(actions.cutSJumpSU())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXRS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length > 0) dispatch(actions.cutSJumpSD())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXRS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length === 0) dispatch(actions.cutSJumpRI())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXSS(m) && getFXS(m).su.length > 0) dispatch(actions.cutSJumpSU())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXSS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length > 0) dispatch(actions.cutSJumpSD())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXSS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length === 0) dispatch(actions.cutSJumpSI())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXCS(m) && getFXS(m).su.length > 0) dispatch(actions.cutSJumpSU())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXCS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length > 0) dispatch(actions.cutSJumpSD())
    if (ckm === 'c--' && e.code === 'KeyX' && isAXSN(m) && isAXCS(m) && getFXS(m).su.length === 0 && getLXS(m).sd.length === 0) dispatch(actions.cutSJumpCI())
    if (ckm === 'c--' && e.code === 'KeyD' && isAXR(m)) dispatch(actions.duplicateR())
    if (ckm === 'c--' && e.code === 'KeyD' && isAXS(m)) dispatch(actions.duplicateS())
    if (ckm === 'c--' && e.code === 'KeyZ') dispatch(actions.redo())
    if (ckm === 'c--' && e.code === 'KeyY') dispatch(actions.undo())

    if (ckm === '---' && e.code === 'ArrowDown' && isAXR(m) && getRD(m, getXR(m))) dispatch(actions.selectRD())
    if (ckm === '---' && e.code === 'ArrowDown' && isAXS(m) && hasQuasiSD(m)) dispatch(actions.selectSD())
    if (ckm === '---' && e.code === 'ArrowDown' && isAXCS(m) && getLXS(m).sd.length === 0 && getXS(m).ci1!.cd.at(-1)?.so1.length) dispatch(actions.selectDCS())
    if (ckm === '---' && e.code === 'ArrowDown' && isAXC1(m) && getXC(m).cd.length > 0) dispatch(actions.selectDC())
    if (ckm === '---' && e.code === 'ArrowDown' && isAXCR(m) && getXC(m).cd.length > 0) dispatch(actions.selectDCL())
    if (ckm === 'c--' && e.code === 'ArrowDown' && isAXR(m)) dispatch(actions.offsetD())
    if (ckm === 'c--' && e.code === 'ArrowDown' && isAXSN(m) && getLXS(m).sd.length === 0) dispatch(actions.moveST())
    if (ckm === 'c--' && e.code === 'ArrowDown' && isAXSN(m) && getLXS(m).sd.length > 0) dispatch(actions.moveSD())
    if (ckm === 'c--' && e.code === 'ArrowDown' && isAXCR(m) && getXC(m).cd.length > 0) dispatch(actions.moveCRD())
    if (ckm === '-s-' && e.code === 'ArrowDown' && isAXS(m) && hasQuasiSD(m)) dispatch(actions.selectAddSD())
    if (ckm === '-s-' && e.code === 'ArrowDown' && isAXC1(m)) dispatch(actions.selectSameCC())
    if (ckm === '--a' && e.code === 'ArrowDown' && isAXCR(m)) dispatch(actions.insertCRD())

    if (ckm === '---' && e.code === 'ArrowUp' && isAXR(m) && getRU(m, getXR(m))) dispatch(actions.selectRU())
    if (ckm === '---' && e.code === 'ArrowUp' && isAXS(m) && hasQuasiSU(m)) dispatch(actions.selectSU())
    if (ckm === '---' && e.code === 'ArrowUp' && isAXCS(m) && getFXS(m).su.length === 0 && getXS(m).ci1!.cu.at(-1)?.so1.length) dispatch(actions.selectUCS())
    if (ckm === '---' && e.code === 'ArrowUp' && isAXC1(m) && getXC(m).cu.length > 0) dispatch(actions.selectUC())
    if (ckm === '---' && e.code === 'ArrowUp' && isAXCR(m) && getXC(m).cu.length > 0) dispatch(actions.selectUCL())
    if (ckm === 'c--' && e.code === 'ArrowUp' && isAXR(m)) dispatch(actions.offsetU())
    if (ckm === 'c--' && e.code === 'ArrowUp' && isAXSN(m) && getFXS(m).su.length === 0) dispatch(actions.moveSB())
    if (ckm === 'c--' && e.code === 'ArrowUp' && isAXSN(m) && getFXS(m).su.length > 0) dispatch(actions.moveSU())
    if (ckm === 'c--' && e.code === 'ArrowUp' && isAXCR(m) && getXC(m).cu.length > 0) dispatch(actions.moveCRU())
    if (ckm === '-s-' && e.code === 'ArrowUp' && isAXS(m) && hasQuasiSU(m)) dispatch(actions.selectAddSU())
    if (ckm === '-s-' && e.code === 'ArrowUp' && isAXC1(m)) dispatch(actions.selectSameCC())
    if (ckm === '--a' && e.code === 'ArrowUp' && isAXCR(m)) dispatch(actions.insertCRU())

    if (ckm === '---' && e.code === 'ArrowRight' && isAXR(m) && getRR(m, getXR(m))) dispatch(actions.selectRR())
    if (ckm === '---' && e.code === 'ArrowRight' && isAXS(m) && getXS(m).so1.length > 0 && (getXS(m).lastSelectedChild < 0 || getXS(m).lastSelectedChild > getXS(m).so1.length)) dispatch(actions.selectSSO())
    if (ckm === '---' && e.code === 'ArrowRight' && isAXS(m) && getXS(m).so1.length > 0 && getXS(m).lastSelectedChild >= 0 && getXS(m).lastSelectedChild < getXS(m).so1.length) dispatch(actions.selectSSOLast())
    if (ckm === '---' && e.code === 'ArrowRight' && isAXCS(m) && getXS(m).so1.length === 0 && getXS(m).ci1!.cr.at(-1)?.so1.length) dispatch(actions.selectRCS())
    if (ckm === '---' && e.code === 'ArrowRight' && isAXC1(m) && getXC(m).cr.length > 0) dispatch(actions.selectRC())
    if (ckm === '---' && e.code === 'ArrowRight' && isAXCC(m) && getXC(m).cr.length > 0) dispatch(actions.selectRCL())
    if (ckm === 'c--' && e.code === 'ArrowRight' && isAXR(m)) dispatch(actions.offsetR())
    if (ckm === 'c--' && e.code === 'ArrowRight' && isAXSN(m) && getFXS(m).su.length > 0) dispatch(actions.moveSO())
    if (ckm === 'c--' && e.code === 'ArrowRight' && isAXCC(m) && getXC(m).cr.length > 0) dispatch(actions.moveCCR())
    if (ckm === '-s-' && e.code === 'ArrowRight' && isAXS(m) && getXS(m).so1.length > 0 && getXS(m).selection === 's') dispatch(actions.selectFamilyX())
    if (ckm === '-s-' && e.code === 'ArrowRight' && isAXC1(m)) dispatch(actions.selectSameCR())
    if (ckm === '--a' && e.code === 'ArrowRight' && isAXCC(m)) dispatch(actions.insertCCR())

    if (ckm === '---' && e.code === 'ArrowLeft' && isAXR(m) && getRL(m, getXR(m))) dispatch(actions.selectRL())
    if (ckm === '---' && e.code === 'ArrowLeft' && isAXSS(m)) dispatch(actions.selectSI())
    if (ckm === '---' && e.code === 'ArrowLeft' && isAXCS(m) && getXS(m).ci1!.cl.at(-1)?.so1.length) dispatch(actions.selectLCS())
    if (ckm === '---' && e.code === 'ArrowLeft' && isAXC1(m) && getXC(m).cl.length > 0) dispatch(actions.selectLC())
    if (ckm === '---' && e.code === 'ArrowLeft' && isAXCC(m) && getXC(m).cl.length > 0) dispatch(actions.selectLCL())
    if (ckm === 'c--' && e.code === 'ArrowLeft' && isAXR(m)) dispatch(actions.offsetL())
    if (ckm === 'c--' && e.code === 'ArrowLeft' && isAXSN(m) && isAXSS(m)) dispatch(actions.moveSI())
    if (ckm === 'c--' && e.code === 'ArrowLeft' && isAXCC(m) && getXC(m).cl.length > 0) dispatch(actions.moveCCL())
    if (ckm === '-s-' && e.code === 'ArrowLeft' && isAXS(m) && getXS(m).so1.length > 0 && getXS(m).selection === 's') dispatch(actions.selectFamilyX())
    if (ckm === '-s-' && e.code === 'ArrowLeft' && isAXC1(m)) dispatch(actions.selectSameCR())
    if (ckm === '--a' && e.code === 'ArrowLeft' && isAXCC(m)) dispatch(actions.insertCCL())

    if (ckm === 'c--' && e.which >= 96 && e.which <= 105 && isAXS(m)) dispatch(actions.setTextColor(shortcutColors[e.which - 96]))
    if (ckm === '---' && e.which >= 48 && ![91,92,93].includes(e.which) && e.key !== 'F2' && isAXS(m) && getXS(m).contentType === 'text' && getXS(m).co1.length === 0) dispatch(actions.startEditReplace())
    if (ckm === '-s-' && e.which >= 48 && ![91,92,93].includes(e.which) && e.key !== 'F2' && isAXS(m) && getXS(m).contentType === 'text' && getXS(m).co1.length === 0) dispatch(actions.startEditReplace())
  }

  const mouseup = () => {
    dispatch(actions.clearConnectionStart())
  }

  const paste = (e: Event) => {
    e.preventDefault()
    const m = getMap()
    navigator.permissions.query({name: "clipboard-write" as PermissionName}).then(result => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.read().then(item => {
          const type = item[0].types[0]
          if (type === 'text/plain') {
            navigator.clipboard.readText().then(text => {
              let isValidJson = true
              try {
                JSON.parse(text)
              } catch {
                isValidJson = false
              }
              if (isValidJson) {
                const mapJson = JSON.parse(text)
                const isValidMap = Array.isArray(mapJson) && mapJson.length && mapJson.every(el =>
                  Object.hasOwn(el, 'path') && Array.isArray(el.path) &&
                  Object.hasOwn(el, 'nodeId') && typeof el.nodeId === 'string'
                )
                if (isValidMap) {
                  const isPastedLR = ['r', 'l'].includes(mapJson.at(-1).path.at(0))
                  const isPastedS = mapJson.at(-1).path.at(0) === 's'
                  if (isAXR(m)) {
                    if (isPastedLR) dispatch(actions.pasteLR(text))
                    if (isPastedS) dispatch(actions.pasteRSO(text))
                  } else if (isAXS(m)) {
                    const hasCell = (mapJson as M).some(el => el.path.includes('c'))
                    if (hasCell && !getXS(m).path.includes('c') || !hasCell) {
                      if (isPastedS) dispatch(actions.pasteSSO(text))
                    }
                  } else if (isAXC1(m)) {
                    if (isPastedS) dispatch(actions.pasteCSO(text))
                  } else if (!isAXCC(m) && !isAXCR(m)) {
                    if (isPastedLR) dispatch(actions.pasteLR(text))
                  }
                } else {
                  window.alert('invalid componentsMap')
                }
              } else {
                if (isUrl(text)) {
                  if (isAXS(m)) dispatch(actions.insertSSO(), {
                    contentType: 'text',
                    content: text,
                    linkType: 'external',
                    link: text
                  })
                } else {
                  if (isAXS(m)) dispatch(actions.insertSSO(), {
                    contentType: 'text',
                    content: text
                  })
                }
              }
            })
          }
        })
      }
    })
  }

  const contextmenu = (e: MouseEvent) => {
    e.preventDefault()
  }

  const wheel = (e: WheelEvent) => {
    e.preventDefault()
  }

  useEffect(() => {
    if (dialogState === DialogState.NONE && editedNodeId === '') {
      mapListener = new AbortController()
      const {signal} = mapListener
      window.addEventListener("keydown", keydown, {signal})
      window.addEventListener("paste", paste, {signal})
      window.addEventListener("mouseup", mouseup, {signal})
      window.addEventListener("contextmenu", contextmenu, {signal})
    } else if (mapListener) {
      mapListener.abort()
    }
    return () => {
      if (mapListener) {
        mapListener.abort()
      }
    }
  }, [dialogState, editedNodeId])

  useEffect(() => {
    if (midMouseMode === MidMouseMode.ZOOM) {
      midMouseListener = new AbortController()
      const {signal} = midMouseListener
      window.addEventListener("wheel", wheel, {signal, passive: false})
    } else if (midMouseListener) {
      midMouseListener.abort()
    }
    return () => {
      if (midMouseListener) {
        midMouseListener.abort()
      }
    }
  }, [midMouseMode])

  useEffect(() => {
    if (mExists && commitList.length > 1) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => dispatch(api.endpoints.saveMap.initiate()), 1000)
    }
  }, [m])

  return <></>
}
