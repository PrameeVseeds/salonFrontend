import { RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes/appRoutes";

function App() {
    return <RouterProvider router={appRoutes} />;
}

export default App;
