/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button, List, message, Tooltip, Form, Card } from "antd";
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
import SocialLinkModal from "./SocialLinkModal";

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

    if (redirectType === "email") finalLink = `mailto:${link}`;
    if (redirectType === "phone") finalLink = `tel:${link}`;

    const payload = { name, link: finalLink, icon };

    const onSuccess = () => {
      message.success(editingItem ? "Link updated" : "Link added");
      setModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      refetch();
    };

    const onError = () => message.error("Operation failed");

    if (editingItem) {
      editSocialLink.mutate(
        { socialLinkId: editingItem._id, socialLinkData: payload },
        { onSuccess, onError }
      );
    } else {
      createSocialLink.mutate(payload, { onSuccess, onError });
    }
  };

  return (
    <Card
      title="Social Media Links"
      extra={
        <div className="flex gap-2">
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={refetch} />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add New
          </Button>
        </div>
      }
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "24px",
      }}
    >
      <List
        loading={isLoading}
        dataSource={data?.data || []}
        bordered
        locale={{ emptyText: "No social links added yet." }}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor: "#fafafa",
              borderRadius: "8px",
              marginBottom: "12px",
              padding: "16px",
            }}
            actions={[
              <Tooltip title="Edit">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(item)}
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() =>
                    deleteSocialLink.mutate(item._id, {
                      onSuccess: () => {
                        message.success("Link deleted");
                        refetch();
                      },
                      onError: () => message.error("Delete failed"),
                    })
                  }
                />
              </Tooltip>,
            ]}
          >
            <div>
              <strong>{item.name}</strong>
              <p style={{ margin: "4px 0", color: "#555" }}>{item.link}</p>
              <small style={{ color: "#999" }}>Icon: {item.icon}</small>
            </div>
          </List.Item>
        )}
      />

      {/* Modal Component */}
      <SocialLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        onSubmit={handleSubmit}
        isEditing={!!editingItem}
      />
    </Card>
  );
};

export default SocialLinkManager;
