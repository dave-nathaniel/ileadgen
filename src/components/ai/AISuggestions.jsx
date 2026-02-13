import React, { useState, useCallback } from 'react';
import { Button, Card, Tag, Spin, Empty, Tooltip, Typography, Space, message } from 'antd';
import {
  BulbOutlined,
  ReloadOutlined,
  PlusOutlined,
  CheckOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { aiApi } from '../../api';
import { useBilling } from '../../context/BillingContext';

const { Text, Paragraph } = Typography;

/**
 * AI Keyword Suggestions Component
 * Suggests pain point keywords for campaign targeting
 */
export function AIKeywordSuggestions({
  campaignId,
  existingKeywords = [],
  onAddKeywords,
  industry = '',
  productType = '',
  businessTypes = [],
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const { fetchBalance } = useBilling();

  const fetchSuggestions = useCallback(async () => {
    if (!campaignId) {
      message.warning('Save your campaign first to get AI suggestions');
      return;
    }

    setLoading(true);
    try {
      const result = await aiApi.suggestKeywords(campaignId, {
        industry,
        product_type: productType,
        business_types: businessTypes,
        existing_keywords: existingKeywords,
      });
      setSuggestions(result);
      setSelectedKeywords(new Set());
      fetchBalance();
    } catch (error) {
      console.error('Error fetching keyword suggestions:', error);
      if (error.response?.status === 503) {
        message.error('AI service is not available. Check your API configuration.');
      } else {
        message.error('Failed to get keyword suggestions');
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId, industry, productType, businessTypes, existingKeywords, fetchBalance]);

  const toggleKeyword = (keyword) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedKeywords.size > 0 && onAddKeywords) {
      onAddKeywords(Array.from(selectedKeywords));
      setSelectedKeywords(new Set());
      message.success(`Added ${selectedKeywords.size} keywords`);
    }
  };

  const getRelevanceColor = (relevance) => {
    switch (relevance) {
      case 'high':
        return 'green';
      case 'medium':
        return 'blue';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#8b5cf6' }} />
          <span>AI Keyword Suggestions</span>
        </Space>
      }
      extra={
        <Space>
          {selectedKeywords.size > 0 && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddSelected}
            >
              Add {selectedKeywords.size} Selected
            </Button>
          )}
          <Button
            size="small"
            icon={loading ? <Spin size="small" /> : <BulbOutlined />}
            onClick={fetchSuggestions}
            disabled={loading}
          >
            {suggestions ? 'Refresh' : 'Get Suggestions'}
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is analyzing your campaign..." />
        </div>
      ) : suggestions ? (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Found {suggestions.total_count} keywords ({suggestions.industry_specific_count} industry-specific).
            Click to select, then add to your campaign.
          </Paragraph>

          {suggestions.keywords.map((group, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <Tag color={getRelevanceColor(group.relevance)}>{group.relevance}</Tag>
                {group.category}
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                {group.description}
              </Text>
              <Space wrap>
                {group.keywords.map((keyword) => {
                  const isSelected = selectedKeywords.has(keyword);
                  const isExisting = existingKeywords.includes(keyword);
                  return (
                    <Tag
                      key={keyword}
                      color={isExisting ? 'default' : isSelected ? 'purple' : undefined}
                      style={{
                        cursor: isExisting ? 'not-allowed' : 'pointer',
                        opacity: isExisting ? 0.5 : 1,
                      }}
                      onClick={() => !isExisting && toggleKeyword(keyword)}
                    >
                      {isSelected && <CheckOutlined style={{ marginRight: 4 }} />}
                      {keyword}
                      {isExisting && ' (added)'}
                    </Tag>
                  );
                })}
              </Space>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Click 'Get Suggestions' to receive AI-powered keyword recommendations"
        />
      )}
    </Card>
  );
}

/**
 * AI Value Proposition Suggestions Component
 * Suggests value propositions for outreach emails
 */
export function AIValuePropSuggestions({
  campaignId,
  existingProps = [],
  onAddProps,
  industry = '',
  productName = '',
  companyName = '',
  businessTypes = [],
  painPoints = [],
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedProps, setSelectedProps] = useState(new Set());
  const { fetchBalance } = useBilling();

  const fetchSuggestions = useCallback(async () => {
    if (!campaignId) {
      message.warning('Save your campaign first to get AI suggestions');
      return;
    }

    setLoading(true);
    try {
      const result = await aiApi.suggestValueProps(campaignId, {
        industry,
        product_name: productName,
        company_name: companyName,
        business_types: businessTypes,
        pain_points: painPoints,
      });
      setSuggestions(result);
      setSelectedProps(new Set());
      fetchBalance();
    } catch (error) {
      console.error('Error fetching value prop suggestions:', error);
      if (error.response?.status === 503) {
        message.error('AI service is not available. Check your API configuration.');
      } else {
        message.error('Failed to get value proposition suggestions');
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId, industry, productName, companyName, businessTypes, painPoints, fetchBalance]);

  const toggleProp = (index) => {
    const newSelected = new Set(selectedProps);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedProps(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedProps.size > 0 && onAddProps) {
      const propsToAdd = suggestions.value_propositions
        .filter((_, index) => selectedProps.has(index))
        .map((p) => p.text);
      onAddProps(propsToAdd);
      setSelectedProps(new Set());
      message.success(`Added ${selectedProps.size} value propositions`);
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#8b5cf6' }} />
          <span>AI Value Proposition Suggestions</span>
        </Space>
      }
      extra={
        <Space>
          {selectedProps.size > 0 && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddSelected}
            >
              Add {selectedProps.size} Selected
            </Button>
          )}
          <Button
            size="small"
            icon={loading ? <Spin size="small" /> : <BulbOutlined />}
            onClick={fetchSuggestions}
            disabled={loading}
          >
            {suggestions ? 'Refresh' : 'Get Suggestions'}
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is generating value propositions..." />
        </div>
      ) : suggestions ? (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Click to select value propositions, then add to your campaign.
          </Paragraph>

          <Space direction="vertical" style={{ width: '100%' }}>
            {suggestions.value_propositions.map((prop, index) => {
              const isSelected = selectedProps.has(index);
              const isRecommended =
                index === suggestions.recommended_for_initial_outreach ||
                index === suggestions.recommended_for_follow_up;

              return (
                <Card
                  key={index}
                  size="small"
                  hoverable
                  onClick={() => toggleProp(index)}
                  style={{
                    border: isSelected ? '2px solid #8b5cf6' : undefined,
                    backgroundColor: isSelected ? '#f5f3ff' : undefined,
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{prop.text}</Text>
                      {isSelected && <CheckOutlined style={{ color: '#8b5cf6' }} />}
                    </div>
                    <Space>
                      <Tag color="blue">{prop.pain_point_addressed}</Tag>
                      <Tag>{prop.use_case}</Tag>
                      {index === suggestions.recommended_for_initial_outreach && (
                        <Tag color="green">Best for Initial Outreach</Tag>
                      )}
                      {index === suggestions.recommended_for_follow_up && (
                        <Tag color="orange">Best for Follow-up</Tag>
                      )}
                    </Space>
                  </Space>
                </Card>
              );
            })}
          </Space>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Click 'Get Suggestions' to receive AI-generated value propositions"
        />
      )}
    </Card>
  );
}

/**
 * AI Status Indicator Component
 * Shows whether AI features are available
 */
export function AIStatusIndicator({ compact = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await aiApi.getStatus();
        setStatus(result);
      } catch (error) {
        setStatus({ available: false, error: 'Failed to check AI status' });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return <Spin size="small" />;
  }

  if (compact) {
    return (
      <Tooltip
        title={
          status?.available
            ? `AI: ${status.provider} (${status.model})`
            : status?.error || 'AI unavailable'
        }
      >
        <Tag color={status?.available ? 'green' : 'default'}>
          <ThunderboltOutlined /> AI {status?.available ? 'ON' : 'OFF'}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Card size="small">
      <Space>
        <ThunderboltOutlined
          style={{ color: status?.available ? '#10b981' : '#9ca3af', fontSize: 20 }}
        />
        <div>
          <Text strong>AI Features</Text>
          <br />
          <Text type="secondary">
            {status?.available
              ? `${status.provider} - ${status.model}`
              : status?.error || 'Not available'}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
