import AvatarMenu from "./auth/AvatarMenu";
import Credits from "./Credits";

export default function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-screen w-screen">
      {children}
      <Credits className="absolute bottom-0 left-0 pb-4 pl-6" />
      <AvatarMenu className="absolute top-0 right-0 mt-4 mr-4 rounded-full hover:scale-105" />
    </div>
  );
}
