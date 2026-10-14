import { Grid2X2, Heart, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import WishlistCard from "../../components/WishlistCard/WishlistCard";
import { fetchWishes, updateWish } from "../../api/wishApi";
import { fetchPurchaseByWishId } from "../../api/purchaseApi";
import type { Wish, WishCategory } from "../../types/wish";

import "./Wishlist.css";

const categoryNames: Record<WishCategory, string> = {
  BEAUTY: "뷰티",
  FASHION: "패션",
  LIFESTYLE: "라이프스타일",
  OTHER: "기타",
};

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";
type SortType = "latest" | "oldest" | "price-low" | "price-high";
type FilterType = "all" | "favorite";

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

type WishlistItem = Wish & {
  isFavorite: boolean;
};

function getNumericPrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function sortWishlistItems(
  items: WishlistItem[],
  sortType: SortType,
): WishlistItem[] {
  const sortedItems = [...items];

  switch (sortType) {
    case "latest":
      return sortedItems.sort((a, b) => b.id - a.id);

    case "oldest":
      return sortedItems.sort((a, b) => a.id - b.id);

    case "price-low":
      return sortedItems.sort(
        (a, b) => getNumericPrice(a.price) - getNumericPrice(b.price),
      );

    case "price-high":
      return sortedItems.sort(
        (a, b) => getNumericPrice(b.price) - getNumericPrice(a.price),
      );

    default:
      return sortedItems;
  }
}

function Wishlist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortType, setSortType] = useState<SortType>("latest");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingFavorites, setUpdatingFavorites] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadWishes() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchWishes();

        const convertedItems: WishlistItem[] = await Promise.all(
          data.map(async (item) => {
            let displayPrice = Number(item.expected_price);

            if (item.status === "BOUGHT") {
              try {
                const purchase = await fetchPurchaseByWishId(item.wish_id);

                if (purchase) {
                  displayPrice = Number(purchase.amount);
                }
              } catch (purchaseError) {
                console.error(
                  `${item.wish_id}번 상품 구매 기록 조회 실패:`,
                  purchaseError,
                );
              }
            }

            return {
              id: item.wish_id,
              name: item.name,
              category: item.category,
              price: `${displayPrice.toLocaleString("ko-KR")}원`,
              ...statusMap[item.status],
              isFavorite: Boolean(item.is_favorite),
            };
          }),
        );

        if (cancelled) return;

        setItems(convertedItems);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "상품을 불러오는 중 오류가 발생했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWishes();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFavoriteToggle = async (productId: number) => {
    if (updatingFavorites.includes(productId)) return;

    const targetItem = items.find((item) => item.id === productId);

    if (!targetItem) return;

    const nextFavorite = !targetItem.isFavorite;

    setUpdatingFavorites((prev) => [...prev, productId]);

    try {
      // 공통 API 함수를 사용해 관심 상품 상태 변경
      await updateWish(productId, {
        is_favorite: nextFavorite,
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, isFavorite: nextFavorite } : item,
        ),
      );
    } catch (err) {
      console.error("관심 상품 변경 실패:", err);
      alert("관심 상품 변경에 실패했습니다.");
    } finally {
      setUpdatingFavorites((prev) => prev.filter((id) => id !== productId));
    }
  };

  const categoryParam = searchParams.get("category");

  const selectedCategory =
    categoryParam && Object.keys(categoryNames).includes(categoryParam)
      ? (categoryParam as WishCategory)
      : null;

  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }

    if (filterType === "favorite" && !item.isFavorite) {
      return false;
    }

    return true;
  });

  const sortedItems = sortWishlistItems(filteredItems, sortType);

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <section className="wishlist-page-header">
          <div>
            <h1>My Wishlist</h1>
            <p>사고 싶은 것들을 모아보세요.</p>
          </div>

          <button
            type="button"
            className="add-wish-button"
            onClick={() => navigate("/wishlist/new")}
          >
            + 상품 추가하기
          </button>
        </section>

        <div className="wishlist-filter-tabs">
          <button
            type="button"
            className={`wishlist-filter-tab ${
              filterType === "all" ? "active" : ""
            }`}
            onClick={() => setFilterType("all")}
            aria-pressed={filterType === "all"}
          >
            전체 상품
          </button>

          <button
            type="button"
            className={`wishlist-filter-tab ${
              filterType === "favorite" ? "active" : ""
            }`}
            onClick={() => setFilterType("favorite")}
            aria-pressed={filterType === "favorite"}
          >
            <Heart size={14} strokeWidth={1.7} />
            관심 상품
          </button>
        </div>

        <section className="wishlist-toolbar">
          <select
            className="wishlist-sort"
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="price-low">낮은 가격순</option>
            <option value="price-high">높은 가격순</option>
          </select>

          <div className="view-buttons">
            <button
              type="button"
              className={viewType === "grid" ? "active" : ""}
              onClick={() => setViewType("grid")}
              aria-label="그리드 보기"
            >
              <Grid2X2 size={16} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              className={viewType === "list" ? "active" : ""}
              onClick={() => setViewType("list")}
              aria-label="리스트 보기"
            >
              <List size={17} strokeWidth={1.5} />
            </button>
          </div>
        </section>

        <section
          className={`wishlist-items ${viewType === "list" ? "list-view" : ""}`}
        >
          {loading ? (
            <p className="wishlist-empty-message">
              상품을 불러오는 중입니다...
            </p>
          ) : error ? (
            <p className="wishlist-empty-message">{error}</p>
          ) : sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className="wishlist-card-link"
                onClick={() => navigate(`/wishlist/${item.id}`)}
              >
                <WishlistCard
                  productId={item.id}
                  name={item.name}
                  price={item.price}
                  status={item.status}
                  statusClass={item.statusClass}
                  isFavorite={item.isFavorite}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoriteLoading={updatingFavorites.includes(item.id)}
                />
              </div>
            ))
          ) : (
            <p className="wishlist-empty-message">
              {filterType === "favorite"
                ? "아직 관심 상품이 없어요. 마음에 드는 상품에 하트를 눌러보세요."
                : "등록된 상품이 없습니다."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Wishlist;
