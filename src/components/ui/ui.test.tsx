import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge, Button, Checkbox, Combobox, DropdownItem, DropdownMenu, Input, Select, Textarea, labelForStatus } from "./index.js";

describe("UI primitives", () => {
  afterEach(cleanup);
  it("applies button variants, sizes and loading state", () => {
    render(<Button variant="danger" size="sm" loading>Excluir</Button>);
    const button = screen.getByRole("button", { name: "Excluir" });
    expect(button).toHaveClass("ui-button--danger", "ui-button--sm");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("forwards semantic control state and uses the styled select", () => {
    render(<><Input aria-label="Nome" invalid /><Select aria-label="Função"><option>Gestor</option></Select><Textarea aria-label="Notas" /><Checkbox aria-label="Ativo" /></>);
    expect(screen.getByLabelText("Nome")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("combobox", { name: "Função" })).toHaveClass("ui-select__trigger");
    expect(screen.getByLabelText("Notas")).toHaveClass("ui-textarea");
    expect(screen.getByLabelText("Ativo")).toHaveAttribute("type", "checkbox");
  });

  it("updates the native select through the styled dropdown", () => {
    const onChange = vi.fn();
    render(<Select aria-label="Perfil de acesso" defaultValue="viewer" onChange={onChange}><option value="viewer">Consulta</option><option value="manager">Gestor</option></Select>);
    fireEvent.click(screen.getByRole("combobox", { name: "Perfil de acesso" }));
    fireEvent.click(screen.getByRole("option", { name: "Gestor" }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("combobox", { name: "Perfil de acesso" })).toHaveTextContent("Gestor");
  });

  it("keeps select options inside a dialog top layer", () => {
    render(<dialog open><Select aria-label="Curso"><option value="course">Curso obrigatório</option></Select></dialog>);
    fireEvent.click(screen.getByRole("combobox", { name: "Curso" }));
    expect(screen.getByRole("listbox", { name: "Curso" }).closest("dialog")).toBe(screen.getByRole("dialog"));
  });

  it("filters combobox options while typing and selects with keyboard", () => {
    const onSelect = vi.fn();
    function Example() {
      const [value, setValue] = useState("");
      return <dialog open><Combobox label="Template" value={value} onChange={setValue} onSelect={onSelect}
        options={[{ value: "first", label: "NR-10 · Produção Industrial" }, { value: "second", label: "NR-35 · Trabalho em Altura" }]} /></dialog>;
    }
    render(<Example />);
    const input = screen.getByRole("combobox", { name: "Template" });
    fireEvent.focus(input);
    expect(screen.getByRole("listbox", { name: "Template" }).closest("dialog")).toBe(screen.getByRole("dialog"));
    fireEvent.change(input, { target: { value: "producao" } });
    expect(screen.getByRole("option", { name: /Produção Industrial/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Trabalho em Altura/ })).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("first");
    expect(input).toHaveValue("NR-10 · Produção Industrial");
  });

  it("restores the selected combobox option when search is cancelled", () => {
    function Example() {
      const [value, setValue] = useState("first");
      return <Combobox label="Template" value={value} onChange={setValue}
        options={[{ value: "first", label: "NR-10 · Produção Industrial" }, { value: "second", label: "NR-35 · Trabalho em Altura" }]} />;
    }
    render(<Example />);
    const input = screen.getByRole("combobox", { name: "Template" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "altura" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("NR-10 · Produção Industrial");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders badge tones and actionable dropdown items in a portal", () => {
    const onClick = vi.fn();
    render(<><Badge tone="success">Ativo</Badge><DropdownMenu label="Ações"><DropdownItem onClick={onClick}>Editar</DropdownItem></DropdownMenu></>);
    expect(screen.getByText("Ativo")).toHaveClass("ui-badge--success");
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    const item = screen.getByRole("menuitem", { name: "Editar" });
    expect(item.closest("body")).toBe(document.body);
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menuitem", { name: "Editar" })).not.toBeInTheDocument();
    expect(labelForStatus("active")).toBe("Ativo");
    expect(labelForStatus("inactive")).toBe("Inativo");
  });
});
