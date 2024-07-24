import { Navigate, Outlet } from "react-router-dom";

const RequiredAuth = () => {    
    if (!localStorage.getItem("username")) {
        return <Navigate to="/" />;
    }
    
    return <Outlet />;
}

export default RequiredAuth;