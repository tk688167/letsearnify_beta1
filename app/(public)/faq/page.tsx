import { ChevronDownIcon } from "@heroicons/react/24/outline"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          <FAQItem 
            question="What is the 'Hybrid Business Model'?" 
            answer="Our model combines active earning (tasks, freelancing) with passive ethical investments (Mudaraba), allowing multiple income streams on one platform."
          />
          <FAQItem 
            question="Is my deposit safe?"
            answer="Yes, we prioritize security. Your $1 deposit unlocks the platform and is allocated to the Mudaraba pool, which is backed by real-world assets."
          />
          <FAQItem 
            question="How do I withdraw earnings?"
            answer="Withdrawals can be requested from your Wallet page once you meet the minimum threshold. We support TRC20 and other methods."
          />
          <FAQItem 
            question="What is Mudaraba?"
            answer="Mudaraba is a profit-sharing partnership. You provide capital, and we (or our partners) provide expertise. Profits are shared at a pre-agreed ratio."
          />
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <summary className="flex justify-between items-center p-6 cursor-pointer bg-zinc-50 dark:bg-zinc-900 font-medium">
        {question}
        <span className="transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="p-6 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
        {answer}
      </div>
    </details>
  )
}
