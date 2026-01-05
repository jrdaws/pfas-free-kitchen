import Image from "next/image";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * EmptyState component for displaying when there's no data to show.
 * Uses the empty-state-data illustration from the media pipeline.
 */
export function EmptyState({
  title = "No data yet",
  description = "Get started by adding your first item.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Image
        src="/images/empty-state-data.webp"
        alt="No data illustration"
        width={400}
        height={300}
        className="mb-6 opacity-80"
        priority={false}
      />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;

