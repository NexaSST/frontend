import { useState } from 'react';
import { Select } from '../../components/ui/FormControls.js';
import { guideWhatsAppUrl, moduleLabels, painLabels, recommendOffer, volumeOptions } from './recommendOffer.js';
import type { ModuleInterest, Pain, VolumeKey, Volumes } from './recommendOffer.js';

const modules: ModuleInterest[] = ['training', 'inspections', 'apr', 'confined-spaces'];
const pains: Pain[] = ['deadlines', 'evidence', 'field'];

const volumeFields: ReadonlyArray<{
  key: VolumeKey;
  label: string;
  forModule: ModuleInterest;
}> = [
  { key: 'people', label: 'Colaboradores', forModule: 'training' },
  { key: 'inspectors', label: 'Inspetores', forModule: 'inspections' },
  { key: 'assets', label: 'Ativos', forModule: 'inspections' },
  { key: 'permits', label: 'APR/PT por mês', forModule: 'apr' },
];

export function OfferGuide() {
  const [pain, setPain] = useState<Pain | ''>('');
  const [selectedModules, setSelectedModules] = useState<ModuleInterest[]>([]);
  const [volumes, setVolumes] = useState<Volumes>({});
  const result = recommendOffer(selectedModules, volumes);

  function toggleModule(module: ModuleInterest) {
    setSelectedModules((current) => current.includes(module) ? current.filter((item) => item !== module) : [...current, module]);
  }

  function updateVolume(key: VolumeKey, value: string) {
    setVolumes((current) => ({ ...current, [key]: value ? Number(value) : undefined }));
  }

  return (
    <section className="landing-v0__guide" id="guia" aria-labelledby="guide-title">
      <header>
        <div>
          <span className="landing-v0__eyebrow">Encontre um ponto de partida</span>
          <h2 id="guide-title">Conte onde a rotina aperta.</h2>
        </div>
        <p>Três respostas ajudam a preparar uma demonstração com a sua operação. A indicação não substitui uma proposta comercial.</p>
      </header>

      <div className="landing-v0__guide-layout">
        <div className="landing-v0__guide-fields">
          <fieldset>
            <legend><span>01</span> Qual desafio pesa mais hoje?</legend>
            <div className="landing-v0__guide-options">
              {pains.map((item) => (
                <label key={item} className={pain === item ? 'is-selected' : undefined}>
                  <input type="radio" name="landing-pain" value={item} checked={pain === item} onChange={() => setPain(item)} />
                  <span>{painLabels[item]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend><span>02</span> Quais frentes você quer organizar?</legend>
            <div className="landing-v0__guide-options landing-v0__guide-options--modules">
              {modules.map((module) => (
                <label key={module} className={selectedModules.includes(module) ? 'is-selected' : undefined}>
                  <input type="checkbox" value={module} checked={selectedModules.includes(module)} onChange={() => toggleModule(module)} />
                  <span>{moduleLabels[module]}</span>
                </label>
              ))}
            </div>
            <p className="landing-v0__guide-help">Ergonomia já integra a oferta dos combos e será disponibilizada em breve.</p>
          </fieldset>

          <fieldset>
            <legend><span>03</span> Qual é a escala aproximada?</legend>
            <div className="landing-v0__guide-volumes">
              {volumeFields.filter((field) => selectedModules.includes(field.forModule)).map((field) => (
                <div className="landing-v0__guide-volume" key={field.key}>
                  <span>{field.label}</span>
                  <Select aria-label={field.label} className="landing-v0__guide-select" menuClassName="landing-v0__guide-select-menu" value={volumes[field.key] ?? ''} onChange={(event) => updateVolume(field.key, event.target.value)}>
                    <option value="">Não sei informar</option>
                    {volumeOptions[field.key].map(([label, value]) => <option value={value} key={value}>{label}</option>)}
                  </Select>
                </div>
              ))}
              {!volumeFields.some((field) => selectedModules.includes(field.forModule)) && <p>Selecione uma frente acima para ver as faixas relevantes. Se o interesse é só em espaços confinados, definimos o escopo na conversa.</p>}
            </div>
          </fieldset>
        </div>

        <aside className="landing-v0__guide-result" aria-live="polite" aria-atomic="true">
          <span>Indicação de oferta</span>
          {result ? <>
            <h3>{result.title}</h3>
            <p>{result.reason}</p>
          </> : <>
            <h3>Comece pelo que precisa mudar.</h3>
            <p>Escolha uma frente de interesse. Mostraremos um ponto de partida para a demonstração, sem fechar seu escopo por você.</p>
          </>}
          <a className="landing-v0__cta" href={guideWhatsAppUrl(pain, selectedModules, volumes, result)} target="_blank" rel="noreferrer">Agendar demonstração</a>
          <small>O WhatsApp abre com suas escolhas na mensagem. Você pode revisá-la antes de enviar.</small>
        </aside>
      </div>
    </section>
  );
}
