import Header from "./components/Header";
import ChatArea from "./components/ChatArea";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header />
      <ChatArea />
    </div>
  );
}
