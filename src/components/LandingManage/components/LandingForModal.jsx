/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { HexColorPicker } from "react-colorful";

const LandingFormModal = ({
  open,
  onClose,
  onSubmit,
  landing,
  form,
  fileList,
  setFileList,
  heroFileList,
  setHeroFileList,
}) => {
  const [deletedHeroImages, setDeletedHeroImages] = useState([]);
  const [colour, setColour] = useState("#000000");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (landing) {
          const initialColor = landing?.colourCode || "#000000";
          form.setFieldsValue({
            storeName: landing?.storeName || "",
            colourCode: initialColor,
          });
          setColour(initialColor);

          setFileList([
            {
              uid: "-1",
              name: "Current Image",
              status: "done",
              url: landing.image,
            },
          ]);

          setHeroFileList(
            landing.heroImage?.map((url, index) => ({
              uid: `hero-${index}`,
              name: `Hero Image ${index + 1}`,
              status: "done",
              url,
              isExisting: true,
            })) || []
          );

          setDeletedHeroImages([]);
        } else {
          form.setFieldsValue({
            storeName: "",
            colourCode: "#000000",
          });
          setColour("#000000");
          setFileList([]);
          setHeroFileList([]);
          setDeletedHeroImages([]);
        }
      }, 0);
    }
  }, [open, landing, form, setFileList, setHeroFileList]);

  const handleHeroImageChange = ({ fileList: newList, file }) => {
    const removed = heroFileList.find((f) => f.uid === file.uid);
    if (removed?.isExisting && !newList.find((f) => f.uid === file.uid)) {
      setDeletedHeroImages((prev) => [...prev, removed.url]);
    }
    setHeroFileList(newList);
  };

  const handleFinish = (values) => {
    const formData = new FormData();
    formData.append("storeName", values.storeName);
    formData.append("colourCode", values.colourCode);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    heroFileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("heroImage", file.originFileObj);
      }
    });

    if (deletedHeroImages.length > 0) {
      formData.append("deletedHeroImages", JSON.stringify(deletedHeroImages));
    }

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      title={landing ? "Edit Landing" : "Create Landing"}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={landing ? "Update" : "Create"}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Store Name */}
        <Form.Item
          name="storeName"
          label="Store Name"
          rules={[{ required: true, message: "Store name is required" }]}
        >
          <Input placeholder="Enter store name" />
        </Form.Item>

        {/* Colour Picker */}
        <Form.Item
          label="Primary Colour Code"
          name="colourCode"
          rules={[
            { required: true, message: "Colour code is required" },
            {
              pattern: /^#([0-9A-F]{3}){1,2}$/i,
              message: "Enter a valid hex color (e.g., #000000)",
            },
          ]}
        >
          <>
            <HexColorPicker
              color={colour}
              onChange={(newColor) => {
                const upperColor = newColor.toUpperCase();
                setColour(upperColor);
                form.setFieldsValue({ colourCode: upperColor });
              }}
            />
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, setFieldsValue }) => (
                <Input
                  className="mt-2"
                  value={getFieldValue("colourCode")}
                  onChange={(e) => {
                    const newColor = e.target.value.toUpperCase();
                    setColour(newColor);
                    setFieldsValue({ colourCode: newColor });
                  }}
                  placeholder="#000000"
                />
              )}
            </Form.Item>
          </>
        </Form.Item>

        {/* Main Image Upload */}
        <Form.Item
          label="Main Landing Image"
          required={!landing}
          help={!landing ? "Image is required" : ""}
        >
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>

        {/* Hero Images Upload */}
        <Form.Item label="Hero Banner Images (multiple)">
          <Upload
            listType="picture"
            fileList={heroFileList}
            onChange={handleHeroImageChange}
            beforeUpload={() => false}
            multiple
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Select Hero Images</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LandingFormModal;
