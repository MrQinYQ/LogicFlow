import { Handle, Position } from "reactflow";
import { Form, Input, Card } from "antd";
import { useCallback, useState } from "react";
import "./DataNode.css";
import Variable, { VariableData } from "../components/Variable";

const initialValueInitialValue: VariableData = {
  type: 'Identifier',
  Identifier: '',
  Implements: 'const initialValue = ',
};

function DataNode({ data }: { data: any }) {
  const [form] = Form.useForm();
  const [width, setWidth] = useState(300);
  const onFinish = useCallback((values: any) => {
    // console.log('values', values);
    // if (values.initialValue && values.initialValue.type === 'Implements') {
    //   setWidth(600);
    // }
  }, []);
  const onFieldsChange = useCallback((changedFields: any[], allFields: any[]) => {
    // console.log('changedFields', changedFields);
    // console.log('allFields', allFields);
    if (changedFields[0] && changedFields[0].name[0] && changedFields[0].name[0] === 'initialValue') {
      if (changedFields[0].value.type === 'Implements') {
        setWidth(600);
      } else  {
        setWidth(300);
      }
    }
  }, []);
  return (
    <>
      <Card size="small" title={`Data Node`}>
        <Form
          form={form}
          size="small"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          onFieldsChange={onFieldsChange}
          initialValues={data.formData}
          className="data-node-container"
          style={{ width }}
        >
          <Form.Item label="name" name="name">
            <Input placeholder="node name" />
          </Form.Item>
          <Form.Item label="generics" name="generics">
            <Input placeholder="T/K/L..." />
          </Form.Item>
          <Form.Item label="initialValue" name="initialValue" initialValue={initialValueInitialValue}>
            <Variable />
          </Form.Item>
        </Form>
      </Card>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default DataNode;
