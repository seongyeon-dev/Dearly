import { useNavigate } from "react-router-dom";
import styles from "./ReviewsPage.module.css";
import CategoryFilter from "../../components/CategoryFilter/CategoryFilter";
import ReviewCard from "./ReviewCard/ReviewCard";
import type { Review } from "../../types/review";

const reviews: Review[] = [
  {
    id: 1,
    title: "색감이 너무 예쁜 데일리 틴트 💗",
    productName: "롬앤 쥬시래스팅 틴트",
    productImage: "",
    price: 13000,
    category: "BEAUTY",
    rating: 5,
    content:
      "실제로 일주일 정도 사용해봤는데 색상이 너무 예쁘고 발색도 좋아요. 지속력도 괜찮아서 데일리로 자주 사용하고 있어요.",
    createdAt: "2026.09.30",
    updatedAt: "2026.09.30",
  },
  {
    id: 2,
    title: "드디어 찾은 인생 쿠션!",
    productName: "클리오 킬커버 쿠션",
    productImage: "",
    price: 28000,
    category: "BEAUTY",
    rating: 4,
    content:
      "커버력이 좋고 지속력도 괜찮아요. 피부 표현도 깔끔해서 요즘 자주 사용하고 있어요.",
    createdAt: "2026.09.28",
    updatedAt: "2026.09.28",
  },
  {
    id: 3,
    title: "촉촉한 수분 세럼 후기",
    productName: "토리든 다이브인 세럼",
    productImage: "",
    price: 26000,
    category: "BEAUTY",
    rating: 3,
    content:
      "수분감은 좋지만 저한테는 조금 무거운 느낌이었어요. 건조한 날 사용하기에는 괜찮았습니다.",
    createdAt: "2026.09.25",
    updatedAt: "2026.09.25",
  },
  {
    id: 4,
    title: "포근한 향이 너무 좋아요",
    productName: "딥디크 도손 향수",
    productImage: "",
    price: 165000,
    category: "LIFESTYLE",
    rating: 4,
    content:
      "처음에는 향이 조금 강하게 느껴졌는데 시간이 지나면서 은은하게 남는 향이 마음에 들었어요.",
    createdAt: "2026.09.20",
    updatedAt: "2026.09.20",
  },
  {
    id: 5,
    title: "데일리로 들기 좋은 미니백",
    productName: "미닛뮤트 토트백",
    productImage: "",
    price: 89000,
    category: "FASHION",
    rating: 4,
    content:
      "생각보다 수납력이 괜찮고 어떤 코디에도 잘 어울려서 요즘 자주 들고 다니고 있어요.",
    createdAt: "2026.09.18",
    updatedAt: "2026.09.18",
  },
  {
    id: 6,
    title: "은은하게 빛나는 데일리 블러셔",
    productName: "데이지크 블러셔",
    productImage: "",
    price: 22000,
    category: "BEAUTY",
    rating: 5,
    content:
      "색상이 자연스럽게 올라와서 데일리 메이크업에 잘 어울려요. 다른 색상도 구매하고 싶어요.",
    createdAt: "2026.09.15",
    updatedAt: "2026.09.15",
  },
];

function ReviewsPage() {
  const navigate = useNavigate();

  const handleReviewClick = (reviewId: number) => {
    navigate(`/reviews/${reviewId}`);
  };

  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div>
          <h1>나의 리뷰</h1>
          <p>요즘의 소비와 취향</p>
        </div>

        <select className={styles.sortSelect} defaultValue="latest">
          <option value="latest">최신순</option>
          <option value="rating">별점 높은순</option>
        </select>
      </section>

      <CategoryFilter />

      <section className={styles.reviewGrid}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onClick={handleReviewClick}
          />
        ))}
      </section>
    </main>
  );
}

export default ReviewsPage;