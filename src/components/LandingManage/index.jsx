import { useState, useEffect } from "react";
import { Button, message, Alert, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetLanding,
  useCreateLanding,
  useEditLanding,
} from "../../api/hooks/useService";
import LandingFormModal from "./components/LandingForModal";
import SocialLinkManager from "./components/SocialLinkManager";
import useUserStore from "../../store/userStore";

const LandingManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [heroFileList, setHeroFileList] = useState([]);

  const { data: landingData, isLoading, isError, error } = useGetLanding();
  const createLanding = useCreateLanding();
  const editLanding = useEditLanding();
  const landing = landingData?.data || null;

  const setCurrency = useUserStore((state) => state.setCurrency);

  useEffect(() => {
    if (landing?.currency) {
      setCurrency(landing.currency);
    }
  }, [landing, setCurrency]);

  const handleSubmit = (formData, config) => {
    const onSuccess = () => {
      message.destroy("landing-upload");
      message.success(landing ? "Landing updated." : "Landing created.");
      setModalVisible(false);
    };

    const onError = () => {
      message.destroy("landing-upload");
      message.error("Error saving landing.");
    };

    const finalConfig = {
      ...config,
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

    if (landing) {
      editLanding.mutate(
        { landingId: landing._id, landingData: formData, config: finalConfig },
        { onSuccess, onError }
      );
    } else {
      createLanding.mutate(
        { data: formData, config: finalConfig },
        { onSuccess, onError }
      );
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-neutral-900 rounded shadow-lg max-w-6xl mx-auto mt-10 text-white space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Landing Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          {landing ? "Edit Landing" : "Create Landing"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading landing info...</p>
      ) : isError ? (
        <Alert
          message="Landing not found"
          description={
            error?.response?.data?.message || "Landing hasn't been created yet."
          }
          type="warning"
          showIcon
        />
      ) : landing ? (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-300">Store Name:</p>
                <div className="text-white font-semibold break-words">
                  {landing.storeName}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-300">Colour Code:</p>
                <span
                  className="inline-block mt-1 px-3 py-1 rounded shadow-md border"
                  style={{ backgroundColor: landing.colourCode, color: "#fff" }}
                >
                  {landing.colourCode}
                </span>
              </div>

              <div>
                <p className="font-semibold text-gray-300">Currency:</p>
                <div className="text-white">
                  {landing.currency || "Not set"}
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-300 mb-2">
                Main Landing Image:
              </p>
              <img
                src={landing.image}
                alt="Landing Preview"
                className="w-full max-h-72 rounded-lg shadow-md border object-cover"
              />
            </div>
          </div>

          {landing.heroImage?.length > 0 && (
            <div>
              <p className="font-semibold text-gray-300 mb-2 text-lg">
                Hero Banner Images:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {landing.heroImage.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Hero Image ${idx + 1}`}
                    className="rounded-lg border shadow-sm object-cover w-full h-40"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Alert
          message="No Landing Found"
          description="You haven't created a landing page yet. Click the 'Create Landing' button to get started."
          type="info"
          showIcon
        />
      )}

      <LandingFormModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        landing={landing}
        form={form}
        fileList={fileList}
        setFileList={setFileList}
        heroFileList={heroFileList}
        setHeroFileList={setHeroFileList}
      />

      <SocialLinkManager landingId={landing?._id} />
    </div>
  );
};

export default LandingManagement;
