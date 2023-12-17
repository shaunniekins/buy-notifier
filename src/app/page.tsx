import Overview from "@/components/Overview";
import LandingComponent from "@/components/Landing";
import Redirect from "@/utils/Redirect";

export default function Home() {
  return (
    <Redirect>
      <LandingComponent />
    </Redirect>
  );
}
