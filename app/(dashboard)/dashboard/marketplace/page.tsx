import React from "react"
import { FeatureGuard } from "@/app/(dashboard)/dashboard/FeatureGuard"
import { ShoppingBagIcon } from "@heroicons/react/24/outline"

export const dynamic = 'force-dynamic'

export default function MarketplacePage() {
  return (
    <FeatureGuard title="Marketplace" feature="marketplace">
      <div className="space-y-6">
        {/* Placeholder for Marketplace */}
        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Marketplace Online</h2>
            <p className="text-gray-500 max-w-md mx-auto">
                The trading engine is active. Listings are currently propagating and will appear here shortly.
            </p>
        </div>
      </div>
    </FeatureGuard>
  )
}
