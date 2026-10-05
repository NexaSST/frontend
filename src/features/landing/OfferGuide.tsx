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
    <section className={String.raw`p-[96px_max(24px,calc((100vw-1280px)/2))] bg-[#eaf2ed] [&_>_header]:grid [&_>_header]:grid-cols-[minmax(0,1.2fr)_minmax(250px,.55fr)] [&_>_header]:items-end [&_>_header]:gap-[48px] [&_h2]:max-w-[14ch] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[52px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.04em] [&_>_header_>_p]:text-(--landing-muted) [&_>_header_>_p]:text-[16px] [&_>_header_>_p]:leading-[24px] [&_fieldset]:min-w-0 [&_fieldset]:m-0 [&_fieldset]:p-0 [&_fieldset]:border-0 [&_legend]:flex [&_legend]:items-baseline [&_legend]:gap-[14px] [&_legend]:w-full [&_legend]:mb-[16px] [&_legend]:text-(--landing-navy-strong) [&_legend]:text-[19px] [&_legend]:font-bold [&_legend]:leading-[28px] [&_legend_>_span]:text-(--landing-emerald) [&_legend_>_span]:text-[13px] [&_legend_>_span]:tabular-nums [&_.ui-select\_\_trigger:focus-visible]:[outline:3px_solid_#6ee7b7] [&_.ui-select\_\_trigger:focus-visible]:outline-offset-2 [&_.ui-select\_\_trigger]:min-h-[52px] [&_.ui-select\_\_trigger]:p-[12px_16px] [&_.ui-select\_\_trigger]:gap-[12px] [&_.ui-select\_\_trigger]:border-[#9fb8aa] [&_.ui-select\_\_trigger]:rounded-[10px] [&_.ui-select\_\_trigger]:text-(--landing-navy-strong) [&_.ui-select\_\_trigger]:text-[14px] [&_.ui-select\_\_trigger]:font-[650] [&_.ui-select\_\_trigger]:leading-[20px] [&_.ui-select\_\_trigger:hover:not(:disabled)]:border-(--landing-emerald) max-[900px]:p-[80px_16px] max-[900px]:[&_>_header]:grid-cols-[1fr] max-[900px]:[&_>_header]:gap-[32px] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]`} id="guia" aria-labelledby="guide-title">
      <header>
        <div>
          <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Encontre um ponto de partida</span>
          <h2 id="guide-title">Conte onde a rotina aperta.</h2>
        </div>
        <p>Três respostas ajudam a preparar uma demonstração com a sua operação. A indicação não substitui uma proposta comercial.</p>
      </header>

      <div className={"grid grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] gap-[48px] items-start mt-[56px] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[32px]"}>
        <div className={"grid gap-[36px]"}>
          <fieldset>
            <legend><span>01</span> Qual desafio pesa mais hoje?</legend>
            <div className={"grid grid-cols-3 gap-[8px] [&_label]:flex [&_label]:min-h-[68px] [&_label]:items-center [&_label]:gap-[10px] [&_label]:p-[12px_14px] [&_label]:border [&_label]:border-solid [&_label]:border-[#b9cec2] [&_label]:rounded-[12px] [&_label]:bg-white [&_label]:text-(--landing-navy-strong) [&_label]:text-[14px] [&_label]:font-[650] [&_label]:leading-[20px] [&_label]:cursor-pointer [&_label.is-selected]:border-(--landing-emerald) [&_label.is-selected]:bg-[#dceee5] [&_input]:flex-[0_0_auto] [&_input]:w-[17px] [&_input]:h-[17px] [&_input]:m-0 [&_input]:accent-(--landing-emerald) [&_label:focus-within]:[outline:3px_solid_#6ee7b7] [&_label:focus-within]:outline-offset-2 max-[560px]:grid-cols-[1fr] max-[560px]:[&_label]:min-h-[52px]"}>
              {pains.map((item) => (
                <label key={item} className={(pain === item ? "is-selected" : undefined)}>
                  <input type="radio" name="" value={item} checked={pain === item} onChange={() => setPain(item)} />
                  <span>{painLabels[item]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend><span>02</span> Quais frentes você quer organizar?</legend>
            <div className={"grid gap-[8px] [&_label]:flex [&_label]:min-h-[68px] [&_label]:items-center [&_label]:gap-[10px] [&_label]:p-[12px_14px] [&_label]:border [&_label]:border-solid [&_label]:border-[#b9cec2] [&_label]:rounded-[12px] [&_label]:bg-white [&_label]:text-(--landing-navy-strong) [&_label]:text-[14px] [&_label]:font-[650] [&_label]:leading-[20px] [&_label]:cursor-pointer [&_label.is-selected]:border-(--landing-emerald) [&_label.is-selected]:bg-[#dceee5] [&_input]:flex-[0_0_auto] [&_input]:w-[17px] [&_input]:h-[17px] [&_input]:m-0 [&_input]:accent-(--landing-emerald) [&_label:focus-within]:[outline:3px_solid_#6ee7b7] [&_label:focus-within]:outline-offset-2 max-[560px]:[&_label]:min-h-[52px] grid-cols-2 max-[560px]:grid-cols-[1fr]"}>
              {modules.map((module) => (
                <label key={module} className={(selectedModules.includes(module) ? "is-selected" : undefined)}>
                  <input type="checkbox" value={module} checked={selectedModules.includes(module)} onChange={() => toggleModule(module)} />
                  <span>{moduleLabels[module]}</span>
                </label>
              ))}
            </div>
            <p className={"mt-[12px]! text-(--landing-muted) text-[13px] leading-[20px]"}>Ergonomia já integra a oferta dos combos e será disponibilizada em breve.</p>
          </fieldset>

          <fieldset>
            <legend><span>03</span> Qual é a escala aproximada?</legend>
            <div className={"grid grid-cols-2 gap-[16px] [&_>_p]:col-span-full [&_>_p]:text-(--landing-muted) [&_>_p]:text-[14px] [&_>_p]:leading-[22px] max-[560px]:grid-cols-[1fr]"}>
              {volumeFields.filter((field) => selectedModules.includes(field.forModule)).map((field) => (
                <div className={"grid gap-[8px] min-w-0 text-(--landing-navy-strong) text-[14px] font-[650]"} key={field.key}>
                  <span>{field.label}</span>
                  <Select aria-label={field.label} className={""} menuClassName={String.raw`p-[6px] border-[#9fb8aa] rounded-[10px] bg-white font-['Manrope_Variable',Manrope,sans-serif] [&_.ui-select\_\_option]:min-h-[44px] [&_.ui-select\_\_option]:p-[10px_14px] [&_.ui-select\_\_option]:rounded-[6px] [&_.ui-select\_\_option]:text-[#06172f] [&_.ui-select\_\_option]:text-[14px] [&_.ui-select\_\_option]:leading-[20px] [&_.ui-select\_\_option:hover]:bg-[#eaf2ed] [&_.ui-select\_\_option:focus-visible]:bg-[#eaf2ed] [&_.ui-select\_\_option[aria-selected='true']]:text-[#076348] [&_.ui-select\_\_option[aria-selected='true']]:bg-[#dceee5]`} value={volumes[field.key] ?? ''} onChange={(event) => updateVolume(field.key, event.target.value)}>
                    <option value="">Não sei informar</option>
                    {volumeOptions[field.key].map(([label, value]) => <option value={value} key={value}>{label}</option>)}
                  </Select>
                </div>
              ))}
              {!volumeFields.some((field) => selectedModules.includes(field.forModule)) && <p>Selecione uma frente acima para ver as faixas relevantes. Se o interesse é só em espaços confinados, definimos o escopo na conversa.</p>}
            </div>
          </fieldset>
        </div>

        <aside className={String.raw`grid justify-items-start gap-[20px] sticky top-[24px] min-h-[360px] p-[40px] rounded-[16px] [background:var(--landing-navy-strong)] text-white [&_>_span]:text-[#6ee7b7] [&_>_span]:text-[12px] [&_>_span]:font-bold [&_>_span]:tracking-[.08em] [&_>_span]:uppercase [&_h3]:max-w-[16ch] [&_h3]:text-[32px] [&_h3]:leading-[1.08] [&_h3]:tracking-[-.03em] [&_p]:max-w-[42ch] [&_p]:text-[#d7e7e0] [&_p]:text-[16px] [&_p]:leading-[24px] [&_.landing-v0\_\_cta]:[align-self:end] [&_small]:text-[#d7e7e0] [&_small]:text-[12px] [&_small]:leading-[18px] max-[900px]:static max-[900px]:min-h-0 max-[560px]:p-[28px]`} aria-live="polite" aria-atomic="true">
          <span>Indicação de oferta</span>
          {result ? <>
            <h3>{result.title}</h3>
            <p>{result.reason}</p>
          </> : <>
            <h3>Comece pelo que precisa mudar.</h3>
            <p>Escolha uma frente de interesse. Mostraremos um ponto de partida para a demonstração, sem fechar seu escopo por você.</p>
          </>}
          <a className={"landing-v0__cta inline-flex min-h-[44px] items-center justify-center p-[8px_16px] text-white! border-0 rounded-[12px] [background:var(--landing-emerald)] font-[inherit] text-[16px] font-[650] no-underline cursor-pointer shadow-[0_10px_26px_rgb(8_122_88/24%)] [transition:background-color_140ms_cubic-bezier(.23,1,.32,1),transform_140ms_cubic-bezier(.23,1,.32,1),box-shadow_140ms_cubic-bezier(.23,1,.32,1)] [&:hover]:bg-[#076348] [&:hover]:shadow-[0_14px_30px_rgb(8_122_88/30%)] active:transform-[scale(.97)] focus-visible:[outline:3px_solid_#6ee7b7] focus-visible:outline-offset-[3px]"} href={guideWhatsAppUrl(pain, selectedModules, volumes, result)} target="_blank" rel="noreferrer">Agendar demonstração</a>
          <small>O WhatsApp abre com suas escolhas na mensagem. Você pode revisá-la antes de enviar.</small>
        </aside>
      </div>
    </section>
  );
}
