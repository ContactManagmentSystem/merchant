/* eslint-disable react/prop-types */
import {
  Form,
  Input,
  Select as AntSelect,
  Upload,
  Button,
  message,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  useEditProduct,
  useCreateProduct,
} from "../../../api/hooks/useProdPkg";
import { useGetCategory } from "../../../api/hooks/useService";

const ProductForm = ({
  modalType,
  editingProduct,
  fileList,
  setFileList,
  setModalVisible,
}) => {
  const [form] = Form.useForm();
  const editProduct = useEditProduct();
  const addProduct = useCreateProduct();
  const { data: categoryData } = useGetCategory(1, 100);
  const [deletedImages, setDeletedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (modalType === "edit" && editingProduct) {
      form.setFieldsValue({
        name: editingProduct.name,
        discountPrice: editingProduct.discountPrice,
        salePrice: editingProduct.price,
        stockCount: editingProduct.stockCount,
        description: editingProduct.description,
        categoryId: editingProduct.category?._id || "",
      });

      setFileList(
        editingProduct.images.map((url, index) => ({
          uid: index,
          name: `image-${index}`,
          url,
          status: "done",
        }))
      );
    } else {
      form.setFieldsValue({ discountPrice: 0 });
      form.resetFields();
      setFileList([]);
      setDeletedImages([]);
    }
  }, [modalType, editingProduct, form, setFileList]);

  const compressIfLarge = async (file) => {
    if (file.size > 500 * 1024) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
        message.success(`${file.name} compressed.`);
        return compressed;
      } catch (err) {
        console.error("Compression failed", err);
        message.warning(`Compression failed for ${file.name}`);
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
      formData.append("discountPrice", values.discountPrice);
      formData.append("description", values.description);
      formData.append("category", values.categoryId);
      formData.append("price", values.salePrice);
      formData.append("stockCount", values.stockCount);

      for (const file of fileList) {
        if (file.originFileObj) {
          const finalFile = await compressIfLarge(file.originFileObj);
          formData.append("productImage", finalFile);
        }
      }

      if (deletedImages.length > 0) {
        formData.append("deletedImages", JSON.stringify(deletedImages));
      }

      const config = {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          message.open({
            key: "product-upload",
            type: "loading",
            content: `Uploading... ${percent}%`,
            duration: 0,
          });
        },
      };

      setUploading(true);

      const onSuccess = () => {
        message.destroy("product-upload");
        message.success(
          modalType === "edit"
            ? "Product updated successfully"
            : "Product added successfully"
        );
        setModalVisible(false);
        setUploading(false);
        form.resetFields();
        setFileList([]);
        setDeletedImages([]);
      };

      const onError = (err) => {
        message.destroy("product-upload");
        message.error(`Error: ${err.message}`);
        setUploading(false);
      };

      if (modalType === "edit" && editingProduct) {
        editProduct.mutate(
          {
            productId: editingProduct._id,
            productData: formData,
            config,
          },
          { onSuccess, onError }
        );
      } else {
        addProduct.mutate({ data: formData, config }, { onSuccess, onError });
      }
    } catch (info) {
      console.log(info)
      message.error("Validation Failed");
      setUploading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={{ discountPrice: 0 }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[
              { required: true, message: "Please input the product name!" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <AntSelect placeholder="Select category" optionLabelProp="label">
              {categoryData?.data?.map((cat) => (
                <AntSelect.Option
                  key={cat._id}
                  value={cat._id}
                  label={`${cat.name} - ${cat.description}`}
                >
                  {cat.name} - {cat.description}
                </AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="discountPrice" label="Discount Price">
            <Input type="number" placeholder="1000" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="salePrice"
            label="Sale Price"
            rules={[
              { required: true, message: "Please input the sale price!" },
            ]}
          >
            <Input type="number" placeholder="3000" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="stockCount"
            label="Stock Count"
            rules={[
              { required: true, message: "Please input the stock count!" },
            ]}
          >
            <Input type="number" placeholder="e.g. 20" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please input the description!" }]}
      >
        <Input.TextArea
          placeholder="Write product description here..."
          rows={4}
        />
      </Form.Item>

      <Form.Item label="Product Images">
        <Upload
          listType="picture"
          fileList={fileList}
          onChange={({ fileList: newFileList }) => {
            if (newFileList.length > 5) {
              message.warning("You can upload a maximum of 5 images.");
              return;
            }
            setFileList(newFileList);
          }}
          onRemove={(file) => {
            if (file.url) {
              setDeletedImages((prev) => [...prev, file.url]);
            }
          }}
          beforeUpload={(file, fileListToAdd) => {
            const total = fileList.length + fileListToAdd.length;
            if (total > 5) {
              message.error("You can upload up to 5 images only.");
              return Upload.LIST_IGNORE;
            }
            return false;
          }}
          multiple
        >
          {fileList.length < 5 && (
            <Button icon={<UploadOutlined />}>Upload</Button>
          )}
        </Upload>
        <div style={{ marginTop: "8px", color: "#999" }}>
          You can upload up to 5 product images.
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={uploading}>
          {modalType === "edit" ? "Save Product" : "Add Product"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
