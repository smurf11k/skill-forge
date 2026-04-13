import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import MarkdownContent from "./MarkdownContent";
import "@uiw/react-md-editor/markdown-editor.css";

function MarkdownPreview({ value }) {
  return (
    <div className="min-h-[400px] rounded-lg border border-border bg-background p-6 shadow-sm">
      {value?.trim() ? (
        <MarkdownContent content={value} />
      ) : (
        <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
      )}
    </div>
  );
}

export default function LessonMarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState("write");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={tab === "write" ? "default" : "outline"}
          onClick={() => setTab("write")}
        >
          Write
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "preview" ? "default" : "outline"}
          onClick={() => setTab("preview")}
        >
          Preview
        </Button>
      </div>

      {tab === "write" ? (
        <div data-color-mode="dark">
          <MDEditor
            value={value}
            onChange={(next) => onChange(next ?? "")}
            preview="edit"
            hideToolbar
            visibleDragbar={false}
            height={400}
            className="!bg-background !text-foreground"
            textareaProps={{
              placeholder: "Write the lesson in markdown...",
            }}
          />
        </div>
      ) : (
        <MarkdownPreview value={value} />
      )}
    </div>
  );
}
