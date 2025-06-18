/* eslint-disable react/prop-types */
import { Modal, Input, Typography, message } from "antd";

const { Text } = Typography;

const AcceptedModal = ({
  open,
  onClose,
  onSubmit,
  orderCode,
  setOrderCode,
}) => {
  return (
    <Modal
      title="Provide Order Code"
      open={open}
      onCancel={onClose}
      onOk={() => {
        if (!orderCode.trim()) {
          message.warning("Order Code is required.");
          return;
        }
        onSubmit(orderCode);
      }}
      okText="Submit"
      cancelText="Cancel"
    >
      <Text>Enter a unique order code:</Text>
      <Input
        value={orderCode}
        onChange={(e) => setOrderCode(e.target.value)}
        placeholder="e.g. ORD1234567"
        style={{ marginTop: 8 }}
      />
    </Modal>
  );
};

export default AcceptedModal;
