import PeddlerSigninComponent from "@/components/Peddler/Signin";
import Redirect from "@/utils/Redirect";

export default function PeddlerSignin() {
  return (
    <Redirect>
      <PeddlerSigninComponent />
    </Redirect>
  );
}
