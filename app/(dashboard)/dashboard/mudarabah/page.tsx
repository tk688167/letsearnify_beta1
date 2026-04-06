import MudarabahClient from "./MudarabahClient";
import { FeatureGuard } from "../FeatureGuard";

export const metadata = {
  title: "Mudarabah Pools | AntiGravity",
  description: "Invest in high-yield Shariah-compliant Mudarabah Pools",
};

export default function MudarabahPage() {
  return (
    <FeatureGuard title="Mudarabah Pool" feature="pools" previewMode={true}>
      <MudarabahClient />
    </FeatureGuard>
  );
}
