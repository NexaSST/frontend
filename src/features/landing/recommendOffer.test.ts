import { describe, expect, it } from 'vitest';
import { guideWhatsAppUrl, recommendOffer } from './recommendOffer.js';

describe('indicação de oferta da landing', () => {
  it('propõe módulo avulso quando só uma frente foi escolhida', () => {
    expect(recommendOffer(['training'], { people: 150 })?.kind).toBe('avulso');
  });

  it('usa a maior necessidade conhecida para indicar o combo', () => {
    expect(recommendOffer(['training', 'inspections'], { people: 50, inspectors: 5, assets: 100 })?.title).toBe('Combo Growth como ponto de partida');
    expect(recommendOffer(['training', 'inspections'], { people: 50, inspectors: 5, assets: 100 })?.reason).toContain('3 a 5 inspetores');
    expect(recommendOffer(['training', 'apr'], { people: 500, permits: 500 })?.title).toBe('Combo Scale como ponto de partida');
  });

  it('não força um combo quando faltam volumes ou uma franquia é excedida', () => {
    expect(recommendOffer(['training', 'apr'], { people: 50 })?.kind).toBe('conversation');
    expect(recommendOffer(['training', 'inspections'], { people: 50, inspectors: 2, assets: 1001 })?.kind).toBe('conversation');
  });

  it('encaminha espaços confinados para proposta separada', () => {
    expect(recommendOffer(['confined-spaces', 'training'], { people: 50 })?.kind).toBe('conversation');
  });

  it('leva somente as escolhas informadas para a mensagem editável do WhatsApp', () => {
    const url = new URL(guideWhatsAppUrl('deadlines', ['training'], { people: 50 }, recommendOffer(['training'], { people: 50 })));
    expect(url.hostname).toBe('wa.me');
    expect(url.searchParams.get('text')).toContain('Principal desafio: Prazos que viram urgência.');
    expect(url.searchParams.get('text')).toContain('Faixa de colaboradores: Até 50.');
    expect(url.searchParams.get('text')).not.toContain('Ativos:');
  });
});
