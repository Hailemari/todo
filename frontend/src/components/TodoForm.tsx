import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch, Upload, Tag, message, Typography, Card, Space, Divider } from 'antd';
import { PlusOutlined, UploadOutlined, FileOutlined, TagOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Title } = Typography;

interface TodoFormProps {
  initialValues?: {
    _id?: string;
    title?: string;
    description?: string;
    completed?: boolean;
    tags?: string[];
    imagePath?: string;
    filePath?: string;
  };
  onFinish: (values: Partial<{ 
    _id?: string; 
    title?: string; 
    description?: string; 
    completed?: boolean; 
    tags?: string[]; 
    imagePath?: string; 
    filePath?: string; 
  }> | FormData) => void;
  loading: boolean;
}

interface FormValues {
  title: string;
  description?: string;
  completed?: boolean;
  image?: UploadFile[];
  file?: UploadFile[];
}

const TodoForm: React.FC<TodoFormProps> = ({ initialValues, onFinish, loading }) => {
  const [form] = Form.useForm<FormValues>();
  const [tags, setTags] = useState<string[]>(initialValues?.tags || []);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title || '',
        description: initialValues.description || '',
        completed: initialValues.completed || false
      });
      setTags(initialValues.tags || []);
    }
  }, [initialValues, form]);

  const validateFormData = (values: FormValues): { valid: boolean; message?: string } => {
    if (!values.title || values.title.trim() === '' || values.title === 'undefined') {
      return { valid: false, message: 'Title cannot be empty' };
    }
    return { valid: true };
  };

  const handleSubmit = (values: FormValues): void => {
    // Validate before proceeding
    const validation = validateFormData(values);
    if (!validation.valid) {
      message.error(validation.message);
      return;
    }
    
    const formData = new FormData();
  
    formData.append('title', values.title.trim());
    if (values.description) formData.append('description', values.description);
    formData.append('completed', String(values.completed || false));
  
    // Add tags
    tags.forEach((tag) => formData.append('tags[]', tag));
  
    // Handle image file
    if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
      formData.append('image', values.image[0].originFileObj);
    }
  
    // Handle file upload
    if (values.file && values.file.length > 0 && values.file[0].originFileObj) {
      formData.append('file', values.file[0].originFileObj);
    }
  
    onFinish(formData);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = (): void => {
    if (inputValue && inputValue.trim() !== '' && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <Card className="todo-form-card" bordered={false}>
      <Title level={4} className="form-title">
        {initialValues?._id ? 'Update Todo' : 'Create New Todo'}
      </Title>
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ completed: false }}
        className="todo-form"
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter a title!' },
            { 
              validator: (_, value) => {
                if (!value || value.trim() === '' || value === 'undefined') {
                  return Promise.reject(new Error('Title cannot be empty'));
                }
                return Promise.resolve();
              }
            }
          ]}
          validateTrigger={['onChange', 'onBlur']}
        >
          <Input 
            placeholder="Enter todo title" 
            size="large" 
            className="form-input" 
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea 
            rows={4} 
            placeholder="Enter todo description" 
            className="form-textarea" 
          />
        </Form.Item>

        <Form.Item name="completed" label="Mark as completed" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label={
          <Space>
            <TagOutlined />
            <span>Tags</span>
          </Space>
        }>
          <div className="tag-input-container">
            {tags.map((tag, index) => (
              <Tag
                key={tag}
                closable
                color="blue"
                onClose={() => {
                  const newTags = [...tags];
                  newTags.splice(index, 1);
                  setTags(newTags);
                }}
                className="todo-tag"
              >
                {tag}
              </Tag>
            ))}
            {inputVisible ? (
              <Input
                type="text"
                size="small"
                className="tag-input"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
                autoFocus
              />
            ) : (
              <Tag
                onClick={() => setInputVisible(true)}
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                className="add-tag-button"
              >
                <PlusOutlined /> New Tag
              </Tag>
            )}
          </div>
        </Form.Item>

        <Space direction="vertical" className="upload-section" size="large" style={{ width: '100%' }}>
          <Form.Item 
            label={
              <Space>
                <UploadOutlined />
                <span>Thumbnail Image</span>
              </Space>
            } 
            name="image" 
            valuePropName="fileList" 
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload
              accept="image/*"
              maxCount={1}
              listType="picture"
              beforeUpload={() => false} // prevent auto upload
              className="image-upload"
            >
              <Button icon={<UploadOutlined />} className="upload-button">
                Select Image
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item 
            label={
              <Space>
                <FileOutlined />
                <span>Attachment File</span>
              </Space>
            } 
            name="file" 
            valuePropName="fileList" 
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              className="file-upload"
            >
              <Button icon={<FileOutlined />} className="upload-button">
                Select File
              </Button>
            </Upload>
          </Form.Item>
        </Space>

        <Divider />

        <Form.Item className="form-actions">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block
            size="large"
            className="submit-button"
          >
            {initialValues?._id ? 'Update Todo' : 'Create Todo'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TodoForm;