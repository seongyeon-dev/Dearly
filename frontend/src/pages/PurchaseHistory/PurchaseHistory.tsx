import { useEffect, useState } from "react";

import MonthSelector from "../../components/MonthSelector/MonthSelector";

import { fetchPurchases } from "../../api/purchaseApi";
import { fetchWishes } from "../../api/wishApi";
import { fetchWishImages, getWishImageUrl } from "../../api/wishImageApi";

import PurchaseItem from "./PurchaseItem/PurchaseItem";
import PurchaseSummary from "./PurchaseSummary/PurchaseSummary";

import "./PurchaseHistory.css";

function getCurrentMonth(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

interface PurchaseHistoryItem {
  purchaseId: number;
  wishId: number;
  name: string;
  category: string;
  date: string;
  amount: number;
}

function PurchaseHistory() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const [filteredPurchases, setFilteredPurchases] = useState<
    PurchaseHistoryItem[]
  >([]);

  const [productImages, setProductImages] = useState<Record<number, string>>(
    {},
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPurchaseHistory = async () => {
      setIsLoading(true);
      setLoadError("");
      setFilteredPurchases([]);
      setProductImages({});

      try {
        const [purchases, wishes] = await Promise.all([
          fetchPurchases(),
          fetchWishes(),
        ]);

        if (cancelled) return;

        const wishMap = new Map(
          wishes
            .filter((wish) => wish.status === "BOUGHT")
            .map((wish) => [wish.wish_id, wish]),
        );

        const monthlyPurchases = purchases
          .filter((purchase) => purchase.purchased_at.startsWith(selectedMonth))
          .filter((purchase) => wishMap.has(purchase.wish_id))
          .map((purchase) => {
            const wish = wishMap.get(purchase.wish_id)!;

            return {
              purchaseId: purchase.purchase_id,
              wishId: purchase.wish_id,
              name: wish.name,
              category: wish.category,
              date: purchase.purchased_at,
              amount: purchase.amount,
            };
          })
          .sort(
            (a, b) =>
              b.date.localeCompare(a.date) || b.purchaseId - a.purchaseId,
          );

        const imageEntries = await Promise.all(
          monthlyPurchases.map(async (item) => {
            try {
              const images = await fetchWishImages(item.wishId);

              if (images.length === 0) {
                return [item.wishId, ""] as const;
              }

              const sortedImages = [...images].sort(
                (a, b) => a.sort_order - b.sort_order,
              );

              return [
                item.wishId,
                getWishImageUrl(sortedImages[0].image_url),
              ] as const;
            } catch (error) {
              console.error(
                `${item.wishId}번 구매 상품 이미지 조회 실패:`,
                error,
              );

              return [item.wishId, ""] as const;
            }
          }),
        );

        if (cancelled) return;

        setFilteredPurchases(monthlyPurchases);
        setProductImages(Object.fromEntries(imageEntries));
      } catch (error) {
        if (cancelled) return;

        console.error("소비 기록 조회 실패:", error);

        setLoadError("소비 기록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPurchaseHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  const totalAmount = filteredPurchases.reduce(
    (total, purchase) => total + purchase.amount,
    0,
  );

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString("ko-KR")}원`;
  };

  const formatDate = (date: string): string => {
    return date.replaceAll("-", ".");
  };

  return (
    <main className="purchase-history">
      <div className="purchase-container">
        <div className="purchase-header">
          <div>
            <h1>소비 기록</h1>
            <p>구매한 상품과 소비 내역을 확인해보세요.</p>
          </div>

          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        </div>

        <PurchaseSummary
          totalAmount={totalAmount}
          purchaseCount={filteredPurchases.length}
        />

        <section className="purchase-list-section">
          <div className="purchase-list-header">
            <h2>구매 내역</h2>
          </div>

          <div className="purchase-list">
            {isLoading ? (
              <p className="purchase-empty-message">
                소비 기록을 불러오는 중입니다...
              </p>
            ) : loadError ? (
              <p className="purchase-empty-message">{loadError}</p>
            ) : filteredPurchases.length > 0 ? (
              filteredPurchases.map((item) => (
                <PurchaseItem
                  key={item.purchaseId}
                  wishId={item.wishId}
                  name={item.name}
                  category={item.category}
                  date={formatDate(item.date)}
                  price={formatPrice(item.amount)}
                  image={productImages[item.wishId] || undefined}
                />
              ))
            ) : (
              <p className="purchase-empty-message">
                선택한 달에 구매한 상품이 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PurchaseHistory;
