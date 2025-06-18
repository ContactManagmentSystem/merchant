/* eslint-disable react/prop-types */
import { Modal, Typography, message } from "antd";

const { Text } = Typography;

const DeclinedModal = ({ open, onClose, onSubmit, reason, setReason }) => {
  return (
    <Modal
      title="Provide Reason for Decline"
      open={open}
      onCancel={onClose}
      onOk={() => {
        if (!reason.trim()) {
          message.warning("Please provide a reason.");
          return;
        }
        onSubmit(reason);
      }}
      okText="Submit"
      cancelText="Cancel"
    >
      <Text type="secondary">Why is this order declined?</Text>
            <textarea
                 className="border rounded"
        rows={4}
        style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4 }}
        placeholder="Enter reason here..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
};

export default DeclinedModal;
