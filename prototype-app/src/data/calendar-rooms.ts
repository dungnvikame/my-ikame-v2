export type Room = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipment: string[];
};

export const ROOMS: Room[] = [
  { id: 'r-sapphire', name: 'Phòng Sapphire', floor: 3, capacity: 4, equipment: ['TV 55"', 'Bảng trắng'] },
  { id: 'r-ruby', name: 'Phòng Ruby', floor: 3, capacity: 6, equipment: ['Màn chiếu', 'Camera họp online'] },
  { id: 'r-emerald', name: 'Phòng Emerald', floor: 5, capacity: 8, equipment: ['TV 75"', 'Camera họp online', 'Bảng trắng'] },
  { id: 'r-amber', name: 'Phòng Amber', floor: 5, capacity: 10, equipment: ['Màn chiếu', 'Micro hội nghị'] },
  { id: 'r-onyx', name: 'Phòng Onyx', floor: 7, capacity: 12, equipment: ['TV 85"', 'Camera họp online', 'Micro hội nghị'] },
  { id: 'r-ocean', name: 'Hội trường Đại Dương', floor: 8, capacity: 30, equipment: ['Máy chiếu', 'Âm thanh sân khấu', 'Micro không dây'] },
];
