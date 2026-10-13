import { useEffect, useState } from "react";

import MonthSelector from "../../components/MonthSelector/MonthSelector";

import { getMonthlyPurchases } from "../../utils/purchaseStorage";
import { fetchWishes } from "../../api/wishApi";
import { fetchWishImages, getWishImageUrl } from "../../api/wishImageApi";

import type { PurchaseRecord } from "../../types/purchase";

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

function PurchaseHistory() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseRecord[]>(
    [],
  );

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
        const wishes = await fetchWishes();

        if (cancelled) return;

        const boughtWishIds = new Set(
          wishes
            .filter((wish) => wish.status === "BOUGHT")
            .map((wish) => wish.wish_id),
        );

        const monthlyPurchases = getMonthlyPurchases(selectedMonth);

        const boughtPurchases = monthlyPurchases.filter((purchase) =>
          boughtWishIds.has(purchase.wishId),
        );

        const imageEntries = await Promise.all(
          boughtPurchases.map(async (item) => {
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

        setFilteredPurchases(boughtPurchases);
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
                  key={item.wishId}
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
