import { Badge, Button, Select, Table } from '@radix-ui/themes';
import { useState } from 'react';
import { Color, Tool } from '../../../../shared/src/schema/schema.ts';
import { useGetToolInfoQuery } from '../../data/api.ts';

export const ToolTable = () => {
  const tools = useGetToolInfoQuery().data || [];
  const emptyTool: Partial<Tool> = { label: '', color: Color.gray, w: 0, h: 0 };
  const [newTool, setNewTool] = useState(emptyTool);

  if (!tools.length) {
    return null;
  }

  return (
    <Table.Root size={'1'}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>{'Label'}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{'Color'}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{'Width'}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{'Height'}</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>{'Action'}</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {[...tools]
          .sort((a, b) => a.label!.localeCompare(b.label!))
          .map(el => (
            <Table.Row key={el.id}>
              <Table.Cell>{el.label}</Table.Cell>
              <Table.Cell>
                <Badge color={el.color} size="1">
                  {el.color}
                </Badge>
              </Table.Cell>
              <Table.Cell>{el.w}</Table.Cell>
              <Table.Cell>{el.h}</Table.Cell>
              <Table.Cell>
                <Button size="1" variant="solid" onClick={() => {}}>
                  {'Remove'}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        <Table.Row key={'add'}>
          <Table.Cell>{newTool.label}</Table.Cell>
          <Table.Cell>
            <Select.Root
              size="1"
              value={newTool.color}
              onValueChange={(value: Color) => setNewTool({ ...newTool, color: value })}
            >
              <Select.Trigger variant="soft" color={newTool.color} />
              <Select.Content>
                {Object.values(Color).map(color => (
                  <Select.Item key={color} value={color}>
                    {color}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Table.Cell>
          <Table.Cell>{newTool.w}</Table.Cell>
          <Table.Cell>{newTool.h}</Table.Cell>
          <Table.Cell>
            <Button size="1" variant="solid" color="gray" onClick={() => {}}>
              {'Add'}
            </Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
};
