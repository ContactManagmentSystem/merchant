import { useState } from "react";
import { Button, message, Alert, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useGetLanding,
  useCreateLanding,
  useEditLanding,
} from "../../api/hooks/useService";
import LandingFormModal from "./components/LandingForModal";
import SocialLinkManager from "./components/SocialLinkManager";

const LandingManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [heroFileList, setHeroFileList] = useState([]);

  const { data: landingData, isLoading, isError, error } = useGetLanding();
  const createLanding = useCreateLanding();
  const editLanding = useEditLanding();

  const landing = landingData?.data || null;
  console.log(landing)

  const handleSubmit = (formData) => {
    const onSuccess = () => {
      message.success(landing ? "Landing updated." : "Landing created.");
      setModalVisible(false);
    };

    const onError = () => {
      message.error("Error saving landing.");
    };

    if (landing) {
      editLanding.mutate(
        { landingId: landing._id, landingData: formData },
        { onSuccess, onError }
      );
    } else {
      createLanding.mutate(formData, { onSuccess, onError });
    }
  };

  return (
    <div className="p-6 bg-neutral-900 rounded shadow-lg max-w-5xl mx-auto mt-10 text-white">
      <div className="flex justify-between items-center mb-6">
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
          className="mb-4"
        />
      ) : landing ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="font-semibold text-gray-300">Store Name:</p>
                <div className="main-font text-white font-semibold break-words">
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

              <div className="mt-4">
                <p className="font-semibold text-gray-300">Currency:</p>
                <div className="text-white">
                  {landing.currency || "Not set"}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold text-gray-300">
                Main Landing Image:
              </p>
              <img
                src={landing.image}
                alt="Landing Preview"
                className="w-full rounded-lg shadow-md border object-cover max-h-72"
              />
            </div>
          </div>

          {landing.heroImage?.length > 0 && (
            <div>
              <p className="font-semibold text-gray-300 mb-2 text-lg">
                Hero Banner Images:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          className="mb-4"
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
      <SocialLinkManager landingId={landing?._id}/>
    </div>
  );
};

export default LandingManagement;
