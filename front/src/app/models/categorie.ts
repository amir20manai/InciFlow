export interface CategoryResponse {
  id: number;
  name: string;
  count?: number; // لو الباكند يرجع عدد الحوادث لكل فئة
  dotColor?: string;
  dotBg?: string;
}