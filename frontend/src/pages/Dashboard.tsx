import { useState, useEffect } from 'react';
import { 
  Layout, 
  Button, 
  Modal, 
  message, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Divider,
  Card,
  Badge,
  Avatar,
  Statistic,
  Row,
  Col,
  Menu,
  Dropdown
} from 'antd';
import { 
  PlusOutlined, 
  LogoutOutlined, 
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  DownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import { 
  getTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo 
} from '../services/api';
import { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Define interfaces for our data structures
interface ITodo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  tags?: string[];
  imagePath?: string;
  filePath?: string;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

interface IStats {
  total: number;
  completed: number;
  pending: number;
}

interface IUser {
  name: string;
  email?: string;
  _id?: string;
}

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalCount: 0
  });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<ITodo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [stats, setStats] = useState<IStats>({
    total: 0,
    completed: 0,
    pending: 0
  });
  
  const navigate = useNavigate();
  const user: IUser = JSON.parse(localStorage.getItem('user') || '{"name": "User"}');

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [pagination.page, searchTerm, selectedTag]);

  // Extract all unique tags from todos and calculate stats
  useEffect(() => {
    const tags = new Set<string>();
    let completed = 0;
    
    todos.forEach(todo => {
      if (todo.tags && todo.tags.length > 0) {
        todo.tags.forEach(tag => tags.add(tag));
      }
      if (todo.completed) completed++;
    });
    
    setAvailableTags(Array.from(tags));
    setStats({
      total: pagination.totalCount,
      completed: completed,
      pending: pagination.totalCount - completed
    });
  }, [todos, pagination.totalCount]);

  const fetchTodos = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getTodos(
        pagination.page, 
        pagination.limit, 
        searchTerm, 
        selectedTag
      );
      setTodos(response.todos);
      setPagination(response.pagination);
    } catch (error) {
      message.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (values: Partial<ITodo>): Promise<void> => {
    try {
      setLoading(true);
      await createTodo(values);
      message.success('Todo created successfully');
      setIsModalVisible(false);
      fetchTodos();
    } catch (error) {
      message.error('Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async (values: Partial<ITodo>): Promise<void> => {
    try {
      if (!selectedTodo) return;
      
      setLoading(true);
      await updateTodo(selectedTodo._id, values);
      message.success('Todo updated successfully');
      setIsModalVisible(false);
      setSelectedTodo(null);
      fetchTodos();
    } catch (error) {
      message.error('Failed to update todo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await deleteTodo(id);
      message.success('Todo deleted successfully');
      fetchTodos();
    } catch (error) {
      message.error('Failed to delete todo');
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = (): void => {
    setSelectedTodo(null);
    setIsModalVisible(true);
  };

  const showEditModal = (todo: ITodo): void => {
    setSelectedTodo(todo);
    setIsModalVisible(true);
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
    setSelectedTodo(null);
  };

  const handleSearch = (value: string): void => {
    setSearchTerm(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleTagFilter = (value: string): void => {
    setSelectedTag(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (page: number): void => {
    setPagination({ ...pagination, page });
  };

  const handleLogout = (): void => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Create menu items for user dropdown
  type MenuItem = Required<MenuProps>['items'][number];
  
  const userMenuItems: MenuItem[] = [
    {
      key: 'profile',
      label: 'Profile'
    },
    {
      key: 'settings',
      label: 'Settings'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          Logout
        </Space>
      ),
      onClick: handleLogout
    }
  ];

  return (
    <Layout className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <Header className="app-header" style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo">
            <Title level={3} style={{ margin: 0 }}>
              <span style={{ color: '#1890ff' }}>Todo</span>App
            </Title>
          </div>
          
          <div className="user-section">
            <Dropdown 
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Space className="user-menu" style={{ cursor: 'pointer' }}>
      
                  <Avatar icon={<UserOutlined />} />
                <Text strong>{user?.name}</Text>
                <DownOutlined />
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>
      
      <Content className="dashboard-content" style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>My Todos</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={showCreateModal}
          >
            Add New Todo
          </Button>
        </div>
        
        <Row gutter={24} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card className="stat-card">
              <Statistic 
                title="Total Tasks" 
                value={stats.total} 
                prefix={<MenuUnfoldOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <Statistic 
                title="Completed" 
                value={stats.completed} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="stat-card">
              <Statistic 
                title="Pending" 
                value={stats.pending} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Card className="filter-card" style={{ marginBottom: '24px' }}>
          <Row gutter={24} align="middle">
            <Col span={12}>
              <Input
                placeholder="Search todos..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                size="large"
                allowClear
                style={{ width: '100%' }}
                addonAfter={
                  <Button 
                    type="text" 
                    icon={<SearchOutlined />} 
                    onClick={() => handleSearch(searchTerm)}
                  />
                }
              />
            </Col>
            
            <Col span={12}>
              <Select
                placeholder="Filter by tag"
                style={{ width: '100%' }}
                onChange={handleTagFilter}
                value={selectedTag}
                allowClear
                size="large"
                suffixIcon={<FilterOutlined />}
              >
                {availableTags.map(tag => (
                  <Option key={tag} value={tag}>
                    <Space>
                      <TagsOutlined />
                      {tag}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
        
        <Card className="todo-list-card" bordered={false}>
          <TodoList
            todos={todos}
            onEdit={showEditModal}
            onDelete={handleDeleteTodo}
            loading={loading}
            pagination={{
              currentPage: pagination.page,
              totalCount: pagination.totalCount,
              itemsPerPage: pagination.limit,
              totalPages: pagination.totalPages
            }}
            onPageChange={handlePageChange}
          />
        </Card>
        
        <Modal
          title={null}
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          destroyOnClose
          width={600}
          bodyStyle={{ padding: 0 }}
          centered
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
          <TodoForm
            initialValues={selectedTodo}
            onFinish={selectedTodo ? handleUpdateTodo : handleCreateTodo}
            loading={loading}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default Dashboard;