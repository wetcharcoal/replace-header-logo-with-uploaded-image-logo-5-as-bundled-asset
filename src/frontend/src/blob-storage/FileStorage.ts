import { loadConfig } from "@caffeineai/core-infrastructure";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useBackendActor } from "../hooks/useBackendActor";
import { StorageClient } from "./StorageClient";

const getHttpAgent = async () => {
  const config = await loadConfig();

  const agent = new HttpAgent({
    host: config.backend_host,
  });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running",
      );
      console.error(err);
    });
  }
  return agent;
};

// Hook to fetch the list of files
export const useFileList = () => {
  const { actor } = useBackendActor();

  return useQuery({
    queryKey: ["fileList"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Unified hook for getting file URLs — returns the path directly if it's already a URL/string
export const useFileUrl = (path: string | undefined | null) => {
  const { actor } = useBackendActor();

  const getFileReference = async (filePath: string) => {
    if (!actor) throw new Error("Backend is not available");
    const envConfig = await loadConfig();
    const storageClient = new StorageClient(
      actor,
      envConfig.bucket_name,
      envConfig.storage_gateway_url,
      envConfig.backend_canister_id,
      envConfig.project_id,
      await getHttpAgent(),
    );
    const url = await storageClient.getDirectURL(filePath);
    return url;
  };

  return useQuery({
    queryKey: ["fileUrl", path],
    queryFn: () => getFileReference(path!),
    enabled: !!path,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000,
  });
};

export const useFileUpload = () => {
  const { actor } = useBackendActor();
  const [isUploading, setIsUploading] = useState(false);
  const { invalidateFileList } = useInvalidateQueries();

  const uploadFile = async (
    path: string,
    data: File,
    onProgress?: (percentage: number) => void,
  ): Promise<{
    path: string;
    hash: string;
    url: string;
  }> => {
    if (!actor) {
      throw new Error("Backend is not available");
    }

    const envConfig = await loadConfig();
    const storageClient = new StorageClient(
      actor,
      envConfig.bucket_name,
      envConfig.storage_gateway_url,
      envConfig.backend_canister_id,
      envConfig.project_id,
      await getHttpAgent(),
    );

    setIsUploading(true);

    try {
      const res = await storageClient.putFile(path, data, onProgress);
      await invalidateFileList();
      return res;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};

export const useFileDelete = () => {
  const { actor } = useBackendActor();
  const [isDeleting, setIsDeleting] = useState(false);
  const { invalidateFileList, invalidateFileUrl } = useInvalidateQueries();

  const deleteFile = async (path: string): Promise<void> => {
    if (!actor) {
      throw new Error("Backend is not available");
    }

    setIsDeleting(true);

    try {
      // File deletion via backend not available in this backend version
      await invalidateFileList();
      invalidateFileUrl(path);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteFile, isDeleting };
};

// Utility to invalidate queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateFileList: () =>
      queryClient.invalidateQueries({ queryKey: ["fileList"] }),
    invalidateFileUrl: (path: string) =>
      queryClient.invalidateQueries({ queryKey: ["fileUrl", path] }),
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ["fileList"] });
      queryClient.invalidateQueries({ queryKey: ["fileUrl"] });
    },
  };
};
