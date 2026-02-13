import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Tag, Spin, Empty, Typography, Space, Alert, message } from 'antd';
import {
  BulbOutlined,
  PlusOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { aiApi } from '../../api';
import { useBilling } from '../../context/BillingContext';

const { Text, Paragraph } = Typography;

/**
 * AI Target Profile Suggestions Component (Wizard Mode)
 * Suggests industry, business types, size metric for new campaigns
 */
export function AITargetProfileSuggestions({
  name,
  description,
  productType,
  companyName,
  productName,
  onSelectIndustry,
  onSelectBusinessTypes,
  onSelectSizeMetric,
  onSelectSizeRange,
  currentIndustry,
  currentBusinessTypes = [],
  autoFetch = false,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const { fetchBalance } = useBilling();

  const fetchSuggestions = useCallback(async () => {
    if (!name) {
      message.warning('Enter a campaign name first to get AI suggestions');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.suggestTargetProfile({
        name,
        description,
        product_type: productType,
        company_name: companyName,
        product_name: productName,
      });
      setSuggestions(result);
      fetchBalance();
    } catch (err) {
      console.error('Error fetching target profile suggestions:', err);
      if (err.response?.status === 503) {
        setError('AI service is not available. You can configure targets manually.');
      } else {
        setError('Failed to get AI suggestions. You can configure targets manually.');
      }
    } finally {
      setLoading(false);
    }
  }, [name, description, productType, companyName, productName, fetchBalance]);

  useEffect(() => {
    if (autoFetch && name && !suggestions && !loading) {
      fetchSuggestions();
    }
  }, [autoFetch, name, suggestions, loading, fetchSuggestions]);

  const handleSelectIndustry = (industry) => {
    if (onSelectIndustry) {
      onSelectIndustry(industry);
      message.success(`Selected industry: ${industry}`);
    }
  };

  const handleSelectBusinessType = (type) => {
    if (onSelectBusinessTypes) {
      const newTypes = currentBusinessTypes.includes(type)
        ? currentBusinessTypes.filter((t) => t !== type)
        : [...currentBusinessTypes, type];
      onSelectBusinessTypes(newTypes);
    }
  };

  const handleSelectAllBusinessTypes = () => {
    if (onSelectBusinessTypes && suggestions?.business_types) {
      const allTypes = suggestions.business_types.map((bt) => bt.value);
      onSelectBusinessTypes(allTypes);
      message.success('Added all suggested business types');
    }
  };

  const handleApplySizeSettings = () => {
    if (suggestions?.size_metric && suggestions?.size_range) {
      if (onSelectSizeMetric) {
        onSelectSizeMetric(suggestions.size_metric.recommended);
      }
      if (onSelectSizeRange) {
        onSelectSizeRange([suggestions.size_range.min, suggestions.size_range.max]);
      }
      message.success('Applied AI-recommended size settings');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'blue';
    if (confidence >= 0.4) return 'orange';
    return 'default';
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <RobotOutlined style={{ color: '#8b5cf6' }} />
          <span>AI Target Suggestions</span>
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={loading ? <Spin size="small" /> : <BulbOutlined />}
          onClick={fetchSuggestions}
          disabled={loading || !name}
        >
          {suggestions ? 'Refresh' : 'Get Suggestions'}
        </Button>
      }
      style={{ marginBottom: 16, borderColor: '#c4b5fd' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is analyzing your campaign..." />
        </div>
      ) : error ? (
        <Alert message={error} type="warning" showIcon />
      ) : suggestions ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Industries */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Recommended Industries
            </Text>
            <Space wrap>
              {suggestions.industries?.map((ind) => (
                <Tag
                  key={ind.value}
                  color={currentIndustry === ind.value ? 'purple' : getConfidenceColor(ind.confidence)}
                  style={{ cursor: 'pointer', padding: '4px 8px' }}
                  onClick={() => handleSelectIndustry(ind.value)}
                >
                  {currentIndustry === ind.value && <CheckOutlined style={{ marginRight: 4 }} />}
                  {ind.value} ({Math.round(ind.confidence * 100)}%)
                </Tag>
              ))}
            </Space>
            {suggestions.industries?.[0]?.reasoning && (
              <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                {suggestions.industries[0].reasoning}
              </Text>
            )}
          </div>

          {/* Business Types */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Suggested Business Types</Text>
              <Button size="small" type="link" onClick={handleSelectAllBusinessTypes}>
                Add All
              </Button>
            </div>
            <Space wrap>
              {suggestions.business_types?.map((bt) => {
                const isSelected = currentBusinessTypes.includes(bt.value);
                return (
                  <Tag
                    key={bt.value}
                    color={isSelected ? 'purple' : bt.relevance === 'high' ? 'blue' : 'default'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectBusinessType(bt.value)}
                  >
                    {isSelected && <CheckOutlined style={{ marginRight: 4 }} />}
                    {bt.value}
                  </Tag>
                );
              })}
            </Space>
          </div>

          {/* Size Settings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Size Recommendation</Text>
              <Button size="small" type="link" onClick={handleApplySizeSettings}>
                Apply
              </Button>
            </div>
            <Card size="small" style={{ background: '#f8fafc' }}>
              <Space direction="vertical" size={4}>
                <Text>
                  Metric: <Text code>{suggestions.size_metric?.recommended}</Text>
                </Text>
                <Text>
                  Range: <Text code>{suggestions.size_range?.min} - {suggestions.size_range?.max}</Text>
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {suggestions.size_range?.reasoning}
                </Text>
              </Space>
            </Card>
          </div>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            name
              ? "Click 'Get Suggestions' to receive AI-powered target recommendations"
              : 'Enter a campaign name first to get AI suggestions'
          }
        />
      )}
    </Card>
  );
}

/**
 * AI Keyword Suggestions Component (Wizard Mode)
 * Suggests pain point keywords for new campaigns without campaign_id
 */
export function AIKeywordSuggestionsWizard({
  context,
  existingKeywords = [],
  onAddKeywords,
  autoFetch = false,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [error, setError] = useState(null);
  const { fetchBalance } = useBilling();

  const fetchSuggestions = useCallback(async () => {
    if (!context.industry && context.business_types?.length === 0) {
      message.warning('Set industry or business types first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.suggestDraftKeywords(context, existingKeywords);
      setSuggestions(result);
      setSelectedKeywords(new Set());
      fetchBalance();
    } catch (err) {
      console.error('Error fetching keyword suggestions:', err);
      if (err.response?.status === 503) {
        setError('AI service is not available. You can add keywords manually.');
      } else {
        setError('Failed to get keyword suggestions');
      }
    } finally {
      setLoading(false);
    }
  }, [context, existingKeywords, fetchBalance]);

  useEffect(() => {
    if (autoFetch && (context.industry || context.business_types?.length > 0) && !suggestions && !loading) {
      fetchSuggestions();
    }
  }, [autoFetch, context.industry, context.business_types, suggestions, loading, fetchSuggestions]);

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

  const handleAddAll = () => {
    if (suggestions?.keywords && onAddKeywords) {
      const allKeywords = suggestions.keywords.flatMap((g) => g.keywords);
      const newKeywords = allKeywords.filter((k) => !existingKeywords.includes(k));
      onAddKeywords(newKeywords);
      message.success(`Added ${newKeywords.length} keywords`);
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
          {suggestions && (
            <Button size="small" type="link" onClick={handleAddAll}>
              Add All
            </Button>
          )}
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
      style={{ marginBottom: 16, borderColor: '#c4b5fd' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is analyzing pain points..." />
        </div>
      ) : error ? (
        <Alert message={error} type="warning" showIcon />
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
 * AI Search Query Suggestions Component (Wizard Mode)
 * Suggests Google Maps search queries for new campaigns
 */
export function AISearchQuerySuggestions({
  context,
  onAddQueries,
  existingQueries = [],
  autoFetch = false,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedQueries, setSelectedQueries] = useState(new Set());
  const [error, setError] = useState(null);
  const { fetchBalance } = useBilling();

  const fetchSuggestions = useCallback(async () => {
    if (!context.business_types?.length) {
      message.warning('Set business types first to get search query suggestions');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.suggestSearchQueries(context);
      setSuggestions(result);
      setSelectedQueries(new Set());
      fetchBalance();
    } catch (err) {
      console.error('Error fetching search query suggestions:', err);
      if (err.response?.status === 503) {
        setError('AI service is not available. You can add queries manually.');
      } else {
        setError('Failed to get search query suggestions');
      }
    } finally {
      setLoading(false);
    }
  }, [context, fetchBalance]);

  useEffect(() => {
    if (autoFetch && context.business_types?.length > 0 && !suggestions && !loading) {
      fetchSuggestions();
    }
  }, [autoFetch, context.business_types, suggestions, loading, fetchSuggestions]);

  const toggleQuery = (query) => {
    const newSelected = new Set(selectedQueries);
    if (newSelected.has(query)) {
      newSelected.delete(query);
    } else {
      newSelected.add(query);
    }
    setSelectedQueries(newSelected);
  };

  const handleAddSelected = () => {
    if (selectedQueries.size > 0 && onAddQueries) {
      onAddQueries(Array.from(selectedQueries));
      setSelectedQueries(new Set());
      message.success(`Added ${selectedQueries.size} search queries`);
    }
  };

  const handleAddAll = () => {
    if (suggestions?.queries && onAddQueries) {
      const allQueries = suggestions.queries.map((q) => q.query);
      const newQueries = allQueries.filter((q) => !existingQueries.includes(q));
      onAddQueries(newQueries);
      message.success(`Added ${newQueries.length} search queries`);
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#8b5cf6' }} />
          <span>AI Search Query Suggestions</span>
        </Space>
      }
      extra={
        <Space>
          {suggestions && (
            <Button size="small" type="link" onClick={handleAddAll}>
              Add All
            </Button>
          )}
          {selectedQueries.size > 0 && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddSelected}
            >
              Add {selectedQueries.size} Selected
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
      style={{ marginBottom: 16, borderColor: '#c4b5fd' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is generating search queries..." />
        </div>
      ) : error ? (
        <Alert message={error} type="warning" showIcon />
      ) : suggestions ? (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Click to select queries, then add to your campaign. Use {'{region}'} and {'{city}'} as placeholders.
          </Paragraph>

          <Space direction="vertical" style={{ width: '100%' }}>
            {suggestions.queries?.map((q, index) => {
              const isSelected = selectedQueries.has(q.query);
              const isExisting = existingQueries.includes(q.query);
              return (
                <Card
                  key={index}
                  size="small"
                  hoverable={!isExisting}
                  onClick={() => !isExisting && toggleQuery(q.query)}
                  style={{
                    cursor: isExisting ? 'not-allowed' : 'pointer',
                    border: isSelected ? '2px solid #8b5cf6' : undefined,
                    backgroundColor: isExisting ? '#f5f5f5' : isSelected ? '#f5f3ff' : undefined,
                    opacity: isExisting ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text strong style={{ fontFamily: 'monospace' }}>
                        {q.query}
                      </Text>
                      {isExisting && <Tag style={{ marginLeft: 8 }}>Added</Tag>}
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Target: {q.target_type} | {q.expected_results}
                      </Text>
                    </div>
                    {isSelected && <CheckOutlined style={{ color: '#8b5cf6' }} />}
                  </div>
                </Card>
              );
            })}
          </Space>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Click 'Get Suggestions' to receive AI-generated search queries"
        />
      )}
    </Card>
  );
}

/**
 * AI Value Proposition Suggestions Component (Wizard Mode)
 * Suggests value propositions for new campaigns without campaign_id
 */
export function AIValuePropSuggestionsWizard({
  context,
  painPoints = [],
  existingProps = [],
  onAddProps,
  autoFetch = false,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedProps, setSelectedProps] = useState(new Set());
  const [error, setError] = useState(null);
  const { fetchBalance } = useBilling();

  const fetchSuggestions = useCallback(async () => {
    if (!context.industry && painPoints.length === 0) {
      message.warning('Set industry or pain points first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.suggestDraftValueProps(context, painPoints);
      setSuggestions(result);
      setSelectedProps(new Set());
      fetchBalance();
    } catch (err) {
      console.error('Error fetching value prop suggestions:', err);
      if (err.response?.status === 503) {
        setError('AI service is not available. You can add value propositions manually.');
      } else {
        setError('Failed to get value proposition suggestions');
      }
    } finally {
      setLoading(false);
    }
  }, [context, painPoints, fetchBalance]);

  useEffect(() => {
    if (autoFetch && (context.industry || painPoints.length > 0) && !suggestions && !loading) {
      fetchSuggestions();
    }
  }, [autoFetch, context.industry, painPoints.length, suggestions, loading, fetchSuggestions]);

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

  const handleAddAll = () => {
    if (suggestions?.value_propositions && onAddProps) {
      const allProps = suggestions.value_propositions.map((p) => p.text);
      const newProps = allProps.filter((p) => !existingProps.includes(p));
      onAddProps(newProps);
      message.success(`Added ${newProps.length} value propositions`);
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
          {suggestions && (
            <Button size="small" type="link" onClick={handleAddAll}>
              Add All
            </Button>
          )}
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
      style={{ marginBottom: 16, borderColor: '#c4b5fd' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="AI is generating value propositions..." />
        </div>
      ) : error ? (
        <Alert message={error} type="warning" showIcon />
      ) : suggestions ? (
        <div>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Click to select value propositions, then add to your campaign.
          </Paragraph>

          <Space direction="vertical" style={{ width: '100%' }}>
            {suggestions.value_propositions?.map((prop, index) => {
              const isSelected = selectedProps.has(index);
              const isExisting = existingProps.includes(prop.text);
              const isRecommended =
                index === suggestions.recommended_for_initial_outreach ||
                index === suggestions.recommended_for_follow_up;

              return (
                <Card
                  key={index}
                  size="small"
                  hoverable={!isExisting}
                  onClick={() => !isExisting && toggleProp(index)}
                  style={{
                    cursor: isExisting ? 'not-allowed' : 'pointer',
                    border: isSelected ? '2px solid #8b5cf6' : undefined,
                    backgroundColor: isExisting ? '#f5f5f5' : isSelected ? '#f5f3ff' : undefined,
                    opacity: isExisting ? 0.6 : 1,
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{prop.text}</Text>
                      {isSelected && <CheckOutlined style={{ color: '#8b5cf6' }} />}
                      {isExisting && <Tag>Added</Tag>}
                    </div>
                    <Space wrap>
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
