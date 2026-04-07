import {IconButton} from "@radix-ui/themes"
import {FC} from 'react'
import {useDispatch, useSelector} from "react-redux"
import ArrowBackUp from "../../assets/arrow-back-up.svg?react"
import ArrowForwardUp from "../../assets/arrow-forward-up.svg?react"
import {AppDispatch, RootState} from "../appStore/appStore.ts"
import {NodeActions} from "../componentsMapActions/NodeActions.tsx"
import {NodeActionsSelectModeConfig} from "../componentsMapActions/NodeActionsSelectModeConfig.tsx"
import {UserSettings} from "../componentsUserActions/UserSettings.tsx"
import {actions} from "../editorMutations/EditorMutations.ts"
import {MouseConfig} from "./MouseConfig.tsx"

export const EditorAppBarRight: FC = () => {
  const commitList = useSelector((state: RootState) => state.editor.commitList)
  const commitIndex = useSelector((state: RootState) => state.editor.commitIndex)
  const dispatch = useDispatch<AppDispatch>()
  return (
    <div className="fixed flex right-1 gap-6 h-[40px]">
      <div className="flex items-center gap-1">
        <NodeActionsSelectModeConfig/>
        <NodeActions/>
      </div>
      <div className="flex items-center gap-1">
        <MouseConfig/>
      </div>
      <div className="flex flex-row items-center gap-1">
        <IconButton variant="solid" color="gray" disabled={commitIndex === 0} onClick={() => dispatch(actions.undo())}>
          <ArrowBackUp/>
        </IconButton>
        <IconButton variant="solid" color="gray" disabled={commitIndex === commitList.length - 1} onClick={() => dispatch(actions.redo())}>
          <ArrowForwardUp/>
        </IconButton>
      </div>
      <div className="flex flex-row items-center gap-1">
        <UserSettings/>
      </div>
    </div>
  )
}
