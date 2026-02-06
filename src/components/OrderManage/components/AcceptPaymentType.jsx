import { useEffect, useState } from "react";
import { useUpdateLandingPaymentTypes } from "../../../api/hooks/useOrder";
import { useGetLanding } from "../../../api/hooks/useService";
import { Card, Checkbox, Button, Alert, Spin } from "antd";

const AcceptPaymentType = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null); // "success" | "error"

  const paymentOptions = ["COD", "Prepaid"];

  const { data: landingData, isLoading, isError } = useGetLanding();
  const { mutate: updatePaymentTypes, isPending } =
    useUpdateLandingPaymentTypes();
  // console.log(landingData);
  useEffect(() => {
    if (landingData?.data?.acceptPaymentTypes?.length) {
      setSelectedTypes(landingData?.data.acceptPaymentTypes);
    }
  }, [landingData]);

  const handleChange = (checkedValues) => {
    setSelectedTypes(checkedValues);
  };

  const handleSubmit = () => {
    updatePaymentTypes(selectedTypes, {
      onSuccess: () => {
        setMessage("Payment types updated successfully.");
        setStatus("success");
      },
      onError: (error) => {
        setMessage(
          error?.response?.data?.message || "Failed to update payment types."
        );
        setStatus("error");
      },
    });
  };

  return (
    <Card
      title={<span className="text-sm sm:text-base">Accept Payment Types</span>}
      bordered
      className="max-w-xl mx-auto mt-3 sm:mt-6 w-full"
      style={{ borderRadius: 10 }}
    >
      {isLoading ? (
        <div className="flex justify-center py-4 sm:py-6">
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Alert message="Failed to load landing data." type="error" showIcon className="text-xs sm:text-sm" />
      ) : (
        <>
          <Checkbox.Group
            options={paymentOptions}
            value={selectedTypes}
            onChange={handleChange}
            className="mb-3 sm:mb-4 block text-xs sm:text-sm"
          />

          <Button
            type="primary"
            loading={isPending}
            onClick={handleSubmit}
            block
            size="small"
            className="text-xs sm:text-sm"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>

          {message && (
            <Alert message={message} type={status} showIcon className="mt-3 sm:mt-4 text-xs sm:text-sm" />
          )}
        </>
      )}
    </Card>
  );
};

export default AcceptPaymentType;
