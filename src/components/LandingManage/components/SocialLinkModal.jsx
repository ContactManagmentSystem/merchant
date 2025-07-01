/* eslint-disable react/prop-types */
import { Modal, Form, Input, Select, Button } from "antd";
import { useState, useEffect } from "react";
import {
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  LinkedinLogo,
  WhatsappLogo,
  Envelope,
  Phone,
  TelegramLogo,
  MessengerLogo,
  YoutubeLogo,
} from "phosphor-react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLine, faViber } from "@fortawesome/free-brands-svg-icons";

const { Option } = Select;

// Icon options for social media platforms
const iconOptions = [
  {
    name: "Facebook",
    icon: <FacebookLogo style={{ fontSize: "24px", color: "#3b5998" }} />,
  },
  {
    name: "Twitter",
    icon: <TwitterLogo style={{ fontSize: "24px", color: "#00acee" }} />,
  },
  {
    name: "Instagram",
    icon: <InstagramLogo style={{ fontSize: "24px", color: "#e1306c" }} />,
  },
  {
    name: "LinkedIn",
    icon: <LinkedinLogo style={{ fontSize: "24px", color: "#0077b5" }} />,
  },
  {
    name: "WhatsApp",
    icon: <WhatsappLogo style={{ fontSize: "24px", color: "#25d366" }} />,
  },
  {
    name: "Email",
    icon: <Envelope style={{ fontSize: "24px", color: "#c13584" }} />,
  },
  {
    name: "Phone",
    icon: <Phone style={{ fontSize: "24px", color: "#34b7f1" }} />,
  },
  {
    name: "Telegram",
    icon: <TelegramLogo style={{ fontSize: "24px", color: "#0088cc" }} />,
  },
  {
    name: "Messenger",
    icon: <MessengerLogo style={{ fontSize: "24px", color: "#0084ff" }} />,
  },
  {
    name: "YouTube",
    icon: (
      <YoutubeLogo size={32} style={{ fontSize: "24px", color: "#0084ff" }} />
    ),
  },
  {
    name: "Viber",
    icon: (
      <FontAwesomeIcon
        icon={faViber}
        style={{ fontSize: "24px", color: "#7360f2" }}
      />
    ),
  },
  {
    name: "Line",
    icon: (
      <FontAwesomeIcon
        icon={faLine}
        style={{ fontSize: "24px", color: "#25d366" }}
      />
    ),
  },
];

const SocialLinkModal = ({ open, onClose, form, onSubmit, isEditing }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);

  const normalizeIconName = (iconName) => iconName?.replace(/Logo$/, ""); // Remove "Logo" suffix if present

  useEffect(() => {
    if (open) {
      const icon = form.getFieldValue("icon");
      const normalizedIcon = normalizeIconName(icon);
      const matchedIcon = iconOptions.find(
        (item) => item.name === normalizedIcon
      );
      setSelectedIcon(matchedIcon ? matchedIcon.name : null);
    } else {
      setSelectedIcon(null);
    }
  }, [open, form]);

  const handleIconClick = (iconName) => {
    form.setFieldsValue({ icon: iconName });
    setSelectedIcon(iconName);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden={false}
      centered
      title={isEditing ? "Edit Social Media Link" : "Add Social Media Link"}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {/* Platform Name Field */}
        <Form.Item
          name="name"
          label="Platform Name"
          rules={[
            { required: true, message: "Please enter the platform name" },
          ]}
        >
          <Input placeholder="e.g., Telegram, Facebook, WhatsApp" />
        </Form.Item>

        {/* Redirect Type Field */}
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

        {/* Dynamic Link Field based on Redirect Type */}
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

        {/* Icon Selection */}
        <Form.Item
          name="icon"
          label="Choose an Icon"
          rules={[{ required: true, message: "Please select an icon" }]}
        >
          <div className="grid grid-cols-4 gap-4 justify-center">
            {iconOptions.map((item) => (
              <motion.div
                key={item.name}
                className={`cursor-pointer p-4 border-2 flex justify-center rounded-xl transition-all duration-300 ease-in-out transform ${
                  selectedIcon === item.name
                    ? "border-blue-500 bg-blue-100 scale-110" // Highlight selected icon
                    : "border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => handleIconClick(item.name)} // Handle icon selection
              >
                {item.icon}
              </motion.div>
            ))}
          </div>
        </Form.Item>

        {/* Submit Button */}
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
