import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  interface LoginValues {
    email: string;
    password: string;
  }

  const onFinish = async (values: LoginValues): Promise<void> => {
    try {
      setLoading(true);
      const data = await login(values);
      // Save user to local storage
      localStorage.setItem('user', JSON.stringify(data));
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      interface ApiError extends Error {
        response?: {
          data?: {
            message?: string;
          };
        };
      }

      if (error instanceof Error && (error as ApiError).response?.data?.message) {
        message.error((error as ApiError).response?.data?.message || 'An error occurred');
      } else {
        message.error('Failed to Login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <Title level={2}>Todo App</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your Email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register now!</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;