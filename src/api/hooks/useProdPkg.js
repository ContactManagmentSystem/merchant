// src/api/hooks/useProdPkg.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getData,
  createData,
  editData,
  deleteData,
  getPackData,
} from "../services/service";

export const useGetProduct = (page = 1, limit = 5) => {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: () => getData("products", page, limit),
  });
};

export const useGetPackage = (
  page = 1,
  limit = 5,
  ownerName,
  isAvailable,
  productId,
  size
) => {
  return useQuery({
    queryKey: [
      "packages",
      page,
      limit,
      ownerName,
      isAvailable,
      productId,
      size,
    ],
    queryFn: () =>
      getPackData(
        "packages",
        page,
        limit,
        ownerName,
        isAvailable,
        productId,
        size
      ),
  });
};

// Hook to delete a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => deleteData("products", productId),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });
};

// Hook to edit a product
export const useEditProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productData, config }) =>
      editData("products", productId, productData, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });
};

// Hook to create a product (you can add this if needed)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, config }) => createData("products", data, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });
};

// Hook to delete a package
export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId) => deleteData("packages", packageId), // Uses deleteProduct but for packages
    onSuccess: () => {
      queryClient.invalidateQueries(["packages"]);
    },
  });
};

// Hook to edit a package
export const useEditPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ packageId, packageData, config }) =>
      editData("packages", packageId, packageData, config), // Uses editProduct but for packages
    onSuccess: () => {
      queryClient.invalidateQueries(["packages"]);
    },
  });
};

// Hook to create a package (you can add this if needed)
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, config }) => createData("packages", data, config),
    onSuccess: () => {
      queryClient.invalidateQueries(["packages"]);
    },
  });
};
