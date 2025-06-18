/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Button,
  List,
  message,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useGetSocialLinks,
  useCreateSocialLink,
  useDeleteSocialLink,
  useEditSocialLink,
} from "../../../api/hooks/useService";

const { Option } = Select;

const SocialLinkManager = ({ landingId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useGetSocialLinks(landingId);
  const createSocialLink = useCreateSocialLink(landingId);
  const deleteSocialLink = useDeleteSocialLink(landingId);
  const editSocialLink = useEditSocialLink(landingId);

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    form.setFieldsValue({
      name: item.name,
      link: item.link.replace(/^mailto:|tel:/, ""),
      icon: item.icon,
      redirectType: item.link.startsWith("mailto:")
        ? "email"
        : item.link.startsWith("tel:")
        ? "phone"
        : "url",
    });
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSubmit = (values) => {
    const { name, link, icon, redirectType } = values;
    let finalLink = link;

    if (redirectType === "email" && !link.startsWith("mailto:")) {
      finalLink = `mailto:${link}`;
    } else if (redirectType === "phone" && !link.startsWith("tel:")) {
      finalLink = `tel:${link}`;
    }

    const payload = {
      name,
      link: finalLink,
      icon,
    };

    if (editingItem) {
      editSocialLink.mutate(
        { socialLinkId: editingItem._id, socialLinkData: payload },
        {
          onSuccess: () => {
            message.success("Social link updated");
            setModalOpen(false);
            setEditingItem(null);
            refetch();
          },
          onError: () => {
            message.error("Update failed");
          },
        }
      );
    } else {
      createSocialLink.mutate(payload, {
        onSuccess: () => {
          message.success("Social link added successfully");
          setModalOpen(false);
          form.resetFields();
          refetch();
        },
        onError: () => {
          message.error("Failed to add social link");
        },
      });
    }
  };

  const handleDelete = (id) => {
    deleteSocialLink.mutate(id, {
      onSuccess: () => {
        message.success("Link deleted");
        refetch();
      },
      onError: () => {
        message.error("Failed to delete");
      },
    });
  };

  useEffect(() => {
    if (!modalOpen) {
      form.resetFields();
      setEditingItem(null);
    }
  }, [modalOpen]);

  return (
    <div className="bg-neutral-900 text-white p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold tracking-wide">Social Media Links</h3>
        <div className="flex gap-2">
          <Tooltip title="Refresh list">
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add New
          </Button>
        </div>
      </div>

      <List
        loading={isLoading}
        dataSource={data?.data || []}
        locale={{ emptyText: "No social links added yet." }}
        className=" "
        renderItem={(item) => (
          <List.Item
            className="!bg-white rounded-lg p-3 m-2 flex flex-col md:flex-row md:justify-between md:items-center shadow-sm border border-gray-200"
            actions={[
              <Tooltip title="Edit this link" key="edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(item)}
                />
              </Tooltip>,
              <Tooltip title="Delete this link" key="delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item._id)}
                />
              </Tooltip>,
            ]}
          >
            <div className="flex flex-col gap-1 p-3">
              <p className="text-lg font-semibold text-gray-900">{item.name}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {item.link}
              </a>
              <p className="text-sm text-gray-500">Icon: {item.icon}</p>
            </div>
          </List.Item>
        )}
      />

      {/* Modal Form */}
      <Modal
        open={modalOpen}
        title={
          <span className="text-lg font-semibold">
            {editingItem ? "Edit Social Media Link" : "Add Social Media Link"}
          </span>
        }
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            initialValue="url"
          >
            <Select>
              <Option value="url">Website URL (https://...)</Option>
              <Option value="email">Email (support@example.com)</Option>
              <Option value="phone">Phone (+95912345678)</Option>
            </Select>
          </Form.Item>

          {/* Dynamic Link Input */}
          <Form.Item
            shouldUpdate={(prev, curr) =>
              prev.redirectType !== curr.redirectType
            }
          >
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
                    rules={[
                      { required: true, message: "Please enter the link" },
                    ]}
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
            <Input placeholder="e.g., TelegramIcon, FacebookIcon, WhatsAppIcon" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={createSocialLink.isLoading || editSocialLink.isLoading}
            >
              {editingItem ? "Update Link" : "Add Link"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SocialLinkManager;
