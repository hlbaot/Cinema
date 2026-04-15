import Hero from "@/src/component/user/hero";
import ListMovie from "@/src/component/user/listMovie";
import TestingMonial from "@/src/component/user/testingMonial";

export default function UserHomePage() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-hidden bg-black">
      <div className="snap-y snap-mandatory">
        <div className="snap-start">
          <Hero />
        </div>
        <div className="snap-start">
          <ListMovie />
        </div>
        <div className="snap-start">
          <TestingMonial />
        </div>
      </div>
    </div>
  );
}
