import { useState } from 'react';
import { Tag, Input, Button, Space, Typography } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { CheckableTag } = Tag;

export function ChipSelector({
  options = [],
  selected = [],
  onChange,
  allowCustom = false,
  placeholder = 'Add custom...',
  label,
  className = '',
}) {
  const [customValue, setCustomValue] = useState('');

  const toggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  };

  const customItems = selected.filter((s) => !options.includes(s));

  return (
    <div className={className}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          color: '#334155',
          marginBottom: 8
        }}>
          {label}
        </label>
      )}

      <Space wrap size={[8, 8]}>
        {options.map((option) => (
          <CheckableTag
            key={option}
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
            style={{
              padding: '4px 12px',
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 500,
              border: selected.includes(option) ? 'none' : '1px solid #e2e8f0',
              backgroundColor: selected.includes(option) ? '#4f46e5' : '#f1f5f9',
              color: selected.includes(option) ? '#fff' : '#475569',
            }}
          >
            {option}
          </CheckableTag>
        ))}
      </Space>

      {allowCustom && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onPressEnter={addCustom}
            placeholder={placeholder}
            style={{ flex: 1 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={addCustom} />
        </div>
      )}

      {customItems.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #e2e8f0'
        }}>
          {customItems.map((item) => (
            <Tag
              key={item}
              closable
              onClose={() => toggle(item)}
              style={{
                padding: '4px 8px',
                borderRadius: 16,
                fontSize: 13,
                backgroundColor: '#eef2ff',
                color: '#4338ca',
                border: 'none',
              }}
            >
              {item}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListInput({
  label,
  items = [],
  onChange,
  placeholder = 'Add item...',
  className = '',
}) {
  const [value, setValue] = useState('');

  const add = () => {
    const trimmed = value.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setValue('');
    }
  };

  const remove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          color: '#334155',
          marginBottom: 8
        }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={add}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={add} />
      </div>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {items.map((item, index) => (
            <Tag
              key={index}
              closable
              onClose={() => remove(index)}
              style={{
                padding: '4px 8px',
                borderRadius: 16,
                fontSize: 13,
                backgroundColor: '#eef2ff',
                color: '#4338ca',
                border: 'none',
              }}
            >
              {item}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChipSelector;
