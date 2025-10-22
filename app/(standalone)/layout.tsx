export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the SidebarProvider from the root layout
  // allowing standalone pages to render without the sidebar structure
  return <>{children}</>;
}
