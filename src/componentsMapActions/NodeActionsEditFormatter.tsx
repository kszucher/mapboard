import {Box, Button, Flex, IconButton, Select} from "@radix-ui/themes"
import {FC} from "react"
import {useDispatch, useSelector} from "react-redux"
import colors from "tailwindcss/colors"
import LetterT from "../../assets/letter-t.svg?react"
import VectorSpline from "../../assets/vector-spline.svg?react"
import {AppDispatch, RootState} from "../appStore/appStore.ts"
import {FBorderIcon, FFillIcon, SBorderIcon, SFillIcon} from "../assetsCustom/CustomIcons.tsx"
import {FormatMode, LineType, TextType, WidthType} from "../consts/Enums.ts"
import {actions} from '../editorMutations/EditorMutations.ts'
import {mSelector} from "../editorQueries/EditorQueries.ts"
import {
  getFBorderColor,
  getFBorderWidth,
  getFFillColor,
  getLineColor,
  getLineType,
  getLineWidth,
  getSBorderColor,
  getSBorderWidth,
  getSFillColor,
  getTextColor,
  getTextFontSize,
  isAXR,
  isAXS
} from "../mapQueries/MapQueries.ts"

const getKeys = (type: object) => Object.keys(type).filter(xn => !(parseInt(xn) >= 0))

export const NodeActionsEditFormatter: FC = () => {
  const o = 32
  const r = 12
  const {gray, neutral, red, amber, lime, emerald, cyan, blue, violet, fuchsia, rose} = colors
  const colorList = [gray, neutral, red, amber, lime, emerald, cyan, blue, violet, fuchsia, rose].map(c => [50, 200, 400, 700, 800, 950].map(index => c[index.toString() as keyof typeof c]))
  const width = o * colorList[0].length
  const height = o * colorList.length
  const formatMode = useSelector((state: RootState) => state.editor.formatMode)
  const m = useSelector((state:RootState) => mSelector(state))
  const dispatch = useDispatch<AppDispatch>()
  return (
    <div className="dark:bg-zinc-800 bg-zinc-50 border-r-0 border-2 dark:border-neutral-700 fixed w-[240px] top-[80px] right-0 flex flex-col gap-3 rounded-l-lg p-3 z-50">
      <Flex gap="3" align="center" justify="center">
        <Box p={formatMode === FormatMode.sFill ? "0" : "1"}><IconButton variant={formatMode === FormatMode.sFill ? "solid" : "ghost"} onClick={() => dispatch(actions.setFormatMode(FormatMode.sFill))}><SFillIcon/></IconButton></Box>
        <Box p={formatMode === FormatMode.fFill ? "0" : "1"}><IconButton variant={formatMode === FormatMode.fFill ? "solid" : "ghost"} onClick={() => dispatch(actions.setFormatMode(FormatMode.fFill))}><FFillIcon/></IconButton></Box>
        <Box p={formatMode === FormatMode.text ? "0" : "1"}><IconButton variant={formatMode === FormatMode.text ? "solid" : "ghost"} onClick={() => dispatch(actions.setFormatMode(FormatMode.text))}><LetterT/></IconButton></Box>
      </Flex>
      <Flex gap="3" align="center" justify="center">
        <Box p={formatMode === FormatMode.sBorder ? "0" : "1"}><IconButton variant={formatMode === FormatMode.sBorder ? "solid" : "ghost"} onClick={() => dispatch(actions.setFormatMode(FormatMode.sBorder))}><SBorderIcon/></IconButton></Box>
        <Box p={formatMode === FormatMode.fBorder ? "0" : "1"}><IconButton variant={formatMode === FormatMode.fBorder ? "solid" : "ghost"} onClick={() => dispatch(actions.setFormatMode(FormatMode.fBorder))}><FBorderIcon/></IconButton></Box>
        <Box p={formatMode === FormatMode.line ? "0" : "1"}><IconButton variant={formatMode === FormatMode.line ? "solid" : "ghost"} onClick={() => dispatch(actions.setFormatMode(FormatMode.line))}><VectorSpline/></IconButton></Box>
      </Flex>
      <div className="flex justify-center">
        <div style={{ width, height }}>
          <svg viewBox={`0 0 ${width} ${height}`}>{
            colorList.map((iEl, i) => iEl.map((_, j) => (
              <circle
                aria-label={colorList[i][j]}
                cx={o/2 + j*o}
                cy={o/2 + i*o}
                r={r}
                key={'key' + i*10 + j}
                fill={colorList[i][j]}
                stroke={colorList[i][j] === (() => {
                  if (formatMode === FormatMode.text) return getTextColor(m)
                  if (formatMode === FormatMode.sBorder) return getSBorderColor(m)
                  if (formatMode === FormatMode.fBorder) return getFBorderColor(m)
                  if (formatMode === FormatMode.sFill) return getSFillColor(m)
                  if (formatMode === FormatMode.fFill) return getFFillColor(m)
                  if (formatMode === FormatMode.line) return getLineColor(m)
                })() ? '#9040b8' : 'none'}
                strokeWidth={"2%"}
                onClick={() => {
                  const color = colorList[i][j]
                  if (formatMode === FormatMode.text) dispatch(actions.setTextColor(color))
                  if (formatMode === FormatMode.sBorder) dispatch(actions.setSBorderColor(color))
                  if (formatMode === FormatMode.fBorder && isAXR(m)) dispatch(actions.setFBorderColor(color))
                  if (formatMode === FormatMode.fBorder && isAXS(m)) dispatch(actions.setFBorderColor(color))
                  if (formatMode === FormatMode.sFill) dispatch(actions.setSFillColor(color))
                  if (formatMode === FormatMode.fFill) dispatch(actions.setFFillColor(color))
                  if (formatMode === FormatMode.line) dispatch(actions.setLineColor(color))
                }}
              />
            )))
          }</svg>
        </div>
      </div>
      <div className="flex flex-col items-center">
        {formatMode === FormatMode.text && <Select.Root value={TextType[getTextFontSize(m)]} onValueChange={(value) => dispatch(actions.setTextFontSize(TextType[value as keyof typeof TextType]))}><Select.Trigger /><Select.Content>{getKeys(TextType).map((el, index) => <Select.Item key={index} value={el.toString()}>{el}</Select.Item>)}</Select.Content></Select.Root>}
        {formatMode === FormatMode.sBorder && <Select.Root value={WidthType[getSBorderWidth(m)]} onValueChange={(value) => dispatch(actions.setSBorderWidth(WidthType[value as keyof typeof WidthType]))}><Select.Trigger /><Select.Content>{getKeys(WidthType).map((el, index) => <Select.Item key={index} value={el.toString()}>{el}</Select.Item>)}</Select.Content></Select.Root>}
        {formatMode === FormatMode.fBorder && <Select.Root value={WidthType[getFBorderWidth(m)]} onValueChange={(value) => dispatch(actions.setFBorderWidth(WidthType[value as keyof typeof WidthType]))}><Select.Trigger /><Select.Content>{getKeys(WidthType).map((el, index) => <Select.Item key={index} value={el.toString()}>{el}</Select.Item>)}</Select.Content></Select.Root>}
        {formatMode === FormatMode.line && <Select.Root value={WidthType[getLineWidth(m)]} onValueChange={(value) => dispatch(actions.setLineWidth(WidthType[value as keyof typeof WidthType]))}><Select.Trigger /><Select.Content>{getKeys(WidthType).map((el, index) => <Select.Item key={index} value={el.toString()}>{el}</Select.Item>)}</Select.Content></Select.Root>}
        {formatMode === FormatMode.line && <Select.Root value={LineType[getLineType(m)]} onValueChange={(value) => dispatch(actions.setLineType(LineType[value as keyof typeof LineType]))}><Select.Trigger /><Select.Content>{getKeys(LineType).map((el, index) => <Select.Item key={index} value={el.toString()}>{el}</Select.Item>)}</Select.Content></Select.Root>}
      </div>
      <div className="flex flex-row justify-center">
        <Button variant="outline" onClick={() => {
          if (formatMode === FormatMode.text) dispatch(actions.clearText())
          if (formatMode === FormatMode.sBorder) dispatch(actions.clearSBorder())
          if (formatMode === FormatMode.fBorder) dispatch(actions.clearFBorder())
          if (formatMode === FormatMode.sFill) dispatch(actions.clearSFill())
          if (formatMode === FormatMode.fFill) dispatch(actions.clearFFill())
          if (formatMode === FormatMode.line) dispatch(actions.clearLine())
        }}>{'RESET'}</Button>
      </div>
      <div className="flex flex-row justify-center">
        <Button variant="solid" color="gray" onClick={() => dispatch(actions.closeFormatter())}>{'CLOSE'}</Button>
      </div>
    </div>
  )
}
