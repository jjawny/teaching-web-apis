export function LoadingPage({ progress }: { progress: number }) {
  return (
    <div className="grid h-screen w-screen place-content-center">
      <h1 className="font-instrument-serif relative max-w-[500px] text-center text-6xl font-extrabold text-stone-400 opacity-10 select-none">
        The Most Bulletproof HTTP Request
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !opacity-100">
          {/* TODO: progress goes here using progress prop*/}
        </div>
      </h1>
    </div>
  );
}
