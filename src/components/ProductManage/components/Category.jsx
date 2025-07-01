import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Tag,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import {
  useGetCategory,
  useCreateCategory,
  useEditCategory,
  useDeleteCategory,
} from "../../../api/hooks/useService";

const pageSizeOptions = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

const Category = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useGetCategory(1, pageSize);
  const createCategory = useCreateCategory();
  const editCategory = useEditCategory();
  const deleteCategory = useDeleteCategory();

  const categories = data?.data || [];

  const showAddModal = () => {
    setEditingCategory(null);
    setFileList([]);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setFileList([
      {
        uid: "1",
        name: "image",
        url: category.image,
        status: "done",
      },
    ]);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    deleteCategory.mutate(id, {
      onSuccess: () => message.success("Category deleted"),
    });
  };

  // Convert to PNG/JPEG if the file is not PNG or JPEG
  const convertToImage = (file) => {
    return new Promise((resolve, reject) => {
      if (["image/jpeg", "image/png"].includes(file.type)) {
        resolve(file); // Already a valid image
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Convert to PNG or JPEG
          const convertedDataUrl = canvas.toDataURL("image/png"); // Change to image/jpeg for JPEG conversion
          const response = await fetch(convertedDataUrl);
          const blob = await response.blob();

          const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".png"), {
            type: "image/png",
          });

          resolve(convertedFile);
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const compressIfLarge = async (file) => {
    if (file.size > 500 * 1024) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
        message.success(`${file.name} compressed.`);
        return compressed;
      } catch (err) {
        console.error("Compression failed", err);
        message.warning("Compression failed. Uploading original.");
        return file;
      }
    }
    return file;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);

      if (fileList[0]?.originFileObj) {
        const originalFile = fileList[0].originFileObj;

        let finalFile = originalFile;

        // Convert to PNG/JPEG if necessary
        finalFile = await convertToImage(finalFile);

        // Compress the image if it's large
        finalFile = await compressIfLarge(finalFile);

        formData.append("categoryImage", finalFile);
      }

      const config = {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          message.open({
            key: "upload",
            type: "loading",
            content: `Uploading... ${percent}%`,
            duration: 0,
          });
        },
      };

      setUploading(true);

      const successHandler = (msg) => {
        message.destroy("upload");
        message.success(msg);
        setModalVisible(false);
        setUploading(false);
      };

      const errorHandler = () => {
        message.destroy("upload");
        setUploading(false);
      };

      if (editingCategory) {
        editCategory.mutate(
          {
            categoryId: editingCategory._id,
            categoryData: formData,
            config,
          },
          {
            onSuccess: () => successHandler("Category updated"),
            onError: errorHandler,
          }
        );
      } else {
        createCategory.mutate(
          { data: formData, config },
          {
            onSuccess: () => successHandler("Category created"),
            onError: errorHandler,
          }
        );
      }
    } catch (err) {
      console.error(err);
      message.destroy("upload");
      setUploading(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      responsive: ["xs", "sm", "md", "lg"],
      render: (url) => (
        <img
          src={url}
          alt="category"
          width="60"
          height="60"
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => showEditModal(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold">
            All Categories <Tag color="blue">{categories.length}</Tag>
          </h2>
          <Select
            value={pageSize}
            onChange={setPageSize}
            options={pageSizeOptions}
            style={{ width: 100 }}
          />
        </div>
        <Button type="primary" onClick={showAddModal}>
          Add Category
        </Button>
      </div>
      <div className="w-full min-w-[600px] overflow-x-auto">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
        />
      </div>
      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText={editingCategory ? "Update" : "Create"}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Category;
