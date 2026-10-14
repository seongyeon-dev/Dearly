export type Purchase = {
  wishId: number;
  name: string;
  category: string;
  date: string;
  price: string;
};

export type PurchaseRecord = {
  wishId: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  store: string;
  memo: string;
};
