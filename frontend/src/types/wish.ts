export type WishStatus = "사고 싶어요" | "고민 중" | "샀어요";

export type WishStatusClass = "want" | "considering" | "bought";

export type WishCategory = "BEAUTY" | "FASHION" | "LIFESTYLE" | "OTHER";

export type Wish = {
  id: number;
  name: string;
  price: string;
  category: WishCategory;
  status: WishStatus;
  statusClass: WishStatusClass;
};
