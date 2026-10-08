export type WishStatus = "사고 싶어요" | "고민 중" | "샀어요";

export type WishStatusClass = "want" | "considering" | "bought";

export type Wish = {
  id: number;
  name: string;
  price: string;
  status: WishStatus;
  statusClass: WishStatusClass;
};
