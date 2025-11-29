/* eslint-disable @next/next/no-img-element */
import LOGO_SPPI from "@/public/logo-sppi.png";
import LOGO_BGN from "@/public/logo-bgn.png";

export default function Header() {
  return (
    <header className="">
      <div className="text-center flex flex-row items-center gap-4 justify-center">
        <img src={LOGO_SPPI.src} alt="Logo SPPI" className="w-20 h-auto" />
        <img src={LOGO_BGN.src} alt="Logo BGN" className="w-48 h-auto" />
      </div>
    </header>
  );
}
