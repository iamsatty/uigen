import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("shows 'Creating' label for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/Card.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Editing /Card.jsx")).toBeDefined();
});

test("shows 'Editing' label for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("shows 'Viewing' label for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Viewing /App.jsx")).toBeDefined();
});

test("shows 'Undoing edit' label for str_replace_editor undo_edit command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(screen.getByText("Undoing edit in /App.jsx")).toBeDefined();
});

test("shows 'Renaming' label for file_manager rename command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("shows 'Deleting' label for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Deleting /old.jsx")).toBeDefined();
});

test("falls back to raw tool name for unknown tools", () => {
  render(
    <ToolCallBadge
      toolName="unknown_tool"
      args={{}}
      state="result"
      result="done"
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("shows spinner when state is not result", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("shows green dot when state is result with a result value", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result="Success"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});
