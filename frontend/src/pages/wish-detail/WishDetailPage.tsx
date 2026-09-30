import styles from "./WishDetailPage.module.css";
import WishImageGallery from "./WishImageGallery/WishImageGallery";
import WishDetailForm from "./WishDetailForm/WishDetailForm";

function WishDetailPage() {
  return (
    <main className={styles.page}>
      <section className={styles.detailContainer}>
        <WishImageGallery />
        <WishDetailForm />
      </section>
    </main>
  );
}

export default WishDetailPage;