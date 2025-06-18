import { useState } from "react";
import {
  Table,
  Tag,
  Select,
  Popconfirm,
  message,
  Typography,
  Card,
  Tooltip,
  Space,
  Modal,
  Image,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  useUpdateOrder,
  useGetOrders,
  useDeleteOrder,
} from "../../../api/hooks/useOrder";
import DeclinedModal from "./DeclinedModal";
import AcceptedModal from "./AcceptedModal";

const { Title, Text } = Typography;
const { Option } = Select;

const progressColors = {
  pending: "orange",
  accepted: "blue",
  declined: "red",
  done: "green",
};

const Order = () => {
  const { data: orders, isLoading } = useGetOrders();
  const deleteOrder = useDeleteOrder();
  const updateOrder = useUpdateOrder();
  console.log(orders)

  const [updatingId, setUpdatingId] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [isAcceptedModalVisible, setIsAcceptedModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [orderCodeInput, setOrderCodeInput] = useState("");

  const handleProgressChange = (id, value) => {
    setCurrentOrderId(id);
    setSelectedProgress(value);

    if (value === "declined") {
      setIsReasonModalVisible(true);
    } else if (value === "accepted" || value === "done") {
      setIsAcceptedModalVisible(true);
    } else {
      submitProgressChange(id, value);
    }
  };

  const submitProgressChange = async (id, progress, reasonOrCode = "") => {
    try {
      setUpdatingId(id);
      const orderData = { progress };

      if (progress === "declined") orderData.reason = reasonOrCode;
      if (progress === "accepted" || progress === "done")
        orderData.orderCode = reasonOrCode;

      await updateOrder.mutateAsync({ orderId: id, orderData });
      message.success("Order updated.");
    } catch {
      message.error("Failed to update order.");
    } finally {
      setUpdatingId(null);
      setIsReasonModalVisible(false);
      setIsAcceptedModalVisible(false);
      setReasonText("");
      setOrderCodeInput("");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder.mutateAsync(id);
      message.success("Order deleted.");
    } catch {
      message.error("Failed to delete order.");
    }
  };

  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      render: (code, record) => {
        const needsCode = ["accepted", "done", "pending", "declined"].includes(
          record.progress
        );
        const displayCode = needsCode && !code ? "No Order Code" : code;
        return (
          <Text
            code
            style={{
              fontSize: 16,
              color: !code && needsCode ? "red" : undefined,
            }}
          >
            {displayCode}
          </Text>
        );
      },
    },
    {
      title: "Products (Count & Total)",
      dataIndex: "products",
      render: (products) => (
        <Space direction="vertical">
          <Text strong>Total Items: {products.length}</Text>
          {products.map((item, idx) => {
            const name = item.productId?.name || "Unknown";
            const price = item.productId?.price || 0;
            const discount = item.productId?.discountPrice || 0;
            const sellingPrice = price - discount;
            const total = sellingPrice * item.quantity;

            return (
              <Text key={idx}>
                • <strong>{name}</strong> × {item.quantity} = Ks{" "}
                {total.toLocaleString()}
              </Text>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (value) => (
        <Text strong style={{ color: "#1890ff" }}>
          Ks {value.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Contact",
      render: (_, record) => (
        <Space direction="vertical">
          <Text>{record.phonePrimary}</Text>
          {record.phoneSecondary && (
            <Text type="secondary">{record.phoneSecondary}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 180 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Payment",
      render: (_, record) => (
        <Space direction="vertical">
          <Tag color={record.paymentType === "COD" ? "default" : "cyan"}>
            {record.paymentType}
          </Tag>
          {record.paymentType === "Prepaid" && record.transactionScreenshot && (
            <Tooltip title="View Screenshot">
              <Image
                src={record.transactionScreenshot}
                width={60}
                height={60}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #eee",
                }}
                preview={false}
                alt="Screenshot"
                onClick={() => {
                  setPreviewSrc(record.transactionScreenshot);
                  setPreviewVisible(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      render: (progress, record) => (
        <Select
          value={progress}
          size="middle"
          variant="borderless"
          loading={updatingId === record._id}
          onChange={(value) => handleProgressChange(record._id, value)}
          style={{
            width: 160,
            borderRadius: 8,
            background: "#f4f4f5",
            fontWeight: 500,
          }}
          dropdownStyle={{ borderRadius: 8 }}
        >
          {Object.keys(progressColors).map((status) => (
            <Option key={status} value={status}>
              <Tag
                color={progressColors[status]}
                style={{
                  paddingInline: 12,
                  borderRadius: 16,
                  fontSize: 13,
                  textTransform: "capitalize",
                }}
              >
                {status}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      render: (reason, record) => {
        const showSet = record.progress === "declined" && !reason;
        return (
          <Text
            type={showSet ? "warning" : "danger"}
            italic={showSet || Boolean(reason)}
            style={showSet ? { color: "#fa8c16" } : {}}
          >
            {showSet ? "Set Reason" : reason || "–"}
          </Text>
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this order?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Order">
            <DeleteOutlined
              style={{ color: "red", fontSize: 16, cursor: "pointer" }}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Card bordered={false} style={{ background: "#ffffff" }}>
        <Title level={3} className="mb-6 text-center">
          🧾 Orders Overview
        </Title>

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={orders?.data || []}
          loading={isLoading}
          bordered
          pagination={{ pageSize: 6 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        centered
      >
        <img
          alt="Transaction Screenshot"
          style={{ width: "100%", borderRadius: 8 }}
          src={previewSrc}
        />
      </Modal>

      <DeclinedModal
        open={isReasonModalVisible}
        onClose={() => {
          setIsReasonModalVisible(false);
          setReasonText("");
        }}
        reason={reasonText}
        setReason={setReasonText}
        onSubmit={(reason) =>
          submitProgressChange(currentOrderId, selectedProgress, reason)
        }
      />

      <AcceptedModal
        open={isAcceptedModalVisible}
        onClose={() => {
          setIsAcceptedModalVisible(false);
          setOrderCodeInput("");
        }}
        orderCode={orderCodeInput}
        setOrderCode={setOrderCodeInput}
        onSubmit={(code) =>
          submitProgressChange(currentOrderId, selectedProgress, code)
        }
      />
    </div>
  );
};

export default Order;
