/* eslint-disable react/prop-types */
import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";

const PaymentModal = ({ visible, onClose, initialData, onSubmit, loading }) => {
  const [form] = Form.useForm(); 

  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialData, form]);

  const handleFinish = async (values) => {
    await onSubmit(values);
  };

  return (
    <Modal
      open={visible}
      title={initialData ? "Edit Payment Method" : "Add Payment Method"}
      onCancel={onClose}
      footer={null}
      destroyOnClose 
    >
      <Form
        layout="vertical"
        form={form} 
        onFinish={handleFinish}
      >
        <Form.Item
          label="Platform"
          name="platform"
          rules={[{ required: true, message: "Please enter the platform" }]}
        >
          <Input placeholder="e.g. KBZPay, WavePay" />
        </Form.Item>

        <Form.Item
          label="Platform Username"
          name="platformUserName"
          rules={[{ required: true, message: "Please enter the username" }]}
        >
          <Input placeholder="e.g. yourname123" />
        </Form.Item>

        <Form.Item
          label="Account Number"
          name="accountNumber"
          rules={[
            { required: true, message: "Please enter the account number" },
          ]}
        >
          <Input placeholder="e.g. 09xxxxxxx" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {initialData ? "Update" : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
