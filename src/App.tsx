import { Toaster } from "sonner";
import { Grid } from "../src/features/grid/components/Grid";

export function App() {
  return (
    <>
      <Grid />
      <Toaster richColors position="top-right" />
      <Toaster position="bottom-right" />
    </>
  );
}