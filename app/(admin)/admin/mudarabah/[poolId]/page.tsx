import MudarabahPoolDetailsClient from "./MudarabahPoolDetailsClient";

export const metadata = {
  title: "Pool Management | Admin Portal",
};

export default function MudarabahPoolDetailsPage({ params }: { params: { poolId: string } }) {
  return <MudarabahPoolDetailsClient poolId={params.poolId} />;
}
