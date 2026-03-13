import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { MyLibrary } from "./pages/MyLibrary";
import { MoodInput } from "./pages/MoodInput";
import { Challenges } from "./pages/Challenges";
import { Profile } from "./pages/Profile";
import { Auth } from "./pages/Auth";
import { Onboarding } from "./pages/Onboarding";
import { NotFound } from "./pages/NotFound";
import { AIProcessing } from "./pages/AIProcessing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "explore",
        Component: Explore,
      },
      {
        path: "library",
        Component: MyLibrary,
      },
      {
        path: "mood-input",
        Component: MoodInput,
      },
      {
        path: "processing",
        Component: AIProcessing,
      },
      {
        path: "challenges",
        Component: Challenges,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "auth",
        Component: Auth,
      },
      {
        path: "tutorial",
        Component: Onboarding,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
