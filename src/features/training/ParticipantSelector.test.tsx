import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ParticipantSelector } from "./ParticipantSelector.js";

describe("ParticipantSelector", () => {
  it("filtra colaboradores e mantém a seleção ao mudar a busca", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const people = [
      { id: "1", fullName: "João Silva", publicPath: "", externalCode: "MAT-042", jobName: "Técnico", departmentName: "Operações" },
      { id: "2", fullName: "Maria Souza", publicPath: "", externalCode: "MAT-105", jobName: "Enfermeira", departmentName: "Saúde" },
    ];
    const { rerender } = render(<ParticipantSelector people={people} loading={false} error={false}
      selectedIds={[]} onSelectionChange={onSelectionChange} onRetry={vi.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "Buscar colaboradores" }), "joao");
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.queryByText("Maria Souza")).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /João Silva/ }));
    expect(onSelectionChange).toHaveBeenCalledWith(["1"]);

    rerender(<ParticipantSelector people={people} loading={false} error={false}
      selectedIds={["1"]} onSelectionChange={onSelectionChange} onRetry={vi.fn()} />);
    await user.clear(screen.getByRole("textbox", { name: "Buscar colaboradores" }));
    expect(screen.getByRole("checkbox", { name: /João Silva/ })).toBeChecked();
    expect(screen.getByText("Maria Souza")).toBeInTheDocument();
  });
});
