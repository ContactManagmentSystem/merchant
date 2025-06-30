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

  // Open the modal for creating a new link
  const openCreateModal = () => {
    setEditingItem(null);  // No item to edit, so reset editing state
    form.resetFields();    // Reset form fields
    setModalOpen(true);     // Open the modal for adding a new social link
  };

  // Open the modal for editing an existing link
  const openEditModal = (item) => {
    // Pre-fill form with the existing data when editing
    console.log(item)
    form.setFieldsValue({
      name: item.name,
      link: item.link.replace(/^mailto:|tel:/, ""),
      icon: item.icon,
      redirectType: item.link.startsWith("mailto:")
        ? "email"
        : item.link.startsWith("tel:")
        ? "phone"
        : "url",  // Automatically detect the link type
    });

    setEditingItem(item);  // Store the item being edited
    setModalOpen(true);     // Open the modal for editing
  };

  // Handle deleting a social link
  const handleDelete = async (id) => {
    try {
      await deleteSocialLink.mutateAsync(id);  // Call API to delete the link
      message.success("Link deleted");  // Show success message
      refetch();  // Refresh the list
    } catch (error) {
      message.error("Delete failed");  // Show error message
      console.error("Delete failed: ", error);
    }
  };

  // Handle form submission (for both create and edit)
  const handleSubmit = async (values) => {
    const { name, link, icon, redirectType } = values;
    let finalLink = link;

    // Prepend the appropriate scheme to the link based on the redirect type
    if (redirectType === "email") finalLink = `mailto:${link}`;
    if (redirectType === "phone") finalLink = `tel:${link}`;

    const payload = { name, link: finalLink, icon };

    try {
      if (editingItem) {
        // If we are editing an existing link, call the edit API
        await editSocialLink.mutateAsync({
          socialLinkId: editingItem._id,
          socialLinkData: payload,
        });
        message.success("Link updated");
      } else {
        // If we are creating a new link, call the create API
        createSocialLink.mutate({ data: payload });
        message.success("Link added");
      }
      setModalOpen(false);   // Close the modal after successful submission
      form.resetFields();    // Reset the form for next use
      setEditingItem(null);   // Clear the editing state
      refetch();             // Refresh the list of social links
    } catch (error) {
      message.error("Operation failed");  // Show error message
      console.error("Submit error: ", error);
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
                  onClick={() => openEditModal(item)}  // Open the edit modal
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(item._id)}  // Delete the social link
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
        onClose={() => setModalOpen(false)}  // Close the modal
        form={form}  // Pass the form to the modal
        onSubmit={handleSubmit}  // Handle form submission
        isEditing={!!editingItem}  // Check if we're editing an existing item
      />
    </Card>
  );
};

export default SocialLinkManager;
