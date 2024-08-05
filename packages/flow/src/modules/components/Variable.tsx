import { FC } from "react";
import { Flex, Radio, Input } from 'antd';
import Editor from '@monaco-editor/react';

export interface VariableData {
    type: 'Identifier' | 'Implements';
    Identifier: string;
    Implements: string;
}

interface VariableProps {
    value?: VariableData;
    onChange?: (value: VariableData) => void;
}

const options = {
    lineNumbers: false, // 关闭行号显示
    // rulers: [], // 隐藏标尺（边距区域）
    scrollBeyondLastLine: false, // 不在最后一行之后滚动
    // scrollBeyondLastColumn: false, // 不在最后一列之后滚动
    // 其他选项...
};

const Variable: FC<VariableProps> = (props) => {
    const { value, onChange } = props;
    return <>
    <Flex vertical gap="middle">
        <Radio.Group value={value?.type} onChange={e => value ? onChange?.({ ...value, type: e.target.value }) : onChange?.({ Identifier: '', Implements: '', type: e.target.value })}>
            <Radio.Button value="Identifier">Identifier</Radio.Button>
            <Radio.Button value="Implements">Implements</Radio.Button>
        </Radio.Group>
        {value?.type === 'Identifier' && <Input value={value.Identifier} onChange={e => onChange?.({ ...value, Identifier: e.target.value })} />}
        {value?.type === 'Implements' && <Editor height={100} width={400} defaultLanguage="typescript" theme="vs-dark" defaultValue={ value.Implements } options={options} onChange={(e) => onChange?.({ ...value, Implements: e ?? '' })} />}
    </Flex>
    </>
};

export default Variable;
