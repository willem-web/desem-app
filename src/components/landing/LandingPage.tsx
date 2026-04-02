import { BreadIcon, WheatIcon, ClockIcon, FlaskIcon, ThermometerIcon, CheckIcon, MoonIcon, SunIcon } from '@/components/ui/Icons';

export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh bg-warm-50 flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-bread-300 via-bread-400 to-bread-600 text-white px-8 pt-16 pb-12 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-5 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <BreadIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Desem</h1>
          <p className="text-white/80 text-[15px] leading-relaxed max-w-[280px] mx-auto">
            Jouw persoonlijke zuurdesem-assistent. Van starter tot vers brood.
          </p>
        </div>
      </div>

      {/* Value proposition */}
      <div className="px-7 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-[var(--shadow-elevated)] p-6 border border-warm-100">
          <h2 className="text-[17px] font-bold text-warm-800 mb-1">Perfecte timing, elke keer</h2>
          <p className="text-warm-400 text-[13px] leading-relaxed">
            Desem berekent alle staptijden op basis van jouw kamertemperatuur, starter en meelkeuze.
            Wetenschappelijk onderbouwd met het Q10-fermentatiemodel.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="px-7 pt-7 pb-4 space-y-4 flex-1">
        <h3 className="text-[11px] text-warm-400 uppercase tracking-wider font-bold">Wat kan Desem?</h3>

        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={<ClockIcon className="w-5 h-5 text-bread-500" />}
            title="Slimme timers"
            desc="Automatische staptijden met meldingen"
          />
          <FeatureCard
            icon={<ThermometerIcon className="w-5 h-5 text-bread-500" />}
            title="Temperatuur­model"
            desc="Q10-berekening past tijden aan op jouw keuken"
          />
          <FeatureCard
            icon={<WheatIcon className="w-5 h-5 text-olive-500" />}
            title="6 recepten"
            desc="Van beginner landbrood tot volkoren en spelt"
          />
          <FeatureCard
            icon={<FlaskIcon className="w-5 h-5 text-lav-500" />}
            title="Wetenschap"
            desc="pH-curves, fermentatie­grafieken en uitleg per stap"
          />
          <FeatureCard
            icon={<MoonIcon className="w-5 h-5 text-lav-500" />}
            title="Nacht­planning"
            desc="Slimme planning: geen actieve stappen tussen 22-06u"
          />
          <FeatureCard
            icon={<SunIcon className="w-5 h-5 text-bread-500" />}
            title="Warm of koud"
            desc="Kies je route: zelfde dag bakken of overnacht"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <MiniFeature icon={<CheckIcon className="w-3.5 h-3.5 text-emerald-500" />} label="Baklogboek" />
          <MiniFeature icon={<CheckIcon className="w-3.5 h-3.5 text-emerald-500" />} label="Voorraad" />
          <MiniFeature icon={<CheckIcon className="w-3.5 h-3.5 text-emerald-500" />} label="Offline PWA" />
        </div>
      </div>

      {/* CTA */}
      <div className="px-7 pb-10 pt-4">
        <button onClick={onStart}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-bread-400 to-bread-500 text-white font-bold text-[18px] shadow-[var(--shadow-elevated)] active:scale-[0.98] transition-transform">
          Begin met bakken
        </button>
        <p className="text-center text-warm-300 text-[12px] mt-3">
          Gratis &middot; Geen account nodig &middot; Werkt offline
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-warm-100 p-4 shadow-[var(--shadow-card)]">
      <div className="w-9 h-9 rounded-xl bg-warm-50 flex items-center justify-center mb-2.5">
        {icon}
      </div>
      <div className="font-bold text-warm-800 text-[13px] leading-tight mb-1">{title}</div>
      <div className="text-warm-400 text-[11px] leading-snug">{desc}</div>
    </div>
  );
}

function MiniFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white rounded-xl border border-warm-100 px-3 py-2.5 shadow-sm">
      {icon}
      <span className="text-warm-600 text-[11px] font-medium">{label}</span>
    </div>
  );
}
