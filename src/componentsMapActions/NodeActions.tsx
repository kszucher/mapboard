import {Dialog, DropdownMenu, IconButton} from "@radix-ui/themes"
import {useDispatch, useSelector} from "react-redux"
import Dots from "../../assets/dots.svg?react"
import {AppDispatch, RootState} from "../appStore/appStore.ts"
import {ControlType, DialogState, NodeMode} from "../consts/Enums.ts"
import {actions} from "../editorMutations/EditorMutations.ts"
import {mSelector} from "../editorQueries/EditorQueries.ts"
import {getAXS, getFXS, getLXS, getNodeMode, getXR, getXS, isAXRS, isAXSN} from "../mapQueries/MapQueries.ts"

export const NodeActions = () => {
  const formatterVisible = useSelector((state: RootState) => state.editor.formatterVisible)
  const m = useSelector((state:RootState) => mSelector(state))
  const nodeMode = getNodeMode(m)
  const dispatch = useDispatch<AppDispatch>()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={nodeMode === NodeMode.VIEW}>
        <IconButton variant="solid" color="gray">
          <Dots/>
        </IconButton>
      </DropdownMenu.Trigger>
      {nodeMode === NodeMode.EDIT_ROOT &&
        <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Select'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onClick={() => dispatch(actions.selectRA())}>{'All Root'}</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Insert'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onClick={() => dispatch(actions.insertR())}>{'Root Out'}</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => dispatch(actions.insertRSO())}>{'Struct Out'}</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Move'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Edit'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {getXR(m).controlType !== ControlType.NONE && <DropdownMenu.Item onClick={() => dispatch(actions.setControlTypeNone())}>{'Control Type None'}</DropdownMenu.Item>}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      }
      {nodeMode === NodeMode.EDIT_STRUCT &&
        <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Select'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {getXS(m).so1.length > 0 && getXS(m).selection === 's' && <DropdownMenu.Item onClick={() => dispatch(actions.selectFamilyX())}>{'Node Family'}</DropdownMenu.Item>}
              {getXS(m).so1.length > 0 && getXS(m).selection === 'f' && <DropdownMenu.Item onClick={() => dispatch(actions.selectSelfX())}>{'Node'}</DropdownMenu.Item>}
              {getXS(m).co1.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.selectCFF())}>{'First Cell'}</DropdownMenu.Item>}
              {<DropdownMenu.Item onClick={() => dispatch(actions.selectSA())}>{'All Struct'}</DropdownMenu.Item>}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Insert'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onClick={() => dispatch(actions.insertSU())}>{'Struct Above'}</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => dispatch(actions.insertSSO())}>{'Struct Out'}</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => dispatch(actions.insertSD())}>{'Struct Below'}</DropdownMenu.Item>
              {!getXS(m).path.includes('c') && <Dialog.Trigger><DropdownMenu.Item onClick={() => dispatch(actions.setDialogState(DialogState.CREATE_TABLE_O))}>{'Table Out'}</DropdownMenu.Item></Dialog.Trigger>}
              {getXS(m).selection === 's' && getXS(m).co1.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.insertSCRU())}>{'Table Row Above'}</DropdownMenu.Item>}
              {getXS(m).selection === 's' && getXS(m).co1.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.insertSCRD())}>{'Table Row Below'}</DropdownMenu.Item>}
              {getXS(m).selection === 's' && getXS(m).co1.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.insertSCCL())}>{'Table Column Left'}</DropdownMenu.Item>}
              {getXS(m).selection === 's' && getXS(m).co1.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.insertSCCR())}>{'Table Column Right'}</DropdownMenu.Item>}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Move'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {isAXSN(m) && getFXS(m).su.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.moveSU())}>{'Node Up'}</DropdownMenu.Item>}
              {isAXSN(m) && getLXS(m).sd.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.moveSD())}>{'Node Down'}</DropdownMenu.Item>}
              {isAXSN(m) && getFXS(m).su.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.moveSO())}>{'Node Out'}</DropdownMenu.Item>}
              {!isAXRS(m) && isAXSN(m) && <DropdownMenu.Item onClick={() => dispatch(actions.moveSI())}>{'Node In'}</DropdownMenu.Item>}
              {getXS(m).so1.length > 0 && getXS(m).co.length === 0 && <DropdownMenu.Item onClick={() => dispatch(actions.moveS2T())}>{'Sub Nodes To Table'}</DropdownMenu.Item>}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Edit'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {!formatterVisible && <DropdownMenu.Item onClick={() => dispatch(actions.openFormatter())}>{'Open Formatter'}</DropdownMenu.Item>}
              {formatterVisible && <DropdownMenu.Item onClick={() => dispatch(actions.closeFormatter())}>{'Close NodeActionsEditFormatter'}</DropdownMenu.Item>}
              {getXS(m).co1.length === 0 && getXS(m).linkType === '' && <Dialog.Trigger><DropdownMenu.Item onClick={() => dispatch(actions.setDialogState(DialogState.CREATE_MAP_IN_MAP))}>{'Create Sub Map'}</DropdownMenu.Item></Dialog.Trigger>}
              {getAXS(m).length === 1 && getXS(m).co1.length > 0 && <DropdownMenu.Item onClick={() => dispatch(actions.transpose())}>{'Transpose'}</DropdownMenu.Item>}
              {getAXS(m).length === 1 && getXS(m).co.length === 0 && [getXS(m), ...getXS(m).so].map(ti => ti.taskStatus).includes(0) && <DropdownMenu.Item onClick={() => dispatch(actions.setTaskModeOn())}>{'Task Mode On'}</DropdownMenu.Item>}
              {getAXS(m).length === 1 && [getXS(m), ...getXS(m).so].map(ti => ti.taskStatus).some(el => el > 0) && <DropdownMenu.Item onClick={() => dispatch(actions.setTaskModeOff())}>{'Task Mode Off'}</DropdownMenu.Item>}
              {getAXS(m).length === 1 && [getXS(m), ...getXS(m).so].map(ti => ti.taskStatus).some(el => el > 0) && <DropdownMenu.Item onClick={() => dispatch(actions.setTaskModeReset())}>{'Task Mode Reset'}</DropdownMenu.Item>}
              {getXS(m).contentType === 'equation' && getXS(m).co1.length === 0 && <Dialog.Trigger><DropdownMenu.Item onClick={() => dispatch(actions.setDialogState(DialogState.EDIT_CONTENT_EQUATION))}>{'Edit Equation'}</DropdownMenu.Item></Dialog.Trigger>}
              {<DropdownMenu.Item onClick={() => dispatch(actions.setBlur())}>{'set blur'}</DropdownMenu.Item>}
              {<DropdownMenu.Item onClick={() => dispatch(actions.clearBlur())}>{'clear blur'}</DropdownMenu.Item>}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      }
      {nodeMode === NodeMode.EDIT_CELL &&
        <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Select'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Insert'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onClick={() => dispatch(actions.insertCSO())}>{'Struct Out'}</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Move'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>{'Edit'}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      }
    </DropdownMenu.Root>
  )
}
