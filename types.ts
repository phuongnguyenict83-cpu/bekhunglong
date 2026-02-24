
export enum AgeGroup {
  THREE_FOUR = '3-4 tuổi',
  FOUR_FIVE = '4-5 tuổi',
  FIVE_SIX = '5-6 tuổi'
}

export enum DinoGroup {
  HERBIVORE = 'Ăn cỏ 🌿',
  CARNIVORE = 'Ăn thịt 🥩',
  FLYING = 'Biết bay ☁️',
  AQUATIC = 'Dưới nước 🌊'
}

export enum ImageType {
  COLOR_ILLUSTRATION = 'Tranh màu minh họa',
  KIDS_DRAWING = 'Tranh vẽ thiếu nhi',
  COLORING_PAGE = 'Tranh tô màu (đen trắng)'
}

export enum ArtStyle {
  CARTOON_2D = 'Hoạt hình 2D',
  THREE_D = '3D',
  CUTE = 'Dễ thương',
  WATERCOLOR = 'Màu nước',
  CINEMATIC = 'Điện ảnh'
}

export enum AspectRatio {
  A4_PORTRAIT = '9:12.7',
  A4_LANDSCAPE = '12.7:9',
  SQUARE = '1:1',
  MOBILE = '9:16',
  WIDESCREEN = '16:9',
  LANDSCAPE_43 = '4:3'
}

export interface DinoImage {
  id: string;
  url: string;
  type: ImageType;
  group: DinoGroup;
  age: AgeGroup;
  prompt: string;
  question?: string;
  timestamp: number;
}
