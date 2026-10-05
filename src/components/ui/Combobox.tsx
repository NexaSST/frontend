import { Check, ChevronDown, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useFloatingLayer } from './FloatingLayer.js';
import { cx } from './utils.js';

export interface ComboboxOption { value: string; label: string; searchText?: string; disabled?: boolean }

interface Props {
  label: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

const searchable = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export function Combobox({ label, value, options, onChange, onSelect, placeholder = 'Buscar opção', disabled, invalid, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousValue = useRef(value);
  const listboxId = useId();
  const optionId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const [inputValue, setInputValue] = useState(selected?.label ?? '');
  const matches = useMemo(() => {
    const terms = searchable(query).split(/\s+/).filter(Boolean);
    return options.filter((option) => !option.disabled && terms.every((term) => searchable(`${option.label} ${option.searchText ?? ''}`).includes(term)));
  }, [options, query]);

  useEffect(() => { if (!open) setInputValue(selected?.label ?? ''); }, [open, selected?.label]);
  const closeWithoutSelection = useCallback(() => {
    setOpen(false);
    setQuery('');
    const original = previousValue.current;
    if (value !== original) onChange(original);
    setInputValue(options.find((option) => option.value === original)?.label ?? '');
  }, [onChange, options, value]);
  const style = useFloatingLayer({ anchorRef: inputRef, layerRef: menuRef, open, minWidth: 220, onClose: closeWithoutSelection });

  const openMenu = () => {
    if (disabled || open) return;
    previousValue.current = value;
    setInputValue('');
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  };
  const selectOption = (option: ComboboxOption) => {
    onChange(option.value);
    onSelect?.(option.value);
    setInputValue(option.label);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };
  const active = matches[Math.min(activeIndex, matches.length - 1)];

  return <span className={cx('block w-full min-w-0', className)}>
    <span className={"flex min-h-11 items-center gap-2.5 rounded-control border border-control-border bg-surface px-3 text-muted hover:border-[#9eaaa3] focus-within:border-accent focus-within:ring-3 focus-within:ring-control-focus has-[[aria-invalid=true]]:border-danger"}>
      <Search size={18} className={"shrink-0"} aria-hidden="true" />
      <input ref={inputRef} type="text" className={"!min-h-0 !w-full !min-w-0 !flex-1 !rounded-none !border-0 !bg-transparent !p-0 !text-ink !shadow-none !outline-none placeholder:!text-[#68766f] focus:!outline-none focus-visible:!outline-none focus-visible:!outline-offset-0"} role="combobox" aria-label={label}
        aria-autocomplete="list" aria-expanded={open} aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && active ? `${optionId}-${active.value}` : undefined}
        aria-invalid={invalid || undefined} autoComplete="off" placeholder={placeholder} disabled={disabled}
        value={inputValue} onFocus={openMenu} onClick={openMenu}
        onChange={(event) => {
          setInputValue(event.target.value);
          setQuery(event.target.value);
          setActiveIndex(0);
          if (value) onChange('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); closeWithoutSelection(); return; }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) { openMenu(); return; }
            setActiveIndex((index) => Math.max(0, Math.min(matches.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
          }
          if (event.key === 'Home' && open) { event.preventDefault(); setActiveIndex(0); }
          if (event.key === 'End' && open) { event.preventDefault(); setActiveIndex(Math.max(0, matches.length - 1)); }
          if (event.key === 'Enter' && open) { event.preventDefault(); if (active) selectOption(active); }
          if (event.key === 'Tab' && open) closeWithoutSelection();
        }} />
      <ChevronDown size={17} className={"shrink-0"} aria-hidden="true" />
    </span>
    {open && typeof document !== 'undefined' && createPortal(<div ref={menuRef} id={listboxId}
      className={"z-[1000] overflow-y-auto rounded-control border border-line bg-surface p-1 shadow-[var(--shadow-panel)]"} role="listbox" aria-label={label} style={{ ...style, width: style.minWidth }}>
      <div className={"px-2.5 py-1.5 text-xs font-bold text-muted"} role="status">{matches.length} {matches.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}</div>
      {matches.length ? matches.map((option, index) => <button key={option.value} id={`${optionId}-${option.value}`}
        type="button" role="option" aria-selected={option.value === value} data-active={index === activeIndex}
        className={cx("flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border-0 bg-transparent px-2.5 py-2 text-left text-sm text-ink hover:bg-[#e9efeb] focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-control-focus",
          index === activeIndex && 'bg-[#e9efeb]', option.value === value && "bg-[#e3eee8] font-bold text-accent-strong")} onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => setActiveIndex(index)} onClick={() => selectOption(option)}>
        <span className={"min-w-0 wrap-anywhere"}>{option.label}</span>{option.value === value && <Check size={16} aria-hidden="true" />}
      </button>) : <p className={"m-0 px-2.5 py-3 text-sm text-muted"}>Nenhum modelo encontrado. Tente outro termo ou NR.</p>}
    </div>, inputRef.current?.closest('dialog') ?? document.body)}
  </span>;
}
