import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";

export default function MarkdownContent({ content }) {
  return (
    <div className="markdown-body text-sm leading-7 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGithubBlockquoteAlert]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-10 mb-5 text-4xl font-bold tracking-tight text-foreground first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mt-9 mb-4 text-3xl font-semibold tracking-tight text-foreground">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mt-7 mb-3 text-2xl font-semibold text-foreground">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mt-6 mb-2 text-xl font-semibold text-foreground">
              {children}
            </h4>
          ),

          p: ({ className: rawClass, children, ...props }) => {
            if ((rawClass || "").includes("markdown-alert-title")) {
              return (
                <p
                  className={`${rawClass} markdown-alert-title-row [&>svg]:size-4 [&>svg]:inline [&>svg]:mr-2 [&>svg]:fill-current`}
                  {...props}
                >
                  {children}
                </p>
              );
            }
            // Inside a callout the wrapping div already constrains context;
            // use inherit so the callout's own color rule wins for body text.
            return (
              <p className="mb-4 text-[inherit] last:mb-0 [.markdown-callout_&]:text-foreground [.markdown-body_&:not(.markdown-callout_*)]:text-muted-foreground">
                {children}
              </p>
            );
          },

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              {children}
            </a>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6 marker:text-muted-foreground">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6 marker:text-muted-foreground">
              {children}
            </ol>
          ),

          li: ({ children }) => <li className="pl-1">{children}</li>,

          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-4 border-primary/40 bg-muted/30 py-3 pl-4 text-foreground">
              {children}
            </blockquote>
          ),

          div: ({ className: rawClass, children, ...props }) => {
            const classes = (rawClass || "").split(" ");

            const isTip = classes.includes("markdown-alert-tip");
            const isNote = classes.includes("markdown-alert-note");
            const isWarning = classes.includes("markdown-alert-warning");
            const isCaution = classes.includes("markdown-alert-caution");

            const isAlert = isTip || isNote || isWarning || isCaution;

            if (!isAlert)
              return (
                <div className={rawClass} {...props}>
                  {children}
                </div>
              );

            let calloutClass = "markdown-callout ";
            if (isTip) calloutClass += "markdown-callout-tip";
            if (isNote) calloutClass += "markdown-callout-note";
            if (isWarning) calloutClass += "markdown-callout-warning";
            if (isCaution) calloutClass += "markdown-callout-caution";

            return (
              <div className={calloutClass} {...props}>
                {children}
              </div>
            );
          },

          hr: () => <hr className="my-8 border-border/60" />,

          code({ className, children, ...props }) {
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className="border border-border bg-muted/80 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="markdown-code-block">
                <code className="markdown-code-block__code" {...props}>
                  {children}
                </code>
              </pre>
            );
          },

          table: ({ children }) => (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse border border-border text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),

          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border border-border px-3 py-2 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
