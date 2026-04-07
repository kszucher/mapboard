import {DropdownMenu, IconButton} from "@radix-ui/themes"
import {useDispatch, useSelector} from "react-redux"
import Settings2 from "../../assets/settings-2.svg?react"
import {api, useOpenWorkspaceQuery} from "../api/Api.ts"
import {defaultUseOpenWorkspaceQueryState} from "../apiState/ApiState.ts"
import {AppDispatch, RootState} from "../appStore/appStore.ts"
import {actions} from "../editorMutations/EditorMutations.ts"

export const UserSettings = () => {
  const connectionHelpersVisible = useSelector((state: RootState) => state.editor.connectionHelpersVisible)
  const { data } = useOpenWorkspaceQuery()
  const { colorMode } = data || defaultUseOpenWorkspaceQueryState
  const dispatch = useDispatch<AppDispatch>()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="solid" color="gray">
          <Settings2/>
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
        {colorMode === 'dark' && <DropdownMenu.Item onClick={() => dispatch(api.endpoints.toggleColorMode.initiate())}>{'Light Mode'}</DropdownMenu.Item>}
        {colorMode === 'light' && <DropdownMenu.Item onClick={() => dispatch(api.endpoints.toggleColorMode.initiate())}>{'Dark Mode'}</DropdownMenu.Item>}
        {!connectionHelpersVisible && <DropdownMenu.Item onClick={() => dispatch(actions.showConnectionHelpers())}>{'Show Helpers'}</DropdownMenu.Item>}
        {connectionHelpersVisible && <DropdownMenu.Item onClick={() => dispatch(actions.hideConnectionHelpers())}>{'Hide Helpers'}</DropdownMenu.Item>}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
