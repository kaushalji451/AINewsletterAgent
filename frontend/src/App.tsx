import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { Home } from "@/pages/Home";
import { RunPage } from "@/pages/RunPage";
import { RunDetailPage } from "@/pages/RunDetailPage";

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/run" element={<RunPage />} />
        <Route path="/run/:runId" element={<RunDetailPage />} />
      </Route>
    </Routes>
  );
}
