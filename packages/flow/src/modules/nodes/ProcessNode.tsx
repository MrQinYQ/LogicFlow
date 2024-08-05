import { Handle, Position } from "reactflow";
import { Card, Form, Input } from "antd";
import { useCallback, useState } from "react";

function ProcessNode({ data }: { data: any }) {
  const [form] = Form.useForm();
  const [width, setWidth] = useState(300);
  const onFinish = useCallback((values: any) => {}, []);
  const onFieldsChange = useCallback(
    (changedFields: any[], allFields: any[]) => {
      // console.log('changedFields', changedFields);
      // console.log('allFields', allFields);
      if (
        changedFields[0] &&
        changedFields[0].name[0] &&
        changedFields[0].name[0] === "initialValue"
      ) {
        if (changedFields[0].value.type === "Implements") {
          setWidth(600);
        } else {
          setWidth(300);
        }
      }
    },
    []
  );
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
          style={{ width }}
        >
          <Form.Item label="name" name="name">
            <Input placeholder="node name" />
          </Form.Item>
          <Form.Item label="inputGenerics" name="inputGenerics">
            <Input placeholder="T/K/L..." />
          </Form.Item>
          <Form.Item label="outputGenerics" name="outputGenerics">
            <Input placeholder="T/K/L..." />
          </Form.Item>
          
        </Form>
      </Card>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default ProcessNode;
