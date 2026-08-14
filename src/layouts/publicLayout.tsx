import { Outlet } from "react-router-dom";

const PublicLayout = () =>{
    return (
        <>
        <header>
            <h1>Salon</h1>
        </header>
        <main>
            <Outlet />
        </main>
        <footer>
            <p>&copy; 2023 Salon. All rights reserved.</p>
        </footer>
        </>
    );
};

export default PublicLayout;