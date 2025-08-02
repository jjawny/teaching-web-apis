export type Tick = {
  id: number;
  timestamp: number;
  type: "basic" | "click" | "ws";
};
