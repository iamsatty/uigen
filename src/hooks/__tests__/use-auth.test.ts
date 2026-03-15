import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../use-auth";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useRouter } from "next/navigation";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

describe("useAuth", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  describe("signIn", () => {
    test("redirects to new project created from anon work when anon messages exist", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue({
        messages: [{ role: "user", content: "make a button" }],
        fileSystemData: { "/App.jsx": { type: "file", content: "<App />" } },
      });
      (createProject as any).mockResolvedValue({ id: "proj-anon-123" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: "user", content: "make a button" }],
          data: { "/App.jsx": { type: "file", content: "<App />" } },
        })
      );
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/proj-anon-123");
    });

    test("redirects to most recent existing project when no anon work exists", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([
        { id: "proj-recent" },
        { id: "proj-older" },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/proj-recent");
    });

    test("creates a new project and redirects when no anon work and no existing projects", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([]);
      (createProject as any).mockResolvedValue({ id: "proj-new-456" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({ messages: [], data: {} })
      );
      expect(mockPush).toHaveBeenCalledWith("/proj-new-456");
    });

    test("returns result from signInAction", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "proj-1" }]);

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signIn("user@example.com", "pass");
      });

      expect(returnValue).toEqual({ success: true });
    });

    test("sets isLoading to true during sign in and false after", async () => {
      let resolveSignIn!: (v: any) => void;
      (signInAction as any).mockReturnValue(
        new Promise((res) => { resolveSignIn = res; })
      );

      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("user@example.com", "pass");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignIn({ success: false });
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    test("redirects to new project created from anon work when anon messages exist", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue({
        messages: [{ role: "user", content: "make a card" }],
        fileSystemData: { "/App.jsx": { type: "file", content: "<Card />" } },
      });
      (createProject as any).mockResolvedValue({ id: "proj-signup-anon" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@example.com", "securepass");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: "user", content: "make a card" }],
        })
      );
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/proj-signup-anon");
    });

    test("redirects to most recent existing project when no anon work exists", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "proj-existing" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@example.com", "securepass");
      });

      expect(mockPush).toHaveBeenCalledWith("/proj-existing");
    });

    test("creates a new project and redirects when no anon work and no existing projects", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([]);
      (createProject as any).mockResolvedValue({ id: "proj-brand-new" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@example.com", "securepass");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({ messages: [], data: {} })
      );
      expect(mockPush).toHaveBeenCalledWith("/proj-brand-new");
    });

    test("returns result from signUpAction", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([{ id: "proj-1" }]);

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signUp("newuser@example.com", "pass");
      });

      expect(returnValue).toEqual({ success: true });
    });
  });
});
