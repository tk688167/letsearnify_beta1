import Image from "next/image"

export function QRCode({ network, imagePath }: { network: string, imagePath: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-sm w-full">
      {/* QR image stays on white bg for scanner readability */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm relative w-40 h-40 sm:w-48 sm:h-48 mb-3 sm:mb-4">
         <Image 
            src={imagePath} 
            alt={`QR Code for ${network}`}
            fill
            className="object-contain p-2"
         />
      </div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Scan to Pay with</div>
      <div className="text-base sm:text-lg font-bold text-foreground">{network}</div>
    </div>
  )
}
