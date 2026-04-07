import {Dialog, Spinner, Theme} from "@radix-ui/themes"
import {FC, useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux"
import {useOpenWorkspaceQuery} from "../api/Api.ts"
import {defaultUseOpenWorkspaceQueryState} from "../apiState/ApiState.ts"
import {AppDispatch, RootState} from "../appStore/appStore.ts"
import {Map} from "../componentsMap/Map.tsx"
import {getEquationDim, getTextDim} from "../componentsMap/MapDivUtils.ts"
import {MapActionsRename} from "../componentsMapActions/MapActionsRename.tsx"
import {NodeActionsEditContentEquation} from "../componentsMapActions/NodeActionsEditContentEquation.tsx"
import {NodeActionsEditCreateSubMap} from "../componentsMapActions/NodeActionsEditCreateSubMap.tsx"
import {NodeActionsEditFormatter} from "../componentsMapActions/NodeActionsEditFormatter.tsx"
import {NodeActionsInsertTable} from "../componentsMapActions/NodeActionsInsertTable.tsx"
import {DialogState} from "../consts/Enums.ts"
import {actions} from "../editorMutations/EditorMutations.ts"
import {mSelector} from "../editorQueries/EditorQueries.ts"
import {EditorAppBarLeft} from "./EditorAppBarLeft.tsx"
import {EditorAppBarMid} from "./EditorAppBarMid.tsx"
import {EditorAppBarRight} from "./EditorAppBarRight.tsx"
import {Window} from "./Window.tsx"

export const Editor: FC = () => {
  const isLoading = useSelector((state: RootState) => state.editor.isLoading)
  const formatterVisible = useSelector((state: RootState) => state.editor.formatterVisible)
  const m = useSelector((state:RootState) => mSelector(state))
  const mExists = m && Object.keys(m).length
  const { data } = useOpenWorkspaceQuery()
  const { colorMode } = data || defaultUseOpenWorkspaceQueryState
  const dialogState = useSelector((state: RootState) => state.editor.dialogState)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(()=> {
    getTextDim('Test', 12)
    getEquationDim('\\[Test\\]')
  }, [])

  return (
    <Theme appearance={colorMode === 'dark' ? 'dark' : 'light'} accentColor="violet" panelBackground="solid" scaling="100%" radius="full">
      {mExists &&
        <Dialog.Root onOpenChange={(isOpen) => !isOpen && dispatch(actions.setDialogState(DialogState.NONE))}>
          <Map/>
          <div className="dark:bg-zinc-800 bg-zinc-50 dark:border-neutral-700 fixed top-0 left-0 w-screen h-[40px] z-50">
            <EditorAppBarLeft/>
            <EditorAppBarMid/>
            <EditorAppBarRight/>
          </div>
          {formatterVisible && <NodeActionsEditFormatter/>}
          <Window/>
          {dialogState === DialogState.RENAME_MAP && <MapActionsRename/>}
          {dialogState === DialogState.CREATE_MAP_IN_MAP && <NodeActionsEditCreateSubMap/>}
          {dialogState === DialogState.EDIT_CONTENT_EQUATION && <NodeActionsEditContentEquation/>}
          {dialogState === DialogState.CREATE_TABLE_O && <NodeActionsInsertTable/>}
        </Dialog.Root>
      }
      <div
        style={isLoading ? {
          opacity: 0.5,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: 'auto'
        } : {
          opacity: 0,
          transition: 'opacity 0.3s ease-in',
          pointerEvents: 'none'
        }}
        className="fixed top-0 left-0 w-screen h-screen bg-zinc-900 flex items-center justify-center z-50"
      >
        <Spinner size="3"/>
      </div>
    </Theme>
  )
}
