import { Row, Col, Divider } from "antd";
import AcceptPaymentType from "./components/AcceptPaymentType";
import Order from "./components/Order";
import Payment from "./components/Payment";

const OrderManage = () => {
  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Order Management
      </h1>

      <Row gutter={[24, 24]}>
        {/* Accept Payment & Payment Side by Side */}
        <Col xs={24} md={12}>
          <AcceptPaymentType />
        </Col>
        <Col xs={24} md={12}>
          <Payment />
        </Col>
      </Row>

      <Divider className="my-8" />

      {/* Order Full Width Below */}
      <Row>
        <Col span={24}>
          <Order />
        </Col>
      </Row>
    </div>
  );
};

export default OrderManage;
