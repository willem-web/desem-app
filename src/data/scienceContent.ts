import type { StageId } from '@/types';

interface ScienceEntry {
  title: string;
  paragraphs: string[];
  keyFact?: string;
}

export const scienceContent: Record<StageId, ScienceEntry> = {
  levain: {
    title: 'De Microbiële Ecologie van de Starter',
    paragraphs: [
      'Een zuurdesemstarter is een stabiele cultuur van micro-organismen: melkzuurbacteriën (LAB) domineren met een factor 10-100 ten opzichte van gisten. De stabiliteit berust op een gebrek aan competitie: LAB prefereren maltose, terwijl gisten glucose en fructose consumeren.',
      'De voedingsratio bepaalt de kinetiek. Bij 1:1:1 fermenteert de starter snel (piek in 4-6 uur) maar met risico op overmatige verzuring. Bij 1:10:10 wordt de piek vertraagd tot 10-12 uur, ideaal voor overnacht. De hogere ratio buffert de aciditeit en houdt de gistpopulatie vitaal.',
      'De Float Test werkt omdat actieve gisten CO2 insluiten in de gluten/zetmeelmatrix, waardoor de dichtheid onder die van water daalt. Een rijpe starter heeft een pH tussen 3.7 en 3.9.',
    ],
    keyFact: 'Lactobacillus en Kazachstania-gisten vormen de climaxgemeenschap na 10-14 dagen.',
  },
  autolyse: {
    title: 'Passieve Glutenontwikkeling',
    paragraphs: [
      'Tijdens autolyse hydrateren de eiwitten gliadine en glutenine passief. Water diffundeert in de poreuze biopolymeren, wat de vorming van een prematuur glutennetwerk initieert zonder mechanische arbeid.',
      'Tegelijkertijd activeren proteasen die de grootste glutenine-macropolymeren versoepelen. Dit verhoogt de extensibiliteit (rekbaarheid) en verlaagt de elasticiteit, waardoor het deeg makkelijker te vormen is en minder kneedwerk nodig heeft.',
      'Door zout en starter nog niet toe te voegen, voorkom je dat fermentatie al begint en dat zout de hydratatie verstoort.',
    ],
    keyFact: 'Autolyse vermindert de kneedtijd met 30-50% en behoudt carotenoïden (smaakstoffen) die bij agressief kneden oxideren.',
  },
  mengen: {
    title: 'Glutenarchitectuur en Zoutchemie',
    paragraphs: [
      'Bij het mengen ontvouwen de sferische glutenine-deeltjes zich tot lange filamenten die een driedimensionaal netwerk vormen. De disulfidebindingen tussen eiwitketens creëren de matrix die gasbellen vasthoudt.',
      'Zout is niet slechts smaakmaker maar een structurele regulator. Chloride-ionen schermen de positieve ladingen op gluteneiwitten af, waardoor de afstotende krachten verdwijnen en de strengen nauwer binden. Dit versterkt het glutennetwerk.',
      'Via osmose onttrekt zout water aan microbiële cellen, wat de fermentatiesnelheid met ~10% vertraagt. Dit geeft de bakker meer controle over het proces.',
    ],
    keyFact: 'De Windowpane Test bewijst dat gluteninefilamenten volledig uitgelijnd zijn en een continu netwerk vormen.',
  },
  bulk: {
    title: 'Fermentatiekinetiek en Gasvorming',
    paragraphs: [
      'Gisten zetten hexosen om via glycolyse tot ethanol en CO2. Dit gas diffundeert in de microscopische luchtbellen die tijdens het mengen zijn ingesloten. LAB dragen bij via het heterofermentatieve pad: maltose wordt omgezet in melkzuur, azijnzuur, ethanol en CO2.',
      'De fermentatiesnelheid volgt de Q10-regel: elke 5°C stijging verdubbelt de snelheid. Bij warm deeg (27°C+) stop je al bij 30-50% volumetoename, omdat het deeg doorgist tijdens het vormen. Bij koel deeg (21°C) kun je tot 75-100% laten rijzen.',
      'Proteolyse vindt gelijktijdig plaats: bloemproteasen en microbiële peptidases breken eiwitten af. Dit verzacht het glutennetwerk, verhoogt de extensibiliteit, en produceert vrije aminozuren als smaakvorstoffen voor de Maillard-reactie bij het bakken.',
    ],
    keyFact: 'De mate van gewenste rijzing correleert omgekeerd met de deegtemperatuur.',
  },
  stretch_fold: {
    title: 'Gluten Alignment zonder Degassing',
    paragraphs: [
      'In plaats van agressief kneden lijnen stretches and folds de glutenstrengen uit en creëren een gelaagde structuur die gasbellen effectiever insluit.',
      'Dit verhoogt de elasticiteit (terugvering) terwijl de extensibiliteit (rekbaarheid) behouden blijft. Het deeg ontwikkelt "body" zonder dat de bestaande gascelstructuur wordt vernietigd.',
      'Na 4-6 sets is het deeg glad, strak, en vertoont het zichtbare luchtbellen aan de zijkant van de bak.',
    ],
  },
  voorvormen: {
    title: 'Oppervlaktespanning',
    paragraphs: [
      'Het vormen creëert oppervlaktespanning die essentieel is voor een verticale ovenspring. De "huid" van het deeg wordt strakgetrokken om de gasdruk verticaal te geleiden.',
      'Een unieke eigenschap van goed ontwikkeld tarwedeeg is "strain hardening": de weerstand tegen uitrekking neemt toe naarmate het verder wordt uitgerekt. Dit voorkomt dat de wanden tussen gasbellen te dun worden en knappen.',
    ],
  },
  bankrust: {
    title: 'Glutenrelaxatie',
    paragraphs: [
      'Na het voorvormen zijn de glutenstrengen gespannen. Tijdens de bankrust relaxeren de elastische componenten, waardoor het deeg makkelijker zijn definitieve vorm kan krijgen zonder terug te trekken.',
      'Het deeg zal iets uitspreiden - dat is normaal en wijst op de juiste balans tussen elasticiteit en extensibiliteit.',
    ],
  },
  eindvormen: {
    title: 'Structurele Integriteit',
    paragraphs: [
      'De definitieve vorming bouwt maximale oppervlaktespanning op. De strakke "huid" is cruciaal: het stuurt de gasexpansie in de oven verticaal in plaats van horizontaal.',
      'Bij spelt is dit extra kritiek door de zwakkere glutenkwaliteit (hogere gliadine/glutenine-ratio van 3.5 vs. 2 bij tarwe). Speltdeeg heeft minder oppervlaktespanning en loopt sneller uit.',
    ],
  },
  koude_rijs: {
    title: 'Biochemie van Koude Retardatie',
    paragraphs: [
      'In de koelkast (3-4°C) vertraagt de gistactiviteit sterker dan die van melkzuurbacteriën. Dit bevordert de opbouw van organische zuren, met name azijnzuur, wat een complexer smaakprofiel geeft.',
      'Enzymatische actie gaat door bij lage temperatuur: proteasen versoepelen het gluten (proteolyse), amylasen breken zetmeel af. De pH daalt geleidelijk naar ~4.0.',
      'De Poke Test meet de visco-elastische staat: langzaam, gedeeltelijk herstel (~10 seconden) wijst op de optimale balans tussen opgebouwde gasdruk en gecontroleerde enzymatische verzwakking van het glutennetwerk.',
    ],
    keyFact: 'Langer retarderen (16-24u) geeft merkbaar meer azijnzuur en een dieper, complexer smaakprofiel.',
  },
  bakken_stoom: {
    title: 'Ovenspring en de Wet van Charles',
    paragraphs: [
      'In de eerste 10-15 minuten zet CO2 uit volgens de Wet van Charles: V/T = constant. De snelle temperatuurstijging zorgt voor een volumetoename van wel 30%. Ethanol verdampt ook, wat extra druk geeft.',
      'Stoom condenseert op het koelere deegoppervlak met drie effecten: (1) condensatie geeft latente warmte af en versnelt de opwarming, (2) de vochtige laag houdt het oppervlak rekbaar waardoor het deeg langer kan uitzetten, (3) zetmeelverstijfseling bij 60-80°C vormt een dunne gel-laag aan het oppervlak.',
      'De score (insnijding) bepaalt waar het gas ontsnapt en stuurt de ovenspring. Een goede "ear" ontstaat doordat de score-lip omhoog wordt geduwd door de gasexpansie.',
    ],
    keyFact: 'Gistcellen sterven bij ~60°C, maar het gas zet nog door tot de zetmeel bij 80°C volledig gelatiniseert en de structuur fixeert.',
  },
  bakken_droog: {
    title: 'Maillard-reactie en Caramelisatie',
    paragraphs: [
      'Boven 100°C treden niet-enzymatische bruiningsreacties op. De Maillard-reactie (interactie tussen aminozuren en reducerende suikers) produceert complexe aromamoleculen en bruine pigmenten (melanoïdinen). Dit is de primaire bron van broodaroma.',
      'Boven 170°C ontleden suikers direct via caramelisatie, wat bijdraagt aan de donkere kleur en bittere, nootachtige tonen van de korst.',
      'De kerntemperatuur moet 92-96°C bereiken: dit is het punt waarbij de kruimstructuur definitief is "gezet" doordat het zetmeel volledig is gegelatiniseerd en het water gebonden is.',
    ],
    keyFact: 'De korst is een glasachtige structuur: de gel-laag uit de stoomfase droogt uit tot een brosse, knapperige laag.',
  },
  afkoelen: {
    title: 'Vochtmigratie en Zetmeelretrogradatie',
    paragraphs: [
      'Het bakproces stopt niet bij het uitnemen uit de oven. Vocht migreert van de warme, vochtige kruim naar de droge korst. Te vroeg snijden verstoort dit proces en maakt de kruim gummi-achtig.',
      'Zetmeelretrogradatie is het herordenen van verstijfselde amylose- en amylopectineketens in een kristallijne structuur. Amylose kristalliseert snel (binnen uren), wat de initiële stevigheid geeft. Amylopectine kristalliseert over dagen, wat leidt tot het "oud" worden van brood.',
      'Invriezen stopt dit proces door de moleculaire mobiliteit te minimaliseren. Tip: snijd het brood in plakken en vries in - ontdooi per portie.',
    ],
    keyFact: 'Wacht minimaal 1-2 uur voor het aansnijden. De textuur verbetert nog tot 4-6 uur na het bakken.',
  },
};
