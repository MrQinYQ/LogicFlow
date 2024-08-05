import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import { useShallow } from "zustand/react/shallow";
import useFlowStore, { RFState } from "../../stores/flow";
import Actions from "../actions";
import NodeTypes from '../nodes';

import "reactflow/dist/style.css";
import "./index.css";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useFlowStore(useShallow(selector));

  return (
    <div className="flowContainer">
      <Actions />
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NodeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;
