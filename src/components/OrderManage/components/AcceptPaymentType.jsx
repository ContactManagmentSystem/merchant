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
      title="Accept Payment Types"
      bordered
      className="max-w-xl mx-auto mt-6"
      style={{ borderRadius: 10 }}
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Alert message="Failed to load landing data." type="error" showIcon />
      ) : (
        <>
          <Checkbox.Group
            options={paymentOptions}
            value={selectedTypes}
            onChange={handleChange}
            className="mb-4 block"
          />

          <Button
            type="primary"
            loading={isPending}
            onClick={handleSubmit}
            block
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>

          {message && (
            <Alert message={message} type={status} showIcon className="mt-4" />
          )}
        </>
      )}
    </Card>
  );
};

export default AcceptPaymentType;
