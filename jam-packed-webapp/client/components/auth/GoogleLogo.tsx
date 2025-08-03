import Image from "next/image";
import { GOOGLE_LOGO_URL } from "~/shared/constants";

export default function GoogleLogo() {
  return (
    <Image
      priority
      src={GOOGLE_LOGO_URL}
      alt="Sign in with Google"
      width={25}
      height={25}
      className="rounded-full"
    />
  );
}
