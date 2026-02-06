/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { HexColorPicker } from "react-colorful";
import imageCompression from "browser-image-compression";

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
console.log(landing)
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (landing) {
          const initialColor = landing?.colourCode || "#000000";
          form.setFieldsValue({
            storeName: landing?.storeName || "",
            colourCode: initialColor,
            currency: landing?.currency || "",
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
            currency: "",
          });
          setColour("#000000");
          setFileList([]);
          setHeroFileList([]);
          setDeletedHeroImages([]);
        }
      }, 0);
    }
  }, [open, landing, form, setFileList, setHeroFileList]);

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
        console.log(err)
        message.error("Compression failed.");
        return file;
      }
    }
    return file;
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
          const convertedDataUrl = canvas.toDataURL("image/png"); // Change to image/jpeg for JPEG
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

  const handleMainImageChange = async ({ fileList: newList }) => {
    const latest = newList.slice(-1)[0];
    if (!latest?.originFileObj) {
      setFileList(newList);
      return;
    }

    let file = latest.originFileObj;
    file = await convertToImage(file); // Convert to PNG/JPEG if necessary
    const compressed = await compressIfLarge(file);
    compressed.preview = URL.createObjectURL(compressed);

    setFileList([
      {
        ...latest,
        originFileObj: compressed,
        name: compressed.name,
        preview: compressed.preview,
      },
    ]);
  };

  const handleHeroImageChange = async ({ fileList: newList, file }) => {
    const removed = heroFileList.find((f) => f.uid === file.uid);
    if (removed?.isExisting && !newList.find((f) => f.uid === file.uid)) {
      setDeletedHeroImages((prev) => [...prev, removed.url]);
    }

    const compressedList = await Promise.all(
      newList.map(async (f) => {
        if (f.originFileObj) {
          let file = f.originFileObj;
          file = await convertToImage(file); // Convert to PNG/JPEG if necessary
          const compressed = await compressIfLarge(file);
          compressed.preview = URL.createObjectURL(compressed);
          return {
            ...f,
            originFileObj: compressed,
            name: compressed.name,
            preview: compressed.preview,
          };
        }
        return f;
      })
    );

    setHeroFileList(compressedList);
  };

  const handleFinish = (values) => {
    console.log(values)
    const formData = new FormData();
    formData.append("storeName", values.storeName);
    formData.append("colourCode", values.colourCode);
    formData.append("currency", values.currency || "");

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

    const config = {
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total);
        message.open({
          key: "landing-upload",
          type: "loading",
          content: `Uploading... ${percent}%`,
          duration: 0,
        });
      },
    };

    onSubmit(formData, config);
  };

  return (
    <Modal
      open={open}
      title={landing ? "Edit Landing" : "Create Landing"}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={landing ? "Update" : "Create"}
      width="95%"
      style={{ maxWidth: 600 }}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="storeName"
          label="Store Name"
          rules={[{ required: true, message: "Store name is required" }]}
        >
          <Input placeholder="Enter store name" />
        </Form.Item>

        <Form.Item
          name="colourCode"
          label="Primary Colour Code"
          rules={[
            { required: true, message: "Colour code is required" },
            {
              pattern: /^#([0-9A-F]{3}){1,2}$/i,
              message: "Enter a valid hex color (e.g., #000000)",
            },
          ]}
        >
          <Input
            value={colour}
            onChange={(e) => {
              const newColor = e.target.value.toUpperCase();
              setColour(newColor);
              form.setFieldsValue({ colourCode: newColor });
            }}
            placeholder="#000000"
          />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: 8 }}>
            Pick Color Visually
          </label>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <HexColorPicker
              color={colour}
              onChange={(newColor) => {
                const upperColor = newColor.toUpperCase();
                setColour(upperColor);
                form.setFieldsValue({ colourCode: upperColor });
              }}
              style={{ width: "100%", maxWidth: "250px" }}
            />
          </div>
        </div>

        <Form.Item
          label="Currency (e.g., MMK, USD)"
          name="currency"
          rules={[{ required: true, message: "Currency is required" }]}
        >
          <Input placeholder="Enter currency symbol or code" />
        </Form.Item>

        <Form.Item
          label="Main Landing Image"
          required={!landing}
          help={!landing ? "Image is required" : ""}
        >
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleMainImageChange}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>

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
