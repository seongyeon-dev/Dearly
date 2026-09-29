import WishCard from "../../components/WishCard/WishCard";
import styles from "./WishlistPage.module.css";
import WishFilter from "./WishFilter/WishFilter";

const wishes = [
  {
    id: 1,
    name: "롬앤 쥬시래스팅 틴트",
    price: 13000,
    status: "샀어요",
  },
  {
    id: 2,
    name: "데이지크 블러셔",
    price: 22000,
    status: "샀어요",
  },
  {
    id: 3,
    name: "디올 미스 디올 오 드 퍼퓸",
    price: 139000,
    status: "사고 싶어요",
  },
  {
    id: 4,
    name: "어뮤즈 아이섀도우",
    price: 20000,
    status: "고민 중",
  },
  {
    id: 5,
    name: "라네즈 립 슬리핑 마스크",
    price: 24000,
    status: "사고 싶어요",
  },
  {
    id: 6,
    name: "클리오 하이라이터",
    price: 28000,
    status: "샀어요",
  },
];

function WishlistPage() {
  return (
    <main className={styles.page}>
      <section className={styles.pageHeader}>
        <div>
          <h1>My Wishlist</h1>
          <p>위시부터 구매까지, 나의 취향을 기록해보세요</p>
        </div>

        <button className={styles.addButton}>+ 상품 추가하기</button>
      </section>

      <WishFilter />

      <section className={styles.cardGrid}>
        {wishes.map((wish) => (
          <WishCard key={wish.id} wish={wish} />
        ))}
      </section>
    </main>
  );
}

export default WishlistPage;
