export interface GalleryImage {
  id: number;
  title: string;
  imageUrl: string;
  categoryId: number | null;
  category: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface GalleryMetadataInput {
  title: string;
  categoryId: number | null;
  displayOrder: number;
  isActive: boolean;
}
export interface GalleryImageResponseData {
  galleryImage: GalleryImage;
}
export interface GalleryImagesResponseData {
  galleryImages: GalleryImage[];
}
export interface GalleryCategory {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface GalleryCategoriesResponseData {
  categories: GalleryCategory[];
}
