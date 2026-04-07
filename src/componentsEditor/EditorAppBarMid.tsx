import {Button, DropdownMenu, IconButton} from "@radix-ui/themes"
import {FC, Fragment} from 'react'
import {useDispatch} from "react-redux"
import ChevronDown from "../../assets/chevron-down.svg?react"
import ChevronRight from "../../assets/chevron-right.svg?react"
import {api, useOpenWorkspaceQuery} from "../api/Api.ts"
import {defaultUseOpenWorkspaceQueryState} from "../apiState/ApiState.ts"
import {AppDispatch} from "../appStore/appStore.ts"
import {MapActions} from "../componentsMapActions/MapActions.tsx"

export const EditorAppBarMid: FC = () => {
  const { data } = useOpenWorkspaceQuery()
  const { breadcrumbMapIdList, breadcrumbMapNameList, tabMapIdList, tabMapNameList } = data || defaultUseOpenWorkspaceQueryState
  const dispatch = useDispatch<AppDispatch>()
  return (
    <div className="fixed left-1/2 -translate-x-1/2 h-[40px] flex flex-row items-center gap-1 align-center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="solid" color="gray">
            <ChevronDown/>
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenu.Label>{'Maps'}</DropdownMenu.Label>
          {tabMapIdList.map((el: string, index) => (
            <DropdownMenu.Item key={index} onClick={() => dispatch(api.endpoints.selectMap.initiate({mapId: el}))}>
              {tabMapNameList[index]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {breadcrumbMapIdList.length > 0 &&
        <Button variant='solid' onClick={() => dispatch(api.endpoints.selectMap.initiate({mapId: breadcrumbMapIdList[0]}))}>
          {breadcrumbMapNameList[0]}
        </Button>
      }
      {breadcrumbMapNameList.slice(1).map((el, index) => (
        <Fragment key={index}>
          <ChevronRight/>
          <Button variant='solid' onClick={() => dispatch(api.endpoints.selectMap.initiate({mapId: breadcrumbMapIdList[index + 1]}))}>
            {el}
          </Button>
        </Fragment>
      ))}
      <MapActions/>
    </div>
  )
}
