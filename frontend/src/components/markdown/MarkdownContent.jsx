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
                  className={`${rawClass} [&>svg]:size-4 [&>svg]:inline [&>svg]:mr-2`}
                  {...props}
                >
                  {children}
                </p>
              );
            }
            return <p className="mb-4 text-muted-foreground">{children}</p>;
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

            let wrapperClass = "";
            if (isTip)
              wrapperClass =
                "my-5 rounded border border-green-500/35 bg-green-500/12 px-4 py-3 text-green-900 dark:bg-green-500/10 dark:text-green-100 [&_p]:text-current [&_li]:text-current [&_.markdown-alert-title_svg]:text-green-600 [&_.markdown-alert-title_svg]:fill-green-600 dark:[&_.markdown-alert-title_svg]:text-green-400 dark:[&_.markdown-alert-title_svg]:fill-green-400";
            if (isNote)
              wrapperClass =
                "my-5 rounded border border-sky-500/35 bg-sky-500/12 px-4 py-3 text-sky-900 dark:bg-sky-500/10 dark:text-sky-100 [&_p]:text-current [&_li]:text-current [&_.markdown-alert-title_svg]:text-sky-600 [&_.markdown-alert-title_svg]:fill-sky-600 dark:[&_.markdown-alert-title_svg]:text-sky-400 dark:[&_.markdown-alert-title_svg]:fill-sky-400";
            if (isWarning)
              wrapperClass =
                "my-5 rounded border border-orange-500/35 bg-orange-500/12 px-4 py-3 text-orange-950 dark:bg-orange-500/10 dark:text-orange-100 [&_p]:text-current [&_li]:text-current [&_.markdown-alert-title_svg]:text-orange-600 [&_.markdown-alert-title_svg]:fill-orange-600 dark:[&_.markdown-alert-title_svg]:text-orange-400 dark:[&_.markdown-alert-title_svg]:fill-orange-400";
            if (isCaution)
              wrapperClass =
                "my-5 rounded border border-red-500/35 bg-red-500/12 px-4 py-3 text-red-900 dark:bg-red-500/10 dark:text-red-100 [&_p]:text-current [&_li]:text-current [&_.markdown-alert-title_svg]:text-red-600 [&_.markdown-alert-title_svg]:fill-red-600 dark:[&_.markdown-alert-title_svg]:text-red-400 dark:[&_.markdown-alert-title_svg]:fill-red-400";

            return (
              <div className={wrapperClass} {...props}>
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
              <pre className="mb-4 overflow-x-auto border border-border bg-muted/80 px-4 py-3 text-sm leading-6">
                <code className="font-mono text-foreground" {...props}>
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
