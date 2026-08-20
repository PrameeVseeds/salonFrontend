import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiResponse } from "../types/api";
import type { GalleryCategoriesResponseData } from "../types/gallery";

const ENDPOINT = "/gallery-categories";
export const getGalleryCategories = async (): Promise<
  ApiResponse<GalleryCategoriesResponseData>
> =>
  (
    await adminAxiosClient.get<ApiResponse<GalleryCategoriesResponseData>>(
      ENDPOINT,
    )
  ).data;
