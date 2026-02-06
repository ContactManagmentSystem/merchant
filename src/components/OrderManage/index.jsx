import { Row, Col, Divider } from "antd";
import AcceptPaymentType from "./components/AcceptPaymentType";
import Order from "./components/Order";
import Payment from "./components/Payment";

const OrderManage = () => {
  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen w-full overflow-x-hidden">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-white">
        Order Management
      </h1>

      <Row gutter={[12, 12]} className="sm:!mx-[-12px]">
        {/* Accept Payment & Payment Side by Side */}
        <Col xs={24} sm={24} md={12}>
          <AcceptPaymentType />
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Payment />
        </Col>
      </Row>

      <Divider className="my-4 sm:my-6 md:my-8" />

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
