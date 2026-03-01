import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MentorPanel } from "@/components/features/mentor/mentor-panel";
import { SoundPlayer } from "@/components/features/ambience/sound-player";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <MentorPanel />
      <SoundPlayer />
    </div>
  );
}
