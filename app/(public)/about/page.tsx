
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Mission */}
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            To redefine the future of digital finance and online earning by providing a secure, 
            accessible, and robust environment for wealth creation.
          </p>
        </section>

        {/* Ecosystem */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">The Let'$Earnify Ecosystem</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Start Small" desc="Begin your journey with just a $1 deposit into our Mudaraba pool." />
            <Card title="Task Center" desc="Earn actively by completing simple digital tasks." />
            <Card title="Marketplace" desc="Sell your micro-skills to a global audience." />
            <Card title="Passive Growth" desc="Benefit from ethical, profit-sharing investment pools." />
          </div>
        </section>

        {/* Values */}
        <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Core Values</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold">Security First</h3>
            </div>
            <div>
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="font-semibold">Community</h3>
            </div>
            <div>
              <div className="text-3xl mb-2">⚖️</div>
              <h3 className="font-semibold">Integrity</h3>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function Card({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400">{desc}</p>
    </div>
  )
}
