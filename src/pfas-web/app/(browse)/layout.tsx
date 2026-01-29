import styles from './browse.module.css';

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.browseLayout}>
      {children}
    </div>
  );
}
