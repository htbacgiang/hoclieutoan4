export interface TopicItem {
  id: string;
  name: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  count: number;
}

export interface LevelItem {
  id: string;
  title: string;
  subtitle: string;
  colorTheme: 'green' | 'amber' | 'pink';
}

export interface OptionItem {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
  type:
    | 'circle-1-2'
    | 'circle-1-4'
    | 'circle-3-4'
    | 'circle-2-4'
    | 'circle-1-3'
    | 'circle-2-3'
    | 'rect-1-2'
    | 'rect-2-3'
    | 'rect-3-5'
    | 'rect-1-4'
    | 'triangle-unequal'
    | 'text';
  textValue?: string;
  subText?: string;
  isCorrect: boolean;
  description?: string;
}

export interface QuestionData {
  id: number;
  lessonTitle: string;
  questionText: string;
  numerator?: number;
  denominator?: number;
  options: OptionItem[];
  explanation: string;
}

export interface QuestionStatusItem {
  id: number;
  numLabel: string;
  status: 'correct' | 'wrong' | 'unattempted';
}

export const LEVELS: LevelItem[] = [
  {
    id: 'co-ban',
    title: 'Cơ bản',
    subtitle: 'Em mới bắt đầu',
    colorTheme: 'green',
  },
  {
    id: 'van-dung',
    title: 'Vận dụng',
    subtitle: 'Em đã hiểu bài',
    colorTheme: 'amber',
  },
  {
    id: 'thu-thach',
    title: 'Thử thách',
    subtitle: 'Em muốn chinh phục',
    colorTheme: 'pink',
  },
];
