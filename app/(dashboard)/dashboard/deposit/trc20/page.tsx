export const dynamic = "force-dynamic";

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TRC20DepositForm from "./TRC20DepositForm"

export const metadata = {
  title: "TRC20 Deposit | LetsEarnify",
  description: "Deposit USDT via the TRON TRC20 network",
}

export default async function TRC20DepositPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return <TRC20DepositForm />
}
