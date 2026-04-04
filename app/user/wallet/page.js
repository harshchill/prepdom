import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getWalletOverview } from "@/app/actions/wallet/coin";
import WalletClient from "./WalletClient";

export default async function WalletPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to access your wallet.</p>
        </div>
      </div>
    );
  }

  let overview;
  try {
    overview = await getWalletOverview(20);
  } catch (error) {
    console.error("Error loading wallet:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading wallet</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <WalletClient
      initialCoins={overview.coins}
      initialTransactions={overview.transactions}
      initialStats={overview.stats}
      initialMeta={overview.meta}
    />
  );
}
