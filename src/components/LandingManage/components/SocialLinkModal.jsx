/* eslint-disable react/prop-types */
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;

const SocialLinkModal = ({ open, onClose, form, onSubmit, isEditing }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden={false}
      centered
      title={
        <span className="text-lg font-semibold">
          {isEditing ? "Edit Social Media Link" : "Add Social Media Link"}
        </span>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Platform Name"
          rules={[
            { required: true, message: "Please enter the platform name" },
          ]}
        >
          <Input placeholder="e.g., Telegram, Facebook, WhatsApp" />
        </Form.Item>

        <Form.Item
          name="redirectType"
          label="Redirect Type"
          rules={[{ required: true, message: "Please select redirect type" }]}
        >
          <Select>
            <Option value="url">Website URL (https://...)</Option>
            <Option value="email">Email (support@example.com)</Option>
            <Option value="phone">Phone (+95912345678)</Option>
          </Select>
        </Form.Item>

        <Form.Item shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue("redirectType");
            let placeholder = "https://...";
            let extra = "Include full URL like https://t.me/username";

            if (type === "email") {
              placeholder = "e.g., support@example.com";
              extra = "Email will open in mail app";
            } else if (type === "phone") {
              placeholder = "e.g., +95912345678";
              extra = "Phone will open in dialer";
            }

            return (
              <>
                <Form.Item
                  name="link"
                  label="Link"
                  rules={[{ required: true, message: "Please enter the link" }]}
                >
                  <Input placeholder={placeholder} />
                </Form.Item>
                <p className="text-xs text-gray-500 mb-4">{extra}</p>
              </>
            );
          }}
        </Form.Item>

        <Form.Item
          name="icon"
          label="Icon Identifier"
          rules={[{ required: true, message: "Please enter the icon name" }]}
        >
          <Input placeholder="e.g., TelegramLogo, FacebookLogo" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isEditing ? "Update Link" : "Add Link"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SocialLinkModal;
