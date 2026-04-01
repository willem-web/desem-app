import type { StageId } from '@/types';
import { useBread } from '@/context/BreadContext';
import { FermentationCurve } from './FermentationCurve';
import { PhEstimate } from './PhEstimate';
import { AcidRatioGauge } from './AcidRatioGauge';

interface ActiveProcess {
  icon: string;
  name: string;
  type: 'biologisch' | 'chemisch' | 'fysisch';
  description: string;
  intensity: number;
}

const typeColors = {
  biologisch: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-600', bar: 'bg-green-400' },
  chemisch: { bg: 'bg-lav-50', border: 'border-lav-200', text: 'text-lav-700', badge: 'bg-lav-100 text-lav-600', bar: 'bg-lav-400' },
  fysisch: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-600', bar: 'bg-blue-400' },
};

function getActiveProcesses(stageId: StageId): ActiveProcess[] {
  switch (stageId) {
    case 'levain':
      return [
        { icon: '\u{1F9EC}', name: 'Microbiële groei', type: 'biologisch', description: 'Melkzuurbacteriën (LAB) en wilde gisten vermenigvuldigen exponentieel. LAB domineren 10-100x t.o.v. gisten.', intensity: 90 },
        { icon: '\u{1F9EA}', name: 'Melkzuurproductie', type: 'chemisch', description: 'LAB produceren melkzuur en azijnzuur. De pH daalt van ~6.0 naar 3.7-3.9.', intensity: 80 },
        { icon: '\u{1F4A8}', name: 'CO\u2082-productie', type: 'biologisch', description: 'Gisten zetten suikers om in CO\u2082 en ethanol via glycolyse. Dit veroorzaakt de volumetoename.', intensity: 70 },
        { icon: '\u{1F52C}', name: 'Enzymatische afbraak', type: 'chemisch', description: 'Amylasen breken zetmeel af tot maltose en glucose — brandstof voor de micro-organismen.', intensity: 50 },
      ];
    case 'autolyse':
      return [
        { icon: '\u{1F4A7}', name: 'Hydratatie', type: 'fysisch', description: 'Water diffundeert in de bloempartikels. Gliadine en glutenine absorberen water en beginnen een netwerk te vormen.', intensity: 95 },
        { icon: '\u{1F9EC}', name: 'Protease-activiteit', type: 'chemisch', description: 'Proteasen knippen de grootste glutenine-polymeren, wat de extensibiliteit verhoogt zonder kneden.', intensity: 60 },
        { icon: '\u{1F52C}', name: 'Amylase-activiteit', type: 'chemisch', description: '\u03B1- en \u03B2-amylase beginnen zetmeel af te breken tot fermenteerbare suikers.', intensity: 40 },
      ];
    case 'mengen':
      return [
        { icon: '\u{1F4AA}', name: 'Glutenvorming', type: 'fysisch', description: 'Glutenine-deeltjes ontvouwen tot filamenten en vormen een 3D-netwerk via disulfidebindingen.', intensity: 95 },
        { icon: '\u{1F9C2}', name: 'Zouteffect (NaCl)', type: 'chemisch', description: 'Chloride-ionen schermen ladingen af op gluten → strengen binden nauwer. Osmose vertraagt fermentatie ~10%.', intensity: 80 },
        { icon: '\u{1F4A8}', name: 'Luchtinsluiting', type: 'fysisch', description: 'Tijdens het mengen worden microscopische luchtbellen ingesloten — de kernen voor latere gasexpansie.', intensity: 70 },
      ];
    case 'bulk':
      return [
        { icon: '\u{1F4A8}', name: 'CO\u2082-productie (gist)', type: 'biologisch', description: 'Gisten zetten hexosen om: C\u2086H\u2081\u2082O\u2086 \u2192 2C\u2082H\u2085OH + 2CO\u2082. Het gas diffundeert in de luchtbellen.', intensity: 90 },
        { icon: '\u{1F9EA}', name: 'Melkzuurfermentatie', type: 'biologisch', description: 'Heterofermentatieve LAB produceren melkzuur, azijnzuur, ethanol en CO\u2082 uit maltose.', intensity: 85 },
        { icon: '\u{1F52C}', name: 'Proteolyse', type: 'chemisch', description: 'Eiwitten worden afgebroken tot aminozuren — precursors voor Maillard-aromavorming bij het bakken.', intensity: 60 },
        { icon: '\u{1F388}', name: 'Bellendynamica', type: 'fysisch', description: 'Laplace-druk: kleine bellen → hoge druk → gas migreert naar grote bellen (disproportionaliteit).', intensity: 70 },
        { icon: '\u{1F9EC}', name: 'Fenolisch metabolisme', type: 'chemisch', description: 'LAB metaboliseren ferulazuur uit graancelwanden tot bioactieve antioxidanten.', intensity: 30 },
      ];
    case 'stretch_fold':
      return [
        { icon: '\u{1F4AA}', name: 'Gluten alignment', type: 'fysisch', description: 'Glutenstrengen worden uitgelijnd in een gelaagde structuur die gasbellen effectiever insluit.', intensity: 95 },
        { icon: '\u{1F388}', name: 'Strain hardening', type: 'fysisch', description: 'De weerstand van het deeg neemt toe bij uitrekking — voorkomt dat belwanden knappen.', intensity: 80 },
        { icon: '\u{1F4A8}', name: 'Gasherstructurering', type: 'fysisch', description: 'Grote bellen worden opgedeeld in kleinere, gelijkmatigere bellen → fijnere kruimstructuur.', intensity: 70 },
      ];
    case 'voorvormen':
    case 'eindvormen':
      return [
        { icon: '\u{1F3AF}', name: 'Oppervlaktespanning', type: 'fysisch', description: 'De "huid" wordt strakgetrokken om gasdruk verticaal te geleiden voor ovenspring.', intensity: 90 },
        { icon: '\u{1F4AA}', name: 'Strain hardening', type: 'fysisch', description: 'Het glutennetwerk wordt sterker naarmate het meer wordt uitgerekt.', intensity: 75 },
      ];
    case 'bankrust':
      return [
        { icon: '\u{1F4A4}', name: 'Glutenrelaxatie', type: 'fysisch', description: 'Elastische componenten ontspannen. Het deeg wordt makkelijker te vormen zonder terug te trekken.', intensity: 80 },
        { icon: '\u{1F4A8}', name: 'Doorlopende fermentatie', type: 'biologisch', description: 'Gisten en LAB blijven actief — langzame CO\u2082-productie gaat door.', intensity: 40 },
      ];
    case 'koude_rijs':
      return [
        { icon: '\u{2744}\uFE0F', name: 'Gistremming', type: 'biologisch', description: 'Bij 3-4°C vertraagt gistactiviteit sterk. CO\u2082-productie daalt met >80%.', intensity: 20 },
        { icon: '\u{1F9EA}', name: 'LAB-doorwerking', type: 'biologisch', description: 'Melkzuurbacteriën blijven actiever dan gist bij koude → meer organische zuren, vooral azijnzuur.', intensity: 65 },
        { icon: '\u{1F52C}', name: 'Proteolyse (koud)', type: 'chemisch', description: 'Proteasen werken langzaam door: gluten versoepelt, vrije aminozuren bouwen op.', intensity: 50 },
        { icon: '\u{1F3B5}', name: 'Aromaontwikkeling', type: 'chemisch', description: 'Complexe aroma-precursors vormen zich — dit is waar de diepe smaak van desem ontstaat.', intensity: 75 },
      ];
    case 'bakken_stoom':
      return [
        { icon: '\u{1F4A5}', name: 'Ovenspring (Charles)', type: 'fysisch', description: 'Gas zet uit volgens V/T = constant. De snelle temperatuurstijging geeft tot 30% volumetoename.', intensity: 95 },
        { icon: '\u{1F4A8}', name: 'Ethanolverdamping', type: 'fysisch', description: 'Ethanol verdampt en geeft extra druk op de bellen, bovenop de CO\u2082-expansie.', intensity: 80 },
        { icon: '\u{2601}\uFE0F', name: 'Stoomcondensatie', type: 'fysisch', description: 'Stoom condenseert op het koele deeg → latente warmte versnelt opwarming, houdt oppervlak rekbaar.', intensity: 90 },
        { icon: '\u{1F52C}', name: 'Zetmeelgelatinisatie', type: 'chemisch', description: 'Bij 60-80°C zwellen zetmeelgranules en vormen een glanzende gel-laag op het oppervlak.', intensity: 70 },
        { icon: '\u{2620}\uFE0F', name: 'Micro-organismen sterven', type: 'biologisch', description: 'Bij ~60°C sterven gistcellen. De fermentatie stopt definitief.', intensity: 100 },
      ];
    case 'bakken_droog':
      return [
        { icon: '\u{1F36B}', name: 'Maillard-reactie', type: 'chemisch', description: 'Aminozuren + reducerende suikers → melanoïdinen (bruine kleur) + honderden aromamoleculen. Start >100°C.', intensity: 95 },
        { icon: '\u{1F36F}', name: 'Caramelisatie', type: 'chemisch', description: 'Boven 170°C ontleden suikers direct → donkere kleur, bittere en nootachtige tonen.', intensity: 70 },
        { icon: '\u{1F525}', name: 'Korstvorming', type: 'fysisch', description: 'De gel-laag uit de stoomfase droogt uit tot een brosse, glasachtige structuur.', intensity: 85 },
        { icon: '\u{1F321}\uFE0F', name: 'Kernfixatie (96°C)', type: 'fysisch', description: 'Bij kerntemp 92-96°C is het zetmeel volledig gegelatiniseerd en de kruimstructuur gefixeerd.', intensity: 60 },
      ];
    case 'afkoelen':
      return [
        { icon: '\u{1F4A7}', name: 'Vochtmigratie', type: 'fysisch', description: 'Vocht migreert van de warme kruim naar de droge korst. Te vroeg snijden = gummi-achtige kruim.', intensity: 80 },
        { icon: '\u{2744}\uFE0F', name: 'Amylose-retrogradatie', type: 'chemisch', description: 'Amyloseketens kristalliseren snel (binnen uren) → geeft de initiële stevigheid aan de kruim.', intensity: 70 },
        { icon: '\u{23F3}', name: 'Amylopectine-retrogradatie', type: 'chemisch', description: 'Kristalliseert over dagen → het "oud worden" van brood. Invriezen stopt dit proces.', intensity: 30 },
      ];
    default:
      return [];
  }
}

export function StepCharts() {
  const { process, currentStage } = useBread();
  if (!process || !currentStage) return null;

  const processes = getActiveProcesses(currentStage.id);
  const showBulkCharts = ['bulk', 'stretch_fold'].includes(currentStage.id);
  const showColdCharts = currentStage.id === 'koude_rijs';

  return (
    <div className="space-y-5">
      {/* Active processes */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wider text-warm-400 font-semibold mb-4 px-1">
          Actieve processen — {currentStage.name}
        </h3>
        <div className="space-y-3">
          {processes.map((proc, i) => {
            const colors = typeColors[proc.type];
            return (
              <div key={i} className={`${colors.bg} rounded-2xl border ${colors.border}/60 p-5 shadow-[var(--shadow-card)]`}>
                <div className="flex items-start gap-3.5">
                  <span className="text-xl flex-shrink-0 mt-0.5">{proc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`font-semibold text-[14px] ${colors.text}`}>{proc.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                        {proc.type}
                      </span>
                    </div>
                    <p className="text-[13px] text-warm-600 leading-relaxed">{proc.description}</p>
                    {/* Intensity bar */}
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                          style={{ width: `${proc.intensity}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-warm-400 font-mono w-8 text-right">
                        {proc.intensity}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk fermentation charts */}
      {showBulkCharts && (
        <>
          <FermentationCurve />
          <PhEstimate />
          <AcidRatioGauge />
        </>
      )}

      {/* Cold retard charts */}
      {showColdCharts && (
        <AcidRatioGauge />
      )}
    </div>
  );
}
