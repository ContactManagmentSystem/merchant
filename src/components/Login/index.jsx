import { Form, Input, Button, Typography, Card } from "antd";
import { IconHeartFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../api/hooks/useLogin";
import useUserStore from "../../store/userStore";
import showToast from "../../utils/toast";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();
  const { setUserData } = useUserStore();

  const loginMutation = useLogin({
    onSuccess: (data) => {
      showToast.success("Welcome back! Login successful.");
      setUserData(data.data);
      nav("/dashboard/landing-manage");
    },
    onError: (error) => {
      showToast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    },
  });

  const onFinish = (values) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-2 sm:px-4 py-4">
      <Card
        className="w-full max-w-md"
        bordered={false}
        style={{
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{
          padding: "16px",
        }}
      >
        <div className="text-center mb-4 sm:mb-6">
          <Title level={2} className="!mb-1 !text-xl sm:!text-2xl">
            Welcome Back <IconHeartFilled className="inline text-red-500 text-lg sm:text-xl" />
          </Title>
          <Text type="secondary" className="text-xs sm:text-sm">
            Please log in to your account
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="e.g. john@example.com" allowClear />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter your password" allowClear />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
