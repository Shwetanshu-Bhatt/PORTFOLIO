export default function ReviewsAdminRedirect() { return null; }

export function getServerSideProps() {
  return { redirect: { destination: '/admin?section=reviews', permanent: false } };
}
