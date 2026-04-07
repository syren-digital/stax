import { NewProjectForm } from "@/components/dashboard/NewProjectForm";

export default function NewProjectPage() {
  return (
    <div className="px-6 pb-12">
      <div className="mx-auto max-w-xl">
        <div className="pt-2 pb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>New Stax</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            A Stax groups related widgets together.
          </p>
        </div>
        <div className="glass p-8">
          <NewProjectForm />
        </div>
      </div>
    </div>
  );
}
