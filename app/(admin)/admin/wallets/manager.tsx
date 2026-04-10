"use client"

import { useState, useEffect } from "react"
import { updatePlatformWallet } from "@/lib/actions"
import { uploadQRCode } from "@/app/actions/admin/upload"
import { QrCodeIcon } from "@heroicons/react/24/outline"

export default function AdminWalletManager({ wallets }: { wallets: any[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Local state for form management
  const [trcAddress, setTrcAddress] = useState(wallets.find((w: any) => w.network === "TRC20")?.address || "")
  const [trcQr, setTrcQr] = useState(wallets.find((w: any) => w.network === "TRC20")?.qrCodePath || "/qr-trc20.png")

  const [binanceAddress, setBinanceAddress] = useState(wallets.find((w: any) => w.network === "BINANCE")?.address || "")
  const [binanceQr, setBinanceQr] = useState(wallets.find((w: any) => w.network === "BINANCE")?.qrCodePath || "/qr-placeholder.png")

  useEffect(() => {
     setTrcAddress(wallets.find((w: any) => w.network === "TRC20")?.address || "")
     setTrcQr(wallets.find((w: any) => w.network === "TRC20")?.qrCodePath || "/qr-trc20.png")
     setBinanceAddress(wallets.find((w: any) => w.network === "BINANCE")?.address || "")
     setBinanceQr(wallets.find((w: any) => w.network === "BINANCE")?.qrCodePath || "/qr-placeholder.png")
  }, [wallets])

  const handleSave = async (network: string) => {
      setLoading(true)
      setMessage("")
      try {
          let address = ""
          let qrPath = ""

          if (network === "TRC20") {
              address = trcAddress
              qrPath = trcQr
          } else if (network === "BINANCE") {
              address = binanceAddress
              qrPath = binanceQr
          }
          
          await updatePlatformWallet(network, address, qrPath)
          setMessage(`${network} Wallet updated successfully!`)
      } catch (error) {
          setMessage("Failed to update.")
      } finally {
          setLoading(false)
      }
  }

  return (
      <div className="space-y-8">
          {message && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold border border-green-200 dark:border-green-800">
                  {message}
              </div>
          )}

          {/* TRC20 EDITOR */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-2 rounded-lg"><QrCodeIcon className="w-5 h-5"/></span>
                  USDT (TRC20) Settings
              </h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Wallet Address</label>
                      <input 
                          type="text" 
                          value={trcAddress}
                          onChange={(e: any) => setTrcAddress(e.target.value)}
                          className="w-full p-3 border border-input rounded-xl font-mono text-sm bg-muted/30 text-foreground outline-none focus:border-blue-500 transition-all"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">QR Code Image</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-full sm:w-20 h-20 bg-muted/30 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                <img src={trcQr} alt="QR" className="w-full h-full object-contain mx-auto" />
                          </div>
                          <div className="flex-1 w-full">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e: any) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    
                                    setLoading(true)
                                    setMessage("Uploading...")
                                    
                                    const formData = new FormData()
                                    formData.append("file", file)
                                    
                                    try {
                                        const res = await uploadQRCode(formData)
                                        if (res.success && res.path) {
                                            setTrcQr(res.path)
                                            setMessage("Image uploaded! Don't forget to click Save.")
                                        } else {
                                            setMessage(res.error || "Upload failed")
                                        }
                                    } catch (err) {
                                        setMessage("Upload error")
                                    }
                                    setLoading(false)
                                }}
                                className="block w-full text-sm text-muted-foreground
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-600 dark:file:text-blue-400
                                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                                  mb-2 cursor-pointer
                                "
                             />
                             <p className="text-xs text-muted-foreground/60">Current Path: <span className="font-mono break-all">{trcQr}</span></p>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={() => handleSave("TRC20")}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                      {loading ? "Saving..." : "Save TRC20 Settings"}
                  </button>
              </div>
          </div>

          {/* BINANCE EDITOR */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 p-2 rounded-lg"><QrCodeIcon className="w-5 h-5"/></span>
                  Binance Pay Settings
              </h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Binance User ID / Pay ID</label>
                      <input 
                          type="text" 
                          value={binanceAddress}
                          onChange={(e: any) => setBinanceAddress(e.target.value)}
                          className="w-full p-3 border border-input rounded-xl font-mono text-sm bg-muted/30 text-foreground outline-none focus:border-yellow-500 transition-all"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-muted-foreground mb-1">Binance QR Code Image</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-full sm:w-20 h-20 bg-muted/30 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                <img src={binanceQr} alt="Binance QR" className="w-full h-full object-contain mx-auto" />
                          </div>
                          <div className="flex-1 w-full">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e: any) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    
                                    setLoading(true)
                                    setMessage("Uploading...")
                                    
                                    const formData = new FormData()
                                    formData.append("file", file)
                                    
                                    try {
                                        const res = await uploadQRCode(formData)
                                        if (res.success && res.path) {
                                            setBinanceQr(res.path)
                                            setMessage("Binance QR uploaded! Don't forget to click Save.")
                                        } else {
                                            setMessage(res.error || "Upload failed")
                                        }
                                    } catch (err) {
                                        setMessage("Upload error")
                                    }
                                    setLoading(false)
                                }}
                                className="block w-full text-sm text-muted-foreground
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-yellow-50 dark:file:bg-yellow-900/30 file:text-yellow-600 dark:file:text-yellow-400
                                  hover:file:bg-yellow-100 dark:hover:file:bg-yellow-900/50
                                  mb-2 cursor-pointer
                                "
                             />
                             <p className="text-xs text-muted-foreground/60">Current Path: <span className="font-mono break-all">{binanceQr}</span></p>
                          </div>
                      </div>
                  </div>
                  <button 
                      onClick={() => handleSave("BINANCE")}
                      disabled={loading}
                      className="px-6 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                  >
                      {loading ? "Saving..." : "Save Binance Settings"}
                  </button>
              </div>
          </div>
      </div>
  )
}
