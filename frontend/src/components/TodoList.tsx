import { List, Card, Tag, Button, Space, Tooltip, Pagination, Empty, Typography, Badge, Avatar } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  FileOutlined,
  EyeOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import { JSX, useState } from 'react';

const { Text, Paragraph, Title } = Typography;

// Base URL extracted as a constant for easier management
const BASE_URL = 'https://todo-l6h3.onrender.com';
const UPLOADS_PATH = `${BASE_URL}/uploads/`;

const TodoList = ({
  todos,
  onEdit,
  onDelete,
  loading,
  pagination,
  onPageChange
}: {
  todos: { 
    _id: string; 
    title: string; 
    description?: string; 
    imagePath?: string; 
    filePath?: string; 
    tags?: string[]; 
    completed: boolean; 
    createdAt: string; 
  }[];
  onEdit: (todo: { 
    _id: string; 
    title: string; 
    description?: string; 
    imagePath?: string; 
    filePath?: string; 
    tags?: string[]; 
    completed: boolean; 
    createdAt: string; 
  }) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  pagination: { currentPage: number; totalCount: number; itemsPerPage: number; totalPages: number };
  onPageChange: (page: number) => void;
}) => {
  const [imagePreview, setImagePreview] = useState<{visible: boolean, url: string}>({
    visible: false,
    url: ''
  });

  const handleImagePreview = (imagePath: string) => {
    setImagePreview({
      visible: true,
      url: `${UPLOADS_PATH}${imagePath}`
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      visible: false,
      url: ''
    });
  };

  const renderThumbnail = (imagePath: string | undefined, title: string): JSX.Element => {
    if (!imagePath) {
      // Return a better placeholder with an icon
      return (
        <div className="thumbnail-placeholder" style={{ 
          height: 200, 
          backgroundColor: '#f7f9fa', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}>
          <Avatar 
            style={{ backgroundColor: '#e6f7ff', color: '#1890ff', fontSize: '24px', marginBottom: '8px' }}
            size={64}
            icon={<FileOutlined />} 
          />
          <Text type="secondary">No image</Text>
        </div>
      );
    }
    
    return (
      <div className="thumbnail-container" style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        height: 200,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}>
        <img 
          src={`${UPLOADS_PATH}${imagePath}`} 
          alt={title} 
          className="thumbnail" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        <div 
          className="image-overlay" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'rgba(0,0,0,0.2)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => handleImagePreview(imagePath)}
        >
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="large" 
            shape="circle"
            ghost
          />
        </div>
      </div>
    );
  };
  
  const renderAttachment = (filePath: string | undefined): JSX.Element => {
    if (!filePath) {
      return <div className="no-attachment"></div>;
    }
    
    // Extract filename from path
    const fileName = filePath.split('/').pop() || 'Attachment';
    
    return (
      <Tooltip title={`Download ${fileName}`}>
        <Button
          type="link"
          icon={<PaperClipOutlined />}
          onClick={(e: React.MouseEvent<HTMLElement>): void => {
            e.preventDefault();
            
            // Create a temporary anchor element to force download
            const tempLink = document.createElement('a');
            tempLink.href = `${UPLOADS_PATH}${filePath}`;
            tempLink.setAttribute('download', fileName);
            tempLink.setAttribute('target', '_blank');
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
          }}
          style={{ padding: 0 }}
        >
          <Text ellipsis style={{ maxWidth: '100%' }}>{fileName}</Text>
        </Button>
      </Tooltip>
    );
  };

  const renderTags = (tags: string[] = []) => {
    if (!tags.length) return null;
    
    return (
      <Space wrap size={[0, 4]} style={{ marginTop: '8px' }}>
        {tags.map((tag, index) => (
          <Tag 
            key={index} 
            color="blue"
            style={{ margin: 0, borderRadius: '4px' }}
          >
            {tag}
          </Tag>
        ))}
      </Space>
    );
  };

  const getStatusBadge = (completed: boolean) => {
    return completed ? (
      <Badge 
        status="success" 
        text={<Text style={{ color: '#52c41a', fontWeight: 500 }}>Completed</Text>} 
      />
    ) : (
      <Badge 
        status="processing" 
        text={<Text style={{ color: '#1890ff', fontWeight: 500 }}>In Progress</Text>} 
      />
    );
  };

  const getEmptyState = () => (
    <Empty 
      description={
        <div>
          <Title level={5} style={{ marginBottom: '8px' }}>No tasks found</Title>
          <Text type="secondary">Try clearing your filters or adding a new task</Text>
        </div>
      }
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      style={{ margin: '64px 0' }}
    />
  );

  // Custom grid configuration with exactly 5 columns on large screens
  const customGrid = {
    gutter: 16,
    xs: 1,  // 1 column on extra small screens
    sm: 2,  // 2 columns on small screens
    md: 3,  // 3 columns on medium screens
    lg: 4,  // 4 columns on large screens
    xl: 5,  // 5 columns on extra large screens (this is the key change)
    xxl: 5  // Keep 5 columns on extra-extra large screens
  };

  return (
    <div className="todo-list-container">
      {todos.length === 0 ? (
        getEmptyState()
      ) : (
        <>
          <List
            grid={customGrid}
            dataSource={todos}
            loading={loading}
            renderItem={todo => (
              <List.Item>
                <Card
                  className="todo-card"
                  cover={renderThumbnail(todo.imagePath, todo.title)}
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
                  actions={[
                    <Tooltip title="Edit">
                      <EditOutlined key="edit" onClick={() => onEdit(todo)} />
                    </Tooltip>,
                    <Tooltip title="Delete">
                      <DeleteOutlined key="delete" onClick={() => onDelete(todo._id)} style={{ color: '#ff4d4f' }} />
                    </Tooltip>
                  ]}
                >
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {getStatusBadge(todo.completed)}
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                  
                  <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: '8px' }}>
                    {todo.title}
                  </Title>
                  
                  <Paragraph 
                    ellipsis={{ rows: 2 }} 
                    style={{ fontSize: '14px', marginBottom: '12px', flex: 1, color: 'rgba(0,0,0,0.65)' }}
                  >
                    {todo.description || 'No description provided'}
                  </Paragraph>

                  {todo.filePath && (
                    <div style={{ marginBottom: '8px' }}>
                      {renderAttachment(todo.filePath)}
                    </div>
                  )}
                  
                  {renderTags(todo.tags)}
                </Card>
              </List.Item>
            )}
          />

          {imagePreview.visible && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer'
            }} onClick={closeImagePreview}>
              <img 
                src={imagePreview.url} 
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain'
                }} 
                alt="Preview"
              />
              <Button 
                type="primary"
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px'
                }}
                onClick={closeImagePreview}
              >
                Close
              </Button>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px 0' }}>
              <Pagination
                current={pagination.currentPage}
                pageSize={pagination.itemsPerPage}
                total={pagination.totalCount}
                onChange={onPageChange}
                showSizeChanger={false}
                showQuickJumper
                size="default"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodoList;