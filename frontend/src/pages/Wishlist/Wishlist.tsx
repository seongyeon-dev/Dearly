import { Grid2X2, List } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import WishlistCard from "../../components/WishlistCard/WishlistCard";
import { products } from "../../data/products";
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

function isProductStatus(value: unknown): value is ProductStatus {
  return value === "WANT" || value === "CONSIDERING" || value === "BOUGHT";
}

function getDeletedProductIds(): number[] {
  try {
    const saved = localStorage.getItem("dearly-deleted-products");

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (id): id is number => typeof id === "number" && Number.isInteger(id),
    );
  } catch {
    return [];
  }
}

function getWishlistItems(): Wish[] {
  const deletedIds = getDeletedProductIds();

  return products
    .filter((item) => !deletedIds.includes(item.id))
    .map((item): Wish => {
      const storageKey = `dearly-product-detail-${item.id}`;

      try {
        const saved = localStorage.getItem(storageKey);

        if (!saved) {
          return item;
        }

        const product: unknown = JSON.parse(saved);

        if (
          typeof product !== "object" ||
          product === null ||
          !("status" in product) ||
          !isProductStatus(product.status)
        ) {
          return item;
        }

        return {
          ...item,
          ...statusMap[product.status],
        };
      } catch {
        return item;
      }
    });
}

function getNumericPrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function sortWishlistItems(items: Wish[], sortType: SortType): Wish[] {
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

  const items = getWishlistItems();

  const categoryParam = searchParams.get("category");

  const selectedCategory =
    categoryParam && Object.keys(categoryNames).includes(categoryParam)
      ? (categoryParam as WishCategory)
      : null;

  const filteredItems = items.filter((item) => {
    if (!selectedCategory) {
      return true;
    }

    return item.category === selectedCategory;
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
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className="wishlist-card-link"
                onClick={() => navigate(`/wishlist/${item.id}`)}
              >
                <WishlistCard
                  name={item.name}
                  price={item.price}
                  status={item.status}
                  statusClass={item.statusClass}
                />
              </div>
            ))
          ) : (
            <p>등록된 상품이 없습니다.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Wishlist;
