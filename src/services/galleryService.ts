import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {
  GalleryImageResponseData,
  GalleryImagesResponseData,
  GalleryMetadataInput,
} from "../types/gallery";
const ENDPOINT = "/gallery";
export const getPublicGalleryImages = async (): Promise<ApiResponse<GalleryImagesResponseData>> =>
  (await axiosClient.get<ApiResponse<GalleryImagesResponseData>>(ENDPOINT)).data;
const galleryForm = (input: GalleryMetadataInput, image?: File) => {
  const form = new FormData();
  form.append("title", input.title);
  form.append(
    "categoryId",
    input.categoryId === null ? "" : String(input.categoryId),
  );
  form.append("displayOrder", String(input.displayOrder));
  form.append("isActive", String(input.isActive));
  if (image) form.append("image", image);
  return form;
};
export const getGalleryImages = async (): Promise<
  ApiResponse<GalleryImagesResponseData>
> =>
  (await adminAxiosClient.get<ApiResponse<GalleryImagesResponseData>>(ENDPOINT))
    .data;
export const createGalleryImage = async (
  input: GalleryMetadataInput,
  image: File,
): Promise<ApiResponse<GalleryImageResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<GalleryImageResponseData>>(
      ENDPOINT,
      galleryForm(input, image),
    )
  ).data;
export const updateGalleryMetadata = async (
  id: number,
  input: GalleryMetadataInput,
): Promise<ApiResponse<GalleryImageResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<GalleryImageResponseData>>(
      `${ENDPOINT}/${id}`,
      input,
    )
  ).data;
export const updateGalleryImageFile = async (
  id: number,
  image: File,
): Promise<ApiResponse<GalleryImageResponseData>> => {
  const form = new FormData();
  form.append("image", image);
  return (
    await adminAxiosClient.patch<ApiResponse<GalleryImageResponseData>>(
      `${ENDPOINT}/${id}/image`,
      form,
    )
  ).data;
};
export const updateGalleryImageStatus = async (
  id: number,
  isActive: boolean,
): Promise<ApiResponse<GalleryImageResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<GalleryImageResponseData>>(
      `${ENDPOINT}/${id}/status`,
      { isActive },
    )
  ).data;
export const deleteGalleryImage = async (
  id: number,
): Promise<ApiMessageResponse> =>
  (await adminAxiosClient.delete<ApiMessageResponse>(`${ENDPOINT}/${id}`)).data;
