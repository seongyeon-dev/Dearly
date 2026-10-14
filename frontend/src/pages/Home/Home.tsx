import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryChart from "../../components/CategoryChart/CategoryChart";
import MonthSelector from "../../components/MonthSelector/MonthSelector";
import WishlistCard from "../../components/WishlistCard/WishlistCard";
import { fetchWishes, updateWish } from "../../api/wishApi";
import { fetchPurchaseByWishId } from "../../api/purchaseApi";
import { fetchWishImages, getWishImageUrl } from "../../api/wishImageApi";
import type { Wish } from "../../types/wish";
import MonthlySummary from "./MonthlySummary/MonthlySummary";

import "./Home.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

const statusMap: Record<ProductStatus, Pick<Wish, "status" | "statusClass">> = {
  WANT: {
    status: "사고 싶어요",
    statusClass: "want",
  },
  CONSIDERING: {
    status: "고민 중",
    statusClass: "considering",
  },
  BOUGHT: {
    status: "샀어요",
    statusClass: "bought",
  },
};

type RecentWishlistItem = Wish & {
  imageUrl: string | null;
  isFavorite: boolean;
};

function getCurrentMonth(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getWishCreatedMonth(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function Home() {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const [recentWishlistItems, setRecentWishlistItems] = useState<
    RecentWishlistItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentWishes() {
      setIsLoading(true);
      setLoadError("");
      setRecentWishlistItems([]);

      try {
        const wishes = await fetchWishes();

        const recentWishes = wishes
          .filter(
            (item) =>
              item.created_at &&
              getWishCreatedMonth(item.created_at) === selectedMonth,
          )
          .sort((a, b) => {
            const dateDifference =
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime();

            return dateDifference || b.wish_id - a.wish_id;
          })
          .slice(0, 4);

        const convertedItems: RecentWishlistItem[] = await Promise.all(
          recentWishes.map(async (item) => {
            let displayPrice = Number(item.expected_price);
            let imageUrl: string | null = null;

            if (item.status === "BOUGHT") {
              try {
                const purchase = await fetchPurchaseByWishId(item.wish_id);

                if (purchase) {
                  displayPrice = Number(purchase.amount);
                }
              } catch (error) {
                console.error(
                  `${item.wish_id}번 상품 구매 기록 조회 실패:`,
                  error,
                );
              }
            }

            try {
              const images = await fetchWishImages(item.wish_id);

              if (images.length > 0) {
                const sortedImages = [...images].sort(
                  (a, b) => a.sort_order - b.sort_order,
                );

                imageUrl = getWishImageUrl(sortedImages[0].image_url);
              }
            } catch (error) {
              console.error(`${item.wish_id}번 상품 이미지 조회 실패:`, error);
            }

            return {
              id: item.wish_id,
              name: item.name,
              category: item.category,
              price: `${displayPrice.toLocaleString("ko-KR")}원`,
              imageUrl,
              ...statusMap[item.status],
              isFavorite: Boolean(item.is_favorite),
            };
          }),
        );

        if (cancelled) return;

        setRecentWishlistItems(convertedItems);
      } catch (error) {
        if (cancelled) return;

        console.error("최근 위시 상품 조회 실패:", error);
        setLoadError("최근 위시 상품을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRecentWishes();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  const handleFavoriteToggle = async (productId: number) => {
    if (updatingFavorites.includes(productId)) {
      return;
    }

    const targetItem = recentWishlistItems.find(
      (item) => item.id === productId,
    );

    if (!targetItem) {
      return;
    }

    const nextFavorite = !targetItem.isFavorite;

    setUpdatingFavorites((prev) => [...prev, productId]);

    try {
      await updateWish(productId, {
        is_favorite: nextFavorite,
      });

      setRecentWishlistItems((prev) =>
        prev.map((item) =>
          item.id === productId
            ? {
                ...item,
                isFavorite: nextFavorite,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("관심 상품 변경 실패:", error);
      alert("관심 상품 변경에 실패했습니다.");
    } finally {
      setUpdatingFavorites((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <main className="home">
      <div className="home-container">
        <section className="home-header">
          <div>
            <h1>Home</h1>
            <p>나의 위시와 소비를 한눈에 확인해보세요</p>
          </div>

          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        </section>

        <section className="dashboard-summary">
          <MonthlySummary selectedMonth={selectedMonth} />

          <CategoryChart selectedMonth={selectedMonth} />
        </section>

        <section className="recent-wishlist">
          <div className="wishlist-header">
            <h2>최근 추가한 위시 상품</h2>

            <button
              type="button"
              className="wishlist-more-button"
              onClick={() => navigate("/wishlist")}
            >
              더보기 ›
            </button>
          </div>

          <div className="wishlist-grid">
            {isLoading ? (
              <p>상품을 불러오는 중입니다...</p>
            ) : loadError ? (
              <p>{loadError}</p>
            ) : recentWishlistItems.length > 0 ? (
              recentWishlistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/wishlist/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <WishlistCard
                    productId={item.id}
                    name={item.name}
                    price={item.price}
                    status={item.status}
                    statusClass={item.statusClass}
                    imageUrl={item.imageUrl}
                    isFavorite={item.isFavorite}
                    onFavoriteToggle={handleFavoriteToggle}
                    favoriteLoading={updatingFavorites.includes(item.id)}
                  />
                </div>
              ))
            ) : (
              <p>해당 월에 등록한 위시 상품이 없습니다.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
