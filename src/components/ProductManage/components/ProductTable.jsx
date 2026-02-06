import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Alert,
  message,
  Select as AntSelect,
  Modal,
  Tag,
  Typography,
} from "antd";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ReactPaginate from "react-paginate";
import { IconDots } from "@tabler/icons-react";
import { useGetProduct, useDeleteProduct } from "../../../api/hooks/useProdPkg";
import { formatDate } from "../../Dashboard/components/Customers";
import Loading from "../../ui/Loading";
import ProductForm from "./ProductForm";

const { Text } = Typography;

const pageSizeOptions = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

const ProductTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("edit");
  const [fileList, setFileList] = useState([]);

  const { data, isLoading, error, isError } = useGetProduct(
    currentPage,
    pageSize
  );
  const deleteProduct = useDeleteProduct();

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const handleDelete = useCallback(
    (productId, productName) => {
      Modal.confirm({
        title: "Delete Product",
        content: `Are you sure you want to delete "${productName || "this product"}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: () => {
          deleteProduct.mutate(productId, {
            onSuccess: () => message.success("Product deleted successfully"),
            onError: (err) => message.error(`Error: ${err.message}`),
          });
        },
      });
    },
    [deleteProduct]
  );

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setModalType("edit");
    setFileList(product.images.map((url, index) => ({ url, uid: index })));
    setModalVisible(true);
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setModalType("add");
    setFileList([]);
    setModalVisible(true);
  };

  const products = data?.data.products || [];
  const totalPages = data?.data.table.totalPages;
  const postLimit = data?.data.table.productPostLimit;
  const postCount = data?.data.table.productPostCount;

  const columns = [
    {
      title: "No.",
      key: "index",
      render: (_, __, index) => index + 1 + (currentPage - 1) * pageSize,
    },
    {
      title: "Info",
      key: "information",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-base">{record.name}</div>
          <div className="text-gray-600 text-sm line-clamp-2 max-w-xs">
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "pricing",
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-red-600">
            Discount: {record.discountPrice} Ks
          </div>
          <div className="text-green-600">Sale: {record.price} Ks</div>
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stockCount",
      key: "stockCount",
      render: (count) =>
        count === 0 ? (
          <Tag color="red">Out of Stock</Tag>
        ) : (
          <Tag color="green">{count} in stock</Tag>
        ),
    },
    {
      title: "Category",
      key: "category",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.category?.name}</strong>
          </div>
          <div className="text-xs text-gray-500">
            {record.category?.description}
          </div>
        </div>
      ),
    },
    {
      title: "Images",
      dataIndex: "images",
      key: "images",
      render: (images) => (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`product-${i}`}
              className="w-[50px] h-[50px] object-cover rounded"
            />
          ))}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Tippy
          className="bg-white border shadow"
          appendTo={() => document.body}
          content={
            <div className="p-2">
              <div
                className="p-2 text-blue-700 cursor-pointer hover:bg-blue-700 hover:text-white rounded"
                onClick={() => handleEdit(record)}
              >
                Edit
              </div>
              <div
                className="p-2 text-red-700 cursor-pointer hover:bg-red-700 hover:text-white rounded"
                onClick={() => handleDelete(record._id, record.name)}
              >
                Delete
              </div>
            </div>
          }
          arrow={false}
          placement="bottom"
          trigger="mouseenter"
          interactive
        >
          <Button type="text">
            <IconDots />
          </Button>
        </Tippy>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="w-full h-[50vh]">
        <Loading />
      </div>
    );
  if (isError)
    return (
      <Alert
        message={`Error: ${error?.message || "Something went wrong"}`}
        type="error"
      />
    );

  const showLimitWarning = postLimit && postCount && postLimit - postCount <= 3;

  return (
    <div className="bg-white p-2 sm:p-4 rounded shadow-md w-full overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-between mb-2 items-start sm:items-center gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-600">
          Products: <b>{postCount}</b> / <b>{postLimit}</b>
          {showLimitWarning && (
            <Text type="danger" className="ml-1 sm:ml-2 text-xs sm:text-sm">
              (You are near your post limit)
            </Text>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <AntSelect
            value={pageSize}
            onChange={(value) => setPageSize(value)}
            options={pageSizeOptions}
            style={{ width: "100%", minWidth: 100 }}
            size="small"
          />
          <Button
            type="primary"
            onClick={handleAdd}
            disabled={postCount >= postLimit}
            size="small"
            className="w-full sm:w-auto"
          >
            Add Product
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
          size="small"
          className="text-xs sm:text-sm"
        />
      </div>
      <ReactPaginate
        pageCount={totalPages}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        onPageChange={({ selected }) => setCurrentPage(selected + 1)}
        containerClassName="flex justify-center gap-1 sm:gap-2 my-4 sm:my-8 flex-wrap"
        pageClassName="p-1 sm:p-2 px-2 sm:px-3 bg-gray-100 hover:bg-blue-500 hover:text-white border rounded text-xs sm:text-sm"
        activeClassName="bg-blue-600 text-blue-600"
        previousClassName="p-1 sm:p-2 px-2 sm:px-3 bg-gray-200 border rounded text-xs sm:text-sm"
        nextClassName="p-1 sm:p-2 px-2 sm:px-3 bg-gray-200 border rounded text-xs sm:text-sm"
        breakClassName="text-gray-600 text-xs sm:text-sm"
        forcePage={currentPage - 1}
      />
      <Modal
        title={modalType === "edit" ? "Edit Product" : "Add Product"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 800 }}
        centered
      >
        <ProductForm
          modalType={modalType}
          editingProduct={editingProduct}
          fileList={fileList}
          setFileList={setFileList}
          setModalVisible={setModalVisible}
        />
      </Modal>
    </div>
  );
};

export default ProductTable;
