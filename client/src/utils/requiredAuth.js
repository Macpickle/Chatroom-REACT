import { Navigate, Outlet } from "react-router-dom";

const RequiredAuth = ({callbackURL}) => {    
    var user = localStorage.getItem('username')

    //small issue req.user always exists.
    //axios.get('http://localhost:3000/api/login', {withCredentials: true}).then((res) => {
    //    console.log(res.data);
    //}).catch((err) => {
    //    console.log(err);
    //})

    if (callbackURL == "/login") {
        return user ? <Outlet/> : <Navigate to = '/login'/>
    } 
    
    return !user ? <Outlet/> : <Navigate to = '/'/>
}

export default RequiredAuth;