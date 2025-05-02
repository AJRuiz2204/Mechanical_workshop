import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Typography,
  notification,
} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Register } from "../../../services/userService";

/**
 * RegisterUser Component
 * Handles new user registration by collecting user details and sending them to the backend service.
 *
 * @returns {JSX.Element} The RegisterUser component.
 */
const RegisterUser = () => {
  const [form] = Form.useForm();

  /**
   * Generates a secure random password and updates the password state.
   * The password includes uppercase letters, lowercase letters, numbers, and symbols.
   */
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let generatedPassword = "";
    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }
    form.setFieldsValue({ password: generatedPassword });
  };

  /**
   * Handles the form submission for user registration.
   * Sends the user data to the backend service and manages the response.
   *
   * @param {Object} values - The form values.
   */
  const onFinish = async (values) => {
    try {
      await Register(values);
      notification.success({ message: "User registered successfully." });
      form.resetFields();
    } catch (err) {
      notification.error({ message: `Error: ${err.message}` });
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card
        title={
          <Typography.Title level={2} style={{ textAlign: "center" }}>
            REGISTER USER
          </Typography.Title>
        }
        style={{ width: 500 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input placeholder="Enter user email address" />
          </Form.Item>
          <Form.Item
            name="name"
            label="First Name"
            rules={[
              { required: true, message: "Please enter user first name!" },
            ]}
          >
            <Input placeholder="Enter user's first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              { required: true, message: "Please enter user last name!" },
            ]}
          >
            <Input placeholder="Enter user's last name" />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter a username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter a password!" }]}
          >
            <Input.Password
              placeholder="Enter a secure password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              addonAfter={<Button onClick={generatePassword}>Generate</Button>}
            />
          </Form.Item>
          <Form.Item name="profile" label="Profile" initialValue="Manager">
            <Select>
              <Select.Option value="Manager">Administrator</Select.Option>
              <Select.Option value="Technician">
                Mechanical Technician
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add User
            </Button>
            <Button
              htmlType="button"
              onClick={onReset}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterUser;
