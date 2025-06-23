// src/api/hooks/useService.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createData,
  deleteData,
  editData,
  getData,
  getSingle,
} from "../services/service";

// ============================
// CATEGORY CRUD
// ============================
export const useGetCategory = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["cate", page, limit],
    queryFn: () => getData("cate", page, limit),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, config }) => createData("cate", data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cate"] });
    },
  });
};

export const useEditCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, categoryData, config }) =>
      editData("cate", categoryId, categoryData, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cate"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId) => deleteData("cate", categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cate"] });
    },
  });
};

// ============================
// LANDING CRUD
// ============================

// GET current user's landing
export const useGetLanding = () => {
  return useQuery({
    queryKey: ["landing"],
    queryFn: () => getSingle("landing/my"), // GET /landing/my
  });
};

// CREATE landing
export const useCreateLanding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, config }) => createData("landing", data, config), // POST /landing
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing"] });
    },
  });
};

// UPDATE landing
export const useEditLanding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ landingId, landingData, config }) =>
      editData("landing", landingId, landingData, config), // PUT /landing/:id
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing"] });
    },
  });
};

// ============================
// PAYMENT CRUD
// ============================
export const useGetPayments = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["payment", page, limit],
    queryFn: () => getData("payment", page, limit),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createData("payment", data), // No need for config here unless required
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] }); // Invalidate the payments query to refetch data
    },
  });
};

export const useEditPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, paymentData }) =>
      editData("payment", paymentId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) => deleteData("payment", paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
  });
};

// ============================
// SOCIAL LINK CRUD
// ============================

export const useGetSocialLinks = (landingId) => {
  return useQuery({
    queryKey: ["socialLinks", landingId],
    queryFn: () => getSingle(`social/${landingId}`), // GET /social/:landingId
    enabled: !!landingId, // only fetch if landingId exists
  });
};

export const useCreateSocialLink = (landingId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, config }) =>
      createData(`social/${landingId}`, data, config), // POST /social/:landingId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks", landingId] });
    },
  });
};

export const useEditSocialLink = (landingId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ socialLinkId, socialLinkData, config }) =>
      editData(`social`, socialLinkId, socialLinkData, config), // PUT /social/:socialLinkId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks", landingId] });
    },
  });
};

export const useDeleteSocialLink = (landingId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (socialLinkId) => deleteData(`social`, socialLinkId), // DELETE /social/:socialLinkId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks", landingId] });
    },
  });
};
