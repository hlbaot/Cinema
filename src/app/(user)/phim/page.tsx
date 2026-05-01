import HeroSection from "@/src/component/user/heroSection";
import MembershipBanner from "@/src/component/user/membershipBanner";
import MovieCatalogSection from "@/src/component/user/movieCatalogSection";

export default function MoviePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <HeroSection />
      <MovieCatalogSection />
      <MembershipBanner />
    </div>
  );
}
