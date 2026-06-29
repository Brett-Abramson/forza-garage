import { FeatureLightboxImage } from '@/components/FeatureLightboxImage'

interface Feature {
  title: string
  body: string
  badge?: string
  imageSrc?: string
  imageAlt?: string
  imageContain?: boolean
}

const FEATURES: Feature[] = [
  {
    title: "Browse the full car list",
    body: "Every car in Forza Horizon 6 is here — over 600 of them — filterable by class, PI, division, country, and drivetrain. The Stats view surfaces the raw numbers: power, torque, weight, and the in-game performance bars, all sortable. Use it to compare cars before you buy, or to find out what you're actually looking at when something shows up in a wheelspin.",
    imageSrc: "/features/car-database-cards.jpg",
    imageAlt: "Car Database — card grid view showing owned cars with PI class, drivetrain, and race type badges",
  },
  {
    title: "Track what you own",
    body: "Add cars to your garage to keep a running record of your collection. Pin the ones you reach for most, jot notes on builds or tunes you've tried, and tag cars by how you use them. The garage shows you how far through the full list you are and sorts by when you added things, so recently acquired cars are always at the top.",
    imageSrc: "/features/my-garage.png",
    imageAlt: "My Garage — table view showing owned cars with stats, sorted by PI",
  },
  {
    title: "Find the right car for a race",
    body: "Each race discipline has different demands — road racing rewards braking and handling, cross country punishes anything without offroad and launch, drag racing is almost entirely about launch and weight. The Races section breaks down what each type actually needs, what to avoid, and which PI range is competitive. Open a race type while browsing your garage and the list filters instantly to your matching cars.",
    imageSrc: "/features/car-database.webp",
    imageAlt: "Car Database — Stats view with filter sidebar open, showing sortable performance columns",
  },
  {
    title: "Understand a car's strengths and weaknesses",
    body: "The car drawer shows where each stat sits relative to other cars in the same PI class — green means a genuine strength to build on, red means something to tune around or a race type to avoid. This is stock data, so treat it as a starting point for build decisions rather than a final verdict.",
    imageSrc: "/features/car-drawer-stats.png",
    imageAlt: "Car drawer — performance stat bars with green/red class-rank highlights and simulation metrics",
    imageContain: true,
  },
  {
    title: "Build and tune guides",
    badge: "in progress",
    body: "Upgrade paths and tuning priorities by race type and PI class — which parts matter most, in what order, and why. Not exhaustive, but enough to point you in the right direction when you're starting a new build.",
  },
]

// Set alternateImages to false to place all image panels on the right.
export function FeatureHighlights({ alternateImages = true }: { alternateImages?: boolean }) {
  return (
    <section id="features" className="max-w-screen-2xl mx-auto px-4 py-16">
      <div className="flex flex-col gap-16">
        {FEATURES.map((feature, i) => {
          // 1-indexed odd sections (indices 0, 2, 4) → image on right (default)
          // 1-indexed even sections (indices 1, 3) → image on left (flex-row-reverse)
          const reverseRow = alternateImages && i % 2 === 1

          return (
            <div key={i}>
              <div
                className={`flex flex-col md:items-start gap-8 md:gap-12${reverseRow ? ' md:flex-row-reverse' : ' md:flex-row'}`}
              >
                {/* Text panel — ~65% */}
                <div className="md:flex-[56] min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-fh-dark">{feature.title}</h3>
                    {feature.badge && (
                      <span className="text-xs text-fh-muted border border-fh-border rounded-full px-2 py-0.5 shrink-0 leading-none">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-fh-muted">{feature.body}</p>
                </div>

                {/* Image panel — ~35% */}
                <div className="md:flex-[44] w-full shrink-0">
                  {feature.imageSrc ? (
                    <FeatureLightboxImage
                      src={feature.imageSrc}
                      alt={feature.imageAlt ?? feature.title}
                      slot={i}
                      contain={feature.imageContain}
                    />
                  ) : (
                    <div
                      className="w-full min-h-[220px] rounded-xl border-2 border-dashed border-fh-border bg-fh-panel"
                      data-image-slot={i}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
