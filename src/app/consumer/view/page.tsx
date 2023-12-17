import Overview from "@/components/Overview";
import Protected from "@/utils/Protected";

export default function View() {
  return (
    <Protected>
      <Overview />
    </Protected>
  );
}
