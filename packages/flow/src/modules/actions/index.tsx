import { Flex, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import "./index.css";
import useFlowStore, { RFState } from "../../stores/flow";
import { useShallow } from "zustand/react/shallow";
import { useCallback, useState } from "react";

const items: MenuProps["items"] = [
  {
    key: "1",
    // type: 'group',
    label: "Data Node",
  },
  {
    key: "2",
    label: "Process Node",
  },
];

const selector = (state: RFState) => ({
  nodes: state.nodes,
  setNodes: state.setNodes,
});

export interface MenuInfo {
  key: string;
  keyPath: string[];
  /** @deprecated This will not support in future. You should avoid to use this */
  item: React.ReactInstance;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

export default function Actions() {
  const { nodes, setNodes } = useFlowStore(useShallow(selector));
  const [nodeId, setNodeId] = useState(0);
  const menuClick = useCallback(
    (info: MenuInfo) => {
      // console.log(info, nodes);
      if (info.key === "1") {
        setNodes([
          ...nodes,
          {
            id: `${nodeId}`,
            type: "data-node",
            data: {
              label: "Data Node",
            },
            position: {
              x: 100,
              y: 100,
            },
          },
        ]);
      } else {
        setNodes([
          ...nodes,
          {
            id: `${nodeId}`,
            data: {
              label: "process-node",
            },
            position: {
              x: 100,
              y: 100,
            },
          },
        ]);
    }
    setNodeId((value) => value + 1)
    },
    [nodes, setNodes]
  );

  return (
    <div className="actions-container">
      <Flex wrap gap={"small"}>
        <Dropdown
          menu={{
            items,
            onClick: menuClick,
          }}
          trigger={["click"]}
        >
          <Button type="primary">add node</Button>
        </Dropdown>
      </Flex>
    </div>
  );
}
